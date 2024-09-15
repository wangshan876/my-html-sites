const SpeakEnded = new Event('SpeakEnded');
const SpeakStart = new Event('SpeakStart');
const EventReciever = document.querySelector("#speaker_controller") || document
const voicesWrapper = document.querySelector(".voicesWrapper") || document
const fileInput = document.querySelector("#uploadvoices") 
const forfileInput = document.querySelector("label[for=uploadvoices]") 
var isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;

let db;

let AduioObj,toneAudio;

const dbName = 'audioDB';
const storeName = 'audioStore';


function initAudio(words){
  if(isIOS){
    let filters = words.map(w=>w[0])
    getAllAudios(filters).then(results=>{
      toneAudio = new Tone.ToneAudioBuffers(results, () => {
        AduioObj = new Tone.Player().toDestination();
                // play one of the samples when they all load
      });
    })
  } else {
    AduioObj = new Audio()
    AduioObj.addEventListener('play', (event) => {
      EventReciever.dispatchEvent(SpeakStart);
    })
    AduioObj.addEventListener('ended', (event) => {
      EventReciever.dispatchEvent(SpeakEnded);
    })
  }
}


// 播放音频
function playAudio(file) {//ios

  const {audioName,audioBlob} = file
  if(isIOS){
    if(Tone.context.state !== "running") {

      let audioActive = document.createElement("div")
      audioActive.id = "audioActive"
      let audioActiveBtn = document.createElement("button")
      audioActiveBtn.innerText = "timcook actived"
      audioActiveBtn.style.padding="40px"
      audioActive.appendChild(audioActiveBtn)
      
      audioActive.style.position = "absolute"
      audioActive.style.width = "100%"
      audioActive.style.height = "100%"
      audioActive.style.justifyContent = "center"
      audioActive.style.alignItems = "center"
      audioActive.style.zIndex = "999"
      audioActive.style.display = "flex"
      audioActiveBtn.addEventListener("click",function(e){
        Tone.start()

        Tone.context.resume().then(() => {
          audioActive.remove();
          AduioObj.buffer = toneAudio.get(audioName);
          AduioObj.onstop = function(e){
            EventReciever.dispatchEvent(SpeakEnded);
          }
          AduioObj.start();
        });
      })
      document.body.appendChild(audioActive)
    } else {
      Tone.start()
      Tone.context.resume().then(() => {
          AduioObj.buffer = toneAudio.get(audioName);
          AduioObj.onstop = function(e){
            EventReciever.dispatchEvent(SpeakEnded);
          }
          AduioObj.start();
      });
    }


  } else {
    AduioObj.src = window.URL.createObjectURL(audioBlob);
    AduioObj.play()
  }

}

function isOpened(){
  return db?true:false
}
function opendb() {
      return new Promise((resolve, reject) => {
          const request = indexedDB.open(dbName);

          request.onerror = event => {
              reject(event.target.error);
          };

          request.onupgradeneeded = event => {
              db = event.target.result;
              if (!db.objectStoreNames.contains(storeName)) {
                  const objectStore = db.createObjectStore(storeName);
              }
          };

          request.onsuccess = event => {
              db = event.target.result;
              resolve(db);
          };
      });
  }

  // 将音频文件保存到 IndexDB
  function saveAudioToIndexDB(audioName, audioBlob,callback) {
    const transaction = db.transaction(storeName, 'readwrite');
    const objectStore = transaction.objectStore(storeName);
    let name = audioName.match(/\/([a-zA-Z\-\s]+)\.[a-zA-Z0-9]+/)
    name?name = name[1]:audioName
    const newItem = { 'audioName': audioName, 'audioBlob': audioBlob };
    const request = objectStore.add(newItem,name);

    request.onsuccess = function(event) {
      callback && callback()
    };
    request.onerror = function(event) {
      console.error('Error saving ' + audioName +"  "+ name+' to IndexDB:', event.target.error);
    };
    
  }

  // 解压zip包
  function unzipAudioZip(audioZip) {

    const zip = new JSZip();
    zip.loadAsync(audioZip)
    .then(function(contents) {
        const keys = Object.keys(contents.files)
        const len = keys.length
        for(let i=0;i<len;i++){
        // for (const fileName in contents.files) {
            if (!contents.files[keys[i]].dir) {
                contents.files[keys[i]].async('blob')
                .then(function(audioBlob) {
                    saveAudioToIndexDB(keys[i], audioBlob,()=>{
                      const progress = parseInt((i/len)*100)
                      if(progress >= 99){
                        forfileInput.textContent = "加载完成！"
                      } else{
                        forfileInput.textContent = progress+"%"
                      }
                      
                    });
                });
            }
        }
        
    })
    .catch(function(error) {
        console.error('Error unzipping audio zip:', error);
    });
  }
  fileInput.addEventListener("change",e=>{
    
    if(fileInput.value){
      const files = fileInput.files;
      if (files.length === 0) {
        console.error('Please select an audio zip file.');
        return;
      }
  
      const audioZip = files[0];
      const audioZipName = audioZip.name;
      opendb().then(result=>{
        unzipAudioZip(audioZip);
      })
      
    }
  })



  async function getAllAudios(filters=[]) {
    if(!isOpened()){
      await opendb()
    }
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(storeName, 'readonly');
      const store  = transaction.objectStore(storeName);
      //const request = objectStore.getAll();

      // 遍历对象存储空间，并将主键和值组合起来存储在新数组中
      const result = {};
      const cursorRequest = store.openCursor();  
      cursorRequest.onsuccess = function(event) {
        const cursor = event.target.result;
        if (cursor) {
          const key = cursor.primaryKey;
          const value = cursor.value;
          if(filters.includes(key)){
            result[value.audioName] = window.URL.createObjectURL(value.audioBlob)
          }
          cursor.continue();
        } else {
          resolve(result);
        }
      };
      cursorRequest.onerror = function(event) {
        reject(event.target.error);
      }
    })
  }
