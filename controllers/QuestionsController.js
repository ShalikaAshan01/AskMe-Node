var moment = require('moment');
var questionModel = require('../models/QuestionsModel');
var answerModel = require('../models/AnswerModel');
var jwt = require('jsonwebtoken');

var QuestionController = function () {
};

QuestionController.add = function (token, data) {
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
                data.created_at = moment().format();
                data.updated_at = moment().format();
                questionModel.create(data)
                    .then(data => {
                        resolve({status: 201, question: data})
                    })
                    .catch(err => {
                        reject({status: 500, error: err})
                    })
            }
        })
    })
};
QuestionController.getAll = function () {
    return new Promise((resolve, reject) => {
        questionModel.find({})
            .then(data => {
                resolve({status: 200, questions: data})
            })
            .catch(err => {
                reject({status: 500, error: err})
            })
    })
};
QuestionController.upVote = function (token, qid) {
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
            questionModel.findById(qid)
                .then(data => {
                    if (!data)
                        reject({status: 404, error: "Cannot find question"});
                    else {
                        if (decoded._id === data.user.userInfo.id)
                            reject({status: 406, error: "You cannot vote your own question"});
                        else {
                            //check in up vote
                            questionModel.findOneAndUpdate({
                                _id: qid,
                                "vote.upVote": {"$in": [decoded]}
                            }, {$pull: {'vote.upVote': {_id: decoded._id}}},)
                                .then((data) => {
                                    //if not up voted add up vote
                                    if (data === null) {
                                        //check in down vote and remove if exists
                                        questionModel.findOneAndUpdate({
                                            _id: qid,
                                            "vote.downVote": {"$in": [decoded]}
                                        }, {$pull: {'vote.downVote': {_id: decoded._id}}},)
                                            .then(() => {
                                                questionModel.findByIdAndUpdate(qid,
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

QuestionController.downVote = function (token, qid) {
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
            questionModel.findById(qid)
                .then(data => {
                    if (!data)
                        reject({status: 404, error: "Cannot find question"});
                    else {
                        if (decoded._id === data.user.userInfo.id)
                            reject({status: 406, error: "You cannot vote your own question"});
                        else {
                            //check in down vote
                            questionModel.findOneAndUpdate({
                                _id: qid,
                                "vote.downVote": {"$in": [decoded]}
                            }, {$pull: {'vote.downVote': {_id: decoded._id}}},)
                                .then((data) => {
                                    //if not up voted add up vote
                                    if (data === null) {
                                        //check in down vote and remove if exists
                                        questionModel.findOneAndUpdate({
                                            _id: qid,
                                            "vote.upVote": {"$in": [decoded]}
                                        }, {$pull: {'vote.upVote': {_id: decoded._id}}},)
                                            .then(() => {
                                                questionModel.findByIdAndUpdate(qid,
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

QuestionController.get = function (question) {
    return new Promise((resolve, reject) => {
        question += "?";
        questionModel.findOne({question: question})
            .then(data => {
                if (data === null)
                    reject({status: 404, error: "Cannot find"});
                resolve({status: 200, question: data})
            })
            .catch(err => {
                reject({status: 500, error: err})
            })
    })
};
QuestionController.updateView = function (question) {
    return new Promise((resolve, reject) => {
        question += "?";
        questionModel.findOne({question: question})
            .then(data => {
                if (data) {
                    questionModel.findOneAndUpdate(data._id, {views: data.views + 1})
                        .then(data => {
                            resolve({status: 200, views: data.views + 1})
                        })
                        .catch(err => {
                            reject({status: 500, error: err})
                        })
                }
            })
            .catch(err => {
                reject({status: 500, error: err})
            })
    })
};
QuestionController.getByID = function (id) {
    return new Promise((resolve, reject) => {
        questionModel.findById(id)
            .then(data => {
                if (data === null)
                    reject({status: 404, error: "Cannot find"});
                resolve({status: 200, question: data})
            })
            .catch(err => {
                reject({status: 500, error: err})
            })
    })
};
QuestionController.follow = function (token, qid) {
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
            questionModel.findById(qid)
                .then(data => {
                    if (!data)
                        reject({status: 404, error: "Cannot find question"});
                    else {
                        if (decoded._id === data.user.userInfo.id)
                            reject({status: 406, error: "You cannot follow your own question"});
                        else {
                            questionModel.findOneAndUpdate({
                                _id: qid,
                                "follow": {"$in": [decoded]}
                            }, {$pull: {'follow': {_id: decoded._id}}},)
                                .then((data) => {
                                    //if not followed then follow question
                                    if (data === null) {
                                        questionModel.findByIdAndUpdate(qid,
                                            {$push: {'follow': decoded}},
                                        ).then(() => {
                                            resolve({status: 200, follow: true})
                                        }).catch(err => {
                                            resolve({status: 500, error: err})
                                        })
                                    } else {
                                        //if already followed  then un follow it
                                        resolve({status: 200, follow: false})
                                    }
                                })
                                .catch(err => {
                                    resolve({status: 500, error: err})
                                })
                        }
                    }
                })
        })
    })
};
QuestionController.addComment = function(token,qid,comment,anonymous){
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
                questionModel.findByIdAndUpdate(qid,
                    {$push: {'comments': {comment:comment,date:moment().format(),user:{anonymous: anonymous,userInfo:decoded}}}},
                ).then((data) => {
                    resolve({status: 200, question: data})
                }).catch(err => {
                    reject({status: 500, error: err})
                })
            }
        })
    });
};
QuestionController.delete = function(token,id){
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
                    questionModel.findById(id)
                        .then(data=>{
                            if(data===null){
                                reject({status:404,error:"No Found"})
                            }else if(data.user.userInfo.id===decoded._id){
                                answerModel.deleteMany({qid:id})
                                    .then(()=>{
                                        questionModel.findByIdAndRemove(id)
                                            .then(data=>{
                                                resolve({status: 200, question: data})
                                            })
                                            .catch(err=>{
                                                reject({status: 500, error: err})
                                            })
                                    })
                                    .catch(err=>{
                                        reject({status: 500, error: err})
                                    })

                            }else{
                                reject({status:401,error:"You are not author of this question"})
                            }
                        });
                }
            })
        }
    })
};
QuestionController.updateQuestion=function(token,id,question){
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
                questionModel.findById(id)
                    .then(data=>{
                        if(data===null){
                            reject({status:404,error:"Cannot find relevant question"})
                        }else if(data.user.userInfo.id!==decoded._id){
                            reject({status:403,error:"You can not update someone else question"})
                        }
                        else{
                            questionModel.findByIdAndUpdate(id,{question:question.question,updated_at:moment().format()})
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
QuestionController.search = function(text){
    return new Promise((resolve, reject) => {
        let regex = new RegExp(text, 'i');
        questionModel.find({
            question: regex
        }).then(data=>{
            resolve({status:200,questions:data})
        })
            .catch(err=>{
                reject({status: 500, error: err})
            })
    })
};

QuestionController.getQuestionByTag = function(tagName){
    return new Promise((resolve, reject) => {
        tagName = tagName.toLowerCase().charAt(0).toUpperCase() + tagName.slice(1);
        questionModel.find({
            tags: {
                $elemMatch: { "0.name": tagName }
            }
        })
            .then(data=>{
                if(data.length!==0)
                    resolve({status:200,questions:data});
                else
                    reject({status:404,error:"Cannot find questions"})
            })
            .catch(err=>{
                reject({status: 500, error: err})
            })
    })
};
QuestionController.getQuestionByAskType=function(from){
    return new Promise((resolve, reject) => {
        questionModel.find({askedFrom:from})
            .then(data=>{
                if(data.length!==0)
                    resolve({status:200,questions:data});
                else
                    reject({status:404,error:"Cannot find questions"})
            })
            .catch(err=>{
                reject({status: 500, error: err})
            })
    })
};

QuestionController.getQuestionByUserID=function(id){
    return new Promise((resolve, reject) => {
        questionModel.find({
            "user.userInfo.id":id
        })
            .then(data=>{
                if(data.length!==0)
                    resolve({status:200,questions:data});
                else
                    reject({status:404,error:"Cannot find questions"})
            })
            .catch(err=>{
                reject({status: 500, error: err})
            })
    })
};


module.exports = QuestionController;