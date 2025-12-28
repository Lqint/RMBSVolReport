import { $$ } from "../utils/dom.js";

export function playAni(slide) {
  if (!slide) return;
  $$(".ani", slide).forEach((el) => {
    el.style.visibility = "visible";
    el.classList.add("animate__animated", el.dataset.ani);
  });
}

export function hideAni(root = document) {
  $$(".ani", root).forEach((el) => {
    el.style.visibility = "hidden";
  });
}
