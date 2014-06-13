var app = angular.module('app', ['ngRoute', 'mgcrea.ngStrap.popover'])
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

  $http.get('/api/user').success(function (data) {
    user.resolve(data);
  });

  var codes = $q.defer();

  $http.get('/api/codes').success(function (data) {
    codes.resolve(data);
  });

  return {
    user: user.promise,
    codes: codes.promise
  };

}]);

// This controller helps users search through all of the current gate codes.
app.controller('SearchCtrl', ['$scope', '$routeParams', 'Data',

function ($scope, $routeParams, Data) {

  $scope.match = {}; // setup the default match object
  $scope.results = []; // results based on match object

  $scope.message = "hello";

  Data.codes.then(function (codes) {
    $scope.data = codes;
    $scope.results = codes;
  });

  $scope.hello = {
    keys: [
      { field: 'id', css: { 'width': '40px' } },
      { field: 'location' },
      { field: 'address' },
      { field: 'district' },
      { field: 'forty' },
      { field: 'code' }
    ]
  };

  // watch gets triggered anytime the match object changes; 
  // the user changes their search paramaeters.
  $scope.$watch('match', function () {
    // makes it easier to deal with when empty string option is set.
    for (var key in $scope.match) {
      if ($scope.match[key] == "") delete $scope.match[key];
    }
    // try to filter out the result based on match object
    var results = _.filter($scope.data, function (item) {
      var res = false; // assume current option doesn't match
      for (var key in $scope.match) {
        // to lower case to ignore case
        _.each($scope.match[key].toLowerCase().split(' '), function (keyword) {
          if (String(item[key]).toLowerCase().indexOf(keyword) != -1) {
            res = true;
          }
        });
      }
      return res; // return result
    });
    // if no match is found, display all results
    $scope.results = (results.length > 0) ? results : $scope.data;
  }, true);

  // quickly clear the search form
  $scope.clear = function () { $scope.match = {}; };
  // check if search is empty or has been reset
  $scope.isEmpty = function () {
    return Object.keys($scope.match).length == 0;
  };


} ]);

// Awesome directive to paginate an array.
app.directive('ngPaginate', function () {
  return {
    transclude: true,
    restrict: 'AE',
    scope: {
      variable: '='
    },
    link: function ($scope, $el, $attrs, ctrl, $transclude) {
      // html code that is nested in the directive will have the scope
      // of the directive. consult: 
      // http://stackoverflow.com/questions/20878830/angularjs-isolated-scope-for-directives-without-own-template
      // for description as to why this works exactly
      $transclude($scope, function(clone) {
        $el.append(clone);
      });
    },
    controller: ['$scope', function ($scope) {

      var calculateVariables = function () {
        if ($scope.variable && $scope.variable.length > 0) {
          var items = $scope.items = $scope.variable.length;
        } else {
          var items = $scope.items = 0;
        }

        // pagination variables (should be accessible in nested html)
        var currentPage = $scope.currentPage = 1;
        var itemsPerPage = $scope.itemsPerPage = 50;

        $scope.maxPages = Math.ceil(items/itemsPerPage);
      };

      $scope.$watch('variable', function () {
        calculateVariables();
        if (!!$scope.variable) {
          $scope.data = $scope.variable.slice( ($scope.currentPage - 1) * $scope.itemsPerPage, $scope.itemsPerPage);
        }
      } , true);

      $scope.$watch('currentPage', function () {
        if (!!$scope.variable) {
          $scope.data = $scope.variable.slice( ($scope.currentPage - 1) * $scope.itemsPerPage, $scope.itemsPerPage);
        }
      });

      // move through the pages, if you reach either end, you will loop
      // around to begging/end

      // go 1 page forward, (wrap around if last page)
      $scope.next = function () {
        $scope.currentPage = ($scope.currentPage % $scope.maxPages) + 1;
      };

      // go 1 page back (wrap around if first page)
      $scope.prev = function () {
        $scope.currentPage = ($scope.currentPage > 1)?
          $scope.currentPage - 1 :  // aren't on the first page
            $scope.maxPages;        // go to last page
      };

      // go to first page
      $scope.first = function () { $scope.currentPage = 1; };

      // go to last page
      $scope.last = function () { $scope.currentPage = $scope.maxPages; };

    }]
  };
});
