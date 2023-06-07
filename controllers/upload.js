const general = require('./general');
const remote = require('./remote');
const { delayedPromiseRetry } = require('delayed-promise-retry');
const axios = require('axios');
const imageToBase64 = require('image-to-base64');
const fs = require("fs");


const { getRedirectUrl, getVideoNoWM, downloadMediaFromList } = require('./downloader');

require('dotenv').config();
const elapsed = require("elapsed-time-logger");

const colors = require('colors');
const UserAgent = require('user-agents');

const Helpers = {
	/*
		Main script function , call this one to run script
	*/
	start: function (body) {
		return new Promise(async (resolve) => {
			// try{
			elapsed.start('start session'.red);

			const browser = await general.initializeBrowser();
			// const browser = await general.initializeBrowser(proxyObject);

			//initiate page
			const page = await browser.newPage();
			await page.waitForTimeout(20000);
			// Set the user agent to a randomly generated desktop browser
			const userAgent = new UserAgent({ deviceCategory: 'desktop' });

			await page.setUserAgent(userAgent.toString());
			let sessionObject = { browser: browser, page: page, randomSessionId: "12345" };
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

				const loginButtonSelector = '.tiktok-lps1dn-Button-StyledLoginButton';
				await page.waitForSelector(loginButtonSelector);
				await page.click(loginButtonSelector);

				// await page.waitForNavigation({ timeout: 120000, waitUntil: ['load', 'domcontentloaded'] });
				const loginOptionsSelector = '.tiktok-t5chka-ALink';
				await page.waitForSelector(loginOptionsSelector);
				const loginOptions = await page.$$(loginOptionsSelector);
				console.log("loginoptions", loginOptions);
				const userPwdSelector = loginOptions[1];
				// await page.waitForSelector(userPwdSelector);
				await userPwdSelector.click();

				const loginWithPwdLinkSelector = '.tiktok-1mgli76-ALink-StyledLink';
				await page.waitForSelector(loginWithPwdLinkSelector);
				await page.click(loginWithPwdLinkSelector);


				// await page.waitForNavigation({ timeout: 120000, waitUntil: ['load', 'domcontentloaded'] });
				// const qrCodeSelector = '.tiktok-rp5xmg-DivCodeImage';
				// await page.waitForSelector(qrCodeSelector);
				// await page.click(qrCodeSelector);
				// await general.takeScreenShot(page);
				// await page.click('.tiktok-y3rt08-SpanUploadText.e18d3d945');
				// await page.waitForNavigation({ timeout: 120000, waitUntil: ['load', 'domcontentloaded'] });
				// await page.evaluate(() => {
				// 	document.querySelector('input.jsx-4258277349').style.display = 'block';
				// })
				// const fileInput = await page.$('input.jsx-4258277349');
				// console.log(fileInput);
				// await fileInput.uploadFile('./downloads/7073087420438301979.mp4');
				new Promise(async (resolve) => {
					// const urlInput = await getInput("Enter the URL : ");


					const options = {
						method: 'POST',
						url: 'https://webhook.site/2e2b7bc4-b464-4c62-a33b-bd90a62b8d35',
						data: {
							message: 'Send username and password at the /tiktok/login',
						}

						// params: { url: urlInput },
						// headers: {
						// 	'X-RapidAPI-Key': 'acb16722bbmsh2d97e580a1638d1p10bfc5jsn932ac8f56f4c',
						// 	'X-RapidAPI-Host': 'tiktok-download-video-no-watermark.p.rapidapi.com'
						// }
					};

					axios.request(options).then(function (response) {
						console.log("Asked for username and password")
					}).catch(function (error) {
						console.error(error);
					});
					resolve();
				})


				// resolve({ success: true });
			} catch (err) {
				console.log(err);
				resolve({ success: false });
			}

			elapsed.end('start session'.red);
		});
	},

	continueLogin: function (body) {
		return new Promise(async (resolve) => {
			elapsed.start('enter password'.red);
			console.log(body);
			const { page, browser } = global.sessions.find(x => x.randomSessionId === body.randomSessionId);
			await page.type('.tiktok-11to27l-InputContainer', body.username)
			await page.type('.tiktok-wv3bkt-InputContainer', body.password);
			const loginButtonSelector = '.tiktok-9c63gx-Button-StyledButton';
			await page.waitForSelector(loginButtonSelector);
			await page.click(loginButtonSelector);

			const uploadButton = '.tiktok-gcx66p-DivUploadContainer';
			await page.waitForSelector(uploadButton, { timeout: 120000 });

			await Helpers.upload();

		});
	},


	waitForHeaderIcon: function (page) {
		return new Promise(async (resolve) => {
			console.log('waitForHeaderIcon');

			page.$eval('input[name="q"]', (element, value) => element.value = value, 'photographytips');
			page.$eval('form.search-input.tiktok-dhqzc6-FormElement.ev30f210', form => form.submit());
		})
	},
	upload: function (page) {
		return new Promise(async (resolve) => {
			console.log('started upload');
			const { page, browser } = global.sessions.find(x => x.randomSessionId === "12345");

			//Click on upload button
			const uploadButton = '.tiktok-gcx66p-DivUploadContainer';
			await page.waitForSelector(uploadButton);
			await page.click(uploadButton);

			//Wait to be in upload page
			await page.waitForNavigation({ timeout: 120000, waitUntil: ['load', 'domcontentloaded'] });

			//Wait for hidden input type file
			await page.waitForSelector('input[type=file]', { hidden: true, timeout: 120000 });
			await page.waitForTimeout(2000);

			//Get the iframes
			const frames = page.frames();
			for (const frame of frames) {
				const frameUrl = await frame.url();
				const frameName = await frame.name();
				console.log(`Frame URL: ${frameUrl}, Frame Name: ${frameName}`);
			}
			const iframe = frames[1];


			await iframe.waitForSelector('div.file-select-button button');
			await iframe.evaluate(() => {
				let fileInput = document.querySelector('input[type="file"][style*="display: none"]');
				fileInput.setAttribute("style", "display: block; visibility: visible;");
			});

			const inputUploadHandle = await iframe.$('input[type="file"]');

			await iframe.evaluate(() => {
				let fileInput = document.querySelector('input[type="file"]');
				fileInput.setAttribute("style", "display: none");
			});

			let fileToUpload = './downloads/sample_video.mp4';
			await page.waitForTimeout(1000);
			console.log('inputUploadHandle', inputUploadHandle);
			await inputUploadHandle.uploadFile(fileToUpload);

			await page.waitForTimeout(1000);
			await page.waitForFunction(() => {
				const button = document.querySelector('div.btn-post button'); // replace with your button selector
				return !button.disabled;
			});

			const postButton = 'div.btn-post button';
			await page.waitForSelector(postButton);
			await page.click(postButton);

		})
	},

	waitForSelectorWithInterval: function (page, selector, interval) {
		return new Promise(async (resolve) => {
			console.log('waitForItems');
			function waitForSelectorWithInterval(page, selector, interval) {
				return new Promise(resolve => {
					const intervalId = setInterval(async () => {
						const element = await page.waitForSelector(selector, { timeout: 0 }).catch(() => { });
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
	processVideos: function (page) {
		return new Promise(async (resolve) => {
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
				else {
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
	downloadVideo: function (urlInput) {
		return new Promise(async (resolve) => {
			// const urlInput = await getInput("Enter the URL : ");
			const url = await getRedirectUrl(urlInput);

			const options = {
				method: 'GET',
				url: 'https://tiktok-download-video-no-watermark.p.rapidapi.com/tiktok/info',
				params: { url: urlInput },
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
