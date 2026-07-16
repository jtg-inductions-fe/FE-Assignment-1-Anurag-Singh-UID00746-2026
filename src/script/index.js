import data from './utilities/data.json';

const DEALS_URL =
    'https://gist.githubusercontent.com/ameer-wajid-ali/1f29ebee4295cede36f8d74b45e576df/raw/122966c9a123861249f173911d8d93a76dc06d7a/';
const toggleButton = document.getElementById('header__toggle');
const navMenu = document.querySelector('.header__nav');
const container = document.querySelector('.header__container');
const modalContainer = document.querySelector('.deals__container');
const modal = document.getElementById('deals');
const backBtn = document.getElementById('back-button');
const dealsBody = document.querySelector('.deals__body');
const dealsFooter = document.querySelector('.deals__footer');
const openButton = document.getElementById('special-deals-btn');
const closeButton = document.getElementById('deals__close-btn');
const winLabel = document.querySelector('.deals__win-label');
const allDeals = document.querySelector('.deals__all-deals');
const canvas = document.getElementById('wheel');
const seccondPanel = document.getElementById('panel-two');
const spinBtn = document.getElementById('spinner__spin-btn');
const unlockedDeals = document.querySelector('.deals__unlocked');
const unlockedDealsBtn = document.getElementById('unlocked-deals');
const couponContainer = document.querySelector('.deals__unlocked-coupons');
const modalTitle = document.getElementById('deals-modal__title');
const modalDescription = document.querySelector('.deals__description');
const wheelLoader = document.getElementById('wheel-loading');
const ctx = canvas.getContext('2d');

const PINK = '#F4436C';
const PURPLE = '#7C3AED';
const YELLOW = '#FBBF24';
const BLUE = '#06B6D4';
const WHITE = '#ffffff';
const BLACK = '#000000';

let colors = [];
let selectRand = [];
let dealsData = [];
let validity;
let rafId = null;
let noSpin = false;

const wonDeals = JSON.parse(localStorage.getItem('wonDeals')) || [];

colors.push(PINK);
colors.push(PURPLE);
colors.push(YELLOW);
colors.push(BLUE);

initializeNavigation();
handleActionBtns();
renderStatsIntoContent();
renderTestimonials();
toggleAccordion();

const size = canvas.width;
const center = size / 2;
const radius = center;
const slice = (Math.PI * 2) / 4;

let rotation = 0;
let spinning = false;
let speed = 0;

function handleScroll() {
    if (container && scrollY > 4) {
        container.classList.add('header__container--scrolled');
    } else {
        container.classList.remove('header__container--scrolled');
    }
}

window.addEventListener('scroll', handleScroll);
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
}

