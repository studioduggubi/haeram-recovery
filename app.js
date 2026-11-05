"use strict";
(() => {
  const menuButton = document.querySelector(".menu-toggle");
  const mobileNav = document.getElementById("mobile-nav");
  const closeMenu = () => {
    menuButton.setAttribute("aria-expanded", "false");
    menuButton.setAttribute("aria-label", "메뉴 열기");
    mobileNav.hidden = true;
  };
  menuButton.addEventListener("click", () => {
    const open = menuButton.getAttribute("aria-expanded") !== "true";
    menuButton.setAttribute("aria-expanded", String(open));
    menuButton.setAttribute("aria-label", open ? "메뉴 닫기" : "메뉴 열기");
    mobileNav.hidden = !open;
  });
  mobileNav.querySelectorAll("a").forEach(a => a.addEventListener("click", closeMenu));
  document.addEventListener("keydown", e => { if (e.key === "Escape") closeMenu(); });
  window.matchMedia("(min-width:801px)").addEventListener("change", e => { if (e.matches) closeMenu(); });

  document.getElementById("year").textContent = String(new Date().getFullYear());

  const videoPlayer = document.getElementById("haeram-youtube-player");
  if (videoPlayer) {
    const videoChoices = [...document.querySelectorAll(".youtube-choice")];
    videoChoices.forEach(button => button.addEventListener("click", () => {
      const id = button.dataset.videoId;
      const title = button.dataset.videoTitle;
      if (!/^[A-Za-z0-9_-]{11}$/.test(id)) return;
      videoPlayer.src = "https://www.youtube.com/embed/" + id + "?autoplay=1&rel=0&playsinline=1";
      videoPlayer.title = "해람법무사 — " + title;
      document.getElementById("youtube-topic").textContent = button.dataset.videoTopic;
      document.getElementById("youtube-title").textContent = title;
      document.getElementById("youtube-watch-link").href = "https://www.youtube.com/watch?v=" + id;
      videoChoices.forEach(choice => {
        const active = choice === button;
        choice.classList.toggle("is-active", active);
        choice.setAttribute("aria-pressed", String(active));
        choice.querySelector(".youtube-choice-state").firstChild.textContent = active ? "선택한 영상 " : "이 영상 보기 ";
      });
      document.getElementById("youtube-status").textContent = "선택한 영상: " + title;

    }));
  }

})();
