const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const user = new Schema({
    firstName: {
        type: String,
        required: true
    },
    lastName: {
        type: String,
        required: true
    },
    username: {
        type: String,
        required: true,
        unique: true
    },
    email:{
        type:String,
        required:true,
        unique:true
    },
    gender:{
        type:String,
        required:true
    },
    password:{
        type:String,
        required:true
    },
    status:{
        valid:{
            type:Schema.Types.Boolean,
            default:false
        },
        role:{
            type:String,
            default:"user"
        },
    },
    verification:{
        code:{
            type:String,
        },
        expireDate:{
            type:String
        }
    },
    forgotPassword:{
        hash:{type:String},
        shortID:{type:String},
        expireDate:{type:String}
    },
    created_at:{
        type:Schema.Types.Date
    },
    updated_at:{
        type:Schema.Types.Date
    }
});
var model = mongoose.model("user", user);
module.exports = model;