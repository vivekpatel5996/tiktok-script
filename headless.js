const puppeteer = require('puppeteer-extra') 
 
// Add stealth plugin and use defaults 
const pluginStealth = require('puppeteer-extra-plugin-stealth') 
const {executablePath} = require('puppeteer'); 
 
// Use stealth 
puppeteer.use(pluginStealth())

puppeteer.launch({ headless:true, executablePath: executablePath() }).then(async browser => { 
	// Create a new page 
	const page = (await browser.pages())[0];
 
	// Setting page view 
	await page.setViewport({ width: 1280, height: 720 }); 
 
	// Go to the website 
	await page.goto('https://bot.sannysoft.com/'); 
 
	// Wait for security check 
	await page.waitForTimeout(10000); 
 
	await page.screenshot({ path: 'image.png', fullPage: true }); 
 
	await browser.close(); 
});