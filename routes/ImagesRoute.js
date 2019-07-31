const controller = require('../controllers/backgroundController');
var express = require('express');
var router = express.Router();

router.get('/today/random',(req,res)=>{
    controller.getTodayImage()
        .then(data=>{
            res.status(data.status).send({src:data.src,photographer_url:data.photographer_url,photographer:data.photographer})
        })
        .catch(err=>{
            res.status(err.status).send({message:err.message
            })
        })
});
module.exports = router;