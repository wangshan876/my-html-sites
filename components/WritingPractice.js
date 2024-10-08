function getVoiceByLanguage(language) {
    const voices = speechSynthesis.getVoices();
    const languageVoices = voices.filter(voice => voice.lang.startsWith(language));
    const naturalVoice = languageVoices.find(voice => voice.name.toLowerCase().includes("natural"));

    // 如果找到了 "natural" 声音，返回,  否则随机选择一个声音
    return naturalVoice || languageVoices[Math.floor(Math.random() * languageVoices.length)];
}

class DictationComponent extends HTMLElement {
    constructor() {
        super();
        this.success_sound = new Audio('https://my-html-sites.pages.dev/components/assets/sounds/success.wav');
        this.fail_sound = new Audio('https://my-html-sites.pages.dev/components/assets/sounds/fail.wav');
        this.defaultVoice = null;
        this.len = 0;
        this.attachShadow({ mode: 'open' });
    }

    static get observedAttributes() {
        return ['translation', 'original', 'autoSpeak', 'lang','len','current_index'];
    }
    connectedCallback(){
        this.len = this.getAttribute('len') || 0;
        this.render();
    }

    attributeChangedCallback(name, oldValue, newValue) {
         if (name === 'lang') {
            this.defaultVoice = getVoiceByLanguage(newValue);
        } else if(name === 'len'){
            this.len = newValue
        }else {
            if (oldValue !== newValue) {
                this.render();
            }
        }
    }
    async format(text) {
        let t = text
            .replace(/[０-９]/g, match => String.fromCharCode(match.charCodeAt(0) - 0xFEE0))
            .replace(/[零一二三四五六七八九十百千万亿]+/g, match => {
                const cn = { '零': 0, '一': 1, '二': 2, '三': 3, '四': 4, '五': 5, '六': 6, '七': 7, '八': 8, '九': 9, '十': 10, '百': 100, '千': 1000, '万': 10000, '亿': 100000000 };
                let num = 0;
                let temp = 0;
                let section = 0;
                let zero = false;
                for (let i = 0; i < match.length; i++) {
                    const char = match[i];
                    const value = cn[char];
                    if (value === 10000 || value === 100000000) {
                        section += (temp === 0 && zero ? 0 : temp) * value;
                        temp = 0;
                        zero = false;
                    } else if (value >= 10) {
                        temp = (temp === 0 && zero ? 0 : temp) * value;
                        zero = false;
                    } else {
                        temp += value;
                        zero = false;
                    }
                }
                num += section + temp;
                return num.toString();
            });;
        if (window.JPAnalyzer) {
            t = await window.JPAnalyzer.convert(t);
        }
        return t.toLowerCase()
            .trim()
            .replace(/[\.,\!\?;\:()「」『』【】・、。！？]/g, '')
            .replace(/\s+/g, '')
    }

    async compare(translation, original, mutation, caller = "blur") {
        const textareaElement = this.shadowRoot.querySelector('textarea');
        const feedbackElement = this.shadowRoot.querySelector('.feedback');
        let userInput = textareaElement.value
        const t1 = await this.format(userInput);
        const t2 = await this.format(original);
        const t3 = mutation ? await this.format(mutation) : t2;

        if (t1 == t2 || t1 == t3) {
            feedbackElement.textContent = 'Correct!';
            feedbackElement.style.color = 'green';
            textareaElement.disabled = true; // 禁用 textarea

            this.success_sound.play()
             setTimeout(() => {
                textareaElement.value = ''
                textareaElement.disabled = false;
                this.dispatchEvent(new CustomEvent('dictation-complete', {
                    detail: {
                        translation: translation,
                        original: original,
                        userInput: userInput
                    }
                }));

            }, 2000);
        } else {
            if (caller == "skip") {
                this.fail_sound.play()
            }
            feedbackElement.textContent = 'Incorrect. Try again.';
            feedbackElement.style.color = 'red';
        }
    }

