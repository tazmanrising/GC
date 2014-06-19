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
    'index',
    'location',
    'address',
    'district',
    'forty',
    'code'
  ];

  // watch gets triggered anytime the match object changes; 
  // the user changes their search paramaeters.
  $scope.$watch('match', function () {

    // try to filter out the result based on match object
    var results = _.filter($scope.data, function (element) {
      var res = false; // assume current option doesn't match
      for (var i = 0; i < $scope.match.length; i++) {
        var obj = $scope.match[i];
        if (_.indexOf(String(element[obj.key]), obj.value) > -1 || !obj.value) {
          res = true;
        }
          res = true;
      }
      return res; // return result
    });
    $scope.results = results;
    $scope.resultsUpdated(); // let pagination directive know about changes
  }, true);

}]);

// directive for building search queries with predefined parameters
// input:
//  params - array that represents search parameters; the will show up
//  in the dropdown to associate with each search term. the default is
//  blank.
//  ex: ['id', 'param1', ...]
// output:
//  search - array that represenets the search from the user.
//  ex: [{key: id, value: "0"}, {key: param1, value: hello}, ...]
app.directive('searchBuilder', function () {
  return {
    scope: {
      params: '=',  
      search: '=' 
    },  
    templateUrl: 'partials/searchBuilder.html',
    restrict: 'EA',
    link: function (scope, el, attrs) {

      // by default there is a single search item which is empty.
      scope.search = [{}];

      // add parameter to the search
      scope.add = function () {
        scope.search.push({});
      }   

      // remove a parameter from the search
      scope.remove = function (i) {
        scope.search.splice(i,1);
      }   
    }   
  };  
})  


// Awesome directive to paginate an array.
app.directive('ngPaginate', function () {
  return {
    transclude: true,
    restrict: 'AE',
    scope: true,
    link: function ($scope, $el, $attrs, ctrl, $transclude) {

      // html code that is nested in the directive will have the scope
      // of the directive. consult: 
      // http://stackoverflow.com/questions/20878830/angularjs-isolated-scope-for-directives-without-own-template
      // for description as to why this works exactly
      $transclude($scope, function(clone) { $el.append(clone); });

      // array of attributes delimited by white space passed to 
      // ngPaginate.
      // format: page in pages
      var attrs = $attrs.ngPaginate.match(/(.*) in (.*)/);
      var update = $attrs.update;

      if (!!update) {
        $scope.$parent[update] = function () { setup(); };
      }

      // setup scope variables
      var pageName = $scope.pageName = attrs[1];
      var arrayName = $scope.arrayName = attrs[2];
      var itemsPerPage = $scope.itemsPerPage = 25;

      var slice = function () {
        if (!!$scope.$parent[$scope.arrayName]) {
          var currentIndex = $scope.currentIndex = ($scope.currentPage - 1)*$scope.itemsPerPage;
          var nextIndex = currentIndex + Number($scope.itemsPerPage);
          $scope[pageName] = $scope.$parent[$scope.arrayName].slice(currentIndex, nextIndex);
        }
      };

      var setup = function () {

        var currentPage = $scope.currentPage = 1;

        if ($scope[arrayName].length && $scope[arrayName].length > 0) {
          var items = $scope.items = $scope[arrayName].length;
        } else {
          var items = $scope.items = 0;
        }

        $scope.maxPages = Math.ceil($scope.items/$scope.itemsPerPage);

        slice();
      };

      // update view when array changes
      //$scope.$parent.$watch(arrayName, function () { setup(); } , true);

      // update view when pagination variables change
      $scope.$watch('currentPage', function () { slice(); });
      $scope.$watch('itemsPerPage', function () { setup(); });


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

      $scope.goto = function (page) { $scope.currentPage = page; };

    }
  };
});
