var usersModel = require('../models/UserModels');
var moment = require('moment');
const shortid = require('shortid');
const bcrypt = require('bcrypt');
const mailer = require('./Mailer');
var jwt = require('jsonwebtoken');
require('dotenv').config();
const tokenExp = '3d';
var UsersController = function(){};
const saltRounds = 10;
UsersController.create = function (user) {
    return new Promise((resolve, reject) => {

        user.email = user.email.toLocaleLowerCase();
        user.username = user.username.toLocaleLowerCase();
        bcrypt.genSalt(saltRounds, function(err, salt) {
            bcrypt.hash(user.password, salt, function(err, hash) {
                if(err){
                    reject({status:500,user:null,message:err,error:true})
                }else{
                    let code = generateString(6);
                    let now = moment().format();

                    usersModel.findOne({email:user.email}).then(obj=>{
                        //check unique email
                        if(obj!==null){
                            reject({status:409,user:null,message:"This email address is already taken",error:true})
                        }
                        //username
                        usersModel.findOne({username:user.username}).then(obj=>{
                            if(obj!==null){
                                reject({status:409,user:null,message:"This username is already taken",error:true})
                            }
                            let data = {
                                firstName:user.firstName,
                                lastName:user.lastName,
                                username:user.username,
                                email:user.email,
                                password:hash,
                                gender:user.gender,
                                status: {
                                    valid:false,
                                    role:"user"
                                },
                                verification: {
                                    code:code,
                                    expireDate:moment(now).add(12, 'hours').format('YYYY-MM-DD hh:mm:ss')
                                },
                                created_at:now,
                                updated_at:now
                            };
                            usersModel.create(data).then(data=>{
                                //send email
                                sendVerificationEmail(data.email,data.lastName,code);
                                //send response
                                let obj = {
                                    _id:data._id,
                                    firstName:data.firstName,
                                    lastName:data.lastName,
                                    username:data.username,
                                    email:data.email,
                                    gender:data.gender,
                                    status:data.status
                                };
                                resolve({status:201,user:obj,message:"Successfully Created",error:false});
                            }).catch(err=>{
                                reject({status:500,user:null,message:err,error:true})
                            })
                        }).catch(err=>{
                            reject({status:500,user:null,message:err,error:true})
                        })
                    }).catch(err=>{
                        reject({status:500,user:null,message:err,error:true})
                    });
                }
            });
        });
    })
};
UsersController.emailValidator = function(email){
    return new Promise((resolve, reject) => {
        usersModel.findOne({email:email}).then((doc)=>{
            if(doc===null)
                reject({status:404,message:"Valid email address",valid:true});
            else
                resolve({status:200,message:"This email address already taken",valid:false})
        }).catch(err=>{
            reject({status:500,message:err,valid:false});
        })
    })
};
UsersController.usernameValidator = function(username){
    return new Promise((resolve, reject) => {
        usersModel.findOne({username:username}).then((doc)=>{
            if(doc===null)
                reject({status:404,message:"Valid username",valid:true});
            else
                resolve({status:200,message:"This username is already taken",valid:false})
        }).catch(err=>{
            reject({status:500,message:err,valid:false});
        })
    })
};

