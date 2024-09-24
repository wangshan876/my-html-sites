// index.js
class DictationComponent extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
        this.render();
    }

    static get observedAttributes() {
        return ['translation', 'original'];
    }

    attributeChangedCallback(name, oldValue, newValue) {
        if (oldValue !== newValue) {
            this.render();
        }
    }

    render() {
        const translation = this.getAttribute('translation') || '';
        const original = this.getAttribute('original') || '';

        this.shadowRoot.innerHTML = `
            <style>
                .container {
                    font-family: Arial, sans-serif;
                    padding: 20px;
                    border: 1px solid #ccc;
                    border-radius: 5px;
                    max-width: 300px;
                    margin: 0 auto;
                }
                .translation {
                    font-size: 18px;
                    margin-bottom: 10px;
                }
                .input-container {
                    display: flex;
                    flex-direction: column;
                }
                input {
                    padding: 10px;
                    font-size: 16px;
                    border: 1px solid #ccc;
                    border-radius: 5px;
                }
                .feedback {
                    margin-top: 10px;
                    font-size: 14px;
                    color: green;
                }
            </style>
            <div class="container">
                <div class="translation">${translation}</div>
                <div class="input-container">
                    <input type="text" placeholder="Type the original sentence here" />
                    <div class="feedback"></div>
                </div>
            </div>
        `;

        const inputElement = this.shadowRoot.querySelector('input');
        const feedbackElement = this.shadowRoot.querySelector('.feedback');

        inputElement.addEventListener('blur', () => {
            const userInput = inputElement.value.trim();
            if (userInput.toLowerCase() === original.toLowerCase()) {
                feedbackElement.textContent = 'Correct!';
                this.dispatchEvent(new CustomEvent('dictation-complete', {
                    detail: {
                        translation: translation,
                        original: original,
                        userInput: userInput
                    }
                }));
            } else {
                feedbackElement.textContent = 'Incorrect. Try again.';
            }
        });
    }
}

customElements.define('dictation-component', DictationComponent);