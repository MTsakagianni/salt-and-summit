function initialiseNavigation() {
    const menu = document.querySelector("#main-menu");
    const menuButton = document.querySelector(".navbar-toggler");

    // Reuse Bootstrap's collapse component without opening the menu on startup.
    const menuCollapse = bootstrap.Collapse.getOrCreateInstance(menu, {
        toggle: false
    });

    function handleMenuKeydown(event) {
        // Return focus to the opening button so keyboard users can continue navigating.
        if (event.key === "Escape" && menu.classList.contains("show")) {
            menuCollapse.hide();
            menuButton.focus();
        }
    }

    function handleOutsideClick(event) {
        // Ignore clicks inside the menu or its button, which Bootstrap already handles.
        if (!menu.contains(event.target) &&
            !menuButton.contains(event.target)) {
            menuCollapse.hide();
        }
    }

    document.addEventListener("keydown", handleMenuKeydown);
    document.addEventListener("click", handleOutsideClick);
}

function initialiseTheme() {
    const themeButton = document.querySelector("#theme-toggle");
    const savedTheme = localStorage.getItem("theme");
    const darkModeEnabled = savedTheme === "dark";

    // Restore the saved preference across pages and browser sessions.
    // aria-pressed communicates the toggle state to assistive technology.
    document.body.classList.toggle("dark-mode", darkModeEnabled);
    themeButton.setAttribute("aria-pressed", darkModeEnabled);

    function toggleTheme() {
        // Change one body class so the shared stylesheet controls the entire theme.
        const darkModeEnabled = document.body.classList.toggle("dark-mode");

        themeButton.setAttribute("aria-pressed", darkModeEnabled);

        if (darkModeEnabled) {
            localStorage.setItem("theme", "dark");
        } else {
            localStorage.setItem("theme", "light");
        }
    }

    themeButton.addEventListener("click", toggleTheme);
}

function recordActivity(message) {
    // Share one activity history between actions on Tasks and Analytics
    // and the Latest Activity section on Home.
    const savedActivity = localStorage.getItem("activity");
    const activities = savedActivity ? JSON.parse(savedActivity) : [];

    const activity = {
        message: message
    };

    // Put the newest action first and retain only the five entries displayed on Home.
    activities.unshift(activity);

    localStorage.setItem("activity", JSON.stringify(activities.slice(0, 5)));
}

// Deferred loading allows initialisation after the HTML has been parsed.
// Bootstrap must load before this file because navigation uses its Collapse component.
initialiseNavigation();
initialiseTheme();