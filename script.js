const taskInput = document.getElementById("taskInput");
const taskList = document.getElementById("taskList");
const darkModeToggle = document.getElementById("darkModeToggle");
const themeSelect = document.getElementById("themeSelect");
const categorySelect = document.getElementById("categorySelect");
const dueDateInput = document.getElementById("dueDateInput");
const prioritySelect = document.getElementById("prioritySelect");
const progressBar = document.getElementById("progress");
const progressText = document.getElementById("progressText");
const searchInput = document.getElementById("searchInput");

let tasks = [];

// Load tasks from localStorage
window.onload = () => {
    loadSettings();
    loadTasks();
    updateProgress();
};

function loadSettings() {
    const darkMode = localStorage.getItem("darkMode") === "true";
    const accentColor = localStorage.getItem("accentColor") || "#fda085";

    document.body.classList.toggle("dark", darkMode);
    document.documentElement.style.setProperty("--accent-color", accentColor);
    themeSelect.value = accentColor;
}

function loadTasks() {
    const savedTasks = localStorage.getItem("tasks");
    if (savedTasks) {
        const taskData = JSON.parse(savedTasks);
        taskData.forEach(task => {
            createTaskElement(task);
        });
    }
}

function saveTasks() {
    const taskData = tasks.map(task => ({
        text: task.element.querySelector("strong").textContent,
        category: task.element.querySelector(".category-label").textContent,
        dueDate: task.element.querySelector("span:nth-child(3)").textContent.replace("Due: ", ""),
        priority: task.element.querySelector("[class^='priority-']").textContent.replace(" Priority", ""),
        completed: task.completed
    }));
    localStorage.setItem("tasks", JSON.stringify(taskData));
}

function addTask() {
    const taskText = taskInput.value.trim();
    if (taskText === "") return;

    const taskData = {
        text: taskText,
        category: categorySelect.value,
        dueDate: dueDateInput.value,
        priority: prioritySelect.value,
        completed: false
    };

    createTaskElement(taskData);
    taskInput.value = "";
    saveTasks();
    updateProgress();
}

function createTaskElement(taskData) {
    const taskItem = document.createElement("li");
    taskItem.classList.add("task-item");

    const taskInfo = document.createElement("div");
    taskInfo.classList.add("task-info");
    
    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.classList.add("task-complete-checkbox");
    checkbox.checked = taskData.completed;
    checkbox.onchange = () => {
        updateProgress();
        saveTasks();
    };

    taskInfo.innerHTML = `
        <span><strong>${taskData.text}</strong> - <span class="category-label">${taskData.category}</span></span>
        <span>Due: ${taskData.dueDate || "No date"}</span>
        <span class="priority-${taskData.priority.toLowerCase()}">${taskData.priority} Priority</span>
    `;
    taskInfo.prepend(checkbox);

    const deleteBtn = document.createElement("button");
    deleteBtn.innerHTML = "❌";
    deleteBtn.onclick = () => {
        taskList.removeChild(taskItem);
        tasks = tasks.filter(task => task.element !== taskItem);
        updateProgress();
        saveTasks();
    };

    taskItem.appendChild(taskInfo);
    taskItem.appendChild(deleteBtn);
    taskList.appendChild(taskItem);

    tasks.push({ element: taskItem, completed: taskData.completed });
}

function sortTasks(criteria) {
    const taskElements = Array.from(taskList.children);
    taskElements.sort((a, b) => {
        switch(criteria) {
            case 'priority':
                const priorityA = a.querySelector('[class^="priority-"]').textContent;
                const priorityB = b.querySelector('[class^="priority-"]').textContent;
                return priorityA.localeCompare(priorityB);
            case 'dueDate':
                const dateA = a.querySelector('span:nth-child(3)').textContent.replace('Due: ', '') || 'Z';
                const dateB = b.querySelector('span:nth-child(3)').textContent.replace('Due: ', '') || 'Z';
                return dateA.localeCompare(dateB);
            default:
                return 0;
        }
    });
    
    taskList.innerHTML = '';
    taskElements.forEach(element => taskList.appendChild(element));
}

function filterTasks(category) {
    const taskElements = document.querySelectorAll('.task-item');
    taskElements.forEach(task => {
        const taskCategory = task.querySelector('.category-label').textContent;
        task.style.display = category === 'All' || taskCategory === category ? 'flex' : 'none';
    });
}

function searchTasks() {
    const searchTerm = searchInput.value.toLowerCase();
    const taskElements = document.querySelectorAll('.task-item');
    
    taskElements.forEach(task => {
        const taskText = task.querySelector('strong').textContent.toLowerCase();
        const taskCategory = task.querySelector('.category-label').textContent.toLowerCase();
        const isVisible = taskText.includes(searchTerm) || taskCategory.includes(searchTerm);
        task.style.display = isVisible ? 'flex' : 'none';
    });
}

function updateProgress() {
    const completedTasks = tasks.filter(task => 
        task.element.querySelector(".task-complete-checkbox").checked
    ).length;
    const totalTasks = tasks.length;
    const completionPercentage = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;

    progressBar.style.width = `${completionPercentage}%`;
    progressText.innerText = `${Math.round(completionPercentage)}% Completed`;
}

darkModeToggle.onclick = () => {
    document.body.classList.toggle("dark");
    localStorage.setItem("darkMode", document.body.classList.contains("dark"));
}

themeSelect.onchange = (e) => {
    const color = e.target.value;
    document.documentElement.style.setProperty("--accent-color", color);
    localStorage.setItem("accentColor", color);
}

// Add keyboard shortcut for adding tasks
taskInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        addTask();
    }
});
