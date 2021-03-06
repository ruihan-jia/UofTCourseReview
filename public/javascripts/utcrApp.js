

angular.module('utcrApp', ['ngMaterial', 'ngRoute', 'ngResource', 'ngCookies', 'ngAnimate'])
    //---------------
    // Services
    //---------------
    .factory('Courses', ['$resource', function($resource){
      return $resource('/api/course');
    }])

    .factory('Reviews', ['$resource', function($resource){
      return $resource('/api/review');
    }])

    .factory('AutoComp', ['$resource', function($resource){
      return $resource('/api/autocomplete');
    }])

    //---------------
    // Routes
    //---------------
    .config(['$routeProvider', '$mdThemingProvider', function ($routeProvider, $mdThemingProvider) {
      $routeProvider
        .when('/', {
          templateUrl: 'home-page.template.html',
          controller: 'HomeController'
        })
        .when('/course/:id', {
          templateUrl: 'course-page.template.html',
          controller: 'CourseController'
       });
      $mdThemingProvider.theme('default')
        .primaryPalette('blue')
        .accentPalette('pink');
    }]);

