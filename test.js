const puppeteer = require('puppeteer');
puppeteer.launch({headless:false}).then(async(browser)=>{
    const page = await browser.newPage();
    await page.goto('https://skinport.com/market?sort=date&order=desc',{
        waitUntil:['load','networkidle0']
    });
    console.log('product page loaded');
    // let data = await page.evaluate(()=>{
    //     let obj = {};
    //     obj.productName = document.querySelector('h1.page-title').innerText;
    //     obj.price = document.querySelector('span.price').innerText;
    //     return obj
    // });
    // console.log(`scraped product data : `,data);
    // await browser.close();
    // process.exit();
});
