const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const supportsFinePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;

const elements = {
    body: document.body,
    loadingScreen: document.getElementById('loading-screen'),
    loadingLogo: document.querySelector('.loading-logo'),
    hero: document.querySelector('.hero'),
    heroVideo: document.querySelector('.hero-video'),
    menuToggle: document.querySelector('.menu-toggle'),
    menuOverlay: document.querySelector('.menu-overlay'),
    productOverlay: document.getElementById('product-overlay'),
    productOverlayClose: document.querySelector('.product-overlay-close'),
    cursor: document.getElementById('cursor-mag'),
    cards: document.querySelectorAll('.card')
};

const menuItems = elements.menuOverlay.querySelectorAll('.menu-item');
let menuClosingTimer;

const initLoadingScreen = () => {
    const { loadingScreen, loadingLogo, body } = elements;

    const startLogoReveal = () => {
        if (prefersReducedMotion) {
            loadingLogo.style.opacity = '1';
            return;
        }

        if (window.gsap && window.SplitText) {
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
    };

    const finishLoading = () => {
        setTimeout(startLogoReveal, 200);

        setTimeout(() => {
            loadingScreen.classList.add('is-complete');
            loadingScreen.style.opacity = '0';
            body.classList.remove('loading-is-active');
        }, 1600);
    };

    const waitForPageReady = () => {
        if (document.readyState === 'complete') {
            document.fonts.ready.then(finishLoading);
            return;
        }

        window.addEventListener('load', () => {
            document.fonts.ready.then(finishLoading);
        }, { once: true });
    };

    waitForPageReady();
};

const initHero = () => {
    const { hero, heroVideo } = elements;
    let opacityFrame;
    let currentOpacity = 1;
    let targetOpacity = 1;

    const showVideo = () => {
        heroVideo.classList.add('is-ready');
    };

    heroVideo.addEventListener('loadeddata', showVideo, { once: true });
    heroVideo.addEventListener('canplay', showVideo, { once: true });
    heroVideo.addEventListener('error', () => {
        heroVideo.classList.remove('is-ready');
    });

    if (heroVideo.readyState >= 2) {
        showVideo();
    }

    const updateOpacity = () => {
        const progress = Math.min(
            Math.max(window.scrollY / (hero.offsetHeight * 0.8), 0),
            1
        );

        targetOpacity = 1 - progress;
        currentOpacity += (targetOpacity - currentOpacity) * 0.2;
        hero.style.setProperty('--hero-opacity', currentOpacity.toFixed(3));

        if (Math.abs(targetOpacity - currentOpacity) > 0.001) {
            opacityFrame = requestAnimationFrame(updateOpacity);
            return;
        }

        currentOpacity = targetOpacity;
        hero.style.setProperty('--hero-opacity', currentOpacity.toFixed(3));
        opacityFrame = undefined;
    };

    const requestOpacityUpdate = () => {
        if (opacityFrame === undefined) {
            opacityFrame = requestAnimationFrame(updateOpacity);
        }
    };

    window.addEventListener('scroll', requestOpacityUpdate, { passive: true });
    window.addEventListener('resize', requestOpacityUpdate);
    updateOpacity();
};

const initCardReveal = () => {
    const { cards } = elements;
    document.documentElement.classList.add('cards-reveal-ready');

    if (prefersReducedMotion) {
        cards.forEach((card) => card.classList.add('is-visible'));
        return;
    }

    const observer = new IntersectionObserver((entries, intersectionObserver) => {
        entries.forEach((entry) => {
            if (!entry.isIntersecting) {
                return;
            }

            entry.target.classList.add('is-visible');
            intersectionObserver.unobserve(entry.target);
        });
    }, {
        threshold: 0.15,
        rootMargin: '0px 0px -8% 0px'
    });

    cards.forEach((card) => observer.observe(card));
};

const setMenuState = (isOpen) => {
    const { body, menuToggle, menuOverlay } = elements;

    clearTimeout(menuClosingTimer);
    menuToggle.textContent = isOpen ? 'ЗАКРЫТЬ' : 'МЕНЮ';
    menuToggle.setAttribute('aria-expanded', String(isOpen));
    menuOverlay.setAttribute('aria-hidden', String(!isOpen));
    menuOverlay.classList.toggle('is-open', isOpen);
    menuOverlay.classList.toggle('is-closing', !isOpen);
    body.classList.toggle('menu-is-open', isOpen);

    if (!isOpen) {
        menuClosingTimer = setTimeout(() => {
            menuOverlay.classList.remove('is-closing');
        }, 560);
    }
};

const initMenu = () => {
    const { menuToggle } = elements;

    menuToggle.addEventListener('click', () => {
        setMenuState(!elements.menuOverlay.classList.contains('is-open'));
    });

    menuItems.forEach((menuItem) => {
        menuItem.addEventListener('click', () => setMenuState(false));
    });
};

const setProductOverlayState = (isOpen) => {
    const { body, productOverlay } = elements;

    productOverlay.classList.toggle('is-open', isOpen);
    productOverlay.setAttribute('aria-hidden', String(!isOpen));
    body.classList.toggle('product-overlay-is-open', isOpen);
};

const initProductOverlay = () => {
    const { cards, productOverlayClose } = elements;

    cards.forEach((card) => {
        card.addEventListener('click', () => setProductOverlayState(true));
    });

    productOverlayClose.addEventListener('click', () => setProductOverlayState(false));
};

const initKeyboardControls = () => {
    document.addEventListener('keydown', (event) => {
        if (event.key === 'Escape' && elements.menuOverlay.classList.contains('is-open')) {
            setMenuState(false);
            elements.menuToggle.focus();
        } else if (event.key === 'Escape' && elements.productOverlay.classList.contains('is-open')) {
            setProductOverlayState(false);
            elements.productOverlayClose.focus();
        }
    });
};

const initCustomCursor = () => {
    if (!supportsFinePointer) {
        return;
    }

    const { body, cursor } = elements;
    let cursorX = 0;
    let cursorY = 0;
    let targetX = 0;
    let targetY = 0;

    const interactiveSelector = '[data-magnetic], a, button:not([disabled]), .card';

    body.style.cursor = 'none';

    document.addEventListener('mousemove', (event) => {
        targetX = event.clientX;
        targetY = event.clientY;
        cursor.classList.add('is-visible');
        cursor.classList.toggle('is-hovering', Boolean(event.target.closest?.(interactiveSelector)));
    }, { passive: true });

    const animateCursor = () => {
        cursorX += (targetX - cursorX) * 0.18;
        cursorY += (targetY - cursorY) * 0.18;
        cursor.style.left = `${cursorX}px`;
        cursor.style.top = `${cursorY}px`;
        requestAnimationFrame(animateCursor);
    };

    animateCursor();
};

initLoadingScreen();
initHero();
initCardReveal();
initMenu();
initProductOverlay();
initKeyboardControls();
initCustomCursor();
