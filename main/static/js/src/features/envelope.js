/** Envelope open interaction (from main.js) */

export function openEnvelope(el) {
    if(el.classList.contains('envelope-open')) return; // 已经开过了

    // 播放一个清脆的音效(可选，添加错误处理防止文件不存在)
    try {
        var audio = new Audio('paper_tear.mp3');
        audio.play().catch(function() {
            // 忽略播放错误
        });
    } catch (e) {
        // 忽略音频加载错误
    }

    el.classList.add('envelope-open');

    // 隐藏提示文字
    el.nextElementSibling.style.display = 'none';
}
