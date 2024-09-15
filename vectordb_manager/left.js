import FileProcessor from '/components/splitTextFile/fileProcessor.mjs';
const regexListSelect = document.querySelector('#regex-list');
const fileInput = document.querySelector('#fileInput');
const output = document.querySelector('#output');
const fileInputElementId = 'fileInput'
const filename = document.querySelector('#filename');
const customRegex = document.querySelector('#custom-regex')
const regexes = [
    ["byChapter", "第\\s*(([一二三四五六七八九十百千]+)|(\\d{1,4}))章\\s+(.+?)\\s"],
]
let fileProcessor;

export function left_ui_init() {
    regexes.forEach(regex => {
            const option = document.createElement('option');
            option.value = regex[1];
            option.id = option.textContent = regex[0];
            regexListSelect.appendChild(option);
    })
    const option = document.createElement('option');
    option.textContent = "自定义";
    option.value = "custom"
    regexListSelect.appendChild(option)

    regexListSelect.addEventListener('change', (e) => {
        if (regexListSelect.value == "custom") {
            customRegex.style.display = 'block';
        } else {
            customRegex.style.display = 'none';
        }
    })

    document.addEventListener('DOMContentLoaded', () => {
        const fileInputElementId = 'fileInput'
        const splitRegex = getRegex();
        fileProcessor = new FileProcessor(fileInputElementId, getRegex(), displayChapters);
    
    });
}



export function getRegex() {
    if (regexListSelect.value == "custom") {
        return new RegExp(customRegex.value, "g")
    } else {
        return new RegExp(regexListSelect.value, "g")
    }
}
export function getChapterText(index){
    return fileProcessor.chapters[index]
}
const displayChapters = (chapters) => {
    filename.textContent = fileProcessor.fileName;
    output.innerHTML = '';
    for (let i = 0; i < chapters.length; i++) {
        if (chapters[i]) {
            const chapterDiv = document.createElement('li');
            // chapterDiv.innerHTML = `<h2>${chapters[i].title}</h2><p>${chapters[i].content}</p>`;
            chapterDiv.textContent = chapters[i].title;
            chapterDiv.setAttribute('data-index', i);
            output.appendChild(chapterDiv);
        }
    }
    output.addEventListener('click', (e) => {
        const _target = e.target;
        if (fileProcessor && _target.tagName === 'LI') {
            const index = parseInt(_target.getAttribute('data-index'));
        }
    });
}



