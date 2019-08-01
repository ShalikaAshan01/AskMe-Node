var moment = require('moment');
var tagModel = require('../models/tagsModel');
var jwt = require('jsonwebtoken');

var TagsController = function () {};

TagsController.add = function(tag,token){
    return new Promise((resolve, reject) => {
        if(token===null || token === undefined)
            reject({status: 403, error: "Unknown user"});
        else{
            token = token.replace('Bearer ','')
        }
        let valid = jwt.verify(token,process.env.SECRET);
        jwt.verify(token, process.env.SECRET, function (err, decoded) {
           if(err){
               reject({status:401,error:'Invalid user'})
           }else{
               if(data.status.role==="admin"||data.status.role==="moderator") {
                   let data = {
                       name: tag.name,
                       created_at: moment().format(),
                       updated_at: moment().format()
                   };
                   tagModel.create(data)
                       .then(data => {
                           resolve({status: 201, tag: data})
                       })
                       .catch(err => {
                           reject({status: 500, error: err})
                       })
               }else{
                   reject({status: 401, error: err})
               }
           }
        });
    })
};
TagsController.getAll = function(){
    return new Promise((resolve, reject) => {
        tagModel.find({})
            .then(data=>{
                resolve({status:200,tags:data})
            })
            .catch(err=>{
                reject({status:500,error:err})
            })
    })
};
TagsController.delete = function(id){
    return new Promise((resolve, reject) => {
        if(token===null || token === undefined)
            reject({status: 403, error: "Unknown user"});
        else{
            token = token.replace('Bearer ','')
        }
        let valid = jwt.verify(token,process.env.SECRET);
        jwt.verify(token, process.env.SECRET, function (err, decoded) {
            if(err){
                reject({status:401,error:'Invalid user'})
            }else{
                if(data.status.role==="admin"||data.status.role==="moderator") {

                    tagModel.findByIdAndDelete(id)
                        .then(() => {
                            resolve({status: 201})
                        })
                        .catch(err => {
                            reject({status: 500, error: err})
                        })
                }else{
                    reject({status: 401, error: err})
                }
            }
        });
    })
};
module.exports = TagsController;