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
    /*
    Review.find(function (err, courses) {
      if (err) return next(err);
    
      res.json(courses);
    });
    */
  }else {
    var querycid = req.query.cid.toUpperCase();
    console.log("retrieve reviews of " + querycid);

    var response = {};
    var course = 'CourseInfo';
    var review = 'CourseReviews';

    var courseInfo;

    Course.findOne({cid:querycid}, function (err, post) {
      if (err) return next(err);
      console.log(post);
      //console.log(JSON.stringify(post));
      //console.log(post.toJSON());
      //console.log(post.toObject());
      response[course] = post;

      Review.find({cid:querycid}, function (err, post2) {
        if (err) return next(err);
        console.log(response)
        response[review] = post2;

        console.log(response);
	res.send(response);
      });
    });
  }
});



/* POST /reviews */
router.post('/review', function(req, res, next) {
  var cid = req.body.cid.toUpperCase();
  var year = req.body.year;
  var hard = req.body.hard;
  var useful = req.body.useful;
  var interest = req.body.interest;
  var prof = req.body.prof;
  if (!prof)
    prof = "";
  var comment = req.body.comment;
  if(!comment)
    comment = "";
  var ip = req.ip;
  var query = "cid: '" + cid + "', year: '" + year + "', hard: '" + hard + "', useful: '" + useful + "', interest: '" + interest + "', comment: '" + comment + "', prof: '" + prof + "', user_ip: '" + ip + "'";

  console.log(query);

  //check if all parameters are present
  if(!cid || !year || !hard || !useful || !interest || !comment || !ip){
    console.log("invalid request: missing parameters");
    res.json("invalid request: missing parameters");
  } else {
    
    //check if parameters are valid
    if(hard > 5 || hard < 1 || useful > 5 || useful < 1 || interest > 5 || interest < 1 || year < 2000) {
      console.log("invalid request: invalid parameters");
      res.json("invalid request: invalid parameters");
    } else {

      Review.create({cid: cid, year: year, hard: hard, useful: useful, interest: interest, prof: prof, comment: comment, user_ip: ip}, function (err, post) {
        if (err) {
          console.log(err);
          return next(err);
        }
        console.log("saved to database");
        res.json(post);
      });
    }
  }
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
