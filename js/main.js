function initialiseNavigation() {
    const menu = document.querySelector("#main-menu");
    const menuButton = document.querySelector(".navbar-toggler");
    const menuCollapse = bootstrap.Collapse.getOrCreateInstance(menu, {
        toggle: false
    });

    function handleMenuKeydown(event) {
        if (event.key === "Escape" && menu.classList.contains("show")) {
            menuCollapse.hide();
            menuButton.focus();
        }
    }

    function handleOutsideClick(event) {
        if (!menu.contains(event.target) &&
            !menuButton.contains(event.target)) {
            menuCollapse.hide();
        }
    }

    document.addEventListener("keydown", handleMenuKeydown);
    document.addEventListener("click", handleOutsideClick);
}

initialiseNavigation();

function initialiseTheme() {
    const themeButton = document.querySelector("#theme-toggle");
    const savedTheme = localStorage.getItem("theme");
    const darkModeEnabled = savedTheme === "dark";

    document.body.classList.toggle("dark-mode", darkModeEnabled);
    themeButton.setAttribute("aria-pressed", darkModeEnabled);

    function toggleTheme() {
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

initialiseTheme();

function recordActivity(message) {
    const savedActivity = localStorage.getItem("activity");
    const activities = savedActivity ? JSON.parse(savedActivity) : [];

    const activity = {
        message: message
    };

    activities.unshift(activity);

    localStorage.setItem("activity", JSON.stringify(activities.slice(0, 5)));
}