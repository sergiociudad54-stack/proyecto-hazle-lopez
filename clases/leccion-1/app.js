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

draggables.forEach(draggable => {
    draggable.addEventListener('dragstart', () => {
        draggable.classList.add('dragging');
    });

    draggable.addEventListener('dragend', () => {
        draggable.classList.remove('dragging');
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
        zone.classList.remove('hover');
        
        const draggableId = document.querySelector('.dragging').id;
        const matchId = zone.getAttribute('data-match');

        if (draggableId === matchId) {
            const draggable = document.getElementById(draggableId);
            zone.appendChild(draggable);
            draggable.classList.add('placed');
            draggable.setAttribute('draggable', 'false');
            
            // Success sound or visual cue
            checkProgress(zone.parentElement);
        } else {
            // Shake or visual cue for wrong drop
            zone.style.borderColor = '#c0392b';
            setTimeout(() => {
                zone.style.borderColor = '#ccc';
            }, 500);
        }
    });
});

function checkProgress(container) {
    const total = container.querySelectorAll('.drop-item').length;
    const filled = container.querySelectorAll('.draggable.placed').length;
    
    if (total === filled) {
        const feedbackId = container.parentElement.querySelector('.feedback')?.id;
        if (feedbackId) {
            document.getElementById(feedbackId).textContent = `¡Buen trabajo! ✅`;
            document.getElementById(feedbackId).style.color = "var(--success)";
            
            // Speak with verve (higher pitch and rate)
            speak(`¡Buen trabajo!`, 'es-ES', 1.1, 1.2);
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
