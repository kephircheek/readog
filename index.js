document.addEventListener('DOMContentLoaded', function() {
    const history = JSON.parse(localStorage.getItem(storyHistoryKey())) || [];
    insertStories("", "recent-stories", history);
});