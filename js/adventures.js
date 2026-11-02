function initialiseAdventures() {
    const searchInput = document.querySelector("#adventure-search");
    const categorySelect = document.querySelector("#adventure-category");
    const sortSelect = document.querySelector("#adventure-sort");
    const adventureGrid = document.querySelector("#adventure-grid");
    const adventureCount = document.querySelector("#adventure-count");
    const adventureEmpty = document.querySelector("#adventure-empty");
    const favouritesOnly = document.querySelector("#favourites-only");
    const modalElement = document.querySelector("#adventure-modal");
    const adventureModal = bootstrap.Modal.getOrCreateInstance(modalElement);

    const modalTitle = document.querySelector("#adventure-modal-title");
    const modalCategory = document.querySelector("#adventure-modal-category");
    const modalDescription = document.querySelector("#adventure-modal-description");
    const modalLocation = document.querySelector("#adventure-modal-location");
    const modalDuration = document.querySelector("#adventure-modal-duration");
    const modalDifficulty = document.querySelector("#adventure-modal-difficulty");
    const modalPrice = document.querySelector("#adventure-modal-price");

    const planForm = document.querySelector("#adventure-plan-form");
    const adventureDate = document.querySelector("#adventure-date");
    const planFeedback = document.querySelector("#adventure-plan-feedback");

    // Keep the selected catalogue object available to the planning form.
    let selectedAdventure = null;

    function getTodayDate() {
        const today = new Date();

        // Build a local date string because toISOString uses UTC,
        // which can return a different calendar date near midnight.
        const year = today.getFullYear();
        const month = String(today.getMonth() + 1).padStart(2, "0");
        const day = String(today.getDate()).padStart(2, "0");

        return year + "-" + month + "-" + day;
    }

    let lastDetailsButton = null;

    // Restore focus to the card that opened the shared modal.
    modalElement.addEventListener("hidden.bs.modal", function () {
        if (lastDetailsButton && lastDetailsButton.isConnected) {
            lastDetailsButton.focus();
        }
    });

    // Store catalogue IDs rather than whole objects so saved choices
    // continue to use the current adventure descriptions and prices.
    const savedFavourites = localStorage.getItem("favouriteAdventures");
    const favourites = savedFavourites ? JSON.parse(savedFavourites) : [];

    // Fictional catalogue data for the coursework.
    // Numeric prices and durations allow sorting without parsing display text.
    const adventures = [
        {
            id: "rafting",
            name: "River Rafting",
            category: "water",
            location: "Epirus",
            description: "A shared adventure through flowing water and green river scenery.",
            duration: 3,
            price: 55,
            difficulty: "Moderate"
        },
        {
            id: "sup",
            name: "Coastal SUP",
            category: "water",
            location: "Ionian coast",
            description: "Find your balance and enjoy a different view of the coastline.",
            duration: 2,
            price: 35,
            difficulty: "Easy"
        },
        {
            id: "kayaking",
            name: "Sea Kayaking",
            category: "water",
            location: "Ionian coast",
            description: "Explore sheltered bays and discover the coast one paddle at a time.",
            duration: 3,
            price: 45,
            difficulty: "Moderate"
        },
        {
            id: "river-trekking",
            name: "River Trekking",
            category: "water",
            location: "Acheron",
            description: "Follow the river through a landscape of clear water and shaded banks.",
            duration: 2,
            price: 30,
            difficulty: "Moderate"
        },
        {
            id: "snorkelling",
            name: "Blue Water Snorkelling",
            category: "water",
            location: "Ionian coast",
            description: "Slow down and discover the colours beneath the surface.",
            duration: 2,
            price: 30,
            difficulty: "Easy"
        },
        {
            id: "canyoning",
            name: "Canyon Discovery",
            category: "water",
            location: "Epirus",
            description: "Explore dramatic rock formations on an adventurous canyon outing.",
            duration: 4,
            price: 75,
            difficulty: "Challenging"
        },
        {
            id: "hiking",
            name: "Mountain Hiking",
            category: "mountain",
            location: "Epirus",
            description: "Leave the everyday behind on a trail through mountain scenery.",
            duration: 4,
            price: 35,
            difficulty: "Moderate"
        },
        {
            id: "trail-running",
            name: "Trail Running",
            category: "mountain",
            location: "Epirus",
            description: "Find your rhythm on natural paths with a small group.",
            duration: 2,
            price: 25,
            difficulty: "Challenging"
        },
        {
            id: "climbing",
            name: "Rock Climbing",
            category: "mountain",
            location: "Epirus",
            description: "Try a new challenge with an introduction to climbing on natural rock.",
            duration: 3,
            price: 60,
            difficulty: "Moderate"
        },
        {
            id: "camping",
            name: "Camp Under the Stars",
            category: "mountain",
            location: "Epirus",
            description: "Make time for an overnight escape and a slower morning outdoors.",
            duration: 24,
            price: 85,
            difficulty: "Easy"
        },
        {
            id: "mountain-biking",
            name: "Mountain Bike Escape",
            category: "cycling",
            location: "Epirus",
            description: "Explore forest tracks and changing terrain on two wheels.",
            duration: 3,
            price: 50,
            difficulty: "Challenging"
        },
        {
            id: "road-cycling",
            name: "Coastal Road Cycling",
            category: "cycling",
            location: "Ionian coast",
            description: "Follow scenic roads with sea views and time to enjoy the journey.",
            duration: 4,
            price: 45,
            difficulty: "Moderate"
        }
    ];

    // Category images are kept separately so shared presentation data
    // does not need to be repeated in every adventure object.
    const categories = {
        water: {
            label: "On the water",
            image: "images/sup-800.webp",
            alt: "Paddleboarders in a coastal bay"
        },
        mountain: {
            label: "Into the mountains",
            image: "images/hiking.webp",
            alt: "Hikers on a rocky trail above the sea"
        },
        cycling: {
            label: "On two wheels",
            image: "images/cycling.webp",
            alt: "Cyclists following a coastal road"
        }
    };

    function showAdventureDetails(adventure, openingButton) {
        const category = categories[adventure.category];

        // Reuse one modal for the entire catalogue instead of duplicating its HTML.
        modalTitle.textContent = adventure.name;
        modalCategory.textContent = category.label;
        modalDescription.textContent = adventure.description;
        modalLocation.textContent = adventure.location;
        modalDuration.textContent = adventure.duration === 24
            ? "Overnight"
            : adventure.duration + " hours";
        modalDifficulty.textContent = adventure.difficulty;
        modalPrice.textContent = "€" + adventure.price;
        selectedAdventure = adventure;
        planForm.reset();
        planFeedback.textContent = "";
        adventureDate.min = getTodayDate();

        lastDetailsButton = openingButton;
        adventureModal.show();
    }

    function handleAdventurePlan(event) {
        event.preventDefault();

        if (selectedAdventure === null) {
            return;
        }

        // Refresh the minimum date in case the page stayed open overnight.
        adventureDate.min = getTodayDate();

        if (!planForm.reportValidity()) {
            return;
        }

        const tripDate = adventureDate.value;
        const adventure = selectedAdventure;

        // Read the latest task data at submission time so existing tasks
        // are preserved, including changes made in another page.
        const savedTasks = localStorage.getItem("tasks");
        const tasks = savedTasks ? JSON.parse(savedTasks) : [];

        const preparationItems = [
            {
                key: "arrangements",
                name: "Confirm arrangements",
                description:
                    "Confirm the meeting point, availability and arrangements for " +
                    adventure.name + " in " + adventure.location + "."
            },
            {
                key: "transport",
                name: "Organise transport",
                description:
                    "Arrange travel to and from " + adventure.location +
                    " for " + adventure.name + "."
            },
            {
                key: "kit",
                name: "Prepare activity kit",
                description:
                    "Check the organiser's equipment list for " + adventure.name +
                    " and prepare the items you need to bring."
            }
        ];

        let addedCount = 0;

        for (const item of preparationItems) {
            // Identify each generated task independently of its editable name
            // or deadline, preventing duplicate tasks for the same dated adventure.
            const preparationKey =
                adventure.id + ":" + tripDate + ":" + item.key;

            const alreadyExists = tasks.some(function (task) {
                return task.preparationKey === preparationKey;
            });

            if (!alreadyExists) {
                const task = {
                    name: adventure.name + " — " + item.name,
                    description: item.description,
                    dueDate: tripDate,
                    status: "pending",
                    preparationKey: preparationKey
                };

                tasks.push(task);
                addedCount++;
            }
        }

        if (addedCount === 0) {
            planFeedback.textContent =
                "Preparation tasks already exist for this adventure and date. " +
                "You can review them on the Tasks page.";
            return;
        }

        localStorage.setItem("tasks", JSON.stringify(tasks));

        recordActivity(
            "Planned adventure: " + adventure.name + " on " + tripDate
        );

        planFeedback.textContent =
            addedCount + " preparation " +
            (addedCount === 1 ? "task added." : "tasks added.") +
            " Open My tasks to review your deadlines.";
    }

    function createAdventureCard(adventure) {
        const category = categories[adventure.category];

        const column = document.createElement("div");
        column.classList.add("col-md-6", "col-xl-4");

        const card = document.createElement("article");
        card.classList.add("adventure-card");

        const image = document.createElement("img");
        image.src = category.image;
        image.alt = category.alt;
        image.width = 800;
        image.height = 450;
        image.loading = "lazy";

        const content = document.createElement("div");
        content.classList.add("adventure-card-content");

        const categoryLabel = document.createElement("p");
        categoryLabel.classList.add("collection-label");
        categoryLabel.textContent = category.label;

        const title = document.createElement("h3");
        title.textContent = adventure.name;

        const location = document.createElement("p");
        location.classList.add("adventure-location");
        location.textContent = adventure.location;

        const description = document.createElement("p");
        description.classList.add("adventure-description");
        description.textContent = adventure.description;

        const details = document.createElement("ul");
        details.classList.add("adventure-meta");

        const duration = document.createElement("li");
        duration.textContent = adventure.duration === 24
            ? "Overnight"
            : adventure.duration + " hours";

        const difficulty = document.createElement("li");
        difficulty.textContent = adventure.difficulty;

        details.appendChild(duration);
        details.appendChild(difficulty);

        const price = document.createElement("p");
        price.classList.add("adventure-price");
        price.textContent = "From €" + adventure.price + " / person";

        content.appendChild(categoryLabel);
        content.appendChild(title);
        content.appendChild(location);
        content.appendChild(description);
        content.appendChild(details);
        content.appendChild(price);
        const detailsButton = document.createElement("button");

        detailsButton.type = "button";
        detailsButton.classList.add("btn", "adventure-details", "mt-3");
        detailsButton.textContent = "View adventure";
        detailsButton.setAttribute(
            "aria-label",
            "View details for " + adventure.name
        );

        detailsButton.addEventListener("click", function () {
            showAdventureDetails(adventure, detailsButton);
        });

        content.appendChild(detailsButton);

        const saveButton = document.createElement("button");

        saveButton.type = "button";
        saveButton.classList.add("btn", "adventure-save", "mt-3");

        function updateSaveButton() {
            const isSaved = favourites.includes(adventure.id);

            saveButton.textContent = isSaved
                ? "♥ Saved"
                : "♡ Save adventure";

            saveButton.setAttribute("aria-pressed", String(isSaved));
            saveButton.setAttribute(
                "aria-label",
                "Save " + adventure.name
            );
        }

        function toggleFavourite() {
            const savedIndex = favourites.indexOf(adventure.id);

            if (savedIndex === -1) {
                favourites.push(adventure.id);
            } else {
                favourites.splice(savedIndex, 1);
            }

            localStorage.setItem(
                "favouriteAdventures",
                JSON.stringify(favourites)
            );

            // Keep focus on the button unless removing this card from the saved-only view.
            if (favouritesOnly.checked && savedIndex !== -1) {
                favouritesOnly.focus();
                renderAdventures();
            } else {
                updateSaveButton();
            }
        }

        updateSaveButton();
        saveButton.addEventListener("click", toggleFavourite);
        content.appendChild(saveButton);

        card.appendChild(image);
        card.appendChild(content);
        column.appendChild(card);

        return column;
    }

    function renderAdventures() {
        const searchText = searchInput.value.trim().toLowerCase();
        const selectedCategory = categorySelect.value;

        // Combine both filters, leaving the original catalogue unchanged.
        const visibleAdventures = adventures.filter(function (adventure) {
            const searchableText =
                adventure.name + " " +
                adventure.location + " " +
                adventure.description;

            const matchesSearch =
                searchableText.toLowerCase().includes(searchText);

            const matchesCategory =
                selectedCategory === "all" ||
                adventure.category === selectedCategory;

            const matchesFavourites =
                !favouritesOnly.checked || favourites.includes(adventure.id);

            return matchesSearch && matchesCategory && matchesFavourites;
        });

        // Sort only the filtered copy so "Featured" restores catalogue order.
        if (sortSelect.value === "price") {
            visibleAdventures.sort(function (first, second) {
                return first.price - second.price;
            });
        } else if (sortSelect.value === "duration") {
            visibleAdventures.sort(function (first, second) {
                return first.duration - second.duration;
            });
        }

        adventureGrid.textContent = "";

        for (const adventure of visibleAdventures) {
            adventureGrid.appendChild(createAdventureCard(adventure));
        }

        const count = visibleAdventures.length;
        adventureCount.textContent =
            count + (count === 1 ? " experience found" : " experiences found");

        adventureEmpty.hidden = count > 0;
    }

    searchInput.addEventListener("input", renderAdventures);
    categorySelect.addEventListener("change", renderAdventures);
    sortSelect.addEventListener("change", renderAdventures);
    favouritesOnly.addEventListener("change", renderAdventures);
    planForm.addEventListener("submit", handleAdventurePlan);

    // Home category links open the catalogue with the matching filter selected.
    // Accept only known category values from the URL.
    const parameters = new URLSearchParams(window.location.search);
    const requestedCategory = parameters.get("category");

    if (requestedCategory &&
        Object.hasOwn(categories, requestedCategory)) {
        categorySelect.value = requestedCategory;
    }

    renderAdventures();
}

initialiseAdventures();