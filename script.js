document
    .getElementById("textDisplay")
    .appendChild(renderHTML(parseText(localStorage.getItem("text"))));

const ReaderState = Object.freeze({
    NO_FOCUS: 0,
    PARAGRAPH_FOCUS: 1,
    LINE_FOCUS: 2,
    WORD_FOCUS: 3,
    FRAGMENT_FOCUS: 4,
});

let readerState = ReaderState.NO_FOCUS;
let focusedWordId = null;
let focusedWordForms = null;
let focusedWordFormNumber = 0;

const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
const SpeechGrammarList = window.SpeechGrammarList || window.webkitSpeechGrammarList;
const SpeechRecognitionEvent = window.SpeechRecognitionEvent || window.webkitSpeechRecognitionEvent;

var recognition = new SpeechRecognition();
recognition.continuous = true;
recognition.lang = 'ru-RU';
recognition.interimResults = true;
recognition.maxAlternatives = 1;


// recognition.onend = function() {
//     recognition.start();
// };

recognition.onresult = function(event) {
  // The SpeechRecognitionEvent results property returns a SpeechRecognitionResultList object
  // The SpeechRecognitionResultList object contains SpeechRecognitionResult objects.
  // It has a getter so it can be accessed like an array
  // The first [0] returns the SpeechRecognitionResult at the last position.
  // Each SpeechRecognitionResult object contains SpeechRecognitionAlternative objects that contain individual results.
  // These also have getters so they can be accessed like arrays.
  // The second [0] returns the SpeechRecognitionAlternative at position 0.
  // We then return the transcript property of the SpeechRecognitionAlternative object
  var recognized = event.results[event.resultIndex][0].transcript.trim();
  console.log(event.resultIndex + ' Recognized: ' + recognized.split(" "));

  if (focusedWordId === null) {
    focusWord("0.0.0");
  }
  word = document.getElementById(focusedWordId).innerHTML.toLowerCase();
  if (recognized.toLowerCase().split(" ").includes(word)) {
    focusNextWord();
  }
}

function toogleMic() {
    toogleMicBtn = document.getElementById("toogleMic");
    toogleMicBtn.classList.toggle("mute");
    toogleMicBtn.classList.contains("mute") ? recognition.stop() : recognition.start();
    toogleMicBtn.classList.contains("mute") ? recognition.onend = null : recognition.onend = recognition.start;
}

function parseText(text) {
    const paragraphs = text.trim().split(/\n\s*\n/);
    return paragraphs.map((paragraph) => {
        return paragraph.split(/\s*\n/).map((line) => line.split(/\s+/));
    });
}

function renderHTML(parsedText) {
    const container = document.createElement("article");
    parsedText.forEach((paragraph, paragraphIndex) => {
        const paragraphElement = document.createElement("p");
        const paragraphGlobalIndex = `${paragraphIndex}`;
        paragraphElement.setAttribute("id", paragraphGlobalIndex);
        paragraphElement.classList.add("paragraph");
        paragraph.forEach((line, lineIndex) => {
            const lineElement = document.createElement("span");
            const lineGlobalIndex = `${paragraphGlobalIndex}.${lineIndex}`;
            lineElement.setAttribute("id", lineGlobalIndex);
            lineElement.classList.add("line");
            let wordIndex = 0
            line.forEach((part, partIndex) => {
                const [quote, word, punctuation] = splitWordAndPunctuation(part);
                if (quote !== "") {
                    const quoteNode = document.createTextNode(quote);
                    lineElement.appendChild(quoteNode);
                }
                if (word !== "") {
                    const wordElement = document.createElement("span");
                    const wordGlobalIndex = `${lineGlobalIndex}.${wordIndex}`;
                    wordElement.classList.add("word");
                    wordElement.setAttribute("id", wordGlobalIndex);
                    wordElement.addEventListener("click", () => {
                        focusWord(wordGlobalIndex);
                    });
                    wordElement.textContent = word;
                    lineElement.appendChild(wordElement);
                    wordIndex++;
                }
                if (punctuation !== "") {
                    const punctuationNode =
                        document.createTextNode(punctuation);
                    lineElement.appendChild(punctuationNode);
                }
                if (partIndex === line.length - 1) {
                    const brElement = document.createElement("br");
                    lineElement.appendChild(brElement);
                } else {
                    const spaceNode = document.createTextNode(" ");
                    lineElement.appendChild(spaceNode);
                }
            });
            paragraphElement.appendChild(lineElement);
        });
        container.appendChild(paragraphElement);
    });
    return container;
}

function getLineIndex(wordIndex) {
    return wordIndex.split(".").slice(0, 2).join(".");
}

function getParagraphIndex(wordIndex) {
    return wordIndex.split(".").slice(0, 1).join(".");
}

function focusByID(id) {
    const element = document.getElementById(id);
    element.classList.add("focused-text");
}

function unFocusById(id) {
    const element = document.getElementById(id);
    element.classList.remove("focused-text");
}

function restoreFocusedWord() {
    const wordElement = document.getElementById(focusedWordId);
    wordElement.textContent = focusedWordForms[0];
}

function unFocusReader() {
    switch (readerState) {
        case ReaderState.NO_FOCUS:
            break;
        case ReaderState.FRAGMENT_FOCUS:
            restoreFocusedWord();
            break;
        case ReaderState.WORD_FOCUS:
            unFocusById(focusedWordId);
            break;
        case ReaderState.LINE_FOCUS:
            unFocusById(getLineIndex(focusedWordId));
            break;
        case ReaderState.PARAGRAPH_FOCUS:
            unFocusById(getParagraphIndex(focusedWordId));
    }
}

