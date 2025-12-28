/** Heatmap tip (from main.js: showHeatmapTip) */
export function showHeatmapTip(date, content, el) {
    const box = document.getElementById('heatmap-info-box');

    // 1. 更新内容：使用 innerHTML 插入带样式的结构
    box.innerHTML = `
        <div class="hm-info-date">${date}</div>
        <div class="hm-info-content">${content}</div>
    `;

    // 2. 视觉反馈：高亮当前格子
    document.querySelectorAll('.heatmap-cell').forEach(c => c.classList.remove('active'));
    el.classList.add('active');

    // 3. 边框高亮一下信息栏，提示用户看下面
    box.style.borderColor = "var(--ruc-red)";
    box.style.backgroundColor = "rgba(255, 255, 255, 0.9)";

    // (可选) 2秒后恢复边框颜色，但保留文字内容
    setTimeout(() => {
        box.style.borderColor = "rgba(166, 28, 38, 0.3)";
        box.style.backgroundColor = "rgba(255, 255, 255, 0.5)";
    }, 500);
}
