function initialiseTasks() {
    const taskForm = document.querySelector("#task-form");

    // Restore saved tasks so they remain available after closing or reloading the page.
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
    const cancelEditButton = document.querySelector("#cancel-edit");
    const formTitle = document.querySelector("#task-form-title");

    // Keep a reference to the edited task so one form can support both adding and editing.
    let editingTask = null;

    function saveTasks() {
        localStorage.setItem("tasks", JSON.stringify(tasks));
    }

    // Return to add mode without saving changes to the selected task.
    function resetTaskForm() {
        editingTask = null;
        taskForm.reset();
        submitButton.textContent = "Add task";
        formTitle.textContent = "Add to your plans.";
        cancelEditButton.hidden = true;
    }

    function updateSummary() {
        // Count all saved tasks, regardless of the current search or filter.
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

        // Replace existing rows to avoid duplicates whenever the view changes.
        taskList.textContent = "";

        const searchText = searchInput.value.trim().toLowerCase();
        const selectedStatus = statusFilter.value;

        // Combine search and status filtering without removing any saved tasks.
        const visibleTasks = tasks.filter(function (task) {
            const matchesSearch =
                task.name.toLowerCase().includes(searchText) ||
                task.description.toLowerCase().includes(searchText);

            const matchesStatus =
                selectedStatus === "all" || task.status === selectedStatus;

            return matchesSearch && matchesStatus;
        });

        // Sort the filtered array so the original order remains available
        // when the user selects "Order added".
        if (sortSelect.value === "name") {
            visibleTasks.sort(function (firstTask, secondTask) {
                return firstTask.name.localeCompare(secondTask.name);
            });
        } else if (sortSelect.value === "date") {
            // YYYY-MM-DD strings can be compared in chronological order.
            visibleTasks.sort(function (firstTask, secondTask) {
                return firstTask.dueDate.localeCompare(secondTask.dueDate);
            });
        }

        // Explain whether the list is empty or the active filters found no matches.
        if (visibleTasks.length === 0) {
            const row = document.createElement("tr");
            const cell = document.createElement("td");

            cell.colSpan = 5;
            cell.classList.add("task-empty");

            cell.textContent = tasks.length === 0
                ? "No tasks yet. Add your first task or explore an adventure to start planning."
                : "No tasks match your search and filters. Try changing your selections.";

            row.appendChild(cell);
            taskList.appendChild(row);
        }
        for (const task of visibleTasks) {
            const row = document.createElement("tr");

            // Interpret the date at local midnight to avoid a timezone-related day change.
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

                    // Show a readable label as well as colour so status
                    // does not depend on colour alone.
                    statusLabel.classList.add("task-status");

                    if (task.status === "completed") {
                        statusLabel.classList.add("status-completed");
                        statusLabel.textContent = "Completed";
                    } else if (task.status === "in-progress") {
                        statusLabel.classList.add("status-progress");
                        statusLabel.textContent = "In progress";
                    } else {
                        statusLabel.classList.add("status-pending");
                        statusLabel.textContent = "Pending";
                    }

                    cell.appendChild(statusLabel);
                } else {
                    // Treat user-entered content as text rather than HTML.
                    cell.textContent = value;
                }

                row.appendChild(cell);
            }

            const actionsCell = document.createElement("td");
            const actionsGroup = document.createElement("div");
            actionsGroup.classList.add("task-actions");
            const completeButton = document.createElement("button");

            completeButton.type = "button";
            completeButton.classList.add(
                "btn", "btn-outline-success", "btn-sm"
            );
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
            deleteButton.classList.add(
                "btn", "btn-outline-danger", "btn-sm", "ms-2"
            );
            deleteButton.textContent = "Delete";

            function deleteTask() {
                // Give the user a chance to cancel before removing a saved task.
                const confirmed = window.confirm(
                    'Delete "' + task.name + '"? This cannot be undone.'
                );

                if (!confirmed) {
                    return;
                }

                // Use the original array because filters and sorting change row positions.
                const taskIndex = tasks.indexOf(task);

                if (taskIndex === -1) {
                    return;
                }

                tasks.splice(taskIndex, 1);

                if (editingTask === task) {
                    resetTaskForm();
                }

                saveTasks();
                recordActivity("Deleted task: " + task.name);
                renderTasks();

                // The deleted button no longer exists, so move focus to a stable control.
                searchInput.focus();
            }

            deleteButton.addEventListener("click", deleteTask);

            const editButton = document.createElement("button");

            editButton.type = "button";
            editButton.classList.add(
                "btn", "btn-outline-secondary", "btn-sm", "me-2"
            );
            editButton.textContent = "Edit";

            function editTask() {
                editingTask = task;

                nameInput.value = task.name;
                descriptionInput.value = task.description;
                dateInput.value = task.dueDate;

                formTitle.textContent = "Edit your task.";
                submitButton.textContent = "Save changes";
                cancelEditButton.hidden = false;

                nameInput.focus();
            }
            editButton.addEventListener("click", editTask);

            actionsGroup.appendChild(editButton);

            // Completed tasks already show their status, so omit the inactive action.
            if (task.status !== "completed") {
                actionsGroup.appendChild(completeButton);
            }

            actionsGroup.appendChild(deleteButton);
            actionsCell.appendChild(actionsGroup);
            row.appendChild(actionsCell);
            taskList.appendChild(row);
        }
    }

    function handleTaskSubmit(event) {
        // Handle the form locally instead of submitting it and reloading the page.
        event.preventDefault();

        const name = nameInput.value.trim();
        const description = descriptionInput.value.trim();
        const dueDate = dateInput.value;

        // Native required validation accepts spaces, so reject those separately.
        if (name === "" || description === "") {
            alert("Please enter a task name and description, not just spaces.");
            return;
        }

        if (editingTask !== null) {
            // Update the existing object, preserving its current status.
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
        resetTaskForm();
    }
    cancelEditButton.addEventListener("click", function () {
        resetTaskForm();
        nameInput.focus();
    });
    taskForm.addEventListener("submit", handleTaskSubmit);

    // The input event updates search results as the user types.
    searchInput.addEventListener("input", renderTasks);
    statusFilter.addEventListener("change", renderTasks);
    sortSelect.addEventListener("change", renderTasks);

    renderTasks();
}

initialiseTasks();