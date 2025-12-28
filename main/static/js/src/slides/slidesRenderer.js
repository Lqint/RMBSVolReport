import { state } from "../state.js";
import { initRadar } from "../features/radarChart.js";
import { initConstellation } from "../features/constellation.js";
import { showHeatmapTip } from "../features/heatmap.js";

/**
 * Generated from original main.js (function generateDynamicSlides) and lightly adapted:
 * - uses state.swiper instead of global swiperV
 * - imports initRadar/initConstellation/showHeatmapTip
 */
export function generateDynamicSlides(data) {
    if (state.swiper.slides.length > 2) {
        state.swiper.removeSlide([2, 3, 4]);
    }

    const slides = [];
    if (data.is_volunteer) {

    const statsMap = {
        'teaching': '支教项目',
        'care': '社关项目',
        'eco': '环保项目',
        'mind': '心之旅',
        'others': '综合服务'
    };

    const safeStats = data.stats || { teaching: 0, care: 0, eco: 0, mind: 0, others: 0 };

    let statsArr = Object.keys(statsMap).map(key => ({
        key: key,
        label: statsMap[key],
        value: safeStats[key] || 0
    }));

    statsArr.sort((a, b) => b.value - a.value);
    const topSkill = statsArr[0];

    // === 2. SVG 图标 (使用适合印章的单色路径) ===
    const iconPaths = {
        'teaching': `<path d="M12 3L1 9l11 6 9-4.91V17h2V9M5 13.18v4L12 21l7-3.82v-4L12 17l-7-3.82z" fill="currentColor"/>`,
        'care': `<path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" fill="currentColor"/>`,
        'eco': `<path d="M17 8C8 10 5.9 16.17 3.82 21.34 5.67 22.84 8.21 24 11 24c5.52 0 10-4.48 10-10 0-3.87-2.61-7.15-6-8.82z M11 22c-3.53 0-6.42-1.35-7.85-3.33L3 18.5c1.11-3.23 2.94-7.86 8-9.45.66 2.3 2.12 6.14 4.14 8.79l1.64 2.16C15.35 21.16 13.26 22 11 22z" fill="currentColor" transform="translate(0, -2)"/>`,
        'mind': `<path d="M9 21c0 .55.45 1 1 1h4c.55 0 1-.45 1-1v-1H9v1zm3-19C8.14 2 5 5.14 5 9c0 2.38 1.19 4.47 3 5.74V17c0 .55.45 1 1 1h6c.55 0 1-.45 1-1v-2.26c1.81-1.27 3-3.36 3-5.74 0-3.86-3.14-7-7-7zm2.85 11.1l-.85.6V16h-4v-2.3l-.85-.6C7.8 12.16 7 10.63 7 9c0-2.76 2.24-5 5-5s5 2.24 5 5c0 1.63-.8 3.16-2.15 4.1z" fill="currentColor"/>`,
        'others': `<path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" fill="currentColor"/>`
    };
    const currentPath = iconPaths[topSkill.key] || iconPaths['others'];

    // === 3. 生成 现代能量条 HTML (Modern Style) ===
    let barsHtml = statsArr.slice(0, 4).map((item, index) => {
        let percent = item.value > 0 ? Math.min(item.value, 100) : 0;
        let delay = index * 0.1;

        return `
            <div class="skill-row" style="animation-delay: ${delay}s">
                <div class="skill-name">${item.label}</div>
                <div class="skill-track">
                    <!-- 使用渐变填充 -->
                    <div class="skill-fill" data-width="${percent}%" style="width: 0;"></div>
                </div>
                <div class="skill-val">${item.value}</div>
            </div>
        `;
    }).join('');

    // === 4. 组装 Slide HTML (印章 + 现代列表) ===
    slides.push(`
        <div class="swiper-slide">
            <div class="paper-card ani" data-ani="animate__fadeInDown" style="padding: 30px 20px;">
                <h3 style="text-align:center; color:#555; margin-bottom:10px;">年度能力评定</h3>
                
                <!-- 【复古】朱红印章区域 -->
                <div class="stamp-area ani" data-ani="animate__zoomIn">
                    <div class="stamp-box">
                        <div class="stamp-inner">
                            <svg viewBox="0 0 24 24" width="45" height="45" style="color:#b53f3f; opacity:0.9;">
                                ${currentPath}
                            </svg>
                            <div class="stamp-text">${topSkill.label.split('·')[0]}</div>
                        </div>
                    </div>
                    <div class="stamp-caption">
                        核心领域认证
                    </div>
                </div>

                <!-- 【现代】能量条列表 -->
                <div class="skill-list" style="margin-top:25px;">
                    ${barsHtml}
                </div>
                <div style="margin-top:20px; text-align:center;">
                    <span class="data-doubt-link" onclick="openDataExplanation()">
                        如对数据有疑问请点击此处反馈哦~
                    </span>
                </div>
            </div>
                            <div style="position:absolute; bottom:0; left:0; width:100%; height:60px; 
                            background:linear-gradient(to top, #F4F1EA 20%, transparent); pointer-events:none; z-index:6;">
                </div>
                <div style="position:absolute; bottom:15px; width:100%; text-align:center; font-size:0.75rem; color:#aaa; animation:pulse 2s infinite; z-index:7;">
                    ↓ 继续向下查看更多
                </div>
        </div>
    `);


        const milestones = data.milestones || [];
        let timelineHtml = '';

        if (milestones.length > 0) {
            timelineHtml = milestones.map((m, i) => `
                <div class="film-item ani" data-ani="animate__fadeInUp" style="animation-delay:${0.1 + i * 0.1}s">
                    <div class="film-dot"></div>
                    <div class="film-date">${m.date}</div>
                    <div class="film-title">${m.title}</div>
                    <div class="film-content">${m.content}</div>
                </div>
            `).join('');
        } else {
            // 空状态兜底
            timelineHtml = `
                <div class="film-item ani" data-ani="animate__fadeInUp">
                    <div class="film-dot"></div>
                    <div class="film-content" style="text-align:center; color:#999; padding:20px 0;">
                        平凡的每一天<br>都因为你的坚持而不凡
                    </div>
                </div>`;
        }

        slides.push(`
            <div class="swiper-slide">
                <!-- 标题固定在顶部 -->
                <div style="position:absolute; top:6%; left:0; width:100%; text-align:center; z-index:5;" class="ani" data-ani="animate__fadeInDown">
                    <div style="font-size:1.6rem; color:#A61C26; font-weight:bold; letter-spacing:2px;">独家记忆</div>
                    <div style="font-size:0.8rem; color:#888; margin-top:5px; font-family:'KaiTi';">Memory Timeline</div>
                </div>

                <!-- 核心修改：添加 swiper-no-swiping 类，允许内部滚动 -->
                <div class="film-container swiper-no-swiping">
                    ${timelineHtml}
                </div>

                <!-- 底部遮罩与提示，增加纵深感 -->
                <div style="position:absolute; bottom:0; left:0; width:100%; height:60px; 
                            background:linear-gradient(to top, #F4F1EA 20%, transparent); pointer-events:none; z-index:6;">
                </div>
                <div style="position:absolute; bottom:15px; width:100%; text-align:center; font-size:0.75rem; color:#aaa; animation:pulse 2s infinite; z-index:7;">
                    ↓ 继续向下查看更多
                </div>
            </div>
        `);

        const monthMap = {}; // 格式: { 3: ["支教"], 9: ["心之旅"] }

        if (data.activities) {
            data.activities.forEach(act => {
                // 解析日期格式 "2024.03" 或 "2024-03" 或 "2025.9"
                // 使用正则分割，取第二部分作为月份
                const parts = act.date.split(/[.\-\/]/);
                if (parts.length >= 2) {
                    const month = parseInt(parts[1], 10); // 提取月份数字
                    if (!monthMap[month]) monthMap[month] = [];
                    monthMap[month].push(act.title);
                }
            });
        }

        // 2. 生成 12 个格子的 HTML
        let heatmapHtml = '';
        const months = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];

        months.forEach(m => {
            const hasActivity = monthMap[m] && monthMap[m].length > 0;

            // 样式逻辑：有活动显示深红，无活动显示浅灰
            // 这里为了美观，如果有活动，透明度高一点；否则极低
            const bgStyle = hasActivity ? 'background:rgba(166,28,38, 0.85);' : 'background:rgba(166,28,38, 0.05);';

            // 数据准备
            const dateStr = `${m}月`;
            // 如果该月有多个活动，用顿号连接
            const contentStr = hasActivity ? monthMap[m].join('、') : "这个月在积蓄力量";

            // 注意：onclick 中传递字符串需要处理引号，这里简单处理
            const safeContent = contentStr.replace(/"/g, '&quot;').replace(/'/g, "\\'");

            heatmapHtml += `
                <div class="heatmap-cell ${hasActivity ? 'active' : ''}" 
                     style="${bgStyle}" 
                     onclick="showHeatmapTip('${dateStr}', '${safeContent}', this)">
                     ${m} <!-- 显示月份数字 -->
                </div>
            `;
        });

        // 3. 计算活跃月份数量
        const activeMonthCount = Object.keys(monthMap).length;

        slides.push(`
            <div class="swiper-slide">
                <div class="paper-card ani" data-ani="animate__zoomIn">
                    <h3 style="text-align:center; color:var(--ruc-red); margin-bottom:5px;">志愿足迹</h3>
                    
                    <!-- 调整：顶部只留简单的装饰线或留白，去掉冗余提示 -->
                    <div style="width:40px; height:2px; background:#ddd; margin:10px auto 20px auto;"></div>
                    
                    <div class="heatmap-grid">
                        ${heatmapHtml}
                    </div>

                    <!-- 核心修改：改为固定信息栏，不再悬浮 -->
                    <div id="heatmap-info-box" class="heatmap-info-box">
                        <!-- 默认显示提示 -->
                        <div class="hm-info-hint">点击深色月份，唤醒记忆</div>
                    </div>

                    <div style="margin-top:15px; text-align:center; font-family:'KaiTi';">
                        这一年，你的身影<br>点亮了 <span style="font-size:1.5rem; color:var(--ruc-red); font-family:'Impact';">${activeMonthCount}</span> 个月份
                    </div>
                </div>
                <!-- 底部遮罩与提示，增加纵深感 -->
                <div style="position:absolute; bottom:0; left:0; width:100%; height:60px; 
                            background:linear-gradient(to top, #F4F1EA 20%, transparent); pointer-events:none; z-index:6;">
                </div>
                <div style="position:absolute; bottom:15px; width:100%; text-align:center; font-size:0.75rem; color:#aaa; animation:pulse 2s infinite; z-index:7;">
                    ↓ 继续向下查看更多
                </div>
            </div>
        `);

        let photoHtml = '';
        if (data.activities && data.activities.length > 0) {
            data.activities.forEach(act => {
                let rot = (Math.random() * 4 - 2).toFixed(1);
                photoHtml += `
                    <div class="swiper-slide">
                        <div class="hanging-photo" style="transform: rotate(${rot}deg);">
                            <div class="wood-clip"></div>
                            <img src="${act.img}" crossorigin="anonymous" style="width:100%; height:160px; object-fit:cover; margin-bottom:10px;">
                            <div style="font-size:0.9rem; color:#333;">${act.title}</div>
                            <div style="font-size:0.7rem; color:#999; display:flex; justify-content:space-between;">
                                <span>${act.type}</span><span>${act.date}</span>
                            </div>
                        </div>
                    </div>
                `;
            });
        } else {
            photoHtml = `<div style="text-align:center;color:#999;padding-top:60px;">本年度暂无活动影像记录<br>期待你的下一次出发</div>`;
        }

        slides.push(`
            <div class="swiper-slide">
                <div style="position:absolute; top:12%; width:100%; text-align:center;" class="ani" data-ani="animate__fadeIn">
                    <h2 style="color:var(--ruc-red); margin-bottom:5px;">时光掠影</h2>
                    <span style="font-size:0.8rem; color:#888;">左右滑动查看</span>
                </div>
                <div class="rope-scene ani" data-ani="animate__fadeInRight">
                    <svg class="rope-svg" viewBox="0 0 500 100" preserveAspectRatio="none">
                        <path d="M0,10 Q250,60 500,10" stroke="#8D6E63" stroke-width="2" fill="none" />
                    </svg>
                    <div class="swiper swiper-h">
                        <div class="swiper-wrapper">${photoHtml}</div>
                    </div>
                </div>
                                <div style="position:absolute; bottom:0; left:0; width:100%; height:60px; 
                            background:linear-gradient(to top, #F4F1EA 20%, transparent); pointer-events:none; z-index:6;">
                </div>
                <div style="position:absolute; bottom:15px; width:100%; text-align:center; font-size:0.75rem; color:#aaa; animation:pulse 2s infinite; z-index:7;">
                    ↓ 继续向下查看更多
                </div>
            </div>
        `);

        if (data.co_volunteers && data.co_volunteers.length > 0) {
            const showNames = data.co_volunteers.slice(0, 25);
            slides.push(`
                <div class="swiper-slide">
                    <div class="constellation-slide">
                        <canvas id="partnerCanvas"></canvas>
                        <div style="position:absolute; top:10%; width:100%; text-align:center; z-index:5;" class="ani" data-ani="animate__fadeInDown">
                            <div style="font-size:1.8rem; color:var(--ruc-red); letter-spacing:3px;">星火相聚</div>
                            <div style="font-size:0.8rem; color:#888; font-family:'KaiTi';">Connection & Warmth</div>
                        </div>
                        <div class="data-overlay ani" data-ani="animate__fadeInUp">
                            <div style="color:#555; margin-bottom:10px;">这一年，你并不孤单</div>
                            <div style="font-size:1rem; line-height:1.6; color:#333;">
                                与 <span class="highlight-num">${data.co_volunteers.length}</span> 位同行者<br>
                                在志愿路上留下了足迹
                            </div>
                            <div style="margin-top:15px; height:1px; background:linear-gradient(to right, transparent, #A61C26, transparent); opacity:0.3;"></div>
                            <p style="font-family:'KaiTi'; color:#666; font-size:0.9rem; margin-top:15px;">
                                每一次相遇，<br>都是一条温暖的纽带。
                            </p>
                        </div>
                    </div>
                                    <div style="position:absolute; bottom:0; left:0; width:100%; height:60px; 
                            background:linear-gradient(to top, #F4F1EA 20%, transparent); pointer-events:none; z-index:6;">
                </div>
                <div style="position:absolute; bottom:15px; width:100%; text-align:center; font-size:0.75rem; color:#aaa; animation:pulse 2s infinite; z-index:7;">
                    ↓ 继续向下查看更多
                </div>
                </div>
            `);
            window.partnerNames = showNames;
        }

        let letterHtml = '';
        if (data.letter_content && Array.isArray(data.letter_content)) {
            letterHtml = data.letter_content.map(p => `<p style="margin-bottom:10px;">${p}</p>`).join('');
        } else if (typeof data.letter_content === 'string') {
            letterHtml = `<p>${data.letter_content}</p>`;
        } else {
            // 兜底文案
            letterHtml = `<p>见字如面。</p><p>感谢这一年的付出。</p>`;
        }

        slides.push(`
            <div class="swiper-slide">
                <div style="text-align:center; margin-bottom:10px; margin-top: 20px; color:#888; font-size: 0.9rem;" class="ani" data-ani="animate__fadeIn">
                    这里有一封给你的信
                </div>
                
                <div class="envelope-wrapper ani" data-ani="animate__fadeInUp" onclick="openEnvelope(this)">
                    <div class="envelope-body"></div>
                    <div class="envelope-flap"></div>
                    <div class="wax-seal"></div>
                    
                    <div class="envelope-letter">
                        <div style="font-weight:bold; margin-bottom:10px; font-size:1.1rem; flex-shrink: 0;">
                            亲爱的 ${data.name}:
                        </div>
                        
                        <!-- 修改处：
                             1. 添加 swiper-no-swiping 类（关键！阻止外层 Swiper 抢夺滑动事件）
                             2. 添加 letter-scroll-area 类（应用上面的 CSS 优化）
                        -->
                        <div class="letter-scroll-area swiper-no-swiping">
                            ${letterHtml}
                        </div>
                        
                        <div style="text-align:right; margin-top:10px; color:var(--ruc-red); font-size:0.85rem; flex-shrink: 0;">
                            2025 商院青协
                        </div>
                    </div>
                </div>
                
                <div id="click-hint" style="margin-top:60px; color:#bbb; font-size:0.8rem; text-align:center; animation: pulse 2s infinite;">
                    点击火漆印开启
                </div>
                                <div style="position:absolute; bottom:0; left:0; width:100%; height:60px; 
                            background:linear-gradient(to top, #F4F1EA 20%, transparent); pointer-events:none; z-index:6;">
                </div>
                <div style="position:absolute; bottom:15px; width:100%; text-align:center; font-size:0.75rem; color:#aaa; animation:pulse 2s infinite; z-index:7;">
                    ↓ 继续向下查看更多
                </div>
            </div>
        `);

        let tagsHtml = '';
        if (data.tags && Array.isArray(data.tags)) {
            tagsHtml = data.tags.map(t => {
                // 兼容逻辑：如果后端还没改，t 可能是字符串；如果改了，t 是对象
                let name = typeof t === 'object' ? t.name : t;
                // 对解释文案进行转义，防止单引号破坏 HTML
                let desc = typeof t === 'object' ? t.desc : "这是属于你的年度独特印记。";
                let safeDesc = desc.replace(/'/g, "\\'");
                let safeName = name.replace(/'/g, "\\'");

                return `<span class="tag-item" onclick="showTagExplanation('${safeName}', '${safeDesc}')">${name}</span>`;
            }).join('');
        }

        slides.push(`
            <div class="swiper-slide">
                <div class="paper-card ani" data-ani="animate__zoomIn" style="text-align:center;">
                    <h2 style="color:var(--ruc-red);">年度画像</h2>
                    
                    <!-- 标签区域 -->
                    <div style="margin-top:25px; margin-bottom:5px;">
                        ${tagsHtml}
                    </div>

                    <!-- 新增：明确的点击提示 -->
                    <div class="click-hint-text">
                         点击标签了解含义 
                    </div>

                    <p style="font-family:'KaiTi'; color:#666; margin-bottom:30px;">
                        感谢有你，微光成炬<br>
                        明年，我们继续同行
                    </p>
                    <div class="btn-seal" style="width:120px; height:120px; font-size:1rem; border-width:4px; margin:0 auto;"
                         onclick='makePoster()'>
                        生成<br>证书
                    </div>
                </div>
            </div>
        `);
    } else {
        const org = data.org_data;
        slides.push(`
            <div class="swiper-slide">
                <div class="paper-card ani" data-ani="animate__fadeInUp" style="text-align:center; padding: 40px 20px;">
                    <div style="color:var(--ruc-red); letter-spacing:2px; font-weight:bold; margin-bottom:20px;">RMBS 2025</div>
                    <h1 style="font-size:2rem; color:#333; margin:0;">汇聚微光</h1>
                    <div style="margin-top:40px; display:flex; flex-direction:column; gap:25px;">
                        <div>
                            <div style="font-size:2.5rem; color:var(--ruc-red); font-family:'Impact';">${org.total_org_hours}</div>
                            <div style="font-size:0.8rem; color:#666;">年度志愿总时长 (h)</div>
                        </div>
                        <div>
                            <div style="font-size:2.5rem; color:var(--ruc-red); font-family:'Impact';">${org.total_events}</div>
                            <div style="font-size:0.8rem; color:#666;">开展公益活动 (场)</div>
                        </div>
                    </div>
                </div>
            </div>
        `);

        let publicPhotos = '';
        org.public_gallery.forEach(imgUrl => {
            let rot = (Math.random() * 4 - 2).toFixed(1);
            publicPhotos += `
                <div class="swiper-slide">
                    <div class="hanging-photo" style="transform: rotate(${rot}deg);">
                        <div class="wood-clip"></div>
                        <img src="${imgUrl}" crossorigin="anonymous" style="width:100%; height:180px; object-fit:cover;">
                    </div>
                </div>`;
        });

        slides.push(`
            <div class="swiper-slide">
                <div style="position:absolute; top:15%; width:100%; text-align:center;">
                    <h2 style="color:var(--ruc-red);">精彩回顾</h2>
                    <p style="font-size:0.8rem; color:#666;">这一年，我们一起走过的路</p>
                </div>
                <div class="rope-scene">
                    <svg class="rope-svg" viewBox="0 0 500 100" preserveAspectRatio="none"><path d="M0,10 Q250,60 500,10" stroke="#8D6E63" stroke-width="2" fill="none" /></svg>
                    <div class="swiper swiper-h"><div class="swiper-wrapper">${publicPhotos}</div></div>
                </div>
            </div>
        `);

        slides.push(`
            <div class="swiper-slide">
                <div class="paper-card ani" data-ani="animate__zoomIn" style="text-align:center;">
                    <h2 style="color:var(--ruc-red);">期待有你</h2>
                    <p style="font-family:'KaiTi'; color:#666; margin:30px 0; line-height:1.8;">
                        遗憾未能在今年的档案中找到你<br>
                        但明年的故事<br>
                        希望能由你来共同书写
                    </p>
                    <div class="btn-seal" style="width:120px; height:120px; border-width:4px; margin:0 auto;" onclick='makePoster()'>
                        加入<br>我们
                    </div>
                                                            <div style="margin-top:20px; text-align:center;">
                    <span class="data-doubt-link" onclick="openDataExplanation()">
                        对结果有疑问？
                    </span>
                    </div>
                </div>
            </div>
        `);
    }

    state.swiper.appendSlide(slides);

    setTimeout(() => {
        if(data.is_volunteer) {
            initRadar(data.stats);
        }
        if(window.partnerNames) {
            initConstellation(window.partnerNames);
        }
        if (document.querySelector('.swiper-h')) {
            new Swiper(".swiper-h", {
                direction: "horizontal",
                slidesPerView: "auto",
                centeredSlides: true,
                spaceBetween: 15,
                nested: true,
                observer: true,
                observeParents: true,
                touchMoveStopPropagation: true
            });
        }
    }, 100);
}
