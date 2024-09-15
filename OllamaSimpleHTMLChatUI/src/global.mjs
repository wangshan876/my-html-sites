import { $chatwindow } from "./global-dom.mjs";
let reciver_height = 0

export const resizeObserver = new ResizeObserver(entries => {
    for (let entry of entries) {
        const { height } = entry.contentRect;
      if(height > 20){
        $chatwindow.scrollTo(0,$chatwindow.offsetHeight)
      }
    }
});

function createResizeObserver(elem){

}
