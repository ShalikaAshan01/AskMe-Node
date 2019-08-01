var moment = require('moment');
var questionModel = require('../models/QuestionsModel');
var answerModel = require('../models/AnswerModel');
var jwt = require('jsonwebtoken');

var AnswerController = function () {
};

AnswerController.add = function(token,qid,answer,anonymous){
    return new Promise((resolve, reject) => {
        if (token === null || token === undefined)
            reject({status: 403, error: "Unknown user"});
        else {
            token = token.replace('Bearer ', '');
            jwt.verify(token, process.env.SECRET, function (err, decoded) {
                if (err) {
                    reject({status: 401, error: err})
                }else {
                    delete decoded['iat'];
                    delete decoded['status'];
                    delete decoded['exp'];
                    delete decoded['gender'];
                    if(answer===null || answer==="" || answer === undefined)
                        reject({status:400,error:"Answer is required"});
                    else{
                        if(anonymous===null || anonymous===undefined || anonymous===""){
                            anonymous = false;
                        }
                        jwt.verify(token, process.env.SECRET, function (err, decoded) {
                            if (err) {
                                reject({status: 401, error: err})
                            }else {
                                delete decoded['iat'];
                                delete decoded['status'];
                                delete decoded['exp'];
                                delete decoded['gender'];
                                questionModel.findById(qid)
                                    .then(data=>{
                                        if(data===null){
                                            reject({status:404,error:"Cannot find question"})
                                        }
                                        else{
                                            let qAnswer = {
                                                qid:qid,
                                                answer:answer,
                                                created_at:moment().format(),
                                                updated_at:moment().format(),
                                                user:{
                                                    userInfo:decoded,
                                                    anonymous:anonymous
                                                }
                                            };
                                            answerModel.create(qAnswer)
                                                .then(answer=>{
                                                    questionModel.findByIdAndUpdate(qid,{answers:data.answers+1})
                                                        .then(()=>{
                                                            resolve({status:201,answer:answer})
                                                        })
                                                        .catch(err=>{
                                                            reject({status:500,error:err})
                                                        })
                                                })
                                                .catch(err=>{
                                                    reject({status:500,error:err})
                                                })
                                        }
                                    })
                                    .catch(err=>{
                                        reject({status:500,error:err})
                                    })

                            }
                        })
                    }
                }
            })
        }
    })
};
AnswerController.getByQID = function(qid){
  return new Promise((resolve, reject) => {
      answerModel.find({qid:qid})
          .sort({bestAnswer:-1,"vote.upVote":-1})
          .then(data=>{
              resolve({status:200,answers:data})
          })
          .catch(err=>{
              reject({status:500,error:err})
          })
  })
};
AnswerController.getByQIDUpdated = function(qid){
    return new Promise((resolve, reject) => {
        answerModel.find({qid:qid})
            .sort({bestAnswer:-1,updated_at:-1})
            .then(data=>{
                resolve({status:200,answers:data})
            })
            .catch(err=>{
                reject({status:500,error:err})
            })
    })
};

AnswerController.addComment = function(token,id,comment,anonymous){
    return new Promise((resolve, reject) => {
        if (token === null || token === undefined)
            reject({status: 403, error: "Unknown user"});
        else {
            token = token.replace('Bearer ', '')
        }
        jwt.verify(token, process.env.SECRET, function (err, decoded) {
            if (err) {
                reject({status: 401, error: err})
            }else {
                delete decoded['iat'];
                delete decoded['status'];
                delete decoded['exp'];
                delete decoded['gender'];
                answerModel.findByIdAndUpdate(id,
                    {$push: {'comments': {comment:comment,date:moment().format(),user:{anonymous: anonymous,userInfo:decoded}}}},
                ).then((data) => {
                    resolve({status: 200, answer: data})
                }).catch(err => {
                    reject({status: 500, error: err})
                })
            }
        })
    });
};

