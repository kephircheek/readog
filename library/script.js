function createEntryFromStory(rootPath, story) {
    if (!story || !story.text) return null;
    const firstLine = story.text.split('\n')[0];
    const title = firstLine + (firstLine.length > 50 ? '...' : '');
    const li = document.createElement('li');
    li.innerHTML = `
        <a class="btn" href="${rootPath}reader/index.html?md5=${story.md5}">
            ${title}
        </a>
    `;
    return li;
}

function insertStories(rootPath, listID, hashes) {
    if (!hashes) {
        hashes = Object
        .keys(localStorage)
        .filter(key => key.startsWith('story-'))
        .map(key => key.split('-')[1])
        .reverse();
    }
    console.log(hashes);
    const list = document.getElementById(listID);
    if (!list) {
        console.error("List not found");
        return;
    }
    list.innerHTML = '';
    for (let i = 0; i < hashes.length; i++) {
        const hash = hashes[i];
        try {
            const story = getStory(hash);
            const li = createEntryFromStory(rootPath, story);
            if (li) {
                list.appendChild(li);
            }
        } catch (e) {
            console.error(e);
            continue;
        }
    }
}