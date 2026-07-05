const toggleButton = document.getElementById('header__toggle');
const navMenu = document.querySelector('.header__nav');

<<<<<<< HEAD
if (toggleButton && navMenu) {
    toggleButton.addEventListener('click', toggleNavigation);
=======
renderNavigation();
toggleNavigation();
handleActionBtns();

/**
 * Render the site navigation menu from JSON data.
 * @returns {void}
 */
function renderNavigation() {
    const menuList = document.querySelector('.header__menu');

    navLinks.navigation.forEach((link) => {
        const listItem = document.createElement('li');
        let linkClass = 'header__link';

        if (link.isActive) {
            linkClass = linkClass + ' header__link--active';
        }

        listItem.innerHTML = `<a href="${link.url}" class="${linkClass}">${link.text}</a>`;
        menuList.appendChild(listItem);
    });
>>>>>>> e165092 ([AS_A1_02]: Completed navbar with responsiveness)
}

handleActionBtns();

/**
 * Toggle the mobile navigation menu open and closed state.
 */
function toggleNavigation() {
    const isExpanded = toggleButton.getAttribute('aria-expanded') === 'true';
    toggleButton.setAttribute('aria-expanded', !isExpanded);
    toggleButton.classList.toggle('header__toggle--active');
    navMenu.classList.toggle('header__nav--active');
}

/**
 * Relocate the action buttons based on viewport width.
 * @returns {void}
 */
function handleActionBtns() {
    const actions = document.querySelector('.header__actions');
    const navMenu = document.querySelector('.header__nav');
    const container = document.querySelector('.header__container');
    const mobile = window.matchMedia('(max-width: 430px)');

    /**
     * Move or restore the action buttons for the current screen size.
     * @param {MediaQueryListEvent} e - Media query event or object.
     * @returns {void}
     */
    function relocate(e) {
        if (e.matches) {
            if (navMenu && actions) {
                navMenu.appendChild(actions);
                actions.classList.add('header__actions--drawer-mobile');
            }
        } else {
            if (container && actions) {
                container.appendChild(actions);
                actions.classList.remove('header__actions--drawer-mobile');
            }
        }
    }

    mobile.addEventListener('change', relocate);
    // Run once on initial page load to set the correct layout immediately
    relocate(mobile);
}
