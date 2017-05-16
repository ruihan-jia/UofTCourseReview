

angular.module('utcrApp')

    .controller('HomeController', ['$scope', 'Courses', '$location', function ($scope, Courses, $location) {
        //$scope.editing = [];
        //$scope.courses = Courses.query();
        $scope.search = function(){
          $location.url('/course/' + $scope.courseID);
        }
    }])
    

    .controller('CourseController', ['$scope', '$routeParams', 'Courses', 'Reviews', '$cookies', '$location', '$mdDialog', function ($scope, $routeParams, Courses, Reviews, $cookies, $location, $mdDialog) {



	//initial setup
        $scope.CID = $routeParams.id;
        $scope.courseID = angular.copy($scope.CID)

        $scope.rating = 0;
    	$scope.ratings = [
	  {
	    namef: 'easy',
	    namel: 'hard',
            current: -1,
            max: 5
    	  }, 
	  {
	    namef: 'useless',
	    namel: 'useful',
            current: -1,
            max: 5
    	  },
	  {
	    namef: 'boring',
	    namel: 'interesting',
	    current: -1,
	    max: 5
	  }
	];

	$scope.ReviewModal = false;
	$scope.MsgModal = false;

	$scope.years = [2017, 2016, 2015];



      var alert1;

//    $scope.showAlert = showAlert;
/*
// Internal method
    $scope.showAlert = function(){
      alert1 = $mdDialog.alert({
        title: 'Attention',
        textContent: 'This is an example of how easy dialogs can be!',
        ok: 'Close'
      });

      $mdDialog
        .show( alert1 )
        .finally(function() {
          alert1 = undefined;
        });
    }
*/
    $scope.items = [1, 2, 3];
    $scope.test = "test";

    $scope.showDialog = function($event) {
       var parentEl = angular.element(document.body);
       $mdDialog.show({
         parent: parentEl,
         targetEvent: $event,
         templateUrl:'dialog.template.html',
/*
         template:
           '<md-dialog aria-label="List dialog">' +
           '  <md-dialog-content>'+
           '    <md-list>'+
           '      <md-list-item ng-repeat="item in items">'+
           '       <p>Number {{courseID}}</p>' +
           '      '+
           '    </md-list-item></md-list>'+
           '  </md-dialog-content>' +
           '  <md-dialog-actions>' +
           '    <md-button ng-click="closeDialog()" class="md-primary">' +
           '      Close Dialog' +
           '    </md-button>' +
           '  </md-dialog-actions>' +
           '</md-dialog>',
*/
         locals: {
           courseID: $scope.courseID,
	   ratings: $scope.ratings,
	   years: $scope.years
         },
         controller: DialogController
      });
      function DialogController($scope, $mdDialog, courseID, ratings, years) {
        $scope.courseID = courseID;
        $scope.ratings = ratings;
        $scope.years = years;
        $scope.closeDialog = function() {
          $mdDialog.hide();
        }
      }
    }







	//get reviews from server
        Reviews.get({cid: $routeParams.id }, function(data) {
          console.log(data);
	  console.log(data.CourseRating);
	  var jsonres = data;
          $scope.courseInfoRes = jsonres.CourseInfo;
          $scope.courseRatingRes = jsonres.CourseRating;
          $scope.reviewResponse = jsonres.CourseReviews;
 
        });

	var cookieName = 'written' + $scope.courseID;
	var writtenCookie = $cookies.get(cookieName);
	console.log(writtenCookie);
	if(writtenCookie == false) {
	  $scope.written = true;
	  $scope.written = false;
	}
	else {
	  $scope.written = false;
	}


	//----------
	//functions:
	//----------
	$scope.writeReview = function() {
	  $scope.ReviewModal = true;
	}

	$scope.closeModal = function() {
	  $scope.ReviewModal = false;
	}

	$scope.closeMsgModal = function() {
	  $scope.MsgModal = false;
	}


        $scope.searchCourse = function(){
          $location.url('/course/' + $scope.courseID);
        }

	$scope.submitReview = function() {
	  console.log($scope.ratings[0].current);
	  console.log($scope.ratings[1].current);
	  console.log($scope.ratings[2].current);
	  console.log($scope.selectedYear);
	  console.log($scope.prof);
	  console.log($scope.reviewComment);

	  var review = new Reviews();
	  review.cid = $scope.courseID;
	  review.year = $scope.selectedYear;
	  review.hard = $scope.ratings[0].current;
	  review.useful = $scope.ratings[1].current;
	  review.interest = $scope.ratings[2].current;
	  review.prof = $scope.prof;
	  review.comment = $scope.reviewComment;
	  console.log(review);
	
	  if(review.hard != -1 && review.useful != -1 && review.interest != -1 && !angular.isUndefined($scope.selectedYear)){
	    review.$save().then(
	      function(res) {
		console.log(res)
		if(res.status == 0) {
		  $cookies.put(cookieName, 1);
		  $scope.written = true;
		  $scope.MsgTitle = "Success";
		  $scope.MsgBody = "Review submitted. Thank you!";
		  $scope.MsgModal = true;
		} else {
		  $scope.MsgTitle = "Failed";
		  $scope.MsgBody = "Review was not submitted. " + res.errmsg;
		  $scope.MsgModal = true;
		}
	      }
	    );
	    $scope.ReviewModal = false;
	  }
	  else {
	    $scope.MsgTitle = "Failed";
	    $scope.MsgBody = "Please select all options";
	    $scope.MsgModal = true;

	    console.log("please select all options");
	  }
	}

    	$scope.getSelectedRating = function (rating) {
          console.log(rating);
    	}

    }])

//star rating taken from: http://stackoverflow.com/questions/23646395/rendering-a-star-rating-system-using-angularjs

    .directive('starRating', function () {
    return {
        restrict: 'A',
        template: '<ul class="rating">' + '{{namef}}' +
            '<li ng-repeat="star in stars" ng-class="star" ng-click="toggle($index)">' +
            '\u2605' +
            '</li>' + '{{namel}}' +
            '</ul>',
        scope: {
            ratingValue: '=',
            max: '=',
            onRatingSelected: '&',
	    namef: '=',
	    namel: '='
        },
        link: function (scope, elem, attrs) {
            var updateStars = function () {
                scope.stars = [];
                for (var i = 0; i < scope.max; i++) {
                    scope.stars.push({
                        filled: i < scope.ratingValue
                    });
                }
            };
            scope.toggle = function (index) {
                scope.ratingValue = index + 1;
                scope.onRatingSelected({
                    rating: index + 1
                });
            };
            scope.$watch('ratingValue', function (oldVal, newVal) {
                if (newVal) {
                    updateStars();
                }
            });
        }
      }
    });



