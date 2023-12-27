const express = require('express')
const body_parser = require('body-parser')
const app = express()
const port = 2000
const sample = require("./controllers/sampleController");
const token = require("jsonwebtoken");
require("dotenv").config();
const nodemailer = require("nodemailer");
const mongoose = require("mongoose");
const schema = mongoose.Schema;

const userSchema = new schema({
    username: String,
    password: String,
    mail: String,
    phoneNo: String
})

mongoose.connect("mongodb://localhost:27017/test", { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => {
        console.log("mongoDB conncedted")
    })
    .catch((err) => {
        console.log(err)
    });

const userModel = mongoose.model("series", userSchema)
module.exports = userModel

const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: "shriramvicky84@gmail.com",
        pass: "mtcf etoz qlxb elnr"
    },
    tls: {
        rejectUnauthorized: true
    }
});

const mailOptions = {
    from: 'no-reply <shriramvicky84@gmail.com>"',
    to: 'shriramvicky84@gmail.com',
    subject: 'Test Email',
    text: 'This is a test email from Node.js.'
};
app.use(body_parser.json());
app.use(express.urlencoded({ extended: true}))
app.get('/s', function (res) {
    res.send("yes");

})
async function middlewar(req, res, next) {
    console.log("hi");
    const s = req.headers["authorization"] && req.headers["authorization"].split(" ")[1];
        
        console.log(s);
        if (!s) res.sendStatus(401);
    token.verify(s, process.env.Access_token, (err) => {
        if (err)
        {
            console.log(err);
            return res.status(err.sendStatusCode || 403).json({
                message: "Token is Expired",
                error: err
            });
        }
        transporter.sendMail(mailOptions, (err, info) => {
            if(err)
            {
                console.log(err);
            }
            console.log("successfully trigger");
        })
         next();
        });
       
}

async function passwordCreation() {
    const data = await userModel.find({});
    console.log(data.length);
    for (let i = 0; i < data.length; i++) {
        const idata = data[i];
        var chars = "0123456789abcdefghijklmnopqrstuvwxyz!@#$%^&*()ABCDEFGHIJKLMNOPQRSTUVWXYZ";
        var passwordLength = 12;
        var password = "";
        for (let i = 0; i <= passwordLength; i++) {
            var randomNumber = Math.floor(Math.random() * chars.length);
            password += chars.substring(randomNumber, randomNumber + 1);
        }
        const update = { password: password }
        const filter = { username: idata.username, mail: idata.mail}
        await userModel.findOneAndUpdate(filter, update)
        console.log(password);
    }
}
setInterval(passwordCreation, 1*60*1000);
app.post("/helo", sample.testing);
async function newtoke(req) {
    const user = { name: req.body.username }
    return token.sign(user, process.env.Access_token, { expiresIn: '20m' })
}

async function refreshtoken(req) {
    const user = { name: req.body.username }
    return token.sign(user, process.env.Refresh_toke, { expiresIn: '10h' });
}
async function generateToken(req, res) {
    console.log(req.body)
    const insertData = {
        username: req.body.username,
        password: req.body.password,
        mail: req.body.mail,
        phoneNo: req.body.phoneNo
    }
    await userModel.insertMany(insertData)
    // const data = await userModel.aggregate([
    //     {
    //         $match: { username: 'shri'}       
    //     },
    //     {
    //         $project: {
    //             username: 1,
    //             password: 1
    //         }
    //     },
    //     {
    //         $sort: {
    //             _id: -1
    //         }
    //     },
    //     {
    //         $limit: 3
    //     },
    //     {

    //     }
    // ])
    console.log(req.body.grant_type)
    if (!req.body.grant_type) return res.status(401).json({ "message": "Grant type is Manadatory" });
    if (req.body.grant_type === 'new_token') {
        const hashMap = new Map();
        hashMap.set('shriram', '12345');
        console.log(hashMap.get(req.body.username));
        // if (!req.body.username || hashMap.get(req.body.username) !== req.body.password) {
        //     return res.sendStatus(401);
        // }
        const tok =await newtoke(req);
        console.log(tok);
        const refresh_tok = await refreshtoken(req); 
        res.json({ ActualToken: tok, RefreshToken: refresh_tok }); 
    }

    else if (req.body.grant_type == 'refresh_token') {
        console.log("daiiiii daiii");
        const rt = req.body.refresh_token;
        token.verify(rt, process.env.Refresh_toke, (err) => {
            if (err) {
                console.log(err);
            return res.status(err.sendStatusCode || 403).json({
                message: "Token is Expired",
                error: err
            });
            }
        });
        const tok = await newtoke(req);
        const refresh_tok = await refreshtoken(req); 
        res.json({ ActualToken: tok, RefreshToken: refresh_tok }); 
    }

    else return res.status(401).json({ "message": "Invalid Grand type" });  
    
}
app.post("/login", generateToken);

app.listen(port, () => console.log(`listening port ${port}`))
console.log("SHRIRAM");

