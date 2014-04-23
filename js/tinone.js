function Task(body) {
  this.body = body;
  this.done = false;
  this.startTime = undefined;
  this.endTime = undefined;
  this.clockStatus = "";
  this.elapsed = 0;
}

function taskStorage() {
}

taskStorage.initialize = function(scope) {
  this.storage = localStorage;
  this.tasks = [];
  if(!this.storage.getItem("items")) {
    this.storage.setItem("items", JSON.stringify([]));
  } else {
    var tasks = JSON.parse(this.storage.getItem("items"));
    this.tasks = tasks;
  }
  return this.tasks;
};

taskStorage.sync = function(scope) {
  this.tasks = scope.tasks;
  this.storage.setItem("items", JSON.stringify(this.tasks));
};

var tinoneApp = angular.module('tinoneApp', []);
tinoneApp.controller('mainCtrl', function ($scope) {
  $scope.tasks = taskStorage.initialize($scope);

  $scope.addNew = function() {
    var newTask = new Task($scope.newTaskBody);
    $scope.tasks.push(newTask);
    taskStorage.sync($scope);
    $scope.newTaskBody = "";
  };

  $scope.startClock = function(index) {
    $scope.tasks[index].startTime = Date.now();
    $scope.tasks[index].clockStatus = "計測中...";
    taskStorage.sync($scope);
  };

  $scope.endClock = function(index) {
    var task = $scope.tasks[index];
    task.endTime = Date.now();
    if(task.elapsed == undefined) task.elapsed = 0;
    task.elapsed += (task.endTime - task.startTime) / 1000 / 60;
    task.clockStatus = "";
    taskStorage.sync($scope);
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
    taskStorage.sync($scope);
  };

  $scope.deleteTask = function(index) {
    if(confirm("削除しますか？")) {
      $scope.tasks.splice(index,1);
      taskStorage.sync($scope);
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
      taskStorage.sync($scope);
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
});
