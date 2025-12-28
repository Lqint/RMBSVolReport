/** Misc helpers (from main.js) */

export function addScrollHint() {
    const slides = document.querySelectorAll('.swiper-slide');
    slides.forEach((slide, index) => {
        if (index === 1) { // Start from the third slide (index 2)
            const hintDiv = document.createElement('div');
            hintDiv.className = 'scroll-hint';
            hintDiv.textContent = '↓ 继续向下查看更多';
            slide.appendChild(hintDiv);
        }
    });
}

export function resetBtn() {
    // This function is now handled in the fetchData closure
    // and no longer needs to be exported as a standalone function
    console.warn('resetBtn is deprecated, use closure instead');
}

export function resetButton() {
    // Reset the seal button state
    const wrapper = document.querySelector('.btn-seal-wrapper');
    const btn = document.querySelector('.btn-seal');
    const ink = document.querySelector('.seal-ink');
    const btnText = document.querySelector('.btn-text');
    
    if (wrapper && btn && ink && btnText) {
        wrapper.onclick = window.fetchData;
        btn.classList.remove('seal-active');
        ink.classList.remove('ink-visible');
        btnText.style.opacity = 1;
    }
}