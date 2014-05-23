var app = angular.module('app', ['ngRoute'])
.config(['$routeProvider',
    function ($routeProvider) {
        $routeProvider
            .when('/', {
                templateUrl: 'partials/search.html'
            })
            .otherwise({ redirectTo: '/' });
    }]);


// This controller helps users search through all of the current gate codes.
    app.controller('SearchController', ['$http', '$scope', '$routeParams',

function ($http, $scope, $routeParams) {

    $scope.match = {}; // setup the default match object
    $scope.results = []; // results based on match object

    // pagination varaibles
    $scope.page = 0;
    $scope.count = 10;

    $http.get('/api/codes')
        .success(function (data) {
            $scope.data = data;
            $scope.results = data;
        });

    $scope.basic_search_fields = [
        'id',
        'location',
        'address',
        'district',
        'code'
    ];

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

    // move through the pages
    $scope.next = function () { $scope.page++; };
    $scope.prev = function () { $scope.page--; };

} ]);
