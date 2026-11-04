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
    return "해람 상담 준비 메모\n\n" + ["알아보는 내용","소득 상황","가장 큰 고민","준비 상태"].map((label, i) => label + ": " + questions[i].options[answers[i]]).join("\n") + "\n\n상담할 때 연락받기 편한 방법과 시간을 함께 알려주세요.";
  };
  function showQuestion(focus = false) {
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
  function showResult() {
    count.textContent = "준비 완료";
    progress.style.width = "100%";
    const note = answers[2] === 1 || answers[3] === 2
      ? "법원 문서가 있다면 문서 이름, 받은 날짜, 적힌 기한을 먼저 확인해 주세요. 상담할 때 이 내용을 가장 먼저 알려주시면 좋습니다."
      : answers[1] === 2
      ? "소득이 없다는 이유만으로 절차가 정해지지는 않아요. 건강·근로 가능성·재산·채무 경위를 함께 이야기해주세요."
      : answers[1] === 1
      ? "수입이 일정하지 않다면 최근의 입금 내역과 대략적인 수입·지출을 떠올려보세요. 상담에서 계속적인 소득을 어떻게 확인할지 함께 살펴볼 수 있습니다."
      : "대략적인 월소득·생활비·채무와 보유 재산을 떠올려보세요. 정확하지 않은 부분은 상담에서 확인할 수 있습니다.";
    container.innerHTML = '<div class="question-result"><h3 tabindex="-1">상담 메모가 정리됐어요.</h3><p>내 이야기를 꺼내는 데 필요한 작은 준비입니다.</p><div class="memo">' + escapeHtml(createMemo()) + '</div><div class="result-tips">' + note + '</div><div class="result-actions"><button class="button button-light" id="copy-memo" type="button">메모 복사하기</button><a class="button button-dark" href="#contact">상담 방법 보기 ↗</a></div><button class="result-reset" type="button">← 답변 다시 살펴보기</button><p class="result-selected-note">이 메모는 신청 가능 여부나 법원 결과를 판단한 내용이 아닙니다.</p><div id="copy-fallback-slot"></div></div>';
    document.getElementById("copy-memo").addEventListener("click", async () => {
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
          label.textContent = "아래 메모를 직접 선택해 복사해주세요.";
          const textarea = document.createElement("textarea");
          textarea.id = "memo-text"; textarea.className = "copy-fallback";
          textarea.readOnly = true; textarea.value = createMemo();
          slot.append(label,textarea); textarea.focus(); textarea.select();
        }
      }
    });
    container.querySelector(".result-reset").addEventListener("click", () => { currentStep = 0; showQuestion(true); });
    focusHeading();
  }
  document.getElementById("year").textContent = String(new Date().getFullYear());
  showQuestion();
})();
