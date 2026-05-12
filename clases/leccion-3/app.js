/**
 * Lesson 3: The Family and Ser/Estar Review
 */

function showLesson(lessonId) {
    document.getElementById('course-menu').style.display = 'none';
    document.querySelectorAll('.lesson-card').forEach(card => {
        card.style.display = 'none';
    });
    const selectedLesson = document.getElementById('lesson' + lessonId);
    if (selectedLesson) {
        selectedLesson.style.display = 'block';
        window.scrollTo(0, 0);
    }
    document.querySelector('.lesson-nav').style.display = 'flex';
}

function goToMenu() {
    document.querySelectorAll('.lesson-card').forEach(card => {
        card.style.display = 'none';
    });
    document.getElementById('course-menu').style.display = 'grid';
    document.querySelector('.lesson-nav').style.display = 'none';
    window.scrollTo(0, 0);
}

// Drag and Drop Logic
let draggables = document.querySelectorAll('.draggable');
let dropZones = document.querySelectorAll('.drop-item');

function initDragAndDrop() {
    draggables = document.querySelectorAll('.draggable');
    dropZones = document.querySelectorAll('.drop-item');

    draggables.forEach(draggable => {
        draggable.addEventListener('dragstart', () => draggable.classList.add('dragging'));
        draggable.addEventListener('dragend', () => draggable.classList.remove('dragging'));

        // Touch Support
        draggable.addEventListener('touchstart', (e) => {
            draggable.classList.add('dragging');
        }, { passive: true });

        draggable.addEventListener('touchmove', (e) => {
            const touch = e.touches[0];
            const draggingElement = document.querySelector('.dragging');
            if (!draggingElement) return;

            draggingElement.style.pointerEvents = 'none';
            const target = document.elementFromPoint(touch.clientX, touch.clientY);
            draggingElement.style.pointerEvents = 'auto';

            const zone = target?.closest('.drop-item');
            document.querySelectorAll('.drop-item').forEach(z => z.classList.remove('hover'));
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
            if (zone) handleDrop(draggable, zone);
            document.querySelectorAll('.drop-item').forEach(z => z.classList.remove('hover'));
        });
    });

    dropZones.forEach(zone => {
        zone.addEventListener('dragover', (e) => {
            e.preventDefault();
            zone.classList.add('hover');
        });
        zone.addEventListener('dragleave', () => zone.classList.remove('hover'));
        zone.addEventListener('drop', (e) => {
            e.preventDefault();
            const draggingElement = document.querySelector('.dragging');
            if (draggingElement) handleDrop(draggingElement, zone);
        });
    });
}

function handleDrop(draggable, zone) {
    zone.classList.remove('hover');
    const draggableValue = draggable.getAttribute('data-value');
    const matchValue = zone.getAttribute('data-match');

    if (zone.querySelector('.draggable.placed')) return;

    if (draggableValue === matchValue) {
        zone.appendChild(draggable);
        draggable.classList.add('placed');
        draggable.setAttribute('draggable', 'false');
        checkProgress(zone.parentElement);
    } else {
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

// Speech Synthesis
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
        preferredVoice = voices.find(v => v.lang.startsWith('es') && (v.name.includes('Google') || v.name.includes('Helena') || v.name.includes('Monica')));
    }
    if (preferredVoice) utterance.voice = preferredVoice;
    window.speechSynthesis.speak(utterance);
}

document.addEventListener('click', () => {
    if (!audioUnlocked) {
        const silent = new SpeechSynthesisUtterance('');
        window.speechSynthesis.speak(silent);
        audioUnlocked = true;
    }
}, { once: true });

function normalizeText(text) {
    return text.toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[¿?¡!.,]/g, "") // Remove common punctuation
        .trim();
}

function checkWriting(exerciseId) {
    const container = document.getElementById(exerciseId);
    const inputs = container.querySelectorAll('.writing-input');
    const feedback = container.querySelector('.feedback');
    let correct = 0;

    inputs.forEach(input => {
        const user = normalizeText(input.value);
        const target = normalizeText(input.getAttribute('data-answer'));
        if (user !== "" && user === target) {
            input.style.borderColor = "#27ae60";
            input.style.backgroundColor = "#e8f8f0";
            correct++;
        } else if (user !== "") {
            input.style.borderColor = "#e74c3c";
            input.style.backgroundColor = "#fdf2f2";
        }
    });

    if (correct === inputs.length) {
        feedback.innerHTML = '<span style="color: #27ae60;">¡Perfecto! Todo está correcto. 🎉</span>';
        speak("¡Perfecto! Todo está correcto.", 'es-ES');
    } else {
        feedback.innerHTML = `Tienes ${correct} de ${inputs.length} correctas.`;
    }
}

document.addEventListener('DOMContentLoaded', () => {
    loadVoices();
    initDragAndDrop();
});
