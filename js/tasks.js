function initialiseTasks() {
    const taskForm = document.querySelector("#task-form");
    const tasks = [];
    const taskList = document.querySelector("#task-list");

    function renderTasks() {
        taskList.textContent = "";

        for (const task of tasks) {
            const row = document.createElement("tr");
            const formattedDate = new Date(task.dueDate + "T00:00:00")
    .toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric"
    });

const values = [
    task.name,
    task.description,
    formattedDate,
    task.status
];

            for (const value of values) {
                const cell = document.createElement("td");

                cell.textContent = value;
                row.appendChild(cell);
            }

            taskList.appendChild(row);
        }
    }

    function handleTaskSubmit(event) {
        event.preventDefault();

        const nameInput = document.querySelector("#task-name");
        const descriptionInput = document.querySelector("#task-description");
        const dateInput = document.querySelector("#task-date");

        const name = nameInput.value.trim();
        const description = descriptionInput.value.trim();
        const dueDate = dateInput.value;

        if (name === "" || description === "") {
            alert("Please enter a task name and description, not just spaces.");
            return;
        }

        const task = {
            name: name,
            description: description,
            dueDate: dueDate,
            status: "pending"
        };

        tasks.push(task);
        renderTasks();
    }

    taskForm.addEventListener("submit", handleTaskSubmit);
}

initialiseTasks();