// Shared by Solitaire, Uno and future games. No card artwork is modified.
const KEY = 'solitaire-friends-settings-v1';
const defaults = {deckOnRight:true, effects:true, effectsVolume:.65, music:true, musicVolume:.2, reducedMotion:false, haptics:false};
let stored;
try { stored=JSON.parse(localStorage.getItem(KEY)); } catch {}
export const preferences = {...defaults, ...stored};
export function setPreference(key, value){
  if(!(key in defaults)) return;
  preferences[key] = typeof defaults[key]==='boolean' ? !!value : Math.max(0,Math.min(1,Number(value)||0));
  try { localStorage.setItem(KEY, JSON.stringify(preferences)); } catch {}
  apply();
  window.dispatchEvent(new CustomEvent('game-settings', {detail:{...preferences}}));
}
function apply(){ document.documentElement.classList.toggle('reduce-motion',preferences.reducedMotion); }
apply();
