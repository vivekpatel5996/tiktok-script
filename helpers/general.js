const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
const { executablePath } = require('puppeteer');
const pluginProxy = require('puppeteer-extra-plugin-proxy');
const UserAgentPlugin = require('puppeteer-extra-plugin-anonymize-ua');

const axios = require('axios');
const LZString = require('lz-string');
puppeteer.use(StealthPlugin());
puppeteer.use(UserAgentPlugin({ makeWindows: true }));
const elapsed = require("elapsed-time-logger");
const colors = require('colors');
const AWS = require('aws-sdk');
require("dotenv").config({ path: require("path").resolve(__dirname, '..', '.env') });

const General = {
	waitForResponse: function (page, url) {
		return new Promise(resolve => {
			page.on("response", function callback(response) {
				if (response.url().includes(url)) {
					// console.log('got response',response.url());
					resolve(response);
					page.removeListener("response", callback)
				}
			})
		})
	},
	initializeBrowser(proxy) {
		return new Promise(async (resolve) => {
			//initiate puppeteer with proxy 
			const StayFocusd = `C:\\Users\\VIVEK\\AppData\\Local\\Google\\Chrome\\User Data\\Default\\Extensions\\majdfhpaihoncoakbjgbdhglocklcgno\\2.6.0_0`;
			elapsed.start('open session browser'.red);
			//initiate browser
			const browser = await puppeteer.launch({
				// executablePath:"/usr/bin/microsoft-edge",
				// executablePath:"C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe",
				executablePath: executablePath(),
				env: {
					DISPLAY: ":99"
				},
				headless: false,
				ignoreHTTPSErrors: true,
				ignoreDefaultArgs: ['--disable-extensions', "--enable-automation"],
				args: ['--no-sandbox', '--disable-setuid-sandbox', '--start-maximized', '--disable-gpu',
					`--disable-extensions-except=${StayFocusd}`,
					`--load-extension=${StayFocusd}`,
					'--enable-automation'
				],
			});
			elapsed.end('open session browser'.red);
			resolve(browser);
		});
	},
	takeScreenShot(page) {
		return new Promise(async (resolve) => {
			try {
				const s3 = new AWS.S3({
					region: process.env.AWS_S3_region,
					endpoint: process.env.AWS_S3_endpoint,
					accessKeyId: process.env.AWS_S3_accessKeyId,
					secretAccessKey: process.env.AWS_S3_secretAccessKey
				});
				elapsed.start('taking screenshot'.red);
				let image = await page.screenshot();
				const uploadedImage = await s3.upload({
					Bucket: process.env.AWS_S3_Bucket,
					Key: `speedy/screenshot_${new Date().getTime()}.png`,
					Body: image,
					"content-type": "image/png",
					"ACL": "public-read"
				}).promise();
				// axios.post(url, {status:"success","base64_image":image});
				console.log('Screenshot taken');
				elapsed.end('taking screenshot'.red);
				console.log('screenshot URL', uploadedImage.Location);
				resolve(uploadedImage.Location);
			} catch (error) {
				console.log('Error while taking screenshot', error);
				resolve(null);
			}
		});
	}
};

module.exports = General;