const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const answers = new Schema({
    qid:{
        type:String,
        required:true
    },
    comments:{type:Schema.Types.Mixed,default:[]},
    answer:{type:String,default:0},
    user:{
        anonymous:{type:String,required: true},
        userInfo:{
            _id:{type:String,required:true},
            username:{type:String,required:true},
            firstName:{type:String,required:true},
            lastName:{type:String,required:true},
            email:{type:String,required:true}
        }
    },
    bestAnswer:{type:String,default:"false"},
    vote:{
        upVote:{type:Schema.Types.Mixed,default:[]},
        downVote:{type:Schema.Types.Mixed,default:[]}
    },
    created_at:{
        type:Schema.Types.Date,
    },
    updated_at:{
        type:Schema.Types.Date
    }
});
var model = mongoose.model("answers", answers);
module.exports = model;