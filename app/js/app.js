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

    $scope.basic_search_fields = [
        'id',
        'location',
        'address',
        'district',
        'code'
    ];

    $scope.$watch('match', function () {
        // makes it easier to deal with when empt string option is set.
        for (var key in $scope.match) {
            if ($scope.match[key] == "") delete $scope.match[key];
        }
        //console.log($scope.match);
    }, true)

    // quickly clear the search form
    $scope.clear = function () { $scope.match = {}; };
    // check if search is empty or has been reset
    $scope.isEmpty = function () {
        return Object.keys($scope.match).length == 0;
    };

} ]);
