import { getDicts,getDictList } from './store.js';

let rootNode = document.querySelector("#dict_panel")
rootNode.innerHTML = "<div class='container'></div>"
let dictWrpper = rootNode.querySelector(".container")
let dictlist,closebtn,timehandler;
const defaultDict = "mydicts"

async function query(word=null) {
	
	if(!word) return false 
  
	const dicts = await getDicts();
	if(!dicts) return false
	let data,dictname;
	for (let index = 0; index < dictlist.length; index++) {
		const d = dictlist[index];
		if(d==defaultDict && dicts[d][word[0]][word]){
			data = dicts[d][word[0]][word]
			dictname = d
			break
		} else if(dicts[d][word]){
			data = dicts[d][word]
			dictname = d
			break
		} 
	}

	return [data,dictname]
}

function format(datas,classid){
	let html = '<div class="'+classid+' item">'
	datas.forEach(r => {
		if(r) html += ("<div class='line'>"+r+"</div>")
		
	});
	
	html += "</div>"
	return html
}

export async function wordQuery(word=null) {
	clearTimeout(timehandler)
	let [data,dictname] = await query(word)
	if(!data) {
		dictWrpper.innerHTML = `
			<div style="padding-top:40%;color:red;font-size:24px;display:flex;justify-content: center;align-items: center;">字典未收录: ${word}</div>
		`
		timehandler = setTimeout(()=>{dictWrpper.innerHTML="";closebtn.click()},1000)
	} else {
		let base = "<div class='base item'>"
		let means = ""
		base += '<h2 class="word">'+word+'<font style="color:red;font-size:12px;font-weight: lighter;">   【'+dictname+'】</font></h2>'
		data["phonetic"] && (base += '<div class="phonetic">'+data["phonetic"].replaceAll('"',"")+'</div>')
		if(dictname == defaultDict){
			data["mean1"] && (base += '<div class="mean1">'+data["mean1"]+'</div>')
			data["mean2"] && (means += format(data["mean2"],"mean2"))
			data["helper"] &&(means += format(data["helper"],"helper"))
			data["cytm"] &&(means += format(data["cytm"],"cytm"))
			data["mean3"] && (means += format(data["mean3"],"mean3"))
		} else {
			data["means"].forEach(m=>{
				if(m[0] == "/"|| m[0][0] =="/"|| m[0] == "/'"){
					let phonetic = m.join("")
					let infos = phonetic.match(/\/.*\//)
					infos[0]&& (base += '<div class="phonetic">'+infos[0]+'</div>')

					const other = phonetic.replace(infos[0],"")
					if(other && other.length>1){
						base += '<div class="mean1">'+other+'</div>'
					}

				} else {
					means +='<div class="item">'+ m.join("<br>")+'</div>'
				}
			})
		}

		base += "</div>"
		dictWrpper.innerHTML = base + means
		data=null;
	}

}

const styleText = `
#dict_panel{ background-color:#ccc7c769; }
#dict_panel .base,#dict_panel .mean2,#dict_panel .helper,#dict_panel .ctym{margin:10px 0; padding: 10px 0; border-bottom: 1px solid ; border-color: #bbb8b8; }
#dict_panel .base{ margin-top:0;padding-top:20px;}
#dict_panel .item{ background-color:#f0f0f0;padding: 15px;  margin: 10px;}
#dict_panel .phonetic{ font-style: italic; color: #6e6b6b; }
`


export async function loadDictLayout(){
	dictlist = await getDictList()
	const style = document.createElement("style")
	const button = document.createElement("button")
	button.classList.add("close")
	button.textContent = "返回"
	button.addEventListener("click",()=>rootNode.classList.remove("open"))
	style.textContent = styleText
	rootNode.append(button,style)
	closebtn = rootNode.querySelector(".close")


}