AnswerController.downVote = function (token, qid) {
    return new Promise((resolve, reject) => {
        if (token === null || token === undefined)
            reject({status: 403, error: "Unknown user"});
        else {
            token = token.replace('Bearer ', '')
        }
        jwt.verify(token, process.env.SECRET, function (err, decoded) {
            if (err) {
                reject({status: 401, error: err})
            }
            delete decoded['iat'];
            delete decoded['status'];
            delete decoded['exp'];
            delete decoded['gender'];

            //check if question is valid or not
            answerModel.findById(qid)
                .then(data => {
                    if (!data)
                        reject({status: 404, error: "Cannot find question"});
                    else {
                        if (decoded._id === data.user.userInfo._id)
                            reject({status: 406, error: "You cannot vote your answer"});
                        else {
                            //check in down vote
                            answerModel.findOneAndUpdate({
                                _id: qid,
                                "vote.downVote": {"$in": [decoded]}
                            }, {$pull: {'vote.downVote': {_id: decoded._id}}},)
                                .then((data) => {
                                    //if not up voted add up vote
                                    if (data === null) {
                                        //check in down vote and remove if exists
                                        answerModel.findOneAndUpdate({
                                            _id: qid,
                                            "vote.upVote": {"$in": [decoded]}
                                        }, {$pull: {'vote.upVote': {_id: decoded._id}}},)
                                            .then(() => {
                                                answerModel.findByIdAndUpdate(qid,
                                                    {$push: {'vote.downVote': decoded}},
                                                ).then(() => {
                                                    resolve({status: 200, vote: "down vote added"})
                                                }).catch(err => {
                                                    resolve({status: 500, error: err})
                                                })
                                            })
                                            .catch(err => {
                                                resolve({status: 500, error: err})
                                            })
                                    } else {
                                        //if already down voted remove that
                                        resolve({status: 200, vote: "down vote removed"})
                                    }
                                }).catch(err => {
                                resolve({status: 500, error: err})
                            });
                        }
                    }
                })
                .catch(err => {
                    reject({status: 401, error: err})
                })
            ;
        });
    })
};

AnswerController.upVote = function (token, qid) {
    return new Promise((resolve, reject) => {
        if (token === null || token === undefined)
            reject({status: 403, error: "Unknown user"});
        else {
            token = token.replace('Bearer ', '')
        }
        jwt.verify(token, process.env.SECRET, function (err, decoded) {
            if (err) {
                reject({status: 401, error: err})
            }
            delete decoded['iat'];
            delete decoded['status'];
            delete decoded['exp'];
            delete decoded['gender'];

            //check if question is valid or not
            answerModel.findById(qid)
                .then(data => {
                    if (!data)
                        reject({status: 404, error: "Cannot find question"});
                    else {
                        if (decoded._id === data.user.userInfo._id)
                            reject({status: 406, error: "You cannot vote your answer"});
                        else {
                            //check in up vote
                            answerModel.findOneAndUpdate({
                                _id: qid,
                                "vote.upVote": {"$in": [decoded]}
                            }, {$pull: {'vote.upVote': {_id: decoded._id}}},)
                                .then((data) => {
                                    //if not up voted add up vote
                                    if (data === null) {
                                        //check in down vote and remove if exists
                                        answerModel.findOneAndUpdate({
                                            _id: qid,
                                            "vote.downVote": {"$in": [decoded]}
                                        }, {$pull: {'vote.downVote': {_id: decoded._id}}},)
                                            .then(() => {
                                                answerModel.findByIdAndUpdate(qid,
                                                    {$push: {'vote.upVote': decoded}},
                                                ).then(() => {
                                                    resolve({status: 200, vote: "up vote added"})
                                                }).catch(err => {
                                                    resolve({status: 500, error: err})
                                                })
                                            })
                                            .catch(err => {
                                                resolve({status: 500, error: err})
                                            })
                                    } else {
                                        //if already up voted remove that
                                        resolve({status: 200, vote: "up vote removed"})
                                    }
                                }).catch(err => {
                                resolve({status: 500, error: err})
                            });
                        }
                    }
                })
                .catch(err => {
                    reject({status: 401, error: err})
                })
            ;
        });
    })
};
AnswerController.updateAnswer=function(token,id,answer){
    return new Promise((resolve, reject) => {
        if (token === null || token === undefined)
            reject({status: 403, error: "Unknown user"});
        else {
            token = token.replace('Bearer ', '');
        }
        jwt.verify(token, process.env.SECRET, function (err, decoded) {
            if (err) {
                reject({status: 401, error: err})
            }else{
                answerModel.findById(id)
                    .then(data=>{
                        if(data===null){
                            reject({status:404,error:"Cannot find relevant answer"})
                        }else if(data.user.userInfo._id!==decoded._id){
                            reject({status:403,error:"You can not update someone else answer"})
                        }
                        else{
                            answerModel.findByIdAndUpdate(id,{answer:answer.answer,updated_at:moment().format()})
                                .then(data=>{
                                        resolve({status:202,answer:data})
                                })
                                .catch(err=>{
                                    reject({status: 500, error: err})
                                })
                        }
                    })
                    .catch(err=>{
                        reject({status: 500, error: err})
                    })
            }
        })
    })
};


