import data from './utilities/data.json';
import * as CONSTANTS from './constants.js';

const DEALS_URL =
    'https://gist.githubusercontent.com/ameer-wajid-ali/1f29ebee4295cede36f8d74b45e576df/raw/122966c9a123861249f173911d8d93a76dc06d7a/';

const toggleButton = document.getElementById('header__toggle');
const navMenu = document.querySelector('.header__nav');
const container = document.querySelector('.header__container');
const modalContainer = document.querySelector('.deals__container');
const modal = document.getElementById('deals');
const backBtn = document.getElementById('back-button');
const openButton = document.getElementById('special-deals-btn');
const closeButton = document.getElementById('close-btn');
const closeButtonForUnlockedDeals = document.getElementById(
    'unlocked-deals-close-btn',
);
const winLabel = document.querySelector('.deals__win-label');
const allDeals = document.querySelector('.deals__all-deals');
const SpinnerCanvas = document.getElementById('wheel');
const unlockedDealsPanel = document.getElementById('unlocked-deals-panel');
const spinBtn = document.getElementById('spin-btn');
const spinnerLoader = document.getElementById('spinner-loading');
const unlockedDealsContainer = document.querySelector('.deals__unlocked');
const unlockedDealsBtn = document.getElementById('unlocked-deals-button');
const couponContainer = document.querySelector('.deals__unlocked-coupons');
const couponTemplate = document.getElementById('coupon-card-template');
const testimonialTemplate = document.getElementById('testimonial-template');
const ctx = SpinnerCanvas.getContext('2d');

let colors = [];
let selectRand = [];
let dealsData = [];
let rafId = null;
let winningIdx = 0;
let startRotation = 0;
let targetRotation = 0;
let spinDuration = CONSTANTS.SPIN_DURATION;
let spinStartTime = 0;

const wonDeals = JSON.parse(localStorage.getItem('wonDeals')) || [];

colors = CONSTANTS.COLOR_KEYS.map((key) => CONSTANTS[key]);

initializeNavigation();
handleActionBtns();
renderStatsIntoContent();
renderTestimonials();
toggleAccordion();

const size = SpinnerCanvas.width;
const center = size / 2;
const radius = center;
const slice = (Math.PI * 2) / CONSTANTS.SLICES;

let rotation = 0;
let spinning = false;

/**
 * Handles the window scroll event to toggle a scrolled class on the header container.
 * Adds the styling class when the page is scrolled past a specific threshold.
 *
 * @function handleScroll
 * @returns {void} This function does not return a value.
 */
function handleScroll() {
    if (!container) return;
    if (scrollY > 4) {
        container.classList.add('header__container--scrolled');
    } else {
        container.classList.remove('header__container--scrolled');
    }
}

window.addEventListener('scroll', handleScroll);

function toggleNavigation() {
    const isExpanded = toggleButton.getAttribute('aria-expanded') === 'true';
    const nextExpanded = !isExpanded;

    toggleButton.setAttribute('aria-expanded', nextExpanded);
    toggleButton.classList.toggle('header__toggle--active');
    navMenu.classList.toggle('header__nav--active');
}

const desktop = window.matchMedia('(min-width: 1025px)');

/**
 * Handles navigation menu open and closed state.
 * @returns {void}
 */
function handleOpenState(e) {
    if (e.matches) {
        toggleButton.classList.remove('header__toggle--active');
        navMenu.classList.remove('header__nav--active');
    }
}

desktop.addEventListener('change', handleOpenState);
handleOpenState(desktop);

/**
 * Toggle the mobile navigation menu open and closed state.
 */
function initializeNavigation() {
    if (toggleButton) {
        toggleButton.addEventListener('click', toggleNavigation);
    }

    window.addEventListener('keydown', (e) => {
        if (e.key !== CONSTANTS.KEYS.ESCAPE) return;

        const isTabletOrMobile = window.matchMedia(
            CONSTANTS.BREAKPOINTS.TABLET,
        ).matches;
        if (!isTabletOrMobile) return;

        const isExpanded =
            toggleButton?.getAttribute('aria-expanded') === 'true';
        if (!isExpanded) return;

        toggleButton.setAttribute('aria-expanded', 'false');
        toggleButton.classList.remove('header__toggle--active');
        navMenu.classList.remove('header__nav--active');
    });
}

/**
 * Handles the active state of nav links
 * @returns {void}
 */
