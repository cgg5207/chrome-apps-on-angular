angular.module('myApp', ['ngRoute'])
.provider('Weather', function() {
  var apiKey = "";
 
  this.getUrl = function(location) {
    return "http://api.map.baidu.com/telematics/v3/weather?output=json&"+
           "location="+location+"&"+"ak="+this.apiKey;
  };
 
  this.setApiKey = function(key) {
    if (key) this.apiKey = key;
  };
 
  this.$get = function($q, $http) {
    var self = this;
    return {
      getWeatherForecast: function(city) {
        var d = $q.defer();
        $http({
          method: 'GET',
          url: self.getUrl(city),
          cache: true
        }).success(function(data) {
          d.resolve(data.results);
        }).error(function(err) {
          d.reject(err);
        });
        return d.promise;
      },
      getCityDetails: function(query) {
        var d = $q.defer();
        $http({
          method: 'GET',
          url: "https://autocomplete.wunderground.com/aq?query=" +
                query
        }).success(function(data) {
          d.resolve(data.RESULTS);
        }).error(function(err) {
          d.reject(err);
        });
        return d.promise;
      }
    }
  }
})
.factory('UserService', function() {
  var defaults = {
    location: '上海'
  };
 
  var service = {
    user: {},
    save: function() {
      sessionStorage.presently =
        angular.toJson(service.user);
    },
    restore: function() {
      service.user = 
        angular.fromJson(sessionStorage.presently) || defaults
 
      return service.user;
    }
  };
  service.restore();
  return service;
})
.config(function(WeatherProvider) {
  WeatherProvider.setApiKey('xO5bpyIU3qIfAx2zLQIq5Fdf');
})
.config(['$routeProvider', function($routeProvider) {
  $routeProvider
    .when('/', {
      templateUrl: 'templates/home.html', 
      controller: 'MainCtrl'
    })
    .when('/settings', {
      templateUrl: 'templates/settings.html',
      controller: 'SettingsCtrl'
    })
    .otherwise({redirectTo: '/'});
}])
.controller('MainCtrl', 
  function($scope, $timeout, Weather, UserService) {
    $scope.date = {};
 
    var updateTime = function() {
      $scope.date.tz = new Date(new Date()
        .toLocaleString("en-US", {timeZone: $scope.user.timezone}));
      $timeout(updateTime, 1000);
    }
 
    $scope.weather = {}
    $scope.user = UserService.user;
    Weather.getWeatherForecast($scope.user.location)
    .then(function(data) {
      $scope.weather.forecast = data;
    });
    updateTime();
})
.controller('SettingsCtrl', 
  function($scope, $location, Weather, UserService) {
    $scope.user = UserService.user;
 
    $scope.save = function() {
      UserService.save();
      $location.path('/');
    }
    $scope.fetchCities = Weather.getCityDetails;
});