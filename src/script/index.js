import data from './utilities/data.json';

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
 * Toggle the mobile navigation menu open and closed state.
 */
function initializeNavigation() {
    if (toggleButton) {
        toggleButton.addEventListener('click', toggleNavigation);
    }
}

/**
 * Relocate the action buttons based on viewport width.
 * @returns {void}
 */
function handleActionBtns() {
    const actions = document.querySelector('.header__actions');
    const navMenu = document.querySelector('.header__nav');
    const container = document.querySelector('.header__container');
    const mobile = window.matchMedia('(max-width: 828px)');

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

/**
 * Renders travel statistics from the bundled JSON data into
 * the travel point stats container.
 *
 * @returns {void}
 */
function renderStatsIntoContent() {
    const contentContainer = document.querySelector('.travel-point__stats');
    const template = document.getElementById('stat-card-template');

    if (!contentContainer || !template) {
        return;
    }

    const statsList = data['travel-point'].stats;
    contentContainer.textContent = '';

    const fragment = document.createDocumentFragment();

    statsList.forEach((stat) => {
        const clone = template.content.cloneNode(true);

        clone.querySelector('.travel-point__card-number').textContent =
            stat.value;
        clone.querySelector('.travel-point__card-label').textContent =
            stat.label;

        fragment.appendChild(clone);
    });

    contentContainer.appendChild(fragment);
}

document.addEventListener('DOMContentLoaded', function () {
    const wrapper = document.getElementById('testimonial-wrapper');

    if (!wrapper) {
        return;
    }

    function initTestimonialSwiper() {
        const sliderContainer = document.querySelector('.testimonials__slider');

        if (typeof Swiper === 'undefined') {
            if (sliderContainer) {
                sliderContainer.classList.add('testimonials__slider--fallback');
            }
            return;
        }

        if (!sliderContainer) {
            return;
        }

        try {
            new Swiper(sliderContainer, {
                slidesPerView: 1,
                spaceBetween: 30,
                loop: true,
                navigation: {
                    nextEl: '.testimonials__nav-btn--next',
                    prevEl: '.testimonials__nav-btn--prev',
                },
                pagination: {
                    el: '.testimonials__pagination',
                    clickable: true,
                },
                speed: 600,
                observer: true,
                observeParents: true,
            });
        } catch {
            return;
        }
    }

    fetch(new URL('./utilities/data.json', import.meta.url))
        .then((response) => {
            if (!response.ok) {
                throw new Error('JSON load failed: ' + response.statusText);
            }
            return response.json();
        })
        .then((jsonData) => {
            const testimonialsArray = jsonData['testimonials'].users;
            let allSlidesHTML = '';

            testimonialsArray.forEach((item) => {
                let starsHTML = '';
                for (let i = 0; i < 5; i++) {
                    if (i < item.rating) {
                        starsHTML += '<i class="ic-star-rating"></i>';
                    }
                }

                allSlidesHTML += `
                    <div class="swiper-slide">
                        <div class="testimonial-card">
                            <div class="testimonial-card__avatar-wrapper">
                                <img src="assets/images/img-testimonial-user.svg" alt="${item.name}" class="testimonial-card__avatar">
                            </div>
                            <div class="testimonial-card__meta">
                                <span class="testimonial-card__name">${item.name}</span>
                                <span class="testimonial-card__divider">/</span>
                                <span class="testimonial-card__role">${item.role}</span>
                            </div>
                            <div class="testimonial-card__rating">
                                ${starsHTML}
                            </div>
                            <p class="testimonial-card__text">${item.description}</p>
                        </div>
                    </div>
                `;
            });

            wrapper.innerHTML = allSlidesHTML;

            initTestimonialSwiper();
        })
        .catch(() => {
            contentContainer.textContent = 'Failed to load content.';
        });
});

document.addEventListener('DOMContentLoaded', () => {
    const accordionButtons = document.querySelectorAll('.footer__heading-btn');

    /**
     * Handles the click event on accordion heading buttons for mobile view.
     * Toggles the maximum height and open states of the current footer section,
     * while closing all other open sibling footer sections.
     *
     * @this {HTMLButtonElement}
     * @returns {void}
     */
    accordionButtons.forEach((button) => {
        button.addEventListener('click', function () {
            if (window.innerWidth >= 431) return;

            const section = this.closest('.footer__section');
            const content = section.querySelector('.footer__content');
            const isOpen = section.classList.contains(
                'footer__section--is-open',
            );

            document.querySelectorAll('.footer__section').forEach((el) => {
                if (el !== section) {
                    el.classList.remove('footer__section--is-open');
                    el.querySelector('.footer__content').style.maxHeight = null;
                    el.querySelector('.footer__heading-btn').setAttribute(
                        'aria-expanded',
                        'false',
                    );
                }
            });

            if (isOpen) {
                section.classList.remove('footer__section--is-open');
                content.style.maxHeight = null;
                this.setAttribute('aria-expanded', 'false');
            } else {
                section.classList.add('footer__section--is-open');
                content.style.maxHeight = content.scrollHeight + 'px';
                this.setAttribute('aria-expanded', 'true');
            }
        });
    });

    /**
     * Resets the accordion states, transitions, and layout overrides
     * when the browser window viewport scales past the mobile breakpoint threshold.
     *
     * @returns {void}
     */
    window.addEventListener('resize', () => {
        if (window.innerWidth >= 431) {
            document.querySelectorAll('.footer__section').forEach((el) => {
                el.classList.remove('footer__section--is-open');
                el.querySelector('.footer__content').style.maxHeight = null;
            });
        }
    });
});