function handleActiveState(e) {
    const link = e.target.closest('.header__link');

    if (link) {
        const active = container.querySelector('.header__link--active');

        if (active) {
            active.classList.remove('header__link--active');
        }

        link.classList.add('header__link--active');
    }
}

container.addEventListener('click', handleActiveState);

/**
 * Relocate the action buttons based on viewport width.
 * @returns {void}
 */
function handleActionBtns() {
    const actions = document.querySelector('.header__actions');
    const navMenu = document.querySelector('.header__nav');
    const mobile = window.matchMedia(CONSTANTS.BREAKPOINTS.MOBILE);

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

/**
 * Renders the caraousel and shows the testimonial cards
 * @returns {void}
 */
function renderTestimonials() {
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

            const fragment = document.createDocumentFragment();

            testimonialsArray.forEach((item) => {
                const clone = testimonialTemplate.content.cloneNode(true);

                const avatarImg = clone.querySelector(
                    '.testimonial-card__avatar',
                );
                if (avatarImg) {
                    avatarImg.src = 'assets/images/img-testimonial-user.svg';
                    avatarImg.alt = item.name;
                }

                const nameEl = clone.querySelector('.testimonial-card__name');
                if (nameEl) nameEl.textContent = item.name;

                const roleEl = clone.querySelector(
                    '.testimonial-card__role-wrapper--role',
                );
                if (roleEl) roleEl.textContent = item.role;

                const ratingEl = clone.querySelector(
                    '.testimonial-card__rating',
                );

                if (ratingEl) {
                    let starsHTML = '';
                    for (let i = 0; i < 5; i++) {
                        if (i < item.rating) {
                            starsHTML += '<i class="ic-star-rating"></i>';
                        }
                    }
                    ratingEl.innerHTML = starsHTML;
                }

                const descEl = clone.querySelector('.testimonial-card__text');
                if (descEl) descEl.textContent = item.description;

                fragment.appendChild(clone);
            });

            wrapper.innerHTML = '';
            wrapper.appendChild(fragment);
            initTestimonialSwiper();
            return;
        })
        .catch(() => {
            contentContainer.textContent = 'Failed to load content.';
        });
}

function toggleAccordion() {
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
            const isOpen = section.classList.contains(
                'footer__section--is-open',
            );

            document.querySelectorAll('.footer__section').forEach((el) => {
                if (el !== section) {
                    el.classList.remove('footer__section--is-open');
                    el.querySelector('.footer__heading-btn').setAttribute(
                        'aria-expanded',
                        'false',
                    );
                }
            });

            if (isOpen) {
                section.classList.remove('footer__section--is-open');
                this.setAttribute('aria-expanded', 'false');
            } else {
                section.classList.add('footer__section--is-open');
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
                el.querySelector('.footer__heading-btn').setAttribute(
                    'aria-expanded',
                    'false',
                );
            });
        }
    });
}

/**
 * Opens the modal
 * @returns {void}
 */
const openModal = async () => {
    modal.showModal();
    await fetchDeals();
    draw();
};

/**
 * closes the modal
 * @returns {void}
 */
const closeModal = () => {
    modal.close();
};

openButton?.addEventListener('click', openModal);
closeButton?.addEventListener('click', closeModal);
closeButtonForUnlockedDeals?.addEventListener('click', closeModal);

/**
 * Loading state for spinner
 * @returns {void}
 */
const spinnerLoading = () => {
    if (!spinnerLoader || !spinBtn) return;

    const spinPointer = document.querySelector('.spinner__spin-pointer');
    spinPointer?.classList.add('spinner__spin-pointer--loading');

    if (spinBtn) {
        spinBtn.disabled = true;
    }

    spinnerLoader.classList.remove('spinner__loading--hidden');
    spinnerLoader.textContent = 'Loading..';

    setTimeout(() => {
        spinnerLoader.classList.add('spinner__loading--hidden');

        const spinPointer = document.querySelector('.spinner__spin-pointer');
        spinPointer?.classList.remove('spinner__spin-pointer--loading');

        if (spinBtn) {
            spinBtn.disabled = false;
        }
    }, 1000);
};

openButton?.addEventListener('click', spinnerLoading);

/**
 * Shuffles the elements of the given array
 * @returns {number[]}
 */
const shuffle = (arr) => {
    const shuffled = [...arr];

    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }

    return shuffled;
};

