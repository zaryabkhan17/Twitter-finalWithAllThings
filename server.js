var SERVER_SECRET = process.env.SECRET || "1234";
// var SERVICE_ACCOUNT = JSON.parse(process.env.SERVICE_ACCOUNT)
const PORT = process.env.PORT || 5000;

var express = require("express");
var bodyParser = require('body-parser');
var cookieParser = require('cookie-parser');
var cors = require("cors");
var morgan = require("morgan");
var path = require("path")
var jwt = require('jsonwebtoken')
var { userModel, tweetModel } = require('./dbconn/modules');
var app = express();
var authRoutes = require('./routes/auth')
var http = require("http");
var socketIO = require("socket.io");
var server = http.createServer(app);
var io = socketIO(server);
const fs = require('fs')
const multer = require('multer')

io.on("connection", () => {
    console.log("chl gya");
})

const storage = multer.diskStorage({ // https://www.npmjs.com/package/multer#diskstorage
    destination: './uploads/',
    filename: function (req, file, cb) {
        cb(null, `${new Date().getTime()}-${file.filename}.${file.mimetype.split("/")[1]}`)
    }
})
var upload = multer({ storage: storage })

const admin = require("firebase-admin");
// https://firebase.google.com/docs/storage/admin/start
var SERVICE_ACCOUNT ={
    "type": "service_account",
    "project_id": "twitterzar-3ef5b",
    "private_key_id": "07b23a017b90c5addd3533f559fe3b7611e977a3",
    "private_key": "-----BEGIN PRIVATE KEY-----\nMIIEvAIBADANBgkqhkiG9w0BAQEFAASCBKYwggSiAgEAAoIBAQDTaO80IQUvwFK5\n0UGByVgL2EdsyZS2tm4TB8dVI3S0N/i8N5jdnK821y83QcJnB3acAR6MkRL1cMsK\ncVi/nzzlplFaggs8mgTM7WjhxjrTGAo2aLvnX2AZ2jrvfM5gaRr+Q6s135oV4a4e\n6JPAcrKtxV/1F0wW1ThjtYwqJ5KFMKLDDpg8EGrd567/xYj+D+thIbaeGiZHsbKo\nAvO751kc0YDi36a/qig3pQLqDMM9/LpTIrA6REBHw127p7gIMRBJiDK55+hKZf8N\n1XSEPPfAOrwGE447KMuBCma9q+7IH/wAJ/HFi231hXMG8Wi6mZK6sDQKqstbc2ch\nmdVsAmtlAgMBAAECggEADyJ7Q3BcunEqivZ12diD9t8eJ+XbgWQYh8C+DrSJ2ZAL\nPNA/H5hku8iWbv6EcBNK9LqoyPfm007mnkIEkD1SYv9v4gqeytEc6F3TrRwfoHaf\nXotLbnI3w0oJ/5SgAqtrnQnTozj1gz0Dld9hGn0rmQChEL8A+b58ebjoxqjMFsBG\nAqxOVEusJPM4wJfrBtcS+b4esn5iMhMxfuW6pDGLecISB1U+amywevDevtt2BkBo\nDXYAjMoWGAKVSErnnPLCW9CGTJek4bz9nH+uV//WsSqr9aWQ+PwKjMZIm4zy+1fh\na671udTfcttvau3WRl7P1beZUQoXbc9g8ERwdjxxkQKBgQDzcoa3/8eH7H0LuU65\nDLoGcen7RWcySTG8lBuQxFq/N0opug/edhVOObOFIIMljFQrnnSIJ3vSV16r7fed\nOe3x47G1raBgoNXjHeTWv1o/mnWFYzaDRtQwVTPSXU088zg2H0F/Q2xGQUXEo/1a\nq59y5rl4wBeif1aoj6IHor51dQKBgQDeT4SIpCyZMXtZvzRjSr8d+jGHSU6/+EIi\n85p6Cb/vv/x5Musa9MUT2Y6xfN0zXVxsnFCGPBSQ6MIlf9CoPkZuLgZ/myhxjoiS\n6hJtXHDAk85KmlKikitanlz6ELQc1D6VU6sLvCibTHmA/y7dFvrElPyw3LAwdpRV\nt78ZeGgwMQKBgCqHcmOIipoDRWEb8VXAlGr10ZN0729IfCjekuY6d0P6a7lYaNdL\nN7Ofvu3d3StdFYM9Pkxe4XHAk6hjfSN5cEkWpv//Igpfbp4rpcOiUCjWWfuAdpB+\neikraU8xv4GLV+GUmkOaSrsHQiH1KBiD7OoMxpACtt5Lcp8l4H+G/dDVAoGAAjAc\nKNAc1EElaqO0G0oQCXZ96EvzZ3ZFCF0HZy4TYoOsM3Ep2TERg3l/qwWEk83WbAc5\nz6hlt2tjBcV1Q0KhpNH1JGpdgoiZlYCSP9tKDMsnm5pbN9hibtjiJ1/ktefs2cFi\nDJKEf8rH41oflvNz8l1ZA1CYt1FjcliFm/WQaPECgYBm9jWg9hab1xDyGY+SQO7N\nNBRUib+R6MNo7eMQs8xxTTm6gTQbnA7ij1kSQNmq4S/Bly6Zp9lbIjOUHJuhTj2h\nvzrnuCCC/6QND9A1Zn+PRJMalGbnkXa7M2oOmwerSrxSKAaty5Q72EkCwAQGA7ql\n7ddXC7Pi92oiGJcxJK+3Pg==\n-----END PRIVATE KEY-----\n",
    "client_email": "firebase-adminsdk-odgus@twitterzar-3ef5b.iam.gserviceaccount.com",
    "client_id": "115318728239070778141",
    "auth_uri": "https://accounts.google.com/o/oauth2/auth",
    "token_uri": "https://oauth2.googleapis.com/token",
    "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
    "client_x509_cert_url": "https://www.googleapis.com/robot/v1/metadata/x509/firebase-adminsdk-odgus%40twitterzar-3ef5b.iam.gserviceaccount.com"
  }
  

