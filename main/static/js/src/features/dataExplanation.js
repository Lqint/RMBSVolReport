/** Data explanation modal (from main.js) */

export function openDataExplanation() {
    const modal = document.getElementById('data-explanation-modal');
    if(modal) {
        modal.style.display = 'flex';
        modal.classList.add('animate__animated', 'animate__fadeIn');
    }
}

export function closeDataExplanation() {
    const modal = document.getElementById('data-explanation-modal');
    if(modal) {
        modal.style.display = 'none';
    }
}