/**
 * Handles the state where no spin is left
 * @returns {void}
 */
const handleNoSpinLeft = () => {
    if (selectRand.length < CONSTANTS.SLICES) {
        ctx.clearRect(0, 0, size, size);
        winLabel.remove();

        spinBtn.classList.add('spinner__spin-btn--disabled');
        spinBtn.disabled = true;
        spinBtn.textContent = 'No more spin left';
    } else {
        spinBtn.classList.remove('spinner__spin-btn--disabled');
        spinBtn.disabled = false;
        spinBtn.textContent = 'Spin';
    }
};

/**
 * Selects deals randomly, max number of deaks is 4
 * @returns {void}
 */
const selectRandom = () => {
    const wonPromoCodes = new Set(wonDeals.map((won) => won.promoCode));

    const filtered = shuffle(
        dealsData.filter((deal) => !wonPromoCodes.has(deal.promoCode)),
    );

    selectRand =
        filtered.length >= CONSTANTS.SLICES
            ? filtered.slice(0, 4)
            : [...filtered];

    handleNoSpinLeft();
};

/**
 * Calls the API to fetch the deals data
 * @returns {void}
 */
const fetchDeals = async () => {
    try {
        const res = await fetch(DEALS_URL);
        if (!res.ok) {
            throw new Error(`HTTP error! Status: ${res.status}`);
        }
        dealsData = await res.json();
        selectRandom();
        draw();
    } catch {
        if (winLabel) winLabel.innerText = 'Failed to load deals';
        if (spinBtn) {
            spinBtn.classList.add('spinner__spin-btn--disabled');
            spinBtn.disabled = true;
            spinBtn.innerText = 'Failed to load deals';
            spinBtn.blur();
            spinBtn.setAttribute('tabindex', '-1');
        }
    }
};

/**
 * Handles the text wrapping inside the slice of the spinner
 * @returns {void}
 */
const wrapText = (txt) => {
    const words = txt.split(' ');
    if (words.length === 2) {
        ctx.fillText(words[0], 0, -5);
        ctx.fillText(words[1], 0, 15);
    } else {
        const first = words.slice(0, 2).join(' ');
        const second = words.slice(2).join(' ');
        ctx.fillText(first, 0, -5);
        ctx.fillText(second, 0, 15);
    }
};

/**
 * Copies the given text
 * @returns {void}
 */
const copy = (e) => {
    const iconElement = e.target.closest('i');

    if (iconElement) {
        navigator.clipboard.writeText(iconElement.id);
        alert('Copied to clipboard');
    }
};

/**
 * Draws the graphics inside the canvas
 * @returns {void}
 */
function draw() {
    ctx.clearRect(0, 0, size, size);

    if (selectRand.length < CONSTANTS.SLICES) {
        return;
    }

    ctx.save();
    ctx.translate(radius, radius);
    ctx.rotate(rotation);

    selectRand.forEach((deal, idx) => {
        const start = idx * slice;
        const end = start + slice;
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.arc(0, 0, radius, start, end);
        ctx.closePath();
        ctx.fillStyle = colors[idx];
        ctx.fill();
        ctx.lineWidth = 6;
        ctx.strokeStyle = CONSTANTS.WHITE;
        ctx.stroke();

        ctx.save();
        ctx.rotate(start + slice / 2);
        ctx.textAlign = CONSTANTS.CENTER;
        ctx.font = CONSTANTS.DEAL_FONT;

        if (colors[idx] === CONSTANTS.YELLOW) {
            ctx.fillStyle = CONSTANTS.BLACK;
        } else {
            ctx.fillStyle = CONSTANTS.WHITE;
        }

        ctx.translate(radius * 0.65, 0);
        ctx.rotate(Math.PI / 2);
        wrapText(deal.label);
        ctx.restore();
    });
    ctx.restore();
}

allDeals.textContent = wonDeals.length;

/**
 * Stores the won deals in local storage
 * @returns {void}
 */
const storeData = (idx) => {
    wonDeals.push({ ...selectRand[idx], wonAt: Date.now() });
    localStorage.setItem('wonDeals', JSON.stringify(wonDeals));
};

/**
 * Renders the won deal
 * @returns {void}
 */
