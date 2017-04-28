

angular.module('utcrApp', ['ngRoute', 'ngResource'])
    //---------------
    // Services
    //---------------
    .factory('Courses', ['$resource', function($resource){
      return $resource('/api/course');
    }])

    .factory('Reviews', ['$resource', function($resource){
      return $resource('/api/review');
    }])

    

    //---------------
    // Routes
    //---------------
    .config(['$routeProvider', function ($routeProvider) {
      $routeProvider
        .when('/', {
          templateUrl: 'home-page.template.html',
          controller: 'HomeController'
        })
        .when('/course/:id', {
          templateUrl: 'course-page.template.html',
          controller: 'CourseController'
       });
    }]);