    render() {
        const translation = this.getAttribute('translation') || '';
        const original = this.getAttribute('original') || '';
        const mutation = this.getAttribute('mutation') || '';
        const autoSpeak = this.getAttribute('autoSpeak') === 'true';
        const lang = this.getAttribute('lang') || 'en-US';
        const len = this.getAttribute('len') || '0';
        const current_index = this.getAttribute('current_index') || '0';
        this.shadowRoot.innerHTML = `
            <style>
                :host {
                    display: block;
                    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, "Noto Sans", "Yu Gothic", "Hiragino Sans", "Microsoft YaHei", sans-serif;
                    --primary-color: #4CAF50;
                    --border-radius: 8px;
                    --background-color: #2c2c2c; /* 暗色背景 */
                    --text-color: #e0e0e0; /* 暗色文本颜色 */
                }
                .container {
                    background-color: var(--background-color);
                    padding: 20px;
                    border: 1px solid #444; /* 暗色边框 */
                    border-radius: var(--border-radius);
                    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.5); /* 暗色阴影 */
                    width: 100%;
                    margin: 20px auto;
                    color: var(--text-color); /* 文本颜色 */
                }
                .translation {
                    font-size: 20px;
                    color: var(--primary-color);
                    margin-bottom: 15px;
                    text-align: center;
                    display: flex;
                    align-items: center;
                    filter: blur(1px) grayscale(1);
                    transition: filter 0.1s ease; 
                }
                .translation.visible {
                    filter: none;
                }
                .translation button {
                    margin-left: 5px;
                    background: none;
                    border: none;
                    cursor: pointer;
                    text-align: center;
                    margin: auto 0;
                    padding: 2px;
                    width: 18px;
                    height: 18px;
                    color:fcff5a;
                }
                .translation button:hover {
                    filter: hue-rotate(90deg);
                }
                .input-container {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                }
                textarea {
                    padding: 12px;
                    font-size: 16px;
                    border-radius: var(--border-radius);
                    width: 100%;
                    resize: none;
                    overflow: hidden;
                    height: auto;
                    outline: none;
                    border: 1px solid transparent; /* 将边框设置为透明 */
                    background-color: rgba(0, 0, 0, 0.3); /* 暗色背景 */
                    transition: border-color 0.3s ease, box-shadow 0.3s ease, background-color 0.3s ease;
                    color: var(--text-color); /* 文本颜色 */
                }
                textarea:focus {
                    border-color: var(--primary-color);
                    box-shadow: 0 0 5px rgba(76, 175, 80, 0.5);
                    background-color: rgba(0, 0, 0, 0.5); /* 聚焦时背景颜色稍微变亮 */
                }
                textarea::placeholder {
                    color: rgba(255, 255, 255, 0.5); /* 暗色占位符颜色 */
                    font-style: italic;
                }
                .feedback {
                    margin-top: 10px;
                    font-size: 14px;
                    color: var(--primary-color); /* 反馈文本颜色 */
                    text-align: center;
                }
                .functionArea {
                    width: 100%;
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                }
                button{
                    padding: 3px 16px;
                }
                
            </style>
            <div class="container">
                <div style="display: flex;justify-content: space-between;">
                    <div class="translation">
                        ${translation}
                        ${autoSpeak ? `<button class="speak"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-volume-2">
        <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon>
        <path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"></path>
    </svg></button>` : ''}
                    </div>
                    <div id="completion">${current_index} / ${len}</div>
                </div>
                <div class="input-container">
                    <textarea placeholder="type ..." rows="3"></textarea>
                    <div class="functionArea">
                        <div class="feedback"> </div>
                        <div>
                            <button class="skip">跳过</button>
                            <button class="alook">看答案</button>
                        </div>
                    </div>
                </div>
            </div>
        `;

        const textareaElement = this.shadowRoot.querySelector('textarea');
        const translationElement = this.shadowRoot.querySelector('.translation');
        const speakButton = translationElement.querySelector('button.speak');

        translationElement.classList.remove('visible');
        setTimeout(() => {
            translationElement.classList.add('visible');
        }, 500);

        textareaElement.addEventListener('blur', (e) => {
            this.compare(translation, original, mutation, 'blur')
        });

        // 自动调整textarea高度
        textareaElement.addEventListener('input', () => {
            textareaElement.style.height = 'auto'; // 重置高度
            textareaElement.style.height = `${textareaElement.scrollHeight}px`; // 设置为内容高度
            this.compare(translation, original, mutation, "input")
        });

        // 朗读翻译
        const speak = (text) => {
            const utterance = new SpeechSynthesisUtterance(text);
            utterance.voice = this.defaultVoice;
            window.speechSynthesis.speaking && window.speechSynthesis.cancel()
            window.speechSynthesis.speak(utterance);

        };
        speechSynthesis.onvoiceschanged = () => {
            this.defaultVoice = getVoiceByLanguage(this.getAttribute('lang') || 'en-US');
        };
        // 自动朗读
        if (autoSpeak) {
            speak(original);
        }

        // 点击播放按钮时朗读
        if (speakButton) {
            speakButton.addEventListener('click', () => {
                speak(original);
            });
        }


        this.shadowRoot.querySelector('.skip').addEventListener('click', e => {
            textareaElement.value = original
            this.compare(original, original, null, 'skip')
        })
        const alookbtn = this.shadowRoot.querySelector('.alook')
        alookbtn.addEventListener('click', e => {
            
            const original_value = textareaElement.value
            textareaElement.value = original
            textareaElement.disabled = true;
            const oldfcolor = textareaElement.style.color
            textareaElement.style.color = 'green'
            alookbtn.disabled = true
            const create_timeout = (() => {
                return () => {
                    setTimeout(() => {
                        textareaElement.style.color = oldfcolor
                        textareaElement.value = original_value
                        textareaElement.disabled = false;
                        alookbtn.disabled = false
                    }, 2000);
                };
            })()
            create_timeout()
        })

        textareaElement.focus();
        // // z自动聚焦
        // this.shadowRoot.addEventListener('keydown', (event) => {
        //     if (!document.activeElement.isEqualNode(textareaElement)) {
        //         const keysToHandle = ['Enter', ' ', '0', '1', '2', '3', '4', '5', '6', '7', '8', '9', ...Array.from({ length: 26 }, (_, i) => String.fromCharCode(97 + i))];
        //         if (keysToHandle.includes(event.key)) {
        //             textareaElement.focus();

        //         }
        //     }
        // });

    }
}

customElements.define('dictation-component', DictationComponent);
