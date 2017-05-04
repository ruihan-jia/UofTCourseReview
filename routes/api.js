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

    //find the course from cid
    Course.findOne({cid:querycid}, function (err, post) {
      if (err) {
	console.log("failed " + err);
	return next(err);
      }

      if(!post) {
	console.log("no match");

      }

      console.log(post);
      //console.log(JSON.stringify(post));
      //console.log(post.toJSON());
      //console.log(post.toObject());
      response[course] = post;

      //find the list of reviews of that course
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
    res.json({status:2, errmsg: "missing parameters"});
  } else {
    
    //check if parameters are valid
    if(hard > 5 || hard < 1 || useful > 5 || useful < 1 || interest > 5 || interest < 1 || year < 2000) {
      console.log("invalid request: invalid parameters");
      res.json({status:1, errmsg: "invalid parameters"});
    } else {

      //check if the course exists in database
      //no need to check cobalt
      Course.findOne({cid:cid}, function (err, post) {
        if (err) {
	  console.log("invalid request: course not found");
          res.json({status:4, errmsg: "course not found"});
          return next(err);
	}

	//if found, create the review
        Review.create({cid: cid, year: year, hard: hard, useful: useful, interest: interest, prof: prof, comment: comment, user_ip: ip}, function (err, post) {
          if (err) {
            console.log(err);
            res.json({status:3, errmsg: err});
            return next(err);
          }
          console.log("saved to database");
          res.json({status:0, errmsg: ""});

	  //at the same time, start calculating the overall result for course
	  Review.aggregate(
	    [
              {$match: {cid: cid}},
	      {$group: 
	        {
		  _id: null, 
		  averageHard: {$avg: '$hard'},
		  averageUseful: {$avg: '$useful'},
		  averageInterest: {$avg: '$interest'}
	        }
	      }
	    ],
	    function(err, results) {
	      if(err) {
	        console.log(err);
	      }
	      console.log(results);
	      console.log(results[0].averageHard);
	      console.log(results[0].averageUseful);
	      console.log(results[0].averageInterest);

	      Course.findOneAndUpdate({cid:cid}, {hard:results[0].averageHard, useful:results[0].averageUseful, interest:results[0].averageInterest}, function(err, result) {
	        if(err) console.log(err);
	
	        console.log(result);

	      });
	    }
	  );
        });
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
