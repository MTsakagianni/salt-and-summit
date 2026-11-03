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
    const modalExpect = document.querySelector("#adventure-modal-expect");
    const modalBring = document.querySelector("#adventure-modal-bring");
    const modalBefore = document.querySelector("#adventure-modal-before");

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
                "id": "sup",
                "name": "Coastal SUP",
                "category": "water",
                "location": "Ionian coast",
                "description": "Find your balance in a sheltered bay, with an unhurried paddle along the coast.",
                "duration": 2,
                "price": 35,
                "difficulty": "Easy",
                "pace": "slow"
        },
        {
                "id": "kayaking",
                "name": "Sea Kayaking",
                "category": "water",
                "location": "Ionian coast",
                "description": "Paddle between quiet coves, pause for a swim and discover the shoreline at an easy pace.",
                "duration": 3,
                "price": 45,
                "difficulty": "Easy",
                "pace": "slow"
        },
        {
                "id": "river-trekking",
                "name": "River Trekking",
                "category": "water",
                "location": "Acheron",
                "description": "Wade through clear water and follow shaded riverbanks, with time to stop and take it all in.",
                "duration": 2,
                "price": 30,
                "difficulty": "Moderate",
                "pace": "slow"
        },
        {
                "id": "snorkelling",
                "name": "Blue Water Snorkelling",
                "category": "water",
                "location": "Ionian coast",
                "description": "Float above clear turquoise water and discover the quieter world beneath the surface.",
                "duration": 2,
                "price": 30,
                "difficulty": "Easy",
                "pace": "slow"
        },
        {
                "id": "hiking",
                "name": "Scenic Hiking",
                "category": "mountain",
                "location": "Epirus",
                "description": "Follow a scenic trail at a relaxed group pace, with generous stops for views and conversation.",
                "duration": 3,
                "price": 35,
                "difficulty": "Moderate",
                "pace": "slow"
        },
        {
                "id": "camping",
                "name": "Camp Under the Stars",
                "category": "mountain",
                "location": "Epirus",
                "description": "Settle into an overnight escape, share a slow evening and wake up close to nature.",
                "duration": 24,
                "price": 85,
                "difficulty": "Easy",
                "pace": "slow"
        },
        {
                "id": "rafting",
                "name": "River Rafting",
                "category": "water",
                "location": "Epirus",
                "description": "Paddle as a team through lively rapids and flowing river sections on an energetic guided descent.",
                "duration": 4,
                "price": 55,
                "difficulty": "Moderate",
                "pace": "challenge"
        },
        {
                "id": "trail-running",
                "name": "Trail Running",
                "category": "mountain",
                "location": "Epirus",
                "description": "Take on uneven trails and sustained climbs, with a small group that enjoys moving in the mountains.",
                "duration": 4,
                "price": 35,
                "difficulty": "Challenging",
                "pace": "challenge"
        },
        {
                "id": "climbing",
                "name": "Rock Climbing",
                "category": "mountain",
                "location": "Meteora",
                "description": "Work on your technique, trust your feet and take on supervised routes among dramatic rock towers.",
                "duration": 4,
                "price": 65,
                "difficulty": "Challenging",
                "pace": "challenge"
        },
        {
                "id": "canyoning",
                "name": "Canyon Discovery",
                "category": "water",
                "location": "Epirus",
                "description": "Navigate a rocky gorge, tackle rope descents and move through water on a demanding guided outing.",
                "duration": 5,
                "price": 75,
                "difficulty": "Challenging",
                "pace": "challenge"
        },
        {
                "id": "mountain-biking",
                "name": "Mountain Biking",
                "category": "cycling",
                "location": "Epirus",
                "description": "Ride technical forest trails, tackle rocky sections and earn the views with a series of climbs.",
                "duration": 4,
                "price": 55,
                "difficulty": "Challenging",
                "pace": "challenge"
        },
        {
                "id": "road-cycling",
                "name": "Endurance Road Cycling",
                "category": "cycling",
                "location": "Ionian coast",
                "description": "Settle into a longer coastal ride with sustained effort, rolling climbs and rewarding sea views.",
                "duration": 6,
                "price": 55,
                "difficulty": "Challenging",
                "pace": "challenge"
        }
];

    const collections = {
        slow: {title: 'Slow & Explore', eyebrow: 'TAKE YOUR TIME',
            description: 'Quiet water, scenic paths and room to pause. Choose a relaxed pace and enjoy the surroundings.'},
        challenge: {title: 'Challenge & Explore', eyebrow: 'BRING YOUR ENERGY',
            description: 'Longer efforts, technical terrain and active days. Find a challenge that matches your experience.'}
    };
    const paceButtons = {
        all: document.querySelector('#pace-all'),
        slow: document.querySelector('#pace-slow'),
        challenge: document.querySelector('#pace-challenge')
    };
    const resetButton = document.querySelector('#reset-adventure-filters');
    let selectedPace = 'all';

    // Keep category labels consistent across the cards and shared modal.
    const categories = {
        water: {
            label: "On the water"
        },
        mountain: {
            label: "Into the mountains"
        },
        cycling: {
            label: "On two wheels"
        }
    };

    // Keep detailed information separate from the short card summaries.
    // These are illustrative experiences for the coursework catalogue.
    const adventureDetails = {
        rafting: {
            expect:
                "Start with a safety briefing and practise paddling together before " +
                "following a lively river descent with rapids and quieter recovery sections.",
            bring: [
                "Swimwear and a towel",
                "Secure footwear suitable for getting wet",
                "Dry clothes for afterwards"
            ],
            before:
                "Confirm the river conditions, swimming requirements and supplied " +
                "equipment with the organiser before making arrangements."
        },

        sup: {
            expect:
                "Get familiar with the board in sheltered water, then practise " +
                "paddling and turning while exploring the coastline.",
            bring: [
                "Swimwear and a towel",
                "Sun protection",
                "Drinking water"
            ],
            before:
                "Check the wind forecast and confirm the meeting point, " +
                "buoyancy equipment and suitability for your experience."
        },

        kayaking: {
            expect:
                "Learn basic paddle strokes before following the shoreline. " +
                "Discover rocky coves and take a break along the route.",
            bring: [
                "Clothes suitable for getting wet",
                "A hat and sun protection",
                "Water and a dry change of clothes"
            ],
            before:
                "Confirm the route, sea conditions and required paddling experience " +
                "with the organiser."
        },

        "river-trekking": {
            expect:
                "Follow shaded riverbanks and walk through shallow sections of " +
                "clear water, with pauses to enjoy the surrounding landscape.",
            bring: [
                "Secure shoes with good grip that can get wet",
                "Quick-drying clothing",
                "A towel and dry clothes"
            ],
            before:
                "Water depth, temperature and footing vary. Confirm current " +
                "conditions and route suitability before setting out."
        },

        snorkelling: {
            expect:
                "Get familiar with the mask and snorkel before exploring a " +
                "sheltered bay from the surface, with time to observe marine life.",
            bring: [
                "Swimwear and a towel",
                "Sun protection",
                "Water and dry clothes"
            ],
            before:
                "Confirm swimming requirements, sea conditions and available " +
                "equipment. Observe marine life without touching or disturbing it."
        },

        canyoning: {
            expect:
                "Explore a rocky gorge with a specialist guide. The planned route " +
                "combines walking through water and supervised rope descents.",
            bring: [
                "Swimwear",
                "Footwear approved by the organiser",
                "A towel and a complete change of clothes"
            ],
            before:
                "Ask about fitness and swimming requirements, specialist equipment " +
                "and weather restrictions before choosing this experience."
        },

        hiking: {
            expect:
                "Follow a scenic trail at an unhurried group pace, with regular " +
                "breaks for water, snacks and viewpoints.",
            bring: [
                "Walking shoes or boots with good grip",
                "Water and snacks",
                "Layers and a weatherproof jacket"
            ],
            before:
                "Check the route distance, elevation gain and forecast to make " +
                "sure the walk matches your fitness and experience."
        },

        "trail-running": {
            expect:
                "Run a longer route across uneven mountain paths and sustained climbs. " +
                "The group regroups at planned checkpoints between demanding sections.",
            bring: [
                "Trail-running shoes",
                "Water or a hydration vest",
                "A light layer and a small snack"
            ],
            before:
                "Confirm the distance, elevation and expected pace. Uneven " +
                "ground makes this different from running on roads."
        },

        climbing: {
            expect:
                "Begin with an equipment check and technique briefing, then work through " +
                "supervised natural-rock routes chosen for your climbing experience.",
            bring: [
                "Comfortable clothing that allows movement",
                "Closed shoes for the approach",
                "Water and sun protection"
            ],
            before:
                "Confirm the exact routes, instructor arrangements and supplied equipment. " +
                "Check required climbing experience and approach difficulty before choosing this outing."
        },

        camping: {
            expect:
                "Arrive with time to settle into camp and enjoy the evening " +
                "landscape. Stay overnight and wake up to a slower morning outdoors.",
            bring: [
                "Warm layers and a torch",
                "Personal overnight essentials",
                "Water and any agreed food supplies"
            ],
            before:
                "Confirm the designated campsite, facilities and sleeping equipment. " +
                "Check local rules and leave the site clean."
        },

        "mountain-biking": {
            expect:
                "Start with a bike check, then ride technical forest trails and rocky " +
                "sections, combining sustained climbs with controlled descents.",
            bring: [
                "Comfortable cycling clothing",
                "Closed shoes and water",
                "A light layer and a snack"
            ],
            before:
                "Confirm bike and helmet availability, terrain difficulty and " +
                "required riding experience before arranging your outing."
        },

        "road-cycling": {
            expect:
                "Follow a longer coastal route with rolling climbs and sustained riding. " +
                "Planned breaks allow time to refuel, regroup and enjoy the views.",
            bring: [
                "Comfortable cycling clothing",
                "Water and snacks",
                "Sun protection and a light layer"
            ],
            before:
                "Check the route distance, elevation and traffic conditions. " +
                "Confirm the bicycle, helmet and expected group pace."
        }
    };

    // Carry the selected adventure and date to the new-task form.


    function showAdventureDetails(adventure, openingButton) {
        const category = categories[adventure.category];

        // Reuse one modal for the entire catalogue instead of duplicating its HTML.
        modalTitle.textContent = adventure.name;
        modalCategory.textContent = collections[adventure.pace].title + " · " + category.label;
        modalDescription.textContent = adventure.description;
        modalLocation.textContent = adventure.location;
        modalDuration.textContent = adventure.duration === 24
            ? "Overnight"
            : adventure.duration + " hours";
        modalDifficulty.textContent = adventure.difficulty;
        modalPrice.textContent = "€" + adventure.price;
        const details = adventureDetails[adventure.id];

        modalExpect.textContent = details.expect;
        modalBefore.textContent = details.before;

        // Clear the previous adventure's list because all cards share one modal.
        modalBring.textContent = "";

        for (const item of details.bring) {
            const listItem = document.createElement("li");
            listItem.textContent = item;
            modalBring.appendChild(listItem);
        }
        selectedAdventure = adventure;
        planForm.reset();
        planFeedback.textContent = "";
        adventureDate.min = getTodayDate();


        lastDetailsButton = openingButton;
        adventureModal.show();
    }

    function handleAdventurePlan(event) {
        event.preventDefault();
        adventureDate.min = getTodayDate();
        if (!selectedAdventure || !planForm.reportValidity()) return;

        // A dated plan groups tasks, but creates no tasks and makes no booking.
        // Reopening the same adventure and date reuses the existing plan.
        const trips = JSON.parse(localStorage.getItem("adventureTrips") || "[]");
        const tripKey = selectedAdventure.id + ":" + adventureDate.value;
        const exists = trips.some(function (trip) { return trip.key === tripKey; });
        if (!exists) {
            trips.push({
                key: tripKey,
                adventureId: selectedAdventure.id,
                name: selectedAdventure.name,
                location: selectedAdventure.location,
                date: adventureDate.value
            });
            localStorage.setItem("adventureTrips", JSON.stringify(trips));
        }
        const parameters = new URLSearchParams();
        parameters.set("trip", tripKey);
        window.location.href = "tasks.html?" + parameters.toString() + "#preparation-list";
    }

    // Match each adventure to its own photograph and descriptive alternative text.
    const adventureImages = {
        rafting: {
            src: "images/rafting.webp",
            alt: "A group rafting through a wooded river gorge"
        },
        sup: {
            src: "images/sup-800.webp",
            alt: "Paddleboarders exploring a clear coastal bay"
        },
        kayaking: {
            src: "images/sea-kayaking.webp",
            alt: "Two kayakers paddling beside a rocky coastline"
        },
        "river-trekking": {
            src: "images/river-trekking.webp",
            alt: "Three friends walking through a clear river beneath leafy trees"
        },
        snorkelling: {
            src: "images/snorkelling.webp",
            alt: "Two snorkellers exploring the clear water of a rocky bay"
        },
        canyoning: {
            src: "images/canyoning.webp",
            alt: "A helmeted adventurer descending a waterfall using a rope"
        },
        hiking: {
            src: "images/hiking.webp",
            alt: "Three hikers following a mountain trail overlooking the sea"
        },
        "trail-running": {
            src: "images/trail-running.webp",
            alt: "Two trail runners on a sunlit mountain path"
        },
        climbing: {
            src: "images/rock-climbing.webp",
            alt: "A climber and belayer beside towering Meteora-inspired rock formations"
        },
        camping: {
            src: "images/camping.webp",
            alt: "Two friends relaxing beside their tents at sunset"
        },
        "mountain-biking": {
            src: "images/mountain-biking.webp",
            alt: "Three helmeted mountain bikers riding along a rocky forest trail"
        },
        "road-cycling": {
            src: "images/endurance-road-cycling.webp",
            alt: "Three helmeted road cyclists climbing a coastal road with focused effort"
        }
    };

    function createAdventureCard(adventure) {
        const category = categories[adventure.category];

        const column = document.createElement("div");
        column.classList.add("col-md-6", "col-xl-4");

        const card = document.createElement("article");
        card.classList.add("adventure-card", "adventure-card-" + adventure.pace);

        const image = document.createElement("img");
        image.src = adventureImages[adventure.id].src;
        image.alt = adventureImages[adventure.id].alt;

        // Reserve space before the photograph loads to reduce layout shifts.
        image.width = 1000;
        image.height = 563;
        image.loading = "lazy";

        const content = document.createElement("div");
        content.classList.add("adventure-card-content");

        const categoryLabel = document.createElement("p");
        categoryLabel.classList.add("collection-label");
        categoryLabel.textContent = collections[adventure.pace].title + " · " + category.label;

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
        detailsButton.classList.add("btn", "adventure-details");
        detailsButton.textContent = "View adventure";
        detailsButton.setAttribute(
            "aria-label",
            "View details for " + adventure.name
        );

        detailsButton.addEventListener("click", function () {
            showAdventureDetails(adventure, detailsButton);
        });

        const actions = document.createElement("div");
        actions.classList.add("adventure-card-actions");
        actions.appendChild(detailsButton);

        const saveButton = document.createElement("button");

        saveButton.type = "button";
        saveButton.classList.add("btn", "adventure-save");

        function updateSaveButton() {
            const isSaved = favourites.includes(adventure.id);

            // In the saved-only view, describe the action instead of just the state.
            saveButton.textContent = isSaved
                ? (favouritesOnly.checked ? "Remove from saved" : "♥ Saved")
                : "♡ Save";

            saveButton.setAttribute("aria-pressed", String(isSaved));
            saveButton.setAttribute(
                "aria-label",
                (isSaved ? "Remove from saved: " : "Save ") + adventure.name
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
        actions.appendChild(saveButton);
        content.appendChild(actions);

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
                collections[adventure.pace].title + " " +
                adventure.description;

            const matchesSearch =
                searchableText.toLowerCase().includes(searchText);

            const matchesCategory =
                selectedCategory === "all" ||
                adventure.category === selectedCategory;

            const matchesFavourites =
                !favouritesOnly.checked || favourites.includes(adventure.id);

            const matchesPace = selectedPace === "all" || adventure.pace === selectedPace;
            return matchesSearch && matchesCategory && matchesFavourites && matchesPace;
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

        for (const pace of Object.keys(collections)) {
            const matches = visibleAdventures.filter(function (adventure) { return adventure.pace === pace; });
            if (!matches.length) continue;
            const section = document.createElement("section");
            section.classList.add("adventure-collection", "adventure-collection-" + pace);
            const headingId = "collection-" + pace;
            section.setAttribute("aria-labelledby", headingId);
            const header = document.createElement("div");
            header.classList.add("adventure-collection-heading");
            const headingContent = document.createElement("div");
            const eyebrow = document.createElement("p");
            eyebrow.classList.add("section-eyebrow");
            eyebrow.textContent = collections[pace].eyebrow;
            const title = document.createElement("h2");
            title.id = headingId;
            title.textContent = collections[pace].title;
            const description = document.createElement("p");
            description.textContent = collections[pace].description;
            headingContent.appendChild(eyebrow);
            headingContent.appendChild(title);
            headingContent.appendChild(description);
            const countLabel = document.createElement("span");
            countLabel.classList.add("adventure-collection-count");
            countLabel.textContent = matches.length + (matches.length === 1 ? " experience" : " experiences");
            header.appendChild(headingContent);
            header.appendChild(countLabel);
            section.appendChild(header);
            const grid = document.createElement("div");
            grid.classList.add("row", "g-4", "justify-content-center");
            for (const adventure of matches) grid.appendChild(createAdventureCard(adventure));
            section.appendChild(grid);
            adventureGrid.appendChild(section);
        }
        for (const pace of Object.keys(paceButtons)) {
            paceButtons[pace].setAttribute("aria-pressed", String(selectedPace === pace));
        }
        resetButton.hidden = selectedPace === "all" && !searchText &&
            selectedCategory === "all" && !favouritesOnly.checked && sortSelect.value === "featured";

        const count = visibleAdventures.length;
        adventureCount.textContent =
            count + (count === 1 ? " experience found" : " experiences found");

        adventureEmpty.hidden = count > 0;
    }

    function resetFilters() {
        selectedPace = "all";
        searchInput.value = "";
        categorySelect.value = "all";
        sortSelect.value = "featured";
        favouritesOnly.checked = false;
        renderAdventures();
        searchInput.focus();
    }
    for (const pace of Object.keys(paceButtons)) {
        function choosePace() {
            selectedPace = pace;
            renderAdventures();
        }
        paceButtons[pace].addEventListener("click", choosePace);
    }
    resetButton.addEventListener("click", resetFilters);

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

    const requestedPace = parameters.get("pace");
    if (requestedPace && Object.hasOwn(collections, requestedPace)) selectedPace = requestedPace;
    renderAdventures();
}

initialiseAdventures();
