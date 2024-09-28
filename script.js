let text = localStorage.getItem('text');
let words = text.split(/\s+/);
let currentIndex = -1;

const textDisplay = document.getElementById('textDisplay');
const prevBtn = document.getElementById('prev');
const nextBtn = document.getElementById('next');
let currentWordElement = null;
let currentWordSyllables = [];
let syllableIndex = 0;

function displayText() {
    textDisplay.innerHTML = words.map((word, index) => 
        `<span class="word" data-index="${index}">${word}</span>`
    ).join(' ');
}

function highlightWord(index) {
    if (currentWordElement) {
        currentWordElement.classList.remove('highlighted-word');
    }

    const wordsSpans = document.querySelectorAll('.word');
    currentWordElement = wordsSpans[index];
    currentWordElement.classList.add('highlighted-word');

    wordsSpans.forEach((span, i) => {
        if (i !== index) {
            span.classList.add('dimmed-text');
        } else {
            span.classList.remove('dimmed-text');
        }
    });

    // Расчёт слогов для текущего слова
    currentWordSyllables = splitIntoSyllables(words[index]);
    syllableIndex = 0;
}

function splitIntoSyllables(word) {
    let vowels = 'аеёиоуыэюя';
    let syllables = [];
    let syllable = '';

    for (let i = 0; i < word.length; i++) {
        let char = word[i];
        syllable += char;

        if (vowels.includes(char.toLowerCase()) || (i > 0 && !vowels.includes(word[i - 1].toLowerCase()))) {
            syllables.push(syllable);
            syllable = '';
        }
    }

    if (syllable) {
        syllables.push(syllable);
    }
    return syllables;
}

function showNextStep() {
    if (syllableIndex < currentWordSyllables.length) {
        currentWordElement.innerHTML = currentWordSyllables
            .map((syllable, index) => 
                index === syllableIndex ? `<span class="highlighted-word">${syllable}</span>` : syllable)
            .join('-');
        syllableIndex++;
    } else {
        highlightWord(++currentIndex);
    }
}

function showPreviousStep() {
    // Логика обратного хода (аналогична showNextStep, но для обратного направления)
}

document.addEventListener('DOMContentLoaded', () => {
    displayText();

    document.querySelectorAll('.word').forEach((span) => {
        span.addEventListener('click', function () {
            currentIndex = parseInt(this.getAttribute('data-index'));
            highlightWord(currentIndex);
        });
    });

    nextBtn.addEventListener('click', showNextStep);
    prevBtn.addEventListener('click', showPreviousStep);
});

document.getElementById('startReading').addEventListener('click', function() {
    const text = document.getElementById('inputText').value;
    if (text.trim()) {
        localStorage.setItem('text', text);
        window.location.href = 'reader.html';
    } else {
        alert('Введите текст.');
    }
});