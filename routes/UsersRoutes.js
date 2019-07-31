var express = require('express');
var router = express.Router();
var UserController = require('../controllers/UsersController');

/* GET users listing. */
router.get('/',function(req, res) {
  res.send('respond with a resource');
});
router.post('/',function (req,res) {
  UserController.create(req.body)
      .then(data=>{
        res.status(data.status).send({user:data.user,message:data.message,error:data.error})
      })
      .catch(err=>{
          res.status(err.status).send({user:err.user,message:err.message,error:err.error})
      })
});
router.get('/validator/email/:email',(req,res)=>{
    UserController.emailValidator(req.params.email.toLowerCase())
        .then(data=>{
            res.status(data.status).send({message:data.message,valid:data.valid})
        }).catch(err=>{
        res.status(err.status).send({message:err.message,valid:err.valid})
    })
});
router.get('/validator/username/:username',(req,res)=>{
    UserController.usernameValidator(req.params.username.toLowerCase())
        .then(data=>{
            res.status(data.status).send({message:data.message,valid:data.valid})
        }).catch(err=>{
        res.status(err.status).send({message:err.message,valid:err.valid})
    })
});
router.patch('/resend/:_id',(req,res)=>{
    UserController.resendCode(req.params._id)
        .then(data=>{
            res.status(data.status).send({message:data.message})
        })
        .catch(err=>{
            res.status(err.status).send({error:err.error})
        })
});
router.put('/code/:id',(req,res)=>{
    UserController.validateCode(req.params.id,req.body.code)
        .then(data=>{
            res.status(data.status).send({user:data.user,message:data.message})
        })
        .catch(err=>{
            res.status(err.status).send({error:err.error})
        })
});
router.post('/login',(req, res)=>{
   UserController.login(req.body)
       .then(data=>{
           res.status(data.status).send({token:data.token,activated:data.activated})
       })
       .catch(err=>{
           res.status(err.status).send({error:err.error})
       })
});
router.put('/resetpassword/:email',(req,res)=>{
    UserController.forgottenPassword(req.params.email)
        .then(data=>{
            res.status(data.status).send({message:data.message})
        })
        .catch(err=>{
            res.status(err.status).send({error:err.error})
        })
});
router.get('/resetpassword/:hash/:shortID',(req,res)=>{
    UserController.validateResetPassword(req.params.hash,req.params.shortID)
        .then(data=>{
            res.status(data.status).send({id:data.id});
        })
        .catch(err=>{
            res.status(err.status).send({error:err.error})
        })
});
router.put('/password/:id',(req,res)=>{
    UserController.changePassword(req.params.id,req.body.password)
        .then(data=>{
            res.status(data.status).send();
        })
        .catch(err=>{
            res.status(err.status).send({error:err.error})
        })
});
router.put('/:id',(req,res)=>{
    UserController.updateProfile(req.params.id,req.headers.authorization,req.body)
        .then(data=>{
            res.status(data.status).send();
        })
        .catch(err=>{
            res.status(err.status).send({error:err.error})
        })
});
router.post('/auth/facebook',(req,res)=>{
    UserController.facebook(req.body)
        .then(data=>{
            res.status(data.status).send({token:data.token});
        })
        .catch(err=>{
            res.status(err.status).send({error:err.error})
        })
});

module.exports = router;