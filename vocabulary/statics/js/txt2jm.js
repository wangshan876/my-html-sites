
export function createTree(lines, depth) {
    const tree = {};
    for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        const lineDepth = line.split('\t').length - 1;
        update(tree,lineDepth,line.replaceAll(/[(\t)(\r)]/g,""))
    }

    return tree.children&& tree.children[0] ;
  }

function update(data,depth,value){
    var k = data;
        for (let i = 0; i < depth; i++) {
            (k["extends"] = k["extends"] || true) && (k["children"] = k["children"] || []) && (k = k["children"]);
            if(k.length == 0) {
                k.push({id:value,topic:value})
                return data
            } else {
                k = k[k.length-1]
            }
        }
        if(!k.children) k.children = [{id:value,topic:value}]
        else k.children.push({id:value,topic:value})
    return data
}


