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
    
    document.getElementById("mic-btn").classList.remove("hidden");
    document.getElementById("skip-btn").classList.remove("hidden");
    document.getElementById("next-btn").classList.add("hidden");
    
    // إخفاء زر الاستماع لو كان ظاهراً
    if(document.getElementById("listen-audio-btn")) {
        document.getElementById("listen-audio-btn").classList.add("hidden");
    }
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
    if(document.getElementById("listen-audio-btn")) {
        document.getElementById("listen-audio-btn").classList.add("hidden");
    }

    if (wordsPool[currentIndex].weight > 1) {
        wordsPool[currentIndex].weight -= 1;
    }
}

function handleIncorrect() {
    document.getElementById("feedback-text").innerText = "حاول مرة أخرى يا بطل، انتبه للتهجئة:";
    document.getElementById("feedback-text").className = "text-xl font-bold text-rose-500";
    document.getElementById("syllables-display").classList.remove("hidden");
    
    wordsPool[currentIndex].weight += 2;

    // إظهار زر خاص بالاستماع الصوتي عند الخطأ لضمان عمله في الأيباد
    let listenBtn = document.getElementById("listen-audio-btn");
    if (!listenBtn) {
        listenBtn = document.createElement("button");
        listenBtn.id = "listen-audio-btn";
        listenBtn.className = "bg-sky-500 hover:bg-sky-600 text-white text-lg font-bold py-2 px-6 rounded-full shadow-md transition cursor-pointer mb-2";
        listenBtn.innerHTML = "🔊 اسمع الكلمة ببطء";
        listenBtn.onclick = function() { speakWordSlowly(currentTargetWord); };
        
        // إدراجه قبل زر التخطي
        const skipBtn = document.getElementById("skip-btn");
        skipBtn.parentNode.insertBefore(listenBtn, skipBtn);
    } else {
        listenBtn.classList.remove("hidden");
    }
}

// دالة نطق الكلمة المضمونة للأيباد
function speakWordSlowly(text) {
    if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel(); // إيقاف أي صوت سابق قيد التشغيل
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = 'ar'; // استخدام اللغة العربية العامة لضمان توافقها مع نظام الأيباد
        utterance.rate = 0.5;   // سرعة بطيئة وواضحة جداً
        window.speechSynthesis.speak(utterance);
    } else {
        alert("خاصية الصوت غير متوفرة في هذا المتصفح.");
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
