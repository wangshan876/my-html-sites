import {getDicts,setDicts,getDictList,setDictList} from "./store.js"

export  function fetchzip(url="../../res/mydicts.zip",safefilename="mydicts.json"){
	return fetch(url)
    .then(function (response) {
        if (response.status === 200 || response.status === 0) {
            return Promise.resolve(response.blob());
        } else {
            return Promise.reject(new Error(response.statusText));
        }
    })
    .then(JSZip.loadAsync) 
    .then(function (zip) {
        return zip.file(safefilename).async("string");
    })
    .then(function success(text) { 
		return text
    }, function error(e) {
		console.error(e)
    });
}

export  async function fetchDict(force=false){
	const urls = ["../../res/mydicts.zip","../../res/lanchong-oxford.zip"]
	const safefilenames = ["mydicts.json","lanchong-oxford.json"]
	for (let index = 0; index < urls.length; index++) {
		const url = urls[index];
		const dictnmae = url.match(/[^\/]+.zip/)[0].replace(".zip","")
		let dict  = await getDicts(dictnmae)
		if(!dict || !dict[dictnmae] || force){
			dict = await fetchzip(url,safefilenames[index])
			await setDictList(dictnmae)
			await setDicts(dictnmae,JSON.parse(dict))
		}
	}

}