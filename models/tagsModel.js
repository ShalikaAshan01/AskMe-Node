const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const tags = new Schema({
    name:{type:String,required:true,unique:true},
    created_at:{
        type:String
    },
    updated_at:{
        type:Schema.Types.Date
    }
});
var model = mongoose.model("tags", tags);
module.exports = model;