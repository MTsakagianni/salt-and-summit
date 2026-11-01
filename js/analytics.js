function initialiseAnalytics() {
    const savedTasks = localStorage.getItem("tasks");
    const tasks = savedTasks ? JSON.parse(savedTasks) : [];

    const todoTasks = document.querySelector("#todo-tasks");
    const progressTasks = document.querySelector("#progress-tasks");
    const doneTasks = document.querySelector("#done-tasks");
    const taskChart = document.querySelector("#task-chart");
    const upcomingTasks = document.querySelector("#upcoming-tasks");
    const deadlinesEmpty = document.querySelector("#deadlines-empty");

    const statuses = [
        { value: "pending", label: "To do" },
        { value: "in-progress", label: "In progress" },
        { value: "completed", label: "Completed" }
    ];

    function renderChart() {
        taskChart.textContent = "";

        for (const status of statuses) {
            const count = tasks.filter(function (task) {
                return task.status === status.value;
            }).length;

            const chartRow = document.createElement("div");
            const label = document.createElement("label");
            const bar = document.createElement("meter");

            chartRow.className = "chart-row";
            bar.id = "chart-" + status.value;

            label.htmlFor = bar.id;
            label.textContent = status.label + ": " + count;

            bar.min = 0;
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

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const upcoming = tasks.filter(function (task) {
            const dueDate = new Date(task.dueDate + "T00:00:00");

            return task.status !== "completed" && dueDate >= today;
        });

        upcoming.sort(function (firstTask, secondTask) {
            return firstTask.dueDate.localeCompare(secondTask.dueDate);
        });

        deadlinesEmpty.hidden = upcoming.length > 0;

        for (const task of upcoming) {
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
        renderChart();
        renderDeadlines();

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

                const selectedLabel = statusSelect.options[statusSelect.selectedIndex].textContent;

                recordActivity("Changed task status: " + task.name + " → " + selectedLabel);

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