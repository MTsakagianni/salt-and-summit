function initialiseTasks() {
    const taskForm = document.querySelector("#task-form");
    const savedTasks = localStorage.getItem("tasks");
    const tasks = savedTasks ? JSON.parse(savedTasks) : [];
    const taskList = document.querySelector("#task-list");

    function saveTasks() {
        localStorage.setItem("tasks", JSON.stringify(tasks));
    }

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

                if (value === task.status) {
                    const statusLabel = document.createElement("span");

                    if (task.status === "completed") {
                        statusLabel.className = "task-status status-completed";
                        statusLabel.textContent = "Completed";
                    } else {
                        statusLabel.className = "task-status status-pending";
                        statusLabel.textContent = "Pending";
                    }

                    cell.appendChild(statusLabel);
                } else {
                    cell.textContent = value;
                }

                row.appendChild(cell);
            }
            const actionsCell = document.createElement("td");
            const completeButton = document.createElement("button");

            completeButton.type = "button";
            completeButton.className = "btn btn-outline-success btn-sm";
            completeButton.textContent = "Complete";
            completeButton.disabled = task.status === "completed";

            function completeTask() {
                task.status = "completed";
                saveTasks();
                renderTasks();
            }

            completeButton.addEventListener("click", completeTask);

            actionsCell.appendChild(completeButton);
            row.appendChild(actionsCell);
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
        saveTasks();
        renderTasks();
    }

    taskForm.addEventListener("submit", handleTaskSubmit);
    renderTasks();
}

initialiseTasks();