AnswerController.delete = function(token,id){
    return new Promise((resolve, reject) => {
        if (token === null || token === undefined)
            reject({status: 403, error: "Unknown user"});
        else {
            token = token.replace('Bearer ', '');

            jwt.verify(token, process.env.SECRET, function (err, decoded) {
                if (err) {
                    reject({status: 401, error: err})
                }
                else {
                    answerModel.findById(id)
                        .then(data=>{
                            if(data===null){
                                reject({status:404,error:"No Found"})
                            }else if(data.user.userInfo._id===decoded._id){
                                        answerModel.findByIdAndRemove(id)
                                            .then(()=>{
                                                resolve({status: 200})
                                            })
                                            .catch(err=>{
                                                reject({status: 500, error: err})
                                            })

                            }else{
                                reject({status:401,error:"You are not thw author of this answer"})
                            }
                        });
                }
            })
        }
    })
};
AnswerController.acceptAnswer=function(token,id){
    return new Promise((resolve, reject) => {
        if (token === null || token === undefined)
            reject({status: 403, error: "Unknown user"});
        else {
            token = token.replace('Bearer ', '');
        }
        jwt.verify(token, process.env.SECRET, function (err, decoded) {
            if (err) {
                reject({status: 401, error: err})
            }else{
                answerModel.findById(id)
                    .then(data=>{
                        if(data===null){
                            reject({status:404,error:"Cannot find relevant answer"})
                        }else if(data.user.userInfo._id!==decoded._id){
                            reject({status:403,error:"You can not update someone else answer"})
                        }
                        else{
                            answerModel.findByIdAndUpdate(id,{bestAnswer:"true",updated_at:moment().format()})
                                .then(data=>{
                                    questionModel.findByIdAndUpdate(data.qid,{answered:"true"})
                                        .then(()=>{
                                            resolve({status:202})
                                        })
                                        .catch(err=>{
                                            reject({status: 500, error: err})
                                        })

                                })
                                .catch(err=>{
                                    reject({status: 500, error: err})
                                })
                        }
                    })
                    .catch(err=>{
                        reject({status: 500, error: err})
                    })
            }
        })
    })
};

AnswerController.getAnswerByUserID=function(id){
    return new Promise((resolve, reject) => {
        answerModel.find({
            "user.userInfo._id":id
        }).sort({updated_at: 'desc'})
            .then(data=>{
                if(data.length!==0)
                    resolve({status:200,answers:data});
                else
                    reject({status:404,error:"Cannot find questions"})
            })
            .catch(err=>{
                reject({status: 500, error: err})
            })
    })
};

AnswerController.getBestAnswerByUserID=function(id){
    return new Promise((resolve, reject) => {
        answerModel.find({
            bestAnswer:"true",
            "user.userInfo._id":id
        }).sort({updated_at: 'desc'})
            .then(data=>{
                if(data.length!==0)
                    resolve({status:200,answers:data});
                else
                    reject({status:404,error:"Cannot find questions"})
            })
            .catch(err=>{
                reject({status: 500, error: err})
            })
    })
};

module.exports = AnswerController;