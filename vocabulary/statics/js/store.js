import { get, set } from './idb-keyval.js';

export async function setRoots(url,data) {
  let roots = await getRoots()
  if(!roots) roots = {}
  roots[url] = data

  await set('word-roots', roots);
}
export async function getRoots(url=null) {
  const roots = await get('word-roots');
  if(!roots) return false
  if(url) return roots[url] ;
  
  return roots;
}


export async function setDicts(name,data) {
  let dicts = await get('word-dicts');
  
  if(!dicts) dicts = {}
  dicts[name] = data

  await set('word-dicts', dicts);
}
export async function getDicts() {
	return await get('word-dicts');

}


export async function setDictList(name) {
  let list = await get('word-dict-list');
  
  if(!list) list = []
  list.push(name)

  await set('word-dict-list', list);
}
export async function getDictList(dictname=null) {

  return await get('word-dict-list');
  

}