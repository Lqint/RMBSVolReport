import { state } from "../state.js";
import { hideAni, playAni } from "./animations.js";

export function initMainSwiper() {
  // Swiper must be loaded globally (window.Swiper) or imported by your bundler.
  const swiperV = new Swiper(".swiper-v", {
    direction: "vertical",
        speed: 700,
        allowTouchMove: true,
        on: {
            slideChangeTransitionStart: function() {
                document.querySelectorAll('.ani').forEach(el => el.style.visibility = 'hidden');
            },
            slideChangeTransitionEnd: function () {
                playAni(this.slides[this.activeIndex]);

                const currentSlide = this.slides[this.activeIndex];
                if(currentSlide) {
                    // 稍微延时一点点，让 slideInRight 先展示出来，再涨条
                    setTimeout(() => {
                        currentSlide.querySelectorAll('.skill-fill').forEach(el => {
                            el.style.width = el.dataset.width; // 读取 data-width 赋值给 style.width
                        });
                    }, 300);
                }

                // === 核心修复开始 ===
                // 逻辑修正：不仅要在特定页面“关门”，还要在离开特定页面时“开门”
                if(this.activeIndex === 2 && !window.currentUserData) {
                    // 如果在登录页(index 2)且没数据，锁死下一页
                    this.allowSlideNext = false;
                } else {
                    // 在其他页面（比如滑回了上一页），或者已有数据，必须恢复允许下滑
                    this.allowSlideNext = true;
                }
                // === 核心修复结束 ===
            }
        }
  });

  state.swiper = swiperV;
  // Backward-compat: some inline handlers/templates may still reference swiperV.
  window.swiperV = swiperV;

  // Play first slide animations
  playAni(document.querySelector(".swiper-slide"));
  return swiperV;
}
