const menuToggle = document.querySelector('.menu-toggle');
const menuOverlay = document.querySelector('.menu-overlay');
const menuItems = menuOverlay.querySelectorAll('.menu-item');
const cards = document.querySelectorAll('.card');
const productOverlay = document.getElementById('product-overlay');
const productOverlayClose = productOverlay.querySelector('.product-overlay-close');
const magneticCursor = document.getElementById('cursor-mag');
const supportsMagneticCursor = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
const loadingScreen = document.getElementById('loading-screen');
const loadingLogo = document.querySelector('.loading-logo');
let closingTimer;

const finishLoading = () => {
    setTimeout(() => {
        if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
            loadingLogo.style.opacity = '1';
        } else if (window.gsap && window.SplitText) {
            const splitLogo = new SplitText(loadingLogo, { type: 'chars' });
            gsap.set(splitLogo.chars, {
                opacity: 0,
                y: 24,
                filter: 'blur(6px)'
            });
            loadingLogo.style.opacity = '1';

            gsap.to(splitLogo.chars, {
                opacity: 1,
                y: 0,
                filter: 'blur(0px)',
                duration: 0.8,
                stagger: 0.1,
                ease: 'power3.out',
                clearProps: 'transform'
            });
        } else {
            console.warn('GSAP SplitText is unavailable; showing the loading logo without the reveal animation.');
            loadingLogo.style.opacity = '1';
        }
    }, 200);

    setTimeout(() => {
        loadingScreen.classList.add('is-complete');
        loadingScreen.style.opacity = '0';
        document.body.classList.remove('loading-is-active');
    }, 1600);
};

if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    finishLoading();
} else if (document.readyState === 'complete') {
    document.fonts.ready.then(finishLoading);
} else {
    window.addEventListener('load', () => {
        document.fonts.ready.then(finishLoading);
    }, { once: true });
}

document.documentElement.classList.add('cards-reveal-ready');
const hero = document.querySelector('.hero');
const heroVideo = document.querySelector('.hero-video');

const showHeroVideo = () => {
    heroVideo.classList.add('is-ready');
};

heroVideo.addEventListener('loadeddata', showHeroVideo, { once: true });
heroVideo.addEventListener('canplay', showHeroVideo, { once: true });

if (heroVideo.readyState >= 2) {
    showHeroVideo();
}

heroVideo.addEventListener('error', () => {
    heroVideo.classList.remove('is-ready');
});

let heroOpacityFrame;
let heroOpacity = 1;
let targetHeroOpacity = 1;

const updateHeroOpacity = () => {
    const progress = Math.min(
        Math.max(window.scrollY / (hero.offsetHeight * 0.8), 0),
        1
    );
    targetHeroOpacity = 1 - progress;
    heroOpacity += (targetHeroOpacity - heroOpacity) * 0.2;

    hero.style.setProperty('--hero-opacity', heroOpacity.toFixed(3));

    if (Math.abs(targetHeroOpacity - heroOpacity) > 0.001) {
        heroOpacityFrame = requestAnimationFrame(updateHeroOpacity);
    } else {
        heroOpacity = targetHeroOpacity;
        hero.style.setProperty('--hero-opacity', heroOpacity.toFixed(3));
        heroOpacityFrame = undefined;
    }
};

const requestHeroOpacityUpdate = () => {
    if (heroOpacityFrame === undefined) {
        heroOpacityFrame = requestAnimationFrame(updateHeroOpacity);
    }
};

window.addEventListener('scroll', requestHeroOpacityUpdate, { passive: true });
window.addEventListener('resize', requestHeroOpacityUpdate);
updateHeroOpacity();

if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    cards.forEach((card) => card.classList.add('is-visible'));
} else {
    const cardRevealObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach((entry) => {
            if (!entry.isIntersecting) {
                return;
            }

            entry.target.classList.add('is-visible');
            observer.unobserve(entry.target);
        });
    }, {
        threshold: 0.15,
        rootMargin: '0px 0px -8% 0px'
    });

    cards.forEach((card) => cardRevealObserver.observe(card));
}

const setMenuState = (isOpen) => {
    clearTimeout(closingTimer);
    menuToggle.textContent = isOpen ? 'ЗАКРЫТЬ' : 'МЕНЮ';
    menuToggle.setAttribute('aria-expanded', String(isOpen));
    menuOverlay.setAttribute('aria-hidden', String(!isOpen));
    menuOverlay.classList.toggle('is-open', isOpen);
    menuOverlay.classList.toggle('is-closing', !isOpen);
    document.body.classList.toggle('menu-is-open', isOpen);

    if (!isOpen) {
        closingTimer = setTimeout(() => {
            menuOverlay.classList.remove('is-closing');
        }, 560);
    }
};

menuToggle.addEventListener('click', () => {
    const isOpen = menuOverlay.classList.contains('is-open');
    setMenuState(!isOpen);
});

menuItems.forEach((menuItem) => {
    menuItem.addEventListener('click', () => {
        setMenuState(false);
    });
});

const setProductOverlayState = (isOpen) => {
    productOverlay.classList.toggle('is-open', isOpen);
    productOverlay.setAttribute('aria-hidden', String(!isOpen));
    document.body.classList.toggle('product-overlay-is-open', isOpen);
};

cards.forEach((card) => {
    card.addEventListener('click', () => {
        setProductOverlayState(true);
    });
});

productOverlayClose.addEventListener('click', () => {
    setProductOverlayState(false);
});

document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && menuOverlay.classList.contains('is-open')) {
        setMenuState(false);
        menuToggle.focus();
    } else if (event.key === 'Escape' && productOverlay.classList.contains('is-open')) {
        setProductOverlayState(false);
        productOverlayClose.focus();
    }
});

if (supportsMagneticCursor) {
    let cursorX = 0;
    let cursorY = 0;
    let targetX = 0;
    let targetY = 0;

    const setCursorHoverState = (isHovered) => {
        magneticCursor.classList.toggle('is-hovering', isHovered);
    };

    document.body.style.cursor = 'none';

    const interactiveSelector = '[data-magnetic], a, button:not([disabled]), .card';

    document.addEventListener('mousemove', (event) => {
        targetX = event.clientX;
        targetY = event.clientY;
        magneticCursor.classList.add('is-visible');

        const interactiveElement = event.target.closest?.(interactiveSelector);
        setCursorHoverState(Boolean(interactiveElement));
    }, { passive: true });

    const animateCursor = () => {
        cursorX += (targetX - cursorX) * 0.18;
        cursorY += (targetY - cursorY) * 0.18;
        magneticCursor.style.left = `${cursorX}px`;
        magneticCursor.style.top = `${cursorY}px`;
        requestAnimationFrame(animateCursor);
    };

    animateCursor();
}
