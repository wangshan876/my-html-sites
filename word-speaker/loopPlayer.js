import { Speaker } from "./Speaker.js";
const queneDone = new Event('queneDone');

export class loopPlayer{
	constructor(){
		this.controller  = document.querySelector("#speaker_controller")
		this.current;
		this.queue  = []
		if(!this.controller){
			const node = document.createElement("div");
			node.id = "speaker_controller";
			this.controller = node;
			document.body.appendChild(node);
		}
		this.controller.addEventListener("SpeakStart",(e)=>{
		},false)
		this.controller.addEventListener("SpeakEnded",(e)=>{
			if(this.queue.length>0){
				this.current = this.queue.shift()
				this.start_speak()
			} else {
				this.current = undefined
				document.dispatchEvent(queneDone);

			}
		},false)
		const _speaker =  Speaker()
		this.speak = _speaker.speak
		this.interactive = _speaker.interactive
	}
	add_to_queue(texts=[]){
		this.queue.push(...texts)
		this.current = this.queue.shift()
	}
	start_speak(options){
		this.current && this.speak(this.current,options)
	}
	load_audios(allaudios){
		this.interactive(allaudios)
	}
}