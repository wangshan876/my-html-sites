window.STYLES = `
#layout{
    overflow: hidden;
    padding-bottom:50px;
    height:100%;
}
#menu{
    overflow-x: hidden;
    overflow-y: scroll;
    height:100%;
    z-index:100;
}
#main_wrapper{
    overflow-x: hidden;
    overflow-y: scroll;
    height: 100%;
    padding-bottom: 100px;
}
#main_wrapper .progress-line{
    position:fixed;
    height:5px;
    width:100%;
    top:0;
    z-index:99;
}
.title-area{
    height:40px;
    width:100%;
    background-color: #81080861;
    color: #bbb;
    display: flex;
    align-items: center;
    justify-content: center;
}
.functions {
    background-color:#325161;
}
.functions,#note_title{
    justify-content: center;
    align-items: center;
    display: flex;
    height:100%;

}
.functions .pure-button{
    padding: 5px;
    font-size: 12px;
    border-radius:0px;
    color: black;
    font-weight: bold;
}
.functions #backup{
    background-color:#1be3ff;
}
.functions #backup:hover{
    background-color:#aef5ff;
}
.functions #recover{
    background-color:#6aa6ff;
}
.functions #recover:hover{
    background-color:#9bc3ff;
}
.functions .clear{
    background-color:#ffca6a;
}
.functions .clear:hover{
    background-color:orange;
}

.functions .pure-button:hover{
    padding: 5px;
    font-size: 12px;
}
#main{
    height:100%;
    padding-bottom: 100px;
}
.pure-u-1 {
    padding-top:40px;
    padding-bottom:100px;
}
.show{
    display: block;
}
.word-item{
    display: none;
}
.block{
    position:relative;
    color:black;
    min-height: 100px;
    border: 1px solid #000;
    cursor:pointer;
}
.ielts-icon{
    position: absolute;
    padding: 1px;
    font-size: xx-small;
    background-color: green;
    display: flex;
    justify-content: center;
    align-items: center;
    height: 10px;
    width: 10px;
    border: 1px solid #9aff18;
    border-radius: 7px;
    color: green;
}
.bang{
    margin-left: 30px;
    position: absolute;
    display: flex;
}
.bang .cell{
    letter-spacing: normal;
    background-color:#ffe4e487;
    padding: 0 10px;
    border-radius: 2px;
    border: 1px solid;
    margin-left:5px;
}
.bang .cell:hover{
    background-color: ghostwhite;
}
.block:hover{
    min-height: 130px;
}
.block .word{
    padding:20px;
}
.block .word{
    padding:20px;
}
.block .note{
    display:none;
}
.block:hover .word{
    font-size:22px;
}
.block:hover #word-btns{
    visibility: visible;
}

.block.backside {
    cursor: pointer;
}
.block.backside .word{
    visibility: hidden;
}
.block.backside .color-wraper{
    
    position: absolute;
    margin-top:20px;
    z-index:22;
}
.block.backside .note{
    color:#000;
    display: block;
    padding:20px;
    position: absolute;
    font-size:22px;
    box-shadow: 3px 3px #1d1b1b, -1em 0em 1em #000000;
    min-height: 100%;
    z-index: 99;
    background-color: antiquewhite;
}
.color-wraper{
    height:20px;
    width:20px;
    border-radius:10px;
    margin-right:10px;
    margin:auto 0;
}

.highlight_pink{
    background-color:#ff9aac;
}
.highlight_blue{
    
    background-color:#aeaeff;
}
.highlight_yellow{
    background-color:#e7e78a;
    
}
.highlight_orange{
    background-color:orange;
}


.highlight_pink:hover{
    background-color:#ecc2c9;
}
.highlight_blue:hover{
    
    background-color:#c9c9fa;;
}
.highlight_yellow:hover{
    background-color:#f7f798;
    
}
.highlight_orange:hover{
    background-color:#fcd388;
}
.link{
    cursor:pointer;
}
#menu-button{
    background-color:#00000038;
    color:#777  ;
    position:fixed;
    width:40px;
    height:40px;
    z-index:33;
    cursor:pointer;
    left:20px;
    display:none;
    justify-content: center;
    align-items: center;
    font-weight: bold;
    
}
#menu-button:hover{
    background: beige;
    color: #000;
    font-size: larger;
    font-weight: bolder;
}
.open{
    margin-left:0px !important;
}
.pure-menu-item{
    color:aquamarine;
}
.pure-menu-item:hover{
    color:#111;
}
.pure-menu-item.selected{
    background: #7b0d0d;
    color: #ccc;
}
#word-btns{
    display: flex;
    flex-direction: column;   
    justify-content: space-around;
    margin: auto;
    visibility: hidden;
    position: absolute;
    right: 0;
    /*padding-top: 20px;*/
    cursor:pointer;
    height:100%;
    
}
#word-btns-row1,#word-btns-row2{
    display: flex;
    flex-direction: row; 
    height:50%;
    background-color:#009553;
    justify-content: center;
    align-items: center;
}
#word-turnover{
    width: 50%;
    height: 100%;
    background-color:#666;
    color:#fff;
    display: flex;
    justify-content: center;
    align-items: center;
}
#word-mark{
    width: 50%;
    height: 100%;
    background-color:#333;
    color:#fff;
    display: flex;
    justify-content: center;
    align-items: center;
    font-size:22px;
}
#word-mark.add{
    background-color:#29bca6;
}
#word-mark.remove{
    background-color:#3b504d;
    color:#fff;
    
}
#word-query:hover,#word-copy:hover{
    font-weight:bolder;

}
#word-query{
    background: #950000;
    color: #eedcdc;
    width: 50%;
    height: 100%;
    display: flex;
    justify-content: center;
    align-items: center;
}
#word-copy{
    background: #4a9500;
    color: #380046;
    width: 50%;
    height: 100%;
    display: flex;
    justify-content: center;
    align-items: center;
}
#back-editor{
    position:absolute;
    top:0;
    right:0;
    padding:10px;
    background-color:#2b0008;
    color:#fff;
    font-size:16px;
}
#back-editor:hover{
    background-color:#5b0008;
}
#floatmenu{
    position:absolute;
    z-index:99;
    left:40%;
}

@media (max-width: 800px) {
    #menu-button{
        display: flex;
    }

}
`