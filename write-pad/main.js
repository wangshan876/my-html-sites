import {queryCollection} from '/components/vectordb/api.mjs';
import { IndexedDBModule } from '/components/autoSaveIndexedDB.js';
import { createChatModule } from '/components/gpt/chatView.js';
import * as api from '/components/vectordb/api.mjs';

import toast from  '/components/toast.js';

let quill,$quillToolbar,dbModule, verctordbModule;
const pattern = /(.*?)[\.。！\!\?？]/g;
const $vectorQueryResults = document.querySelector('#vector-query-results');
const $verctorDBMissions = document.getElementById('verctor-db-missions')
const $prompt = document.getElementById('prompt')

const config = {
    database_name:"UserDatas",
    store_name:"writepad",
    store_key:"contents",
    // chroma_id:"b85c9693-b196-4bbf-a341-2acc63cd2197",
    chroma_id:"d51fb132-9d96-4ed3-830e-25e1bfaf7e69",
    embedModel:"quentinz/bge-base-zh-v1.5:latest",
    autoSaveTime:5000
}
let toast_config =   {
    styleOptions: {
        backgroundColor: '#3a3a3a00',
        color: '#999797',
        fontSize: '10px',
        padding: '2px',
        opacity: '0.7',
    },
    horizontal: 'right', // 右侧
    vertical: 'top', // 顶部
    offset: '20px', // 距离边缘的距离
    // parent: customContainer // 指定父节点
}

const verctor_db_config =  {
    database_name:"verctor_db",
    store_name:"missions",
    store_key:"mission",
}

const throttledAutoSave = throttle(saveData, config.autoSaveTime); // 30 seconds


function throttle(func, limit) {
    let lastFunc;
    let lastRan;
    return function() {
        const context = this;
        const args = arguments;
        if (!lastRan) {
            func.apply(context, args);
            lastRan = Date.now();
        } else {
            clearTimeout(lastFunc);
            lastFunc = setTimeout(function() {
                if ((Date.now() - lastRan) >= limit) {
                    func.apply(context, args);
                    lastRan = Date.now();
                }
            }, limit - (Date.now() - lastRan));
        }
    };
}　

function setChromaConfig(){
    const _value = $verctorDBMissions.value
    const _select = $verctorDBMissions.querySelector('[value="'+_value+'"]')
    
    config["chroma_id"] =  _select?.id
    config["embedModel"] = _select?.getAttribute('data-model')
}

function saveData() {
    dbModule.saveData(quill.getContents(),config.store_key).then(r=>{
        if(!$quillToolbar || !toast_config.parent){
            $quillToolbar =  document.querySelector('.ql-toolbar');
            toast_config.parent = $quillToolbar;
        }
        toast('saved', 700, toast_config);
    }
    );
}

// 获取collection列表
async function getMissionList() {
    const missions = await verctordbModule.getAllData()
    if(!missions || missions.length==0) return;
    const htmls = missions.map(mission =>{
        return  `<option data-model="${mission.ollamaModel||''}" id="${mission.collectionId}" value="${mission.collectionName}">${mission.collectionName} </option>`
    }).join('');
    $verctorDBMissions.innerHTML = htmls + `<option id="newCollection" value="newCollection">新建集合</option>`;
}

function startApp() {
    dbModule = new IndexedDBModule(config.database_name, config.store_name);
    verctordbModule = new IndexedDBModule(verctor_db_config.database_name, verctor_db_config.store_name);
    
    getMissionList()
    $verctorDBMissions.addEventListener('change',(e)=>{
        setChromaConfig()
    })
    quill = new Quill('#editor', {
        theme: 'snow',
        modules: {
            toolbar: [
                ['bold', 'italic', 'underline'],
                ['link', 'image'],
                [{ 'list': 'ordered'}, { 'list': 'bullet' }]
            ]
        }
    });


    dbModule.initializeFormFromStoreByKey(data=>{
        quill.setContents(data)
    },config.store_key, "callback")

    verctordbModule.getAllData().catch(error=>{
        console.error(error)
    })



    $quillToolbar = document.querySelector('.ql-toolbar');
    $quillToolbar.style.position = "relative";
    toast_config.parent = $quillToolbar;
    setChromaConfig()

    
    const chatModule = createChatModule('chat-container');


    quill.on('text-change', function(delta, oldDelta, source) {
        // 获取编辑器的文本内容
        let text = quill.getText();
  
        // 检测句子结束标记
        let result = text.match(pattern);
        if(result){
            result = result.map(sentence=>{
               return  {sentence,length:sentence.length,"index":text.indexOf(sentence)}
            })
            
            const last = result[result.length-1]
            // quill.setSelection(last.index,last.length)
            queryCollection(config.chroma_id,last.sentence,{},config.embedModel).then(res=>{
                $vectorQueryResults.innerHTML = ''
                $vectorQueryResults.setAttribute('range-start',last.index)
                $vectorQueryResults.setAttribute('range-length',last.length)
                let html = '<li id="ai-output"></li>'
                if(!res.error){
                    res.documents[0].forEach(document => {
                        html +=`<li>${document}</li>`
                    });
                }
                $vectorQueryResults.innerHTML = html
            })
            chatModule.chat($prompt.value,last.sentence,"ai-output")
        }
        throttledAutoSave()
      });

      // 你可以使用 chatModule.chat() 来调用 chat 函数
    //   chatModule.chat('','你好','test');
}



startApp()