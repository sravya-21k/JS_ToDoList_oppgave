const scheduleForm = document.querySelector("#schedule-form");
const taskNameInput = document.querySelector("#task-name");
const taskDateInput = document.querySelector("#task-date");
const taskTimeInput = document.querySelector("#task-time");
// const recurrenceInput = document.querySelector("#recurrence");
const calendar = document.querySelector("#calendar");

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
    deleteButton.textContent = "delete";
    // deleteButton.className = "delete-button";
    deleteButton.addEventListener("click", () => deleteTask(index));
    taskElem.appendChild(deleteButton);

    //Append the task element to the calendar
    calendar.appendChild(taskElem);
  });
}

//Add a task
scheduleForm.addEventListener("submit", (e) => {
  e.preventDefault();
  const taskName = taskNameInput.value.trim();
  const taskDate = taskDateInput.value;
  const taskTime = taskTimeInput.value;

  if (!taskName || !taskDate || !taskTime) {
    alert("please fill in all fields!");
    return;
  }
  const newTask = {
    name: taskName,
    date: taskDate,
    time: taskTime,
  };
  tasks.push(newTask);
  saveToLocalStorage();
  renderCalendar();

  scheduleForm.reset(); //clear form
});

//Edit a task
function editTask(index) {
  const task = tasks[index];
  const newName = prompt("Edit task name:", task.name);
  if (newName) {
    task.name = newName;
    saveToLocalStorage();
    renderCalendar();
  }
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