function generateString(length){
    let result = '';
    let characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let charactersLength = characters.length;
    for (let i = 0; i < length; i++) {
        result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
}
function sendVerificationEmail(email,lastName,code) {
    let from = '"AskMe 👻" <noreply97sa@gmail.com>';
    let to = email;
    let subject = "Please verify your account";
    let text=`You can activate your account by using ${code} verification code`;
    let html=`<h2>Verify Your Account</h2><br/>
                                            <h4>Hi! ${lastName},</h4>
                                            Please use <strong>${code}</strong> as your confirmation code.
                                            This code is only valid for 24 hours
                                            <br/>Thank you,
                                            <br/>AskMe Team.,
                                            <br/>This is an automatically generated email – please do not reply to it.
                                            <br/><br/> <span style="font-style: oblique">You're receiving this email because you just created an account in AskMe.
                                            If you are not sure why you are receiving this please contact us.</span>`
    ;
    let username="noreply97sa@gmail.com";
    let password = "R2h8ncdF*JyS";
    mailer(from,to,subject,text,html,username,password);
}
function sendActivatedEmail(email,lastName) {
    let from = '"AskMe 👻" <noreply97sa@gmail.com>';
    let to = email;
    let subject = "Your account activated";
    let text="Your AskMe Account is activated successfully";
    let html=`<h2>Your Account Activated</h2><br/>
                                            <h4>Dear ${lastName},</h4>
                                            Your AskMe Account is activated successfully
                                            <br/>Thank you,
                                            <br/>AskMe Team.,
                                            <br/>This is an automatically generated email – please do not reply to it.
                                            <br/><br/> <span style="font-style: oblique">You're receiving this email because you just created an account in AskMe.
                                            If you are not sure why you are receiving this please contact us.</span>`
    ;
    let username="noreply97sa@gmail.com";
    let password = "R2h8ncdF*JyS";
    mailer(from,to,subject,text,html,username,password);
}
function sendForgottenPasswordEmail(email,lastName,hash,shortID) {
    let from = '"AskMe 👻" <noreply97sa@gmail.com>';
    let to = email;
    let subject = "Reset Password";
    let text="Reset your password";
    let html=`<h2>Password Reset</h2><br/>
                                            <h4>Dear ${lastName},</h4>
                                            Click <a href="${process.env.URL}/resetpassword/${hash}/${shortID}">here</a> to reset your password.
                                            <br/>* This link valid only 24 hours
                                            <br/>Thank you,
                                            <br/>AskMe Team.,
                                            <br/>This is an automatically generated email – please do not reply to it.
                                            <br/><br/> <span style="font-style: oblique">You're receiving this email because you just created an account in AskMe.
                                            If you are not sure why you are receiving this please contact us.</span>`
    ;
    let username="noreply97sa@gmail.com";
    let password = "R2h8ncdF*JyS";
    mailer(from,to,subject,text,html,username,password);
}

UsersController.resendCode = function(_id){
    return new Promise((resolve, reject) => {
        usersModel.findById(_id)
            .then(data=>{
                let expiryDate = moment(data.verification.expireDate);
                let now = moment();
                let duration = moment.duration(expiryDate.diff(now)).asMilliseconds();

                if(duration>0){
                    sendVerificationEmail(data.email,data.lastName,data.verification.code);
                    resolve({status:202,message:"Already Created"})
                }else{
                    let code = generateString(6);
                    usersModel.findByIdAndUpdate(_id,{
                        verification: {
                            code:code,
                                expireDate:moment(now).add(12, 'hours').format('YYYY-MM-DD hh:mm:ss')
                        }
                    }).then(()=>{
                        sendVerificationEmail(data.email,data.lastName,code);
                        resolve({status:200,message:"Code Updated"})
                    })
                        .catch(err=>{
                            reject({status:500,error:err})
                        });
                }
            })
            .catch(err=>{
                reject({status:500,error:err})
            })
    })
};
UsersController.validateCode = function(_id,code){
    return new Promise((resolve, reject) => {
        usersModel.findById(_id)
            .then(data=>{
                if(data===null)
                    reject({status:401,error:"Cannot find user"});
                if(data.status.valid)
                    reject({status:406,error:"Already activated"});

                if(code !== data.verification.code){
                    reject({status:400,error:"Your verification code doesn't match"});
                }else {
                    let expiryDate = moment(data.verification.expireDate);
                    let now = moment();
                    let duration = moment.duration(expiryDate.diff(now)).asMilliseconds();
                    if (duration < 0) {
                        reject({status: 409, error: "Your confirmation code is no longer valid.Please resend confirmation code"})
                    }else{
                        usersModel.findByIdAndUpdate(_id,{
                            status:{
                                valid:true,
                                role:"user"
                            }
                        })
                            .then(data=>{
                                sendActivatedEmail(data.email,data.lastName);
                                let obj = {
                                    _id:data._id,
                                    firstName:data.firstName,
                                    lastName:data.lastName,
                                    username:data.username,
                                    email:data.email,
                                    gender:data.gender,
                                    status:data.status
                                };

                                let token = jwt.sign(obj, process.env.SECRET, {expiresIn: tokenExp});
                                resolve({status:200,user:token,message:"Successfully activated"})
                            })
                            .catch(err=>{
                                reject({status:500,error:err})
                            })
                    }
                }
            })
            .catch(err=>{
                reject({status:500,error:err})
            })
    })
};

UsersController.login = function(data){
    return new Promise((resolve, reject) => {
        let username = data.username;
        let password = data.password;
        usersModel.findOne({$or:[{username: username},{email:username}]})
            .then(data=>{
                if(data===null)
                    reject({status:404,error:"Invalid username or password"});
                if(bcrypt.compareSync(password, data.password)){
                    let obj = {
                        _id:data._id,
                        firstName:data.firstName,
                        lastName:data.lastName,
                        username:data.username,
                        email:data.email,
                        gender:data.gender,
                        status:data.status
                    };
                    if(!data.status.valid) {
                        UsersController.resendCode(data._id).then(() => {
                            let token = jwt.sign(obj, process.env.SECRET, {expiresIn: tokenExp});
                            resolve({status: 200, token: token, activated: false})
                        });
                    }else {
                        let token = jwt.sign(obj, process.env.SECRET, {expiresIn: tokenExp});
                        resolve({status: 200, token: token, activated: data.status.valid})
                    }
                }else{
                    reject({status:400,error:"Invalid username or password"})
                }
            })
            .catch(err=>{
                reject({status:500,error:err})
            })

    })
};
UsersController.forgottenPassword = function(email){
    return new Promise((resolve, reject) => {
        usersModel.findOne({email:email})
            .then(data=>{
                if(data!==null){
                    let hash = generateString(32);
                    let shortID = shortid.generate();

                    usersModel.findByIdAndUpdate(data._id,{
                        forgotPassword:{
                            hash:hash,
                            shortID:shortID,
                            expireDate:moment(moment()).add(12, 'hours').format('YYYY-MM-DD hh:mm:ss')
                        }
                    })
                        .then(data=>{
                            sendForgottenPasswordEmail(data.email,data.lastName,hash,shortID);
                            resolve({status:200,message:"Email sent successfully"})
                        })
                        .catch(err=>{
                            reject({status:500,error:err})
                        })
                }
                else
                    reject({status:404,error:"You are not registered"})
            })
            .catch(err=>{
                reject({status:500,error:err})
            })
    })
};

UsersController.validateResetPassword = function(hash,shortID){
    return new Promise((resolve, reject) => {

        let query = {
            'forgotPassword.hash': hash,
            'forgotPassword.shortID': shortID
            };
        usersModel.findOne(query)
            .then(data=>{
                if(data===null)
                    reject({status:404,error:"Invalid Page"});
                else {
                    let expiryDate = moment(data.forgotPassword.expireDate);
                    let now = moment();
                    let duration = moment.duration(expiryDate.diff(now)).asMilliseconds();
                    if (duration < 0) {
                        reject({status: 404,error: "Cannot find"
                        })
                    }
                    else
                        resolve({status:200,id:data._id})
                }
            })
            .catch(err=>{
                reject({status:500,error:err})
            })
    })
};

UsersController.changePassword = function(id,password){
    return new Promise((resolve, reject) => {
        bcrypt.genSalt(saltRounds, function(err, salt) {
            bcrypt.hash(password, salt, function(err, hash) {
                // Store hash in your password DB.
                if(err)
                    reject({status:500,error:err});
                usersModel.findByIdAndUpdate(id,{password:hash,updated_at:moment().format(),$unset: {forgotPassword: 1 }})
                    .then(()=>{
                        resolve({status:200})
                    })
                    .catch(err=>{
                        reject({status:500,error:err});
                    })
            });
        });

    })
};
UsersController.updateProfile = function(id,token,data){
    return new Promise((resolve, reject) => {
        if (token === null || token === undefined)
            reject({status: 403, error: "Unknown user"});
        else {
            token = token.replace('Bearer ', '');
        }
        jwt.verify(token, process.env.SECRET, function (err, decoded) {
            if (err) {
                reject({status: 401, error: err})
            }else if(decoded._id===id){
                usersModel.findByIdAndUpdate(id,data)
                    .then(()=>{
                        resolve({status:200})
                    })
                    .catch(err=>{
                        reject({status: 500, error: err})
                    })
            }else{
                reject({status: 401, error: "Cannot update"});
            }
        })
    })
};
UsersController.authSignup=function(user){
    return new Promise((resolve, reject) => {
        let data = {
            firstName:user.firstName,
            lastName:user.lastName,
            username:user.username,
            email:user.email,
            password:shortid.generate(),
            gender:user.gender,
            status: {
                valid:true,
                role:"user"
            },
            created_at:moment().format(),
            updated_at:moment().format()
        };
        usersModel.create(data)
            .then(data=>{
                let obj = {
                    _id:data._id,
                    firstName:data.firstName,
                    lastName:data.lastName,
                    username:data.username,
                    email:data.email,
                    gender:data.gender,
                    status:data.status
                };
                let token = jwt.sign(obj, process.env.SECRET, {expiresIn: tokenExp});
                resolve({status:201,token:token})
            })
            .catch(err=>{
                reject({status: 500, error: err});
            })
    })
};
UsersController.authCheck=function(email){
    return new Promise((resolve, reject) => {
        usersModel.findOne({email:email})
            .then(data=>{
                console.log(data)
                if(data===null){
                    reject({status: 404, error: "Cannot find user details"});
                }else{
                    let obj = {
                        _id:data._id,
                        firstName:data.firstName,
                        lastName:data.lastName,
                        username:data.username,
                        email:data.email,
                        gender:data.gender,
                        status:data.status
                    };
                    let token = jwt.sign(obj, process.env.SECRET, {expiresIn: tokenExp});
                    resolve({status:201,token:token})
                }
            })
            .catch(err=>{
                reject({status: 500, error: err});
            })
    })
};
UsersController.getUserByUsername = function(username){
    return new Promise((resolve, reject) => {
        usersModel.findOne({username:username})
            .then(data=>{
                if(data){
                    let obj = {
                        _id:data._id,
                        firstName:data.firstName,
                        lastName:data.lastName,
                        username:data.username,
                        email:data.email,
                        gender:data.gender
                    };
                    resolve({status:200,user:obj});
                }
                else
                    reject({status:404,error:"Cannot find user"});
            })
            .catch(err=>{
                reject({status:500,error:err});
            })
    })
};
module.exports = UsersController;