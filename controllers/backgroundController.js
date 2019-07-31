var schedule = require('node-schedule');
var moment = require('moment');
var axios = require('axios');
var bg_model = require('../models/BackgroundModel');
var backgroundController = function(){
};
backgroundController.fetchBackgrounds = function(){
    var now = moment();
    var rule = new schedule.RecurrenceRule();
    rule.dayOfWeek = [0, 1, 2, 3, 4, 5, 6];
    rule.hour = now.hours();
    rule.minute = now.minutes();
    rule.second = now.seconds() + 5;
    schedule.scheduleJob(rule, ()=>{
        console.log(new Date()+" : Starting background image fetching...");
        // axios.get('https://api.pexels.com/v1/curated?per_page=20&page=1',{headers:{
        axios.get('https://api.pexels.com/v1/search?query=landscape+query&per_page=20&page=1',{headers:{
                Authorization:"563492ad6f9170000100000170714c8dd1fb4b9eb88af493f5753050"
            }})
            .then(data=>{
                let photos = {
                    photos: data.data.photos,
                    created_at: moment().format("DD-MM-YYYY")
                };
                console.log(new Date()+" : Starting background images saving...");
                bg_model.create(photos).then(()=>{
                    console.log(new Date()+" : New images successfully saved...")
                }).catch((err)=>{
                    console.log(new Date()+" : Error while saving" + err)
                })
            })
            .catch(err=>{
                console.log(new Date()+" : Error while fetching" + err)
            })
    });

    backgroundController.getTodayImage = function(){
        return new Promise((resolve, reject) => {
            bg_model.findOne({created_at: moment().format("DD-MM-YYYY")})
                .then(data=>{
                    let img="";
                    let photographer="";
                    let photographer_url="";
                    if(data===null) {
                        img = "https://images.pexels.com/photos/2168974/pexels-photo-2168974.jpeg";
                        photographer = "Mohamed Almari";
                        photographer_url = "https://www.pexels.com/@maoriginalphotography";
                    }else{
                        let photos = data.photos;
                        let rand = Math.floor(Math.random() * photos.length-1);
                        img = photos[rand].src.landscape;
                        photographer_url = photos[rand].photographer_url;
                        photographer = photos[rand].photographer;
                    }
                    resolve({status:202,src:img,photographer:photographer,photographer_url:photographer_url})
                }).catch(err=>{
                    reject({status:500,message:err})
            })
        })
    }
};
module.exports = backgroundController;