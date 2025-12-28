import { state } from "./state.js";
import { initMainSwiper } from "./swiper/swiperInit.js";
import { fetchAnnualData } from "./api/annualData.js";
import { generateDynamicSlides } from "./slides/slidesRenderer.js";

import { injectTagModal, showTagExplanation, closeTagExplanation } from "./features/tagModal.js";
import {
  closePosterModal, makePoster, savePosterImage,
  openImgChoice, closeImgChoice, selectPosterImageFromGallery, triggerUpload, handleImageUpload,
  openPhotoPicker, closePhotoPicker, buildPhotoPickerGrid
} from "./features/poster.js";

import { openGameModal, closeGameModal, animate, resize } from "./features/game.js";
import { openDataExplanation, closeDataExplanation } from "./features/dataExplanation.js";
import { openEnvelope } from "./features/envelope.js";
import { closeFinalOverlay } from "./features/finalOverlay.js";
import { addScrollHint, resetBtn, resetButton } from "./features/misc.js";
import { showHeatmapTip } from "./features/heatmap.js";

export function boot() {
  initMainSwiper();
  injectTagModal?.();
  addScrollHint?.();

  // Bind "fetch" button if it exists
  const btn = document.getElementById("btn-fetch");
  if (btn) {
    btn.addEventListener("click", async () => {
      const nameInput = document.getElementById("input-name");
      const phoneInput = document.getElementById("input-phone");
      const errorBox = document.getElementById("error-box");
      const loading = document.getElementById("loading");

      const name = nameInput?.value?.trim();
      const phone = phoneInput?.value?.trim();

      if (errorBox) {
        errorBox.style.display = "none";
        errorBox.innerText = "";
      }

      if (!name || !phone) {
        if (errorBox) {
          errorBox.innerText = "请填写完整的姓名和RUC学号";
          errorBox.style.display = "block";
        }
        return;
      }

      try {
        if (loading) loading.style.display = "block";
        const res = await fetchAnnualData({ name, phone });
        if (loading) loading.style.display = "none";

        if (res?.success && res?.data) {
          state.userData = res.data;
          generateDynamicSlides(res.data);

          // allow slide next and go
          if (state.swiper) {
            state.swiper.allowSlideNext = true;
            setTimeout(() => state.swiper.slideNext(), 300);
          }
        } else {
          if (errorBox) {
            errorBox.innerText = res?.message || "未查询到档案";
            errorBox.style.display = "block";
          }
        }
      } catch (err) {
        if (loading) loading.style.display = "none";
        if (errorBox) {
          errorBox.innerText = "网络请求失败，请重试";
          errorBox.style.display = "block";
        }
        console.error(err);
      }
    });
  }

  // Backward compatibility exports to window (remove after migrating away from inline onclick)
  Object.assign(window, {
    // tag modal
    showTagExplanation,
    closeTagExplanation,

    // poster
    closePosterModal,
    makePoster,
    savePosterImage,
    openImgChoice,
    closeImgChoice,
    selectPosterImageFromGallery,
    triggerUpload,
    handleImageUpload,
    openPhotoPicker,
    closePhotoPicker,
    buildPhotoPickerGrid,

    // game
    openGameModal,
    closeGameModal,
    animate,
    resize,

    // data explanation
    openDataExplanation,
    closeDataExplanation,

    // envelope/final
    openEnvelope,
    closeFinalOverlay,

    // misc
    resetBtn,
    resetButton,
    
    // heatmap
    showHeatmapTip,
    
    // fetch data
    fetchData: async () => {
      const nameInput = document.getElementById("input-name");
      const phoneInput = document.getElementById("input-phone");
      const errorBox = document.getElementById("error-box");
      const loading = document.getElementById("loading");
      
      const name = nameInput?.value?.trim();
      const phone = phoneInput?.value?.trim();
      
      if (errorBox) {
        errorBox.style.display = "none";
        errorBox.innerText = "";
      }
      
      if (!name || !phone) {
        if (errorBox) {
          errorBox.innerText = "请填写完整的姓名和RUC学号";
          errorBox.style.display = "block";
        }
        return;
      }
      
      // 添加盖章动画效果
      const wrapper = document.querySelector('.btn-seal-wrapper');
      const btn = document.querySelector('.btn-seal');
      const ink = document.querySelector('.seal-ink');
      const btnText = document.querySelector('.btn-text');
      
      if (wrapper && btn && ink && btnText) {
        wrapper.onclick = null;
        btn.classList.add('seal-active');
        
        setTimeout(() => {
          ink.classList.add('ink-visible');
          btnText.style.opacity = 0;
        }, 300);
      }
      
      try {
        // 延迟发送请求，等待动画完成
        await new Promise(resolve => setTimeout(resolve, 800));
        
        if (loading) loading.style.display = "block";
        const res = await fetchAnnualData({ name, phone });
        if (loading) loading.style.display = "none";
        
        if (res?.success && res?.data) {
          state.userData = res.data;
          window.currentUserData = res.data;
          generateDynamicSlides(res.data);
          
          // allow slide next and go
          if (state.swiper) {
            state.swiper.allowSlideNext = true;
            setTimeout(() => state.swiper.slideNext(), 300);
          }
        } else {
          if (errorBox) {
            errorBox.innerText = res?.message || "未查询到档案";
            errorBox.style.display = "block";
          }
          // 恢复按钮点击事件
          if (wrapper) {
            wrapper.onclick = window.fetchData;
          }
        }
      } catch (err) {
        if (loading) loading.style.display = "none";
        if (errorBox) {
          errorBox.innerText = "网络请求失败，请重试";
          errorBox.style.display = "block";
        }
        console.error(err);
        // 恢复按钮点击事件
        if (wrapper) {
          wrapper.onclick = window.fetchData;
        }
      }
    }
  });
}

// Auto-boot if loaded in browser
if (typeof window !== "undefined") {
  window.addEventListener("DOMContentLoaded", () => boot());
}
