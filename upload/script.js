navigator.clipboard
    .readText()
    .then(text => {
        document.getElementById("textInput").value = text;
    })
    .catch(err => {
        console.error("Ошибка при чтении из буфера обмена:", err);
    });

function startReading() {
    const text = document.getElementById("textInput").value;
    if (text.trim()) {
        const md5_hash = storeStory(text);
        window.location.href = "../reader/index.html?md5=" + md5_hash;
    } else {
        alert("Введите текст!");
    }
}

function showSpinner() {
    document.getElementById('spinner').classList.add('show');
    [
        document.getElementById('startReading'),
        document.getElementById('textInput'),
        document.getElementById('imageInputLabel')
    ].forEach((elem) => {
        ['dimmed-text', 'unresponsive'].forEach((cls) => {
            elem.classList.add(cls);
        });
    });
}

function hideSpinner() {
    document.getElementById('spinner').classList.remove('show');
    [
        document.getElementById('startReading'),
        document.getElementById('textInput'),
        document.getElementById('imageInputLabel')
    ].forEach((elem) => {
        ['dimmed-text', 'unresponsive'].forEach((cls) => {
            elem.classList.remove(cls);
        });
    });
}

document.addEventListener('DOMContentLoaded', function() {
    document.getElementById('imageInput').addEventListener('change', function(event) {
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            const img = new Image();
            img.src = e.target.result;
            showSpinner();
            Tesseract.recognize(img.src, 'rus', {
                logger: m => console.log(m)
            }).then(({
                data: {
                    text
                }
            }) => {
                const textarea = document.getElementById("textInput");
                textarea.value += text;
                textarea.selectionStart = textarea.selectionEnd = textarea.value.length;
                textarea.scrollTop = textarea.scrollHeight;
                hideSpinner();
            }).catch(err => {
                hideSpinner();
                alert('Ошибка распознавания текста');
            });
        };
        reader.readAsDataURL(file);
        }
    });
});

function calculateMD5(text) {
    return CryptoJS.MD5(text).toString();
}

function storeStory(text) {
    const md5 = calculateMD5(text);
    const key = storyKey(md5);

    localStorage.setItem(key, JSON.stringify({
        md5: md5,
        text: text
    }));

    return md5;
}