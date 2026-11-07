function initialiseAnalytics() {
    // Read the same stored data as the Tasks page to keep both pages consistent.
    const savedTasks = localStorage.getItem("tasks");
    const tasks = savedTasks ? JSON.parse(savedTasks) : [];
    const trips = JSON.parse(localStorage.getItem("adventureTrips") || "[]");

    const todoTasks = document.querySelector("#todo-tasks");
    const progressTasks = document.querySelector("#progress-tasks");
    const doneTasks = document.querySelector("#done-tasks");
    const taskChart = document.querySelector("#task-chart");
    const upcomingTasks = document.querySelector("#upcoming-tasks");
    const deadlinesEmpty = document.querySelector("#deadlines-empty");

    // Reuse one set of status values and labels in the chart and card controls.
    const statuses = [
        { value: "pending", label: "To do" },
        { value: "in-progress", label: "In progress" },
        { value: "completed", label: "Completed" }
    ];

    function renderOverview() {
        const counts = {
            pending: tasks.filter(function (task) { return task.status !== "completed" && task.status !== "in-progress"; }).length,
            progress: tasks.filter(function (task) { return task.status === "in-progress"; }).length,
            completed: tasks.filter(function (task) { return task.status === "completed"; }).length
        };
        const percent = tasks.length ? Math.round(counts.completed / tasks.length * 100) : 0;
        document.querySelector("#analytics-total").textContent = tasks.length;
        for (const key of Object.keys(counts)) {
            document.querySelector("#analytics-" + key).textContent = counts[key];
            document.querySelector("#board-" + key + "-count").textContent = counts[key];
        }
        document.querySelector("#completion-percent").textContent = percent;
        document.querySelector("#completion-progress").value = percent;
        document.querySelector("#completion-summary").textContent = tasks.length
            ? counts.completed + " of " + tasks.length + " tasks completed."
            : "Your next adventure starts with a plan. Add your first task to get going.";
    }

    function renderChart() {
        // Remove previous rows so refreshing the chart does not duplicate them.
        taskChart.textContent = "";

        for (const status of statuses) {
            const count = tasks.filter(function (task) {
                return task.status === status.value;
            }).length;

            const chartRow = document.createElement("div");
            const label = document.createElement("label");
            const bar = document.createElement("meter");

            chartRow.classList.add("chart-row");
            bar.id = "chart-" + status.value;

            // Link each meter to its label for accessibility and show the exact count.
            label.htmlFor = bar.id;
            label.textContent = status.label + ": " + count;

            bar.min = 0;

            // Use a common scale for comparison, with a valid range even when empty.
            bar.max = tasks.length || 1;
            bar.value = count;
            bar.textContent = count + " tasks";

            chartRow.appendChild(label);
            chartRow.appendChild(bar);
            taskChart.appendChild(chartRow);
        }
    }

    function renderDeadlines() {
        upcomingTasks.textContent = "";

        // Compare dates at local midnight so tasks due today are still included.
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const upcoming = tasks.filter(function (task) {
            const dueDate = new Date(task.dueDate + "T00:00:00");

            return task.status !== "completed" && dueDate >= today;
        });

        // YYYY-MM-DD strings sort chronologically.
        // Sorting the filtered array preserves the original task order.
        upcoming.sort(function (firstTask, secondTask) {
            return firstTask.dueDate.localeCompare(secondTask.dueDate);
        });

        deadlinesEmpty.hidden = upcoming.length > 0;

        // Keep this overview short; the full list remains available on Tasks.
        for (const task of upcoming.slice(0, 5)) {
            const item = document.createElement("li");

            const formattedDate = new Date(task.dueDate + "T00:00:00")
                .toLocaleDateString("en-GB", {
                    day: "2-digit",
                    month: "short",
                    year: "numeric"
                });

            item.textContent = task.name + " — " + formattedDate;
            upcomingTasks.appendChild(item);
        }
    }

    function renderBoard() {
        // Refresh all dashboard components from the current task data.
        renderOverview();
        renderChart();
        renderDeadlines();

        todoTasks.textContent = "";
        progressTasks.textContent = "";
        doneTasks.textContent = "";

        for (const task of tasks) {
            const card = document.createElement("div");
            const title = document.createElement("h4");
            const description = document.createElement("p");

            card.classList.add("preparation-board-card");
            title.classList.add("h6");

            // Display user input as text so it cannot be interpreted as HTML.
            title.textContent = task.name;
            description.textContent = task.description;

            card.appendChild(title);
            card.appendChild(description);
            if (task.dueDate) {
                const due = document.createElement("p");
                due.classList.add("board-due-date");
                due.textContent = "Due: " + new Date(task.dueDate + "T00:00:00").toLocaleDateString("en-GB", {
                    day: "2-digit", month: "short", year: "numeric"
                });
                card.appendChild(due);
            }

            // Keep each card's adventure visible when tasks from different plans mix.
            const tripKey = typeof task.tripKey === "string" ? task.tripKey
                : (task.preparationKey || "").split(":").slice(0, -1).join(":");
            const trip = trips.find(function (item) { return item.key === tripKey; });
            if (trip) {
                const tripLabel = document.createElement("p");
                tripLabel.classList.add("kanban-trip");
                const adventureDate = new Date(trip.date + "T00:00:00").toLocaleDateString("en-GB", {
                    day: "2-digit", month: "short", year: "numeric"
                });
                tripLabel.textContent = trip.name + " · Adventure date: " + adventureDate;
                card.appendChild(tripLabel);
            }

            // Older tasks have no priority field; match the Medium default on Tasks.
            const priorityNames = {high: "High", medium: "Medium", low: "Low"};
            const priorityValue = Object.hasOwn(priorityNames, task.priority)
                ? task.priority : "medium";
            const priorityLabel = document.createElement("span");
            priorityLabel.classList.add("task-priority", "priority-" + priorityValue);
            priorityLabel.textContent = priorityNames[priorityValue] + " priority";
            card.appendChild(priorityLabel);

            const statusSelect = document.createElement("select");

            statusSelect.classList.add("form-select", "mt-3");

            // Give each repeated status control a task-specific accessible name.
            statusSelect.setAttribute("aria-label", "Status for " + task.name);

            for (const status of statuses) {
                const option = document.createElement("option");

                option.value = status.value;
                option.textContent = status.label;
                statusSelect.appendChild(option);
            }

            statusSelect.id = "kanban-status-" + tasks.indexOf(task);
            statusSelect.value = task.status;

            function changeTaskStatus() {
                // Persist the change before refreshing so it survives a page reload.
                task.status = statusSelect.value;
                localStorage.setItem("tasks", JSON.stringify(tasks));

                const selectedLabel =
                    statusSelect.options[statusSelect.selectedIndex].textContent;

                // Use the shared function from main.js to update Home's activity history.
                recordActivity(
                    "Changed task status: " + task.name + " → " + selectedLabel
                );

                renderBoard();
                document.getElementById(statusSelect.id).focus();
            }

            statusSelect.addEventListener("change", changeTaskStatus);
            card.appendChild(statusSelect);

            // Place each card in the column matching its saved status.
            if (task.status === "completed") {
                doneTasks.appendChild(card);
            } else if (task.status === "in-progress") {
                progressTasks.appendChild(card);
            } else {
                todoTasks.appendChild(card);
            }
        }
        renderEmptyColumns();
    }

    function renderEmptyColumns() {
        for (const column of [todoTasks, progressTasks, doneTasks]) {
            if (!column.children.length) {
                const message = document.createElement("p");
                message.classList.add("board-empty");
                message.textContent = "No tasks here yet.";
                column.appendChild(message);
            }
        }
    }

    function refreshRestoredPage(event) {
        if (!event.persisted) return;
        const latestTasks = JSON.parse(localStorage.getItem("tasks") || "[]");
        tasks.splice(0, tasks.length, ...latestTasks);
        const latestTrips = JSON.parse(localStorage.getItem("adventureTrips") || "[]");
        trips.splice(0, trips.length, ...latestTrips);
        renderBoard();
    }
    window.addEventListener("pageshow", refreshRestoredPage);
    renderBoard();
}

initialiseAnalytics();