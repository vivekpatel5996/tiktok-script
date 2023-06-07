const upload = require('../helpers/upload');




const Controller = {
    start: async function (req, res) {
        //call main script function
        console.log('req --------> ', req.body);
        // console.log('transactionId ----->',req.body.jobUniqueKey);
        let startSession = upload.start(req.body);
        // if(startSession.success){
        res.status(200).send({ status: "success", message: "Log in process is being started" });
        // }else{
        // 	res.status(500).send({success:false,message:startSession.message});
        // }
    },

    continueLogin: async function (req, res) {
        let confirmSecurityImage = upload.continueLogin(req.body);
        res.status(200).send({ status: "success", message: "Ok, password is being entered" });
    },

    uploadVideo: async function (req, res) {
        let confirmSecurityImage = upload.upload(req.body);
        res.status(200).send({ status: "success", message: "Uploaded Video" });
    }
};



module.exports = Controller;