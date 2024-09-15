import { left_ui_init, getChapterText } from "./left.js"
// import { right_init, store, getChromaRegex, getColloctionId, getEmbeddingModel, setFileMetadata,addMetaItem } from "./manager.js";
import * as Manager  from "./manager.js";
import { IndexedDBModule } from '/components/autoSaveIndexedDB.js';
import PopupMenu from "/components/popMenu.js";
import SplitText from "./splitter.js"
import PostgRESTClient from "/components/postgrestClient.js";
const protgrest_baseurl = "http://localhost:5001"
const postdb = new PostgRESTClient(protgrest_baseurl);
const tableName = "sentences";

async function saveToPostdb(text,regex="",filter=null) {
    if(!text) return;
    const metas =  Manager.getMetadata() || null;
    const tags = JSON.stringify(metas);
    const sentences = SplitText(text,regex,filter)
    const filename = document.getElementById("fileInput").files[0]?.name;
    console.log({tags:tags,file:filename})
    return await postdb.createMultipleRecords(tableName, sentences.map(sentence=>({content:sentence,tags:tags,file:filename})))

}

const verctor_db_config = {
    database_name: "verctor_db",
    store_name: "missions",
    store_key: "mission",
}

const metadata_db_config = {
    database_name: "metadata_db",
    store_name: "metadatas",
    store_key: "item",
}
const fileInput = document.getElementById("fileInput");

const fileNameLabel = document.getElementById("filename");
const chaptersUl = document.getElementById("output");
const storeBtn = document.getElementById("storeBtn");
const newMetaTemplateBtn = document.getElementById("add-meta-template-btn");
const metaTemplateSelect = document.getElementById("meta-template-select");
const metaTeplateDelBtn = metaTemplateSelect.querySelector('button[name="del"]')
const splitToPostgreBtn = document.getElementById("split-to-postgre");
const fromPostgreStoreBtn = document.getElementById("fromPostgreStoreBtn");
const usePostgreChk = document.getElementById("usePostgre") 
const postgreChkBox = document.querySelector(".postgre-has-data");

const filenameRegex = /^(.*?)(\.[^.]*$|$)/;
const observer = new MutationObserver((mutationsList) => {
    for (let mutation of mutationsList) {
        if (mutation.type === 'characterData' || mutation.type === 'childList') {
            const newText = fileNameLabel.textContent;
            if(newText){
                let fileName = newText;
                postdb.isEmpty(tableName,"file",fileName).then(ret=>{
                    if(!ret){
                        postgreChkBox.classList.add("has-data")
                        usePostgreChk.setAttribute('data-postgre-query-key',"file")
                        usePostgreChk.setAttribute('data-postgre-query-value',fileInput.files[0]?.name || "")
                    } else {
                        postgreChkBox.classList.remove("has-data")
                        usePostgreChk.removeAttribute('data-postgre-query-key')
                        usePostgreChk.removeAttribute('data-postgre-query-value')
                    }
                })

                const match = newText.match(filenameRegex);
                if (match) {
                    fileName = match[1];
                }
                Manager.setFileMetadata("fileName", fileName);
            }
        }
    }
});
observer.observe(fileNameLabel, {
    childList: true, // 观察子节点的变化
    characterData: true, // 观察文本节点的变化
    subtree: true // 观察所有子节点
});


const metaTemplateView = new PopupMenu('meta-template', { 
    toggleButtonId: 'metaTemplateBtn', 
    position: 'left', 
    useIndicator: false,
    enableEdgeOpen: false ,
    size:{
        height:"100%", 
        width:"27%"
    }
});
document.querySelector('#metaTemplateBtn').onclick = function(e) {
    e.preventDefault()
    metaTemplateView.toggle();
};
async function getConfigs() {
    let chapterNodes = chaptersUl.children;
    let chapters = [];
    let sentences = [];
    for (let i = 0; i < chapterNodes.length; i++) {
        chapters.push(chapterNodes[i].getAttribute('data-index'))
    }
    let postgres_check = postgreChkBox.classList.contains("has-data");
    if(postgres_check && usePostgreChk.checked) {
        const _qkeyword = usePostgreChk.getAttribute('data-postgre-query-key');
        const _qvalue = usePostgreChk.getAttribute('data-postgre-query-value');
        sentences = await postdb.getRecordByKey(tableName, _qkeyword, _qvalue)
        console.log(sentences)
        sentences = sentences.map(s=>s.content)
        
    }
    return {
        fileName: fileNameLabel.textContent,
        chapterIds: chapters,
        getChapterText: (dataIndex) => getChapterText(dataIndex),
        regex: Manager.getChromaRegex(),
        collectionId: Manager.getColloctionId(),
        ollamaModel: Manager.getEmbeddingModel(),
        postgreCheck: postgres_check,
        postgreData:sentences,
        postgreDataLength:sentences.length,
    }
}


