const questionBank = {
  capitals: [
    {
      question: "ما عاصمة الأردن؟",
      options: ["عمان", "إربد", "الزرقاء", "الكرك"],
      answer: "عمان",
    },
    {
      question: "ما عاصمة فلسطين؟",
      options: ["القدس", "رام الله", "غزة", "الخليل"],
      answer: "القدس",
    },
    {
      question: "ما عاصمة مصر؟",
      options: ["القاهرة", "الإسكندرية", "الأقصر", "أسوان"],
      answer: "القاهرة",
    },
    {
      question: "ما عاصمة السعودية؟",
      options: ["الرياض", "جدة", "مكة", "الدمام"],
      answer: "الرياض",
    },
  ],
  math: [
    {
      question: "كم ناتج 3 + 4؟",
      options: ["5", "7", "8", "9"],
      answer: "7",
    },
    {
      question: "كم ناتج 6 - 2؟",
      options: ["4", "3", "2", "5"],
      answer: "4",
    },
    {
      question: "كم ناتج 2 × 5؟",
      options: ["10", "8", "12", "15"],
      answer: "10",
    },
    {
      question: "كم ناتج 9 ÷ 3؟",
      options: ["2", "3", "4", "6"],
      answer: "3",
    },
  ],
  arabic: [
    {
      question: "أي كلمة تبدأ بحرف الهاء؟",
      options: ["هلال", "باب", "تفاحة", "قلم"],
      answer: "هلال",
    },
    {
      question: "أي صورة تنتهي بحرف الهاء؟",
      options: ["وجه", "كتاب", "بيت", "باب"],
      answer: "وجه",
    },
    {
      question: "اختر كلمة تحتوي على صوت (هـ):",
      options: ["هدهد", "قط", "شمس", "نهر"],
      answer: "هدهد",
    },
    {
      question: "حرف الهاء يشبه في بدايته؟",
      options: ["قوس مفتوح", "خط مستقيم", "نقطة", "دائرة صغيرة"],
      answer: "قوس مفتوح",
    },
  ],
};

const difficultyRanges = {
  easy: "سهل (1-5)",
  medium: "متوسط (1-10)",
  hard: "صعب (1-20)",
};

const categorySelect = document.getElementById("categorySelect");
const difficultySelect = document.getElementById("difficultySelect");
const questionCountInput = document.getElementById("questionCount");
const timerSecondsInput = document.getElementById("timerSeconds");
const tickSoundSelect = document.getElementById("tickSound");
const winSoundSelect = document.getElementById("winSound");
const generateBtn = document.getElementById("generateBtn");
const quizList = document.getElementById("quizList");
const previewMeta = document.getElementById("previewMeta");

function shuffle(array) {
  return [...array].sort(() => Math.random() - 0.5);
}

function buildQuiz() {
  const categoryKey = categorySelect.value;
  const difficulty = difficultySelect.value;
  const questionCount = Number.parseInt(questionCountInput.value, 10) || 10;
  const timerSeconds = Number.parseInt(timerSecondsInput.value, 10) || 10;
  const tickSound = tickSoundSelect.value;
  const winSound = winSoundSelect.value;

  const pool = questionBank[categoryKey] || [];
  const selectedQuestions = shuffle(pool).slice(0, questionCount);

  quizList.innerHTML = "";

  selectedQuestions.forEach((item, index) => {
    const li = document.createElement("li");
    li.className = "quiz-item";

    const title = document.createElement("h3");
    title.textContent = `${index + 1}. ${item.question}`;

    const options = document.createElement("ul");
    options.className = "quiz-options";
    shuffle(item.options).forEach((option) => {
      const optionItem = document.createElement("li");
      optionItem.textContent = option;
      options.appendChild(optionItem);
    });

    const meta = document.createElement("p");
    meta.className = "meta";
    meta.textContent = `الإجابة الصحيحة: ${item.answer}`;

    li.appendChild(title);
    li.appendChild(options);
    li.appendChild(meta);
    quizList.appendChild(li);
  });

  previewMeta.textContent = `التصنيف: ${categorySelect.options[categorySelect.selectedIndex].text} · مستوى: ${difficultyRanges[difficulty]} · وقت: ${timerSeconds} ث · Tick: ${tickSound} · Win: ${winSound}`;
}

generateBtn.addEventListener("click", buildQuiz);

buildQuiz();
