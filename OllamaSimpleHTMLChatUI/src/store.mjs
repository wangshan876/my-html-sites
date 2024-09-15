import { get, set } from '../libs/idb-keyval.mjs';

export async function setSubjects(id,data) {
  let subjects = await getSubjects()
  if(!subjects) subjects = {}
  subjects[id] = data

  await set('ollama-subjects', subjects);
}
export async function getSubjects(id=null) {
  const subjects = await get('ollama-subjects');
  if(!subjects) return false
  if(id && subjects[id]) return subjects[id] ;
  
  return subjects;
}
