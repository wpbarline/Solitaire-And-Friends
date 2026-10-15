import {preferences} from './preferences.js';
// Optional, short feedback; silently ignored on unsupported devices.
export function haptic(kind='move'){
  if(!preferences.haptics||document.hidden||!navigator.vibrate)return;
  const now=performance.now(),priority=kind==='win'?3:['foundation','reverse','shuffle'].includes(kind)?2:kind==='reveal'?1:0;
  if(now-lastPulse<90&&priority<=lastPriority)return;lastPulse=now;lastPriority=priority;
  try{navigator.vibrate(patterns[kind]||8);}catch{}
}
const patterns={deal:5,reveal:6,foundation:[10,30,6],reverse:[8,30,8],shuffle:[8,30,8,30,8],win:[18,40,12,50,24],invalid:12};
let lastPulse=-Infinity,lastPriority=0;
export function cancelHaptics(){try{navigator.vibrate?.(0);}catch{}}
document.addEventListener('visibilitychange',()=>{if(document.hidden)cancelHaptics();});
addEventListener('game-settings',()=>{if(!preferences.haptics)cancelHaptics();});
