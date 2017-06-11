const helper = require("../helpers/tasks.js");

exports.tasks = {
  createNewTasks: (req, res, isSeed) => {
    helper.addTask(req.body, req.params.phase_id, result => {
      if (typeof isSeed === "function") {
        res.status(200).send(result);
        res.end();
      } else {
        console.log("seed task added");
        res.end();
      }
    });
  },

  retrieveTasksByPhaseId: (req, res) => {
    let taskData = { user_info: [] };
    helper.retrieveTasksByPhaseId(req.params, tasks => {
      taskData.task_info = tasks;
      for (let i = 0; i < tasks.length; i++) {
        helper.retrieveTaskUser(tasks[i].id, users => {
          if (users.length !== 0) {
            taskData.user_info[i] = users;
          }
        });
      }
      res.send(taskData);
    });
  },

  // retrieveTasksByPhaseId: (req, res) => {
  //   let taskData = {};
  //   helper.retrieveTasksByPhaseId(req.params, (taskObj) => {
  //     return new Promise ((resolve, reject) => {
  //       taskData.task_info = taskObj;
  //       for(let i = 0; i < taskObj.length; i++) {
  //         console.log(taskObj[i], i, 'should be each');
  //       taskData.task_info.taskObj[i].userProfiles = [];
  //         helper.retrieveTaskUser(taskObj[i].id, (users) => {
  //           if(users[0].dataValues.length !== 0) {
  //             for(let key in users) {
  //               helper.retrieveUser(users[key].dataValues.user_id, (userProfile) => {
  //                 taskObj[i].userProfiles.push(userProfile);
  //               })
  //             }
  //           }
  //         })
  //       }
  //       resolve(taskObj);
  //     }).then((taskObj) => {
  //       //taskData.task_info = taskObj;
  //     }).then((taskData) => {
  //       res.send(taskData);
  //     })
  //   })
  // },

  updateTasks: (req, res, isSeed) => {
    let updatedTask = {
      user_info: []
    };
    if (req.body.user_id) {
      helper.addUserTasks(
        req.body.user_id,
        req.body.stage,
        req.params.task_id,
        addedUser => {
          helper.retrieveTaskUser(req.params.task_id, users => {
            for (var i = 0; i < users.length; i++) {
              updatedTask.user_info.push(users[i].dataValues.user_id);
            }
            helper.retrieveTaskByTaskId(req.params.task_id, task => {
              updatedTask.task_info = task;
              if (typeof isSeed === "function") {
                res.status(200).send(updatedTask);
              } else {
                console.log("seed user added");
              }
            });
          });
        }
      );
    } else {
      helper.updateTask(req.params.task_id, req.body.taskChanges, task => {
        if (typeof isSeed === "function") {
          res.status(200).send(task);
        } else {
          console.log("seed task updated");
        }
      });
    }
  },

  deleteTasks: (req, res) => {
    helper.deleteTask(req.params.task_id, message => {
      res.status(200).send(message);
    });
  },

  retrieveUserTasks: (req, res) => {
    helper.retrieveTasksByUserId(req.params.user_id, results => {
      this.extractTasks(results, tasks => {
        res.send(tasks);
      });
    });
  }
};

exports.extractTasks = (user_tasks, callback) => {
  Promise.all(
    user_tasks.map(user_task => {
      return new Promise((resolve, reject) => {
        helper.retrieveTaskByTaskId(user_task.task_id, task => {
          resolve(task);
        });
      });
    })
  ).then(results => {
    let tasksArr = [];
    results.forEach(result => {
      tasksArr.push(result);
    });
    callback(tasksArr);
  });
};