admin.initializeApp({
    credential: admin.credential.cert(SERVICE_ACCOUNT),
    databaseURL: "https://twitterzar-3ef5b-default-rtdb.firebaseio.com/"
});
const bucket = admin.storage().bucket("gs://twitterzar-3ef5b.appspot.com");

app.use(bodyParser.json());
app.use(cookieParser());

app.use(cors({
    origin: '*',
    credentials: true
}));

app.use(morgan('dev'));
app.use("/", express.static(path.resolve(path.join(__dirname, "public"))))

app.use('/', authRoutes);
app.use(function (req, res, next) {
    if (!req.cookies.jToken) {
        res.status(401).send("include http-only credentials with every request")
        return;
    }
    jwt.verify(req.cookies.jToken, SERVER_SECRET, function (err, decodedData) {
        if (!err) {

            const issueDate = decodedData.iat * 1000;
            const nowDate = new Date().getTime();
            const diff = nowDate - issueDate;

            if (diff > 300000) {
                res.status(401).send("token expired")
            } else {
                var token = jwt.sign({
                    id: decodedData.id,
                    name: decodedData.name,
                    email: decodedData.email,
                }, SERVER_SECRET)
                res.cookie('jToken', token, {
                    maxAge: 86400000,
                    httpOnly: true
                });
                req.body.jToken = decodedData
                req.headers.jToken = decodedData
                next();
            }
        } else {
            res.status(401).send("invalid token")
        }
    });
})