const renderCoupon = (idx) => {
    allDeals.textContent = wonDeals.length;
    winLabel.innerText = 'You won!';
    couponContainer.innerHTML = '';

    if (!couponTemplate || !couponContainer) return;

    const clone = couponTemplate.content.cloneNode(true);

    clone.querySelector('.deals__offer').textContent = selectRand[idx].label;
    clone.querySelector('.deals__validity').textContent =
        `Expires in ${selectRand[idx].validFor ?? 7} days`;
    clone.querySelector('.deals__code').textContent = selectRand[idx].promoCode;

    const icon = clone.querySelector('.ic-copy');
    if (icon) icon.id = selectRand[idx].promoCode;

    couponContainer.appendChild(clone);
};

couponContainer.addEventListener('click', copy);

const easeOutCubic = (t) => 1 - Math.pow(1 - t, 3);

/**
 * Handles the rotation animation
 * @returns {void}
 */
const animate = (timestamp) => {
    if (!spinning) return;

    const elapsed = timestamp - spinStartTime;
    const progress = Math.min(elapsed / spinDuration, 1);

    rotation =
        startRotation +
        (targetRotation - startRotation) * easeOutCubic(progress);

    draw();

    if (progress < 1) {
        rafId = requestAnimationFrame(animate);
    } else {
        spinning = false;
        spinBtn.disabled = false;

        storeData(winningIdx);
        renderCoupon(winningIdx);
    }
};

/**
 * Handles spinning state
 * @returns {void}
 */
const spin = () => {
    if (
        !spinBtn ||
        spinBtn.disabled ||
        spinBtn.classList.contains('spinner__spin-btn--disabled')
    ) {
        return;
    }

    winLabel.innerText = ' ';
    couponContainer.innerHTML = null;

    selectRandom();

    if (spinning || selectRand.length < CONSTANTS.SLICES) return;

    winningIdx = Math.floor(Math.random() * CONSTANTS.SLICES);

    const pointerAngle = 1.5 * Math.PI;
    const sliceCenter = winningIdx * slice + slice / 2;

    const currentModulo = rotation % (Math.PI * 2);
    let angleDiff = pointerAngle - sliceCenter - currentModulo;

    if (angleDiff < 0) {
        angleDiff += Math.PI * 2;
    }

    startRotation = rotation;
    const fullSpins = 6 * Math.PI * 2;
    targetRotation = rotation + fullSpins + angleDiff;

    spinStartTime = performance.now();
    spinning = true;
    spinBtn.disabled = true;

    if (rafId) cancelAnimationFrame(rafId);
    rafId = requestAnimationFrame(animate);
};

/**
 * Renders all the won deals
 * @returns {void}
 */
const showAllDeals = () => {
    unlockedDealsContainer.innerHTML = '';
    modalContainer.classList.add('deals__container--inactive');
    unlockedDealsPanel.classList.add('deals__container--active');

    if (!couponTemplate || !unlockedDealsContainer) return;

    const fragment = document.createDocumentFragment();

    wonDeals.forEach((deal) => {
        const clone = couponTemplate.content.cloneNode(true);

        clone.querySelector('.deals__offer').textContent = deal.label;

        const allowedDays = deal.validFor === null ? 7 : deal.validFor;

        const msPassed = Date.now() - (deal.wonAt || Date.now());
        const daysPassed = Math.floor(msPassed / (1000 * 60 * 60 * 24));

        const valid = allowedDays - daysPassed;

        if (valid <= 0) {
            clone
                .querySelector('.deals__coupon-wrapper')
                .classList.add('deals__coupon-wrapper--expired');
            const expiry = clone.querySelector('.deals__validity');
            expiry.textContent = 'Deal Expired';
            expiry.classList.add('deals__validity--expired');
        } else {
            clone.querySelector('.deals__validity').textContent =
                `Expires in ${valid} days`;
        }

        clone.querySelector('.deals__code').textContent = deal.promoCode;

        const icon = clone.querySelector('.ic-copy');
        if (icon) icon.id = deal.promoCode;

        fragment.appendChild(clone);
    });

    unlockedDealsContainer.appendChild(fragment);
};

unlockedDealsContainer.addEventListener('click', copy);

/**
 * Redirects to the previous section
 * @returns {void}
 */
const Back = () => {
    modalContainer.classList.remove('deals__container--inactive');
    unlockedDealsPanel.classList.remove('deals__container--active');
};

spinBtn.addEventListener('click', spin);

unlockedDealsBtn.addEventListener('click', showAllDeals);
backBtn.addEventListener('click', Back);
