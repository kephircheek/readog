function storyKey(md5) {
    return "story-" + md5;
}

function storyHistoryKey() {
    return "story-history";
}

function getStory(md5) {
    return JSON.parse(localStorage.getItem(storyKey(md5)));
}

function setRealViewportHeight() {
    document.documentElement.style.setProperty('--vh', `${window.visualViewport.height}px`)
}

setRealViewportHeight();
window.addEventListener('resize', setRealViewportHeight);
window.addEventListener('orientationchange', setRealViewportHeight);
