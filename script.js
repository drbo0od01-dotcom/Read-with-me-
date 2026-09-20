// قائمة الكلمات مع التهجئة والرموز التعبيرية والنظام التكيفي
let wordsPool = [
    { word: "جَمَل", emoji: "🐪", syllables: "جَـ — مَـ — ل", weight: 1 },
    { word: "قلم", emoji: "✏️", syllables: "قَـ — لَـ — م", weight: 1 },
    { word: "تفاحة", emoji: "🍎", syllables: "تُـ — فَـ — حَـ — ة", weight: 1 },
    { word: "شمس", emoji: "☀️", syllables: "شَـ — مْـ — س", weight: 1 },
    { word: "كتاب", emoji: "📖", syllables: "كِـ — تَـ — ا — ب", weight: 1 }
];

let currentIndex = 0;
let score = 0;
let currentTargetWord = "";

function loadNewWord() {
    let totalWeight = wordsPool.reduce((sum, item) => sum + item.weight, 0);
    let randomNum = Math.random() * totalWeight;
    let currentSum = 0;

    for (let i = 0; i < wordsPool.length; i++) {
        currentSum += wordsPool[i].weight;
        if (randomNum <= currentSum) {
            currentIndex = i;
            break;
        }
    }

    let current = wordsPool[currentIndex];
    currentTargetWord = current.word;

    document.getElementById("word-emoji").innerText = current.emoji;
    document.getElementById("word-display").innerText = current.word;
    document.getElementById("syllables-display").innerText = current.syllables;
    document.getElementById("syllables-display").classList.add("hidden");
    document.getElementById("feedback-text").innerText = "اضغط على الميكروفون واقرأ الكلمة بصوت واضح";
    document.getElementById("feedback-text").className = "text-xl font-bold text-gray-600";
    
    // إظهار زر الميكروفون والتخطي وإخفاء زر التالي
    document.getElementById("mic-btn").classList.remove("hidden");
    document.getElementById("skip-btn").classList.remove("hidden");
    document.getElementById("next-btn").classList.add("hidden");
}

function startListening() {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    
    if (!SpeechRecognition) {
        alert("متصفحك لا يدعم التعرف الصوتي المباشر، يُفضل استخدام متصفح Safari أو Chrome.");
        return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = 'ar-SA';
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    document.getElementById("feedback-text").innerText = "جاري الاستماع... 🎧";
    document.getElementById("mic-btn").classList.add("animate-pulse", "bg-amber-500");

    recognition.onresult = function(event) {
        const speechResult = event.results[0][0].transcript.trim();
        console.log("الكلمة المنطوقة: " + speechResult);
        
        if (speechResult.includes(currentTargetWord) || currentTargetWord.includes(speechResult)) {
            handleCorrect();
        } else {
            handleIncorrect();
        }
    };

    recognition.onerror = function(event) {
        document.getElementById("feedback-text").innerText = "لم أستطع سماعك جيداً، حاول مرة أخرى!";
        document.getElementById("mic-btn").classList.remove("animate-pulse", "bg-amber-500");
    };

    recognition.onend = function() {
        document.getElementById("mic-btn").classList.remove("animate-pulse", "bg-amber-500");
    };

    recognition.start();
}

function handleCorrect() {
    score += 10;
    document.getElementById("score").innerText = score;
    document.getElementById("feedback-text").innerText = "أحسنت! إجابة صحيحة ⭐";
    document.getElementById("feedback-text").className = "text-2xl font-black text-emerald-600 animate-bounce";
    
    document.getElementById("mic-btn").classList.add("hidden");
    document.getElementById("skip-btn").classList.add("hidden");
    document.getElementById("next-btn").classList.remove("hidden");

    if (wordsPool[currentIndex].weight > 1) {
        wordsPool[currentIndex].weight -= 1;
    }
}

function handleIncorrect() {
    document.getElementById("feedback-text").innerText = "حاول مرة أخرى يا بطل، انتبه للتهجئة:";
    document.getElementById("feedback-text").className = "text-xl font-bold text-rose-500";
    document.getElementById("syllables-display").classList.remove("hidden");
    
    wordsPool[currentIndex].weight += 2;
    speakWordSlowly(currentTargetWord);
}

// دالة تخطي الكلمة
function skipWord() {
    // زيادة وزن الكلمة لأنها سُميت صعبة وتم تخطيها، لكي تظهر لاحقاً
    wordsPool[currentIndex].weight += 1;
    loadNewWord();
}

function speakWordSlowly(text) {
    if ('speechSynthesis' in window) {
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = 'ar-SA';
        utterance.rate = 0.6;
        window.speechSynthesis.speak(utterance);
    }
}

function nextWord() {
    loadNewWord();
}

window.onload = loadNewWord;
