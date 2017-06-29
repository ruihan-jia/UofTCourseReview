var express = require('express');
var router = express.Router();

var Course = require('../models/CourseModel.js');
var Review = require('../models/ReviewModel.js');
var CourseInfo = require('../models/CourseInfoModel.js');
var ReviewLog = require('../models/ReviewLogModel.js');

/* GET course information. not needed*/
router.get('/course', function(req, res, next) {
  if(!req.query.cid){
    res.json({status:2, errmsg: "missing parameters"});
/*
    Course.find(function (err, courses) {
      if (err) return next(err);
      res.json(courses);
    });
*/
  }else {
    console.log("API: course query " + req.query.cid);
    var querycid = req.query.cid.toUpperCase();
    console.log("query cid: " + querycid);
    Course.findOne({cid:querycid}, function (err, post) {
      if (err) return next(err);
      res.json(post);
    });

  }
});

/* POST course info. not needed */
/*
router.post('/course', function(req, res, next) {
  Course.create(req.body, function (err, post) {
    if (err) return next(err);
    res.json(post);
  });
});
*/


/* GET autocomplete info */
router.get('/autocomplete', function(req, res, next) {
  if(!req.query.term){
    res.json({status:2, errmsg: "missing parameters"});
  }else {
    console.log("API: autocomplete query " + req.query.term);
    var queryTerm = req.query.term;
    var queryTermUpp = queryTerm.toUpperCase();
    console.log("query term: " + queryTerm);

    //find code similar to query term, then group by same code and chose first name
    CourseInfo.aggregate(
      [
        {$match: {code: new RegExp('^' + queryTermUpp)}},
        {$group:
          {
	    _id: "$code",
	    name: {$first: "$name"}
          }
        },
	{$sort: {"_id":1}},
	{$limit:10}
      ],
      function(err, results) {
        if(err) {
          console.log(err);
        }
        console.log(results);

	if (!results.length) {
	  console.log("no course code");

	  //if no course code, look for names
	  CourseInfo.aggregate(
	    [
              {$match: {name: new RegExp(queryTerm, "i")}},
              {$group:
		{
		  _id: "$code",
		  name: {$first: "$name"}
              	}
              },
	      {$sort: {"_id":1}},
	      {$limit:10}

	    ],
	    function(err, results) {
	      if(err){
		console.log(err);
	      }

	      console.log(results);
	      res.json(results);

	    }
	  );

	} else
	  res.json(results);

      }
    );


/*
    CourseInfo.find({code: new RegExp('^' + queryTerm)}).distinct('code').exec(function(err,post) {
      if (err) return next(err);
      console.log("query found: " + post);
      res.json(post);
    });
*/
  }
});



/* GET list of reviews for specific course */
router.get('/review', function(req, res, next) {
  if(!req.query.cid){
    res.json({status:2, errmsg: "missing parameters"});
  }else {

    var querycid = req.query.cid.toUpperCase();
    console.log("API: review query " + querycid);
    console.log("req: " + req.hostname);

    var courseInfo;

    var response = {};
    var param1 = 'CourseInfo';
    var param2 = 'CourseRating';
    var param3 = 'CourseReviews';


    //find the course in course info code. has to be exact match
    //CourseInfo.find({id: new RegExp('^' + querycid)}).sort({year:-1}).exec(function (err, post) {
    CourseInfo.find({code:querycid}, "-_id").sort({year:-1}).exec(function (err, post) {
      if(err) return next(err);
      if(!post.length) {
	console.log("course not found");
        res.json({status:4, errmsg: "course not found"});
	return next(err);
      }

      console.log("course info found");
      console.log(post);

      response[param1] = post[0];


      //find the course in course rating
      Course.findOne({cid:querycid}, '-_id -updated_at', function (err, post) {
        if (err) {
  	  //console.log("failed " + err);
  	  return next(err);
        }

        if(!post) {
	  console.log("no match");
	  post = {cid:querycid, hard: 0, useful: 0, interest: 0};
	  //need to create new rating course

          Course.create({cid: querycid, hard: 0, useful: 0, interest: 0}, function (err, post) {
            if (err) {
              console.log(err);
            }
            console.log("saved to database");
	  })

        }

        console.log(post);
        //console.log(JSON.stringify(post));
        //console.log(post.toJSON());
        //console.log(post.toObject());
        response[param2] = post;

        //find the list of reviews of that course
        Review.find({cid:querycid}, "-_id -user_ip", function (err, post2) {
          if (err) return next(err);
          response[param3] = post2;

          console.log(response);
	  res.send(response);
        });
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
  var subFailed = true;
  console.log(query);

  //check if all parameters are present
  if(!cid || !year || !hard || !useful || !interest || !comment || !ip){
    console.log("invalid request: missing parameters");
    res.json({status:2, errmsg: "Missing Parameters"});
    logReview(cid, ip, 2, "Missing Parameters", null);
  } else {

    //check if parameters are valid
    if(hard > 5 || hard < 1 || useful > 5 || useful < 1 || interest > 5 || interest < 1 || year < 2000) {
      console.log("invalid request: invalid parameters");
      res.json({status:1, errmsg: "Invalid Parameters"});
      logReview(cid, ip, 1, "Invalid Parameters", null);
    } else {

      //check if the course exists in database
      Course.findOne({cid:cid}, function (err, post) {
        if (err) {
	  console.log("invalid request: course not found");
          res.json({status:4, errmsg: "Course Not Found"});
          logReview(cid, ip, 4, "Course Not Found", null);
          return next(err);
	}

	//check if ip exists
	Review.findOne({cid: cid, user_ip: ip}, function (err, post) {
	  if(post){
	    console.log("invalid request: ip already exists");
            res.json({status:5, errmsg: "Review has already been submitted"});
            logReview(cid, ip, 5, "IP already exist", null);
	  } else {

	    //if found, create the review
            Review.create({cid: cid, year: year, hard: hard, useful: useful, interest: interest, prof: prof, comment: comment, user_ip: ip}, function (err, post) {
              if (err) {
                console.log(err);
            	res.json({status:3, errmsg: err});
            	  return next(err);
              }

              console.log("saved to database");
              res.json({status:0, errmsg: ""});
              logReview(cid, ip, 0, "", post._id);

	      //after created review, calculate the overall result for course
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
	  }
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

function logReview (cid, user_ip, status, errmsg, review_id) {
  ReviewLog.create({cid: cid, user_ip: user_ip, status: status, errmsg: errmsg, review_id: review_id}, function (err, post) {
    if (err) {
      console.log(err);
      return next(err);
    }
  });
}


module.exports = router;
