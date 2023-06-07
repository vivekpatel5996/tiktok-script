const general = require('./general');
const remote = require('./remote');
const { delayedPromiseRetry } = require('delayed-promise-retry');
const axios = require('axios');
const imageToBase64 = require('image-to-base64');
const fs = require("fs");


const { getRedirectUrl,getVideoNoWM,downloadMediaFromList } = require('./downloader');

require('dotenv').config();
const elapsed = require("elapsed-time-logger");

const colors = require('colors');
const UserAgent = require('user-agents');

const Helpers = {
	/*
		Main script function , call this one to run script
	*/
	start:function(body){
		return new Promise(async(resolve)=>{
			// try{
				elapsed.start('start session'.red);
				
				  const browser = await general.initializeBrowser();
				  // const browser = await general.initializeBrowser(proxyObject);

				  //initiate page
				  const page = await browser.newPage();
				  // Set the user agent to a randomly generated desktop browser
				  const userAgent = new UserAgent({ deviceCategory: 'desktop' });
				  await page.setUserAgent(userAgent.toString());
				  let sessionObject = { browser: browser, page: page };
				  sessionObject = Object.assign(sessionObject, body);
	  			sessionObject.page = page;

	  			global.sessions.push(sessionObject);
	  			// console.log('------',global.sessions.length);
				  try {
					// Navigate to the TikTok login page
					await page.goto('https://www.tiktok.com/foryou?lang=en', {
					  timeout: 120000,
					  waitUntil: ['load', 'domcontentloaded']
					});
					// await page.waitForNavigation({timeout: 120000,waitUntil: ['load', 'domcontentloaded']});
					await Helpers.waitForHeaderIcon(page).then(

						await Helpers.waitForSelectorWithInterval(page)
						);

					// resolve({ success: true });
				  } catch (err) {
					console.log(err);
					resolve({ success: false });
				  }
			  
			  	elapsed.end('start session'.red);
		});
	},
	waitForHeaderIcon:function(page){
		return new Promise(async(resolve)=>{
			console.log('waitForHeaderIcon');

			page.$eval('input[name="q"]', (element, value) => element.value = value, 'photographytips');
			page.$eval('form.search-input.tiktok-dhqzc6-FormElement.ev30f210', form => form.submit());
		})
	},
	upload:function(page){
		return new Promise(async(resolve)=>{
			console.log('upload');
			const elementHandle = await page.$("input[type=file]");
			await elementHandle.uploadFile('./downloads/7134526187623271722.mp4');
			const inputElement = document.querySelector('input.jsx-2745951964.search-friends');
			inputElement.value = 'example text';
		})
	},

	waitForSelectorWithInterval:function(page, selector, interval){
		return new Promise(async(resolve)=>{
			console.log('waitForItems');
			function waitForSelectorWithInterval(page, selector, interval) {
				return new Promise(resolve => {
				  const intervalId = setInterval(async () => {
					const element = await page.waitForSelector(selector, { timeout: 0 }).catch(() => {});
					if (element) {
					  clearInterval(intervalId);
					  resolve(true);
					}
				  }, interval);
				});
			  }
			
			const isSelectorFound = await waitForSelectorWithInterval(page, '.tiktok-1soki6-DivItemContainerForSearch.e19c29qe9', 2000);
			if (isSelectorFound) {
				const buttonSelector = '.tiktok-154bc22-ButtonMore.e17vxm6m1';
				let lastHeight = await page.evaluate('document.body.scrollHeight');
			  
				while (true) {
				  const button = await page.$(buttonSelector);
				  if (button) {
					await button.click();
					console.log(`Clicked button with selector: ${buttonSelector}`);
				  } else {
					console.log(`Button with selector ${buttonSelector} not found`);
					break;
				  }
				  await page.evaluate('window.scrollTo(0, document.body.scrollHeight)');
				  await page.waitForTimeout(2000); // sleep a bit
				  let newHeight = await page.evaluate('document.body.scrollHeight');
				  if (newHeight === lastHeight) {
					console.log(`Reached end of page`);
					break;
				  }
				  lastHeight = newHeight;
				}
				await Helpers.processVideos(page);
			}


		})
	},
	processVideos:function(page){
		return new Promise(async(resolve)=>{
			// try{
				console.log('processVideos');
				function convertCountToNumber(count) {
					let factor = 1;
					if (count.endsWith('M')) {
					  count = count.slice(0, -1);
					  factor = 1000000;
					  return parseFloat(count) * factor;

					} else if (count.endsWith('K')) {
					  count = count.slice(0, -1);
					  factor = 1000;
					  return parseFloat(count) * factor;
					}
					else
					{
						// factor = 100;
						return parseFloat(count);

					}
				  }

const divElements = await page.$$('.tiktok-1soki6-DivItemContainerForSearch.e19c29qe9');
try {
	for (let i = 0; i < divElements.length; i++) {
		const divElement = divElements[i];
		const anchorElement = await divElement.$('a[href]');
		if (anchorElement) {
		  const link = await anchorElement.evaluate(element => element.getAttribute('href'));
		  await Helpers.downloadVideo(link);
		}
		
		if ((i + 1) % 60 === 0) {
		  console.log('Pausing for 1 minute...');
		  await page.waitForTimeout(120 * 1000);
		}
	  }	
} catch (error) {
	console.log(error);
}
// Loop through each div element and find the anchor element with the 'href' attribute
	  })
	},
	downloadVideo:function(urlInput){
		return new Promise(async(resolve)=>{
			// const urlInput = await getInput("Enter the URL : ");
			const url = await getRedirectUrl(urlInput);
	
const options = {
	method: 'GET',
	url: 'https://tiktok-download-video-no-watermark.p.rapidapi.com/tiktok/info',
	params: {url: urlInput},
	headers: {
	  'X-RapidAPI-Key': 'acb16722bbmsh2d97e580a1638d1p10bfc5jsn932ac8f56f4c',
	  'X-RapidAPI-Host': 'tiktok-download-video-no-watermark.p.rapidapi.com'
	}
  };
  
  axios.request(options).then(function (response) {
	//   console.log(response.data);
	   downloadMediaFromList(response.data).then(() => {
		//   console.log(chalk.green("[+] Downloaded successfully"));
	  })
	  .catch(err => {
		//   console.log(chalk.red("[X] Error: " + err));
  });

  }).catch(function (error) {
	  console.error(error);
  });
  resolve();
		})
	},

	  


};

module.exports = Helpers;
