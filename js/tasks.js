function initialiseTasks() {
    const taskForm = document.querySelector("#task-form");
    const savedTasks = localStorage.getItem("tasks");
    const tasks = savedTasks ? JSON.parse(savedTasks) : [];
    const taskList = document.querySelector("#task-list");
    const nameInput = document.querySelector("#task-name");
    const descriptionInput = document.querySelector("#task-description");
    const dateInput = document.querySelector("#task-date");
    const submitButton = taskForm.querySelector('button[type="submit"]');
    let editingTask = null;

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

            const deleteButton = document.createElement("button");

            deleteButton.type = "button";
            deleteButton.className = "btn btn-outline-danger btn-sm ms-2";
            deleteButton.textContent = "Delete";

            function deleteTask() {
                const taskIndex = tasks.indexOf(task);

                tasks.splice(taskIndex, 1);
                saveTasks();
                renderTasks();
            }

            deleteButton.addEventListener("click", deleteTask);

            const editButton = document.createElement("button");

            editButton.type = "button";
            editButton.className = "btn btn-outline-secondary btn-sm me-2";
            editButton.textContent = "Edit";

            function editTask() {
                editingTask = task;

                nameInput.value = task.name;
                descriptionInput.value = task.description;
                dateInput.value = task.dueDate;

                submitButton.textContent = "Save changes";
                nameInput.focus();
            }

            editButton.addEventListener("click", editTask);

            actionsCell.appendChild(editButton);
            actionsCell.appendChild(completeButton);
            actionsCell.appendChild(deleteButton);
            row.appendChild(actionsCell);
            taskList.appendChild(row);
        }
    }

        function handleTaskSubmit(event) {
        event.preventDefault();

        const name = nameInput.value.trim();
        const description = descriptionInput.value.trim();
        const dueDate = dateInput.value;

        if (name === "" || description === "") {
            alert("Please enter a task name and description, not just spaces.");
            return;
        }

        if (editingTask !== null) {
            editingTask.name = name;
            editingTask.description = description;
            editingTask.dueDate = dueDate;

            editingTask = null;
            submitButton.textContent = "Add task";
        } else {
            const task = {
                name: name,
                description: description,
                dueDate: dueDate,
                status: "pending"
            };

            tasks.push(task);
        }

        saveTasks();
        renderTasks();
        taskForm.reset();
    }

    taskForm.addEventListener("submit", handleTaskSubmit);
    renderTasks();
}

initialiseTasks();

