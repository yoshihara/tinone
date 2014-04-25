describe("Task", function() {
  var Task;
  beforeEach(module('tinoneApp'));
  beforeEach(inject(function(_Task_){
    Task = _Task_;
  }));

  it("should be defined", function () {
    expect(Task).toBeDefined();
  });
});

describe("taskStorage", function() {
  var taskStorage;
  beforeEach(module('tinoneApp'));
  beforeEach(inject(function(_taskStorage_){
    taskStorage = _taskStorage_;
  }));

  it("should be defined", function () {
    expect(taskStorage).toBeDefined();
  });

  describe("initialize", function() {
    it("should set [] to tasks", function() {
      expect(taskStorage.tasks.length).toBe(0);
    });
  });
});

describe('mainCtrl', function(){
  beforeEach(module('tinoneApp'));
  it('should have empty tasks', inject(function($controller) {
    var scope = {};
    $controller('mainCtrl', {$scope: scope});
    expect(scope.tasks.length).toBe(0);
  }));
});
