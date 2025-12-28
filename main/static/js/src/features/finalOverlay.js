/** Final overlay (from main.js) */

export function closeFinalOverlay() {
    const overlay = document.getElementById('final-result-overlay');
    overlay.classList.remove('show');
    // 等动画结束后清除 src 释放内存(可选)
    // setTimeout(() => { document.getElementById('final-image').src = ''; }, 500);
}