async function getAudio(word) {
  if(!isOpened()){
    await opendb()
  }
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(storeName, 'readonly');
    const objectStore = transaction.objectStore(storeName);
    const request = objectStore.get(word);
    request.onsuccess = function(event) {
      resolve(event.target.result);
    };
    request.onerror = function(event) {
      reject(event.target.error);
    }
  })

  


  }
export function Speaker(){


    let synth,voicelists,zh_voices,usedVoice;
    synth = window.speechSynthesis;
    let utterThis = new SpeechSynthesisUtterance()
    function setSpeech() {
        return new Promise(
            function (resolve, reject) {
                let synth = window.speechSynthesis;
                let id;
    
                id = setInterval(() => {
                    if (synth.getVoices().length !== 0) {
                        resolve(synth.getVoices());
                        clearInterval(id);
                    }
                }, 10);
            }
        )
    }
    
    function setVoice(){
        const voicesNode = document.createElement("ul")
        voicesNode.classList.add("voices-list")
        voicesNode.id = "voices-list"
        voicesNode.style.display = "none"
        const li = document.createElement("li")
        voicelists = setSpeech();
        voicelists.then((voices) =>{
            
            zh_voices = voices.filter(function (voice) {
                return voice.lang == "zh-CN" || voice.lang == "zh-TW"
                // return voice.lang == "zh-CN"
                // return voice.lang == "en-US"
             });
            usedVoice = zh_voices[0] 
            zh_voices.forEach( (voice,i) => {
                let newli = li.cloneNode(true)
                if(i == 0) newli.classList.add("selected")
                newli.innerText = voice.name;
                newli.voice = voice
                newli.id = "speaker"+i
                newli.addEventListener("click",(e)=>{
                    usedVoice = newli.voice;
                })
                voicesNode && voicesNode.appendChild(newli)
            });
        }); 
        (voicesWrapper || document.body).appendChild(voicesNode)
    }
    
    setVoice()
    
    function speak(text, options={localfirst:true}) {
      function usrSpeechApi(){
        synth.cancel()
        if (synth.speaking) {
          //console.error("speechSynthesis.speaking");
          return;
        }
        utterThis.text = text
      
          utterThis.onstart = function (event) {
            //console.log("SpeechSynthesisUtterance.onend");
            EventReciever.dispatchEvent(SpeakStart);
          };
          utterThis.onend = function (event) {
            //console.log("SpeechSynthesisUtterance.onend");
            EventReciever.dispatchEvent(SpeakEnded);
          };
      
          utterThis.onerror = function (event) {
            console.log(event)
            //console.error("SpeechSynthesisUtterance.onerror");
          };
          utterThis.voice = usedVoice;
          utterThis.pitch = 1;
          utterThis.rate = 1;
          synth.speak(utterThis);
          return utterThis
      }
      if (text !== "") {
        if(options["localfirst"]){
          const audiocache = getAudio(text)
          audiocache.then(file=>{
            if(file){
              playAudio(file)
            } else{
              return usrSpeechApi()
            }
            
          }).catch(err=>{
            return usrSpeechApi()
          })
        } else{
           return  usrSpeechApi()
        }
      }}
      return {
        speak:(text, options)=> speak(text, options),
        interactive: (words)=>{
          initAudio(words)
          // playAudio()
        }
      }
}





