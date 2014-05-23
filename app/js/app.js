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
        'code',
        'ras'
    ];

    $scope.$watch('match', function () {
        // makes it easier to deal with when empt string option is set.
        for (var key in $scope.match) {
            if ($scope.match[key] == "") delete $scope.match[key];
        }
        var fields = $scope.basic_search_fields;
        var results = _.filter($scope.data, function (item) {
            var res = false;
            for (var key in $scope.match) {
                if (String(item[key]).toLowerCase()
                        .indexOf($scope.match[key].toLowerCase()) != -1) {
                    res = true;
                }
            }
            return res;
        });
        $scope.results = (results.length > 0)? results : $scope.data;
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