(async () => {
    let dbModule = new IndexedDBModule(verctor_db_config.database_name, verctor_db_config.store_name);
    let meta_dbModule = new IndexedDBModule(metadata_db_config.database_name, metadata_db_config.store_name);

    newMetaTemplateBtn.addEventListener("click",e=>{
        const inputs = e.target.parentElement.querySelectorAll('input')
        if(!inputs[0].value ) {
            inputs[0].style.border = "1px solid red"
            setTimeout(()=>inputs[0].style.border="0px",1000)
        } else if(!inputs[1].value){
            inputs[1].style.border = "1px solid red"
            setTimeout(()=>inputs[1].style.border="0px",1000)
        } else{
            const exsit = metaTemplateSelect.querySelector(`[key="${inputs[0].value}"][value="${inputs[1].value}"]`)
            if(exsit) {
                metaTemplateSelect.querySelector(".warning")?.classList.remove("warning")
                 exsit.classList.add("warning")
                 setTimeout(()=>{
                    exsit.classList.remove("warning")
                },1000)
            } else {
                const id = crypto.randomUUID()
                const option = document.createElement('li')
                option.id = id
                option.setAttribute('key',inputs[0].value)
                option.setAttribute("value",inputs[1].value)
                option.textContent =  inputs[0].value + '  : ' + inputs[1].value
                metaTemplateSelect.appendChild(option)
                meta_dbModule.saveData({key:inputs[0].value,value:inputs[1].value},id).catch(err=>console.error(err))
            }
        }
    })
    metaTeplateDelBtn.addEventListener('click',e=>{
        const selectedItems = metaTemplateSelect.querySelectorAll('li.selected');
        
        selectedItems.forEach(item=>{
            const _key = item.getAttribute('key')
            Manager.removeMetaItem(_key)
            item.remove()
            meta_dbModule.removeData([item.id]).catch(err=>conso.remle.error(err))
        })
        metaTemplateSelect.querySelector('li.selected')?metaTeplateDelBtn.style.display = "block":metaTeplateDelBtn.style.display = "none"

    })
    metaTemplateSelect.addEventListener('click',(e)=>{
        const _target = e.target;
        if(_target.tagName == "LI"){
            const id = _target.id;
            const _key = _target.getAttribute('key')
            const _value = _target.getAttribute('value')
            const _parent_target = _target.parentElement
            if(_target.classList.contains("selected")){
                _target.classList.remove("selected")
                Manager.removeMetaItem(_key,_value)
                // meta_dbModule.removeData(id).catch(err=>console.error(err))
            } else {
                _target.classList.add("selected")
                Manager.addMetaItem(_key,_value)
            }
            
            _parent_target.querySelector('.selected')?metaTeplateDelBtn.style.display = "block":metaTeplateDelBtn.style.display = "none"
        }
    })

    left_ui_init();
    meta_dbModule.initializeFormFromStore((id,data)=>{
        const option = document.createElement('li')
        option.id= id
        option.setAttribute('key',data["key"])
        option.setAttribute("value",data["value"])
        option.textContent =  data["key"] + '  : ' + data["value"]
        metaTemplateSelect.appendChild(option)
    },"callback")

    storeBtn.addEventListener("click", async () => {
        const config = await getConfigs();
        const result = await Manager.store(config);
        if (result) {
            dbModule.saveData(result, config.collectionId)
        }
    });
    splitToPostgreBtn.addEventListener('mouseenter', () => {
        document.getElementById('metaTemplateBtn')?.classList.add('hovered-btn');
        document.querySelector('.metadata-group')?.classList.add('hovered');
    });

    splitToPostgreBtn.addEventListener('mouseleave', () => {
        document.getElementById('metaTemplateBtn')?.classList.remove('hovered-btn');
        document.querySelector('.metadata-group')?.classList.remove('hovered');
    });

    splitToPostgreBtn.addEventListener("click", async ()=>{
        const isOnline = await postdb.checkStatus()
        if(!isOnline){
            alert("请先启动PostgREST和PostgreSQL服务！")
            return
        }
        let _chapterids = [];
        let chapterNodes = chaptersUl.children;
        const len = chapterNodes.length
        if (len == 0) {
            alert("请先上传并拆分文档！")
            return
        }
        for (let i = 0; i < len; i++) {
            _chapterids.push(chapterNodes[i].getAttribute('data-index'))
        }

        const button_title = splitToPostgreBtn.textContent
        splitToPostgreBtn.textContent = "正在处理中 "

        console.log(_chapterids)
        _chapterids.forEach(async (index)=>{
            console.log(index)
            await saveToPostdb(getChapterText(index)?.content,Manager.getChromaRegex())
        })
        splitToPostgreBtn.textContent = "已完成"
        setTimeout(()=>{
            splitToPostgreBtn.textContent = button_title
        },3000)
    });

    await Manager.init_right();
})()