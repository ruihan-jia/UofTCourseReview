var express = require('express');
var router = express.Router();

var Course = require('../models/CourseModel.js');
var Review = require('../models/ReviewModel.js');

/* GET /todos listing. */
router.get('/course', function(req, res, next) {
  if(!req.query.cid){
    Course.find(function (err, courses) {
      if (err) return next(err);
    
      res.json(courses);
    });
  }else {
    console.log("api received " + req.query.cid);
    var querycid = req.query.cid.toUpperCase();
    console.log("query cid: " + querycid);
    Course.findOne({cid:querycid}, function (err, post) {
      if (err) return next(err);
      res.json(post);
    });

  }
});

/* POST /todos */
router.post('/course', function(req, res, next) {
  Course.create(req.body, function (err, post) {
    if (err) return next(err);
    res.json(post);
  });
});



/* GET /todos listing. */
router.get('/review', function(req, res, next) {
  if(!req.query.cid){
    Review.find(function (err, courses) {
      if (err) return next(err);
    
      res.json(courses);
    });
  }else {
    var querycid = req.query.cid.toUpperCase();
    console.log("retrieve reviews of " + querycid);

    var response = {};
    var course = 'CourseInfo';
    var review = 'CourseReviews';
    response[course] = [];
    response[review] = [];

    var courseInfo;

    Course.findOne({cid:querycid}, function (err, post) {
      if (err) return next(err);
      console.log(post);
      //console.log(JSON.stringify(post));
      console.log(post.toJSON());
      //console.log(post.toObject());
      response['CourseInfo'].push(post);
    });


    Review.find({cid:querycid}, function (err, post) {
      if (err) return next(err);
      //response[review].push(JSON.stringify(post));
    });

    console.log(response);

    res.json(response);
  }
});



/* POST /reviews */
router.post('/review', function(req, res, next) {
  var cid = req.body.cid.toUpperCase();
  var year = req.body.year;
  var hard = req.body.hard;
  var useful = req.body.useful;
  var interest = req.body.interest;
  var comment = req.body.comment;
  var ip = req.ip;
  var query = "cid: '" + cid + "', year: '" + year + "', hard: '" + hard + "', useful: '" + useful + "', interest: '" + interest + "', comment: '" + comment + "', user_ip: '" + ip + "'";


  if(!cid || !year || !hard || !useful || !interest || !comment || !ip){
    console.log("invalid request");
    res.json("invalid request");
  } else {
    console.log(query);
    Review.create({cid: cid, year: year, hard: hard, useful: useful, interest: interest, comment: comment, user_ip: ip}, function (err, post) {
      if (err) {
        console.log(err);
        return next(err);
      }
      console.log("test");
      res.json(post);
    });

  }

/*
  Review.create(req.body, function (err, post) {
    if (err) return next(err);
    res.json(post);
  });
*/
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
