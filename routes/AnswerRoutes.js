const controller = require('../controllers/AnswerController');
var express = require('express');
var router = express.Router();

router.post('/:qid',(req,res)=>{
    controller.add(req.headers.authorization,req.params.qid,req.body.answer,req.body.anonymous)
        .then(data=>{
            res.status(data.status).send({answer:data.answer})
        })
        .catch(err=>{
            res.status(err.status).send({error:err.error})
        })
});
router.get('/qid/:qid',(req,res)=>{
    controller.getByQID(req.params.qid)
        .then(data=>{
            res.status(data.status).send({answers:data.answers})
        })
        .catch(err=>{
            res.status(err.status).send({error:err.error})
        })
});
router.get('/updated/:qid',(req,res)=>{
    controller.getByQIDUpdated(req.params.qid)
        .then(data=>{
            res.status(data.status).send({answers:data.answers})
        })
        .catch(err=>{
            res.status(err.status).send({error:err.error})
        })
});

router.patch('/comment/:id',(req,res)=>{
    controller.addComment(req.headers.authorization,req.params.id,req.body.comment,req.body.anonymous)
        .then(data=>{
            res.status(data.status).send({answer:data.answer})
        })
        .catch(err=>{
            res.status(err.status).send({error:err.error})
        })
});

router.patch('/downvote/:id',(req,res)=>{
    controller.downVote(req.headers.authorization,req.params.id)
        .then(data=>{
            res.status(data.status).send({vote:data.vote})
        })
        .catch(err=>{
            res.status(err.status).send({error:err.error})
        })
});

router.patch('/upvote/:id',(req,res)=>{
    controller.upVote(req.headers.authorization,req.params.id)
        .then(data=>{
            res.status(data.status).send({vote:data.vote})
        })
        .catch(err=>{
            res.status(err.status).send({error:err.error})
        })
});
router.put('/:id',(req,res)=>{
    controller.updateAnswer(req.headers.authorization,req.params.id,req.body)
        .then(data=>{
            res.status(data.status).send({answer:data.answer})
        })
        .catch(err=>{
            res.status(err.status).send({error:err.error})
        })
});
router.delete('/:id',(req,res)=>{
    controller.delete(req.headers.authorization,req.params.id)
        .then(data=>{
            res.status(data.status).send()
        })
        .catch(err=>{
            res.status(err.status).send({error:err.error})
        })
});
router.put('/best/:id',(req,res)=>{
    controller.acceptAnswer(req.headers.authorization,req.params.id)
        .then(data=>{
            res.status(data.status).send()
        })
        .catch(err=>{
            res.status(err.status).send({error:err.error})
        })
});
router.get('/user/:id',(req,res)=>{
    controller.getAnswerByUserID(req.params.id)
        .then(data=>{
            res.status(data.status).send({answers:data.answers})
        })
        .catch(err=>{
            res.status(err.status).send({error:err.error})
        })
});

router.get('/bestanswer/user/:id',(req,res)=>{
    controller.getBestAnswerByUserID(req.params.id)
        .then(data=>{
            res.status(data.status).send({answers:data.answers})
        })
        .catch(err=>{
            res.status(err.status).send({error:err.error})
        })
});


module.exports = router;