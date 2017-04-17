var express = require('express');
var router = express.Router();

var Course = require('../models/CourseModel.js');

/* GET /todos listing. */
router.get('/', function(req, res, next) {
  if(!req.query.cid){
    Course.find(function (err, courses) {
      if (err) return next(err);
    
      res.json(courses);
    });
  }else {
    console.log("api received " + req.query.cid);
    Course.findOne({cid:req.query.cid}, function (err, post) {
      if (err) return next(err);
      res.json(post);
  });

  }
});

/* POST /todos */
router.post('/', function(req, res, next) {
  Course.create(req.body, function (err, post) {
    if (err) return next(err);
    res.json(post);
  });
});

/* GET /todos/id */
/*
router.get('/:id', function(req, res, next) {
  Course.findOne({cid:req.params.id}, function (err, post) {
    if (err) return next(err);
    console.log("api received" + req.params.id);
    res.json(post);
  });
});
*/

module.exports = router;