app.get("/profile", (req, res, next) => {

    console.log(req.body)

    userModel.findById(req.body.jToken.id, 'name email phone gender createdOn profilePic',
        function (err, doc) {
            if (!err) {
                res.send({
                    status: 200,
                    profile: doc
                })

            } else {
                res.status(500).send({
                    message: "server error"
                })
            }
        })
})
app.post("/tweet", upload.any(), (req, res, next) => {

    console.log("req.body: ", req.body);
    bucket.upload(
        req.files[0].path,
        function (err, file, apiResponse) {
            if (!err) {
                file.getSignedUrl({
                    action: 'read',
                    expires: '03-09-2491'
                }).then((urlData, err) => {
                    if (!err) {
                        console.log("public downloadable url: ", urlData[0])
                        userModel.findById(req.headers.jToken.id, 'name profilePic email', (err,user)=>{
                            console.log("user =======>", user.email)
                            if (!err) {
                                tweetModel.create({
                                    "name": user.name,
                                    "tweets": req.body.tweet,
                                   "profilePic": user.profilePic,
                                   "tweetImg": urlData[0],
                                   "email": user.email
                                }).then((data) => {
                                    console.log(data)
                                    res.send({
                                        status: 200,
                                        message: "Post created",
                                        data: data
                                    })
                                    console.log(data)
                                    io.emit("NEW_POST", data)

                                }).catch(() => {
                                    console.log(err);
                                    res.status(500).send({
                                        message: "user create error, " + err
                                    })
                                })
                            }
                            else{
                                res.send("err")
                            }
                        })
                        try {
                            fs.unlinkSync(req.files[0].path)
                        } catch (err) {
                            console.error(err)
                        }
                    }
                })
            } else {
                console.log("err: ", err)
                res.status(500).send();
            }
        });
})

app.post('/textTweet', (req, res, next) => {
    if (!req.body.tweet) {
        res.status(403).send({
            message: "please provide tweet"
        })
    }
    userModel.findOne({email: req.body.jToken.email},(err,user)=>{
        console.log("user =======>", user.email)
        if (!err) {
            tweetModel.create({
                "name": user.name,
                "email": user.email,
                "tweets": req.body.tweet,
                "profilePic": user.profilePic,
            }).then((data) => {
                console.log(data)
                    res.send({
                        status: 200,
                        message: "Post created",
                        data: data
                    })
                    io.emit("NEW_POST", data)
                }).catch(()=>{
                    console.log(err);
                    res.status(500).send({
                        message: "user create error, " + err
                    })
                })   
        }
        else{
            console.log(err)
        }
    })
})

app.get('/getTweets', (req, res, next) => {

    tweetModel.find({}, (err, data) => {
        if (err) {
            console.log(err)
        }
        else {
            res.send({data:data});
        }
    })
})
app.get('/myTweets', (req, res, next) => {

    userModel.findOne({email: req.body.jToken.email},(err,user)=>{
        if (!err) {
            tweetModel.find({email:req.body.jToken.email}, (err, data) => {
                if (err) {
                    console.log(err)
                }
                else {
                        res.send({data:data});
                }
            })      
        }
        else{
            console.log(err)
        }
    })
})
app.post("/upload", upload.any(), (req, res, next) => {

    console.log("req.body: ", req.body);
    bucket.upload(
        req.files[0].path,
        function (err, file, apiResponse) {
            if (!err) {
                file.getSignedUrl({
                    action: 'read',
                    expires: '03-09-2491'
                }).then((urlData, err) => {
                    if (!err) {
                        console.log("public downloadable url: ", urlData[0])
                        userModel.findOne({ email: req.body.email }, (err, user) => {
                            console.log(user)
                            if (!err) {
                                tweetModel.updateMany({ name: req.headers.jToken.name }, {profilePic:urlData[0]}, (err, tweetModel) => {
                                    console.log(tweetModel)
                                    if (!err) {
                                        console.log("update");
                                    }
                                });
                                user.update({ profilePic: urlData[0] }, (err, updatedProfile) => {
                                    if (!err) {
                                        res.status(200).send({
                                            message: "succesfully uploaded",
                                            url: urlData[0],
                                        })
                                    }
                                    else {
                                        res.status(500).send({
                                            message: "an error occured" + err,
                                        })
                                    }

                                })
                            }
                            else {
                                res.send({
                                    message: "error"
                                });
                            }
                        })
                        try {
                            fs.unlinkSync(req.files[0].path)
                        } catch (err) {
                            console.error(err)
                        }
                    }
                })
            } else {
                console.log("err: ", err)
                res.status(500).send();
            }
        });
})

server.listen(PORT, () => {
    console.log("server is running on: ", PORT);
})
