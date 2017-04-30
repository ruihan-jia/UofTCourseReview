

angular.module('utcrApp')

    .controller('HomeController', ['$scope', 'Courses', '$location', function ($scope, Courses, $location) {
        //$scope.editing = [];
        //$scope.courses = Courses.query();
        $scope.search = function(){
          $location.url('/course/' + $scope.courseID);
        }
    }])
    

    .controller('CourseController', ['$scope', '$routeParams', 'Courses', 'Reviews', '$location', function ($scope, $routeParams, Courses, Reviews, $location) {

	//initial setup
        $scope.courseID = $routeParams.id;

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

	$scope.years = [2017, 2016, 2015];

	//get reviews from server
        Reviews.get({cid: $routeParams.id }, function(data) {
          console.log(data);
	  console.log(data.CourseInfo);
	  var jsonres = data;
          $scope.courseResponse = jsonres.CourseInfo;
          $scope.reviewResponse = jsonres.CourseReviews;
 
        });

	//----------
	//functions:
	//----------
	$scope.writeReview = function() {
	  $scope.ReviewModal = true;
	}

	$scope.closeModal = function() {
	  $scope.ReviewModal = false;
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
	    review.$save().then(function(res) {console.log(res)});
	    $scope.ReviewModal = false;
	  }
	  else
	    console.log("please select all options");
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



