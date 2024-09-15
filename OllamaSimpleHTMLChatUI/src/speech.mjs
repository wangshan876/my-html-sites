import { $voiceSelect } from './global-dom.mjs';

export var synth = window.speechSynthesis;
export var voices = synth.getVoices('Microsoft Mitchell Online (Natural) - English (New Zealand)').filter(voice=>voice.lang == "en-US" ||voice.lang == "zh-CN" )


export function speak(words) {
    const utterThis = new SpeechSynthesisUtterance(words);
    utterThis.voice = voices[parseInt($voiceSelect.value)];
    synth.speak(utterThis);
}

export function populateVoiceList() {
    if (!synth) {
            synth = window.speechSynthesis;
            voices = synth.getVoices('Microsoft Mitchell Online (Natural) - English (New Zealand)').filter(voice=>voice.lang == "en-US" ||voice.lang == "zh-CN" )

    }
    if(!voices || voices.length == 0) {
        voices = synth.getVoices('Microsoft Mitchell Online (Natural) - English (New Zealand)').filter(voice=>voice.lang == "en-US" ||voice.lang == "zh-CN" )

    }
    for (var i = 0; i < voices.length; i++) {
      var option = document.createElement("option");
        const name = voices[i].name.replace(/-.*/,'').replace('Microsoft','MS')
      option.textContent = name + " (" + voices[i].lang + ")";
      if (voices[i].default) {
        option.textContent += " [*]";
      }
      option.setAttribute("data-lang", voices[i].lang);
      option.setAttribute("data-name", voices[i].name);
      option.value = i
      $voiceSelect.appendChild(option);
    }
  }
