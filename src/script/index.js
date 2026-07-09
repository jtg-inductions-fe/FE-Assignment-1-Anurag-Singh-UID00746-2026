// import '../styles/main.scss';

const toggleButton = document.getElementById('header__toggle');
const navMenu = document.querySelector('.header__nav');

initializeNavigation();
handleActionBtns();
renderStatsIntoContent();

/**
 * Toggle the mobile navigation menu open and closed state.
 * @returns {void}
 */
function toggleNavigation() {
    const isExpanded = toggleButton.getAttribute('aria-expanded') === 'true';
    toggleButton.setAttribute('aria-expanded', !isExpanded);
    toggleButton.classList.toggle('header__toggle--active');
    navMenu.classList.toggle('header__nav--active');
}

/**
 * Attach a click listener to the mobile menu toggle button.
 * @returns {void}
 */
function initializeNavigation() {
    toggleButton.addEventListener('click', toggleNavigation);
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
