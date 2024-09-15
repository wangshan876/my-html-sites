import {setRoots,getRoots} from "./store.js"
import { createTree } from "./txt2jm.js"

const base = "../../res/VocabularyMap/"
export async function FetchRoot(file){
    if(!file) return;
    const fullurl = encodeURI(base + file)

    let data = await getRoots(fullurl)
    if(!data) {
        var header = new Headers();
        header.append('Content-Type','text/plain; charset=UTF-8');

        data = await (fetch(fullurl,header)
                    .then(response=>{
                        if(200 == response.status){
                            return response.text()
                        } else {
                            return false
                        }
                    })
                   .catch(error=>false))
        if(data){
            let nodes = data.split("\n")
            let tree = createTree(nodes,0)
            data = {"meta":{},"format":"node_tree","data":tree}
            await setRoots(fullurl,data)
        } else {
            data = {"meta":{},"format":"node_tree","data":{id:"root",topic:"文件读取错误！"}}
        }
    }
    return data;
}

