

window.frame = document.querySelector('#frame_wrapper')
window.dict_frame = document.querySelector('#external_dict')
isMobie && (dict_frame.height = "50%")
document.querySelector('#frame_closer').addEventListener('click',function(e){
    frame.classList.remove('dict_show')
})

