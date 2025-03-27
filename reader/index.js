document.addEventListener('DOMContentLoaded', function() {
    const story = getStory(new URLSearchParams(window.location.search).get("md5"));
    if (!story?.text) {
        alert("Не удалось найти текст!");
        window.location.href = "../index.html";
    } else {
        prependToStoryHistory(story.md5);
        const textDisplay = document.getElementById("textDisplay");
        textDisplay.replaceChildren(...renderHTML(parseText(story.text)));
    }
});