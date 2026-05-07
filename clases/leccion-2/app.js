/**
 * Lesson 2: The Verb "Llamarse"
 * Handles navigation between lesson sections and drag and drop exercises.
 */

function showLesson(lessonId) {
    // Hide menu
    document.getElementById('course-menu').style.display = 'none';
    // Hide all lesson cards
    document.querySelectorAll('.lesson-card').forEach(card => {
        card.style.display = 'none';
    });
    // Show selected lesson
    const selectedLesson = document.getElementById('lesson' + lessonId);
    if (selectedLesson) {
        selectedLesson.style.display = 'block';
        window.scrollTo(0, 0);
    }
    // Show navigation bar
    document.querySelector('.lesson-nav').style.display = 'flex';
}

function goToMenu() {
    // Hide all lesson cards
    document.querySelectorAll('.lesson-card').forEach(card => {
        card.style.display = 'none';
    });
    // Show menu
    document.getElementById('course-menu').style.display = 'grid';
    // Hide navigation bar
    document.querySelector('.lesson-nav').style.display = 'none';
    window.scrollTo(0, 0);
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

        // Visual feedback
        draggingElement.style.pointerEvents = 'none';
        const target = document.elementFromPoint(touch.clientX, touch.clientY);
        draggingElement.style.pointerEvents = 'auto';

        const zone = target?.closest('.drop-item');

        dropZones.forEach(z => z.classList.remove('hover'));
        if (zone) zone.classList.add('hover');

        if (e.cancelable) e.preventDefault();
    }, { passive: false });

    draggable.addEventListener('touchend', (e) => {
        const touch = e.changedTouches[0];
        draggable.classList.remove('dragging');

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
    const draggableValue = draggable.getAttribute('data-value');
    const matchValue = zone.getAttribute('data-match');

    // If zone already has a placed item, don't allow drop unless it's the same
    if (zone.querySelector('.draggable.placed')) return;

    if (draggableValue === matchValue) {
        zone.appendChild(draggable);
        draggable.classList.add('placed');
        draggable.setAttribute('draggable', 'false');
        draggable.style.pointerEvents = 'auto';

        checkProgress(zone.parentElement);
    } else {
        // Error visual feedback
        zone.style.borderColor = '#c0392b';
        zone.style.backgroundColor = '#fff5f5';
        setTimeout(() => {
            zone.style.borderColor = '#ccc';
            zone.style.backgroundColor = '';
        }, 500);
        speak(`No. Inténtalo otra vez.`, 'es-ES', 0.9, 1.0);
    }
}

function checkProgress(dropZonesContainer) {
    const exerciseContainer = dropZonesContainer.closest('.exercise-container');
    const total = dropZonesContainer.querySelectorAll('.drop-item').length;
    const filled = dropZonesContainer.querySelectorAll('.draggable.placed').length;

    if (total === filled) {
        const feedback = exerciseContainer.querySelector('.feedback');
        if (feedback) {
            feedback.textContent = `¡Excelente trabajo! ✅`;
            feedback.style.color = "#27ae60";
            speak(`¡Excelente trabajo!`, 'es-ES', 1.1, 1.2);
        }
    }
}

// Speech Synthesis Logic
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
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = lang;
    utterance.rate = rate;
    utterance.pitch = pitch;

    if (voices.length === 0) voices = window.speechSynthesis.getVoices();

    let preferredVoice;
    if (lang.startsWith('es')) {
        preferredVoice = voices.find(v => v.lang.startsWith('es') && (v.name.includes('Google') || v.name.includes('Helena') || v.name.includes('Monica') || v.name.includes('Lucia')));
    } else if (lang.startsWith('en')) {
        preferredVoice = voices.find(v => v.lang.startsWith('en') && (v.name.includes('Google') || v.name.includes('Google UK English Female') || v.name.includes('Susan') || v.name.includes('Zira')));
    }

    if (preferredVoice) utterance.voice = preferredVoice;
    window.speechSynthesis.speak(utterance);
}

// Global unlocker for audio
document.addEventListener('click', () => {
    if (!audioUnlocked) {
        const silent = new SpeechSynthesisUtterance('');
        window.speechSynthesis.speak(silent);
        audioUnlocked = true;
    }
}, { once: true });

document.addEventListener('DOMContentLoaded', () => {
    loadVoices();
});

/**
 * Normalizes text by removing accents and converting to lowercase.
 */
function normalizeText(text) {
    return text.toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .trim();
}

/**
 * Validates the writing exercise.
 */
