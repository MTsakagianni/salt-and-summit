function initialiseAnalytics() {
    const savedTasks = localStorage.getItem("tasks");
    const tasks = savedTasks ? JSON.parse(savedTasks) : [];

    const todoTasks = document.querySelector("#todo-tasks");
    const progressTasks = document.querySelector("#progress-tasks");
    const doneTasks = document.querySelector("#done-tasks");

    function renderBoard() {
        todoTasks.textContent = "";
        progressTasks.textContent = "";
        doneTasks.textContent = "";

        for (const task of tasks) {
            const card = document.createElement("div");
            const title = document.createElement("h4");
            const description = document.createElement("p");

            card.className = "card team-card p-3 mb-3";
            title.className = "h6";
            title.textContent = task.name;
            description.textContent = task.description;

            card.appendChild(title);
            card.appendChild(description);

            const statusSelect = document.createElement("select");

statusSelect.className = "form-select mt-3";
statusSelect.setAttribute("aria-label", "Status for " + task.name);

const statuses = [
    { value: "pending", label: "To do" },
    { value: "in-progress", label: "In progress" },
    { value: "completed", label: "Completed" }
];

for (const status of statuses) {
    const option = document.createElement("option");

    option.value = status.value;
    option.textContent = status.label;
    statusSelect.appendChild(option);
}

statusSelect.value = task.status;

function changeTaskStatus() {
    task.status = statusSelect.value;
    localStorage.setItem("tasks", JSON.stringify(tasks));
    renderBoard();
}

statusSelect.addEventListener("change", changeTaskStatus);
card.appendChild(statusSelect);

            if (task.status === "completed") {
                doneTasks.appendChild(card);
            } else if (task.status === "in-progress") {
                progressTasks.appendChild(card);
            } else {
                todoTasks.appendChild(card);
            }
        }
    }

    renderBoard();
}

initialiseAnalytics();