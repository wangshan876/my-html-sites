//全局变量
let mune_selected = ''

//固定节点
//---tips---
const tips = document.querySelector('#tips'); 
let tips_event_handler = null; //事件句柄

const shadowHost = document.querySelector('#host');
const shadowRoot = shadowHost.attachShadow({ mode: 'closed' });

//常量
const eudic_url = "https://dict.eudic.net/mdicts/en/"
const youdao_url = "https://m.youdao.com/dict?le=eng&q="
const translate_url = "https://www.bing.com/dict/search?q="

function create_element(option){
    const element = document.createElement(option['tag'] || 'div')
    option['id'] && (element.id = option['id'] );
    option['classes']&&option['classes'].length>0 && option['classes'].forEach(_class=>element.classList.add(_class))
    option['inner'] && (element.innerHTML = option['inner'])
    return element
}

function createlink(rel,href){
    const link = document.createElement('link')
    link.rel = rel
    link.href = href
    return link;
}

function note_br(note){
    if(!note) return false;
    else return note.replace(/\n/g,'<br/>')
}

function create_menubtn(menu){

    var menubtn =create_element({id:"menu-button",inner:"W"})
    menubtn.addEventListener("click",function(e){
        menu.classList.contains('open')?menu.classList.remove('open'):menu.classList.add('open')
    })
    return menubtn;
}



shadowRoot.appendChild(createlink('stylesheet','./styles/pure-min.css'))
shadowRoot.appendChild(createlink('stylesheet','./styles/grids-responsive-min.css'))
shadowRoot.appendChild(createlink('stylesheet','./styles/menus.css'))

var style = document.createElement('style');
style.textContent = STYLES
shadowRoot.appendChild(style)




// var DATAS = {}
// NOTES.forEach(note=>{
//     if(!DATAS[note['section']]){
//         DATAS[note['section']] = [note]
//     } else {
//         DATAS[note['section']].push(note)
//     }
// })

// const chapters = Object.keys(DATAS) 
// console.log(DATAS)

async function create_menu_lists(selected_callback,callback){
    
    const pure_menu_list = create_element({tag:"ul",classes:['pure-menu-list']});

    //top area start
    const pure_menu_item_top = create_element({tag:"li",classes:['pure-menu-item', 'pure-menu-link','link'],inner:"生词本"});
    pure_menu_item_top.setAttribute('for',"top_area")
    pure_menu_item_top.addEventListener("click", function( event ) {
        pure_menu_list.querySelector('.selected').classList.remove('selected')
        event.target.classList.add('selected')        
        selected_callback('top_area')
        window.scrollTo(0,0) 
        callback()
    }, false);
    pure_menu_list.appendChild(pure_menu_item_top)

    //top area end

    
    await db.deathmask_chapters.toArray(chapters=>{
        chapters.forEach((chapter,i)=>{
            const _chapter = 'CHAPTER_'+chapter['chapter']
            const pure_menu_item = create_element({tag:"li",classes:['pure-menu-item', 'pure-menu-link','link'],inner:_chapter});
            
            pure_menu_item.setAttribute('for',_chapter)
            
            if(i == 0){
                selected_callback(_chapter)
                pure_menu_item.classList.add('selected')
            }
            
            pure_menu_item.addEventListener("click", function( event ) {
                pure_menu_list.querySelector('.selected').classList.remove('selected')
                event.target.classList.add('selected')

                
                selected_callback(event.target.attributes['for'].value)
                window.scrollTo(0,0) 
                callback()
            }, false);
            pure_menu_list.appendChild(pure_menu_item)
        })
    })
    return pure_menu_list;
}
async function create_menus(selected_callback){
    const menu = create_element({id:"menu"});
    const pure_menu = create_element({classes:["pure-menu"]});   
    const menu_lists = await create_menu_lists(selected_callback,()=>{
        menu.classList.contains('open') && menu.classList.remove('open')
    })

    pure_menu.appendChild(menu_lists)
    menu.appendChild(pure_menu)
    menu.addEventListener("mouseleave",(e)=>{
        if(isMobie ){
            menu.classList.contains('open') && menu.classList.remove('open')
        }
    })
    return menu;

}

