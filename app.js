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

  const questions = [
    {title:"어떤 이야기를 알아보고 있나요?",description:"아직 제도를 고르지 않았어도 괜찮아요.",options:["개인회생을 알아보고 있어요","개인파산·면책을 알아보고 있어요","무엇이 필요한지 잘 모르겠어요"]},
    {title:"현재 소득은 어떤 상황인가요?",description:"정확한 금액은 지금 입력하지 않아도 됩니다.",options:["정기적으로 소득이 들어와요","수입이 있지만 일정하지 않아요","현재 소득이 없거나 거의 없어요"]},
    {title:"지금 가장 걱정되는 건 무엇인가요?",description:"가장 먼저 이야기하고 싶은 한 가지를 골라주세요.",options:["매달 갚을 돈과 생활비가 부담돼요","독촉·압류·법원 서류가 걱정돼요","가족·직장에 알려질까 걱정돼요","비용과 앞으로의 절차가 궁금해요"]},
    {title:"상담을 위해 무엇을 알고 있나요?",description:"모르거나 자료가 없어도 시작할 수 있어요.",options:["채무·소득·재산을 대략 알고 있어요","정확한 금액이나 자료가 아직 없어요","법원에서 받은 서류나 기한이 있어요"]}
  ];
  const optionIcons = [["calendar","search","chat"],["wallet","chart","person"],["coins","shield","lock","document"],["folder","search","clock"]];
  const icon = name => '<svg class="ui-icon option-icon" aria-hidden="true" focusable="false"><use href="#i-' + name + '"></use></svg>';
  const answers = [];
  let currentStep = 0;
  let toastTimer;
  const container = document.getElementById("question-content");
  const count = document.getElementById("step-count");
  const progress = document.getElementById("step-progress");
  const escapeHtml = text => text.replace(/[&<>"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
  const focusHeading = () => {
    const heading = container.querySelector("h3");
    heading.focus({preventScroll:true});
  };
  const createMemo = () => {
    return "상담 준비 메모\n\n" + ["알아보는 내용","소득 상황","가장 큰 고민","준비 상태"].map((label, i) => label + ": " + questions[i].options[answers[i]]).join("\n") + "\n\n상담할 때 연락받기 편한 방법과 시간을 함께 알려주세요.";
  };
  function showQuestion(focus = false) {
    document.getElementById("dock-copy").hidden = true;
    document.getElementById("dock-start").hidden = false;
    const q = questions[currentStep];
    count.textContent = String(currentStep + 1).padStart(2,"0") + " / 04";
    progress.style.width = ((currentStep + 1) * 25) + "%";
    container.innerHTML = '<h3 class="question-title" tabindex="-1">' + q.title + '</h3><p class="question-desc">' + q.description + '</p><div class="question-options">' + q.options.map((o,i) => '<button type="button" class="question-option' + (answers[currentStep] === i ? ' selected' : '') + '" data-answer="' + i + '">' + icon(optionIcons[currentStep][i]) + '<span>' + o + '</span></button>').join("") + '</div>' + (currentStep > 0 ? '<button class="question-back" type="button">← 이전 질문</button>' : '');
    container.querySelectorAll("[data-answer]").forEach(button => button.addEventListener("click", () => {
      answers[currentStep] = Number(button.dataset.answer);
      if (currentStep < questions.length - 1) { currentStep++; showQuestion(true); }
      else showResult();
    }));
    const back = container.querySelector(".question-back");
    if (back) back.addEventListener("click", () => { currentStep--; showQuestion(true); });
    if (focus) focusHeading();
  }
  async function copyMemo() {
    if (answers.length !== questions.length) return;
    try {
      if (!navigator.clipboard) throw new Error("clipboard unavailable");
      await navigator.clipboard.writeText(createMemo());
      const toast = document.getElementById("toast");
      toast.hidden = false;
      clearTimeout(toastTimer);
      toastTimer = setTimeout(() => { toast.hidden = true; }, 2500);
    } catch {
      const slot = document.getElementById("copy-fallback-slot");
      if (!slot.querySelector("textarea")) {
        const label = document.createElement("label");
        label.htmlFor = "memo-text";
        label.textContent = "아래 메모를 선택해 복사해주세요.";
        const textarea = document.createElement("textarea");
        textarea.id = "memo-text"; textarea.className = "copy-fallback";
        textarea.readOnly = true; textarea.value = createMemo();
        slot.append(label, textarea);
      }
      const textarea = slot.querySelector("textarea");
      textarea.focus({preventScroll:true}); textarea.select();
    }
  }
  document.getElementById("dock-copy").addEventListener("click", copyMemo);
  function showResult() {
    document.getElementById("dock-copy").hidden = false;
    document.getElementById("dock-start").hidden = true;
    count.textContent = "준비 완료";
    progress.style.width = "100%";
    const note = answers[2] === 1 || answers[3] === 2
      ? "법원 문서가 있다면 문서 이름과 받은 날짜, 기한을 먼저 알려주세요."
      : "대략적인 소득·생활비·채무·재산을 떠올려보세요. 모르는 부분은 상담에서 함께 확인하면 됩니다.";
    container.innerHTML = '<div class="question-result"><h3 tabindex="-1">내 이야기가 정리됐어요.</h3><p>꼭 해람과 함께하지 않으셔도 괜찮아요.<br>어디에서 상담받으시든 이 메모를 보여주세요.<br>상황을 설명하는 데 작은 도움이 될 거예요.</p><div class="result-actions"><button class="button button-dark" id="copy-memo" type="button">메모 복사하기 ↗</button><a class="text-link" href="#contact">해람 상담 안내 →</a></div><details class="memo-details"><summary>정리된 답변 보기 <span aria-hidden="true">+</span></summary><div class="memo">' + escapeHtml(createMemo()) + '</div></details><div class="result-tips">' + note + '</div><button class="result-reset" type="button">← 답변 수정하기</button><p class="result-selected-note">상담 준비용 메모이며, 신청 자격이나 법원 결과를 판단하지 않습니다.</p><div id="copy-fallback-slot"></div></div>';
    document.getElementById("copy-memo").addEventListener("click", copyMemo);
    container.querySelector(".result-reset").addEventListener("click", () => { currentStep = 0; showQuestion(true); });
    focusHeading();
  }
  document.getElementById("year").textContent = String(new Date().getFullYear());
  showQuestion();

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

  const officeImage = document.getElementById("office-photo");
  if (officeImage) {
    const photoButtons = [...document.querySelectorAll(".office-thumb")];
    let selectedPhoto = 0;
    const selectPhoto = index => {
      selectedPhoto = (index + photoButtons.length) % photoButtons.length;
      const button = photoButtons[selectedPhoto];
      officeImage.src = button.dataset.photoSrc;
      officeImage.alt = button.dataset.photoAlt;
      document.getElementById("office-photo-title").textContent = button.dataset.photoTitle;
      document.getElementById("office-photo-count").textContent = String(selectedPhoto + 1).padStart(2,"0") + " / " + String(photoButtons.length).padStart(2,"0");
      photoButtons.forEach(choice => {
        const active = choice === button;
        choice.classList.toggle("is-active", active);
        choice.setAttribute("aria-pressed", String(active));
      });
      document.getElementById("office-photo-status").textContent = "선택한 사진: " + button.dataset.photoTitle;
      if (window.matchMedia("(max-width:800px)").matches) {
        const strip = button.parentElement;
        strip.scrollTo({left:button.offsetLeft - strip.offsetLeft - 4,behavior:window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth"});
      }
    };
    photoButtons.forEach((button, index) => button.addEventListener("click", () => selectPhoto(index)));
    document.getElementById("office-previous").addEventListener("click", () => selectPhoto(selectedPhoto - 1));
    document.getElementById("office-next").addEventListener("click", () => selectPhoto(selectedPhoto + 1));
  }
})();
