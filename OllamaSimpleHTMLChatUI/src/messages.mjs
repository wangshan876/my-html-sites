import { resizeObserver } from "./global.mjs"
import { $autoread } from "./global-dom.mjs";
import { synth,voices,speak, populateVoiceList } from './speech.mjs';

var output_code_flag = false
var waiting_code_lang = false;
let  current_pre = undefined;

const pre_template = document.createElement('pre')
const code_template = document.createElement('code')
var speaktext = ""


export function appendMeassge(reciver,response_body){
    if(!response_body.done){
        let response = response_body.response
        if(waiting_code_lang){
            response = '<code languege="'+response+'" class="languege-'+response+'">'
            waiting_code_lang = false
        }
        if(response.match(/``+/) && !output_code_flag) { //qwen
            output_code_flag = true
            waiting_code_lang = true
            current_pre = pre_template.cloneNode()
            reciver.appendChild(current_pre)
        } else if(response.match(/``+/)  && output_code_flag) {
            output_code_flag = false
            current_pre = undefined
            hljs.highlightAll();

        } else if(current_pre) {
            if(!current_pre.querySelector("code")){
                current_pre.innerHTML += response
            } else {
                current_pre.querySelector("code").innerHTML += response
            }
            
        } else {
            reciver.innerHTML += response
        }

        
        if($autoread.checked){
            if(response.match(/[^A-Za-z0-9\u4e00-\u9fa5\n 《》\<\>\-\:：“”’‘""''\&\*，,、\(\)\#\%\&]/g)){
                speak(speaktext)
                speaktext = ""
            }
            speaktext += response_body.response
        }
    } else{
        resizeObserver.unobserve(reciver);
        reciver.classList.remove('current')
    }
  }
