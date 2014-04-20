var mainCtrl = function($scope, $http) {
  var ls = localStorage;

  var syncFromLocalStorage = function() {
    var tasks = JSON.parse(ls.getItem("items"));
    $scope.tasks = tasks;
  };

  var syncToLocalStorage = function() {
    ls.setItem("items", JSON.stringify($scope.tasks));
  };

  $scope.tasks = [];
  if(ls.getItem("items") == null) ls.setItem("items", JSON.stringify([]));
  syncFromLocalStorage();

  $scope.addNew = function() {
    var newTask = {
      "body":$scope.newTaskBody,
      "done":false,
      "startTime":undefined,
      "endTime":undefined,
      "clockStatus":"",
      "elapsed":0
    };
    $scope.tasks.push(newTask);
    syncToLocalStorage();
    $scope.newTaskBody = "";
  };

  $scope.startClock = function(index) {
    $scope.tasks[index].startTime = Date.now();
    $scope.tasks[index].clockStatus = "計測中...";
    syncToLocalStorage();
  };

  $scope.endClock = function(index) {
    var task = $scope.tasks[index];
    task.endTime = Date.now();
    if(task.elapsed == undefined) task.elapsed = 0;
    task.elapsed += (task.endTime - task.startTime) / 1000 / 60;
    task.clockStatus = "";
    syncToLocalStorage();
  };

  $scope.doneTask = function(index) {
    var task = $scope.tasks[index];
    task.done = !task.done; // TODO: checkedを見たほうがいい
    if(task.done == true) {
        task.clockStatus = "終了";
        task.endTime = Date.now();
    } else {
        task.clockStatus = "";
    }
    syncToLocalStorage();
  };

  $scope.deleteTask = function(index) {
    if(confirm("削除しますか？")) {
      $scope.tasks.splice(index,1);
      syncToLocalStorage();
    }
  };

  $scope.getDoneCount = function() {
    var count = 0;
    angular.forEach($scope.tasks, function(task) {
      count += task.done ? 1 : 0;
    });
    return count;
  };

  $scope.deleteDone = function() {
    if(confirm("終了済みのタスクを削除しますか？")) {
      var oldTasks = $scope.tasks;
      $scope.tasks = [];
      angular.forEach(oldTasks, function(task) {
        if (!task.done) $scope.tasks.push(task);
      });
      syncToLocalStorage();
    };
  };

  $scope.getDoneTasks = function() {
    var doneTasks = [];
    angular.forEach($scope.tasks, function(task) {
      if (task.done) doneTasks.push(task);
    });
    return doneTasks;
  };

  $scope.doneDate = function(doneTask) {
    if (doneTask.endTime == undefined) return "";
    var doneDate = new Date(doneTask.endTime);
    return doneDate.getFullYear() + "/" + (doneDate.getMonth() + 1) + "/" + doneDate.getDate();
  };

  $scope.exportCSV = function() {
    var doneTasks = $scope.getDoneTasks();
    var csv = "date,body,elapsed(min)\n";

    angular.forEach(doneTasks, function(task) {
      csv = csv + $scope.doneDate(task) + ',"' + task.body + '",' + task.elapsed + "\n";
    });
    return csv;
  };
};
