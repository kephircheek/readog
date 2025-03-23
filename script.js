function storyKey(md5) {
    return "story-" + md5;
}

function storyHistoryKey() {
    return "story-history";
}

function getStory(md5) {
    return JSON.parse(localStorage.getItem(storyKey(md5)));
}