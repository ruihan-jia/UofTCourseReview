

angular.module('utcrApp')

    .controller('HomeController', ['$scope', 'Courses', '$location', function ($scope, Courses, $location) {
        //$scope.editing = [];
        //$scope.courses = Courses.query();
        $scope.search = function(){
          $location.url('/course/' + $scope.courseID);
        }
    }])
    

    .controller('CourseController', ['$scope', '$routeParams', 'Courses', 'Reviews', '$location', function ($scope, $routeParams, Courses, Reviews, $location) {

        $scope.courseID = $routeParams.id;

        Reviews.get({cid: $routeParams.id }, function(data) {
          console.log(data);
	  console.log(data.CourseInfo);
	  var jsonres = data;
          $scope.courseResponse = jsonres.CourseInfo;
          $scope.reviewResponse = jsonres.CourseReviews;
 
        });

        $scope.rating = 0;
    	$scope.ratings = [
	  {
	    namef: 'easy',
	    namel: 'hard',
            current: 1,
            max: 5
    	  }, 
	  {
	    namef: 'useless',
	    namel: 'useful',
            current: 1,
            max: 5
    	  },
	  {
	    namef: 'boring',
	    namel: 'interesting',
	    current: 1,
	    max: 5
	  }
	];

    	$scope.getSelectedRating = function (rating) {
          console.log(rating);
    	}

    }])

//star rating taken from: http://stackoverflow.com/questions/23646395/rendering-a-star-rating-system-using-angularjs

    .directive('starRating', function () {
    return {
        restrict: 'A',
        template: '<ul class="rating">' +
            '<li ng-repeat="star in stars" ng-class="star" ng-click="toggle($index)">' +
            '\u2605' +
            '</li>' +
            '</ul>',
        scope: {
            ratingValue: '=',
            max: '=',
            onRatingSelected: '&'
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