function query(word){
    const words = word.split(' ')
    if(words && (words.length>1)){
        dict_frame.src = translate_url+words.join('+')
    } else {
        dict_frame.src =eudic_url + word.replace(/[\.,"]/g,'')
    }
    if(!frame.classList.contains('dict_show')){
        frame.classList.add('dict_show')
    }
}

function card_buttons(wordDiv,word){
    
    const buttons = create_element({id:"word-btns",classes:['pure-u-6-24']});

    const buttons_row1 = create_element({id:"word-btns-row1"});
    const buttons_row2 = create_element({id:"word-btns-row2"});

    const markbtn = create_element({id:"word-mark",
        inner:wordDiv.getAttribute('ismarked') == 'true'?"-":"+",
        classes:[wordDiv.getAttribute('ismarked') == 'true'?"remove":"add"]
    });


    markbtn.addEventListener('click',async function(e){
        const ismarked = wordDiv.getAttribute('ismarked')
        const id = wordDiv.id.replace('word_','')
        if(ismarked == 'true'){
            // 取消标记
            await db_change('deathmask',id,{'ismarked':'false'})
            markbtn.innerText = "+"
            markbtn.classList.remove('remove')
            markbtn.classList.add('add')
            wordDiv.setAttribute('ismarked','false')
        } else {
            //添加标记
            await db_change('deathmask',id,{'ismarked':'true'})
            markbtn.innerText = "-"
            markbtn.classList.remove('add')
            markbtn.classList.add('remove')
            wordDiv.setAttribute('ismarked','true')
        }
    })

    const turnoverbtn = create_element({id:"word-turnover",inner:"反转"});
    turnoverbtn.addEventListener('click',function(e){
        
        if(wordDiv.classList.contains('backside')){
            wordDiv.classList.remove('backside')
        }else {
            wordDiv.classList.add('backside')
        }
    })

    const querybtn = create_element({id:"word-query",inner:"查询"});
    querybtn.addEventListener('click',function(e){
        const words = word.split(' ')
        if(words && (words.length>1)){
            dict_frame.src = translate_url+words.join('+')
        } else {
            dict_frame.src =eudic_url + word.replace(/[\.,"]/g,'')
        }
        if(!frame.classList.contains('dict_show')){
            frame.classList.add('dict_show')
        }
    })


    const copybtn = create_element({id:"word-copy",inner:"复制"});
    copybtn.addEventListener('click',function(e){
        navigator.clipboard.writeText(word)
        tips.style['display'] = 'block'
        setTimeout(() => {
            tips.style['display'] = 'none';
            tips_event_handler= null
        },'1500')
    })
    //buttons.appendChild(turnoverbtn)
    
    buttons_row1.appendChild(turnoverbtn)
    buttons_row1.appendChild(markbtn)
    buttons_row2.appendChild(copybtn)
    buttons_row2.appendChild(querybtn)
    buttons.appendChild(buttons_row1)
    buttons.appendChild(buttons_row2)

    return buttons

}
async function create_main_contents(selected_menu_id,where='groupby',equals=false){
    const _chapter = selected_menu_id
    const chapterDiv = create_element({id:_chapter,classes:['pure-u-1','word-item']});

    await db.deathmask.where(where).equals(!equals?selected_menu_id.replace('CHAPTER_',''):equals).toArray(async cards=>{
        cards.forEach(c=>{
            const {id,word,color,note,ismarked} = c
            
            const wordDiv = create_element({id:"word_"+id,classes:["pure-g",'block',color]});
            // TODO：id = bookneme + id
            wordDiv.setAttribute('ismarked',(ismarked=="true")?true:false)
            const word_group = word.split(' ')
            let ietls_icon = null
            let bang =null

            if(word_group ){
                if(word_group.length==1){
                    if(ielts_words.includes(word.replace(/[\.,"]/g,''))){
                        ietls_icon = create_element('div','',['ielts-icon'])
                    }
                } else {
                    const slices = word.replace(/["\']/g,'').split(/[ ,\.]/g)
                    const matchs = slices.filter(s=>s.length>3&&ielts_words.includes(s));
                    if(matchs.length>0){
                        ietls_icon = create_element({tag:"img",classes:["ielts-icon"]})
                        ietls_icon.src="#"
                        ietls_icon.title="雅思3900词汇"
                        bang = create_element({classes:["bang"]})
                        matchs.forEach(ielt_word=>{
                            ielt = create_element({classes:["cell"],inner:ielt_word})
                            ielt.addEventListener('click',(e)=>query(ielt_word))
                            bang.appendChild(ielt)
                        })
                    }
                }

            } 
            const word_card = create_element({classes:["pure-u-14-24","word","word-front"],inner:word})

            const note_card_html = `
            <div>${note_br(note)||word}</div>
            <div id="back-editor" for="${id}">编辑</div>
            `
            const note_card = create_element({classes:["pure-u-14-24","note","word-front"],inner:note_card_html})

            ietls_icon && wordDiv.appendChild(ietls_icon)
            bang && wordDiv.appendChild(bang)
            wordDiv.appendChild(word_card) 
            wordDiv.appendChild(note_card) 

            let card_edit_tabs = '<ul  id="popup_tabs" class="buttons">'
            if(isMobie || document.body.clientWidth<800){
                card_edit_tabs += `
                        <li class="edit-frontbtn" >正面</li>
                        <li class="edit-backbtn">反面</li>
                `
            }
            card_edit_tabs += `
            <li class="save">保存</li>
            <li class="cancle">关闭</li>
            </ul>
            `
            wordDiv.querySelector('#back-editor').addEventListener('click',function(e){
                const popup_content = card_edit_tabs+`
                    <textarea class="word" autocapitalize="none">${word}</textarea>
                    <textarea class="note" autocapitalize="none" disabled placeholder="笔记">${note_br(note)||''}</textarea>
                `
                POPUP.style.height = document.body.clientHeight;
                POPUP.innerHTML = popup_content;
                if(isMobie ){
                    const frontbtn = POPUP.querySelector('.edit-frontbtn'),
                        backtbtn = POPUP.querySelector('.edit-backbtn'),
                        word_area = POPUP.querySelector('.word'),
                        note_area = POPUP.querySelector('.note');
                        frontbtn.addEventListener('click',function(e){
                            word_area.removeAttribute('disabled')
                            note_area.setAttribute('disabled',true)
                        })
                        backtbtn.addEventListener('click',function(e){
                            note_area.removeAttribute('disabled')
                            word_area.setAttribute('disabled',true)
                        })
                }
                POPUP.querySelector('.save').addEventListener('click',async function(e){
                    const word = POPUP.querySelector('.word').value
                    const note = POPUP.querySelector('.note').value
                    await db_change('deathmask',id,{word,note})
                    POPUP_COVER.classList.add('hide')
                })
                
                POPUP.querySelector('.cancle').addEventListener('click',async function(e){
                    
                    POPUP_COVER.classList.add('hide')
                })
                POPUP_COVER.classList.toggle('hide')
            })

            const close_backside = ()=>{
                const backsideElem = chapterDiv.querySelector('.backside')
                if(backsideElem && (backsideElem.id !== wordDiv.id)){
                    backsideElem.classList.remove('backside')
                }
            }

            if(isMobie){

                let timer = null
                let startTime = ''
                let endTime = ''
      
                wordDiv.addEventListener('touchstart', function (e) {
                    startTime = +new Date()
                    timer = setTimeout(function () { //长按
                        close_backside()// 关闭反面
                        
                        if(wordDiv.classList.contains('backside')){
                            wordDiv.classList.remove('backside')
                        }else {
                            wordDiv.classList.add('backside')
                        }
                    }, 700)
                })
    
                wordDiv.addEventListener('touchend', async function (e) {
                    endTime = +new Date()
                    clearTimeout(timer)
                    if (endTime - startTime < 700) { //click
                        close_backside()// 关闭反面
                        await db_change('positions','deathmask',{'noteid':wordDiv.id.replace('word_','')},'book') //记录位置
                    }
                })
            } else {
                wordDiv.addEventListener('click',async function(e){
                    let target = e.target;
                    if(!e.target.classList.contains('block')) target = e.target.parentNode
                    close_backside()// 关闭反面
                   
                    await db_change('positions','deathmask',{'noteid':wordDiv.id.replace('word_','')},'book') //记录位置
                    return false;
                    
                })
                wordDiv.addEventListener('contextmenu',async function(e){
                   //const top = e.screenY, left =  e.screenX;
                    // const floatmenu = shadowRoot.querySelector('#floatmenu')
                    // floatmenu.classList.add('show')
                    // floatmenu.style.top = top +"px"
                    // floatmenu.style.left = left +"px"
                    close_backside()
                    if(wordDiv.classList.contains('backside')){
                        wordDiv.classList.remove('backside')
                    }else {
                        wordDiv.classList.add('backside')
                    }
                    e.preventDefault();
                    
                })
            }





            const buttons = card_buttons(wordDiv,word)
            wordDiv.appendChild(buttons)
            chapterDiv.appendChild(wordDiv)
            

        })
    })
    return chapterDiv
}

async function create_top_area(show_action){

    let items = await create_main_contents("top_area",'ismarked','true') 
    return items
}

async function caches_switcher(){
    const functions = create_element({classes:['functions','pure-u-2-5','pure-u-md-2-5','pure-u-sm-5-5']}),
    switcher = create_element({classes:['clear','pure-button'],inner:"清缓存"});
    switcher.addEventListener('click',async function(e){
        const target = e.target
        if(!navigator.serviceWorker) return ;
        caches.keys().then(keys=>{
            if(keys.length){ 
                keys.forEach(key=>{
                    caches.open(key).then(function(cache) {
                        cache.delete('/homepage1/index.html').then(function(response) {
                          console.log('/homepage1/index.html deleted')
                        });
                        cache.delete('/homepage1/js/index.js').then(function(response) {
                          console.log('/homepage1/js/index.js deleted')
                        });
                        cache.delete('/homepage1/js/iframe.js').then(function(response) {
                          console.log('/homepage1/js/iframe.js deleted')
                        });
                        cache.delete('/homepage1/js/init.js').then(function(response) {
                          console.log('/homepage1/js/init.js deleted')
                        });
                        cache.delete('/homepage1/js/db.js').then(function(response) {
                          console.log('/homepage1/js/db.js deleted')
                        });
                        cache.delete('/homepage1/styles/index.css').then(function(response) {
                          console.log('/homepage1/styles/index.css deleted')
                        });
                      }).then(r=>{
                        target.innerText = "成功！"
                        setTimeout(()=>target.innerText = "清缓存",2000)
                    }).catch(r=>{
                        target.innerText = "错误！"
                        setTimeout(()=>target.innerText = "清缓存",2000)
                    });
                })
            }
        })

    })
    functions.appendChild(switcher);
    const backup = create_element({id:"backup",classes:['pure-button'],inner:"备份"});
    backup.addEventListener("click",(e)=>backup_with_streamapi())
    
    functions.appendChild(backup);
    const recover = create_element({id:"recover",classes:['pure-button'],inner:"导入"});
    recover.addEventListener("click",(e)=>UPLOADER.click())
    functions.appendChild(recover);

    return functions
    
}

function create_floatmenu(){
    const floatmenu = create_element({id:"floatmenu"})
    //test
    const testbutton = create_element({id:"testbutton",inner:'test'})
    floatmenu.appendChild(testbutton)
    return floatmenu;
}

async function create_layout(){

    const layout = create_element({id:"layout"}),
         main_wraper = create_element({id:"main_wrapper"}),
         main = create_element({id:"main"}),
         title_aera  = create_element({classes:["title-area",'pure-g']}),
         title = create_element({id:"note_title",classes:['pure-u-3-5','pure-u-md-3-5','pure-u-sm-5-5']}),
         progress_line  = create_element({classes:["progress-line",'pure-g']}),
         floatmenu = create_floatmenu()
         

    main_wraper.addEventListener('scroll',e=>{
        const percent = 100*(main_wraper.scrollTop/main_wraper.scrollHeight).toFixed(2)
        progress_line.style.background = `linear-gradient(to right,rgb(26 38 255),${percent+6}%, black)`
    })

    main_wraper.appendChild(progress_line)
    //let main_content = await create_main_contents(id)
    let show_action = async (selectorid)=>{
        const selectElm = main.querySelector("#"+selectorid)
        const _show = main.querySelector('.show')
        _show&&_show.classList.replace('show','word-item')
        
        if(selectElm ){
            selectElm.classList.replace('word-item','show')
        } else {
            if(selectorid!=="top_area") {
                let new_main_content = await create_main_contents(selectorid)
                new_main_content.classList.replace('word-item','show')
                main.appendChild(new_main_content)
            } 
        }
    }

    let topArea = await create_top_area((selector)=>show_action(selector))
    main.appendChild(topArea)
    let menu = await create_menus((selector)=>{show_action(selector);title.innerText=selector;})
    //main.appendChild(main_content)

    
    title_aera.appendChild(title)
    const cachebtn = await caches_switcher()
    title_aera.appendChild(cachebtn)
    main_wraper.appendChild(title_aera)
    layout.appendChild(menu);
    main_wraper.appendChild(main)
    main_wraper.appendChild(floatmenu)
    layout.appendChild(main_wraper);
    shadowRoot.appendChild(create_menubtn(menu));
    shadowRoot.appendChild(layout);

}

async function set_position(){
    const count = await db.positions.count()
    if(count > 0){
        let pos = await db.positions.where('book').equals('deathmask').toArray()
        const noteid = pos[0]['noteid'];
        if(noteid){
            let note = await db.deathmask.where('id').equals(parseInt(pos[0]['noteid'])).toArray()
            return note.length>0?note[0]:false;
        } else {
            return false;
        }
    } else{
        return false
    }
}

db.deathmask.count().then(async count=>{
    if(count==0){
        setTimeout(create_layout(), 5000 )
    }else{
        const location = await set_position()
        if(location){
            const {id,groupby} = location
            
            await create_layout()
            try{
                setTimeout(() => {
                    groupby&&shadowRoot.querySelector('[for=CHAPTER_'+groupby+']').click()
                }, 300);
                
                setTimeout(() => {
                    const card = shadowRoot.querySelector('#word_'+id)
                    card && shadowRoot.querySelector('#main_wrapper').scrollTo(0,card.offsetTop-40)
                }, 1000);
            } catch(e){
                alert(e)
            }
            
        } else {
            await create_layout()
        }
    }
}).catch(e=>console.error(e))
