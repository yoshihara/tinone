describe("Task", function() {
  it("should be defined", function () {
    expect(Task).toBeDefined();
  });
});

describe("taskStorage", function() {
  it("should be defined", function () {
    expect(taskStorage).toBeDefined();
  });

  describe("initialize", function() {
    beforeEach(function() {
      var scope = [];
      taskStorage.initialize(scope);
    });

    it("should set [] to tasks", function() {
      expect(taskStorage.tasks.length).toBe(0);
    });
  });
});

describe('PhoneListCtrl', function(){
  beforeEach(module('tinoneApp'));
  it('should create "phones" model with 3 phones', inject(function($controller) {
    var scope = {},
        ctrl = $controller('mainCtrl', {$scope:scope});
    expect(scope.tasks.length).toBe(0);
  }));
});
