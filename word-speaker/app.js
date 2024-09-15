import { loopPlayer} from "./loopPlayer.js"
import {MYWORDS} from  "./wods.js"
const wordElm = document.querySelector("#word")
const meanElm = document.querySelector("#mean")
const playElm = document.querySelector("#play")
const setVoiceElm = document.querySelector("#setVoice")
const funcItems = document.querySelectorAll(".funcArea .item")
const opWordRepeatElm = document.querySelector("#wordRepeat")
const opWordRepeatLabelElm = document.querySelector("label[for=wordRepeat]")
const opLetterElm = document.querySelector("#speakLetter")
const opMeaningElm = document.querySelector("#speakMeaning")
const opWordElm = document.querySelector("#speakWord")
const wordlistElm = document.querySelector("#wordlist")
const setWordGroupElm = document.querySelector("#setWordGroup")
const grouplistPanel = document.querySelector("#grouplist")

const wordsLength = MYWORDS.length
let wordlist = []
let isplaying = false
const errobj = document.querySelector("#err")
window.onerror = function(err){
	errobj.textContent = errobj.textContent+"\n"+err
}
let controlParams = {
	speakWord:true,
	speakMeaning:true,
	speakLetter:false,
	localfirst:true,
	wordRepeat:"1",
	planLength:100,
	currentPage:0,
	allPages:Math.ceil(wordsLength/100)
}



const Looper = new loopPlayer()
let current_index = 0 


function loadSpeakWordsGroups(){
	const {currentPage,planLength} = controlParams
	wordlist = MYWORDS.slice(currentPage * planLength,planLength)
	loadWordGroupElm()
	controlParams.currentPage = 0
	current_index = 0
}
function loadWordGroupElm(){
	let li = document.createElement("li")
	let newlis=[],newli;

	const loadwords = ()=>loadWordlist()
	for (let index = 0; index < controlParams.allPages; index++) {
		newli = li.cloneNode(true)
		newli.setAttribute("value",index)
		newli.textContent = index+1
		newli.addEventListener("click",e=>{
			controlParams.currentPage = index
			loadwords()
		})
		newlis.push(newli)
	}
	grouplistPanel.append(...newlis)
}

function startAWord(){
	let data = wordlist[current_index],result=[]
	if(!data || !data[0]) return 
	wordElm.textContent = data[0];
	meanElm.textContent = data[1]

	if(controlParams.speakLetter){
		result.push(...(data[0].split('')))
	}


	if(controlParams.speakWord){
		result = [].concat([data[0]],result)
		if(controlParams.wordRepeat>1){
			let words = []
			words.length = parseInt(controlParams.wordRepeat)-2
			words.fill(data[0])
			result = [].concat(words,result)
			result.push(data[0])
		}
	}
	
	if(controlParams.speakMeaning){
		result.push(data[1].replace(/^[a-z]+\./,""))
	}
	setWordStatus()
	Looper.add_to_queue(result)
	Looper.start_speak({localfirst:controlParams.localfirst})
}
function setWordStatus(){
	let selected =wordlistElm.querySelector(".selected")
	selected && selected.remove("selected")
	//todo err
	//Uncaught TypeError: Cannot read properties of null (reading 'classList')
	selected = wordlistElm.querySelector("[value='"+current_index+"']")
	selected && selected.classList.add("selected")
}
function loadWordlist(){
	const {currentPage,planLength} = controlParams
	wordlistElm.setAttribute("size",planLength)
	const start = currentPage * planLength
	wordlist = MYWORDS.slice(start,start+100)
	const list =wordlist.map((w,i)=>"<li value='"+i+"'><span class='word'>"+w[0]+"</span><span class='meaning'>"+w[1]+"</span></option>")
	wordlistElm.innerHTML = list.join("")
	Looper.load_audios(wordlist.concat("abcdefghijklmnopqrstuvwxyz".split("")))
}

window.onload = function(){
	document.addEventListener("queneDone",e=>{
		current_index += 1
		if(current_index>=controlParams.planLength){
			current_index = 0 
			loadWordlist()
		}
		isplaying && startAWord()
	})
	playElm.addEventListener("click",(e)=>{
		if(playElm.classList.contains("playing")){
			playElm.classList.remove("playing")
			isplaying = false
		} else {
			isplaying = true
			playElm.classList.add("playing")
			startAWord()
		}
	})
	setVoiceElm.addEventListener("click",e=>{
		const voicesElm = document.querySelector(".voices-list")
		voicesElm.style.display == "block"?voicesElm.style.display="none":voicesElm.style.display="block"
		Popper.createPopper(setVoiceElm, voicesElm, {
			placement: 'bottom',
		  });
		
	})
	setWordGroupElm.addEventListener("click",e=>{
		grouplistPanel.style.display == "grid"?grouplistPanel.style.display="none":grouplistPanel.style.display="grid"
		Popper.createPopper(setWordGroupElm, grouplistPanel, {
			placement: 'bottom',
		  });
	})

	Object.keys(controlParams).forEach(key=>{
		if(!["wordRepeat","speakMeaning","speakLetter","speakWord","localfirst"].includes(key)) return
		
		if(key == "wordRepeat"){
			opWordRepeatElm.value = controlParams[key]
			opWordRepeatLabelElm.querySelector("span").textContent = controlParams[key]
		} else {
			if(document.querySelector("#"+key).checked !== controlParams[key]){
				document.querySelector("label[for="+key+"]").click()
			}
		}
	})

	funcItems.forEach(item=>{
		item.addEventListener("change",e=>{
			const target = e.target;
			switch (target.id) {
				case "wordRepeat":
					controlParams[target.id] = target.value
					opWordRepeatLabelElm.querySelector("span").textContent = target.value
					break;
				default:
					controlParams[target.id] = target.checked
					break;
			}
		})
	})
	document.addEventListener("click",e=>{
		if(!["grouplist","voices-list","setWordGroup","setVoice"].includes(e.target.id)){
			const voicesElm = document.querySelector(".voices-list")
			grouplistPanel.style.display = "none"
			voicesElm.style.display = "none"
		}
	},false)
	loadWordlist()
	loadWordGroupElm()
	const errbtn = document.querySelector("#errbtn")
	errbtn.addEventListener("click",function(e){
		errobj.style.display == "block"?errobj.style.display="none":errobj.style.display="block"
		Popper.createPopper(errbtn, errobj, {
			placement: 'top',
		  });
	})
	
}
