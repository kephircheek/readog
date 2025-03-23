function storyKey(md5) {
    return "story-" + md5;
}

function getStory(md5) {
    return JSON.parse(localStorage.getItem(storyKey(md5)));
}