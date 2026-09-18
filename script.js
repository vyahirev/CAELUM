const menuToggle = document.querySelector('.menu-toggle');
const menuOverlay = document.querySelector('.menu-overlay');
const menuItems = menuOverlay.querySelectorAll('.menu-item');
const magneticCursor = document.getElementById('cursor-mag');
const supportsMagneticCursor = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
let closingTimer;

const setMenuState = (isOpen) => {
    clearTimeout(closingTimer);
    menuToggle.textContent = isOpen ? 'CLOSE' : 'MENU';
    menuToggle.setAttribute('aria-expanded', String(isOpen));
    menuOverlay.setAttribute('aria-hidden', String(!isOpen));
    menuOverlay.classList.toggle('is-open', isOpen);
    menuOverlay.classList.toggle('is-closing', !isOpen);
    document.body.classList.toggle('menu-is-open', isOpen);

    if (!isOpen) {
        closingTimer = setTimeout(() => {
            menuOverlay.classList.remove('is-closing');
        }, 470);
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

document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && menuOverlay.classList.contains('is-open')) {
        setMenuState(false);
        menuToggle.focus();
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

    document.addEventListener('mousemove', (event) => {
        targetX = event.clientX;
        targetY = event.clientY;
        magneticCursor.classList.add('is-visible');

        const interactiveElement = event.target.closest?.(
            '[data-magnetic], a, button:not([disabled])'
        );
        setCursorHoverState(Boolean(interactiveElement));
    }, { passive: true });

    const animateCursor = () => {
        cursorX += (targetX - cursorX) * 0.35;
        cursorY += (targetY - cursorY) * 0.35;
        magneticCursor.style.left = `${cursorX}px`;
        magneticCursor.style.top = `${cursorY}px`;
        requestAnimationFrame(animateCursor);
    };

    animateCursor();
}
