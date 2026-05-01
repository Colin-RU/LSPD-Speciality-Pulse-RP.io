const revealObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add("visible");
      revealObserver.unobserve(entry.target);
    });
  },
  { threshold: 0.14 }
);

document.querySelectorAll(".reveal").forEach((element) => {
  revealObserver.observe(element);
});

const heroVideo = document.querySelector(".hero-media");
const videoToggle = document.querySelector("[data-video-toggle]");
const audioToggle = document.querySelector("[data-audio-toggle]");
const volumeInput = document.querySelector("[data-volume]");

if (heroVideo && videoToggle && audioToggle && volumeInput) {
  heroVideo.volume = Number(volumeInput.value);

  const syncVideoControls = () => {
    videoToggle.textContent = heroVideo.paused ? "Play" : "Pause";
    videoToggle.setAttribute("aria-label", heroVideo.paused ? "Запустить видео" : "Пауза");
    audioToggle.textContent = heroVideo.muted || heroVideo.volume === 0 ? "Sound off" : "Sound on";
    audioToggle.setAttribute("aria-label", heroVideo.muted || heroVideo.volume === 0 ? "Включить звук" : "Выключить звук");
  };

  videoToggle.addEventListener("click", async () => {
    if (heroVideo.paused) {
      await heroVideo.play();
    } else {
      heroVideo.pause();
    }
    syncVideoControls();
  });

  audioToggle.addEventListener("click", async () => {
    heroVideo.muted = !heroVideo.muted;
    if (!heroVideo.muted && heroVideo.paused) {
      await heroVideo.play();
    }
    syncVideoControls();
  });

  volumeInput.addEventListener("input", () => {
    heroVideo.volume = Number(volumeInput.value);
    heroVideo.muted = heroVideo.volume === 0;
    syncVideoControls();
  });

  heroVideo.addEventListener("play", syncVideoControls);
  heroVideo.addEventListener("pause", syncVideoControls);
  syncVideoControls();
}

const surveyStorageKey = "lspd-specialization-surveys";

const getFieldLabel = (field) => {
  const label = field.closest("label");
  if (!label) return field.name || "Поле";

  const clone = label.cloneNode(true);
  clone.querySelectorAll("input, textarea, select").forEach((control) => control.remove());
  return clone.textContent.replace(/\s+/g, " ").trim() || field.name || "Поле";
};

const buildSurveyText = (form) => {
  const lines = [
    "----------------------------------------",
    `Дата отправки: ${new Date().toLocaleString("ru-RU")}`,
    `Опрос: ${form.dataset.surveyTitle || "Специализация"}`,
  ];

  form.querySelectorAll("input, textarea").forEach((field) => {
    if (field.type === "button" || field.type === "reset") return;
    if ((field.type === "radio" || field.type === "checkbox") && !field.checked) return;

    const label = getFieldLabel(field);
    const value = field.type === "checkbox" ? "Да" : field.value.trim();
    lines.push(`${label}: ${value || "-"}`);
  });

  return lines.join("\n");
};

const readSurveyJournal = () => {
  try {
    return JSON.parse(localStorage.getItem(surveyStorageKey)) || [];
  } catch {
    return [];
  }
};

const downloadSurveyJournal = (entries) => {
  const content = entries.join("\n\n");
  const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = "lspd-specialization-surveys.txt";
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
};

document.querySelectorAll("[data-submit-survey]").forEach((button) => {
  button.addEventListener("click", () => {
    const form = button.closest("form");
    if (!form) return;

    const entries = readSurveyJournal();
    entries.push(buildSurveyText(form));
    localStorage.setItem(surveyStorageKey, JSON.stringify(entries));
    downloadSurveyJournal(entries);

    const originalText = button.textContent;
    button.textContent = "Отправлено";
    window.setTimeout(() => {
      button.textContent = originalText;
    }, 1600);
  });
});
