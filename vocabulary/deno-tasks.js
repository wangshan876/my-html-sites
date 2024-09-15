// import { walk } from "https://deno.land/std@0.179.0/fs/walk.ts";

async function read_dir(path){
    let files = []
    for await (const dirEntry of Deno.readDir(path)) {
        files.push(dirEntry.name)
    }
    return files;
}
async function generate_roots_maps(){
    const Root_paths ="./res/VocabularyMap/Root" 
    const Imagine_paths ="./res/VocabularyMap/Imagine" 
    const Custom_paths ="./res/VocabularyMap/Custom" 
    const root_map_file ="./res/VocabularyMap/map.js" 

    let Root = await read_dir(Root_paths)
    let Imagine = await read_dir(Imagine_paths)
    let Custom = await read_dir(Custom_paths)
    let data = {
        Root,Imagine,Custom
    }
    const encoder = new TextEncoder();
    data = encoder.encode("export let rootsMap = " +JSON.stringify(data));
    await Deno.writeFile(root_map_file, data);
}

function tasks(){
    generate_roots_maps()
}

tasks()