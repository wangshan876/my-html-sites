import { FetchRoot } from "./js/FetchRoot.js";
import { rootsMap } from "../res/VocabularyMap/map.js"
import { fetchzip,fetchDict } from "../statics/js/fetchzip.js"
import { wordQuery,loadDictLayout } from "../statics/js/dict.js"
let { Root,Imagine,Custom }  = rootsMap
const  jsmind_options = {
        container: 'jsmind_container',
        theme: 'grey',
        editable: false,
        mode :'full',
        view:{
            line_width:3,       // 思维导图线条的粗细
            line_color:'#f00',  // 思维导图线条的颜色
            draggable: false,   // 当容器不能完全容纳思维导图时，是否允许拖动画布代替鼠标滚动
        }
};
const JM = new jsMind(jsmind_options);

const Sider = document.querySelector("#sider")
const Menus = document.querySelectorAll("#sider .menus button")
const RootsContainer = document.querySelector("#sider .Root")
const ImaginesContainer = document.querySelector("#sider .Imagine")
const CustomContainer = document.querySelector("#sider .Custom")
const MindContainer = document.querySelector("#jsmind_container")
const DictPanel = document.querySelector("#dict_panel")


async function word_handler(e){
    
    const target =e.target
    const type = Sider.getAttribute("data-type")
    const selected = document.querySelector("li.selected")
    const file = target.getAttribute("file")

    selected&&selected.classList.remove("selected")
    target.classList.add("selected")
    let data = await FetchRoot(type+"/"+file)
    JM.show(data) 
    //todo
    
}

function createUI(){
    //events
    Menus.forEach(menu=>{
        menu.addEventListener("click",e=>{
            const selected = document.querySelector("#sider .menus .selected")
            selected && selected.classList.remove("selected")
            menu.classList.add("selected")
            Sider.setAttribute("data-type",menu.textContent)
            const first = document.querySelector("."+menu.textContent+" li")
            first&&first.click()
        },false)
    })
    
    const li = document.createElement("li")
    RootsContainer.append(...(Root.map(r=>{
        const li_node = li.cloneNode(true)
        li_node.setAttribute("file",r)
        li_node.textContent = r.replace(".txt","")
        li_node.addEventListener("click",e=>word_handler(e))
        return li_node
    })))
    ImaginesContainer.append(...(Imagine.map(r=>{
        const li_node = li.cloneNode(true)
        li_node.setAttribute("file",r)
        li_node.textContent = r.replace(".txt","")
        li_node.addEventListener("click",e=>word_handler(e))
        return li_node
    })))
    CustomContainer.append(...(Custom.map(r=>{
        const li_node = li.cloneNode(true)
        li_node.setAttribute("file",r)
        li_node.textContent = r.replace(".txt","")
        li_node.addEventListener("click",e=>word_handler(e))
        return li_node
    })))
    
}
function mobileActions(){
    const floatRootBtn = document.querySelector(".float-root-btn")
    const floatQueryBtn = document.querySelector(".float-query-btn")
    floatRootBtn.addEventListener("click",e=>{
        Sider.classList.toggle("open")
    })
    floatQueryBtn.addEventListener("click",e=>{
        const selected = JM.get_selected_node()
        const cur_query_id = DictPanel.getAttribute("queryid")
        const word = selected && selected.topic
        if(!word) return;
        if(DictPanel.classList.contains("open")){
            if(word == cur_query_id) DictPanel.classList.remove("open")
            else{
                DictPanel.setAttribute("queryid",word)
                wordQuery(word)
            }
        } else {
            DictPanel.setAttribute("queryid",word)
            wordQuery(word)
            DictPanel.classList.add("open")
        }
    })

    document.addEventListener("click",e=>{
        //侧边栏
        if(!Sider.contains(e.target)){
            if(Sider.classList.contains("open")){
                Sider.classList.remove("open")
            }
        }
    })
}

function queryWordHandler(e,isMobile=false){
    let selected,word;
    let cur_query_id = DictPanel.getAttribute("queryid")
    if(isMobile){
        selected = JM.get_selected_node()
        word = selected && selected.topic
    } else {
        word = e.target.textContent
    }
    
   
    if(!word )return;

    // word = word.split(/[\s（]/)[0]
    word = word.split(/[^a-zA-Z]/)[0]
    if(!word && word.match(/[^a-zA-Z\s]/)) return;
    if(DictPanel.classList.contains("open")){
        if(word == cur_query_id) DictPanel.classList.remove("open")
        else{
            DictPanel.setAttribute("queryid",word)
            wordQuery(word)
        }
    } else {
        DictPanel.setAttribute("queryid",word)
        wordQuery(word)
        DictPanel.classList.add("open")
    }
}


function actions(){
    document.addEventListener("click",e=>{
        //关闭dictpanel
        if(!DictPanel.contains(e.target) || "JMNODE" !== e.target.tagName){
            if(DictPanel.classList.contains("open")){
                DictPanel.classList.remove("open")
            }
        }
        if("JMNODE" == e.target.tagName){
            queryWordHandler(e)
        }

    })
}

function start(){
        createUI()
        Menus[0].click()
        const screenWidth = document.body.clientWidth
        if(screenWidth<965){
            mobileActions()
        } else{
            actions()
        }
     
        fetchDict()
        loadDictLayout()
}

window.onload = ()=>start()