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
        this.defaultVoice  = null;
        this.attachShadow({ mode: 'open' });
        this.render();
    }

    static get observedAttributes() {
        return ['translation', 'original', 'autoSpeak','lang'];
    }

    attributeChangedCallback(name, oldValue, newValue) {
        if(name === 'lang'){
            this.defaultVoice = getVoiceByLanguage(newValue);
        }else {
            if (oldValue !== newValue) {
                this.render();
            }
        }
    }
    compare(translation,original,mutation,caller="blur"){
        const textareaElement = this.shadowRoot.querySelector('textarea');
        const feedbackElement = this.shadowRoot.querySelector('.feedback');
        
        const userInput = textareaElement.value
        const t1 = userInput.toLowerCase().trim().replace(/[\.,\!\?;\:()「」『』【】・、。！？]/g, '').replace(/\s+/g, '');
        const t2 = original.toLowerCase().trim().replace(/[\.,\!\?;\:()「」『』【】・、。！？]/g, '').replace(/\s+/g, '');
        const t3 = mutation
                    ? mutation.toLowerCase().trim().replace(/[\.,\!\?;\:()「」『』【】・、。！？]/g, '').replace(/\s+/g, '')
                    : t2
        if (t1 == t2 || t1 == t3) {
            feedbackElement.textContent = 'Correct!';
            feedbackElement.style.color = 'green';
            textareaElement.disabled = true; // 禁用 textarea

            this.success_sound.play()
            setTimeout(() => {
                textareaElement.value = ''
                this.dispatchEvent(new CustomEvent('dictation-complete', {
                    detail: {
                        translation: translation,
                        original: original,
                        userInput: userInput
                    }
                }));  
            }, 2000);
        } else {
            if(caller=="blur"){
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
                    width: 100%;
                    margin: 20px auto;
                }
                .container:hover {

                }
                .translation {
                    font-size: 20px;
                    color: var(--primary-color);
                    margin-bottom: 15px;
                    text-align: center;
                    display: flex;
                    align-items: center;
                    /*justify-content: center;*/
                    filter: blur(5px) grayscale(1);
                    transition: filter 0.3s ease; 
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
                }
                .translation button:hover {
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
                    border-radius: var(--border-radius);
                    width: 100%;
                    resize: none;
                    overflow: hidden;
                    height: auto;
                    outline: none;
                    border:0px;
                }
                textarea:focus {
                    opacity:0.8;
                }
                .feedback {
                    margin-top: 10px;
                    font-size: 14px;
                    color: green;
                    text-align: center;
                }
                .footer{
                    display:flex;
                    align-items: center;
                    justify-content: space-between;
                }
            </style>
            <div class="container">
                <div class="translation">
                    ${translation}
                    ${autoSpeak ? `<button class="speak"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-volume-2">
    <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon>
    <path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"></path>
</svg></button>` : ''}
                </div>
                <div class="input-container">
                    <textarea placeholder="Type the original sentence here" rows="3"></textarea>
                    <div class="footer"><div class="feedback"> </div><button class="skip">Skip</button></div>
                </div>
            </div>
        `;

        const textareaElement = this.shadowRoot.querySelector('textarea');
        const feedbackElement = this.shadowRoot.querySelector('.feedback');
        const translationElement = this.shadowRoot.querySelector('.translation');
        const speakButton = translationElement.querySelector('button.speak');
        const container = this.shadowRoot.querySelector('.container');

        translationElement.classList.remove('visible'); 
      setTimeout(() => {
        translationElement.classList.add('visible'); 
      }, 500); 
        
        textareaElement.addEventListener('blur', () =>this.compare(translation,original,mutation,'blur'));

        // 自动调整textarea高度
        textareaElement.addEventListener('input', () => {
            textareaElement.style.height = 'auto'; // 重置高度
            textareaElement.style.height = `${textareaElement.scrollHeight}px`; // 设置为内容高度
            this.compare(translation,original,mutation,"input")
        });

        // 朗读翻译
        const speak = (text) => {
                const utterance = new SpeechSynthesisUtterance(text);
                utterance.voice = this.defaultVoice;
                window.speechSynthesis.speaking && window.speechSynthesis.cancel()
                window.speechSynthesis.speak(utterance);

        };
        speechSynthesis.onvoiceschanged = () => {
            this.defaultVoice = getVoiceByLanguage( this.getAttribute('lang') || 'en-US'); 
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

        this.shadowRoot.querySelector('.skip').addEventListener('click',e=>{
            textareaElement.value = original
        })
    }
}

customElements.define('dictation-component', DictationComponent);
