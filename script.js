// قائمة الكلمات مع إضافة حقل (audioText) لنطق الكلمة بالتشكيل الدقيق للمتصفح
let wordsPool = [
    { word: "جَمَل", emoji: "🐪", syllables: "جَـ — مَـ — ل", audioText: "جَـمَـل", weight: 1 },
    { word: "قلم", emoji: "✏️", syllables: "قَـ — لَـ — م", audioText: "قَـلَـم", weight: 1 },
    { word: "تفاحة", emoji: "🍎", syllables: "تُـ — فَـ - ا — حَـ — ة", audioText: "تُـفَّـاحَـة", weight: 1 },
    { word: "شمس", emoji: "☀️", syllables: "شَـ — مْـ — س", audioText: "شَـمْس", weight: 1 },
    { word: "كتاب", emoji: "📖", syllables: "كِـ — تَـ — ا — ب", audioText: "كِـتَاب", weight: 1 }
];

let currentIndex = 0;
let score = 0;
let currentTargetWord = "";
let currentAudioText = "";

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
    currentAudioText = current.audioText; // جلب النص الصوتي الدقيق

    document.getElementById("word-emoji").innerText = current.emoji;
    document.getElementById("word-display").innerText = current.word;
    document.getElementById("syllables-display").innerText = current.syllables;
    document.getElementById("syllables-display").classList.add("hidden");
    document.getElementById("feedback-text").innerText = "اضغط على الميكروفون أو جرب أزرار المحاكاة";
    document.getElementById("feedback-text").className = "text-xl font-bold text-gray-600";
    
    document.getElementById("mic-btn").classList.remove("hidden");
    document.getElementById("skip-btn").classList.remove("hidden");
    document.getElementById("next-btn").classList.add("hidden");
    
    document.getElementById("audio-container").innerHTML = "";
}

function startListening() {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    
    if (!SpeechRecognition) {
        alert("متصفحك لا يدعم التعرف الصوتي المباشر، استعمل أزرار المحاكاة أدناه للاختبار الفوري.");
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
        if (speechResult.includes(currentTargetWord) || currentTargetWord.includes(currentTargetWord)) {
            handleCorrect();
        } else {
            handleIncorrect();
        }
    };

    recognition.onerror = function() {
        document.getElementById("feedback-text").innerText = "تعذر التعرف الصوتي، جرب زر المحاكاة الخاطئة للاختبار!";
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
    document.getElementById("audio-container").innerHTML = "";

    if (wordsPool[currentIndex].weight > 1) {
        wordsPool[currentIndex].weight -= 1;
    }
}

function handleIncorrect() {
    document.getElementById("feedback-text").innerText = "حاول مرة أخرى يا بطل، انتبه للتهجئة:";
    document.getElementById("feedback-text").className = "text-xl font-bold text-rose-500";
    document.getElementById("syllables-display").classList.remove("hidden");
    
    wordsPool[currentIndex].weight += 2;

    // تمرير النص الصوتي المعالج والمشكل بدقة
    const audioContainer = document.getElementById("audio-container");
    audioContainer.innerHTML = `
        <button onclick="speakWordSlowly('${currentAudioText}')" class="bg-sky-500 hover:bg-sky-600 text-white text-base font-bold py-2 px-5 rounded-full shadow-md transition cursor-pointer animate-pulse">
            🔊 اضغط هنا للاستماع للكلمة ببطء
        </button>
    `;
}

function speakWordSlowly(text) {
    if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = 'ar-SA'; // ضبط اللغة على السعودية لزيادة دقة الحركات
        utterance.rate = 0.45;    // سرعة أبطأ قليلاً لتوضيح الحركات ومخارج الحروف
        window.speechSynthesis.speak(utterance);
    } else {
        alert("خاصية الصوت غير مدعومة في متصفحك الحالي.");
    }
}

function skipWord() {
    wordsPool[currentIndex].weight += 1;
    loadNewWord();
}

function nextWord() {
    loadNewWord();
}

window.onload = loadNewWord;
