/** Poster & photo picker logic (from main.js) */

// 图片替换标志变量
let hasUserReplacedImg = false;

export function closePosterModal() {
    document.getElementById('poster-modal').style.display = 'none';
}

export function makePoster() {
    closeImgChoice();
    closePhotoPicker();

    const data = window.currentUserData;
    if(!data) { alert("请先查询数据"); return; }

    const modal = document.getElementById('poster-modal');
    modal.style.display = 'flex';
    modal.classList.add('animate__animated', 'animate__fadeIn');

    // === 1. 填充不可编辑文字 ===
    const nameEl = document.getElementById('p-name');
    const descEl = document.getElementById('p-desc');
    const tagDisplay = document.getElementById('p-tag-display'); // 标签 Display

    // 初始化标签默认值
    if(tagDisplay.innerText === "年度记忆") {
        tagDisplay.innerText = data.is_volunteer ? "年度记忆" : "期待有你";
    }

    if (data.is_volunteer) {
        nameEl.innerText = data.name;
        descEl.innerHTML = `这一年，你用行动诠释了温暖<br>感谢你，世界因你而美好`;

        document.getElementById('p-data1').innerText = data.totalHours;
        document.getElementById('p-label1').innerText = "服务时长";
        // 核心领域展示兜底
        let coreType = data.mainType;

        // 如果是“其他 / others”，证书统一显示为“综合”
        if (coreType === '其他' || coreType === 'others') {
            coreType = '综合';
        }

        document.getElementById('p-data2').innerText = coreType;
        document.getElementById('p-label2').innerText = "核心领域";
    } else {
        nameEl.innerText = "未来的伙伴";
        descEl.innerHTML = `2024年的故事里还没找到你，<br>愿2025年，我们能并肩同行。`;

        document.getElementById('p-data1').innerText = data.org_data.total_people || 500;
        document.getElementById('p-label1').innerText = "汇聚爱心";
        document.getElementById('p-data2').innerText = data.org_data.total_events;
        document.getElementById('p-label2').innerText = "公益活动";
    }

    // === 2. 默认图片加载 ===
    if (!hasUserReplacedImg) {
        let targetUrl = "";

        // 判断是否有志愿活动数据
        if (data.is_volunteer && data.activities && data.activities.length > 0) {

            // === 核心修改开始：寻找时长最长的活动 ===

            // 1. 克隆数组（[...]）防止影响原有的时间轴顺序
            // 2. sort排序：按 hours 字段降序排列 (从大到小)
            //    注意：这里假设后端返回的 activity 对象中有 hours 字段，如果没有，则默认按原顺序
            const sortedActs = [...data.activities].sort((a, b) => {
                const hA = parseFloat(a.hours) || 0;
                const hB = parseFloat(b.hours) || 0;
                return hB - hA;
            });

            // 3. 取出时长最长的那个活动
            const bestAct = sortedActs[0];

            targetUrl = bestAct.img;

            // 4. 将海报左上角的标签文字，自动改成这个活动的名称
            //    (仅当标签还未被用户手动修改过时)
            if(tagDisplay.innerText === "年度记忆" || tagDisplay.innerText === "期待有你") {
                // 截取前6个字防止太长换行
                tagDisplay.innerText = bestAct.title;
            }

            // === 核心修改结束 ===

        } else if (!data.is_volunteer && data.org_data.public_gallery && data.org_data.public_gallery.length > 0) {
            // 非志愿者，取公用图库第一张
            targetUrl = data.org_data.public_gallery[0];
        } else {
            // 兜底默认图
            targetUrl = "https://images.unsplash.com/photo-1524178232363-1fb2b075b655?w=400";
        }

        const bgDiv = document.getElementById('p-img-bg');
        bgDiv.style.backgroundColor = "#eee";

        const tempImg = new Image();
        tempImg.crossOrigin = "Anonymous";
        // 加时间戳防止缓存问题
        tempImg.src = targetUrl + (targetUrl.includes('?') ? '&' : '?') + 't=' + new Date().getTime();

        tempImg.onload = function() {
            bgDiv.style.backgroundImage = `url("${tempImg.src}")`;
        };
    }
}



export function openImgChoice() {
    const data = window.currentUserData;

    // 没数据就直接走上传（保持你原逻辑的兜底）
    if (!data) { triggerUpload(); return; }

    // 没有时光掠影图片，也直接走上传
    const hasGallery = data.is_volunteer && data.activities && data.activities.length > 0;

    // 控制“从时光掠影选择”按钮可用性
    const btn = document.getElementById('btn-pick-from-gallery');
    if (btn) {
        btn.style.display = hasGallery ? 'block' : 'none';
    }

    const overlay = document.getElementById('img-choice-overlay');
    if (overlay) overlay.style.display = 'flex';
}

export function closeImgChoice() {
    const overlay = document.getElementById('img-choice-overlay');
    if (overlay) overlay.style.display = 'none';
}

export function selectPosterImageFromGallery(url, title) {
    const bgDiv = document.getElementById('p-img-bg');
    const tagDisplay = document.getElementById('p-tag-display');
    if (!bgDiv) return;

    // 预加载 + CORS
    const tempImg = new Image();
    tempImg.crossOrigin = "Anonymous";
    tempImg.src = url + (url.includes('?') ? '&' : '?') + 't=' + new Date().getTime();
    tempImg.onload = function() {
        bgDiv.style.backgroundImage = `url("${tempImg.src}")`;
        bgDiv.style.backgroundColor = "#eee";
    };


    if (tagDisplay) {
        const nextTag = (title || "年度记忆").toString().trim();
        tagDisplay.innerText = nextTag;
    }

    // 标记：用户已经手动换过图，避免 makePoster 默认图覆盖
    hasUserReplacedImg = true;
}

