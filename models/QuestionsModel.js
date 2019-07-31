const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const questions = new Schema({
    question:{
        type:String,
        required:true,
        unique:true
    },
    description:{
        type:String,
    },
    askedFrom:{
        type:String,
        default:"everyone"
    },
    questionType:{
        type: String,
        default: "question"
    },
    tags:{
        type:Schema.Types.Array,
        required:true
    },
    follow:{
        type:Schema.Types.Mixed,
        default:[]
    },
    comments:{type:Schema.Types.Mixed,default:[]},
    answers:{type:Number,default:0},
    user:{
        anonymous:{type:String,required: true},
        userInfo:{
            id:{type:String,required:true},
            username:{type:String,required:true},
            firstName:{type:String,required:true},
            lastName:{type:String,required:true},
            email:{type:String,required:true}
        }
    },
    answered:{type:String,default:null},
    vote:{
        upVote:{type:Schema.Types.Mixed,default:[]},
        downVote:{type:Schema.Types.Mixed,default:[]}
    },
    views:{type:Number,default:0},
    created_at:{
        type:Schema.Types.Date,
    },
    updated_at:{
        type:Schema.Types.Date
    }
});
var model = mongoose.model("questions", questions);
module.exports = model;