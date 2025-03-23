document.addEventListener('DOMContentLoaded', function() {
    const history = JSON.parse(localStorage.getItem(storyHistoryKey())) || [];
    insertStories("", "recent-stories", history);
});

window.addEventListener('pageshow', function(event) {
    if (event.persisted) {
        const history = JSON.parse(localStorage.getItem(storyHistoryKey())) || [];
        insertStories("", "recent-stories", history);
    }
});