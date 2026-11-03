function initialiseTasks() {
    const taskForm = document.querySelector('#task-form');
    if (!taskForm) return;

    // Keep the original storage key and objects, including older adventure metadata.
    const tasks = JSON.parse(localStorage.getItem('tasks') || '[]');
    const taskList = document.querySelector('#task-list');
    const searchInput = document.querySelector('#task-search');
    const statusFilter = document.querySelector('#status-filter');
    const priorityFilter = document.querySelector('#priority-filter');
    const sortSelect = document.querySelector('#task-sort');
    const clearFiltersButton = document.querySelector('#clear-task-filters');
    const nameInput = document.querySelector('#task-name');
    const descriptionInput = document.querySelector('#task-description');
    const dateInput = document.querySelector('#task-date');
    const tripInput = document.querySelector('#task-trip');
    const trips = JSON.parse(localStorage.getItem('adventureTrips') || '[]');
    const statusInput = document.querySelector('#task-status');
    const priorityInput = document.querySelector('#task-priority');
    const feedback = document.querySelector('#task-feedback');
    const modalElement = document.querySelector('#task-modal');
    const taskModal = bootstrap.Modal.getOrCreateInstance(modalElement);
    const openButton = document.querySelector('#open-task-form');
    const parameters = new URLSearchParams(window.location.search);
    const statusLabels = {pending: 'Pending', 'in-progress': 'In progress', completed: 'Completed'};
    const priorityLabels = {high: 'High', medium: 'Medium', low: 'Low'};
    const priorityOrder = {high: 0, medium: 1, low: 2};
    let activeTripKey = parameters.get('trip') || '';
    let editingTask = null;
    let lastTrigger = openButton;

    // Names for older generated tasks that predate the plan registry.
    const adventureNames = {
        rafting: 'River Rafting', sup: 'Coastal SUP', kayaking: 'Sea Kayaking',
        'river-trekking': 'River Trekking', snorkelling: 'Blue Water Snorkelling',
        canyoning: 'Canyon Discovery', hiking: 'Mountain Hiking',
        'trail-running': 'Trail Running', climbing: 'Rock Climbing',
        camping: 'Camp Under the Stars', 'mountain-biking': 'Mountain Bike Escape',
        'road-cycling': 'Coastal Road Cycling'
    };

    function getTaskTripKey(task) {
        // An explicit empty key means General, including after reassignment.
        if (typeof task.tripKey === 'string') return task.tripKey;
        if (task.preparationKey) {
            return task.preparationKey.substring(0, task.preparationKey.lastIndexOf(':'));
        }
        return '';
    }

    function findTrip(key) {
        return trips.find(function (trip) { return trip.key === key; });
    }

    function restoreOlderPlans() {
        // Only use saved metadata; never guess an adventure from a task's name.
        for (const task of tasks) {
            const key = getTaskTripKey(task);
            if (!key || findTrip(key)) continue;
            const separator = key.lastIndexOf(':');
            const date = key.substring(separator + 1);
            if (separator < 1 || !/^\d{4}-\d{2}-\d{2}$/.test(date)) continue;
            const adventureId = key.substring(0, separator);
            trips.push({key: key, adventureId: adventureId,
                name: adventureNames[adventureId] || adventureId,
                date: date, location: ''});
        }
        if (activeTripKey && !findTrip(activeTripKey)) activeTripKey = '';
    }

    function tripLabel(trip) {
        return trip.name + ' · ' + formatDate(trip.date);
    }

    function refreshSuggestionContext() {
        const trip = findTrip(activeTripKey);
        document.querySelector('#task-suggestions-context').textContent = trip
            ? 'Adding to: ' + tripLabel(trip) + '. You can change the adventure in the form.'
            : 'Adding to: General reminders. You can choose an adventure in the form.';
    }

    function updateTripDate() {
        const trip = findTrip(tripInput.value);
        const dateLabel = document.querySelector('#task-adventure-date');
        dateLabel.hidden = !trip;
        dateLabel.textContent = trip ? 'Adventure date: ' + formatDate(trip.date) : '';
    }

    function populateTripOptions(key) {
        tripInput.textContent = '';
        const general = document.createElement('option');
        general.value = '';
        general.textContent = 'General reminder — no adventure';
        tripInput.appendChild(general);
        for (const trip of trips) {
            const option = document.createElement('option');
            option.value = trip.key;
            option.textContent = tripLabel(trip);
            tripInput.appendChild(option);
        }
        tripInput.value = findTrip(key) ? key : '';
        updateTripDate();
    }

    function getPriority(task) {
        // Existing tasks did not have priorities. Display them as Medium without
        // discarding them or rewriting storage just because the page was opened.
        return Object.hasOwn(priorityLabels, task.priority) ? task.priority : 'medium';
    }

    function formatDate(value) {
        return new Date(value + 'T00:00:00').toLocaleDateString('en-GB', {
            day: '2-digit', month: 'short', year: 'numeric'
        });
    }

    function saveTasks(message) {
        localStorage.setItem('tasks', JSON.stringify(tasks));
        localStorage.setItem('adventureTrips', JSON.stringify(trips));
        recordActivity(message);
        feedback.textContent = message;
    }

    function deletePlan(key) {
        const trip = findTrip(key);
        if (!trip) return;
        // Count every linked task, including rows hidden by search or filters.
        const taskCount = tasks.filter(function (task) {
            return getTaskTripKey(task) === key;
        }).length;
        const message = 'Delete the preparation plan for ' + tripLabel(trip) +
            ' and all ' + taskCount + ' linked tasks? This cannot be undone.';
        if (!window.confirm(message)) return;

        // Work backwards so removing one task does not skip the next one.
        for (let index = tasks.length - 1; index >= 0; index--) {
            if (getTaskTripKey(tasks[index]) === key) tasks.splice(index, 1);
        }
        trips.splice(trips.indexOf(trip), 1);
        if (activeTripKey === key) activeTripKey = '';
        // Remove a deleted plan from the page URL as well as from storage.
        const pageParameters = new URLSearchParams(window.location.search);
        if (pageParameters.get('trip') === key) {
            pageParameters.delete('trip');
            const query = pageParameters.toString();
            window.history.replaceState(null, '', window.location.pathname +
                (query ? '?' + query : '') + '#preparation-list');
        }
        saveTasks('Deleted preparation plan: ' + tripLabel(trip) + ' (' + taskCount + ' tasks)');
        refreshSuggestionContext();
        renderTasks();
        openButton.focus();
    }

    function makeButton(label, classes, handler) {
        const button = document.createElement('button');
        button.type = 'button';
        button.className = 'btn ' + classes;
        button.textContent = label;
        button.addEventListener('click', handler);
        return button;
    }

    function updateSummary() {
        // Filters change the visible rows; the overview always describes all tasks.
        const completed = tasks.filter(function (task) {
            return task.status === 'completed';
        }).length;
        document.querySelector('#total-tasks').textContent = tasks.length;
        document.querySelector('#completed-tasks').textContent = completed;
        document.querySelector('#pending-tasks').textContent = tasks.filter(function (task) {
            return task.status === 'pending';
        }).length;
        document.querySelector('#progress-tasks').textContent = tasks.filter(function (task) {
            return task.status === 'in-progress';
        }).length;
        const progress = document.querySelector('#task-completion');
        progress.max = tasks.length || 1;
        progress.value = completed;
        progress.textContent = completed + ' of ' + tasks.length + ' completed';
        document.querySelector('#task-completion-label').textContent = tasks.length
            ? completed + ' of ' + tasks.length + ' tasks completed'
            : 'Your next adventure starts with one small task.';
    }

    function createTaskRow(task) {
        const row = document.createElement('tr');
        row.classList.toggle('task-is-completed', task.status === 'completed');
        const checkboxCell = document.createElement('td');
        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.className = 'task-checkbox';
        // The index is used only for restoring focus after rebuilding the rows.
        checkbox.id = 'task-check-' + tasks.indexOf(task);
        checkbox.checked = task.status === 'completed';
        const trip = findTrip(getTaskTripKey(task));
        checkbox.setAttribute('aria-label', 'Completed: ' + task.name + (trip ? ' — ' + tripLabel(trip) : ''));

        function toggleCompletion() {
            task.status = checkbox.checked ? 'completed' : 'pending';
            const message = checkbox.checked ? 'Completed task: ' : 'Reopened task: ';
            saveTasks(message + task.name);
            renderTasks();
            // A status filter may remove the updated row. Keep keyboard focus usable.
            const replacement = document.getElementById(checkbox.id);
            (replacement || statusFilter).focus();
        }
        checkbox.addEventListener('change', toggleCompletion);
        checkboxCell.appendChild(checkbox);
        row.appendChild(checkboxCell);

        const nameCell = document.createElement('td');
        const name = document.createElement('label');
        name.htmlFor = checkbox.id;
        name.className = 'task-name';
        name.textContent = task.name;
        const description = document.createElement('p');
        description.className = 'task-description';
        description.textContent = task.description;
        nameCell.appendChild(name);
        nameCell.appendChild(description);
        row.appendChild(nameCell);

        const dateCell = document.createElement('td');
        const date = document.createElement('time');
        date.dateTime = task.dueDate;
        date.textContent = formatDate(task.dueDate);
        dateCell.appendChild(date);
        row.appendChild(dateCell);

        const priorityCell = document.createElement('td');
        const priority = document.createElement('span');
        priority.className = 'task-priority priority-' + getPriority(task);
        priority.textContent = priorityLabels[getPriority(task)];
        priorityCell.appendChild(priority);
        row.appendChild(priorityCell);

        const statusCell = document.createElement('td');
        const badge = document.createElement('span');
        badge.className = 'task-status status-' + task.status;
        badge.textContent = statusLabels[task.status];
        statusCell.appendChild(badge);
        row.appendChild(statusCell);

        const actionsCell = document.createElement('td');
        const actions = document.createElement('div');
        actions.className = 'task-actions';
        function editTask() {
            openEditor(task, editButton);
        }
        function deleteTask() {
            if (!window.confirm('Delete "' + task.name + '"?')) return;
            tasks.splice(tasks.indexOf(task), 1);
            saveTasks('Deleted task: ' + task.name);
            renderTasks();
            searchInput.focus();
        }
        const editButton = makeButton('Edit', 'task-edit', editTask);
        editButton.setAttribute('aria-label', 'Edit ' + task.name);
        const deleteButton = makeButton('Delete', 'task-delete', deleteTask);
        deleteButton.setAttribute('aria-label', 'Delete ' + task.name);
        actions.appendChild(editButton);
        actions.appendChild(deleteButton);
        actionsCell.appendChild(actions);
        row.appendChild(actionsCell);
        return row;
    }

    function renderTasks() {
        updateSummary();
        const search = searchInput.value.trim().toLowerCase();
        const visibleTasks = tasks.filter(function (task) {
            // Search the task itself and the adventure it belongs to.
            // Read plan metadata rather than requiring repeated names in every task.
            const trip = findTrip(getTaskTripKey(task));
            const searchableText = [
                task.name,
                task.description,
                trip ? trip.name : '',
                trip ? trip.location : ''
            ].join(' ').toLowerCase();
            const matchesSearch = searchableText.includes(search);
            const matchesStatus = statusFilter.value === 'all' || task.status === statusFilter.value;
            const matchesPriority = priorityFilter.value === 'all' || getPriority(task) === priorityFilter.value;
            return matchesSearch && matchesStatus && matchesPriority;
        });
        // Sort a filtered copy, preserving the original "Order added" sequence.
        if (sortSelect.value === 'name') {
            visibleTasks.sort(function (first, second) { return first.name.localeCompare(second.name); });
        } else if (sortSelect.value === 'date') {
            visibleTasks.sort(function (first, second) { return first.dueDate.localeCompare(second.dueDate); });
        } else if (sortSelect.value === 'priority') {
            visibleTasks.sort(function (first, second) {
                return priorityOrder[getPriority(first)] - priorityOrder[getPriority(second)];
            });
        }
        clearFiltersButton.hidden = !search && statusFilter.value === 'all' &&
            priorityFilter.value === 'all' && sortSelect.value === 'default';
        document.querySelector('#task-results').textContent =
            'Showing ' + visibleTasks.length + ' of ' + tasks.length + ' tasks';
        taskList.textContent = '';
        if (!visibleTasks.length) {
            const row = document.createElement('tr');
            const cell = document.createElement('td');
            cell.colSpan = 6;
            cell.className = 'task-empty';
            const title = document.createElement('strong');
            title.textContent = tasks.length ? 'No matching tasks' : 'A fresh start for your next adventure';
            const hint = document.createElement('p');
            hint.textContent = tasks.length ? 'Try another search, or clear your filters.' :
                'Select Add task to create your first reminder.';
            cell.appendChild(title);
            cell.appendChild(hint);
            row.appendChild(cell);
            taskList.appendChild(row);
        }
        if (tasks.length || trips.length) {
            // A selected outing comes first; all other groups remain visible.
            const groups = trips.slice();
            groups.sort(function (first, second) {
                if (first.key === activeTripKey) return -1;
                if (second.key === activeTripKey) return 1;
                return first.date.localeCompare(second.date);
            });
            groups.push({key: '', name: 'General reminders'});
            // An empty first-use message above already covers the no-plan case.
            if (!visibleTasks.length && !tasks.length) taskList.textContent = '';
            for (const group of groups) {
                const groupTasks = visibleTasks.filter(function (task) {
                    const key = getTaskTripKey(task);
                    return (findTrip(key) ? key : '') === group.key;
                });
                const hasFilters = search || statusFilter.value !== 'all' || priorityFilter.value !== 'all';
                if (!groupTasks.length && (hasFilters || !group.key)) continue;
                const headingRow = document.createElement('tr');
                headingRow.className = 'task-group-heading';
                const headingCell = document.createElement('td');
                headingCell.colSpan = 6;
                const headingContent = document.createElement('div');
                headingContent.className = 'task-group-content';
                const details = document.createElement('div');
                const title = document.createElement('h3');
                title.textContent = group.name;
                const meta = document.createElement('p');
                meta.textContent = group.key
                    ? 'Adventure date: ' + formatDate(group.date) + (group.location ? ' · ' + group.location : '')
                    : 'Personal reminders that are not linked to an adventure.';
                details.appendChild(title);
                details.appendChild(meta);
                headingContent.appendChild(details);
                function addToGroup() {
                    activeTripKey = group.key;
                    refreshSuggestionContext();
                    openEditor(null, groupButton);
                }
                const groupButton = makeButton('Add task', 'task-edit', addToGroup);
                groupButton.setAttribute('aria-label', 'Add task to ' + (group.key ? tripLabel(group) : group.name));
                const groupActions = document.createElement('div');
                groupActions.className = 'task-group-actions';
                groupActions.appendChild(groupButton);
                if (group.key) {
                    function removeGroup() { deletePlan(group.key); }
                    const deleteButton = makeButton('Delete plan', 'task-delete', removeGroup);
                    deleteButton.setAttribute('aria-label', 'Delete plan for ' + tripLabel(group));
                    groupActions.appendChild(deleteButton);
                }
                headingContent.appendChild(groupActions);
                headingCell.appendChild(headingContent);
                headingRow.appendChild(headingCell);
                taskList.appendChild(headingRow);
                for (const task of groupTasks) taskList.appendChild(createTaskRow(task));
                if (!groupTasks.length) {
                    const emptyRow = document.createElement('tr');
                    const emptyCell = document.createElement('td');
                    emptyCell.colSpan = 6;
                    emptyCell.className = 'task-group-empty';
                    emptyCell.textContent = 'No preparation tasks yet. Add your own task or choose a suggestion above.';
                    emptyRow.appendChild(emptyCell);
                    taskList.appendChild(emptyRow);
                }
            }
        }
    }

    function openEditor(task, trigger) {
        editingTask = task;
        lastTrigger = trigger;
        taskForm.reset();
        populateTripOptions(task ? getTaskTripKey(task) : activeTripKey);
        document.querySelector('#task-form-title').textContent = task ? 'Edit task' : 'Add a task';
        document.querySelector('#save-task').textContent = task ? 'Save changes' : 'Add task';
        if (task) {
            nameInput.value = task.name;
            descriptionInput.value = task.description;
            dateInput.value = task.dueDate;
            statusInput.value = task.status;
            priorityInput.value = getPriority(task);
        }
        taskModal.show();
    }

    function handleTaskSubmit(event) {
        event.preventDefault();
        if (!taskForm.reportValidity()) return;
        const name = nameInput.value.trim();
        const description = descriptionInput.value.trim();
        if (!name || !description) {
            window.alert('Please enter a task name and description, not just spaces.');
            (!name ? nameInput : descriptionInput).focus();
            return;
        }
        const task = editingTask || {};
        task.name = name;
        task.description = description;
        task.dueDate = dateInput.value;
        task.status = statusInput.value;
        task.priority = priorityInput.value;
        task.tripKey = tripInput.value;
        activeTripKey = task.tripKey;
        refreshSuggestionContext();
        const message = (editingTask ? 'Updated task: ' : 'Added task: ') + name;
        if (!editingTask) tasks.push(task);
        saveTasks(message);
        renderTasks();
        taskModal.hide();
    }

    function clearFilters() {
        searchInput.value = '';
        statusFilter.value = 'all';
        priorityFilter.value = 'all';
        sortSelect.value = 'default';
        renderTasks();
        searchInput.focus();
    }
    function renderSuggestions() {
        // Suggestions are drafts, not saved tasks. The user still chooses
        // a deadline and submits the same validated form used for custom tasks.
        const suggestions = [
            {
                name: 'Book transport',
                description: 'Arrange travel to and from the activity location. Check departure times and the return journey.'
            },
            {
                name: 'Check meeting point',
                description: 'Confirm the exact meeting point, arrival time and organiser contact details.'
            },
            {
                name: 'Prepare activity kit',
                description: 'Check the organiser’s equipment list and prepare the clothing and personal items you need to bring.'
            },
            {
                name: 'Check the weather',
                description: 'Review the forecast for the activity location and check any updates from the organiser before setting out.'
            },
            {
                name: 'Pack water and snacks',
                description: 'Pack drinking water and snacks suitable for the length and conditions of your adventure.'
            }
        ];
        const container = document.querySelector('#task-suggestions');
        container.textContent = '';
        for (const suggestion of suggestions) {
            function useSuggestion() {
                openEditor(null, button);
                nameInput.value = suggestion.name;
                descriptionInput.value = suggestion.description;
            }
            const button = makeButton(suggestion.name, 'task-suggestion', useSuggestion);
            button.setAttribute('aria-label', 'Use suggested task: ' + suggestion.name);
            button.setAttribute('aria-haspopup', 'dialog');
            container.appendChild(button);
        }
    }

    function focusName() { nameInput.focus(); }
    function closeEditor() {
        editingTask = null;
        (lastTrigger && lastTrigger.isConnected ? lastTrigger : openButton).focus();
    }
    function addTask() { openEditor(null, openButton); }

    restoreOlderPlans();
    refreshSuggestionContext();
    tripInput.addEventListener('change', updateTripDate);
    renderSuggestions();
    taskForm.addEventListener('submit', handleTaskSubmit);
    modalElement.addEventListener('shown.bs.modal', focusName);
    modalElement.addEventListener('hidden.bs.modal', closeEditor);
    openButton.addEventListener('click', addTask);
    searchInput.addEventListener('input', renderTasks);
    statusFilter.addEventListener('change', renderTasks);
    priorityFilter.addEventListener('change', renderTasks);
    sortSelect.addEventListener('change', renderTasks);
    clearFiltersButton.addEventListener('click', clearFilters);
    function refreshRestoredPage(event) {
        if (!event.persisted) return;
        const latestTasks = JSON.parse(localStorage.getItem('tasks') || '[]');
        tasks.splice(0, tasks.length, ...latestTasks);
        const latestTrips = JSON.parse(localStorage.getItem('adventureTrips') || '[]');
        trips.splice(0, trips.length, ...latestTrips);
        restoreOlderPlans();
        refreshSuggestionContext();
        renderTasks();
    }
    window.addEventListener('pageshow', refreshRestoredPage);
    renderTasks();

    // Adventures opens an editable draft. Cancel leaves storage unchanged.
    if (parameters.get('action') === 'add') {
        openEditor(null, openButton);
        nameInput.value = (parameters.get('task') || '').slice(0, 100);
        descriptionInput.value = (parameters.get('description') || '').slice(0, 1000);
        const deadline = parameters.get('due') || '';
        if (/^\d{4}-\d{2}-\d{2}$/.test(deadline)) dateInput.value = deadline;
        window.history.replaceState(null, '', window.location.pathname);
    }
}

initialiseTasks();
