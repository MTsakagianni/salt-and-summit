function initialiseTasks() {
    const taskForm = document.querySelector("#task-form");
    const savedTasks = localStorage.getItem("tasks");
    const tasks = savedTasks ? JSON.parse(savedTasks) : [];
    const taskList = document.querySelector("#task-list");
    const nameInput = document.querySelector("#task-name");
    const descriptionInput = document.querySelector("#task-description");
    const dateInput = document.querySelector("#task-date");
    const submitButton = taskForm.querySelector('button[type="submit"]');
    const searchInput = document.querySelector("#task-search");
    const statusFilter = document.querySelector("#status-filter");
    const sortSelect = document.querySelector("#task-sort");
    const totalTasks = document.querySelector("#total-tasks");
    const pendingTasks = document.querySelector("#pending-tasks");
    const progressTasks = document.querySelector("#progress-tasks");
    const completedTasks = document.querySelector("#completed-tasks");
    let editingTask = null;

    function saveTasks() {
        localStorage.setItem("tasks", JSON.stringify(tasks));
    }

    function updateSummary() {
        const pendingCount = tasks.filter(function (task) {
            return task.status === "pending";
        }).length;

        const progressCount = tasks.filter(function (task) {
            return task.status === "in-progress";
        }).length;

        const completedCount = tasks.filter(function (task) {
            return task.status === "completed";
        }).length;

        totalTasks.textContent = tasks.length;
        pendingTasks.textContent = pendingCount;
        progressTasks.textContent = progressCount;
        completedTasks.textContent = completedCount;
    }

    function renderTasks() {
        updateSummary();
        taskList.textContent = "";

        const searchText = searchInput.value.trim().toLowerCase();

        const selectedStatus = statusFilter.value;

        const visibleTasks = tasks.filter(function (task) {
            const matchesSearch =
                task.name.toLowerCase().includes(searchText) ||
                task.description.toLowerCase().includes(searchText);

            const matchesStatus =
                selectedStatus === "all" || task.status === selectedStatus;

            return matchesSearch && matchesStatus;
        });

        if (sortSelect.value === "name") {
            visibleTasks.sort(function (firstTask, secondTask) {
                return firstTask.name.localeCompare(secondTask.name);
            });
        } else if (sortSelect.value === "date") {
            visibleTasks.sort(function (firstTask, secondTask) {
                return firstTask.dueDate.localeCompare(secondTask.dueDate);
            });
        }

        for (const task of visibleTasks) {
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

            for (let index = 0; index < values.length; index++) {
                const value = values[index];
                const cell = document.createElement("td");

                if (index === 3) {
                    const statusLabel = document.createElement("span");

                    if (task.status === "completed") {
                        statusLabel.className = "task-status status-completed";
                        statusLabel.textContent = "Completed";
                    } else if (task.status === "in-progress") {
                        statusLabel.className = "task-status status-progress";
                        statusLabel.textContent = "In progress";
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
                recordActivity("Completed task: " + task.name);
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
                if (editingTask === task) {
                    editingTask = null;
                    taskForm.reset();
                    submitButton.textContent = "Add task";
                }
                saveTasks();
                recordActivity("Deleted task: " + task.name);
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

            recordActivity("Updated task: " + editingTask.name);

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
            recordActivity("Added task: " + task.name);
        }

        saveTasks();
        renderTasks();
        taskForm.reset();
    }

    taskForm.addEventListener("submit", handleTaskSubmit);
    searchInput.addEventListener("input", renderTasks);
    statusFilter.addEventListener("change", renderTasks);
    sortSelect.addEventListener("change", renderTasks);
    renderTasks();

}

initialiseTasks();