export function triggerUpload() {
    document.getElementById('image-upload-input').click();
}

export function handleImageUpload(input) {
    if (input.files && input.files[0]) {
        const file = input.files[0];
        const reader = new FileReader();

        reader.onload = function(e) {
            // 1. 替换背景图
            document.getElementById('p-img-bg').style.backgroundImage = `url("${e.target.result}")`;
            hasUserReplacedImg = true;

            // 2. 延时一点点弹出输入框，让用户先看到图变了
            setTimeout(() => {
                const newTag = prompt("给这张照片起个标题吧 (最多6个字)：", "我的独家记忆");
                if (newTag && newTag.trim() !== "") {
                    document.getElementById('p-tag-display').innerText = newTag.trim().substring(0, 6);
                }
            }, 300);
        };
        reader.readAsDataURL(file);
    }
    // 清空 input 这里的 value 并不是必须的，但为了能重复选同一张图可以清空
    input.value = '';
}

export function openPhotoPicker() {
    closeImgChoice();

    const data = window.currentUserData;
    if (!data || !data.activities || data.activities.length === 0) {
        // 保险兜底：没有可选图就上传
        triggerUpload();
        return;
    }

    buildPhotoPickerGrid(data.activities);

    const overlay = document.getElementById('photo-picker-overlay');
    if (overlay) overlay.style.display = 'flex';
}

export function closePhotoPicker() {
    const overlay = document.getElementById('photo-picker-overlay');
    if (overlay) overlay.style.display = 'none';
}

export function buildPhotoPickerGrid(activities) {
    const grid = document.getElementById('photo-picker-grid');
    if (!grid) return;

    grid.innerHTML = "";

    activities.forEach((act) => {
        const div = document.createElement('div');
        div.className = "photo-thumb";


        const title = (act.title || "时光掠影").toString().trim();
        const imgUrl = act.img;

        div.innerHTML = `
            <img src="${imgUrl}" crossorigin="anonymous" alt="Moment">
            <div class="photo-thumb-title">${title}</div>
        `;

        div.onclick = () => {
            selectPosterImageFromGallery(imgUrl, act.title);
            closePhotoPicker();
        };

        grid.appendChild(div);
    });
}

// === 修复版 savePosterImage：去除白边 + 高清 + 进度提示 ===
export function savePosterImage() {
    const source = document.getElementById('poster-card');
    const btn = document.querySelector('.btn-save-img');

    // 1. 获取元素精准尺寸 (不包含 margin)
    // 这一步很关键，强制告诉 html2canvas 只要这么大，不要多余的白边
    const cardWidth = source.offsetWidth;
    const cardHeight = source.offsetHeight;

    // 2. UI 交互：显示加载状态
    const originText = btn.innerHTML;
    btn.innerHTML = "正在绘制...";
    btn.classList.add('btn-loading'); // 触发 CSS 旋转圈

    // 3. 延时执行，给 UI 渲染留出时间
    setTimeout(() => {
        // 设为 3 倍或 4 倍图，保证手机相册查看清晰
        const dpr = window.devicePixelRatio || 1;
        const scale = Math.max(dpr, 3);

        html2canvas(source, {
            // === 核心修复：强制裁剪 ===
            width: cardWidth,
            height: cardHeight,
            scale: scale,

            useCORS: true,
            allowTaint: false,
            backgroundColor: null, // 背景透明，防止填充白色底色

            // === 核心修复：清理克隆节点的样式 ===
            onclone: function(clonedDoc) {
                const clonedCard = clonedDoc.getElementById('poster-card');

                // 1. 移除 transform (防止缩放导致的偏移和留白)
                clonedCard.style.transform = 'none';

                // 2. 移除 margin (防止外边距变成白边)
                clonedCard.style.margin = '0';

                // 3. 移除 box-shadow (防止截图为了容纳阴影而扩大画布)
                clonedCard.style.boxShadow = 'none';

                // 4. 隐藏不需要的 UI 元素
                const hintIcon = clonedCard.querySelector('.edit-hint-icon');
                if (hintIcon) hintIcon.style.display = 'none';

                // 5. 确保圆角（如果需要图片是圆角的，这里确保 overflow 为 hidden）
                // 注意：生成的 JPG/PNG 如果背景不透明，圆角外部会是黑/白色，
                // 如果想要完美的圆角透明 PNG，需要上面的 backgroundColor: null
                clonedCard.style.borderRadius = '12px';
            }
        }).then(canvas => {
            // 4. 渲染完成
            const finalImg = document.getElementById('final-image');
            finalImg.src = canvas.toDataURL("image/png");

            // 5. 显示结果层
            const overlay = document.getElementById('final-result-overlay');
            overlay.classList.add('show');

            function resetBtn() {
                btn.innerHTML = originText;
                btn.classList.remove('btn-loading');
            }
            resetBtn();
        }).catch(err => {
            console.error("生成失败", err);
            alert("生成失败，请稍后重试");
            function resetBtn() {
                btn.innerHTML = originText;
                btn.classList.remove('btn-loading');
            }
            resetBtn();
        });

    }, 100);
}