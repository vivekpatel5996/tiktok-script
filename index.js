const express = require('express');
const bodyParser = require('body-parser');
const app = express();
const apiRoutes = require('./routes/api');
const port = process.env.PORT || 3003;
const path = require("path");
const download = require('./helpers/download');
const upload = require('./helpers/upload');

app.use(bodyParser.json());
app.use(express.urlencoded({ extended: true })); 
app.use('/api/',apiRoutes);

global.sessions = [];
upload.start();
app.get('/', (req, res) => {
  res.send('<center>Welcome to tiktok posting automation script <br> This script has no user interface yet !</center>');
})


app.listen(port, () => {
  console.log(`Automation script listening on port ${port}`);
})