function handleActiveState(e) {
    if (e.target.tagName === 'A') {
        const active = container.querySelector('.header__link--active');

        if (active) {
            active.classList.remove('header__link--active');
        }

        e.target.classList.add('header__link--active');
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
                                <div class="testimonial-card__role-wrapper">
                                    <span class="testimonial-card__role-wrapper--divider">/</span>
                                    <span class="testimonial-card__role-wrapper--role">${item.role}</span>
                                </div>
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
            const content = section.querySelector('.footer__content');
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

const openModal = () => {
    modal.showModal();
    draw();
};

const closeModal = () => {
    modal.close();
};

openButton.addEventListener('click', openModal);
closeButton.addEventListener('click', closeModal);

const shuffle = (arr) => {
    const shuffled = [...arr];

    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }

    return shuffled;
};

const fetchDeals = async () => {
    try {
        if (wheelLoader) wheelLoader.classList.remove('hidden');
        spinBtn.disabled = true;

        const res = await fetch(DEALS_URL);

        if (!res.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }

        dealsData = await res.json();
        selectRand = shuffle(dealsData).slice(0, 4);
        if (wheelLoader) wheelLoader.classList.add('hidden');
    } catch {
        if (wheelLoader) {
            wheelLoader.innerHTML = '<span>Failed to load deals</span>';
        }
    }
};

fetchDeals();

const selectRandom = () => {
    selectRand = shuffle(
        dealsData.filter(
            (_d) => !wonDeals.some((won) => won.promoCode === _d.promoCode),
        ),
    ).slice(0, 4);

    if (selectRand.length < 4) {
        console.log(selectRand);
        selectRand = [];
        ctx.clearRect(0, 0, size, size);
        spinBtn.classList.add('spinner__spin-btn--disabled');
        spinBtn.innerText = 'No more spin left';
        winLabel.remove();
    } else {
        spinBtn.classList.remove('spinner__spin-btn--disabled');
        spinBtn.innerText = 'Spin';
    }
};

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

function draw() {
    ctx.clearRect(0, 0, size, size);
    if (wonDeals.length >= 7) {
        return;
    }
    ctx.save();
    ctx.translate(radius, radius);
    ctx.rotate(rotation);

    selectRand.forEach((_d, _idx) => {
        const start = _idx * slice;
        const end = start + slice;

        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.arc(0, 0, radius, start, end);
        ctx.closePath();

        ctx.fillStyle = colors[_idx];
        ctx.fill();

        ctx.lineWidth = 6;
        ctx.strokeStyle = WHITE;
        ctx.stroke();
        ctx.save();

        ctx.rotate(start + slice / 2);
        ctx.textAlign = 'center';
        ctx.font = 'bold 12px Inter';

        if (colors[_idx] === YELLOW) {
            ctx.fillStyle = BLACK;
        } else {
            ctx.fillStyle = WHITE;
        }

        ctx.translate(radius * 0.65, 0);
        ctx.rotate(Math.PI / 2);

        wrapText(_d.label);
        ctx.restore();
    });

    ctx.restore();
}

allDeals.textContent = wonDeals.length;

const showCoupon = () => {
    const twoPi = Math.PI * 2;
    const rot = ((rotation % twoPi) + twoPi) % twoPi;
    const ptrAngle = twoPi - rot + ((Math.PI + Math.PI / 2) % twoPi);
    const idx = Math.floor(ptrAngle / slice) % 4;

    const dealWithTimestamp = {
        ...selectRand[idx],
        wonAt: Date.now(),
    };
    wonDeals.push(selectRand[idx]);
    localStorage.setItem('wonDeals', JSON.stringify(wonDeals));

    allDeals.textContent = wonDeals.length;

    const coupon = selectRand[idx];
    winLabel.innerText = 'You won!';

    let couponWrapper = document.createElement('div');
    couponWrapper.className = 'deals__coupon-wrapper';

    const offerWrapper = document.createElement('div');
    offerWrapper.className = 'deals__offer-wrapper';

    const offerText = document.createElement('p');
    offerText.className = 'deals__offer';
    offerText.textContent = selectRand[idx].label;

    const validityText = document.createElement('p');
    validityText.className = 'deals__validity';

    if (selectRand[idx].validFor === null) {
        validity = '7';
    } else {
        validity = selectRand[idx].validFor;
    }

    validityText.innerText = 'Expires in' + ' ' + validity + ' ' + 'days';

    offerWrapper.append(offerText, validityText);

    const codeWrapper = document.createElement('div');
    codeWrapper.className = 'deals__code-wrapper';

    const codeText = document.createElement('p');
    codeText.className = 'deals__code';
    codeText.innerText = selectRand[idx].promoCode;

    const copyBtn = document.createElement('i');
    copyBtn.className = 'ic-copy';
    copyBtn.id = selectRand[idx].promoCode;

    codeWrapper.append(codeText, copyBtn);
    couponWrapper.append(offerWrapper, codeWrapper);

    couponContainer.appendChild(couponWrapper);
};

couponContainer.addEventListener('click', (e) => {
    if (e.target.tagName.toUpperCase() === 'I') {
        copyToClipboard(e.target.id);
        alert('Copied');
    }
});

const animate = () => {
    if (!spinning) return;

    rotation = rotation + speed;
    speed = speed * 0.985;
    spinBtn.disabled = true;

    draw();

    if (speed < 0.002) {
        spinning = false;
        spinBtn.disabled = false;
        showCoupon();
        return;
    }

    rafId = requestAnimationFrame(animate);
};

const spin = () => {
    winLabel.innerText = ' ';
    couponContainer.innerHTML = null;

    selectRandom();

    if (spinning) return;

    speed = 0.35 + Math.random() * 0.15;

    if (selectRand.length >= 4) {
        spinning = true;
    } else {
        selectRand = [];
    }

    if (rafId) cancelAnimationFrame(rafId);
    animate();
};

if (wonDeals.length >= 7) {
    spinBtn.classList.add('spinner__spin-btn--disabled');
    spinBtn.innerText = 'No more spin left';
}

const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
};

const showAllDeals = () => {
    unlockedDeals.innerHTML = '';
    modalContainer.classList.add('deals__container--inactive');
    seccondPanel.classList.add('deals__container--active');

    for (let i = 0; i < wonDeals.length; i++) {
        let couponWrap = document.createElement('div');
        couponWrap.className = 'deals__coupon-wrapper';

        const offerWrap = document.createElement('div');
        offerWrap.className = 'deals__offer-wrapper';

        const offer = document.createElement('p');
        offer.className = 'deals__offer';
        offer.textContent = wonDeals[i].label;

        const valid = document.createElement('p');
        valid.className = 'deals__validity';

        const allowedDays =
            wonDeals[i].validFor === null ? 7 : wonDeals[i].validFor;

        const msPassed = Date.now() - (wonDeals[i].wonAt || Date.now());
        const daysPassed = Math.floor(msPassed / (1000 * 60 * 60 * 24));

        const validity = allowedDays - daysPassed;

        if (validity <= 0) {
            couponWrap.classList.add('deals__coupon-wrapper--expired');
            valid.innerText = 'Deal Expired';
            valid.classList.add('deals__validity--expired');
        } else {
            valid.innerText = 'Expires in ' + validity + ' days';
        }

        offerWrap.append(offer, valid);

        const codeWrap = document.createElement('div');
        codeWrap.className = 'deals__code-wrapper';

        const code = document.createElement('p');
        code.className = 'deals__code';
        code.innerText = wonDeals[i].promoCode;

        const copy = document.createElement('i');
        copy.className = 'ic-copy';
        copy.id = wonDeals[i].promoCode;

        codeWrap.append(code, copy);
        couponWrap.append(offerWrap, codeWrap);

        unlockedDeals.appendChild(couponWrap);
    }
};

unlockedDeals.addEventListener('click', (e) => {
    if (e.target.tagName.toUpperCase() === 'I') {
        copyToClipboard(e.target.id);
        alert('Copied');
    }
});

const Back = () => {
    modalContainer.classList.remove('deals__container--inactive');
    seccondPanel.classList.remove('deals__container--active');
};

spinBtn.addEventListener('click', spin);

unlockedDealsBtn.addEventListener('click', showAllDeals);
backBtn.addEventListener('click', Back);
