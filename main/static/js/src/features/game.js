/** Game modal logic (from main.js) */

// 游戏数据
const gameData = [
    {
        title: "筑梦 · 支教项目",
        themeColor: "#FF4757",
        tagName: "Teaching",
        desc: "跨越山海，我们在边疆与深山里推开一扇窗；走上云端，我们为远方的孩子种下希望。愿我们以点点星光，照亮孩子们的童年",
        statVal: "500+", statLabel: "受益孩子",
        images: [
            "/media/images/dandelion.jpg",
            "/media/images/summercamp-2.jpg",
            "/media/images/read.jpg"
        ]
    },
    {
        title: "暖阳 · 社会关怀",
        themeColor: "#FFA502",
        tagName: "Care",
        desc: "我们走进社区，牵起老人的手；我们俯身倾听，与孩子们游戏；我们坚守，在夜色操场边点亮鼓励的星光。每一次陪伴，都绽放笑容；每一次抵达，都是温暖和关怀的具象。",
        statVal: "33", statLabel: "活动次数",
        images: [
            "/media/images/“守护折翼天使”.jpg",
            "/media/images/“雨露嘉禾”.jpg",
            "/media/images/“书香传情”.jpg"
        ]
    },
    {
        title: "绿动 · 环保项目",
        themeColor: "#2ED573",
        tagName: "Environment",
        desc: "校园里的每一个回收瓶，都是对地球的承诺；每一件回收的旧衣物，都是寄向远方的温暖。",
        statVal: "478.8", statLabel: "累计减排（kg）",
        images: [
            "/media/images/parc.jpg",
            "/media/images/recycle-3.jpg",
            "/media/images/arbre.jpg"
        ]
    },
    {
        title: "心灵 · 心之旅",
        themeColor: "#1E90FF",
        tagName: "Psychology",
        desc: "从“商火相传”，到“共商心语”；从“方寸心语”，到心理疏导——我们始终以专业与热忱，为商院学子的心理健康保驾护航。",
        statVal: "3500+", statLabel: "陪伴时间",
        images: [
            "/media/images/heart-cover.jpg",
            "/media/images/club-gather.jpg",
            "/media/images/club-gather2.jpg"
        ]
    }
];

// 游戏状态变量
let collectedCount = 0;
let collectedStatus = [false, false, false, false];
let gameModalSwiper = null; // 全局 Swiper 实例

export function openGameModal(index, element) {
    const data = gameData[index];

    // 1. 填充文字内容
    document.getElementById('gm-tag').innerText = data.tagName;
    document.getElementById('gm-title').innerText = data.title;
    document.getElementById('gm-desc').innerText = data.desc;
    document.getElementById('gm-stat-val').innerText = data.statVal;
    document.getElementById('gm-stat-label').innerText = data.statLabel;

    // 2. 动态修改主题色
    document.querySelector('.card-divider').style.backgroundColor = data.themeColor;
    document.querySelector('.card-stat .val').style.color = data.themeColor;

    // 3. 核心：动态生成轮播图 Slides
    const wrapper = document.getElementById('gm-swiper-wrapper');
    wrapper.innerHTML = ""; // 清空旧图片

    if(data.images && data.images.length > 0) {
        data.images.forEach(imgUrl => {
            const slide = document.createElement('div');
            slide.className = 'swiper-slide';
            slide.innerHTML = `<img src="${imgUrl}" alt="Moment">`;
            wrapper.appendChild(slide);
        });
    }

    // 4. 初始化或更新 Swiper
    if (!gameModalSwiper) {
        // 第一次打开，初始化实例
        gameModalSwiper = new Swiper(".swiper-game", {
            loop: true,
            speed: 500,
            autoplay: {
                delay: 3000,
                disableOnInteraction: false,
            },
            pagination: {
                el: ".swiper-pagination",
                clickable: true,
            },
            nested: true, // 关键：允许嵌套在父级 Swiper 中滑动
            touchMoveStopPropagation: true // 防止滑动冲突
        });
    } else {
        // 已经存在，更新内容并重置到第一张
        gameModalSwiper.update();
        gameModalSwiper.slideToLoop(0, 0); // 立即跳回第一张
        gameModalSwiper.autoplay.start();
    }

    // 5. 按钮状态逻辑
    const btn = document.getElementById('gm-btn');
    btn.style.backgroundColor = data.themeColor;
    if (collectedStatus[index]) {
        btn.innerText = "✨ 已点亮";
        btn.style.opacity = "0.7";
    } else {
        btn.innerText = "点亮图标";
        btn.style.opacity = "1";
    }

    window.currentSpotIndex = index;
    document.getElementById('game-modal').style.display = 'flex';
}

export function closeGameModal() {
    document.getElementById('game-modal').style.display = 'none';

    const index = window.currentSpotIndex;

    // 只有第一次点击时才触发“点亮”逻辑
    if (!collectedStatus[index]) {
        collectedStatus[index] = true;
        collectedCount++;

        const slideEl = document.getElementById('game-slide');
        // 移除旧的 level 类 (为了安全，全移除)
        slideEl.classList.remove('bg-level-1', 'bg-level-2', 'bg-level-3', 'bg-level-4');
        // 添加新的 level 类
        slideEl.classList.add(`bg-level-${collectedCount}`);

        // 1. 点亮图标 (添加 active 类)
        const iconWrapper = document.getElementById(`icon-${index}`);
        iconWrapper.classList.add('active'); // CSS 会处理发光动画

        // 2. 更新顶部进度条
        document.getElementById('collect-count').innerText = collectedCount;
        document.getElementById('progress-fill').style.width = (collectedCount / 4 * 100) + "%";

        // 3. 震动反馈 (如果支持)
        if(navigator.vibrate) navigator.vibrate(50);

        // 4. 全部完成
        if (collectedCount === 4) {
            setTimeout(() => {
                document.getElementById('game-success-msg').classList.add('show');
            }, 600);
        }
    }
}

export function animate() {
        ctx.clearRect(0, 0, width, height);
        particles.forEach(p => {
            p.update();
            p.draw();
        });

        const connectDistance = 100;
        for (let i = 0; i < particles.length; i++) {
            for (let j = i + 1; j < particles.length; j++) {
                const dx = particles[i].x - particles[j].x;
                const dy = particles[i].y - particles[j].y;
                const distance = Math.sqrt(dx * dx + dy * dy);

                if (distance < connectDistance) {
                    const opacity = 1 - (distance / connectDistance);
                    ctx.beginPath();
                    ctx.strokeStyle = `rgba(166, 28, 38, ${opacity * 0.4})`;
                    ctx.lineWidth = 1;
                    ctx.moveTo(particles[i].x, particles[i].y - 5);
                    ctx.lineTo(particles[j].x, particles[j].y - 5);
                    ctx.stroke();
                }
            }
        }
        requestAnimationFrame(animate);
    }

export function resize() {
        width = canvas.width = canvas.offsetWidth;
        height = canvas.height = canvas.offsetHeight;
    }