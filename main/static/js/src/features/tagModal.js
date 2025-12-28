/** Tag modal logic (from main.js) */

export function injectTagModal() {
    if (document.getElementById('tag-explain-modal')) return;

    const modalHtml = `
    <div id="tag-explain-modal" onclick="closeTagExplanation(event)">
        <div class="tag-explain-card" onclick="event.stopPropagation()">
            <div class="tag-explain-bg">TAG</div>
            <div class="tag-explain-title" id="tm-title">称号名称</div>
            <div class="tag-explain-content" id="tm-content">
                解释文案在这里...
            </div>
            <button class="tag-explain-btn" onclick="closeTagExplanation(event)">知道了</button>
        </div>
    </div>`;

    document.body.insertAdjacentHTML('beforeend', modalHtml);
}

export function showTagExplanation(name, desc) {
    injectTagModal(); // 确保 HTML 存在

    document.getElementById('tm-title').innerText = name;
    document.getElementById('tm-content').innerText = desc;

    const modal = document.getElementById('tag-explain-modal');
    modal.style.display = 'flex';
    // 强制重绘以触发 transition
    modal.offsetHeight;
    modal.classList.add('show');
}

export function closeTagExplanation(e) {
    const modal = document.getElementById('tag-explain-modal');
    modal.classList.remove('show');
    setTimeout(() => {
        modal.style.display = 'none';
    }, 300);
}