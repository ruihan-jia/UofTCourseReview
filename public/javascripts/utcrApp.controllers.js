

angular.module('utcrApp')

  .controller('HomeController', ['$scope', 'Courses', '$location', 'AutoComp', function ($scope, Courses, $location, AutoComp) {
    //$scope.editing = [];
    //$scope.courses = Courses.query();
    $scope.search = function(){
      //console.log($scope.searchText);
      if($scope.searchText != '')
        $location.url('/course/' + $scope.searchText);
      else
	console.log("search string empty");
    }
    $scope.autoCompOnSelect = function(){
      setTimeout(function () {
      console.log("route");
        $location.url('/course/' + $scope.searchText);
        $scope.$apply();
      }, 100);
    }

    $scope.query = function(searchText){
      //get autocomplete results from server
      return AutoComp.query({term: searchText }).$promise;
/*
          return AutoComp.query({term: searchText }, function(data) {
            console.log(data);
	    return data;
          });
*/
    }
  }])


  .controller('CourseController', ['$scope', '$routeParams', 'Courses', 'Reviews', '$cookies', '$location', '$mdDialog', 'AutoComp', '$window', function ($scope, $routeParams, Courses, Reviews, $cookies, $location, $mdDialog, AutoComp, $window) {

    //initial setup
    $scope.CID = $routeParams.id;
    $scope.courseID = angular.copy($scope.CID);
    $scope.loading = true;
    $scope.reviewFormActive = false;
    $scope.formInfo = {};
    $scope.submitLoading = false;
    $scope.written = true;

    $scope.rating = 0;
    $scope.ratings = [
	  {
	    namef: 'easy',
	    namel: 'difficult',
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

    $scope.years = [2017, 2016, 2015, 2014, 2013, 2012, 2011, 2010, 2009, 2008, 2007];



    var defaultAlert = $mdDialog.alert({
        title: 'Attention',
        textContent: 'This is an example of how easy dialogs can be!',
        ok: 'Close'
    });
    var alertInfo = defaultAlert;

    $scope.showAlert = function(){
      $mdDialog
        .show( alertInfo )
        .finally(function() {
          alertInfo = defaultAlert;
	  console.log("alert closed");
        });
    }

    $scope.showSuccess = function(){
      $mdDialog
        .show( alertInfo )
        .finally(function() {
          alertInfo = defaultAlert;
	  console.log("success");
	  $window.location.reload();
        });
    }



    $scope.showDialogWriteReview = function($event) {
      console.log("write review pressed");

      $scope.reviewFormActive = !$scope.reviewFormActive;

/*
      //old write review no longer used
      var parentEl = angular.element(document.body);
      $mdDialog.show({
        parent: parentEl,
        targetEvent: $event,
        templateUrl:'dialog.template.html',
        scope:$scope,
	preserveScope: true,
      });
*/
    }

    $scope.closeForm = function() {
      console.log("write review closed");
      $scope.reviewFormActive = false;
    }







	//get reviews from server
        Reviews.get({cid: $routeParams.id }, function(data) {
          console.log(data);
	  $scope.loading=false;
	  //console.log(data.CourseRating);
	  if(data.CourseInfo) {
	    console.log("course info exists");
	    var jsonres = data;
            $scope.courseInfoRes = jsonres.CourseInfo;
            $scope.courseRatingRes = jsonres.CourseRating;
	    if(jsonres.CourseRating == null || jsonres.CourseRating.hard == 0) {
	      $scope.ratingExist = false;
	      $scope.courseRatingRes.hard = "n/a";
	      $scope.courseRatingRes.useful = "n/a";
	      $scope.courseRatingRes.interest = "n/a";
	    } else
	      $scope.ratingExist = true;
            $scope.reviewResponse = jsonres.CourseReviews;
	    if(Object.keys(jsonres.CourseReviews).length){
	      $scope.reviewExist = true;
/*
	      $scope.reviewResponse.forEach(function(obj) {
		obj.comment = obj.comment.replace(/(\r\n|\n|\r)/gm, "<br />");
		console.log(obj.comment);
	      });
*/
	    } else
	      $scope.reviewExist = false;
	    $scope.courseExist = true;


	  }else {
	    console.log("course does not exist");
	    $scope.courseExist = false;
	  }

        });

	//cookies
	var cookieName = 'written' + $scope.courseID;
	var writtenCookie = $cookies.get(cookieName);
	console.log(writtenCookie);
	if(!writtenCookie) {
	  $scope.written = true;
	  //$scope.written = false;
	}
	else {
	  $scope.written = false;
	}
	console.log($scope.written);


	//----------
	//functions:
	//----------

        $scope.autoCompOnSelect = function(){
	  setTimeout(function () {
	    console.log("route");
            $location.url('/course/' + $scope.searchText);
	    $scope.$apply();
	  }, 100);
        }

        $scope.searchCourse = function(){
	  if($scope.searchText != '')
            $location.url('/course/' + $scope.searchText);
	  else
	    console.log("search string empty");
        }

    $scope.query = function(searchText){
      //get autocomplete results from server
      return AutoComp.query({term: searchText }).$promise;
    }


	$scope.submitReview = function() {
	  console.log($scope);
	  console.log($scope.ratings[0].current);
	  console.log($scope.ratings[1].current);
	  console.log($scope.ratings[2].current);
	  console.log($scope.formInfo.selectedYear);
	  console.log($scope.formInfo.prof);
	  console.log($scope.formInfo.reviewComment);

	  var review = new Reviews();
	  review.cid = $scope.courseID;
	  review.hard = $scope.ratings[0].current;
	  review.useful = $scope.ratings[1].current;
	  review.interest = $scope.ratings[2].current;
	  review.year = $scope.formInfo.selectedYear;
	  review.prof = $scope.formInfo.prof;
	  review.comment = $scope.formInfo.reviewComment;
	  console.log(review);

	  $scope.submitLoading = true;
	  if(review.hard != -1 && review.useful != -1 && review.interest != -1 && !angular.isUndefined($scope.formInfo.selectedYear) && review.prof != null && review.comment != null){
	    review.$save().then(
	      function(res) {
		console.log(res)
		$scope.submitLoading = false;
		if(res.status == 0) {
		  $cookies.put(cookieName, 1);
		  $scope.written = true;
		  alertInfo = $mdDialog.alert({
	            title: 'Submission Success',
        	    textContent: 'Review submitted. Thank you!',
	            ok: 'Close'
        	  });
		  $scope.showSuccess();

		} else {
		  alertInfo = $mdDialog.alert({
	            title: 'Submission failed',
        	    textContent: res.errmsg,
	            ok: 'Close'
        	  });
		  $scope.showAlert();
		}
	      }
	    );
	    $scope.ReviewModal = false;
            $mdDialog.hide();
	  }
	  else {
	    $scope.submitLoading = false;
	    $scope.MsgTitle = "Failed";
	    $scope.MsgBody = "Please select all options";

	    console.log("please select all options");

            $mdDialog.hide();
	    alertInfo = $mdDialog.alert({
              title: 'Submission failed',
              textContent: 'Please select all options',
              ok: 'Close'
            });
	    $scope.showAlert();

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
//	templateUrl:'../test.html',


	template:
'<ul class="rating"> <div class="ratingNameDiv"> {{namel}}:  </div>  <div class="ratingStarDiv">  <li ng-repeat="star in stars" ng-class="star" ng-click="toggle($index)"> \u2605  </li>  </div></ul>',


/*
        template: '<ul class="rating">' + '{{namel}}: ' +
            '<li ng-repeat="star in stars" ng-class="star" ng-click="toggle($index)">' +
            '\u2605' +
//            '</li>' + '{{namel}}' +
            '</li>' +
            '</ul>',
*/
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



