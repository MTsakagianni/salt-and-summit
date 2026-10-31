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