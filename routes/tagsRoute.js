const controller = require('../controllers/tagsController');
var express = require('express');
var router = express.Router();

router.post('/',(req,res)=>{
    controller.add(req.body,req.headers.authorization)
        .then(data=>{
            res.status(data.status).send({tag:data.tag})
        })
        .catch(err=>{
            res.status(err.status).send({error:err.error})
        })
});
router.get('/',(req,res)=>{
    controller.getAll()
        .then(data=>{
            res.status(data.status).send({tags:data.tags})
        })
        .catch(err=>{
            res.status(err.status).send({error:err.error})
        })
});

module.exports = router;