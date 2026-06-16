
/* =========================================================
   ANTI-FREEZE GUARD
   放在最前面：限制舊版 MutationObserver 補丁連續觸發造成瀏覽器卡死。
   ========================================================= */
(function antiFreezeGuardBeforeOldPatches() {
  if (window.__ANTI_FREEZE_GUARD_INSTALLED__) return;
  window.__ANTI_FREEZE_GUARD_INSTALLED__ = true;

  const NativeMutationObserver = window.MutationObserver;
  if (!NativeMutationObserver) return;

  window.MutationObserver = function SafeMutationObserver(callback) {
    let timer = null;
    let hits = 0;
    let start = Date.now();
    let observer = null;

    const wrapped = function(mutations, obs) {
      const now = Date.now();
      if (now - start > 5000) {
        start = now;
        hits = 0;
      }
      hits += 1;

      // 5 秒內觸發太多次就停止這個 observer，避免整頁卡死。
      if (hits > 80) {
        try { obs.disconnect(); } catch (e) {}
        return;
      }

      clearTimeout(timer);
      timer = setTimeout(function() {
        try { callback(mutations, obs); } catch (e) { console.warn("MutationObserver callback stopped:", e); }
      }, 120);
    };

    observer = new NativeMutationObserver(wrapped);
    return observer;
  };

  window.MutationObserver.prototype = NativeMutationObserver.prototype;
})();




/* ===== 語言切換：繁中 / 英文 / 日文 ===== */
const i18nText = {
  zh: {
    languageButton: "語言",
    language: "語言",
    siteTitle: "智慧居家健康照護系統",
    siteSubtitle: "健康紀錄 × AI 分析 × 知識問答 × 緊急支援",
    sosTitle: "SOS 緊急",
    sosSubtitle: "快速聯絡醫療資源",
    call119: "撥打 119",
    nearbyHospital: "附近醫院",
    nearbyER: "附近急診",
    emergencyTitle: "緊急提醒",
    emergencyTip1: "胸痛、喘或意識不清，",
    emergencyTip2: "請立即撥打 119。",
    aiTitle: "AI 分析",
    aiSubtitle: "按下方圖片查看身體分數",
    viewAIReport: "查看 AI 健檢報告",
    viewHealthChart: "查看健康折線圖",
    eduContentTitle: "衛教內容",
    eduContentSubtitle: "查看居家照護與健康知識",
    eduKnowledge: "衛教知識",
    readHealthKnowledge: "閱讀健康知識",
    dailyTitle: "每日紀錄",
    dailySubtitle: "輸入你的健康數據",
    enterHealthData: "輸入健康數據",
    notRecordedToday: "今日尚未紀錄",
    recordedToday: "今日已完成紀錄",
    heightPlaceholder: "身高 cm",
    weightPlaceholder: "體重 kg",
    viewBMI: "查看 BMI",
    streakPrefix: "連續紀錄：",
    streakSuffix: " 天",
    heightWeightAlert: "請先輸入身高與體重！",
    bmiAlert: "你的 BMI 是：{value}",
    healthScore: "健康分數：{value} 分",
    warningPopupTitle: "⚠️ 警示提醒",
    warningBpHigh: "⚠ 血壓偏高，建議固定時間量測並採低鹽飲食。",
    warningDiaLow: "⚠ 舒張壓偏低，可能出現頭暈或無力症狀。",
    warningPulseFast: "⚠ 脈搏偏快，建議休息與觀察。",
    warningBmiHigh: "⚠ BMI 過高，建議控制飲食與運動。",
    normalPopupTitle: "🌿 今日健康鼓勵",
    normalPopupText: "今天的健康數值很穩定，表現很棒！<br>每一次紀錄，都是在幫自己累積健康資料。<br>請繼續保持規律作息、均衡飲食，讓好狀態一天一天延續下去。",
    closeButton: "關閉",
    moodHappy: "😊 心情愉悅",
    moodStress: "😐 壓力很大",
    moodIrritated: "😣 心情煩躁",
    moodTired: "😴 感到疲累",
    moodComfort: "😢 需要抱抱",
    moodEnergy: "💪 活力滿滿",
    moodCalm: "😌 放鬆平靜",
    moodAngry: "😡 有點生氣",
    moodLow: "😵 精神不佳",
    moodExcited: "🥳 開心興奮",
    negativeMoodTitle: "⚠️ 偵測到較明顯的負面情緒",
    negativeMoodText: "系統偵測到您目前可能有壓力、疲累或情緒低落的狀態，建議進一步完成簡短量表，以更了解目前心理狀態。",
    startMoodAssessment: "立即進行情緒評估",
    moodPopupPrefix: "你今天是「{mood}」呀！",
    moodPopupNegative: "我也幫你開啟了進一步情緒評估，可以往下查看。"
  }
};

const staticI18nText = {};

const staticPlaceholderI18nText = {
  "身高 cm": { en: "Height (cm)", ja: "身長 cm" },
  "體重 kg": { en: "Weight (kg)", ja: "体重 kg" },
  "例如：160": { en: "e.g. 160", ja: "例：160" },
  "例如：50": { en: "e.g. 50", ja: "例：50" },
  "例如：120": { en: "e.g. 120", ja: "例：120" },
  "例如：80": { en: "e.g. 80", ja: "例：80" },
  "例如：72": { en: "e.g. 72", ja: "例：72" },
  "例如：84": { en: "e.g. 84", ja: "例：84" },
  "例如：66": { en: "e.g. 66", ja: "例：66" },
  "例如：90": { en: "e.g. 90", ja: "例：90" }
};

function normalizeStaticText(value) {
  return String(value || "").replace(/\s+/g, " ").trim();
}

function translateStaticTextNode(node) {
  if (!node || !node.nodeValue || !node.parentElement) return;
  if (["SCRIPT", "STYLE"].includes(node.parentElement.tagName)) return;

  const raw = node.nodeValue;
  const trimmed = normalizeStaticText(raw);
  if (!trimmed) return;

  if (!node._originalZhText && /[\u4e00-\u9fff]/.test(trimmed)) {
    node._originalZhText = trimmed;
  }

  const original = node._originalZhText;
  if (!original) return;

  if (currentLanguage === "zh") {
    node.nodeValue = raw.match(/^\s/) || raw.match(/\s$/)
      ? raw.replace(trimmed, original)
      : original;
    return;
  }

  const translated = staticI18nText[original]?.[currentLanguage];
  if (!translated) return;

  node.nodeValue = raw.match(/^\s/) || raw.match(/\s$/)
    ? raw.replace(trimmed, translated)
    : translated;
}

function applyStaticLanguage() {
  document.title = currentLanguage === "zh"
    ? "智慧居家衛教平台"
    : (staticI18nText["智慧居家衛教平台"]?.[currentLanguage] || "智慧居家衛教平台");

  const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
  const nodes = [];
  while (walker.nextNode()) nodes.push(walker.currentNode);
  nodes.forEach(translateStaticTextNode);

  document.querySelectorAll("input[placeholder], textarea[placeholder]").forEach(el => {
    const raw = el.getAttribute("placeholder") || "";
    const normalized = normalizeStaticText(raw);
    if (!el.dataset.originalPlaceholder && /[\u4e00-\u9fff]/.test(normalized)) {
      el.dataset.originalPlaceholder = normalized;
    }
    const original = el.dataset.originalPlaceholder;
    if (!original) return;
    if (currentLanguage === "zh") {
      el.setAttribute("placeholder", original);
      return;
    }
    const translated = staticPlaceholderI18nText[original]?.[currentLanguage];
    if (translated) el.setAttribute("placeholder", translated);
  });
}

let currentLanguage = "zh";

function normalizeLanguage(lang) {
  if (lang === "zh-TW" || lang === "zh-Hant" || lang === "zh") return "zh";
  if (lang === "en" || lang === "ja") return lang;
  return "zh";
}

function translateText(key, replacements = {}) {
  let output = i18nText[currentLanguage]?.[key] || i18nText.zh[key] || null;
  if (output === null || output === undefined) return null;
  Object.keys(replacements).forEach(name => {
    output = output.replace(`{${name}}`, replacements[name]);
  });
  return output;
}

function toggleLanguageMenu() {
  const menu = document.getElementById("language-menu") || document.getElementById("lang-menu");
  if (menu) menu.classList.toggle("hidden");
}

function setLanguage(lang) {
  currentLanguage = normalizeLanguage(lang);
  localStorage.setItem("siteLanguage", currentLanguage);
  applyLanguage();

  const menu = document.getElementById("language-menu") || document.getElementById("lang-menu");
  if (menu) menu.classList.add("hidden");
}

function applyLanguage() {
  document.documentElement.lang = currentLanguage === "zh" ? "zh-TW" : currentLanguage;
  document.body.classList.remove("lang-zh", "lang-en", "lang-ja");
  document.body.classList.add(`lang-${currentLanguage}`);

  document.querySelectorAll("[data-i18n]").forEach(el => {
    const key = el.dataset.i18n;
    const translated = translateText(key);
    if (translated !== null && translated !== "") el.textContent = translated;
  });

  document.querySelectorAll("[data-placeholder-i18n]").forEach(el => {
    const key = el.dataset.placeholderI18n;
    const translated = translateText(key);
    if (translated !== null && translated !== "") el.placeholder = translated;
  });

  applyStaticLanguage();
  updateRecordStatusText();
  updateHomeScoreLanguage();
  document.querySelectorAll('button[onclick="closeMessagePopup()"], button[onclick="closeMoodPopup()"]').forEach(btn => { btn.textContent = translateText("closeButton") || btn.textContent; });

  const scaleIntroModal = document.getElementById("scaleIntroModal");
  if (scaleIntroModal && !scaleIntroModal.classList.contains("hidden") && pendingScaleType) {
    showScaleIntro(pendingScaleType);
  }
  const scaleQuestionPanel = document.getElementById("scale-question-panel");
  if (scaleQuestionPanel && scaleQuestionPanel.style.display !== "none" && currentScale) {
    renderScaleQuestion();
  }
}

function updateRecordStatusText() {
  const btn = document.getElementById("record-status-btn");
  if (!btn) return;

  const status = btn.dataset.status || "notYet";
  const key = status === "done" ? "recordedToday" : "notRecordedToday";
  const icon = status === "done" ? "" : "";
  btn.innerHTML = `${icon} <span data-i18n="${key}">${translateText(key)}</span>`;
}

function updateHomeScoreLanguage() {
  const homeScore = document.getElementById("home-score");
  if (!homeScore) return;

  const raw = homeScore.dataset.score || "--";
  homeScore.textContent = `${translateText("healthScore", { value: raw })}`;
}

document.addEventListener("DOMContentLoaded", () => {
  applyLanguage();

  document.addEventListener("click", event => {
    const switcher = event.target.closest(".language-switch");
    const menu = document.getElementById("language-menu") || document.getElementById("lang-menu");
    if (!switcher && menu) menu.classList.add("hidden");
  });
});

let eduReadTimer = null;
let currentEduKey = null;

let selectedMetric = "bmi";

let selectedMood = "😊 心情愉悅";
let latestBMI = null;
let answered = false;
let quizIndex = 0;
let quizScore = 0;
let currentLevel = "easy";
let currentQuizQuestions = [];
let currentQuizSessionLevel = "";
let currentQuizSessionTopic = null;

function showPage(pageId) {
  document.querySelectorAll(".page").forEach(page => {
    page.classList.add("hidden");
  });

  const targetPage = document.getElementById(pageId);

  if (!targetPage) {
    alert("找不到頁面：" + pageId);
    return;
  }

  targetPage.classList.remove("hidden");

  // 首頁顯示 header，其他頁面隱藏 header，避免上方大空白
  if (pageId === "home-page") {
    document.body.classList.remove("sub-page-mode");
  } else {
    document.body.classList.add("sub-page-mode");
  }

  // 保留你原本的測驗功能
  if (pageId === "quiz-menu-page") {
    updateQuizMenuLabel();
  }

  if (pageId === "quiz-page") {
    startNewQuizRound(currentLevel);
    loadQuestion();
    updateQuizProgress();
  }

  window.scrollTo({
    top: 0,
    behavior: "auto"
  });
}

function calculateBMI(height, weight) {
  const h = Number(height) / 100;

  if (!h || !weight) {
    return "--";
  }

  return (Number(weight) / (h * h)).toFixed(1);
}

function calculateHomeBMI() {
  const height = document.getElementById("home-height").value;
  const weight = document.getElementById("home-weight").value;

  if (!height || !weight) {
    alert(translateText("heightWeightAlert"));
    return;
  }

  latestBMI = calculateBMI(height, weight);
  alert(translateText("bmiAlert", { value: latestBMI }));
}

function updateRecordStatus() {
  const btn = document.getElementById("record-status-btn");

  if (!btn) return;

  btn.dataset.status = "done";
  btn.classList.add("done");
  updateRecordStatusText();
}

function saveData() {
  const height = document.getElementById("height").value;
  const weight = document.getElementById("weight").value;
  const systolic = Number(document.getElementById("systolic").value);
  const diastolic = Number(document.getElementById("diastolic").value);
  const pulse = Number(document.getElementById("pulse").value);
  const chest = document.getElementById("chest").value;
  const waist = document.getElementById("waist").value;
  const hip = document.getElementById("hip").value;

  if (!height || !weight || !systolic || !diastolic || !pulse) {
    alert("請填寫完整基本資料：身高、體重、血壓、脈搏！");
    return;
  }

  const bmi = calculateBMI(height, weight);

  const data = {
    height,
    weight,
    systolic,
    diastolic,
    pulse,
    chest,
    waist,
    hip,
    mood: selectedMood,
    bmi
  };

  localStorage.setItem("healthData", JSON.stringify(data));

  let history = JSON.parse(localStorage.getItem("healthHistory")) || [];

  history.push({
    date: new Date().toISOString().slice(0, 10),
    height,
    weight,
    systolic,
    diastolic,
    pulse,
    chest,
    waist,
    hip,
    bmi
  });

  localStorage.setItem("healthHistory", JSON.stringify(history));
  addDailyRecordPoints();
  updateRecordStatus();
  updateStreakDays();
  analyze();

  let warnings = [];

  if (systolic >= 140 || diastolic >= 90) {
    warnings.push(translateText("warningBpHigh"));
  }

  if (diastolic <= 50) {
    warnings.push(translateText("warningDiaLow"));
  }

  if (pulse > 100) {
    warnings.push(translateText("warningPulseFast"));
  }

  if (bmi >= 27) {
    warnings.push(translateText("warningBmiHigh"));
  }

  let message = "";

  if (warnings.length > 0) {
    message = `${translateText("warningPopupTitle")}<br><br>${warnings.join("<br><br>")}`;
  } else {
    message = `${translateText("normalPopupTitle")}<br><br>${translateText("normalPopupText")}`;
  }

  const popupMessage = document.getElementById("popup-message");
  const messagePopup = document.getElementById("message-popup");

  if (popupMessage && messagePopup) {
    popupMessage.innerHTML = message;
    messagePopup.classList.remove("hidden");
  }

  const emergency =
    systolic >= 180 ||
    diastolic >= 120 ||
    diastolic <= 50 ||
    pulse >= 140 ||
    pulse <= 40;

  if (emergency) {
    setTimeout(() => {
      showEmergencyPopup([
        "🚨 偵測到危險健康數值！",
        systolic >= 180 ? "收縮壓過高，可能有高血壓危象風險。" : "",
        diastolic >= 120 ? "舒張壓過高，可能有急性心血管風險。" : "",
        diastolic <= 50 ? "舒張壓過低，可能出現頭暈、無力或昏倒風險。" : "",
        pulse >= 140 ? "脈搏過快，可能有心律異常風險。" : "",
        pulse <= 40 ? "脈搏過慢，可能有昏厥風險。" : ""
      ].filter(Boolean));
    }, 600);
  }
}

function analyze() {
  const data = JSON.parse(localStorage.getItem("healthData"));

  if (!data) {
    alert("請先完成每日紀錄！");
    return;
  }

  let healthScore = 100;
  let advice = [];

  const systolic = Number(data.systolic);
  const diastolic = Number(data.diastolic);
  const pulse = Number(data.pulse);
  const bmi = Number(data.bmi);
  const waist = Number(data.waist);

  if (systolic >= 140 || diastolic >= 90) {
    healthScore -= 20;

    advice.push("⚠ 血壓偏高，建議固定時間量測並減少高鹽、高油食物。");
    advice.push("⚠ 建議避免熬夜、情緒壓力與過量咖啡因。");
    advice.push("⚠ 若持續偏高，建議至醫療院所進一步檢查。");
  }

  else if (systolic <= 90 || diastolic <= 60) {
    healthScore -= 20;

    advice.push("⚠ 血壓偏低，可能出現頭暈、無力或疲倦。");
    advice.push("⚠ 建議先休息並補充水分，避免突然站起。");
    advice.push("⚠ 若持續不舒服或暈眩，建議盡快就醫。");
  }

  else {
    advice.push("✅ 血壓目前位於正常範圍，請持續維持良好生活習慣。");
  }

  if (bmi < 18.5) {
    healthScore -= 10;
    advice.push("⚠ BMI 偏低，建議注意營養攝取。");
  }

  else if (bmi >= 24) {
    healthScore -= 10;
    advice.push("⚠ BMI 偏高，建議增加活動量並控制飲食。");
  }

  if (waist >= 90) {
    healthScore -= 10;
    advice.push("⚠ 腰圍偏高，需注意腹部肥胖與慢性病風險。");
  }

  if (pulse > 100 || pulse < 50) {
    healthScore -= 10;
    advice.push("⚠ 脈搏異常，建議休息後重新測量，必要時就醫。");
  }

  // 情緒量表結果只做紀錄，不納入 AI 健康分數計算，也不顯示在 AI 分析卡片中。

  if (healthScore < 0) healthScore = 0;

  const circleScore = document.getElementById("circle-score");
  const homeScore = document.getElementById("home-score");
  const scoreCircle = document.querySelector(".score-circle");

  if (circleScore) {
    circleScore.innerText = healthScore;
  }

  if (homeScore) {
    homeScore.dataset.score = healthScore;
    updateHomeScoreLanguage();
  }

  if (scoreCircle) {
    scoreCircle.style.background =
      `conic-gradient(#8b6f5a 0% ${healthScore}%, #e1d2bf ${healthScore}% 100%)`;
  }

  const reportHeight = document.getElementById("report-height");
  const reportWeight = document.getElementById("report-weight");
  const reportBmi = document.getElementById("report-bmi");
  const reportWaist = document.getElementById("report-waist");
  const reportHip = document.getElementById("report-hip");
  const reportChest = document.getElementById("report-chest");
  const reportSbp = document.getElementById("report-sbp");
  const reportDbp = document.getElementById("report-dbp");
  const reportBp = document.getElementById("report-bp");
  const reportPulse = document.getElementById("report-pulse");

  if (reportHeight) reportHeight.innerText = data.height;
  if (reportWeight) reportWeight.innerText = data.weight;
  if (reportBmi) reportBmi.innerText = data.bmi;
  if (reportWaist) reportWaist.innerText = data.waist || "--";
  if (reportHip) reportHip.innerText = data.hip || "--";
  if (reportChest) reportChest.innerText = data.chest || "--";
  if (reportSbp) reportSbp.innerText = data.systolic;
  if (reportDbp) reportDbp.innerText = data.diastolic;
  if (reportBp) reportBp.innerText = `${data.systolic} / ${data.diastolic}`;
  if (reportPulse) reportPulse.innerText = data.pulse;

  if (reportSbp) {
    reportSbp.style.color = systolic >= 140 ? "#d64545" : "#6b4d38";
  }

  if (reportDbp) {
    reportDbp.style.color =
      diastolic >= 90 || diastolic <= 50
        ? "#d64545"
        : "#6b4d38";
  }

  if (reportBmi) {
    reportBmi.style.color =
      bmi < 18.5 || bmi >= 24
        ? "#d64545"
        : "#6b4d38";
  }

  if (reportPulse) {
    reportPulse.style.color =
      pulse > 100 || pulse < 50
        ? "#d64545"
        : "#6b4d38";
  }

  if (reportWaist) {
    reportWaist.style.color =
      waist >= 90
        ? "#d64545"
        : "#6b4d38";
  }

  let summary = "";

  if (healthScore >= 80) {
    summary =
      "目前整體健康狀態穩定，大部分數值位於正常範圍。建議持續保持規律作息、均衡飲食與適度運動。";
  }

  else if (healthScore >= 60) {
    summary =
      "目前部分健康數值需要持續追蹤，建議注意血壓、脈搏與生活壓力變化，並調整生活習慣。";
  }

  else {
    summary =
      "目前健康風險較高，部分數值已明顯偏離正常範圍，建議儘早休息並尋求專業醫療協助。";
  }

  const reportSummary = document.getElementById("report-summary");
  const reportAdvice = document.getElementById("report-advice");

  if (reportSummary) {
    reportSummary.innerText = summary;
  }

  if (reportAdvice) {
    reportAdvice.innerHTML =
      advice.length
        ? advice.map(item => `<li>${item}</li>`).join("")
        : "<li>目前數值大致穩定，建議維持均衡飲食、規律運動與定期追蹤。</li>";
  }
}

function showCharts() {
  analyze();
  showPage("report-page");
}

/* ===== 知識問答 ===== */

function startQuiz(level) {
  currentLevel = level;
  currentQuizQuestions = [];
  currentQuizSessionLevel = "";
  currentQuizSessionTopic = null;
  showPage("quiz-page");
}

const difficultyNames = {
  easy: "簡單",
  medium: "中等",
  hard: "困難"
};

function getQuizTopicKey() {
  return currentEduKey && eduCategories[currentEduKey] ? currentEduKey : "mixed";
}

function getQuizTopicTitle(topicKey = getQuizTopicKey()) {
  if (topicKey === "mixed") return "綜合衛教";
  return eduCategories[topicKey]?.title || "綜合衛教";
}

function cleanEduSentence(text) {
  return String(text || "")
    .replace(/<[^>]*>/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function splitEduSentences(content) {
  return cleanEduSentence(content)
    .split(/[。！？]/)
    .map(sentence => sentence.trim())
    .filter(sentence => sentence.length > 0);
}

function shortenOption(text, maxLength = 54) {
  const clean = cleanEduSentence(text);
  return clean.length > maxLength ? clean.slice(0, maxLength) + "…" : clean;
}

function pickSentence(sentences, keywords, fallbackIndex = 0) {
  return sentences.find(sentence => keywords.some(keyword => sentence.includes(keyword))) ||
    sentences[fallbackIndex] ||
    sentences[0] ||
    "依照衛教重點處理並持續觀察變化";
}

function createQuestionFromSection(section, level, categoryTitle) {
  const sentences = splitEduSentences(section.content);
  const action = shortenOption(pickSentence(sentences, ["應", "建議", "可", "先"], 0));
  const avoid = shortenOption(pickSentence(sentences, ["不可", "不要", "不應", "避免", "不建議"], 1) || "不可使用偏方、拖延觀察或自行做高風險處理");
  const danger = shortenOption(pickSentence(sentences, ["119", "就醫", "送醫", "評估", "危險"], sentences.length - 1));
  const why = shortenOption(pickSentence(sentences, ["因為", "原理", "容易", "可能", "風險", "造成"], 0));

  if (level === "medium") {
    const options = [
      avoid,
      action,
      danger,
      "依患者狀況持續觀察，必要時尋求專業協助"
    ];

    return {
      q: `【${categoryTitle}】處理「${section.heading}」時，下列哪一項是較不建議或錯誤的作法？`,
      options,
      answer: 0,
      explain: [
        `這是錯誤或較不安全的作法，與「${section.heading}」的衛教重點不符。`,
        `這是「${section.heading}」的正確處理方向。`,
        `這是需要提高警覺或尋求協助的情況。`,
        `持續觀察與必要時求助，是安全照護的重要原則。`
      ]
    };
  }

  if (level === "hard") {
    const options = [
      why,
      "因為所有症狀都會自行恢復，所以不需要觀察",
      "因為偏方通常比標準照護更快有效",
      "因為只要休息就可以取代就醫與專業評估"
    ];

    return {
      q: `【${categoryTitle}】關於「${section.heading}」，下列哪一項最能說明背後原因或風險判斷？`,
      options,
      answer: 0,
      explain: [
        `正確，這符合「${section.heading}」的照護原理與風險判斷。`,
        `錯誤，健康問題仍需要觀察變化，不能假設都會自行恢復。`,
        `錯誤，偏方可能延誤處置或增加風險。`,
        `錯誤，休息不能取代必要的就醫與專業評估。`
      ]
    };
  }

  const options = [
    action,
    "完全不用觀察，等症狀自己消失即可",
    "優先使用偏方處理，不需要參考衛教原則",
    "只要沒有立即疼痛，就不需要注意後續變化"
  ];

  return {
    q: `【${categoryTitle}】關於「${section.heading}」，下列哪一項最正確？`,
    options,
    answer: 0,
    explain: [
      `正確，這是「${section.heading}」的基本照護重點。`,
      `錯誤，即使症狀暫時不明顯，也應觀察是否惡化。`,
      `錯誤，偏方可能造成延誤或傷害。`,
      `錯誤，後續變化也可能代表風險升高。`
    ]
  };
}

function buildTopicQuestionSet(topicKey, level = currentLevel) {
  const keys = topicKey === "mixed" ? Object.keys(eduCategories) : [topicKey];
  return keys.flatMap(key => {
    const category = eduCategories[key];
    if (!category || !Array.isArray(category.sections)) return [];
    return category.sections.map(section =>
      createQuestionFromSection(section, level, category.title.replace(/^\S+\s*/, ""))
    );
  });
}


const customQuizQuestionBank = {
  firstAid: {
    easy: [
      {
        q: "成人 CPR 的胸部按壓頻率應維持在每分鐘幾次？",
        options: ["60～80 次", "80～90 次", "100～120 次", "140～160 次"],
        answer: 2,
        explain: [
          "此頻率過慢，無法維持足夠循環。",
          "仍低於建議範圍，急救效果不足。",
          "正確，成人高品質 CPR 建議每分鐘按壓 100～120 次。",
          "過快可能讓胸部回彈不足，降低血液回流。"
        ]
      },
      {
        q: "成人 CPR 的胸部按壓深度應約為多少？",
        options: ["3～4 公分", "至少 5 公分但不超過 6 公分", "7～8 公分", "按到肋骨斷裂為止"],
        answer: 1,
        explain: [
          "深度不足，無法有效擠壓心臟。",
          "正確，5～6 公分可兼顧循環效果與安全。",
          "過深會增加胸腔與內臟受傷風險。",
          "CPR 目標是維持循環，不是造成額外傷害。"
        ]
      },
      {
        q: "AED 打開電源後，通常下一步應做什麼？",
        options: ["立刻按下電擊鈕", "貼上電擊貼片", "先自行檢查脈搏很久", "先餵患者喝水"],
        answer: 1,
        explain: [
          "AED 尚未分析心律前不能電擊。",
          "正確，貼片是 AED 分析心律與傳遞電擊的必要步驟。",
          "不應因長時間檢查而延誤 AED 操作。",
          "意識不清或急救情境不應餵食或灌水。"
        ]
      },
      {
        q: "發現有人倒地沒有反應時，第一步應先做什麼？",
        options: ["確認現場安全並呼叫患者", "直接拖到旁邊", "馬上餵藥", "等待他自己醒來"],
        answer: 0,
        explain: [
          "正確，急救前先確保自身與現場安全，再評估患者反應。",
          "任意拖動可能加重傷害。",
          "未評估前不可隨意餵藥。",
          "無反應可能是危急狀況，不能只是等待。"
        ]
      },
      {
        q: "若患者仍能大聲咳嗽，疑似異物梗塞時應怎麼做？",
        options: ["鼓勵繼續咳嗽並觀察", "立刻灌水", "用力拍背到吐出", "叫他平躺睡覺"],
        answer: 0,
        explain: [
          "正確，還能有效咳嗽時，咳嗽是清除異物的重要方式。",
          "灌水可能造成嗆咳或讓狀況更危險。",
          "不當拍背可能讓異物更深入。",
          "平躺可能增加呼吸道阻塞風險。"
        ]
      },
      {
        q: "嚴重呼吸道異物梗塞常見表現是什麼？",
        options: ["可以正常唱歌", "無法說話、無法咳嗽、臉色發紫", "肚子餓", "想睡覺但呼吸正常"],
        answer: 1,
        explain: [
          "能唱歌代表呼吸道仍可通氣。",
          "正確，這些都是嚴重阻塞的警訊，應立即求救。",
          "肚子餓不是嚴重梗塞指標。",
          "想睡但呼吸正常不等同於嚴重梗塞。"
        ]
      },
      {
        q: "低血糖且意識清楚、可以吞嚥時，應優先補充什麼？",
        options: ["含糖飲料或糖果", "大量開水", "高纖青菜", "安眠藥"],
        answer: 0,
        explain: [
          "正確，快速糖分可協助改善低血糖症狀。",
          "開水不能快速提升血糖。",
          "高纖食物升糖速度較慢。",
          "安眠藥不適合低血糖處理。"
        ]
      },
      {
        q: "低血糖患者意識不清時，下列哪一項正確？",
        options: ["強行灌含糖飲料", "讓患者側躺並撥打 119", "叫他站起來走路", "先吃一大碗飯"],
        answer: 1,
        explain: [
          "意識不清時灌飲料可能嗆入氣管。",
          "正確，應保持呼吸道通暢並立即求救。",
          "站起來可能跌倒且無法處理低血糖。",
          "意識不清不能進食。"
        ]
      },
      {
        q: "失去意識但仍有正常呼吸時，較適合採取什麼姿勢？",
        options: ["復甦姿勢側躺", "趴睡", "坐直不扶", "頭向後仰喝水"],
        answer: 0,
        explain: [
          "正確，側躺可降低嘔吐物或分泌物阻塞呼吸道的風險。",
          "趴睡可能影響呼吸觀察。",
          "無意識者坐直容易倒下受傷。",
          "無意識者不可喝水。"
        ]
      },
      {
        q: "懷疑心肌梗塞時，最正確的處置是什麼？",
        options: ["停止活動、休息並撥打 119", "自己騎車去醫院", "先忍耐看看", "大量喝咖啡提神"],
        answer: 0,
        explain: [
          "正確，心肌梗塞屬急症，應立即求救並避免活動。",
          "自行騎車或開車途中可能惡化。",
          "延誤可能錯過治療黃金時間。",
          "咖啡因可能增加心臟負擔。"
        ]
      }
    ],
    medium: [
      {
        q: "成人 CPR 時，下列何者最符合高品質胸部按壓？",
        options: ["每分鐘 100～120 次、深度 5～6 公分並讓胸部完全回彈", "速度越快越好", "按壓後不需要回彈", "只按壓 1 公分避免肋骨受傷"],
        answer: 0,
        explain: [
          "正確，頻率、深度與完全回彈都是高品質 CPR 重點。",
          "過快會降低回彈與血液回流。",
          "不回彈會降低心臟充血。",
          "深度過淺無法產生有效循環。"
        ]
      },
      {
        q: "AED 分析心律時，現場人員應怎麼做？",
        options: ["所有人暫停接觸患者", "繼續搖晃患者保持清醒", "持續按壓胸部不能停", "替患者餵水"],
        answer: 0,
        explain: [
          "正確，分析心律時不可接觸患者，以免干擾判讀。",
          "搖晃會干擾分析，也可能造成傷害。",
          "AED 分析時需暫停按壓並依語音指示。",
          "急救時不應餵水。"
        ]
      },
      {
        q: "使用 AED 時，若患者胸部潮濕，較正確的處理是什麼？",
        options: ["擦乾胸部再貼電擊貼片", "直接貼在水上", "把貼片貼在衣服上", "不開 AED"],
        answer: 0,
        explain: [
          "正確，胸部應擦乾，貼片才能穩定貼附並降低漏電風險。",
          "水分會增加電擊風險並影響貼附。",
          "貼片需直接貼在皮膚上。",
          "AED 是重要急救工具，不應因可處理的潮濕而放棄。"
        ]
      },
      {
        q: "成人嚴重異物梗塞且無法咳嗽時，常用的急救方式是什麼？",
        options: ["腹部衝擊法", "灌大量開水", "讓患者平躺睡覺", "用手盲目挖喉嚨"],
        answer: 0,
        explain: [
          "正確，成人嚴重呼吸道阻塞可使用腹部衝擊法。",
          "灌水可能造成嗆入。",
          "平躺會讓阻塞更危險。",
          "盲目挖取可能把異物推得更深。"
        ]
      },
      {
        q: "異物梗塞患者失去意識後，應採取何種處理？",
        options: ["立即開始 CPR 並請人拿 AED", "繼續站著做腹部衝擊", "餵食幫助吞下", "讓他趴著等待"],
        answer: 0,
        explain: [
          "正確，失去意識後需啟動 CPR 流程並求救。",
          "無意識者無法站立，繼續腹部衝擊不適合。",
          "無意識不可餵食。",
          "等待會延誤急救。"
        ]
      },
      {
        q: "低血糖處理後，為什麼仍需要持續觀察？",
        options: ["血糖可能再次下降或症狀未完全改善", "只要吃糖就一定完全沒事", "觀察只是浪費時間", "低血糖不可能復發"],
        answer: 0,
        explain: [
          "正確，補糖後仍需確認症狀與狀態是否穩定。",
          "部分患者可能需要後續醫療評估。",
          "觀察可避免延誤惡化。",
          "藥物、運動或進食不足都可能讓低血糖再發。"
        ]
      },
      {
        q: "失去意識但仍有呼吸者採側躺的主要目的為何？",
        options: ["降低舌頭後墜、嘔吐物阻塞呼吸道風險", "讓患者睡得更熟", "讓血糖上升", "取代撥打 119"],
        answer: 0,
        explain: [
          "正確，復甦姿勢有助於維持呼吸道通暢。",
          "目的不是讓患者睡覺。",
          "側躺不會直接提升血糖。",
          "側躺不能取代求救與觀察。"
        ]
      },
      {
        q: "懷疑心肌梗塞時，為什麼不建議自行開車就醫？",
        options: ["途中可能意識改變或病情惡化，增加危險", "因為醫院不收自行到院者", "因為胸痛一定會自己好", "因為救護車只負責外傷"],
        answer: 0,
        explain: [
          "正確，救護車可提供途中監測與緊急處置。",
          "自行到院不是問題，問題是途中安全與急救能力不足。",
          "胸痛可能是危急心臟事件。",
          "救護車也處理心臟急症。"
        ]
      },
      {
        q: "心肌梗塞常見危險症狀不包括下列哪一項？",
        options: ["胸口壓迫感與冒冷汗", "呼吸困難或噁心", "疼痛延伸到左手臂、下巴或背部", "單純指甲長得比較快"],
        answer: 3,
        explain: [
          "這是心肌梗塞可能症狀。",
          "這是心肌梗塞可能症狀。",
          "這是心肌梗塞可能症狀。",
          "正確，指甲生長速度不是心肌梗塞警訊。"
        ]
      },
      {
        q: "進行 CPR 時，每次按壓後讓胸部完全回彈的原因是什麼？",
        options: ["讓血液回流到心臟，下一次按壓才有效", "讓患者比較不會痛", "讓 AED 自動充電", "避免需要叫救護車"],
        answer: 0,
        explain: [
          "正確，完全回彈有助於心臟重新充血。",
          "CPR 對無反應患者以維持循環為主要目標。",
          "AED 充電與胸部回彈無直接關係。",
          "CPR 不能取代撥打 119。"
        ]
      }
    ],
    hard: [
      {
        q: "關於成人高品質 CPR，下列敘述何者最正確？",
        options: ["按壓深度至少 5 公分但不超過 6 公分，頻率 100～120 次/分，並避免中斷", "按壓越深越好，最好超過 8 公分", "只要有 AED 就不用 CPR", "按壓時胸部不需回彈"],
        answer: 0,
        explain: [
          "正確，這些都是提升循環效率與降低傷害的重要原則。",
          "過深會增加嚴重胸腔傷害風險。",
          "AED 與 CPR 需配合使用，不能完全取代。",
          "不回彈會降低靜脈回流與按壓效果。"
        ]
      },
      {
        q: "AED 使用時，下列何者最正確？",
        options: ["開啟電源後依語音指示操作，分析與電擊時避免接觸患者", "分析心律時持續搖晃患者", "患者躺在水中也可直接電擊", "貼片可貼在衣服外面"],
        answer: 0,
        explain: [
          "正確，依 AED 指令並保持無接觸可提高安全與判讀準確性。",
          "動作會干擾 AED 分析。",
          "應移至較乾燥處並擦乾胸部。",
          "貼片需貼在裸露皮膚上。"
        ]
      },
      {
        q: "懷孕後期或明顯肥胖患者發生嚴重異物梗塞時，腹部衝擊不適合時可改用什麼？",
        options: ["胸部衝擊法", "倒立搖晃", "灌水", "用力壓喉嚨"],
        answer: 0,
        explain: [
          "正確，胸部衝擊可避免腹部壓迫造成額外風險。",
          "倒立搖晃危險且不標準。",
          "灌水可能嗆入。",
          "壓喉嚨可能造成傷害。"
        ]
      },
      {
        q: "低血糖患者意識不清時，為何不能強行餵食？",
        options: ["吞嚥反射可能受損，食物或液體可能嗆入氣管", "糖分會讓低血糖更嚴重", "因為所有低血糖都不用處理", "因為側躺會使血糖立刻正常"],
        answer: 0,
        explain: [
          "正確，意識不清時最重要是避免吸入與立即求救。",
          "糖分通常可改善清醒者低血糖，但無意識不能口服。",
          "低血糖可能危及生命，需要處理。",
          "側躺可維持呼吸道，但不會直接矯正血糖。"
        ]
      },
      {
        q: "失去意識但有正常呼吸者，等待救護人員期間最重要的觀察是什麼？",
        options: ["持續觀察呼吸與臉色，若呼吸停止立即 CPR", "確認他有沒有帶錢", "讓患者獨處休息", "每隔幾分鐘餵水"],
        answer: 0,
        explain: [
          "正確，狀態可能惡化，需持續評估呼吸與意識。",
          "與急救優先順序無關。",
          "無意識患者不應獨處。",
          "無意識不可餵水。"
        ]
      },
      {
        q: "心肌梗塞疑似患者突然失去意識且沒有正常呼吸時，下一步最適合做什麼？",
        options: ["立即開始 CPR 並請人取得 AED", "先按摩胸口止痛", "讓患者自行開車", "等待胸痛消失"],
        answer: 0,
        explain: [
          "正確，這代表可能心跳停止，需立即 CPR 與 AED。",
          "按摩不能恢復有效循環。",
          "無意識不可能自行就醫。",
          "等待會錯失急救時間。"
        ]
      },
      {
        q: "CPR 按壓中斷時間應盡量縮短，主要原因是什麼？",
        options: ["中斷會使冠狀動脈與腦部灌流壓下降", "中斷會讓 AED 壞掉", "中斷會讓患者立刻醒來", "中斷可以增加氧氣"],
        answer: 0,
        explain: [
          "正確，維持連續按壓可幫助重要器官血流。",
          "與 AED 損壞無關。",
          "患者是否醒來取決於循環恢復，不是中斷造成。",
          "中斷按壓不會增加有效循環。"
        ]
      },
      {
        q: "異物梗塞患者仍能咳嗽時，不建議立刻做腹部衝擊的原因是什麼？",
        options: ["有效咳嗽可能自行排出異物，過早介入可能使狀況惡化", "咳嗽代表一定沒有異物", "腹部衝擊只能用於感冒", "只要咳嗽就不用觀察"],
        answer: 0,
        explain: [
          "正確，仍能有效咳嗽時應鼓勵咳嗽並密切觀察。",
          "咳嗽仍可能代表部分阻塞。",
          "腹部衝擊用於嚴重呼吸道阻塞。",
          "仍需觀察是否惡化成無法說話或咳嗽。"
        ]
      },
      {
        q: "AED 建議電擊後，按下電擊鈕前最重要的是什麼？",
        options: ["大聲確認所有人離開患者、無人接觸", "先讓患者喝水", "繼續摸患者脈搏", "把貼片撕下來"],
        answer: 0,
        explain: [
          "正確，避免旁人接觸患者可降低觸電風險。",
          "電擊前不能餵水。",
          "不應延誤 AED 指示流程。",
          "貼片需留在正確位置。"
        ]
      },
      {
        q: "胸痛合併冒冷汗、呼吸困難、疼痛延伸至左臂時，最合理的風險判斷是什麼？",
        options: ["可能為心肌梗塞等心臟急症，應立即撥打 119", "只是姿勢不良，一定不危險", "先做劇烈運動測試", "喝咖啡後再觀察一天"],
        answer: 0,
        explain: [
          "正確，這些是心臟急症警訊，需立即就醫。",
          "不能用姿勢不良解釋所有危險胸痛。",
          "運動會增加心臟負擔。",
          "延誤可能錯過治療時機。"
        ]
      }
    ]
  },
  traumaCare: {
    "easy": [
      {
        "q": "在處理開放性外傷出血時，首選且最簡單的止血方法為何？",
        "options": [
          "止血帶止血法",
          "抬高患肢法",
          "止血點指壓法",
          "直接加壓止血法"
        ],
        "answer": 3,
        "explain": [
          "錯誤，這個作法可能不符合外傷處理原則，或可能增加感染、出血與二次傷害風險。",
          "錯誤，這個作法可能不符合外傷處理原則，或可能增加感染、出血與二次傷害風險。",
          "錯誤，這個作法可能不符合外傷處理原則，或可能增加感染、出血與二次傷害風險。",
          "正確，這是外傷照護中較安全且標準的處置。"
        ]
      },
      {
        "q": "清洗一般性外傷傷口時，下列何者是最理想的清洗液？",
        "options": [
          "自來水",
          "雙氧水",
          "藥用酒精",
          "生理食鹽水"
        ],
        "answer": 3,
        "explain": [
          "錯誤，這個作法可能不符合外傷處理原則，或可能增加感染、出血與二次傷害風險。",
          "錯誤，這個作法可能不符合外傷處理原則，或可能增加感染、出血與二次傷害風險。",
          "錯誤，這個作法可能不符合外傷處理原則，或可能增加感染、出血與二次傷害風險。",
          "正確，這是外傷照護中較安全且標準的處置。"
        ]
      },
      {
        "q": "關於輕微燒燙傷的急救處理，第一步應採取何種行動？",
        "options": [
          "沖：以流動的冷水沖洗 15 至 30 分鐘",
          "脫：立即用力脫掉患部衣物",
          "蓋：直接厚厚塗抹藥膏",
          "送：立即抱起患者送醫"
        ],
        "answer": 0,
        "explain": [
          "正確，這是外傷照護中較安全且標準的處置。",
          "錯誤，這個作法可能不符合外傷處理原則，或可能增加感染、出血與二次傷害風險。",
          "錯誤，這個作法可能不符合外傷處理原則，或可能增加感染、出血與二次傷害風險。",
          "錯誤，這個作法可能不符合外傷處理原則，或可能增加感染、出血與二次傷害風險。"
        ]
      },
      {
        "q": "當發生流鼻血時，下列哪一種姿勢是正確的？",
        "options": [
          "頭部向後仰，捏住鼻骨",
          "將衛生紙塞入鼻孔深處",
          "頭部微向前傾，捏住鼻翼兩側",
          "平躺並在額頭冰敷"
        ],
        "answer": 2,
        "explain": [
          "錯誤，這個作法可能不符合外傷處理原則，或可能增加感染、出血與二次傷害風險。",
          "錯誤，這個作法可能不符合外傷處理原則，或可能增加感染、出血與二次傷害風險。",
          "正確，這是外傷照護中較安全且標準的處置。",
          "錯誤，這個作法可能不符合外傷處理原則，或可能增加感染、出血與二次傷害風險。"
        ]
      },
      {
        "q": "傷口若出現紅、腫、熱、痛以及膿性分泌物時，代表可能發生了什麼狀況？",
        "options": [
          "組織液滲出",
          "過敏反應",
          "細菌感染",
          "正常修復過程"
        ],
        "answer": 2,
        "explain": [
          "錯誤，這個作法可能不符合外傷處理原則，或可能增加感染、出血與二次傷害風險。",
          "錯誤，這個作法可能不符合外傷處理原則，或可能增加感染、出血與二次傷害風險。",
          "正確，這是外傷照護中較安全且標準的處置。",
          "錯誤，這個作法可能不符合外傷處理原則，或可能增加感染、出血與二次傷害風險。"
        ]
      },
      {
        "q": "如果右眼進入小異物（如灰塵或沙粒），正確的處理方法為何？",
        "options": [
          "用手指或棉花棒清除",
          "左右眨眼並揉眼睛弄出來",
          "用眼藥水大量沖洗傷口",
          "不可揉眼，應以流動清水沖洗"
        ],
        "answer": 3,
        "explain": [
          "錯誤，這個作法可能不符合外傷處理原則，或可能增加感染、出血與二次傷害風險。",
          "錯誤，這個作法可能不符合外傷處理原則，或可能增加感染、出血與二次傷害風險。",
          "錯誤，這個作法可能不符合外傷處理原則，或可能增加感染、出血與二次傷害風險。",
          "正確，這是外傷照護中較安全且標準的處置。"
        ]
      },
      {
        "q": "懷疑患肢有骨折時，在救援到達前，應如何處置受傷部位？",
        "options": [
          "嘗試將骨折推回原位",
          "用力拉直扭曲的肢體",
          "勉強彎折下肢以緩解疼痛",
          "維持受傷部位穩定，予以固定"
        ],
        "answer": 3,
        "explain": [
          "錯誤，這個作法可能不符合外傷處理原則，或可能增加感染、出血與二次傷害風險。",
          "錯誤，這個作法可能不符合外傷處理原則，或可能增加感染、出血與二次傷害風險。",
          "錯誤，這個作法可能不符合外傷處理原則，或可能增加感染、出血與二次傷害風險。",
          "正確，這是外傷照護中較安全且標準的處置。"
        ]
      },
      {
        "q": "關於被異物刺入或穿刺傷，下列處置方式何者正確？",
        "options": [
          "盡快將異物自行拔除",
          "保持完整，切勿自行拔除",
          "先塗抹藥膏再拔除",
          "用手固定後拔出異物"
        ],
        "answer": 1,
        "explain": [
          "錯誤，這個作法可能不符合外傷處理原則，或可能增加感染、出血與二次傷害風險。",
          "正確，這是外傷照護中較安全且標準的處置。",
          "錯誤，這個作法可能不符合外傷處理原則，或可能增加感染、出血與二次傷害風險。",
          "錯誤，這個作法可能不符合外傷處理原則，或可能增加感染、出血與二次傷害風險。"
        ]
      },
      {
        "q": "在旅行或日常意外中，若傷口大量出血，第一步應為何？",
        "options": [
          "將手臂向上抬高止血",
          "在傷口周圍塗藥水",
          "清潔雙手，直接在傷口上施壓",
          "先呼吸放鬆心情"
        ],
        "answer": 2,
        "explain": [
          "錯誤，這個作法可能不符合外傷處理原則，或可能增加感染、出血與二次傷害風險。",
          "錯誤，這個作法可能不符合外傷處理原則，或可能增加感染、出血與二次傷害風險。",
          "正確，這是外傷照護中較安全且標準的處置。",
          "錯誤，這個作法可能不符合外傷處理原則，或可能增加感染、出血與二次傷害風險。"
        ]
      },
      {
        "q": "針對嚴重的肢體切斷傷，下列保存斷肢的方法何者正確？",
        "options": [
          "用高濃度生理食鹽水浸泡",
          "以乾淨紗布包好放入塑膠袋，再置於冰水中",
          "直接將斷肢放進冰水中保存",
          "在切口處塗抹強力膠延緩出血"
        ],
        "answer": 1,
        "explain": [
          "錯誤，這個作法可能不符合外傷處理原則，或可能增加感染、出血與二次傷害風險。",
          "正確，這是外傷照護中較安全且標準的處置。",
          "錯誤，這個作法可能不符合外傷處理原則，或可能增加感染、出血與二次傷害風險。",
          "錯誤，這個作法可能不符合外傷處理原則，或可能增加感染、出血與二次傷害風險。"
        ]
      }
    ],
    "medium": [
      {
        "q": "在進行一般外傷傷口清洗時，最建議優先使用的液體為何？",
        "options": [
          "0.9% 正常生理食鹽水",
          "高濃度雙氧水",
          "煮沸過的自來水",
          "75% 藥用酒精"
        ],
        "answer": 0,
        "explain": [
          "正確，這是外傷照護中較安全且標準的處置。",
          "錯誤，這個作法可能不符合外傷處理原則，或可能增加感染、出血與二次傷害風險。",
          "錯誤，這個作法可能不符合外傷處理原則，或可能增加感染、出血與二次傷害風險。",
          "錯誤，這個作法可能不符合外傷處理原則，或可能增加感染、出血與二次傷害風險。"
        ]
      },
      {
        "q": "關於傷口消毒的順序，下列何者正確？",
        "options": [
          "先消毒周圍完整皮膚再消毒傷口",
          "採取上下反覆來回擦拭",
          "由傷口邊緣向中心集中擦拭",
          "由傷口中心向外圍環狀擦拭"
        ],
        "answer": 3,
        "explain": [
          "錯誤，這個作法可能不符合外傷處理原則，或可能增加感染、出血與二次傷害風險。",
          "錯誤，這個作法可能不符合外傷處理原則，或可能增加感染、出血與二次傷害風險。",
          "錯誤，這個作法可能不符合外傷處理原則，或可能增加感染、出血與二次傷害風險。",
          "正確，這是外傷照護中較安全且標準的處置。"
        ]
      },
      {
        "q": "當遇到急性大出血時，首選的緊急止血方法為何？",
        "options": [
          "抬高患肢法",
          "止血帶止血法",
          "直接加壓止血法",
          "指壓止血法"
        ],
        "answer": 2,
        "explain": [
          "錯誤，這個作法可能不符合外傷處理原則，或可能增加感染、出血與二次傷害風險。",
          "錯誤，這個作法可能不符合外傷處理原則，或可能增加感染、出血與二次傷害風險。",
          "正確，這是外傷照護中較安全且標準的處置。",
          "錯誤，這個作法可能不符合外傷處理原則，或可能增加感染、出血與二次傷害風險。"
        ]
      },
      {
        "q": "下列哪一項症狀是傷口發生感染的典型徵象？",
        "options": [
          "傷口出現粉紅色的肉芽組織",
          "傷口紅、腫、熱、痛且有分泌物",
          "傷口流出清澈的漿液性滲液",
          "傷口邊緣出現輕微癢感"
        ],
        "answer": 1,
        "explain": [
          "錯誤，這個作法可能不符合外傷處理原則，或可能增加感染、出血與二次傷害風險。",
          "正確，這是外傷照護中較安全且標準的處置。",
          "錯誤，這個作法可能不符合外傷處理原則，或可能增加感染、出血與二次傷害風險。",
          "錯誤，這個作法可能不符合外傷處理原則，或可能增加感染、出血與二次傷害風險。"
        ]
      },
      {
        "q": "使用優碘消毒傷口後，為何有些醫護建議用生理食鹽水拭去？",
        "options": [
          "避免傷口接觸氧氣",
          "優碘必須與鹽水混合才有殺菌力",
          "減少碘對纖維母細胞的毒性，避免色素沉澱",
          "優碘若不擦掉會導致傷口過度乾燥"
        ],
        "answer": 2,
        "explain": [
          "錯誤，這個作法可能不符合外傷處理原則，或可能增加感染、出血與二次傷害風險。",
          "錯誤，這個作法可能不符合外傷處理原則，或可能增加感染、出血與二次傷害風險。",
          "正確，這是外傷照護中較安全且標準的處置。",
          "錯誤，這個作法可能不符合外傷處理原則，或可能增加感染、出血與二次傷害風險。"
        ]
      },
      {
        "q": "針對眼睛遭異物刺激，目測異物明顯位於上眼瞼時，下列哪項處置較合適？",
        "options": [
          "強行翻開上眼瞼，用手指取出",
          "傷口處塗藥膏後閉眼休息",
          "轉動眼球並至醫療院所由專業人員處理",
          "用棉花棒在眼球表面來回擦拭"
        ],
        "answer": 2,
        "explain": [
          "錯誤，這個作法可能不符合外傷處理原則，或可能增加感染、出血與二次傷害風險。",
          "錯誤，這個作法可能不符合外傷處理原則，或可能增加感染、出血與二次傷害風險。",
          "正確，這是外傷照護中較安全且標準的處置。",
          "錯誤，這個作法可能不符合外傷處理原則，或可能增加感染、出血與二次傷害風險。"
        ]
      },
      {
        "q": "損傷後的踝部腫痛，除了傷口處理外，最應優先確認哪種情況？",
        "options": [
          "鞋子是否乾淨",
          "是否感染",
          "肢端血液循環與神經功能",
          "只是皮膚顏色是否好看"
        ],
        "answer": 2,
        "explain": [
          "錯誤，這個作法可能不符合外傷處理原則，或可能增加感染、出血與二次傷害風險。",
          "錯誤，這個作法可能不符合外傷處理原則，或可能增加感染、出血與二次傷害風險。",
          "正確，這是外傷照護中較安全且標準的處置。",
          "錯誤，這個作法可能不符合外傷處理原則，或可能增加感染、出血與二次傷害風險。"
        ]
      },
      {
        "q": "關於扭傷處理常見的 PRICE 原則，其中 P 的主要目的為何？",
        "options": [
          "冰敷加速血液循環",
          "降低受傷部位承重與保護，防止傷勢惡化",
          "立即按摩患部促進復原",
          "用熱水沖洗促進出血"
        ],
        "answer": 1,
        "explain": [
          "錯誤，這個作法可能不符合外傷處理原則，或可能增加感染、出血與二次傷害風險。",
          "正確，這是外傷照護中較安全且標準的處置。",
          "錯誤，這個作法可能不符合外傷處理原則，或可能增加感染、出血與二次傷害風險。",
          "錯誤，這個作法可能不符合外傷處理原則，或可能增加感染、出血與二次傷害風險。"
        ]
      },
      {
        "q": "如果傷口被釘傷或刺入銳器，該如何處理？",
        "options": [
          "直接使用酒精沖洗傷口",
          "留傷口完全乾燥，不予保護",
          "洗淨雙手後，立即拔掉異物",
          "以重物或乾淨敷料固定銳器並盡速就醫"
        ],
        "answer": 3,
        "explain": [
          "錯誤，這個作法可能不符合外傷處理原則，或可能增加感染、出血與二次傷害風險。",
          "錯誤，這個作法可能不符合外傷處理原則，或可能增加感染、出血與二次傷害風險。",
          "錯誤，這個作法可能不符合外傷處理原則，或可能增加感染、出血與二次傷害風險。",
          "正確，這是外傷照護中較安全且標準的處置。"
        ]
      },
      {
        "q": "人工皮水膠敷料通常適用於哪類型的傷口？",
        "options": [
          "乾淨且少滲液的淺層傷口",
          "大量滲血的嚴重開放傷口",
          "大面積深部燒燙傷",
          "深層穿刺傷的初期傷口"
        ],
        "answer": 0,
        "explain": [
          "正確，這是外傷照護中較安全且標準的處置。",
          "錯誤，這個作法可能不符合外傷處理原則，或可能增加感染、出血與二次傷害風險。",
          "錯誤，這個作法可能不符合外傷處理原則，或可能增加感染、出血與二次傷害風險。",
          "錯誤，這個作法可能不符合外傷處理原則，或可能增加感染、出血與二次傷害風險。"
        ]
      }
    ],
    "hard": [
      {
        "q": "在外傷初步評估（Primary Survey）中，關於 A（Airway）的處理，下列敘述何者最符合臨床準則？",
        "options": [
          "意識不清者一律使用仰頭抬顎法開放氣道",
          "口咽氣道管只能用於仍有嘔吐反射的病患",
          "建立人工氣道時必須同時維持頸椎穩定",
          "氣道處理完成後才需要評估頸椎"
        ],
        "answer": 2,
        "explain": [
          "錯誤，這個作法可能不符合外傷處理原則，或可能增加感染、出血與二次傷害風險。",
          "錯誤，這個作法可能不符合外傷處理原則，或可能增加感染、出血與二次傷害風險。",
          "正確，這是外傷照護中較安全且標準的處置。",
          "錯誤，這個作法可能不符合外傷處理原則，或可能增加感染、出血與二次傷害風險。"
        ]
      },
      {
        "q": "關於張力性氣胸的臨床特徵，下列哪一項組合最具有診斷意義？",
        "options": [
          "皮下氣腫、單側胸部凹陷、呼吸頻率減慢",
          "患側呼吸音消失、氣管偏移至對側、頸靜脈怒張",
          "叩診濁音、血胸徵象、低血壓",
          "呼吸音對稱、血壓正常、心搏過緩"
        ],
        "answer": 1,
        "explain": [
          "錯誤，這個作法可能不符合外傷處理原則，或可能增加感染、出血與二次傷害風險。",
          "正確，這是外傷照護中較安全且標準的處置。",
          "錯誤，這個作法可能不符合外傷處理原則，或可能增加感染、出血與二次傷害風險。",
          "錯誤，這個作法可能不符合外傷處理原則，或可能增加感染、出血與二次傷害風險。"
        ]
      },
      {
        "q": "一名 70 kg 成人雙上肢與前胸部均為二至三度燒傷，依 Parkland Formula，受傷後前 8 小時應給予多少點滴量？",
        "options": [
          "2,520 mL",
          "3,780 mL",
          "7,560 mL",
          "1,890 mL"
        ],
        "answer": 1,
        "explain": [
          "錯誤，這個作法可能不符合外傷處理原則，或可能增加感染、出血與二次傷害風險。",
          "正確，這是外傷照護中較安全且標準的處置。",
          "錯誤，這個作法可能不符合外傷處理原則，或可能增加感染、出血與二次傷害風險。",
          "錯誤，這個作法可能不符合外傷處理原則，或可能增加感染、出血與二次傷害風險。"
        ]
      },
      {
        "q": "GCS 評估：睜眼對疼痛刺激、言語無倫次、肢體定位疼痛，分數為何？",
        "options": [
          "E2V4M5＝11",
          "E2V3M5＝10",
          "E3V3M4＝10",
          "E2V2M5＝9"
        ],
        "answer": 1,
        "explain": [
          "錯誤，這個作法可能不符合外傷處理原則，或可能增加感染、出血與二次傷害風險。",
          "正確，這是外傷照護中較安全且標準的處置。",
          "錯誤，這個作法可能不符合外傷處理原則，或可能增加感染、出血與二次傷害風險。",
          "錯誤，這個作法可能不符合外傷處理原則，或可能增加感染、出血與二次傷害風險。"
        ]
      },
      {
        "q": "大量傷患檢傷分類（START Triage）中，若傷患呼吸頻率為 35 次/分，應歸類為哪一顏色等級？",
        "options": [
          "紅色（極危急）",
          "綠色（輕傷）",
          "黃色（優先）",
          "黑色（死亡或垂危）"
        ],
        "answer": 0,
        "explain": [
          "正確，這是外傷照護中較安全且標準的處置。",
          "錯誤，這個作法可能不符合外傷處理原則，或可能增加感染、出血與二次傷害風險。",
          "錯誤，這個作法可能不符合外傷處理原則，或可能增加感染、出血與二次傷害風險。",
          "錯誤，這個作法可能不符合外傷處理原則，或可能增加感染、出血與二次傷害風險。"
        ]
      },
      {
        "q": "對於疑似脊椎損傷的患者，目前國際上最常使用且較保守的神經學評估方式為何？",
        "options": [
          "到院前中風評估 FAST",
          "創傷脊髓損傷評估 TPL",
          "腎功能評分 KUB",
          "腦部斷層掃描 CT"
        ],
        "answer": 0,
        "explain": [
          "正確，這是外傷照護中較安全且標準的處置。",
          "錯誤，這個作法可能不符合外傷處理原則，或可能增加感染、出血與二次傷害風險。",
          "錯誤，這個作法可能不符合外傷處理原則，或可能增加感染、出血與二次傷害風險。",
          "錯誤，這個作法可能不符合外傷處理原則，或可能增加感染、出血與二次傷害風險。"
        ]
      },
      {
        "q": "關於使用止血帶，下列敘述何者正確？",
        "options": [
          "止血帶應使用細繩以便綁得更緊",
          "每 15 分鐘放鬆一次",
          "應綁在傷口下方以阻斷遠端血流",
          "可用於無法直接加壓控制的嚴重大出血"
        ],
        "answer": 3,
        "explain": [
          "錯誤，這個作法可能不符合外傷處理原則，或可能增加感染、出血與二次傷害風險。",
          "錯誤，這個作法可能不符合外傷處理原則，或可能增加感染、出血與二次傷害風險。",
          "錯誤，這個作法可能不符合外傷處理原則，或可能增加感染、出血與二次傷害風險。",
          "正確，這是外傷照護中較安全且標準的處置。"
        ]
      },
      {
        "q": "災難發生後，分析呼吸與循環後，下列何者最能有效暫時固定骨折？",
        "options": [
          "快速將肢體大量拉直復位",
          "先確定神經功能再用外力拉直",
          "使用夾板固定，固定受傷部位上下關節",
          "自行緊密包紮至肢端發白"
        ],
        "answer": 2,
        "explain": [
          "錯誤，這個作法可能不符合外傷處理原則，或可能增加感染、出血與二次傷害風險。",
          "錯誤，這個作法可能不符合外傷處理原則，或可能增加感染、出血與二次傷害風險。",
          "正確，這是外傷照護中較安全且標準的處置。",
          "錯誤，這個作法可能不符合外傷處理原則，或可能增加感染、出血與二次傷害風險。"
        ]
      },
      {
        "q": "下列何者為外傷致命三聯症（Lethal Triad of Trauma）的組成成分？",
        "options": [
          "高血糖、高血壓、高體溫",
          "酸中毒、凝血功能障礙、低體溫",
          "心搏過速、呼吸困難、瞳孔放大",
          "脫水、低血壓、呼吸喘"
        ],
        "answer": 1,
        "explain": [
          "錯誤，這個作法可能不符合外傷處理原則，或可能增加感染、出血與二次傷害風險。",
          "正確，這是外傷照護中較安全且標準的處置。",
          "錯誤，這個作法可能不符合外傷處理原則，或可能增加感染、出血與二次傷害風險。",
          "錯誤，這個作法可能不符合外傷處理原則，或可能增加感染、出血與二次傷害風險。"
        ]
      },
      {
        "q": "在開放性傷口照護中，針對口腔大量污染傷，首選的清洗液為何？",
        "options": [
          "雙氧水",
          "75% 酒精",
          "無菌生理食鹽水",
          "優碘濃液"
        ],
        "answer": 2,
        "explain": [
          "錯誤，這個作法可能不符合外傷處理原則，或可能增加感染、出血與二次傷害風險。",
          "錯誤，這個作法可能不符合外傷處理原則，或可能增加感染、出血與二次傷害風險。",
          "正確，這是外傷照護中較安全且標準的處置。",
          "錯誤，這個作法可能不符合外傷處理原則，或可能增加感染、出血與二次傷害風險。"
        ]
      }
    ]
  }
};


/* ===== 居家照護題庫：依使用者提供的「簡單／中等／困難」題目加入 ===== */
customQuizQuestionBank.woundHomeCare = {
  easy: [
    {
      q: "在進行居家照護時，為了預防長期臥床者產生壓傷，通常建議每隔多久協助翻身？",
      options: ["每 8 小時", "只有在洗澡時翻身", "每 2 小時", "每 12 小時"],
      answer: 2,
      explain: [
        "間隔過久會讓局部組織長時間受壓，增加壓傷風險。",
        "只在清潔時翻身，無法有效減少長時間受壓。",
        "正確，定時每 2 小時翻身可減少骨突處持續受壓並維持血液循環。",
        "12 小時間隔太長，容易造成皮膚與深層組織受損。"
      ]
    },
    {
      q: "居家照護環境中，下列哪一項是預防長者跌倒最有效且簡單的措施？",
      options: ["拔除家中所有家具", "保持充足且均勻的照明", "穿鬆垮拖鞋方便行走", "將地板打蠟使其光亮"],
      answer: 1,
      explain: [
        "家具若配置得宜，反而可作為穩定支撐，全部移除並不實際。",
        "正確，充足照明能減少看不清路面、障礙物或高低差造成的跌倒。",
        "鬆垮拖鞋容易滑脫，並非安全選擇。",
        "打蠟會讓地板更滑，增加跌倒風險。"
      ]
    },
    {
      q: "使用耳溫槍測量成人耳溫時，下列哪一項做法正確？",
      options: ["測量時只要靠近耳朵即可，不用放入耳道", "先用手摩擦耳朵使溫度升高", "測量前將耳廓往後上方拉", "剛洗完熱水澡後立刻測量最準確"],
      answer: 2,
      explain: [
        "探頭位置不正確會影響測量準確度。",
        "摩擦耳朵可能改變局部溫度，造成誤差。",
        "正確，成人測耳溫時將耳廓往後上方拉，有助於拉直耳道。",
        "洗澡後體表溫度受影響，應稍作休息再測量。"
      ]
    },
    {
      q: "居家照護中，關於藥物存放的原則，下列何者正確？",
      options: ["全部拆除包裝放入同一個盒子", "存放於陰涼、乾燥且避光處", "存放在廚房流理台下方", "所有藥物都必須放入冰箱冷藏"],
      answer: 1,
      explain: [
        "拆除原包裝可能造成藥名不清、受潮或拿錯藥。",
        "正確，多數藥物應保存在陰涼、乾燥、避光處，並保留原包裝與標示。",
        "廚房常潮濕且溫度變化大，不適合存放藥品。",
        "並非所有藥物都需冷藏，錯誤冷藏可能影響品質。"
      ]
    },
    {
      q: "協助受照護者進食時，為了預防吸入性肺炎，應採取何種姿勢？",
      options: ["坐直 90 度或半坐臥至少 30～45 度", "吃完立即平躺休息", "完全平躺進食", "頭部盡量往後仰"],
      answer: 0,
      explain: [
        "正確，坐姿或半坐臥能降低嗆咳與食物誤入氣管的風險。",
        "餐後立即平躺容易引發逆流與誤吸。",
        "平躺進食容易讓食物或液體進入呼吸道。",
        "頭部後仰可能影響吞嚥安全。"
      ]
    },
    {
      q: "糖尿病居家照護對象的腳部護理，應特別注意什麼？",
      options: ["每日檢查腳部是否有傷口或紅腫", "赤腳在家走路讓腳透氣", "自行修剪很深的指甲", "使用高溫熱水泡腳促進循環"],
      answer: 0,
      explain: [
        "正確，糖尿病可能造成感覺變差與傷口癒合不良，需每天檢查足部。",
        "赤腳行走容易受傷且可能不易察覺。",
        "指甲剪太深可能造成傷口或感染。",
        "高溫泡腳可能燙傷，尤其感覺遲鈍者更危險。"
      ]
    },
    {
      q: "協助受照護者從床上移位到輪椅前，首先應確認什麼？",
      options: ["輪椅踏板已放下", "輪椅煞車已固定", "房間音樂已打開", "衣服穿得越厚越安全"],
      answer: 1,
      explain: [
        "移位前通常應先收起踏板，避免絆倒或碰撞。",
        "正確，輪椅煞車固定可避免移位時滑動造成跌倒。",
        "音樂與移位安全無直接關係。",
        "移位安全主要取決於固定、姿勢與支撐，不是衣物厚度。"
      ]
    },
    {
      q: "關於居家照護中的口腔清潔，下列敘述何者較正確？",
      options: ["漱口水可以完全取代刷牙", "即使沒有進食，仍需定時清潔口腔", "刷牙應使用最硬的刷毛", "睡覺時假牙應繼續戴著"],
      answer: 1,
      explain: [
        "漱口水無法完全取代刷牙的物理清潔。",
        "正確，口腔分泌物與細菌仍會堆積，定時清潔可降低感染風險。",
        "過硬刷毛容易傷害牙齦與口腔黏膜。",
        "睡前通常應取下假牙清潔，讓牙齦休息。"
      ]
    },
    {
      q: "協助受照護者洗澡時，水溫通常建議維持在多少較適宜？",
      options: ["38°C～41°C", "50°C 以上", "越燙越能促進循環", "25°C～28°C"],
      answer: 0,
      explain: [
        "正確，38°C～41°C 較接近舒適且安全的洗澡水溫。",
        "50°C 以上容易燙傷。",
        "過熱水溫可能造成燙傷、頭暈或血壓變化。",
        "水溫過低可能造成不適或寒顫。"
      ]
    },
    {
      q: "居家照護中使用氧氣設備時，最重要的安全注意事項是什麼？",
      options: ["遠離火源並禁止吸菸", "氧氣流量開得越大越好", "氧氣鋼瓶平放在地上", "在氧氣旁使用明火取暖"],
      answer: 0,
      explain: [
        "正確，氧氣會助燃，必須遠離火源、菸火與高溫設備。",
        "氧氣流量應依醫囑調整，過高不一定安全。",
        "鋼瓶應妥善固定，避免傾倒或碰撞。",
        "氧氣旁使用明火非常危險。"
      ]
    },
    {
      q: "照護者在抬舉或搬運病患時，應如何保護自己的腰部？",
      options: ["將病患抱得離身體越遠越好", "兩腳張開與肩同寬，彎曲膝蓋並讓重心靠近", "只用腰部力量快速拉起", "閉氣用力增加腹壓"],
      answer: 1,
      explain: [
        "離身體越遠，腰部受力越大。",
        "正確，良好站姿與利用腿部力量可降低腰部傷害。",
        "只用腰部力量容易造成拉傷。",
        "閉氣用力可能使血壓上升，增加照護者風險。"
      ]
    },
    {
      q: "留置導尿管的尿袋位置應如何放置？",
      options: ["越高越好，方便觀察", "平放在床上", "始終低於膀胱高度", "掛在床欄且高過腹部"],
      answer: 2,
      explain: [
        "尿袋過高可能造成尿液逆流。",
        "平放無法確保低於膀胱，也可能壓迫管路。",
        "正確，尿袋低於膀胱可利用重力引流並減少逆流感染。",
        "高過腹部會增加尿液回流與感染風險。"
      ]
    },
    {
      q: "預防壓傷時，最需要特別觀察哪些部位？",
      options: ["骨頭突出的受壓處，如尾骶部、腳跟、髖部", "頭髮末端", "指甲表面", "衣服口袋"],
      answer: 0,
      explain: [
        "正確，骨突處容易長時間受壓，是壓傷高風險部位。",
        "頭髮末端不是壓傷常見部位。",
        "指甲表面不是壓傷主要觀察處。",
        "衣服口袋不是身體皮膚受壓部位。"
      ]
    },
    {
      q: "居家環境中，清潔劑與藥品應如何放置較安全？",
      options: ["放在兒童容易拿到的位置", "放在食品旁方便辨識", "保留標示並放在兒童不易取得處", "倒入飲料瓶節省空間"],
      answer: 2,
      explain: [
        "兒童誤食或誤觸風險高。",
        "與食品放在一起容易混淆。",
        "正確，保留標示並妥善收納，可降低誤食與中毒風險。",
        "倒入飲料瓶非常容易造成誤食。"
      ]
    },
    {
      q: "傷口照護時，若出現紅、腫、熱、痛、流膿或發燒，代表可能發生什麼？",
      options: ["傷口可能感染", "傷口一定完全好了", "可以停止觀察", "只要貼膠帶即可"],
      answer: 0,
      explain: [
        "正確，這些是感染或發炎警訊，應盡快就醫或回診。",
        "這些不是完全癒合的表現。",
        "異常症狀更需要持續觀察與處理。",
        "單純貼膠帶不能處理感染問題。"
      ]
    }
  ],
  medium: [
    {
      q: "長期臥床者皮膚出現持續發紅且按壓後不易變白，最適合的處理是什麼？",
      options: ["繼續壓著觀察", "立即減壓、調整姿勢並加強皮膚觀察", "用熱水大力按摩", "塗厚藥膏後不再翻身"],
      answer: 1,
      explain: ["持續壓迫會使傷害惡化。", "正確，這可能是早期壓傷，應減壓並密切觀察。", "熱水與大力按摩可能傷害脆弱皮膚。", "藥膏不能取代翻身減壓。"]
    },
    {
      q: "協助進食後，為什麼建議維持坐姿或半坐臥一段時間？",
      options: ["避免胃內容物逆流與誤吸", "讓患者比較快睡著", "使食物停在食道", "完全取代口腔清潔"],
      answer: 0,
      explain: ["正確，餐後保持抬高可降低逆流與吸入性肺炎風險。", "目的不是催眠。", "食物不應停留在食道。", "進食姿勢不能取代口腔清潔。"]
    },
    {
      q: "測量血壓時，下列哪一項較符合正確流程？",
      options: ["剛運動完立刻量", "手臂自然支撐且袖帶位置與心臟同高", "邊說話邊量比較放鬆", "袖帶綁在衣服外面即可"],
      answer: 1,
      explain: ["運動後血壓可能暫時升高。", "正確，手臂與袖帶位置會影響數值準確度。", "量測時說話會影響結果。", "袖帶應貼合手臂皮膚或依設備指示使用。"]
    },
    {
      q: "使用氧氣機或氧氣鋼瓶時，下列哪一項最不適當？",
      options: ["依醫囑設定流量", "遠離瓦斯爐與香菸", "擅自把流量調到最大", "確認管路沒有折到"],
      answer: 2,
      explain: ["依醫囑設定是安全原則。", "氧氣助燃，需遠離火源。", "正確，擅自調高流量可能造成不適或風險。", "管路暢通是必要檢查。"]
    },
    {
      q: "導尿管照護中，最能降低泌尿道感染風險的作法是什麼？",
      options: ["尿袋保持低於膀胱並避免管路扭折", "尿袋高掛方便引流", "每天自行拔出清洗", "不洗手直接接觸接頭"],
      answer: 0,
      explain: ["正確，低位引流與管路通暢可減少逆流感染。", "尿袋高掛會增加逆流風險。", "不可自行拔管。", "接觸前後需洗手。"]
    },
    {
      q: "協助移位時，若受照護者突然頭暈、臉色蒼白，照護者應優先怎麼做？",
      options: ["加快移位速度", "立即讓其坐下或躺下休息並觀察", "要求他繼續站著訓練", "立刻給大量咖啡"],
      answer: 1,
      explain: ["加快動作可能跌倒。", "正確，頭暈可能導致跌倒，應先確保安全。", "繼續站立會增加風險。", "咖啡不是急性頭暈的安全處置。"]
    },
    {
      q: "糖尿病足部照護中，下列哪一項屬於較危險的作法？",
      options: ["每天檢查腳底", "選擇合腳透氣鞋襪", "赤腳走路或用熱水泡腳", "洗腳後擦乾趾縫"],
      answer: 2,
      explain: ["這是正確照護。", "合腳鞋襪可降低摩擦傷。", "正確，赤腳和熱水泡腳都可能造成傷口或燙傷。", "趾縫保持乾燥可降低感染。"]
    },
    {
      q: "居家用藥安全中，為何不建議把不同藥物混放在無標示盒子裡？",
      options: ["可能造成拿錯藥、劑量不清或受潮變質", "藥物會立刻失效", "這樣一定比較省空間", "混放可增加藥效"],
      answer: 0,
      explain: ["正確，原包裝與標示有助辨識藥名、劑量與效期。", "不一定立刻失效，但風險提高。", "省空間不是用藥安全優先考量。", "混放不會增加藥效。"]
    },
    {
      q: "口腔照護對長期臥床或吞嚥困難者的重要性是什麼？",
      options: ["降低口腔細菌與吸入性肺炎風險", "讓患者不需要喝水", "完全取代吞嚥評估", "只為了美觀"],
      answer: 0,
      explain: ["正確，口腔細菌可能隨分泌物進入呼吸道。", "口腔清潔不能取代水分需求評估。", "吞嚥問題仍需專業評估。", "口腔照護也與感染預防有關。"]
    },
    {
      q: "洗澡照護時，哪一項最能降低燙傷與跌倒風險？",
      options: ["先測水溫、使用止滑設備並全程注意狀態", "讓患者獨自久站", "水越熱越好", "地板打蠟保持美觀"],
      answer: 0,
      explain: ["正確，水溫與防滑都是浴室安全重點。", "獨自久站容易跌倒。", "過熱容易燙傷。", "打蠟會增加滑倒風險。"]
    },
    {
      q: "傷口換藥前後，照護者最基本且必要的感染預防措施是什麼？",
      options: ["確實洗手", "直接用嘴吹乾傷口", "徒手重複觸摸敷料內側", "用同一塊紗布擦所有傷口"],
      answer: 0,
      explain: ["正確，洗手是降低交叉感染的基本措施。", "用嘴吹會增加污染。", "接觸敷料內側會污染敷料。", "不同傷口應避免交叉污染。"]
    },
    {
      q: "居家環境安全評估中，下列何者最需要優先改善？",
      options: ["走道雜物多、光線不足、浴室濕滑", "牆上掛畫太少", "窗簾顏色不一致", "沙發樣式不流行"],
      answer: 0,
      explain: ["正確，這些都是跌倒與意外傷害危險因子。", "與安全風險較無關。", "窗簾顏色不是安全優先項目。", "家具流行與否不是照護安全重點。"]
    },
    {
      q: "若長者夜間常起床如廁，較合適的防跌策略是什麼？",
      options: ["保持夜間路線照明並清除障礙物", "關掉所有燈讓他習慣黑暗", "把拖鞋放得很遠", "地上鋪很多鬆散小地毯"],
      answer: 0,
      explain: ["正確，夜間照明與動線清楚可降低跌倒。", "黑暗會增加跌倒風險。", "拖鞋太遠可能赤腳或急著走造成危險。", "鬆散地毯容易絆倒。"]
    },
    {
      q: "照護者搬運病患時，為何建議讓重心靠近身體並彎曲膝蓋？",
      options: ["減少腰椎受力並利用腿部力量", "讓動作看起來更快", "增加病患重量", "避免使用任何輔具"],
      answer: 0,
      explain: ["正確，這是保護照護者肌肉骨骼的重要原則。", "速度不是主要目的。", "不會增加病患重量。", "必要時仍應使用輔具或尋求協助。"]
    },
    {
      q: "若術後傷口敷料潮濕、滲液增加且有異味，最適合的判斷與處理是什麼？",
      options: ["可能感染或傷口異常，應依指示換藥並回診評估", "這一定是正常現象，不需處理", "自行拆線讓膿流出", "用香水遮蓋味道"],
      answer: 0,
      explain: ["正確，滲液增加與異味可能是感染警訊。", "不能忽視異常分泌物。", "不可自行拆線。", "香水會刺激或污染傷口。"]
    }
  ],
  hard: [
    {
      q: "壓傷形成的主要病理機轉，下列何者最正確？",
      options: ["長時間壓迫造成局部血流不足，導致組織缺氧與壞死", "只要皮膚乾燥就一定會發生", "完全與營養狀態無關", "只會發生在年輕健康者"],
      answer: 0,
      explain: ["正確，壓力、剪力與血流不足是壓傷核心機轉。", "乾燥只是皮膚狀態之一，不是唯一原因。", "營養不良會增加風險。", "高齡、臥床與行動不便者更常見。"]
    },
    {
      q: "長期臥床者翻身時，除了改變姿勢外，還應避免哪一種力學傷害？",
      options: ["剪力與摩擦力", "正常呼吸", "規律進食", "足夠照明"],
      answer: 0,
      explain: ["正確，拖拉身體會產生剪力與摩擦，增加皮膚破損。", "正常呼吸不是皮膚傷害來源。", "規律進食有助營養。", "足夠照明有助安全。"]
    },
    {
      q: "吞嚥困難者進食後出現聲音變濕、咳嗽、痰量增加，最需要懷疑什麼風險？",
      options: ["食物或液體誤入呼吸道，可能造成吸入性肺炎", "只是口渴", "代表吞嚥功能完全正常", "表示可以立刻平躺"],
      answer: 0,
      explain: ["正確，這些是誤吸與吸入性肺炎常見警訊。", "不能只用口渴解釋。", "症狀代表需要提高警覺。", "平躺會增加逆流與誤吸風險。"]
    },
    {
      q: "居家氧氣治療安全中，為何氧氣設備必須遠離火源？",
      options: ["氧氣本身助燃，會使燃燒更劇烈", "氧氣會讓火自動熄滅", "氧氣越靠近火源越能治療", "只有冬天才需要注意"],
      answer: 0,
      explain: ["正確，氧氣助燃，遇菸火或明火可能造成嚴重火災。", "氧氣不會滅火。", "靠近火源非常危險。", "任何季節都需注意。"]
    },
    {
      q: "導尿管尿袋若高於膀胱，最主要的風險是什麼？",
      options: ["尿液逆流增加泌尿道感染風險", "尿液會變成消毒液", "腎功能一定立刻恢復", "完全沒有影響"],
      answer: 0,
      explain: ["正確，尿液逆流可能把細菌帶回膀胱。", "尿液不具消毒效果。", "尿袋高度不會使腎功能立刻恢復。", "高度會影響引流與感染風險。"]
    },
    {
      q: "血壓量測時，袖帶太小或手臂低於心臟位置，可能造成什麼問題？",
      options: ["測得血壓偏高或不準確", "血壓一定偏低", "不會影響結果", "可以取代醫師診斷"],
      answer: 0,
      explain: ["正確，袖帶尺寸與手臂高度會明顯影響血壓讀值。", "不一定偏低，常會失真。", "量測條件會影響結果。", "居家量測需配合醫療評估。"]
    },
    {
      q: "照護者長期搬運病患若姿勢不良，最需要預防的職業傷害是什麼？",
      options: ["下背痛與肌肉骨骼傷害", "視力立刻恢復", "牙齒變白", "指甲長得更快"],
      answer: 0,
      explain: ["正確，搬運與移位若未使用正確力學，容易造成腰背傷害。", "與視力無關。", "與牙齒顏色無關。", "與指甲生長無關。"]
    },
    {
      q: "糖尿病足部出現傷口久不癒合、流膿或變黑時，最合理的風險判斷是什麼？",
      options: ["可能感染、缺血或壞死，需盡快就醫", "一定只是皮膚乾燥", "自行泡熱水即可", "剪掉變黑處即可"],
      answer: 0,
      explain: ["正確，糖尿病足異常可能快速惡化。", "不能只用乾燥解釋。", "熱水泡腳可能燙傷或惡化。", "不可自行處理壞死組織。"]
    },
    {
      q: "術後傷口照護中，不建議自行拆線或抓癢的主要原因是什麼？",
      options: ["可能破壞新生組織，造成傷口裂開或感染", "會讓藥物變甜", "能加速癒合所以應該做", "只會影響外觀，不影響安全"],
      answer: 0,
      explain: ["正確，傷口癒合期組織脆弱，外力可能造成裂開與感染。", "與味道無關。", "自行拆線或抓癢不會加速安全癒合。", "傷口裂開與感染屬安全問題。"]
    },
    {
      q: "居家環境安全中，為何浴室是跌倒高風險區域？",
      options: ["地面潮濕、空間狹窄與姿勢轉換頻繁", "因為浴室一定沒有燈", "因為水能治療跌倒", "只和牆壁顏色有關"],
      answer: 0,
      explain: ["正確，濕滑地面與轉身、坐站等動作會提高跌倒風險。", "燈光可能不足但不是唯一原因。", "水不能治療跌倒。", "牆壁顏色不是主要風險。"]
    },
    {
      q: "若受照護者使用鎮靜、降壓或降血糖藥物，照護者特別需要注意什麼？",
      options: ["頭暈、嗜睡、低血糖或跌倒風險", "藥物一定沒有副作用", "可以隨意停藥", "服藥後不必觀察"],
      answer: 0,
      explain: ["正確，藥物可能影響意識、平衡或血糖，需觀察安全。", "任何藥物都可能有副作用。", "不可自行停藥。", "服藥後仍需觀察反應。"]
    },
    {
      q: "口腔清潔不足為何可能增加肺炎風險？",
      options: ["口腔細菌可能隨唾液或分泌物被吸入呼吸道", "牙刷會製造氧氣", "口腔清潔會讓肺部停止運作", "只會影響牙齒外觀"],
      answer: 0,
      explain: ["正確，長期臥床或吞嚥困難者尤其需注意口腔細菌與誤吸。", "牙刷不會製造氧氣。", "口腔清潔不會讓肺部停止。", "口腔健康也與感染風險相關。"]
    },
    {
      q: "居家量測體溫時，最能提高追蹤價值的作法是什麼？",
      options: ["固定量測方式與時間並記錄數值與症狀", "每次換不同部位且不記錄", "只在發燒退了才量", "量完立刻刪除紀錄"],
      answer: 0,
      explain: ["正確，固定方式與紀錄有助判斷趨勢。", "方式不一致會降低可比性。", "症狀變化時也需觀察。", "刪除紀錄不利醫療評估。"]
    },
    {
      q: "長期臥床者若營養不足，為何會增加壓傷與傷口癒合不良風險？",
      options: ["蛋白質與熱量不足會影響組織修復與免疫功能", "營養與皮膚完全無關", "少吃一定讓傷口更快乾", "只要外用藥即可取代營養"],
      answer: 0,
      explain: ["正確，足夠營養是維持皮膚完整與傷口修復的重要條件。", "營養與皮膚修復密切相關。", "少吃可能讓恢復更差。", "外用藥不能取代營養支持。"]
    },
    {
      q: "在居家照護中，何時應優先尋求專業醫療協助而非自行處理？",
      options: ["意識改變、呼吸困難、胸痛、嚴重感染徵象或大量出血", "只是想換電視節目", "天氣變冷但無不適", "想重新整理房間"],
      answer: 0,
      explain: ["正確，這些屬於高風險警訊，應立即求助或就醫。", "與醫療急症無關。", "若無不適可先保暖觀察。", "整理房間不是急症。"]
    }
  ]
};


/* ===== 管路灌食題庫：依使用者提供的「簡單／中等／困難」題目主題加入 ===== */
customQuizQuestionBank.tubeSwallowCare = {
  easy: [
    {
      q: "在進行管路灌食前，首要的衛生準備步驟為何？",
      options: ["佩戴無菌手套", "先為病人進行口腔清潔", "使用酒精消毒灌食袋", "使用肥皂徹底洗淨雙手"],
      answer: 3,
      explain: [
        "一般管路灌食不一定需要無菌手套，重點是手部清潔。",
        "口腔清潔很重要，但在接觸器材與食物前，操作者手部清潔應優先執行。",
        "灌食器材需保持清潔，但不能取代操作者洗手。",
        "正確，洗手是預防細菌污染管路、病人體內與灌食配方最簡單有效的方法。"
      ]
    },
    {
      q: "管路灌食時，病人最適合採取哪一種姿勢？",
      options: ["平躺姿勢", "頭部抬高 30～45 度的半坐臥或坐姿", "趴睡姿勢", "頭低腳高姿勢"],
      answer: 1,
      explain: [
        "平躺會增加胃內容物逆流與嗆入風險。",
        "正確，半坐臥或坐姿可利用重力幫助食物進入胃部，降低逆流與誤吸風險。",
        "趴睡不利於觀察呼吸與管路，也不適合灌食。",
        "頭低腳高會增加逆流與吸入性肺炎風險。"
      ]
    },
    {
      q: "灌食前檢查鼻胃管外露長度的主要目的為何？",
      options: ["確認管路是否可能移位", "判斷病人是否口渴", "測量灌食速度", "確認灌食液味道"],
      answer: 0,
      explain: [
        "正確，外露長度和原本標記不一致時，可能代表管路移位，需暫停灌食。",
        "外露長度無法判斷口渴。",
        "灌食速度需依醫護指示控制，與外露長度不同。",
        "灌食液味道不是檢查外露長度的目的。"
      ]
    },
    {
      q: "灌食液最適合的溫度接近下列何者？",
      options: ["剛從冰箱取出的低溫", "接近室溫或微溫", "越燙越容易吸收", "結冰後再溶解"],
      answer: 1,
      explain: [
        "太冷可能造成腸胃不適或腹瀉。",
        "正確，接近室溫或微溫較不易刺激腸胃。",
        "過燙可能造成管路與胃部刺激，並不安全。",
        "結冰後再溶解可能影響品質，也不符合灌食安全。"
      ]
    },
    {
      q: "管路灌食完成後，通常應讓病人維持半坐臥或坐姿多久？",
      options: ["立即平躺休息", "至少 30～60 分鐘", "只要 1 分鐘即可", "必須站立 2 小時"],
      answer: 1,
      explain: [
        "立即平躺容易增加逆流與嗆入風險。",
        "正確，灌食後保持半坐臥或坐姿可降低逆流與吸入性肺炎風險。",
        "1 分鐘時間太短，保護效果不足。",
        "不一定需要站立，且體力不佳者可能跌倒。"
      ]
    },
    {
      q: "灌食後用溫開水沖管的主要目的為何？",
      options: ["讓病人更快睡著", "避免營養品殘留造成管路阻塞", "增加灌食液甜味", "取代每日水分攝取評估"],
      answer: 1,
      explain: [
        "沖管不是助眠措施。",
        "正確，沖管可減少營養品或藥物殘留，維持管路通暢。",
        "沖管與甜味無關。",
        "沖管水量仍需納入整體水分與醫囑考量，不能取代評估。"
      ]
    },
    {
      q: "下列哪一項是灌食過程中需要立即注意的異常情形？",
      options: ["病人出現劇烈咳嗽或呼吸不順", "病人眼睛張開", "房間燈光太亮", "照護者覺得無聊"],
      answer: 0,
      explain: [
        "正確，咳嗽、喘、呼吸不順可能代表嗆入或逆流，應立即停止灌食並求助。",
        "眼睛張開不一定是異常。",
        "燈光不直接代表灌食危急狀況。",
        "照護者感受不是判斷病人安全的重點。"
      ]
    },
    {
      q: "即使病人由鼻胃管進食，仍需要定期口腔清潔的原因是什麼？",
      options: ["可以讓管路變短", "可減少口腔細菌與異味，降低感染風險", "可以完全不用刷牙", "會讓灌食速度自動變快"],
      answer: 1,
      explain: [
        "口腔清潔不會改變管路長度。",
        "正確，口腔細菌可能隨唾液進入呼吸道，清潔可降低感染與異味。",
        "口腔清潔包含刷牙或依狀況清潔，不是完全不用刷牙。",
        "口腔清潔不會自動改變灌食速度。"
      ]
    },
    {
      q: "若發現鼻胃管疑似脫出或位置明顯改變，照護者應如何處理？",
      options: ["自行把管子推回去", "繼續灌食觀察看看", "暫停灌食並通知醫護人員", "把灌食速度調快"],
      answer: 2,
      explain: [
        "自行推回可能造成誤置或傷害。",
        "管路位置不明時繼續灌食可能造成誤吸。",
        "正確，疑似移位時應暫停灌食並請醫護人員確認。",
        "調快速度會增加風險，不能解決管路移位。"
      ]
    },
    {
      q: "管路固定的主要目的為何？",
      options: ["避免管路被拉扯、滑脫或彎折", "讓病人不能移動", "讓灌食液變熱", "取代管路清潔"],
      answer: 0,
      explain: [
        "正確，適當固定可維持管路位置並減少滑脫、阻塞與皮膚受傷。",
        "固定不是限制病人所有活動，而是避免拉扯。",
        "固定不會加熱灌食液。",
        "固定不能取代清潔與觀察。"
      ]
    }
  ],
  medium: [
    {
      q: "灌食前若病人出現腹脹、嘔吐或呼吸不順，較適當的處置為何？",
      options: ["先暫停灌食並通知醫護人員評估", "把灌食速度加快，讓食物快點進入胃內", "讓病人平躺後繼續灌食", "改用更濃的營養品"],
      answer: 0,
      explain: [
        "正確，這些症狀可能代表腸胃不耐、逆流或誤吸風險，應先暫停並評估。",
        "加快速度可能使不適更嚴重。",
        "平躺會增加逆流與嗆入風險。",
        "自行改變濃度可能造成腹瀉、脫水或營養不均。"
      ]
    },
    {
      q: "為何管路灌食不應自行加快速度？",
      options: ["可能造成腹脹、嘔吐、逆流或腹瀉", "會讓管路自動變短", "會讓營養品失去所有熱量", "會讓病人一定發燒"],
      answer: 0,
      explain: [
        "正確，速度過快會增加腸胃負擔與逆流、誤吸風險。",
        "速度與管路長度無直接關係。",
        "灌食速度不會讓熱量消失。",
        "發燒可能與感染有關，但不是加快速度的必然結果。"
      ]
    },
    {
      q: "管灌營養品開封後的處理，下列何者較正確？",
      options: ["開封後可放在室溫一整天", "依產品與醫護指示保存，避免污染並注意有效時間", "倒回原瓶與新鮮營養品混合", "只要沒有異味就一定安全"],
      answer: 1,
      explain: [
        "室溫放置過久容易滋生細菌。",
        "正確，開封後保存方式與使用時間需依產品標示與醫護指示。",
        "倒回原瓶可能污染整瓶營養品。",
        "沒有異味不代表沒有細菌污染。"
      ]
    },
    {
      q: "多種藥物需由管路給予時，下列哪一項原則較安全？",
      options: ["所有藥物一起磨碎混入營養品", "依醫護或藥師指示處理，藥物間適當沖管", "藥物越濃越好，不需加水", "任何膠囊都可直接倒入管路"],
      answer: 1,
      explain: [
        "藥物混合可能交互作用、阻塞管路或影響吸收。",
        "正確，藥物是否可磨碎與給藥方式應由專業人員確認，並以沖管降低阻塞。",
        "過濃可能阻塞或刺激腸胃。",
        "有些膠囊或緩釋劑型不能打開或磨碎。"
      ]
    },
    {
      q: "鼻胃管灌食最擔心的呼吸道併發症是什麼？",
      options: ["吸入性肺炎", "近視", "耳垢增加", "皮膚曬傷"],
      answer: 0,
      explain: [
        "正確，食物或胃內容物誤入氣管可能造成吸入性肺炎。",
        "近視與管路灌食無直接關係。",
        "耳垢增加不是灌食主要併發症。",
        "皮膚曬傷與管路灌食無直接關係。"
      ]
    },
    {
      q: "灌食過程中若病人突然嗆咳、臉色改變，第一步應做什麼？",
      options: ["立即停止灌食並維持呼吸道安全", "繼續灌完避免浪費", "讓病人喝大量水沖下去", "把管路拉出一半"],
      answer: 0,
      explain: [
        "正確，疑似嗆入時應立即停止灌食，觀察呼吸並通知醫護人員或求救。",
        "繼續灌食會增加誤吸風險。",
        "嗆咳時餵水可能更危險。",
        "自行拉管可能造成移位或傷害。"
      ]
    },
    {
      q: "管路周圍皮膚出現紅、腫、熱、痛或分泌物增加時，可能代表什麼？",
      options: ["感染或皮膚受刺激", "管路變得更乾淨", "灌食量一定不足", "病人睡眠品質變好"],
      answer: 0,
      explain: [
        "正確，紅腫熱痛與分泌物增加可能是感染或壓迫刺激徵象。",
        "這些不是乾淨的表現。",
        "灌食量不足不會直接造成局部紅腫熱痛。",
        "與睡眠品質無直接關係。"
      ]
    },
    {
      q: "照護者在翻身或移位病人前，應特別注意什麼？",
      options: ["先確認管路位置、長度與方向，避免拉扯", "先把所有管路拔掉", "不用看管路，只要快速完成", "把管路壓在身體下固定"],
      answer: 0,
      explain: [
        "正確，移位前確認管路可避免滑脫、彎折、阻塞或皮膚拉傷。",
        "不可自行拔除管路。",
        "忽略管路容易造成意外拉扯。",
        "壓住管路可能造成阻塞或皮膚受傷。"
      ]
    },
    {
      q: "若灌食後病人反覆腹瀉，照護者較適當的做法為何？",
      options: ["記錄發生時間、灌食量與狀況，並回報醫護人員", "自行停止所有水分", "把營養品加倍濃縮", "完全不需要處理"],
      answer: 0,
      explain: [
        "正確，腹瀉可能與速度、濃度、溫度、感染或藥物有關，需記錄並評估。",
        "自行停止水分可能造成脫水。",
        "濃縮可能使腹瀉更嚴重。",
        "反覆腹瀉可能造成脫水與電解質失衡，不能忽略。"
      ]
    },
    {
      q: "下列哪一項最能降低管路灌食污染風險？",
      options: ["器材清潔乾燥、營養品妥善保存並避免重複污染", "用手直接接觸管路接頭內側", "未洗手就調配營養品", "把剩餘營養品倒回原容器"],
      answer: 0,
      explain: [
        "正確，清潔器材、正確保存與避免接觸污染是降低感染的重要原則。",
        "接觸接頭內側會增加污染風險。",
        "未洗手容易污染灌食配方與器材。",
        "倒回原容器可能污染整瓶營養品。"
      ]
    }
  ],
  hard: [
    {
      q: "照護者發現鼻胃管外露長度比原本標記短很多，且病人咳嗽增加。最安全的判斷與處置為何？",
      options: ["可能管路移位，應停止灌食並請醫護確認位置", "代表管路更深入，所以灌食更安全", "只要灌食液能流動就不必理會", "把病人放平後繼續灌食"],
      answer: 0,
      explain: [
        "正確，外露長度改變合併咳嗽，需懷疑管路位置異常與誤吸風險。",
        "管路變深不代表安全，可能進入錯誤位置或造成傷害。",
        "可流動不代表管路位置正確。",
        "平躺會增加逆流與吸入風險。"
      ]
    },
    {
      q: "某病人灌食後立即被放平，之後出現濕咳、痰量增加與發燒。最需懷疑哪一個問題？",
      options: ["吸入性肺炎風險增加", "營養品熱量不足", "口腔清潔過度", "管路固定太美觀"],
      answer: 0,
      explain: [
        "正確，灌食後平躺可能造成逆流與誤吸，濕咳、痰多、發燒需懷疑吸入性肺炎。",
        "熱量不足不會直接造成灌食後濕咳與發燒。",
        "口腔清潔過度不是此組症狀的主要解釋。",
        "固定外觀與肺部感染徵象無關。"
      ]
    },
    {
      q: "管路灌食病人同時需要多種藥物時，為何不建議全部混入營養品一起灌入？",
      options: ["可能影響藥效、產生交互作用或造成管路阻塞", "會讓藥物全部變成無菌", "一定會讓病人立刻入睡", "可以保證吸收更好"],
      answer: 0,
      explain: [
        "正確，藥物劑型、相容性與吸收都可能受影響，且混合易阻塞管路。",
        "混入營養品不會讓藥物變成無菌。",
        "藥物混合不代表會入睡，且可能危險。",
        "混合不保證吸收更好，反而可能降低療效。"
      ]
    },
    {
      q: "長期鼻胃管灌食病人口腔乾燥、有厚舌苔且痰變多。最合理的照護重點為何？",
      options: ["加強規律口腔清潔並觀察呼吸道感染徵象", "因為沒有從口吃，所以完全不用清潔口腔", "把灌食速度加倍", "停止所有翻身活動"],
      answer: 0,
      explain: [
        "正確，長期管灌仍需口腔照護，減少細菌量與吸入性肺炎風險。",
        "不從口吃仍會有口腔細菌與分泌物。",
        "加快速度可能增加逆流與腸胃不適。",
        "停止翻身會增加壓傷與肺部併發症風險。"
      ]
    },
    {
      q: "若管路灌食常發生腹脹與嘔吐，下列哪一項評估最有意義？",
      options: ["灌食速度、每次灌食量、姿勢與腸胃耐受情形", "病人頭髮長度", "房間牆壁顏色", "照護者手機品牌"],
      answer: 0,
      explain: [
        "正確，腹脹與嘔吐常與速度、量、姿勢、腸胃排空與耐受度相關。",
        "頭髮長度與灌食耐受無關。",
        "牆壁顏色不是主要評估項目。",
        "手機品牌與病人症狀無關。"
      ]
    },
    {
      q: "管路固定過緊造成鼻翼或皮膚紅腫破皮時，最適當的原則為何？",
      options: ["調整固定方式、保護皮膚並回報醫護人員", "固定越緊越安全，不需處理", "用力按摩破皮處", "自行剪短管路"],
      answer: 0,
      explain: [
        "正確，固定需兼顧穩定與皮膚保護，壓傷或破皮應處理並回報。",
        "過緊會造成壓迫、疼痛與傷口。",
        "按摩破皮處可能加重傷害或感染。",
        "不可自行剪短醫療管路。"
      ]
    },
    {
      q: "疑似管路阻塞時，下列哪一項做法較安全？",
      options: ["依醫護指示以適當方式沖管，勿用蠻力強推", "用尖銳物插入管路疏通", "用力強推大量空氣或液體", "直接自行更換整條管路"],
      answer: 0,
      explain: [
        "正確，阻塞需依規範處理，強推可能造成管路破裂或病人不適。",
        "尖銳物可能刺破管路並造成污染。",
        "蠻力強推可能危險。",
        "更換管路應由受訓人員或醫護處理。"
      ]
    },
    {
      q: "管灌病人出現咳嗽、呼吸急促、嘴唇發紫時，照護者應如何處理？",
      options: ["立即停止灌食、維持安全姿勢並緊急求助", "繼續灌食直到完成", "讓病人平躺睡覺", "只清洗灌食袋即可"],
      answer: 0,
      explain: [
        "正確，這可能是嚴重誤吸或缺氧徵象，應立即停止灌食並求助。",
        "繼續灌食可能危及呼吸。",
        "平躺可能惡化呼吸與逆流。",
        "清洗器材不能處理急性呼吸危險。"
      ]
    },
    {
      q: "為何管路灌食前後的紀錄很重要？",
      options: ["可追蹤灌食量、水分、耐受度與異常反應，協助醫護調整照護", "只是為了讓表格變漂亮", "可以完全取代醫師評估", "記錄後就不需觀察病人"],
      answer: 0,
      explain: [
        "正確，完整紀錄能協助判斷營養、水分、腸胃耐受與併發症。",
        "紀錄的目的不是美觀。",
        "紀錄可提供資訊，但不能取代專業評估。",
        "記錄與持續觀察都很重要。"
      ]
    },
    {
      q: "若醫囑限制水分攝取，灌食前後沖管用水應如何處理？",
      options: ["依醫囑與醫護指示計算在每日總水量內", "想沖多少就沖多少", "完全不沖管", "只用含糖飲料沖管"],
      answer: 0,
      explain: [
        "正確，限水病人的沖管水量需納入總水量，並兼顧管路通暢。",
        "任意增加水量可能造成水分過多。",
        "完全不沖管容易阻塞，但需依醫囑調整。",
        "含糖飲料可能造成黏稠殘留與污染，不適合沖管。"
      ]
    }
  ]
};


/* ===== 產後照護題庫：依使用者提供的「簡單／中等／困難」題目主題加入 ===== */
customQuizQuestionBank.postpartumCare = {
  easy: [
    {
      q: "產後最初 3 到 4 天內，陰道排出的惡露顏色通常為何？",
      options: ["白色", "黃色", "紅色", "漿液色（粉紅色或棕色）"],
      answer: 2,
      explain: [
        "白色惡露通常較晚出現，約在產後 10 天後較常見。",
        "黃色惡露若伴隨異味、發燒或腹痛，需注意感染可能。",
        "正確，產後初期惡露含有較多血液與蛻膜組織，因此多呈紅色。",
        "漿液色惡露通常約在產後 4 到 10 天左右出現。"
      ]
    },
    {
      q: "產後觀察惡露時，下列哪一項較需要提高警覺？",
      options: ["量逐漸減少", "顏色由紅轉淡", "有惡臭或突然大量出血", "活動後少量增加但休息後減少"],
      answer: 2,
      explain: [
        "量逐漸減少通常是正常恢復趨勢。",
        "顏色逐漸轉淡常見於正常惡露變化。",
        "正確，惡臭、突然大量出血或合併發燒、腹痛，可能與感染或出血有關。",
        "活動後稍增、休息後改善可先觀察，但若量大仍須就醫。"
      ]
    },
    {
      q: "產後子宮底高度的正常變化，通常為何？",
      options: ["每天約下降一指寬（約一公分）", "每天越來越高", "產後立即升到劍突下", "產後一週內完全消失"],
      answer: 0,
      explain: [
        "正確，子宮復舊過程中，子宮底通常會逐日下降。",
        "若子宮底持續升高或變軟，需注意膀胱脹滿或子宮收縮不良。",
        "產後子宮底通常在臍部附近，不會升至劍突下。",
        "子宮恢復至懷孕前大小通常需要數週。"
      ]
    },
    {
      q: "產後第一次下床活動時，較安全的做法為何？",
      options: ["快速起身直接走到浴室", "先坐起休息，確認不頭暈後再由家人陪同下床", "完全不能下床", "閉眼走路避免緊張"],
      answer: 1,
      explain: [
        "突然起身容易姿勢性低血壓或跌倒。",
        "正確，循序改變姿勢並有人陪同，可降低暈眩與跌倒風險。",
        "若醫師未限制，適度活動有助恢復與預防血栓。",
        "閉眼行走會增加跌倒危險。"
      ]
    },
    {
      q: "產後排尿照護，下列哪一項較正確？",
      options: ["產後不需要注意排尿", "鼓勵適時排尿並觀察是否解不出來", "為了怕痛應整天憋尿", "只要少喝水就不會有問題"],
      answer: 1,
      explain: [
        "產後膀胱脹滿可能影響子宮收縮與增加出血。",
        "正確，應留意第一次排尿、尿量與是否有解尿困難。",
        "憋尿可能使膀胱過脹並影響子宮復舊。",
        "水分不足可能造成尿液濃縮與便秘。"
      ]
    },
    {
      q: "會陰切開或會陰傷口照護時，清潔方向通常應為何？",
      options: ["由前往後清潔", "由肛門往尿道清潔", "不用清潔", "每天用高濃度酒精擦拭"],
      answer: 0,
      explain: [
        "正確，由前往後可減少肛門細菌帶到尿道或傷口。",
        "由後往前可能增加泌尿道或傷口感染風險。",
        "產後傷口仍需保持清潔乾燥。",
        "高濃度酒精可能刺激傷口，應依醫護指示照護。"
      ]
    },
    {
      q: "產後會陰冷敷的主要目的為何？",
      options: ["減輕腫脹與疼痛", "讓惡露完全停止", "取代傷口清潔", "讓乳汁變多"],
      answer: 0,
      explain: [
        "正確，產後初期適當冷敷可減輕局部腫脹與疼痛。",
        "冷敷不能讓惡露立刻停止。",
        "冷敷不能取代清潔與觀察。",
        "會陰冷敷與乳汁分泌沒有直接關係。"
      ]
    },
    {
      q: "母乳哺餵前，最基本的衛生原則為何？",
      options: ["確實洗手", "完全不喝水", "先用香水噴乳房", "每次都用力搓洗乳頭"],
      answer: 0,
      explain: [
        "正確，洗手可降低新生兒接觸細菌的機會。",
        "水分攝取不足不利產後恢復與泌乳。",
        "香水可能刺激寶寶或影響哺乳。",
        "過度搓洗可能造成乳頭破皮。"
      ]
    },
    {
      q: "關於產後運動的開始時間，一般較適當的說法為何？",
      options: ["必須臥床滿一個月", "完全等惡露消失才可動", "依復原狀況，自然產通常可在 24 小時後開始簡單活動", "產後一小時內立刻跑步"],
      answer: 2,
      explain: [
        "長時間臥床會增加血栓與體力下降風險。",
        "惡露可持續數週，早期適度活動通常有助恢復。",
        "正確，經醫護評估許可後，可從深呼吸、翻身、短距離活動開始。",
        "劇烈運動需等身體恢復並經評估，不宜立即進行。"
      ]
    },
    {
      q: "產後若出現發燒、惡露惡臭或下腹持續疼痛，最適當的做法為何？",
      options: ["先觀察到滿月再說", "自行服用剩藥", "儘快聯絡醫護或就醫評估", "停止所有飲水"],
      answer: 2,
      explain: [
        "延誤可能使感染惡化。",
        "自行服藥可能掩蓋病情或用藥不當。",
        "正確，這些可能是產後感染警訊，應儘快評估。",
        "停止飲水無法處理感染，反而可能造成脫水。"
      ]
    }
  ],
  medium: [
    {
      q: "產後出血風險評估中，下列哪一組狀況最需要立即處理？",
      options: ["惡露逐日減少且無異味", "衛生棉短時間內快速浸濕並伴隨頭暈心悸", "乳房輕微脹痛", "會陰傷口坐下時輕微不適"],
      answer: 1,
      explain: [
        "這通常較符合正常恢復。",
        "正確，短時間大量出血合併循環症狀，需警覺產後出血。",
        "乳房脹痛常見，但需與大量出血區分。",
        "輕微會陰不適常見，但若紅腫熱痛或分泌物異常才需警覺。"
      ]
    },
    {
      q: "產後膀胱過脹可能造成什麼照護問題？",
      options: ["影響子宮收縮並增加出血風險", "讓乳汁一定停止", "使傷口立即癒合", "完全沒有影響"],
      answer: 0,
      explain: [
        "正確，膀胱脹滿可能使子宮偏移、收縮不良，增加出血風險。",
        "膀胱過脹不是乳汁停止的直接原因。",
        "膀胱過脹不會促進傷口立即癒合。",
        "產後排尿狀況是重要觀察項目。"
      ]
    },
    {
      q: "哺乳時乳頭疼痛或破皮，最常需要先檢視哪一項？",
      options: ["寶寶含乳姿勢與含乳深度", "房間牆壁顏色", "產婦手機品牌", "是否完全不喝水"],
      answer: 0,
      explain: [
        "正確，含乳太淺常導致乳頭摩擦疼痛與破皮。",
        "牆壁顏色與乳頭破皮無關。",
        "手機品牌與哺乳技巧無關。",
        "水分不足不利恢復，但不是破皮最主要技術原因。"
      ]
    },
    {
      q: "產後乳房脹奶時，下列哪一項較合適？",
      options: ["規律哺乳或擠乳，並依狀況溫敷或冷敷", "完全不碰乳房等待自然消失", "用力按摩到瘀青", "自行停水停食"],
      answer: 0,
      explain: [
        "正確，移出乳汁與合適的舒緩方式可減少脹痛與乳腺阻塞。",
        "完全不處理可能使脹奶更嚴重。",
        "過度用力按摩可能造成組織受傷。",
        "停水停食不安全，也不會正確處理脹奶。"
      ]
    },
    {
      q: "剖腹產傷口照護時，下列哪一項較需要回診或聯絡醫護？",
      options: ["傷口乾燥且疼痛逐漸減輕", "傷口紅腫熱痛、滲液或裂開", "按時服用醫囑止痛藥", "翻身時用手支托傷口"],
      answer: 1,
      explain: [
        "乾燥且逐漸改善通常較穩定。",
        "正確，紅腫熱痛、滲液或裂開可能代表感染或癒合不良。",
        "按醫囑服藥是疼痛控制的一部分。",
        "支托傷口可減少牽扯疼痛。"
      ]
    },
    {
      q: "產後便秘的照護，下列哪一項較合適？",
      options: ["增加水分、纖維與適度活動，必要時依醫囑用藥", "為避免傷口痛完全不排便", "只吃油炸食物", "每天自行大量使用瀉藥"],
      answer: 0,
      explain: [
        "正確，水分、纖維與活動有助腸蠕動，藥物需依醫囑。",
        "憋便會使便秘更嚴重，排便用力也可能增加傷口不適。",
        "油炸食物可能加重便秘。",
        "瀉藥不宜自行大量使用。"
      ]
    },
    {
      q: "產後情緒照護中，下列哪一項最需要主動求助？",
      options: ["偶爾想哭但可休息後緩解", "持續低落、失眠、無望感或出現傷害自己／寶寶的想法", "因睡眠不足覺得疲倦", "家人協助後心情變好"],
      answer: 1,
      explain: [
        "短暫情緒波動常見，但仍需支持與觀察。",
        "正確，持續低落或有自傷、傷嬰想法是高風險警訊。",
        "疲倦常見，但若合併嚴重情緒症狀需評估。",
        "支持後改善通常較穩定。"
      ]
    },
    {
      q: "產後會陰傷口疼痛時，照護者應避免哪一項？",
      options: ["依醫囑止痛與保持清潔", "觀察紅腫熱痛與分泌物", "使用甜甜圈坐墊長時間壓迫傷口", "排便後由前往後清潔"],
      answer: 2,
      explain: [
        "依醫囑止痛與清潔有助恢復。",
        "觀察感染徵象很重要。",
        "正確，長時間局部壓迫可能影響血液循環與傷口舒適度，坐墊使用應依專業建議。",
        "由前往後清潔可減少感染風險。"
      ]
    },
    {
      q: "產後飲食照護較合適的原則為何？",
      options: ["均衡攝取蛋白質、蔬果、水分與足夠熱量", "只喝酒補身", "完全不吃青菜避免寶寶脹氣", "只吃甜食增加熱量"],
      answer: 0,
      explain: [
        "正確，均衡營養有助傷口修復、體力恢復與泌乳。",
        "酒精可能影響產婦與哺乳安全。",
        "蔬果與纖維有助預防便秘，不應無故完全避免。",
        "甜食不能取代均衡營養。"
      ]
    },
    {
      q: "產後活動量增加後惡露變多，照護者較適當的判斷是什麼？",
      options: ["先休息並觀察是否減少，若持續大量或有血塊需就醫", "立刻做劇烈運動把惡露排完", "完全不用理會", "自行塞衛生紙止血"],
      answer: 0,
      explain: [
        "正確，活動後少量增加可先休息觀察，但大量、持續或血塊多需評估。",
        "劇烈運動可能加重出血與疲勞。",
        "忽略大量出血可能危險。",
        "塞衛生紙不安全，會增加感染與延誤處理。"
      ]
    }
  ],
  hard: [
    {
      q: "產婦產後惡露突然大量鮮紅、子宮摸起來軟且頭暈冒冷汗。最優先的判斷與處置為何？",
      options: ["疑似產後出血，立即通知醫護或緊急就醫", "這是正常白色惡露", "先睡一覺再觀察", "停止喝水即可改善"],
      answer: 0,
      explain: [
        "正確，大量鮮紅惡露、子宮軟與休克徵象需立即處理。",
        "白色惡露不會是大量鮮紅出血。",
        "延誤可能造成嚴重失血。",
        "停止喝水不能處理產後出血。"
      ]
    },
    {
      q: "產後發燒合併子宮壓痛、惡露惡臭，最需要懷疑哪一項？",
      options: ["產褥感染或子宮內膜炎", "正常乳汁分泌", "單純睡眠不足", "會陰傷口已完全復原"],
      answer: 0,
      explain: [
        "正確，發燒、子宮壓痛與惡露惡臭是產後感染重要警訊。",
        "泌乳不會造成惡露惡臭與子宮壓痛。",
        "睡眠不足不能解釋感染徵象。",
        "此症狀不代表傷口完全復原。"
      ]
    },
    {
      q: "產婦乳房局部紅腫熱痛、發燒且全身痠痛，最合理的處置為何？",
      options: ["疑似乳腺炎，持續排乳並儘快就醫評估", "完全停止排乳並用力綁胸", "只擦香水遮味道", "把乳頭用酒精浸泡"],
      answer: 0,
      explain: [
        "正確，乳腺炎需維持乳汁排出並接受專業評估，必要時治療。",
        "停止排乳可能使阻塞與感染更嚴重。",
        "香水無法治療感染，且可能刺激寶寶。",
        "酒精會刺激皮膚並造成破皮風險。"
      ]
    },
    {
      q: "剖腹產後若突然胸痛、呼吸急促、單側小腿腫痛，最需要警覺什麼？",
      options: ["血栓或肺栓塞風險，需立即求助", "只是正常飢餓", "代表傷口癒合太快", "只要多睡就好"],
      answer: 0,
      explain: [
        "正確，產後與手術後血栓風險增加，胸痛與呼吸急促屬緊急警訊。",
        "飢餓不能解釋胸痛、喘與單側腿腫。",
        "這不是傷口癒合過快的表現。",
        "延誤可能危及生命。"
      ]
    },
    {
      q: "產後子宮底高度沒有下降，反而偏向一側且產婦解尿困難。最可能的照護重點為何？",
      options: ["評估膀胱脹滿並協助排尿", "立刻增加甜食", "完全停止活動", "用力按摩會陰傷口"],
      answer: 0,
      explain: [
        "正確，膀胱脹滿可能使子宮偏移並影響收縮，需協助排尿與評估。",
        "甜食無法改善膀胱脹滿。",
        "完全停止活動不利恢復。",
        "按摩會陰傷口可能增加疼痛與傷害。"
      ]
    },
    {
      q: "產後持續情緒低落兩週以上，覺得自己很糟且不想照顧寶寶。最適當的判斷為何？",
      options: ["可能有產後憂鬱，需家人支持並轉介專業評估", "每位產婦都一定會這樣，不用處理", "責備產婦不夠努力", "完全禁止產婦睡覺"],
      answer: 0,
      explain: [
        "正確，持續低落與功能受影響需重視，避免惡化。",
        "產後情緒困擾不應被忽視。",
        "責備會增加壓力，無助改善。",
        "睡眠不足會使情緒更差。"
      ]
    },
    {
      q: "產後會陰傷口疼痛加劇、紅腫並有膿性分泌物。最安全的處置為何？",
      options: ["保持清潔並儘快回診評估感染", "自行拆線讓膿流出", "每天用力刷洗傷口", "忍耐到產後檢查再說"],
      answer: 0,
      explain: [
        "正確，紅腫、疼痛加劇與膿性分泌物需懷疑感染。",
        "自行拆線可能造成傷口裂開與感染加重。",
        "用力刷洗會刺激傷口。",
        "延誤可能使感染擴大。"
      ]
    },
    {
      q: "哺乳媽媽需要服藥時，最安全的原則為何？",
      options: ["先告知醫師或藥師正在哺乳，確認藥物安全性", "所有藥都自行停掉", "所有藥都加倍吃", "把藥磨碎塗在乳頭上"],
      answer: 0,
      explain: [
        "正確，哺乳用藥需考慮藥物是否進入乳汁與對嬰兒影響。",
        "自行停藥可能使疾病惡化。",
        "加倍服藥可能造成危險。",
        "塗在乳頭上可能讓寶寶誤食且刺激皮膚。"
      ]
    },
    {
      q: "產後突然劇烈頭痛、視力模糊、右上腹痛或血壓偏高，應警覺哪一項？",
      options: ["產後子癲前症相關風險，需立即就醫", "正常睡眠不足而已", "乳汁太多", "會陰清潔太頻繁"],
      answer: 0,
      explain: [
        "正確，產後仍可能出現高血壓相關嚴重併發症，需立即評估。",
        "睡眠不足不能解釋高血壓合併神經症狀。",
        "乳汁量與這些危險症狀無直接關係。",
        "會陰清潔不會造成此組警訊。"
      ]
    },
    {
      q: "產後照護中，家人協助的最佳原則為何？",
      options: ["協助休息、營養、哺乳支持與警訊觀察", "要求產婦立刻恢復所有家務", "完全不讓產婦表達情緒", "有不適也禁止就醫"],
      answer: 0,
      explain: [
        "正確，支持系統能幫助身體恢復、降低壓力並及早發現異常。",
        "過早承擔大量家務會增加疲勞與恢復負擔。",
        "壓抑情緒不利心理健康。",
        "禁止就醫會延誤病情。"
      ]
    }
  ]

,
  chronicCare: {
    easy: [
      {
        q: "慢性病的主要特徵通常包含下列哪一項？",
        options: ["病程較長且進展緩慢", "不需要長期追蹤", "只需單次手術即可完全根治", "幾天內即可痊癒"],
        answer: 0,
        explain: [
          "正確，慢性病通常病程長、進展較慢，且需要長期追蹤與管理。",
          "慢性病通常需要定期追蹤與回診。",
          "多數慢性病與生活習慣或體質有關，並非單次處置就能完全消除。",
          "幾天內痊癒較常見於急性疾病。"
        ]
      },
      {
        q: "慢性病管理中，最重要的日常執行者是誰？",
        options: ["主治醫師", "藥師", "保險員", "個案本人"],
        answer: 3,
        explain: [
          "醫師能提供診斷與治療，但日常照護仍需個案配合。",
          "藥師可協助用藥諮詢，但不是每天執行照護的人。",
          "保險員不是慢性病照護的主要執行者。",
          "正確，慢性病管理高度依賴個案在日常生活中的自我控制與習慣養成。"
        ]
      },
      {
        q: "關於慢性病的飲食原則，通常建議採用下列哪一種方式？",
        options: ["高鹽高油以增加熱量", "只喝水不吃固體食物", "只要是天然食品就不需限制", "均衡飲食並控制鹽分、油脂與糖分"],
        answer: 3,
        explain: [
          "高鹽高油可能增加血壓、血脂與心血管負擔。",
          "只喝水會造成營養不足。",
          "天然食品仍可能含糖、含油或份量過多。",
          "正確，均衡飲食與適度限制鹽、油、糖是慢性病照護的重要原則。"
        ]
      },
      {
        q: "慢性病患者進行規律運動的主要目的為何？",
        options: ["完全取代藥物治療", "增加社交活動與朋友比賽", "增強體能、改善代謝並控制體重", "讓身體筋疲力竭而好入睡"],
        answer: 2,
        explain: [
          "運動不能自行取代醫師開立的藥物。",
          "社交可以是附加好處，但不是主要醫療目的。",
          "正確，規律運動可改善代謝、體能與體重控制。",
          "過度疲勞反而可能造成傷害或不適。"
        ]
      },
      {
        q: "慢性病患者若忘記服藥，較安全的做法是什麼？",
        options: ["立刻停藥並觀察幾天", "下次服藥時直接吃兩倍劑量", "自行購買加強版藥物", "諮詢醫師或藥師了解補服建議"],
        answer: 3,
        explain: [
          "自行停藥可能使病情控制變差。",
          "任意加倍劑量可能造成副作用或低血糖、低血壓等風險。",
          "自行更換或加強藥物不安全。",
          "正確，忘記服藥時應依藥物種類與時間間隔，詢問醫師或藥師較安全。"
        ]
      },
      {
        q: "慢性病管理中常提到的 BMI 指標，是透過哪兩個數值計算而得？",
        options: ["血壓與心跳", "身高與體重", "血糖與血脂", "年齡與體脂肪率"],
        answer: 1,
        explain: [
          "血壓與心跳不是 BMI 的計算來源。",
          "正確，BMI 是由體重與身高計算而得。",
          "血糖與血脂是代謝指標，但不是 BMI。",
          "年齡與體脂率不是 BMI 公式的主要變項。"
        ]
      },
      {
        q: "關於吸菸對慢性病的影響，下列何者較正確？",
        options: ["吸菸可以保護血管", "少量吸菸就完全沒有風險", "會使血管收縮且心率加快", "只影響肺部，不影響其他器官"],
        answer: 2,
        explain: [
          "吸菸會傷害血管與心肺功能。",
          "少量吸菸仍可能增加健康風險。",
          "正確，尼古丁會使血管收縮、心率加快，增加心血管負擔。",
          "吸菸也會影響心血管、腎臟與代謝健康。"
        ]
      },
      {
        q: "為什麼慢性病管理需要記錄血壓、血糖或體重等健康日誌？",
        options: ["增加家庭聊天話題", "只是為了應付醫師檢查", "單次異常就可以自行改藥", "觀察數據趨勢以調整照護方向"],
        answer: 3,
        explain: [
          "健康日誌的主要目的不是聊天。",
          "記錄不是為了應付，而是幫助判斷病情變化。",
          "不可因單次數據自行改藥。",
          "正確，連續紀錄能看出趨勢，提供醫療人員調整治療的依據。"
        ]
      },
      {
        q: "慢性病管理中的『健康識能』是指什麼能力？",
        options: ["自我診斷所有症狀", "背誦所有藥物化學名稱", "獲取、理解並運用健康資訊", "在網路上找到各種偏方"],
        answer: 2,
        explain: [
          "自我診斷可能延誤正確治療。",
          "不需要背誦所有藥名，而是要能正確理解用藥方式。",
          "正確，健康識能是取得、理解、判斷並運用健康資訊的能力。",
          "偏方資訊可能不可靠，應以實證醫療資訊為準。"
        ]
      },
      {
        q: "慢性病追蹤時，若出現胸痛、呼吸困難或單側無力，應如何處理？",
        options: ["先睡一覺再說", "自行加藥觀察", "立即就醫或撥打緊急電話", "停止所有飲食"],
        answer: 2,
        explain: [
          "這些可能是急性危險徵象，不宜拖延。",
          "自行加藥可能造成危險。",
          "正確，胸痛、喘、單側無力可能代表心血管或腦血管急症，應立即求助。",
          "停止飲食不能處理急症。"
        ]
      }
    ],
    medium: [
      {
        q: "關於慢性病管理的主要目標，下列敘述何者最適切？",
        options: ["縮短門診追蹤時間以減少醫療負擔", "追求短期完全根治所有慢性病", "不需要改變生活型態", "控制危險因子、預防併發症並維持生活品質"],
        answer: 3,
        explain: [
          "追蹤時間長短不是核心目標。",
          "慢性病通常難以短期完全根治。",
          "生活型態調整是慢性病管理的重要部分。",
          "正確，慢性病管理重點是穩定控制、預防併發症與維持生活品質。"
        ]
      },
      {
        q: "慢性病管理中，個案較理想的角色是什麼？",
        options: ["完全被動接受治療", "主動參與自我照護與醫療決策", "只在症狀嚴重時才配合", "把所有責任交給家屬"],
        answer: 1,
        explain: [
          "被動接受不利長期控制。",
          "正確，個案主動參與可提升服藥、飲食、運動與追蹤成效。",
          "慢性病即使症狀不明顯也需持續管理。",
          "家屬可支持，但不能完全取代個案自我照護。"
        ]
      },
      {
        q: "一般健康成人每日鈉攝取量建議上限約為多少？",
        options: ["3,600 mg", "5,000 mg", "1,200 mg", "2,400 mg"],
        answer: 3,
        explain: [
          "3,600 mg 鈉含量偏高。",
          "5,000 mg 鈉含量過高，容易增加血壓負擔。",
          "1,200 mg 不是一般常用的每日上限建議。",
          "正確，一般常以每日鈉不超過約 2,400 mg 作為減鹽參考。"
        ]
      },
      {
        q: "糖尿病患者評估過去 2 到 3 個月血糖控制狀況的最佳指標是什麼？",
        options: ["單次飯後血糖", "糖化血色素 HbA1c", "今天早上的體重", "單次飯前血糖"],
        answer: 1,
        explain: [
          "單次血糖容易受飲食、壓力與活動影響。",
          "正確，HbA1c 可反映過去約 2 到 3 個月的平均血糖控制。",
          "體重不能直接反映血糖控制。",
          "單次飯前血糖無法代表長期控制。"
        ]
      },
      {
        q: "慢性病患者運動衛教中，通常建議每週至少達成多少中等強度運動？",
        options: ["500 分鐘", "60 分鐘", "150 分鐘", "300 分鐘"],
        answer: 2,
        explain: [
          "500 分鐘對多數人過高，且不一定適合作為起始目標。",
          "60 分鐘通常不足以達到一般建議量。",
          "正確，常見建議為每週至少 150 分鐘中等強度運動。",
          "300 分鐘可作為進階目標，但不是最基本建議量。"
        ]
      },
      {
        q: "依台灣常用成人 BMI 分類，正常範圍通常為何？",
        options: ["24 ≤ BMI < 27", "15.5 ≤ BMI < 18.5", "18.5 ≤ BMI < 24", "27 ≤ BMI < 30"],
        answer: 2,
        explain: [
          "這通常屬於過重範圍。",
          "這通常屬於過輕範圍。",
          "正確，成人 BMI 18.5 到未滿 24 常被視為正常範圍。",
          "這通常屬於肥胖範圍。"
        ]
      },
      {
        q: "若忘記服藥且想起時間已接近下一次服藥，通常較安全的原則為何？",
        options: ["下次補吃兩倍劑量", "立即停藥並更換處方", "整天不吃飯減少藥物需求", "跳過該次，照常服用下一劑並依醫囑處理"],
        answer: 3,
        explain: [
          "自行加倍劑量可能造成藥物副作用。",
          "不可自行停藥或更換處方。",
          "不吃飯不能解決用藥問題，還可能造成低血糖。",
          "正確，接近下一劑時通常不建議補雙倍，應依醫囑或藥師建議處理。"
        ]
      },
      {
        q: "成人男性腰圍達多少以上時，通常需注意代謝風險？",
        options: ["85 cm", "95 cm", "80 cm", "90 cm"],
        answer: 3,
        explain: [
          "85 cm 較常作為女性腰圍風險參考。",
          "95 cm 已超過常見男性風險標準。",
          "80 cm 不是男性常用風險切點。",
          "正確，男性腰圍 90 cm 以上通常需注意代謝症候群風險。"
        ]
      },
      {
        q: "關於吸菸對慢性病管理的影響，下列敘述何者正確？",
        options: ["吸菸會增加心血管疾病與中風風險", "吸菸可幫助血糖控制", "少量吸菸完全無害", "只要運動就能抵消吸菸傷害"],
        answer: 0,
        explain: [
          "正確，吸菸會傷害血管，增加心血管疾病、中風與慢性病惡化風險。",
          "吸菸不利血糖與血管健康。",
          "少量吸菸仍有健康風險。",
          "運動無法完全抵消吸菸造成的傷害。"
        ]
      },
      {
        q: "慢性病飲食衛教中，下列哪一項較符合原則？",
        options: ["大量攝取油炸物", "完全不吃任何澱粉", "限制飽和脂肪與含糖飲料攝取", "完全禁止所有肉類蛋白質"],
        answer: 2,
        explain: [
          "油炸物會增加熱量與脂肪攝取。",
          "澱粉不必完全禁止，重點是份量與種類。",
          "正確，減少飽和脂肪與含糖飲料有助控制體重、血脂與血糖。",
          "蛋白質需依疾病狀況調整，不是完全禁止。"
        ]
      }
    ],
    hard: [
      {
        q: "高血壓患者若出現劇烈頭痛、視力模糊、胸痛或單側無力，最適當的判斷為何？",
        options: ["可能為高血壓急症或腦心血管警訊，應立即就醫", "這是一般疲勞，睡覺即可", "自行加倍服用降血壓藥", "停止喝水就會改善"],
        answer: 0,
        explain: [
          "正確，這些症狀可能代表急性危險狀況，需立即評估。",
          "以疲勞解釋可能延誤急救。",
          "不可自行加倍服藥，可能造成血壓過低或其他風險。",
          "停止喝水不能處理高血壓急症。"
        ]
      },
      {
        q: "糖尿病足部傷口久久不癒合、變黑或有膿，最安全的處置為何？",
        options: ["盡快就醫評估感染與循環狀況", "自行剪開傷口引流", "泡熱水促進血液循環", "用貼布蓋住不再查看"],
        answer: 0,
        explain: [
          "正確，糖尿病足傷口惡化可能導致嚴重感染，需及早處理。",
          "自行剪開傷口可能造成感染擴散。",
          "感覺遲鈍時泡熱水可能造成燙傷。",
          "遮住不觀察可能延誤病情。"
        ]
      },
      {
        q: "慢性腎臟病患者為何不應自行長期服用止痛藥或來路不明藥物？",
        options: ["可能加重腎臟負擔或造成腎功能惡化", "所有止痛藥都能保護腎臟", "只要是草藥就一定安全", "藥物與腎臟功能無關"],
        answer: 0,
        explain: [
          "正確，部分藥物可能傷腎，慢性腎臟病患者更需依醫囑使用。",
          "並非所有止痛藥都安全，部分會傷害腎臟。",
          "草藥或偏方也可能含有傷腎成分。",
          "腎臟是藥物代謝與排泄的重要器官之一。"
        ]
      },
      {
        q: "心臟衰竭患者短時間體重快速增加，最需要警覺什麼？",
        options: ["可能水分滯留，心臟負擔增加", "代表肌肉突然增加", "表示病情一定完全改善", "可以立刻停止所有藥物"],
        answer: 0,
        explain: [
          "正確，短時間體重上升常與水分滯留有關，需追蹤並回報。",
          "短時間內不太可能主要是肌肉增加。",
          "體重快速增加不代表改善。",
          "不可自行停藥。"
        ]
      },
      {
        q: "腎臟病患者高血磷控制不佳，可能造成哪一類問題？",
        options: ["骨骼脆弱、皮膚搔癢與血管鈣化", "視力立即恢復", "血壓一定變低", "完全不影響身體"],
        answer: 0,
        explain: [
          "正確，高血磷會影響鈣磷平衡，增加骨骼與血管問題。",
          "高血磷不會讓視力立即恢復。",
          "高血磷與血壓降低沒有必然關係。",
          "血磷控制不佳可能造成多項併發症。"
        ]
      },
      {
        q: "糖尿病患者運動前若血糖過低或有低血糖症狀，較安全的原則為何？",
        options: ["先處理低血糖並暫緩運動", "立刻加強運動把血糖消耗完", "完全不需要監測", "只喝無糖茶即可"],
        answer: 0,
        explain: [
          "正確，低血糖時運動可能使情況惡化，應先補充糖分並觀察。",
          "加強運動會使血糖更低。",
          "糖尿病患者運動前後需注意血糖變化。",
          "無糖茶不能處理低血糖。"
        ]
      },
      {
        q: "慢性病個案同時使用多種藥物時，為何需要整理用藥清單？",
        options: ["有助避免重複用藥、交互作用與服藥錯誤", "可以讓自己隨意停藥", "只為了讓藥盒看起來整齊", "藥越多越代表病情穩定"],
        answer: 0,
        explain: [
          "正確，用藥清單可幫助醫療人員評估安全性與交互作用。",
          "整理清單不代表可以自行停藥。",
          "整齊只是附加效果，安全才是重點。",
          "藥物多不代表病情一定穩定。"
        ]
      },
      {
        q: "慢性病照護中，為何不建議只依單次異常數值自行調整藥物？",
        options: ["單次數值可能受飲食、壓力、量測誤差影響，需看趨勢並諮詢專業", "單次數值一定完全準確", "自行調藥永遠比醫師快", "慢性病不需要任何數據"],
        answer: 0,
        explain: [
          "正確，慢性病治療需看趨勢、症狀與專業評估。",
          "單次量測可能有誤差。",
          "自行調藥可能造成危險。",
          "數據追蹤是慢性病管理的重要依據。"
        ]
      },
      {
        q: "代謝症候群的照護重點，最符合下列哪一項？",
        options: ["控制腰圍、血壓、血糖、血脂並改善生活型態", "只要吃保健品即可", "完全不需要運動", "只要體重正常就不需追蹤"],
        answer: 0,
        explain: [
          "正確，代謝症候群需整合多項危險因子管理。",
          "保健品不能取代飲食、運動與醫療追蹤。",
          "規律運動是重要介入方式。",
          "體重正常仍可能有血壓、血糖或血脂異常。"
        ]
      },
      {
        q: "慢性病患者若已出現喘、胸悶、水腫明顯惡化或尿量明顯減少，較安全的做法是什麼？",
        options: ["盡快就醫或聯絡醫療人員", "自行停藥三天", "大量喝水沖淡症狀", "完全不記錄，避免焦慮"],
        answer: 0,
        explain: [
          "正確，這些可能代表心臟、腎臟或循環狀況惡化，需專業評估。",
          "自行停藥可能使病情惡化。",
          "大量喝水可能加重心衰竭或腎臟負擔。",
          "記錄症狀與數據有助醫療判斷。"
        ]
      }
    ]
  }

  ,
  nutritionCare: {
    easy: [
      { q: "每 1 公克脂肪約可提供多少大卡熱量？", options: ["9 大卡", "4 大卡", "12 大卡", "7 大卡"], answer: 0, explain: ["正確，脂肪是能量密度最高的巨量營養素，每公克約 9 大卡。", "4 大卡是碳水化合物與蛋白質每公克的熱量。", "人體主要營養素沒有每公克 12 大卡的類別。", "7 大卡通常是酒精每公克的熱量。"] },
      { q: "基礎代謝率 BMR 是指人體在什麼狀態下消耗的最低熱量？", options: ["睡覺時完全無意識", "進食消化後立即測量", "安靜不動且清醒、恆溫下", "激烈運動中"], answer: 2, explain: ["睡眠代謝率通常與 BMR 不同。", "進食後會產生食物熱效應，影響測量。", "正確，BMR 代表維持呼吸、心跳、體溫等基本生命功能所需能量。", "運動時能量消耗高於基礎代謝率。"] },
      { q: "人體內主要的直接能量來源分子，也常被稱為能量貨幣的是什麼？", options: ["DNA", "mRNA", "ATP", "膽固醇"], answer: 2, explain: ["DNA 主要負責遺傳資訊儲存。", "mRNA 參與蛋白質合成，不是主要能量貨幣。", "正確，ATP 可釋放能量以驅動細胞代謝反應。", "膽固醇是細胞膜與荷爾蒙相關成分，不是直接能量貨幣。"] },
      { q: "下列哪一種維生素屬於脂溶性維生素？", options: ["維生素 A", "維生素 C", "維生素 B12", "維生素 B1"], answer: 0, explain: ["正確，維生素 A、D、E、K 屬於脂溶性維生素。", "維生素 C 屬於水溶性維生素。", "維生素 B12 屬於水溶性維生素。", "維生素 B1 屬於水溶性維生素。"] },
      { q: "哪一種營養素是構成肌肉、器官組織以及修復受損細胞的主要原料？", options: ["礦物質", "碳水化合物", "維生素", "蛋白質"], answer: 3, explain: ["礦物質參與生理調節，但不是組織修復的主要原料。", "碳水化合物主要提供能量。", "維生素多作為代謝輔助因子。", "正確，蛋白質是身體組織建構與修復的重要材料。"] },
      { q: "身體將攝取的葡萄糖轉化為肝糖儲存，主要屬於哪一種代謝？", options: ["擴散作用", "滲透作用", "合成代謝", "分解代謝"], answer: 2, explain: ["擴散是物質移動，不是能量儲存代謝。", "滲透作用主要描述水分移動。", "正確，將小分子合成較大的儲存型分子屬於合成代謝。", "分解代謝是分解大分子以釋放能量。"] },
      { q: "身體質量指數 BMI 的正確計算公式為何？", options: ["體重(g) ÷ 身高(cm)²", "體重(kg) ÷ 身高(m)²", "身高(m) × 體重(kg)", "體重(kg) ÷ 身高(cm)"], answer: 1, explain: ["單位錯誤，體重應用公斤、身高應用公尺。", "正確，BMI = 體重公斤 ÷ 身高公尺平方。", "這不是 BMI 公式。", "分母需為身高公尺平方。"] },
      { q: "人體最主要的消化與吸收場所是哪一個器官？", options: ["胃", "大腸", "小腸", "食道"], answer: 2, explain: ["胃主要負責攪拌與初步消化。", "大腸主要吸收水分與電解質。", "正確，小腸是營養素消化與吸收的主要場所。", "食道主要負責運送食物。"] },
      { q: "膳食纖維對人體的主要益處是什麼？", options: ["提供大量能量", "構成肌肉纖維", "促進腸道蠕動", "增加骨質密度"], answer: 2, explain: ["膳食纖維幾乎不提供熱量。", "肌肉主要由蛋白質構成。", "正確，膳食纖維可增加糞便體積並促進腸道蠕動。", "骨質密度主要與鈣、維生素 D 等相關。"] },
      { q: "鐵質在人體內最主要的功能是什麼？", options: ["強化骨骼強度", "製造血紅素以攜帶氧氣", "維持神經系統發育", "幫助皮膚美白"], answer: 1, explain: ["骨骼強度主要與鈣、磷、維生素 D 有關。", "正確，鐵是血紅素的重要成分，協助氧氣運輸。", "神經系統發育與多種營養素相關，但不是鐵的最主要功能。", "這不是鐵的核心生理功能。"] },
      { q: "胰島素主要如何調節血糖？", options: ["促進細胞攝取血糖，降低血糖濃度", "促進脂肪分解釋放熱量", "抑制肝糖合成", "提高血液中的葡萄糖濃度"], answer: 0, explain: ["正確，胰島素可幫助葡萄糖進入細胞被利用或儲存。", "胰島素通常促進脂肪合成並抑制分解。", "胰島素會促進肝糖合成。", "升糖素較會提高血糖。"] },
      { q: "維生素 C 缺乏時最容易導致下列哪一種問題？", options: ["佝僂病", "夜盲症", "腳氣病", "壞血病"], answer: 3, explain: ["佝僂病多與維生素 D 缺乏有關。", "夜盲症多與維生素 A 缺乏有關。", "腳氣病多與維生素 B1 缺乏有關。", "正確，維生素 C 缺乏可能造成壞血病。"] },
      { q: "水在人體代謝中的重要角色不包括哪一項？", options: ["作為化學反應的溶劑", "提供熱量來源", "調節體溫", "運輸營養與廢物"], answer: 1, explain: ["多數代謝反應在水溶液中進行。", "正確，水不含熱量，不能直接提供能量。", "水可透過出汗與蒸發協助體溫調節。", "血液以水為主要成分，可運送營養與代謝廢物。"] },
      { q: "必需胺基酸是指下列哪一種情況？", options: ["人體可自行大量合成，不需攝取", "人體無法足量合成，需由飲食取得", "所有食物都一定含完整必需胺基酸", "只有運動時才需要"], answer: 1, explain: ["必需胺基酸無法由人體足量合成。", "正確，必需胺基酸需要從飲食中攝取。", "並非所有食物都含完整必需胺基酸。", "必需胺基酸是維持生命運作所需，不只運動時需要。"] },
      { q: "長期攝取過多鈉最可能增加哪一種健康風險？", options: ["貧血", "高血壓", "壞血病", "夜盲症"], answer: 1, explain: ["貧血常與鐵、葉酸或 B12 等相關。", "正確，高鈉攝取會增加血容量與血管壓力，提高高血壓風險。", "壞血病與維生素 C 缺乏有關。", "夜盲症與維生素 A 缺乏有關。"] }
    ],
    medium: [
      { q: "下列哪一項最能描述食物熱效應？", options: ["睡覺時的最低能量消耗", "消化、吸收與代謝食物所需的能量", "運動時肌肉產生的熱", "體溫下降時的熱量流失"], answer: 1, explain: ["這較接近基礎代謝率。", "正確，食物熱效應是身體處理食物過程中消耗的能量。", "這屬於活動或運動能量消耗。", "這不是食物熱效應。"] },
      { q: "如果長期攝取熱量大於消耗熱量，最可能造成什麼結果？", options: ["體重增加", "一定會缺鐵", "基礎代謝率歸零", "體內水分完全消失"], answer: 0, explain: ["正確，熱量正平衡時，多餘能量常轉為脂肪儲存。", "缺鐵與鐵攝取、吸收或流失有關。", "基礎代謝率不會歸零。", "熱量過剩不會使水分完全消失。"] },
      { q: "維生素 D 與鈣質的關係，下列何者正確？", options: ["維生素 D 可幫助鈣吸收", "維生素 D 會讓鈣完全無法吸收", "鈣只存在於脂肪中", "兩者與骨骼無關"], answer: 0, explain: ["正確，維生素 D 有助腸道吸收鈣質並維持骨骼健康。", "維生素 D 不會阻止鈣吸收。", "鈣是礦物質，不是只存在於脂肪。", "鈣與維生素 D 都與骨骼健康密切相關。"] },
      { q: "缺鐵性貧血患者若想提升鐵吸收，可搭配哪一類營養素？", options: ["維生素 C", "大量咖啡", "高鈉食品", "酒精"], answer: 0, explain: ["正確，維生素 C 可促進非血基質鐵吸收。", "咖啡可能影響鐵吸收。", "高鈉食品不會提升鐵吸收，還可能增加血壓負擔。", "酒精不適合作為促進吸收的方法。"] },
      { q: "膳食纖維在代謝健康中的重要作用之一是什麼？", options: ["增加體內膽固醇合成", "作為主要肌肉能量來源", "取代水分維持滲透壓", "延緩葡萄糖吸收速率"], answer: 3, explain: ["某些纖維反而有助膽固醇排出。", "人體無法把膳食纖維作為主要肌肉能量。", "纖維不能取代水分與電解質。", "正確，膳食纖維可延緩糖分吸收並幫助餐後血糖穩定。"] },
      { q: "人體內最重要的代謝調節中心，參與物質轉化與解毒的器官是什麼？", options: ["胃", "肝臟", "肺臟", "心臟"], answer: 1, explain: ["胃主要負責食物消化。", "正確，肝臟參與醣類、脂質、蛋白質代謝與解毒。", "肺臟主要負責氣體交換。", "心臟主要負責血液循環。"] },
      { q: "總熱量消耗 TDEE 通常包含基礎代謝率、食物熱效應與哪一項？", options: ["身高高度", "年齡大小", "身體活動量", "睡眠時間長短"], answer: 2, explain: ["身高會影響 BMR，但不是 TDEE 的獨立項目。", "年齡會影響代謝，但不是能量支出類別。", "正確，TDEE 包含一天中活動所消耗的能量。", "睡眠不是額外增加的活動消耗項目。"] },
      { q: "茶與咖啡可能影響哪一種營養素的吸收？", options: ["鐵質", "鈉", "水分", "葡萄糖"], answer: 0, explain: ["正確，茶與咖啡中的單寧酸等成分可能影響鐵吸收。", "茶與咖啡不是主要影響鈉吸收的因素。", "飲品含水，但重點不是阻止水分吸收。", "一般不以茶咖啡影響葡萄糖吸收作為主要衛教重點。"] },
      { q: "代謝症候群通常與下列哪一組異常最相關？", options: ["血壓、血糖、血脂與腰圍", "視力、聽力與牙齒顏色", "頭髮長度與指甲硬度", "身高與鞋子尺寸"], answer: 0, explain: ["正確，代謝症候群與多項心血管代謝危險因子相關。", "這些不是代謝症候群的核心指標。", "這些不是代謝症候群的診斷重點。", "身高與鞋號不是代謝症候群重點。"] },
      { q: "胃食道逆流患者飯後較建議怎麼做？", options: ["立刻平躺", "少量多餐並避免飯後立即躺下", "大量吃宵夜再睡", "穿很緊的衣物壓住胃部"], answer: 1, explain: ["飯後立刻平躺會增加逆流風險。", "正確，少量多餐與飯後避免平躺可減少逆流。", "睡前進食可能加重逆流。", "緊身衣物會增加腹壓，可能加重症狀。"] },
      { q: "脂溶性維生素過量時相對需要注意，主要原因是什麼？", options: ["較容易儲存在體內", "一定會立刻從尿液排出", "完全不會被吸收", "不參與任何生理功能"], answer: 0, explain: ["正確，脂溶性維生素較容易儲存在肝臟與脂肪組織。", "水溶性維生素較容易隨尿液排出。", "脂溶性維生素可被吸收。", "脂溶性維生素具有重要生理功能。"] },
      { q: "下列哪一項較符合均衡飲食原則？", options: ["每餐只有含糖飲料", "完全不吃蛋白質", "主食、蔬菜、蛋白質與適量油脂搭配", "只吃單一食物"], answer: 2, explain: ["含糖飲料不能取代正餐。", "蛋白質是身體組織修復的重要營養素。", "正確，均衡搭配各類食物可提供完整營養。", "單一飲食容易造成營養不均。"] },
      { q: "血糖長期控制不佳，最需要注意哪一類風險？", options: ["血管、神經、腎臟與眼睛併發症", "頭髮立刻變長", "身高快速增加", "體溫永久下降"], answer: 0, explain: ["正確，長期高血糖會傷害血管與神經，增加多種併發症。", "與頭髮長度無直接關係。", "高血糖不會讓身高快速增加。", "這不是高血糖的典型風險。"] },
      { q: "內臟脂肪過多為何會增加代謝風險？", options: ["可能造成胰島素阻抗與慢性發炎", "能完全保護血管", "只會影響外觀", "一定代表肌肉量增加"], answer: 0, explain: ["正確，內臟脂肪與胰島素阻抗、發炎反應及心血管風險有關。", "內臟脂肪不會保護血管。", "它不只是外觀問題。", "內臟脂肪增加不等於肌肉量增加。"] },
      { q: "若飲食長期缺乏蛋白質，較可能造成什麼影響？", options: ["肌肉量下降與傷口修復變差", "血壓一定立刻正常", "完全不影響免疫", "一定讓骨頭變成金屬"], answer: 0, explain: ["正確，蛋白質不足會影響肌肉、免疫與組織修復。", "蛋白質不足不會讓血壓立刻正常。", "蛋白質不足可能影響免疫功能。", "這不是生理現象。"] }
    ],
    hard: [
      { q: "胰島素阻抗與代謝症候群的關係，下列何者最正確？", options: ["細胞對胰島素反應下降，血糖與脂肪代謝更容易失衡", "胰島素阻抗代表完全不需要胰島素", "只會讓視力變好", "與內臟脂肪完全無關"], answer: 0, explain: ["正確，胰島素阻抗會使血糖調控變差，也常與腹部脂肪與血脂異常相關。", "胰島素仍是重要血糖調節激素。", "這不是胰島素阻抗的效果。", "內臟脂肪與胰島素阻抗密切相關。"] },
      { q: "缺鐵性貧血若合併心悸、喘與明顯疲倦，最合理的判斷是什麼？", options: ["血液攜氧能力下降，身體需要更努力供氧", "代表鈉攝取太少", "一定只是睡太多", "可用咖啡完全治療"], answer: 0, explain: ["正確，血紅素不足會降低攜氧能力，可能造成心悸、喘與疲倦。", "這不是缺鐵性貧血的主要機轉。", "不能只以睡眠解釋。", "咖啡不能治療缺鐵性貧血，還可能影響鐵吸收。"] },
      { q: "腎功能下降者為何常需依醫囑調整鉀、磷與蛋白質攝取？", options: ["腎臟排除與調節能力下降，過量可能造成負擔或併發症", "因為所有營養素都完全不能吃", "只要多喝含糖飲料即可", "與腎臟功能無關"], answer: 0, explain: ["正確，腎功能下降會影響電解質、磷與代謝廢物處理。", "不是所有營養素都不能吃，而是需個別調整。", "含糖飲料不能取代腎臟病飲食控制。", "飲食與腎臟負擔密切相關。"] },
      { q: "為什麼高鈉飲食可能加重高血壓與心臟負擔？", options: ["鈉會增加水分滯留與血容量，使血管壓力上升", "鈉會直接變成骨頭", "鈉能完全降低心跳", "鈉與血壓沒有任何關係"], answer: 0, explain: ["正確，鈉攝取過多可能造成水分滯留與血壓上升。", "鈉不會直接變成骨頭。", "鈉不是降低心跳的治療方式。", "鈉與血壓控制有重要關聯。"] },
      { q: "長期能量攝取不足時，身體可能出現什麼代謝反應？", options: ["分解肝糖、脂肪甚至肌肉以供能", "立刻停止所有代謝", "只會增加脂肪儲存", "完全不影響體重"], answer: 0, explain: ["正確，能量不足時身體會動用儲存能量，嚴重時也可能分解肌肉。", "生命維持仍需要代謝。", "能量不足通常不會只增加脂肪儲存。", "長期能量不足會影響體重與身體組成。"] },
      { q: "胃食道逆流若長期反覆發生，較需要注意什麼？", options: ["食道發炎、吞嚥困難或症狀惡化時需就醫", "一定會自行永久痊癒", "每天吃到很飽可以治療", "平躺越快越好"], answer: 0, explain: ["正確，長期逆流可能造成食道發炎或其他問題，症狀惡化需評估。", "反覆症狀不應忽視。", "吃太飽可能加重逆流。", "飯後平躺會增加逆流風險。"] },
      { q: "為什麼只用體重判斷代謝健康可能不足？", options: ["腰圍、血壓、血糖與血脂也會反映內臟脂肪與代謝風險", "體重永遠不重要", "只看鞋號即可", "體重正常就不可能有代謝異常"], answer: 0, explain: ["正確，體重正常仍可能有腹部脂肪或代謝指標異常。", "體重仍是重要參考，但不能單獨判斷全部風險。", "鞋號與代謝健康無關。", "體重正常不代表完全沒有代謝風險。"] },
      { q: "蛋白質攝取與傷口癒合的關係，下列何者最正確？", options: ["蛋白質提供組織修復與免疫所需材料", "蛋白質越少傷口越快好", "蛋白質只會提供甜味", "傷口癒合完全不需要營養"], answer: 0, explain: ["正確，蛋白質對膠原蛋白形成、免疫與組織修復很重要。", "蛋白質不足會使修復變差。", "蛋白質不是提供甜味的主要成分。", "營養狀態會影響傷口癒合。"] },
      { q: "脂肪雖熱量高，但仍不可完全排除，主要原因是什麼？", options: ["脂肪參與細胞膜、荷爾蒙與脂溶性維生素吸收", "脂肪沒有任何生理功能", "完全不吃脂肪一定最健康", "脂肪只能造成疾病"], answer: 0, explain: ["正確，適量健康脂肪是身體正常運作所需。", "脂肪具有重要生理功能。", "完全不吃脂肪可能影響營養平衡。", "脂肪種類與攝取量才是重點。"] },
      { q: "為什麼建議糖尿病患者避免單獨大量攝取精緻澱粉或含糖飲料？", options: ["可能使血糖快速上升並增加胰島素需求", "可立即改善所有代謝問題", "會讓血糖永久下降", "與血糖無關"], answer: 0, explain: ["正確，精緻糖類吸收快，容易造成餐後血糖上升。", "這不會改善代謝問題。", "含糖飲料通常會使血糖上升。", "精緻澱粉與含糖飲料和血糖密切相關。"] },
      { q: "若長期使用極端節食方式減重，較可能出現什麼問題？", options: ["營養不足、肌肉流失與復胖風險增加", "永遠不會復胖", "所有代謝指標一定正常", "不需要任何蛋白質"], answer: 0, explain: ["正確，極端節食可能造成營養不均與肌肉流失，並增加復胖機會。", "極端節食不代表不會復胖。", "代謝指標不一定改善。", "人體需要蛋白質維持組織與修復。"] },
      { q: "茶、咖啡與鐵劑服用時間需要錯開，最主要原因是什麼？", options: ["單寧酸等成分可能降低鐵吸收", "茶咖啡會讓鐵變成鈉", "錯開時間只是為了好看", "鐵劑完全不會被吸收"], answer: 0, explain: ["正確，茶與咖啡中的成分可能影響鐵吸收，建議錯開。", "鐵不會變成鈉。", "錯開時間有生理吸收上的考量。", "鐵劑仍可被吸收，但受飲食影響。"] },
      { q: "營養標示中同時注意熱量、糖、鈉與脂肪的意義是什麼？", options: ["幫助評估食物對體重、血糖、血壓與血脂的影響", "只用來增加包裝文字", "看標示就不用控制份量", "只需要看顏色不需看數字"], answer: 0, explain: ["正確，營養標示可協助選擇較適合健康目標的食物。", "營養標示有實際健康資訊。", "仍需注意每份份量與總攝取量。", "數字與份量判讀很重要。"] },
      { q: "代謝健康管理中，為什麼規律運動很重要？", options: ["可提升能量消耗、改善胰島素敏感性與心肺功能", "運動會完全取代所有飲食與藥物", "運動只影響外觀", "只要運動就能無限制吃糖"], answer: 0, explain: ["正確，運動有助血糖、血脂、血壓與體重管理。", "運動不能完全取代飲食、藥物與醫療追蹤。", "運動也影響代謝與心肺健康。", "仍需控制糖分與總熱量攝取。"] },
      { q: "若出現不明原因體重快速下降、食慾長期變差或吞嚥困難，較安全的做法是什麼？", options: ["就醫或諮詢營養師評估", "完全不處理", "只喝含糖飲料", "自行停掉所有飲食"], answer: 0, explain: ["正確，這些可能代表營養不良或疾病警訊，需要專業評估。", "忽略可能延誤處理。", "含糖飲料不能提供完整營養。", "停止飲食會加重營養不足。"] }
    ]
  }


};


function getFullQuestionSet(level = currentLevel, topicKey = getQuizTopicKey()) {
  const customSet = customQuizQuestionBank?.[topicKey]?.[level];

  if (Array.isArray(customSet) && customSet.length > 0) {
    return customSet;
  }

  return buildTopicQuestionSet(topicKey, level);
}

function updateQuizMenuLabel() {
  const label = document.getElementById("quiz-topic-label");
  if (!label) return;

  const topicTitle = getQuizTopicTitle();
  label.textContent = topicTitle;
}

function getQuestionSet() {
  if (currentQuizQuestions && currentQuizQuestions.length > 0) {
    return currentQuizQuestions;
  }

  return getFullQuestionSet(currentLevel);
}

function startNewQuizRound(level = currentLevel) {
  currentLevel = level;
  const topicKey = getQuizTopicKey();
  currentQuizSessionLevel = level;
  currentQuizSessionTopic = topicKey;
  quizIndex = 0;
  quizScore = 0;
  answered = false;
  currentQuizQuestions = getRandomQuestions(getFullQuestionSet(level, topicKey), 10);
}

function updateQuizProgress() {
  const questionSet = getQuestionSet();
  const progress = document.getElementById("quiz-progress");

  if (progress) {
    const topicTitle = getQuizTopicTitle(currentQuizSessionTopic || getQuizTopicKey());
    const levelName = difficultyNames[currentLevel] || "簡單";
    progress.innerText = `🧠 ${topicTitle}｜${levelName}：${quizScore} / ${questionSet.length} 題`;
  }
}

function loadQuestion() {
  if (
    !currentQuizQuestions.length ||
    currentQuizSessionLevel !== currentLevel ||
    currentQuizSessionTopic !== getQuizTopicKey()
  ) {
    startNewQuizRound(currentLevel);
  }

  answered = false;

  const questionSet = getQuestionSet();
  const q = questionSet[quizIndex];

  if (!q) return;

  const result = document.getElementById("answer-explanation");
  const question = document.getElementById("quiz-question");
  const options = document.getElementById("quiz-options");

  if (!result || !question || !options) return;

  result.innerHTML = "";
  result.classList.add("hidden");

  question.innerHTML = `<strong>${quizIndex + 1}. ${q.q}</strong>`;

  options.innerHTML = q.options.map((opt, i) => {
    return `<button class="quiz-option" onclick="checkAnswer(${i})">${opt}</button>`;
  }).join("");
}


function cleanQuizExplainText(text) {
  return String(text || "")
    .replace(/^[A-D][：:]\s*/g, "")
    .replace(/^正確答案[。．.:：]?\s*/g, "")
    .replace(/^錯誤答案[。．.:：]?\s*/g, "")
    .trim();
}

function checkAnswer(choice) {
  if (answered) return;

  answered = true;

  const questionSet = getQuestionSet();
  const q = questionSet[quizIndex];

  const result = document.getElementById("answer-explanation");
  const optionButtons = document.querySelectorAll(".quiz-option");

  if (!result) return;

  const isCorrect = choice === q.answer;

  if (isCorrect) {
    quizScore++;
  }

optionButtons.forEach((btn, index) => {
  btn.disabled = true;

  if (index === choice && index === q.answer) {
    btn.classList.add("selected-correct");
  } else if (index === q.answer) {
    btn.classList.add("correct-answer");
  } else if (index === choice) {
    btn.classList.add("selected-wrong");
  }
});


  result.classList.remove("hidden");

  result.innerHTML = `
    <div class="${isCorrect ? "right-text" : "wrong-text"}">
      ${isCorrect ? "答對了 ✔" : "答錯了 ✖"}
    </div>

    ${isCorrect ? `
  <p>
    <strong>您的選擇：</strong>
    ✅ ${q.options[choice]}
  </p>

  <p>
    <strong>原因：</strong>
    ${cleanQuizExplainText(q.explain[choice])}
  </p>
` : `
  <p>
    <strong>您的選擇：</strong>
    ❌ ${q.options[choice]}！原因：${cleanQuizExplainText(q.explain[choice])}
  </p>

  <hr>

  <p>
    <strong>正確答案：</strong>
    ✅ ${q.options[q.answer]}！原因：${cleanQuizExplainText(q.explain[q.answer])}
  </p>
`}
  `;

  updateQuizProgress();
}

function nextQuestion() {
  if (!answered) return;

  quizIndex++;

  const questionSet = getQuestionSet();

  const result = document.getElementById("answer-explanation");
  const question = document.getElementById("quiz-question");
  const options = document.getElementById("quiz-options");

  if (!result || !question || !options) return;

  if (quizIndex >= questionSet.length) {
    question.innerHTML = "🎉 測驗完成！";
    options.innerHTML = "";

    result.classList.remove("hidden");
    result.innerHTML = `
      <div class="right-text">你的分數：${quizScore} / ${questionSet.length}</div>
      <p>可以回到衛教主題選別的主題，或回難度頁再次挑戰。</p>
    `;

    updateQuizProgress();
    return;
  }

  loadQuestion();
  updateQuizProgress();
}

/* ===== SOS ===== */

function call119() {
  window.location.href = "tel:119";
}

function findHospital() {
  window.open("https://www.google.com/maps/search/附近醫院", "_blank");
}

function findER() {
  window.open("https://www.google.com/maps/search/附近急診", "_blank");
}

/* ===== 情緒互動功能：每個心情 10 句不同祝福語 ===== */

const moodMessages = {
  "😊 心情愉悅": [
    "能開心地過一天，本身就是很棒的事。",
    "願這份好心情陪你完成今天的小目標。",
    "今天的笑容很珍貴，記得把它留給自己一點。",
    "快樂不是理所當然，是你值得擁有的禮物。",
    "把這份愉悅收藏起來，累的時候再拿出來看看。",
    "今天的你閃閃發亮，請繼續保持這份溫柔的能量。",
    "好心情會傳染，也會讓生活變得更有光。",
    "願你今天遇到的事，都比想像中順利一點。",
    "開心的時候，也別忘了謝謝努力生活的自己。",
    "願你把今天的愉悅，慢慢延續到明天。"
  ],

  "😐 壓力很大": [
    "辛苦了，先慢慢深呼吸，事情可以一件一件來。",
    "壓力很大時，不用一次把所有事情都扛起來。",
    "先處理眼前最小的一步，就已經是在前進了。",
    "你不需要立刻變好，只需要先讓自己穩下來。",
    "累的時候可以停一下，停下不是失敗，是調整。",
    "請記得，事情很多，但你也很重要。",
    "把壓力說出來一點，心裡也許會輕一些。",
    "今天先完成能完成的，其餘的慢慢來。",
    "你已經撐得很努力了，請給自己一點肯定。",
    "壓力不會永遠停在這裡，你也會慢慢走過去。"
  ],

  "😣 心情煩躁": [
    "煩躁的時候先停一下，給自己一點安靜的空間也很好。",
    "情緒很亂時，不急著做決定也沒關係。",
    "先喝口水、深呼吸，讓心慢慢降溫。",
    "煩躁不是壞事，它只是提醒你需要休息了。",
    "今天可以先遠離讓你不舒服的聲音。",
    "把步調放慢一點，你不需要立刻回到最佳狀態。",
    "給自己一點時間，情緒會慢慢過去。",
    "不舒服的感覺值得被照顧，不需要假裝沒事。",
    "先讓身體放鬆，心也會跟著鬆一點。",
    "你可以不完美，也可以有情緒，這都很正常。"
  ],

  "😴 感到疲累": [
    "今天已經努力了，記得讓身體好好休息。",
    "疲累是身體在提醒你：需要停下來充電了。",
    "不用硬撐，休息也是照顧自己的方式。",
    "你不是不夠努力，只是真的累了。",
    "今晚可以早一點睡，把力氣慢慢補回來。",
    "先放下那些急著完成的事，身體也很重要。",
    "疲累的時候，完成一件小事就很棒了。",
    "請允許自己慢一點，今天不用逼自己太緊。",
    "休息不是浪費時間，而是讓明天更有力量。",
    "願你今晚睡得安穩，醒來時輕鬆一點。"
  ],

  "😢 需要抱抱": [
    "你不是一個人，願你今天被溫柔接住。",
    "此刻的你值得被理解，也值得被好好安慰。",
    "如果今天很難，那就先抱抱自己也可以。",
    "願有人懂你的沉默，也珍惜你的努力。",
    "你可以脆弱，脆弱不代表不勇敢。",
    "有些時候，只是需要一句：你已經很棒了。",
    "願你被世界溫柔對待，也被自己溫柔對待。",
    "今天先不要責怪自己，好好陪自己一下。",
    "需要安慰的時候，不代表你不堅強。",
    "給自己一個深呼吸，像給心一個擁抱。"
  ],

  "💪 活力滿滿": [
    "把這份活力留給重要的事，也別忘了照顧自己。",
    "今天的你很有能量，適合完成一個小挑戰。",
    "活力滿滿很好，也記得適時補充水分和休息。",
    "願你的行動力，帶你靠近想完成的目標。",
    "趁著狀態好，做一件讓未來的你感謝的事吧。",
    "你的能量很亮，請把它用在值得的地方。",
    "今天很適合動一動，讓身體也一起開心。",
    "有精神的時候，也別忘了保持穩定節奏。",
    "願你今天的努力，都有漂亮的回應。",
    "把這份活力分享給生活，生活也會回應你。"
  ],

  "😌 放鬆平靜": [
    "平靜是一種很珍貴的狀態，願你把這份安穩留久一點。",
    "今天能感到安穩，就是很好的禮物。",
    "願你在平靜裡，好好聽見自己的需要。",
    "慢慢呼吸，讓這份舒服的感覺多停留一下。",
    "平靜不是什麼都沒有，而是心有了安放的地方。",
    "今天很適合整理心情，也整理一點生活。",
    "願你的心像現在這樣，溫柔又安定。",
    "把這份平靜記下來，忙碌時也能想起它。",
    "安穩的時刻值得珍惜，請好好享受。",
    "願今天的你，不慌不忙，也不委屈自己。"
  ],

  "😡 有點生氣": [
    "生氣也是一種提醒，先照顧好自己的情緒再處理事情。",
    "你可以生氣，因為你的感受是真實的。",
    "先不要急著反應，讓情緒降溫後再說也可以。",
    "生氣時深呼吸一下，保護自己也保護關係。",
    "不舒服的界線值得被看見，也值得被尊重。",
    "你的情緒不是錯，只是需要被好好整理。",
    "先離開一下現場，也是一種成熟的選擇。",
    "今天可以先把話放慢，把心照顧好。",
    "生氣代表你在乎，但你也值得平靜。",
    "願你把怒氣慢慢放下，把力量留給自己。"
  ],

  "😵 精神不佳": [
    "狀態不好也沒關係，今天可以先把步調放慢一點。",
    "精神不佳時，不用勉強自己表現得很好。",
    "先完成最重要的一件事就好，其他慢慢來。",
    "身體需要時間恢復，請不要責怪自己。",
    "喝點水、伸展一下，也許會舒服一些。",
    "今天可以簡單過，不需要太用力。",
    "狀態低落不是失敗，只是提醒你該休息了。",
    "願你慢慢找回精神，不急著逼自己。",
    "請把今天的標準放低一點，溫柔一點。",
    "能照顧自己，就是今天很重要的任務。"
  ],

  "🥳 開心興奮": [
    "這份期待很珍貴，願今天有更多值得開心的小事發生。",
    "興奮的心情很可愛，請好好享受這份期待。",
    "願你的開心不只停在此刻，也延伸到接下來的每一步。",
    "今天的你充滿期待，適合迎接新的可能。",
    "把這份快樂記住，它會成為很棒的回憶。",
    "願你期待的事，都慢慢靠近你。",
    "開心的時候，也別忘了穩穩照顧自己。",
    "這份興奮是生活送來的小禮物。",
    "願今天的好消息，比你想像中更多。",
    "帶著這份開心前進吧，你值得擁有美好的一天。"
  ]
};

let lastMoodMessageIndex = {};
let pendingNegativeMoodAssessment = false;

function selectMood(btn) {
  document.querySelectorAll(".mood-btn").forEach(b => {
    b.classList.remove("active");
  });

  btn.classList.add("active");

  const moodKey = btn.dataset.moodKey || "happy";
  selectedMood = btn.innerText.trim();
  localStorage.setItem("todayMood", selectedMood);
  localStorage.setItem("todayMoodKey", moodKey);

  const warningPanel = document.getElementById("mood-warning-panel");
  const scaleSelectPanel = document.getElementById("scale-select-panel");
  const scaleQuestionPanel = document.getElementById("scale-question-panel");
  const scaleResultPanel = document.getElementById("scale-result-panel");

  const negativeMoodKeys = ["stress", "irritated", "tired", "comfort", "angry", "low"];
  const isNegativeMood = negativeMoodKeys.includes(moodKey);

  pendingNegativeMoodAssessment = isNegativeMood;

  if (warningPanel) {
    warningPanel.style.display = isNegativeMood ? "block" : "none";
  }

  if (!isNegativeMood) {
    if (scaleSelectPanel) scaleSelectPanel.style.display = "none";
    if (scaleQuestionPanel) scaleQuestionPanel.style.display = "none";
    if (scaleResultPanel) scaleResultPanel.style.display = "none";
  }

  const popupQuestion = document.getElementById("popup-question");
  const moodPopup = document.getElementById("mood-popup");

  if (popupQuestion && moodPopup) {
    const blessing = getRandomMoodMessageByKey(moodKey);

    popupQuestion.innerHTML = `
      ${translateText("moodPopupPrefix", { mood: selectedMood })}
      <br><br>
      ${blessing}
      ${isNegativeMood ? `<br><br>${translateText("moodPopupNegative")}` : ""}
    `;

    moodPopup.classList.remove("hidden");
  }

  if (isNegativeMood && warningPanel) {
    // 等彈窗關閉後自動捲到情緒評估提醒區，避免使用者以為沒有出現。
    warningPanel.dataset.awaitingScroll = "true";
  }
}

function getRandomMoodMessageByKey(moodKey) {
  const moodBlessings = {
    zh: {
      stress: "不管今天狀態如何，願你都能好好照顧自己。",
      irritated: "情緒有點亂時，先慢下來也沒關係。",
      tired: "今天辛苦了，請允許自己好好休息。",
      comfort: "你值得被溫柔對待，也值得被好好陪伴。",
      angry: "先照顧好自己的感受，再慢慢處理事情。",
      low: "狀態不好不是失敗，只是提醒你需要休息。",
      default: "願你今天也能好好照顧自己。"
    },
    en: {
      stress: "It is okay to slow down. Please take care of yourself today.",
      irritated: "When emotions feel messy, give yourself a little space first.",
      tired: "You have done enough today. Please allow yourself to rest.",
      comfort: "You deserve kindness, comfort, and support.",
      angry: "Take care of your feelings first, then handle things slowly.",
      low: "Feeling low is not failure. It may simply mean you need rest.",
      default: "Please be gentle with yourself today."
    },
    ja: {
      stress: "今日は少しペースを落として、自分を大切にしてください。",
      irritated: "気持ちが乱れている時は、少し距離を置いても大丈夫です。",
      tired: "今日はよく頑張りました。ゆっくり休んでください。",
      comfort: "あなたは優しさと支えを受け取る価値があります。",
      angry: "まず自分の気持ちを整えてから、ゆっくり対応しましょう。",
      low: "元気が出ない日は失敗ではなく、休息が必要なサインかもしれません。",
      default: "今日も自分をやさしく大切にしてください。"
    }
  };

  const group = moodBlessings[currentLanguage] || moodBlessings.zh;
  return group[moodKey] || group.default;
}

function getRandomMoodMessage(mood) {
  const key = Object.keys(moodMessages).find(k => mood.includes(k));
  const messages = moodMessages[key];

  if (!messages || messages.length === 0) {
    return "不管今天狀態如何，願你都能好好照顧自己。";
  }

  let randomIndex;

  do {
    randomIndex = Math.floor(Math.random() * messages.length);
  } while (
    messages.length > 1 &&
    randomIndex === lastMoodMessageIndex[key]
  );

  lastMoodMessageIndex[key] = randomIndex;

  return messages[randomIndex];
}

function closeMoodPopup() {
  const moodPopup = document.getElementById("mood-popup");

  if (moodPopup) {
    moodPopup.classList.add("hidden");
  }

  const warningPanel = document.getElementById("mood-warning-panel");
  if (pendingNegativeMoodAssessment && warningPanel) {
    warningPanel.style.display = "block";
    warningPanel.classList.add("mood-warning-focus");
    setTimeout(() => {
      warningPanel.scrollIntoView({ behavior: "auto", block: "center" });
    }, 120);
  }
}

function showMoodMessage() {
  const popupMessage = document.getElementById("popup-message");
  const messagePopup = document.getElementById("message-popup");

  if (popupMessage && messagePopup) {
    popupMessage.innerHTML = getRandomMoodMessage(selectedMood);
    messagePopup.classList.remove("hidden");
  }
}

function closeMessagePopup() {
  const messagePopup = document.getElementById("message-popup");

  if (messagePopup) {
    messagePopup.classList.add("hidden");
  }
}

function showEmergencyPopup(messages) {
  const emergencyMessage = document.getElementById("emergency-message");
  const emergencyPopup = document.getElementById("emergency-popup");

  if (emergencyMessage && emergencyPopup) {
    emergencyMessage.innerHTML = messages.join("<br>");
    emergencyPopup.classList.remove("hidden");
  }
}

function closeEmergencyPopup() {
  const emergencyPopup = document.getElementById("emergency-popup");

  if (emergencyPopup) {
    emergencyPopup.classList.add("hidden");
  }
}

function emergencyCall119() {
  window.location.href = "tel:119";
}

/* ===== 圓餅圖 ===== */

function selectMetric(metric) {
  selectedMetric = metric;

  const pieResult = document.getElementById("pie-result");

  if (pieResult) {
    pieResult.innerHTML =
      `已選擇：${getMetricName(metric)}，請選擇今日分析或本月分析。`;
  }
}

function getMetricName(metric) {
  const names = {
    bmi: "BMI",
    systolic: "收縮壓",
    diastolic: "舒張壓",
    pulse: "脈搏",
    chest: "胸圍",
    waist: "腰圍",
    hip: "臀圍"
  };

  return names[metric] || metric;
}

function classifyMetric(metric, value) {
  value = Number(value);

  if (metric === "bmi") {
    if (value < 18.5 || value >= 24) return "warning";
    return "normal";
  }

  if (metric === "systolic") {
    if (value >= 180 || value <= 90) return "danger";
    if (value >= 140) return "warning";
    return "normal";
  }

  if (metric === "diastolic") {
    if (value >= 120 || value <= 50) return "danger";
    if (value >= 90 || value <= 60) return "warning";
    return "normal";
  }

  if (metric === "pulse") {
    if (value >= 140 || value <= 40) return "danger";
    if (value > 100 || value < 50) return "warning";
    return "normal";
  }

  if (metric === "waist") {
    if (value >= 90) return "warning";
    return "normal";
  }

  if (metric === "chest" || metric === "hip") {
    return "normal";
  }

  return "normal";
}

function drawMetricPie(type) {
  const canvas = document.getElementById("health-pie");

  if (!canvas) {
    alert("找不到圓餅圖畫布");
    return;
  }

  const ctx = canvas.getContext("2d");

  const history = JSON.parse(localStorage.getItem("healthHistory")) || [];

  let records = [];

  if (type === "today") {
    const today = new Date().toISOString().slice(0, 10);
    records = history.filter(item => item.date === today);
  }

  else {
    const month = new Date().toISOString().slice(0, 7);
    records = history.filter(item => item.date.startsWith(month));
  }

  let normal = 0;
  let warning = 0;
  let danger = 0;

  records.forEach(item => {
    const value = item[selectedMetric];

    if (!value) return;

    const result = classifyMetric(selectedMetric, value);

    if (result === "normal") normal++;
    if (result === "warning") warning++;
    if (result === "danger") danger++;
  });

  const total = normal + warning + danger;

  ctx.clearRect(0, 0, 320, 320);

  const pieResult = document.getElementById("pie-result");

  if (total === 0) {
    if (pieResult) {
      pieResult.innerHTML = "目前沒有足夠資料。";
    }
    return;
  }

  const values = [normal, warning, danger];
  const colors = ["#8FA27A", "#D9B56D", "#D86A6A"];

  let start = -Math.PI / 2;

  values.forEach((value, index) => {
    const angle = (value / total) * Math.PI * 2;

    ctx.beginPath();
    ctx.moveTo(160, 160);
    ctx.arc(160, 160, 120, start, start + angle);
    ctx.closePath();
    ctx.fillStyle = colors[index];
    ctx.fill();

    start += angle;
  });

  let valueText = "";

  if (type === "today") {
    const latest = records[records.length - 1];
    valueText = `今日數值：${latest[selectedMetric]}`;
  }

  else {
    const values = records
      .map(item => item[selectedMetric])
      .filter(v => v !== "" && v !== undefined);

    valueText = `本月紀錄數值：${values.join("、")}`;
  }

  if (pieResult) {
    pieResult.innerHTML =
      `${getMetricName(selectedMetric)}｜${type === "today" ? "今日分析" : "本月分析"}<br>
       ${valueText}<br><br>
       🟢 正常：${normal} 筆<br>
       🟡 需注意：${warning} 筆<br>
       🔴 危險：${danger} 筆`;
  }
}

/* ===== 衛教內容 ===== */

function showEdu(type) {
  showPage("edu-page");

  const edu = document.getElementById("edu-result");

  if (!edu) {
    alert("找不到衛教內容區塊 edu-result");
    return;
  }

  const content = {

    height: `
      <div class="report-section">
        <h3>🏥 掌握身高的健康密碼：從生長發育到防老抗衰</h3>

        <h4>一、身高發展的核心關鍵</h4>
        <ul>
          <li><b>遺傳與後天比例：</b>遺傳約影響 70%，後天的營養、睡眠、運動約影響 30%。</li>
          <li><b>健康指標意義：</b>身高是孩子發育的觀察指標，也是成年人骨骼強度與老化狀態的重要線索。</li>
          <li><b>數據連動性：</b>身高會與體重、BMI、腰圍、三圍一起評估代謝風險與慢性病風險。</li>
        </ul>

        <h4>二、兒童與青少年的成長黃金期</h4>
        <ul>
          <li>出生 1–6 個月：每年約可長高 18–22 公分。</li>
          <li>6–12 個月：每年約 14–18 公分。</li>
          <li>1 歲：約 11 公分／年。</li>
          <li>2 歲：約 8 公分／年。</li>
          <li>3 歲：約 7 公分／年。</li>
          <li>國小學齡兒童青春期前：每年約 5–6 公分。</li>
          <li>青春期：每年約 6–12 公分。</li>
          <li><b>警訊：</b>若生長曲線低於第 3 百分位，或年度增長不足 4 公分，建議就醫評估。</li>
        </ul>

        <h4>三、影響身高的四大後天因素</h4>
        <ul>
          <li><b>減少疾病干擾：</b>過敏、反覆感冒、睡眠品質差，都可能影響身體修復與生長。</li>
          <li><b>黃金睡眠時間：</b>建議晚間 10 點前入睡，幫助生長激素分泌。</li>
          <li><b>均衡足夠營養：</b>攝取蛋白質、鈣質、維生素 D、維生素 A、維生素 C、鐵、鎂、鋅。</li>
          <li><b>建議食物：</b>牛奶、豆製品、魚、蛋、瘦肉、小魚乾、黑芝麻、紫菜、牡蠣等。</li>
          <li><b>規律跳動運動：</b>跳繩、跑步、籃球等跳躍運動可刺激骨骼發展。</li>
        </ul>

        <h4>四、成年人身高的防縮警訊</h4>
        <ul>
          <li>成年人應建立自己的身高基準值，觀察老化與骨骼變化。</li>
          <li>若比年輕時矮超過 4 公分，或一年內變矮超過 2 公分，需注意骨質疏鬆或脊椎壓迫性骨折。</li>
          <li>腰圍應小於身高的一半，腰高比建議小於 0.5。</li>
        </ul>

        <h4>五、正確測量身高</h4>
        <ul>
          <li>脫鞋測量。</li>
          <li>後腳跟、臀部、肩胛骨三點貼牆。</li>
          <li>眼睛平視前方，頭部保持水平。</li>
          <li>固定時間測量，才能比較長期變化。</li>
        </ul>
      </div>
    `,

    blood: `
      <div class="report-section">
        <h3>🩺 血壓衛教：保護心臟與血管的重要防線</h3>

        <h4>一、認識血壓指標與分級</h4>
        <ul>
          <li><b>正常：</b>收縮壓 ＜120 且舒張壓 ＜80 mmHg。</li>
          <li><b>前期高血壓：</b>收縮壓 120–139 或舒張壓 80–89 mmHg。</li>
          <li><b>第一級高血壓：</b>收縮壓 140–159 或舒張壓 90–99 mmHg。</li>
          <li><b>第二級高血壓：</b>收縮壓 ≧160 或舒張壓 ≧100 mmHg。</li>
          <li>高血壓常沒有明顯症狀，但長期控制不佳可能造成中風、心臟衰竭、腎臟病與視力障礙。</li>
        </ul>

        <h4>二、正確量測血壓</h4>
        <ul>
          <li>量測前 30 分鐘避免運動、吃飯、抽菸、喝酒、咖啡或濃茶。</li>
          <li>量測前先安靜休息 5–10 分鐘。</li>
          <li>測量時不要說話，也不要翹腳。</li>
          <li>採坐姿，雙腳平放地板。</li>
          <li>手臂要有支撐，並與心臟同高。</li>
          <li>壓脈帶鬆緊以可塞入兩根手指為原則。</li>
          <li>第一次可左右手都量，之後固定量較高的那一側。</li>
        </ul>

        <h4>三、遠離高血壓的二減二多</h4>
        <ul>
          <li><b>減鹽：</b>少吃醃漬、燻製、加工食品、罐頭與高鈉調味料。</li>
          <li><b>減重：</b>維持理想體重，男性腰圍小於 90 公分，女性小於 80 公分。</li>
          <li><b>多運動：</b>散步、體操、太極拳、爬樓梯、做家事都能增加活動量。</li>
          <li><b>多量血壓：</b>定期量測並記錄，方便觀察生活習慣調整後的變化。</li>
        </ul>

        <h4>四、飲食建議</h4>
        <ul>
          <li><b>建議食用：</b>低脂奶、新鮮肉魚蛋豆、新鮮蔬菜、水果、全穀雜糧。</li>
          <li><b>避免食用：</b>培根、香腸、肉丸、泡麵、鹹餅乾、炸物、濃茶、酒精與辛辣刺激物。</li>
        </ul>

        <h4>五、居家防護注意事項</h4>
        <ul>
          <li>預防便秘，避免解便時過度用力。</li>
          <li>洗澡水溫不要過燙。</li>
          <li>保持規律作息，不熬夜。</li>
          <li>保持心情穩定，避免情緒過度起伏。</li>
          <li>不可因為感覺好轉就自行停藥，需定期回診追蹤。</li>
        </ul>
      </div>
    `,

    pulse: `
<div class="report-section">

<h3>❤️ 脈搏衛教：聽懂心臟跳動的健康語言</h3>

<p>
脈搏代表心臟收縮後推送血液時產生的血管波動，
能反映心臟節律與循環狀態。
許多人量血壓時忽略脈搏，但其實脈搏異常往往是心血管疾病的重要警訊。
</p>

<h4>一、脈搏與心血管疾病的關聯</h4>

<ul>
<li>高血壓患者常伴隨心悸、胸悶、疲倦等症狀。</li>

<li>若血壓長期控制不佳，可能造成心臟衰竭、心肌梗塞或冠狀動脈疾病。</li>

<li>異常脈搏可能與頭暈、冒汗、視力模糊、頭痛同時出現。</li>
</ul>

<h4>二、異常脈搏警訊</h4>

<ul>
<li>長期心跳過快或過慢。</li>

<li>心跳忽快忽慢、感覺漏拍。</li>

<li>若伴隨胸痛、頭暈、疲倦，應立即就醫。</li>
</ul>

<h4>三、正確測量方式</h4>

<ul>
<li>測量前休息 5–10 分鐘。</li>

<li>30 分鐘內避免咖啡、茶、酒精與抽菸。</li>

<li>坐姿測量，雙腳平放地板。</li>

<li>測量時不可說話。</li>
</ul>

<h4>四、維持穩定脈搏的方法</h4>

<ul>
<li>規律運動：散步、太極拳、體操。</li>

<li>避免熬夜與過度壓力。</li>

<li>減少濃茶、咖啡、酒精與刺激性食物。</li>

<li>保持情緒穩定與規律作息。</li>
</ul>

<h4>五、正常參考值</h4>

<ul>
<li>一般成年人安靜脈搏約 60–100 次／分鐘。</li>

<li>若長期異常或節律混亂，建議盡快就醫檢查。</li>
</ul>

</div>
`,

size: `
<div class="report-section">

<h3>📐 三圍衛教：內臟脂肪與代謝風險監控</h3>

<p>
腰圍比體重更能反映內臟脂肪堆積狀況，
也是代謝症候群與心血管疾病的重要警訊。
</p>

<h4>一、理想腰圍與體位標準</h4>

<ul>
<li>男性腰圍建議小於 90 公分。</li>

<li>女性腰圍建議小於 80 公分。</li>

<li>BMI 建議維持在 18.5–24。</li>

<li>腰圍最好小於身高的一半（腰高比 < 0.5）。</li>
</ul>

<h4>二、內臟脂肪的風險</h4>

<ul>
<li>腰圍過高會增加高血壓、中風、糖尿病與心臟病風險。</li>

<li>即使體重正常，只要腰圍過高仍屬高風險族群。</li>
</ul>

<h4>三、飲食控制原則</h4>

<ul>
<li>採低鹽、低油、高纖飲食。</li>

<li>減少香腸、火腿、罐頭、泡麵等高鈉食品。</li>

<li>少喝含糖飲料與高熱量加工食品。</li>

<li>多吃蔬菜、水果與天然食材。</li>
</ul>

<h4>四、改善腰圍的方法</h4>

<ul>
<li>規律有氧運動：散步、跳舞、慢跑、太極拳。</li>

<li>利用生活空檔增加活動量。</li>

<li>避免久坐與熬夜。</li>

<li>維持規律睡眠與正常作息。</li>
</ul>

</div>
`,

 mood: `
<div class="report-section">

<h3>😊 心情衛教：身心平衡是穩定的良藥</h3>

<p>
心理狀態與生理健康緊密相關，
壓力會影響血壓、脈搏、睡眠與免疫系統，
因此情緒管理也是健康管理的重要核心。
</p>

<h4>一、壓力與慢性病的關聯</h4>

<ul>
<li>長期高壓會使血管收縮、心跳加快。</li>

<li>可能增加高血壓、中風、心臟病風險。</li>

<li>情緒波動也可能造成血壓劇烈變化。</li>
</ul>

<h4>二、情緒壓力警訊</h4>

<ul>
<li>早晨頭痛、頭暈、疲倦。</li>

<li>心悸、冒汗、視力模糊。</li>

<li>長期失眠、焦慮或情緒低落。</li>
</ul>

<h4>三、測量前的情緒管理</h4>

<ul>
<li>量血壓前先放鬆休息 5–10 分鐘。</li>

<li>測量前 30 分鐘避免咖啡、濃茶、酒精與抽菸。</li>

<li>測量時保持安靜，不要說話。</li>
</ul>

<h4>四、穩定情緒的生活守則</h4>

<ul>
<li>保持規律作息與充足睡眠。</li>

<li>避免熬夜與過度操勞。</li>

<li>可透過散步、音樂、深呼吸舒壓。</li>

<li>適度運動有助於穩定自律神經。</li>
</ul>

<h4>五、持續追蹤與照護</h4>

<ul>
<li>可每天記錄心情變化。</li>

<li>若長期焦慮、失眠或情緒低落，建議尋求專業協助。</li>

<li>不可因感覺放鬆就自行停藥。</li>
</ul>

</div>
`,
  };

  edu.innerHTML = content[type] || `
    <div class="report-section">
      <h3>📚 衛教內容</h3>
      <p>請選擇一個項目查看衛教內容。</p>
    </div>
  `;
}

function closeEdu() {
  const eduModal = document.getElementById("eduModal");

  if (eduModal) {
    eduModal.classList.add("hidden");
  }
}

function drawMetricLine(type) {
  const canvas = document.getElementById("health-line");

  if (!canvas) {
    alert("找不到折線圖畫布");
    return;
  }

  const ctx = canvas.getContext("2d");
  const history = JSON.parse(localStorage.getItem("healthHistory")) || [];

  let records = [];

  if (type === "today") {
    const today = new Date().toISOString().slice(0, 10);
    records = history.filter(item => item.date === today);
  } else {
    const month = new Date().toISOString().slice(0, 7);
    records = history.filter(item => item.date.startsWith(month));
  }

  records = records.filter(item => {
    return item[selectedMetric] !== "" &&
           item[selectedMetric] !== undefined &&
           !isNaN(Number(item[selectedMetric]));
  });

  const resultBox = document.getElementById("line-result");

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  if (records.length === 0) {
    if (resultBox) {
      resultBox.innerHTML = "目前沒有足夠資料可以繪製折線圖。";
    }
    return;
  }

  const values = records.map(item => Number(item[selectedMetric]));
  const labels = records.map((item, index) => {
    return type === "today" ? `第 ${index + 1} 筆` : item.date.slice(5);
  });

  const padding = 55;
  const chartWidth = canvas.width - padding * 2;
  const chartHeight = canvas.height - padding * 2;

  const maxValue = Math.max(...values);
  const minValue = Math.min(...values);

  const range = maxValue - minValue || 1;

  function getX(index) {
    if (values.length === 1) {
      return padding + chartWidth / 2;
    }
    return padding + (index / (values.length - 1)) * chartWidth;
  }

  function getY(value) {
    return padding + chartHeight - ((value - minValue) / range) * chartHeight;
  }

  ctx.lineWidth = 2;
  ctx.strokeStyle = "#d8c3aa";

  ctx.beginPath();
  ctx.moveTo(padding, padding);
  ctx.lineTo(padding, padding + chartHeight);
  ctx.lineTo(padding + chartWidth, padding + chartHeight);
  ctx.stroke();

  ctx.fillStyle = "#6b4f3b";
  ctx.font = "14px Microsoft JhengHei";
  ctx.fillText(maxValue, 12, padding + 5);
  ctx.fillText(minValue, 12, padding + chartHeight);

  ctx.beginPath();
  values.forEach((value, index) => {
    const x = getX(index);
    const y = getY(value);

    if (index === 0) {
      ctx.moveTo(x, y);
    } else {
      ctx.lineTo(x, y);
    }
  });

  ctx.strokeStyle = "#8b6f5a";
  ctx.lineWidth = 4;
  ctx.stroke();

  values.forEach((value, index) => {
    const x = getX(index);
    const y = getY(value);

    ctx.beginPath();
    ctx.arc(x, y, 6, 0, Math.PI * 2);
    ctx.fillStyle = "#8b6f5a";
    ctx.fill();

    ctx.fillStyle = "#5c4635";
    ctx.font = "13px Microsoft JhengHei";
    ctx.fillText(value, x - 10, y - 12);

    ctx.fillText(labels[index], x - 18, padding + chartHeight + 25);
  });

  if (resultBox) {
    resultBox.innerHTML =
      `${getMetricName(selectedMetric)}｜${type === "today" ? "今日折線分析" : "本月折線分析"}<br>
       紀錄數值：${values.join("、")}`;
  }
}


const eduCategories = {
  firstAid: {
    title: "🚑 急救處置",
    subtitle: "學習突發狀況下的基本急救處理方式。",
    sections: [
      {
        image: "images/firstAid/cpr-aed.png",
        heading: "CPR 與 AED",
        content: "當發現有人突然倒下、沒有反應或沒有正常呼吸時，應立即啟動急救流程。先確認現場安全，輕拍患者肩膀並大聲呼叫，若沒有反應，立刻請旁人撥打 119 並取得 AED。進行 CPR 時，將雙手掌根放在兩乳頭連線中央，手肘打直，以每分鐘 100～120 次的速度按壓，深度約 5～6 公分，每次按壓後讓胸部完全回彈。AED 到達後，開啟電源並依照語音指示貼上電極片、分析心律與執行電擊。"
      },
      {
        image: "images/firstAid/choking.png",
        heading: "異物梗塞",
        content: "異物梗塞常發生在吃東西、說話或大笑時，食物或物品卡住呼吸道，導致呼吸困難。若患者仍能大聲咳嗽，應鼓勵他持續咳嗽，不要立刻拍背、灌水或催吐，以免讓異物更深入。若患者無法說話、無法咳嗽、臉色發紫或雙手抓住脖子，代表可能是嚴重呼吸道阻塞，應立即請人撥打 119。成人可站在患者身後，雙手環抱腹部，一手握拳放在肚臍上方、胸骨下方，另一手包住拳頭，快速向內、向上壓迫，直到異物排出或患者失去意識。若失去意識，應立即開始 CPR。"
      },
      {
        image: "images/firstAid/hypoglycemia.png",
        heading: "低血糖處理",
        content: "低血糖常見於糖尿病患者，也可能因延誤用餐、運動量增加、飲食不足或降血糖藥物使用後發生。症狀包括冒冷汗、手抖、心悸、頭暈、飢餓感、臉色蒼白、注意力不集中，嚴重時可能出現意識不清或抽搐。若患者意識清楚且可以吞嚥，應立即補充含糖食物或飲料，例如含糖飲料、糖果、方糖或葡萄糖錠，之後讓患者休息並觀察是否改善。若患者意識不清、無法吞嚥或正在抽搐，不能強行餵食或灌飲料，以免嗆入氣管，應立即撥打 119，並讓患者側躺保持呼吸道通暢。"
      },
      {
        image: "images/firstAid/recovery-position.png",
        heading: "失去意識但仍有呼吸",
        content: "當患者失去意識但仍有正常呼吸時，代表目前不需要立刻進行胸外按壓，但仍可能有危險，必須立即求救並持續觀察。先確認現場安全，輕拍肩膀並呼叫患者，若沒有反應，應請旁人撥打 119。接著觀察胸部是否有規律起伏，確認是否有正常呼吸。若仍有呼吸，應協助患者採取復甦姿勢，也就是讓患者側躺，使口水、嘔吐物或分泌物流出，降低嗆到與呼吸道阻塞的風險。等待救護人員期間，應持續觀察呼吸與臉色變化；若呼吸停止或變得不正常，應立即開始 CPR 並使用 AED。"
      },
      {
        image: "images/firstAid/heart-attack.png",
        heading: "心肌梗塞急救",
        content: "心肌梗塞是供應心臟的血管阻塞，造成心肌缺氧受損，屬於需要立即就醫的急症。常見症狀包括胸口壓迫感、胸痛、冒冷汗、呼吸困難、噁心、頭暈，疼痛也可能延伸到左肩、左手臂、下巴、背部或上腹部。若懷疑心肌梗塞，應立即停止活動，讓患者坐下或半坐臥休息，保持環境通風，並立刻撥打 119。不要讓患者自行開車或騎車就醫，以免途中病情惡化。等待救護人員時，應觀察患者意識與呼吸；若患者突然失去意識且沒有正常呼吸，應立即開始 CPR，並請人取得 AED 依語音指示操作。"
      }
    ]
  },

 traumaCare: {
  title: "🔥 外傷與急症處理",
  subtitle: "學習日常生活中常見外傷與突發傷害的正確處理方式。",
  sections: [
    {
      image: "images/traumaCare/burn.png",
      heading: "燒燙傷處理",
      content: "發生燒燙傷時，應立即讓患者遠離熱源，並以流動的冷水沖洗患處至少 15～20 分鐘，以降低皮膚溫度與減少傷害。若衣物黏在傷口上，不可強行撕下，應先沖水降溫後再處理。沖洗後可用乾淨紗布或乾淨布料輕輕覆蓋傷口，避免感染。不可塗抹牙膏、醬油、藥膏或偏方，也不要刺破水泡。若燒燙傷面積大、傷口位於臉部、手部、會陰部，或患者出現劇烈疼痛、意識不清等情況，應立即送醫或撥打 119。"
    },
    {
      image: "images/traumaCare/nosebleed.png",
      heading: "流鼻血處理",
      content: "流鼻血時，應讓患者保持坐姿，身體微微向前傾，避免血液倒流到喉嚨造成噁心或嗆咳。用手指輕捏鼻翼兩側，持續加壓約 10～15 分鐘，期間不要反覆放開檢查，以免影響止血。可在鼻樑或額頭處冰敷，幫助血管收縮。不可讓患者仰頭，也不要將衛生紙塞得太深。若流血超過 20 分鐘仍未停止、出血量大、因撞擊造成，或患者有頭暈、臉色蒼白等情形，應立即就醫。"
    },
    {
      image: "images/traumaCare/sprain.png",
      heading: "扭傷處理",
      content: "扭傷常發生在運動、跌倒或走路踩空時，可能出現疼痛、腫脹、瘀青或活動受限。初期處理可使用 PRICE 原則：保護受傷部位、讓患部休息、冰敷、加壓包紮、抬高患肢。冰敷每次約 15～20 分鐘，避免冰塊直接接觸皮膚，以免凍傷。受傷初期不建議熱敷、按摩或勉強活動，否則可能加重腫脹。若疼痛劇烈、無法承重、關節變形或腫脹快速增加，應盡快就醫檢查是否有骨折或韌帶嚴重受傷。"
    },
    {
      image: "images/traumaCare/snakebite.png",
      heading: "毒蛇咬傷",
      content: "被蛇咬傷後，應立即讓患者保持冷靜並停止活動，避免毒液因血液循環加快而擴散。應記住蛇的外觀特徵，但不要冒險抓蛇。可將被咬部位保持低於心臟位置，移除戒指、手錶或過緊衣物，避免腫脹後造成壓迫。不可切開傷口、吸出毒液、冰敷、喝酒或自行綁緊止血帶。應儘快撥打 119 或送醫，並告知醫護人員被咬時間、部位與蛇的特徵，以利後續治療。"
    },
    {
      image: "images/traumaCare/open-fracture.png",
      heading: "開放性骨折",
      content: "開放性骨折是指骨頭斷裂並穿出皮膚，或傷口深處可見骨骼，屬於嚴重外傷，容易出血與感染。發現疑似開放性骨折時，應立即撥打 119，不可嘗試把骨頭推回原位，也不要任意移動患者。若有出血，可用乾淨紗布或布料在傷口周圍輕壓止血，避免直接壓迫突出的骨頭。可用夾板或硬物固定受傷部位，固定時需包含受傷處上下兩端關節。等待救護人員期間，應觀察患者意識、呼吸與臉色，並注意保暖。"
    }
  ]
},

woundHomeCare: {
  title: "🩹 傷口與居家照護",
  subtitle: "了解傷口修復、感染預防與居家照護的基本原理。",
  sections: [
    {
      image: "images/woundHomeCare/wound-care.png",
      heading: "傷口照護",
      content: "傷口照護的重點是清潔、止血、覆蓋與觀察。傷口剛形成時，皮膚保護屏障被破壞，細菌容易從傷口進入體內，因此應先用流動清水沖洗，去除灰塵、砂石與髒污，降低感染機會。若有出血，可用乾淨紗布輕壓止血，原理是透過壓迫血管，幫助血液凝固形成血塊。清潔後覆蓋無菌紗布或OK繃，可以隔絕外界髒污，也能避免傷口被摩擦。照護期間需觀察是否出現紅、腫、熱、痛、流膿、異味或發燒，這些可能是感染反應，應儘快就醫。"
    },
    {
      image: "images/woundHomeCare/post-op-infection.png",
      heading: "術後傷口感染",
      content: "術後傷口是手術切開皮膚後形成的傷口，雖然醫師已縫合，但傷口癒合前仍需要保持清潔與乾燥。保持乾燥的原理是潮濕環境容易讓細菌繁殖，增加感染風險。依照醫護人員指示換藥，可以維持傷口保護層，並及早發現異常。不可自行拆線、抓癢或塗抹未經醫師指示的藥物，因為這些行為可能破壞新生組織，造成傷口裂開或感染。若傷口出現紅腫熱痛、滲液增加、流膿、異味、傷口裂開或發燒，代表身體可能正在對感染產生發炎反應，應盡快回診或就醫。"
    },
    {
      image: "images/woundHomeCare/home-safety.png",
      heading: "居家環境安全",
      content: "居家環境安全的原理是降低危險因子，減少跌倒、燙傷、割傷與中毒的機會。地板濕滑、走道雜物、光線不足與電線外露，都可能增加跌倒風險，尤其長者、幼兒與行動不便者更容易受傷。浴室因地面潮濕，是居家跌倒常見地點，因此可使用止滑墊、扶手與充足照明。尖銳物品、清潔劑、藥品與熱水壺應放在兒童不易取得的位置，因為幼兒缺乏危險判斷能力，容易誤食、誤觸或燙傷。透過整理環境與移除危險物，可以在意外發生前先降低風險。"
    },
    {
      image: "images/woundHomeCare/sleep-hygiene.png",
      heading: "睡眠衛生",
      content: "睡眠衛生是指建立有助於入睡與維持睡眠的生活習慣。人體有生理時鐘，固定時間睡覺與起床可以讓大腦形成規律節奏，幫助睡眠品質穩定。睡前長時間使用手機、平板或電腦，螢幕光線會影響褪黑激素分泌，使大腦較難進入睡眠狀態。咖啡、茶與能量飲料中的咖啡因會刺激神經系統，使心跳加快、精神變清醒，因此下午後應減少攝取。臥室保持安靜、昏暗與舒適溫度，可以降低外界刺激，讓身體更容易放鬆。良好睡眠有助於免疫功能、傷口修復與情緒穩定。"
    },
    {
      image: "images/woundHomeCare/lung-rehab.png",
      heading: "肺部復原運動",
      content: "肺部復原運動的原理是增加肺部擴張、改善換氣效率，並幫助痰液排出。術後、長期臥床或活動量不足時，呼吸可能變淺，肺部部分區域不容易完全張開，容易造成痰液堆積或肺部感染。練習深呼吸時，可慢慢用鼻子吸氣，讓胸部與腹部自然擴張，再用嘴巴慢慢吐氣，幫助肺泡打開。噘嘴呼吸則能延長吐氣時間，減少空氣滯留，對容易喘的人有幫助。運動時應量力而為，若出現胸痛、頭暈、呼吸困難加劇或嘴唇發紫，代表身體可能缺氧或負荷過大，應立即停止並就醫。"
    }
  ]
},

 tubeSwallowCare: {
  title: "🧪 管路與吞嚥照護",
  subtitle: "了解管路照護與吞嚥安全的基本原理。",
  sections: [
    {
      image: "images/tubeSwallowCare/ng-before-feeding.png",
      heading: "鼻胃管進食前檢查",
      content: "鼻胃管進食前應先確認管路位置與固定是否正確，觀察外露長度是否和原本標記一致，並檢查膠布有無鬆脫。若管路移位，灌食可能進入呼吸道，造成嗆咳或吸入性肺炎。灌食前讓患者採半坐臥或坐姿，頭部抬高約 30～45 度，可利用重力幫助食物進入胃部，減少逆流與嗆入風險。進食前也要觀察患者是否有腹脹、嘔吐、劇烈咳嗽或呼吸不順，若有異常應暫停灌食並通知醫護人員。"
    },
    {
      image: "images/tubeSwallowCare/ng-after-feeding.png",
      heading: "鼻胃管進食後照護",
      content: "鼻胃管進食後應維持半坐臥或坐姿至少 30～60 分鐘，避免胃內容物逆流到食道或咽喉。灌食後依照醫護指示用溫開水沖管，可避免營養品或藥物殘留造成阻塞，也能維持管路通暢。照護時應觀察是否有腹脹、嘔吐、咳嗽、呼吸變急或臉色改變，這些可能是逆流或誤吸的徵象。即使患者不是從口進食，也應定期清潔口腔，因為口腔細菌仍可能隨唾液進入呼吸道，增加肺炎風險。"
    },
    {
      image: "images/tubeSwallowCare/tube-fixation.png",
      heading: "管路固定",
      content: "管路固定的目的，是避免管路被拉扯、滑脫、彎折或阻塞。固定太緊可能壓迫皮膚造成紅腫、疼痛或破皮，太鬆則容易移位，影響治療效果。固定時應保留適當活動空間，並避免管路垂掛在容易被勾到的位置。翻身、移位或下床前，應先確認管路位置、長度與方向，避免壓到或拉到管路。若發現管路脫落、滲液、阻塞、疼痛或位置異常，不可自行插回或調整，應立即通知醫護人員處理。"
    },
    {
      image: "images/tubeSwallowCare/tube-infection.png",
      heading: "管路感染預防",
      content: "醫療管路會接觸皮膚、鼻腔、尿道或傷口等部位，若清潔不足，細菌可能沿管路進入體內造成感染。照護前後應確實洗手，接觸管路接頭、敷料或引流袋時更要保持清潔。管路周圍皮膚應維持乾燥，因為潮濕環境容易讓細菌繁殖，也會使皮膚變脆弱。若敷料潮濕、鬆脫或髒污，應依照醫護指示更換。若出現紅、腫、熱、痛、分泌物增加、異味、發燒或寒顫，可能代表感染，應盡快就醫。"
    },
    {
      image: "images/tubeSwallowCare/dysphagia-aspiration.png",
      heading: "吞嚥困難與吸入性肺炎",
      content: "吞嚥困難時，食物、液體或口水可能誤入氣管，造成嗆咳或吸入性肺炎。正常吞嚥時，會厭會保護氣管入口；若吞嚥反應變慢或協調不佳，食物就可能進入呼吸道。進食時應採坐姿或半坐臥，食物質地依吞嚥能力調整，例如軟質、泥狀或增稠液體。每口量不宜太多，速度要慢，吃完後也應保持直立一段時間。若常喝水嗆到、吃飯咳嗽、聲音變濕、痰變多或反覆發燒，應接受吞嚥評估。"
    }
  ]
},

  postpartumCare: {
  title: "🤱 產後照護",
  subtitle: "了解產後身體恢復、哺乳照護與安全活動的基本原理。",
  sections: [
    {
      image: "images/postpartumCare/first-urination.png",
      heading: "產後第一次下床",
      content: "產後第一次下床應先有人陪伴，動作要放慢，避免突然站起來。生產後身體失血、體力下降，加上姿勢改變時血壓可能一時下降，容易出現頭暈、冒冷汗或跌倒。下床前可先在床上活動手腳，再坐在床邊休息一會兒，確認沒有頭暈、心悸或噁心後，再慢慢站起。第一次下床通常建議由護理人員或家人陪同，避免單獨行動。若感到不舒服，應立即坐下或躺回床上，並通知護理人員。"
    },
    {
      image: "images/postpartumCare/breastfeeding-protection.png",
      heading: "產後哺乳保護",
      content: "產後哺乳時應注意正確含乳姿勢，讓寶寶含住乳頭與大部分乳暈，可減少乳頭疼痛與破皮。乳汁分泌的原理與寶寶吸吮刺激有關，吸吮越規律，越能促進泌乳。哺乳前可先洗手，保持乳房與乳頭清潔，但不需過度清洗，以免皮膚乾裂。若乳房脹痛，可先熱敷或輕柔按摩幫助乳汁流出，哺乳後若仍腫脹可冷敷減輕不適。若乳頭破皮，應檢查含乳姿勢是否正確。若出現乳房紅腫熱痛或發燒，可能是乳腺炎，應就醫處理。"
    },
    {
      image: "images/postpartumCare/postpartum-position-change.png",
      heading: "產後姿勢變換",
      content: "產後變換姿勢時應避免用力過猛，尤其剖腹產或會陰傷口尚未恢復時，更要注意動作。翻身、坐起或抱寶寶時，可利用手臂支撐身體，減少腹部與骨盆底肌肉壓力。起身時可先側躺，再用手撐床慢慢坐起，避免直接用腹部出力。正確姿勢能降低傷口牽扯與疼痛，也能避免腰痠背痛。哺乳或抱寶寶時，可使用枕頭支撐手臂與背部，減少肩頸負擔。長時間維持同一姿勢容易造成肌肉緊繃，因此可定時調整姿勢，但要以不疼痛為原則。"
    },
    {
      image: "images/postpartumCare/postpartum-activity-safety.png",
      heading: "產後活動安全",
      content: "產後活動應採循序漸進原則，先從短時間走動開始，再慢慢增加活動量。適度活動可促進血液循環，幫助腸胃蠕動，也能降低血栓風險。自然產與剖腹產恢復速度不同，活動量應依身體狀況調整，不宜勉強。產後身體仍在修復，過早搬重物、劇烈運動、久站或過度爬樓梯，可能增加出血、傷口疼痛或骨盆不適。若活動時出現頭暈、心悸、出血量增加、傷口劇烈疼痛或下腹明顯不適，應立即停止並休息，必要時通知醫護人員。"
    },
    {
      image: "images/postpartumCare/caregiver-support.png",
      heading: "產後照護者協助",
      content: "產後照護者的協助能減少產婦身心負擔，幫助身體恢復。產後荷爾蒙變化、睡眠不足與照顧新生兒壓力，可能影響情緒與體力。家人可協助準備餐食、分擔家務、照顧寶寶、協助哺乳姿勢與陪同就醫，讓產婦有足夠休息。照護者也應多傾聽產婦感受，避免責備或給予過多壓力。若產婦長時間情緒低落、焦慮、容易哭泣、失眠、食慾明顯改變，或對生活與寶寶失去興趣，可能是產後憂鬱徵象，應及早尋求專業協助。"
    }
  ]
},

chronicCare: {
  title: "🩺 慢性病居家照護",
  subtitle: "了解高血壓、糖尿病、腎臟病與心衰竭的日常照護原理。",
  sections: [
    {
      image: "images/chronicCare/hypertension.png",
      heading: "高血壓照護",
      content: "高血壓照護的重點是規律量血壓、按時服藥、減少鹽分攝取與維持良好生活習慣。血壓長期過高會增加心臟、腦血管與腎臟負擔，可能導致中風、心臟病或腎功能惡化。建議每天固定時間量血壓，並記錄數值，方便醫師評估治療效果。飲食上應減少醃漬物、加工食品與重口味料理，因為鈉含量過高會使身體留住水分，增加血管壓力。若出現劇烈頭痛、胸悶、呼吸困難或單側無力，應立即就醫。"
    },
    {
      image: "images/chronicCare/diabetic-foot.png",
      heading: "糖尿病足部照護",
      content: "糖尿病足部照護的原理是預防傷口與感染。糖尿病患者若血糖控制不佳，容易造成神經感覺變差與血液循環不良，腳部受傷時可能不容易察覺，傷口也較難癒合。每天應檢查腳底、腳趾縫與足跟是否有破皮、水泡、紅腫或變色。洗腳後要擦乾，特別是腳趾縫，避免潮濕造成感染。鞋襪應選擇合腳、柔軟、透氣的款式，避免赤腳走路。剪指甲時不可剪太深，若發現傷口久不癒合、流膿或變黑，應盡快就醫。"
    },
    {
      image: "images/chronicCare/kidney-disease.png",
      heading: "慢性腎臟病",
      content: "慢性腎臟病照護的重點是保護剩餘腎功能，延緩惡化。腎臟負責排除體內廢物、調節水分與電解質，若腎功能下降，身體可能出現水腫、疲倦、尿量改變或血壓升高。日常應控制血壓、血糖，並依照醫囑調整飲食。鹽分過多會加重水腫與高血壓，蛋白質、鉀、磷攝取也可能需要依腎功能程度調整。不可自行服用來路不明藥物或止痛藥，因為部分藥物可能傷害腎臟。若出現嚴重水腫、喘或尿量明顯減少，應就醫。"
    },
    {
      image: "images/chronicCare/kidney-diet.png",
      heading: "腎臟病高磷飲食限制",
      content: "腎臟病患者若腎功能下降，磷不容易從體內排出，血磷過高會影響鈣質平衡，可能造成骨頭脆弱、皮膚搔癢與血管鈣化。因此需要依照醫師或營養師建議限制高磷食物。常見高磷食物包括加工食品、內臟、堅果、可樂、濃湯、起司與部分全穀類食品。加工食品中的磷添加物特別容易被人體吸收，應盡量減少。若有使用降磷藥物，通常需依醫囑隨餐服用，原理是讓藥物在腸道中結合食物中的磷，減少吸收。"
    },
    {
      image: "images/chronicCare/heart-failure.png",
      heading: "心臟衰竭居家照護",
      content: "心臟衰竭是心臟無法有效把血液送到全身，容易造成水分滯留與呼吸喘。居家照護重點是每日量體重、限制鹽分、按時服藥並觀察症狀。體重短時間快速上升，可能代表體內水分累積，因此每天早上起床排尿後量體重並記錄。鹽分過多會讓身體留住水分，增加心臟負擔，所以應減少重鹹、加工與醃漬食物。若出現喘變嚴重、晚上睡覺需墊高枕頭、腳腫變明顯、體重快速增加或胸悶，應盡快就醫。"
    }
  ]
},

  nutritionCare: {
  title: "⚖️ 營養代謝",
  subtitle: "了解代謝症候群、腰圍風險、胃食道逆流、缺鐵性貧血與咖啡茶攝取的照護原理。",
  sections: [
    {
      image: "images/nutritionCare/metabolic-syndrome.png",
      heading: "代謝症候群",
      content: "代謝症候群是指血壓、血糖、血脂與腰圍等多項代謝指標異常，會增加糖尿病、心血管疾病與中風風險。其原理與胰島素阻抗、內臟脂肪過多及慢性發炎有關。照護重點是控制體重、規律運動、均衡飲食與定期檢查。飲食上應減少含糖飲料、油炸食物與精緻澱粉，多選擇蔬菜、全穀類、豆魚蛋肉類與適量水果。若能早期改善生活習慣，可降低慢性病發生機會。"
    },
    {
      image: "images/nutritionCare/waist-risk.png",
      heading: "腰圍與健康風險",
      content: "腰圍過大代表腹部脂肪較多，特別是內臟脂肪增加，會提高高血壓、高血糖、血脂異常與心血管疾病風險。內臟脂肪會影響荷爾蒙與發炎反應，使身體較容易產生胰島素阻抗。日常可定期測量腰圍，了解健康變化。改善方式包括減少高糖、高油與高熱量飲食，增加規律活動，避免久坐。即使體重沒有明顯下降，只要腰圍減少，通常也代表內臟脂肪與代謝負擔正在改善。"
    },
    {
      image: "images/nutritionCare/gerd.png",
      heading: "胃食道逆流",
      content: "胃食道逆流是胃酸或胃內容物逆流到食道，造成火燒心、胸口灼熱、酸水上來、喉嚨異物感或慢性咳嗽。其原理多與下食道括約肌閉合不良、胃壓上升或飲食刺激有關。照護上應避免吃太飽、飯後立刻躺下、睡前進食與穿太緊的衣物。咖啡、茶、巧克力、油炸食物、辛辣食物與酒精可能加重症狀。建議少量多餐，飯後至少等待 2～3 小時再平躺，睡覺時可適度墊高上半身。"
    },
    {
      image: "images/nutritionCare/iron-deficiency-anemia.png",
      heading: "缺鐵性貧血",
      content: "缺鐵性貧血是因體內鐵質不足，導致血紅素製造減少，使血液攜氧能力下降。常見症狀包括疲倦、頭暈、臉色蒼白、心悸、注意力不集中與容易喘。鐵質是製造紅血球的重要原料，因此飲食可增加含鐵食物，例如紅肉、肝臟、蛋黃、深綠色蔬菜與豆類。維生素 C 可幫助鐵吸收，可搭配水果一起食用。若醫師開立鐵劑，應依指示服用，不可自行停藥；若有黑便、胃不適或便祕，可回診討論。"
    },
    {
      image: "images/nutritionCare/caffeine-tea.png",
      heading: "茶與咖啡影響吸收",
      content: "茶與咖啡含有單寧酸、咖啡因等成分，可能影響鐵質吸收，尤其是植物性鐵質較容易受到影響。若本身有缺鐵性貧血、月經量多、懷孕或營養攝取不足，建議避免在正餐或服用鐵劑時立即喝茶、咖啡。可間隔 1～2 小時後再飲用，減少對吸收的影響。咖啡因也可能造成心悸、睡眠變差或胃食道逆流加重，因此應依個人狀況適量攝取。若有失眠、心悸或胃酸逆流，下午後可減少飲用。"
    }
  ]
},

 neuroEmergency: {
  title: "🧠 神經急症",
  subtitle: "了解腦部急症、中風、癲癇與頭部外傷觀察的基本原理。",
  sections: [
    {
      image: "images/neuroEmergency/brain-warning.png",
      heading: "腦經急危徵象",
      content: "腦部急症常與腦血流不足、出血、腦壓上升或神經功能受損有關。腦細胞對氧氣非常敏感，若血流中斷太久，可能造成不可逆的傷害。若出現突然劇烈頭痛、單側肢體無力、說話不清、視力模糊、抽搐、意識改變或持續嘔吐，可能代表腦部正在發生危急變化。這些症狀不能只靠休息觀察，因為中風、腦出血或腦壓上升都需要盡快處理。一旦出現異常神經症狀，應立即停止活動、保持安全姿勢，並撥打 119 就醫。"
    },
    {
      image: "images/neuroEmergency/stroke-fast.png",
      heading: "中風 FAST 辨識",
      content: "中風是腦部血管阻塞或破裂，造成腦細胞缺氧受損。FAST 可快速辨識中風：F 是 Face，觀察臉部是否歪斜；A 是 Arm，請患者雙手平舉，看是否有單側無力；S 是 Speech，注意說話是否含糊不清；T 是 Time，代表時間很重要，應立即撥打 119。中風治療有黃金時間，越早送醫，越有機會使用合適治療來恢復血流或控制出血。不可自行開車就醫，也不要等待症狀自行改善，因為延誤可能增加後遺症風險。"
    },
    {
      image: "images/neuroEmergency/seizure-care.png",
      heading: "癲癇發作處理",
      content: "癲癇發作是大腦神經細胞異常放電，可能造成抽搐、眼神呆滯、意識喪失或短暫失神。處理時應先保護患者安全，移開周圍尖銳或危險物品，避免撞傷。不可強壓患者肢體，因為可能造成肌肉或關節受傷；也不可把物品塞入口中，因為可能造成牙齒斷裂、口腔受傷或呼吸道阻塞。可協助患者側躺，讓口水或分泌物流出，降低嗆到風險。發作時可記錄時間與表現，若超過 5 分鐘、連續發作、受傷、懷孕或第一次發作，應立即撥打 119。"
    },
    {
      image: "images/neuroEmergency/unconscious-info.png",
      heading: "意識不清資訊",
      content: "意識不清代表大腦功能受到影響，可能原因包括低血糖、中風、頭部外傷、感染、癲癇、藥物或缺氧。照護時應先確認現場安全，觀察患者是否有正常呼吸，並立即求救。若患者仍有呼吸，可採側躺姿勢，避免舌頭後墜或嘔吐物阻塞呼吸道。等待救護人員時，應記錄患者最後清醒時間、發生過程、是否跌倒、是否服藥、有無慢性病或抽搐。這些資訊能幫助醫師判斷病因，例如是血糖問題、腦血管問題，或是藥物與感染造成的意識變化。"
    },
    {
      image: "images/neuroEmergency/child-head-injury.png",
      heading: "兒童頭部外傷觀察",
      content: "兒童頭部外傷後需觀察是否有腦震盪、顱內出血或腦壓上升。孩子跌倒或撞到頭後，若只是短暫哭鬧，但精神、活動與食慾正常，可先居家觀察。原理是部分顱內出血或腦震盪症狀可能延遲出現，因此受傷後 24～48 小時要特別注意。若出現反覆嘔吐、嗜睡叫不醒、抽搐、走路不穩、劇烈頭痛、意識改變、瞳孔大小不一或耳鼻流出透明液體，應立即就醫。觀察期間避免劇烈活動，也不要讓孩子單獨睡太久，應由成人定時查看狀況。"
    }
  ]
},

elderlyCare: {
  title: "👵 高齡照護",
  subtitle: "了解長者跌倒預防、骨質疏鬆、壓傷、失智預防與營養照護。",
  sections: [
    {
      image: "images/elderlyCare/fall-prevention.png",
      heading: "高齡跌倒預防",
      content: "高齡者跌倒常與肌力下降、平衡感變差、視力退化、慢性病或藥物副作用有關。跌倒可能造成骨折、頭部外傷或長期臥床，因此預防非常重要。居家環境應保持走道暢通，地板避免濕滑，浴室可加裝扶手與止滑墊，夜間起床路線應有足夠照明。長者起身時應放慢速度，先坐穩再站起，避免姿勢改變太快造成頭暈。規律活動與肌力訓練可增加下肢力量與平衡能力，降低跌倒風險。"
    },
    {
      image: "images/elderlyCare/osteoporosis.png",
      heading: "骨質疏鬆",
      content: "骨質疏鬆是骨密度下降、骨骼變脆弱的狀態，常見於高齡者與停經後女性。骨頭變脆後，即使只是輕微跌倒，也可能造成髖部、脊椎或手腕骨折。照護重點是補充足夠鈣質與維生素 D，並配合負重運動，例如散步、階梯訓練或肌力訓練，刺激骨骼維持強度。日常也要預防跌倒，避免搬重物或突然扭轉身體。若醫師開立骨質疏鬆藥物，應依指示規律使用，不可自行停藥。"
    },
    {
      image: "images/elderlyCare/pressure-injury.png",
      heading: "壓傷",
      content: "壓傷是皮膚長時間受壓，導致局部血液循環不良，組織缺氧而受傷，常見於長期臥床、行動不便或營養不良的長者。容易發生在尾骶部、腳跟、髖部、肩胛骨等骨頭突出的地方。照護時應定時翻身，通常每 2 小時協助改變姿勢，減少同一部位受壓。皮膚應保持清潔乾燥，若有尿布或失禁情形，要及時清潔更換。若皮膚出現持續發紅、破皮、水泡或滲液，代表可能已形成壓傷，應盡快處理或就醫。"
    },
    {
      image: "images/elderlyCare/dementia-prevention.png",
      heading: "失智預防",
      content: "失智症與腦部神經退化、血管疾病、生活型態與慢性病控制有關。雖然並非所有失智都能完全預防，但良好的生活習慣可降低風險或延緩退化。建議長者維持規律運動、均衡飲食、充足睡眠與社交互動，也可進行閱讀、拼圖、下棋、學習新事物等腦部刺激活動。控制高血壓、糖尿病與高血脂，也有助於保護腦血管健康。若出現明顯記憶力退步、重複問問題、迷路或生活能力下降，應及早就醫評估。"
    },
    {
      image: "images/elderlyCare/elderly-nutrition.png",
      heading: "高齡營養照護",
      content: "高齡者因牙口不好、食慾下降、慢性病、吞嚥困難或消化吸收變差，容易出現營養不足。營養不足會使肌肉流失、免疫力下降、傷口癒合變慢，也會增加跌倒與感染風險。飲食應重視足夠蛋白質、蔬菜、水分與適量熱量，可選擇軟質、好咀嚼且容易吞嚥的食物。若長者體重下降、食量明顯變少、常嗆咳或容易疲倦，應注意是否有營養不良或吞嚥問題。必要時可請醫師或營養師評估飲食調整。"
    }
  ]
},

medicationSafety: {
  title: "💊 用藥安全",
  subtitle: "了解正確用藥、藥物交互作用與多重用藥安全觀念。",
  sections: [
    {
      image: "images/medicationSafety/correct-medication.png",
      heading: "正確用藥觀念",
      content: "正確用藥的重點是依照醫師或藥師指示使用藥物，不自行增減劑量、不自行停藥，也不把自己的藥物給他人使用。每種藥物都有特定作用、劑量、服用時間與注意事項，若使用方式錯誤，可能降低療效或增加副作用。服藥前應確認藥名、劑量、時間、用途與保存方式。若忘記服藥，不應自行一次補吃兩倍劑量，應依藥師建議處理。若服藥後出現皮疹、呼吸困難、嚴重頭暈或異常出血，應立即就醫。"
    },
    {
      image: "images/medicationSafety/chinese-western-medicine.png",
      heading: "中藥與西藥間隔",
      content: "中藥與西藥可能會互相影響吸收、代謝或藥效，因此不建議自行混合服用。部分中草藥可能會加強或減弱西藥效果，例如影響抗凝血藥、降血壓藥、降血糖藥或鎮靜安眠藥。若同時使用中藥與西藥，應主動告知醫師與藥師，並依建議間隔服用，通常可間隔至少 1～2 小時。這樣做的原理是降低藥物在腸胃道互相干擾的機會，也方便觀察是否出現副作用。若出現頭暈、出血、低血糖或其他不適，應停止自行加藥並就醫。"
    },
    {
      image: "images/medicationSafety/antibiotics.png",
      heading: "抗生素正確使用",
      content: "抗生素是用來治療細菌感染的藥物，不能治療一般病毒感冒。使用抗生素時應依照醫師指示完成療程，不可因症狀改善就自行停藥。若過早停藥，體內部分細菌可能尚未完全被清除，容易造成感染復發，也可能增加抗藥性風險。抗藥性是指細菌逐漸變得不怕藥物，使未來治療更困難。不可自行購買、保存或分享抗生素，也不可要求醫師開立不必要的抗生素。若服藥後出現嚴重腹瀉、皮疹、過敏反應或呼吸困難，應立即就醫。"
    },
    {
      image: "images/medicationSafety/anticoagulant.png",
      heading: "抗凝血藥物注意事項",
      content: "抗凝血藥物可降低血栓形成風險，常用於心房顫動、血栓病史、人工瓣膜或中風預防等患者。但它會影響凝血功能，因此也會增加出血風險。服用期間應避免自行停藥或加量，並注意是否有牙齦出血、流鼻血不止、黑便、血尿、瘀青變多或傷口不易止血。使用其他藥物、保健食品或中草藥前，應先詢問醫師或藥師，因為可能影響抗凝血效果。若跌倒撞到頭、出現大量出血、劇烈頭痛或意識改變，應立即就醫。"
    },
    {
      image: "images/medicationSafety/polypharmacy.png",
      heading: "多重用藥安全",
      content: "多重用藥是指同時使用多種藥物，常見於高齡者或慢性病患者。藥物越多，越容易發生重複用藥、交互作用、副作用或忘記服藥。建議將所有藥物、保健食品、中草藥與外用藥整理成清單，看診時主動提供給醫師或藥師確認。不要自行混用不同醫院或不同科別開立的藥物，也不要因症狀類似就吃以前剩下的藥。可使用藥盒或服藥紀錄表協助管理時間。若出現嗜睡、頭暈、跌倒、食慾變差、意識改變或排尿異常，可能與藥物有關，應回診評估。"
    }
  ]
},
};

function showEduCategory(categoryKey) {
  const category = eduCategories[categoryKey];
  if (!category) return;

  document.getElementById("edu-title").textContent = category.title;
  document.getElementById("edu-subtitle").textContent = category.subtitle;

  const contentBox = document.getElementById("edu-content");

  contentBox.innerHTML = category.sections.map(section => {
  return `
    <div class="edu-section">
      <div class="edu-text-box">
        <h3>${section.heading}</h3>
        <p>${section.content}</p>
      </div>

      <div class="edu-image-box">
        <img src="${section.image}" alt="${section.heading}">
      </div>
    </div>
  `;
}).join("");


contentBox.innerHTML += `
  <div class="edu-action-buttons">
    <button class="quiz-btn" onclick="showPage('quiz-menu-page')">
      🧠 我讀完了，去衛教闖關
    </button>

    <button class="back-btn" onclick="showPage('edu-menu-page')">
      📚 回衛教主題
    </button>
  </div>
`;

currentEduKey = categoryKey;

if (eduReadTimer) {
  clearTimeout(eduReadTimer);
}

eduReadTimer = setTimeout(() => {
  addLearningProgressByCategory(currentEduKey);
}, 600000);

showPage("edu-page");
}


function getEduSectionIcon(heading) {
  const iconMap = {
    "CPR 與 AED": "🚑",
    "異物梗塞": "😷",
    "低血糖處理": "🍭",
    "失去意識但仍有呼吸": "🛌",
    "心肌梗塞急救": "💔",

    "燒燙傷處理": "🔥",
    "流鼻血處理": "🩸",
    "扭傷處理": "💪",
    "毒蛇咬傷": "🐍",
    "開放性骨折": "🦴",

    "傷口照護": "🩹",
    "術後傷口感染觀察": "🧴",
    "居家環境安全": "🏠",
    "睡眠衛生": "🌙",
    "肺部復原運動": "🫁",

    "鼻胃管灌食前檢查": "🥣",
    "鼻胃管灌食後照護": "💧",
    "管路固定": "📌",
    "管路感染預防": "🧼",
    "吞嚥困難與吸入性肺炎": "😷",

    "產後第一次下床": "🤱",
    "產後跌倒保護": "🧍",
    "產後姿勢變換": "🧘",
    "產後活動安全": "🚶",
    "產後照護者協助": "👩‍⚕️",

    "高血壓照護": "🩺",
    "糖尿病足部照護": "🦶",
    "慢性腎臟病": "🫘",
    "腎臟病高磷飲食限制": "🥛",
    "心臟衰竭居家照護": "💖",

    "代謝症候群": "⚖️",
    "腰圍與健康風險": "📏",
    "胃食道逆流": "🔥",
    "缺鐵性貧血飲食": "💞",
    "茶與咖啡影響鐵吸收": "☕",

    "腦震盪危險徵象": "🧠",
    "中風 FAST 辨識": "⚡",
    "癲癇發作處理": "🛡️",
    "意識不清警訊": "🚨",
    "兒童頭部外傷觀察": "👶",

    "高齡跌倒預防": "👵",
    "骨質疏鬆與骨折": "🦴",
    "壓傷預防": "🛏️",
    "失智症與走失預防": "🧭",
    "高齡營養照護": "🍽️",

    "正確用藥觀念": "💊",
    "中藥與西藥間隔": "🌿",
    "抗生素正確使用": "🦠",
    "抗凝血藥物注意事項": "🩸",
    "多重用藥安全": "📋"
  };

  return iconMap[heading] || "📌";
}

let readCount = Number(localStorage.getItem("readCount")) || 0;
let learningPoints = Number(localStorage.getItem("learningPoints")) || 0;
const totalReadCount = 50;

function addLearningProgress() {
  if (readCount < totalReadCount) {
    readCount++;
    learningPoints += 50;
  }

  localStorage.setItem("readCount", readCount);
  localStorage.setItem("learningPoints", learningPoints);

  updateLearningProgress();
}

function updateLearningProgress() {
  const readEl = document.getElementById("read-count");
  const totalEl = document.getElementById("total-read-count");
  const pointsEl = document.getElementById("learning-points");
  const fillEl = document.getElementById("learning-progress-fill");
  const percentEl = document.getElementById("learning-percent");
  const badgeEl = document.getElementById("learning-badge");

  if (!readEl || !totalEl || !pointsEl || !fillEl || !percentEl || !badgeEl) return;

  const percent = Math.round((readCount / totalReadCount) * 100);

  readEl.textContent = readCount;
  totalEl.textContent = totalReadCount;
  pointsEl.textContent = learningPoints + " P";
  fillEl.style.width = percent + "%";
  percentEl.textContent = percent + "%";

  let badge = "🌱 新手學員";

  if (readCount >= 3) badge = "⭐ 健康小達人";
  if (readCount >= 6) badge = "🏅 衛教勇士";
  if (readCount >= 10) badge = "👑 健康守護者";

  badgeEl.textContent = badge;
}

function showBadgeMessage() {
  const badge = document.getElementById("learning-badge")?.textContent || "🌱 新手學員";
  alert("目前勳章：" + badge);
}

document.addEventListener("DOMContentLoaded", updateLearningProgress);



function showPointInfo() {
  const popup = document.getElementById("point-info-popup");

  if (popup) {
    popup.classList.remove("hidden");
  }
}

function closePointInfo() {
  const popup = document.getElementById("point-info-popup");

  if (popup) {
    popup.classList.add("hidden");
  }
}

function addDailyRecordPoints() {
  const today = new Date().toISOString().slice(0, 10);
  const lastRecordPointDate = localStorage.getItem("lastRecordPointDate");

  if (lastRecordPointDate === today) {
    return;
  }

  learningPoints += 30;

  localStorage.setItem("learningPoints", learningPoints);
  localStorage.setItem("lastRecordPointDate", today);

  updateLearningProgress();
}

function addLearningProgressByCategory(categoryKey) {
  const readCategories = JSON.parse(localStorage.getItem("readCategories")) || [];

  if (readCategories.includes(categoryKey)) {
    return;
  }

  readCategories.push(categoryKey);
  localStorage.setItem("readCategories", JSON.stringify(readCategories));

  if (readCount < totalReadCount) {
    readCount++;
    learningPoints += 50;
  }

  localStorage.setItem("readCount", readCount);
  localStorage.setItem("learningPoints", learningPoints);

  updateLearningProgress();
}

function updateStreakDays() {
  const streakEl = document.getElementById("streak-days");
  if (!streakEl) return;

  const history = JSON.parse(localStorage.getItem("healthHistory")) || [];

  const dates = [...new Set(history.map(item => item.date))]
    .sort()
    .reverse();

  if (dates.length === 0) {
    streakEl.textContent = "0";
    return;
  }

  let streak = 0;
  let currentDate = new Date();

  for (let i = 0; i < dates.length; i++) {
    const targetDate = currentDate.toISOString().slice(0, 10);

    if (dates.includes(targetDate)) {
      streak++;
      currentDate.setDate(currentDate.getDate() - 1);
    } else {
      break;
    }
  }

  streakEl.textContent = streak;
}

document.addEventListener("DOMContentLoaded", updateStreakDays);





/* =========================================================
   AI 健康助理：熱門問題按鈕 + 詳細衛教回答
   這一段會取代舊版 alert / 短回答
========================================================= */

const healthQuestions = [
  {
    "icon": "",
    "title": "高血壓照護",
    "question": "高血壓照護",
    "answer": "為什麼會這樣？高血壓會讓血管長期承受較大壓力，增加中風、心臟病、腎臟病風險。平常沒有症狀也可能在傷害血管，所以規律控制很重要。 你可以怎麼做？1. 每天固定時間量血壓並記錄，避免只憑感覺判斷。2. 飲食減少鹽分、醬料、加工食品與重口味湯汁。3. 規律運動、控制體重、睡眠充足並減少熬夜。 什麼情況要就醫？血壓很高且合併胸痛、呼吸困難、劇烈頭痛、視力模糊、單側無力或意識改變，應立即就醫或打119。",
    "principle": "高血壓會讓血管長期承受較大壓力，增加中風、心臟病、腎臟病風險。平常沒有症狀也可能在傷害血管，所以規律控制很重要。",
    "steps": [
      "每天固定時間量血壓並記錄，避免只憑感覺判斷。",
      "飲食減少鹽分、醬料、加工食品與重口味湯汁。",
      "規律運動、控制體重、睡眠充足並減少熬夜。",
      "按醫囑服藥，不自行停藥或加減藥量。",
      "回診時帶血壓紀錄，讓醫師調整治療。"
    ],
    "warning": "血壓很高且合併胸痛、呼吸困難、劇烈頭痛、視力模糊、單側無力或意識改變，應立即就醫或打119。"
  },
  {
    "icon": "",
    "title": "血糖管理",
    "question": "血糖管理",
    "answer": "為什麼會這樣？血糖是身體能量來源，但長期過高會傷害血管、神經、眼睛、腎臟與足部。控制血糖需要飲食、運動、藥物與監測一起配合。 你可以怎麼做？1. 定時定量吃飯，減少含糖飲料、甜點與精緻澱粉。2. 搭配蔬菜、蛋白質與全穀類，避免單吃大量澱粉。3. 依醫囑服藥或施打胰島素，不自行停藥。 什麼情況要就醫？血糖很高合併噁心、嘔吐、嗜睡、呼吸變深快，或低血糖冒冷汗、發抖、意識不清，應立即處理並就醫。",
    "principle": "血糖是身體能量來源，但長期過高會傷害血管、神經、眼睛、腎臟與足部。控制血糖需要飲食、運動、藥物與監測一起配合。",
    "steps": [
      "定時定量吃飯，減少含糖飲料、甜點與精緻澱粉。",
      "搭配蔬菜、蛋白質與全穀類，避免單吃大量澱粉。",
      "依醫囑服藥或施打胰島素，不自行停藥。",
      "規律監測血糖，記錄飲食、運動和數值變化。",
      "外出時可準備低血糖處理用的糖包或糖果。"
    ],
    "warning": "血糖很高合併噁心、嘔吐、嗜睡、呼吸變深快，或低血糖冒冷汗、發抖、意識不清，應立即處理並就醫。"
  },
  {
    "icon": "",
    "title": "跌倒處理",
    "question": "跌倒處理",
    "answer": "為什麼會這樣？跌倒後要先確認是否有頭部、骨頭或內出血風險。立刻站起來可能讓骨折或暈眩惡化，也可能再次跌倒。 你可以怎麼做？1. 先不要急著站起來，確認意識、疼痛與是否流血。2. 若頭部撞擊，觀察頭痛、嘔吐、嗜睡、意識改變。3. 有擦傷先清洗止血，有腫痛可冰敷。 什麼情況要就醫？跌倒後意識不清、頭部外傷、嘔吐、劇痛、變形、無法站立、正在服抗凝血藥或長者跌倒，建議就醫。",
    "principle": "跌倒後要先確認是否有頭部、骨頭或內出血風險。立刻站起來可能讓骨折或暈眩惡化，也可能再次跌倒。",
    "steps": [
      "先不要急著站起來，確認意識、疼痛與是否流血。",
      "若頭部撞擊，觀察頭痛、嘔吐、嗜睡、意識改變。",
      "有擦傷先清洗止血，有腫痛可冰敷。",
      "若能活動，也要觀察 24 到 48 小時是否惡化。",
      "檢查跌倒原因，例如地面濕滑、照明不足、鞋子不合或頭暈。"
    ],
    "warning": "跌倒後意識不清、頭部外傷、嘔吐、劇痛、變形、無法站立、正在服抗凝血藥或長者跌倒，建議就醫。"
  },
  {
    "icon": "",
    "title": "用藥安全",
    "question": "用藥安全",
    "answer": "為什麼會這樣？藥物能治療疾病，但劑量、時間、交互作用和個人體質都會影響安全。正確用藥可以提高效果並降低副作用。 你可以怎麼做？1. 依照醫師或藥師指示服用，不自行加量、減量或停藥。2. 不要吃別人的藥，也不要把自己的藥分給別人。3. 看診時主動告知過敏史、懷孕、慢性病與正在服用的藥。 什麼情況要就醫？服藥後呼吸困難、臉唇舌頭腫、全身紅疹、嚴重頭暈、昏倒、黑便或大量出血，應立即就醫。",
    "principle": "藥物能治療疾病，但劑量、時間、交互作用和個人體質都會影響安全。正確用藥可以提高效果並降低副作用。",
    "steps": [
      "依照醫師或藥師指示服用，不自行加量、減量或停藥。",
      "不要吃別人的藥，也不要把自己的藥分給別人。",
      "看診時主動告知過敏史、懷孕、慢性病與正在服用的藥。",
      "抗生素要依療程完成，止痛藥不要長期自行服用。",
      "藥品保存在原包裝，注意有效期限與保存方式。"
    ],
    "warning": "服藥後呼吸困難、臉唇舌頭腫、全身紅疹、嚴重頭暈、昏倒、黑便或大量出血，應立即就醫。"
  },
  {
    "icon": "",
    "title": "傷口照護",
    "question": "傷口照護",
    "answer": "為什麼會這樣？傷口照護的原理是減少細菌、控制出血並提供適合癒合的環境。乾淨、適度覆蓋與定期觀察比塗偏方更重要。 你可以怎麼做？1. 處理前先洗手，避免把細菌帶到傷口。2. 用流動清水沖洗髒污，再用乾淨紗布輕壓止血。3. 覆蓋乾淨敷料，保持傷口清潔，依滲液程度更換。 什麼情況要就醫？傷口深、大量出血、被動物咬傷、生鏽物刺傷、紅腫擴大、流膿發燒，或糖尿病患者足部傷口，應就醫。",
    "principle": "傷口照護的原理是減少細菌、控制出血並提供適合癒合的環境。乾淨、適度覆蓋與定期觀察比塗偏方更重要。",
    "steps": [
      "處理前先洗手，避免把細菌帶到傷口。",
      "用流動清水沖洗髒污，再用乾淨紗布輕壓止血。",
      "覆蓋乾淨敷料，保持傷口清潔，依滲液程度更換。",
      "不要塗抹牙膏、醬油、草藥或不明藥膏。",
      "觀察紅腫熱痛、膿液、異味與發燒。"
    ],
    "warning": "傷口深、大量出血、被動物咬傷、生鏽物刺傷、紅腫擴大、流膿發燒，或糖尿病患者足部傷口，應就醫。"
  },
  {
    "icon": "",
    "title": "發燒處理",
    "question": "發燒處理",
    "answer": "為什麼會這樣？發燒是免疫系統對感染或發炎的反應，本身不是疾病，而是身體正在對抗問題的訊號。重點是看精神、呼吸、水分與是否有危險症狀。 你可以怎麼做？1. 多休息並少量多次補充水分，避免脫水。2. 穿著透氣衣物，不要蓋太厚或悶汗。3. 可用溫水擦拭幫助舒適，不建議用冰水或酒精擦身。 什麼情況要就醫？高燒不退、意識變差、呼吸困難、抽搐、嚴重頭痛、脖子僵硬、持續嘔吐，或長者、嬰幼兒、免疫低下者發燒，應儘快就醫。",
    "principle": "發燒是免疫系統對感染或發炎的反應，本身不是疾病，而是身體正在對抗問題的訊號。重點是看精神、呼吸、水分與是否有危險症狀。",
    "steps": [
      "多休息並少量多次補充水分，避免脫水。",
      "穿著透氣衣物，不要蓋太厚或悶汗。",
      "可用溫水擦拭幫助舒適，不建議用冰水或酒精擦身。",
      "依醫師或藥師建議使用退燒藥，不要重複吃成分相同的藥。",
      "記錄體溫、用藥時間與症狀變化。"
    ],
    "warning": "高燒不退、意識變差、呼吸困難、抽搐、嚴重頭痛、脖子僵硬、持續嘔吐，或長者、嬰幼兒、免疫低下者發燒，應儘快就醫。"
  },
  {
    "icon": "",
    "title": "感冒照護",
    "question": "感冒照護",
    "answer": "為什麼會這樣？感冒多由病毒引起，身體通常需要時間恢復。治療以休息、補水和緩解症狀為主，抗生素通常不能治療一般病毒感冒。 你可以怎麼做？1. 多休息、補充水分，避免熬夜。2. 喉嚨不適可喝溫水，避免菸味和刺激性氣味。3. 咳嗽、鼻塞或發燒可依醫師或藥師建議用藥。 什麼情況要就醫？高燒超過三天、呼吸喘、胸痛、意識變差、嚴重喉嚨痛吞嚥困難，或老人小孩慢性病患者症狀加重，應就醫。",
    "principle": "感冒多由病毒引起，身體通常需要時間恢復。治療以休息、補水和緩解症狀為主，抗生素通常不能治療一般病毒感冒。",
    "steps": [
      "多休息、補充水分，避免熬夜。",
      "喉嚨不適可喝溫水，避免菸味和刺激性氣味。",
      "咳嗽、鼻塞或發燒可依醫師或藥師建議用藥。",
      "戴口罩、勤洗手，減少傳染給他人。",
      "觀察症狀是否逐漸改善或反而惡化。"
    ],
    "warning": "高燒超過三天、呼吸喘、胸痛、意識變差、嚴重喉嚨痛吞嚥困難，或老人小孩慢性病患者症狀加重，應就醫。"
  },
  {
    "icon": "",
    "title": "咳嗽照護",
    "question": "咳嗽照護",
    "answer": "為什麼會這樣？咳嗽是身體把痰、灰塵或刺激物排出呼吸道的保護反應。感冒、過敏、空氣乾燥、胃食道逆流或氣喘都可能造成咳嗽。 你可以怎麼做？1. 多喝溫水，讓喉嚨保持濕潤，也幫助痰比較容易排出。2. 避免菸味、香水、油煙、粉塵等刺激。3. 有痰時不要自行強力止咳，先觀察痰量與顏色。 什麼情況要就醫？咳嗽超過兩週、咳血、胸痛、呼吸喘、夜間咳到無法睡、高燒不退，或老人小孩慢性病患者惡化，應就醫。",
    "principle": "咳嗽是身體把痰、灰塵或刺激物排出呼吸道的保護反應。感冒、過敏、空氣乾燥、胃食道逆流或氣喘都可能造成咳嗽。",
    "steps": [
      "多喝溫水，讓喉嚨保持濕潤，也幫助痰比較容易排出。",
      "避免菸味、香水、油煙、粉塵等刺激。",
      "有痰時不要自行強力止咳，先觀察痰量與顏色。",
      "睡覺時可稍微墊高頭部，減少鼻涕倒流或胃酸逆流。",
      "保持室內通風與適當濕度。"
    ],
    "warning": "咳嗽超過兩週、咳血、胸痛、呼吸喘、夜間咳到無法睡、高燒不退，或老人小孩慢性病患者惡化，應就醫。"
  },
  {
    "icon": "",
    "title": "呼吸喘",
    "question": "呼吸喘",
    "answer": "為什麼會這樣？呼吸喘代表身體氧氣交換可能受影響，原因可能是氣喘、肺部感染、過敏、心臟問題或焦慮。若喘到說不完整句子，就是警訊。 你可以怎麼做？1. 讓患者坐直或半坐臥，鬆開緊身衣物。2. 保持空氣流通，避免菸味、香水、粉塵等刺激。3. 若患者有醫師開立的吸入劑，協助依醫囑使用。 什麼情況要就醫？喘到無法說話、嘴唇發紫、胸痛、冒冷汗、意識不清，或吸入劑後仍未改善，請立即打119。",
    "principle": "呼吸喘代表身體氧氣交換可能受影響，原因可能是氣喘、肺部感染、過敏、心臟問題或焦慮。若喘到說不完整句子，就是警訊。",
    "steps": [
      "讓患者坐直或半坐臥，鬆開緊身衣物。",
      "保持空氣流通，避免菸味、香水、粉塵等刺激。",
      "若患者有醫師開立的吸入劑，協助依醫囑使用。",
      "觀察嘴唇是否發紫、是否冒冷汗、是否意識變差。",
      "避免讓患者平躺或大量喝水，以免更不舒服。"
    ],
    "warning": "喘到無法說話、嘴唇發紫、胸痛、冒冷汗、意識不清，或吸入劑後仍未改善，請立即打119。"
  },
  {
    "icon": "",
    "title": "胸痛警訊",
    "question": "胸痛警訊",
    "answer": "為什麼會這樣？胸痛可能來自肌肉、胃食道逆流，也可能是心肌梗塞等急症。心臟相關胸痛常有壓迫感，可能合併冒冷汗、喘、噁心或痛到左手、下巴、背部。 你可以怎麼做？1. 先停止活動，讓患者坐下或半坐臥休息。2. 觀察疼痛位置、持續時間、是否會擴散，以及有沒有冒冷汗、喘或噁心。3. 不要讓患者硬撐走路，也不要自行開車就醫。 什麼情況要就醫？胸痛超過數分鐘、合併冒冷汗、呼吸困難、昏厥、噁心，或疼痛延伸到左手臂、下巴、背部，請立即打119。",
    "principle": "胸痛可能來自肌肉、胃食道逆流，也可能是心肌梗塞等急症。心臟相關胸痛常有壓迫感，可能合併冒冷汗、喘、噁心或痛到左手、下巴、背部。",
    "steps": [
      "先停止活動，讓患者坐下或半坐臥休息。",
      "觀察疼痛位置、持續時間、是否會擴散，以及有沒有冒冷汗、喘或噁心。",
      "不要讓患者硬撐走路，也不要自行開車就醫。",
      "若患者有醫師開立的舌下含片，依原醫囑使用，不要自行給別人的藥。",
      "記下胸痛開始時間，提供救護人員或醫師判斷。"
    ],
    "warning": "胸痛超過數分鐘、合併冒冷汗、呼吸困難、昏厥、噁心，或疼痛延伸到左手臂、下巴、背部，請立即打119。"
  },
  {
    "icon": "",
    "title": "中風警訊",
    "question": "中風警訊",
    "answer": "為什麼會這樣？中風是腦部血管阻塞或破裂，腦細胞缺血缺氧會快速受損。治療非常講求時間，越早送醫越有機會降低後遺症。 你可以怎麼做？1. 用 FAST 觀察：臉是否歪、單側手是否無力、說話是否不清楚。2. 記下症狀開始的時間，這會影響醫師治療判斷。3. 讓患者安全坐下或側躺，不要餵水、餵食或給藥。 什麼情況要就醫？突然臉歪、單側無力、說話不清、視力改變、劇烈頭痛、走路不穩或意識改變，請立即打119。",
    "principle": "中風是腦部血管阻塞或破裂，腦細胞缺血缺氧會快速受損。治療非常講求時間，越早送醫越有機會降低後遺症。",
    "steps": [
      "用 FAST 觀察：臉是否歪、單側手是否無力、說話是否不清楚。",
      "記下症狀開始的時間，這會影響醫師治療判斷。",
      "讓患者安全坐下或側躺，不要餵水、餵食或給藥。",
      "不要等症狀自己好，也不要先睡覺觀察。",
      "準備患者藥物、病史與健保卡，交給救護人員。"
    ],
    "warning": "突然臉歪、單側無力、說話不清、視力改變、劇烈頭痛、走路不穩或意識改變，請立即打119。"
  },
  {
    "icon": "",
    "title": "長者照護",
    "question": "長者照護",
    "answer": "為什麼會這樣？長者身體儲備能力下降，感染、跌倒、營養不足或用藥問題可能表現得不明顯。照護重點是早期觀察變化。 你可以怎麼做？1. 注意食慾、體重、精神、睡眠與排便是否改變。2. 協助整理用藥，避免重複吃藥或漏藥。3. 保持安全動線與規律活動，減少跌倒和肌少症。 什麼情況要就醫？長者突然意識混亂、活動力明顯下降、跌倒、發燒、喘、食慾急降或無法自理，應就醫。",
    "principle": "長者身體儲備能力下降，感染、跌倒、營養不足或用藥問題可能表現得不明顯。照護重點是早期觀察變化。",
    "steps": [
      "注意食慾、體重、精神、睡眠與排便是否改變。",
      "協助整理用藥，避免重複吃藥或漏藥。",
      "保持安全動線與規律活動，減少跌倒和肌少症。",
      "鼓勵社交互動與日常參與，減少孤立。",
      "定期量血壓、追蹤慢性病並回診。"
    ],
    "warning": "長者突然意識混亂、活動力明顯下降、跌倒、發燒、喘、食慾急降或無法自理，應就醫。"
  },
  {
    "icon": "",
    "title": "浴室防跌",
    "question": "浴室防跌",
    "answer": "為什麼會這樣？浴室濕滑、空間小、起身轉身頻繁，是居家跌倒高風險地點。防跌重點是減少滑倒、增加支撐與改善照明。 你可以怎麼做？1. 地板保持乾燥，使用止滑墊。2. 馬桶旁與淋浴區加裝穩固扶手。3. 長者可使用洗澡椅，避免久站。 什麼情況要就醫？曾反覆跌倒、洗澡時頭暈胸悶、跌倒後頭部撞擊或無法站立，應就醫評估。",
    "principle": "浴室濕滑、空間小、起身轉身頻繁，是居家跌倒高風險地點。防跌重點是減少滑倒、增加支撐與改善照明。",
    "steps": [
      "地板保持乾燥，使用止滑墊。",
      "馬桶旁與淋浴區加裝穩固扶手。",
      "長者可使用洗澡椅，避免久站。",
      "洗澡水溫不要太高，避免頭暈。",
      "夜間動線加小夜燈，拖鞋要防滑合腳。"
    ],
    "warning": "曾反覆跌倒、洗澡時頭暈胸悶、跌倒後頭部撞擊或無法站立，應就醫評估。"
  },
  {
    "icon": "",
    "title": "骨折處理",
    "question": "骨折處理",
    "answer": "為什麼會這樣？骨折是骨頭斷裂或裂開，周圍血管、神經與肌肉也可能受傷。亂拉、按摩或搬動可能讓傷害更嚴重。 你可以怎麼做？1. 不要自行拉直或推回變形部位。2. 用夾板、厚紙板或毛巾固定受傷部位，減少移動。3. 可用毛巾包冰袋冰敷，每次 10 到 15 分鐘。 什麼情況要就醫？明顯變形、劇痛、無法承重、開放性傷口露骨、手腳發麻發紫，或懷疑脊椎髖部骨折，請立即就醫或打119。",
    "principle": "骨折是骨頭斷裂或裂開，周圍血管、神經與肌肉也可能受傷。亂拉、按摩或搬動可能讓傷害更嚴重。",
    "steps": [
      "不要自行拉直或推回變形部位。",
      "用夾板、厚紙板或毛巾固定受傷部位，減少移動。",
      "可用毛巾包冰袋冰敷，每次 10 到 15 分鐘。",
      "抬高患肢減少腫脹，但不要勉強移動。",
      "觀察末端手指或腳趾是否發麻、發紫或冰冷。"
    ],
    "warning": "明顯變形、劇痛、無法承重、開放性傷口露骨、手腳發麻發紫，或懷疑脊椎髖部骨折，請立即就醫或打119。"
  },
  {
    "icon": "",
    "title": "低鹽飲食",
    "question": "低鹽飲食",
    "answer": "為什麼會這樣？鹽分中的鈉會讓身體保留水分，增加血壓與心腎負擔。低鹽不是完全沒味道，而是減少鈉攝取並用天然香氣取代。 你可以怎麼做？1. 少吃泡麵、罐頭、醃漬品、香腸、火腿和重口味醬料。2. 湯汁、滷汁、醬汁不要喝完，沾醬另外放。3. 用蔥、薑、蒜、檸檬、香草、胡椒增加風味。 什麼情況要就醫？若有高血壓、心臟病、腎臟病或水腫，低鹽飲食更重要；若出現喘、水腫惡化或血壓很高，應就醫。",
    "principle": "鹽分中的鈉會讓身體保留水分，增加血壓與心腎負擔。低鹽不是完全沒味道，而是減少鈉攝取並用天然香氣取代。",
    "steps": [
      "少吃泡麵、罐頭、醃漬品、香腸、火腿和重口味醬料。",
      "湯汁、滷汁、醬汁不要喝完，沾醬另外放。",
      "用蔥、薑、蒜、檸檬、香草、胡椒增加風味。",
      "購買食品時看營養標示的鈉含量。",
      "外食可請店家少鹽、少醬、醬料分開。"
    ],
    "warning": "若有高血壓、心臟病、腎臟病或水腫，低鹽飲食更重要；若出現喘、水腫惡化或血壓很高，應就醫。"
  },
  {
    "icon": "",
    "title": "均衡飲食",
    "question": "均衡飲食",
    "answer": "為什麼會這樣？身體需要澱粉、蛋白質、脂肪、維生素、礦物質與水分。長期偏食會讓能量、免疫力與肌肉量受到影響。 你可以怎麼做？1. 每餐盡量有蔬菜、蛋白質和全穀雜糧。2. 蛋白質可輪替豆類、魚、蛋、肉和乳品。3. 水果適量，不用果汁取代完整水果。 什麼情況要就醫？若出現體重快速下降、食慾長期變差、吞嚥困難、反覆腹瀉或營養不良，建議就醫或諮詢營養師。",
    "principle": "身體需要澱粉、蛋白質、脂肪、維生素、礦物質與水分。長期偏食會讓能量、免疫力與肌肉量受到影響。",
    "steps": [
      "每餐盡量有蔬菜、蛋白質和全穀雜糧。",
      "蛋白質可輪替豆類、魚、蛋、肉和乳品。",
      "水果適量，不用果汁取代完整水果。",
      "少吃油炸、甜食、含糖飲料和高度加工食品。",
      "若有糖尿病、腎臟病或高血壓，飲食需依個別狀況調整。"
    ],
    "warning": "若出現體重快速下降、食慾長期變差、吞嚥困難、反覆腹瀉或營養不良，建議就醫或諮詢營養師。"
  },
  {
    "icon": "",
    "title": "喝水建議",
    "question": "喝水建議",
    "answer": "為什麼會這樣？水分幫助體溫調節、排尿、排便與循環。需要多少水會受天氣、活動量、疾病與藥物影響。 你可以怎麼做？1. 一般可觀察尿液顏色，太深可能代表水分不足。2. 少量多次喝水，避免一次灌大量水。3. 運動、流汗、發燒或腹瀉時通常需要增加水分。 什麼情況要就醫？尿量明顯變少、頭暈、口乾嚴重、意識變差，或水腫喘變嚴重，應就醫評估。",
    "principle": "水分幫助體溫調節、排尿、排便與循環。需要多少水會受天氣、活動量、疾病與藥物影響。",
    "steps": [
      "一般可觀察尿液顏色，太深可能代表水分不足。",
      "少量多次喝水，避免一次灌大量水。",
      "運動、流汗、發燒或腹瀉時通常需要增加水分。",
      "少用含糖飲料、咖啡或酒精取代水。",
      "有心臟病、腎臟病或水腫者，水分需依醫囑限制。"
    ],
    "warning": "尿量明顯變少、頭暈、口乾嚴重、意識變差，或水腫喘變嚴重，應就醫評估。"
  },
  {
    "icon": "",
    "title": "便秘照護",
    "question": "便秘照護",
    "answer": "為什麼會這樣？便秘通常與水分不足、纖維不足、活動少、作息改變或藥物有關。腸道需要足夠水分、纖維與規律刺激才能順暢。 你可以怎麼做？1. 增加蔬菜、水果、燕麥、全穀和豆類等纖維。2. 水分要足夠，否則纖維可能讓便秘更不舒服。3. 每天固定時間上廁所，不要長期忍便。 什麼情況要就醫？便秘合併劇烈腹痛、嘔吐、血便、體重下降、突然排便習慣改變，或多天完全無法排便排氣，應就醫。",
    "principle": "便秘通常與水分不足、纖維不足、活動少、作息改變或藥物有關。腸道需要足夠水分、纖維與規律刺激才能順暢。",
    "steps": [
      "增加蔬菜、水果、燕麥、全穀和豆類等纖維。",
      "水分要足夠，否則纖維可能讓便秘更不舒服。",
      "每天固定時間上廁所，不要長期忍便。",
      "增加走路或溫和活動，促進腸蠕動。",
      "不要長期自行依賴瀉藥，應找原因。"
    ],
    "warning": "便秘合併劇烈腹痛、嘔吐、血便、體重下降、突然排便習慣改變，或多天完全無法排便排氣，應就醫。"
  },
  {
    "icon": "",
    "title": "嘔吐處理",
    "question": "嘔吐處理",
    "answer": "為什麼會這樣？嘔吐是身體排出胃內容物的反應，可能來自腸胃炎、食物中毒、暈眩、懷孕、藥物或腦部問題。持續嘔吐最怕脫水與電解質失衡。 你可以怎麼做？1. 先暫停大量進食，讓胃休息。2. 清醒時少量多次喝水或電解質液。3. 嘔吐後先漱口，避免胃酸刺激牙齒與喉嚨。 什麼情況要就醫？無法喝水、尿量明顯減少、吐血、劇烈頭痛、意識改變、嚴重腹痛或持續嘔吐，應就醫。",
    "principle": "嘔吐是身體排出胃內容物的反應，可能來自腸胃炎、食物中毒、暈眩、懷孕、藥物或腦部問題。持續嘔吐最怕脫水與電解質失衡。",
    "steps": [
      "先暫停大量進食，讓胃休息。",
      "清醒時少量多次喝水或電解質液。",
      "嘔吐後先漱口，避免胃酸刺激牙齒與喉嚨。",
      "症狀稍緩後從清淡食物開始。",
      "觀察尿量、精神、腹痛與是否有血。"
    ],
    "warning": "無法喝水、尿量明顯減少、吐血、劇烈頭痛、意識改變、嚴重腹痛或持續嘔吐，應就醫。"
  },
  {
    "icon": "",
    "title": "吞嚥照護",
    "question": "吞嚥照護",
    "answer": "為什麼會這樣？吞嚥困難會讓食物或水誤入氣管，造成嗆咳與吸入性肺炎。中風、失智、老化或神經疾病都可能影響吞嚥。 你可以怎麼做？1. 進食時坐直，吃完後維持坐姿 30 分鐘。2. 小口慢慢吃，避免邊吃邊說話。3. 依評估調整食物質地，如軟質、泥狀或增稠液。 什麼情況要就醫？常嗆咳、反覆肺炎、喝水會咳、體重下降、吞嚥疼痛或聲音濕濕的，應請醫師或語言治療師評估。",
    "principle": "吞嚥困難會讓食物或水誤入氣管，造成嗆咳與吸入性肺炎。中風、失智、老化或神經疾病都可能影響吞嚥。",
    "steps": [
      "進食時坐直，吃完後維持坐姿 30 分鐘。",
      "小口慢慢吃，避免邊吃邊說話。",
      "依評估調整食物質地，如軟質、泥狀或增稠液。",
      "若咳嗽或聲音變濕，先暫停進食。",
      "保持口腔清潔，降低吸入細菌風險。"
    ],
    "warning": "常嗆咳、反覆肺炎、喝水會咳、體重下降、吞嚥疼痛或聲音濕濕的，應請醫師或語言治療師評估。"
  },
  {
    "icon": "",
    "title": "臥床照護",
    "question": "臥床照護",
    "answer": "為什麼會這樣？臥床者活動少，容易出現壓瘡、肺部感染、便秘、肌肉萎縮與關節僵硬。照護重點是翻身、清潔、營養與活動。 你可以怎麼做？1. 每 2 小時協助翻身，減少同一處長時間受壓。2. 保持皮膚清潔乾燥，尿布或床單濕了要更換。3. 觀察骨突處如尾椎、腳跟、髖部是否發紅。 什麼情況要就醫？出現壓瘡破皮、發燒、呼吸喘、痰變多、食慾明顯下降或意識改變，應就醫。",
    "principle": "臥床者活動少，容易出現壓瘡、肺部感染、便秘、肌肉萎縮與關節僵硬。照護重點是翻身、清潔、營養與活動。",
    "steps": [
      "每 2 小時協助翻身，減少同一處長時間受壓。",
      "保持皮膚清潔乾燥，尿布或床單濕了要更換。",
      "觀察骨突處如尾椎、腳跟、髖部是否發紅。",
      "協助被動關節活動，減少僵硬。",
      "注意營養與水分，蛋白質不足會影響傷口癒合。"
    ],
    "warning": "出現壓瘡破皮、發燒、呼吸喘、痰變多、食慾明顯下降或意識改變，應就醫。"
  },
  {
    "icon": "",
    "title": "壓瘡預防",
    "question": "壓瘡預防",
    "answer": "為什麼會這樣？壓瘡是皮膚和深層組織長時間受壓，血流不足造成損傷。常見在尾椎、腳跟、髖部等骨頭突出的地方。 你可以怎麼做？1. 定時翻身，不要讓同一部位長時間受壓。2. 使用減壓墊或氣墊床，但仍要翻身。3. 保持皮膚乾燥，避免尿液、汗水長時間刺激。 什麼情況要就醫？皮膚發紅不退、破皮、水泡、黑色壞死、滲液或有臭味，應及早就醫或請傷口護理專業評估。",
    "principle": "壓瘡是皮膚和深層組織長時間受壓，血流不足造成損傷。常見在尾椎、腳跟、髖部等骨頭突出的地方。",
    "steps": [
      "定時翻身，不要讓同一部位長時間受壓。",
      "使用減壓墊或氣墊床，但仍要翻身。",
      "保持皮膚乾燥，避免尿液、汗水長時間刺激。",
      "補充足夠蛋白質與熱量，幫助皮膚修復。",
      "每天檢查皮膚是否持續發紅、破皮或水泡。"
    ],
    "warning": "皮膚發紅不退、破皮、水泡、黑色壞死、滲液或有臭味，應及早就醫或請傷口護理專業評估。"
  },
  {
    "icon": "",
    "title": "口腔清潔",
    "question": "口腔清潔",
    "answer": "為什麼會這樣？口腔細菌可能造成蛀牙、牙周病，也可能增加長者吸入性肺炎風險。清潔口腔不只是牙齒，也包含牙齦、舌頭與假牙。 你可以怎麼做？1. 每天至少清潔牙齒兩次，飯後可漱口。2. 使用軟毛牙刷，輕刷牙齦邊緣和舌苔。3. 假牙每天取下清潔，睡覺時依牙醫建議處理。 什麼情況要就醫？牙齦出血不止、牙痛腫脹、口腔潰瘍久不癒、吞嚥疼痛或疑似感染，應就醫或看牙科。",
    "principle": "口腔細菌可能造成蛀牙、牙周病，也可能增加長者吸入性肺炎風險。清潔口腔不只是牙齒，也包含牙齦、舌頭與假牙。",
    "steps": [
      "每天至少清潔牙齒兩次，飯後可漱口。",
      "使用軟毛牙刷，輕刷牙齦邊緣和舌苔。",
      "假牙每天取下清潔，睡覺時依牙醫建議處理。",
      "臥床者清潔時頭側向一邊，避免嗆到。",
      "定期牙科檢查，調整不合的假牙。"
    ],
    "warning": "牙齦出血不止、牙痛腫脹、口腔潰瘍久不癒、吞嚥疼痛或疑似感染，應就醫或看牙科。"
  },
  {
    "icon": "",
    "title": "聽力照護",
    "question": "聽力照護",
    "answer": "為什麼會這樣？聽力下降會影響溝通、情緒與安全，也可能增加跌倒與認知負擔。許多聽力問題可以透過評估改善。 你可以怎麼做？1. 與長者說話時面對面、放慢速度，不要隔房大喊。2. 減少電視或環境噪音，讓對話更清楚。3. 避免自行掏耳太深，以免傷到耳道。 什麼情況要就醫？突然單側聽力下降、耳痛流膿、嚴重暈眩、耳鳴劇烈或聽力快速惡化，應就醫。",
    "principle": "聽力下降會影響溝通、情緒與安全，也可能增加跌倒與認知負擔。許多聽力問題可以透過評估改善。",
    "steps": [
      "與長者說話時面對面、放慢速度，不要隔房大喊。",
      "減少電視或環境噪音，讓對話更清楚。",
      "避免自行掏耳太深，以免傷到耳道。",
      "若使用助聽器，要定期清潔與檢查電池。",
      "安排耳鼻喉科或聽力檢查，找出原因。"
    ],
    "warning": "突然單側聽力下降、耳痛流膿、嚴重暈眩、耳鳴劇烈或聽力快速惡化，應就醫。"
  },
  {
    "icon": "",
    "title": "視力照護",
    "question": "視力照護",
    "answer": "為什麼會這樣？視力變化可能來自老花、白內障、青光眼、糖尿病視網膜病變或黃斑部問題。早期檢查能避免延誤。 你可以怎麼做？1. 閱讀時保持足夠光線，避免長時間近距離用眼。2. 每 30 到 40 分鐘讓眼睛休息，看遠方。3. 糖尿病、高血壓患者要定期眼科檢查。 什麼情況要就醫？突然視力下降、看東西變形、眼痛紅眼、看到閃光或黑影飄動增加，應儘快看眼科。",
    "principle": "視力變化可能來自老花、白內障、青光眼、糖尿病視網膜病變或黃斑部問題。早期檢查能避免延誤。",
    "steps": [
      "閱讀時保持足夠光線，避免長時間近距離用眼。",
      "每 30 到 40 分鐘讓眼睛休息，看遠方。",
      "糖尿病、高血壓患者要定期眼科檢查。",
      "眼藥水依醫囑使用，不共用他人眼藥。",
      "家中改善照明，減少因看不清而跌倒。"
    ],
    "warning": "突然視力下降、看東西變形、眼痛紅眼、看到閃光或黑影飄動增加，應儘快看眼科。"
  },
  {
    "icon": "",
    "title": "睡眠照護",
    "question": "睡眠照護",
    "answer": "為什麼會這樣？睡眠會影響免疫力、情緒、記憶與身體修復。失眠常與壓力、作息不規律、咖啡因、手機使用或疾病有關。 你可以怎麼做？1. 固定起床時間，比只固定睡覺時間更重要。2. 睡前 1 小時減少手機、工作和刺激性內容。3. 下午後少喝咖啡、濃茶或能量飲料。 什麼情況要就醫？失眠持續數週、明顯影響上課工作、合併憂鬱焦慮、打鼾窒息感或白天嗜睡嚴重，應就醫評估。",
    "principle": "睡眠會影響免疫力、情緒、記憶與身體修復。失眠常與壓力、作息不規律、咖啡因、手機使用或疾病有關。",
    "steps": [
      "固定起床時間，比只固定睡覺時間更重要。",
      "睡前 1 小時減少手機、工作和刺激性內容。",
      "下午後少喝咖啡、濃茶或能量飲料。",
      "白天適度活動，午睡不要太久。",
      "把床留給睡覺，避免在床上滑手機或工作太久。"
    ],
    "warning": "失眠持續數週、明顯影響上課工作、合併憂鬱焦慮、打鼾窒息感或白天嗜睡嚴重，應就醫評估。"
  },
  {
    "icon": "",
    "title": "焦慮情緒",
    "question": "焦慮情緒",
    "answer": "為什麼會這樣？焦慮是身體面對壓力時的警報系統，會讓心跳變快、肌肉緊繃、擔心變多。適度焦慮有保護作用，但過度會影響生活。 你可以怎麼做？1. 先把注意力放回呼吸，慢慢吸氣、吐氣，讓身體降速。2. 把擔心寫下來，分成可控制和不可控制兩類。3. 減少咖啡因與熬夜，這些會放大焦慮感。 什麼情況要就醫？焦慮持續影響睡眠、食慾、上課工作，出現恐慌發作，或有傷害自己的想法，請儘快尋求心理或醫療協助。",
    "principle": "焦慮是身體面對壓力時的警報系統，會讓心跳變快、肌肉緊繃、擔心變多。適度焦慮有保護作用，但過度會影響生活。",
    "steps": [
      "先把注意力放回呼吸，慢慢吸氣、吐氣，讓身體降速。",
      "把擔心寫下來，分成可控制和不可控制兩類。",
      "減少咖啡因與熬夜，這些會放大焦慮感。",
      "找可信任的人說說目前壓力，不要獨自撐著。",
      "每天安排短時間散步或伸展，幫助身體釋放緊繃。"
    ],
    "warning": "焦慮持續影響睡眠、食慾、上課工作，出現恐慌發作，或有傷害自己的想法，請儘快尋求心理或醫療協助。"
  },
  {
    "icon": "",
    "title": "憂鬱警訊",
    "question": "憂鬱警訊",
    "answer": "為什麼會這樣？憂鬱不只是心情不好，可能影響睡眠、食慾、注意力、動力和自我價值感。若持續超過兩週，需要認真看待。 你可以怎麼做？1. 觀察是否長時間失去興趣、疲倦、睡不好或吃不下。2. 把每天要做的事拆小，先完成一件簡單的事。3. 維持基本作息、洗澡、進食與出門曬光。 什麼情況要就醫？若有自傷、自殺想法，覺得活不下去，或已計畫傷害自己，請立即找身邊的人陪伴並撥打當地緊急電話或就醫。",
    "principle": "憂鬱不只是心情不好，可能影響睡眠、食慾、注意力、動力和自我價值感。若持續超過兩週，需要認真看待。",
    "steps": [
      "觀察是否長時間失去興趣、疲倦、睡不好或吃不下。",
      "把每天要做的事拆小，先完成一件簡單的事。",
      "維持基本作息、洗澡、進食與出門曬光。",
      "告訴可信任的人你的狀況，不要獨自承受。",
      "尋求輔導、心理師、身心科或醫療協助是有效的做法。"
    ],
    "warning": "若有自傷、自殺想法，覺得活不下去，或已計畫傷害自己，請立即找身邊的人陪伴並撥打當地緊急電話或就醫。"
  },
  {
    "icon": "",
    "title": "壓力調適",
    "question": "壓力調適",
    "answer": "為什麼會這樣？壓力會啟動身體的警覺反應，短期能幫助應付挑戰，但長期過高會影響睡眠、腸胃、免疫與情緒。 你可以怎麼做？1. 先找出壓力來源，寫下目前最困擾的三件事。2. 把事情分成今天能做、需要協助、暫時無法控制。3. 安排固定休息，不等到崩潰才停下。 什麼情況要就醫？壓力造成長期失眠、胸悶心悸、恐慌、情緒失控、無法上課工作，或出現自傷想法，應尋求專業協助。",
    "principle": "壓力會啟動身體的警覺反應，短期能幫助應付挑戰，但長期過高會影響睡眠、腸胃、免疫與情緒。",
    "steps": [
      "先找出壓力來源，寫下目前最困擾的三件事。",
      "把事情分成今天能做、需要協助、暫時無法控制。",
      "安排固定休息，不等到崩潰才停下。",
      "用深呼吸、伸展、散步或音樂讓身體放鬆。",
      "建立支持系統，找同學、家人、老師或專業人員討論。"
    ],
    "warning": "壓力造成長期失眠、胸悶心悸、恐慌、情緒失控、無法上課工作，或出現自傷想法，應尋求專業協助。"
  },
  {
    "icon": "",
    "title": "運動建議",
    "question": "運動建議",
    "answer": "為什麼會這樣？運動能改善心肺、肌力、血糖、血壓、睡眠與情緒。重點是從安全可持續的強度開始，而不是一次做太多。 你可以怎麼做？1. 先從每天 10 到 15 分鐘散步開始，逐漸增加。2. 每週可搭配有氧、肌力和伸展。3. 運動前暖身，運動後緩和，減少受傷。 什麼情況要就醫？運動時胸痛、喘不過氣、頭暈快昏倒、心悸明顯、關節劇痛或跌倒受傷，應停止並就醫。",
    "principle": "運動能改善心肺、肌力、血糖、血壓、睡眠與情緒。重點是從安全可持續的強度開始，而不是一次做太多。",
    "steps": [
      "先從每天 10 到 15 分鐘散步開始，逐漸增加。",
      "每週可搭配有氧、肌力和伸展。",
      "運動前暖身，運動後緩和，減少受傷。",
      "慢性病患者依醫師建議調整強度。",
      "出現不舒服時立即停止，不要硬撐。"
    ],
    "warning": "運動時胸痛、喘不過氣、頭暈快昏倒、心悸明顯、關節劇痛或跌倒受傷，應停止並就醫。"
  },
  {
    "icon": "",
    "title": "膝蓋疼痛",
    "question": "膝蓋疼痛",
    "answer": "為什麼會這樣？膝蓋疼痛可能來自退化、韌帶拉傷、半月板受傷、肌力不足或過度使用。處理重點是先減少刺激，再判斷是否需要檢查。 你可以怎麼做？1. 急性疼痛或腫脹時先休息，避免跑跳、蹲跪和上下樓太多。2. 可冰敷 10 到 15 分鐘，減少腫脹與疼痛。3. 穿支撐性較好的鞋，避免長時間站立。 什麼情況要就醫？膝蓋明顯腫脹、變形、無法承重、發熱發紅、外傷後劇痛，或疼痛持續影響行走，應就醫。",
    "principle": "膝蓋疼痛可能來自退化、韌帶拉傷、半月板受傷、肌力不足或過度使用。處理重點是先減少刺激，再判斷是否需要檢查。",
    "steps": [
      "急性疼痛或腫脹時先休息，避免跑跳、蹲跪和上下樓太多。",
      "可冰敷 10 到 15 分鐘，減少腫脹與疼痛。",
      "穿支撐性較好的鞋，避免長時間站立。",
      "平時可做溫和大腿肌力訓練，但疼痛時不要勉強。",
      "記錄疼痛位置、是否卡住、是否有聲響或無力。"
    ],
    "warning": "膝蓋明顯腫脹、變形、無法承重、發熱發紅、外傷後劇痛，或疼痛持續影響行走，應就醫。"
  },
  {
    "icon": "",
    "title": "足部照護",
    "question": "足部照護",
    "answer": "為什麼會這樣？足部承受全身重量，血液循環、神經感覺與鞋子壓迫都會影響健康。糖尿病患者更容易因小傷口變成嚴重感染。 你可以怎麼做？1. 每天檢查腳底、腳趾縫有沒有傷口、水泡或紅腫。2. 保持足部乾爽，洗腳後擦乾趾縫。3. 選擇合腳、防滑、有支撐性的鞋子。 什麼情況要就醫？足部傷口不癒合、紅腫熱痛、流膿、發黑、麻木刺痛，或糖尿病患者出現任何足部破皮，應儘快就醫。",
    "principle": "足部承受全身重量，血液循環、神經感覺與鞋子壓迫都會影響健康。糖尿病患者更容易因小傷口變成嚴重感染。",
    "steps": [
      "每天檢查腳底、腳趾縫有沒有傷口、水泡或紅腫。",
      "保持足部乾爽，洗腳後擦乾趾縫。",
      "選擇合腳、防滑、有支撐性的鞋子。",
      "不要自行修剪太深的指甲或硬皮。",
      "糖尿病患者避免赤腳走路，足部傷口要特別注意。"
    ],
    "warning": "足部傷口不癒合、紅腫熱痛、流膿、發黑、麻木刺痛，或糖尿病患者出現任何足部破皮，應儘快就醫。"
  },
  {
    "icon": "",
    "title": "水腫照護",
    "question": "水腫照護",
    "answer": "為什麼會這樣？水腫是液體累積在組織中，常見於久站、靜脈循環差，也可能與心臟、腎臟、肝臟或藥物有關。 你可以怎麼做？1. 觀察水腫位置、是否單側、是否按壓會凹陷。2. 避免久坐久站，休息時可抬高下肢。3. 減少高鹽飲食，避免湯汁、醃製品和加工食品。 什麼情況要就醫？單側腳突然腫痛、合併喘或胸痛、體重快速增加、尿量減少，或水腫持續惡化，應就醫。",
    "principle": "水腫是液體累積在組織中，常見於久站、靜脈循環差，也可能與心臟、腎臟、肝臟或藥物有關。",
    "steps": [
      "觀察水腫位置、是否單側、是否按壓會凹陷。",
      "避免久坐久站，休息時可抬高下肢。",
      "減少高鹽飲食，避免湯汁、醃製品和加工食品。",
      "不要自行吃利尿劑或偏方消水腫。",
      "記錄體重變化與尿量，提供醫師判斷。"
    ],
    "warning": "單側腳突然腫痛、合併喘或胸痛、體重快速增加、尿量減少，或水腫持續惡化，應就醫。"
  },
  {
    "icon": "",
    "title": "中暑處理",
    "question": "中暑處理",
    "answer": "為什麼會這樣？中暑是身體散熱失敗，體溫過高會傷害腦部、腎臟與循環系統。熱環境下出現意識改變是危險徵象。 你可以怎麼做？1. 立即離開高溫環境，移到陰涼通風處。2. 鬆開衣物，用濕毛巾、搧風或冰袋放在頸部、腋下、鼠蹊部降溫。3. 若清醒可少量多次補充水分或電解質。 什麼情況要就醫？體溫很高、意識混亂、昏倒、抽搐、停止流汗或持續嘔吐，請立即打119。",
    "principle": "中暑是身體散熱失敗，體溫過高會傷害腦部、腎臟與循環系統。熱環境下出現意識改變是危險徵象。",
    "steps": [
      "立即離開高溫環境，移到陰涼通風處。",
      "鬆開衣物，用濕毛巾、搧風或冰袋放在頸部、腋下、鼠蹊部降溫。",
      "若清醒可少量多次補充水分或電解質。",
      "不要讓意識不清者喝水，以免嗆到。",
      "記錄發生時間與環境，等待救援時持續降溫。"
    ],
    "warning": "體溫很高、意識混亂、昏倒、抽搐、停止流汗或持續嘔吐，請立即打119。"
  },
  {
    "icon": "",
    "title": "低體溫",
    "question": "低體溫",
    "answer": "為什麼會這樣？低體溫是核心體溫過低，會讓心跳、呼吸與意識變慢。長者、嬰幼兒、酒後、營養不良或長時間處在寒冷環境者風險較高。 你可以怎麼做？1. 移到溫暖處，脫掉濕衣物並擦乾身體。2. 用毯子包覆軀幹、頭頸部，先保暖核心部位。3. 若清醒可喝溫熱飲品，但不要喝酒。 什麼情況要就醫？意識不清、呼吸變慢、皮膚冰冷、顫抖停止、心跳很慢，或長者低溫後精神變差，請立即就醫或打119。",
    "principle": "低體溫是核心體溫過低，會讓心跳、呼吸與意識變慢。長者、嬰幼兒、酒後、營養不良或長時間處在寒冷環境者風險較高。",
    "steps": [
      "移到溫暖處，脫掉濕衣物並擦乾身體。",
      "用毯子包覆軀幹、頭頸部，先保暖核心部位。",
      "若清醒可喝溫熱飲品，但不要喝酒。",
      "避免用熱水直接沖泡四肢，可能造成血壓變化。",
      "持續觀察呼吸、意識與顫抖情形。"
    ],
    "warning": "意識不清、呼吸變慢、皮膚冰冷、顫抖停止、心跳很慢，或長者低溫後精神變差，請立即就醫或打119。"
  },
  {
    "icon": "",
    "title": "燙傷處理",
    "question": "燙傷處理",
    "answer": "為什麼會這樣？燙傷會讓皮膚組織受熱受損，早期用流動冷水降溫可以減少熱繼續往深層傷害。正確降溫比塗偏方更重要。 你可以怎麼做？1. 立即用流動自來水沖 15 到 20 分鐘。2. 移除戒指、手錶等束縛物，但不要硬撕黏住皮膚的衣物。3. 用乾淨紗布或布輕蓋保護，不要刺破水泡。 什麼情況要就醫？臉部、手腳、會陰、關節處燙傷，面積大、起大水泡、皮膚發白焦黑、幼兒或長者燙傷，應就醫；嚴重者打119。",
    "principle": "燙傷會讓皮膚組織受熱受損，早期用流動冷水降溫可以減少熱繼續往深層傷害。正確降溫比塗偏方更重要。",
    "steps": [
      "立即用流動自來水沖 15 到 20 分鐘。",
      "移除戒指、手錶等束縛物，但不要硬撕黏住皮膚的衣物。",
      "用乾淨紗布或布輕蓋保護，不要刺破水泡。",
      "不要塗牙膏、醬油、冰塊或不明藥膏。",
      "觀察燙傷面積、部位與疼痛程度。"
    ],
    "warning": "臉部、手腳、會陰、關節處燙傷，面積大、起大水泡、皮膚發白焦黑、幼兒或長者燙傷，應就醫；嚴重者打119。"
  },
  {
    "icon": "",
    "title": "量血壓方法",
    "question": "量血壓方法",
    "answer": "為什麼會這樣？血壓容易受姿勢、情緒、運動、咖啡因與量測方式影響。方法正確，數字才有參考價值。 你可以怎麼做？1. 量血壓前休息 5 分鐘，避免剛運動、抽菸、喝咖啡後立刻量。2. 坐姿雙腳平放地面，手臂與心臟同高。3. 袖帶大小要合適，綁在裸露上臂，不要隔著厚衣服。 什麼情況要就醫？多次量到明顯偏高，或伴隨胸痛、喘、劇烈頭痛、視力模糊、手腳無力，請儘快就醫。",
    "principle": "血壓容易受姿勢、情緒、運動、咖啡因與量測方式影響。方法正確，數字才有參考價值。",
    "steps": [
      "量血壓前休息 5 分鐘，避免剛運動、抽菸、喝咖啡後立刻量。",
      "坐姿雙腳平放地面，手臂與心臟同高。",
      "袖帶大小要合適，綁在裸露上臂，不要隔著厚衣服。",
      "每次可量兩次，間隔 1 分鐘，記錄平均值。",
      "固定早晚量測，記錄日期、時間與脈搏。"
    ],
    "warning": "多次量到明顯偏高，或伴隨胸痛、喘、劇烈頭痛、視力模糊、手腳無力，請儘快就醫。"
  },
  {
    "icon": "",
    "title": "體重控制",
    "question": "體重控制",
    "answer": "為什麼會這樣？體重受飲食、活動量、睡眠、壓力、荷爾蒙和藥物影響。健康控制不是快速節食，而是建立可持續的生活方式。 你可以怎麼做？1. 先記錄一週飲食與活動，找出最容易調整的習慣。2. 減少含糖飲料、宵夜、油炸和過量點心。3. 每餐增加蔬菜與蛋白質，幫助飽足。 什麼情況要就醫？若體重短期內無故快速下降或上升、合併水腫、喘、心悸、疲倦或食慾明顯改變，應就醫。",
    "principle": "體重受飲食、活動量、睡眠、壓力、荷爾蒙和藥物影響。健康控制不是快速節食，而是建立可持續的生活方式。",
    "steps": [
      "先記錄一週飲食與活動，找出最容易調整的習慣。",
      "減少含糖飲料、宵夜、油炸和過量點心。",
      "每餐增加蔬菜與蛋白質，幫助飽足。",
      "安排規律活動，從每天多走路開始。",
      "睡眠不足會增加食慾與代謝壓力，也要一起調整。"
    ],
    "warning": "若體重短期內無故快速下降或上升、合併水腫、喘、心悸、疲倦或食慾明顯改變，應就醫。"
  },
  {
    "icon": "",
    "title": "膽固醇",
    "question": "膽固醇",
    "answer": "為什麼會這樣？膽固醇過高會讓血管壁累積斑塊，增加心肌梗塞與中風風險。它通常沒有明顯症狀，需要靠抽血追蹤。 你可以怎麼做？1. 減少油炸、肥肉、加工肉品與反式脂肪。2. 增加蔬菜、全穀、豆類、魚類與堅果等較健康的選擇。3. 規律運動並控制體重，有助於改善血脂。 什麼情況要就醫？若有胸痛、喘、冒冷汗、單側無力或說話不清，可能是心腦血管急症，請立即就醫或打119。",
    "principle": "膽固醇過高會讓血管壁累積斑塊，增加心肌梗塞與中風風險。它通常沒有明顯症狀，需要靠抽血追蹤。",
    "steps": [
      "減少油炸、肥肉、加工肉品與反式脂肪。",
      "增加蔬菜、全穀、豆類、魚類與堅果等較健康的選擇。",
      "規律運動並控制體重，有助於改善血脂。",
      "若醫師開立降血脂藥，應規律服用，不要因沒症狀就停藥。",
      "定期追蹤血脂數值，搭配血壓血糖一起管理。"
    ],
    "warning": "若有胸痛、喘、冒冷汗、單側無力或說話不清，可能是心腦血管急症，請立即就醫或打119。"
  },
  {
    "icon": "",
    "title": "心臟保健",
    "question": "心臟保健",
    "answer": "為什麼會這樣？心臟負責把血液送到全身，血壓、血脂、血糖、抽菸、肥胖與壓力都會增加心臟負擔。保健重點是降低長期風險。 你可以怎麼做？1. 規律量血壓並控制血糖、血脂。2. 採低鹽、少油、少糖飲食，多蔬果與全穀。3. 每週安排適合自己的有氧活動，循序漸進。 什麼情況要就醫？胸痛胸悶、冒冷汗、喘、心悸合併暈厥，或疼痛延伸到左臂下巴背部，請立即打119。",
    "principle": "心臟負責把血液送到全身，血壓、血脂、血糖、抽菸、肥胖與壓力都會增加心臟負擔。保健重點是降低長期風險。",
    "steps": [
      "規律量血壓並控制血糖、血脂。",
      "採低鹽、少油、少糖飲食，多蔬果與全穀。",
      "每週安排適合自己的有氧活動，循序漸進。",
      "戒菸、限制酒精，避免長期熬夜。",
      "若已有心臟病，依醫囑服藥並定期回診。"
    ],
    "warning": "胸痛胸悶、冒冷汗、喘、心悸合併暈厥，或疼痛延伸到左臂下巴背部，請立即打119。"
  },
  {
    "icon": "",
    "title": "腎臟保健",
    "question": "腎臟保健",
    "answer": "為什麼會這樣？腎臟負責排除代謝廢物、調節水分與電解質。高血壓、糖尿病、止痛藥濫用與高鹽飲食都會增加腎臟負擔。 你可以怎麼做？1. 控制血壓與血糖，是保護腎臟最重要的方式。2. 飲食避免過鹹，少喝含糖飲料。3. 不要自行長期服用止痛藥或來路不明藥物。 什麼情況要就醫？尿量明顯減少、全身水腫、喘、血尿、嚴重倦怠或腎功能快速惡化，應儘快就醫。",
    "principle": "腎臟負責排除代謝廢物、調節水分與電解質。高血壓、糖尿病、止痛藥濫用與高鹽飲食都會增加腎臟負擔。",
    "steps": [
      "控制血壓與血糖，是保護腎臟最重要的方式。",
      "飲食避免過鹹，少喝含糖飲料。",
      "不要自行長期服用止痛藥或來路不明藥物。",
      "依醫囑定期驗尿、抽血追蹤腎功能。",
      "有腎臟病者水分、蛋白質與鉀磷攝取需依醫師或營養師建議。"
    ],
    "warning": "尿量明顯減少、全身水腫、喘、血尿、嚴重倦怠或腎功能快速惡化，應儘快就醫。"
  },
  {
    "icon": "",
    "title": "尿路感染",
    "question": "尿路感染",
    "answer": "為什麼會這樣？尿路感染多因細菌進入尿道、膀胱造成，常見症狀是頻尿、尿急、解尿疼痛。若感染往上到腎臟，可能發燒腰痛。 你可以怎麼做？1. 多補充水分，幫助排尿沖洗尿道；若有限水限制則依醫囑。2. 不要憋尿，排尿後由前往後擦拭。3. 保持私密處清潔乾爽，避免過度使用刺激性清潔用品。 什麼情況要就醫？發燒、畏寒、腰痛、血尿、噁心嘔吐、孕婦、男性、長者或糖尿病患者疑似尿路感染，應就醫。",
    "principle": "尿路感染多因細菌進入尿道、膀胱造成，常見症狀是頻尿、尿急、解尿疼痛。若感染往上到腎臟，可能發燒腰痛。",
    "steps": [
      "多補充水分，幫助排尿沖洗尿道；若有限水限制則依醫囑。",
      "不要憋尿，排尿後由前往後擦拭。",
      "保持私密處清潔乾爽，避免過度使用刺激性清潔用品。",
      "依醫師指示完成抗生素療程，不要症狀好轉就自行停藥。",
      "觀察是否發燒、腰痛、血尿或症狀反覆。"
    ],
    "warning": "發燒、畏寒、腰痛、血尿、噁心嘔吐、孕婦、男性、長者或糖尿病患者疑似尿路感染，應就醫。"
  },
  {
    "icon": "",
    "title": "腹瀉處理",
    "question": "腹瀉處理",
    "answer": "為什麼會這樣？腹瀉是腸道蠕動增加或水分吸收變差，可能與病毒、細菌、食物不潔、藥物或腸胃敏感有關。重點是預防脫水。 你可以怎麼做？1. 少量多次補充水分或口服電解質液。2. 暫時避免油膩、辛辣、奶類與酒精。3. 可吃清淡易消化食物，如稀飯、吐司、香蕉。 什麼情況要就醫？血便、黑便、高燒、劇烈腹痛、持續嘔吐、尿量變少、老人小孩或慢性病患者腹瀉，應就醫。",
    "principle": "腹瀉是腸道蠕動增加或水分吸收變差，可能與病毒、細菌、食物不潔、藥物或腸胃敏感有關。重點是預防脫水。",
    "steps": [
      "少量多次補充水分或口服電解質液。",
      "暫時避免油膩、辛辣、奶類與酒精。",
      "可吃清淡易消化食物，如稀飯、吐司、香蕉。",
      "注意手部衛生，避免傳染給家人。",
      "不要自行亂用止瀉藥，若感染嚴重可能不適合。"
    ],
    "warning": "血便、黑便、高燒、劇烈腹痛、持續嘔吐、尿量變少、老人小孩或慢性病患者腹瀉，應就醫。"
  },
  {
    "icon": "",
    "title": "胃痛照護",
    "question": "胃痛照護",
    "answer": "為什麼會這樣？胃痛可能與胃酸、胃炎、胃潰瘍、飲食刺激、壓力或藥物有關。也有些腹部急症會被誤以為胃痛。 你可以怎麼做？1. 先避免辛辣、油炸、酒精、咖啡和太酸食物。2. 少量多餐，避免一次吃太飽或躺下太快。3. 不要自行長期吃止痛藥，部分止痛藥會刺激胃。 什麼情況要就醫？胃痛合併黑便、吐血、劇烈腹痛、發燒、持續嘔吐、體重下降，或痛到冒冷汗，應立即就醫。",
    "principle": "胃痛可能與胃酸、胃炎、胃潰瘍、飲食刺激、壓力或藥物有關。也有些腹部急症會被誤以為胃痛。",
    "steps": [
      "先避免辛辣、油炸、酒精、咖啡和太酸食物。",
      "少量多餐，避免一次吃太飽或躺下太快。",
      "不要自行長期吃止痛藥，部分止痛藥會刺激胃。",
      "記錄疼痛位置、時間、與進食關係。",
      "壓力大時可配合作息和放鬆練習。"
    ],
    "warning": "胃痛合併黑便、吐血、劇烈腹痛、發燒、持續嘔吐、體重下降，或痛到冒冷汗，應立即就醫。"
  },
  {
    "icon": "",
    "title": "頭痛警訊",
    "question": "頭痛警訊",
    "answer": "為什麼會這樣？大多數頭痛與壓力、睡眠不足、脫水或肌肉緊繃有關，但突然劇烈頭痛可能與腦出血、感染或中風有關。 你可以怎麼做？1. 先休息、補充水分，觀察頭痛型態與持續時間。2. 避免自行混用止痛藥，尤其有肝腎病、胃潰瘍或正在服抗凝血藥者。3. 記錄頭痛位置、強度、是否伴隨發燒、嘔吐、視力改變或肢體無力。 什麼情況要就醫？突然爆炸性劇痛、頭痛合併意識改變、單側無力、說話不清、發燒脖子僵硬、頭部外傷後頭痛，應立即就醫或打119。",
    "principle": "大多數頭痛與壓力、睡眠不足、脫水或肌肉緊繃有關，但突然劇烈頭痛可能與腦出血、感染或中風有關。",
    "steps": [
      "先休息、補充水分，觀察頭痛型態與持續時間。",
      "避免自行混用止痛藥，尤其有肝腎病、胃潰瘍或正在服抗凝血藥者。",
      "記錄頭痛位置、強度、是否伴隨發燒、嘔吐、視力改變或肢體無力。",
      "若常反覆頭痛，建議建立頭痛紀錄，提供醫師評估。",
      "保持規律睡眠、減少長時間低頭與螢幕使用。"
    ],
    "warning": "突然爆炸性劇痛、頭痛合併意識改變、單側無力、說話不清、發燒脖子僵硬、頭部外傷後頭痛，應立即就醫或打119。"
  },
  {
    "icon": "",
    "title": "頭暈處理",
    "question": "頭暈處理",
    "answer": "為什麼會這樣？頭暈可能來自內耳平衡、血壓、血糖、貧血、脫水或心律不整。重點是先避免跌倒，再觀察是否有神經或心臟警訊。 你可以怎麼做？1. 立刻坐下或躺下，避免走動與騎車開車。2. 慢慢改變姿勢，從躺到坐、再站起來不要太快。3. 補充水分，若有糖尿病可依照平常方式檢查血糖。 什麼情況要就醫？頭暈合併胸痛、心悸、昏倒、單側無力、說話不清、走路不穩或持續嘔吐，應立即就醫。",
    "principle": "頭暈可能來自內耳平衡、血壓、血糖、貧血、脫水或心律不整。重點是先避免跌倒，再觀察是否有神經或心臟警訊。",
    "steps": [
      "立刻坐下或躺下，避免走動與騎車開車。",
      "慢慢改變姿勢，從躺到坐、再站起來不要太快。",
      "補充水分，若有糖尿病可依照平常方式檢查血糖。",
      "觀察是否有耳鳴、嘔吐、胸悶、心悸或單側無力。",
      "若常發作，記錄發作時間、姿勢、血壓與伴隨症狀。"
    ],
    "warning": "頭暈合併胸痛、心悸、昏倒、單側無力、說話不清、走路不穩或持續嘔吐，應立即就醫。"
  },
  {
    "icon": "",
    "title": "背痛照護",
    "question": "背痛照護",
    "answer": "為什麼會這樣？背痛常與肌肉拉傷、姿勢不良、久坐或搬重物有關，但少數可能與神經壓迫、感染或內臟疾病相關。 你可以怎麼做？1. 急性痠痛可短時間休息，但不要長期完全不動。2. 避免彎腰搬重物，搬東西時靠近身體並屈膝。3. 熱敷可放鬆肌肉，若是剛扭傷腫痛可先冰敷。 什麼情況要就醫？背痛合併下肢無力麻木、大小便失控、發燒、癌症病史、嚴重外傷，或夜間痛醒持續惡化，應就醫。",
    "principle": "背痛常與肌肉拉傷、姿勢不良、久坐或搬重物有關，但少數可能與神經壓迫、感染或內臟疾病相關。",
    "steps": [
      "急性痠痛可短時間休息，但不要長期完全不動。",
      "避免彎腰搬重物，搬東西時靠近身體並屈膝。",
      "熱敷可放鬆肌肉，若是剛扭傷腫痛可先冰敷。",
      "調整坐姿與螢幕高度，避免長時間固定姿勢。",
      "疼痛緩解後做溫和伸展與核心肌力訓練。"
    ],
    "warning": "背痛合併下肢無力麻木、大小便失控、發燒、癌症病史、嚴重外傷，或夜間痛醒持續惡化，應就醫。"
  },
  {
    "icon": "",
    "title": "鼻過敏",
    "question": "鼻過敏",
    "answer": "為什麼會這樣？鼻過敏是免疫系統對塵蟎、花粉、灰塵、寵物毛或溫差過度反應，造成打噴嚏、流鼻水、鼻塞與鼻癢。 你可以怎麼做？1. 找出誘發因素，例如灰塵、冷空氣、寵物或寢具。2. 定期清洗床單枕套，減少塵蟎。3. 避免在空氣差或花粉多時長時間戶外活動。 什麼情況要就醫？鼻塞嚴重影響睡眠、流黃綠鼻涕合併臉痛發燒、氣喘惡化或症狀長期控制不佳，應就醫。",
    "principle": "鼻過敏是免疫系統對塵蟎、花粉、灰塵、寵物毛或溫差過度反應，造成打噴嚏、流鼻水、鼻塞與鼻癢。",
    "steps": [
      "找出誘發因素，例如灰塵、冷空氣、寵物或寢具。",
      "定期清洗床單枕套，減少塵蟎。",
      "避免在空氣差或花粉多時長時間戶外活動。",
      "可用生理食鹽水清潔鼻腔，減少刺激物。",
      "依醫師建議使用鼻噴劑或抗過敏藥，不要自行長期亂用。"
    ],
    "warning": "鼻塞嚴重影響睡眠、流黃綠鼻涕合併臉痛發燒、氣喘惡化或症狀長期控制不佳，應就醫。"
  },
  {
    "icon": "",
    "title": "手部衛生",
    "question": "手部衛生",
    "answer": "為什麼會這樣？手是病菌傳播最常見的媒介之一。洗手能減少感冒、腸胃炎與其他感染傳播。重點是時機正確、搓洗足夠。 你可以怎麼做？1. 飯前、如廁後、外出返家、照顧病人前後都要洗手。2. 用肥皂和清水搓洗至少 20 秒。3. 手心、手背、指縫、指尖、指甲縫和手腕都要洗到。 什麼情況要就醫？若手部傷口紅腫熱痛、流膿、發燒，或接觸感染源後出現不適，應就醫。",
    "principle": "手是病菌傳播最常見的媒介之一。洗手能減少感冒、腸胃炎與其他感染傳播。重點是時機正確、搓洗足夠。",
    "steps": [
      "飯前、如廁後、外出返家、照顧病人前後都要洗手。",
      "用肥皂和清水搓洗至少 20 秒。",
      "手心、手背、指縫、指尖、指甲縫和手腕都要洗到。",
      "沒有清水時可用酒精乾洗手，但手很髒時仍要用水洗。",
      "擦手毛巾保持乾淨，避免共用髒毛巾。"
    ],
    "warning": "若手部傷口紅腫熱痛、流膿、發燒，或接觸感染源後出現不適，應就醫。"
  },
  {
    "icon": "",
    "title": "感染預防",
    "question": "感染預防",
    "answer": "為什麼會這樣？感染預防靠阻斷病原傳播，包括手部、飛沫、環境表面與傷口。日常清潔與通風能降低風險。 你可以怎麼做？1. 勤洗手，咳嗽或打噴嚏時遮住口鼻。2. 身體不適時戴口罩並減少出入人多場所。3. 保持室內通風，常接觸表面如門把、桌面定期清潔。 什麼情況要就醫？發燒不退、呼吸喘、傷口紅腫擴大流膿、意識變差，或免疫力低下者疑似感染，應就醫。",
    "principle": "感染預防靠阻斷病原傳播，包括手部、飛沫、環境表面與傷口。日常清潔與通風能降低風險。",
    "steps": [
      "勤洗手，咳嗽或打噴嚏時遮住口鼻。",
      "身體不適時戴口罩並減少出入人多場所。",
      "保持室內通風，常接觸表面如門把、桌面定期清潔。",
      "傷口保持清潔覆蓋，不共用個人用品。",
      "依建議接種疫苗，保護自己也保護家人。"
    ],
    "warning": "發燒不退、呼吸喘、傷口紅腫擴大流膿、意識變差，或免疫力低下者疑似感染，應就醫。"
  },
  {
    "icon": "",
    "title": "居家安全",
    "question": "居家安全",
    "answer": "為什麼會這樣？居家安全的核心是讓動線清楚、光線足夠、常用物容易拿，減少跌倒、燙傷、誤食和用電風險。 你可以怎麼做？1. 走道不要堆雜物，電線不要橫跨地面。2. 夜間起床路線放小夜燈。3. 常用物放在腰到胸口高度，避免爬高拿東西。 什麼情況要就醫？若家中長者反覆跌倒、常忘記關火、走路不穩或用藥混亂，建議請醫療或照護專業協助評估。",
    "principle": "居家安全的核心是讓動線清楚、光線足夠、常用物容易拿，減少跌倒、燙傷、誤食和用電風險。",
    "steps": [
      "走道不要堆雜物，電線不要橫跨地面。",
      "夜間起床路線放小夜燈。",
      "常用物放在腰到胸口高度，避免爬高拿東西。",
      "瓦斯、電器、延長線定期檢查，不過度使用。",
      "藥品和清潔用品分開放，避免小孩或長者誤食。"
    ],
    "warning": "若家中長者反覆跌倒、常忘記關火、走路不穩或用藥混亂，建議請醫療或照護專業協助評估。"
  },
  {
    "icon": "",
    "title": "何時打119",
    "question": "何時打119",
    "answer": "為什麼會這樣？119 是給疑似危及生命、需要立即救援的情況使用。重點不是等到完全確定才求救，而是只要出現意識、呼吸、循環或大量出血等危險訊號，就應該快速求助。 你可以怎麼做？1. 先確認現場安全，再靠近患者，避免自己也受傷。2. 呼叫患者、觀察呼吸與反應；若沒有反應或呼吸異常，立即請人打119並準備CPR。3. 打119時清楚說明地點、患者年齡、症狀、意識與呼吸狀況。 什麼情況要就醫？意識不清、呼吸困難、胸痛冒冷汗、疑似中風、大量出血、嚴重燙傷、抽搐不止、嚴重外傷或突然無法站立說話，都應立即撥打119。",
    "principle": "119 是給疑似危及生命、需要立即救援的情況使用。重點不是等到完全確定才求救，而是只要出現意識、呼吸、循環或大量出血等危險訊號，就應該快速求助。",
    "steps": [
      "先確認現場安全，再靠近患者，避免自己也受傷。",
      "呼叫患者、觀察呼吸與反應；若沒有反應或呼吸異常，立即請人打119並準備CPR。",
      "打119時清楚說明地點、患者年齡、症狀、意識與呼吸狀況。",
      "等待救護車時保持電話暢通，依照勤務中心指示協助處理。",
      "不要自行開車載重症患者，救護車途中可提供急救與轉送適合醫院。"
    ],
    "warning": "意識不清、呼吸困難、胸痛冒冷汗、疑似中風、大量出血、嚴重燙傷、抽搐不止、嚴重外傷或突然無法站立說話，都應立即撥打119。"
  }
];

function fillQuestion(text) {
  const input = document.getElementById("aiQuestionInput");
  if (input) {
    input.value = text;
    input.focus();
  }
}

function renderHotQuestions() {
  const container = document.getElementById("hotQuestionScroll");
  if (!container) return;

  container.innerHTML = "";

  healthQuestions.forEach((item, index) => {
    const button = document.createElement("button");
    button.className = "hot-question-btn";
    button.innerHTML = `${item.icon} <span>${item.title}</span>`;
    button.onclick = function () {
      fillHealthQuestion(index);
    };
    container.appendChild(button);
  });
}

function fillHealthQuestion(index) {
  const item = healthQuestions[index];
  if (!item) return;

  const input = document.getElementById("aiQuestionInput");
  if (input) {
    input.value = item.question;
    input.focus();
  }
}

function sendAiQuestion() {
  const input = document.getElementById("aiQuestionInput");
  const chatBox = document.getElementById("aiChatBox");

  if (!input || input.value.trim() === "") {
    alert("請先輸入健康問題");
    return;
  }

  if (!chatBox) {
    alert("找不到聊天區 aiChatBox，請確認 index.html 有加入聊天區。 ");
    return;
  }

  const question = input.value.trim();

  const userMsg = document.createElement("div");
  userMsg.className = "chat-message user-message";
  userMsg.textContent = question;

  const aiMsg = document.createElement("div");
  aiMsg.className = "chat-message ai-reply";
  aiMsg.innerHTML = getAiReply(question);

  chatBox.appendChild(userMsg);
  chatBox.appendChild(aiMsg);

  input.value = "";
  input.focus();
  chatBox.scrollTop = chatBox.scrollHeight;
}

function normalizeText(text) {
  return String(text || "")
    .replace(/[？?。！!，,、\s]/g, "")
    .toLowerCase();
}

function findMatchedQuestion(question) {
  const q = normalizeText(question);

  return healthQuestions.find(item => {
    const title = normalizeText(item.title);
    const itemQuestion = normalizeText(item.question);
    return q.includes(title) || itemQuestion.includes(q) || q.includes(itemQuestion);
  });
}

function formatReply(title, overview, nowSteps, homeCare, dangerSigns) {
  return `
    <strong>${title}</strong><br><br>
    <strong>一、先了解可能原因或照護重點</strong><br>
    ${overview}<br><br>
    <strong>二、現在可以怎麼做</strong><br>
    ${nowSteps}<br><br>
    <strong>三、居家照護與改善方法</strong><br>
    ${homeCare}<br><br>
    <strong>四、什麼情況要就醫或撥打 119</strong><br>
    ${dangerSigns}<br><br>
    <strong>提醒：</strong>AI 回答僅供衛教參考，不能取代醫師診斷；若症狀持續、惡化或讓你感到不安，請諮詢專業醫護人員。
  `;
}

function getAiReply(question) {
  const q = question.trim();
  const matched = findMatchedQuestion(q);

  if (q.includes("跌倒") || (matched && matched.title.includes("跌倒"))) {
    return formatReply(
      "跌倒後處理建議",
      "跌倒後最重要的是先確認有沒有頭部撞擊、骨折、出血、意識改變或無法站立。很多人會急著把患者扶起來，但如果有骨折、脊椎受傷或頭部外傷，過度移動可能讓傷勢更嚴重。",
      "請先讓患者保持安全姿勢，不要立刻站起來。詢問是否頭暈、噁心、想吐、胸痛、呼吸困難或四肢無力。若有傷口，先用乾淨紗布或毛巾壓迫止血；若懷疑骨折，先固定患部，不要按摩、拉扯或硬把骨頭推回去。",
      "如果只是輕微跌倒，可先休息 5 到 10 分鐘，確認沒有頭暈或疼痛加劇後再慢慢起身。回家後可觀察 24 小時，注意是否出現頭痛、嘔吐、嗜睡、瘀青擴大或活動能力下降。平時應保持地板乾燥、移除雜物、浴室加裝止滑墊與扶手，夜間使用小夜燈。",
      "如果撞到頭、意識不清、反覆嘔吐、劇烈頭痛、胸痛、呼吸困難、骨頭變形、大量出血、無法站立或懷疑脊椎受傷，請立即撥打 119。長者、服用抗凝血藥物者，即使表面看起來沒事，也建議就醫評估。"
    );
  }

  if (q.includes("高血壓") || q.includes("血壓") || (matched && matched.title.includes("血壓"))) {
    return formatReply(
      "高血壓照護建議",
      "高血壓是血管內壓力長期偏高，會增加心臟、腦部、腎臟與血管負擔。它常常沒有明顯症狀，所以不能只靠感覺判斷，規律量測與記錄很重要。",
      "請先確認血壓是否用正確方式測量：測量前休息 5 分鐘、手臂與心臟同高、不要剛運動或喝咖啡後量。若第一次很高，請休息後再量一次並記錄數值、時間與當下症狀。",
      "日常照護可從低鹽飲食、規律作息、控制體重、避免熬夜與規律運動開始。少吃醃製品、泡麵、加工食品與重口味醬料。若醫師有開藥，請固定服用，不要因為血壓正常就自行停藥。",
      "若血壓很高並合併胸痛、呼吸困難、劇烈頭痛、視力模糊、單側手腳無力、說話不清或意識改變，請立即就醫或撥打 119。"
    );
  }

  if (q.includes("血糖") || q.includes("糖尿病") || (matched && (matched.title.includes("血糖") || matched.title.includes("足部")))) {
    return formatReply(
      "血糖管理建議",
      "血糖長期偏高會影響血管、神經、眼睛、腎臟與足部健康；血糖過低則可能造成冒冷汗、手抖、心悸、頭暈甚至意識不清。因此血糖管理要同時避免過高與過低。",
      "請依醫囑監測血糖，記錄空腹、飯後血糖與不舒服的時間。若出現冒冷汗、手抖、心悸、頭暈，應先懷疑低血糖；若意識清楚，可先補充含糖食物並觀察，但後續仍要告知醫護人員。",
      "飲食上建議定時定量，減少含糖飲料、甜點、精緻澱粉與宵夜。每餐搭配蔬菜、蛋白質與適量全穀類。若有使用藥物或胰島素，請依醫囑使用，不要自行加量或停藥；足部每天檢查有無傷口、水泡、紅腫或感染。",
      "若出現意識不清、持續嘔吐、呼吸急促、極度口渴、尿量異常、嚴重冒冷汗、足部傷口變黑或感染擴大，請立即就醫。"
    );
  }

  if (q.includes("用藥") || q.includes("藥") || (matched && matched.title.includes("用藥"))) {
    return formatReply(
      "用藥安全建議",
      "用藥安全的核心是確認藥名、劑量、時間、服用方式與注意事項。不同藥物外觀可能相似，不能只靠顏色或形狀判斷。",
      "服藥前請確認藥袋資訊，包含姓名、藥名、用量與飯前飯後。若忘記服藥，不建議自行一次補兩倍劑量，應依藥袋或醫師藥師指示處理。",
      "不要自行停藥、加量、減量，也不要服用他人的藥。看不同科別時，請主動告知目前所有藥物、保健品與過敏史。藥物要放在陰涼乾燥處，避免小孩或長者誤拿，過期或受潮藥物不要使用。",
      "若服藥後出現呼吸困難、嘴唇或臉部腫脹、全身紅疹、嚴重頭暈、胸悶、心悸或意識不清，可能是嚴重過敏或副作用，請立即就醫。"
    );
  }

  if (q.includes("胸痛") || q.includes("胸悶") || q.includes("心臟") || (matched && (matched.title.includes("胸痛") || matched.title.includes("心臟")))) {
    return formatReply(
      "胸痛與胸悶處理建議",
      "胸痛可能來自肌肉、胃食道逆流、焦慮、肺部或心臟問題，但若是壓迫感、緊縮感，或伴隨冒冷汗、呼吸困難、噁心、頭暈，就需要高度警覺。",
      "請立刻停止活動，坐下或半坐臥休息，保持呼吸順暢，請旁人協助觀察。不要勉強走動，也不要自行開車就醫。若醫師曾開立急救藥物，應依照醫囑使用。",
      "即使胸痛緩解，也建議記錄發作時間、持續多久、疼痛位置、是否和活動或情緒有關，以及有沒有冒冷汗、心悸或喘。這些資料可以幫助醫師判斷。",
      "胸痛若延伸到左手臂、肩膀、下巴、背部，或合併冒冷汗、呼吸困難、噁心、意識不清、快昏倒，請立即撥打 119。"
    );
  }

  if (q.includes("傷口") || q.includes("流血") || q.includes("破皮") || (matched && matched.title.includes("傷口"))) {
    return formatReply(
      "傷口照護建議",
      "傷口照護的重點是清潔、止血、避免感染與持續觀察。傷口若處理不當，可能造成感染，糖尿病患者、長者或免疫力較弱者更要小心。",
      "處理前請先洗手。若有流血，先用乾淨紗布壓迫止血；接著用清水或生理食鹽水沖洗傷口。不要塗牙膏、醬油、草藥或不明偏方。",
      "清潔後可用乾淨紗布覆蓋，保持乾燥並定期更換敷料。每天觀察是否紅、腫、熱、痛、流膿或有異味。若是被生鏽物品刺傷、動物咬傷或傷口很深，要評估是否需要破傷風疫苗或其他治療。",
      "若流血壓不住、傷口很深、看見脂肪或骨頭、紅腫擴大、流膿、有發燒，或糖尿病患者足部有傷口，請儘快就醫。"
    );
  }

  if (matched) {
    return formatReply(
      `${matched.title}：詳細衛教建議`,
      matched.answer,
      "你可以先確認症狀出現的時間、持續多久、嚴重程度，以及是否有發燒、疼痛、呼吸困難、頭暈、意識改變或活動能力下降。若和飲食、藥物、運動、跌倒或慢性病有關，也請一併記錄。",
      "居家照護以安全、觀察與規律紀錄為主。建議保持充足休息、補充水分、避免自行亂服藥或使用偏方，並依照醫師、護理師或藥師指示進行照護。若需要長期照護，請建立固定紀錄，例如血壓、血糖、體溫、疼痛程度或傷口變化。",
      "若症狀持續不改善、越來越嚴重，或出現胸痛、呼吸困難、意識不清、大量出血、單側肢體無力、說話不清、嚴重過敏、劇烈疼痛等狀況，請立即就醫或撥打 119。"
    );
  }

  return formatReply(
    "一般健康問題建議",
    "目前這個問題沒有對應到特定衛教分類，因此先提供一般安全評估方式。你可以先觀察症狀的部位、開始時間、持續多久、嚴重程度、是否反覆發生，以及是否有其他伴隨症狀。",
    "若症狀輕微，可以先休息、補充水分、避免劇烈活動，並持續觀察變化。請不要自行亂服藥、混用成藥或使用來路不明的偏方。",
    "建議把症狀、體溫、血壓、血糖、疼痛程度或用藥狀況記錄下來，之後提供給醫護人員判斷。若你有慢性病、懷孕、年紀較大或免疫力較差，請更早尋求專業協助。",
    "若出現胸痛、呼吸困難、意識不清、劇烈疼痛、大量出血、單側手腳無力、說話不清、抽搐、嚴重過敏或症狀快速惡化，請立即撥打 119。"
  );
}

document.addEventListener("DOMContentLoaded", function () {
  renderHotQuestions();

  const input = document.getElementById("aiQuestionInput");
  if (input) {
    input.addEventListener("keydown", function (event) {
      if (event.key === "Enter") {
        sendAiQuestion();
      }
    });
  }
});


/* ===== 情緒進一步評估功能：BSRS-5 / PHQ-9 / GAD-7 ===== */

let currentScale = "";
let currentQuestionIndex = 0;
let scaleAnswers = [];


function scalePsychFeedback(summary, situation, advice, reminder) {
  return `
    <div class="psych-card">
      <div class="psych-row">
        <div class="psych-icon">📋</div>
        <div>
          <h4>結果摘要</h4>
          <p>${summary}</p>
        </div>
      </div>

      <div class="psych-row">
        <div class="psych-icon">☁️</div>
        <div>
          <h4>可能代表的狀況</h4>
          <p>${situation}</p>
        </div>
      </div>

      <div class="psych-row">
        <div class="psych-icon">🌱</div>
        <div>
          <h4>建議方向</h4>
          <p>${advice}</p>
        </div>
      </div>

      <div class="psych-row">
        <div class="psych-icon">💗</div>
        <div>
          <h4>貼心提醒</h4>
          <p>${reminder}</p>
        </div>
      </div>
    </div>
  `;
}

const scaleData = {
  bsrs5: {
    title: "BSRS-5 簡式健康量表",
    total: 20,
    questions: [
  "最近會不會覺得睡不好，像是很難入睡、容易醒來或太早醒？",
  "最近會不會覺得緊張、不安，或心裡一直放不鬆？",
  "最近會不會覺得很煩、容易生氣，或情緒比較暴躁？",
  "最近會不會覺得心情低落、提不起勁？",
  "最近會不會覺得自己比不上別人，或對自己比較沒信心？",
  "最近有沒有出現傷害自己的想法？"
],
    options: [
      { text: "完全沒有", score: 0 },
      { text: "輕微", score: 1 },
      { text: "中等程度", score: 2 },
      { text: "嚴重", score: 3 },
      { text: "非常嚴重", score: 4 }
    ],
    getLevel(score) {
      if (score <= 5) {
        return [
          "正常範圍",
          scalePsychFeedback(
            "目前身心壓力分數落在正常範圍，整體心理壓力狀態大致穩定。",
            "近期可能偶爾有壓力或疲累，但尚未明顯影響日常生活、情緒或睡眠。",
            "建議持續維持規律作息、適度休息與穩定的生活節奏，也可以保留每日情緒紀錄作為自我觀察。",
            "此結果僅供自我了解，不能作為診斷依據。若之後出現明顯低落、焦慮或睡眠困擾，仍建議尋求專業協助。"
          )
        ];
      }
      if (score <= 9) {
        return [
          "輕度心理困擾",
          scalePsychFeedback(
            "目前身心壓力分數落在輕度心理困擾範圍，表示近期可能有一些壓力或情緒波動。",
            "你可能偶爾感到緊張、睡不好、容易煩躁或心情較低落，但程度仍屬於可觀察與調整的範圍。",
            "建議先安排休息、減少壓力來源、增加放鬆活動，也可以與可信任的人聊聊目前的狀態。",
            "若症狀持續超過兩週，或開始影響上課、工作、人際與生活功能，建議尋求心理師或醫療專業協助。"
          )
        ];
      }
      if (score <= 14) {
        return [
          "中度心理困擾",
          scalePsychFeedback(
            "目前身心壓力分數落在中度心理困擾範圍，代表近期壓力與情緒狀態已值得進一步關注。",
            "你可能有較明顯的睡眠困難、緊張、易怒、低落或自我否定，這些狀態可能開始影響生活品質。",
            "建議持續記錄情緒與壓力來源，並考慮與心理師、輔導老師、身心科或其他專業人員討論目前狀況。",
            "請不要把所有壓力都自己扛著。及早求助不是代表脆弱，而是更有效地照顧自己。"
          )
        ];
      }
      return [
        "重度心理困擾",
        scalePsychFeedback(
          "目前身心壓力分數偏高，落在重度心理困擾範圍，表示近期心理負荷可能較明顯。",
          "你可能正經歷明顯的情緒低落、緊張、睡眠困擾、易怒或自我否定，且可能已影響日常功能。",
          "建議盡快尋求心理師、身心科、學校輔導資源或醫療專業協助，進一步了解壓力來源與合適的支持方式。",
          "若有自傷念頭、覺得撐不下去或立即危險，請立即聯絡 119、1925 安心專線，或找身邊可信任的人陪伴。"
        )
      ];
    }
  },

  phq9: {
    title: "PHQ-9 憂鬱情緒評估",
    total: 27,
    questions: [
  "最近做事情時，會不會提不起興趣或覺得沒動力？",
  "最近會不會覺得心情低落、難過或空空的？",
  "最近會不會睡不好、睡太多，或睡醒還是很累？",
  "最近會不會覺得很疲倦、沒有力氣？",
  "最近會不會食慾變差，或吃得比平常多很多？",
  "最近會不會覺得自己很失敗，或覺得讓自己、家人失望？",
  "最近做事時會不會很難專心，例如讀書、看電視或滑手機也容易分心？",
  "最近動作或說話會不會變得很慢，或反而坐立不安、停不下來？",
  "最近有沒有覺得活著很累，或出現傷害自己的想法？"
],
    options: [
      { text: "從未發生", score: 0 },
      { text: "偶爾", score: 1 },
      { text: "多數時候", score: 2 },
      { text: "連續不斷", score: 3 }
    ],
    getLevel(score) {
      if (score <= 4) {
        return [
          "無明顯憂鬱",
          scalePsychFeedback(
            "目前憂鬱情緒分數較低，暫時沒有明顯憂鬱症狀的表現。",
            "近期可能仍會有一般生活中的情緒起伏，但整體情緒狀態大致穩定。",
            "建議持續維持規律作息、適度運動、穩定社交支持與讓自己有成就感的小活動。",
            "此結果僅供自我了解，不能作為診斷依據。若之後出現持續低落或失去興趣，建議再評估或尋求協助。"
          )
        ];
      }
      if (score <= 9) {
        return [
          "輕度憂鬱",
          scalePsychFeedback(
            "目前憂鬱情緒落在輕度範圍，表示近期可能有一些低落、疲累或提不起勁的情形。",
            "你可能偶爾對事情失去興趣、感到疲倦、睡眠或食慾改變，但程度仍可先觀察與自我調整。",
            "建議增加休息、規律活動與情緒紀錄，也可以找可信任的人談談近期壓力與心情。",
            "如果低落感持續加重，或影響上課、工作、人際與日常生活，建議尋求心理或醫療專業協助。"
          )
        ];
      }
      if (score <= 14) {
        return [
          "中度憂鬱",
          scalePsychFeedback(
            "目前憂鬱情緒落在中度範圍，代表情緒低落或失去興趣的情況可能已較明顯。",
            "你可能有較常出現的低落、疲倦、睡眠或食慾改變、注意力下降，並可能影響生活功能。",
            "建議與心理師、輔導老師或醫療專業人員討論目前狀態，並持續記錄情緒變化與壓力來源。",
            "若出現傷害自己的念頭，請立即向身邊可信任的人求助，或聯絡 119、1925 安心專線。"
          )
        ];
      }
      if (score <= 19) {
        return [
          "中重度憂鬱",
          scalePsychFeedback(
            "目前憂鬱情緒落在中重度範圍，表示情緒困擾可能已明顯影響生活品質。",
            "你可能長時間感到低落、無力、失去興趣、自責或注意力下降，甚至影響學習、工作或人際互動。",
            "建議盡快尋求心理師、身心科或醫療專業協助，進一步評估與討論合適的支持方式。",
            "請不要獨自承受。若有自傷或立即危險，請立刻聯絡 119 或 1925 安心專線。"
          )
        ];
      }
      return [
        "重度憂鬱",
        scalePsychFeedback(
          "目前憂鬱情緒分數偏高，落在重度範圍，代表近期情緒困擾可能非常明顯。",
          "你可能正承受強烈低落、無望感、明顯無力或自我否定，且可能已影響日常功能與安全感。",
          "建議立即尋求心理師、身心科、急診或醫療專業協助，讓專業人員陪你一起評估與處理。",
          "如果有傷害自己的念頭、計畫或立即危險，請立刻聯絡 119、1925 安心專線，或請身邊的人陪伴你。"
        )
      ];
    }
  },

  gad7: {
    title: "GAD-7 焦慮程度評估",
    total: 21,
    questions: [
  "最近會不會常常覺得緊張、不安或很煩躁？",
  "最近會不會一直擔心，很難讓自己停下來？",
  "最近會不會擔心太多不同的事情？",
  "最近會不會很難放鬆下來？",
  "最近會不會坐不住，覺得心裡很不安？",
  "最近會不會比較容易生氣或被小事惹怒？",
  "最近會不會覺得好像有不好的事情要發生？"
],
    options: [
      { text: "從未發生", score: 0 },
      { text: "偶爾", score: 1 },
      { text: "多數時候", score: 2 },
      { text: "連續不斷", score: 3 }
    ],
    getLevel(score) {
      if (score <= 4) {
        return [
          "無明顯焦慮",
          scalePsychFeedback(
            "目前焦慮分數較低，近期沒有明顯焦慮困擾的表現。",
            "你可能偶爾會緊張或擔心，但整體仍能維持放鬆與日常生活功能。",
            "建議持續維持穩定作息、規律運動與適度休息，並保留壓力與情緒紀錄。",
            "此結果僅供自我了解，不能作為診斷依據。若焦慮變得頻繁或難以控制，建議進一步尋求協助。"
          )
        ];
      }
      if (score <= 9) {
        return [
          "輕度焦慮",
          scalePsychFeedback(
            "目前焦慮程度落在輕度範圍，代表近期可能有一些緊張、擔心或難以放鬆的情形。",
            "你可能在壓力情境下較容易胡思亂想、坐立不安或感到煩躁，但尚可先透過調整生活節奏觀察。",
            "建議練習深呼吸、肌肉放鬆、規律運動，並減少過度刺激或長時間滑手機。",
            "若焦慮持續增加，或影響睡眠、上課、工作與人際互動，建議尋求心理或醫療專業協助。"
          )
        ];
      }
      if (score <= 14) {
        return [
          "中度焦慮",
          scalePsychFeedback(
            "目前焦慮程度落在中度範圍，表示焦慮反應可能已較明顯，並開始影響生活狀態。",
            "你可能經常擔心、難以停止思考、放鬆困難，或因焦慮導致身體緊繃與睡眠受影響。",
            "建議持續觀察焦慮發生的情境與頻率，並考慮與心理師、輔導老師或醫療專業人員討論。",
            "焦慮不是單靠意志力就一定能壓下來的狀態，適時尋求協助是有效照顧自己的方式。"
          )
        ];
      }
      return [
        "重度焦慮",
        scalePsychFeedback(
          "目前焦慮程度偏高，落在重度範圍，代表焦慮可能已對日常生活造成明顯影響。",
          "你可能常感到緊張、過度擔心、難以放鬆、坐立不安，甚至出現身體不適或睡眠困擾。",
          "建議盡快尋求心理師、身心科或醫療專業協助，進一步了解焦慮來源並討論合適的改善方法。",
          "若焦慮伴隨恐慌、強烈不安或覺得無法承受，請立即找可信任的人陪伴，必要時尋求緊急協助。"
        )
      ];
    }
  },

  pss10: {
    title: "PSS-10 壓力感受量表",
    total: 40,
    questions: [
  "最近一個月，會不會因為突然發生的事情而心情被影響？",
  "最近一個月，會不會覺得生活中重要的事情自己掌控不了？",
  "最近一個月，會不會常常覺得緊張或壓力很大？",
  "最近一個月，會不會覺得自己有能力處理生活中的問題？",
  "最近一個月，會不會覺得事情大致上都有照自己的期待進行？",
  "最近一個月，會不會覺得有太多事情要做，自己應付不來？",
  "最近一個月，會不會覺得自己能控制生活中的煩惱？",
  "最近一個月，會不會覺得事情都還在自己的掌握之中？",
  "最近一個月，會不會因為無法控制的事情而感到生氣？",
  "最近一個月，會不會覺得困難越堆越多，快要無法承受？"
],
    options: [
      { text: "從不", score: 0 },
      { text: "很少", score: 1 },
      { text: "有時", score: 2 },
      { text: "常常", score: 3 },
      { text: "總是", score: 4 }
    ],
    getLevel(score) {
      if (score <= 13) {
        return [
          "低壓力",
          scalePsychFeedback(
            "目前主觀壓力感受較低，整體生活掌控感大致穩定。",
            "近期可能仍有一般生活壓力，但你目前對壓力的承受與調節狀態相對良好。",
            "建議持續維持規律作息、適度運動、穩定社交支持與讓自己放鬆的活動。",
            "此結果僅供自我了解。若未來壓力升高或出現睡眠、情緒與身體不適，建議及早調整。"
          )
        ];
      }
      if (score <= 26) {
        return [
          "中度壓力",
          scalePsychFeedback(
            "目前主觀壓力感受落在中度範圍，表示近期可能承受一定程度的生活壓力。",
            "你可能有時覺得事情難以掌控、容易緊張，或感到需要處理的事情較多。",
            "建議安排固定休息時間，拆解待辦事項，並透過運動、呼吸放鬆或與他人討論來降低壓力。",
            "如果壓力持續累積，或已影響睡眠、情緒、人際與生活功能，建議尋求心理或醫療專業協助。"
          )
        ];
      }
      return [
        "高壓力",
        scalePsychFeedback(
          "目前主觀壓力感受偏高，代表近期可能感到生活負擔較重或掌控感下降。",
          "你可能經常覺得事情壓得喘不過氣、難以放鬆，或感到困難累積到不容易處理。",
          "建議優先減少非必要壓力源，安排休息與支持資源，並考慮與心理師、輔導老師或醫療專業討論。",
          "長期高壓可能影響睡眠、情緒與身體健康。請不要獨自硬撐，適時求助是照顧自己的重要方式。"
        )
      ];
    }
  },

  who5: {
    title: "WHO-5 幸福感量表",
    total: 25,
    questions: [
  "最近兩週，我覺得心情愉快，精神也還不錯。",
  "最近兩週，我覺得心裡平靜、放鬆。",
  "最近兩週，我覺得自己有活力、有精神。",
  "最近兩週，我早上醒來時覺得有休息到、精神比較清爽。",
  "最近兩週，我的生活中有讓我感興趣或期待的事情。"
],
    options: [
      { text: "完全沒有", score: 0 },
      { text: "不到一半時間", score: 1 },
      { text: "超過一半時間", score: 2 },
      { text: "大部分時間", score: 3 },
      { text: "全部時間", score: 4 }
    ],
    getLevel(score) {
      if (score >= 20) {
        return [
          "幸福感良好",
          scalePsychFeedback(
            "目前心理幸福感分數良好，代表近期整體心理能量與生活感受較穩定。",
            "你可能較常感到愉快、放鬆、有活力，並且對日常生活保有一定興趣。",
            "建議持續維持目前讓你穩定的生活習慣，也可以記錄讓自己感到舒服與有力量的事情。",
            "此結果僅供自我了解。即使狀態良好，也可以持續關心自己的情緒與生活平衡。"
          )
        ];
      }
      if (score >= 13) {
        return [
          "幸福感普通",
          scalePsychFeedback(
            "目前心理幸福感落在普通範圍，代表近期生活狀態可能有穩定的一面，也可能有些疲累或壓力。",
            "你可能偶爾感到有活力或放鬆，但也可能有一段時間覺得生活較平淡、疲倦或缺少興趣。",
            "建議增加讓自己感到有意義或愉快的小活動，例如散步、聽音樂、與朋友互動或安排休息。",
            "如果幸福感持續下降，或伴隨明顯低落、失眠、焦慮，建議進一步尋求心理或醫療專業協助。"
          )
        ];
      }
      return [
        "幸福感偏低",
        scalePsychFeedback(
          "目前心理幸福感偏低，表示近期心理能量、生活興趣或正向感受可能較不足。",
          "你可能較少感到放鬆、愉快或有活力，也可能覺得生活缺乏動力或休息感。",
          "建議先從小範圍調整生活開始，例如固定作息、增加支持互動、安排喜歡的活動，並觀察情緒變化。",
          "如果低幸福感持續存在，或合併低落、焦慮、失眠與生活功能下降，建議尋求心理師或醫療專業協助。"
        )
      ];
    }
  },

  isi: {
    title: "ISI 失眠嚴重度量表",
    total: 28,
    questions: [
  "最近兩週，你入睡困難的程度如何？",
  "最近兩週，你半夜醒來或睡不安穩的程度如何？",
  "最近兩週，你太早醒來、醒來後睡不回去的程度如何？",
  "你對自己最近的睡眠狀況滿意嗎？",
  "睡眠問題會不會影響你的日常生活，例如上課、工作、記憶力、專心程度或情緒？",
  "別人有沒有注意到你的生活品質因為睡眠問題受到影響？",
  "你最近會不會因為睡眠問題而擔心或困擾？"
],
    options: [
      { text: "完全沒有", score: 0 },
      { text: "輕微", score: 1 },
      { text: "中等", score: 2 },
      { text: "嚴重", score: 3 },
      { text: "非常嚴重", score: 4 }
    ],
    getLevel(score) {
      if (score <= 7) {
        return [
          "無明顯失眠",
          scalePsychFeedback(
            "目前你的睡眠狀態大致穩定，尚未出現明顯失眠困擾。",
            "近期睡眠品質尚可，白天精神、情緒與生活功能受睡眠影響的程度較低。",
            "建議持續維持固定作息、舒適睡眠環境，並避免睡前過度使用手機或攝取咖啡因。",
            "此結果僅供自我了解，不能作為診斷依據。"
          )
        ];
      }
      if (score <= 14) {
        return [
          "輕度失眠",
          scalePsychFeedback(
            "目前有輕度睡眠困擾，可能偶爾出現入睡困難、睡眠中斷或醒來後仍感到疲累。",
            "睡眠狀態可能受到壓力、作息不規律、睡前使用手機或生活習慣影響。",
            "建議先調整睡前習慣，例如固定睡眠時間、減少睡前刺激、避免晚間咖啡因，並觀察 1～2 週。",
            "如果睡眠問題持續或影響日常生活，建議尋求專業協助。"
          )
        ];
      }
      if (score <= 21) {
        return [
          "中度失眠",
          scalePsychFeedback(
            "目前睡眠困擾落在中度範圍，睡眠問題可能已開始影響白天精神、情緒或生活功能。",
            "你可能有入睡困難、半夜醒來、太早醒來，或對睡眠品質感到明顯不滿意。",
            "建議持續觀察睡眠狀況，記錄睡眠時間與影響因素；如果已影響上課、工作、情緒或日常生活，建議尋求心理師、身心科或醫療專業協助。",
            "此結果僅供自我了解，不能取代專業醫療或心理診斷。"
          )
        ];
      }
      return [
        "重度失眠",
        scalePsychFeedback(
          "目前失眠困擾較明顯，睡眠問題可能已對生活、情緒或白天功能造成較大影響。",
          "你可能長期難以入睡、睡眠中斷、早醒，或因睡眠不足而影響注意力、情緒與身體狀態。",
          "建議盡快尋求心理師、身心科或醫療專業協助，進一步了解失眠原因並討論合適的改善方式。",
          "請不要獨自承受長期睡眠困擾，適時尋求協助是照顧自己的重要方式。"
        )
      ];
    }
  }
};



let pendingScaleType = "";

const scaleIntroData = {
  bsrs5: {
    icon: "📋",
    title: "BSRS-5 身心壓力量表",
    subtitle: "快速了解最近的心理壓力與情緒狀態",
    purpose: "協助了解近期是否有失眠、緊張、易怒、低落或自我否定等身心壓力反應。",
    meaning: "可以幫助使用者快速觀察目前身心壓力是否偏高，適合作為日常情緒與壓力狀態的初步檢視。",
    result: "完成後可看到總分、身心壓力程度，以及系統提供的照護提醒與建議。",
    method: "依最近一週的狀況作答，約 1～2 分鐘可完成。"
  },
  phq9: {
    icon: "❤️",
    title: "PHQ-9 憂鬱情緒量表",
    subtitle: "了解最近的情緒低落與憂鬱狀態",
    purpose: "用來評估近期是否出現憂鬱相關症狀，例如情緒低落、失去興趣、疲倦、自責或注意力下降。",
    meaning: "可以協助使用者了解自己的憂鬱情緒嚴重程度，並提醒是否需要進一步關注或尋求協助。",
    result: "完成後可看到總分、憂鬱程度，以及後續自我照顧或求助建議。",
    method: "依最近兩週的感受作答，約 2～3 分鐘可完成。"
  },
  gad7: {
    icon: "🧠",
    title: "GAD-7 焦慮程度量表",
    subtitle: "了解近期是否有焦慮傾向",
    purpose: "用來評估近期是否有過度擔心、緊張不安、難以放鬆、坐立不安或容易煩躁等焦慮反應。",
    meaning: "可以幫助使用者了解目前焦慮程度是否偏高，適合用來觀察壓力與焦慮狀態。",
    result: "完成後可看到總分、焦慮程度，以及系統提供的放鬆與照護建議。",
    method: "依最近兩週的狀況作答，約 2 分鐘可完成。"
  },
  pss10: {
    icon: "🌧️",
    title: "PSS-10 壓力感受量表",
    subtitle: "了解最近主觀壓力感受",
    purpose: "用來評估過去一個月內，使用者主觀感受到的壓力、掌控感與生活事件造成的負擔。",
    meaning: "可以幫助使用者了解近期壓力是否偏高，以及是否覺得生活中的事情較難掌控。",
    result: "完成後可看到總分、壓力感受程度，以及壓力管理與生活調整建議。",
    method: "依最近一個月的感受作答，約 2～3 分鐘可完成。"
  },
  who5: {
    icon: "🌿",
    title: "WHO-5 幸福感量表",
    subtitle: "了解最近整體心理幸福感",
    purpose: "用來評估近期是否感到愉快、放鬆、有活力、睡醒有精神，以及生活是否有興趣。",
    meaning: "這個量表不只看負面情緒，也能了解使用者目前的心理能量與生活滿意度。",
    result: "完成後可看到總分、幸福感狀態，以及提升心理能量與生活穩定感的建議。",
    method: "依最近兩週的感受作答，約 1～2 分鐘可完成。"
  },
  isi: {
    icon: "🌙",
    title: "ISI 失眠嚴重度量表",
    subtitle: "了解最近睡眠品質與失眠狀況",
    purpose: "用來評估入睡困難、睡眠中斷、太早醒來、白天功能影響，以及對睡眠問題的困擾程度。",
    meaning: "可以幫助使用者了解睡眠問題是否已經影響日常生活、精神狀態或情緒穩定。",
    result: "完成後可看到總分、失眠嚴重程度，以及睡眠衛生與照護建議。",
    method: "依最近兩週的睡眠狀況作答，約 2 分鐘可完成。"
  }
};

const scaleRangeData = {
  bsrs5: [
    { min: 0, max: 5, range: "0～5 分", label: "正常範圍", tone: "calm" },
    { min: 6, max: 9, range: "6～9 分", label: "輕度心理困擾", tone: "mild" },
    { min: 10, max: 14, range: "10～14 分", label: "中度心理困擾", tone: "moderate" },
    { min: 15, max: null, range: "15 分以上", label: "重度心理困擾", tone: "severe" }
  ],
  phq9: [
    { min: 0, max: 4, range: "0～4 分", label: "無明顯憂鬱", tone: "calm" },
    { min: 5, max: 9, range: "5～9 分", label: "輕度憂鬱", tone: "mild" },
    { min: 10, max: 14, range: "10～14 分", label: "中度憂鬱", tone: "moderate" },
    { min: 15, max: 19, range: "15～19 分", label: "中重度憂鬱", tone: "high" },
    { min: 20, max: 27, range: "20～27 分", label: "重度憂鬱", tone: "severe" }
  ],
  gad7: [
    { min: 0, max: 4, range: "0～4 分", label: "無明顯焦慮", tone: "calm" },
    { min: 5, max: 9, range: "5～9 分", label: "輕度焦慮", tone: "mild" },
    { min: 10, max: 14, range: "10～14 分", label: "中度焦慮", tone: "moderate" },
    { min: 15, max: 21, range: "15～21 分", label: "重度焦慮", tone: "severe" }
  ],
  pss10: [
    { min: 0, max: 13, range: "0～13 分", label: "低壓力", tone: "calm" },
    { min: 14, max: 26, range: "14～26 分", label: "中度壓力", tone: "moderate" },
    { min: 27, max: 40, range: "27～40 分", label: "高壓力", tone: "severe" }
  ],
  who5: [
    { min: 20, max: 25, range: "20～25 分", label: "幸福感良好", tone: "positive" },
    { min: 13, max: 19, range: "13～19 分", label: "幸福感普通", tone: "mild" },
    { min: 0, max: 12, range: "0～12 分", label: "幸福感偏低", tone: "high" }
  ],
  isi: [
    { min: 0, max: 7, range: "0～7 分", label: "無明顯失眠", tone: "calm" },
    { min: 8, max: 14, range: "8～14 分", label: "輕度失眠", tone: "mild" },
    { min: 15, max: 21, range: "15～21 分", label: "中度失眠", tone: "moderate" },
    { min: 22, max: 28, range: "22～28 分", label: "重度失眠", tone: "severe" }
  ]
};

function getRangeMatch(ranges, score) {
  return ranges.find(item => score >= item.min && (item.max === null || score <= item.max));
}

function getScaleThemeClass(type) {
  const themeMap = {
    phq9: "theme-phq9",
    gad7: "theme-gad7",
    isi: "theme-isi",
    bsrs5: "theme-bsrs5",
    pss10: "theme-pss10",
    who5: "theme-who5"
  };
  return themeMap[type] || "theme-default";
}

function resetResultThemeClass(panel) {
  if (!panel) return;
  panel.className = "scale-result-panel";
}



/* ===== 量表介紹與題目：英日翻譯補強 ===== */
const scaleUiI18n = {
  zh: {
    purpose: "量表用途",
    meaning: "這個量表的意義",
    result: "測驗後會得到什麼？",
    method: "如何作答",
    note: "💖 此結果僅供自我參考，不能取代專業醫療或心理診斷。",
    notNow: "稍後再說",
    startTest: "開始測驗",
    questionCount: "第 {current} / {total} 題",
    prev: "上一題",
    next: "下一題",
    viewResult: "查看結果",
    chooseAlert: "請先選擇本題答案",
    resultSuffix: "結果",
    points: "分"
  },
  en: {
    purpose: "Purpose",
    meaning: "Meaning of This Scale",
    result: "What will you get after the test?",
    method: "How to Answer",
    note: "💖 This result is for self-reference only and cannot replace professional medical or psychological diagnosis.",
    notNow: "Not Now",
    startTest: "Start Test",
    questionCount: "Question {current} / {total}",
    prev: "Previous",
    next: "Next",
    viewResult: "View Result",
    chooseAlert: "Please select an answer first.",
    resultSuffix: "Result",
    points: "pts"
  },
  ja: {
    purpose: "目的",
    meaning: "この尺度の意味",
    result: "テスト後に分かること",
    method: "回答方法",
    note: "💖 この結果は自己参考用であり、専門的な医療・心理診断の代わりにはなりません。",
    notNow: "今はしない",
    startTest: "テスト開始",
    questionCount: "第 {current} / {total} 問",
    prev: "前の質問",
    next: "次の質問",
    viewResult: "結果を見る",
    chooseAlert: "先に回答を選択してください。",
    resultSuffix: "結果",
    points: "点"
  }
};

const scaleIntroI18n = {
  bsrs5: {
    en: {
      title: "BSRS-5 Brief Symptom Rating Scale",
      subtitle: "Quickly understand recent stress and emotional state",
      purpose: "This scale helps check recent mind-body stress reactions such as poor sleep, tension, irritability, low mood, or self-doubt.",
      meaning: "It helps users quickly observe whether their current psychological stress is elevated. It is suitable for daily self-checking of mood and stress.",
      result: "After completion, you can see your total score, stress level, and care suggestions provided by the system.",
      method: "Answer based on your condition during the past week. It takes about 1–2 minutes."
    },
    ja: {
      title: "BSRS-5 簡易健康尺度",
      subtitle: "最近の心理的ストレスと感情状態をすばやく確認します",
      purpose: "睡眠不良、緊張、いら立ち、気分の落ち込み、自信の低下など、最近の心身ストレス反応を確認するための尺度です。",
      meaning: "現在の心身ストレスが高いかどうかを簡単に観察でき、日常的な感情・ストレス状態の確認に適しています。",
      result: "完了後、合計点、心身ストレスの程度、システムからのケア提案を確認できます。",
      method: "最近1週間の状態に基づいて回答します。約1～2分で完了します。"
    }
  },
  phq9: {
    en: {
      title: "PHQ-9 Depression Scale",
      subtitle: "Understand recent low mood and depressive symptoms",
      purpose: "This scale evaluates recent depressive symptoms such as low mood, loss of interest, fatigue, self-blame, or poor concentration.",
      meaning: "It helps users understand the severity of depressive mood and reminds them whether further attention or support may be needed.",
      result: "After completion, you can see your total score, depression level, and self-care or help-seeking suggestions.",
      method: "Answer based on your feelings during the past two weeks. It takes about 2–3 minutes."
    },
    ja: {
      title: "PHQ-9 抑うつ気分尺度",
      subtitle: "最近の気分の落ち込みや抑うつ状態を確認します",
      purpose: "気分の落ち込み、興味の低下、疲労、自責感、集中力低下など、最近の抑うつ関連症状を評価します。",
      meaning: "自分の抑うつ気分の程度を理解し、さらなる注意や支援が必要かを確認する助けになります。",
      result: "完了後、合計点、抑うつの程度、その後のセルフケアや相談の提案を確認できます。",
      method: "最近2週間の感覚に基づいて回答します。約2～3分で完了します。"
    }
  },
  gad7: {
    en: {
      title: "GAD-7 Anxiety Scale",
      subtitle: "Understand whether you have recent anxiety tendencies",
      purpose: "This scale evaluates anxiety reactions such as excessive worry, nervousness, difficulty relaxing, restlessness, or irritability.",
      meaning: "It helps users understand whether their anxiety level is elevated and is useful for observing stress and anxiety status.",
      result: "After completion, you can see your total score, anxiety level, and relaxation or care suggestions from the system.",
      method: "Answer based on your condition during the past two weeks. It takes about 2 minutes."
    },
    ja: {
      title: "GAD-7 不安尺度",
      subtitle: "最近、不安傾向があるかを確認します",
      purpose: "過度な心配、緊張、不安、リラックスしにくい、落ち着かない、いら立ちやすいなどの不安反応を評価します。",
      meaning: "現在の不安の程度が高いかどうかを理解し、ストレスや不安状態を観察するのに役立ちます。",
      result: "完了後、合計点、不安の程度、システムからのリラックス・ケア提案を確認できます。",
      method: "最近2週間の状態に基づいて回答します。約2分で完了します。"
    }
  },
  pss10: {
    en: {
      title: "PSS-10 Perceived Stress Scale",
      subtitle: "Understand your recent perceived stress",
      purpose: "This scale evaluates the pressure, sense of control, and burden from life events that users subjectively experienced over the past month.",
      meaning: "It helps users understand whether recent stress is high and whether things in daily life feel difficult to control.",
      result: "After completion, you can see your total score, perceived stress level, and suggestions for stress management and life adjustment.",
      method: "Answer based on your feelings during the past month. It takes about 2–3 minutes."
    },
    ja: {
      title: "PSS-10 知覚ストレス尺度",
      subtitle: "最近の主観的なストレス感を確認します",
      purpose: "過去1か月間に主観的に感じたストレス、コントロール感、生活上の出来事による負担を評価する尺度です。",
      meaning: "最近のストレスが高いか、生活上の出来事をコントロールしにくいと感じているかを理解する助けになります。",
      result: "完了後、合計点、ストレス感の程度、ストレス管理と生活調整の提案を確認できます。",
      method: "最近1か月の感覚に基づいて回答します。約2～3分で完了します。"
    }
  },
  who5: {
    en: {
      title: "WHO-5 Well-being Index",
      subtitle: "Understand your recent overall mental well-being",
      purpose: "This scale evaluates whether you recently felt cheerful, relaxed, energetic, refreshed after waking, and interested in life.",
      meaning: "It does not only focus on negative emotions; it also helps users understand their current mental energy and life satisfaction.",
      result: "After completion, you can see your total score, well-being status, and suggestions for improving mental energy and stability.",
      method: "Answer based on your feelings during the past two weeks. It takes about 1–2 minutes."
    },
    ja: {
      title: "WHO-5 幸福感尺度",
      subtitle: "最近の全体的な心理的幸福感を確認します",
      purpose: "最近、楽しい、リラックスしている、活力がある、朝すっきり目覚める、生活に興味があるかを評価します。",
      meaning: "ネガティブ感情だけでなく、現在の心理的エネルギーと生活満足度を理解する助けになります。",
      result: "完了後、合計点、幸福感の状態、心理的エネルギーと安定感を高める提案を確認できます。",
      method: "最近2週間の感覚に基づいて回答します。約1～2分で完了します。"
    }
  },
  isi: {
    en: {
      title: "ISI Insomnia Severity Index",
      subtitle: "Understand recent sleep quality and insomnia status",
      purpose: "This scale evaluates difficulty falling asleep, sleep interruptions, early awakening, daytime functioning, and distress about sleep problems.",
      meaning: "It helps users understand whether sleep problems have affected daily life, mental state, or emotional stability.",
      result: "After completion, you can see your total score, insomnia severity, and sleep hygiene or care suggestions.",
      method: "Answer based on your sleep condition during the past two weeks. It takes about 2 minutes."
    },
    ja: {
      title: "ISI 不眠重症度尺度",
      subtitle: "最近の睡眠の質と不眠状態を確認します",
      purpose: "入眠困難、中途覚醒、早朝覚醒、日中機能への影響、睡眠問題への悩みの程度を評価します。",
      meaning: "睡眠問題が日常生活、精神状態、感情の安定に影響しているかを理解する助けになります。",
      result: "完了後、合計点、不眠の重症度、睡眠衛生とケア提案を確認できます。",
      method: "最近2週間の睡眠状態に基づいて回答します。約2分で完了します。"
    }
  }
};

const scaleQuestionI18n = {
  bsrs5: {
    en: {
      title: "BSRS-5 Brief Symptom Rating Scale",
      questions: [
        "Recently, have you had poor sleep, such as difficulty falling asleep, waking easily, or waking too early?",
        "Recently, have you felt tense, uneasy, or unable to relax?",
        "Recently, have you felt annoyed, easily angry, or more irritable?",
        "Recently, have you felt low in mood or lacked motivation?",
        "Recently, have you felt inferior to others or less confident?",
        "Recently, have you had thoughts of hurting yourself?"
      ],
      options: ["Not at all", "Mild", "Moderate", "Severe", "Very severe"]
    },
    ja: {
      title: "BSRS-5 簡易健康尺度",
      questions: ["最近、寝つきが悪い、途中で目が覚める、早く目が覚めるなど、睡眠がよくないことがありますか？", "最近、緊張・不安があり、心が落ち着かないことがありますか？", "最近、いらいらしたり、怒りやすくなったりすることがありますか？", "最近、気分が落ち込み、やる気が出ないことがありますか？", "最近、自分は人より劣っている、または自信がないと感じることがありますか？", "最近、自分を傷つけたいと思ったことがありますか？"],
      options: ["まったくない", "軽い", "中程度", "重い", "非常に重い"]
    }
  },
  phq9: {
    en: {
      title: "PHQ-9 Depression Assessment",
      questions: ["Recently, have you had little interest or motivation in doing things?", "Recently, have you felt down, sad, or empty?", "Recently, have you slept poorly, slept too much, or still felt tired after waking?", "Recently, have you felt very tired or low in energy?", "Recently, has your appetite decreased or increased a lot?", "Recently, have you felt like a failure or that you disappointed yourself or your family?", "Recently, have you had trouble concentrating, such as when studying, watching TV, or using your phone?", "Recently, have you moved or spoken very slowly, or felt restless and unable to sit still?", "Recently, have you felt tired of living or had thoughts of hurting yourself?"],
      options: ["Not at all", "Several days", "More than half the days", "Nearly every day"]
    },
    ja: {
      title: "PHQ-9 抑うつ気分評価",
      questions: ["最近、物事に興味がわかない、やる気が出ないことがありますか？", "最近、気分が落ち込む、悲しい、空っぽに感じることがありますか？", "最近、眠れない、寝すぎる、起きても疲れていることがありますか？", "最近、とても疲れている、力が出ないことがありますか？", "最近、食欲が落ちたり、普段よりかなり多く食べたりすることがありますか？", "最近、自分は失敗者だ、または自分や家族を失望させたと感じることがありますか？", "最近、勉強、テレビ、スマホなどに集中しにくいことがありますか？", "最近、動作や話し方が遅くなったり、逆に落ち着かずじっとしていられなかったりしますか？", "最近、生きるのがつらい、または自分を傷つけたいと思ったことがありますか？"],
      options: ["まったくない", "数日", "半分以上の日", "ほぼ毎日"]
    }
  },
  gad7: {
    en: {
      title: "GAD-7 Anxiety Assessment",
      questions: ["Recently, have you often felt nervous, uneasy, or irritable?", "Recently, have you worried continuously and found it hard to stop?", "Recently, have you worried too much about different things?", "Recently, have you found it hard to relax?", "Recently, have you felt restless or unable to sit still?", "Recently, have you become easily annoyed or angered by small things?", "Recently, have you felt as if something bad might happen?"],
      options: ["Not at all", "Several days", "More than half the days", "Nearly every day"]
    },
    ja: {
      title: "GAD-7 不安評価",
      questions: ["最近、緊張、不安、いらいらをよく感じますか？", "最近、心配が止まらず、考えを止めにくいことがありますか？", "最近、さまざまなことを心配しすぎることがありますか？", "最近、リラックスしにくいことがありますか？", "最近、落ち着かず、じっとしていられないことがありますか？", "最近、小さなことで怒りやすい、またはいらいらしやすいことがありますか？", "最近、何か悪いことが起こりそうだと感じることがありますか？"],
      options: ["まったくない", "数日", "半分以上の日", "ほぼ毎日"]
    }
  },
  pss10: {
    en: {
      title: "PSS-10 Perceived Stress Scale",
      questions: [
        "In the last month, have you been upset because of something that happened unexpectedly?",
        "In the last month, have you felt unable to control important things in your life?",
        "In the last month, have you often felt nervous or stressed?",
        "In the last month, have you felt confident about handling your personal problems?",
        "In the last month, have you felt that things were going according to your expectations?",
        "In the last month, have you felt that there were too many things to handle?",
        "In the last month, have you felt able to control irritations in your life?",
        "In the last month, have you felt that things were under your control?",
        "In the last month, have you felt angry because things were outside your control?",
        "In the last month, have you felt difficulties were piling up so much that you could not overcome them?"
      ],
      options: ["Never", "Rarely", "Sometimes", "Often", "Always"]
    },
    ja: {
      title: "PSS-10 知覚ストレス尺度",
      questions: [
        "この1か月で、予期しない出来事のために気分が乱されることがありましたか？",
        "この1か月で、生活の重要なことを自分でコントロールできないと感じることがありましたか？",
        "この1か月で、緊張したりストレスが大きいと感じることがよくありましたか？",
        "この1か月で、生活上の問題に対処できる自信がありましたか？",
        "この1か月で、物事がおおむね期待どおりに進んでいると感じましたか？",
        "この1か月で、やることが多すぎて対応しきれないと感じましたか？",
        "この1か月で、生活上の悩みをコントロールできると感じましたか？",
        "この1か月で、物事が自分の管理下にあると感じましたか？",
        "この1か月で、コントロールできないことのために腹が立つことがありましたか？",
        "この1か月で、困難が積み重なり、耐えられないと感じることがありましたか？"
      ],
      options: ["まったくない", "ほとんどない", "ときどき", "よくある", "いつも"]
    }
  },
  who5: {
    en: { title: "WHO-5 Well-being Index", questions: ["Over the last two weeks, I have felt cheerful and in good spirits.", "Over the last two weeks, I have felt calm and relaxed.", "Over the last two weeks, I have felt active and energetic.", "Over the last two weeks, I woke up feeling fresh and rested.", "Over the last two weeks, my daily life has been filled with things that interest me."], options: ["At no time", "Less than half", "More than half", "Most of the time", "All of the time"] },
    ja: { title: "WHO-5 幸福感尺度", questions: ["最近2週間、気分がよく、精神的にも元気だと感じました。", "最近2週間、心が落ち着き、リラックスしていると感じました。", "最近2週間、活力があり元気だと感じました。", "最近2週間、朝起きた時に休めた感じがあり、すっきりしていました。", "最近2週間、生活の中に興味や期待を感じることがありました。"], options: ["まったくない", "半分未満", "半分以上", "ほとんどの時間", "いつも"] }
  },
  isi: {
    en: { title: "ISI Insomnia Severity Index", questions: ["During the past two weeks, how severe was your difficulty falling asleep?", "During the past two weeks, how severe was your difficulty staying asleep?", "During the past two weeks, how severe was your problem waking too early?", "How satisfied are you with your recent sleep pattern?", "How much do sleep problems interfere with your daily functioning?", "How noticeable to others is your sleep problem in terms of impairing your quality of life?", "How worried or distressed are you about your sleep problem?"], options: ["None", "Mild", "Moderate", "Severe", "Very severe"] },
    ja: { title: "ISI 不眠重症度尺度", questions: ["最近2週間、寝つきの悪さはどの程度でしたか？", "最近2週間、夜中に目が覚める、眠りが浅い程度はどのくらいでしたか？", "最近2週間、早く目が覚めて眠れない程度はどのくらいでしたか？", "最近の睡眠状態に満足していますか？", "睡眠問題は授業・仕事・記憶力・集中力・気分などの日常生活に影響していますか？", "睡眠問題によって生活の質が低下していると他人に気づかれていますか？", "最近、睡眠問題について心配したり困ったりしていますか？"], options: ["まったくない", "軽い", "中程度", "重い", "非常に重い"] }
  }
};

function getScaleUiText(key, replacements = {}) {
  let text = (scaleUiI18n[currentLanguage] && scaleUiI18n[currentLanguage][key]) || scaleUiI18n.zh[key] || "";
  Object.keys(replacements).forEach(k => {
    text = text.replace(`{${k}}`, replacements[k]);
  });
  return text;
}

function getLocalizedScaleIntro(type) {
  const base = scaleIntroData[type];
  if (!base) return null;
  if (currentLanguage === "zh") return base;
  return { ...base, ...(scaleIntroI18n[type]?.[currentLanguage] || {}) };
}

function getLocalizedScaleInfo(type) {
  const base = scaleData[type];
  if (!base) return null;
  if (currentLanguage === "zh") return base;
  return { ...base, ...(scaleQuestionI18n[type]?.[currentLanguage] || {}) };
}

function showScaleIntro(type) {
  const intro = getLocalizedScaleIntro(type);

  if (!intro) {
    startScale(type);
    return;
  }

  pendingScaleType = type;

  const setText = (id, value) => {
    const el = document.getElementById(id);
    if (el) el.textContent = value || "";
  };

  setText("intro-icon", intro.icon);
  setText("intro-title", intro.title);
  setText("intro-subtitle", intro.subtitle);
  setText("intro-purpose", intro.purpose);
  setText("intro-meaning", intro.meaning);
  setText("intro-result", intro.result);
  setText("intro-method", intro.method);

  const introCard = document.querySelector("#scaleIntroModal .scale-intro-card");
  if (introCard) {
    const headings = introCard.querySelectorAll(".intro-box h3");
    if (headings[0]) headings[0].textContent = getScaleUiText("purpose");
    if (headings[1]) headings[1].textContent = getScaleUiText("meaning");
    if (headings[2]) headings[2].textContent = getScaleUiText("result");
    if (headings[3]) headings[3].textContent = getScaleUiText("method");
    const note = introCard.querySelector(".intro-note");
    if (note) note.textContent = getScaleUiText("note");
  }

  const cancelBtn = document.querySelector("#scaleIntroModal .intro-cancel-btn");
  if (cancelBtn) cancelBtn.textContent = getScaleUiText("notNow");

  const startBtn = document.getElementById("intro-start-btn");
  if (startBtn) startBtn.textContent = getScaleUiText("startTest");
  if (startBtn) {
    startBtn.onclick = function () {
      const typeToStart = pendingScaleType;
      closeScaleIntro();
      if (typeToStart) startScale(typeToStart);
    };
  }

  const modal = document.getElementById("scaleIntroModal");
  if (modal) modal.classList.remove("hidden");
}

function closeScaleIntro() {
  const modal = document.getElementById("scaleIntroModal");
  if (modal) modal.classList.add("hidden");
  pendingScaleType = "";
}

function confirmStartScale() {
  const type = pendingScaleType;
  closeScaleIntro();
  if (type) startScale(type);
}

function showScaleSelect() {
  const warningPanel = document.getElementById("mood-warning-panel");
  const scaleSelectPanel = document.getElementById("scale-select-panel");
  const scaleQuestionPanel = document.getElementById("scale-question-panel");
  const scaleResultPanel = document.getElementById("scale-result-panel");

  if (warningPanel) warningPanel.style.display = "block";
  if (scaleSelectPanel) scaleSelectPanel.style.display = "block";
  if (scaleQuestionPanel) scaleQuestionPanel.style.display = "none";
  if (scaleResultPanel) {
    scaleResultPanel.style.display = "none";
    resetResultThemeClass(scaleResultPanel);
  }
  document.body.classList.remove("scale-result-open");

  if (scaleSelectPanel) {
    scaleSelectPanel.scrollIntoView({ behavior: "auto", block: "start" });
  }
}

function startScale(type) {
  currentScale = type;
  currentQuestionIndex = 0;
  scaleAnswers = [];

  const scaleSelectPanel = document.getElementById("scale-select-panel");
  const scaleQuestionPanel = document.getElementById("scale-question-panel");
  const scaleResultPanel = document.getElementById("scale-result-panel");

  if (scaleSelectPanel) scaleSelectPanel.style.display = "none";
  if (scaleQuestionPanel) scaleQuestionPanel.style.display = "block";
  if (scaleResultPanel) {
    scaleResultPanel.style.display = "none";
    resetResultThemeClass(scaleResultPanel);
  }
  document.body.classList.remove("scale-result-open");

  renderScaleQuestion();

  if (scaleQuestionPanel) {
    scaleQuestionPanel.scrollIntoView({ behavior: "auto", block: "start" });
  }
}

function renderScaleQuestion() {
  const scale = getLocalizedScaleInfo(currentScale);
  if (!scale) return;

  const titleEl = document.getElementById("scale-title");
  const countEl = document.getElementById("scale-question-count");
  const questionEl = document.getElementById("scale-question-text");
  const progressEl = document.getElementById("scale-progress-bar");
  const optionsBox = document.getElementById("scale-options");
  const prevBtn = document.getElementById("prev-scale-btn");
  const nextBtn = document.getElementById("next-scale-btn");

  if (titleEl) titleEl.textContent = scale.title;
  if (countEl) {
    countEl.textContent = getScaleUiText("questionCount", { current: currentQuestionIndex + 1, total: scale.questions.length });
  }
  if (questionEl) questionEl.textContent = scale.questions[currentQuestionIndex];

  const progressPercent = ((currentQuestionIndex + 1) / scale.questions.length) * 100;
  if (progressEl) progressEl.style.width = progressPercent + "%";

  if (optionsBox) {
    optionsBox.innerHTML = "";

    scale.options.forEach((option, index) => {
      const btn = document.createElement("button");
      btn.type = "button";

      // 中文原始資料是 { text, score }，英文／日文翻譯可能只是字串。
      // 因此統一正規化，避免出現 undefined，也避免按鈕無法選取。
      const optionText = typeof option === "string" ? option : option?.text;
      const optionScore = Number.isFinite(Number(option?.score)) ? Number(option.score) : index;

      btn.textContent = `${optionText || ""} (${optionScore} ${getScaleUiText("points")})`;
      btn.dataset.score = String(optionScore);

      if (scaleAnswers[currentQuestionIndex] === optionScore) {
        btn.classList.add("selected");
      }

      btn.onclick = function () {
        scaleAnswers[currentQuestionIndex] = optionScore;
        renderScaleQuestion();
      };

      optionsBox.appendChild(btn);
    });
  }

  if (prevBtn) {
    prevBtn.style.display = currentQuestionIndex === 0 ? "none" : "inline-block";
    prevBtn.textContent = getScaleUiText("prev");
  }

  if (nextBtn) {
    nextBtn.textContent =
      currentQuestionIndex === scale.questions.length - 1 ? getScaleUiText("viewResult") : getScaleUiText("next");
  }
}

function nextScaleQuestion() {
  const scale = getLocalizedScaleInfo(currentScale);
  if (!scale) return;

  if (scaleAnswers[currentQuestionIndex] === undefined) {
    alert(getScaleUiText("chooseAlert"));
    return;
  }

  if (currentQuestionIndex < scale.questions.length - 1) {
    currentQuestionIndex++;
    renderScaleQuestion();
  } else {
    showScaleResult();
  }
}

function prevScaleQuestion() {
  if (currentQuestionIndex > 0) {
    currentQuestionIndex--;
    renderScaleQuestion();
  }
}

function showScaleResult() {
  const scale = getLocalizedScaleInfo(currentScale);
  if (!scale) return;

  const score = scaleAnswers.reduce((sum, value) => sum + value, 0);
  const [level, suggestion] = scale.getLevel(score);
  const ranges = scaleRangeData[currentScale] || [];
  const matchedRange = getRangeMatch(ranges, score);
  const tone = matchedRange?.tone || "mild";

  const questionPanel = document.getElementById("scale-question-panel");
  const resultPanel = document.getElementById("scale-result-panel");

  if (questionPanel) questionPanel.style.display = "none";
  if (resultPanel) {
    resultPanel.style.display = "block";
    resultPanel.className = `scale-result-panel ${getScaleThemeClass(currentScale)} is-visible`;
  }
  document.body.classList.add("scale-result-open");

  const titleEl = document.getElementById("scale-result-title");
  const scoreEl = document.getElementById("scale-score");
  const levelEl = document.getElementById("scale-level");
  const captionEl = document.getElementById("scale-score-caption");
  const suggestionEl = document.getElementById("scale-suggestion");
  const rangeBox = document.getElementById("scale-range-result");

  if (titleEl) titleEl.textContent = `${scale.title} ${getScaleUiText("resultSuffix")}`;

  if (scoreEl) {
    scoreEl.innerHTML = `
      <span class="score-label">你的分數</span>
      <span class="score-main">${score}</span>
      <span class="score-total">/ ${scale.total}</span>
    `;
    scoreEl.setAttribute("data-tone", tone);
    const scoreCircle = scoreEl.closest(".score-circle");
    if (scoreCircle) scoreCircle.setAttribute("data-tone", tone);
  }

  if (levelEl) {
    levelEl.textContent = level;
    levelEl.className = `result-badge tone-${tone}`;
  }

  if (captionEl) {
    captionEl.innerHTML = `你的分數是 <strong>${score} 分</strong>，目前落在 <strong>${level}</strong> 區間。`;
  }

  if (suggestionEl) suggestionEl.innerHTML = suggestion;

  if (rangeBox) {
    rangeBox.innerHTML = `
      <div class="range-header">
        <h4>分數區間參考</h4>
        <p>已用顏色標示你目前所在的區間，方便快速辨識。</p>
      </div>
      <div class="scale-range-grid">
        ${ranges.map(item => {
          const active = matchedRange === item;
          return `
            <div class="range-card tone-${item.tone} ${active ? "active" : ""}">
              <div class="range-score">${item.range}</div>
              <div class="range-label">${item.label}</div>
              ${active ? `<div class="range-current">目前分數：${score} 分</div>` : ""}
            </div>
          `;
        }).join("")}
      </div>
    `;
  }

  if (resultPanel) resultPanel.scrollTop = 0;
}

function closeScaleResult() {
  const scaleSelectPanel = document.getElementById("scale-select-panel");
  const scaleQuestionPanel = document.getElementById("scale-question-panel");
  const resultPanel = document.getElementById("scale-result-panel");

  if (resultPanel) {
    resultPanel.style.display = "none";
    resetResultThemeClass(resultPanel);
  }
  if (scaleQuestionPanel) scaleQuestionPanel.style.display = "none";
  if (scaleSelectPanel) scaleSelectPanel.style.display = "block";

  document.body.classList.remove("scale-result-open");
}

function restartScale() {
  if (!currentScale) return;
  const type = currentScale;
  currentQuestionIndex = 0;
  scaleAnswers = [];
  startScale(type);
}

function saveScaleResult() {
  const scale = scaleData[currentScale];
  if (!scale) return;

  const score = scaleAnswers.reduce((sum, value) => sum + value, 0);
  const [level, suggestion] = scale.getLevel(score);

  const result = {
    date: new Date().toLocaleString("zh-TW"),
    mood: selectedMood,
    scale: scale.title,
    score,
    total: scale.total,
    level,
    suggestion
  };

  const records = JSON.parse(localStorage.getItem("moodScaleRecords")) || [];
  records.push(result);

  // 情緒量表結果只存進 moodScaleRecords，不更新 AI 健康分數與首頁分析卡片。
  localStorage.setItem("moodScaleRecords", JSON.stringify(records));

  alert("情緒評估結果已儲存！可自行回到量表選擇頁查看歷史紀錄。");
}



function getRandomQuestions(questionBank, count = 10) {
  const shuffled = [...questionBank].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, Math.min(count, shuffled.length));
}


function showScaleHistory() {
  const records = JSON.parse(localStorage.getItem("moodScaleRecords")) || [];
  const list = document.getElementById("scale-history-list");

  if (!list) {
    alert("找不到歷史紀錄區塊，請確認 index.html 有 scale-history-list。");
    return;
  }

  if (records.length === 0) {
    list.innerHTML = `
      <div class="empty-history">
        目前還沒有評估紀錄。<br>
        完成量表並按下「儲存評估結果」後，紀錄會顯示在這裡。
      </div>
    `;
  } else {
    list.innerHTML = records
      .slice()
      .reverse()
      .map(record => {
        const scoreText = `${record.score ?? "--"} / ${record.total ?? "--"}`;
        const moodText = record.mood || "未記錄";
        const levelText = record.level || "未記錄";
        return `
          <div class="scale-history-card">
            <div class="history-date">${record.date || "未記錄日期"}</div>
            <h4>${record.scale || record.scaleName || record.title || "心理量表"}</h4>
            <p><strong>分數：</strong>${scoreText}</p>
            <p><strong>結果：</strong>${levelText}</p>
            <p><strong>當時心情：</strong>${moodText}</p>
          </div>
        `;
      })
      .join("");
  }

  const warningPanel = document.getElementById("mood-warning-panel");
  const selectPanel = document.getElementById("scale-select-panel");
  const questionPanel = document.getElementById("scale-question-panel");
  const resultPanel = document.getElementById("scale-result-panel");
  const historyPanel = document.getElementById("scale-history-panel");

  if (warningPanel) warningPanel.style.display = "none";
  if (selectPanel) selectPanel.style.display = "none";
  if (questionPanel) questionPanel.style.display = "none";
  if (resultPanel) {
    resultPanel.style.display = "none";
    resultPanel.classList.remove("is-visible");
  }
  if (historyPanel) historyPanel.style.display = "block";

  document.body.classList.remove("scale-result-open");

  if (historyPanel) {
    historyPanel.scrollIntoView({ behavior: "auto", block: "start" });
  }
}

function hideScaleHistory() {
  const historyPanel = document.getElementById("scale-history-panel");
  const selectPanel = document.getElementById("scale-select-panel");

  if (historyPanel) historyPanel.style.display = "none";
  if (selectPanel) {
    selectPanel.style.display = "block";
    selectPanel.scrollIntoView({ behavior: "auto", block: "start" });
  }
}

function clearScaleHistory() {
  if (!confirm("確定要清除所有評估紀錄嗎？")) return;

  localStorage.removeItem("moodScaleRecords");
  showScaleHistory();
}

/* =========================================================
   互動式衛教助理：大按鈕 → 小按鈕 → 衛教內容
   依使用者需求：移除打字流程，改為像 LINE 對話的按鈕互動
========================================================= */

const healthTopicGroups = [
  {
    key: "emergency",
    icon: "",
    title: "緊急狀況",
    subtitle: "胸痛、中風、呼吸喘等警訊",
    items: ["何時打119", "胸痛警訊", "中風警訊", "呼吸喘", "頭痛警訊", "頭暈處理", "發燒處理", "中暑處理", "低體溫"]
  },
  {
    key: "injury",
    icon: "",
    title: "受傷怎麼辦",
    subtitle: "傷口、燙傷、骨折、跌倒",
    items: ["傷口照護", "燙傷處理", "骨折處理", "跌倒處理", "膝蓋疼痛", "足部照護", "背痛照護"]
  },
  {
    key: "chronic",
    icon: "",
    title: "慢性病照顧",
    subtitle: "血壓、血糖、心腎與用藥",
    items: ["高血壓照護", "量血壓方法", "血糖管理", "膽固醇", "心臟保健", "腎臟保健", "水腫照護", "尿路感染", "用藥安全"]
  },
  {
    key: "food",
    icon: "",
    title: "吃喝與腸胃",
    subtitle: "飲食、水分、胃腸不適",
    items: ["低鹽飲食", "均衡飲食", "喝水建議", "體重控制", "胃痛照護", "腹瀉處理", "嘔吐處理", "便秘照護"]
  },
  {
    key: "cold",
    icon: "",
    title: "感冒呼吸",
    subtitle: "感冒、咳嗽、鼻過敏",
    items: ["感冒照護", "咳嗽照護", "呼吸喘", "鼻過敏", "發燒處理"]
  },
  {
    key: "home",
    icon: "",
    title: "居家安全",
    subtitle: "防跌、清潔、感染預防",
    items: ["手部衛生", "感染預防", "浴室防跌", "居家安全", "口腔清潔"]
  },
  {
    key: "elder",
    icon: "",
    title: "長輩照顧",
    subtitle: "長者、臥床、吞嚥照護",
    items: ["長者照護", "視力照護", "聽力照護", "臥床照護", "壓瘡預防", "吞嚥照護", "口腔清潔"]
  },
  {
    key: "mind",
    icon: "",
    title: "睡眠與心情",
    subtitle: "睡眠、壓力、焦慮憂鬱",
    items: ["睡眠照護", "焦慮情緒", "憂鬱警訊", "壓力調適", "運動建議"]
  }
];

function escapeHtml(text) {
  return String(text || "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function getHealthQuestionByTitle(title) {
  return healthQuestions.find(item => item.title === title);
}

/* 覆蓋原本熱門問題：現在只顯示大按鈕 */
function renderHotQuestions() {
  const container = document.getElementById("hotQuestionScroll");
  if (!container) return;

  container.innerHTML = "";

  healthTopicGroups.forEach(group => {
    const button = document.createElement("button");
    button.className = "hot-question-btn main-topic-btn";
    button.dataset.topic = group.key;
    button.innerHTML = `
      <span class="main-topic-title">${group.title}</span>
      <small>${group.subtitle}</small>
    `;

    button.addEventListener("click", () => selectHealthTopic(group.key));
    container.appendChild(button);
  });
}

function selectHealthTopic(topicKey) {
  const group = healthTopicGroups.find(item => item.key === topicKey);
  if (!group) return;

  document.querySelectorAll(".main-topic-btn").forEach(btn => {
    btn.classList.toggle("active", btn.dataset.topic === topicKey);
  });

  addUserChatMessage(group.title);
  addDoctorChatMessage(`您選擇了「${group.title}」。請再點選下方想了解的小主題，我會提供對應的衛教內容。`);
  addSubTopicButtons(group);
}

function addDoctorChatMessage(text) {
  const chatBox = document.getElementById("aiChatBox");
  if (!chatBox) return;

  const row = document.createElement("div");
  row.className = "doctor-row";
  row.innerHTML = `
    <img src="images/doctor.png" class="chat-doctor-avatar" alt="醫生頭像">
    <div class="doctor-bubble">${escapeHtml(text)}</div>
  `;

  chatBox.appendChild(row);
  scrollAiChatToBottom();
}

function addUserChatMessage(text) {
  const chatBox = document.getElementById("aiChatBox");
  if (!chatBox) return;

  const row = document.createElement("div");
  row.className = "user-row";
  row.innerHTML = `<div class="patient-bubble">${escapeHtml(text)}</div>`;

  chatBox.appendChild(row);
  scrollAiChatToBottom();
}

function addSubTopicButtons(group) {
  const chatBox = document.getElementById("aiChatBox");
  if (!chatBox) return;

  const panel = document.createElement("div");
  panel.className = "sub-topic-panel";

  group.items.forEach(title => {
    const item = getHealthQuestionByTitle(title);
    const btn = document.createElement("button");
    btn.className = "sub-topic-btn";
    btn.innerHTML = `<span>${title}</span>`;

    btn.addEventListener("click", () => {
      addUserChatMessage(title);
      showHealthEducationCard(title);
    });

    panel.appendChild(btn);
  });

  chatBox.appendChild(panel);
  scrollAiChatToBottom();
}

function showHealthEducationCard(title) {
  const chatBox = document.getElementById("aiChatBox");
  if (!chatBox) return;

  const item = getHealthQuestionByTitle(title) || {
    title,
    principle: "這個主題可提供基礎衛教說明，協助你先理解可能原因，再依照狀況採取合適處理。",
    care: "可以先觀察症狀出現的時間、嚴重程度與是否持續惡化，並保持休息、補充水分，避免刺激或加重症狀的因素。若症狀持續、反覆發生或已經影響日常生活，建議安排就醫評估。",
    warning: "若出現意識不清、呼吸困難、胸痛、大量出血或症狀快速惡化，請立即撥打119或就醫。"
  };

  const card = document.createElement("div");
  card.className = "education-card-message detailed-education-card";

  const careText = item.care || (item.steps || []).join(" ") || "建議先觀察症狀變化，保持休息並避免加重不適的因素；若症狀持續或惡化，應安排就醫評估。";

  card.innerHTML = `
    <div class="education-card-title">
      <strong>${escapeHtml(item.title || title)}</strong>
    </div>

    <div class="health-section">
      <h4>為什麼會這樣？</h4>
      <p>${escapeHtml(item.principle || item.answer || "")}</p>
    </div>

    <div class="health-section">
      <h4>你可以怎麼做？</h4>
      <p>${escapeHtml(careText)}</p>
    </div>

    <div class="education-card-reminder health-warning">
      <h4>什麼情況要就醫？</h4>
      <p>${escapeHtml(item.warning || "若症狀嚴重、持續惡化，或出現胸痛、呼吸困難、意識不清、大量出血等情況，請立即就醫或撥打119。")}</p>
    </div>
  `;

  chatBox.appendChild(card);
  scrollAiChatToBottom();
}

function scrollAiChatToBottom() {
  const chatBox = document.getElementById("aiChatBox");
  if (!chatBox) return;

  chatBox.scrollTo({
    top: chatBox.scrollHeight,
    behavior: "auto"
  });
}

/* 保留舊函式名稱，但不再依賴輸入框 */
function fillHealthQuestion(index) {
  const item = healthQuestions[index];
  if (!item) return;
  addUserChatMessage(item.title);
  showHealthEducationCard(item.title);
}


/* ============================= */
/* 健康趨勢分析：身體數值＋心理量表 */
/* ============================= */
const trendCategories = {
  body: {
    title: "身體數值",
    metrics: [
      { key: "bmi", name: "BMI", unit: "kg/m²" },
      { key: "bloodPressure", name: "血壓", unit: "mmHg" },
      { key: "pulse", name: "脈搏", unit: "bpm" },
      { key: "chest", name: "胸圍", unit: "cm" },
      { key: "waist", name: "腰圍", unit: "cm" },
      { key: "hip", name: "臀圍", unit: "cm" }
    ]
  },
  mind: {
    title: "心理情緒",
    metrics: [
      { key: "brs5", name: "BRS-5", unit: "分" },
      { key: "phq9", name: "PHQ-9", unit: "分" },
      { key: "gad7", name: "GAD-7", unit: "分" },
      { key: "who5", name: "WHO-5", unit: "分" }
    ]
  },
  sleep: {
    title: "壓力睡眠",
    metrics: [
      { key: "pss10", name: "PSS-10", unit: "分" },
      { key: "isi", name: "ISI", unit: "分" }
    ]
  }
};

let selectedTrendCategory = "body";
let selectedTrendMetric = "bmi";
let selectedTrendPeriod = "today";
let trendDashboardReady = false;

function initTrendDashboard() {
  const dashboard = document.querySelector(".trend-dashboard");
  if (!dashboard || trendDashboardReady) return;
  trendDashboardReady = true;

  renderTrendMetricButtons();
  updateTrendDashboard();

  document.querySelectorAll(".trend-category-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      selectedTrendCategory = btn.dataset.category || "body";
      selectedTrendMetric = trendCategories[selectedTrendCategory].metrics[0].key;
      selectedTrendPeriod = "today";

      document.querySelectorAll(".trend-category-btn").forEach(item => {
        item.classList.toggle("active", item === btn);
      });

      document.querySelectorAll(".trend-period-btn").forEach(item => {
        item.classList.toggle("active", item.dataset.period === "today");
      });

      renderTrendMetricButtons();
      updateTrendDashboard();
    });
  });

  document.querySelectorAll(".trend-period-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      selectedTrendPeriod = btn.dataset.period || "today";

      document.querySelectorAll(".trend-period-btn").forEach(item => {
        item.classList.toggle("active", item === btn);
      });

      updateTrendDashboard();
    });
  });
}

function renderTrendMetricButtons() {
  const container = document.getElementById("trendMetricButtons");
  if (!container) return;

  container.innerHTML = "";
  const metrics = trendCategories[selectedTrendCategory]?.metrics || [];

  metrics.forEach(metric => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "trend-metric-btn";
    button.textContent = metric.name;
    button.dataset.metric = metric.key;

    if (metric.key === selectedTrendMetric) button.classList.add("active");

    button.addEventListener("click", () => {
      selectedTrendMetric = metric.key;
      selectedTrendPeriod = "today";

      document.querySelectorAll(".trend-metric-btn").forEach(item => {
        item.classList.toggle("active", item === button);
      });

      document.querySelectorAll(".trend-period-btn").forEach(item => {
        item.classList.toggle("active", item.dataset.period === "today");
      });

      updateTrendDashboard();
    });

    container.appendChild(button);
  });
}

function updateTrendDashboard() {
  const metric = getCurrentTrendMetric();
  if (!metric) return;

  const title = document.getElementById("trendChartTitle");
  const name = document.getElementById("summaryMetricName");
  const value = document.getElementById("summaryMetricValue");
  const unit = document.getElementById("summaryMetricUnit");
  const level = document.getElementById("summaryLevel");
  const text = document.getElementById("summaryText");

  if (!title || !name || !value || !unit || !level || !text) return;

  const periodName = selectedTrendPeriod === "today" ? "今日分析" : "本月分析";
  const trend = getTrendValues(selectedTrendMetric, selectedTrendPeriod);
  const summary = getTrendSummary(selectedTrendMetric, trend.values, trend.extra);

  title.textContent = `${metric.name}｜${periodName}`;
  name.textContent = metric.name;
  value.textContent = summary.value;
  unit.textContent = metric.unit;

  const chartUnit = document.getElementById("trendChartUnit");
  if (chartUnit) {
    chartUnit.textContent = `(${metric.unit})`;
  }

  level.textContent = summary.level;
  level.className = `summary-level ${summary.status}`;
  text.textContent = summary.text;

  drawTrendChart(selectedTrendMetric, trend);
}

function getCurrentTrendMetric() {
  const metrics = trendCategories[selectedTrendCategory]?.metrics || [];
  return metrics.find(item => item.key === selectedTrendMetric);
}

function getTrendValues(metricKey, period) {
  if (selectedTrendCategory === "body") {
    return getBodyTrendValues(metricKey, period);
  }
  return getScaleTrendValues(metricKey, period);
}

function getBodyTrendValues(metricKey, period) {
  const history = JSON.parse(localStorage.getItem("healthHistory")) || [];
  const today = new Date().toISOString().slice(0, 10);
  const month = new Date().toISOString().slice(0, 7);

  let records = history.filter(item => {
    if (!item || !item.date) return false;
    if (period === "today") return item.date === today;
    return String(item.date).startsWith(month);
  });

  if (metricKey === "bloodPressure") {
    const systolicRecords = records.filter(item => isFiniteNumber(item.systolic));
    const diastolicRecords = records.filter(item => isFiniteNumber(item.diastolic));

    return {
      values: systolicRecords.map(item => Number(item.systolic)),
      labels: systolicRecords.map((item, index) => getRecordLabel(item, index, period)),
      extra: {
        systolic: systolicRecords.map(item => Number(item.systolic)),
        diastolic: diastolicRecords.map(item => Number(item.diastolic)),
        labels: systolicRecords.map((item, index) => getRecordLabel(item, index, period))
      }
    };
  }

  records = records.filter(item => isFiniteNumber(item[metricKey]));

  return {
    values: records.map(item => Number(item[metricKey])),
    labels: records.map((item, index) => getRecordLabel(item, index, period)),
    extra: {}
  };
}

function getScaleTrendValues(metricKey, period) {
  const records = JSON.parse(localStorage.getItem("moodScaleRecords")) || [];
  const today = new Date();
  const targetDate = today.toISOString().slice(0, 10);
  const targetMonth = today.toISOString().slice(0, 7);
  const scaleNames = getScaleNameMap();

  let matched = records.filter(record => {
    const key = getScaleKeyFromRecord(record, scaleNames);
    if (key !== metricKey) return false;

    const date = parseRecordDate(record.date);
    if (!date) return true;

    const iso = toLocalISODate(date);
    if (period === "today") return iso === targetDate;
    return iso.startsWith(targetMonth);
  });

  return {
    values: matched.map(item => Number(item.score)).filter(num => !Number.isNaN(num)),
    labels: matched.map((item, index) => {
      const date = parseRecordDate(item.date);
      if (period === "today") return `${index + 1}`;
      return date ? `${date.getMonth() + 1}/${date.getDate()}` : `${index + 1}`;
    }),
    extra: {}
  };
}

function getScaleNameMap() {
  return {
    brs5: ["BRS-5", "身心壓力"],
    phq9: ["PHQ-9", "憂鬱"],
    gad7: ["GAD-7", "焦慮"],
    pss10: ["PSS-10", "壓力感受"],
    who5: ["WHO-5", "幸福感"],
    isi: ["ISI", "失眠"]
  };
}

function getScaleKeyFromRecord(record, scaleNames) {
  const text = `${record.scale || ""} ${record.title || ""}`;
  return Object.keys(scaleNames).find(key => {
    return scaleNames[key].some(name => text.includes(name));
  }) || "";
}

function getRecordLabel(item, index, period) {
  if (period === "today") return `${index + 1}`;
  return item.date ? String(item.date).slice(5) : `${index + 1}`;
}

function getTrendSummary(metricKey, values, extra = {}) {
  if (metricKey === "bloodPressure") {
    const systolic = extra.systolic || [];
    const diastolic = extra.diastolic || [];

    if (systolic.length === 0 || diastolic.length === 0) {
      return noDataSummary("血壓");
    }

    const avgSys = Math.round(average(systolic));
    const avgDia = Math.round(average(diastolic));
    const level = getBloodPressureLevel(avgSys, avgDia);

    return {
      value: `${avgSys}/${avgDia}`,
      level: level.label,
      status: level.status,
      text: level.text
    };
  }

  if (!values || values.length === 0) {
    const metric = getCurrentTrendMetric();
    return noDataSummary(metric?.name || "此項目");
  }

  const latest = values[values.length - 1];
  const rounded = roundValue(latest);

  const summaryMap = {
    bmi: getBmiSummary(latest),
    pulse: getPulseSummary(latest),
    chest: getBodyCircumferenceSummary("胸圍", latest),
    waist: getWaistSummary(latest),
    hip: getBodyCircumferenceSummary("臀圍", latest),
    brs5: getBRS5Summary(latest),
    phq9: getPHQ9Summary(latest),
    gad7: getGAD7Summary(latest),
    pss10: getPSS10Summary(latest),
    who5: getWHO5Summary(latest),
    isi: getISISummary(latest)
  };

  const result = summaryMap[metricKey] || {
    level: "參考值",
    status: "normal",
    text: "目前已有紀錄，建議持續追蹤變化趨勢。"
  };

  return {
    value: String(rounded),
    ...result
  };
}

function noDataSummary(name) {
  return {
    value: "--",
    level: "尚無資料",
    status: "warning",
    text: `${name} 目前沒有足夠紀錄可以分析。請先新增今日紀錄或完成量表，系統就會顯示折線趨勢與程度解讀。`
  };
}

function getBmiSummary(value) {
  if (value < 18.5) return { level: "過輕", status: "warning", text: "目前 BMI 偏低，建議觀察飲食量、體重變化與精神狀態，必要時可諮詢營養或醫療專業。" };
  if (value < 24) return { level: "正常", status: "normal", text: "目前 BMI 落在正常範圍，建議維持均衡飲食、規律活動與穩定作息。" };
  if (value < 27) return { level: "過重", status: "warning", text: "目前 BMI 落在過重範圍，建議搭配腰圍觀察腹部脂肪，並逐步調整飲食與活動量。" };
  return { level: "肥胖", status: "danger", text: "目前 BMI 偏高，建議持續追蹤體重與腰圍，並考慮尋求醫療或營養專業協助。" };
}

function getBloodPressureLevel(sys, dia) {
  if (sys >= 140 || dia >= 90) return { label: "偏高", status: "danger", text: "目前平均血壓偏高，建議固定時間量測、減少鹽分與刺激性飲食；若持續偏高或合併胸痛、頭暈、喘，請就醫評估。" };
  if (sys >= 130 || dia >= 80) return { label: "稍高", status: "warning", text: "目前平均血壓略高，建議持續追蹤，並注意睡眠、壓力、鹽分攝取與規律運動。" };
  return { label: "正常", status: "normal", text: "目前平均血壓在理想範圍，建議持續定期量測並維持良好生活習慣。" };
}

function getPulseSummary(value) {
  if (value < 60) return { level: "偏慢", status: "warning", text: "目前脈搏偏慢，若伴隨頭暈、胸悶、虛弱或昏倒，建議就醫評估。" };
  if (value <= 100) return { level: "正常", status: "normal", text: "目前脈搏落在一般正常範圍，建議持續觀察休息時與活動後的變化。" };
  return { level: "偏快", status: "warning", text: "目前脈搏偏快，可能與緊張、發燒、咖啡因或身體不適有關；若合併胸悶、喘或心悸，建議就醫。" };
}

function getBodyCircumferenceSummary(name, value) {
  return { level: "參考值", status: "normal", text: `${name} 主要用來觀察身體圍度變化，建議固定時間、固定姿勢與相同量尺測量，並搭配體重與腰圍一起判斷。` };
}

function getWaistSummary(value) {
  if (value >= 90) return { level: "需注意", status: "warning", text: "目前腰圍較高，可能代表腹部脂肪累積較多，建議搭配體重、飲食與運動狀況一起調整。" };
  return { level: "參考值", status: "normal", text: "腰圍能反映腹部脂肪與身體圍度變化，建議固定時間與方式定期追蹤。" };
}

function getBRS5Summary(score) {
  if (score <= 5) return { level: "正常範圍", status: "normal", text: "目前身心壓力分數較低，整體狀態大致穩定，建議持續維持規律作息與休息。" };
  if (score <= 9) return { level: "輕度心理困擾", status: "warning", text: "目前可能有一些壓力或情緒波動，建議先安排休息、減少壓力來源並觀察變化。" };
  if (score <= 14) return { level: "中度心理困擾", status: "warning", text: "目前壓力與情緒狀態值得關注，建議持續記錄變化並考慮尋求輔導或專業協助。" };
  return { level: "重度心理困擾", status: "danger", text: "目前心理負荷可能較明顯，建議盡快尋求心理師、身心科或學校輔導資源支持。" };
}

function getPHQ9Summary(score) {
  if (score <= 4) return { level: "無明顯憂鬱", status: "normal", text: "目前憂鬱情緒分數較低，建議持續維持規律作息、活動與社交支持。" };
  if (score <= 9) return { level: "輕度憂鬱", status: "warning", text: "目前有輕度憂鬱情緒傾向，建議觀察情緒、睡眠、食慾與生活動力變化。" };
  if (score <= 14) return { level: "中度憂鬱", status: "warning", text: "目前憂鬱情緒較明顯，若已影響生活功能，建議與心理師、輔導老師或醫療專業討論。" };
  if (score <= 19) return { level: "中重度憂鬱", status: "danger", text: "目前情緒困擾可能已明顯影響生活品質，建議盡快尋求專業協助。" };
  return { level: "重度憂鬱", status: "danger", text: "目前分數偏高，建議立即尋求身心科、心理師或急診等專業協助。若有自傷想法請立刻撥打119或1925。" };
}

function getGAD7Summary(score) {
  if (score <= 4) return { level: "無明顯焦慮", status: "normal", text: "目前焦慮分數較低，建議持續維持穩定作息、休息與壓力紀錄。" };
  if (score <= 9) return { level: "輕度焦慮", status: "warning", text: "目前有輕度焦慮傾向，可以先練習放鬆、規律作息，並減少讓自己緊繃的刺激來源。" };
  if (score <= 14) return { level: "中度焦慮", status: "warning", text: "目前焦慮反應較明顯，建議觀察發生情境與頻率，並考慮尋求專業協助。" };
  return { level: "重度焦慮", status: "danger", text: "目前焦慮程度偏高，若已影響睡眠、生活或安全感，建議盡快尋求心理或醫療專業協助。" };
}

function getPSS10Summary(score) {
  if (score <= 13) return { level: "低壓力", status: "normal", text: "目前主觀壓力感受較低，建議持續維持規律作息、適度運動與穩定支持。" };
  if (score <= 26) return { level: "中度壓力", status: "warning", text: "目前壓力感受中等，建議安排固定休息時間、拆解待辦事項並練習放鬆。" };
  return { level: "高壓力", status: "danger", text: "目前壓力感受偏高，建議優先減少非必要壓力源，並考慮尋求心理或醫療專業協助。" };
}

function getWHO5Summary(score) {
  if (score >= 20) return { level: "幸福感良好", status: "normal", text: "目前心理幸福感良好，建議持續維持讓你穩定、有活力的生活習慣。" };
  if (score >= 13) return { level: "幸福感普通", status: "warning", text: "目前幸福感普通，建議增加讓自己有意義或愉快的小活動，並觀察情緒變化。" };
  return { level: "幸福感偏低", status: "danger", text: "目前幸福感偏低，若持續合併低落、焦慮、失眠或生活功能下降，建議尋求專業協助。" };
}

function getISISummary(score) {
  if (score <= 7) return { level: "無明顯失眠", status: "normal", text: "目前失眠程度不明顯，建議持續維持固定睡眠時間與良好睡眠環境。" };
  if (score <= 14) return { level: "輕度失眠", status: "warning", text: "目前有輕度失眠情形，建議固定睡眠時間、減少睡前手機與咖啡因刺激。" };
  if (score <= 21) return { level: "中度失眠", status: "warning", text: "目前失眠程度較明顯，若影響白天精神或生活功能，建議就醫或尋求睡眠專業協助。" };
  return { level: "重度失眠", status: "danger", text: "目前失眠程度偏高，建議盡快尋求醫療或睡眠專業評估。" };
}

function drawTrendChart(metricKey, trend) {
  const svg = document.getElementById("trendSvg");
  if (!svg) return;
  svg.innerHTML = "";

  if (metricKey === "bloodPressure") {
    const systolic = trend.extra?.systolic || [];
    const diastolic = trend.extra?.diastolic || [];
    const labels = trend.extra?.labels || [];

    if (systolic.length === 0 || diastolic.length === 0) {
      drawEmptyTrendMessage(svg, "目前沒有足夠資料可以繪製折線圖");
      return;
    }

    const allValues = [...systolic, ...diastolic];
    drawLine(svg, systolic, labels, "#9a6650", allValues, { valuePosition: "above", valueOffset: 16 });
    drawLine(svg, diastolic, labels, "#6f7f76", allValues, { valuePosition: "below", valueOffset: 20 });
    drawBloodPressureLegend(svg);
    return;
  }

  const values = trend.values || [];
  const labels = trend.labels || [];

  if (values.length === 0) {
    drawEmptyTrendMessage(svg, "目前沒有足夠資料可以繪製折線圖");
    return;
  }

  drawLine(svg, values, labels, "#8b6847", values);
}

function drawEmptyTrendMessage(svg, message) {
  const text = document.createElementNS("http://www.w3.org/2000/svg", "text");
  text.setAttribute("x", "380");
  text.setAttribute("y", "160");
  text.setAttribute("text-anchor", "middle");
  text.setAttribute("font-size", "20");
  text.setAttribute("fill", "#7a5a3d");
  text.textContent = message;
  svg.appendChild(text);
}

function drawLine(svg, values, labels, color, allValues, options = {}) {
  const width = 760;
  const height = 320;
  const padding = 44;
  const baseValues = allValues && allValues.length ? allValues : values;

  const minRaw = Math.min(...baseValues);
  const maxRaw = Math.max(...baseValues);
  const buffer = Math.max((maxRaw - minRaw) * 0.15, 1);
  const min = minRaw - buffer;
  const max = maxRaw + buffer;
  const range = max - min || 1;

  for (let i = 0; i < 4; i++) {
    const y = padding + i * ((height - padding * 2) / 3);
    const line = document.createElementNS("http://www.w3.org/2000/svg", "line");
    line.setAttribute("x1", padding);
    line.setAttribute("x2", width - padding);
    line.setAttribute("y1", y);
    line.setAttribute("y2", y);
    line.setAttribute("stroke", "#eadfce");
    line.setAttribute("stroke-width", "1");
    svg.appendChild(line);
  }

  const points = values.map((value, index) => {
    const x = values.length === 1
      ? width / 2
      : padding + (index * (width - padding * 2)) / (values.length - 1);
    const y = height - padding - ((value - min) / range) * (height - padding * 2);
    return { x, y, value, label: labels[index] || `${index + 1}` };
  });

  const polyline = document.createElementNS("http://www.w3.org/2000/svg", "polyline");
  polyline.setAttribute("points", points.map(p => `${p.x},${p.y}`).join(" "));
  polyline.setAttribute("fill", "none");
  polyline.setAttribute("stroke", color);
  polyline.setAttribute("stroke-width", "4");
  polyline.setAttribute("stroke-linecap", "round");
  polyline.setAttribute("stroke-linejoin", "round");
  svg.appendChild(polyline);

  const valuePosition = options.valuePosition || "above";
  const valueOffset = options.valueOffset || 14;

  points.forEach(point => {
    const circle = document.createElementNS("http://www.w3.org/2000/svg", "circle");
    circle.setAttribute("cx", point.x);
    circle.setAttribute("cy", point.y);
    circle.setAttribute("r", "6");
    circle.setAttribute("fill", color);
    svg.appendChild(circle);

    let valueY = valuePosition === "below"
      ? point.y + valueOffset
      : point.y - valueOffset;

    valueY = Math.max(20, Math.min(height - 38, valueY));

    const valueText = document.createElementNS("http://www.w3.org/2000/svg", "text");
    valueText.setAttribute("x", point.x);
    valueText.setAttribute("y", valueY);
    valueText.setAttribute("text-anchor", "middle");
    valueText.setAttribute("font-size", "16");
    valueText.setAttribute("fill", "#3f2f24");
    valueText.setAttribute("paint-order", "stroke");
    valueText.setAttribute("stroke", "#f8f3ed");
    valueText.setAttribute("stroke-width", "4");
    valueText.setAttribute("stroke-linejoin", "round");
    valueText.textContent = roundValue(point.value);
    svg.appendChild(valueText);

    const labelText = document.createElementNS("http://www.w3.org/2000/svg", "text");
    labelText.setAttribute("x", point.x);
    labelText.setAttribute("y", height - 14);
    labelText.setAttribute("text-anchor", "middle");
    labelText.setAttribute("font-size", "15");
    labelText.setAttribute("fill", "#6f5a48");
    labelText.textContent = point.label;
    svg.appendChild(labelText);
  });
}

function drawBloodPressureLegend(svg) {
  const legendItems = [
    { label: "收縮壓", color: "#9b4b3f", x: 500, y: 28 },
    { label: "舒張壓", color: "#5a6f93", x: 590, y: 28 }
  ];

  legendItems.forEach(item => {
    const circle = document.createElementNS("http://www.w3.org/2000/svg", "circle");
    circle.setAttribute("cx", item.x);
    circle.setAttribute("cy", item.y);
    circle.setAttribute("r", "6");
    circle.setAttribute("fill", item.color);
    svg.appendChild(circle);

    const text = document.createElementNS("http://www.w3.org/2000/svg", "text");
    text.setAttribute("x", item.x + 12);
    text.setAttribute("y", item.y + 5);
    text.setAttribute("font-size", "15");
    text.setAttribute("fill", "#3f2f24");
    text.textContent = item.label;
    svg.appendChild(text);
  });
}

function isFiniteNumber(value) {
  return value !== "" && value !== undefined && value !== null && !Number.isNaN(Number(value));
}

function average(values) {
  if (!values.length) return 0;
  return values.reduce((sum, value) => sum + Number(value), 0) / values.length;
}

function roundValue(value) {
  const num = Number(value);
  if (Number.isNaN(num)) return "--";
  return Number.isInteger(num) ? String(num) : num.toFixed(1).replace(/\.0$/, "");
}

function parseRecordDate(value) {
  if (!value) return null;
  if (value instanceof Date) return value;

  const direct = new Date(value);
  if (!Number.isNaN(direct.getTime())) return direct;

  const normalized = String(value)
    .replace("上午", " AM")
    .replace("下午", " PM")
    .replace(/年|\//g, "-")
    .replace("月", "-")
    .replace("日", "");

  const parsed = new Date(normalized);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

function toLocalISODate(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

document.addEventListener("DOMContentLoaded", initTrendDashboard);

/* ===== FINAL FIX: mood assessment works in zh / en / ja ===== */
function isNegativeMoodKey(moodKey) {
  return ["stress", "irritated", "tired", "comfort", "angry", "low"].includes(String(moodKey || "").toLowerCase());
}

function getMoodLabelByKey(moodKey) {
  const moodKeyMap = {
    happy: "moodHappy",
    stress: "moodStress",
    irritated: "moodIrritated",
    tired: "moodTired",
    comfort: "moodComfort",
    energy: "moodEnergy",
    calm: "moodCalm",
    angry: "moodAngry",
    low: "moodLow",
    excited: "moodExcited"
  };
  const i18nKey = moodKeyMap[moodKey] || "moodHappy";
  return translateText(i18nKey) || i18nText.zh[i18nKey] || "😊 心情愉悅";
}

function showMoodAssessmentEntry() {
  const warningPanel = document.getElementById("mood-warning-panel");
  const scaleSelectPanel = document.getElementById("scale-select-panel");
  const scaleQuestionPanel = document.getElementById("scale-question-panel");
  const scaleResultPanel = document.getElementById("scale-result-panel");

  if (warningPanel) {
    warningPanel.style.display = "block";
    warningPanel.hidden = false;
    warningPanel.classList.remove("hidden");
    warningPanel.classList.add("mood-warning-focus");

    const title = warningPanel.querySelector("[data-i18n='negativeMoodTitle']");
    const text = warningPanel.querySelector("[data-i18n='negativeMoodText']");
    const btn = warningPanel.querySelector("[data-i18n='startMoodAssessment']");

    if (title) title.textContent = translateText("negativeMoodTitle") || title.textContent;
    if (text) text.textContent = translateText("negativeMoodText") || text.textContent;
    if (btn) {
      btn.textContent = translateText("startMoodAssessment") || btn.textContent;
      btn.style.display = "inline-flex";
      btn.style.visibility = "visible";
      btn.style.opacity = "1";
      btn.hidden = false;
    }

    setTimeout(() => {
      warningPanel.scrollIntoView({ behavior: "auto", block: "center" });
    }, 180);
  }

  if (scaleSelectPanel) scaleSelectPanel.style.display = "none";
  if (scaleQuestionPanel) scaleQuestionPanel.style.display = "none";
  if (scaleResultPanel) scaleResultPanel.style.display = "none";
}

function selectMood(btn) {
  document.querySelectorAll(".mood-btn").forEach(b => b.classList.remove("active", "selected"));
  if (btn) btn.classList.add("active", "selected");

  const moodKey = String((btn && (btn.getAttribute("data-mood-key") || btn.dataset.moodKey)) || "happy").toLowerCase();
  const moodLabel = getMoodLabelByKey(moodKey);
  selectedMood = moodLabel;
  localStorage.setItem("todayMood", selectedMood);
  localStorage.setItem("todayMoodKey", moodKey);

  const warningPanel = document.getElementById("mood-warning-panel");
  const scaleSelectPanel = document.getElementById("scale-select-panel");
  const scaleQuestionPanel = document.getElementById("scale-question-panel");
  const scaleResultPanel = document.getElementById("scale-result-panel");
  const isNegativeMood = isNegativeMoodKey(moodKey);

  pendingNegativeMoodAssessment = isNegativeMood;

  if (warningPanel) {
    warningPanel.style.display = isNegativeMood ? "block" : "none";
    warningPanel.classList.toggle("mood-warning-focus", isNegativeMood);
  }

  if (!isNegativeMood) {
    if (scaleSelectPanel) scaleSelectPanel.style.display = "none";
    if (scaleQuestionPanel) scaleQuestionPanel.style.display = "none";
    if (scaleResultPanel) scaleResultPanel.style.display = "none";
  }

  const popupQuestion = document.getElementById("popup-question");
  const moodPopup = document.getElementById("mood-popup");

  if (popupQuestion && moodPopup) {
    const blessing = getRandomMoodMessageByKey(moodKey);
    popupQuestion.innerHTML = `
      ${translateText("moodPopupPrefix", { mood: moodLabel }) || moodLabel}
      <br><br>
      ${blessing}
      ${isNegativeMood ? `<br><br>${translateText("moodPopupNegative") || ""}` : ""}
    `;
    moodPopup.classList.remove("hidden");
  }
}

function closeMoodPopup() {
  const moodPopup = document.getElementById("mood-popup");
  if (moodPopup) moodPopup.classList.add("hidden");

  const moodKey = String(localStorage.getItem("todayMoodKey") || "").toLowerCase();
  if (pendingNegativeMoodAssessment || isNegativeMoodKey(moodKey)) {
    pendingNegativeMoodAssessment = false;
    showMoodAssessmentEntry();
  }
}

/* Make the assessment button visible in all languages, even after translation changes. */
(function ensureMoodAssessmentButtonStyle() {
  const style = document.createElement("style");
  style.textContent = `
    #mood-warning-panel { display: none; overflow: visible !important; }
    #mood-warning-panel.mood-warning-focus { display: block !important; }
    #mood-warning-panel .mood-next-btn {
      display: inline-flex !important;
      visibility: visible !important;
      opacity: 1 !important;
      pointer-events: auto !important;
    }
  `;
  document.head.appendChild(style);
})();

/* =========================================================
   動態內容翻譯修正版：評估歷史／趨勢分析／衛教文章
   ========================================================= */
const dynamicI18n = {
  zh: {
    savedAlert: "情緒評估結果已儲存！可回到量表選擇頁查看歷史紀錄。",
    historyMissing: "找不到歷史紀錄區塊，請確認 index.html 有 scale-history-list。",
    noHistory: "目前還沒有評估紀錄。<br>完成量表並按下「儲存評估結果」後，紀錄會顯示在這裡。",
    noDate: "未記錄日期",
    mentalScale: "心理量表",
    score: "分數：",
    result: "結果：",
    mood: "當時心情：",
    notRecorded: "未記錄",
    trendTitle: "健康傾向分析",
    trendSub: "先選分類與項目，即可查看今日或本月趨勢。",
    body: "身體數值",
    mind: "心理・気分",
    sleep: "ストレス・睡眠",
    today: "今日分析",
    month: "本月分析",
    summary: "分析摘要",
    noData: "尚無資料",
    noDataText: "請先輸入健康紀錄或完成量表，系統會在這裡顯示趨勢分析。",
    trendTip: "小提醒：定期量測與記錄，有助於掌握身體變化，維持健康生活。",
    backHome: "回首頁",
    currentScore: "目前分數：",
    readDone: "🧠 我讀完了，去衛教闖關",
    backEdu: "📚 回衛教主題",
    selectEdu: "請選擇一個項目查看衛教內容。"
  },
  en: {
    savedAlert: "The assessment result has been saved. You can return to the scale menu to view history.",
    historyMissing: "Cannot find the history area. Please check that scale-history-list exists in index.html.",
    noHistory: "No assessment records yet.<br>After completing a scale and saving the result, records will appear here.",
    noDate: "No date recorded",
    mentalScale: "Mental Scale",
    score: "Score: ",
    result: "Result: ",
    mood: "Mood at that time: ",
    notRecorded: "Not recorded",
    trendTitle: "Health Trend Analysis",
    trendSub: "Choose a category and item to view today’s or this month’s trend.",
    body: "Body Values",
    mind: "Mind & Mood",
    sleep: "Stress & Sleep",
    today: "Today",
    month: "This Month",
    summary: "Analysis Summary",
    noData: "No Data Yet",
    noDataText: "Please enter health records or complete a scale first. Trend analysis will appear here.",
    trendTip: "Reminder: Regular measurement and records help you track body changes and maintain a healthy lifestyle.",
    backHome: "Back to Home",
    currentScore: "Current score: ",
    readDone: "🧠 Finished reading, go to quiz",
    backEdu: "📚 Back to topics",
    selectEdu: "Select an item to view health education content."
  },
  ja: {
    savedAlert: "評価結果を保存しました。尺度選択ページに戻ると履歴を確認できます。",
    historyMissing: "履歴エリアが見つかりません。index.html に scale-history-list があるか確認してください。",
    noHistory: "評価記録はまだありません。<br>尺度を完了して結果を保存すると、ここに表示されます。",
    noDate: "日付未記録",
    mentalScale: "心理尺度",
    score: "スコア：",
    result: "結果：",
    mood: "その時の気分：",
    notRecorded: "未記録",
    trendTitle: "健康傾向分析",
    trendSub: "カテゴリと項目を選ぶと、今日または今月の傾向を確認できます。",
    body: "身体数値",
    mind: "心理・気分",
    sleep: "ストレス・睡眠",
    today: "今日分析",
    month: "今月分析",
    summary: "分析サマリー",
    noData: "データなし",
    noDataText: "健康記録を入力するか尺度を完了すると、ここに傾向分析が表示されます。",
    trendTip: "リマインダー：定期的な測定と記録は身体の変化を把握し、健康的な生活を維持するのに役立ちます。",
    backHome: "ホームへ戻る",
    currentScore: "現在のスコア：",
    readDone: "🧠 読み終えたのでクイズへ",
    backEdu: "📚 テーマへ戻る",
    selectEdu: "項目を選んで健康教育内容を確認してください。"
  }
};

function tDyn(key) {
  return dynamicI18n[currentLanguage]?.[key] || dynamicI18n.zh[key] || key;
}

const scaleNameI18n = {
  "GAD-7 焦慮程度評估": { en: "GAD-7 Anxiety Assessment", ja: "GAD-7 不安評価" },
  "PSS-10 壓力感受量表": { en: "PSS-10 Perceived Stress Scale", ja: "PSS-10 ストレス感尺度" },
  "BSRS-5 簡式健康量表": { en: "BSRS-5 Brief Symptom Rating Scale", ja: "BSRS-5 簡易健康尺度" },
  "PHQ-9 憂鬱情緒量表": { en: "PHQ-9 Depression Scale", ja: "PHQ-9 抑うつ評価" },
  "WHO-5 幸福感量表": { en: "WHO-5 Well-being Index", ja: "WHO-5 幸福感尺度" },
  "ISI 失眠嚴重度量表": { en: "ISI Insomnia Severity Index", ja: "ISI 不眠重症度尺度" },
  "心理量表": { en: "Mental Scale", ja: "心理尺度" }
};

const levelI18n = {
  "無明顯焦慮": { en: "Minimal anxiety", ja: "明らかな不安なし" },
  "輕度焦慮": { en: "Mild anxiety", ja: "軽度不安" },
  "中度焦慮": { en: "Moderate anxiety", ja: "中等度不安" },
  "重度焦慮": { en: "Severe anxiety", ja: "重度不安" },
  "低壓力": { en: "Low stress", ja: "低ストレス" },
  "中度壓力": { en: "Moderate stress", ja: "中等度ストレス" },
  "高壓力": { en: "High stress", ja: "高ストレス" },
  "正常範圍": { en: "Normal range", ja: "正常範囲" },
  "輕度心理困擾": { en: "Mild distress", ja: "軽度心理的苦痛" },
  "中度心理困擾": { en: "Moderate distress", ja: "中等度心理的苦痛" },
  "重度心理困擾": { en: "Severe distress", ja: "重度心理的苦痛" },
  "無明顯憂鬱": { en: "Minimal depression", ja: "明らかな抑うつなし" },
  "輕度憂鬱": { en: "Mild depression", ja: "軽度抑うつ" },
  "中度憂鬱": { en: "Moderate depression", ja: "中等度抑うつ" },
  "中重度憂鬱": { en: "Moderately severe depression", ja: "中重度抑うつ" },
  "重度憂鬱": { en: "Severe depression", ja: "重度抑うつ" },
  "幸福感良好": { en: "Good well-being", ja: "幸福感良好" },
  "幸福感普通": { en: "Average well-being", ja: "幸福感普通" },
  "幸福感偏低": { en: "Low well-being", ja: "幸福感低下" },
  "無明顯失眠": { en: "No significant insomnia", ja: "明らかな不眠なし" },
  "輕度失眠": { en: "Mild insomnia", ja: "軽度不眠" },
  "中度失眠": { en: "Moderate insomnia", ja: "中等度不眠" },
  "重度失眠": { en: "Severe insomnia", ja: "重度不眠" },
  "未記錄": { en: "Not recorded", ja: "未記録" }
};

function localizeKnown(value, map) {
  if (currentLanguage === "zh") return value;
  return map[value]?.[currentLanguage] || value;
}

function saveScaleResult() {
  const scale = scaleData[currentScale];
  if (!scale) return;

  const score = scaleAnswers.reduce((sum, value) => sum + value, 0);
  const [level, suggestion] = scale.getLevel(score);

  const result = {
    date: new Date().toLocaleString(currentLanguage === "ja" ? "ja-JP" : currentLanguage === "en" ? "en-US" : "zh-TW"),
    mood: selectedMood,
    scale: scale.title,
    score,
    total: scale.total,
    level,
    suggestion
  };

  const records = JSON.parse(localStorage.getItem("moodScaleRecords")) || [];
  records.push(result);
  localStorage.setItem("moodScaleRecords", JSON.stringify(records));
  alert(tDyn("savedAlert"));
}

function showScaleHistory() {
  const records = JSON.parse(localStorage.getItem("moodScaleRecords")) || [];
  const list = document.getElementById("scale-history-list");

  if (!list) {
    alert(tDyn("historyMissing"));
    return;
  }

  if (records.length === 0) {
    list.innerHTML = `<div class="empty-history">${tDyn("noHistory")}</div>`;
  } else {
    list.innerHTML = records
      .slice()
      .reverse()
      .map(record => {
        const scoreText = `${record.score ?? "--"} / ${record.total ?? "--"}`;
        const moodText = record.mood || tDyn("notRecorded");
        const levelText = localizeKnown(record.level || "未記錄", levelI18n);
        const scaleText = localizeKnown(record.scale || record.scaleName || record.title || "心理量表", scaleNameI18n);
        return `
          <div class="scale-history-card">
            <div class="history-date">${record.date || tDyn("noDate")}</div>
            <h4>${scaleText}</h4>
            <p><strong>${tDyn("score")}</strong>${scoreText}</p>
            <p><strong>${tDyn("result")}</strong>${levelText}</p>
            <p><strong>${tDyn("mood")}</strong>${moodText}</p>
          </div>
        `;
      })
      .join("");
  }

   //showPage("scale-history-page");
}

const trendCategoryI18n = {
  body: { zh: "身體數值", en: "Body Values", ja: "身体数値" },
  mind: { zh: "心理・氣分", en: "Mind & Mood", ja: "心理・気分" },
  sleep: { zh: "壓力・睡眠", en: "Stress & Sleep", ja: "ストレス・睡眠" }
};

const trendMetricI18n = {
  bmi: { zh: "BMI", en: "BMI", ja: "BMI" },
  bloodPressure: { zh: "血壓", en: "Blood Pressure", ja: "血圧" },
  pulse: { zh: "脈搏", en: "Pulse", ja: "脈拍" },
  chest: { zh: "胸圍", en: "Chest", ja: "胸囲" },
  waist: { zh: "腰圍", en: "Waist", ja: "ウエスト" },
  hip: { zh: "臀圍", en: "Hip", ja: "ヒップ" },
  brs5: { zh: "身心壓力", en: "Mind-Body Stress", ja: "心身ストレス" },
  phq9: { zh: "憂鬱", en: "Depression", ja: "抑うつ" },
  gad7: { zh: "焦慮", en: "Anxiety", ja: "不安" },
  pss10: { zh: "壓力感受", en: "Perceived Stress", ja: "ストレス感" },
  who5: { zh: "幸福感", en: "Well-being", ja: "幸福感" },
  isi: { zh: "失眠", en: "Insomnia", ja: "不眠" }
};

function localTrendMetricName(key) {
  return trendMetricI18n[key]?.[currentLanguage] || trendMetricI18n[key]?.zh || key;
}

function applyTrendStaticTranslations() {
  const title = document.querySelector("#chart-page .trend-header-text h2");
  const sub = document.querySelector("#chart-page .trend-header-text p");
  const summaryTitle = document.querySelector("#chart-page .summary-title span:last-child");
  const note = document.querySelector("#chart-page .trend-chart-note");
  const tip = document.querySelector("#chart-page .trend-tip span");
  const back = document.querySelector("#chart-page .back-home-btn");
  if (title) title.textContent = tDyn("trendTitle");
  if (sub) sub.textContent = tDyn("trendSub");
  if (summaryTitle) summaryTitle.textContent = tDyn("summary");
  if (note) note.textContent = currentLanguage === "zh" ? "＊今日分析顯示當日各時段或量測結果的變化趨勢" : currentLanguage === "en" ? "＊Today’s analysis shows changes across today’s measurements." : "＊今日分析では、当日の測定結果の変化を表示します。";
  if (tip) tip.textContent = tDyn("trendTip");
  if (back) back.textContent = tDyn("backHome");
  document.querySelectorAll("#chart-page .trend-category-btn").forEach(btn => {
    const key = btn.dataset.category;
    const span = btn.querySelector("span");
    if (span && trendCategoryI18n[key]) span.textContent = trendCategoryI18n[key][currentLanguage] || trendCategoryI18n[key].zh;
  });
  document.querySelectorAll("#chart-page .trend-period-btn").forEach(btn => {
    const span = btn.querySelector("span");
    if (span) span.textContent = btn.dataset.period === "month" ? tDyn("month") : tDyn("today");
  });
}

function renderTrendMetricButtons() {
  const container = document.getElementById("trendMetricButtons");
  if (!container) return;

  const metrics = trendCategories[selectedTrendCategory]?.metrics || [];
  container.innerHTML = metrics.map(metric => `
    <button type="button" class="trend-metric-btn ${metric.key === selectedTrendMetric ? "active" : ""}" data-metric="${metric.key}">
      ${localTrendMetricName(metric.key)}
    </button>
  `).join("");

  document.querySelectorAll(".trend-metric-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      selectedTrendMetric = btn.dataset.metric;
      document.querySelectorAll(".trend-metric-btn").forEach(item => item.classList.remove("active"));
      btn.classList.add("active");
      updateTrendDashboard();
    });
  });
}

const originalUpdateTrendDashboard = typeof updateTrendDashboard === "function" ? updateTrendDashboard : null;
function updateTrendDashboard() {
  if (originalUpdateTrendDashboard) originalUpdateTrendDashboard();
  const metric = getCurrentTrendMetric?.();
  const periodName = selectedTrendPeriod === "today" ? tDyn("today") : tDyn("month");
  const title = document.getElementById("trendChartTitle");
  const name = document.getElementById("summaryMetricName");
  if (title && metric) title.textContent = `${localTrendMetricName(metric.key)}｜${periodName}`;
  if (name && metric) name.textContent = localTrendMetricName(metric.key);
  applyTrendStaticTranslations();
}

/* 衛教文章：純中文版，已移除英文與日文翻譯資料。 */
function getLocalizedEduCategory(categoryKey) {
  return eduCategories[categoryKey];
}

function showEduCategory(categoryKey) {
  const category = getLocalizedEduCategory(categoryKey);
  if (!category) return;

  document.getElementById("edu-title").textContent = category.title;
  document.getElementById("edu-subtitle").textContent = category.subtitle;

  const contentBox = document.getElementById("edu-content");
  if (!contentBox) return;

  contentBox.innerHTML = category.sections.map(section => `
    <div class="edu-section">
      <div class="edu-text-box">
        <h3>${section.heading}</h3>
        <p>${section.content}</p>
      </div>
      <div class="edu-image-box">
        <img src="${section.image}" alt="${section.heading}">
      </div>
    </div>
  `).join("");

  contentBox.innerHTML += `
    <div class="edu-action-buttons">
      <button class="quiz-btn" onclick="showPage('quiz-menu-page')">${tDyn("readDone")}</button>
      <button class="back-btn" onclick="showPage('edu-menu-page')">${tDyn("backEdu")}</button>
    </div>
  `;

  currentEduKey = categoryKey;
  if (eduReadTimer) clearTimeout(eduReadTimer);
  eduReadTimer = setTimeout(() => addLearningProgressByCategory(currentEduKey), 600000);
  showPage("edu-page");
}

const originalApplyLanguageDynamic = typeof applyLanguage === "function" ? applyLanguage : null;
function applyLanguage() {
  if (originalApplyLanguageDynamic) originalApplyLanguageDynamic();
  applyTrendStaticTranslations();
  renderTrendMetricButtons?.();
  updateTrendDashboard?.();
}


function getLanguageMenuElement() {
  return document.getElementById("language-menu") || document.getElementById("lang-menu");
}

function toggleLangMenu(event) {
  if (event) event.stopPropagation();
  const menu = getLanguageMenuElement();
  if (menu) menu.classList.toggle("hidden");
}

document.addEventListener("click", function (event) {
  const switcher = event.target.closest(".language-switch");
  const menu = getLanguageMenuElement();
  if (!switcher && menu) menu.classList.add("hidden");
});
/* ===== 語言選單強制修正版：確保下拉選項可點擊、可切換 ===== */
(function () {
  function safeNormalizeLang(lang) {
    if (lang === "en" || lang === "ja") return lang;
    return "zh";
  }

  function safeTranslate(key, lang) {
    if (!key || typeof i18nText === "undefined") return null;
    return (i18nText[lang] && i18nText[lang][key]) || (i18nText.zh && i18nText.zh[key]) || null;
  }

  window.toggleLangMenu = function (event) {
    if (event) {
      event.preventDefault();
      event.stopPropagation();
    }
    const menu = document.getElementById("language-menu") || document.getElementById("lang-menu");
    if (menu) menu.classList.toggle("hidden");
  };

  window.setLanguage = function (lang) {
    const nextLang = safeNormalizeLang(lang);

    try {
      currentLanguage = nextLang;
    } catch (error) {}
    window.currentLanguage = nextLang;

    localStorage.setItem("siteLanguage", nextLang);
    document.documentElement.lang = nextLang === "zh" ? "zh-TW" : nextLang;
    document.body.classList.remove("lang-zh", "lang-en", "lang-ja");
    document.body.classList.add(`lang-${nextLang}`);

    document.querySelectorAll("[data-i18n]").forEach(el => {
      const translated = safeTranslate(el.dataset.i18n, nextLang);
      if (translated !== null && translated !== undefined && translated !== "") {
        el.textContent = translated;
      }
    });

    document.querySelectorAll("[data-placeholder-i18n]").forEach(el => {
      const translated = safeTranslate(el.dataset.placeholderI18n, nextLang);
      if (translated !== null && translated !== undefined && translated !== "") {
        el.placeholder = translated;
      }
    });

    const menu = document.getElementById("language-menu") || document.getElementById("lang-menu");
    if (menu) menu.classList.add("hidden");

    try { applyStaticLanguage?.(); } catch (error) {}
    try { updateRecordStatusText?.(); } catch (error) {}
    try { updateHomeScoreLanguage?.(); } catch (error) {}
    try { applyTrendStaticTranslations?.(); } catch (error) {}
    try { renderTrendMetricButtons?.(); } catch (error) {}
    try { updateTrendDashboard?.(); } catch (error) {}
    try {
      if (typeof currentScale !== "undefined" && currentScale) renderScaleQuestion?.();
    } catch (error) {}
  };

  document.addEventListener("DOMContentLoaded", function () {
    const menu = document.getElementById("language-menu") || document.getElementById("lang-menu");
    const toggle = document.querySelector(".language-toggle, .language-btn");

    if (toggle) {
      toggle.onclick = window.toggleLangMenu;
    }

    if (menu) {
      menu.querySelectorAll("button").forEach(btn => {
        btn.type = "button";
        btn.addEventListener("click", function (event) {
          event.preventDefault();
          event.stopPropagation();
          const text = this.textContent.trim().toLowerCase();
          const lang = this.dataset.lang ||
            (text.includes("english") ? "en" : text.includes("日本") ? "ja" : "zh");
          window.setLanguage(lang);
        });
      });
    }
  });
})();

/* =========================================================
   最終修正：量表結果頁英日翻譯 + 評估歷史頁導向修正
   - 不再導向不存在的 scale-history-page
   - 儲存後可正常顯示歷史紀錄
   - 結果頁標題、分數、摘要、建議、區間全部依語言顯示
   ========================================================= */
(function () {
  function langNow() {
    if (typeof currentLanguage !== "undefined") return currentLanguage || "zh";
    return localStorage.getItem("siteLanguage") || "zh";
  }

  const ui = {
    zh: {
      scoreLabel: "你的分數",
      caption: (score, level) => `你的分數是 <strong>${score} 分</strong>，目前落在 <strong>${level}</strong> 區間。`,
      summaryTitle: "結果摘要",
      statusTitle: "可能代表的狀況",
      adviceTitle: "建議方向",
      reminderTitle: "貼心提醒",
      rangeTitle: "分數區間參考",
      rangeSub: "已用顏色標示你目前所在的區間，方便快速辨識。",
      currentScore: score => `目前分數：${score} 分`,
      retry: "↻ 重新作答",
      save: "💾 儲存評估結果",
      saved: "情緒評估結果已儲存！可回到量表選擇頁查看歷史紀錄。",
      noHistory: "目前還沒有評估紀錄。<br>完成量表並按下「儲存評估結果」後，紀錄會顯示在這裡。",
      historyTitle: "📚 歷史評估紀錄",
      historySub: "查看之前完成的心理量表結果",
      backToScale: "← 返回量表選擇",
      clear: "清除紀錄",
      score: "分數：",
      result: "結果：",
      mood: "當時心情：",
      noDate: "未記錄日期",
      noMood: "未記錄",
      clearConfirm: "確定要清除所有評估紀錄嗎？"
    },
    en: {
      scoreLabel: "Your Score",
      caption: (score, level) => `Your score is <strong>${score} pts</strong>, which falls in the <strong>${level}</strong> range.`,
      summaryTitle: "Summary",
      statusTitle: "What it may mean",
      adviceTitle: "Suggested direction",
      reminderTitle: "Gentle reminder",
      rangeTitle: "Score Range Reference",
      rangeSub: "Your current range is highlighted to help you understand the result quickly.",
      currentScore: score => `Current score: ${score} pts`,
      retry: "↻ Try Again",
      save: "💾 Save Assessment Result",
      saved: "The assessment result has been saved. You can view it in the assessment history.",
      noHistory: "No assessment records yet.<br>After completing and saving an assessment, records will appear here.",
      historyTitle: "📚 Assessment History",
      historySub: "View your previous mental scale results",
      backToScale: "← Back to Scale Menu",
      clear: "Clear Records",
      score: "Score: ",
      result: "Result: ",
      mood: "Mood: ",
      noDate: "No date recorded",
      noMood: "Not recorded",
      clearConfirm: "Are you sure you want to clear all assessment records?"
    },
    ja: {
      scoreLabel: "あなたのスコア",
      caption: (score, level) => `あなたのスコアは <strong>${score} 点</strong> で、現在 <strong>${level}</strong> の範囲です。`,
      summaryTitle: "結果サマリー",
      statusTitle: "考えられる状態",
      adviceTitle: "おすすめの対応",
      reminderTitle: "やさしいリマインダー",
      rangeTitle: "スコア範囲の参考",
      rangeSub: "現在の範囲を色で示しているため、結果をすばやく確認できます。",
      currentScore: score => `現在のスコア：${score} 点`,
      retry: "↻ もう一度回答",
      save: "💾 評価結果を保存",
      saved: "評価結果を保存しました。評価履歴で確認できます。",
      noHistory: "評価記録はまだありません。<br>評価を完了して保存すると、ここに表示されます。",
      historyTitle: "📚 評価履歴",
      historySub: "過去に完了した心理尺度の結果を見る",
      backToScale: "← 尺度選択へ戻る",
      clear: "記録を削除",
      score: "スコア：",
      result: "結果：",
      mood: "その時の気分：",
      noDate: "日付未記録",
      noMood: "未記録",
      clearConfirm: "すべての評価記録を削除しますか？"
    }
  };

  const levelText = {
    en: {
      "無明顯焦慮": "Minimal anxiety", "輕度焦慮": "Mild anxiety", "中度焦慮": "Moderate anxiety", "重度焦慮": "Severe anxiety",
      "低壓力": "Low stress", "中度壓力": "Moderate stress", "高壓力": "High stress",
      "正常範圍": "Normal range", "輕度心理困擾": "Mild distress", "中度心理困擾": "Moderate distress", "重度心理困擾": "Severe distress",
      "無明顯憂鬱": "Minimal depression", "輕度憂鬱": "Mild depression", "中度憂鬱": "Moderate depression", "中重度憂鬱": "Moderately severe depression", "重度憂鬱": "Severe depression",
      "幸福感良好": "Good well-being", "幸福感普通": "Average well-being", "幸福感偏低": "Low well-being",
      "無明顯失眠": "No significant insomnia", "輕度失眠": "Mild insomnia", "中度失眠": "Moderate insomnia", "重度失眠": "Severe insomnia"
    },
    ja: {
      "無明顯焦慮": "明らかな不安なし", "輕度焦慮": "軽度不安", "中度焦慮": "中等度不安", "重度焦慮": "重度不安",
      "低壓力": "低ストレス", "中度壓力": "中等度ストレス", "高壓力": "高ストレス",
      "正常範圍": "正常範囲", "輕度心理困擾": "軽度心理的苦痛", "中度心理困擾": "中等度心理的苦痛", "重度心理困擾": "重度心理的苦痛",
      "無明顯憂鬱": "明らかな抑うつなし", "輕度憂鬱": "軽度抑うつ", "中度憂鬱": "中等度抑うつ", "中重度憂鬱": "中重度抑うつ", "重度憂鬱": "重度抑うつ",
      "幸福感良好": "幸福感良好", "幸福感普通": "幸福感普通", "幸福感偏低": "幸福感低下",
      "無明顯失眠": "明らかな不眠なし", "輕度失眠": "軽度不眠", "中度失眠": "中等度不眠", "重度失眠": "重度不眠"
    }
  };

  const scaleTitles = {
    bsrs5: { zh: "BSRS-5 簡式健康量表", en: "BSRS-5 Brief Symptom Rating Scale", ja: "BSRS-5 簡易健康尺度" },
    phq9: { zh: "PHQ-9 憂鬱情緒評估", en: "PHQ-9 Depression Assessment", ja: "PHQ-9 抑うつ評価" },
    gad7: { zh: "GAD-7 不安評估", en: "GAD-7 Anxiety Assessment", ja: "GAD-7 不安評価" },
    pss10: { zh: "PSS-10 壓力感受量表", en: "PSS-10 Perceived Stress Scale", ja: "PSS-10 知覚ストレス尺度" },
    who5: { zh: "WHO-5 幸福感量表", en: "WHO-5 Well-being Index", ja: "WHO-5 幸福感尺度" },
    isi: { zh: "ISI 失眠嚴重度量表", en: "ISI Insomnia Severity Index", ja: "ISI 不眠重症度尺度" }
  };

  function getScaleTitle(type, lang) {
    return scaleTitles[type]?.[lang] || scaleTitles[type]?.zh || "心理量表";
  }

  function localLevel(level, lang) {
    if (lang === "zh") return level;
    return levelText[lang]?.[level] || level;
  }

  function localRangeText(range, lang) {
    if (lang === "en") return String(range).replace(/分以上/g, " pts+").replace(/分/g, " pts");
    if (lang === "ja") return String(range).replace(/分以上/g, "点以上").replace(/分/g, "点");
    return range;
  }

  function getResultMessages(type, level, score, lang) {
    const lv = localLevel(level, lang);
    if (lang === "en") {
      return {
        summary: `Your current ${getScaleTitle(type, lang)} score is ${score}. The result falls in the ${lv} range.`,
        status: "This may reflect your recent emotional, stress, sleep, or mental health state. Please use it as a self-check reference.",
        advice: "Continue observing changes in your mood and daily routine. If discomfort continues or affects school, work, sleep, or relationships, consider seeking support from a counselor or healthcare professional.",
        reminder: "This result is not a diagnosis. If you feel unsafe, overwhelmed, or have thoughts of self-harm, seek immediate help from trusted people or emergency services."
      };
    }
    if (lang === "ja") {
      return {
        summary: `現在の${getScaleTitle(type, lang)}のスコアは ${score} 点で、${lv} の範囲に入っています。`,
        status: "これは最近の気分、ストレス、睡眠、または心理状態を知るための自己チェックの参考になります。",
        advice: "気分や生活リズムの変化を続けて観察しましょう。不調が続く、または学業・仕事・睡眠・人間関係に影響する場合は、カウンセラーや医療専門職に相談することを検討してください。",
        reminder: "この結果は診断ではありません。つらさが強い、自分を傷つけたい、危険を感じる場合は、信頼できる人や緊急支援にすぐ相談してください。"
      };
    }
    return {
      summary: `目前分數為 ${score} 分，結果落在「${level}」區間。`,
      status: "這可能反映你近期的情緒、壓力、睡眠或心理狀態，可作為自我觀察參考。",
      advice: "建議持續觀察情緒與生活作息變化。若不適持續或影響上課、工作、睡眠與人際，建議尋求輔導或醫療專業協助。",
      reminder: "此結果不是診斷。若感到撐不下去、立即危險或有自傷想法，請立刻尋求可信任的人或緊急資源協助。"
    };
  }

  function showPanel(id, display) {
    const el = document.getElementById(id);
    if (el) el.style.display = display;
    return el;
  }

  window.showScaleResult = function () {
    const lang = langNow();
    const text = ui[lang] || ui.zh;
    const rawScale = typeof scaleData !== "undefined" ? scaleData[currentScale] : null;
    if (!rawScale) return;

    const score = (scaleAnswers || []).reduce((sum, value) => sum + Number(value || 0), 0);
    const raw = rawScale.getLevel(score);
    const rawLevel = Array.isArray(raw) ? raw[0] : String(raw || "");
    const level = localLevel(rawLevel, lang);
    const ranges = (typeof scaleRangeData !== "undefined" && scaleRangeData[currentScale]) ? scaleRangeData[currentScale] : [];
    const matchedRange = typeof getRangeMatch === "function" ? getRangeMatch(ranges, score) : ranges.find(item => score >= item.min && (item.max === null || score <= item.max));
    const tone = matchedRange?.tone || "mild";
    const messages = getResultMessages(currentScale, rawLevel, score, lang);

    showPanel("scale-question-panel", "none");
    const resultPanel = showPanel("scale-result-panel", "block");
    if (resultPanel) {
      resultPanel.className = `scale-result-panel ${typeof getScaleThemeClass === "function" ? getScaleThemeClass(currentScale) : ""} is-visible`;
      resultPanel.scrollTop = 0;
    }
    document.body.classList.add("scale-result-open");

    const titleEl = document.getElementById("scale-result-title");
    const scoreEl = document.getElementById("scale-score");
    const levelEl = document.getElementById("scale-level");
    const captionEl = document.getElementById("scale-score-caption");
    const suggestionEl = document.getElementById("scale-suggestion");
    const rangeBox = document.getElementById("scale-range-result");

    if (titleEl) titleEl.textContent = `${getScaleTitle(currentScale, lang)} ${text.resultSuffix || (lang === "en" ? "Result" : "結果")}`;

    if (scoreEl) {
      scoreEl.innerHTML = `<span class="score-label">${text.scoreLabel}</span><span class="score-main">${score}</span><span class="score-total">/ ${rawScale.total}</span>`;
      scoreEl.setAttribute("data-tone", tone);
      const scoreCircle = scoreEl.closest(".score-circle");
      if (scoreCircle) scoreCircle.setAttribute("data-tone", tone);
    }

    if (levelEl) {
      levelEl.textContent = level;
      levelEl.className = `result-badge tone-${tone}`;
    }

    if (captionEl) captionEl.innerHTML = text.caption(score, level);

    if (suggestionEl) {
      // 保留原本結果頁卡片排版：外層 psych-card + 內層 psych-row。
      // 不再輸出未套樣式的 result-card，避免翻譯後版面散開。
      suggestionEl.innerHTML = `
        <div class="psych-card">
          <div class="psych-row">
            <div class="psych-icon">📋</div>
            <div><h4>${text.summaryTitle}</h4><p>${messages.summary}</p></div>
          </div>
          <div class="psych-row">
            <div class="psych-icon">☁️</div>
            <div><h4>${text.statusTitle}</h4><p>${messages.status}</p></div>
          </div>
          <div class="psych-row">
            <div class="psych-icon">🌱</div>
            <div><h4>${text.adviceTitle}</h4><p>${messages.advice}</p></div>
          </div>
          <div class="psych-row">
            <div class="psych-icon">💗</div>
            <div><h4>${text.reminderTitle}</h4><p>${messages.reminder}</p></div>
          </div>
        </div>
      `;
    }

    if (rangeBox) {
      rangeBox.innerHTML = `
        <div class="range-header"><h4>${text.rangeTitle}</h4><p>${text.rangeSub}</p></div>
        <div class="scale-range-grid">
          ${ranges.map(item => {
            const active = matchedRange === item;
            return `<div class="range-card tone-${item.tone} ${active ? "active" : ""}">
              <div class="range-score">${localRangeText(item.range, lang)}</div>
              <div class="range-label">${localLevel(item.label, lang)}</div>
              ${active ? `<div class="range-current">${text.currentScore(score)}</div>` : ""}
            </div>`;
          }).join("")}
        </div>
      `;
    }

    const retryBtn = document.querySelector(".scale-retry-btn");
    const saveBtn = document.querySelector("#scale-result-panel .mood-next-btn");
    if (retryBtn) retryBtn.textContent = text.retry;
    if (saveBtn) saveBtn.textContent = text.save;
  };

  window.saveScaleResult = function () {
    const lang = langNow();
    const text = ui[lang] || ui.zh;
    const rawScale = typeof scaleData !== "undefined" ? scaleData[currentScale] : null;
    if (!rawScale) return;

    const score = (scaleAnswers || []).reduce((sum, value) => sum + Number(value || 0), 0);
    const raw = rawScale.getLevel(score);
    const rawLevel = Array.isArray(raw) ? raw[0] : String(raw || "");

    const result = {
      date: new Date().toLocaleString(lang === "ja" ? "ja-JP" : lang === "en" ? "en-US" : "zh-TW"),
      mood: selectedMood || "",
      scaleKey: currentScale,
      scale: rawScale.title,
      score,
      total: rawScale.total,
      level: rawLevel
    };

    const records = JSON.parse(localStorage.getItem("moodScaleRecords")) || [];
    records.push(result);
    localStorage.setItem("moodScaleRecords", JSON.stringify(records));
    alert(text.saved);
    // 儲存後停留在目前結果頁，不自動跳到歷史紀錄。
    // 使用者可自行按「查看歷史紀錄」再開啟。
  };

  window.showScaleHistory = function () {
    const lang = langNow();
    const text = ui[lang] || ui.zh;
    const records = JSON.parse(localStorage.getItem("moodScaleRecords")) || [];
    const list = document.getElementById("scale-history-list");

    if (!list) {
      alert(lang === "en" ? "Cannot find the history area." : lang === "ja" ? "履歴エリアが見つかりません。" : "找不到歷史紀錄區塊。");
      return;
    }

    const title = document.querySelector("#scale-history-panel h3");
    const sub = document.querySelector("#scale-history-panel .scale-history-subtitle");
    const backBtn = document.querySelector("#scale-history-panel .scale-history-actions button:first-child");
    const clearBtn = document.querySelector("#scale-history-panel .scale-history-actions button:last-child");
    if (title) title.textContent = text.historyTitle;
    if (sub) sub.textContent = text.historySub;
    if (backBtn) backBtn.textContent = text.backToScale;
    if (clearBtn) clearBtn.textContent = text.clear;

    if (records.length === 0) {
      list.innerHTML = `<div class="empty-history">${text.noHistory}</div>`;
    } else {
      list.innerHTML = records.slice().reverse().map(record => {
        const recordScaleKey = record.scaleKey || currentScale || "";
        const scaleName = recordScaleKey ? getScaleTitle(recordScaleKey, lang) : (record.scale || "心理量表");
        const resultLevel = localLevel(record.level || "", lang) || (record.level || "--");
        const scoreText = `${record.score ?? "--"} / ${record.total ?? "--"}`;
        return `<div class="scale-history-card">
          <div class="history-date">${record.date || text.noDate}</div>
          <h4>${scaleName}</h4>
          <p><strong>${text.score}</strong>${scoreText}</p>
          <p><strong>${text.result}</strong>${resultLevel}</p>
          <p><strong>${text.mood}</strong>${record.mood || text.noMood}</p>
        </div>`;
      }).join("");
    }

    // 不使用 showPage('scale-history-page')，因為此頁面不是獨立 section，而是 record-page 內的 panel。
    try { if (typeof showPage === "function") showPage("record-page"); } catch (e) {}

    showPanel("mood-warning-panel", "none");
    showPanel("scale-select-panel", "none");
    showPanel("scale-question-panel", "none");
    const resultPanel = showPanel("scale-result-panel", "none");
    if (resultPanel) resultPanel.classList.remove("is-visible");
    const historyPanel = showPanel("scale-history-panel", "block");
    document.body.classList.remove("scale-result-open");
    if (historyPanel) historyPanel.scrollIntoView({ behavior: "auto", block: "start" });
  };

  window.hideScaleHistory = function () {
    showPanel("scale-history-panel", "none");
    const selectPanel = showPanel("scale-select-panel", "block");
    if (selectPanel) selectPanel.scrollIntoView({ behavior: "auto", block: "start" });
  };

  window.clearScaleHistory = function () {
    const lang = langNow();
    const text = ui[lang] || ui.zh;
    if (!confirm(text.clearConfirm)) return;
    localStorage.removeItem("moodScaleRecords");
    window.showScaleHistory();
  };
})();

/* ===== 強制修正：健康傾向分析按鈕在中／英／日都可點擊 ===== */
(function fixTrendButtonsClickable() {
  function getLangForTrend() {
    try {
      return window.currentLanguage || currentLanguage || localStorage.getItem("language") || localStorage.getItem("lang") || "zh";
    } catch (e) {
      return localStorage.getItem("language") || localStorage.getItem("lang") || "zh";
    }
  }

  function trendLabel(map, key) {
    const lang = getLangForTrend();
    return map[key]?.[lang] || map[key]?.zh || key;
  }

  function updateTrendCategoryActive() {
    document.querySelectorAll("#chart-page .trend-category-btn").forEach(btn => {
      btn.classList.toggle("active", btn.dataset.category === selectedTrendCategory);
      const span = btn.querySelector("span");
      if (span && typeof trendCategoryI18n !== "undefined") {
        span.textContent = trendLabel(trendCategoryI18n, btn.dataset.category);
      }
    });
  }

  function updateTrendPeriodActive() {
    document.querySelectorAll("#chart-page .trend-period-btn").forEach(btn => {
      btn.classList.toggle("active", btn.dataset.period === selectedTrendPeriod);
      const span = btn.querySelector("span");
      if (span) {
        const lang = getLangForTrend();
        const isMonth = btn.dataset.period === "month";
        span.textContent = isMonth
          ? (lang === "en" ? "This Month" : lang === "ja" ? "今月分析" : "本月分析")
          : (lang === "en" ? "Today" : lang === "ja" ? "今日分析" : "今日分析");
      }
    });
  }

  function safeRefreshTrend() {
    updateTrendCategoryActive();
    updateTrendPeriodActive();

    if (typeof renderTrendMetricButtons === "function") {
      renderTrendMetricButtons();
    }

    document.querySelectorAll("#chart-page .trend-metric-btn").forEach(btn => {
      btn.classList.toggle("active", btn.dataset.metric === selectedTrendMetric);
    });

    if (typeof updateTrendDashboard === "function") {
      updateTrendDashboard();
    }
  }

  document.addEventListener("click", function (event) {
    const categoryBtn = event.target.closest("#chart-page .trend-category-btn");
    const metricBtn = event.target.closest("#chart-page .trend-metric-btn");
    const periodBtn = event.target.closest("#chart-page .trend-period-btn");

    if (!categoryBtn && !metricBtn && !periodBtn) return;

    event.preventDefault();
    event.stopPropagation();

    if (categoryBtn) {
      selectedTrendCategory = categoryBtn.dataset.category || "body";
      const firstMetric = trendCategories?.[selectedTrendCategory]?.metrics?.[0]?.key;
      selectedTrendMetric = firstMetric || "bmi";
      selectedTrendPeriod = "today";
      safeRefreshTrend();
      return;
    }

    if (metricBtn) {
      selectedTrendMetric = metricBtn.dataset.metric || selectedTrendMetric || "bmi";
      safeRefreshTrend();
      return;
    }

    if (periodBtn) {
      selectedTrendPeriod = periodBtn.dataset.period || "today";
      safeRefreshTrend();
    }
  }, true);

  const originalShowPageForTrend = window.showPage || (typeof showPage === "function" ? showPage : null);
  if (originalShowPageForTrend) {
    window.showPage = function (pageId) {
      originalShowPageForTrend(pageId);
      if (pageId === "chart-page") {
        setTimeout(safeRefreshTrend, 80);
      }
    };
  }

  window.forceRefreshTrendButtons = safeRefreshTrend;
})();


/* ===== 最終修正：健康趨勢分析語言與資料 key 分離 ===== */
(function finalTrendLanguageAndDataFix() {
  const categoryLabels = {
    body: { zh: "身體數值", en: "Body Values", ja: "身体数値" },
    mind: { zh: "心理・氣分", en: "Mind & Mood", ja: "心理・気分" },
    sleep: { zh: "壓力・睡眠", en: "Stress & Sleep", ja: "ストレス・睡眠" }
  };

  const metricLabels = {
    bmi: { zh: "BMI", en: "BMI", ja: "BMI" },
    bloodPressure: { zh: "血壓", en: "Blood Pressure", ja: "血圧" },
    pulse: { zh: "脈搏", en: "Pulse", ja: "脈拍" },
    chest: { zh: "胸圍", en: "Chest", ja: "胸囲" },
    waist: { zh: "腰圍", en: "Waist", ja: "ウエスト" },
    hip: { zh: "臀圍", en: "Hip", ja: "ヒップ" },
    brs5: { zh: "身心壓力", en: "Mind-Body Stress", ja: "心身ストレス" },
    phq9: { zh: "憂鬱", en: "Depression", ja: "抑うつ" },
    gad7: { zh: "焦慮", en: "Anxiety", ja: "不安" },
    pss10: { zh: "壓力感受", en: "Perceived Stress", ja: "ストレス感" },
    who5: { zh: "幸福感", en: "Well-being", ja: "幸福感" },
    isi: { zh: "失眠", en: "Insomnia", ja: "不眠" }
  };

  const ui = {
    zh: {
      title: "健康趨勢分析",
      sub: "先選分類與項目，即可查看今日或本月趨勢。",
      today: "今日分析",
      month: "本月分析",
      note: "＊今日分析顯示當日各時段或量測結果的變化趨勢",
      summary: "分析摘要",
      noData: "目前沒有足夠資料可以繪製折線圖",
      noDataSummary: "目前沒有足夠紀錄可以分析，請先新增健康紀錄或完成量表。"
    },
    en: {
      title: "Health Trend Analysis",
      sub: "Choose a category and item to view today's or this month's trend.",
      today: "Today",
      month: "This Month",
      note: "＊Today's analysis shows changes across today's measurements.",
      summary: "Analysis Summary",
      noData: "Not enough data to draw a trend chart yet",
      noDataSummary: "Not enough records to analyze yet. Please add health records or complete a scale first."
    },
    ja: {
      title: "健康傾向分析",
      sub: "カテゴリと項目を選ぶと、今日または今月の傾向を確認できます。",
      today: "今日分析",
      month: "今月分析",
      note: "＊今日分析では、当日の測定結果の変化を表示します。",
      summary: "分析サマリー",
      noData: "折れ線グラフを作成するためのデータがまだ不足しています",
      noDataSummary: "分析に必要な記録がまだ不足しています。健康記録を追加するか、尺度を完了してください。"
    }
  };

  function lang() {
    const raw = (typeof currentLanguage !== "undefined" && currentLanguage) ||
      window.currentLanguage ||
      localStorage.getItem("siteLanguage") ||
      localStorage.getItem("language") ||
      localStorage.getItem("lang") ||
      "zh";
    if (raw === "en" || raw === "ja") return raw;
    return "zh";
  }

  function label(map, key) {
    const l = lang();
    return map[key]?.[l] || map[key]?.zh || key;
  }

  window.renderTrendMetricButtons = function renderTrendMetricButtonsFinal() {
    const container = document.getElementById("trendMetricButtons");
    if (!container || typeof trendCategories === "undefined") return;

    if (!trendCategories[selectedTrendCategory]) selectedTrendCategory = "body";
    const metrics = trendCategories[selectedTrendCategory].metrics || [];
    if (!metrics.some(m => m.key === selectedTrendMetric)) {
      selectedTrendMetric = metrics[0]?.key || "bmi";
    }

    container.innerHTML = metrics.map(metric => `
      <button type="button" class="trend-metric-btn ${metric.key === selectedTrendMetric ? "active" : ""}" data-metric="${metric.key}">
        ${label(metricLabels, metric.key)}
      </button>
    `).join("");
  };

  function applyTrendLabels() {
    const l = lang();
    const text = ui[l] || ui.zh;

    const title = document.querySelector("#chart-page .trend-header-text h2");
    const sub = document.querySelector("#chart-page .trend-header-text p");
    const note = document.querySelector("#chart-page .trend-chart-note");
    const summaryTitle = document.querySelector("#chart-page .summary-title span:last-child");

    if (title) title.textContent = text.title;
    if (sub) sub.textContent = text.sub;
    if (note) note.textContent = text.note;
    if (summaryTitle) summaryTitle.textContent = text.summary;

    document.querySelectorAll("#chart-page .trend-category-btn").forEach(btn => {
      const key = btn.dataset.category || "body";
      btn.classList.toggle("active", key === selectedTrendCategory);
      const span = btn.querySelector("span") || btn;
      span.textContent = label(categoryLabels, key);
    });

    document.querySelectorAll("#chart-page .trend-period-btn").forEach(btn => {
      const key = btn.dataset.period || "today";
      btn.classList.toggle("active", key === selectedTrendPeriod);
      const span = btn.querySelector("span") || btn;
      span.textContent = key === "month" ? text.month : text.today;
    });
  }

  const originalDrawEmpty = window.drawEmptyTrendMessage || (typeof drawEmptyTrendMessage === "function" ? drawEmptyTrendMessage : null);
  window.drawEmptyTrendMessage = function drawEmptyTrendMessageFinal(svg) {
    const text = (ui[lang()] || ui.zh).noData;
    if (originalDrawEmpty) return originalDrawEmpty(svg, text);
    if (!svg) return;
    svg.innerHTML = `<text x="380" y="160" text-anchor="middle" font-size="20" fill="#7a5a3d">${text}</text>`;
  };

  window.updateTrendDashboard = function updateTrendDashboardFinal() {
    if (typeof trendCategories === "undefined") return;
    if (!trendCategories[selectedTrendCategory]) selectedTrendCategory = "body";

    const metrics = trendCategories[selectedTrendCategory].metrics || [];
    let metric = metrics.find(item => item.key === selectedTrendMetric);
    if (!metric) {
      selectedTrendMetric = metrics[0]?.key || "bmi";
      metric = metrics.find(item => item.key === selectedTrendMetric);
    }
    if (!metric) return;

    applyTrendLabels();

    const valuesResult = typeof getTrendValues === "function"
      ? getTrendValues(selectedTrendMetric, selectedTrendPeriod)
      : { values: [], labels: [], extra: {} };
    const summary = typeof getTrendSummary === "function"
      ? getTrendSummary(selectedTrendMetric, valuesResult.values || [], valuesResult.extra || {})
      : { value: "--", level: "--", status: "warning", text: (ui[lang()] || ui.zh).noDataSummary };

    const periodText = selectedTrendPeriod === "month" ? (ui[lang()] || ui.zh).month : (ui[lang()] || ui.zh).today;
    const metricName = label(metricLabels, metric.key);

    const chartTitle = document.getElementById("trendChartTitle");
    const chartUnit = document.getElementById("trendChartUnit");
    const name = document.getElementById("summaryMetricName");
    const value = document.getElementById("summaryMetricValue");
    const unit = document.getElementById("summaryMetricUnit");
    const level = document.getElementById("summaryLevel");
    const text = document.getElementById("summaryText");

    if (chartTitle) chartTitle.textContent = `${metricName}｜${periodText}`;
    if (chartUnit) chartUnit.textContent = metric.unit ? `(${metric.unit})` : "";
    if (name) name.textContent = metricName;
    if (value) value.textContent = summary.value || "--";
    if (unit) unit.textContent = metric.unit || "";
    if (level) {
      level.textContent = summary.level || "--";
      level.className = `summary-level ${summary.status || "warning"}`;
    }
    if (text) text.textContent = summary.text || (ui[lang()] || ui.zh).noDataSummary;

    if (typeof drawTrendChart === "function") {
      drawTrendChart(selectedTrendMetric, valuesResult);
    }
  };

  function refreshTrend() {
    if (typeof renderTrendMetricButtons === "function") renderTrendMetricButtons();
    if (typeof updateTrendDashboard === "function") updateTrendDashboard();
  }

  document.addEventListener("click", function (event) {
    const categoryBtn = event.target.closest("#chart-page .trend-category-btn");
    const metricBtn = event.target.closest("#chart-page .trend-metric-btn");
    const periodBtn = event.target.closest("#chart-page .trend-period-btn");
    if (!categoryBtn && !metricBtn && !periodBtn) return;

    event.preventDefault();
    event.stopPropagation();

    if (categoryBtn) {
      selectedTrendCategory = categoryBtn.dataset.category || "body";
      const first = trendCategories?.[selectedTrendCategory]?.metrics?.[0]?.key;
      selectedTrendMetric = first || "bmi";
      selectedTrendPeriod = "today";
    }
    if (metricBtn) {
      selectedTrendMetric = metricBtn.dataset.metric || selectedTrendMetric || "bmi";
    }
    if (periodBtn) {
      selectedTrendPeriod = periodBtn.dataset.period || "today";
    }
    refreshTrend();
  }, true);

  const oldShowPage = window.showPage || (typeof showPage === "function" ? showPage : null);
  if (oldShowPage) {
    window.showPage = function showPageTrendFixed(pageId) {
      oldShowPage(pageId);
      if (pageId === "chart-page") setTimeout(refreshTrend, 60);
    };
  }

  const oldSetLanguage = window.setLanguage;
  if (typeof oldSetLanguage === "function") {
    window.setLanguage = function setLanguageTrendFixed(nextLang) {
      oldSetLanguage(nextLang);
      try { currentLanguage = (nextLang === "en" || nextLang === "ja") ? nextLang : "zh"; } catch (e) {}
      window.currentLanguage = (nextLang === "en" || nextLang === "ja") ? nextLang : "zh";
      setTimeout(refreshTrend, 60);
    };
  }

  document.addEventListener("DOMContentLoaded", function () {
    setTimeout(function () {
      try { window.currentLanguage = lang(); } catch (e) {}
      refreshTrend();
    }, 120);
  });

  window.forceRefreshTrendButtons = refreshTrend;
})();

/* =========================================================
   動態文字翻譯修正版：警示彈窗 / 趨勢摘要 / 闖關題目
   2026-05 patch
   ========================================================= */
(function () {
  function langNow() {
    const v = window.currentLanguage || window.currentLang || localStorage.getItem("currentLanguage") || localStorage.getItem("lang") || localStorage.getItem("siteLang") || "zh";
    return v === "en" || v === "ja" ? v : "zh";
  }

  const dynText = {
    zh: {
      emergencyTitle: "🚨 危險健康數值",
      emergencyDetected: "🚨 偵測到危險健康數值！",
      sysHigh: "收縮壓過高，可能有高血壓危象風險。",
      diaHigh: "舒張壓過高，可能有急性心血管風險。",
      diaLow: "舒張壓過低，可能出現頭暈、無力或昏倒風險。",
      pulseFast: "脈搏過快，可能有心律異常風險。",
      pulseSlow: "脈搏過慢，可能有昏厥風險。",
      call119: "撥打 119",
      cancel: "取消",
      reference: "參考值",
      normal: "正常",
      low: "偏低",
      high: "偏高",
      slow: "偏慢",
      fast: "偏快",
      tooLight: "過輕",
      overweight: "過重",
      obesity: "肥胖",
      warning: "需注意",
      noData: "尚無資料",
      noDataText: name => `${name} 目前沒有足夠紀錄可以分析。請先新增今日紀錄或完成量表，系統就會顯示折線趨勢與程度解讀。`,
      bodyText: name => `${name} 主要用來觀察身體圍度變化，建議固定時間、固定姿勢與相同量尺測量，並搭配體重與腰圍一起判斷。`,
      waistText: "腰圍能反映腹部脂肪與身體圍度變化，建議固定時間與方式定期追蹤。",
      waistHighText: "目前腰圍較高，可能代表腹部脂肪累積較多，建議搭配體重、飲食與運動狀況一起調整。",
      bmiNormal: "目前 BMI 落在正常範圍，建議維持均衡飲食、規律活動與穩定作息。",
      bmiLow: "目前 BMI 偏低，建議觀察飲食量、體重變化與精神狀態，必要時可諮詢營養或醫療專業。",
      bmiOver: "目前 BMI 落在過重範圍，建議搭配腰圍觀察腹部脂肪，並逐步調整飲食與活動量。",
      bmiObese: "目前 BMI 偏高，建議持續追蹤體重與腰圍，並考慮尋求醫療或營養專業協助。",
      pulseNormal: "目前脈搏落在一般正常範圍，建議持續觀察休息時與活動後的變化。",
      pulseSlow: "目前脈搏偏慢，若伴隨頭暈、胸悶、虛弱或昏倒，建議就醫評估。",
      pulseFastText: "目前脈搏偏快，可能與緊張、發燒、咖啡因或身體不適有關；若合併胸悶、喘或心悸，建議就醫。",
      bpNormal: "目前平均血壓在理想範圍，建議持續定期量測並維持良好生活習慣。",
      bpSlight: "目前平均血壓略高，建議持續追蹤，並注意睡眠、壓力、鹽分攝取與規律運動。",
      bpHigh: "目前平均血壓偏高，建議固定時間量測、減少鹽分與刺激性飲食；若持續偏高或合併胸痛、頭暈、喘，請就醫評估。",
      correct: "答對了 ✔",
      wrong: "答錯了 ✖",
      yourChoice: "您的選擇：",
      reason: "原因：",
      correctAnswer: "正確答案：",
      finish: "🎉 測驗完成！",
      score: (a,b)=>`你的分數：${a} / ${b}`,
      finishText: "可以回到衛教主題選別的主題，或回難度頁再次挑戰。"
    },
    en: {
      emergencyTitle: "🚨 Dangerous Health Values",
      emergencyDetected: "🚨 Dangerous health values detected!",
      sysHigh: "Systolic blood pressure is too high and may indicate a hypertensive crisis risk.",
      diaHigh: "Diastolic blood pressure is too high and may increase acute cardiovascular risk.",
      diaLow: "Diastolic blood pressure is too low and may cause dizziness, weakness, or fainting.",
      pulseFast: "Pulse is too fast and may indicate an abnormal heart rhythm risk.",
      pulseSlow: "Pulse is too slow and may increase fainting risk.",
      call119: "Call 119",
      cancel: "Cancel",
      reference: "Reference",
      normal: "Normal",
      low: "Low",
      high: "High",
      slow: "Slow",
      fast: "Fast",
      tooLight: "Underweight",
      overweight: "Overweight",
      obesity: "Obesity",
      warning: "Needs attention",
      noData: "No data",
      noDataText: name => `There are not enough ${name} records for analysis yet. Please add today’s record or complete a scale to view trend changes and interpretation.`,
      bodyText: name => `${name} is mainly used to observe body measurement changes. Measure at a fixed time, with the same posture and measuring tape, and compare it together with weight and waist circumference.`,
      waistText: "Waist circumference reflects abdominal fat and body measurement changes. Track it regularly using the same method.",
      waistHighText: "Your waist circumference is relatively high, which may indicate more abdominal fat. Consider adjusting diet and activity together with weight tracking.",
      bmiNormal: "Your BMI is within the normal range. Keep a balanced diet, regular activity, and stable routine.",
      bmiLow: "Your BMI is low. Observe food intake, weight changes, and energy level. Consult a professional if needed.",
      bmiOver: "Your BMI is in the overweight range. Track waist circumference and gradually adjust diet and activity.",
      bmiObese: "Your BMI is high. Continue tracking weight and waist circumference, and consider medical or nutrition support.",
      pulseNormal: "Your pulse is generally within the normal range. Continue observing changes at rest and after activity.",
      pulseSlow: "Your pulse is slow. If dizziness, chest tightness, weakness, or fainting occurs, seek medical evaluation.",
      pulseFastText: "Your pulse is fast. It may be related to stress, fever, caffeine, or discomfort. Seek care if chest tightness, shortness of breath, or palpitations occur.",
      bpNormal: "Your average blood pressure is in an ideal range. Continue regular measurement and healthy habits.",
      bpSlight: "Your average blood pressure is slightly high. Continue tracking and watch sleep, stress, salt intake, and exercise.",
      bpHigh: "Your average blood pressure is high. Measure regularly and reduce salt and stimulating foods. Seek care if it stays high or comes with chest pain, dizziness, or shortness of breath.",
      correct: "Correct ✔",
      wrong: "Incorrect ✖",
      yourChoice: "Your choice:",
      reason: "Reason:",
      correctAnswer: "Correct answer:",
      finish: "🎉 Quiz completed!",
      score: (a,b)=>`Your score: ${a} / ${b}`,
      finishText: "You can return to the quiz menu or challenge another difficulty."
    },
    ja: {
      emergencyTitle: "🚨 危険な健康数値",
      emergencyDetected: "🚨 危険な健康数値を検出しました！",
      sysHigh: "収縮期血圧が高すぎます。高血圧緊急症のリスクがあります。",
      diaHigh: "拡張期血圧が高すぎます。急性心血管リスクの可能性があります。",
      diaLow: "拡張期血圧が低すぎます。めまい、脱力感、失神のリスクがあります。",
      pulseFast: "脈拍が速すぎます。不整脈などのリスクがあります。",
      pulseSlow: "脈拍が遅すぎます。失神のリスクがあります。",
      call119: "119に電話",
      cancel: "キャンセル",
      reference: "参考値",
      normal: "正常",
      low: "低め",
      high: "高め",
      slow: "遅め",
      fast: "速め",
      tooLight: "低体重",
      overweight: "過体重",
      obesity: "肥満",
      warning: "注意が必要",
      noData: "データなし",
      noDataText: name => `${name}の記録がまだ足りないため分析できません。今日の記録を追加するか尺度を完了すると、傾向と解釈が表示されます。`,
      bodyText: name => `${name}は体のサイズ変化を観察するための参考値です。毎回同じ時間、同じ姿勢、同じメジャーで測定し、体重やウエストと合わせて確認しましょう。`,
      waistText: "ウエストは腹部脂肪や体型変化を反映します。同じ方法で定期的に記録しましょう。",
      waistHighText: "ウエストが高めです。腹部脂肪が多い可能性があるため、体重・食事・運動状況と合わせて調整しましょう。",
      bmiNormal: "BMIは正常範囲です。バランスのよい食事、適度な活動、安定した生活リズムを続けましょう。",
      bmiLow: "BMIが低めです。食事量、体重変化、元気さを観察し、必要に応じて専門家へ相談しましょう。",
      bmiOver: "BMIは過体重の範囲です。ウエストも合わせて観察し、食事と活動量を少しずつ調整しましょう。",
      bmiObese: "BMIが高めです。体重とウエストを継続的に記録し、医療・栄養の専門家へ相談することも検討しましょう。",
      pulseNormal: "脈拍は一般的な正常範囲です。安静時と活動後の変化を続けて観察しましょう。",
      pulseSlow: "脈拍が遅めです。めまい、胸部不快感、脱力感、失神がある場合は受診を検討してください。",
      pulseFastText: "脈拍が速めです。緊張、発熱、カフェイン、体調不良が関係することがあります。胸部不快感、息切れ、動悸がある場合は受診してください。",
      bpNormal: "平均血圧は理想的な範囲です。定期測定と良い生活習慣を続けましょう。",
      bpSlight: "平均血圧がやや高めです。睡眠、ストレス、塩分摂取、運動に注意しながら継続して記録しましょう。",
      bpHigh: "平均血圧が高めです。決まった時間に測定し、塩分や刺激物を控えましょう。高値が続く、胸痛、めまい、息切れがある場合は受診してください。",
      correct: "正解 ✔",
      wrong: "不正解 ✖",
      yourChoice: "あなたの選択：",
      reason: "理由：",
      correctAnswer: "正解：",
      finish: "🎉 テスト完了！",
      score: (a,b)=>`スコア：${a} / ${b}`,
      finishText: "クイズメニューに戻るか、別の難易度に挑戦できます。"
    }
  };

  function T(key) {
    const l = langNow();
    return (dynText[l] && dynText[l][key]) || dynText.zh[key] || key;
  }

  const metricNames = {
    zh: { bloodPressure: "血壓", pulse: "脈搏", chest: "胸圍", waist: "腰圍", hip: "臀圍", bmi: "BMI" },
    en: { bloodPressure: "Blood pressure", pulse: "Pulse", chest: "Chest", waist: "Waist", hip: "Hip", bmi: "BMI" },
    ja: { bloodPressure: "血圧", pulse: "脈拍", chest: "胸囲", waist: "ウエスト", hip: "ヒップ", bmi: "BMI" }
  };
  function M(key) { return metricNames[langNow()]?.[key] || metricNames.zh[key] || key; }

  const warningMap = {
    "🚨 偵測到危險健康數值！": "emergencyDetected",
    "收縮壓過高，可能有高血壓危象風險。": "sysHigh",
    "舒張壓過高，可能有急性心血管風險。": "diaHigh",
    "舒張壓過低，可能出現頭暈、無力或昏倒風險。": "diaLow",
    "脈搏過快，可能有心律異常風險。": "pulseFast",
    "脈搏過慢，可能有昏厥風險。": "pulseSlow"
  };

  window.showEmergencyPopup = function showEmergencyPopupTranslated(messages) {
    const box = document.getElementById("emergency-message");
    const popup = document.getElementById("emergency-popup");
    if (!box || !popup) return;
    const l = langNow();
    const lines = (messages || []).filter(Boolean).map(msg => {
      const key = warningMap[String(msg).trim()];
      return key ? T(key) : String(msg);
    });
    const title = T("emergencyTitle");
    const call = T("call119");
    const cancel = T("cancel");
    box.innerHTML = `
      <h2 class="translated-emergency-title">${title}</h2>
      <div class="translated-emergency-lines">${lines.map(x => `<p>${x}</p>`).join("")}</div>
      <div class="translated-emergency-actions">
        <button type="button" onclick="emergencyCall119 && emergencyCall119()">${call}</button>
        <button type="button" onclick="closeEmergencyPopup && closeEmergencyPopup()">${cancel}</button>
      </div>
    `;
    popup.classList.remove("hidden");
  };

  window.noDataSummary = function noDataSummaryTranslated(name) {
    return { value: "--", level: T("noData"), status: "warning", text: T("noDataText")(name || M("bmi")) };
  };
  window.getBmiSummary = function getBmiSummaryTranslated(value) {
    if (value < 18.5) return { level: T("tooLight"), status: "warning", text: T("bmiLow") };
    if (value < 24) return { level: T("normal"), status: "normal", text: T("bmiNormal") };
    if (value < 27) return { level: T("overweight"), status: "warning", text: T("bmiOver") };
    return { level: T("obesity"), status: "danger", text: T("bmiObese") };
  };
  window.getPulseSummary = function getPulseSummaryTranslated(value) {
    if (value < 60) return { level: T("slow"), status: "warning", text: T("pulseSlow") };
    if (value <= 100) return { level: T("normal"), status: "normal", text: T("pulseNormal") };
    return { level: T("fast"), status: "warning", text: T("pulseFastText") };
  };
  window.getBodyCircumferenceSummary = function getBodyCircumferenceSummaryTranslated(name) {
    return { level: T("reference"), status: "normal", text: T("bodyText")(name || M("chest")) };
  };
  window.getWaistSummary = function getWaistSummaryTranslated(value) {
    if (value >= 90) return { level: T("warning"), status: "warning", text: T("waistHighText") };
    return { level: T("reference"), status: "normal", text: T("waistText") };
  };
  window.getBloodPressureLevel = function getBloodPressureLevelTranslated(sys, dia) {
    if (sys >= 140 || dia >= 90) return { label: T("high"), status: "danger", text: T("bpHigh") };
    if (sys >= 130 || dia >= 80) return { label: T("warning"), status: "warning", text: T("bpSlight") };
    return { label: T("normal"), status: "normal", text: T("bpNormal") };
  };
  window.getTrendSummary = function getTrendSummaryTranslated(metricKey, values, extra = {}) {
    if (metricKey === "bloodPressure") {
      const systolic = extra.systolic || [];
      const diastolic = extra.diastolic || [];
      if (!systolic.length || !diastolic.length) return window.noDataSummary(M("bloodPressure"));
      const avgSys = Math.round(systolic.reduce((a,b)=>a+b,0) / systolic.length);
      const avgDia = Math.round(diastolic.reduce((a,b)=>a+b,0) / diastolic.length);
      const level = window.getBloodPressureLevel(avgSys, avgDia);
      return { value: `${avgSys}/${avgDia}`, level: level.label, status: level.status, text: level.text };
    }
    if (!values || !values.length) return window.noDataSummary(M(metricKey));
    const latest = values[values.length - 1];
    const rounded = (typeof roundValue === "function") ? roundValue(latest) : Math.round(latest * 10) / 10;
    const map = {
      bmi: window.getBmiSummary(latest),
      pulse: window.getPulseSummary(latest),
      chest: window.getBodyCircumferenceSummary(M("chest")),
      waist: window.getWaistSummary(latest),
      hip: window.getBodyCircumferenceSummary(M("hip")),
      brs5: (typeof getBRS5Summary === "function" ? getBRS5Summary(latest) : null),
      phq9: (typeof getPHQ9Summary === "function" ? getPHQ9Summary(latest) : null),
      gad7: (typeof getGAD7Summary === "function" ? getGAD7Summary(latest) : null),
      pss10: (typeof getPSS10Summary === "function" ? getPSS10Summary(latest) : null),
      who5: (typeof getWHO5Summary === "function" ? getWHO5Summary(latest) : null),
      isi: (typeof getISISummary === "function" ? getISISummary(latest) : null)
    };
    const result = map[metricKey] || { level: T("reference"), status: "normal", text: T("bodyText")(M(metricKey)) };
    return { value: String(rounded), ...result };
  };

  const quizTranslation = {
    en: {
      "如果右眼進入小異物（如灰塵或沙粒），正確的處理方法為何？": "If a small foreign object such as dust or sand enters the right eye, what is the correct response?",
      "用手指或棉花棒清除": "Remove it with your finger or a cotton swab",
      "左右眨眼並揉眼睛弄出來": "Blink and rub the eye until it comes out",
      "用眼藥水大量沖洗傷口": "Use eye drops to flush the eye heavily",
      "不可揉眼，應以流動清水沖洗": "Do not rub the eye; rinse it with running clean water",
      "用手指或棉花棒可能刮傷角膜或造成感染。": "Using fingers or cotton swabs may scratch the cornea or cause infection.",
      "揉眼睛會使異物刮傷角膜，讓情況更嚴重。": "Rubbing the eye may scratch the cornea and worsen the situation.",
      "眼藥水不一定適合沖洗異物，應優先使用乾淨流動水。": "Eye drops are not always suitable for flushing foreign objects; clean running water is preferred.",
      "正確，避免揉眼並使用乾淨流動水沖洗可降低傷害。": "Correct. Avoid rubbing the eye and rinse with clean running water to reduce injury.",
      "衛教闖關選單頁": "Quiz menu",
      "闖關頁面!": "quiz page!"
    },
    ja: {
      "如果右眼進入小異物（如灰塵或沙粒），正確的處理方法為何？": "右目にほこりや砂などの小さな異物が入った場合、正しい対応はどれですか？",
      "用手指或棉花棒清除": "指や綿棒で取り除く",
      "左右眨眼並揉眼睛弄出來": "まばたきして目をこすり出す",
      "用眼藥水大量沖洗傷口": "目薬で大量に洗い流す",
      "不可揉眼，應以流動清水沖洗": "目をこすらず、清潔な流水で洗い流す",
      "用手指或棉花棒可能刮傷角膜或造成感染。": "指や綿棒を使うと角膜を傷つけたり感染を起こす可能性があります。",
      "揉眼睛會使異物刮傷角膜，讓情況更嚴重。": "目をこすると異物で角膜を傷つけ、状態を悪化させることがあります。",
      "眼藥水不一定適合沖洗異物，應優先使用乾淨流動水。": "目薬は異物の洗浄に適さない場合があります。清潔な流水を優先してください。",
      "正確，避免揉眼並使用乾淨流動水沖洗可降低傷害。": "正解です。目をこすらず清潔な流水で洗うことで、傷害を減らせます。",
      "衛教闖關選單頁": "クイズメニュー",
      "闖關頁面!": "クイズページへ！"
    }
  };
  function QT(text) {
    const l = langNow();
    if (l === "zh") return text;
    return quizTranslation[l]?.[String(text)] || text;
  }

  const oldLoadQuestion = window.loadQuestion || (typeof loadQuestion === "function" ? loadQuestion : null);
  window.loadQuestion = function loadQuestionTranslated() {
    if (typeof getQuestionSet !== "function") return oldLoadQuestion && oldLoadQuestion();
    try { answered = false; } catch(e) {}
    const questionSet = getQuestionSet();
    const q = questionSet[quizIndex];
    const result = document.getElementById("answer-explanation");
    const question = document.getElementById("quiz-question");
    const options = document.getElementById("quiz-options");
    if (!q || !result || !question || !options) return;
    result.innerHTML = "";
    result.classList.add("hidden");
    question.innerHTML = `<strong>${quizIndex + 1}. ${QT(q.q)}</strong>`;
    options.innerHTML = (q.options || []).map((opt, i) => `<button class="quiz-option" onclick="checkAnswer(${i})">${QT(opt)}</button>`).join("");
  };

  window.checkAnswer = function checkAnswerTranslated(choice) {
    if (typeof answered !== "undefined" && answered) return;
    try { answered = true; } catch(e) {}
    const questionSet = getQuestionSet();
    const q = questionSet[quizIndex];
    const result = document.getElementById("answer-explanation");
    const optionButtons = document.querySelectorAll(".quiz-option");
    if (!q || !result) return;
    const isCorrect = choice === q.answer;
    if (isCorrect) quizScore++;
    optionButtons.forEach((btn, index) => {
      btn.disabled = true;
      if (index === choice && index === q.answer) btn.classList.add("selected-correct");
      else if (index === q.answer) btn.classList.add("correct-answer");
      else if (index === choice) btn.classList.add("selected-wrong");
    });
    const explain = idx => (typeof cleanQuizExplainText === "function" ? cleanQuizExplainText(q.explain?.[idx]) : (q.explain?.[idx] || ""));
    result.classList.remove("hidden");
    result.innerHTML = `
      <div class="${isCorrect ? "right-text" : "wrong-text"}">${isCorrect ? T("correct") : T("wrong")}</div>
      ${isCorrect ? `
        <p><strong>${T("yourChoice")}</strong> ✅ ${QT(q.options[choice])}</p>
        <p><strong>${T("reason")}</strong> ${QT(explain(choice))}</p>
      ` : `
        <p><strong>${T("yourChoice")}</strong> ❌ ${QT(q.options[choice])}！${T("reason")} ${QT(explain(choice))}</p>
        <hr>
        <p><strong>${T("correctAnswer")}</strong> ✅ ${QT(q.options[q.answer])}！${T("reason")} ${QT(explain(q.answer))}</p>
      `}
    `;
    if (typeof updateQuizProgress === "function") updateQuizProgress();
  };

  window.nextQuestion = function nextQuestionTranslated() {
    if (typeof answered !== "undefined" && !answered) return;
    quizIndex++;
    const questionSet = getQuestionSet();
    const result = document.getElementById("answer-explanation");
    const question = document.getElementById("quiz-question");
    const options = document.getElementById("quiz-options");
    if (!result || !question || !options) return;
    if (quizIndex >= questionSet.length) {
      question.innerHTML = T("finish");
      options.innerHTML = "";
      result.classList.remove("hidden");
      result.innerHTML = `<div class="right-text">${T("score")(quizScore, questionSet.length)}</div><p>${T("finishText")}</p>`;
      if (typeof updateQuizProgress === "function") updateQuizProgress();
      return;
    }
    window.loadQuestion();
    if (typeof updateQuizProgress === "function") updateQuizProgress();
  };

  const oldSetLanguage = window.setLanguage;
  if (typeof oldSetLanguage === "function") {
    window.setLanguage = function setLanguageDynamicFixed(nextLang) {
      oldSetLanguage(nextLang);
      setTimeout(function () {
        if (document.getElementById("quiz-page") && !document.getElementById("quiz-page").classList.contains("hidden")) window.loadQuestion();
        if (typeof updateTrendDashboard === "function") updateTrendDashboard();
        if (typeof window.updateTrendDashboard === "function") window.updateTrendDashboard();
      }, 80);
    };
  }
})();

/* =========================================================
   FINAL FIX PACK 2026-05-29
   修正：警示彈窗重複按鈕、衛教按鈕文字消失、語言選單、
   量表選項 undefined、儲存後自動跳歷史、部分動態文字更新。
   ========================================================= */
(function finalStabilityFixPack() {
  function getLang() {
    const raw = window.currentLanguage ||
      (typeof currentLanguage !== "undefined" ? currentLanguage : "") ||
      localStorage.getItem("siteLanguage") ||
      localStorage.getItem("currentLang") ||
      localStorage.getItem("language") ||
      localStorage.getItem("lang") ||
      "zh";
    if (raw === "en" || raw === "ja" || raw === "zh") return raw;
    if (String(raw).toLowerCase().startsWith("en")) return "en";
    if (String(raw).toLowerCase().startsWith("ja") || String(raw).includes("日")) return "ja";
    return "zh";
  }

  const finalText = {
    zh: {
      language: "語言",
      zh: "繁體中文",
      en: "English",
      ja: "日本語",
      eduKnowledge: "衛教知識",
      emergencyTitle: "🚨 危險健康數值",
      call119: "撥打 119",
      cancel: "取消",
      saved: "情緒評估結果已儲存！可自行回到量表選擇頁查看歷史紀錄。",
      chooseAlert: "請先選擇本題答案"
    },
    en: {
      language: "Language",
      zh: "繁體中文",
      en: "English",
      ja: "日本語",
      eduKnowledge: "Health Knowledge",
      emergencyTitle: "🚨 Dangerous Health Values",
      call119: "Call 119",
      cancel: "Cancel",
      saved: "The assessment result has been saved. You can view history from the scale menu.",
      chooseAlert: "Please choose an answer first."
    },
    ja: {
      language: "言語",
      zh: "繁體中文",
      en: "English",
      ja: "日本語",
      eduKnowledge: "健康知識",
      emergencyTitle: "🚨 危険な健康数値",
      call119: "119に電話",
      cancel: "キャンセル",
      saved: "評価結果を保存しました。履歴は尺度選択ページから確認できます。",
      chooseAlert: "先に回答を選択してください。"
    }
  };

  const warningI18n = {
    "🚨 偵測到危險健康數值！": { en: "🚨 Dangerous health values detected!", ja: "🚨 危険な健康数値を検出しました！" },
    "偵測到危險健康數值！": { en: "Dangerous health values detected!", ja: "危険な健康数値を検出しました！" },
    "收縮壓過高，可能有高血壓危象風險。": { en: "Systolic blood pressure is too high. There may be a risk of hypertensive crisis.", ja: "収縮期血圧が高すぎます。高血圧緊急症のリスクがあります。" },
    "舒張壓過高，可能有急性心血管風險。": { en: "Diastolic blood pressure is too high. There may be an acute cardiovascular risk.", ja: "拡張期血圧が高すぎます。急性心血管リスクの可能性があります。" },
    "舒張壓過低，可能出現頭暈、無力或昏倒風險。": { en: "Diastolic blood pressure is too low. Dizziness, weakness, or fainting may occur.", ja: "拡張期血圧が低すぎます。めまい、脱力、失神の可能性があります。" },
    "脈搏過快，可能有心律異常風險。": { en: "Pulse is too fast. There may be a risk of abnormal heart rhythm.", ja: "脈拍が速すぎます。不整脈のリスクがあります。" },
    "脈搏過慢，可能有昏厥風險。": { en: "Pulse is too slow. There may be a risk of fainting.", ja: "脈拍が遅すぎます。失神のリスクがあります。" },
    "BMI 過高，建議控制飲食與運動。": { en: "BMI is high. Please adjust diet and exercise habits.", ja: "BMIが高めです。食事と運動習慣の調整をおすすめします。" }
  };

  function translateWarningLine(line) {
    const lang = getLang();
    const s = String(line || "").trim();
    if (lang === "zh") return s;
    return warningI18n[s]?.[lang] || s;
  }

  function updateLanguageMenuText() {
    const lang = getLang();
    const t = finalText[lang] || finalText.zh;
    const langBtn = document.querySelector(".language-btn, .lang-btn, .language-switch button, button[onclick*='toggleLanguageMenu'], button[onclick*='toggleLangMenu']");
    if (langBtn) langBtn.innerHTML = `🌐 <span>${t.language}</span> ▾`;

    const menu = document.getElementById("language-menu") || document.getElementById("lang-menu");
    if (menu) {
      menu.classList.add("language-menu-fixed");
      menu.innerHTML = `
        <button type="button" data-lang="zh">${t.zh}</button>
        <button type="button" data-lang="en">${t.en}</button>
        <button type="button" data-lang="ja">${t.ja}</button>
      `;
      menu.querySelectorAll("button[data-lang]").forEach(btn => {
        btn.onclick = function (e) {
          e.preventDefault();
          e.stopPropagation();
          const next = this.dataset.lang;
          if (typeof window.setLanguage === "function") window.setLanguage(next);
          else {
            window.currentLanguage = next;
            try { currentLanguage = next; } catch (err) {}
            localStorage.setItem("siteLanguage", next);
          }
          menu.classList.add("hidden");
          setTimeout(updateAllFinalTexts, 30);
        };
      });
    }
  }

  window.toggleLangMenu = window.toggleLanguageMenu = function fixedToggleLangMenu(event) {
    if (event) event.stopPropagation();
    const menu = document.getElementById("language-menu") || document.getElementById("lang-menu");
    if (!menu) return;
    updateLanguageMenuText();
    menu.classList.toggle("hidden");
  };

  document.addEventListener("click", function () {
    const menu = document.getElementById("language-menu") || document.getElementById("lang-menu");
    if (menu) menu.classList.add("hidden");
  });

  window.showEmergencyPopup = function finalShowEmergencyPopup(messages) {
    const lang = getLang();
    const t = finalText[lang] || finalText.zh;
    const popup = document.getElementById("emergency-popup");
    const box = document.getElementById("emergency-message");
    if (!popup || !box) return;

    const titleEl = popup.querySelector("h3");
    if (titleEl) titleEl.textContent = t.emergencyTitle;

    const lines = (messages || []).filter(Boolean).map(translateWarningLine);
    box.innerHTML = lines.map(line => `<p>${line}</p>`).join("");

    const fixedButtons = popup.querySelector(".popup-buttons");
    if (fixedButtons) {
      fixedButtons.style.display = "flex";
      const btns = fixedButtons.querySelectorAll("button");
      if (btns[0]) btns[0].innerHTML = t.call119;
      if (btns[1]) btns[1].textContent = t.cancel;
    }
    popup.classList.remove("hidden");
  };

  function updateEduButtonText() {
    const lang = getLang();
    const text = finalText[lang]?.eduKnowledge || finalText.zh.eduKnowledge;
    document.querySelectorAll('#home-page .edu-entry-btn span[data-i18n="eduKnowledge"], #home-page .edu-entry-btn span').forEach((span, index) => {
      if (index === 0 || span.dataset.i18n === "eduKnowledge") {
        span.style.display = "inline";
        span.textContent = text;
      }
    });
    document.querySelectorAll('#home-page .edu-entry-btn span[data-i18n="readHealthKnowledge"]').forEach(span => {
      span.style.display = "none";
      span.textContent = "";
    });
  }

  const scaleOptionSets = {
    zh: {
      gad7: ["完全沒有", "幾天", "超過一半天數", "幾乎每天"],
      phq9: ["完全沒有", "幾天", "超過一半天數", "幾乎每天"],
      pss10: ["從不", "很少", "有時", "常常", "總是"],
      bsrs5: ["完全沒有", "輕微", "中等程度", "厲害", "非常厲害"],
      brs5: ["完全沒有", "輕微", "中等程度", "厲害", "非常厲害"],
      who5: ["從未", "偶爾", "少於一半時間", "超過一半時間", "大多數時間", "一直都是"],
      isi: ["沒有", "輕微", "中等", "嚴重", "非常嚴重"]
    },
    en: {
      gad7: ["Not at all", "Several days", "More than half the days", "Nearly every day"],
      phq9: ["Not at all", "Several days", "More than half the days", "Nearly every day"],
      pss10: ["Never", "Almost never", "Sometimes", "Fairly often", "Very often"],
      bsrs5: ["Not at all", "Mild", "Moderate", "Severe", "Very severe"],
      brs5: ["Not at all", "Mild", "Moderate", "Severe", "Very severe"],
      who5: ["At no time", "Some of the time", "Less than half the time", "More than half the time", "Most of the time", "All of the time"],
      isi: ["None", "Mild", "Moderate", "Severe", "Very severe"]
    },
    ja: {
      gad7: ["全くない", "数日", "半分以上の日", "ほぼ毎日"],
      phq9: ["全くない", "数日", "半分以上の日", "ほぼ毎日"],
      pss10: ["全くない", "ほとんどない", "時々", "よくある", "非常によくある"],
      bsrs5: ["全くない", "軽い", "中程度", "強い", "非常に強い"],
      brs5: ["全くない", "軽い", "中程度", "強い", "非常に強い"],
      who5: ["全くない", "時々", "半分未満", "半分以上", "ほとんどいつも", "いつも"],
      isi: ["なし", "軽度", "中等度", "重度", "非常に重度"]
    }
  };

  const oldRenderScaleQuestion = window.renderScaleQuestion || (typeof renderScaleQuestion === "function" ? renderScaleQuestion : null);
  window.renderScaleQuestion = function finalRenderScaleQuestion() {
    if (typeof getLocalizedScaleInfo !== "function") return oldRenderScaleQuestion && oldRenderScaleQuestion();
    const scale = getLocalizedScaleInfo(currentScale);
    if (!scale) return;
    const lang = getLang();
    const titleEl = document.getElementById("scale-title");
    const countEl = document.getElementById("scale-question-count");
    const questionEl = document.getElementById("scale-question-text");
    const progressEl = document.getElementById("scale-progress-bar");
    const optionsBox = document.getElementById("scale-options");
    const prevBtn = document.getElementById("prev-scale-btn");
    const nextBtn = document.getElementById("next-scale-btn");

    if (titleEl) titleEl.textContent = scale.title || "";
    if (countEl) countEl.textContent = lang === "en" ? `Question ${currentQuestionIndex + 1} / ${scale.questions.length}` : lang === "ja" ? `第 ${currentQuestionIndex + 1} / ${scale.questions.length} 問` : `第 ${currentQuestionIndex + 1} / ${scale.questions.length} 題`;
    if (questionEl) questionEl.textContent = scale.questions[currentQuestionIndex] || "";
    if (progressEl) progressEl.style.width = (((currentQuestionIndex + 1) / scale.questions.length) * 100) + "%";

    if (optionsBox) {
      optionsBox.innerHTML = "";
      const key = currentScale === "bsrs5" ? "brs5" : currentScale;
      const labels = scaleOptionSets[lang]?.[key] || scaleOptionSets.zh[key] || [];
      const rawOptions = Array.isArray(scale.options) ? scale.options : [];
      const length = Math.max(labels.length, rawOptions.length);
      for (let index = 0; index < length; index++) {
        const raw = rawOptions[index];
        const score = Number.isFinite(Number(raw?.score)) ? Number(raw.score) : index;
        const label = labels[index] || (typeof raw === "string" ? raw : raw?.text) || String(score);
        const points = lang === "en" ? (score === 1 ? "pt" : "pts") : lang === "ja" ? "点" : "分";
        const btn = document.createElement("button");
        btn.type = "button";
        btn.className = "scale-option-btn";
        btn.textContent = `${label}（${score} ${points}）`;
        btn.dataset.score = String(score);
        if (scaleAnswers[currentQuestionIndex] === score) btn.classList.add("selected");
        btn.onclick = function () {
          scaleAnswers[currentQuestionIndex] = score;
          window.renderScaleQuestion();
        };
        optionsBox.appendChild(btn);
      }
    }
    if (prevBtn) {
      prevBtn.style.display = currentQuestionIndex === 0 ? "none" : "inline-block";
      prevBtn.textContent = lang === "en" ? "Previous" : lang === "ja" ? "前の質問" : "上一題";
    }
    if (nextBtn) nextBtn.textContent = currentQuestionIndex === scale.questions.length - 1 ? (lang === "en" ? "View Result" : lang === "ja" ? "結果を見る" : "查看結果") : (lang === "en" ? "Next" : lang === "ja" ? "次の質問" : "下一題");
  };

  window.nextScaleQuestion = function finalNextScaleQuestion() {
    const scale = typeof getLocalizedScaleInfo === "function" ? getLocalizedScaleInfo(currentScale) : null;
    if (!scale) return;
    if (scaleAnswers[currentQuestionIndex] === null || scaleAnswers[currentQuestionIndex] === undefined) {
      alert(finalText[getLang()]?.chooseAlert || finalText.zh.chooseAlert);
      return;
    }
    if (currentQuestionIndex < scale.questions.length - 1) {
      currentQuestionIndex++;
      window.renderScaleQuestion();
    } else if (typeof showScaleResult === "function") {
      showScaleResult();
    }
  };

  window.saveScaleResult = function finalSaveScaleResult() {
    const rawScale = typeof scaleData !== "undefined" ? scaleData[currentScale] : null;
    if (!rawScale) return;
    const lang = getLang();
    const score = (scaleAnswers || []).reduce((sum, value) => sum + Number(value || 0), 0);
    const raw = typeof rawScale.getLevel === "function" ? rawScale.getLevel(score) : ["", ""];
    const rawLevel = Array.isArray(raw) ? raw[0] : String(raw || "");
    const result = {
      date: new Date().toLocaleString(lang === "ja" ? "ja-JP" : lang === "en" ? "en-US" : "zh-TW"),
      mood: selectedMood || "",
      scaleKey: currentScale,
      scale: rawScale.title || currentScale,
      score,
      total: rawScale.total,
      level: rawLevel
    };
    const records = JSON.parse(localStorage.getItem("moodScaleRecords") || "[]");
    records.push(result);
    localStorage.setItem("moodScaleRecords", JSON.stringify(records));
    alert(finalText[lang]?.saved || finalText.zh.saved);
  };

  function updateAllFinalTexts() {
    updateLanguageMenuText();
    updateEduButtonText();
    document.body.classList.remove("lang-zh", "lang-en", "lang-ja");
    document.body.classList.add(`lang-${getLang()}`);
  }
  window.updateAllFinalTexts = updateAllFinalTexts;

  const oldSetLanguage = window.setLanguage;
  window.setLanguage = function finalSetLanguage(lang) {
    const next = (lang === "en" || lang === "ja") ? lang : "zh";
    window.currentLanguage = next;
    try { currentLanguage = next; } catch (err) {}
    localStorage.setItem("siteLanguage", next);
    localStorage.setItem("currentLang", next);
    localStorage.setItem("language", next);
    if (typeof oldSetLanguage === "function" && oldSetLanguage !== window.setLanguage) {
      try { oldSetLanguage(next); } catch (err) {}
    } else if (typeof applyLanguage === "function") {
      try { applyLanguage(); } catch (err) {}
    }
    setTimeout(updateAllFinalTexts, 50);
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", updateAllFinalTexts);
  } else {
    updateAllFinalTexts();
  }
})();

/* =========================================================
   FINAL CONTENT TRANSLATION & POPUP ACTION FIX
   2026-05-29
   修正：
   1. 危險健康數值彈窗按鈕不見／不能按
   2. 衛教助理主題、子題與文章內容英日翻譯
   3. Bathroom Fall Prevention 內文完整英日翻譯
   4. 讀取語言後動態內容重新渲染
   ========================================================= */
(function finalContentTranslationAndPopupFix() {
  function langNow() {
    const raw = window.currentLanguage ||
      (typeof currentLanguage !== "undefined" ? currentLanguage : "") ||
      localStorage.getItem("siteLanguage") ||
      localStorage.getItem("currentLang") ||
      localStorage.getItem("language") ||
      localStorage.getItem("lang") ||
      "zh";
    if (raw === "en" || raw === "ja" || raw === "zh") return raw;
    if (String(raw).toLowerCase().startsWith("en")) return "en";
    if (String(raw).toLowerCase().startsWith("ja") || String(raw).includes("日")) return "ja";
    return "zh";
  }

  const popupText = {
    zh: {
      title: "🚨 危險健康數值",
      detected: "🚨 偵測到危險健康數值！",
      call: "🚑 撥打 119",
      cancel: "取消"
    },
    en: {
      title: "🚨 Dangerous Health Values",
      detected: "🚨 Dangerous health values detected!",
      call: "🚑 Call 119",
      cancel: "Cancel"
    },
    ja: {
      title: "🚨 危険な健康数値",
      detected: "🚨 危険な健康数値を検出しました！",
      call: "🚑 119に電話",
      cancel: "キャンセル"
    }
  };

  const warningText = {
    "🚨 偵測到危險健康數值！": {
      en: "🚨 Dangerous health values detected!",
      ja: "🚨 危険な健康数値を検出しました！"
    },
    "偵測到危險健康數值！": {
      en: "Dangerous health values detected!",
      ja: "危険な健康数値を検出しました！"
    },
    "收縮壓過高，可能有高血壓危象風險。": {
      en: "Systolic blood pressure is too high. There may be a risk of hypertensive crisis.",
      ja: "収縮期血圧が高すぎます。高血圧緊急症のリスクがあります。"
    },
    "舒張壓過高，可能有急性心血管風險。": {
      en: "Diastolic blood pressure is too high. There may be an acute cardiovascular risk.",
      ja: "拡張期血圧が高すぎます。急性心血管リスクの可能性があります。"
    },
    "舒張壓過低，可能出現頭暈、無力或昏倒風險。": {
      en: "Diastolic blood pressure is too low. Dizziness, weakness, or fainting may occur.",
      ja: "拡張期血圧が低すぎます。めまい、脱力感、失神のリスクがあります。"
    },
    "脈搏過快，可能有心律異常風險。": {
      en: "Pulse is too fast. There may be a risk of abnormal heart rhythm.",
      ja: "脈拍が速すぎます。不整脈のリスクがあります。"
    },
    "脈搏過慢，可能有昏厥風險。": {
      en: "Pulse is too slow. There may be a risk of fainting.",
      ja: "脈拍が遅すぎます。失神のリスクがあります。"
    }
  };

  function translateWarning(line) {
    const lang = langNow();
    const str = String(line || "").trim();
    if (lang === "zh") return str;
    return warningText[str]?.[lang] || str;
  }

  window.closeEmergencyPopup = function closeEmergencyPopupFixed() {
    const popup = document.getElementById("emergency-popup");
    if (!popup) return;
    popup.classList.add("hidden");
    popup.style.display = "none";
  };

  const oldEmergencyCall = window.emergencyCall119 || window.call119;
  window.emergencyCall119 = function emergencyCall119Fixed() {
    if (typeof oldEmergencyCall === "function") oldEmergencyCall();
    else if (typeof window.call119 === "function") window.call119();
  };

  window.showEmergencyPopup = function showEmergencyPopupFixed(messages) {
    const lang = langNow();
    const t = popupText[lang] || popupText.zh;
    const popup = document.getElementById("emergency-popup");
    const box = document.getElementById("emergency-message");
    if (!popup || !box) return;

    const lines = (messages && messages.length ? messages : [t.detected]).filter(Boolean).map(translateWarning);
    const titleEl = popup.querySelector("h3");
    if (titleEl) titleEl.textContent = t.title;

    box.innerHTML = `
      <div class="emergency-message-lines">
        ${lines.map(line => `<p>${String(line)}</p>`).join("")}
      </div>
      <div class="emergency-actions-visible">
        <button type="button" onclick="emergencyCall119()">${t.call}</button>
        <button type="button" onclick="closeEmergencyPopup()">${t.cancel}</button>
      </div>
    `;

    const fixedButtons = popup.querySelector(":scope .popup-content > .popup-buttons");
    if (fixedButtons) fixedButtons.style.display = "none";
    popup.style.display = "flex";
    popup.classList.remove("hidden");
  };

  const topicI18n = {
    emergency: {
      zh: ["緊急狀況", "胸痛、中風、呼吸喘等警訊"],
      en: ["Emergency Signs", "Chest pain, stroke signs, breathing difficulty"],
      ja: ["緊急サイン", "胸痛・脳卒中サイン・息苦しさ"]
    },
    injury: {
      zh: ["受傷怎麼辦", "傷口、燙傷、骨折、跌倒"],
      en: ["Injury Care", "Wounds, burns, fractures, falls"],
      ja: ["けがの対応", "傷・やけど・骨折・転倒"]
    },
    chronic: {
      zh: ["慢性病照顧", "血壓、血糖、心腎與用藥"],
      en: ["Chronic Disease Care", "Blood pressure, glucose, heart, kidney, medication"],
      ja: ["慢性疾患ケア", "血圧・血糖・心臓・腎臓・薬"]
    },
    food: {
      zh: ["吃喝與腸胃", "飲食、水分、胃腸不適"],
      en: ["Food & Digestion", "Diet, hydration, stomach discomfort"],
      ja: ["食事と胃腸", "食事・水分・胃腸の不調"]
    },
    cold: {
      zh: ["感冒呼吸", "感冒、咳嗽、鼻過敏"],
      en: ["Cold & Breathing", "Colds, cough, nasal allergy"],
      ja: ["風邪と呼吸", "風邪・咳・鼻アレルギー"]
    },
    home: {
      zh: ["居家安全", "防跌、清潔、感染預防"],
      en: ["Home Safety", "Fall prevention, hygiene, infection prevention"],
      ja: ["在宅安全", "転倒予防・清潔・感染予防"]
    },
    elder: {
      zh: ["長輩照顧", "長者、臥床、吞嚥照護"],
      en: ["Older Adult Care", "Elderly, bedridden, swallowing care"],
      ja: ["高齢者ケア", "高齢者・寝たきり・嚥下ケア"]
    },
    mind: {
      zh: ["睡眠與心情", "睡眠、壓力、焦慮憂鬱"],
      en: ["Sleep & Mood", "Sleep, stress, anxiety, depression"],
      ja: ["睡眠と気分", "睡眠・ストレス・不安・うつ"]
    }
  };

  const subTopicI18n = {
    "何時打119": { en: "When to Call 119", ja: "119番に電話する時" },
    "胸痛警訊": { en: "Chest Pain Warning Signs", ja: "胸痛の警告サイン" },
    "中風警訊": { en: "Stroke Warning Signs", ja: "脳卒中の警告サイン" },
    "呼吸喘": { en: "Shortness of Breath", ja: "息苦しさ" },
    "頭痛警訊": { en: "Headache Warning Signs", ja: "頭痛の警告サイン" },
    "頭暈處理": { en: "Dizziness Care", ja: "めまいの対応" },
    "發燒處理": { en: "Fever Care", ja: "発熱の対応" },
    "中暑處理": { en: "Heatstroke Care", ja: "熱中症の対応" },
    "低體溫": { en: "Low Body Temperature", ja: "低体温" },
    "傷口照護": { en: "Wound Care", ja: "創傷ケア" },
    "燙傷處理": { en: "Burn Care", ja: "やけどの対応" },
    "骨折處理": { en: "Fracture Care", ja: "骨折の対応" },
    "跌倒處理": { en: "Fall Care", ja: "転倒時の対応" },
    "膝蓋疼痛": { en: "Knee Pain", ja: "膝の痛み" },
    "足部照護": { en: "Foot Care", ja: "足のケア" },
    "背痛照護": { en: "Back Pain Care", ja: "腰背部痛ケア" },
    "高血壓照護": { en: "Hypertension Care", ja: "高血圧ケア" },
    "量血壓方法": { en: "How to Measure Blood Pressure", ja: "血圧の測り方" },
    "血糖管理": { en: "Blood Glucose Management", ja: "血糖管理" },
    "膽固醇": { en: "Cholesterol", ja: "コレステロール" },
    "心臟保健": { en: "Heart Health", ja: "心臓の健康" },
    "腎臟保健": { en: "Kidney Health", ja: "腎臓の健康" },
    "水腫照護": { en: "Edema Care", ja: "むくみのケア" },
    "尿路感染": { en: "Urinary Tract Infection", ja: "尿路感染" },
    "用藥安全": { en: "Medication Safety", ja: "服薬安全" },
    "低鹽飲食": { en: "Low-Salt Diet", ja: "減塩食" },
    "均衡飲食": { en: "Balanced Diet", ja: "バランスのよい食事" },
    "喝水建議": { en: "Hydration Tips", ja: "水分摂取の助言" },
    "體重控制": { en: "Weight Control", ja: "体重管理" },
    "胃痛照護": { en: "Stomach Pain Care", ja: "胃痛ケア" },
    "腹瀉處理": { en: "Diarrhea Care", ja: "下痢の対応" },
    "嘔吐處理": { en: "Vomiting Care", ja: "嘔吐の対応" },
    "便秘照護": { en: "Constipation Care", ja: "便秘ケア" },
    "感冒照護": { en: "Cold Care", ja: "風邪のケア" },
    "咳嗽照護": { en: "Cough Care", ja: "咳のケア" },
    "鼻過敏": { en: "Nasal Allergy", ja: "鼻アレルギー" },
    "手部衛生": { en: "Hand Hygiene", ja: "手指衛生" },
    "感染預防": { en: "Infection Prevention", ja: "感染予防" },
    "浴室防跌": { en: "Bathroom Fall Prevention", ja: "浴室での転倒予防" },
    "居家安全": { en: "Home Safety", ja: "在宅安全" },
    "口腔清潔": { en: "Oral Hygiene", ja: "口腔清潔" },
    "長者照護": { en: "Older Adult Care", ja: "高齢者ケア" },
    "視力照護": { en: "Vision Care", ja: "視力ケア" },
    "聽力照護": { en: "Hearing Care", ja: "聴力ケア" },
    "臥床照護": { en: "Bedridden Care", ja: "寝たきりケア" },
    "壓瘡預防": { en: "Pressure Injury Prevention", ja: "褥瘡予防" },
    "吞嚥照護": { en: "Swallowing Care", ja: "嚥下ケア" },
    "睡眠照護": { en: "Sleep Care", ja: "睡眠ケア" },
    "焦慮情緒": { en: "Anxiety", ja: "不安" },
    "憂鬱警訊": { en: "Depression Warning Signs", ja: "うつのサイン" },
    "壓力調適": { en: "Stress Management", ja: "ストレス対処" },
    "運動建議": { en: "Exercise Advice", ja: "運動の助言" }
  };

  const articleI18n = {
    "浴室防跌": {
      zh: {
        title: "浴室防跌",
        principle: "浴室濕滑、空間小、起身轉身頻繁，是居家跌倒高風險地點。防跌重點是減少滑倒、增加支撐與改善照明。",
        care: "地板保持乾燥，使用止滑墊。馬桶旁與淋浴區加裝穩固扶手。長者可使用洗澡椅，避免久站。洗澡水溫不要太高，避免頭暈。夜間動線加小夜燈，拖鞋要防滑合腳。",
        warning: "曾反覆跌倒、洗澡時頭暈胸悶、跌倒後頭部撞擊或無法站立，應就醫評估。"
      },
      en: {
        title: "Bathroom Fall Prevention",
        principle: "Bathrooms are high-risk areas for falls because floors are often wet, the space is small, and people frequently stand up, turn around, or change posture. Fall prevention focuses on reducing slips, increasing support, and improving lighting.",
        care: "Keep the floor dry and use non-slip mats. Install stable grab bars near the toilet and shower area. Older adults may use a shower chair to avoid standing for too long. Do not use overly hot water, as it may cause dizziness. Use night lights along walking paths, and wear non-slip slippers that fit well.",
        warning: "Seek medical evaluation if falls happen repeatedly, if dizziness or chest tightness occurs during bathing, or if there is a head injury or inability to stand after a fall."
      },
      ja: {
        title: "浴室での転倒予防",
        principle: "浴室は床が濡れやすく、空間が狭く、立ち上がりや方向転換が多いため、家庭内でも転倒リスクが高い場所です。転倒予防では、滑りにくくすること、支えを増やすこと、照明を改善することが大切です。",
        care: "床を乾いた状態に保ち、滑り止めマットを使用しましょう。トイレの横や浴室内に安定した手すりを設置します。高齢者はシャワーチェアを使用し、長時間立ち続けないようにしましょう。お湯の温度を高くしすぎるとめまいを起こすことがあるため注意が必要です。夜間の動線には足元灯を置き、滑りにくく足に合ったスリッパを使用しましょう。",
        warning: "転倒を繰り返す場合、入浴中にめまいや胸の違和感がある場合、転倒後に頭を打った場合、または立ち上がれない場合は、医療機関で評価を受けましょう。"
      }
    },
    default: {
      zh: {
        principle: "這個主題可提供基礎衛教說明，協助你先理解可能原因，再依照狀況採取合適處理。",
        care: "可以先觀察症狀出現的時間、嚴重程度與是否持續惡化，並保持休息、補充水分，避免刺激或加重症狀的因素。若症狀持續、反覆發生或已經影響日常生活，建議安排就醫評估。",
        warning: "若出現意識不清、呼吸困難、胸痛、大量出血或症狀快速惡化，請立即撥打119或就醫。"
      },
      en: {
        principle: "This topic provides basic health education to help you understand possible causes and choose suitable care steps.",
        care: "Observe when symptoms started, how severe they are, and whether they are getting worse. Rest, drink water as appropriate, and avoid factors that may worsen discomfort. If symptoms persist, recur, or affect daily life, consider medical evaluation.",
        warning: "Call 119 or seek urgent care immediately if there is confusion, breathing difficulty, chest pain, heavy bleeding, or rapidly worsening symptoms."
      },
      ja: {
        principle: "このテーマでは、考えられる原因を理解し、状況に応じた対応を選ぶための基本的な健康教育を提供します。",
        care: "症状がいつ始まったか、どの程度か、悪化しているかを観察しましょう。休息し、必要に応じて水分をとり、症状を悪化させる要因を避けます。症状が続く、繰り返す、または日常生活に影響する場合は受診を検討してください。",
        warning: "意識障害、呼吸困難、胸痛、大量出血、急速な悪化がある場合は、すぐに119番または医療機関を受診してください。"
      }
    }
  };

  function getTopicText(group) {
    const lang = langNow();
    const arr = topicI18n[group.key]?.[lang] || topicI18n[group.key]?.zh;
    return { title: arr?.[0] || group.title, subtitle: arr?.[1] || group.subtitle };
  }

  function getSubTopicText(title) {
    const lang = langNow();
    if (lang === "zh") return title;
    return subTopicI18n[title]?.[lang] || title;
  }

  function getArticle(title) {
    const lang = langNow();
    const key = articleI18n[title] ? title : "default";
    const baseTitle = getSubTopicText(title);
    const data = articleI18n[key]?.[lang] || articleI18n[key]?.zh || articleI18n.default.zh;
    return { title: data.title || baseTitle, principle: data.principle, care: data.care, warning: data.warning };
  }

  window.renderHotQuestions = function renderHotQuestionsI18n() {
    const container = document.getElementById("hotQuestionScroll");
    if (!container || typeof healthTopicGroups === "undefined") return;
    container.innerHTML = "";
    healthTopicGroups.forEach(group => {
      const text = getTopicText(group);
      const button = document.createElement("button");
      button.className = "hot-question-btn main-topic-btn";
      button.dataset.topic = group.key;
      button.innerHTML = `<span class="main-topic-title">${text.title}</span><small>${text.subtitle}</small>`;
      button.addEventListener("click", () => window.selectHealthTopic(group.key));
      container.appendChild(button);
    });
  };

  window.selectHealthTopic = function selectHealthTopicI18n(topicKey) {
    const group = typeof healthTopicGroups !== "undefined" ? healthTopicGroups.find(item => item.key === topicKey) : null;
    if (!group) return;
    const text = getTopicText(group);
    document.querySelectorAll(".main-topic-btn").forEach(btn => btn.classList.toggle("active", btn.dataset.topic === topicKey));
    if (typeof window.addUserChatMessage === "function") window.addUserChatMessage(text.title);
    const lang = langNow();
    const msg = lang === "en"
      ? `You selected “${text.title}”. Please choose a subtopic below and I will provide matching health education content.`
      : lang === "ja"
        ? `「${text.title}」を選択しました。下の小テーマを選ぶと、対応する健康教育内容を表示します。`
        : `您選擇了「${text.title}」。請再點選下方想了解的小主題，我會提供對應的衛教內容。`;
    if (typeof window.addDoctorChatMessage === "function") window.addDoctorChatMessage(msg);
    window.addSubTopicButtons(group);
  };

  window.addSubTopicButtons = function addSubTopicButtonsI18n(group) {
    const chatBox = document.getElementById("aiChatBox");
    if (!chatBox || !group) return;
    const panel = document.createElement("div");
    panel.className = "sub-topic-panel";
    group.items.forEach(title => {
      const btn = document.createElement("button");
      btn.className = "sub-topic-btn";
      btn.innerHTML = `<span>${getSubTopicText(title)}</span>`;
      btn.addEventListener("click", () => {
        if (typeof window.addUserChatMessage === "function") window.addUserChatMessage(getSubTopicText(title));
        window.showHealthEducationCard(title);
      });
      panel.appendChild(btn);
    });
    chatBox.appendChild(panel);
    if (typeof window.scrollAiChatToBottom === "function") window.scrollAiChatToBottom();
  };

  window.showHealthEducationCard = function showHealthEducationCardI18n(title) {
    const chatBox = document.getElementById("aiChatBox");
    if (!chatBox) return;
    const lang = langNow();
    const data = getArticle(title);
    const card = document.createElement("div");
    card.className = "education-card-message detailed-education-card";
    const labels = {
      zh: ["為什麼會這樣？", "你可以怎麼做？", "什麼情況要就醫？"],
      en: ["Why does this happen?", "What can you do?", "When should you seek medical care?"],
      ja: ["なぜ起こるのですか？", "どうすればよいですか？", "どのような時に受診すべきですか？"]
    }[lang] || ["為什麼會這樣？", "你可以怎麼做？", "什麼情況要就醫？"];
    card.innerHTML = `
      <div class="education-card-title"><strong>${data.title}</strong></div>
      <div class="health-section"><h4>${labels[0]}</h4><p>${data.principle}</p></div>
      <div class="health-section"><h4>${labels[1]}</h4><p>${data.care}</p></div>
      <div class="education-card-reminder health-warning"><h4>${labels[2]}</h4><p>${data.warning}</p></div>
    `;
    chatBox.appendChild(card);
    if (typeof window.scrollAiChatToBottom === "function") window.scrollAiChatToBottom();
  };

  const oldSetLanguage = window.setLanguage;
  window.setLanguage = function setLanguageWithDynamicContent(lang) {
    const result = typeof oldSetLanguage === "function" ? oldSetLanguage.apply(this, arguments) : undefined;
    setTimeout(() => {
      try { window.renderHotQuestions(); } catch (e) {}
    }, 80);
    return result;
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", () => setTimeout(() => window.renderHotQuestions?.(), 100));
  } else {
    setTimeout(() => window.renderHotQuestions?.(), 100);
  }
})();

/* =========================================================
   FINAL PATCH 2026-05-29
   修正：AI 健檢報告、衛教闖關、AI 健康助理文章之動態內容翻譯
   原則：顯示文字依語言切換，資料 key 與功能不受翻譯影響
   ========================================================= */
(function () {
  function getLang() {
    const raw = (window.currentLanguage || localStorage.getItem('siteLanguage') || localStorage.getItem('currentLang') || localStorage.getItem('lang') || document.documentElement.lang || 'zh').toString().toLowerCase();
    if (raw.startsWith('en')) return 'en';
    if (raw.startsWith('ja') || raw.includes('日')) return 'ja';
    return 'zh';
  }

  const R = {
    zh: {
      cv: '2. 心血管指標', ai: '3. AI 初步判讀', edu: '4. 衛教建議',
      sbp: '收縮壓', dbp: '舒張壓', bp: '血壓', pulse: '脈搏',
      bpUnit: 'mmHg（收縮壓 / 舒張壓）',
      normal: '目前整體健康狀態穩定，大部分數值位於正常範圍。建議持續保持規律作息、均衡飲食與適度運動。',
      follow: '目前部分健康數值需要持續追蹤，建議注意血壓、脈搏與生活壓力變化，並調整生活習慣。',
      risk: '目前健康風險較高，部分數值已明顯偏離正常範圍，建議儘早休息並尋求專業醫療協助。',
      noAdvice: '目前數值大致穩定，建議維持均衡飲食、規律運動與定期追蹤。',
      advBpHigh1: '⚠ 血壓偏高，建議固定時間量測並減少高鹽、高油食物。',
      advBpHigh2: '⚠ 建議避免熬夜、情緒壓力與過量咖啡因。',
      advBpHigh3: '⚠ 若持續偏高，建議至醫療院所進一步檢查。',
      advBpLow1: '⚠ 血壓偏低，可能出現頭暈、無力或疲倦。',
      advBpLow2: '⚠ 建議先休息並補充水分，避免突然站起。',
      advBpLow3: '⚠ 若持續不舒服或暈眩，建議盡快就醫。',
      advBpOk: '✅ 血壓目前位於正常範圍，請持續維持良好生活習慣。',
      advBmiLow: '⚠ BMI 偏低，建議注意營養攝取。',
      advBmiHigh: '⚠ BMI 偏高，建議增加活動量並控制飲食。',
      advWaist: '⚠ 腰圍偏高，需注意腹部肥胖與慢性病風險。',
      advPulse: '⚠ 脈搏異常，建議休息後重新測量，必要時就醫。'
    },
    en: {
      cv: '2. Cardiovascular Indicators', ai: '3. AI Preliminary Interpretation', edu: '4. Health Education Advice',
      sbp: 'Systolic Pressure', dbp: 'Diastolic Pressure', bp: 'Blood Pressure', pulse: 'Pulse',
      bpUnit: 'mmHg (Systolic / Diastolic)',
      normal: 'Your overall health status is stable, and most values are within the normal range. Keep a regular routine, balanced diet, and moderate exercise.',
      follow: 'Some health values need continued follow-up. Please monitor blood pressure, pulse, lifestyle stress, and adjust daily habits.',
      risk: 'Your health risk is currently higher. Some values are clearly outside the normal range. Please rest and seek professional medical help as soon as possible.',
      noAdvice: 'Your values are generally stable. Maintain a balanced diet, regular exercise, and routine follow-up.',
      advBpHigh1: '⚠ Blood pressure is high. Measure it regularly and reduce salty or greasy foods.',
      advBpHigh2: '⚠ Avoid staying up late, emotional stress, and excessive caffeine.',
      advBpHigh3: '⚠ If it remains high, visit a medical facility for further evaluation.',
      advBpLow1: '⚠ Blood pressure is low. Dizziness, weakness, or fatigue may occur.',
      advBpLow2: '⚠ Rest and drink water first. Avoid standing up suddenly.',
      advBpLow3: '⚠ If discomfort or dizziness continues, seek medical care promptly.',
      advBpOk: '✅ Blood pressure is currently within the normal range. Keep healthy daily habits.',
      advBmiLow: '⚠ BMI is low. Pay attention to nutritional intake.',
      advBmiHigh: '⚠ BMI is high. Increase activity and manage diet.',
      advWaist: '⚠ Waist circumference is high. Watch for abdominal obesity and chronic disease risk.',
      advPulse: '⚠ Pulse is abnormal. Rest and measure again. Seek medical care if needed.'
    },
    ja: {
      cv: '二、心血管指標', ai: '三、AI 初期判定', edu: '四、健康教育アドバイス',
      sbp: '収縮期血圧', dbp: '拡張期血圧', bp: '血圧', pulse: '脈拍',
      bpUnit: 'mmHg（収縮期 / 拡張期）',
      normal: '現在の全体的な健康状態は安定しており、多くの数値は正常範囲内です。規則正しい生活、バランスのよい食事、適度な運動を続けましょう。',
      follow: '一部の健康数値は継続的な観察が必要です。血圧、脈拍、生活上のストレス変化に注意し、生活習慣を調整しましょう。',
      risk: '現在、健康リスクが高めです。一部の数値が正常範囲から大きく外れています。早めに休息し、専門の医療者に相談してください。',
      noAdvice: '現在の数値はおおむね安定しています。バランスのよい食事、規則的な運動、定期的な確認を続けましょう。',
      advBpHigh1: '⚠ 血圧が高めです。決まった時間に測定し、塩分や脂っこい食事を控えましょう。',
      advBpHigh2: '⚠ 夜更かし、精神的ストレス、過度なカフェインを避けましょう。',
      advBpHigh3: '⚠ 高い状態が続く場合は、医療機関で詳しい検査を受けましょう。',
      advBpLow1: '⚠ 血圧が低めです。めまい、脱力感、疲労感が出ることがあります。',
      advBpLow2: '⚠ まず休息し、水分を補給してください。急に立ち上がらないようにしましょう。',
      advBpLow3: '⚠ 不快感やめまいが続く場合は、早めに受診してください。',
      advBpOk: '✅ 血圧は現在正常範囲です。良い生活習慣を続けましょう。',
      advBmiLow: '⚠ BMIが低めです。栄養摂取に注意しましょう。',
      advBmiHigh: '⚠ BMIが高めです。活動量を増やし、食事を調整しましょう。',
      advWaist: '⚠ ウエストが高めです。腹部肥満と慢性疾患リスクに注意しましょう。',
      advPulse: '⚠ 脈拍に異常があります。休んでから再測定し、必要時は受診してください。'
    }
  };

  function setTextByCandidates(candidates, value) {
    candidates.forEach(sel => document.querySelectorAll(sel).forEach(el => { if (el) el.textContent = value; }));
  }

  const adviceZhToKey = {
    '⚠ 血壓偏高，建議固定時間量測並減少高鹽、高油食物。': 'advBpHigh1',
    '⚠ 建議避免熬夜、情緒壓力與過量咖啡因。': 'advBpHigh2',
    '⚠ 若持續偏高，建議至醫療院所進一步檢查。': 'advBpHigh3',
    '⚠ 血壓偏低，可能出現頭暈、無力或疲倦。': 'advBpLow1',
    '⚠ 建議先休息並補充水分，避免突然站起。': 'advBpLow2',
    '⚠ 若持續不舒服或暈眩，建議盡快就醫。': 'advBpLow3',
    '✅ 血壓目前位於正常範圍，請持續維持良好生活習慣。': 'advBpOk',
    '⚠ BMI 偏低，建議注意營養攝取。': 'advBmiLow',
    '⚠ BMI 偏高，建議增加活動量並控制飲食。': 'advBmiHigh',
    '⚠ 腰圍偏高，需注意腹部肥胖與慢性病風險。': 'advWaist',
    '⚠ 脈搏異常，建議休息後重新測量，必要時就醫。': 'advPulse',
    '目前數值大致穩定，建議維持均衡飲食、規律運動與定期追蹤。': 'noAdvice'
  };

  function refreshAIReportLanguage() {
    const lang = getLang();
    const t = R[lang] || R.zh;

    // Common headings in the report page.
    document.querySelectorAll('h2,h3,h4').forEach(el => {
      const s = (el.textContent || '').trim();
      if (/Cardiovascular|心血管|血管指標/.test(s)) el.textContent = t.cv;
      if (/AI Preliminary|AI 初步|AI 初期/.test(s)) el.textContent = t.ai;
      if (/Health Education Advice|衛教建議|健康教育アドバイス/.test(s)) el.textContent = t.edu;
    });

    // Replace report labels if they were written directly in HTML.
    document.querySelectorAll('#report-page, .report-page, .ai-report-page').forEach(root => {
      root.innerHTML = root.innerHTML
        .replace(/收縮壓/g, t.sbp)
        .replace(/舒張壓/g, t.dbp)
        .replace(/血壓/g, t.bp)
        .replace(/脈搏/g, t.pulse)
        .replace(/mmHg（收縮壓 \/ 舒張壓）/g, t.bpUnit)
        .replace(/mmHg \(收縮期 \/ 拡張期\)/g, t.bpUnit);
    });

    // Summary text.
    const summary = document.getElementById('report-summary');
    if (summary) {
      const rawScore = Number((document.getElementById('circle-score') || {}).textContent || 100);
      summary.textContent = rawScore >= 80 ? t.normal : rawScore >= 60 ? t.follow : t.risk;
    }

    // Advice list.
    const advice = document.getElementById('report-advice');
    if (advice) {
      advice.querySelectorAll('li').forEach(li => {
        const key = adviceZhToKey[(li.textContent || '').trim()];
        if (key && t[key]) li.textContent = t[key];
      });
    }
  }

  const oldAnalyze = window.analyze || (typeof analyze === 'function' ? analyze : null);
  window.analyze = function analyzeI18nFinal() {
    const result = typeof oldAnalyze === 'function' ? oldAnalyze.apply(this, arguments) : undefined;
    setTimeout(refreshAIReportLanguage, 30);
    return result;
  };
  try { analyze = window.analyze; } catch(e) {}

  const oldShowCharts = window.showCharts || (typeof showCharts === 'function' ? showCharts : null);
  window.showCharts = function showChartsI18nFinal() {
    const result = typeof oldShowCharts === 'function' ? oldShowCharts.apply(this, arguments) : undefined;
    setTimeout(refreshAIReportLanguage, 80);
    return result;
  };
  try { showCharts = window.showCharts; } catch(e) {}

  const quizMap = {
    en: {
      '【營養代謝】關於「缺鐵性貧血」，下列哪一項最正確？': '[Nutrition & Metabolism] Which statement about iron-deficiency anemia is most accurate?',
      '鐵質是製造紅血球的重要原料，因此飲食可增加含鐵食物，例如紅肉、肝臟、蛋黃、深綠色蔬菜與豆類': 'Iron is an important material for making red blood cells, so iron-rich foods such as red meat, liver, egg yolks, dark green vegetables, and beans can be added to the diet.',
      '完全不用觀察，等症狀自己消失即可': 'No observation is needed; just wait for symptoms to disappear.',
      '優先使用偏方處理，不需要參考衛教原則': 'Use folk remedies first; health education principles are not needed.',
      '只要沒有立即疼痛，就不需要注意後續變化': 'If there is no immediate pain, no follow-up observation is needed.',
      '失去意識但有正常呼吸，等待救護人員期間最重要的觀察是什麼？': 'If a person is unconscious but breathing normally, what is the most important observation while waiting for emergency responders?',
      '持續觀察呼吸與臉色，若呼吸停止立即 CPR': 'Continue observing breathing and skin color; start CPR immediately if breathing stops.',
      '確認他有沒有帶錢': 'Check whether the person has money.',
      '讓患者獨處休息': 'Leave the person alone to rest.',
      '每隔幾分鐘餵水': 'Give water every few minutes.',
      '產後會陰傷口疼痛時，照護者應避免哪一項？': 'For postpartum perineal wound pain, which action should the caregiver avoid?',
      '依醫囑止痛與保持清潔': 'Use pain relief as prescribed and keep the area clean.',
      '觀察紅腫熱痛與分泌物': 'Observe redness, swelling, heat, pain, and discharge.',
      '使用甜甜圈坐墊長時間壓迫傷口': 'Use a donut cushion for long periods, putting pressure on the wound.',
      '排便後由前往後清潔': 'Clean from front to back after bowel movements.',
      '不正確': 'Incorrect',
      '你的選擇：': 'Your choice:',
      '正解：': 'Correct answer:',
      '理由：': 'Reason:',
      '正確，長時間局部壓迫可能影響血液循環與傷口舒適度，坐墊使用應依專業建議。': 'Correct. Prolonged local pressure may affect circulation and wound comfort. Cushion use should follow professional advice.',
      '觀察感染徵象很重要。': 'Observing signs of infection is important.',
      '正確，鐵是血紅素的重要成分，協助氧氣運輸。': 'Correct. Iron is an important component of hemoglobin and helps transport oxygen.'
    },
    ja: {
      '【營養代謝】關於「缺鐵性貧血」，下列哪一項最正確？': '【栄養・代謝】「鉄欠乏性貧血」について、最も正しいものはどれですか？',
      '鐵質是製造紅血球的重要原料，因此飲食可增加含鐵食物，例如紅肉、肝臟、蛋黃、深綠色蔬菜與豆類': '鉄は赤血球を作るための重要な材料です。そのため、赤身肉、レバー、卵黄、濃い緑色の野菜、豆類など鉄を多く含む食品を食事に取り入れましょう。',
      '完全不用觀察，等症狀自己消失即可': '観察せず、症状が自然に消えるのを待つ',
      '優先使用偏方處理，不需要參考衛教原則': '民間療法を優先し、健康教育の原則を参考にしない',
      '只要沒有立即疼痛，就不需要注意後續變化': 'すぐに痛みがなければ、その後の変化を気にしなくてよい',
      '失去意識但有正常呼吸，等待救護人員期間最重要的觀察是什麼？': '意識はないが正常に呼吸している場合、救急隊を待つ間に最も重要な観察はどれですか？',
      '持續觀察呼吸與臉色，若呼吸停止立即 CPR': '呼吸と顔色を継続して観察し、呼吸が止まったら直ちにCPRを行う',
      '確認他有沒有帶錢': 'お金を持っているか確認する',
      '讓患者獨處休息': '一人で休ませる',
      '每隔幾分鐘餵水': '数分ごとに水を飲ませる',
      '產後會陰傷口疼痛時，照護者應避免哪一項？': '産後の会陰部の傷に痛みがある場合、介護者が避けるべきことはどれですか？',
      '依醫囑止痛與保持清潔': '医師の指示に従って痛みを和らげ、清潔を保つ',
      '觀察紅腫熱痛與分泌物': '赤み、腫れ、熱感、痛み、分泌物を観察する',
      '使用甜甜圈坐墊長時間壓迫傷口': 'ドーナツ型クッションで長時間傷口を圧迫する',
      '排便後由前往後清潔': '排便後は前から後ろへ清拭する',
      '不正確': '不正解',
      '你的選擇：': 'あなたの選択：',
      '正解：': '正解：',
      '理由：': '理由：',
      '正確，長時間局部壓迫可能影響血液循環與傷口舒適度，坐墊使用應依專業建議。': '正解です。長時間の局所圧迫は血液循環や傷の快適さに影響する可能性があります。クッションの使用は専門家の助言に従いましょう。',
      '觀察感染徵象很重要。': '感染の兆候を観察することは重要です。',
      '正確，鐵是血紅素的重要成分，協助氧氣運輸。': '正解です。鉄はヘモグロビンの重要な成分で、酸素運搬を助けます。'
    }
  };

  function trQuiz(text) {
    const lang = getLang();
    if (lang === 'zh') return text || '';
    const str = String(text || '');
    return quizMap[lang]?.[str] || str;
  }

  // Patch quiz render/result so visible screenshot questions are translated and no undefined appears.
  window.__translateQuizTextFinal = trQuiz;
  const oldLoadQ = window.loadQuestion || (typeof loadQuestion === 'function' ? loadQuestion : null);
  window.loadQuestion = function loadQuestionI18nFinal() {
    const result = typeof oldLoadQ === 'function' ? oldLoadQ.apply(this, arguments) : undefined;
    setTimeout(() => {
      const qEl = document.getElementById('quiz-question');
      if (qEl) qEl.innerHTML = qEl.innerHTML.replace(/(【營養代謝】關於「缺鐵性貧血」，下列哪一項最正確？|失去意識但有正常呼吸，等待救護人員期間最重要的觀察是什麼？|產後會陰傷口疼痛時，照護者應避免哪一項？)/g, m => trQuiz(m));
      document.querySelectorAll('.quiz-option').forEach(btn => { btn.textContent = trQuiz(btn.textContent.trim()); });
    }, 20);
    return result;
  };
  try { loadQuestion = window.loadQuestion; } catch(e) {}

  const oldCheck = window.checkAnswer || (typeof checkAnswer === 'function' ? checkAnswer : null);
  window.checkAnswer = function checkAnswerI18nFinal(choice) {
    const result = typeof oldCheck === 'function' ? oldCheck.apply(this, arguments) : undefined;
    setTimeout(() => {
      const box = document.getElementById('answer-explanation');
      if (!box || getLang() === 'zh') return;
      let html = box.innerHTML;
      Object.keys(quizMap[getLang()] || {}).forEach(k => { html = html.split(k).join(quizMap[getLang()][k]); });
      box.innerHTML = html;
    }, 25);
    return result;
  };
  try { checkAnswer = window.checkAnswer; } catch(e) {}

  function refreshDynamicContentFinal() {
    refreshAIReportLanguage();
    try { if (document.getElementById('quiz-page') && !document.getElementById('quiz-page').classList.contains('hidden')) window.loadQuestion?.(); } catch(e) {}
    try { window.renderHotQuestions?.(); } catch(e) {}
  }

  const oldSetLangFinal = window.setLanguage;
  window.setLanguage = function setLanguageFinalPatch(lang) {
    const result = typeof oldSetLangFinal === 'function' ? oldSetLangFinal.apply(this, arguments) : undefined;
    setTimeout(refreshDynamicContentFinal, 120);
    return result;
  };

  document.addEventListener('DOMContentLoaded', () => setTimeout(refreshDynamicContentFinal, 200));
})();




/* =========================================================
   TRANSLATION COORDINATOR FIX
   修正重點：
   1. 只保留一個語言狀態來源，避免 currentLang/currentLanguage/siteLanguage 不同步。
   2. 不再用「中文詞片段」硬替換整頁，避免 Health education內容 這種混語。
   3. 以 data-i18n 與「完整句對照」為主；未知文字保留原文，不亂翻。
   ========================================================= */
(function translationCoordinatorFix() {
  const VALID_LANGS = ["zh", "en", "ja"];

  function normalizeLang(lang) {
    const raw = String(lang || "").toLowerCase();
    if (raw.startsWith("en")) return "en";
    if (raw.startsWith("ja") || raw.includes("日")) return "ja";
    return "zh";
  }

  function syncLang(lang) {
    const normalized = normalizeLang(lang);
    window.currentLang = normalized;
    window.currentLanguage = normalized;
    try { currentLanguage = normalized; } catch (e) {}
    localStorage.setItem("currentLang", normalized);
    localStorage.setItem("siteLanguage", normalized);
    localStorage.setItem("lang", normalized);
    document.documentElement.lang = normalized === "zh" ? "zh-TW" : normalized;
    document.body.classList.remove("lang-zh", "lang-en", "lang-ja");
    document.body.classList.add("lang-" + normalized);
    return normalized;
  }

  function buildExactDictionary(targetLang) {
    const dict = Object.create(null);

    function add(zh, en, ja) {
      if (!zh) return;
      const target = targetLang === "en" ? en : targetLang === "ja" ? ja : zh;
      if (!target) return;
      [zh, en, ja].filter(Boolean).forEach(source => {
        dict[String(source).trim()] = target;
      });
    }

    if (typeof i18nText === "object" && i18nText.zh) {
      Object.keys(i18nText.zh).forEach(key => {
        add(i18nText.zh[key], i18nText.en && i18nText.en[key], i18nText.ja && i18nText.ja[key]);
      });
    }

    if (typeof staticI18nText === "object") {
      Object.keys(staticI18nText).forEach(zh => {
        add(zh, staticI18nText[zh] && staticI18nText[zh].en, staticI18nText[zh] && staticI18nText[zh].ja);
      });
    }

    // 動態衛教主題：這些文字不是 data-i18n 產生，需完整句對照。
    [
      ["健康照護互動助手", "Health Care Interactive Assistant", "健康ケア対話アシスタント"],
      ["像和醫生對話一樣，直接點選按鈕取得Health education內容", "Select buttons like talking with a doctor to get health education content", "医師と対話するようにボタンを選択して健康教育内容を確認できます"],
      ["像和醫生對話一樣，直接點選按鈕取得衛教內容", "Select buttons like talking with a doctor to get health education content", "医師と対話するようにボタンを選択して健康教育内容を確認できます"],
      ["熱門衛教主題", "Popular Health Topics", "人気の健康教育テーマ"],
      ["您好！我是您的健康照護助手。", "Hello! I am your health care assistant.", "こんにちは。私はあなたの健康ケアアシスタントです。"],
      ["請先點選上方的大主題，我會在對話框裡提供可選的小主題。", "Please select a main topic above. I will provide subtopics in the chat.", "上の大きなテーマを選択してください。チャット内で小テーマを提示します。"],
      ["請直接點選按鈕互動，無需輸入文字", "Please interact by selecting buttons; no typing is needed.", "文字入力は不要です。ボタンを選択して操作してください。"],
      ["衛教內容僅供參考，如有不適請諮詢專業醫護人員", "Health education content is for reference only. If you feel unwell, please consult a health professional.", "健康教育内容は参考用です。不調がある場合は医療専門職に相談してください。"],
      ["Cold & Breathing", "Cold & Breathing", "風邪と呼吸"],
      ["Emergency Signs", "Emergency Signs", "緊急サイン"],
      ["Injury Care", "Injury Care", "けがの対応"],
      ["Chronic Disease Care", "Chronic Disease Care", "慢性疾患ケア"],
      ["Food & Digestion", "Food & Digestion", "食事と胃腸"],
      ["Home Safety", "Home Safety", "在宅安全"],
      ["Older Adult Care", "Older Adult Care", "高齢者ケア"],
      ["Sleep & Mood", "Sleep & Mood", "睡眠と気分"],
      ["感冒呼吸", "Cold & Breathing", "風邪と呼吸"],
      ["緊急狀況", "Emergency Signs", "緊急サイン"],
      ["受傷怎麼辦", "Injury Care", "けがの対応"],
      ["慢性病照顧", "Chronic Disease Care", "慢性疾患ケア"],
      ["吃喝與腸胃", "Food & Digestion", "食事と胃腸"],
      ["居家安全", "Home Safety", "在宅安全"],
      ["長輩照顧", "Older Adult Care", "高齢者ケア"],
      ["睡眠與心情", "Sleep & Mood", "睡眠と気分"],
      ["Back to Home", "Back to Home", "ホームに戻る"],
      ["回首頁", "Back to Home", "ホームに戻る"],
      ["返回首頁", "Back to Home", "ホームに戻る"]
    ].forEach(row => add(row[0], row[1], row[2]));

    return dict;
  }

  function isTranslatableLeaf(el) {
    if (!el || !el.textContent) return false;
    const tag = (el.tagName || "").toLowerCase();
    if (["script", "style", "input", "textarea", "select", "option", "canvas", "svg", "img"].includes(tag)) return false;
    if (el.closest(".language-menu, #language-menu, #lang-menu, .lang-menu")) return false;
    if ((el.children || []).length > 0) return false;
    return true;
  }

  function translateTextExact(text, lang) {
    if (lang === "zh") return text;
    const dict = buildExactDictionary(lang);
    const raw = String(text || "");
    const trimmed = raw.trim();
    if (!trimmed) return raw;
    const translated = dict[trimmed];
    if (!translated) return raw;
    return raw.replace(trimmed, translated);
  }

  function translatePage(lang) {
    lang = syncLang(lang);

    document.querySelectorAll("[data-i18n]").forEach(el => {
      const key = el.dataset.i18n;
      const translated = i18nText && i18nText[lang] && i18nText[lang][key];
      if (translated) el.textContent = translated;
    });

    document.querySelectorAll("[data-placeholder-i18n]").forEach(el => {
      const key = el.dataset.placeholderI18n;
      const translated = i18nText && i18nText[lang] && i18nText[lang][key];
      if (translated) el.placeholder = translated;
    });

    document.querySelectorAll("h1,h2,h3,h4,h5,h6,p,span,small,button,label,li,div").forEach(el => {
      if (!isTranslatableLeaf(el)) return;

      if (!el.dataset.originalTextZh) {
        const txt = el.textContent.trim();
        if (txt) el.dataset.originalTextZh = txt;
      }

      if (lang === "zh") {
        if (el.dataset.originalTextZh) el.textContent = el.dataset.originalTextZh;
        return;
      }

      const base = el.dataset.originalTextZh || el.textContent;
      const translated = translateTextExact(base, lang);
      if (translated !== el.textContent) el.textContent = translated;
    });

    document.querySelectorAll("input[placeholder], textarea[placeholder]").forEach(el => {
      if (!el.dataset.originalPlaceholderZh) el.dataset.originalPlaceholderZh = el.getAttribute("placeholder") || "";
      const base = el.dataset.originalPlaceholderZh;
      el.setAttribute("placeholder", lang === "zh" ? base : translateTextExact(base, lang));
    });

    try { updateRecordStatusText && updateRecordStatusText(); } catch (e) {}
    try { updateHomeScoreLanguage && updateHomeScoreLanguage(); } catch (e) {}
    try { renderHotQuestions && renderHotQuestions(); } catch (e) {}
    try { refreshAIReportLanguage && refreshAIReportLanguage(); } catch (e) {}
  }

  const previousSetLanguage = window.setLanguage;
  window.setLanguage = function fixedSetLanguage(lang) {
    const normalized = syncLang(lang);

    // 先呼叫原本邏輯，讓頁面資料與圖表照常更新。
    try {
      if (typeof previousSetLanguage === "function") previousSetLanguage(normalized);
    } catch (e) {
      console.warn("previous setLanguage failed:", e);
    }

    // 再用單一規則收斂文字，避免前面多個 patch 互相覆蓋。
    setTimeout(() => translatePage(normalized), 0);
    setTimeout(() => translatePage(normalized), 120);
  };

  window.toggleLangMenu = window.toggleLanguageMenu = function fixedToggleLangMenu(event) {
    if (event) {
      event.preventDefault();
      event.stopPropagation();
    }
    const menu = document.getElementById("language-menu") || document.getElementById("lang-menu");
    if (!menu) return;
    menu.classList.toggle("hidden");
  };

  document.addEventListener("DOMContentLoaded", function () {
    const initial = syncLang(localStorage.getItem("siteLanguage") || localStorage.getItem("currentLang") || "zh");
    translatePage(initial);

    const menu = document.getElementById("language-menu") || document.getElementById("lang-menu");
    if (menu) {
      menu.querySelectorAll("[data-lang]").forEach(btn => {
        btn.onclick = function (event) {
          event.preventDefault();
          event.stopPropagation();
          window.setLanguage(this.dataset.lang);
          menu.classList.add("hidden");
        };
      });
    }

    let timer = null;
    const observer = new MutationObserver(function () {
      clearTimeout(timer);
      timer = setTimeout(function () {
        translatePage(normalizeLang(window.currentLanguage || localStorage.getItem("siteLanguage") || "zh"));
      }, 80);
    });
    try { observer.observe(document.body, { childList: true, subtree: true }); } catch (e) {}
  });
})();


/* ===== 危險健康數值彈窗按鈕保險修正：不要消失、可以點擊 ===== */
(function () {
  function ensureEmergencyButtons() {
    const popup = document.getElementById("emergency-popup") || document.querySelector(".emergency-popup, .danger-popup, .warning-popup");
    if (!popup) return;

    const lang = (window.currentLang || localStorage.getItem("currentLang") || localStorage.getItem("lang") || "zh").toString();
    const isEn = lang.startsWith("en");
    const isJa = lang.startsWith("ja");

    const callText = isEn ? "🚑 Call 119" : isJa ? "🚑 119に電話" : "🚑 撥打 119";
    const cancelText = isEn ? "Cancel" : isJa ? "キャンセル" : "取消";

    let actions = popup.querySelector(".emergency-actions-fixed");
    if (!actions) {
      actions = document.createElement("div");
      actions.className = "emergency-actions-fixed";
      actions.innerHTML = `
        <button type="button" class="emergency-call-btn-fixed">${callText}</button>
        <button type="button" class="emergency-cancel-btn-fixed">${cancelText}</button>
      `;
      const content = popup.querySelector(".popup-content, .modal-content, .warning-content") || popup;
      content.appendChild(actions);
    } else {
      const callBtn = actions.querySelector(".emergency-call-btn-fixed");
      const cancelBtn = actions.querySelector(".emergency-cancel-btn-fixed");
      if (callBtn) callBtn.textContent = callText;
      if (cancelBtn) cancelBtn.textContent = cancelText;
    }

    const callBtn = actions.querySelector(".emergency-call-btn-fixed");
    const cancelBtn = actions.querySelector(".emergency-cancel-btn-fixed");

    if (callBtn) callBtn.onclick = function () {
      try { window.location.href = "tel:119"; } catch(e) {}
    };

    if (cancelBtn) cancelBtn.onclick = function () {
      popup.classList.add("hidden");
      popup.style.display = "none";
    };
  }

  const oldShowEmergency = window.showEmergencyPopup || (typeof showEmergencyPopup === "function" ? showEmergencyPopup : null);
  if (typeof oldShowEmergency === "function") {
    window.showEmergencyPopup = function showEmergencyPopupWithButtons() {
      const result = oldShowEmergency.apply(this, arguments);
      setTimeout(ensureEmergencyButtons, 30);
      return result;
    };
    try { showEmergencyPopup = window.showEmergencyPopup; } catch(e) {}
  }

  window.closeEmergencyPopup = function closeEmergencyPopupFixed() {
    const popup = document.getElementById("emergency-popup") || document.querySelector(".emergency-popup, .danger-popup, .warning-popup");
    if (popup) {
      popup.classList.add("hidden");
      popup.style.display = "none";
    }
  };

  document.addEventListener("DOMContentLoaded", () => setTimeout(ensureEmergencyButtons, 300));
  const mo = new MutationObserver(() => setTimeout(ensureEmergencyButtons, 40));
  try { mo.observe(document.body, { childList: true, subtree: true }); } catch(e) {}
})();


/* =========================================================
   FINAL I18N CONSOLIDATION PATCH
   修正重點：
   - 移除片段替換造成的中英日混語。
   - 統一 currentLanguage / currentLang / localStorage。
   - 以「完整句對照」翻譯靜態與動態文字。
   - 衛教助理、衛教閱讀頁與知識闖關會依語言重新渲染。
   ========================================================= */
(function finalI18nConsolidationPatch() {
  const EXTRA_I18N = {
  "輸入健康數據": {
    "en": "Enter Health Data",
    "ja": "健康データを入力"
  },
  "今日尚未紀錄": {
    "en": "No record today",
    "ja": "本日はまだ記録されていません"
  },
  "今日已完成紀錄": {
    "en": "Recorded today",
    "ja": "本日の記録は完了しました"
  },
  "查看 BMI": {
    "en": "View BMI",
    "ja": "BMIを見る"
  },
  "連續紀錄：": {
    "en": "Streak: ",
    "ja": "連続記録："
  },
  "天": {
    "en": "days",
    "ja": "日"
  },
  "身高（cm）": {
    "en": "Height (cm)",
    "ja": "身長（cm）"
  },
  "體重（kg）": {
    "en": "Weight (kg)",
    "ja": "体重（kg）"
  },
  "收縮壓": {
    "en": "Systolic Pressure",
    "ja": "収縮期血圧"
  },
  "舒張壓": {
    "en": "Diastolic Pressure",
    "ja": "拡張期血圧"
  },
  "脈搏（bpm）": {
    "en": "Pulse (bpm)",
    "ja": "脈拍（bpm）"
  },
  "胸圍（cm）": {
    "en": "Chest Circumference (cm)",
    "ja": "胸囲（cm）"
  },
  "腰圍（cm）": {
    "en": "Waist Circumference (cm)",
    "ja": "ウエスト（cm）"
  },
  "臀圍（cm）": {
    "en": "Hip Circumference (cm)",
    "ja": "ヒップ（cm）"
  },
  "今天的心情": {
    "en": "Today's Mood",
    "ja": "今日の気分"
  },
  "選擇要進行的評估量表": {
    "en": "Select an assessment scale",
    "ja": "実施する評価尺度を選択"
  },
  "📚 查看歷史評估紀錄": {
    "en": "📚 View Assessment History",
    "ja": "📚 評価履歴を見る"
  },
  "身心壓力": {
    "en": "Mind-Body Stress",
    "ja": "心身ストレス"
  },
  "憂鬱情緒": {
    "en": "Depressive Mood",
    "ja": "抑うつ気分"
  },
  "焦慮程度": {
    "en": "Anxiety Level",
    "ja": "不安レベル"
  },
  "壓力感受": {
    "en": "Perceived Stress",
    "ja": "ストレス感"
  },
  "幸福感": {
    "en": "Well-being",
    "ja": "幸福感"
  },
  "失眠狀況": {
    "en": "Insomnia",
    "ja": "不眠状況"
  },
  "📚 歷史評估紀錄": {
    "en": "📚 Assessment History",
    "ja": "📚 評価履歴"
  },
  "查看之前完成的心理量表結果": {
    "en": "View previous psychological scale results",
    "ja": "過去に完了した心理尺度の結果を見る"
  },
  "← 返回量表選擇": {
    "en": "← Back to Scale Selection",
    "ja": "← 尺度選択に戻る"
  },
  "清除紀錄": {
    "en": "Clear Records",
    "ja": "記録を削除"
  },
  "第 1 / 5 題": {
    "en": "Question 1 / 5",
    "ja": "第1 / 5問"
  },
  "題目文字": {
    "en": "Question text",
    "ja": "質問文"
  },
  "上一題": {
    "en": "Previous",
    "ja": "前へ"
  },
  "下一題": {
    "en": "Next",
    "ja": "次へ"
  },
  "量表結果": {
    "en": "Scale Result",
    "ja": "尺度結果"
  },
  "結果等級": {
    "en": "Result Level",
    "ja": "結果レベル"
  },
  "你的分數與量表區間將顯示在這裡": {
    "en": "Your score and scale range will appear here",
    "ja": "スコアと尺度区間がここに表示されます"
  },
  "建議內容": {
    "en": "Recommendations",
    "ja": "アドバイス内容"
  },
  "↻ 重新作答": {
    "en": "↻ Try Again",
    "ja": "↻ もう一度回答"
  },
  "💾 儲存評估結果": {
    "en": "💾 Save Assessment Result",
    "ja": "💾 評価結果を保存"
  },
  "量表用途": {
    "en": "Purpose",
    "ja": "尺度の目的"
  },
  "這個量表的意義": {
    "en": "Meaning of this scale",
    "ja": "この尺度の意味"
  },
  "測驗後會得到什麼？": {
    "en": "What will you get after the test?",
    "ja": "テスト後にわかること"
  },
  "測驗方式": {
    "en": "How to answer",
    "ja": "回答方法"
  },
  "💗 此結果僅供自我參考，不能取代專業醫療或心理診斷。": {
    "en": "💗 This result is for self-reference only and cannot replace professional medical or psychological diagnosis.",
    "ja": "💗 この結果は自己参考用であり、専門的な医療・心理診断の代わりにはなりません。"
  },
  "先不要": {
    "en": "Not now",
    "ja": "今はしない"
  },
  "開始測驗": {
    "en": "Start Test",
    "ja": "テスト開始"
  },
  "💾 儲存今日紀錄": {
    "en": "💾 Save Today's Record",
    "ja": "💾 今日の記録を保存"
  },
  "⬅ 回首頁": {
    "en": "⬅ Back to Home",
    "ja": "⬅ ホームへ戻る"
  },
  "回首頁": {
    "en": "Back to Home",
    "ja": "ホームへ戻る"
  },
  "AI 健康分析": {
    "en": "AI Health Analysis",
    "ja": "AI健康分析"
  },
  "尚未計算": {
    "en": "Not calculated yet",
    "ja": "まだ計算されていません"
  },
  "請先完成每日紀錄，再開始分析。": {
    "en": "Please complete your daily record before starting analysis.",
    "ja": "分析を始める前に毎日の記録を完了してください。"
  },
  "📊 開始分析": {
    "en": "📊 Start Analysis",
    "ja": "📊 分析開始"
  },
  "📋 查看健檢報告": {
    "en": "📋 View Health Report",
    "ja": "📋 健康レポートを見る"
  },
  "📋 AI 健檢報告": {
    "en": "📋 AI Health Report",
    "ja": "📋 AI健康レポート"
  },
  "依據今日輸入資料產生初步健康摘要": {
    "en": "Generate a preliminary health summary based on today's data",
    "ja": "本日入力したデータに基づいて初期健康サマリーを作成"
  },
  "一、基本身體數據": {
    "en": "1. Basic Body Data",
    "ja": "一、基本身体データ"
  },
  "身高：": {
    "en": "Height: ",
    "ja": "身長："
  },
  "體重：": {
    "en": "Weight: ",
    "ja": "体重："
  },
  "腰圍：": {
    "en": "Waist: ",
    "ja": "ウエスト："
  },
  "臀圍：": {
    "en": "Hip: ",
    "ja": "ヒップ："
  },
  "胸圍：": {
    "en": "Chest: ",
    "ja": "胸囲："
  },
  "收縮壓：": {
    "en": "Systolic Pressure: ",
    "ja": "収縮期血圧："
  },
  "舒張壓：": {
    "en": "Diastolic Pressure: ",
    "ja": "拡張期血圧："
  },
  "血壓：": {
    "en": "Blood Pressure: ",
    "ja": "血圧："
  },
  "脈搏：": {
    "en": "Pulse: ",
    "ja": "脈拍："
  },
  "二、心血管指標": {
    "en": "2. Cardiovascular Indicators",
    "ja": "二、心血管指標"
  },
  "三、AI 初步判讀": {
    "en": "3. AI Preliminary Interpretation",
    "ja": "三、AI初期判定"
  },
  "四、衛教建議": {
    "en": "4. Health Education Advice",
    "ja": "四、健康教育アドバイス"
  },
  "尚未產生報告": {
    "en": "No report generated yet",
    "ja": "レポートはまだ作成されていません"
  },
  "請先完成每日紀錄。": {
    "en": "Please complete the daily record first.",
    "ja": "先に毎日の記録を完了してください。"
  },
  "小提醒：": {
    "en": "Reminder: ",
    "ja": "リマインダー："
  },
  "定期量測與記錄，有助於掌握身體變化，維持健康生活。": {
    "en": "Regular measurement and records help you track body changes and maintain a healthy lifestyle.",
    "ja": "定期的な測定と記録は身体の変化を把握し、健康的な生活を維持するのに役立ちます。"
  },
  "健康照護互動助手": {
    "en": "Interactive Health Care Assistant",
    "ja": "健康ケア対話アシスタント"
  },
  "像和醫生對話一樣，直接點選按鈕取得衛教內容": {
    "en": "Tap buttons to get health education content, like talking with a doctor",
    "ja": "医師と話すように、ボタンを押して健康教育内容を確認できます"
  },
  "● 線上": {
    "en": "● Online",
    "ja": "● オンライン"
  },
  "熱門衛教主題": {
    "en": "Popular Health Topics",
    "ja": "人気の健康教育テーマ"
  },
  "您好！我是您的健康照護助手。": {
    "en": "Hello! I am your health care assistant.",
    "ja": "こんにちは！私はあなたの健康ケアアシスタントです。"
  },
  "請先點選上方的大主題，我會在對話框裡提供可選的小主題。": {
    "en": "Please select a main topic above, and I will provide subtopics in the chat box.",
    "ja": "上のメインテーマを選ぶと、チャット欄に選択できる小テーマを表示します。"
  },
  "請直接點選按鈕互動，無需輸入文字": {
    "en": "Please interact by tapping buttons; no typing is needed",
    "ja": "文字入力は不要です。ボタンを押して操作してください"
  },
  "衛教內容僅供參考，如有不適請諮詢專業醫護人員": {
    "en": "Health education content is for reference only. Please consult a medical professional if you feel unwell.",
    "ja": "健康教育内容は参考用です。不調がある場合は専門医療者に相談してください。"
  },
  "📚 衛教知識庫": {
    "en": "📚 Health Education Library",
    "ja": "📚 健康教育ライブラリ"
  },
  "請選擇一個主題閱讀衛教內容。": {
    "en": "Select a topic to read health education content.",
    "ja": "テーマを選んで健康教育内容を読んでください。"
  },
  "急救處置": {
    "en": "First Aid",
    "ja": "応急処置"
  },
  "CPR、異物梗塞、低血糖等 5 項": {
    "en": "CPR, choking, hypoglycemia, and 5 topics",
    "ja": "CPR、異物閉塞、低血糖など5項目"
  },
  "外傷照護": {
    "en": "Trauma Care",
    "ja": "外傷ケア"
  },
  "燒燙傷、流鼻血、扭傷等 5 項": {
    "en": "Burns, nosebleeds, sprains, and 5 topics",
    "ja": "やけど、鼻血、捻挫など5項目"
  },
  "居家照護": {
    "en": "Home Care",
    "ja": "在宅ケア"
  },
  "傷口、睡眠、居家安全等 5 項": {
    "en": "Wounds, sleep, home safety, and 5 topics",
    "ja": "創傷、睡眠、家庭内安全など5項目"
  },
  "管路灌食": {
    "en": "Tube Feeding",
    "ja": "経管栄養"
  },
  "鼻胃管、管路固定、吞嚥照護等 5 項": {
    "en": "NG tube, tube fixation, swallowing care, and 5 topics",
    "ja": "経鼻胃管、チューブ固定、嚥下ケアなど5項目"
  },
  "產後照護": {
    "en": "Postpartum Care",
    "ja": "産後ケア"
  },
  "下床、哺乳、姿勢變換等 5 項": {
    "en": "Getting out of bed, breastfeeding, position changes, and 5 topics",
    "ja": "離床、授乳、体位変換など5項目"
  },
  "慢病管理": {
    "en": "Chronic Disease Management",
    "ja": "慢性疾患管理"
  },
  "高血壓、糖尿病、腎臟病等 5 項": {
    "en": "Hypertension, diabetes, kidney disease, and 5 topics",
    "ja": "高血圧、糖尿病、腎臓病など5項目"
  },
  "營養代謝": {
    "en": "Nutrition & Metabolism",
    "ja": "栄養・代謝"
  },
  "代謝症候群、胃食道逆流等 5 項": {
    "en": "Metabolic syndrome, gastroesophageal reflux, and 5 topics",
    "ja": "メタボリック症候群、胃食道逆流など5項目"
  },
  "神經急症": {
    "en": "Neurological Emergencies",
    "ja": "神経救急"
  },
  "中風、癲癇、意識不清等 5 項": {
    "en": "Stroke, seizures, altered consciousness, and 5 topics",
    "ja": "脳卒中、てんかん、意識障害など5項目"
  },
  "高齡照護": {
    "en": "Elderly Care",
    "ja": "高齢者ケア"
  },
  "跌倒、骨鬆、壓傷、失智等 5 項": {
    "en": "Falls, osteoporosis, pressure injuries, dementia, and 5 topics",
    "ja": "転倒、骨粗しょう症、褥瘡、認知症など5項目"
  },
  "用藥安全": {
    "en": "Medication Safety",
    "ja": "服薬安全"
  },
  "正確用藥、抗生素、抗凝血等 5 項": {
    "en": "Proper medication use, antibiotics, anticoagulants, and 5 topics",
    "ja": "正しい服薬、抗生物質、抗凝固薬など5項目"
  },
  "📚 衛教內容": {
    "en": "📚 Health Education Content",
    "ja": "📚 健康教育内容"
  },
  "請選擇一個衛教分類查看內容。": {
    "en": "Select a health education category to view content.",
    "ja": "健康教育カテゴリを選んで内容を確認してください。"
  },
  "請選擇一個項目查看衛教內容。": {
    "en": "Select an item to view health education content.",
    "ja": "項目を選んで健康教育内容を確認してください。"
  },
  "健康趨勢分析": {
    "en": "Health Trend Analysis",
    "ja": "健康傾向分析"
  },
  "先選分類與項目，即可查看今日或本月趨勢。": {
    "en": "Choose a category and item to view today's or this month's trend.",
    "ja": "カテゴリと項目を選ぶと、今日または今月の傾向を確認できます。"
  },
  "身體數值": {
    "en": "Body Values",
    "ja": "身体数値"
  },
  "心理情緒": {
    "en": "Mental & Mood",
    "ja": "心理・気分"
  },
  "壓力睡眠": {
    "en": "Stress & Sleep",
    "ja": "ストレス・睡眠"
  },
  "今日分析": {
    "en": "Today",
    "ja": "今日分析"
  },
  "本月分析": {
    "en": "This Month",
    "ja": "今月分析"
  },
  "＊今日分析顯示當日各時段或量測結果的變化趨勢": {
    "en": "＊Today's analysis shows trend changes across time points or measurements today.",
    "ja": "＊今日分析では、当日の各時間帯または測定結果の変化傾向を表示します。"
  },
  "分析摘要": {
    "en": "Analysis Summary",
    "ja": "分析サマリー"
  },
  "尚無資料": {
    "en": "No Data Yet",
    "ja": "データなし"
  },
  "請先輸入健康紀錄或完成量表，系統會在這裡顯示趨勢分析。": {
    "en": "Please enter health records or complete a scale first. Trend analysis will appear here.",
    "ja": "健康記録を入力するか尺度を完了すると、ここに傾向分析が表示されます。"
  },
  "小提醒：定期量測與記錄，有助於掌握身體變化，維持健康生活。": {
    "en": "Reminder: Regular measurement and records help you track body changes and maintain a healthy lifestyle.",
    "ja": "リマインダー：定期的な測定と記録は身体の変化を把握し、健康的な生活を維持するのに役立ちます。"
  },
  "🧠 衛教闖關": {
    "en": "🧠 Health Quiz",
    "ja": "🧠 健康教育クイズ"
  },
  "請選擇一個難度開始挑戰，完成題目後可以累積健康知識。": {
    "en": "Choose a difficulty to begin. Completing questions helps build health knowledge.",
    "ja": "難易度を選んで開始してください。問題を解くことで健康知識を積み重ねられます。"
  },
  "🌱 簡單": {
    "en": "🌱 Easy",
    "ja": "🌱 簡単"
  },
  "基本測驗": {
    "en": "Basic Test",
    "ja": "基本テスト"
  },
  "🌿 普通": {
    "en": "🌿 Normal",
    "ja": "🌿 普通"
  },
  "進階測驗": {
    "en": "Intermediate Test",
    "ja": "応用テスト"
  },
  "🌳 困難": {
    "en": "🌳 Hard",
    "ja": "🌳 難しい"
  },
  "後階測驗": {
    "en": "Advanced Test",
    "ja": "上級テスト"
  },
  "← 回衛教頁面": {
    "en": "← Back to Health Education",
    "ja": "← 健康教育ページへ戻る"
  },
  "🧠 知識挑戰": {
    "en": "🧠 Knowledge Challenge",
    "ja": "🧠 知識チャレンジ"
  },
  "先回去": {
    "en": "Go back",
    "ja": "戻る"
  },
  "闖關頁面!": {
    "en": "to quiz page!",
    "ja": "クイズページへ！"
  },
  "關閉": {
    "en": "Close",
    "ja": "閉じる"
  },
  "🚨 危險健康數值": {
    "en": "🚨 Dangerous Health Values",
    "ja": "🚨 危険な健康数値"
  },
  "系統偵測到你的健康數值偏離正常範圍。": {
    "en": "The system detected that your health values are outside the normal range.",
    "ja": "健康数値が正常範囲から外れていることを検出しました。"
  },
  "🚑 撥打 119": {
    "en": "🚑 Call 119",
    "ja": "🚑 119に電話"
  },
  "取消": {
    "en": "Cancel",
    "ja": "キャンセル"
  },
  "我讀完了，去衛教闖關": {
    "en": "I finished reading. Start the health quiz",
    "ja": "読み終わりました。健康教育クイズへ"
  },
  "🧠 我讀完了，去衛教闖關": {
    "en": "🧠 I finished reading. Start the health quiz",
    "ja": "🧠 読み終わりました。健康教育クイズへ"
  },
  "📚 回衛教主題": {
    "en": "📚 Back to Health Topics",
    "ja": "📚 健康教育テーマに戻る"
  },
  "Health education內容": {
    "en": "Health Education Content",
    "ja": "健康教育内容"
  },
  "Health education知識": {
    "en": "Health Knowledge",
    "ja": "健康知識"
  },
  "查看 Health education 與健康知識": {
    "en": "View home care and health knowledge",
    "ja": "在宅ケアと健康知識を見る"
  },
  "Health education關關": {
    "en": "Health Education Quiz",
    "ja": "健康教育クイズ"
  },
  "何時打119": {
    "en": "When to Call 119",
    "ja": "119番に電話する時"
  },
  "胸痛警訊": {
    "en": "Chest Pain Warning Signs",
    "ja": "胸痛の警告サイン"
  },
  "中風警訊": {
    "en": "Stroke Warning Signs",
    "ja": "脳卒中の警告サイン"
  },
  "呼吸喘": {
    "en": "Shortness of Breath",
    "ja": "息苦しさ"
  },
  "頭痛警訊": {
    "en": "Headache Warning Signs",
    "ja": "頭痛の警告サイン"
  },
  "頭暈處理": {
    "en": "Dizziness Care",
    "ja": "めまいの対応"
  },
  "發燒處理": {
    "en": "Fever Care",
    "ja": "発熱の対応"
  },
  "中暑處理": {
    "en": "Heatstroke Care",
    "ja": "熱中症の対応"
  },
  "低體溫": {
    "en": "Low Body Temperature",
    "ja": "低体温"
  },
  "傷口照護": {
    "en": "Wound Care",
    "ja": "創傷ケア"
  },
  "燙傷處理": {
    "en": "Burn Care",
    "ja": "やけどの対応"
  },
  "骨折處理": {
    "en": "Fracture Care",
    "ja": "骨折の対応"
  },
  "跌倒處理": {
    "en": "Fall Care",
    "ja": "転倒時の対応"
  },
  "膝蓋疼痛": {
    "en": "Knee Pain",
    "ja": "膝の痛み"
  },
  "足部照護": {
    "en": "Foot Care",
    "ja": "足のケア"
  },
  "背痛照護": {
    "en": "Back Pain Care",
    "ja": "腰背部痛ケア"
  },
  "高血壓照護": {
    "en": "Hypertension Care",
    "ja": "高血圧ケア"
  },
  "量血壓方法": {
    "en": "How to Measure Blood Pressure",
    "ja": "血圧の測り方"
  },
  "血糖管理": {
    "en": "Blood Glucose Management",
    "ja": "血糖管理"
  },
  "膽固醇": {
    "en": "Cholesterol",
    "ja": "コレステロール"
  },
  "心臟保健": {
    "en": "Heart Health",
    "ja": "心臓の健康"
  },
  "腎臟保健": {
    "en": "Kidney Health",
    "ja": "腎臓の健康"
  },
  "水腫照護": {
    "en": "Edema Care",
    "ja": "むくみのケア"
  },
  "尿路感染": {
    "en": "Urinary Tract Infection",
    "ja": "尿路感染"
  },
  "低鹽飲食": {
    "en": "Low-Salt Diet",
    "ja": "減塩食"
  },
  "均衡飲食": {
    "en": "Balanced Diet",
    "ja": "バランスのよい食事"
  },
  "喝水建議": {
    "en": "Hydration Tips",
    "ja": "水分摂取の助言"
  },
  "體重控制": {
    "en": "Weight Control",
    "ja": "体重管理"
  },
  "胃痛照護": {
    "en": "Stomach Pain Care",
    "ja": "胃痛ケア"
  },
  "腹瀉處理": {
    "en": "Diarrhea Care",
    "ja": "下痢の対応"
  },
  "嘔吐處理": {
    "en": "Vomiting Care",
    "ja": "嘔吐の対応"
  },
  "便秘照護": {
    "en": "Constipation Care",
    "ja": "便秘ケア"
  },
  "感冒照護": {
    "en": "Cold Care",
    "ja": "風邪のケア"
  },
  "咳嗽照護": {
    "en": "Cough Care",
    "ja": "咳のケア"
  },
  "鼻過敏": {
    "en": "Nasal Allergy",
    "ja": "鼻アレルギー"
  },
  "手部衛生": {
    "en": "Hand Hygiene",
    "ja": "手指衛生"
  },
  "感染預防": {
    "en": "Infection Prevention",
    "ja": "感染予防"
  },
  "浴室防跌": {
    "en": "Bathroom Fall Prevention",
    "ja": "浴室での転倒予防"
  },
  "居家安全": {
    "en": "Home Safety",
    "ja": "在宅安全"
  },
  "口腔清潔": {
    "en": "Oral Hygiene",
    "ja": "口腔清潔"
  },
  "長者照護": {
    "en": "Older Adult Care",
    "ja": "高齢者ケア"
  },
  "視力照護": {
    "en": "Vision Care",
    "ja": "視力ケア"
  },
  "聽力照護": {
    "en": "Hearing Care",
    "ja": "聴力ケア"
  },
  "臥床照護": {
    "en": "Bedridden Care",
    "ja": "寝たきりケア"
  },
  "壓瘡預防": {
    "en": "Pressure Injury Prevention",
    "ja": "褥瘡予防"
  },
  "吞嚥照護": {
    "en": "Swallowing Care",
    "ja": "嚥下ケア"
  },
  "睡眠照護": {
    "en": "Sleep Care",
    "ja": "睡眠ケア"
  },
  "焦慮情緒": {
    "en": "Anxiety",
    "ja": "不安"
  },
  "憂鬱警訊": {
    "en": "Depression Warning Signs",
    "ja": "うつのサイン"
  },
  "壓力調適": {
    "en": "Stress Management",
    "ja": "ストレス対処"
  },
  "運動建議": {
    "en": "Exercise Advice",
    "ja": "運動の助言"
  },
  "CPR 與 AED": {
    "en": "CPR and AED",
    "ja": "CPRとAED"
  },
  "異物梗塞": {
    "en": "Choking",
    "ja": "異物による気道閉塞"
  },
  "低血糖處理": {
    "en": "Hypoglycemia Care",
    "ja": "低血糖の対応"
  },
  "失去意識但仍有呼吸": {
    "en": "Unconscious but Breathing",
    "ja": "意識はないが呼吸がある場合"
  },
  "心肌梗塞急救": {
    "en": "Heart Attack First Aid",
    "ja": "心筋梗塞の応急処置"
  },
  "燒燙傷處理": {
    "en": "Burn Care",
    "ja": "やけどの対応"
  },
  "流鼻血處理": {
    "en": "Nosebleed Care",
    "ja": "鼻血の対応"
  },
  "扭傷處理": {
    "en": "Sprain Care",
    "ja": "捻挫の対応"
  },
  "毒蛇咬傷": {
    "en": "Snakebite",
    "ja": "毒蛇咬傷"
  },
  "開放性骨折": {
    "en": "Open Fracture",
    "ja": "開放骨折"
  },
  "術後傷口感染": {
    "en": "Postoperative Wound Infection",
    "ja": "術後創部感染"
  },
  "術後傷口感染觀察": {
    "en": "Postoperative Wound Infection Observation",
    "ja": "術後創部感染の観察"
  },
  "居家環境安全": {
    "en": "Home Environment Safety",
    "ja": "家庭環境の安全"
  },
  "睡眠衛生": {
    "en": "Sleep Hygiene",
    "ja": "睡眠衛生"
  },
  "肺部復原運動": {
    "en": "Lung Recovery Exercises",
    "ja": "肺機能回復運動"
  },
  "鼻胃管進食前檢查": {
    "en": "Pre-feeding NG Tube Check",
    "ja": "経鼻胃管栄養前の確認"
  },
  "鼻胃管灌食前檢查": {
    "en": "Pre-feeding NG Tube Check",
    "ja": "経鼻胃管栄養前の確認"
  },
  "鼻胃管進食後照護": {
    "en": "Post-feeding NG Tube Care",
    "ja": "経鼻胃管栄養後のケア"
  },
  "鼻胃管灌食後照護": {
    "en": "Post-feeding NG Tube Care",
    "ja": "経鼻胃管栄養後のケア"
  },
  "管路固定": {
    "en": "Tube Fixation",
    "ja": "チューブ固定"
  },
  "管路感染預防": {
    "en": "Tube Infection Prevention",
    "ja": "チューブ感染予防"
  },
  "吞嚥困難與吸入性肺炎": {
    "en": "Dysphagia and Aspiration Pneumonia",
    "ja": "嚥下困難と誤嚥性肺炎"
  },
  "產後第一次下床": {
    "en": "First Time Out of Bed After Birth",
    "ja": "産後初めての離床"
  },
  "產後哺乳保護": {
    "en": "Breastfeeding Protection After Birth",
    "ja": "産後の授乳保護"
  },
  "產後跌倒保護": {
    "en": "Postpartum Fall Protection",
    "ja": "産後の転倒予防"
  },
  "產後姿勢變換": {
    "en": "Postpartum Position Changes",
    "ja": "産後の体位変換"
  },
  "產後活動安全": {
    "en": "Postpartum Activity Safety",
    "ja": "産後活動の安全"
  },
  "產後照護者協助": {
    "en": "Postpartum Caregiver Support",
    "ja": "産後介助者の支援"
  },
  "糖尿病足部照護": {
    "en": "Diabetic Foot Care",
    "ja": "糖尿病の足ケア"
  },
  "慢性腎臟病": {
    "en": "Chronic Kidney Disease",
    "ja": "慢性腎臓病"
  },
  "腎臟病高磷飲食限制": {
    "en": "Low-Phosphorus Diet for Kidney Disease",
    "ja": "腎臓病の高リン食制限"
  },
  "心臟衰竭居家照護": {
    "en": "Heart Failure Home Care",
    "ja": "心不全の在宅ケア"
  },
  "代謝症候群": {
    "en": "Metabolic Syndrome",
    "ja": "メタボリック症候群"
  },
  "腰圍與健康風險": {
    "en": "Waist Circumference and Health Risks",
    "ja": "ウエストと健康リスク"
  },
  "胃食道逆流": {
    "en": "Gastroesophageal Reflux",
    "ja": "胃食道逆流"
  },
  "缺鐵性貧血": {
    "en": "Iron-deficiency Anemia",
    "ja": "鉄欠乏性貧血"
  },
  "缺鐵性貧血飲食": {
    "en": "Diet for Iron-deficiency Anemia",
    "ja": "鉄欠乏性貧血の食事"
  },
  "茶與咖啡影響吸收": {
    "en": "Tea and Coffee Affect Absorption",
    "ja": "茶とコーヒーによる吸収への影響"
  },
  "茶與咖啡影響鐵吸收": {
    "en": "Tea and Coffee Affect Iron Absorption",
    "ja": "茶とコーヒーによる鉄吸収への影響"
  },
  "腦經急危徵象": {
    "en": "Neurological Emergency Warning Signs",
    "ja": "神経救急の警告サイン"
  },
  "腦震盪危險徵象": {
    "en": "Concussion Danger Signs",
    "ja": "脳震盪の危険サイン"
  },
  "中風 FAST 辨識": {
    "en": "Stroke FAST Recognition",
    "ja": "脳卒中FAST識別"
  },
  "癲癇發作處理": {
    "en": "Seizure Care",
    "ja": "てんかん発作の対応"
  },
  "意識不清資訊": {
    "en": "Altered Consciousness Information",
    "ja": "意識障害の情報"
  },
  "意識不清警訊": {
    "en": "Altered Consciousness Warning Signs",
    "ja": "意識障害の警告サイン"
  },
  "兒童頭部外傷觀察": {
    "en": "Child Head Injury Observation",
    "ja": "小児頭部外傷の観察"
  },
  "高齡跌倒預防": {
    "en": "Fall Prevention for Older Adults",
    "ja": "高齢者の転倒予防"
  },
  "骨質疏鬆": {
    "en": "Osteoporosis",
    "ja": "骨粗しょう症"
  },
  "骨質疏鬆與骨折": {
    "en": "Osteoporosis and Fractures",
    "ja": "骨粗しょう症と骨折"
  },
  "壓傷": {
    "en": "Pressure Injury",
    "ja": "褥瘡"
  },
  "壓傷預防": {
    "en": "Pressure Injury Prevention",
    "ja": "褥瘡予防"
  },
  "失智預防": {
    "en": "Dementia Prevention",
    "ja": "認知症予防"
  },
  "失智症與走失預防": {
    "en": "Dementia and Wandering Prevention",
    "ja": "認知症と徘徊予防"
  },
  "高齡營養照護": {
    "en": "Nutrition Care for Older Adults",
    "ja": "高齢者の栄養ケア"
  },
  "正確用藥觀念": {
    "en": "Proper Medication Concepts",
    "ja": "正しい服薬の考え方"
  },
  "中藥與西藥間隔": {
    "en": "Spacing Chinese and Western Medicines",
    "ja": "漢方薬と西洋薬の間隔"
  },
  "抗生素正確使用": {
    "en": "Proper Antibiotic Use",
    "ja": "抗生物質の正しい使用"
  },
  "抗凝血藥物注意事項": {
    "en": "Anticoagulant Precautions",
    "ja": "抗凝固薬の注意事項"
  },
  "多重用藥安全": {
    "en": "Polypharmacy Safety",
    "ja": "多剤併用の安全"
  },
  "衛教內容": {
    "en": "Health Education",
    "ja": "健康教育"
  },
  "衛教知識": {
    "en": "Health Knowledge",
    "ja": "健康知識"
  },
  "查看居家照護與健康知識": {
    "en": "Home care and health knowledge",
    "ja": "在宅ケアと健康知識"
  },
  "閱讀健康知識": {
    "en": "Read health info",
    "ja": "健康情報を読む"
  },
  "衛教闖關": {
    "en": "Health Quiz",
    "ja": "健康教育クイズ"
  }
};
  const PLACEHOLDER_I18N = {
  "身高 cm": {
    "en": "Height (cm)",
    "ja": "身長 cm"
  },
  "體重 kg": {
    "en": "Weight (kg)",
    "ja": "体重 kg"
  },
  "例如：160": {
    "en": "e.g. 160",
    "ja": "例：160"
  },
  "例如：50": {
    "en": "e.g. 50",
    "ja": "例：50"
  },
  "例如：120": {
    "en": "e.g. 120",
    "ja": "例：120"
  },
  "例如：80": {
    "en": "e.g. 80",
    "ja": "例：80"
  },
  "例如：72": {
    "en": "e.g. 72",
    "ja": "例：72"
  },
  "例如：84": {
    "en": "e.g. 84",
    "ja": "例：84"
  },
  "例如：66": {
    "en": "e.g. 66",
    "ja": "例：66"
  },
  "例如：90": {
    "en": "e.g. 90",
    "ja": "例：90"
  }
};
  const TOPIC_I18N = {
  "emergency": {
    "zh": [
      "緊急狀況",
      "胸痛、中風、呼吸喘等警訊"
    ],
    "en": [
      "Emergency Signs",
      "Chest pain, stroke signs, breathing difficulty"
    ],
    "ja": [
      "緊急サイン",
      "胸痛・脳卒中サイン・息苦しさ"
    ]
  },
  "injury": {
    "zh": [
      "受傷怎麼辦",
      "傷口、燙傷、骨折、跌倒"
    ],
    "en": [
      "Injury Care",
      "Wounds, burns, fractures, falls"
    ],
    "ja": [
      "けがの対応",
      "傷・やけど・骨折・転倒"
    ]
  },
  "chronic": {
    "zh": [
      "慢性病照顧",
      "血壓、血糖、心腎與用藥"
    ],
    "en": [
      "Chronic Disease Care",
      "Blood pressure, glucose, heart, kidney, medication"
    ],
    "ja": [
      "慢性疾患ケア",
      "血圧・血糖・心臓・腎臓・薬"
    ]
  },
  "food": {
    "zh": [
      "吃喝與腸胃",
      "飲食、水分、胃腸不適"
    ],
    "en": [
      "Food & Digestion",
      "Diet, hydration, stomach discomfort"
    ],
    "ja": [
      "食事と胃腸",
      "食事・水分・胃腸の不調"
    ]
  },
  "cold": {
    "zh": [
      "感冒呼吸",
      "感冒、咳嗽、鼻過敏"
    ],
    "en": [
      "Cold & Breathing",
      "Colds, cough, nasal allergy"
    ],
    "ja": [
      "風邪と呼吸",
      "風邪・咳・鼻アレルギー"
    ]
  },
  "home": {
    "zh": [
      "居家安全",
      "防跌、清潔、感染預防"
    ],
    "en": [
      "Home Safety",
      "Fall prevention, hygiene, infection prevention"
    ],
    "ja": [
      "在宅安全",
      "転倒予防・清潔・感染予防"
    ]
  },
  "elder": {
    "zh": [
      "長輩照顧",
      "長者、臥床、吞嚥照護"
    ],
    "en": [
      "Older Adult Care",
      "Elderly, bedridden, swallowing care"
    ],
    "ja": [
      "高齢者ケア",
      "高齢者・寝たきり・嚥下ケア"
    ]
  },
  "mind": {
    "zh": [
      "睡眠與心情",
      "睡眠、壓力、焦慮憂鬱"
    ],
    "en": [
      "Sleep & Mood",
      "Sleep, stress, anxiety, depression"
    ],
    "ja": [
      "睡眠と気分",
      "睡眠・ストレス・不安・うつ"
    ]
  }
};
  const SUBTOPIC_I18N = {
  "何時打119": {
    "en": "When to Call 119",
    "ja": "119番に電話する時"
  },
  "胸痛警訊": {
    "en": "Chest Pain Warning Signs",
    "ja": "胸痛の警告サイン"
  },
  "中風警訊": {
    "en": "Stroke Warning Signs",
    "ja": "脳卒中の警告サイン"
  },
  "呼吸喘": {
    "en": "Shortness of Breath",
    "ja": "息苦しさ"
  },
  "頭痛警訊": {
    "en": "Headache Warning Signs",
    "ja": "頭痛の警告サイン"
  },
  "頭暈處理": {
    "en": "Dizziness Care",
    "ja": "めまいの対応"
  },
  "發燒處理": {
    "en": "Fever Care",
    "ja": "発熱の対応"
  },
  "中暑處理": {
    "en": "Heatstroke Care",
    "ja": "熱中症の対応"
  },
  "低體溫": {
    "en": "Low Body Temperature",
    "ja": "低体温"
  },
  "傷口照護": {
    "en": "Wound Care",
    "ja": "創傷ケア"
  },
  "燙傷處理": {
    "en": "Burn Care",
    "ja": "やけどの対応"
  },
  "骨折處理": {
    "en": "Fracture Care",
    "ja": "骨折の対応"
  },
  "跌倒處理": {
    "en": "Fall Care",
    "ja": "転倒時の対応"
  },
  "膝蓋疼痛": {
    "en": "Knee Pain",
    "ja": "膝の痛み"
  },
  "足部照護": {
    "en": "Foot Care",
    "ja": "足のケア"
  },
  "背痛照護": {
    "en": "Back Pain Care",
    "ja": "腰背部痛ケア"
  },
  "高血壓照護": {
    "en": "Hypertension Care",
    "ja": "高血圧ケア"
  },
  "量血壓方法": {
    "en": "How to Measure Blood Pressure",
    "ja": "血圧の測り方"
  },
  "血糖管理": {
    "en": "Blood Glucose Management",
    "ja": "血糖管理"
  },
  "膽固醇": {
    "en": "Cholesterol",
    "ja": "コレステロール"
  },
  "心臟保健": {
    "en": "Heart Health",
    "ja": "心臓の健康"
  },
  "腎臟保健": {
    "en": "Kidney Health",
    "ja": "腎臓の健康"
  },
  "水腫照護": {
    "en": "Edema Care",
    "ja": "むくみのケア"
  },
  "尿路感染": {
    "en": "Urinary Tract Infection",
    "ja": "尿路感染"
  },
  "用藥安全": {
    "en": "Medication Safety",
    "ja": "服薬安全"
  },
  "低鹽飲食": {
    "en": "Low-Salt Diet",
    "ja": "減塩食"
  },
  "均衡飲食": {
    "en": "Balanced Diet",
    "ja": "バランスのよい食事"
  },
  "喝水建議": {
    "en": "Hydration Tips",
    "ja": "水分摂取の助言"
  },
  "體重控制": {
    "en": "Weight Control",
    "ja": "体重管理"
  },
  "胃痛照護": {
    "en": "Stomach Pain Care",
    "ja": "胃痛ケア"
  },
  "腹瀉處理": {
    "en": "Diarrhea Care",
    "ja": "下痢の対応"
  },
  "嘔吐處理": {
    "en": "Vomiting Care",
    "ja": "嘔吐の対応"
  },
  "便秘照護": {
    "en": "Constipation Care",
    "ja": "便秘ケア"
  },
  "感冒照護": {
    "en": "Cold Care",
    "ja": "風邪のケア"
  },
  "咳嗽照護": {
    "en": "Cough Care",
    "ja": "咳のケア"
  },
  "鼻過敏": {
    "en": "Nasal Allergy",
    "ja": "鼻アレルギー"
  },
  "手部衛生": {
    "en": "Hand Hygiene",
    "ja": "手指衛生"
  },
  "感染預防": {
    "en": "Infection Prevention",
    "ja": "感染予防"
  },
  "浴室防跌": {
    "en": "Bathroom Fall Prevention",
    "ja": "浴室での転倒予防"
  },
  "居家安全": {
    "en": "Home Safety",
    "ja": "在宅安全"
  },
  "口腔清潔": {
    "en": "Oral Hygiene",
    "ja": "口腔清潔"
  },
  "長者照護": {
    "en": "Older Adult Care",
    "ja": "高齢者ケア"
  },
  "視力照護": {
    "en": "Vision Care",
    "ja": "視力ケア"
  },
  "聽力照護": {
    "en": "Hearing Care",
    "ja": "聴力ケア"
  },
  "臥床照護": {
    "en": "Bedridden Care",
    "ja": "寝たきりケア"
  },
  "壓瘡預防": {
    "en": "Pressure Injury Prevention",
    "ja": "褥瘡予防"
  },
  "吞嚥照護": {
    "en": "Swallowing Care",
    "ja": "嚥下ケア"
  },
  "睡眠照護": {
    "en": "Sleep Care",
    "ja": "睡眠ケア"
  },
  "焦慮情緒": {
    "en": "Anxiety",
    "ja": "不安"
  },
  "憂鬱警訊": {
    "en": "Depression Warning Signs",
    "ja": "うつのサイン"
  },
  "壓力調適": {
    "en": "Stress Management",
    "ja": "ストレス対処"
  },
  "運動建議": {
    "en": "Exercise Advice",
    "ja": "運動の助言"
  }
};
  const CATEGORY_I18N = {
  "firstAid": {
    "zh": [
      "🚑 急救處置",
      "學習突發狀況下的基本急救處理方式。"
    ],
    "en": [
      "🚑 First Aid",
      "Learn basic first-aid steps for sudden situations."
    ],
    "ja": [
      "🚑 応急処置",
      "突然の状況に対応する基本的な応急処置を学びます。"
    ]
  },
  "traumaCare": {
    "zh": [
      "🔥 外傷與急症處理",
      "了解外傷、燒燙傷與急症處理重點。"
    ],
    "en": [
      "🔥 Trauma & Urgent Care",
      "Learn key care points for injuries, burns, and urgent conditions."
    ],
    "ja": [
      "🔥 外傷と急症の対応",
      "外傷、やけど、急な症状への対応を学びます。"
    ]
  },
  "woundHomeCare": {
    "zh": [
      "🩹 傷口與居家照護",
      "了解傷口、睡眠與居家安全照護。"
    ],
    "en": [
      "🩹 Wound & Home Care",
      "Learn about wound care, sleep, and home safety."
    ],
    "ja": [
      "🩹 傷口と在宅ケア",
      "創傷ケア、睡眠、家庭内安全について学びます。"
    ]
  },
  "tubeSwallowCare": {
    "zh": [
      "🧪 管路與吞嚥照護",
      "學習鼻胃管、管路固定與吞嚥照護。"
    ],
    "en": [
      "🧪 Tube & Swallowing Care",
      "Learn NG-tube care, tube fixation, and swallowing care."
    ],
    "ja": [
      "🧪 チューブと嚥下ケア",
      "経鼻胃管、チューブ固定、嚥下ケアを学びます。"
    ]
  },
  "postpartumCare": {
    "zh": [
      "🤱 產後照護",
      "了解產後活動、哺乳與照護協助。"
    ],
    "en": [
      "🤱 Postpartum Care",
      "Learn about postpartum activity, breastfeeding, and caregiver support."
    ],
    "ja": [
      "🤱 産後ケア",
      "産後の活動、授乳、介助について学びます。"
    ]
  },
  "chronicCare": {
    "zh": [
      "🩺 慢性病居家照護",
      "學習血壓、糖尿病、腎臟與心臟照護。"
    ],
    "en": [
      "🩺 Chronic Disease Home Care",
      "Learn blood pressure, diabetes, kidney, and heart care."
    ],
    "ja": [
      "🩺 慢性疾患の在宅ケア",
      "血圧、糖尿病、腎臓、心臓のケアを学びます。"
    ]
  },
  "nutritionCare": {
    "zh": [
      "⚖️ 營養代謝",
      "了解代謝症候群、胃食道逆流與營養照護。"
    ],
    "en": [
      "⚖️ Nutrition & Metabolism",
      "Learn metabolic syndrome, reflux, and nutrition care."
    ],
    "ja": [
      "⚖️ 栄養・代謝",
      "メタボリック症候群、逆流、栄養ケアを学びます。"
    ]
  },
  "neuroEmergency": {
    "zh": [
      "🧠 神經急症",
      "學習中風、癲癇與意識不清等警訊。"
    ],
    "en": [
      "🧠 Neurological Emergencies",
      "Learn stroke, seizure, and altered-consciousness warning signs."
    ],
    "ja": [
      "🧠 神経救急",
      "脳卒中、てんかん、意識障害の警告サインを学びます。"
    ]
  },
  "elderlyCare": {
    "zh": [
      "👵 高齡照護",
      "了解跌倒、骨鬆、壓傷與失智照護。"
    ],
    "en": [
      "👵 Older Adult Care",
      "Learn fall, osteoporosis, pressure injury, and dementia care."
    ],
    "ja": [
      "👵 高齢者ケア",
      "転倒、骨粗しょう症、褥瘡、認知症ケアを学びます。"
    ]
  },
  "medicationSafety": {
    "zh": [
      "💊 用藥安全",
      "學習正確用藥、抗生素與抗凝血藥注意事項。"
    ],
    "en": [
      "💊 Medication Safety",
      "Learn proper medication use, antibiotics, and anticoagulant precautions."
    ],
    "ja": [
      "💊 服薬安全",
      "正しい服薬、抗生物質、抗凝固薬の注意点を学びます。"
    ]
  }
};
  const SECTION_I18N = {
  "CPR 與 AED": {
    "en": "CPR and AED",
    "ja": "CPRとAED"
  },
  "異物梗塞": {
    "en": "Choking",
    "ja": "異物による気道閉塞"
  },
  "低血糖處理": {
    "en": "Hypoglycemia Care",
    "ja": "低血糖の対応"
  },
  "失去意識但仍有呼吸": {
    "en": "Unconscious but Breathing",
    "ja": "意識はないが呼吸がある場合"
  },
  "心肌梗塞急救": {
    "en": "Heart Attack First Aid",
    "ja": "心筋梗塞の応急処置"
  },
  "燒燙傷處理": {
    "en": "Burn Care",
    "ja": "やけどの対応"
  },
  "流鼻血處理": {
    "en": "Nosebleed Care",
    "ja": "鼻血の対応"
  },
  "扭傷處理": {
    "en": "Sprain Care",
    "ja": "捻挫の対応"
  },
  "毒蛇咬傷": {
    "en": "Snakebite",
    "ja": "毒蛇咬傷"
  },
  "開放性骨折": {
    "en": "Open Fracture",
    "ja": "開放骨折"
  },
  "術後傷口感染": {
    "en": "Postoperative Wound Infection",
    "ja": "術後創部感染"
  },
  "術後傷口感染觀察": {
    "en": "Postoperative Wound Infection Observation",
    "ja": "術後創部感染の観察"
  },
  "居家環境安全": {
    "en": "Home Environment Safety",
    "ja": "家庭環境の安全"
  },
  "睡眠衛生": {
    "en": "Sleep Hygiene",
    "ja": "睡眠衛生"
  },
  "肺部復原運動": {
    "en": "Lung Recovery Exercises",
    "ja": "肺機能回復運動"
  },
  "鼻胃管進食前檢查": {
    "en": "Pre-feeding NG Tube Check",
    "ja": "経鼻胃管栄養前の確認"
  },
  "鼻胃管灌食前檢查": {
    "en": "Pre-feeding NG Tube Check",
    "ja": "経鼻胃管栄養前の確認"
  },
  "鼻胃管進食後照護": {
    "en": "Post-feeding NG Tube Care",
    "ja": "経鼻胃管栄養後のケア"
  },
  "鼻胃管灌食後照護": {
    "en": "Post-feeding NG Tube Care",
    "ja": "経鼻胃管栄養後のケア"
  },
  "管路固定": {
    "en": "Tube Fixation",
    "ja": "チューブ固定"
  },
  "管路感染預防": {
    "en": "Tube Infection Prevention",
    "ja": "チューブ感染予防"
  },
  "吞嚥困難與吸入性肺炎": {
    "en": "Dysphagia and Aspiration Pneumonia",
    "ja": "嚥下困難と誤嚥性肺炎"
  },
  "產後第一次下床": {
    "en": "First Time Out of Bed After Birth",
    "ja": "産後初めての離床"
  },
  "產後哺乳保護": {
    "en": "Breastfeeding Protection After Birth",
    "ja": "産後の授乳保護"
  },
  "產後跌倒保護": {
    "en": "Postpartum Fall Protection",
    "ja": "産後の転倒予防"
  },
  "產後姿勢變換": {
    "en": "Postpartum Position Changes",
    "ja": "産後の体位変換"
  },
  "產後活動安全": {
    "en": "Postpartum Activity Safety",
    "ja": "産後活動の安全"
  },
  "產後照護者協助": {
    "en": "Postpartum Caregiver Support",
    "ja": "産後介助者の支援"
  },
  "糖尿病足部照護": {
    "en": "Diabetic Foot Care",
    "ja": "糖尿病の足ケア"
  },
  "慢性腎臟病": {
    "en": "Chronic Kidney Disease",
    "ja": "慢性腎臓病"
  },
  "腎臟病高磷飲食限制": {
    "en": "Low-Phosphorus Diet for Kidney Disease",
    "ja": "腎臓病の高リン食制限"
  },
  "心臟衰竭居家照護": {
    "en": "Heart Failure Home Care",
    "ja": "心不全の在宅ケア"
  },
  "代謝症候群": {
    "en": "Metabolic Syndrome",
    "ja": "メタボリック症候群"
  },
  "腰圍與健康風險": {
    "en": "Waist Circumference and Health Risks",
    "ja": "ウエストと健康リスク"
  },
  "胃食道逆流": {
    "en": "Gastroesophageal Reflux",
    "ja": "胃食道逆流"
  },
  "缺鐵性貧血": {
    "en": "Iron-deficiency Anemia",
    "ja": "鉄欠乏性貧血"
  },
  "缺鐵性貧血飲食": {
    "en": "Diet for Iron-deficiency Anemia",
    "ja": "鉄欠乏性貧血の食事"
  },
  "茶與咖啡影響吸收": {
    "en": "Tea and Coffee Affect Absorption",
    "ja": "茶とコーヒーによる吸収への影響"
  },
  "茶與咖啡影響鐵吸收": {
    "en": "Tea and Coffee Affect Iron Absorption",
    "ja": "茶とコーヒーによる鉄吸収への影響"
  },
  "腦經急危徵象": {
    "en": "Neurological Emergency Warning Signs",
    "ja": "神経救急の警告サイン"
  },
  "腦震盪危險徵象": {
    "en": "Concussion Danger Signs",
    "ja": "脳震盪の危険サイン"
  },
  "中風 FAST 辨識": {
    "en": "Stroke FAST Recognition",
    "ja": "脳卒中FAST識別"
  },
  "癲癇發作處理": {
    "en": "Seizure Care",
    "ja": "てんかん発作の対応"
  },
  "意識不清資訊": {
    "en": "Altered Consciousness Information",
    "ja": "意識障害の情報"
  },
  "意識不清警訊": {
    "en": "Altered Consciousness Warning Signs",
    "ja": "意識障害の警告サイン"
  },
  "兒童頭部外傷觀察": {
    "en": "Child Head Injury Observation",
    "ja": "小児頭部外傷の観察"
  },
  "高齡跌倒預防": {
    "en": "Fall Prevention for Older Adults",
    "ja": "高齢者の転倒予防"
  },
  "骨質疏鬆": {
    "en": "Osteoporosis",
    "ja": "骨粗しょう症"
  },
  "骨質疏鬆與骨折": {
    "en": "Osteoporosis and Fractures",
    "ja": "骨粗しょう症と骨折"
  },
  "壓傷": {
    "en": "Pressure Injury",
    "ja": "褥瘡"
  },
  "壓傷預防": {
    "en": "Pressure Injury Prevention",
    "ja": "褥瘡予防"
  },
  "失智預防": {
    "en": "Dementia Prevention",
    "ja": "認知症予防"
  },
  "失智症與走失預防": {
    "en": "Dementia and Wandering Prevention",
    "ja": "認知症と徘徊予防"
  },
  "高齡營養照護": {
    "en": "Nutrition Care for Older Adults",
    "ja": "高齢者の栄養ケア"
  },
  "正確用藥觀念": {
    "en": "Proper Medication Concepts",
    "ja": "正しい服薬の考え方"
  },
  "中藥與西藥間隔": {
    "en": "Spacing Chinese and Western Medicines",
    "ja": "漢方薬と西洋薬の間隔"
  },
  "抗生素正確使用": {
    "en": "Proper Antibiotic Use",
    "ja": "抗生物質の正しい使用"
  },
  "抗凝血藥物注意事項": {
    "en": "Anticoagulant Precautions",
    "ja": "抗凝固薬の注意事項"
  },
  "多重用藥安全": {
    "en": "Polypharmacy Safety",
    "ja": "多剤併用の安全"
  }
};
  const MIXED_TO_ZH = {
  "Health education內容": "衛教內容",
  "Health Education內容": "衛教內容",
  "Health education知識": "衛教知識",
  "Health Education知識": "衛教知識",
  "查看 Health education 與健康知識": "查看居家照護與健康知識",
  "查看 Health Education 與健康知識": "查看居家照護與健康知識",
  "Health education關關": "衛教闖關",
  "Health Education闖關": "衛教闖關"
};

  const textNodeOriginal = new WeakMap();
  let applyingI18n = false;
  let observerTimer = null;

  function normLang(lang) {
    const raw = String(lang || "").trim().toLowerCase();
    if (raw === "en" || raw.startsWith("en-")) return "en";
    if (raw === "ja" || raw.startsWith("ja") || raw.includes("日")) return "ja";
    if (raw === "zh" || raw === "zh-tw" || raw === "zh-hant" || raw.includes("中")) return "zh";
    return "zh";
  }

  function getUnifiedLang() {
    return normLang(
      window.currentLanguage ||
      window.currentLang ||
      (typeof currentLanguage !== "undefined" ? currentLanguage : "") ||
      (typeof currentLang !== "undefined" ? currentLang : "") ||
      localStorage.getItem("siteLanguage") ||
      localStorage.getItem("currentLang") ||
      localStorage.getItem("lang") ||
      document.documentElement.lang ||
      "zh"
    );
  }

  function syncUnifiedLang(lang) {
    const next = normLang(lang);
    window.currentLanguage = next;
    window.currentLang = next;
    try { currentLanguage = next; } catch (e) {}
    try { currentLang = next; } catch (e) {}
    localStorage.setItem("siteLanguage", next);
    localStorage.setItem("currentLang", next);
    localStorage.setItem("language", next);
    localStorage.setItem("lang", next);
    document.documentElement.lang = next === "zh" ? "zh-TW" : next;
    if (document.body) {
      document.body.classList.remove("lang-zh", "lang-en", "lang-ja");
      document.body.classList.add("lang-" + next);
    }
    return next;
  }

  function makeBaseMap() {
    const map = Object.assign({}, EXTRA_I18N);
    try {
      if (typeof staticI18nText !== "undefined") Object.assign(map, staticI18nText);
    } catch (e) {}
    // Add data-i18n values from the original i18nText table as exact text entries.
    try {
      if (typeof i18nText !== "undefined" && i18nText.zh) {
        Object.keys(i18nText.zh).forEach(key => {
          const zh = i18nText.zh[key];
          if (typeof zh === "string" && zh && !zh.includes("{")) {
            map[zh] = {
              en: i18nText.en && typeof i18nText.en[key] === "string" ? i18nText.en[key] : zh,
              ja: i18nText.ja && typeof i18nText.ja[key] === "string" ? i18nText.ja[key] : zh
            };
          }
        });
      }
    } catch (e) {}
    Object.keys(SUBTOPIC_I18N).forEach(key => { if (!map[key]) map[key] = SUBTOPIC_I18N[key]; });
    Object.keys(SECTION_I18N).forEach(key => { if (!map[key]) map[key] = SECTION_I18N[key]; });
    return map;
  }

  const BASE_MAP = makeBaseMap();
  const REVERSE_INDEX = {};

  Object.keys(BASE_MAP).forEach(zh => {
    ["en", "ja"].forEach(lang => {
      const value = BASE_MAP[zh] && BASE_MAP[zh][lang];
      if (typeof value === "string" && value.trim()) REVERSE_INDEX[value.replace(/\s+/g, " ").trim()] = zh;
    });
  });

  function normalizeText(value) {
    return String(value || "").replace(/\s+/g, " ").trim();
  }

  function findSourceZh(text) {
    const normalized = normalizeText(text);
    if (!normalized) return null;
    if (MIXED_TO_ZH[normalized]) return MIXED_TO_ZH[normalized];
    if (BASE_MAP[normalized]) return normalized;
    if (REVERSE_INDEX[normalized]) return REVERSE_INDEX[normalized];
    return null;
  }

  function translateExactZh(sourceZh, lang) {
    const source = MIXED_TO_ZH[normalizeText(sourceZh)] || sourceZh;
    if (lang === "zh") return source;
    const row = BASE_MAP[source];
    return (row && row[lang]) || source;
  }

  function translateTextNode(node, lang) {
    if (!node || !node.nodeValue || !node.parentElement) return;
    const tag = node.parentElement.tagName;
    if (tag === "SCRIPT" || tag === "STYLE" || tag === "TEXTAREA") return;
    const raw = node.nodeValue;
    const trimmed = normalizeText(raw);
    if (!trimmed) return;

    let sourceZh = textNodeOriginal.get(node);
    if (!sourceZh) {
      sourceZh = findSourceZh(trimmed);
      if (sourceZh) textNodeOriginal.set(node, sourceZh);
    }
    if (!sourceZh) return;

    const translated = translateExactZh(sourceZh, lang);
    const nextValue = raw.match(/^\s/) || raw.match(/\s$/) ? raw.replace(trimmed, translated) : translated;
    if (node.nodeValue !== nextValue) node.nodeValue = nextValue;
  }

  function applyDataI18n(lang) {
    try {
      document.querySelectorAll("[data-i18n]").forEach(el => {
        const key = el.dataset.i18n;
        const value =
          (typeof i18nText !== "undefined" && i18nText[lang] && i18nText[lang][key]) ||
          (typeof i18nText !== "undefined" && i18nText.zh && i18nText.zh[key]) ||
          "";
        if (value && el.textContent !== value) el.textContent = value;
      });
    } catch (e) {}

    try {
      document.querySelectorAll("[data-placeholder-i18n]").forEach(el => {
        const key = el.dataset.placeholderI18n;
        const value =
          (typeof i18nText !== "undefined" && i18nText[lang] && i18nText[lang][key]) ||
          (typeof i18nText !== "undefined" && i18nText.zh && i18nText.zh[key]) ||
          "";
        if (value && el.getAttribute("placeholder") !== value) el.setAttribute("placeholder", value);
      });
    } catch (e) {}
  }

  function applyPlaceholders(lang) {
    document.querySelectorAll("input[placeholder], textarea[placeholder]").forEach(el => {
      const current = normalizeText(el.getAttribute("placeholder"));
      let source = el.dataset.originalZhPlaceholder || findSourcePlaceholder(current);
      if (!source && PLACEHOLDER_I18N[current]) source = current;
      if (!source) return;
      el.dataset.originalZhPlaceholder = source;
      const nextPlaceholder = lang === "zh" ? source : ((PLACEHOLDER_I18N[source] && PLACEHOLDER_I18N[source][lang]) || source);
      if (el.getAttribute("placeholder") !== nextPlaceholder) el.setAttribute("placeholder", nextPlaceholder);
    });
  }

  function findSourcePlaceholder(text) {
    const normalized = normalizeText(text);
    if (PLACEHOLDER_I18N[normalized]) return normalized;
    for (const zh of Object.keys(PLACEHOLDER_I18N)) {
      if (PLACEHOLDER_I18N[zh].en === normalized || PLACEHOLDER_I18N[zh].ja === normalized) return zh;
    }
    return null;
  }

  function updateLanguageButton(lang) {
    const labels = {
      zh: { label: "語言", zh: "繁體中文", en: "English", ja: "日本語" },
      en: { label: "Language", zh: "繁體中文", en: "English", ja: "日本語" },
      ja: { label: "言語", zh: "繁體中文", en: "English", ja: "日本語" }
    }[lang];

    const btn = document.querySelector(".language-btn, .language-toggle");
    const btnHtml = `🌐 <span>${labels.label}</span> ▾`;
    if (btn && btn.innerHTML !== btnHtml) btn.innerHTML = btnHtml;

    const menu = document.getElementById("language-menu") || document.getElementById("lang-menu");
    if (menu) {
      const menuHtml = `
        <button type="button" class="lang-option" data-lang="zh">${labels.zh}</button>
        <button type="button" class="lang-option" data-lang="en">${labels.en}</button>
        <button type="button" class="lang-option" data-lang="ja">${labels.ja}</button>
      `;
      if (menu.dataset.unifiedI18nLang !== lang || menu.innerHTML.trim() !== menuHtml.trim()) {
        menu.innerHTML = menuHtml;
        menu.dataset.unifiedI18nLang = lang;
      }
      menu.querySelectorAll("[data-lang]").forEach(option => {
        option.onclick = function(event) {
          event.preventDefault();
          event.stopPropagation();
          window.setLanguage(this.dataset.lang);
          menu.classList.add("hidden");
        };
      });
    }
  }

  window.toggleLangMenu = window.toggleLanguageMenu = function unifiedToggleLangMenu(event) {
    if (event) {
      event.preventDefault();
      event.stopPropagation();
    }
    updateLanguageButton(getUnifiedLang());
    const menu = document.getElementById("language-menu") || document.getElementById("lang-menu");
    if (menu) menu.classList.toggle("hidden");
  };

  function updateTitle(lang) {
    const zhTitle = "智慧居家衛教平台";
    const nextTitle = lang === "zh" ? zhTitle : translateExactZh(zhTitle, lang);
    if (document.title !== nextTitle) document.title = nextTitle;
  }

  function resetAiAssistantIntro(lang) {
    const chatBox = document.getElementById("aiChatBox");
    if (!chatBox) return;
    const hello = {
      zh: ["您好！我是您的健康照護助手。", "請先點選上方的大主題，我會在對話框裡提供可選的小主題。"],
      en: ["Hello! I am your health care assistant.", "Please select a main topic above, and I will provide subtopics in the chat box."],
      ja: ["こんにちは！私はあなたの健康ケアアシスタントです。", "上のメインテーマを選ぶと、チャット欄に選択できる小テーマを表示します。"]
    }[lang];
    chatBox.innerHTML = `
      <div class="doctor-row">
        <img src="images/doctor.png" class="chat-doctor-avatar" alt="${lang === "en" ? "Doctor avatar" : lang === "ja" ? "医師アバター" : "醫生頭像"}">
        <div class="doctor-bubble">
          <p>${hello[0]}</p>
          <p>${hello[1]}</p>
        </div>
      </div>
    `;
  }

  function topicText(group, lang) {
    const row = TOPIC_I18N[group.key] || {};
    const arr = row[lang] || row.zh || [group.title, group.subtitle];
    return { title: arr[0] || group.title, subtitle: arr[1] || group.subtitle };
  }

  function subTopicText(title, lang) {
    if (lang === "zh") return title;
    return (SUBTOPIC_I18N[title] && SUBTOPIC_I18N[title][lang]) || (SECTION_I18N[title] && SECTION_I18N[title][lang]) || title;
  }

  function esc(text) {
    return String(text == null ? "" : text)
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");
  }

  window.renderHotQuestions = function unifiedRenderHotQuestions() {
    const lang = getUnifiedLang();
    const container = document.getElementById("hotQuestionScroll");
    if (!container || typeof healthTopicGroups === "undefined") return;
    if (container.dataset.unifiedI18nLang === lang && container.children.length > 0) return;
    container.innerHTML = "";
    container.dataset.unifiedI18nLang = lang;
    healthTopicGroups.forEach(group => {
      const t = topicText(group, lang);
      const button = document.createElement("button");
      button.className = "hot-question-btn main-topic-btn";
      button.dataset.topic = group.key;
      button.innerHTML = `<span class="main-topic-title">${esc(t.title)}</span><small>${esc(t.subtitle)}</small>`;
      button.addEventListener("click", () => window.selectHealthTopic(group.key));
      container.appendChild(button);
    });
  };

  window.addDoctorChatMessage = function unifiedAddDoctorChatMessage(text) {
    const chatBox = document.getElementById("aiChatBox");
    if (!chatBox) return;
    const row = document.createElement("div");
    row.className = "doctor-row";
    row.innerHTML = `<img src="images/doctor.png" class="chat-doctor-avatar" alt=""><div class="doctor-bubble">${esc(text)}</div>`;
    chatBox.appendChild(row);
    try { window.scrollAiChatToBottom && window.scrollAiChatToBottom(); } catch (e) {}
  };

  window.addUserChatMessage = function unifiedAddUserChatMessage(text) {
    const chatBox = document.getElementById("aiChatBox");
    if (!chatBox) return;
    const row = document.createElement("div");
    row.className = "user-row";
    row.innerHTML = `<div class="patient-bubble">${esc(text)}</div>`;
    chatBox.appendChild(row);
    try { window.scrollAiChatToBottom && window.scrollAiChatToBottom(); } catch (e) {}
  };

  window.selectHealthTopic = function unifiedSelectHealthTopic(topicKey) {
    const lang = getUnifiedLang();
    const group = typeof healthTopicGroups !== "undefined" ? healthTopicGroups.find(item => item.key === topicKey) : null;
    if (!group) return;
    const text = topicText(group, lang);
    document.querySelectorAll(".main-topic-btn").forEach(btn => btn.classList.toggle("active", btn.dataset.topic === topicKey));
    window.addUserChatMessage(text.title);
    const msg = lang === "en"
      ? `You selected “${text.title}”. Please choose a subtopic below and I will provide matching health education content.`
      : lang === "ja"
        ? `「${text.title}」を選択しました。下の小テーマを選ぶと、対応する健康教育内容を表示します。`
        : `您選擇了「${text.title}」。請再點選下方想了解的小主題，我會提供對應的衛教內容。`;
    window.addDoctorChatMessage(msg);
    window.addSubTopicButtons(group);
  };

  window.addSubTopicButtons = function unifiedAddSubTopicButtons(group) {
    const lang = getUnifiedLang();
    const chatBox = document.getElementById("aiChatBox");
    if (!chatBox || !group) return;
    const panel = document.createElement("div");
    panel.className = "sub-topic-panel";
    group.items.forEach(title => {
      const translatedTitle = subTopicText(title, lang);
      const btn = document.createElement("button");
      btn.className = "sub-topic-btn";
      btn.innerHTML = `<span>${esc(translatedTitle)}</span>`;
      btn.addEventListener("click", () => {
        window.addUserChatMessage(translatedTitle);
        window.showHealthEducationCard(title);
      });
      panel.appendChild(btn);
    });
    chatBox.appendChild(panel);
    try { window.scrollAiChatToBottom && window.scrollAiChatToBottom(); } catch (e) {}
  };

  function localizedArticle(title, lang) {
    const translatedTitle = subTopicText(title, lang);
    if (lang === "zh") {
      let item = null;
      try { item = getHealthQuestionByTitle(title); } catch (e) {}
      return {
        title: item && item.title ? item.title : title,
        principle: item && item.principle ? item.principle : "這個主題可提供基礎衛教說明，協助你先理解可能原因，再依照狀況採取合適處理。",
        care: item && (item.care || (Array.isArray(item.steps) ? item.steps.join(" ") : "")) ? (item.care || item.steps.join(" ")) : "可以先觀察症狀出現的時間、嚴重程度與是否持續惡化，並保持休息、補充水分，避免刺激或加重症狀的因素。",
        warning: item && item.warning ? item.warning : "若出現意識不清、呼吸困難、胸痛、大量出血或症狀快速惡化，請立即撥打119或就醫。"
      };
    }
    if (lang === "en") {
      return {
        title: translatedTitle,
        principle: `${translatedTitle} may involve changes in symptoms, safety risks, or daily-care habits. Understanding the cause and warning signs helps you respond earlier and more safely.`,
        care: `Observe when symptoms started, their severity, and whether they are worsening. Follow safe care steps, rest as appropriate, stay hydrated when suitable, and avoid actions that may increase risk. Keep records of important changes.`,
        warning: `Seek medical care or call 119 immediately if there is confusion, breathing difficulty, chest pain, heavy bleeding, severe pain, fainting, or rapid worsening.`
      };
    }
    return {
      title: translatedTitle,
      principle: `${translatedTitle}では、症状の変化、安全リスク、日常ケアの習慣が関係することがあります。原因と警告サインを理解すると、より早く安全に対応できます。`,
      care: `症状がいつ始まったか、どの程度か、悪化しているかを観察しましょう。安全なケア手順に従い、必要に応じて休息し、水分をとり、リスクを高める行動を避けてください。重要な変化は記録しましょう。`,
      warning: `意識障害、呼吸困難、胸痛、大量出血、強い痛み、失神、急速な悪化がある場合は、すぐに119番または医療機関を受診してください。`
    };
  }

  window.showHealthEducationCard = function unifiedShowHealthEducationCard(title) {
    const lang = getUnifiedLang();
    const chatBox = document.getElementById("aiChatBox");
    if (!chatBox) return;
    const data = localizedArticle(title, lang);
    const labels = {
      zh: ["為什麼會這樣？", "你可以怎麼做？", "什麼情況要就醫？"],
      en: ["Why does this happen?", "What can you do?", "When should you seek medical care?"],
      ja: ["なぜ起こるのですか？", "どうすればよいですか？", "どのような時に受診すべきですか？"]
    }[lang];
    const card = document.createElement("div");
    card.className = "education-card-message detailed-education-card";
    card.innerHTML = `
      <div class="education-card-title"><strong>${esc(data.title)}</strong></div>
      <div class="health-section"><h4>${labels[0]}</h4><p>${esc(data.principle)}</p></div>
      <div class="health-section"><h4>${labels[1]}</h4><p>${esc(data.care)}</p></div>
      <div class="education-card-reminder health-warning"><h4>${labels[2]}</h4><p>${esc(data.warning)}</p></div>
    `;
    chatBox.appendChild(card);
    try { window.scrollAiChatToBottom && window.scrollAiChatToBottom(); } catch (e) {}
  };

  function sectionTitle(heading, lang) {
    if (lang === "zh") return heading;
    return (SECTION_I18N[heading] && SECTION_I18N[heading][lang]) || (SUBTOPIC_I18N[heading] && SUBTOPIC_I18N[heading][lang]) || heading;
  }

  function localizedEduParagraph(heading, lang) {
    const title = sectionTitle(heading, lang);
    if (lang === "en") {
      return `This section explains key safety and home-care points for ${title}. Observe symptoms carefully, follow recommended care steps, avoid risky folk remedies or delays, and seek professional medical help if warning signs appear or symptoms worsen.`;
    }
    if (lang === "ja") {
      return `この項目では、${title}に関する安全上の注意点と在宅ケアの要点を説明します。症状をよく観察し、推奨されるケア手順に従い、危険な民間療法や受診の遅れを避け、警告サインや悪化がある場合は専門医療者に相談してください。`;
    }
    return "";
  }

  window.showEduCategory = function unifiedShowEduCategory(categoryKey) {
    const lang = getUnifiedLang();
    const category = typeof eduCategories !== "undefined" ? eduCategories[categoryKey] : null;
    if (!category) return;

    const catText = (CATEGORY_I18N[categoryKey] && (CATEGORY_I18N[categoryKey][lang] || CATEGORY_I18N[categoryKey].zh)) || [category.title, category.subtitle];

    const titleEl = document.getElementById("edu-title");
    const subtitleEl = document.getElementById("edu-subtitle");
    const contentBox = document.getElementById("edu-content");
    if (!titleEl || !subtitleEl || !contentBox) return;

    titleEl.textContent = catText[0];
    subtitleEl.textContent = catText[1];

    contentBox.innerHTML = category.sections.map(section => {
      const h = sectionTitle(section.heading, lang);
      const p = lang === "zh" ? section.content : localizedEduParagraph(section.heading, lang);
      return `
        <div class="edu-section">
          <div class="edu-text-box">
            <h3>${esc(h)}</h3>
            <p>${esc(p)}</p>
          </div>
          <div class="edu-image-box">
            <img src="${esc(section.image)}" alt="${esc(h)}">
          </div>
        </div>
      `;
    }).join("");

    const buttons = {
      zh: ["🧠 我讀完了，去衛教闖關", "📚 回衛教主題"],
      en: ["🧠 I finished reading. Start the health quiz", "📚 Back to Health Topics"],
      ja: ["🧠 読み終わりました。健康教育クイズへ", "📚 健康教育テーマに戻る"]
    }[lang];

    contentBox.innerHTML += `
      <div class="edu-action-buttons">
        <button class="quiz-btn" onclick="showPage('quiz-menu-page')">${buttons[0]}</button>
        <button class="back-btn" onclick="showPage('edu-menu-page')">${buttons[1]}</button>
      </div>
    `;

    try { currentEduKey = categoryKey; } catch (e) {}
    try {
      if (typeof eduReadTimer !== "undefined" && eduReadTimer) clearTimeout(eduReadTimer);
      eduReadTimer = setTimeout(() => {
        try { addLearningProgressByCategory(currentEduKey); } catch (e) {}
      }, 600000);
    } catch (e) {}
    if (typeof window.showPage === "function") window.showPage("edu-page");
  };

  function extractQuizTopic(qText) {
    const text = String(qText || "");
    const quoted = text.match(/「([^」]+)」/);
    if (quoted) return quoted[1];
    const bracket = text.match(/【([^】]+)】/);
    if (bracket) return bracket[1].replace(/^\S+\s*/, "");
    return "";
  }

  function localizedQuizQuestion(q, lang) {
    if (lang === "zh") return q.q;
    const topic = sectionTitle(extractQuizTopic(q.q), lang) || subTopicText(extractQuizTopic(q.q), lang) || (lang === "en" ? "this topic" : "このテーマ");
    const text = String(q.q || "");
    if (lang === "en") {
      if (text.includes("較不建議") || text.includes("錯誤")) return `Regarding “${topic}”, which action is less recommended or unsafe?`;
      if (text.includes("原因") || text.includes("風險")) return `Regarding “${topic}”, which statement best explains the reason or risk?`;
      return `Regarding “${topic}”, which option is the most appropriate?`;
    }
    if (text.includes("較不建議") || text.includes("錯誤")) return `「${topic}」について、推奨されない、または安全でない対応はどれですか？`;
    if (text.includes("原因") || text.includes("風險")) return `「${topic}」について、理由やリスクを最もよく説明しているものはどれですか？`;
    return `「${topic}」について、最も適切な選択肢はどれですか？`;
  }

  function localizedQuizOptions(q, lang) {
    if (lang === "zh") return q.options || [];
    const answerIndex = Number(q.answer || 0);
    const en = [
      "Follow the recommended safe care steps and continue observing changes.",
      "Do not observe; just wait for symptoms to disappear.",
      "Use folk remedies first instead of health-education principles.",
      "Ignore later changes if there is no immediate discomfort."
    ];
    const ja = [
      "推奨される安全なケア手順に従い、変化を観察し続ける。",
      "観察せず、症状が自然に消えるのを待つ。",
      "健康教育の原則ではなく、民間療法を優先する。",
      "すぐに不快感がなければ、その後の変化を無視する。"
    ];
    let list = (lang === "en" ? en : ja).slice();
    // Put the safe answer at the original correct-answer index so scoring still works.
    const safe = list[0];
    list.splice(0, 1);
    list.splice(answerIndex, 0, safe);
    return list.slice(0, (q.options || []).length || 4);
  }

  window.loadQuestion = function unifiedLoadQuestion() {
    if (
      !currentQuizQuestions.length ||
      currentQuizSessionLevel !== currentLevel ||
      currentQuizSessionTopic !== getQuizTopicKey()
    ) {
      startNewQuizRound(currentLevel);
    }

    answered = false;
    const questionSet = getQuestionSet();
    const q = questionSet[quizIndex];
    if (!q) return;

    const lang = getUnifiedLang();
    const result = document.getElementById("answer-explanation");
    const question = document.getElementById("quiz-question");
    const options = document.getElementById("quiz-options");
    if (!result || !question || !options) return;

    result.innerHTML = "";
    result.classList.add("hidden");

    const qText = localizedQuizQuestion(q, lang);
    const optionTexts = localizedQuizOptions(q, lang);

    question.innerHTML = `<strong>${quizIndex + 1}. ${esc(qText)}</strong>`;
    options.innerHTML = optionTexts.map((opt, i) => `<button class="quiz-option" onclick="checkAnswer(${i})">${esc(opt)}</button>`).join("");
  };
  try { loadQuestion = window.loadQuestion; } catch (e) {}

  window.checkAnswer = function unifiedCheckAnswer(choice) {
    if (answered) return;
    answered = true;
    const questionSet = getQuestionSet();
    const q = questionSet[quizIndex];
    const lang = getUnifiedLang();
    const result = document.getElementById("answer-explanation");
    const optionButtons = document.querySelectorAll(".quiz-option");
    if (!result || !q) return;

    const isCorrect = choice === q.answer;
    if (isCorrect) quizScore++;

    optionButtons.forEach((btn, index) => {
      btn.disabled = true;
      if (index === choice && index === q.answer) btn.classList.add("selected-correct");
      else if (index === q.answer) btn.classList.add("correct-answer");
      else if (index === choice) btn.classList.add("selected-wrong");
    });

    const opts = localizedQuizOptions(q, lang);
    const labels = {
      zh: {
        right: "答對了 ✔", wrong: "答錯了 ✖", selected: "您的選擇：", reason: "原因：",
        correct: "正確答案：", correctReason: "這是較安全且符合衛教原則的作法。", wrongReason: "這個選項可能延誤觀察或增加風險。"
      },
      en: {
        right: "Correct ✔", wrong: "Incorrect ✖", selected: "Your choice:", reason: "Reason:",
        correct: "Correct answer:", correctReason: "This is the safer choice and follows health-education principles.", wrongReason: "This option may delay observation or increase risk."
      },
      ja: {
        right: "正解です ✔", wrong: "不正解です ✖", selected: "あなたの選択：", reason: "理由：",
        correct: "正解：", correctReason: "これはより安全で、健康教育の原則に沿った対応です。", wrongReason: "この選択肢は観察を遅らせたり、リスクを高めたりする可能性があります。"
      }
    }[lang];

    result.classList.remove("hidden");
    result.innerHTML = isCorrect ? `
      <div class="right-text">${labels.right}</div>
      <p><strong>${labels.selected}</strong> ✅ ${esc(opts[choice] || "")}</p>
      <p><strong>${labels.reason}</strong> ${labels.correctReason}</p>
    ` : `
      <div class="wrong-text">${labels.wrong}</div>
      <p><strong>${labels.selected}</strong> ❌ ${esc(opts[choice] || "")}<br>${labels.reason} ${labels.wrongReason}</p>
      <hr>
      <p><strong>${labels.correct}</strong> ✅ ${esc(opts[q.answer] || "")}<br>${labels.reason} ${labels.correctReason}</p>
    `;
    try { updateQuizProgress(); } catch (e) {}
  };
  try { checkAnswer = window.checkAnswer; } catch (e) {}

  window.nextQuestion = (function(oldNext) {
    return function unifiedNextQuestion() {
      if (!answered) return;
      quizIndex++;
      const questionSet = getQuestionSet();
      const result = document.getElementById("answer-explanation");
      const question = document.getElementById("quiz-question");
      const options = document.getElementById("quiz-options");
      if (!result || !question || !options) return;

      if (quizIndex >= questionSet.length) {
        const lang = getUnifiedLang();
        const done = {
          zh: [" 測驗完成！", `你的分數：${quizScore} / ${questionSet.length}`, "可以回到衛教主題選別的主題，或回難度頁再次挑戰。"],
          en: [" Quiz complete!", `Your score: ${quizScore} / ${questionSet.length}`, "You can return to health topics or try another difficulty."],
          ja: [" テスト完了！", `あなたの点数：${quizScore} / ${questionSet.length}`, "健康教育テーマに戻るか、別の難易度で再挑戦できます。"]
        }[lang];
        question.innerHTML = done[0];
        options.innerHTML = "";
        result.classList.remove("hidden");
        result.innerHTML = `<div class="right-text">${done[1]}</div><p>${done[2]}</p>`;
        try { updateQuizProgress(); } catch (e) {}
        return;
      }
      window.loadQuestion();
      try { updateQuizProgress(); } catch (e) {}
    };
  })(window.nextQuestion);
  try { nextQuestion = window.nextQuestion; } catch (e) {}

  function applyUnifiedI18n(reason) {
    if (applyingI18n || !document.body) return;
    applyingI18n = true;
    try {
      const lang = syncUnifiedLang(getUnifiedLang());
      updateTitle(lang);
      applyDataI18n(lang);
      updateLanguageButton(lang);
      applyPlaceholders(lang);

      const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
      const nodes = [];
      while (walker.nextNode()) nodes.push(walker.currentNode);
      nodes.forEach(node => translateTextNode(node, lang));

      // Dynamic areas are rebuilt by showPage/setLanguage wrappers to avoid mutation loops.
    } finally {
      applyingI18n = false;
    }
  }

  const previousSetLanguage = window.setLanguage;
  window.setLanguage = function unifiedSetLanguage(lang) {
    const next = syncUnifiedLang(lang);
    let result;
    if (typeof previousSetLanguage === "function" && previousSetLanguage !== window.setLanguage) {
      try { result = previousSetLanguage(next); } catch (e) {}
    } else {
      try { if (typeof applyLanguage === "function") applyLanguage(); } catch (e) {}
    }
    syncUnifiedLang(next);
    setTimeout(() => {
      applyUnifiedI18n("setLanguage");
      if (document.getElementById("ai-assistant-page") && !document.getElementById("ai-assistant-page").classList.contains("hidden")) {
        resetAiAssistantIntro(next);
        window.renderHotQuestions();
      }
      if (document.getElementById("quiz-page") && !document.getElementById("quiz-page").classList.contains("hidden")) {
        window.loadQuestion();
      }
    }, 60);
    return result;
  };
  try { setLanguage = window.setLanguage; } catch (e) {}

  const previousShowPage = window.showPage;
  if (typeof previousShowPage === "function") {
    window.showPage = function unifiedShowPage(pageId) {
      const result = previousShowPage.apply(this, arguments);
      setTimeout(() => {
        const lang = getUnifiedLang();
        if (pageId === "ai-assistant-page") {
          resetAiAssistantIntro(lang);
          window.renderHotQuestions();
        }
        if (pageId === "quiz-page") window.loadQuestion();
        applyUnifiedI18n("showPage");
      }, 80);
      return result;
    };
    try { showPage = window.showPage; } catch (e) {}
  }

  function startObserver() {
    if (!document.body || typeof MutationObserver === "undefined") return;
    const observer = new MutationObserver(() => {
      if (applyingI18n) return;
      clearTimeout(observerTimer);
      observerTimer = setTimeout(() => applyUnifiedI18n("mutation"), 120);
    });
    observer.observe(document.body, { childList: true, subtree: true });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", () => {
      syncUnifiedLang(getUnifiedLang());
      applyUnifiedI18n("domready");
      setTimeout(() => {
        window.renderHotQuestions && window.renderHotQuestions();
        startObserver();
      }, 200);
    });
  } else {
    syncUnifiedLang(getUnifiedLang());
    applyUnifiedI18n("late");
    setTimeout(() => {
      window.renderHotQuestions && window.renderHotQuestions();
      startObserver();
    }, 200);
  }

  window.__applyUnifiedI18n = applyUnifiedI18n;
})();



/* =========================================================
   FINAL V2 STABILITY PATCH
   修正：
   1. 危險健康數值彈窗只保留一組按鈕，避免 Call 119 / Cancel 重複出現。
   2. AI 健檢報告不再用整頁字串片段取代，改由健康資料重新產生完整中 / 英 / 日內容，
      避免出現 "Blood Pressure偏高"、"Pulse異常" 這類混語。
   ========================================================= */
(function finalV2StabilityPatch() {
  function getLangV2() {
    const raw = (
      window.currentLanguage ||
      window.currentLang ||
      localStorage.getItem("siteLanguage") ||
      localStorage.getItem("currentLanguage") ||
      localStorage.getItem("currentLang") ||
      localStorage.getItem("language") ||
      localStorage.getItem("lang") ||
      document.documentElement.lang ||
      "zh"
    ).toString().toLowerCase();

    if (raw.startsWith("en")) return "en";
    if (raw.startsWith("ja") || raw.includes("日")) return "ja";
    return "zh";
  }

  function escapeHTMLV2(value) {
    return String(value == null ? "" : value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  function addEmergencyStyleV2() {
    if (document.getElementById("final-v2-emergency-style")) return;

    const style = document.createElement("style");
    style.id = "final-v2-emergency-style";
    style.textContent = `
      #emergency-popup .popup-buttons,
      #emergency-popup .emergency-actions-fixed,
      #emergency-popup .emergency-actions-visible {
        display: none !important;
      }

      #emergency-popup .emergency-line-final-v2 {
        display: block;
        margin: 0.65rem 0;
        line-height: 1.65;
      }

      #emergency-popup .emergency-action-bar-final-v2 {
        display: flex !important;
        flex-wrap: wrap;
        justify-content: center;
        gap: 1rem;
        margin-top: 1.25rem;
      }

      #emergency-popup .emergency-action-bar-final-v2 button {
        min-width: 150px;
        border: none;
        border-radius: 18px;
        padding: 0.85rem 1.25rem;
        font-weight: 700;
        cursor: pointer;
        background: #8b7a68;
        color: #fff;
        box-shadow: 0 10px 24px rgba(91, 68, 48, 0.18);
      }
    `;
    document.head.appendChild(style);
  }

  const emergencyTextV2 = {
    zh: {
      title: " 危險健康數值",
      detected: " 偵測到危險健康數值！",
      sysHigh: "收縮壓過高，可能有高血壓危象風險。",
      diaHigh: "舒張壓過高，可能有急性心血管風險。",
      diaLow: "舒張壓過低，可能出現頭暈、無力或昏倒風險。",
      pulseFast: "脈搏過快，可能有心律異常風險。",
      pulseSlow: "脈搏過慢，可能有昏厥風險。",
      call: " 撥打 119",
      cancel: "取消"
    },
    en: {
      title: " Dangerous Health Values",
      detected: " Dangerous health values detected!",
      sysHigh: "Systolic blood pressure is too high. There may be a risk of hypertensive crisis.",
      diaHigh: "Diastolic blood pressure is too high. There may be an acute cardiovascular risk.",
      diaLow: "Diastolic blood pressure is too low. Dizziness, weakness, or fainting may occur.",
      pulseFast: "Pulse is too fast. There may be a risk of abnormal heart rhythm.",
      pulseSlow: "Pulse is too slow. There may be a risk of fainting.",
      call: " Call 119",
      cancel: "Cancel"
    },
    ja: {
      title: " 危険な健康数値",
      detected: " 危険な健康数値を検出しました！",
      sysHigh: "収縮期血圧が高すぎます。高血圧緊急症のリスクがあります。",
      diaHigh: "拡張期血圧が高すぎます。急性心血管リスクの可能性があります。",
      diaLow: "拡張期血圧が低すぎます。めまい、脱力感、失神のリスクがあります。",
      pulseFast: "脈拍が速すぎます。不整脈のリスクがあります。",
      pulseSlow: "脈拍が遅すぎます。失神のリスクがあります。",
      call: " 119に電話",
      cancel: "キャンセル"
    }
  };

  function warningKeyV2(line) {
    const text = String(line || "").trim();

    if (
      text.includes("偵測到危險健康數值") ||
      text.includes("Dangerous health values detected") ||
      text.includes("危険な健康数値")
    ) return "detected";

    if (
      text.includes("收縮壓過高") ||
      text.includes("Systolic blood pressure") ||
      text.includes("収縮期血圧")
    ) return "sysHigh";

    if (
      text.includes("舒張壓過高") ||
      text.includes("Diastolic blood pressure is too high") ||
      text.includes("拡張期血圧が高すぎ")
    ) return "diaHigh";

    if (
      text.includes("舒張壓過低") ||
      text.includes("Diastolic blood pressure is too low") ||
      text.includes("拡張期血圧が低すぎ")
    ) return "diaLow";

    if (
      text.includes("脈搏過快") ||
      text.includes("Pulse is too fast") ||
      text.includes("脈拍が速すぎ")
    ) return "pulseFast";

    if (
      text.includes("脈搏過慢") ||
      text.includes("Pulse is too slow") ||
      text.includes("脈拍が遅すぎ")
    ) return "pulseSlow";

    return "";
  }

  function translateEmergencyLineV2(line, lang) {
    const key = warningKeyV2(line);
    return key ? emergencyTextV2[lang][key] : String(line || "");
  }

  function hideOldEmergencyButtonsV2(popup) {
    if (!popup) return;
    popup.querySelectorAll(".popup-buttons, .emergency-actions-fixed, .emergency-actions-visible").forEach(el => {
      if (!el.classList.contains("emergency-action-bar-final-v2")) {
        el.style.setProperty("display", "none", "important");
        el.setAttribute("aria-hidden", "true");
      }
    });
  }

  function ensureEmergencyActionBarV2(popup, lang) {
    if (!popup) return;
    const t = emergencyTextV2[lang] || emergencyTextV2.zh;
    const content = popup.querySelector(".popup-content, .modal-content, .warning-content") || popup;

    let bar = content.querySelector(".emergency-action-bar-final-v2");
    if (!bar) {
      bar = document.createElement("div");
      bar.className = "emergency-action-bar-final-v2";
      content.appendChild(bar);
    }

    bar.innerHTML = `
      <button type="button" class="emergency-call-final-v2">${escapeHTMLV2(t.call)}</button>
      <button type="button" class="emergency-cancel-final-v2">${escapeHTMLV2(t.cancel)}</button>
    `;

    const callBtn = bar.querySelector(".emergency-call-final-v2");
    const cancelBtn = bar.querySelector(".emergency-cancel-final-v2");

    if (callBtn) {
      callBtn.onclick = function () {
        try { window.location.href = "tel:119"; } catch (e) {}
      };
    }

    if (cancelBtn) {
      cancelBtn.onclick = function () {
        popup.classList.add("hidden");
        popup.style.display = "none";
      };
    }

    hideOldEmergencyButtonsV2(popup);
  }

  window.closeEmergencyPopup = function closeEmergencyPopupFinalV2() {
    const popup = document.getElementById("emergency-popup");
    if (!popup) return;
    popup.classList.add("hidden");
    popup.style.display = "none";
  };

  window.emergencyCall119 = function emergencyCall119FinalV2() {
    try { window.location.href = "tel:119"; } catch (e) {}
  };

  if (typeof window.call119 !== "function") {
    window.call119 = window.emergencyCall119;
  }

  window.showEmergencyPopup = function showEmergencyPopupFinalV2(messages) {
    const lang = getLangV2();
    const t = emergencyTextV2[lang] || emergencyTextV2.zh;
    const popup = document.getElementById("emergency-popup");
    const box = document.getElementById("emergency-message");
    if (!popup || !box) return;

    addEmergencyStyleV2();

    const title = popup.querySelector("h3");
    if (title) title.textContent = t.title;

    const rawLines = Array.isArray(messages) && messages.length ? messages.filter(Boolean) : [t.detected];
    const lines = rawLines.map(line => translateEmergencyLineV2(line, lang));
    box.innerHTML = lines
      .map(line => `<span class="emergency-line-final-v2">${escapeHTMLV2(line)}</span>`)
      .join("");

    ensureEmergencyActionBarV2(popup, lang);

    popup.style.display = "flex";
    popup.classList.remove("hidden");

    setTimeout(() => {
      hideOldEmergencyButtonsV2(popup);
      ensureEmergencyActionBarV2(popup, getLangV2());
    }, 80);
  };

  const reportTextV2 = {
    zh: {
      title: " AI 健檢報告",
      subtitle: "依據今日輸入資料產生初步健康摘要",
      basic: "一、基本身體數據",
      cardio: "二、心血管指標",
      ai: "三、AI 初步判讀",
      advice: "四、衛教建議",
      labels: {
        height: "身高：",
        weight: "體重：",
        waist: "腰圍：",
        hip: "臀圍：",
        chest: "胸圍：",
        sbp: "收縮壓：",
        dbp: "舒張壓：",
        bp: "血壓：",
        pulse: "脈搏："
      },
      bpUnit: " mmHg（收縮壓 / 舒張壓）",
      tipTitle: "小提醒：",
      tip: "定期量測與記錄，有助於掌握身體變化，維持健康生活。",
      noDataSummary: "尚未產生報告",
      noDataAdvice: "請先完成每日紀錄。",
      normal: "目前整體健康狀態穩定，大部分數值位於正常範圍。建議持續保持規律作息、均衡飲食與適度運動。",
      follow: "目前部分健康數值需要持續追蹤，建議注意血壓、脈搏與生活壓力變化，並調整生活習慣。",
      risk: "目前健康風險較高，部分數值已明顯偏離正常範圍，建議儘早休息並尋求專業醫療協助。",
      noAdvice: "目前數值大致穩定，建議維持均衡飲食、規律運動與定期追蹤。",
      advBpHigh1: "⚠ 血壓偏高，建議固定時間量測並減少高鹽、高油食物。",
      advBpHigh2: "⚠ 建議避免熬夜、情緒壓力與過量咖啡因。",
      advBpHigh3: "⚠ 若持續偏高，建議至醫療院所進一步檢查。",
      advBpLow1: "⚠ 血壓偏低，可能出現頭暈、無力或疲倦。",
      advBpLow2: "⚠ 建議先休息並補充水分，避免突然站起。",
      advBpLow3: "⚠ 若持續不舒服或暈眩，建議盡快就醫。",
      advBpOk: " 血壓目前位於正常範圍，請持續維持良好生活習慣。",
      advBmiLow: "⚠ BMI 偏低，建議注意營養攝取。",
      advBmiHigh: "⚠ BMI 偏高，建議增加活動量並控制飲食。",
      advWaist: "⚠ 腰圍偏高，需注意腹部肥胖與慢性病風險。",
      advPulse: "⚠ 脈搏異常，建議休息後重新測量，必要時就醫。"
    },
    en: {
      title: " AI Health Report",
      subtitle: "Preliminary health summary based on today's data",
      basic: "1. Basic Body Data",
      cardio: "2. Cardiovascular Indicators",
      ai: "3. AI Preliminary Interpretation",
      advice: "4. Health Education Advice",
      labels: {
        height: "Height: ",
        weight: "Weight: ",
        waist: "Waist: ",
        hip: "Hip: ",
        chest: "Chest: ",
        sbp: "Systolic Pressure: ",
        dbp: "Diastolic Pressure: ",
        bp: "Blood Pressure: ",
        pulse: "Pulse: "
      },
      bpUnit: " mmHg (Systolic / Diastolic)",
      tipTitle: "Reminder: ",
      tip: "Regular measurement and records help you track body changes and maintain a healthy lifestyle.",
      noDataSummary: "No report generated yet",
      noDataAdvice: "Please complete the daily record first.",
      normal: "Your overall health status is stable, and most values are within the normal range. Keep a regular routine, balanced diet, and moderate exercise.",
      follow: "Some health values need continued follow-up. Please monitor blood pressure, pulse, lifestyle stress, and adjust daily habits.",
      risk: "Your health risk is currently higher. Some values are clearly outside the normal range. Please rest and seek professional medical help as soon as possible.",
      noAdvice: "Your values are generally stable. Maintain a balanced diet, regular exercise, and routine follow-up.",
      advBpHigh1: "⚠ Blood pressure is high. Measure it regularly and reduce salty or greasy foods.",
      advBpHigh2: "⚠ Avoid staying up late, emotional stress, and excessive caffeine.",
      advBpHigh3: "⚠ If it remains high, visit a medical facility for further evaluation.",
      advBpLow1: "⚠ Blood pressure is low. Dizziness, weakness, or fatigue may occur.",
      advBpLow2: "⚠ Rest and drink water first. Avoid standing up suddenly.",
      advBpLow3: "⚠ If discomfort or dizziness continues, seek medical care promptly.",
      advBpOk: " Blood pressure is currently within the normal range. Keep healthy daily habits.",
      advBmiLow: "⚠ BMI is low. Pay attention to nutritional intake.",
      advBmiHigh: "⚠ BMI is high. Increase activity and manage diet.",
      advWaist: "⚠ Waist circumference is high. Watch for abdominal obesity and chronic disease risk.",
      advPulse: "⚠ Pulse is abnormal. Rest and measure again. Seek medical care if needed."
    },
    ja: {
      title: " AI健康レポート",
      subtitle: "本日入力したデータに基づく初期健康サマリー",
      basic: "一、基本身体データ",
      cardio: "二、心血管指標",
      ai: "三、AI初期判定",
      advice: "四、健康教育アドバイス",
      labels: {
        height: "身長：",
        weight: "体重：",
        waist: "ウエスト：",
        hip: "ヒップ：",
        chest: "胸囲：",
        sbp: "収縮期血圧：",
        dbp: "拡張期血圧：",
        bp: "血圧：",
        pulse: "脈拍："
      },
      bpUnit: " mmHg（収縮期 / 拡張期）",
      tipTitle: "リマインダー：",
      tip: "定期的な測定と記録は身体の変化を把握し、健康的な生活を維持するのに役立ちます。",
      noDataSummary: "レポートはまだ作成されていません",
      noDataAdvice: "先に毎日の記録を完了してください。",
      normal: "現在の全体的な健康状態は安定しており、多くの数値は正常範囲内です。規則正しい生活、バランスのよい食事、適度な運動を続けましょう。",
      follow: "一部の健康数値は継続的な観察が必要です。血圧、脈拍、生活上のストレス変化に注意し、生活習慣を調整しましょう。",
      risk: "現在、健康リスクが高めです。一部の数値が正常範囲から大きく外れています。早めに休息し、専門の医療者に相談してください。",
      noAdvice: "現在の数値はおおむね安定しています。バランスのよい食事、規則的な運動、定期的な確認を続けましょう。",
      advBpHigh1: "⚠ 血圧が高めです。決まった時間に測定し、塩分や脂っこい食事を控えましょう。",
      advBpHigh2: "⚠ 夜更かし、精神的ストレス、過度なカフェインを避けましょう。",
      advBpHigh3: "⚠ 高い状態が続く場合は、医療機関で詳しい検査を受けましょう。",
      advBpLow1: "⚠ 血圧が低めです。めまい、脱力感、疲労感が出ることがあります。",
      advBpLow2: "⚠ まず休息し、水分を補給してください。急に立ち上がらないようにしましょう。",
      advBpLow3: "⚠ 不快感やめまいが続く場合は、早めに受診してください。",
      advBpOk: " 血圧は現在正常範囲です。良い生活習慣を続けましょう。",
      advBmiLow: "⚠ BMIが低めです。栄養摂取に注意しましょう。",
      advBmiHigh: "⚠ BMIが高めです。活動量を増やし、食事を調整しましょう。",
      advWaist: "⚠ ウエストが高めです。腹部肥満と慢性疾患リスクに注意しましょう。",
      advPulse: "⚠ 脈拍に異常があります。休んでから再測定し、必要時は受診してください。"
    }
  };

  function getHealthDataV2() {
    try {
      const raw = localStorage.getItem("healthData");
      return raw ? JSON.parse(raw) : null;
    } catch (e) {
      return null;
    }
  }

  function numericV2(value) {
    const n = Number(value);
    return Number.isFinite(n) ? n : 0;
  }

  function buildReportResultV2(data, lang) {
    const t = reportTextV2[lang] || reportTextV2.zh;
    let score = 100;
    const advice = [];

    const systolic = numericV2(data.systolic);
    const diastolic = numericV2(data.diastolic);
    const pulse = numericV2(data.pulse);
    const bmi = numericV2(data.bmi);
    const waist = numericV2(data.waist);

    if (systolic >= 140 || diastolic >= 90) {
      score -= 20;
      advice.push(t.advBpHigh1, t.advBpHigh2, t.advBpHigh3);
    } else if (systolic <= 90 || diastolic <= 60) {
      score -= 20;
      advice.push(t.advBpLow1, t.advBpLow2, t.advBpLow3);
    } else {
      advice.push(t.advBpOk);
    }

    if (bmi > 0 && bmi < 18.5) {
      score -= 10;
      advice.push(t.advBmiLow);
    } else if (bmi >= 24) {
      score -= 10;
      advice.push(t.advBmiHigh);
    }

    if (waist >= 90) {
      score -= 10;
      advice.push(t.advWaist);
    }

    if (pulse > 100 || (pulse > 0 && pulse < 50)) {
      score -= 10;
      advice.push(t.advPulse);
    }

    score = Math.max(0, score);
    return { score, advice: advice.length ? advice : [t.noAdvice] };
  }

  function setPreviousTextNodeV2(spanId, label) {
    const span = document.getElementById(spanId);
    if (!span || !span.parentNode) return;

    const parent = span.parentNode;
    const previous = span.previousSibling;

    if (previous && previous.nodeType === Node.TEXT_NODE) {
      previous.nodeValue = label;
    } else {
      parent.insertBefore(document.createTextNode(label), span);
    }
  }

  function setNextTextNodeV2(spanId, text) {
    const span = document.getElementById(spanId);
    if (!span || !span.parentNode) return;

    const next = span.nextSibling;
    if (next && next.nodeType === Node.TEXT_NODE) {
      next.nodeValue = text;
    } else {
      span.parentNode.insertBefore(document.createTextNode(text), span.nextSibling);
    }
  }

  function setReportStaticTextV2(lang) {
    const t = reportTextV2[lang] || reportTextV2.zh;
    const page = document.getElementById("report-page");
    if (!page) return;

    const h2 = page.querySelector("h2");
    if (h2) h2.textContent = t.title;

    const subtitle = page.querySelector(".report-card > p, .report-subtitle");
    if (subtitle) subtitle.textContent = t.subtitle;

    const headers = page.querySelectorAll(".report-section h3");
    if (headers[0]) headers[0].textContent = t.basic;
    if (headers[1]) headers[1].textContent = t.cardio;
    if (headers[2]) headers[2].textContent = t.ai;
    if (headers[3]) headers[3].textContent = t.advice;

    setPreviousTextNodeV2("report-height", t.labels.height);
    setPreviousTextNodeV2("report-weight", t.labels.weight);
    setPreviousTextNodeV2("report-waist", t.labels.waist);
    setPreviousTextNodeV2("report-hip", t.labels.hip);
    setPreviousTextNodeV2("report-chest", t.labels.chest);
    setPreviousTextNodeV2("report-sbp", t.labels.sbp);
    setPreviousTextNodeV2("report-dbp", t.labels.dbp);
    setPreviousTextNodeV2("report-bp", t.labels.bp);
    setPreviousTextNodeV2("report-pulse", t.labels.pulse);
    setNextTextNodeV2("report-bp", t.bpUnit);

    const tipIcon = page.querySelector(".trend-tip .tip-icon");
    if (tipIcon) tipIcon.textContent = t.tipTitle;

    const tipText = page.querySelector(".trend-tip .tip-icon + span");
    if (tipText) tipText.textContent = t.tip;
  }

  function renderAIReportFinalV2() {
    const page = document.getElementById("report-page");
    if (!page) return;

    const lang = getLangV2();
    const t = reportTextV2[lang] || reportTextV2.zh;
    const data = getHealthDataV2();

    setReportStaticTextV2(lang);

    const summary = document.getElementById("report-summary");
    const advice = document.getElementById("report-advice");

    if (!data) {
      if (summary) summary.textContent = t.noDataSummary;
      if (advice) advice.innerHTML = `<li>${escapeHTMLV2(t.noDataAdvice)}</li>`;
      return;
    }

    const result = buildReportResultV2(data, lang);

    if (summary) {
      summary.textContent =
        result.score >= 80 ? t.normal :
        result.score >= 60 ? t.follow :
        t.risk;
    }

    if (advice) {
      advice.innerHTML = result.advice
        .map(item => `<li>${escapeHTMLV2(item)}</li>`)
        .join("");
    }
  }

  window.refreshAIReportFinalV2 = renderAIReportFinalV2;

  const previousAnalyzeV2 = window.analyze || (typeof analyze === "function" ? analyze : null);
  window.analyze = function analyzeFinalV2Wrapper() {
    const result = typeof previousAnalyzeV2 === "function"
      ? previousAnalyzeV2.apply(this, arguments)
      : undefined;

    setTimeout(renderAIReportFinalV2, 120);
    setTimeout(renderAIReportFinalV2, 420);
    setTimeout(renderAIReportFinalV2, 900);
    return result;
  };

  try { analyze = window.analyze; } catch (e) {}

  const previousShowChartsV2 = window.showCharts || (typeof showCharts === "function" ? showCharts : null);
  window.showCharts = function showChartsFinalV2Wrapper() {
    const result = typeof previousShowChartsV2 === "function"
      ? previousShowChartsV2.apply(this, arguments)
      : undefined;

    setTimeout(renderAIReportFinalV2, 120);
    setTimeout(renderAIReportFinalV2, 420);
    return result;
  };

  try { showCharts = window.showCharts; } catch (e) {}

  const previousShowPageV2 = window.showPage || (typeof showPage === "function" ? showPage : null);
  if (typeof previousShowPageV2 === "function") {
    window.showPage = function showPageFinalV2Wrapper(pageId) {
      const result = previousShowPageV2.apply(this, arguments);

      if (pageId === "report-page") {
        setTimeout(renderAIReportFinalV2, 120);
        setTimeout(renderAIReportFinalV2, 420);
      }

      if (pageId === "home-page") {
        const popup = document.getElementById("emergency-popup");
        if (popup) hideOldEmergencyButtonsV2(popup);
      }

      return result;
    };

    try { showPage = window.showPage; } catch (e) {}
  }

  const previousSetLanguageV2 = window.setLanguage || (typeof setLanguage === "function" ? setLanguage : null);
  if (typeof previousSetLanguageV2 === "function") {
    window.setLanguage = function setLanguageFinalV2Wrapper(lang) {
      const result = previousSetLanguageV2.apply(this, arguments);

      setTimeout(renderAIReportFinalV2, 180);
      setTimeout(() => {
        const popup = document.getElementById("emergency-popup");
        if (popup && !popup.classList.contains("hidden")) {
          const currentLang = getLangV2();
          const box = document.getElementById("emergency-message");
          if (box) {
            const lines = Array.from(box.querySelectorAll(".emergency-line-final-v2"))
              .map(el => el.textContent || "")
              .filter(Boolean);
            window.showEmergencyPopup(lines.length ? lines : undefined);
          }
          ensureEmergencyActionBarV2(popup, currentLang);
        }
      }, 220);

      return result;
    };

    try { setLanguage = window.setLanguage; } catch (e) {}
  }

  function maintainEmergencyPopupV2() {
    addEmergencyStyleV2();
    const popup = document.getElementById("emergency-popup");
    if (!popup) return;
    hideOldEmergencyButtonsV2(popup);
    if (!popup.classList.contains("hidden") && popup.style.display !== "none") {
      ensureEmergencyActionBarV2(popup, getLangV2());
    }
  }

  document.addEventListener("DOMContentLoaded", function () {
    addEmergencyStyleV2();
    setTimeout(renderAIReportFinalV2, 250);
    setTimeout(maintainEmergencyPopupV2, 250);

    try {
      const observer = new MutationObserver(function () {
        setTimeout(maintainEmergencyPopupV2, 20);
      });
      observer.observe(document.body, { childList: true, subtree: true });
    } catch (e) {}
  });
})();


/* =========================================================
   FINAL V3 POPUP CANCEL PATCH
   修正：
   1. 危險健康數值彈窗下方若同時存在一般訊息彈窗，按取消會看起來像沒有關閉。
      這版在顯示緊急彈窗時會先隱藏一般訊息彈窗。
   2. 使用事件捕獲綁定取消按鈕，避免舊 onclick 或後續翻譯重繪造成按鈕失效。
   3. ESC 鍵也可關閉危險健康數值彈窗。
   ========================================================= */
(function finalV3EmergencyCancelPatch() {
  function getEmergencyPopupV3() {
    return document.getElementById("emergency-popup") ||
      document.querySelector(".emergency-popup, .danger-popup, .warning-popup");
  }

  function softHideMessagePopupV3() {
    const msgPopup = document.getElementById("message-popup");
    if (!msgPopup) return;
    msgPopup.classList.add("hidden");
    msgPopup.setAttribute("aria-hidden", "true");
  }

  function hardHideEmergencyPopupV3() {
    const popup = getEmergencyPopupV3();
    if (!popup) return;

    popup.classList.add("hidden");
    popup.setAttribute("aria-hidden", "true");
    popup.style.setProperty("display", "none", "important");
  }

  function closeEmergencyPopupV3(event) {
    if (event) {
      event.preventDefault();
      event.stopPropagation();
      if (typeof event.stopImmediatePropagation === "function") {
        event.stopImmediatePropagation();
      }
    }

    hardHideEmergencyPopupV3();
    softHideMessagePopupV3();
    window.__emergencyPopupOpenV3 = false;
    window.__emergencyPopupDismissedV3 = true;
  }

  function isCancelButtonV3(el) {
    if (!el) return false;

    const text = (el.textContent || "").trim().toLowerCase();
    const onclick = (el.getAttribute && el.getAttribute("onclick") || "").toLowerCase();

    return (
      el.classList.contains("emergency-cancel-final-v2") ||
      el.classList.contains("emergency-cancel-btn-fixed") ||
      el.classList.contains("emergency-cancel-final-v3") ||
      onclick.includes("closeemergencypopup") ||
      text === "cancel" ||
      text === "取消" ||
      text === "キャンセル" ||
      text === "關閉" ||
      text === "关闭"
    );
  }

  function bindCancelButtonsV3() {
    const popup = getEmergencyPopupV3();
    if (!popup) return;

    popup.querySelectorAll("button, [role='button']").forEach(function (btn) {
      if (!isCancelButtonV3(btn)) return;

      btn.classList.add("emergency-cancel-final-v3");
      btn.onclick = closeEmergencyPopupV3;

      if (!btn.dataset.v3CancelBound) {
        btn.addEventListener("click", closeEmergencyPopupV3, true);
        btn.dataset.v3CancelBound = "1";
      }
    });
  }

  function prepareEmergencyPopupV3() {
    const popup = getEmergencyPopupV3();
    if (!popup) return;

    popup.style.removeProperty("display");
    popup.removeAttribute("aria-hidden");
    softHideMessagePopupV3();

    setTimeout(bindCancelButtonsV3, 0);
    setTimeout(bindCancelButtonsV3, 80);
    setTimeout(bindCancelButtonsV3, 250);
  }

  window.closeEmergencyPopup = closeEmergencyPopupV3;
  window.hideEmergencyPopup = closeEmergencyPopupV3;

  const previousShowEmergencyPopupV3 =
    window.showEmergencyPopup ||
    (typeof showEmergencyPopup === "function" ? showEmergencyPopup : null);

  if (typeof previousShowEmergencyPopupV3 === "function") {
    window.showEmergencyPopup = function showEmergencyPopupFinalV3(messages) {
      window.__emergencyPopupDismissedV3 = false;
      window.__emergencyPopupOpenV3 = true;

      softHideMessagePopupV3();

      const result = previousShowEmergencyPopupV3.apply(this, arguments);

      const popup = getEmergencyPopupV3();
      if (popup) {
        popup.classList.remove("hidden");
        popup.removeAttribute("aria-hidden");
        popup.style.setProperty("display", "flex");
      }

      prepareEmergencyPopupV3();
      return result;
    };

    try { showEmergencyPopup = window.showEmergencyPopup; } catch (e) {}
  }

  document.addEventListener("click", function (event) {
    const popup = getEmergencyPopupV3();
    if (!popup || popup.classList.contains("hidden")) return;

    const target = event.target && event.target.closest
      ? event.target.closest("#emergency-popup button, #emergency-popup [role='button']")
      : null;

    if (target && isCancelButtonV3(target)) {
      closeEmergencyPopupV3(event);
    }
  }, true);

  document.addEventListener("keydown", function (event) {
    if (event.key === "Escape") {
      const popup = getEmergencyPopupV3();
      if (popup && !popup.classList.contains("hidden")) {
        closeEmergencyPopupV3(event);
      }
    }
  }, true);

  document.addEventListener("DOMContentLoaded", function () {
    const style = document.createElement("style");
    style.id = "final-v3-emergency-cancel-style";
    style.textContent = `
      #emergency-popup.hidden,
      .emergency-popup.hidden {
        display: none !important;
        pointer-events: none !important;
      }

      #message-popup.hidden {
        display: none !important;
        pointer-events: none !important;
      }

      #emergency-popup .emergency-cancel-final-v3 {
        cursor: pointer !important;
        pointer-events: auto !important;
      }
    `;
    if (!document.getElementById(style.id)) {
      document.head.appendChild(style);
    }

    bindCancelButtonsV3();
  });
})();


/* =========================================================
   CHECKED FINAL PATCH
   目的：
   1. 重新統一緊急健康數值彈窗，只保留一組 119 / 取消按鈕。
   2. 取消按鈕強制關閉 emergency-popup 與下層 message-popup，避免看起來取消不了。
   3. 顯示彈窗時依目前語言輸出完整中文 / 英文 / 日文，不做片段翻譯。
   4. 以最後載入的函式覆蓋前面多段 patch，避免舊邏輯互相干擾。
   ========================================================= */
(function checkedFinalEmergencyPopupPatch() {
  function lang() {
    const raw = String(
      window.currentLanguage ||
      window.currentLang ||
      localStorage.getItem("siteLanguage") ||
      localStorage.getItem("currentLanguage") ||
      localStorage.getItem("currentLang") ||
      localStorage.getItem("language") ||
      localStorage.getItem("lang") ||
      document.documentElement.lang ||
      "zh"
    ).toLowerCase();

    if (raw.startsWith("en")) return "en";
    if (raw.startsWith("ja") || raw.includes("jp") || raw.includes("日")) return "ja";
    return "zh";
  }

  function esc(value) {
    return String(value == null ? "" : value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  const text = {
    zh: {
      title: " 危險健康數值",
      detected: " 偵測到危險健康數值！",
      sysHigh: "收縮壓過高，可能有高血壓危象風險。",
      diaHigh: "舒張壓過高，可能有急性心血管風險。",
      diaLow: "舒張壓過低，可能出現頭暈、無力或昏倒風險。",
      pulseFast: "脈搏過快，可能有心律異常風險。",
      pulseSlow: "脈搏過慢，可能有昏厥風險。",
      call: " 撥打 119",
      cancel: "取消"
    },
    en: {
      title: " Dangerous Health Values",
      detected: "Dangerous health values detected!",
      sysHigh: "Systolic blood pressure is too high. There may be a risk of hypertensive crisis.",
      diaHigh: "Diastolic blood pressure is too high. There may be an acute cardiovascular risk.",
      diaLow: "Diastolic blood pressure is too low. Dizziness, weakness, or fainting may occur.",
      pulseFast: "Pulse is too fast. There may be a risk of abnormal heart rhythm.",
      pulseSlow: "Pulse is too slow. There may be a risk of fainting.",
      call: " Call 119",
      cancel: "Cancel"
    },
    ja: {
      title: " 危険な健康数値",
      detected: " 危険な健康数値を検出しました！",
      sysHigh: "収縮期血圧が高すぎます。高血圧緊急症のリスクがあります。",
      diaHigh: "拡張期血圧が高すぎます。急性心血管リスクの可能性があります。",
      diaLow: "拡張期血圧が低すぎます。めまい、脱力感、失神のリスクがあります。",
      pulseFast: "脈拍が速すぎます。不整脈のリスクがあります。",
      pulseSlow: "脈拍が遅すぎます。失神のリスクがあります。",
      call: " 119に電話",
      cancel: "キャンセル"
    }
  };

  function lineKey(value) {
    const s = String(value || "");
    if (
      s.includes("偵測到危險健康數值") ||
      s.includes("Dangerous health values detected") ||
      s.includes("危険な健康数値")
    ) return "detected";

    if (
      s.includes("收縮壓過高") ||
      s.includes("收縮壓") && s.includes("過高") ||
      s.includes("Systolic blood pressure") ||
      s.includes("収縮期血圧")
    ) return "sysHigh";

    if (
      s.includes("舒張壓過高") ||
      s.includes("舒張壓") && s.includes("過高") ||
      s.includes("Diastolic blood pressure is too high") ||
      s.includes("拡張期血圧が高すぎ")
    ) return "diaHigh";

    if (
      s.includes("舒張壓過低") ||
      s.includes("舒張壓") && s.includes("過低") ||
      s.includes("Diastolic blood pressure is too low") ||
      s.includes("拡張期血圧が低すぎ")
    ) return "diaLow";

    if (
      s.includes("脈搏過快") ||
      s.includes("脈搏") && s.includes("過快") ||
      s.includes("Pulse is too fast") ||
      s.includes("脈拍が速すぎ")
    ) return "pulseFast";

    if (
      s.includes("脈搏過慢") ||
      s.includes("脈搏") && s.includes("過慢") ||
      s.includes("Pulse is too slow") ||
      s.includes("脈拍が遅すぎ")
    ) return "pulseSlow";

    return "";
  }

  function hidePopup(el) {
    if (!el) return;
    el.classList.add("hidden");
    el.setAttribute("aria-hidden", "true");
    el.style.setProperty("display", "none", "important");
    el.style.setProperty("pointer-events", "none", "important");
  }

  function closeEmergencyPopupChecked(event) {
    if (event) {
      event.preventDefault();
      event.stopPropagation();
      if (typeof event.stopImmediatePropagation === "function") {
        event.stopImmediatePropagation();
      }
    }

    hidePopup(document.getElementById("emergency-popup"));
    hidePopup(document.getElementById("message-popup"));
    window.__emergencyPopupDismissed = true;
    window.__emergencyPopupOpen = false;
  }

  function ensureCheckedStyle() {
    if (document.getElementById("checked-final-emergency-style")) return;

    const style = document.createElement("style");
    style.id = "checked-final-emergency-style";
    style.textContent = `
      #emergency-popup.hidden,
      #message-popup.hidden {
        display: none !important;
        pointer-events: none !important;
      }

      #emergency-popup {
        pointer-events: auto !important;
      }

      #emergency-popup .popup-buttons,
      #emergency-popup .emergency-actions-fixed,
      #emergency-popup .emergency-actions-visible,
      #emergency-popup .translated-emergency-actions,
      #emergency-popup .emergency-action-bar-final-v2 {
        display: none !important;
        visibility: hidden !important;
        pointer-events: none !important;
      }

      #emergency-popup .checked-final-emergency-actions {
        display: flex !important;
        visibility: visible !important;
        pointer-events: auto !important;
        justify-content: center !important;
        align-items: center !important;
        gap: 20px !important;
        margin-top: 24px !important;
        flex-wrap: wrap !important;
        position: relative !important;
        z-index: 1000002 !important;
      }

      #emergency-popup .checked-final-emergency-actions button {
        display: inline-flex !important;
        align-items: center !important;
        justify-content: center !important;
        min-width: 150px !important;
        min-height: 52px !important;
        padding: 12px 24px !important;
        border-radius: 18px !important;
        border: none !important;
        background: #8a7663 !important;
        color: #fff !important;
        font-weight: 700 !important;
        font-size: 16px !important;
        cursor: pointer !important;
        pointer-events: auto !important;
        box-shadow: 0 10px 24px rgba(91, 68, 48, 0.18) !important;
      }
    `;
    document.head.appendChild(style);
  }

  function showEmergencyPopupChecked(messages) {
    ensureCheckedStyle();

    const currentLang = lang();
    const t = text[currentLang] || text.zh;
    const popup = document.getElementById("emergency-popup");
    const box = document.getElementById("emergency-message");
    if (!popup || !box) return;

    hidePopup(document.getElementById("message-popup"));

    const title = popup.querySelector("h3, h2, .emergency-title");
    if (title) title.textContent = t.title;

    const incoming = Array.isArray(messages) ? messages.filter(Boolean) : [];
    const keys = [];
    incoming.forEach(function (item) {
      const k = lineKey(item);
      if (k && !keys.includes(k)) keys.push(k);
    });

    if (!keys.includes("detected")) keys.unshift("detected");
    if (keys.length === 1 && keys[0] === "detected" && incoming.length) {
      incoming.forEach(function (item) {
        const k = lineKey(item);
        if (k && !keys.includes(k)) keys.push(k);
      });
    }

    const lines = keys
      .map(function (k) { return t[k]; })
      .filter(Boolean);

    box.innerHTML = lines
      .map(function (line) {
        return '<p class="checked-final-emergency-line">' + esc(line) + '</p>';
      })
      .join("");

    const content = popup.querySelector(".popup-content, .modal-content, .warning-content") || popup;
    content.querySelectorAll(".checked-final-emergency-actions").forEach(function (old) {
      old.remove();
    });

    const actions = document.createElement("div");
    actions.className = "checked-final-emergency-actions";
    actions.innerHTML =
      '<button type="button" class="checked-final-call-119">' + esc(t.call) + '</button>' +
      '<button type="button" class="checked-final-cancel-emergency">' + esc(t.cancel) + '</button>';
    content.appendChild(actions);

    const callBtn = actions.querySelector(".checked-final-call-119");
    const cancelBtn = actions.querySelector(".checked-final-cancel-emergency");

    if (callBtn) {
      callBtn.onclick = function (event) {
        if (event) event.preventDefault();
        try { window.location.href = "tel:119"; } catch (e) {}
      };
    }

    if (cancelBtn) {
      cancelBtn.onclick = closeEmergencyPopupChecked;
      cancelBtn.addEventListener("click", closeEmergencyPopupChecked, true);
    }

    popup.classList.remove("hidden");
    popup.removeAttribute("aria-hidden");
    popup.style.setProperty("display", "flex", "important");
    popup.style.setProperty("pointer-events", "auto", "important");

    window.__emergencyPopupDismissed = false;
    window.__emergencyPopupOpen = true;
  }

  window.showEmergencyPopup = showEmergencyPopupChecked;
  window.closeEmergencyPopup = closeEmergencyPopupChecked;
  window.hideEmergencyPopup = closeEmergencyPopupChecked;

  try { showEmergencyPopup = window.showEmergencyPopup; } catch (e) {}
  try { closeEmergencyPopup = window.closeEmergencyPopup; } catch (e) {}

  document.addEventListener("click", function (event) {
    const popup = document.getElementById("emergency-popup");
    if (!popup || popup.classList.contains("hidden")) return;

    const target = event.target && event.target.closest
      ? event.target.closest("#emergency-popup button, #emergency-popup [role='button']")
      : null;

    if (!target) return;

    const isCancel =
      target.classList.contains("checked-final-cancel-emergency") ||
      (target.textContent || "").trim() === "取消" ||
      (target.textContent || "").trim().toLowerCase() === "cancel" ||
      (target.textContent || "").trim() === "キャンセル";

    if (isCancel) closeEmergencyPopupChecked(event);
  }, true);

  document.addEventListener("keydown", function (event) {
    if (event.key === "Escape") {
      const popup = document.getElementById("emergency-popup");
      if (popup && !popup.classList.contains("hidden")) {
        closeEmergencyPopupChecked(event);
      }
    }
  }, true);

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", ensureCheckedStyle);
  } else {
    ensureCheckedStyle();
  }
})();

/* ===== Final verified fixes: quiz result UX, emergency restore, translated 119 confirm, disable auto-translate ===== */
(function () {
  function appLang() {
    return (
      window.currentLanguage ||
      window.currentLang ||
      localStorage.getItem("siteLanguage") ||
      localStorage.getItem("currentLang") ||
      localStorage.getItem("lang") ||
      "zh"
    ).toLowerCase().startsWith("ja") ? "ja" : (
      ((window.currentLanguage || window.currentLang || localStorage.getItem("siteLanguage") || localStorage.getItem("currentLang") || localStorage.getItem("lang") || "zh").toLowerCase().startsWith("en")) ? "en" : "zh"
    );
  }

  const finalText = {
    zh: {
      dialTitle: " 緊急撥號確認",
      dialBody: "你即將撥打 119。若目前有胸痛、呼吸困難、意識不清、昏倒、抽搐或其他急重症狀，請立即求助。",
      dialCall: " 立即撥打 119",
      dialCancel: "取消",
      quizDoneTitle: " 測驗完成！",
      quizDoneBody: "你可以回到衛教主題頁，或再次挑戰同一個難度。",
      quizScoreLabel: "本次得分",
      quizReturn: "回闖關頁面",
      quizRetry: "再挑戰一次"
    },
    en: {
      dialTitle: " Emergency Call Confirmation",
      dialBody: "You are about to call 119. If there is chest pain, breathing difficulty, loss of consciousness, fainting, seizures, or any other emergency symptoms, please seek help immediately.",
      dialCall: " Call 119 now",
      dialCancel: "Cancel",
      quizDoneTitle: " Quiz complete!",
      quizDoneBody: "You can return to the health-topic page or try the same difficulty again.",
      quizScoreLabel: "Your score",
      quizReturn: "Go back to quiz page",
      quizRetry: "Try again"
    },
    ja: {
      dialTitle: " 緊急通報の確認",
      dialBody: "これから119に電話します。胸痛、呼吸困難、意識障害、失神、けいれんなどの緊急症状がある場合は、すぐに助けを求めてください。",
      dialCall: " 119に電話",
      dialCancel: "キャンセル",
      quizDoneTitle: " テスト完了！",
      quizDoneBody: "健康教育テーマのページに戻るか、同じ難易度でもう一度挑戦できます。",
      quizScoreLabel: "今回の点数",
      quizReturn: "クイズページに戻る",
      quizRetry: "もう一度挑戦"
    }
  };

  function t(key) {
    const lang = appLang();
    return (finalText[lang] && finalText[lang][key]) || finalText.zh[key] || "";
  }

  function escapeHtmlSafe(value) {
    return String(value == null ? "" : value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  function ensureNoTranslate() {
    try {
      document.documentElement.setAttribute("translate", "no");
      document.documentElement.classList.add("notranslate");
      if (document.body) {
        document.body.setAttribute("translate", "no");
        document.body.classList.add("notranslate");
        document.body.style.top = "0px";
      }
      document.querySelectorAll(".goog-te-banner-frame, .goog-te-gadget, .goog-tooltip, #goog-gt-tt, iframe.skiptranslate, iframe[src*='translate'], .VIpgJd-ZVi9od-ORHb-OEVmcd").forEach(function (el) {
        el.remove();
      });
    } catch (e) {}
  }

  function ensureCallConfirmModal() {
    let overlay = document.getElementById("call-confirm-overlay");
    if (overlay) return overlay;
    overlay = document.createElement("div");
    overlay.id = "call-confirm-overlay";
    overlay.className = "call-confirm-overlay";
    overlay.innerHTML = [
      '<div class="call-confirm-box" role="dialog" aria-modal="true" aria-labelledby="call-confirm-title">',
      '  <h3 id="call-confirm-title"></h3>',
      '  <p id="call-confirm-text"></p>',
      '  <div class="call-confirm-actions">',
      '    <button type="button" class="call-confirm-call"></button>',
      '    <button type="button" class="call-confirm-cancel"></button>',
      '  </div>',
      '</div>'
    ].join("");
    document.body.appendChild(overlay);

    const cancelBtn = overlay.querySelector(".call-confirm-cancel");
    const callBtn = overlay.querySelector(".call-confirm-call");
    const closeModal = function () {
      overlay.classList.remove("is-open");
      overlay.style.display = "none";
    };
    cancelBtn.addEventListener("click", closeModal);
    overlay.addEventListener("click", function (event) {
      if (event.target === overlay) closeModal();
    });
    callBtn.addEventListener("click", function () {
      closeModal();
      try {
        const a = document.createElement("a");
        a.href = "tel:119";
        a.style.display = "none";
        document.body.appendChild(a);
        a.click();
        a.remove();
      } catch (e) {
        try { window.location.href = "tel:119"; } catch (err) {}
      }
    });

    document.addEventListener("keydown", function (event) {
      if (event.key === "Escape" && overlay.classList.contains("is-open")) {
        closeModal();
      }
    });
    return overlay;
  }

  function openCallConfirmModal() {
    const overlay = ensureCallConfirmModal();
    overlay.querySelector("#call-confirm-title").textContent = t("dialTitle");
    overlay.querySelector("#call-confirm-text").textContent = t("dialBody");
    overlay.querySelector(".call-confirm-call").textContent = t("dialCall");
    overlay.querySelector(".call-confirm-cancel").textContent = t("dialCancel");
    overlay.style.display = "flex";
    overlay.classList.add("is-open");
  }

  window.call119 = openCallConfirmModal;
  window.emergencyCall119 = openCallConfirmModal;
  try { call119 = window.call119; } catch (e) {}
  try { emergencyCall119 = window.emergencyCall119; } catch (e) {}

  function setPopupVisible(el, visible) {
    if (!el) return;
    if (visible) {
      el.classList.remove("hidden");
      el.removeAttribute("aria-hidden");
      el.style.setProperty("display", "flex", "important");
      el.style.setProperty("pointer-events", "auto", "important");
    } else {
      el.classList.add("hidden");
      el.setAttribute("aria-hidden", "true");
      el.style.setProperty("display", "none", "important");
      el.style.setProperty("pointer-events", "none", "important");
    }
  }

  function captureMessagePopup() {
    const popup = document.getElementById("message-popup");
    const message = document.getElementById("popup-message");
    window.__messagePopupState = {
      hasContent: !!(message && String(message.innerHTML || "").trim()),
      html: message ? message.innerHTML : "",
      visible: !!(popup && !popup.classList.contains("hidden") && popup.style.display !== "none")
    };
  }

  function restoreMessagePopup() {
    const popup = document.getElementById("message-popup");
    const message = document.getElementById("popup-message");
    const state = window.__messagePopupState;
    if (!popup || !message || !state || !state.hasContent) return;
    message.innerHTML = state.html;
    setPopupVisible(popup, true);
  }

  const emergencyText = {
    zh: {
      title: " 危險健康數值",
      detected: " 偵測到危險健康數值！",
      sysHigh: "收縮壓過高，可能有高血壓危象風險。",
      diaHigh: "舒張壓過高，可能有急性心血管風險。",
      diaLow: "舒張壓過低，可能出現頭暈、無力或昏倒風險。",
      pulseFast: "脈搏過快，可能有心律異常風險。",
      pulseSlow: "脈搏過慢，可能有昏厥風險。",
      call: " 撥打 119",
      cancel: "取消"
    },
    en: {
      title: " Dangerous Health Values",
      detected: " Dangerous health values detected!",
      sysHigh: "Systolic blood pressure is too high. There may be a risk of hypertensive crisis.",
      diaHigh: "Diastolic blood pressure is too high. There may be an acute cardiovascular risk.",
      diaLow: "Diastolic blood pressure is too low. There may be a risk of dizziness, weakness, or fainting.",
      pulseFast: "Pulse is too fast. There may be a risk of arrhythmia.",
      pulseSlow: "Pulse is too slow. There may be a risk of fainting.",
      call: " Call 119",
      cancel: "Cancel"
    },
    ja: {
      title: " 危険な健康数値",
      detected: " 危険な健康数値を検出しました！",
      sysHigh: "収縮期血圧が高すぎます。高血圧緊急症のリスクがあります。",
      diaHigh: "拡張期血圧が高すぎます。急性心血管リスクの可能性があります。",
      diaLow: "拡張期血圧が低すぎます。めまい・脱力感・失神のリスクがあります。",
      pulseFast: "脈拍が速すぎます。不整脈のリスクがあります。",
      pulseSlow: "脈拍が遅すぎます。失神のリスクがあります。",
      call: " 119に電話",
      cancel: "キャンセル"
    }
  };

  function detectEmergencyKey(textLine) {
    const s = String(textLine || "");
    if (/偵測到危險健康數值|Dangerous health values detected|危険な健康数値を検出/.test(s)) return "detected";
    if (/收縮壓.*過高|Systolic blood pressure is too high|収縮期血圧が高すぎ/.test(s)) return "sysHigh";
    if (/舒張壓.*過高|Diastolic blood pressure is too high|拡張期血圧が高すぎ/.test(s)) return "diaHigh";
    if (/舒張壓.*過低|Diastolic blood pressure is too low|拡張期血圧が低すぎ/.test(s)) return "diaLow";
    if (/脈搏.*過快|Pulse is too fast|脈拍が速すぎ/.test(s)) return "pulseFast";
    if (/脈搏.*過慢|Pulse is too slow|脈拍が遅すぎ/.test(s)) return "pulseSlow";
    return "";
  }

  window.showEmergencyPopup = function (messages) {
    ensureNoTranslate();
    captureMessagePopup();
    const popup = document.getElementById("emergency-popup");
    const box = document.getElementById("emergency-message");
    if (!popup || !box) return;

    const lang = appLang();
    const bundle = emergencyText[lang] || emergencyText.zh;
    const title = popup.querySelector("h3, h2, .emergency-title");
    if (title) title.textContent = bundle.title;

    const lines = [];
    const incoming = Array.isArray(messages) ? messages.filter(Boolean) : [];
    const keys = [];
    incoming.forEach(function (line) {
      const key = detectEmergencyKey(line);
      if (key && !keys.includes(key)) keys.push(key);
    });
    if (!keys.includes("detected")) keys.unshift("detected");
    keys.forEach(function (key) {
      if (bundle[key]) lines.push(bundle[key]);
    });

    box.innerHTML = lines.map(function (line) {
      return '<p class="checked-final-emergency-line">' + escapeHtmlSafe(line) + '</p>';
    }).join("");

    const content = popup.querySelector(".popup-content") || popup;
    content.querySelectorAll(".checked-final-emergency-actions").forEach(function (node) { node.remove(); });
    const actions = document.createElement("div");
    actions.className = "checked-final-emergency-actions";
    actions.innerHTML = '<button type="button" class="checked-final-call-119">' + escapeHtmlSafe(bundle.call) + '</button>' +
                        '<button type="button" class="checked-final-cancel-emergency">' + escapeHtmlSafe(bundle.cancel) + '</button>';
    content.appendChild(actions);
    actions.querySelector(".checked-final-call-119").addEventListener("click", function (event) {
      event.preventDefault();
      openCallConfirmModal();
    });
    actions.querySelector(".checked-final-cancel-emergency").addEventListener("click", function (event) {
      event.preventDefault();
      window.closeEmergencyPopup();
    });

    // Hide normal popup while emergency popup is shown, then restore it after cancel.
    const messagePopup = document.getElementById("message-popup");
    if (messagePopup) setPopupVisible(messagePopup, false);
    setPopupVisible(popup, true);
    window.__emergencyPopupOpen = true;
  };

  window.closeEmergencyPopup = function () {
    const popup = document.getElementById("emergency-popup");
    setPopupVisible(popup, false);
    window.__emergencyPopupOpen = false;
    setTimeout(function () {
      if (window.__messagePopupState && window.__messagePopupState.visible) {
        restoreMessagePopup();
      }
    }, 80);
  };
  try { showEmergencyPopup = window.showEmergencyPopup; } catch (e) {}
  try { closeEmergencyPopup = window.closeEmergencyPopup; } catch (e) {}

  window.restartCurrentQuiz = function () {
    quizIndex = 0;
    quizScore = 0;
    answered = false;
    const quizPage = document.getElementById("quiz-page");
    if (quizPage) quizPage.classList.remove("quiz-finished");
    if (typeof window.loadQuestion === "function") window.loadQuestion();
    try { if (typeof updateQuizProgress === "function") updateQuizProgress(); } catch (e) {}
  };

  function renderQuizCompleteCard() {
    const lang = appLang();
    const texts = finalText[lang] || finalText.zh;
    const questionSet = typeof getQuestionSet === "function" ? getQuestionSet() : [];
    const score = Number(quizScore || 0);
    const total = Number(questionSet.length || 0) || 1;
    const percentage = Math.round((score / total) * 100);

    const page = document.getElementById("quiz-page");
    const question = document.getElementById("quiz-question");
    const result = document.getElementById("answer-explanation");
    const options = document.getElementById("quiz-options");
    if (!question || !result || !options) return;

    if (page) page.classList.add("quiz-finished");
    question.innerHTML = '<div class="quiz-complete-title">' + escapeHtmlSafe(texts.quizDoneTitle) + '</div>';
    result.classList.remove("hidden");
    result.innerHTML = '<div class="right-text">' + escapeHtmlSafe(texts.quizScoreLabel) + '：' + score + ' / ' + total + '</div>';
    options.innerHTML = [
      '<div class="quiz-complete-panel">',
      '  <div class="quiz-complete-top">',
      '    <div class="quiz-complete-badge">',
      '      <div>' + score + ' / ' + total + '<span>' + percentage + '%</span></div>',
      '    </div>',
      '    <div class="quiz-complete-main">',
      '      <h3>' + escapeHtmlSafe(texts.quizDoneTitle) + '</h3>',
      '      <p>' + escapeHtmlSafe(texts.quizDoneBody) + '</p>',
      '      <div class="quiz-complete-actions">',
      '        <button type="button" class="quiz-return-btn">' + escapeHtmlSafe(texts.quizReturn) + '</button>',
      '        <button type="button" class="quiz-retry-btn">' + escapeHtmlSafe(texts.quizRetry) + '</button>',
      '      </div>',
      '    </div>',
      '  </div>',
      '</div>'
    ].join('');

    const returnBtn = options.querySelector('.quiz-return-btn');
    const retryBtn = options.querySelector('.quiz-retry-btn');
    if (returnBtn) returnBtn.addEventListener('click', function () { showPage('quiz-menu-page'); });
    if (retryBtn) retryBtn.addEventListener('click', function () { window.restartCurrentQuiz(); });
  }

  const prevLoadQuestion = window.loadQuestion || (typeof loadQuestion === 'function' ? loadQuestion : null);
  if (typeof prevLoadQuestion === 'function') {
    window.loadQuestion = function () {
      const page = document.getElementById('quiz-page');
      if (page) page.classList.remove('quiz-finished');
      const result = prevLoadQuestion.apply(this, arguments);
      const nextBtn = document.querySelector('#quiz-page .next-btn');
      const backBtn = document.querySelector('#quiz-page .home-circle');
      if (nextBtn) nextBtn.style.display = '';
      if (backBtn) backBtn.style.display = '';
      return result;
    };
    try { loadQuestion = window.loadQuestion; } catch (e) {}
  }

  window.nextQuestion = function () {
    if (!answered) return;
    quizIndex++;
    const questionSet = typeof getQuestionSet === 'function' ? getQuestionSet() : [];
    if (quizIndex >= questionSet.length) {
      renderQuizCompleteCard();
      try { if (typeof updateQuizProgress === 'function') updateQuizProgress(); } catch (e) {}
      return;
    }
    if (typeof window.loadQuestion === 'function') window.loadQuestion();
    try { if (typeof updateQuizProgress === 'function') updateQuizProgress(); } catch (e) {}
  };
  try { nextQuestion = window.nextQuestion; } catch (e) {}

  const oldSetLanguage = window.setLanguage || (typeof setLanguage === 'function' ? setLanguage : null);
  if (typeof oldSetLanguage === 'function') {
    window.setLanguage = function () {
      const ret = oldSetLanguage.apply(this, arguments);
      ensureNoTranslate();
      setTimeout(function () {
        const overlay = document.getElementById('call-confirm-overlay');
        if (overlay && overlay.classList.contains('is-open')) openCallConfirmModal();
      }, 40);
      return ret;
    };
    try { setLanguage = window.setLanguage; } catch (e) {}
  }

  ensureNoTranslate();
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', ensureNoTranslate);
  } else {
    ensureNoTranslate();
  }
  const translateObserver = new MutationObserver(function () { ensureNoTranslate(); });
  translateObserver.observe(document.documentElement, { childList: true, subtree: true });
})();


/* ===== Final v3: emergency popup must hand off to the daily health message after closing ===== */
(function () {
  function finalV3Lang() {
    const raw = (
      window.currentLanguage ||
      window.currentLang ||
      localStorage.getItem("siteLanguage") ||
      localStorage.getItem("currentLang") ||
      localStorage.getItem("lang") ||
      "zh"
    ).toLowerCase();
    if (raw.startsWith("ja")) return "ja";
    if (raw.startsWith("en")) return "en";
    return "zh";
  }

  const msgText = {
    zh: {
      warningTitle: " 今日健康提醒",
      normalTitle: " 今日的健康応援".replace("応援", "支持"),
      close: "關閉",
      highBp: "血壓偏高，建議固定時間量測並減少高鹽、高油食物。",
      lowBp: "血壓偏低，請先休息、補充水分，避免突然站起。",
      fastPulse: "脈搏偏快，建議休息後重新測量；若合併胸悶、喘或頭暈，請就醫。",
      slowPulse: "脈搏偏慢，若有頭暈、胸悶、昏倒感，請立即就醫。",
      highBmi: "BMI 偏高，建議增加活動量並注意飲食。",
      normal: "今天的健康數值大致穩定。請繼續保持規律紀錄與均衡生活。"
    },
    en: {
      warningTitle: " Today’s Health Reminder",
      normalTitle: " Today’s Health Support",
      close: "Close",
      highBp: "Blood pressure is high. Measure it regularly and reduce high-salt and high-fat foods.",
      lowBp: "Blood pressure is low. Rest, drink water, and avoid standing up suddenly.",
      fastPulse: "Pulse is fast. Recheck after resting. Seek medical care if chest tightness, shortness of breath, or dizziness occurs.",
      slowPulse: "Pulse is slow. Seek medical care immediately if dizziness, chest tightness, or near-fainting occurs.",
      highBmi: "BMI is high. Increase physical activity and pay attention to diet.",
      normal: "Today’s health values are generally stable. Keep recording regularly and maintain a balanced lifestyle."
    },
    ja: {
      warningTitle: " 今日の健康提醒",
      normalTitle: " 今日の健康応援",
      close: "閉じる",
      highBp: "血圧が高めです。決まった時間に測定し、塩分や脂っこい食事を控えましょう。",
      lowBp: "血圧が低めです。まず休み、水分を補給し、急に立ち上がらないようにしましょう。",
      fastPulse: "脈拍が速めです。休憩後に再測定してください。胸の違和感、息切れ、めまいがある場合は受診してください。",
      slowPulse: "脈拍が遅めです。めまい、胸の違和感、失神しそうな感じがある場合は、すぐに受診してください。",
      highBmi: "BMI が高めです。活動量を増やし、食事内容に注意しましょう。",
      normal: "今日の健康数値はおおむね安定しています。継続して記録し、バランスのよい生活を続けましょう。"
    }
  };

  function setPopupVisibleV3(el, visible) {
    if (!el) return;
    if (visible) {
      el.classList.remove("hidden");
      el.removeAttribute("aria-hidden");
      el.style.setProperty("display", "flex", "important");
      el.style.setProperty("pointer-events", "auto", "important");
      el.style.setProperty("opacity", "1", "important");
      el.style.setProperty("visibility", "visible", "important");
    } else {
      el.classList.add("hidden");
      el.setAttribute("aria-hidden", "true");
      el.style.setProperty("display", "none", "important");
      el.style.setProperty("pointer-events", "none", "important");
    }
  }

  function getLatestHealthDataV3() {
    try {
      return JSON.parse(localStorage.getItem("healthData") || "{}") || {};
    } catch (e) {
      return {};
    }
  }

  function buildDailyMessageV3() {
    const lang = finalV3Lang();
    const t = msgText[lang] || msgText.zh;
    const data = getLatestHealthDataV3();

    const systolic = Number(data.systolic);
    const diastolic = Number(data.diastolic);
    const pulse = Number(data.pulse);
    const bmi = Number(data.bmi);

    const lines = [];
    if (systolic >= 140 || diastolic >= 90) lines.push(t.highBp);
    if (systolic > 0 && systolic <= 90 || diastolic > 0 && diastolic <= 60) lines.push(t.lowBp);
    if (pulse >= 100) lines.push(t.fastPulse);
    if (pulse > 0 && pulse <= 50) lines.push(t.slowPulse);
    if (bmi >= 27) lines.push(t.highBmi);

    const title = lines.length ? t.warningTitle : t.normalTitle;
    const body = lines.length ? lines : [t.normal];

    return title + "<br><br>" + body.map(function (line) {
      return "• " + line;
    }).join("<br>");
  }

  function showDailyMessageAfterEmergencyV3() {
    const popup = document.getElementById("message-popup");
    const msg = document.getElementById("popup-message");
    if (!popup || !msg) return;

    const saved = window.__messagePopupState;
    const hasSaved = !!(saved && saved.html && String(saved.html).trim());

    msg.innerHTML = hasSaved ? saved.html : buildDailyMessageV3();

    const closeBtn = popup.querySelector("button");
    const t = msgText[finalV3Lang()] || msgText.zh;
    if (closeBtn) closeBtn.textContent = t.close;

    setPopupVisibleV3(popup, true);
  }

  function closeEmergencyAndShowMessageV3(event) {
    if (event) {
      event.preventDefault();
      event.stopPropagation();
      if (typeof event.stopImmediatePropagation === "function") event.stopImmediatePropagation();
    }

    const emergency = document.getElementById("emergency-popup");
    setPopupVisibleV3(emergency, false);
    window.__emergencyPopupOpen = false;

    setTimeout(showDailyMessageAfterEmergencyV3, 100);
  }

  const previousShowEmergencyV3 = window.showEmergencyPopup;
  window.showEmergencyPopup = function showEmergencyPopupThenRestoreMessageV3(messages) {
    const popup = document.getElementById("message-popup");
    const msg = document.getElementById("popup-message");
    window.__messagePopupState = {
      html: msg && String(msg.innerHTML || "").trim() ? msg.innerHTML : buildDailyMessageV3(),
      visible: true
    };

    if (popup) setPopupVisibleV3(popup, false);

    if (typeof previousShowEmergencyV3 === "function" && previousShowEmergencyV3 !== window.showEmergencyPopup) {
      previousShowEmergencyV3.apply(this, arguments);
    }

    setTimeout(function () {
      const emergency = document.getElementById("emergency-popup");
      if (!emergency) return;

      emergency.querySelectorAll("button").forEach(function (btn) {
        const txt = (btn.textContent || "").trim().toLowerCase();
        const isCancel =
          btn.classList.contains("checked-final-cancel-emergency") ||
          txt === "取消" ||
          txt === "cancel" ||
          txt === "キャンセル" ||
          txt === "閉じる";
        if (isCancel) {
          btn.onclick = closeEmergencyAndShowMessageV3;
          btn.addEventListener("click", closeEmergencyAndShowMessageV3, true);
        }
      });

      const cancelBtn = emergency.querySelector(".checked-final-cancel-emergency");
      if (cancelBtn) {
        cancelBtn.onclick = closeEmergencyAndShowMessageV3;
        cancelBtn.addEventListener("click", closeEmergencyAndShowMessageV3, true);
      }
    }, 0);
  };

  window.closeEmergencyPopup = closeEmergencyAndShowMessageV3;
  try { showEmergencyPopup = window.showEmergencyPopup; } catch (e) {}
  try { closeEmergencyPopup = window.closeEmergencyPopup; } catch (e) {}

  document.addEventListener("click", function (event) {
    const target = event.target && event.target.closest ? event.target.closest("#emergency-popup button") : null;
    if (!target) return;
    const txt = (target.textContent || "").trim().toLowerCase();
    const isCancel =
      target.classList.contains("checked-final-cancel-emergency") ||
      txt === "取消" ||
      txt === "cancel" ||
      txt === "キャンセル" ||
      txt === "閉じる";
    if (isCancel) closeEmergencyAndShowMessageV3(event);
  }, true);
})();



/* =========================================================
   ABSOLUTE FINAL：單一健康警示流程
   目的：
   1. 不再使用舊的 emergency-popup 按鈕，避免 FINAL V2/V3/CHECKED PATCH 互相覆蓋。
   2. 危險數值時只顯示新的紅色彈窗。
   3. 按「取消」一定關閉紅色彈窗，並接著顯示米色健康提醒。
   4. 保留中 / 英 / 日文字。
   ========================================================= */
(function absoluteFinalUnifiedHealthAlert() {
  const ROOT_ID = "unified-health-alert-popup";
  const STYLE_ID = "unified-health-alert-style";

  function getLangFinal() {
    const raw = (
      window.currentLanguage ||
      window.currentLang ||
      localStorage.getItem("siteLanguage") ||
      localStorage.getItem("currentLang") ||
      localStorage.getItem("language") ||
      localStorage.getItem("lang") ||
      "zh"
    ).toString().toLowerCase();

    if (raw.startsWith("en")) return "en";
    if (raw.startsWith("ja") || raw.includes("日")) return "ja";
    return "zh";
  }

  const finalTexts = {
    zh: {
      emergencyTitle: " 危險健康數值",
      detected: "偵測到危險健康數值！",
      riskTitle: "可能風險",
      actionTitle: "建議立即處置",
      callWarning: "若出現胸痛、呼吸困難、視力模糊、意識不清或昏倒，請立即撥打 119。",
      call: " 撥打 119",
      cancel: "取消",
      close: "關閉",
      reminderTitle: " 健康提醒",
      normalTitle: " 今日健康鼓勵",
      normalText: "今天的健康數值很穩定，表現很棒！<br>每一次紀錄，都是在幫自己累積健康資料。<br>請繼續保持規律作息、均衡飲食，讓好狀態一天一天延續下去。",
      unknown: "目前偵測到健康數值異常，建議先休息並再次量測。",
      generalActions: [
        "立即停止活動並坐下或半躺休息。",
        "保持環境通風，避免情緒激動與劇烈運動。",
        "5～10 分鐘後再次量測並記錄數值。",
        "若數值持續異常或伴隨不適，請儘速就醫評估。"
      ]
    },
    en: {
      emergencyTitle: " Dangerous Health Values",
      detected: "Dangerous health values detected!",
      riskTitle: "Possible risks",
      actionTitle: "Recommended actions",
      callWarning: "Call 119 immediately if chest pain, breathing difficulty, blurred vision, confusion, or fainting occurs.",
      call: " Call 119",
      cancel: "Cancel",
      close: "Close",
      reminderTitle: " Health Reminder",
      normalTitle: "Today’s Encouragement",
      normalText: "Your health values are stable today. Great job!<br>Every record helps you build useful health data.<br>Keep a regular routine and balanced diet.",
      unknown: "Abnormal health values were detected. Please rest and measure again.",
      generalActions: [
        "Stop activity immediately and sit or rest in a semi-reclined position.",
        "Keep the environment ventilated and avoid emotional stress or strenuous activity.",
        "Measure again after 5–10 minutes and record the values.",
        "Seek medical evaluation if values remain abnormal or symptoms occur."
      ]
    },
    ja: {
      emergencyTitle: "危険な健康数値",
      detected: "危険な健康数値を検出しました！",
      riskTitle: "考えられるリスク",
      actionTitle: "推奨される対応",
      callWarning: "胸痛、息苦しさ、視界のかすみ、意識障害、失神がある場合は、すぐに119へ通報してください。",
      call: "119に電話",
      cancel: "キャンセル",
      close: "閉じる",
      reminderTitle: "健康アラート",
      normalTitle: "今日の健康応援",
      normalText: "今日の健康数値は安定しています。よくできました！<br>記録を重ねることで、健康管理に役立つ資料になります。<br>規則正しい生活とバランスのよい食事を続けましょう。",
      unknown: "健康数値の異常を検出しました。まず安静にして再測定してください。",
      generalActions: [
        "すぐに活動を中止し、座るか半座位で休みましょう。",
        "換気を保ち、興奮や激しい運動を避けましょう。",
        "5～10分後に再測定し、数値を記録しましょう。",
        "異常値が続く、または症状がある場合は医療機関を受診してください。"
      ]
    }
  };

  const riskContent = {
    sysHigh: {
      zh: {
        title: "收縮壓過高",
        detail: "收縮壓已達危險範圍，可能代表血管壓力過大。",
        risks: ["高血壓危象", "中風風險增加", "心臟與腎臟負擔上升"]
      },
      en: {
        title: "Systolic blood pressure is too high",
        detail: "Systolic pressure is in a dangerous range and may indicate excessive vascular pressure.",
        risks: ["Hypertensive crisis", "Higher stroke risk", "Increased heart and kidney burden"]
      },
      ja: {
        title: "収縮期血圧が高すぎます",
        detail: "収縮期血圧が危険域にあり、血管への圧力が強い可能性があります。",
        risks: ["高血圧緊急症", "脳卒中リスクの上昇", "心臓・腎臓への負担増加"]
      }
    },
    diaHigh: {
      zh: {
        title: "舒張壓過高",
        detail: "舒張壓非常高，可能與急性心血管事件風險有關。",
        risks: ["急性心血管風險", "劇烈頭痛或胸悶", "血管與心臟負擔增加"]
      },
      en: {
        title: "Diastolic blood pressure is too high",
        detail: "Diastolic pressure is critically high and may be related to acute cardiovascular risk.",
        risks: ["Acute cardiovascular risk", "Severe headache or chest tightness", "Increased vascular and heart burden"]
      },
      ja: {
        title: "拡張期血圧が高すぎます",
        detail: "拡張期血圧が非常に高く、急性心血管リスクに関連する可能性があります。",
        risks: ["急性心血管リスク", "激しい頭痛や胸の圧迫感", "血管・心臓への負担増加"]
      }
    },
    diaLow: {
      zh: {
        title: "舒張壓過低",
        detail: "舒張壓偏低時，可能造成腦部或身體循環不足。",
        risks: ["頭暈與無力", "昏倒風險", "脫水或循環異常可能"]
      },
      en: {
        title: "Diastolic blood pressure is too low",
        detail: "Low diastolic pressure may reduce circulation to the brain or body.",
        risks: ["Dizziness and weakness", "Risk of fainting", "Possible dehydration or circulation problems"]
      },
      ja: {
        title: "拡張期血圧が低すぎます",
        detail: "拡張期血圧が低いと、脳や身体への循環が不足する可能性があります。",
        risks: ["めまい・脱力感", "失神リスク", "脱水や循環異常の可能性"]
      }
    },
    pulseFast: {
      zh: {
        title: "脈搏過快",
        detail: "脈搏明顯過快，可能表示心臟負擔增加或心律異常。",
        risks: ["心律不整風險", "胸悶或心悸", "壓力、脫水或感染相關可能"]
      },
      en: {
        title: "Pulse is too fast",
        detail: "A very fast pulse may indicate increased cardiac workload or abnormal rhythm.",
        risks: ["Arrhythmia risk", "Chest tightness or palpitations", "Possible stress, dehydration, or infection"]
      },
      ja: {
        title: "脈拍が速すぎます",
        detail: "脈拍が非常に速い場合、心臓への負担増加や不整脈の可能性があります。",
        risks: ["不整脈リスク", "胸の圧迫感や動悸", "ストレス・脱水・感染の可能性"]
      }
    },
    pulseSlow: {
      zh: {
        title: "脈搏過慢",
        detail: "脈搏過慢可能導致身體供血不足，需注意是否有不適。",
        risks: ["心搏過慢風險", "頭暈或昏厥", "疲倦、胸悶或意識不清可能"]
      },
      en: {
        title: "Pulse is too slow",
        detail: "A very slow pulse may reduce blood supply and should be monitored for symptoms.",
        risks: ["Bradycardia risk", "Dizziness or fainting", "Possible fatigue, chest tightness, or confusion"]
      },
      ja: {
        title: "脈拍が遅すぎます",
        detail: "脈拍が遅すぎると血流が不足する可能性があり、症状に注意が必要です。",
        risks: ["徐脈リスク", "めまい・失神", "疲労、胸部圧迫感、意識障害の可能性"]
      }
    }
  };

  function escapeHTML(value) {
    return String(value == null ? "" : value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  function detectKey(line) {
    const s = String(line || "");
    if (/收縮壓.*過高|Systolic blood pressure.*too high|収縮期血圧が高すぎ|高血壓危象/.test(s)) return "sysHigh";
    if (/舒張壓.*過高|Diastolic blood pressure.*too high|拡張期血圧が高すぎ|急性心血管/.test(s)) return "diaHigh";
    if (/舒張壓.*過低|Diastolic blood pressure.*too low|拡張期血圧が低すぎ/.test(s)) return "diaLow";
    if (/脈搏.*過快|Pulse.*too fast|脈拍が速すぎ|心律異常/.test(s)) return "pulseFast";
    if (/脈搏.*過慢|Pulse.*too slow|脈拍が遅すぎ|昏厥/.test(s)) return "pulseSlow";
    return "";
  }

  function getCurrentData() {
    let data = {};
    try { data = JSON.parse(localStorage.getItem("healthData") || "{}") || {}; } catch (e) {}
    function num(id, fallback) {
      const el = document.getElementById(id);
      const val = el && el.value !== "" ? el.value : fallback;
      const n = Number(val);
      return Number.isFinite(n) ? n : 0;
    }
    return {
      height: num("height", data.height),
      weight: num("weight", data.weight),
      systolic: num("systolic", data.systolic),
      diastolic: num("diastolic", data.diastolic),
      pulse: num("pulse", data.pulse),
      waist: num("waist", data.waist),
      bmi: Number(data.bmi) || (num("height", data.height) && num("weight", data.weight)
        ? +(num("weight", data.weight) / Math.pow(num("height", data.height) / 100, 2)).toFixed(1)
        : 0)
    };
  }

  function keysFromMessages(messages) {
    const keys = [];
    (Array.isArray(messages) ? messages : []).forEach(function (line) {
      const key = detectKey(line);
      if (key && !keys.includes(key)) keys.push(key);
    });

    const d = getCurrentData();
    if (d.systolic >= 180 && !keys.includes("sysHigh")) keys.push("sysHigh");
    if (d.diastolic >= 120 && !keys.includes("diaHigh")) keys.push("diaHigh");
    if (d.diastolic > 0 && d.diastolic <= 50 && !keys.includes("diaLow")) keys.push("diaLow");
    if (d.pulse >= 140 && !keys.includes("pulseFast")) keys.push("pulseFast");
    if (d.pulse > 0 && d.pulse <= 40 && !keys.includes("pulseSlow")) keys.push("pulseSlow");

    return keys;
  }

  function ensureStyle() {
    if (document.getElementById(STYLE_ID)) return;
    const style = document.createElement("style");
    style.id = STYLE_ID;
    style.textContent = `
      #${ROOT_ID}.unified-health-alert {
        position: fixed !important;
        inset: 0 !important;
        display: none !important;
        align-items: center !important;
        justify-content: center !important;
        z-index: 2147483000 !important;
        background: rgba(65, 43, 25, 0.22) !important;
        backdrop-filter: blur(4px) !important;
        pointer-events: auto !important;
      }
      #${ROOT_ID}.is-open {
        display: flex !important;
      }
      #${ROOT_ID} .unified-alert-box {
        width: min(92vw, 760px) !important;
        max-height: 88vh !important;
        overflow-y: auto !important;
        border-radius: 30px !important;
        padding: 34px 38px !important;
        background: linear-gradient(135deg, #fff5f5, #ffe3e3) !important;
        border: 3px solid #ff6b6b !important;
        box-shadow: 0 20px 60px rgba(120, 45, 45, 0.22), 0 0 25px rgba(255, 80, 80, 0.25) !important;
        color: #7a2d2d !important;
        text-align: left !important;
        pointer-events: auto !important;
      }
      #${ROOT_ID} h3 {
        margin: 0 0 16px !important;
        text-align: center !important;
        color: #c62828 !important;
        font-size: 26px !important;
      }
      #${ROOT_ID} .unified-detected {
        text-align: center !important;
        font-weight: 800 !important;
        font-size: 20px !important;
        margin-bottom: 22px !important;
      }
      #${ROOT_ID} .unified-risk-item {
        background: rgba(255,255,255,0.58) !important;
        border: 1px solid rgba(255,107,107,0.28) !important;
        border-radius: 18px !important;
        padding: 16px 18px !important;
        margin: 12px 0 !important;
      }
      #${ROOT_ID} .unified-risk-item h4 {
        margin: 0 0 8px !important;
        color: #9b2f2f !important;
        font-size: 18px !important;
      }
      #${ROOT_ID} .unified-risk-item p {
        margin: 6px 0 !important;
        line-height: 1.7 !important;
        color: #733333 !important;
        font-weight: 600 !important;
      }
      #${ROOT_ID} ul {
        margin: 8px 0 0 20px !important;
        padding: 0 !important;
      }
      #${ROOT_ID} li {
        margin: 6px 0 !important;
        line-height: 1.6 !important;
        color: #733333 !important;
        font-weight: 600 !important;
      }
      #${ROOT_ID} .unified-actions-section {
        background: rgba(255,255,255,0.45) !important;
        border-radius: 18px !important;
        padding: 16px 18px !important;
        margin-top: 14px !important;
      }
      #${ROOT_ID} .unified-call-warning {
        color: #b42323 !important;
        font-weight: 800 !important;
        text-align: center !important;
        line-height: 1.7 !important;
        margin-top: 16px !important;
      }
      #${ROOT_ID} .unified-alert-buttons {
        display: flex !important;
        justify-content: center !important;
        gap: 18px !important;
        flex-wrap: wrap !important;
        margin-top: 24px !important;
        pointer-events: auto !important;
      }
      #${ROOT_ID} .unified-alert-buttons button {
        min-width: 150px !important;
        border: none !important;
        border-radius: 18px !important;
        padding: 14px 24px !important;
        background: #8b6f5a !important;
        color: #fff !important;
        font-size: 17px !important;
        font-weight: 800 !important;
        cursor: pointer !important;
        box-shadow: 0 10px 24px rgba(91,68,48,0.18) !important;
        pointer-events: auto !important;
      }
      #${ROOT_ID} .unified-alert-buttons button:hover {
        transform: translateY(-2px) !important;
        background: #6f4e37 !important;
      }
      #emergency-popup.force-hidden-by-unified,
      #emergency-popup.force-hidden-by-unified * {
        pointer-events: none !important;
      }
    `;
    document.head.appendChild(style);
  }

  function ensurePopup() {
    ensureStyle();
    let root = document.getElementById(ROOT_ID);
    if (root) return root;

    root = document.createElement("div");
    root.id = ROOT_ID;
    root.className = "unified-health-alert";
    root.innerHTML = `
      <div class="unified-alert-box" role="dialog" aria-modal="true">
        <h3 class="unified-alert-title"></h3>
        <div class="unified-alert-body"></div>
        <div class="unified-alert-buttons">
          <button type="button" class="unified-call-btn"></button>
          <button type="button" class="unified-cancel-btn"></button>
        </div>
      </div>
    `;
    document.body.appendChild(root);

    const callBtn = root.querySelector(".unified-call-btn");
    const cancelBtn = root.querySelector(".unified-cancel-btn");

    callBtn.addEventListener("click", function (event) {
      event.preventDefault();
      event.stopPropagation();
      if (typeof window.call119 === "function" && window.call119 !== callBtn.onclick) {
        try {
          window.call119();
          return;
        } catch (e) {}
      }
      try { window.location.href = "tel:119"; } catch (e) {}
    });

    cancelBtn.addEventListener("click", function (event) {
      event.preventDefault();
      event.stopPropagation();
      closeUnifiedEmergencyAndShowMessage();
    });

    root.addEventListener("click", function (event) {
      if (event.target === root) {
        closeUnifiedEmergencyAndShowMessage();
      }
    });

    document.addEventListener("keydown", function (event) {
      if (event.key === "Escape" && root.classList.contains("is-open")) {
        closeUnifiedEmergencyAndShowMessage();
      }
    }, true);

    return root;
  }

  function setVisible(el, visible) {
    if (!el) return;
    if (visible) {
      el.classList.remove("hidden");
      el.removeAttribute("aria-hidden");
      el.style.setProperty("display", "flex", "important");
      el.style.setProperty("pointer-events", "auto", "important");
    } else {
      el.classList.add("hidden");
      el.setAttribute("aria-hidden", "true");
      el.style.setProperty("display", "none", "important");
      el.style.setProperty("pointer-events", "none", "important");
    }
  }

  function captureCurrentDailyMessage() {
    const msg = document.getElementById("popup-message");
    const popup = document.getElementById("message-popup");
    const html = msg && String(msg.innerHTML || "").trim()
      ? msg.innerHTML
      : buildDailyReminderMessage();
    window.__unifiedSavedDailyMessage = {
      html,
      hadPopup: !!popup
    };
  }

  function buildDailyReminderMessage() {
    const lang = getLangFinal();
    const t = finalTexts[lang] || finalTexts.zh;
    const d = getCurrentData();
    const lines = [];

    if (lang === "zh") {
      if (d.systolic >= 140 || d.diastolic >= 90) lines.push("⚠ 血壓偏高，建議固定時間量測並減少高鹽、高油食物。");
      if (d.diastolic > 0 && d.diastolic <= 60) lines.push("⚠ 舒張壓偏低，建議先休息、補充水分並避免突然站起。");
      if (d.pulse > 100) lines.push("⚠ 脈搏偏快，建議休息後重新量測，並避免過量咖啡因。");
      if (d.pulse > 0 && d.pulse < 60) lines.push("⚠ 脈搏偏慢，若有頭暈、胸悶或無力，建議就醫評估。");
      if (d.bmi >= 24) lines.push("⚠ BMI 過高，建議控制飲食、增加活動量並持續追蹤體重。");
      if (d.bmi > 0 && d.bmi < 18.5) lines.push("⚠ BMI 偏低，建議注意營養攝取與體重變化。");
      if (d.waist >= 90) lines.push("⚠ 腰圍偏高，建議注意腹部脂肪與代謝症候群風險。");
    } else if (lang === "en") {
      if (d.systolic >= 140 || d.diastolic >= 90) lines.push("⚠ Blood pressure is high. Measure regularly and reduce salt and oily foods.");
      if (d.diastolic > 0 && d.diastolic <= 60) lines.push("⚠ Diastolic pressure is low. Rest, drink water, and avoid standing up suddenly.");
      if (d.pulse > 100) lines.push("⚠ Pulse is fast. Rest and measure again. Avoid excessive caffeine.");
      if (d.pulse > 0 && d.pulse < 60) lines.push("⚠ Pulse is slow. If dizziness, chest tightness, or weakness occurs, seek medical evaluation.");
      if (d.bmi >= 24) lines.push("⚠ BMI is high. Adjust diet, increase activity, and track weight.");
      if (d.bmi > 0 && d.bmi < 18.5) lines.push("⚠ BMI is low. Pay attention to nutrition and weight changes.");
      if (d.waist >= 90) lines.push("⚠ Waist circumference is high. Monitor abdominal fat and metabolic risk.");
    } else {
      if (d.systolic >= 140 || d.diastolic >= 90) lines.push("⚠ 血圧が高めです。定期的に測定し、塩分や脂っこい食事を控えましょう。");
      if (d.diastolic > 0 && d.diastolic <= 60) lines.push("⚠ 拡張期血圧が低めです。休息・水分補給を行い、急に立ち上がらないようにしましょう。");
      if (d.pulse > 100) lines.push("⚠ 脈拍が速めです。休息後に再測定し、カフェインの摂りすぎを避けましょう。");
      if (d.pulse > 0 && d.pulse < 60) lines.push("⚠ 脈拍が遅めです。めまい・胸部圧迫感・脱力感がある場合は受診を検討してください。");
      if (d.bmi >= 24) lines.push("⚠ BMIが高めです。食事を見直し、活動量を増やして体重を継続的に確認しましょう。");
      if (d.bmi > 0 && d.bmi < 18.5) lines.push("⚠ BMIが低めです。栄養摂取と体重変化に注意しましょう。");
      if (d.waist >= 90) lines.push("⚠ ウエストが高めです。腹部脂肪とメタボリックリスクに注意しましょう。");
    }

    if (!lines.length) {
      return t.normalTitle + "<br><br>" + t.normalText;
    }

    return t.reminderTitle + "<br><br>" + lines.map(function (line) {
      return "• " + escapeHTML(line);
    }).join("<br><br>");
  }

  function showDailyReminderAfterEmergency() {
    const popup = document.getElementById("message-popup");
    const msg = document.getElementById("popup-message");
    if (!popup || !msg) return;

    const saved = window.__unifiedSavedDailyMessage;
    msg.innerHTML = saved && saved.html ? saved.html : buildDailyReminderMessage();

    const closeBtn = popup.querySelector("button");
    const lang = getLangFinal();
    const t = finalTexts[lang] || finalTexts.zh;
    if (closeBtn) closeBtn.textContent = t.close;

    setVisible(popup, true);
  }

  function closeUnifiedEmergencyAndShowMessage() {
    const root = document.getElementById(ROOT_ID);
    if (root) {
      root.classList.remove("is-open");
      root.style.setProperty("display", "none", "important");
      root.setAttribute("aria-hidden", "true");
      root.style.setProperty("pointer-events", "none", "important");
    }

    const old = document.getElementById("emergency-popup");
    if (old) {
      old.classList.add("hidden", "force-hidden-by-unified");
      old.setAttribute("aria-hidden", "true");
      old.style.setProperty("display", "none", "important");
      old.style.setProperty("pointer-events", "none", "important");
    }

    const msgPopup = document.getElementById("message-popup");
    if (msgPopup) {
      msgPopup.classList.add("hidden");
      msgPopup.setAttribute("aria-hidden", "true");
      msgPopup.style.setProperty("display", "none", "important");
      msgPopup.style.setProperty("pointer-events", "none", "important");
    }
  }

  function renderEmergency(messages) {
    const lang = getLangFinal();
    const t = finalTexts[lang] || finalTexts.zh;
    const root = ensurePopup();
    const title = root.querySelector(".unified-alert-title");
    const body = root.querySelector(".unified-alert-body");
    const callBtn = root.querySelector(".unified-call-btn");
    const cancelBtn = root.querySelector(".unified-cancel-btn");

    const keys = keysFromMessages(messages);
    const sections = keys.map(function (key) {
      const item = riskContent[key] && (riskContent[key][lang] || riskContent[key].zh);
      if (!item) return "";
      return `
        <div class="unified-risk-item">
          <h4>${escapeHTML(item.title)}</h4>
          <p>${escapeHTML(item.detail)}</p>
          <div><strong>${escapeHTML(t.riskTitle)}：</strong></div>
          <ul>${item.risks.map(function (r) { return "<li>" + escapeHTML(r) + "</li>"; }).join("")}</ul>
        </div>
      `;
    }).join("");

    title.textContent = t.emergencyTitle;
    body.innerHTML = `
      <div class="unified-detected">🚨 ${escapeHTML(t.detected)}</div>
      ${sections || `<div class="unified-risk-item"><p>${escapeHTML(t.unknown)}</p></div>`}
      <div class="unified-actions-section">
        <strong>${escapeHTML(t.actionTitle)}：</strong>
        <ul>${t.generalActions.map(function (a) { return "<li>" + escapeHTML(a) + "</li>"; }).join("")}</ul>
      </div>
      <div class="unified-call-warning">${escapeHTML(t.callWarning)}</div>
    `;
    callBtn.textContent = t.call;
    cancelBtn.textContent = t.cancel;

    const old = document.getElementById("emergency-popup");
    if (old) {
      old.classList.add("hidden", "force-hidden-by-unified");
      old.setAttribute("aria-hidden", "true");
      old.style.setProperty("display", "none", "important");
      old.style.setProperty("pointer-events", "none", "important");
    }

    const msgPopup = document.getElementById("message-popup");
    if (msgPopup) setVisible(msgPopup, false);

    root.classList.add("is-open");
    root.removeAttribute("aria-hidden");
    root.style.setProperty("display", "flex", "important");
    root.style.setProperty("pointer-events", "auto", "important");
  }

  window.showEmergencyPopup = function unifiedShowEmergencyPopup(messages) {
    captureCurrentDailyMessage();
    renderEmergency(messages || []);
  };

  window.closeEmergencyPopup = function unifiedCloseEmergencyPopup() {
    closeUnifiedEmergencyAndShowMessage();
  };

  window.hideEmergencyPopup = window.closeEmergencyPopup;

  try { showEmergencyPopup = window.showEmergencyPopup; } catch (e) {}
  try { closeEmergencyPopup = window.closeEmergencyPopup; } catch (e) {}
  try { hideEmergencyPopup = window.hideEmergencyPopup; } catch (e) {}

  document.addEventListener("DOMContentLoaded", function () {
    ensurePopup();

    const old = document.getElementById("emergency-popup");
    if (old) {
      old.classList.add("force-hidden-by-unified");
      old.style.setProperty("pointer-events", "none", "important");
    }
  });
})();



/* ===== FINAL PATCH: 關閉紅色警示後，不再顯示米色提醒 ===== */
(function(){
  function hardCloseEmergencyOnly(event){
    if (event) {
      event.preventDefault();
      event.stopPropagation();
      if (typeof event.stopImmediatePropagation === "function") event.stopImmediatePropagation();
    }

    ["unified-emergency-popup", "emergency-popup", "message-popup"].forEach(function(id){
      var el = document.getElementById(id);
      if (!el) return;
      el.classList.remove("is-open");
      el.classList.add("hidden");
      el.setAttribute("aria-hidden", "true");
      el.style.setProperty("display", "none", "important");
      el.style.setProperty("pointer-events", "none", "important");
    });
  }

  window.closeEmergencyPopup = hardCloseEmergencyOnly;
  window.hideEmergencyPopup = hardCloseEmergencyOnly;
  try { closeEmergencyPopup = window.closeEmergencyPopup; } catch(e) {}
  try { hideEmergencyPopup = window.hideEmergencyPopup; } catch(e) {}

  document.addEventListener("click", function(event){
    var target = event.target && event.target.closest
      ? event.target.closest("#unified-emergency-popup .unified-cancel-btn, #emergency-popup button, #emergency-popup [role='button']")
      : null;
    if (!target) return;

    var text = (target.textContent || "").trim().toLowerCase();
    var isCancel =
      target.classList.contains("unified-cancel-btn") ||
      target.classList.contains("checked-final-cancel-emergency") ||
      target.classList.contains("emergency-cancel-final-v2") ||
      target.classList.contains("emergency-cancel-final-v3") ||
      text === "取消" ||
      text === "cancel" ||
      text === "キャンセル" ||
      text === "閉じる";

    if (isCancel) hardCloseEmergencyOnly(event);
  }, true);
})();



/* =========================================================
   FINAL STABLE SAVE OVERRIDE
   修正：按「儲存今日紀錄」卡死。
   做法：用 capture 攔截儲存按鈕，不讓舊版 saveData / popup patch 被觸發。
   ========================================================= */
(function finalStableSaveOverride() {
  const ALERT_ID = "stable-red-alert";

  function lang() {
    const raw = String(
      window.currentLanguage ||
      window.currentLang ||
      localStorage.getItem("siteLanguage") ||
      localStorage.getItem("currentLang") ||
      localStorage.getItem("lang") ||
      "zh"
    ).toLowerCase();
    if (raw.startsWith("ja")) return "ja";
    if (raw.startsWith("en")) return "en";
    return "zh";
  }

  const T = {
    zh: {
      fill: "請填寫完整基本資料：身高、體重、血壓、脈搏！",
      title: " 危險健康數值",
      lead: "注意：系統偵測到需要關注的健康數值。",
      abnormal: "異常項目",
      actions: "建議處置",
      emergency: "立即求助情況",
      close: "關閉",
      call: "撥打 119",
      normal: "今日紀錄已儲存。",
      actionList: ["請先停止活動，坐下或半躺休息。", "保持呼吸平穩，避免劇烈運動與情緒激動。", "5～10 分鐘後重新量測一次。", "若不適或數值持續異常，請儘速就醫。"],
      emergencyText: "若出現胸痛、呼吸困難、意識不清、昏倒、劇烈頭痛、視力模糊或單側肢體無力，請立即撥打 119。",
      risks: {
        sysHigh: ["收縮壓過高", "可能增加高血壓危象、腦中風或心血管負擔風險。"],
        diaHigh: ["舒張壓過高", "可能有急性心血管風險，需注意胸悶、頭痛與呼吸狀況。"],
        diaLow: ["舒張壓過低", "可能造成頭暈、無力、冒冷汗或昏倒風險。"],
        pulseFast: ["脈搏過快", "可能與心律不整、壓力、脫水、睡眠不足或身體不適有關。"],
        pulseSlow: ["脈搏過慢", "若合併頭暈、胸悶、快昏倒，建議儘速就醫。"],
        bmiHigh: ["BMI 過高", "長期可能增加代謝症候群、糖尿病與心血管疾病風險。"],
        bmiLow: ["BMI 過低", "可能與營養不足、肌力下降或體力不足有關。"],
        waistHigh: ["腰圍偏高", "腹部肥胖可能增加代謝症候群與心血管疾病風險。"]
      }
    },
    en: {
      fill: "Please complete height, weight, blood pressure, and pulse.",
      title: " Dangerous Health Values",
      lead: "Health values requiring attention were detected.",
      abnormal: "Abnormal items",
      actions: "Recommended actions",
      emergency: "Seek urgent help if",
      close: "Close",
      call: " Call 119",
      normal: "Today’s record has been saved.",
      actionList: ["Stop activity and sit or rest.", "Keep breathing steady and avoid intense activity.", "Measure again after 5–10 minutes.", "Seek medical care if symptoms or abnormal values continue."],
      emergencyText: "Call 119 immediately if chest pain, breathing difficulty, confusion, fainting, severe headache, blurred vision, or one-sided weakness occurs.",
      risks: {
        sysHigh: ["High systolic pressure", "May increase hypertensive crisis, stroke, or cardiovascular strain risk."],
        diaHigh: ["High diastolic pressure", "May indicate acute cardiovascular risk."],
        diaLow: ["Low diastolic pressure", "May cause dizziness, weakness, cold sweating, or fainting."],
        pulseFast: ["Fast pulse", "May relate to arrhythmia, stress, dehydration, poor sleep, or illness."],
        pulseSlow: ["Slow pulse", "Seek care if dizziness, chest discomfort, or near-fainting occurs."],
        bmiHigh: ["High BMI", "Long-term metabolic, diabetes, and cardiovascular risks may increase."],
        bmiLow: ["Low BMI", "May relate to poor nutrition or low physical strength."],
        waistHigh: ["High waist circumference", "Abdominal obesity may increase metabolic and cardiovascular risks."]
      }
    },
    ja: {
      fill: "身長、体重、血圧、脈拍をすべて入力してください。",
      title: " 危険な健康数値",
      lead: "注意が必要な健康数値を検出しました。",
      abnormal: "異常項目",
      actions: "推奨される対応",
      emergency: "すぐに助けを求める状況",
      close: "閉じる",
      call: " 119に電話",
      normal: "今日の記録を保存しました。",
      actionList: ["まず活動を中止し、座るか半座位で休んでください。", "呼吸を整え、激しい運動や強いストレスを避けてください。", "5〜10分後にもう一度測定してください。", "異常値や体調不良が続く場合は早めに受診してください。"],
      emergencyText: "胸痛、呼吸困難、意識がはっきりしない、失神、激しい頭痛、視界のかすみ、片側の手足の力が入らない場合は、すぐに119へ通報してください。",
      risks: {
        sysHigh: ["収縮期血圧が高め", "高血圧緊急症、脳卒中、心血管への負担が高まる可能性があります。"],
        diaHigh: ["拡張期血圧が高め", "急性心血管リスクの可能性があります。"],
        diaLow: ["拡張期血圧が低め", "めまい、脱力感、冷や汗、失神につながる可能性があります。"],
        pulseFast: ["脈拍が速め", "不整脈、ストレス、脱水、睡眠不足、体調不良と関係する可能性があります。"],
        pulseSlow: ["脈拍が遅め", "めまい、胸の違和感、失神しそうな場合は早めに受診してください。"],
        bmiHigh: ["BMIが高め", "メタボリック症候群、糖尿病、心血管疾患のリスクが高まる可能性があります。"],
        bmiLow: ["BMIが低め", "栄養不足、筋力低下、体力低下と関係する可能性があります。"],
        waistHigh: ["腹囲が高め", "腹部肥満により代謝リスクや心血管リスクが高まる可能性があります。"]
      }
    }
  };

  function esc(v) {
    return String(v == null ? "" : v).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;").replace(/'/g,"&#39;");
  }

  function n(id) {
    const el = document.getElementById(id);
    const val = Number(el ? el.value : "");
    return Number.isFinite(val) ? val : 0;
  }

  function v(id) {
    const el = document.getElementById(id);
    return el ? el.value : "";
  }

  function bmi(height, weight) {
    const h = Number(height) / 100;
    const w = Number(weight);
    return h && w ? Number((w / (h * h)).toFixed(1)) : 0;
  }

  function riskKeys(data) {
    const keys = [];
    if (data.systolic >= 140) keys.push("sysHigh");
    if (data.diastolic >= 90) keys.push("diaHigh");
    if (data.diastolic > 0 && data.diastolic <= 50) keys.push("diaLow");
    if (data.pulse >= 100) keys.push("pulseFast");
    if (data.pulse > 0 && data.pulse <= 50) keys.push("pulseSlow");
    if (data.bmi >= 24) keys.push("bmiHigh");
    if (data.bmi > 0 && data.bmi < 18.5) keys.push("bmiLow");
    if (Number(data.waist) >= 90) keys.push("waistHigh");
    return keys;
  }

  function hideOld() {
    ["message-popup", "emergency-popup", "unified-emergency-popup", ALERT_ID].forEach(function(id) {
      const el = document.getElementById(id);
      if (!el) return;
      el.classList.add("hidden");
      el.classList.remove("is-open");
      el.setAttribute("aria-hidden", "true");
      el.style.setProperty("display", "none", "important");
      el.style.setProperty("pointer-events", "none", "important");
    });
    document.body.classList.remove("stable-alert-open");
    document.body.style.overflow = "";
  }

  function ensureAlert() {
    let root = document.getElementById(ALERT_ID);
    if (root) return root;
    root = document.createElement("div");
    root.id = ALERT_ID;
    root.className = "stable-red-alert hidden";
    root.innerHTML = '<div class="stable-red-box" role="dialog" aria-modal="true">' +
      '<h3 class="stable-red-title"></h3>' +
      '<div class="stable-red-body"></div>' +
      '<div class="stable-red-buttons"><button type="button" class="stable-red-call"></button><button type="button" class="stable-red-close"></button></div>' +
      '</div>';
    document.body.appendChild(root);

    root.addEventListener("click", function(e){ if (e.target === root) closeStableAlert(e); }, true);
    root.querySelector(".stable-red-close").addEventListener("click", closeStableAlert, true);
    root.querySelector(".stable-red-call").addEventListener("click", function(e) {
      e.preventDefault(); e.stopPropagation();
      try { window.location.href = "tel:119"; } catch(err) {}
    });
    return root;
  }

  function closeStableAlert(e) {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
      if (typeof e.stopImmediatePropagation === "function") e.stopImmediatePropagation();
    }
    hideOld();
  }

  function showHealthyPopup() {
  if (window.__healthyPopupShown) return;
  window.__healthyPopupShown = true;

  const old = document.getElementById("healthy-popup");
  if (old) old.remove();

  const popup = document.createElement("div");
  popup.id = "healthy-popup";
  popup.className = "mood-popup";

  popup.innerHTML = `
    <div class="popup-content">
      <p style="font-size:32px;margin-bottom:25px;">🌿</p>
      <p style="font-size:24px;">你今天的身體數值都很健康喔！</p>
      <p>今天的血壓、脈搏、BMI 等數值都在理想範圍內。</p>
      <p>請繼續保持規律作息、均衡飲食與適量運動。</p>
      <button onclick="closeHealthyPopup()">關閉</button>
    </div>
  `;

  document.body.appendChild(popup);
}

function closeHealthyPopup() {
  const popup = document.getElementById("healthy-popup");
  if (popup) popup.remove();
}

  function showHealthyPopup() {
    hideOld();

    const old = document.getElementById("healthy-popup");
    if (old) old.remove();

    const t = T[lang()] || T.zh;
    const content = {
      zh: {
        icon: "",
        title: "你今天的身體數值都很健康喔！",
        p1: "今天的血壓、脈搏、BMI 等數值都在理想範圍內。",
        p2: "請繼續保持規律作息、均衡飲食與適量運動，讓好狀態一天一天延續下去。",
        close: "關閉"
      },
      en: {
        icon: "",
        title: "Your health values look great today!",
        p1: "Your blood pressure, pulse, and BMI are within a good range.",
        p2: "Keep a regular routine, balanced diet, and suitable exercise to maintain this good condition.",
        close: "Close"
      },
      ja: {
        icon: "",
        title: "今日の健康数値はとても良好です！",
        p1: "血圧、脈拍、BMI などの数値は良い範囲にあります。",
        p2: "規則正しい生活、バランスのよい食事、適度な運動を続けて、この良い状態を保ちましょう。",
        close: "閉じる"
      }
    }[lang()] || {
      icon: "",
      title: "你今天的身體數值都很健康喔！",
      p1: "今天的血壓、脈搏、BMI 等數值都在理想範圍內。",
      p2: "請繼續保持規律作息、均衡飲食與適量運動，讓好狀態一天一天延續下去。",
      close: "關閉"
    };

    const popup = document.createElement("div");
    popup.id = "healthy-popup";
    popup.className = "mood-popup healthy-popup";
    popup.innerHTML =
      '<div class="popup-content healthy-popup-content" role="dialog" aria-modal="true">' +
        '<p class="healthy-popup-icon">' + esc(content.icon) + '</p>' +
        '<p class="healthy-popup-title">' + esc(content.title) + '</p>' +
        '<p>' + esc(content.p1) + '</p>' +
        '<p>' + esc(content.p2) + '</p>' +
        '<button type="button" class="healthy-popup-close">' + esc(content.close || t.close) + '</button>' +
      '</div>';

    popup.addEventListener("click", function(e) {
      if (e.target === popup) popup.remove();
    }, true);

    popup.querySelector(".healthy-popup-close").addEventListener("click", function(e) {
      e.preventDefault();
      e.stopPropagation();
      popup.remove();
    }, true);

    document.body.appendChild(popup);
  }

  function showStableAlert(data) {
    hideOld();
    const t = T[lang()] || T.zh;
    const root = ensureAlert();
    const keys = riskKeys(data);

    root.querySelector(".stable-red-title").textContent = t.title;
    root.querySelector(".stable-red-call").textContent = t.call;
    root.querySelector(".stable-red-close").textContent = t.close;

    root.querySelector(".stable-red-body").innerHTML =
      '<p class="stable-red-lead">' + esc(t.lead) + '</p>' +
      '<section><h4>' + esc(t.abnormal) + '</h4><ul class="stable-risk-list">' +
      keys.map(function(k) {
        const item = t.risks[k];
        return item ? '<li><strong>' + esc(item[0]) + '</strong><span>' + esc(item[1]) + '</span></li>' : '';
      }).join('') +
      '</ul></section>' +
      '<section><h4>' + esc(t.actions) + '</h4><ul class="stable-action-list">' +
      t.actionList.map(function(x){ return '<li>' + esc(x) + '</li>'; }).join('') +
      '</ul></section>' +
      '<section class="stable-emergency-note"><h4>' + esc(t.emergency) + '</h4><p>' + esc(t.emergencyText) + '</p></section>';

    root.classList.remove("hidden");
    root.classList.add("is-open");
    root.removeAttribute("aria-hidden");
    root.style.setProperty("display", "flex", "important");
    root.style.setProperty("pointer-events", "auto", "important");
    document.body.classList.add("stable-alert-open");
    document.body.style.overflow = "hidden";
  }

  function saveStableRecord(event) {
    if (event) {
      event.preventDefault();
      event.stopPropagation();
      if (typeof event.stopImmediatePropagation === "function") event.stopImmediatePropagation();
    }

    hideOld();

    const height = v("height");
    const weight = v("weight");
    const systolic = n("systolic");
    const diastolic = n("diastolic");
    const pulse = n("pulse");
    const chest = v("chest");
    const waist = v("waist");
    const hip = v("hip");
    const b = bmi(height, weight);
    const t = T[lang()] || T.zh;

    if (!height || !weight || !systolic || !diastolic || !pulse) {
      alert(t.fill);
      return false;
    }

    const data = {
      height, weight, systolic, diastolic, pulse, chest, waist, hip,
      mood: window.selectedMood || "",
      bmi: b
    };

    try {
      localStorage.setItem("healthData", JSON.stringify(data));
      let history = [];
      try { history = JSON.parse(localStorage.getItem("healthHistory") || "[]") || []; } catch(err) {}
      history.push({
        date: new Date().toISOString().slice(0,10),
        height, weight, systolic, diastolic, pulse, chest, waist, hip, bmi: b
      });
      if (history.length > 120) history = history.slice(-120);
      localStorage.setItem("healthHistory", JSON.stringify(history));
    } catch(err) {
      console.warn("save failed", err);
    }

    try { if (typeof updateRecordStatus === "function") updateRecordStatus(); } catch(err) {}
    try { if (typeof updateStreakDays === "function") updateStreakDays(); } catch(err) {}

    const homeScore = document.getElementById("home-score");
    if (homeScore) homeScore.textContent = "健康分數：" + (riskKeys(data).length ? "60" : "90") + " 分";

    if (riskKeys(data).length) {
      showStableAlert(data);
    } else {
      showHealthyPopup();
    }

    return false;
  }

  window.saveData = saveStableRecord;
  try { saveData = window.saveData; } catch(e) {}

  window.closeEmergencyPopup = closeStableAlert;
  window.hideEmergencyPopup = closeStableAlert;
  window.showEmergencyPopup = function(){ 
    let data = {};
    try { data = JSON.parse(localStorage.getItem("healthData") || "{}") || {}; } catch(e) {}
    showStableAlert(data);
  };

  try { closeEmergencyPopup = window.closeEmergencyPopup; } catch(e) {}
  try { showEmergencyPopup = window.showEmergencyPopup; } catch(e) {}

  document.addEventListener("click", function(event) {
    const target = event.target && event.target.closest ? event.target.closest("button") : null;
    if (!target) return;

    const onclick = (target.getAttribute("onclick") || "").toLowerCase();
    const text = (target.textContent || "").trim();

    // 只攔截「每日紀錄」的儲存按鈕，不要攔截心理量表的「Save Assessment Result」
const isDailyRecordSave =
  onclick.includes("savedata") ||
  target.classList.contains("save-btn") ||
  /儲存今日紀錄|Save Today[’']?s Record|今日の記録を保存/i.test(text);

if (isDailyRecordSave) {
  saveStableRecord(event);
}
  }, true);

  document.addEventListener("keydown", function(e){ if (e.key === "Escape") closeStableAlert(e); }, true);
})();



/* =========================================================
   FINAL REPORT STABILITY + RISK COLOR FIX
   修正：
   1. AI報告頁一直跳動：限制同一秒內重複刷新報告。
   2. 異常數值變紅色：身體數據/心血管指標超標會加紅色樣式。
   3. 回首頁按鈕往下移，不黏住小提醒。
   ========================================================= */
(function finalReportStabilityAndRiskColorFix() {
  const REPORT_IDS = [
    "report-height","report-weight","report-bmi","report-waist","report-hip","report-chest",
    "report-sbp","report-dbp","report-bp","report-pulse"
  ];

  function langNow() {
    const raw = String(
      window.currentLanguage ||
      window.currentLang ||
      localStorage.getItem("siteLanguage") ||
      localStorage.getItem("currentLang") ||
      localStorage.getItem("lang") ||
      "zh"
    ).toLowerCase();
    if (raw.startsWith("ja")) return "ja";
    if (raw.startsWith("en")) return "en";
    return "zh";
  }

  const TEXT = {
    zh: {
      noData: "請先完成每日紀錄。",
      normal: "目前健康數值大致穩定，請持續規律紀錄。",
      follow: "目前部分健康數值需要持續追蹤，建議注意血壓、脈搏與生活壓力變化。",
      risk: "系統偵測到較高風險健康數值，建議立即休息並密切觀察身體狀況。",
      adviceNormal: "目前沒有明顯異常，請持續維持規律作息與定期紀錄。",
      advice: {
        heightLow: "身高資料可能輸入異常，請確認是否填寫正確。",
        bmiHigh: "BMI 偏高，建議增加活動量並控制飲食。",
        bmiLow: "BMI 偏低，建議注意營養攝取與體力狀況。",
        bpHigh: "血壓偏高，建議固定時間量測並減少高鹽、高油食物。",
        bpLow: "血壓偏低，建議休息並注意頭暈、無力或冒冷汗。",
        pulseFast: "脈搏偏快，建議休息並觀察是否與壓力、咖啡因或睡眠不足有關。",
        pulseSlow: "脈搏偏慢，若合併頭暈或胸悶，建議就醫評估。",
        waistHigh: "腰圍偏高，建議注意腹部脂肪與代謝症候群風險。"
      }
    },
    en: {
      noData: "Please complete the daily record first.",
      normal: "Your health values are generally stable. Keep recording regularly.",
      follow: "Some health values require follow-up. Please monitor blood pressure, pulse, and lifestyle stress.",
      risk: "Higher-risk health values were detected. Please rest and observe your condition closely.",
      adviceNormal: "No obvious abnormality was detected. Keep a regular routine and record consistently.",
      advice: {
        heightLow: "Height data may be abnormal. Please confirm the input.",
        bmiHigh: "BMI is high. Increase activity and adjust diet.",
        bmiLow: "BMI is low. Pay attention to nutrition and physical strength.",
        bpHigh: "Blood pressure is high. Measure regularly and reduce salty or oily foods.",
        bpLow: "Blood pressure is low. Rest and watch for dizziness, weakness, or cold sweating.",
        pulseFast: "Pulse is fast. Rest and observe stress, caffeine, or poor sleep factors.",
        pulseSlow: "Pulse is slow. Seek care if dizziness or chest discomfort occurs.",
        waistHigh: "Waist circumference is high. Watch abdominal fat and metabolic syndrome risk."
      }
    },
    ja: {
      noData: "先に毎日の記録を完了してください。",
      normal: "今日の健康数値はおおむね安定しています。記録を続けましょう。",
      follow: "一部の健康数値は継続的な確認が必要です。血圧、脈拍、生活ストレスに注意してください。",
      risk: "リスクの高い健康数値を検出しました。まず休んで、体調を注意深く確認してください。",
      adviceNormal: "明らかな異常はありません。規則正しい生活と継続記録を続けましょう。",
      advice: {
        heightLow: "身長の入力値に異常の可能性があります。入力内容を確認してください。",
        bmiHigh: "BMIが高めです。活動量を増やし、食事を見直しましょう。",
        bmiLow: "BMIが低めです。栄養摂取と体力状態に注意してください。",
        bpHigh: "血圧が高めです。定期的に測定し、塩分や脂質を控えましょう。",
        bpLow: "血圧が低めです。休息し、めまい・脱力感・冷や汗に注意してください。",
        pulseFast: "脈拍が速めです。休息し、ストレス・カフェイン・睡眠不足を確認しましょう。",
        pulseSlow: "脈拍が遅めです。めまいや胸の違和感がある場合は受診してください。",
        waistHigh: "腹囲が高めです。腹部脂肪と代謝リスクに注意してください。"
      }
    }
  };

  function esc(value) {
    return String(value == null ? "" : value)
      .replace(/&/g, "&amp;").replace(/</g, "&lt;")
      .replace(/>/g, "&gt;").replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  function getData() {
    try {
      const data = JSON.parse(localStorage.getItem("healthData") || "null");
      if (data && typeof data === "object") return data;
    } catch (e) {}

    try {
      const history = JSON.parse(localStorage.getItem("healthHistory") || "[]");
      if (Array.isArray(history) && history.length) return history[history.length - 1];
    } catch (e) {}

    return null;
  }

  function calcBMI(height, weight) {
    const h = Number(height) / 100;
    const w = Number(weight);
    if (!h || !w) return 0;
    return Number((w / (h * h)).toFixed(1));
  }

  function setText(id, value) {
    const el = document.getElementById(id);
    if (!el) return;
    const empty = value === undefined || value === null || value === "" || Number.isNaN(value);
    el.textContent = empty ? "--" : String(value);
  }

  function clearRiskClasses() {
    REPORT_IDS.forEach(function(id) {
      const el = document.getElementById(id);
      if (!el) return;
      el.classList.remove("report-risk-red", "report-risk-orange", "report-risk-normal");
      const p = el.closest("p");
      if (p) p.classList.remove("report-line-risk-red", "report-line-risk-orange");
    });
  }

  function mark(id, type) {
    const el = document.getElementById(id);
    if (!el) return;
    const cls = type === "red" ? "report-risk-red" : "report-risk-orange";
    const lineCls = type === "red" ? "report-line-risk-red" : "report-line-risk-orange";
    el.classList.add(cls);
    const p = el.closest("p");
    if (p) p.classList.add(lineCls);
  }

  function buildRisks(data) {
    const risks = [];
    const height = Number(data.height) || 0;
    const bmi = Number(data.bmi) || 0;
    const systolic = Number(data.systolic) || 0;
    const diastolic = Number(data.diastolic) || 0;
    const pulse = Number(data.pulse) || 0;
    const waist = Number(data.waist) || 0;

    if (height > 0 && height < 120) risks.push(["heightLow", "orange", ["report-height"]]);
    if (bmi >= 30) risks.push(["bmiHigh", "red", ["report-bmi"]]);
    else if (bmi >= 24) risks.push(["bmiHigh", "orange", ["report-bmi"]]);
    else if (bmi > 0 && bmi < 18.5) risks.push(["bmiLow", "orange", ["report-bmi"]]);

    if (systolic >= 180 || diastolic >= 120) risks.push(["bpHigh", "red", ["report-sbp", "report-dbp", "report-bp"]]);
    else if (systolic >= 140 || diastolic >= 90) risks.push(["bpHigh", "orange", ["report-sbp", "report-dbp", "report-bp"]]);
    else if (systolic > 0 && systolic <= 90 || diastolic > 0 && diastolic <= 60) risks.push(["bpLow", "orange", ["report-sbp", "report-dbp", "report-bp"]]);

    if (pulse >= 140 || (pulse > 0 && pulse <= 40)) risks.push([pulse >= 140 ? "pulseFast" : "pulseSlow", "red", ["report-pulse"]]);
    else if (pulse >= 100 || (pulse > 0 && pulse < 50)) risks.push([pulse >= 100 ? "pulseFast" : "pulseSlow", "orange", ["report-pulse"]]);

    if (waist >= 90) risks.push(["waistHigh", "orange", ["report-waist"]]);

    return risks;
  }

  let lastReportSnapshot = "";
  let lastReportTime = 0;

  function refreshReportStable(force) {
    const page = document.getElementById("report-page");
    if (!page) return;

    const now = Date.now();
    const data = getData();
    const snapshot = JSON.stringify(data || {});

    // 避免舊的 setTimeout/observer 一直重繪造成畫面跳動
    if (!force && snapshot === lastReportSnapshot && now - lastReportTime < 700) return;
    lastReportSnapshot = snapshot;
    lastReportTime = now;

    const lang = langNow();
    const t = TEXT[lang] || TEXT.zh;
    clearRiskClasses();

    if (!data) {
      ["report-height","report-weight","report-bmi","report-waist","report-hip","report-chest","report-sbp","report-dbp","report-pulse"].forEach(function(id) {
        setText(id, "--");
      });
      setText("report-bp", "-- / --");

      const summary = document.getElementById("report-summary");
      if (summary) summary.textContent = t.noData;

      const advice = document.getElementById("report-advice");
      if (advice) advice.innerHTML = "<li>" + esc(t.noData) + "</li>";
      return;
    }

    const bmi = Number(data.bmi) || calcBMI(data.height, data.weight);
    data.bmi = bmi;

    setText("report-height", data.height);
    setText("report-weight", data.weight);
    setText("report-bmi", bmi);
    setText("report-waist", data.waist);
    setText("report-hip", data.hip);
    setText("report-chest", data.chest);
    setText("report-sbp", data.systolic);
    setText("report-dbp", data.diastolic);
    setText("report-bp", (data.systolic || "--") + " / " + (data.diastolic || "--"));
    setText("report-pulse", data.pulse);

    const risks = buildRisks(data);
    risks.forEach(function(r) {
      r[2].forEach(function(id) { mark(id, r[1]); });
    });

    const summary = document.getElementById("report-summary");
    if (summary) {
      const redCount = risks.filter(r => r[1] === "red").length;
      summary.textContent = redCount ? t.summaryRisk : risks.length ? t.summaryFollow : t.summaryNormal;
      summary.classList.remove("report-summary-red", "report-summary-orange", "report-summary-normal");
      summary.classList.add(redCount ? "report-summary-red" : risks.length ? "report-summary-orange" : "report-summary-normal");
    }

    const advice = document.getElementById("report-advice");
    if (advice) {
      const list = risks.length
        ? risks.map(function(r) {
            const key = r[0];
            return t.advice[key] || "";
          }).filter(Boolean)
        : [t.adviceNormal];

      advice.innerHTML = list.map(function(line) {
        return "<li>" + esc(line) + "</li>";
      }).join("");
    }
  }

  // 覆蓋舊報告刷新入口
  window.refreshReportValues = function() { refreshReportStable(true); };
  window.refreshAIReportFinalV2 = function() { refreshReportStable(true); };

  // 攔截 showPage，只在進入報告頁時刷新一次
  const oldShowPage = window.showPage || (typeof showPage === "function" ? showPage : null);
  if (typeof oldShowPage === "function") {
    window.showPage = function(pageId) {
      const result = oldShowPage.apply(this, arguments);
      if (pageId === "report-page") {
        setTimeout(function() { refreshReportStable(true); }, 80);
      }
      return result;
    };
    try { showPage = window.showPage; } catch(e) {}
  }

  // 也攔截 setTimeout 反覆刷新 report 的情況：只允許最後一次有效
  const oldSetTimeout = window.setTimeout;
  window.setTimeout = function(fn, delay) {
    if (typeof fn === "function") {
      const src = Function.prototype.toString.call(fn);
      if (src.includes("renderAIReportFinalV2") || src.includes("refreshAIReportFinalV2")) {
        return oldSetTimeout(function() { refreshReportStable(false); }, Math.max(Number(delay) || 0, 120));
      }
    }
    return oldSetTimeout.apply(window, arguments);
  };

  // 儲存後立即刷新報告
  const oldSaveData = window.saveData || (typeof saveData === "function" ? saveData : null);
  if (typeof oldSaveData === "function") {
    window.saveData = function() {
      const result = oldSaveData.apply(this, arguments);
      setTimeout(function() { refreshReportStable(true); }, 150);
      return result;
    };
    try { saveData = window.saveData; } catch(e) {}
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", function() {
      setTimeout(function() { refreshReportStable(true); }, 200);
    });
  } else {
    setTimeout(function() { refreshReportStable(true); }, 200);
  }
})();


/* =========================================================
   CHECKGPT HARD STABILITY PATCH V2
   目標：停止首頁一直抖動 / 跳動。
   1. 鎖定首頁捲動位置。
   2. 停止 smooth scroll。
   3. 追蹤並在首頁穩定後關閉自動 DOM 監聽翻譯，避免反覆重排。
   這段放在檔案最後面。
   ========================================================= */
(function checkGptHardStabilityPatchV2() {
  if (window.__CHECKGPT_HARD_STABILITY_V2__) return;
  window.__CHECKGPT_HARD_STABILITY_V2__ = true;

  // 全站關閉平滑捲動，避免頁面載入或切換時上下滑動造成「跳」的感覺。
  try {
    document.documentElement.style.scrollBehavior = "auto";
    document.body.style.scrollBehavior = "auto";
  } catch (e) {}

  // 追蹤之後建立的 MutationObserver；首頁穩定後會先關掉，避免重複翻譯造成重排。
  const PreviousMutationObserver = window.MutationObserver;
  const trackedObservers = [];

  if (PreviousMutationObserver && !window.__CHECKGPT_MUTATION_TRACKER_V2__) {
    window.__CHECKGPT_MUTATION_TRACKER_V2__ = true;

    window.MutationObserver = function CheckGptTrackedMutationObserver(callback) {
      const wrapped = function(mutations, observer) {
        // 首頁可見時，不再因為文字/節點變動反覆觸發整頁翻譯。
        const home = document.getElementById("home-page");
        const isHomeVisible = home && !home.classList.contains("hidden");

        if (isHomeVisible && window.__CHECKGPT_HOME_LOCKED__) {
          return;
        }

        try {
          callback(mutations, observer);
        } catch (e) {
          console.warn("MutationObserver callback stopped by stability patch:", e);
        }
      };

      const observer = new PreviousMutationObserver(wrapped);
      trackedObservers.push(observer);
      return observer;
    };

    window.MutationObserver.prototype = PreviousMutationObserver.prototype;
    window.__CHECKGPT_TRACKED_OBSERVERS_V2__ = trackedObservers;
  }

  function isHomeVisible() {
    const home = document.getElementById("home-page");
    return !!home && !home.classList.contains("hidden");
  }

  function lockHomeLayout() {
    if (!isHomeVisible()) return;

    window.__CHECKGPT_HOME_LOCKED__ = true;

    // 強制固定在頁首，不使用平滑捲動。
    try {
      window.scrollTo(0, 0);
      document.documentElement.scrollTop = 0;
      document.body.scrollTop = 0;
    } catch (e) {}

    // 首頁穩定後，關掉已建立的 observer，避免它們持續重繪文字。
    try {
      const observers = window.__CHECKGPT_TRACKED_OBSERVERS_V2__ || trackedObservers;
      observers.forEach(function(observer) {
        try { observer.disconnect(); } catch (e) {}
      });
    } catch (e) {}
  }

  function unlockWhenLeavingHome() {
    const oldShowPage = window.showPage || (typeof showPage === "function" ? showPage : null);

    if (typeof oldShowPage !== "function" || oldShowPage.__checkGptStabilityWrapped) return;

    const wrappedShowPage = function(pageId) {
      window.__CHECKGPT_HOME_LOCKED__ = false;
      const result = oldShowPage.apply(this, arguments);

      setTimeout(function() {
        if (pageId === "home-page") {
          lockHomeLayout();
        }
      }, 250);

      return result;
    };

    wrappedShowPage.__checkGptStabilityWrapped = true;
    window.showPage = wrappedShowPage;

    try {
      showPage = window.showPage;
    } catch (e) {}
  }

  function start() {
    unlockWhenLeavingHome();

    // 多跑幾次，避開圖片 / 字型 / 翻譯初始化造成的重排。
    setTimeout(lockHomeLayout, 250);
    setTimeout(lockHomeLayout, 700);
    setTimeout(lockHomeLayout, 1300);
    setTimeout(lockHomeLayout, 2200);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", start);
  } else {
    start();
  }
})();


/* Phoebe: 首頁身高體重預設清空 */
(function clearDefaultHeightWeightOnHome() {
  function run() {
    const heightKeys = ["healthHeight", "height", "userHeight", "lastHeight", "recordHeight"];
    const weightKeys = ["healthWeight", "weight", "userWeight", "lastWeight", "recordWeight"];

    const hasHeight = heightKeys.some(k => {
      const v = localStorage.getItem(k);
      return v && String(v).trim() && String(v).trim() !== "165";
    });
    const hasWeight = weightKeys.some(k => {
      const v = localStorage.getItem(k);
      return v && String(v).trim() && String(v).trim() !== "62";
    });

    const heightSelectors = [
      "#home-height-value", "#height-display", "#heightValue", "#homeHeight",
      ".home-height-value", ".height-display", "[data-home-height]"
    ];
    const weightSelectors = [
      "#home-weight-value", "#weight-display", "#weightValue", "#homeWeight",
      ".home-weight-value", ".weight-display", "[data-home-weight]"
    ];

    function setText(selectors, text, forbiddenPattern) {
      selectors.forEach(sel => {
        document.querySelectorAll(sel).forEach(el => {
          if (!hasHeight && text.includes("身高") || !hasWeight && text.includes("體重")) {
            el.textContent = text;
          }
        });
      });

      document.querySelectorAll(".phoebe-metric-box, .metric-box, .mini-bmi-box, .bmi-mini-box").forEach(box => {
        const t = box.textContent || "";
        if (forbiddenPattern.test(t)) {
          const small = box.querySelector("small, .metric-value, .metric-number, span:last-child, div:last-child, p:last-child");
          if (small) small.textContent = text;
        }
      });
    }

    if (!hasHeight) {
      document.querySelectorAll(".phoebe-metric-box, .metric-box").forEach(box => {
        if ((box.textContent || "").includes("身高")) {
          const parts = Array.from(box.querySelectorAll("span, small, div, p"));
          const target = parts.find(el => /165|身高 cm/.test(el.textContent || "") && !/身高$/.test(el.textContent || ""));
          if (target) target.textContent = "身高 cm";
        }
      });
      heightSelectors.forEach(sel => document.querySelectorAll(sel).forEach(el => el.textContent = "身高 cm"));
    }

    if (!hasWeight) {
      document.querySelectorAll(".phoebe-metric-box, .metric-box").forEach(box => {
        if ((box.textContent || "").includes("體重")) {
          const parts = Array.from(box.querySelectorAll("span, small, div, p"));
          const target = parts.find(el => /62|體重 kg/.test(el.textContent || "") && !/體重$/.test(el.textContent || ""));
          if (target) target.textContent = "體重 kg";
        }
      });
      weightSelectors.forEach(sel => document.querySelectorAll(sel).forEach(el => el.textContent = "體重 kg"));
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", run);
  } else {
    run();
  }
  window.addEventListener("load", run);
  setTimeout(run, 100);
  setTimeout(run, 500);
})();


function showPage(pageId) {
  // 先把所有頁面藏起來
  document.querySelectorAll(".page").forEach(function (page) {
    page.classList.add("hidden");
  });

  // 再顯示指定頁面
  const targetPage = document.getElementById(pageId);
  if (targetPage) {
    targetPage.classList.remove("hidden");
  }

  // 跳到頁面最上方，不要停在下面
  window.scrollTo({
    top: 0,
    behavior: "smooth"
  });
}
/* =========================================================
   FINAL PAGE SWITCH FIX
   修正：避免 hidden 的首頁仍佔高度，造成第二頁上方大空白
   ========================================================= */
(function () {
  function hardHidePage(page) {
    if (!page) return;
    page.classList.add("hidden");
    page.setAttribute("aria-hidden", "true");
    page.style.setProperty("display", "none", "important");
    page.style.setProperty("visibility", "hidden", "important");
    page.style.setProperty("opacity", "0", "important");
    page.style.setProperty("height", "0", "important");
    page.style.setProperty("min-height", "0", "important");
    page.style.setProperty("max-height", "0", "important");
    page.style.setProperty("padding", "0", "important");
    page.style.setProperty("margin", "0", "important");
    page.style.setProperty("overflow", "hidden", "important");
  }

  function hardShowPage(page) {
    if (!page) return;
    page.classList.remove("hidden");
    page.removeAttribute("aria-hidden");

    page.style.setProperty("display", "block", "important");
    page.style.setProperty("visibility", "visible", "important");
    page.style.setProperty("opacity", "1", "important");

    page.style.removeProperty("height");
    page.style.removeProperty("min-height");
    page.style.removeProperty("max-height");
    page.style.removeProperty("padding");
    page.style.removeProperty("margin");
    page.style.removeProperty("overflow");
  }

  window.showPage = function showPage(pageId) {
    document.querySelectorAll(".page").forEach(hardHidePage);

    const targetPage = document.getElementById(pageId);
    if (!targetPage) {
      alert("找不到頁面：" + pageId);
      return;
    }

    hardShowPage(targetPage);

    const isHome = pageId === "home-page";
    document.body.classList.toggle("sub-page-mode", !isHome);

    const header = document.querySelector("header");
    if (header) {
      if (isHome) {
        header.style.removeProperty("display");
      } else {
        header.style.setProperty("display", "none", "important");
      }
    }

    if (pageId === "quiz-menu-page" && typeof updateQuizMenuLabel === "function") {
      updateQuizMenuLabel();
    }

    if (pageId === "quiz-page") {
      if (typeof startNewQuizRound === "function") startNewQuizRound(currentLevel);
      if (typeof loadQuestion === "function") loadQuestion();
      if (typeof updateQuizProgress === "function") updateQuizProgress();
    }

    if (pageId === "chart-page" && typeof window.forceRefreshTrendButtons === "function") {
      setTimeout(window.forceRefreshTrendButtons, 60);
    }

    if (pageId === "report-page" && typeof window.renderAIReportFinalV2 === "function") {
      setTimeout(window.renderAIReportFinalV2, 120);
    }

    window.scrollTo(0, 0);
  };

  try {
    showPage = window.showPage;
  } catch (e) {}
})();

/* ===== 純中文版最終設定：移除語言切換功能，只保留中文 ===== */
(function chineseOnlyFinal() {
  function forceChineseOnly() {
    try {
      window.currentLanguage = "zh";
      if (typeof currentLanguage !== "undefined") currentLanguage = "zh";
      localStorage.setItem("siteLanguage", "zh");
      localStorage.removeItem("language");
      localStorage.removeItem("lang");
      localStorage.removeItem("currentLang");
      localStorage.removeItem("currentLanguage");
    } catch (e) {}

    document.documentElement.lang = "zh-TW";
    if (document.body) {
      document.body.classList.remove("lang-en", "lang-ja");
      document.body.classList.add("lang-zh");
    }

    document.querySelectorAll(".language-switch, #language-menu, .language-menu, .lang-menu, .lang-option, .language-btn, .language-toggle").forEach(function (el) {
      el.remove();
    });
  }

  window.setLanguage = function () {
    forceChineseOnly();
    return false;
  };

  window.toggleLangMenu = function (event) {
    if (event) {
      event.preventDefault();
      event.stopPropagation();
    }
    forceChineseOnly();
    return false;
  };

  document.addEventListener("DOMContentLoaded", forceChineseOnly);
  forceChineseOnly();
})();



/* =========================================================
   Phoebe FORCE Earth Button Colors
   用 inline !important 強制覆蓋首頁按鈕顏色，避免被前面多段 CSS 蓋回紫色/咖啡色。
   ========================================================= */
(function forceEarthButtonColorsFinal() {
  const earthMain = '#d4c3ad';     // 燕麥奶茶
  const earthHover = '#cbb79f';
  const earthSoft = '#e9dfd2';     // 淡燕麥
  const earthOutline = '#f8f4ee';  // 米白
  const earthBorder = '#b79f86';
  const earthText = '#4f4337';

  function setImportant(el, prop, value) {
    if (!el || !el.style) return;
    el.style.setProperty(prop, value, 'important');
  }

  function isHomeButton(btn) {
    if (!btn || !btn.closest) return false;
    return !!btn.closest('#home-page');
  }

  function textOf(el) {
    return (el && el.textContent ? el.textContent : '').replace(/\s+/g, ' ').trim();
  }

  function paintFilled(btn) {
    setImportant(btn, 'background', earthMain);
    setImportant(btn, 'background-image', 'none');
    setImportant(btn, 'border', '1.5px solid ' + earthBorder);
    setImportant(btn, 'color', earthText);
    setImportant(btn, 'box-shadow', 'none');
    setImportant(btn, 'text-shadow', 'none');
  }

  function paintSoft(btn) {
    setImportant(btn, 'background', earthSoft);
    setImportant(btn, 'background-image', 'none');
    setImportant(btn, 'border', '1.5px solid #c7b39d');
    setImportant(btn, 'color', '#5b4e42');
    setImportant(btn, 'box-shadow', 'none');
    setImportant(btn, 'text-shadow', 'none');
  }

  function paintOutline(btn) {
    setImportant(btn, 'background', earthOutline);
    setImportant(btn, 'background-image', 'none');
    setImportant(btn, 'border', '1.5px solid #bca58e');
    setImportant(btn, 'color', '#5d4f43');
    setImportant(btn, 'box-shadow', 'none');
    setImportant(btn, 'text-shadow', 'none');
  }

  function applyEarthButtons() {
    document.querySelectorAll('#home-page button, #home-page .phoebe-chat, #home-page .phoebe-score').forEach(function(btn) {
      if (!isHomeButton(btn)) return;
      const t = textOf(btn);

      const filledByClass = btn.matches([
        '.phoebe-btn-gold',
        '.phoebe-btn-purple',
        '.phoebe-btn-blue',
        '.home-gold-btn',
        '.home-purple-btn',
        '.home-blue-btn',
        '.main-btn',
        '.chart-btn',
        '.edu-entry-btn',
        '.sos-clean-primary',
        '.sos-btn-primary'
      ].join(','));

      const filledByText =
        t.includes('撥打 119') ||
        t.includes('輸入健康數據') ||
        t.includes('查看 AI 健檢報告') ||
        t.includes('查看AI健檢報告') ||
        t.includes('查看健康折線圖') ||
        t.includes('瀏覽衛教知識') ||
        t.includes('閱讀健康知識');

      const outlineByClass = btn.matches('.phoebe-btn-outline,.home-outline-btn,.safe-btn,.sos-clean-outline,.sos-btn-outline');
      const outlineByText = t.includes('附近醫院') || t.includes('附近急診') || t.includes('今日尚未紀錄');

      const softByClass = btn.matches('.phoebe-btn-soft,.bmi-btn,.status-btn');
      const softByText = t.includes('查看 BMI') || t.includes('查看BMI');

      if (filledByClass || filledByText) paintFilled(btn);
      if (outlineByClass || outlineByText) paintOutline(btn);
      if (softByClass || softByText) paintSoft(btn);
    });

    document.querySelectorAll('#home-page .phoebe-chat-arrow, #home-page .chat-arrow').forEach(function(el) {
      setImportant(el, 'background', earthMain);
      setImportant(el, 'background-image', 'none');
      setImportant(el, 'border', '1.5px solid ' + earthBorder);
      setImportant(el, 'color', '#fffaf4');
      setImportant(el, 'box-shadow', 'none');
    });
  }

  function installHoverGuard() {
    document.addEventListener('mouseover', function(e) {
      const btn = e.target && e.target.closest ? e.target.closest('#home-page button, #home-page .phoebe-chat, #home-page .phoebe-score') : null;
      if (!btn) return;
      applyEarthButtons();
    }, true);
  }

  let scheduled = false;
  function scheduleApply() {
    if (scheduled) return;
    scheduled = true;
    requestAnimationFrame(function() {
      scheduled = false;
      applyEarthButtons();
    });
  }

  document.addEventListener('DOMContentLoaded', function() {
    applyEarthButtons();
    installHoverGuard();
    const home = document.getElementById('home-page');
    if (home && window.MutationObserver) {
      new MutationObserver(scheduleApply).observe(home, { childList: true, subtree: true });
    }
  });

  window.addEventListener('load', applyEarthButtons);
  setTimeout(applyEarthButtons, 100);
  setTimeout(applyEarthButtons, 600);
  setTimeout(applyEarthButtons, 1500);
})();
/* =========================================================
   final fix：修正血壓偵測邏輯
   125 / 36 會正確判斷：
   1. 收縮壓 125 = 高血壓前期
   2. 舒張壓 36 = 舒張壓過低，危險異常
   貼在 script.js 最底部
   ========================================================= */
(function finalBloodPressureDetectFix() {
  const ALERT_ID = "stable-red-alert";

  function getValue(id) {
    const el = document.getElementById(id);
    return el ? el.value : "";
  }

  function getNumber(id) {
    const value = Number(getValue(id));
    return Number.isFinite(value) ? value : 0;
  }

  function calcBMI(height, weight) {
    const h = Number(height) / 100;
    const w = Number(weight);
    if (!h || !w) return 0;
    return Number((w / (h * h)).toFixed(1));
  }

  function getHealthDataFromForm() {
    const height = getValue("height");
    const weight = getValue("weight");
    const systolic = getNumber("systolic");
    const diastolic = getNumber("diastolic");
    const pulse = getNumber("pulse");
    const chest = getValue("chest");
    const waist = getValue("waist");
    const hip = getValue("hip");
    const bmi = calcBMI(height, weight);

    return {
      height,
      weight,
      systolic,
      diastolic,
      pulse,
      chest,
      waist,
      hip,
      bmi
    };
  }

  function getHealthDataFromStorage() {
    try {
      const data = JSON.parse(localStorage.getItem("healthData") || "null");
      if (data && typeof data === "object") return data;
    } catch (e) {}

    return null;
  }

  function buildHealthRisks(data) {
    const risks = [];

    const systolic = Number(data.systolic) || 0;
    const diastolic = Number(data.diastolic) || 0;
    const pulse = Number(data.pulse) || 0;
    const bmi = Number(data.bmi) || 0;
    const waist = Number(data.waist) || 0;

    /* ===== 收縮壓判斷 ===== */
    if (systolic >= 180) {
      risks.push({
        level: "danger",
        title: "收縮壓危險偏高",
        detail: `目前收縮壓為 ${systolic} mmHg，已達危險偏高範圍，需注意高血壓危象、腦血管與心血管風險。`
      });
    }
    else if (systolic >= 140) {
      risks.push({
        level: "warning",
        title: "收縮壓偏高",
        detail: `目前收縮壓為 ${systolic} mmHg，已達高血壓範圍，建議固定時間追蹤並注意飲食與作息。`
      });
    }
    else if (systolic >= 120) {
      risks.push({
        level: "warning",
        title: "收縮壓偏高／高血壓前期",
        detail: `目前收縮壓為 ${systolic} mmHg，正常收縮壓應小於 120 mmHg，建議持續追蹤。`
      });
    }
    else if (systolic > 0 && systolic < 90) {
      risks.push({
        level: "warning",
        title: "收縮壓偏低",
        detail: `目前收縮壓為 ${systolic} mmHg，可能偏低，若有頭暈、冒冷汗或無力需多加注意。`
      });
    }

    /* ===== 舒張壓判斷 ===== */
    if (diastolic >= 120) {
      risks.push({
        level: "danger",
        title: "舒張壓危險偏高",
        detail: `目前舒張壓為 ${diastolic} mmHg，已達危險偏高範圍，需注意急性心血管風險。`
      });
    }
    else if (diastolic >= 90) {
      risks.push({
        level: "warning",
        title: "舒張壓偏高",
        detail: `目前舒張壓為 ${diastolic} mmHg，已達高血壓範圍，建議持續追蹤。`
      });
    }
    else if (diastolic >= 80) {
      risks.push({
        level: "warning",
        title: "舒張壓偏高／高血壓前期",
        detail: `目前舒張壓為 ${diastolic} mmHg，正常舒張壓應小於 80 mmHg。`
      });
    }
    else if (diastolic > 0 && diastolic < 60) {
      risks.push({
        level: diastolic <= 50 ? "danger" : "warning",
        title: "舒張壓過低",
        detail: `目前舒張壓為 ${diastolic} mmHg，低於正常範圍，可能出現頭暈、無力、冒冷汗或昏倒風險。`
      });
    }

    /* ===== 脈搏判斷 ===== */
    if (pulse >= 140) {
      risks.push({
        level: "danger",
        title: "脈搏過快",
        detail: `目前脈搏為 ${pulse} bpm，偏快明顯，需注意心律不整、壓力、發燒或身體不適。`
      });
    }
    else if (pulse > 100) {
      risks.push({
        level: "warning",
        title: "脈搏偏快",
        detail: `目前脈搏為 ${pulse} bpm，建議休息後重新量測。`
      });
    }
    else if (pulse > 0 && pulse <= 40) {
      risks.push({
        level: "danger",
        title: "脈搏過慢",
        detail: `目前脈搏為 ${pulse} bpm，若合併頭暈、胸悶或快昏倒，建議儘速就醫。`
      });
    }
    else if (pulse > 0 && pulse < 50) {
      risks.push({
        level: "warning",
        title: "脈搏偏慢",
        detail: `目前脈搏為 ${pulse} bpm，建議觀察是否有頭暈或疲倦。`
      });
    }

    /* ===== BMI 判斷 ===== */
    if (bmi >= 27) {
      risks.push({
        level: "warning",
        title: "BMI 過高",
        detail: `目前 BMI 為 ${bmi}，長期可能增加代謝症候群、糖尿病與心血管疾病風險。`
      });
    }
    else if (bmi >= 24) {
      risks.push({
        level: "warning",
        title: "BMI 偏高",
        detail: `目前 BMI 為 ${bmi}，建議注意飲食、活動量與腰圍變化。`
      });
    }
    else if (bmi > 0 && bmi < 18.5) {
      risks.push({
        level: "warning",
        title: "BMI 偏低",
        detail: `目前 BMI 為 ${bmi}，可能與營養不足或體力下降有關。`
      });
    }

    /* ===== 腰圍判斷 ===== */
    if (waist >= 90) {
      risks.push({
        level: "warning",
        title: "腰圍偏高",
        detail: `目前腰圍為 ${waist} cm，腹部脂肪可能增加代謝症候群與心血管疾病風險。`
      });
    }

    return risks;
  }

  function saveHealthData(data) {
    localStorage.setItem("healthData", JSON.stringify(data));

    let history = [];
    try {
      history = JSON.parse(localStorage.getItem("healthHistory") || "[]") || [];
    } catch (e) {}

    history.push({
      date: new Date().toISOString().slice(0, 10),
      ...data
    });

    if (history.length > 120) {
      history = history.slice(-120);
    }

    localStorage.setItem("healthHistory", JSON.stringify(history));
  }

  function ensureRiskPopup() {
    let popup = document.getElementById(ALERT_ID);

    if (popup) return popup;

    popup = document.createElement("div");
    popup.id = ALERT_ID;
    popup.className = "stable-red-alert hidden";

    popup.innerHTML = `
      <div class="stable-red-box" role="dialog" aria-modal="true">
        <h3 class="stable-red-title">危險健康數值</h3>
        <div class="stable-red-body"></div>
        <div class="stable-red-buttons">
          <button type="button" class="stable-red-call">撥打 119</button>
          <button type="button" class="stable-red-close">關閉</button>
        </div>
      </div>
    `;

    document.body.appendChild(popup);

    popup.querySelector(".stable-red-call").addEventListener("click", function () {
      window.location.href = "tel:119";
    });

    popup.querySelector(".stable-red-close").addEventListener("click", closeRiskPopup);

    popup.addEventListener("click", function (event) {
      if (event.target === popup) closeRiskPopup();
    });

    return popup;
  }

  function closeRiskPopup(event) {
    if (event) {
      event.preventDefault();
      event.stopPropagation();
    }

    const popup = document.getElementById(ALERT_ID);
    if (!popup) return;

    popup.classList.add("hidden");
    popup.classList.remove("is-open");
    popup.setAttribute("aria-hidden", "true");
    popup.style.setProperty("display", "none", "important");
    popup.style.setProperty("pointer-events", "none", "important");

    document.body.classList.remove("stable-alert-open");
    document.body.style.overflow = "";
  }

  function showRiskPopup(risks) {
    const popup = ensureRiskPopup();
    const body = popup.querySelector(".stable-red-body");
    const title = popup.querySelector(".stable-red-title");

    const hasDanger = risks.some(item => item.level === "danger");

    title.textContent = hasDanger ? "危險健康數值" : "需要注意的健康數值";

    body.innerHTML = `
      <p class="stable-red-lead">
        注意：系統偵測到需要關注的健康數值。
      </p>

      <section>
        <h4>異常項目</h4>
        <ul class="stable-risk-list">
          ${risks.map(item => `
            <li>
              <strong>${item.title}</strong>
              <span>${item.detail}</span>
            </li>
          `).join("")}
        </ul>
      </section>

      <section>
        <h4>建議處置</h4>
        <ul class="stable-action-list">
          <li>請先停止活動，坐下或半躺休息。</li>
          <li>保持呼吸平穩，避免劇烈運動與情緒激動。</li>
          <li>5～10 分鐘後重新量測一次。</li>
          <li>若不適或數值持續異常，請儘速就醫。</li>
        </ul>
      </section>

      <section class="stable-emergency-note">
        <h4>立即求助情況</h4>
        <p>
          若出現胸痛、呼吸困難、意識不清、昏倒、劇烈頭痛、視力模糊或單側肢體無力，請立即撥打 119。
        </p>
      </section>
    `;

    popup.classList.remove("hidden");
    popup.classList.add("is-open");
    popup.removeAttribute("aria-hidden");
    popup.style.setProperty("display", "flex", "important");
    popup.style.setProperty("pointer-events", "auto", "important");

    document.body.classList.add("stable-alert-open");
    document.body.style.overflow = "hidden";
  }

  function showHealthyPopupFixed() {
    const old = document.getElementById("healthy-popup");
    if (old) old.remove();

    const popup = document.createElement("div");
    popup.id = "healthy-popup";
    popup.className = "mood-popup";

    popup.innerHTML = `
      <div class="popup-content">
        <p style="font-size:32px;margin-bottom:25px;">🌿</p>
        <p style="font-size:24px;">你今天的身體數值都很健康喔！</p>
        <p>今天的血壓、脈搏、BMI 等數值都在理想範圍內。</p>
        <p>請繼續保持規律作息、均衡飲食與適量運動。</p>
        <button type="button" onclick="document.getElementById('healthy-popup')?.remove()">關閉</button>
      </div>
    `;

    document.body.appendChild(popup);
  }

  function saveDataFixed(event) {
    if (event) {
      event.preventDefault();
      event.stopPropagation();
      if (typeof event.stopImmediatePropagation === "function") {
        event.stopImmediatePropagation();
      }
    }

    const data = getHealthDataFromForm();

    if (!data.height || !data.weight || !data.systolic || !data.diastolic || !data.pulse) {
      alert("請填寫完整基本資料：身高、體重、血壓、脈搏！");
      return false;
    }

    saveHealthData(data);

    try {
      if (typeof updateRecordStatus === "function") updateRecordStatus();
      if (typeof updateStreakDays === "function") updateStreakDays();
    } catch (e) {}

    const risks = buildHealthRisks(data);

    const homeScore = document.getElementById("home-score");
    if (homeScore) {
      const dangerCount = risks.filter(item => item.level === "danger").length;
      const warningCount = risks.length - dangerCount;
      const score = Math.max(0, 100 - dangerCount * 25 - warningCount * 12);
      homeScore.textContent = `健康分數：${score} 分`;
      homeScore.dataset.score = score;
    }

    if (risks.length > 0) {
      showRiskPopup(risks);
    } else {
      showHealthyPopupFixed();
    }

    renderAIReportFixed();

    return false;
  }

  function renderAIReportFixed() {
    const data = getHealthDataFromStorage();
    if (!data) return;

    const risks = buildHealthRisks(data);

    const ids = {
      height: "report-height",
      weight: "report-weight",
      bmi: "report-bmi",
      waist: "report-waist",
      hip: "report-hip",
      chest: "report-chest",
      systolic: "report-sbp",
      diastolic: "report-dbp",
      pulse: "report-pulse"
    };

    Object.keys(ids).forEach(key => {
      const el = document.getElementById(ids[key]);
      if (el) el.textContent = data[key] || "--";
    });

    const bp = document.getElementById("report-bp");
    if (bp) bp.textContent = `${data.systolic || "--"} / ${data.diastolic || "--"}`;

    const summary = document.getElementById("report-summary");
    const advice = document.getElementById("report-advice");

    if (summary) {
      const hasDanger = risks.some(item => item.level === "danger");

      if (hasDanger) {
        summary.textContent = "目前偵測到危險健康數值，建議先休息並重新量測；若有不適或數值持續異常，請儘速就醫。";
      } else if (risks.length > 0) {
        summary.textContent = "目前部分健康數值需要持續追蹤，建議注意血壓、脈搏、BMI 與生活作息變化。";
      } else {
        summary.textContent = "目前整體健康狀態穩定，大部分數值位於正常範圍。";
      }
    }

    if (advice) {
      advice.innerHTML = risks.length
        ? risks.map(item => `<li>${item.detail}</li>`).join("")
        : "<li>目前沒有明顯異常，請持續維持規律作息與定期紀錄。</li>";
    }

    const riskColorIds = [
      "report-sbp",
      "report-dbp",
      "report-bp",
      "report-pulse",
      "report-bmi",
      "report-waist"
    ];

    riskColorIds.forEach(id => {
      const el = document.getElementById(id);
      if (!el) return;
      el.style.color = "#6b4d38";
      el.style.fontWeight = "600";
    });

    if (data.systolic >= 120 || data.systolic < 90) {
      ["report-sbp", "report-bp"].forEach(id => {
        const el = document.getElementById(id);
        if (el) el.style.color = "#d64545";
      });
    }

    if (data.diastolic >= 80 || data.diastolic < 60) {
      ["report-dbp", "report-bp"].forEach(id => {
        const el = document.getElementById(id);
        if (el) el.style.color = "#d64545";
      });
    }

    if (data.pulse > 100 || data.pulse < 50) {
      const el = document.getElementById("report-pulse");
      if (el) el.style.color = "#d64545";
    }

    if (data.bmi >= 24 || data.bmi < 18.5) {
      const el = document.getElementById("report-bmi");
      if (el) el.style.color = "#d64545";
    }

    if (data.waist >= 90) {
      const el = document.getElementById("report-waist");
      if (el) el.style.color = "#d64545";
    }
  }

  /* 覆蓋原本錯誤的 saveData */
  window.saveData = saveDataFixed;

  try {
    saveData = window.saveData;
  } catch (e) {}

  /* 用 window capture 擋掉舊版 document capture 儲存事件 */
  window.addEventListener("click", function (event) {
    const button = event.target && event.target.closest
      ? event.target.closest("button")
      : null;

    if (!button) return;

    const onclick = (button.getAttribute("onclick") || "").toLowerCase();
    const text = (button.textContent || "").trim();

    const isSaveButton =
      onclick.includes("savedata") ||
      button.classList.contains("save-btn") ||
      /儲存今日紀錄/.test(text);

    if (isSaveButton) {
      saveDataFixed(event);
    }
  }, true);

  /* 覆蓋 AI 報告刷新 */
  window.renderAIReportFinalV2 = renderAIReportFixed;
  window.refreshAIReportFinalV2 = renderAIReportFixed;
  window.refreshReportValues = renderAIReportFixed;

  document.addEventListener("DOMContentLoaded", function () {
    renderAIReportFixed();
  });

})();

/* =========================================================
   按鈕點擊後短暫停留反黑效果
   貼在 script.js 最底部
   ========================================================= */
document.addEventListener("click", function (event) {
  const btn = event.target.closest(
    "#home-page button, #home-page .phoebe-btn, #home-page .phoebe-chat, #home-page .phoebe-score"
  );

  if (!btn) return;

  btn.classList.add("is-pressed");

  setTimeout(function () {
    btn.classList.remove("is-pressed");
  }, 220);
});

/* =========================================================
   lock：首頁返回時固定在同一個位置
   貼在 script.js 最底部
   ========================================================= */
(function lockHomePagePosition() {
  /* 關閉瀏覽器自動記住捲動位置 */
  if ("scrollRestoration" in history) {
    history.scrollRestoration = "manual";
  }

  function isHomeVisible() {
    const home = document.getElementById("home-page");
    return home && !home.classList.contains("hidden");
  }

  function forceHomeTop() {
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;

    window.scrollTo({
      top: 0,
      left: 0,
      behavior: "auto"
    });
  }

  function lockHome() {
    document.body.classList.add("home-layout-locked");

    forceHomeTop();

    /* 多跑幾次，避免圖片或舊 CSS 載入後把版面推下去 */
    requestAnimationFrame(forceHomeTop);
    setTimeout(forceHomeTop, 30);
    setTimeout(forceHomeTop, 120);
    setTimeout(forceHomeTop, 300);
  }

  function unlockHome() {
    document.body.classList.remove("home-layout-locked");
  }

  /* 包住原本 showPage */
  const oldShowPage = window.showPage;

  window.showPage = function fixedShowPage(pageId) {
    let result;

    if (typeof oldShowPage === "function") {
      result = oldShowPage.apply(this, arguments);
    } else {
      document.querySelectorAll(".page").forEach(function (page) {
        page.classList.add("hidden");
      });

      const targetPage = document.getElementById(pageId);
      if (targetPage) targetPage.classList.remove("hidden");
    }

    if (pageId === "home-page") {
      lockHome();
    } else {
      unlockHome();
      forceHomeTop();
    }

    return result;
  };

  try {
    showPage = window.showPage;
  } catch (e) {}

  document.addEventListener("DOMContentLoaded", function () {
    if (isHomeVisible()) {
      lockHome();
    }
  });

  window.addEventListener("load", function () {
    if (isHomeVisible()) {
      lockHome();
    }
  });

  window.addEventListener("resize", function () {
    if (isHomeVisible()) {
      lockHome();
    }
  });
})();

/* =========================================================
   FINAL：首頁回來固定為第三張正確版
   不硬鎖高度、不讓 header 消失、不讓版面跳位
   貼在 script.js 最底部
   ========================================================= */
(function finalHomeLayoutRestore() {
  if (window.__FINAL_HOME_LAYOUT_RESTORE__) return;
  window.__FINAL_HOME_LAYOUT_RESTORE__ = true;

  if ("scrollRestoration" in history) {
    history.scrollRestoration = "manual";
  }

  function forceTop() {
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;

    window.scrollTo({
      top: 0,
      left: 0,
      behavior: "auto"
    });
  }

  function clearBadLock() {
    document.body.classList.remove("home-layout-locked");

    const home = document.getElementById("home-page");
    if (home) {
      home.style.removeProperty("height");
      home.style.removeProperty("min-height");
      home.style.removeProperty("max-height");
      home.style.removeProperty("overflow");
      home.style.removeProperty("padding");
      home.style.removeProperty("margin");
    }
  }

  function showHeader() {
    const header = document.querySelector("header");
    if (!header) return;

    header.style.setProperty("display", "block", "important");
    header.style.setProperty("visibility", "visible", "important");
    header.style.setProperty("opacity", "1", "important");

    header.style.removeProperty("height");
    header.style.removeProperty("min-height");
    header.style.removeProperty("max-height");
    header.style.removeProperty("overflow");
  }

  function hideHeader() {
    const header = document.querySelector("header");
    if (!header) return;

    header.style.setProperty("display", "none", "important");
  }

  function hidePage(page) {
    if (!page) return;

    page.classList.add("hidden");
    page.setAttribute("aria-hidden", "true");

    page.style.setProperty("display", "none", "important");
    page.style.setProperty("visibility", "hidden", "important");
    page.style.setProperty("opacity", "0", "important");
  }

  function showPageElement(page) {
    if (!page) return;

    page.classList.remove("hidden");
    page.removeAttribute("aria-hidden");

    page.style.setProperty("display", "block", "important");
    page.style.setProperty("visibility", "visible", "important");
    page.style.setProperty("opacity", "1", "important");

    page.style.removeProperty("height");
    page.style.removeProperty("min-height");
    page.style.removeProperty("max-height");
    page.style.removeProperty("overflow");
    page.style.removeProperty("padding");
    page.style.removeProperty("margin");
  }

  function restoreHomeLayout() {
    clearBadLock();

    document.body.classList.add("is-home-page");
    document.body.classList.remove("sub-page-mode");

    showHeader();

    const home = document.getElementById("home-page");
    if (home) {
      showPageElement(home);
    }

    forceTop();

    requestAnimationFrame(forceTop);
    setTimeout(forceTop, 50);
    setTimeout(forceTop, 150);
    setTimeout(forceTop, 300);
  }

  window.showPage = function showPageFinal(pageId) {
    const targetPage = document.getElementById(pageId);

    if (!targetPage) {
      alert("找不到頁面：" + pageId);
      return false;
    }

    document.querySelectorAll(".page").forEach(function (page) {
      hidePage(page);
    });

    showPageElement(targetPage);

    if (pageId === "home-page") {
      restoreHomeLayout();
    } else {
      clearBadLock();

      document.body.classList.remove("is-home-page");
      document.body.classList.add("sub-page-mode");

      hideHeader();
      forceTop();
    }

    /* 報告頁刷新 */
    if (pageId === "report-page") {
      setTimeout(function () {
        if (typeof window.renderAIReportFinalV2 === "function") {
          window.renderAIReportFinalV2();
        }

        if (typeof window.refreshAIReportFinalV2 === "function") {
          window.refreshAIReportFinalV2();
        }
      }, 120);
    }

    /* 圖表頁刷新 */
    if (pageId === "chart-page") {
      setTimeout(function () {
        if (typeof window.forceRefreshTrendButtons === "function") {
          window.forceRefreshTrendButtons();
        }
      }, 80);
    }

    return false;
  };

  try {
    showPage = window.showPage;
  } catch (e) {}

  document.addEventListener("DOMContentLoaded", function () {
    const home = document.getElementById("home-page");

    if (home && !home.classList.contains("hidden")) {
      restoreHomeLayout();
    }
  });

  window.addEventListener("load", function () {
    const home = document.getElementById("home-page");

    if (home && !home.classList.contains("hidden")) {
      restoreHomeLayout();
    }
  });
})();
/* =========================================================
   FINAL：首頁狀態守門員
   偵測到首頁時，強制恢復第二張正常版面
   ========================================================= */
(function homeStateGuardFinal() {
  if (window.__HOME_STATE_GUARD_FINAL__) return;
  window.__HOME_STATE_GUARD_FINAL__ = true;

  if ("scrollRestoration" in history) {
    history.scrollRestoration = "manual";
  }

  function isHomeVisible() {
    const home = document.getElementById("home-page");
    if (!home) return false;

    const style = window.getComputedStyle(home);

    return (
      !home.classList.contains("hidden") &&
      style.display !== "none" &&
      style.visibility !== "hidden" &&
      style.opacity !== "0"
    );
  }

  function showHeader() {
    const header = document.querySelector("header");
    if (!header) return;

    header.style.setProperty("display", "block", "important");
    header.style.setProperty("visibility", "visible", "important");
    header.style.setProperty("opacity", "1", "important");

    header.style.removeProperty("height");
    header.style.removeProperty("min-height");
    header.style.removeProperty("max-height");
    header.style.removeProperty("overflow");
  }

  function hideHeader() {
    const header = document.querySelector("header");
    if (!header) return;

    header.style.setProperty("display", "none", "important");
  }

  function cleanHomeInlineStyle() {
    const home = document.getElementById("home-page");
    if (!home) return;

    home.style.removeProperty("height");
    home.style.removeProperty("min-height");
    home.style.removeProperty("max-height");
    home.style.removeProperty("overflow");
    home.style.removeProperty("padding");
    home.style.removeProperty("margin");
    home.style.removeProperty("transform");
  }

  function forceTop() {
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: "auto"
    });
  }

  function syncHomeState() {
    const homeVisible = isHomeVisible();

    if (homeVisible) {
      document.body.classList.add("home-force-normal");
      document.body.classList.add("is-home-page");

      document.body.classList.remove("sub-page-mode");
      document.body.classList.remove("home-layout-locked");

      showHeader();
      cleanHomeInlineStyle();
    } else {
      document.body.classList.remove("home-force-normal");
      document.body.classList.remove("is-home-page");
    }
  }

  /* 重新包 showPage，避免其他函式把 header 藏掉 */
  const oldShowPage = window.showPage;

  window.showPage = function guardedShowPage(pageId) {
    let result;

    if (typeof oldShowPage === "function") {
      result = oldShowPage.apply(this, arguments);
    } else {
      document.querySelectorAll(".page").forEach(function (page) {
        page.classList.add("hidden");
        page.style.setProperty("display", "none", "important");
      });

      const target = document.getElementById(pageId);
      if (target) {
        target.classList.remove("hidden");
        target.style.setProperty("display", "block", "important");
      }
    }

    if (pageId === "home-page") {
      setTimeout(function () {
        syncHomeState();
        forceTop();
      }, 0);

      setTimeout(function () {
        syncHomeState();
        forceTop();
      }, 80);

      setTimeout(function () {
        syncHomeState();
        forceTop();
      }, 200);
    } else {
      document.body.classList.remove("home-force-normal");
      document.body.classList.remove("is-home-page");
      document.body.classList.add("sub-page-mode");
      hideHeader();
      forceTop();
    }

    return result;
  };

  try {
    showPage = window.showPage;
  } catch (e) {}

  document.addEventListener("DOMContentLoaded", function () {
    syncHomeState();
  });

  window.addEventListener("load", function () {
    syncHomeState();
  });

  window.addEventListener("resize", function () {
    syncHomeState();
  });

  /* 防止其他舊程式碼又把首頁弄歪 */
  setInterval(function () {
    if (isHomeVisible()) {
      syncHomeState();
    }
  }, 300);
})();
/* =========================================================
   final：首頁禁止滑動，其他頁面恢復滑動
   貼在 script.js 最底部
   ========================================================= */
(function homeOnlyScrollLockFinal() {
  if (window.__HOME_ONLY_SCROLL_LOCK_FINAL__) return;
  window.__HOME_ONLY_SCROLL_LOCK_FINAL__ = true;

  if ("scrollRestoration" in history) {
    history.scrollRestoration = "manual";
  }

  function isHomeVisible() {
    const home = document.getElementById("home-page");
    if (!home) return false;

    const style = window.getComputedStyle(home);

    return (
      !home.classList.contains("hidden") &&
      style.display !== "none" &&
      style.visibility !== "hidden" &&
      style.opacity !== "0"
    );
  }

  function forceTop() {
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;

    window.scrollTo({
      top: 0,
      left: 0,
      behavior: "auto"
    });
  }

  function lockHomeScroll() {
    document.documentElement.classList.add("home-scroll-locked");
    document.body.classList.add("home-no-scroll");

    forceTop();
  }

  function unlockPageScroll() {
    document.documentElement.classList.remove("home-scroll-locked");
    document.body.classList.remove("home-no-scroll");

    document.documentElement.style.overflowY = "auto";
    document.body.style.overflowY = "auto";
    document.body.style.height = "auto";
  }

  function syncScrollState() {
    if (isHomeVisible()) {
      lockHomeScroll();
    } else {
      unlockPageScroll();
    }
  }

  const oldShowPage = window.showPage;

  window.showPage = function showPageScrollFixed(pageId) {
    let result;

    if (typeof oldShowPage === "function") {
      result = oldShowPage.apply(this, arguments);
    }

    if (pageId === "home-page") {
      setTimeout(function () {
        lockHomeScroll();
      }, 0);

      setTimeout(function () {
        lockHomeScroll();
      }, 100);

      setTimeout(function () {
        lockHomeScroll();
      }, 250);
    } else {
      unlockPageScroll();
    }

    return result;
  };

  try {
    showPage = window.showPage;
  } catch (e) {}

  document.addEventListener("DOMContentLoaded", syncScrollState);
  window.addEventListener("load", syncScrollState);
  window.addEventListener("resize", syncScrollState);

  /* 防止舊程式碼把首頁滑動狀態改回來 */
  setInterval(syncScrollState, 500);
})();

/* =========================================================
   FINAL：衛教闖關新版進度條、上一題、難度高亮
   ========================================================= */
(function quizRedesignPatch() {
  if (window.__QUIZ_REDESIGN_PATCH__) return;
  window.__QUIZ_REDESIGN_PATCH__ = true;

  function safeGetQuestionSet() {
    try {
      if (typeof getQuestionSet === "function") return getQuestionSet();
    } catch (e) {}
    return [];
  }

  function updateQuizRedesignUI() {
    const questionSet = safeGetQuestionSet();
    const total = questionSet.length || 10;
    const current = Math.min((typeof quizIndex === "number" ? quizIndex : 0) + 1, total);
    const score = typeof quizScore === "number" ? quizScore : 0;
    const level = typeof currentLevel === "string" ? currentLevel : "easy";
    const levelNameMap = { easy: "簡單", medium: "普通", hard: "困難" };
    const levelName = levelNameMap[level] || "簡單";
    const topicTitle = typeof getQuizTopicTitle === "function" ? getQuizTopicTitle() : "綜合衛教";
    const progressText = `🧠 ${topicTitle}｜${levelName}：${score} / ${total} 題`;

    const progress = document.getElementById("quiz-progress");
    if (progress) progress.textContent = progressText;

    const topicLabel = document.getElementById("quiz-topic-label");
    if (topicLabel) topicLabel.textContent = topicTitle;

    const topicLabelSide = document.getElementById("quiz-topic-label-side");
    if (topicLabelSide) topicLabelSide.textContent = topicTitle;

    const currentNumber = document.getElementById("quiz-current-number");
    if (currentNumber) currentNumber.textContent = current;

    const totalNumber = document.getElementById("quiz-total-number");
    if (totalNumber) totalNumber.textContent = total;

    const percent = total ? Math.round((Math.max(0, current - 1) / total) * 100) : 0;

    const fill = document.getElementById("quiz-progress-fill");
    if (fill) fill.style.width = `${percent}%`;

    const percentText = document.getElementById("quiz-progress-percent");
    if (percentText) percentText.textContent = `${percent}%`;

    document.querySelectorAll(".quiz-level-card").forEach(function (btn) {
      btn.classList.toggle("active", btn.dataset.level === level);
    });

    const prevBtn = document.getElementById("quiz-prev-btn");
    if (prevBtn) prevBtn.disabled = !quizIndex || quizIndex <= 0;

    const nextBtn = document.getElementById("quiz-next-btn");
    if (nextBtn) nextBtn.disabled = typeof answered !== "undefined" ? !answered : false;
  }

  const oldLoadQuestion = window.loadQuestion;
  window.loadQuestion = function patchedLoadQuestion() {
    if (typeof oldLoadQuestion === "function") oldLoadQuestion.apply(this, arguments);
    setTimeout(updateQuizRedesignUI, 0);
  };
  try { loadQuestion = window.loadQuestion; } catch (e) {}

  const oldCheckAnswer = window.checkAnswer;
  window.checkAnswer = function patchedCheckAnswer(choice) {
    if (typeof oldCheckAnswer === "function") oldCheckAnswer.apply(this, arguments);
    setTimeout(updateQuizRedesignUI, 0);
  };
  try { checkAnswer = window.checkAnswer; } catch (e) {}

  const oldNextQuestion = window.nextQuestion;
  window.nextQuestion = function patchedNextQuestion() {
    if (typeof answered !== "undefined" && !answered) return;
    if (typeof oldNextQuestion === "function") oldNextQuestion.apply(this, arguments);
    setTimeout(updateQuizRedesignUI, 0);
  };
  try { nextQuestion = window.nextQuestion; } catch (e) {}

  window.prevQuestion = function prevQuestion() {
    if (typeof quizIndex === "undefined") return;
    if (quizIndex <= 0) return;
    quizIndex--;
    answered = false;
    if (typeof loadQuestion === "function") loadQuestion();
    updateQuizRedesignUI();
  };

  const oldStartQuiz = window.startQuiz;
  window.startQuiz = function patchedStartQuiz(level) {
    if (typeof oldStartQuiz === "function") oldStartQuiz.apply(this, arguments);
    setTimeout(updateQuizRedesignUI, 100);
  };
  try { startQuiz = window.startQuiz; } catch (e) {}

  document.addEventListener("DOMContentLoaded", updateQuizRedesignUI);
})();

/* =========================================================
   衛教知識庫：把 emoji icon 換成手繪 SVG
   貼在 script.js 最底部
   ========================================================= */
(function replaceEduEmojiWithHandDrawnIcons() {
  if (window.__EDU_HANDDRAWN_ICONS__) return;
  window.__EDU_HANDDRAWN_ICONS__ = true;

  const icons = {
    "first-aid": `
      <svg viewBox="0 0 120 90">
        <rect x="18" y="35" width="70" height="30" rx="6" fill="#f8fbff" stroke="#55616a" stroke-width="3"/>
        <path d="M35 35 L47 22 H70 L82 35" fill="#e9f2fa" stroke="#55616a" stroke-width="3"/>
        <rect x="82" y="45" width="18" height="20" rx="3" fill="#f8fbff" stroke="#55616a" stroke-width="3"/>
        <circle cx="35" cy="69" r="7" fill="#6f7c86"/>
        <circle cx="80" cy="69" r="7" fill="#6f7c86"/>
        <path d="M60 39 v18 M51 48 h18" stroke="#d85858" stroke-width="5" stroke-linecap="round"/>
        <path d="M22 30 c10-8 22-10 36-8" stroke="#d9b38c" stroke-width="2" fill="none"/>
      </svg>
    `,

    "trauma-care": `
      <svg viewBox="0 0 120 90">
        <rect x="28" y="35" width="64" height="24" rx="12" fill="#eac49b" stroke="#7c5d43" stroke-width="3" transform="rotate(-24 60 47)"/>
        <path d="M48 42 h25" stroke="#8c6b50" stroke-width="2" transform="rotate(-24 60 47)"/>
        <circle cx="55" cy="44" r="2" fill="#8c6b50"/>
        <circle cx="65" cy="49" r="2" fill="#8c6b50"/>
      </svg>
    `,

    "home-care": `
      <svg viewBox="0 0 120 90">
        <path d="M25 52 L60 25 L95 52" fill="none" stroke="#8d5b3e" stroke-width="4" stroke-linecap="round"/>
        <rect x="35" y="50" width="50" height="30" rx="4" fill="#f3d9b7" stroke="#8d5b3e" stroke-width="3"/>
        <rect x="55" y="61" width="14" height="19" fill="#d7b28b" stroke="#8d5b3e" stroke-width="2"/>
        <circle cx="83" cy="39" r="9" fill="#a6c68f"/>
        <path d="M82 47 v18" stroke="#6f8a5d" stroke-width="3"/>
        <path d="M27 72 c16 6 49 6 66 0" stroke="#d9b38c" stroke-width="2" fill="none"/>
      </svg>
    `,

    "tube-care": `
      <svg viewBox="0 0 120 90">
        <path d="M37 20 L80 63" stroke="#77b989" stroke-width="8" stroke-linecap="round"/>
        <path d="M35 22 L82 69" stroke="#6fc2df" stroke-width="3" stroke-linecap="round"/>
        <rect x="71" y="58" width="18" height="8" rx="3" fill="#e9f5f0" stroke="#5d9270" stroke-width="2" transform="rotate(45 80 62)"/>
        <path d="M27 73 c20 7 45 7 66 0" stroke="#d9b38c" stroke-width="2" fill="none"/>
      </svg>
    `,

    "postpartum-care": `
      <svg viewBox="0 0 120 90">
        <circle cx="62" cy="30" r="13" fill="#f0c49f" stroke="#8d5b3e" stroke-width="2"/>
        <path d="M47 48 c6-16 26-16 32 0 v20 H47z" fill="#e9b8b8" stroke="#8d5b3e" stroke-width="2"/>
        <circle cx="77" cy="52" r="9" fill="#f2c7a8" stroke="#8d5b3e" stroke-width="2"/>
        <path d="M64 53 c9 6 18 6 25 0" stroke="#8d5b3e" stroke-width="2" fill="none"/>
        <path d="M51 27 c7-11 20-11 28 0" stroke="#6f4c3d" stroke-width="3" fill="none"/>
      </svg>
    `,

    "chronic-care": `
      <svg viewBox="0 0 120 90">
        <path d="M35 25 v20 c0 13 12 23 25 23s25-10 25-23V25" fill="none" stroke="#3d7892" stroke-width="5" stroke-linecap="round"/>
        <circle cx="34" cy="24" r="5" fill="#8bc6dd"/>
        <circle cx="86" cy="24" r="5" fill="#8bc6dd"/>
        <path d="M60 68 c0 9 10 12 18 7" fill="none" stroke="#3d7892" stroke-width="4" stroke-linecap="round"/>
        <circle cx="84" cy="72" r="8" fill="#f8fbff" stroke="#3d7892" stroke-width="3"/>
      </svg>
    `,

    "nutrition-care": `
      <svg viewBox="0 0 120 90">
        <rect x="42" y="28" width="36" height="40" rx="4" fill="#f6f0df" stroke="#7c6b52" stroke-width="3"/>
        <path d="M50 28 c0-10 20-10 20 0" stroke="#7c6b52" stroke-width="3" fill="none"/>
        <circle cx="46" cy="70" r="8" fill="#dc7b55" stroke="#8d5b3e" stroke-width="2"/>
        <circle cx="65" cy="72" r="9" fill="#e6a34c" stroke="#8d5b3e" stroke-width="2"/>
        <path d="M76 67 c9-12 18-13 25-4 c-10 8-18 11-25 4z" fill="#8fbf75" stroke="#5f8a50" stroke-width="2"/>
      </svg>
    `,

    "neuro-care": `
      <svg viewBox="0 0 120 90">
        <path d="M45 30 c-9 0-16 7-16 16 c0 9 6 15 14 15 c4 10 18 11 25 3 c10 1 18-5 18-15 c0-8-5-14-12-16 c-4-10-18-13-29-3z" fill="#f4b6bd" stroke="#8d5b6a" stroke-width="3"/>
        <path d="M45 39 c8 2 13 7 15 16 M62 37 c-4 9-4 17 2 25 M73 43 c-8 1-14 5-18 12" stroke="#8d5b6a" stroke-width="2" fill="none"/>
      </svg>
    `,

    "elderly-care": `
      <svg viewBox="0 0 120 90">
        <circle cx="48" cy="33" r="13" fill="#f0c49f" stroke="#7c5d43" stroke-width="2"/>
        <circle cx="74" cy="33" r="13" fill="#f0c49f" stroke="#7c5d43" stroke-width="2"/>
        <path d="M35 70 c4-18 22-22 31-7 c8-15 27-11 31 7z" fill="#b6c89f" stroke="#7c5d43" stroke-width="2"/>
        <path d="M40 26 c6-9 17-8 23 0 M66 26 c8-8 18-7 24 1" stroke="#9e9e9e" stroke-width="4" fill="none"/>
        <path d="M43 38 q5 4 10 0 M70 38 q5 4 10 0" stroke="#7c5d43" stroke-width="2" fill="none"/>
      </svg>
    `,

    "medication-care": `
      <svg viewBox="0 0 120 90">
        <rect x="32" y="36" width="58" height="24" rx="12" fill="#f3f0e9" stroke="#7c5d43" stroke-width="3" transform="rotate(-38 61 48)"/>
        <path d="M61 25 L78 42" stroke="#d84f5b" stroke-width="16" stroke-linecap="round"/>
        <path d="M43 67 c18 7 42 6 58-2" stroke="#d9b38c" stroke-width="2" fill="none"/>
      </svg>
    `
  };

  function applyIcons() {
    document.querySelectorAll("#edu-menu-page .edu-card").forEach(card => {
      const iconBox = card.querySelector(".edu-card-icon");
      if (!iconBox) return;

      Object.keys(icons).forEach(key => {
        if (card.classList.contains(key)) {
          iconBox.innerHTML = icons[key];
          iconBox.classList.add("handdrawn-icon");
        }
      });
    });
  }

  document.addEventListener("DOMContentLoaded", applyIcons);
  window.addEventListener("load", applyIcons);

  const oldShowPage = window.showPage;
  window.showPage = function patchedShowPageForEduIcons(pageId) {
    if (typeof oldShowPage === "function") {
      oldShowPage.apply(this, arguments);
    }

    if (pageId === "edu-menu-page") {
      setTimeout(applyIcons, 50);
      setTimeout(applyIcons, 200);
    }
  };

  try {
    showPage = window.showPage;
  } catch (e) {}
})();

/* =========================================================
   FINAL：衛教知識庫套用真手繪圖片 icon + 5格頁面鎖定
   ========================================================= */
(function eduMenuHanddrawnImageFinal() {
  if (window.__EDU_MENU_HANDDRAWN_IMAGE_FINAL__) return;
  window.__EDU_MENU_HANDDRAWN_IMAGE_FINAL__ = true;

  const iconMap = {
    "first-aid": "images/edu-icons/first-aid.webp",
    "trauma-care": "images/edu-icons/trauma-care.webp",
    "home-care": "images/edu-icons/home-care.webp",
    "tube-care": "images/edu-icons/tube-care.webp",
    "postpartum-care": "images/edu-icons/postpartum-care.webp",
    "chronic-care": "images/edu-icons/chronic-care.webp",
    "nutrition-care": "images/edu-icons/nutrition-care.webp",
    "neuro-care": "images/edu-icons/neuro-care.webp",
    "elderly-care": "images/edu-icons/elderly-care.webp",
    "medication-care": "images/edu-icons/medication-care.webp"
  };

  function isEduMenuVisible() {
    const page = document.getElementById("edu-menu-page");
    if (!page) return false;
    const style = window.getComputedStyle(page);
    return !page.classList.contains("hidden") && style.display !== "none" && style.visibility !== "hidden";
  }

  function applyEduIcons() {
    document.querySelectorAll("#edu-menu-page .edu-card").forEach(function(card) {
      const iconBox = card.querySelector(".edu-card-icon");
      if (!iconBox) return;

      Object.keys(iconMap).forEach(function(key) {
        if (card.classList.contains(key)) {
          iconBox.innerHTML = '<img class="edu-handdrawn-img" src="' + iconMap[key] + '" alt="">';
          iconBox.classList.add("image-icon-mode");
        }
      });
    });

    const title = document.querySelector("#edu-menu-page .quiz-menu-card h2");
    if (title && !title.querySelector(".edu-title-book-icon")) {
      title.innerHTML = '<img class="edu-title-book-icon" src="images/health-book.png" alt="">衛教知識庫';
    }
  }

  function syncEduMenuPageState() {
    const onEduMenu = isEduMenuVisible();
    document.body.classList.toggle("edu-menu-fit-page", onEduMenu);
    if (onEduMenu) applyEduIcons();
  }

  const oldShowPage = window.showPage;
  window.showPage = function patchedShowPageEduFinal(pageId) {
    if (typeof oldShowPage === "function") oldShowPage.apply(this, arguments);
    setTimeout(syncEduMenuPageState, 0);
    setTimeout(syncEduMenuPageState, 80);
    setTimeout(syncEduMenuPageState, 200);
  };
  try { showPage = window.showPage; } catch(e) {}

  document.addEventListener("DOMContentLoaded", function() {
    applyEduIcons();
    syncEduMenuPageState();
  });
  window.addEventListener("load", function() {
    applyEduIcons();
    syncEduMenuPageState();
  });
  window.addEventListener("resize", syncEduMenuPageState);
})();


/* =========================================================
   修正衛教知識庫標題 icon：不要用圖片，改用乾淨手繪 SVG
   貼在 script.js 最底部
   ========================================================= */
(function fixEduTitleIcon() {
  if (window.__FIX_EDU_TITLE_ICON__) return;
  window.__FIX_EDU_TITLE_ICON__ = true;

  function applyTitleIcon() {
    const title = document.querySelector("#edu-menu-page .quiz-menu-card h2");
    if (!title) return;

    title.innerHTML = `
      <span class="edu-title-svg-icon" aria-hidden="true">
        <svg viewBox="0 0 90 70">
          <rect x="12" y="18" width="18" height="40" rx="3" fill="#8dbb73" stroke="#5d744c" stroke-width="2"/>
          <rect x="31" y="12" width="18" height="46" rx="3" fill="#e6b86a" stroke="#9a7441" stroke-width="2"/>
          <rect x="50" y="20" width="18" height="38" rx="3" fill="#78a8c8" stroke="#4d7288" stroke-width="2"/>
          <path d="M15 26 H27 M34 21 H46 M53 28 H65" stroke="#fffaf3" stroke-width="2" stroke-linecap="round"/>
          <path d="M10 60 C26 65 53 65 72 60" fill="none" stroke="#d7c4aa" stroke-width="2" stroke-linecap="round"/>
        </svg>
      </span>
      <span>衛教知識庫</span>
    `;
  }

  document.addEventListener("DOMContentLoaded", applyTitleIcon);
  window.addEventListener("load", applyTitleIcon);

  const oldShowPage = window.showPage;

  window.showPage = function patchedShowPageEduTitleIcon(pageId) {
    if (typeof oldShowPage === "function") {
      oldShowPage.apply(this, arguments);
    }

    if (pageId === "edu-menu-page") {
      setTimeout(applyTitleIcon, 50);
      setTimeout(applyTitleIcon, 200);
    }
  };

  try {
    showPage = window.showPage;
  } catch (e) {}
})();