# bankscript
An automation script to allow auto access to different bank accounts and auto initiate transfers between accounts

# Environment requirements
- Linux or Windows operating system
- Node js version +16
- Microsoft edge browser

# Deployment 
- cd into project folder and run command 
<code>npm i</code> to install project dependencies
- Whatever was your operating system windows or linux make sure to update your environment variable called "puppeteerExecutablePath" which is located in .env file with correct edge browser path
- Run command <code>npm run start</code> to fire up your server

# Usage
- Open your preferred browser and go to <code>localhost:3001</code>
- Enjoy playing with project APIs

# API
- Each bank account has an api to call whenever you want to process payment <br>
<code>localhost:3001/api/{bankName}</code> - request type is <b>POST</b> as script expects recieving some data in request body in <b>JSON</b> format
- Each bank API expected data in request body may differ for each bank 

# Supported banks and APIs
* hongleongBank <br>
API URL <code>localhost:3001/api/hongleongBank</code> <br>
Expected data <code>
{
  "bankName":"CIMB BANK BERHAD",
  "accountType":"Current/Savings",
  "accountNumber":"7071279998",
  "amount":1,
  "username":"benjaminwong94",
  "password":"aDkkskw123@"
}
</code>
