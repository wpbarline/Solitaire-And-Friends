import {preferences} from './preferences.js';
// Optional, short feedback; silently ignored on unsupported devices.
export function haptic(kind='move'){
  if(!preferences.haptics||document.hidden||!navigator.vibrate)return;
  try{navigator.vibrate(kind==='win'?[25,50,25]:kind==='invalid'?12:8);}catch{}
}
