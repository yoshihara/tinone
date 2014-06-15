var tinoneApp = angular.module('tinoneApp', ['ui.sortable']);

tinoneApp.factory('Task', function () {
  function Task(params) {
    $.extend(this, params);
  }

  Task.prototype = {
    body: '',
    done: false,
    startTime: undefined,
    endTime: undefined,
    clockStatus: "",
    elapsed: 0
  };

  Task.prototype.isMeasuring = function() {
    // TODO: できれば日本語文字列ではなく、doingのように英単語にしたい（その英単語を見て表示する文字列を変える）そしてタスクの背景に色をつけて計測中かどうかを判断できたらベスト
    return this.clockStatus == "計測中...";
  };

  return Task;
});

tinoneApp.factory('taskStorage', function(Task){
  var storage = localStorage;
  var tasks = [];
  if(!storage.getItem("items")) {
    storage.setItem("items", JSON.stringify([]));
  } else {
    var allParams = JSON.parse(storage.getItem("items"));
    tasks = allParams.map(function(params) {
      if(params.position == undefined) params.position = 0;
      return new Task(params);
    });
  }

  tasks = tasks.sort(function(t1, t2) {
    return t1.position - t2.position;
  });

  return {
    tasks: tasks.sort(),
    sync: function(scope) {
      tasks = scope.tasks;
      storage.setItem("items", JSON.stringify(tasks));
    }
  };
});


tinoneApp.controller('mainCtrl', function ($scope, taskStorage, Task) {
  $scope.tasks = taskStorage.tasks;

  $scope.sortableOptions = {
    start: function(e, ui){
      ui.item.startPos = ui.item.index();
      ui.item.task = $scope.tasks[ui.item.index()];
    },
    stop: function(e, ui) {
      var fromIndex = ui.item.startPos;
      var toIndex = ui.item.sortable.dropindex;
      var task = ui.item.task;

      if(toIndex == undefined) {
        ui.item.sortable.cancel();
        return;
      }
      task.position = toIndex;

      var start;
      var end;
      var direction;

      if(fromIndex < toIndex){
        start = fromIndex;
        end = toIndex;
        direction = -1;
      }
      else {
        start = toIndex + 1;
        end = fromIndex + 1;
        direction = 1;
      }
      angular.forEach($scope.tasks.slice(start, end),
                      function(task, i){
                        task.position = task.position + direction;
                      });
      taskStorage.sync($scope);
    }
  };

  $scope.addNew = function() {
    var newTask = new Task({ body: $scope.newTaskBody, position: $scope.tasks.length });
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
    if(task.isMeasuring()) this.endClock(index);
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
    }
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
