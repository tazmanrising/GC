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
