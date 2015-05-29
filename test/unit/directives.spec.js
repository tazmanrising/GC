// test suite for pagination directive
describe('ngPaginate directive', function() {
  
  var $el, $scope;

  // load the modules we want to test
  beforeEach(module('app'));

  beforeEach(inject(function($rootScope) {
    $scope = $rootScope.$new();
    $scope.array = [];
    for (var i = 0; i < 10000; i++) {
      $scope.array.push({
        index: i,
        value: i+1,
        random: Math.ceil(Math.random()*100)
      });
    }
  }));

  // function to compile a fresh directive with the given template, or a
  // default one
  function compileDirective (template) {

    // setup default template
    if (!template) template = '<div ng-paginate="page in array" ></div>';

    // inject allows you to use AngularJS dependency injection
    // to retrieve and use other services
    inject(function($compile) {
      $el = $compile(template)($scope);
    });

    // $digest is necessary to finalize the directive generation
    // just put it here and let angular do its thing
    $scope.$digest();
  }

  it('should be equal', function () {
    expect(1).toBe(1);
  });



});

