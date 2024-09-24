// index.js
class DictationComponent extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
        this.render();
    }

    static get observedAttributes() {
        return ['translation', 'original', 'autoSpeak', 'lang'];
    }

    attributeChangedCallback(name, oldValue, newValue) {
        if (oldValue !== newValue) {
            this.render();
        }
    }

    render() {
        const translation = this.getAttribute('translation') || '';
        const original = this.getAttribute('original') || '';
        const autoSpeak = this.getAttribute('autoSpeak') === 'true';
        const lang = this.getAttribute('lang') || 'en-US'; // 默认语言为英语

        this.shadowRoot.innerHTML = `
            <style>
                :host {
                    display: block;
                    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, "Noto Sans", "Yu Gothic", "Hiragino Sans", "Microsoft YaHei", sans-serif;
                    --primary-color: #4CAF50;
                    --border-radius: 8px;
                }
                .container {
                    background-color: #f9f9f9;
                    padding: 20px;
                    border: 1px solid #e0e0e0;
                    border-radius: var(--border-radius);
                    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
                    max-width: 400px;
                    margin: 20px auto;
                    transition: transform 0.2s;
                }
                .container:hover {
                    transform: scale(1.02);
                }
                .translation {
                    font-size: 20px;
                    font-weight: bold;
                    color: var(--primary-color);
                    margin-bottom: 15px;
                    text-align: center;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }
                .translation button {
                    margin-left: 5px;
                    background: none;
                    border: none;
                    cursor: pointer;
                    font-style: italic;
                    font-size: x-small;
                }
                .translation button:hover{
                    filter: brightness(0.4);
                
                }
                .input-container {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                }
                textarea {
                    padding: 12px;
                    font-size: 16px;
                    border: 2px solid #00000012;
                    border-radius: var(--border-radius);
                    width: 100%;
                    resize: none;
                    overflow: hidden;
                    height: auto;
                }
                textarea:focus {
                    border-color: var(--primary-color);
                    outline: none;
                }
                .feedback {
                    margin-top: 10px;
                    font-size: 14px;
                    color: green;
                    text-align: center;
                }
            </style>
            <div class="container">
                <div class="translation">
                    ${translation}
                    ${autoSpeak ? `<button>🎙️</button>` : ''}
                </div>
                <div class="input-container">
                    <textarea placeholder="Type the original sentence here" rows="3"></textarea>
                    <div class="feedback"> </div>
                </div>
            </div>
        `;

        const textareaElement = this.shadowRoot.querySelector('textarea');
        const feedbackElement = this.shadowRoot.querySelector('.feedback');
        const translationElement = this.shadowRoot.querySelector('.translation');
        const speakButton = translationElement.querySelector('button');

        textareaElement.addEventListener('blur', () => {
            const userInput = textareaElement.value.trim();
            if (userInput.toLowerCase() === original.toLowerCase()) {
                feedbackElement.textContent = 'Correct!';
                feedbackElement.style.color = 'green';
                this.dispatchEvent(new CustomEvent('dictation-complete', {
                    detail: {
                        translation: translation,
                        original: original,
                        userInput: userInput
                    }
                }));
                textareaElement.disabled = true; // 禁用 textarea
            } else {
                feedbackElement.textContent = 'Incorrect. Try again.';
                feedbackElement.style.color = 'red';
            }
        });

        // 自动调整textarea高度
        textareaElement.addEventListener('input', () => {
            textareaElement.style.height = 'auto'; // 重置高度
            textareaElement.style.height = `${textareaElement.scrollHeight}px`; // 设置为内容高度
        });

        // 朗读翻译
        const speak = (text, lang) => {
            const utterance = new SpeechSynthesisUtterance(text);
            utterance.lang = lang;
            window.speechSynthesis.speak(utterance);
        };

        // 自动朗读
        if (autoSpeak) {
            speak(translation, lang);
        }

        // 点击播放按钮时朗读
        if (speakButton) {
            speakButton.addEventListener('click', () => {
                speak(translation, lang);
            });
        }
    }
}

customElements.define('dictation-component', DictationComponent);