function checkWritingExercise() {
    const inputs = document.querySelectorAll('.writing-input');
    const feedback = document.getElementById('feedback-writing');
    let allCorrect = true;
    let filledCount = 0;

    inputs.forEach(input => {
        const userAnswer = input.value.trim();
        const correctAnswer = input.getAttribute('data-answer');

        if (userAnswer !== "") {
            filledCount++;
            if (normalizeText(userAnswer) === normalizeText(correctAnswer)) {
                input.style.borderColor = "#27ae60";
                input.style.backgroundColor = "#f1fbf5";
            } else {
                input.style.borderColor = "#c0392b";
                input.style.backgroundColor = "#fff5f5";
                allCorrect = false;
            }
        } else {
            allCorrect = false;
        }
    });

    if (filledCount === 0) {
        feedback.textContent = "Escribe algo primero...";
        feedback.style.color = "var(--text-secondary)";
    } else if (allCorrect) {
        feedback.textContent = "¡Perfecto! Todo está correcto. 🎉";
        feedback.style.color = "#27ae60";
        speak("¡Perfecto! Todo está correcto.", 'es-ES', 1.1, 1.2);
    } else {
        feedback.textContent = "Algunas respuestas no son correctas. ¡Sigue intentando!";
        feedback.style.color = "#c0392b";
        speak("No te preocupes. Inténtalo otra vez.", 'es-ES', 0.9, 1.0);
    }
}

/**
 * Validates Numbers Writing.
 */
function checkNumbersWriting() {
    const inputs = document.querySelectorAll('.number-input');
    const feedback = document.getElementById('feedback-numbers-writing');
    let correct = 0;

    inputs.forEach(input => {
        const user = input.value.trim();
        const target = input.getAttribute('data-answer');
        if (user !== "" && normalizeText(user) === normalizeText(target)) {
            input.style.borderColor = "#27ae60";
            input.style.backgroundColor = "#e8f8f0";
            correct++;
        } else if (user !== "") {
            input.style.borderColor = "#e74c3c";
            input.style.backgroundColor = "#fdf2f2";
        }
    });

    if (correct === inputs.length) {
        feedback.innerHTML = '<span style="color: #27ae60;">¡Genial! Sabes contar muy bien. 🏆</span>';
        speak("¡Excelente trabajo con los números!", 'es-ES');
    } else {
        feedback.innerHTML = `Tienes ${correct} de ${inputs.length} correctos.`;
    }
}

/**
 * Validates Age Writing.
 */
function checkAgeWriting() {
    const inputs = document.querySelectorAll('.age-input');
    const feedback = document.getElementById('feedback-age-writing');
    let correct = 0;

    inputs.forEach(input => {
        const user = normalizeText(input.value.trim());
        const targetAttr = input.getAttribute('data-answer');
        
        // Support multiple answers separated by |
        const validAnswers = targetAttr.split('|').map(ans => normalizeText(ans.trim()));
        
        if (user !== "") {
            if (validAnswers.includes(user)) {
                input.style.borderColor = "#27ae60";
                input.style.backgroundColor = "#e8f8f0";
                correct++;
            } else {
                input.style.borderColor = "#e74c3c";
                input.style.backgroundColor = "#fdf2f2";
            }
        }
    });

    if (correct === inputs.length) {
        feedback.innerHTML = '<span style="color: #27ae60;">¡Perfecto! Dominas el verbo tener. ✅</span>';
        speak("Muy bien, dominas el verbo tener.", 'es-ES');
    } else {
        feedback.innerHTML = `Tienes ${correct} de ${inputs.length} correctas.`;
    }
}

/**
 * Validates Time Writing.
 */
function checkTimeWriting() {
    const inputs = document.querySelectorAll('.time-input');
    const feedback = document.getElementById('feedback-time-writing');
    let correct = 0;

    inputs.forEach(input => {
        const user = input.value.trim();
        const target = input.getAttribute('data-answer');
        if (user !== "" && normalizeText(user) === normalizeText(target)) {
            input.style.borderColor = "#27ae60";
            input.style.backgroundColor = "#e8f8f0";
            correct++;
        } else if (user !== "") {
            input.style.borderColor = "#e74c3c";
            input.style.backgroundColor = "#fdf2f2";
        }
    });

    if (correct === inputs.length) {
        feedback.innerHTML = '<span style="color: #27ae60;">¡Fantástico! Ya sabes dar la hora. ⏰</span>';
        speak("¡Fantástico! Ya sabes dar la hora.", 'es-ES');
    } else {
        feedback.innerHTML = `Tienes ${correct} de ${inputs.length} correctas.`;
    }
}
