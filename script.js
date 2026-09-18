const menuToggle = document.querySelector('.menu-toggle');
const menuOverlay = document.querySelector('.menu-overlay');
const menuItems = menuOverlay.querySelectorAll('.menu-item');
const cards = document.querySelectorAll('.card');
const productOverlay = document.getElementById('product-overlay');
const productOverlayClose = productOverlay.querySelector('.product-overlay-close');
const magneticCursor = document.getElementById('cursor-mag');
const supportsMagneticCursor = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
let closingTimer;

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
