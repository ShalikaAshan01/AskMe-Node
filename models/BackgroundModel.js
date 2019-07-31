const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const background = new Schema({
    photos:{type:Schema.Types.Mixed},
    created_at:{
        type:String,
        unique:true
    }
});
var model = mongoose.model("background", background);
module.exports = model;