function focusWord(id) {
    if (id === focusedWordId) {
        return;
    }
    unFocusReader();
    readerState = ReaderState.WORD_FOCUS;
    focusedWordId = id;
    focusedWordForms = generateWordForms(
        document.getElementById(id).textContent,
    );
    console.log("Id:", id, "forms:", focusedWordForms);
    focusByID(id);
}

function focusNextWord() {
    const [paragraphId, lineId, wordId] = focusedWordId.split(".").map(Number);
    let globalWordId = [paragraphId, lineId, wordId + 1].map(String).join(".");
    if (document.getElementById(globalWordId) === null) {
        globalWordId = [paragraphId, lineId + 1, 0].map(String).join(".");
        if (document.getElementById(globalWordId) === null) {
            globalWordId = [paragraphId + 1, 0, 0].map(String).join(".");
            if (document.getElementById(globalWordId) === null) {
                focusedWordId = null;
            }
        }
    }
    focusWord(globalWordId);
}

function focusPreviousWord() {
    const [paragraphId, lineId, wordId] = focusedWordId.split(".").map(Number);
    let globalWordId = [paragraphId, lineId, wordId - 1].map(String).join(".");
    if (document.getElementById(globalWordId) === null) {
        globalWordId = [paragraphId, lineId - 1, 0].map(String).join(".");
        if (document.getElementById(globalWordId) === null) {
            globalWordId = [paragraphId - 1, 0, 0].map(String).join(".");
            if (document.getElementById(globalWordId) === null) {
                focusedWordId = null;
            }
        }
    }
    focusWord(globalWordId);
}

function splitWordAndPunctuation(str) {
    const match = str.trim().match(/^([^\p{L}]*)([\p{L}-]*)([^\p{L}]*$)/u);
    return [match[1], match[2], match[3]];
}

function splitOnFragments(word) {
    const [fragment, remains] = splitOffOneFragment(word);
    if (remains.length === 0) {
        return [fragment];
    }
    let fragments = splitOnFragments(remains);
    fragments.unshift(fragment);
    return fragments;
}

function splitOffOneFragment(word) {
    const vowels = "аеёиоуыэюяАЕЁИОУЫЭЮЯъьЬЪ";
    if (vowels.includes(word[0])) {
        return [word[0], word.slice(1)];
    }
    if (!vowels.includes(word[1])) {
        return [word[0], word.slice(1)];
    }
    return [word.slice(0, 2), word.slice(2)];
}


function strip_dash(str) {
    if (str === null) return null
    return str.replace(/^-+|-+$/g, '');
}


function generateWordForms(word) {
    let forms = [word];
    const fragments = splitOnFragments(word);
    console.log(fragments);
    if (fragments.length === 1) {
        return forms;
    }
    for (let i = 0; i < fragments.length; i++) {
        if (fragments[i] === "-") continue
        switch (i) {
            case 0:
                forms.push([
                    null,
                    fragments[i],
                    strip_dash(fragments.slice(i + 1).join("")),
                ]);
                break;
            case fragments.length - 1:
                forms.push([
                    strip_dash(fragments.slice(0, i).join("")),
                    fragments[i],
                    null,
                ]);
                break;
            default:
                forms.push([
                    strip_dash(fragments.slice(0, i).join("")),
                    fragments[i],
                    strip_dash(fragments.slice(i + 1).join("")),
                ]);
                forms.push([
                    null,
                    fragments.slice(0, i + 1).join(""),
                    strip_dash(fragments.slice(i + 1).join("")),
                ]);
                break;
        }
    }
    forms.push([null, word, null]);
    return forms;
}

function focusFragment() {
    readerState = ReaderState.FRAGMENT_FOCUS;
    let [waited, focused, remains] = focusedWordForms[focusedWordFormNumber];
    let wordElement = document.getElementById(focusedWordId);
    wordElement.innerHTML = "";
    if (waited !== null) {
        let waitedElement = document.createElement("span");
        waitedElement.textContent = waited + "-";
        wordElement.appendChild(waitedElement);
    }
    let focusedElement = document.createElement("span");
    focusedElement.textContent = focused;
    focusedElement.classList.add("focused-text");
    wordElement.appendChild(focusedElement);
    if (remains !== null) {
        const remainsElement = document.createTextNode("-" + remains);
        wordElement.appendChild(remainsElement);
    }
}

function forward() {
    unFocusReader();
    switch (readerState) {
        case ReaderState.NO_FOCUS:
            focusWord("0.0.0");
            break;
        case ReaderState.WORD_FOCUS:
            if (focusedWordForms.length === 1) {
                focusNextWord();
                break;
            }
            focusedWordFormNumber = 1;
            focusFragment();
            break;
        case ReaderState.FRAGMENT_FOCUS:
            focusedWordFormNumber++;
            if (focusedWordFormNumber === focusedWordForms.length) {
                focusNextWord();
                break;
            }
            focusFragment();
            break;
    }
}

function rewind() {
    unFocusReader();
    switch (readerState) {
        case ReaderState.NO_FOCUS:
            break;
        case ReaderState.WORD_FOCUS:
            focusPreviousWord();
        case ReaderState.FRAGMENT_FOCUS:
            focusedWordFormNumber--;
            if (focusedWordFormNumber === 0) {
                focusPreviousWord();
                break;
            }
            focusFragment();
            break;
    }
}
