document.addEventListener("DOMContentLoaded", function () {
  const scheduleForm = document.querySelector("#schedule-form");
  const taskNameInput = document.querySelector("#task-name");
  const taskDateInput = document.querySelector("#task-date");
  const taskTimeInput = document.querySelector("#task-time");
  const calendar = document.querySelector("#calendar");
  const bell = document.querySelector("#bell");
  const notificationCount = document.querySelector("#notification-count");

  //Array to store tasks
  let tasks = JSON.parse(localStorage.getItem("tasks")) || []; //Load from local storage or initialize as empty

  //save tasks to localStorage
  function saveToLocalStorage() {
    localStorage.setItem("tasks", JSON.stringify(tasks));
  }

  //Display tasks on the calendar

  function renderCalendar(filteredTasks = tasks) {
    calendar.innerHTML = ""; //Clear existing tasks

    filteredTasks.forEach((task, index) => {
      const taskElem = document.createElement("div");
      taskElem.className = "task";
      taskElem.textContent = `${task.name} - ${task.date} at ${task.time}`;

      //Add on Edit button
      const editButton = document.createElement("button");
      editButton.textContent = "Edit";
      // editButton.className = "edit-button";
      editButton.addEventListener("click", () => editTask(index));
      taskElem.appendChild(editButton);

      //Add a delete button
      const deleteButton = document.createElement("button");
      deleteButton.textContent = "Delete";
      deleteButton.className = "delete-button";
      deleteButton.addEventListener("click", () => deleteTask(index));
      taskElem.appendChild(deleteButton);

      //Append the task element to the calendar
      calendar.appendChild(taskElem);
    });
  }

  //Request Notification permission when the page loads
  if ("Notification" in window && Notification.permission !== "granted") {
    Notification.requestPermission();
  }

  //Function to set a remainder for a task

  function setTaskReminder(task) {
    const taskDateTime = new Date(`${task.date}T${task.time}`); //combine date and time
    const now = new Date();
    const timeUntilTask = taskDateTime - now;
    if (timeUntilTask > 0) {
      setTimeout(() => {
        showReminder(task.name); //Show reminder notification
        incrementNotificationCount(); //increment notification count
      }, timeUntilTask);
    }
  }
  // setTaskReminder()

  //Show task reminder
  function showReminder(taskName) {
    if (Notification.permission === "granted") {
      new Notification("Task Reminder", {
        body: `Remainder: ITs time for "${taskName}"!`,
      });
    } else {
      alert(`Remainder:It's time for "${taskName}"!`);
    }
  }

  //Increment the notification count
  function incrementNotificationCount() {
    const currentCount = parseInt(notificationCount.textContent) || 0;
    notificationCount.textContent = currentCount + 1;
    notificationCount.style.display = "block";
    bell.classList.add("notify");

    //Show the notification only if permissions are granted
    if (Notification.permission === "granted") {
      new Notification("New Task Reminder", {
        body: `You have a new task reminder!`,
      });
    }
  }
  //Clear notification on bell click
  bell.addEventListener("click", () => {
    console.log("Bell clicked");
    notificationCount.textContent = "0"; //Reset count to 0
    notificationCount.style.display = "none"; //Hide the count
    bell.classList.remove("notify"); //Remove notification highlight

    //Optionally can add another notification here
    // if (Notification.permission === "granted") {
    //   new Notification("You cleared you notifications");
    // }
  });

  //Add a task
  scheduleForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const taskName = taskNameInput.value.trim(); //Get task name
    const taskDate = taskDateInput.value; //Get task date
    const taskTime = taskTimeInput.value; //get task time

    if (!taskName || !taskDate || !taskTime) {
      alert("please fill in all fields!"); //Alert if any field is
      return;
    }
    const newTask = {
      name: taskName,
      date: taskDate,
      time: taskTime,
    };
    tasks.push(newTask); //Add task to the tasks array
    saveToLocalStorage(); //save task to local storage
    setTaskReminder(newTask); //Set reminder for the task
    renderCalendar(); //re-render calendar with updated tasks

    scheduleForm.reset(); //clear form
  });

  //Edit a task
  function editTask(index) {
    const task = tasks[index];
    const taskElem = calendar.children[index]; //Get the task element

    //clear the current task content
    taskElem.innerHTML = "";

    //create input fields for task details
    const nameInput = document.createElement("input");
    nameInput.type = "text";
    nameInput.value = task.name;

    const dateInput = document.createElement("input");
    dateInput.type = "date";
    dateInput.value = task.date;

    const timeInput = document.createElement("input");
    timeInput.type = "time";
    timeInput.value = task.time;

    //Create save button
    const saveButton = document.createElement("button");
    saveButton.textContent = "Save";
    saveButton.className = "save-button";
    saveButton.addEventListener("click", () => {
      //Validate input values
      if (!nameInput.value.trim() || !dateInput.value || !timeInput.value) {
        alert("please fill in the fields!");
        return;
      }
      const updatedTaskDateTime = new Date(
        `${dateInput.value}T${timeInput.value}`
      );
      if (updatedTaskDateTime < new Date()) {
        alert("Task date and time must be in the future!");
        return;
      }

      //Update task with new values
      task.name = nameInput.value.trim();
      task.date = dateInput.value;
      task.time = timeInput.value;

      saveToLocalStorage();
      renderCalendar();
    });

    //create cancel button
    const cancelButton = document.createElement("button");
    cancelButton.textContent = "cancel";
    cancelButton.className = "cancel-button";
    cancelButton.addEventListener("click", () => {
      renderCalendar();
    });

    //Append inputs and buttons to the task element
    taskElem.appendChild(nameInput);
    taskElem.appendChild(dateInput);
    taskElem.appendChild(timeInput);
    taskElem.appendChild(saveButton);
    taskElem.appendChild(cancelButton);
  }

  //Delete a task
  function deleteTask(index) {
    tasks.splice(index, 1); //Remove the task from the array
    saveToLocalStorage();
    renderCalendar();
  }

  //Filter task by view

  function filterTasks(view) {
    const today = new Date();
    const filterTasks = tasks.filter((task) => {
      const taskDate = new Date(task.date);
      if (view === "daily") {
        return taskDate.toDateString() === today.toDateString();
      } else if (view === "weekly") {
        const oneWeekFromNow = new Date();
        oneWeekFromNow.setDate(today.getDate() + 7);
        return taskDate >= today && taskDate <= oneWeekFromNow;
      } else if (view === "monthly") {
        return taskDate.getMonth() === today.getMonth();
      }
      return true;
    });
    renderCalendar(filterTasks);
  }

  document
    .querySelector("#daily-view")
    .addEventListener("click", () => filterTasks("daily"));
  document
    .querySelector("#weekly-view")
    .addEventListener("click", () => filterTasks("weekly"));
  document
    .querySelector("#monthly-view")
    .addEventListener("click", () => filterTasks("monthly"));

  //Initial render
  renderCalendar();
});
