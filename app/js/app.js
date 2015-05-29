var app = angular.module('app', ['ngRoute'])
.config(['$routeProvider',
  function ($routeProvider) {
    $routeProvider
      .when('/', {
        templateUrl: 'partials/search.html'
      })
      .otherwise({ redirectTo: '/' });
  }]);

app.service('Data', ['$http', '$q',
function ($http, $q) {

  
  var user = $q.defer(); 

  $http.get('api/user').success(function (data) {
    user.resolve(data);
  });

  var codes = $q.defer();

  $http.get('api/codes').success(function (data) {
    codes.resolve(data);
  });

  return {
    user: user.promise,
    codes: codes.promise
  };
  

}]);

// This controller will manage the navbar
// - display current user
// - highlight current route
app.controller('NavCtrl', ['$location', 'Data', '$scope',

function ($location, Data, $scope) {

  Data.user.then(function (user) {
    $scope.user = user;
  });

}]);

// This controller helps users search through all of the current gate codes.
app.controller('SearchCtrl', ['$scope', '$routeParams', 'Data',

function ($scope, $routeParams, Data) {

  $scope.data = [];
  $scope.match = []; // setup the default match object
  $scope.results = $scope.data;

  // update local references when data become available
  Data.codes.then(function (codes) {
    $scope.data = codes;
    $scope.results = codes;
    $scope.resultsUpdated();
  });

  $scope.searchFields = [
    'id',
    'location',
    'address',
    'district',
    'forty',
    'incode',
    'ras'
  ];

  // watch gets triggered anytime the match object changes; 
  // the user changes their search paramaeters.
  $scope.$watch('match', function () {

    // try to filter out the result based on match object
    var rank = _.chain($scope.data)
    .map(function (element) {
      var res = 0; // assume current option doesn't match
      for (var i = 0; i < $scope.match.length; i++) {
        var obj = $scope.match[i];
        var value = String(element[obj.key]);
        if (value == String(obj.value)) {
          res++;
        }
      }
      return res; // return result
    })
    .filter(function (element) { return element > 0; })
    .value();
    console.log(rank);
    //$scope.results = results;
    $scope.resultsUpdated(); // let pagination directive know about changes
  }, true);

}]);
