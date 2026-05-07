function showLesson(lessonId) {
    // Hide menu
    document.getElementById('course-menu').style.display = 'none';
    // Show navigation
    document.querySelector('.lesson-nav').style.display = 'flex';

    // Hide all lessons
    document.querySelectorAll('.lesson-card').forEach(card => {
        card.classList.remove('active');
    });
    // Deactivate all nav buttons
    document.querySelectorAll('.nav-btn').forEach(btn => {
        btn.classList.remove('active');
    });

    // Show selected lesson
    document.getElementById('lesson' + lessonId).classList.add('active');

    // Smooth scroll to top of lesson
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

function goToMenu() {
    // Show menu
    document.getElementById('course-menu').style.display = 'grid';
    // Hide navigation
    document.querySelector('.lesson-nav').style.display = 'none';
    // Hide all lessons
    document.querySelectorAll('.lesson-card').forEach(card => {
        card.classList.remove('active');
    });
}

// Drag and Drop Logic
let draggables = document.querySelectorAll('.draggable');
let dropZones = document.querySelectorAll('.drop-item');

// Mouse Drag Events
draggables.forEach(draggable => {
    draggable.addEventListener('dragstart', () => {
        draggable.classList.add('dragging');
    });

    draggable.addEventListener('dragend', () => {
        draggable.classList.remove('dragging');
    });

    // Touch Support
    draggable.addEventListener('touchstart', (e) => {
        draggable.classList.add('dragging');
    }, { passive: true });

    draggable.addEventListener('touchmove', (e) => {
        const touch = e.touches[0];
        const draggingElement = document.querySelector('.dragging');
        if (!draggingElement) return;

        // Visual feedback: track the target zone
        // We set pointer-events to none so elementFromPoint sees what's UNDER the finger
        draggingElement.style.pointerEvents = 'none';
        const target = document.elementFromPoint(touch.clientX, touch.clientY);
        draggingElement.style.pointerEvents = 'auto';

        const zone = target?.closest('.drop-item');

        dropZones.forEach(z => z.classList.remove('hover'));
        if (zone) zone.classList.add('hover');

        if (e.cancelable) e.preventDefault(); // Stop scrolling
    }, { passive: false });

    draggable.addEventListener('touchend', (e) => {
        const touch = e.changedTouches[0];
        draggable.classList.remove('dragging');

        // Final check for the zone
        draggable.style.pointerEvents = 'none';
        const target = document.elementFromPoint(touch.clientX, touch.clientY);
        draggable.style.pointerEvents = 'auto';

        const zone = target?.closest('.drop-item');

        if (zone) {
            handleDrop(draggable, zone);
        }

        dropZones.forEach(z => z.classList.remove('hover'));
    });
});

dropZones.forEach(zone => {
    zone.addEventListener('dragover', (e) => {
        e.preventDefault();
        zone.classList.add('hover');
    });

    zone.addEventListener('dragleave', () => {
        zone.classList.remove('hover');
    });

    zone.addEventListener('drop', (e) => {
        e.preventDefault();
        const draggingElement = document.querySelector('.dragging');
        if (draggingElement) {
            handleDrop(draggingElement, zone);
        }
    });
});

function handleDrop(draggable, zone) {
    zone.classList.remove('hover');
    const draggableId = draggable.id;
    const matchId = zone.getAttribute('data-match');

    if (draggableId === matchId) {
        zone.appendChild(draggable);
        draggable.classList.add('placed');
        draggable.setAttribute('draggable', 'false');
        draggable.style.pointerEvents = 'auto'; // Ensure it's clickable for audio if needed

        // Success feedback
        checkProgress(zone);
    } else {
        // Error visual feedback
        zone.style.borderColor = '#c0392b';
        zone.style.backgroundColor = '#fff5f5';
        setTimeout(() => {
            zone.style.borderColor = '#ccc';
            zone.style.backgroundColor = '';
        }, 500);
    }
}

function checkProgress(zone) {
    const exerciseContainer = zone.closest('.exercise-container');
    if (!exerciseContainer) return;

    const total = exerciseContainer.querySelectorAll('.drop-item').length;
    const filled = exerciseContainer.querySelectorAll('.draggable.placed').length;

    if (total === filled && total > 0) {
        const feedback = exerciseContainer.querySelector('.feedback');
        if (feedback) {
            feedback.textContent = `¡Excelente! Has resuelto todos los acertijos. 🏆`;
            feedback.style.color = "var(--success)";

            speak(`¡Excelente! Has resuelto todos los acertijos.`, 'es-ES', 1.1, 1.2);
        }
    }
}

// Simple Answer Check for Buttons
function checkAnswer(btn, isCorrect) {
    // Prevent multiple clicks
    if (btn.classList.contains('correct') || btn.classList.contains('wrong')) return;

    if (isCorrect) {
        btn.classList.add('correct');
        btn.textContent += " ✓";
        // Universal success audio for all button-based exercises
        speak(`¡Bien!`, 'es-ES', 1.1, 1.2);
    } else {
        btn.classList.add('wrong');
        btn.textContent += " ✗";
        speak(`No. Inténtalo otra vez.`, 'es-ES', 0.9, 1.0);
    }
}

function checkFavoriteDay() {
    const input = document.getElementById('fav-day-input').value.trim().toLowerCase();
    const feedback = document.getElementById('fav-day-feedback');

    const diasValidos = ['lunes', 'martes', 'miércoles', 'miercoles', 'jueves', 'viernes', 'sábado', 'sabado', 'domingo'];
    const correcciones = {
        'miercoles': 'miércoles',
        'sabado': 'sábado'
    };

    if (diasValidos.includes(input)) {
        feedback.innerHTML = `<span style="color: var(--success);">¡Buen trabajo! ✅</span>`;
        // Always say "¡Buen trabajo!" with verve
        speak(`¡Buen trabajo! ¡Fantástico!`, 'es-ES', 1.1, 1.2);
    } else {
        const solucion = "Sábado (por ejemplo)";
        feedback.innerHTML = `<span style="color: var(--accent-color);">No te preocupes. La solución podría ser: <strong>${solucion}</strong>. ¡Ánimo! 💪</span>`;
        speak(`No te preocupes. Inténtalo otra vez.`, 'es-ES', 0.9, 1.0);
    }
}

function checkDaysWriting() {
    const inputs = document.querySelectorAll('.day-input');
    const feedback = document.getElementById('feedback-days-writing');
    let correctCount = 0;

    // Normalización para ser flexible con acentos
    const normalize = (str) => {
        return str.toLowerCase().trim().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    };

    inputs.forEach(input => {
        const userAnswer = input.value.trim().toLowerCase();
        const correctAnswer = input.getAttribute('data-answer');

        if (userAnswer === "") {
            input.style.borderColor = "#ccc";
            input.style.backgroundColor = "";
        } else if (normalize(userAnswer) === normalize(correctAnswer)) {
            input.style.borderColor = "#2ecc71";
            input.style.backgroundColor = "#e8f8f0";
            correctCount++;
        } else {
            input.style.borderColor = "#e74c3c";
            input.style.backgroundColor = "#fdf2f2";
        }
    });

    if (correctCount === inputs.length) {
        feedback.innerHTML = '<span style="color: #27ae60;">¡Perfecto! Has escrito todos los días correctamente. 🏆</span>';
        speak('¡Excelente! Todo correcto.', 'es-ES');
    } else if (correctCount > 0) {
        feedback.innerHTML = `<span style="color: #f39c12;">Vas por buen camino. Tienes ${correctCount} de ${inputs.length} correctos.</span>`;
    } else {
        feedback.innerHTML = '<span style="color: #e74c3c;">Intenta completar los espacios en español.</span>';
    }
}

function checkMonthsWriting() {
    const inputs = document.querySelectorAll('.month-input');
    const feedback = document.getElementById('feedback-months-writing');
    let correctCount = 0;

    const normalize = (str) => {
        return str.toLowerCase().trim().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    };

    inputs.forEach(input => {
        const userAnswer = input.value.trim().toLowerCase();
        const correctAnswer = input.getAttribute('data-answer');

        if (userAnswer === "") {
            input.style.borderColor = "#ccc";
            input.style.backgroundColor = "";
        } else if (normalize(userAnswer) === normalize(correctAnswer)) {
            input.style.borderColor = "#2ecc71";
            input.style.backgroundColor = "#e8f8f0";
            correctCount++;
        } else {
            input.style.borderColor = "#e74c3c";
            input.style.backgroundColor = "#fdf2f2";
        }
    });

    if (correctCount === inputs.length) {
        feedback.innerHTML = '<span style="color: #27ae60;">¡Increíble! Te sabes todos los meses. 📅</span>';
        speak('¡Increíble! Te sabes todos los meses.', 'es-ES');
    } else if (correctCount > 0) {
        feedback.innerHTML = `<span style="color: #f39c12;">Buen intento. Tienes ${correctCount} de ${inputs.length} correctos.</span>`;
    } else {
        feedback.innerHTML = '<span style="color: #e74c3c;">Escribe los meses en español para comprobar.</span>';
    }
}

// Speech Synthesis Logic with improved loading, priming, and female voices
let voices = [];
let audioUnlocked = false;

function loadVoices() {
    voices = window.speechSynthesis.getVoices();
}

if ('speechSynthesis' in window) {
    loadVoices();
    window.speechSynthesis.onvoiceschanged = loadVoices;
}

function speak(text, lang = 'es-ES', rate = 0.9, pitch = 1.0) {
    if (!('speechSynthesis' in window)) return;

    // Detener cualquier audio previo antes de empezar uno nuevo (Evita el "loop" y colas infinitas)
    window.speechSynthesis.cancel();

    speakInternal(text, lang, rate, pitch);
}

function speakInternal(text, lang, rate, pitch) {
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = lang;
    utterance.rate = rate;
    utterance.pitch = pitch;

    if (voices.length === 0) voices = window.speechSynthesis.getVoices();

    // Find a FEMALE voice
    let preferredVoice;
    if (lang.startsWith('es')) {
        preferredVoice = voices.find(v => v.lang.startsWith('es') && (v.name.includes('Google') || v.name.includes('Helena') || v.name.includes('Monica') || v.name.includes('Lucia')));
    } else if (lang.startsWith('en')) {
        preferredVoice = voices.find(v => v.lang.startsWith('en') && (v.name.includes('Google') || v.name.includes('Google UK English Female') || v.name.includes('Susan') || v.name.includes('Zira')));
    }

    if (preferredVoice) utterance.voice = preferredVoice;

    window.speechSynthesis.speak(utterance);
    console.log(`Speaking (${lang}):`, text);
}

// Global unlocker
document.addEventListener('click', () => {
    if (!audioUnlocked) {
        const silent = new SpeechSynthesisUtterance('');
        window.speechSynthesis.speak(silent);
        audioUnlocked = true;
        console.log("Audio system primed and ready.");
    }
}, { once: true });

// Initialize app
document.addEventListener('DOMContentLoaded', () => {
    loadVoices();
});
