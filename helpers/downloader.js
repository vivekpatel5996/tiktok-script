/*  by Naufal Taufiq Ridwan
    Github : https://github.com/n0l3r
    Don't remove credit.
*/

const fetch = require("node-fetch");
const chalk = require("chalk");
const inquirer = require("inquirer");
const fs = require("fs");
const puppeteer = require("puppeteer");
const { exit } = require("process");
const { resolve } = require("path");
const { reject } = require("lodash");
const {Headers} = require('node-fetch');


//adding useragent to avoid ip bans
const headers = new Headers();
headers.append('User-Agent', 'TikTok 26.2.0 rv:262018 (iPhone; iOS 14.4.2; en_US) Cronet');
const headersWm = new Headers();
headersWm.append('User-Agent', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/107.0.0.0 Safari/537.36');

const getChoice = () => new Promise((resolve, reject) => {
    inquirer.prompt([
        {
            type: "list",
            name: "choice",
            message: "Choose a option",
            choices: ["Mass Download (Username)", "Mass Download (URL)", "Single Download (URL)"]
        },
        {
            type: "list",
            name: "type",
            message: "Choose a option",
            choices: ["With Watermark", "Without Watermark"]
        }
    ])
    .then(res => resolve(res))
    .catch(err => reject(err));
});

const getInput = (message) => new Promise((resolve, reject) => {
    inquirer.prompt([
        {
            type: "input",
            name: "input",
            message: message
        }
    ])
    .then(res => resolve(res))
    .catch(err => reject(err));
});

const generateUrlProfile = (username) => {
    var baseUrl = "https://www.tiktok.com/";
    if (username.includes("@")) {
        baseUrl = `${baseUrl}${username}`;
    } else {
        baseUrl = `${baseUrl}@${username}`;
    }
    return baseUrl;
};

const downloadMediaFromList = async (item) => {
    const folder = "./downloads/"
    // list.forEach((item) => {
        const fileName = `${item.data.id}.mp4`
        const downloadFile = fetch(item.data.video_link_nwm)
        const file = fs.createWriteStream(folder + fileName)
        // console.log(chalk.green(`[+] Downloading ${fileName}`))
        downloadFile.then(res => {
            res.body.pipe(file)
            file.on("finish", () => {
                file.close()
                resolve()
            });
            file.on("error", (err) => reject(err));
        });
    // });
}



const getVideoWM = async (url) => {
    const idVideo = await getIdVideo(url)
    const request = await fetch(url, {
        method: "GET",
        headers:headersWm
    });
    const res = await request.text()
    const urlMedia = res.toString().match(/\{"url":"[^"]*"/g).toString().split('"')[3].replace(/\\u002F/g, "/");
    const data = {
        url: urlMedia,
        id: idVideo
    }
    return data
}

const getVideoNoWM = async (url) => {
    const idVideo = await getIdVideo(url)
    const API_URL = `https://api19-core-useast5.us.tiktokv.com/aweme/v1/feed/?aweme_id=${idVideo}&version_code=262&app_name=musical_ly&channel=App&device_id=null&os_version=14.4.2&device_platform=iphone&device_type=iPhone9`;
    const request = await fetch(API_URL, {
        method: "GET",
        headers : headers
    });
    const body = await request.text();
                // try {
                    // console.log(body);
                    var res = JSON.parse(body);
                // } catch (err) {
                //     console.error("Error:", err);
                //     console.error("Response body:", body);
                // }
                const urlMedia = res.aweme_list[0].video.play_addr.url_list[0]
                const data = {
                    url: urlMedia,
                    id: idVideo
                }
                return data
}

const getListVideoByUsername = async (username) => {
    var baseUrl = await generateUrlProfile(username)
    const browser = await puppeteer.launch({
        headless: true,
    })
    const page = await browser.newPage()
    page.setUserAgent(
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_14_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/85.0.4182.0 Safari/537.36"
      );
    await page.goto(baseUrl)
    var listVideo = []
    console.log(chalk.green("[*] Getting list video from: " + username))
    var loop = true
    while(loop) {
        listVideo = await page.evaluate(() => {
            const listVideo = Array.from(document.querySelectorAll(".tiktok-yz6ijl-DivWrapper > a"));
            return listVideo.map(item => item.href);
        });
        console.log(chalk.green(`[*] ${listVideo.length} video found`))
        previousHeight = await page.evaluate("document.body.scrollHeight");
        await page.evaluate("window.scrollTo(0, document.body.scrollHeight)")
        await page.waitForFunction(`document.body.scrollHeight > ${previousHeight}`, {timeout: 10000})
        .catch(() => {
            console.log(chalk.red("[X] No more video found"));
            console.log(chalk.green(`[*] Total video found: ${listVideo.length}`))
            loop = false
        });
        await new Promise((resolve) => setTimeout(resolve, 1000));
    }
    await browser.close()
    return listVideo
}
const getRedirectUrl = async (url) => {
    if(url.includes("vm.tiktok.com") || url.includes("vt.tiktok.com")) {
        url = await fetch(url, {
            redirect: "follow",
            follow: 10,
        });
        url = url.url;
        console.log(chalk.green("[*] Redirecting to: " + url));
    }
    return url;
}

const getIdVideo = (url) => {
    const matching = url.includes("/video/")
    if(!matching){
        console.log(chalk.red("[X] Error: URL not found"));
        exit();
    }
    const idVideo = url.substring(url.indexOf("/video/") + 7, url.length);
    return (idVideo.length > 19) ? idVideo.substring(0, idVideo.indexOf("?")) : idVideo;
}

// (async () => {    
//     const header = "\r\n \/$$$$$$$$ \/$$$$$$ \/$$   \/$$ \/$$$$$$$$ \/$$$$$$  \/$$   \/$$       \/$$$$$$$   \/$$$$$$  \/$$      \/$$ \/$$   \/$$ \/$$        \/$$$$$$   \/$$$$$$  \/$$$$$$$  \/$$$$$$$$ \/$$$$$$$ \r\n|__  $$__\/|_  $$_\/| $$  \/$$\/|__  $$__\/\/$$__  $$| $$  \/$$\/      | $$__  $$ \/$$__  $$| $$  \/$ | $$| $$$ | $$| $$       \/$$__  $$ \/$$__  $$| $$__  $$| $$_____\/| $$__  $$\r\n   | $$     | $$  | $$ \/$$\/    | $$  | $$  \\ $$| $$ \/$$\/       | $$  \\ $$| $$  \\ $$| $$ \/$$$| $$| $$$$| $$| $$      | $$  \\ $$| $$  \\ $$| $$  \\ $$| $$      | $$  \\ $$\r\n   | $$     | $$  | $$$$$\/     | $$  | $$  | $$| $$$$$\/        | $$  | $$| $$  | $$| $$\/$$ $$ $$| $$ $$ $$| $$      | $$  | $$| $$$$$$$$| $$  | $$| $$$$$   | $$$$$$$\/\r\n   | $$     | $$  | $$  $$     | $$  | $$  | $$| $$  $$        | $$  | $$| $$  | $$| $$$$_  $$$$| $$  $$$$| $$      | $$  | $$| $$__  $$| $$  | $$| $$__\/   | $$__  $$\r\n   | $$     | $$  | $$\\  $$    | $$  | $$  | $$| $$\\  $$       | $$  | $$| $$  | $$| $$$\/ \\  $$$| $$\\  $$$| $$      | $$  | $$| $$  | $$| $$  | $$| $$      | $$  \\ $$\r\n   | $$    \/$$$$$$| $$ \\  $$   | $$  |  $$$$$$\/| $$ \\  $$      | $$$$$$$\/|  $$$$$$\/| $$\/   \\  $$| $$ \\  $$| $$$$$$$$|  $$$$$$\/| $$  | $$| $$$$$$$\/| $$$$$$$$| $$  | $$\r\n   |__\/   |______\/|__\/  \\__\/   |__\/   \\______\/ |__\/  \\__\/      |_______\/  \\______\/ |__\/     \\__\/|__\/  \\__\/|________\/ \\______\/ |__\/  |__\/|_______\/ |________\/|__\/  |__\/\r\n\n by n0l3r (https://github.com/n0l3r)\n"
//     console.log(chalk.blue(header))
//     const choice = await getChoice();
//     var listVideo = [];
//     var listMedia = [];
//     if (choice.choice === "Mass Download (Username)") {
//         const usernameInput = await getInput("Enter the username with @ (e.g. @username) : ");
//         const username = usernameInput.input;
//         listVideo = await getListVideoByUsername(username);
//         if(listVideo.length === 0) {
//             console.log(chalk.yellow("[!] Error: No video found"));
//             exit();
//         }
//     } else if (choice.choice === "Mass Download (URL)") {
//         var urls = [];
//         const count = await getInput("Enter the number of URL : "); 
//         for(var i = 0; i < count.input; i++) {
//             const urlInput = await getInput("Enter the URL : ");
//             urls.push(urlInput.input);
//         }

//         for(var i = 0; i < urls.length; i++) {
//             const url = await getRedirectUrl(urls[i]);
//             const idVideo = await getIdVideo(url);
//             listVideo.push(idVideo);
//         }
//     } else {
//         const urlInput = await getInput("Enter the URL : ");
//         const url = await getRedirectUrl(urlInput.input);
//         listVideo.push(url);
//     }

//     console.log(chalk.green(`[!] Found ${listVideo.length} video`));


//     for(var i = 0; i < listVideo.length; i++){
//         var data = (choice.type == "With Watermark") ? await getVideoWM(listVideo[i]) : await getVideoNoWM(listVideo[i]);
//         listMedia.push(data);
//     }

//     downloadMediaFromList(listMedia)
//         .then(() => {
//             console.log(chalk.green("[+] Downloaded successfully"));
//         })
//         .catch(err => {
//             console.log(chalk.red("[X] Error: " + err));
//     });
    

// })();

module.exports = { getRedirectUrl,getVideoNoWM,downloadMediaFromList }
