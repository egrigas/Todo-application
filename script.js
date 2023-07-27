class Todo {
  constructor(description, deadline) {
    this.id = new Date().getTime();
    this.description = description;
    this.deadline = deadline;
    this.completed = false;
  }
}

const todoForm = document.querySelector('#todoForm');
todoForm.addEventListener('submit', (e) => {
  e.preventDefault();
  const description = document.querySelector('#description').value.trim();
  const deadline = document.querySelector('#deadline').value;
  const newTodo = new Todo(description, deadline);
  saveTask(newTodo);
  todoForm.reset();
});

function saveTask(task) {
  let tasks = getTasksFromStorage();
  tasks.push(task);
  sessionStorage.setItem('tasks', JSON.stringify(tasks));
  loadTasks();
}

function getTasksFromStorage() {
  let tasks = sessionStorage.getItem('tasks');
  if (tasks === null) {
    tasks = [];
  } else {
    tasks = JSON.parse(tasks);
  }
  return tasks;
}

function deleteTask(taskId) {
  let tasks = getTasksFromStorage();
  tasks = tasks.filter((task) => task.id !== taskId);
  sessionStorage.setItem('tasks', JSON.stringify(tasks));
  loadTasks();
}

function updateTask(id, completed) {
  let tasks = getTasksFromStorage();
  const taskIndex = tasks.findIndex((task) => task.id === id);
  tasks[taskIndex].completed = completed;
  if (completed) {
    tasks[taskIndex].completedTime = Date.now();
  }
  sessionStorage.setItem('tasks', JSON.stringify(tasks));
  loadTasks();
}

function loadTasks() {
  let tasks = getTasksFromStorage();

  tasks = sortTasks(tasks);

  const todoList = document.querySelector('#todoList');
  todoList.innerHTML = '';

  for (let task of tasks) {
    const div = document.createElement('div');
    const label = document.createElement('label');
    label.setAttribute('for', `${task.id}`);
    label.textContent = task.description;
    label.title = task.description;

    div.className = 'todoItem' + (task.completed ? ' completed' : '');
    div.innerHTML = `
        <div class="taskInfo">
          <div class="checkboxAndLabel">
            <input type="checkbox" ${task.completed ? 'checked' : ''} id="${
      task.id
    }">
          </div>
          ${
            task.deadline
              ? `<div class="deadline">${timeRemaining(task.deadline)}</div>`
              : ''
          }
        </div>
        <button class="delete">Delete</button>
      `;

    div.querySelector('.checkboxAndLabel').appendChild(label);

    div.querySelector('.delete').addEventListener('click', () => {
      const confirmDelete = confirm(
        'Are you sure you want to delete this task?'
      );
      if (confirmDelete) {
        deleteTask(task.id);
      }
    });

    div
      .querySelector('input[type="checkbox"]')
      .addEventListener('change', function (e) {
        if (e.target !== this) {
          return;
        }
        updateTask(task.id, this.checked);
      });
    todoList.appendChild(div);
  }
}

document.querySelector('#sortOrder').addEventListener('change', loadTasks);

function sortTasks(tasks) {
  const sortOrderElement = document.querySelector('#sortOrder');
  const sortOrder = sortOrderElement.value;

  tasks.sort((a, b) => {
    if (sortOrder === 'recentlyAdded') {
      return a.completed === b.completed ? b.id - a.id : a.completed ? 1 : -1;
    } else if (sortOrder === 'deadline') {
      return a.completed === b.completed
        ? a.deadline && b.deadline
          ? new Date(a.deadline) - new Date(b.deadline)
          : a.deadline
          ? -1
          : 1
        : a.completed
        ? 1
        : -1;
    } else if (sortOrder === 'recentlyCompleted') {
      if (!tasks.some((task) => task.completed)) {
        return 0;
      }
      return a.completed === b.completed
        ? a.completed
          ? b.completedTime - a.completedTime
          : 0
        : a.completed
        ? -1
        : 1;
    }
    return 0;
  });

  return tasks;
}

function timeRemaining(deadline) {
  const total = Date.parse(deadline) - Date.now();

  if (total > 0) {
    const days = Math.floor(total / (1000 * 60 * 60 * 24));
    const hours = Math.floor((total / (1000 * 60 * 60)) % 24);
    const minutes = Math.floor((total / 1000 / 60) % 60);

    return `Time remaining: ${days} days, ${hours} hours, ${minutes} minutes`;
  } else {
    return 'Deadline passed';
  }
}

loadTasks();
