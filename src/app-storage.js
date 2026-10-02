const appKey=key=>key.startsWith('solitaire-friends-')||key==='arline-deck-prefs';
export async function checkForUpdates(){
 if(!navigator.onLine)throw new Error('Connect to the internet to check for updates.');
 const registration=await navigator.serviceWorker?.getRegistration();
 if(!registration)throw new Error('Automatic updates are starting. Try again in a moment.');
 await registration.update();
 return registration.installing||registration.waiting?'Downloading an update. It will apply when the game is idle.':'The app is up to date.';
}
export async function clearAppCache(){
 if(!navigator.onLine)throw new Error('Connect to the internet before refreshing the app.');
 const probe=new URL(import.meta.env.BASE_URL,location.origin);probe.search='storage-refresh='+Date.now();
 const response=await fetch(probe,{cache:'no-store'});
 if(!response.ok)throw new Error('The app could not reach the internet. Your cache was kept.');
 window.__sol?.save();
 if('caches' in window){const names=await caches.keys();await Promise.all(names.filter(name=>name.startsWith('solitaire-friends-')).map(name=>caches.delete(name)));}
 window.__gameApplyingUpdate=true;
 sessionStorage.setItem('solitaire-friends-auto-update','yes');
 location.reload();
}
export function eraseSavedData(){
 // Prevent the departing board's pagehide/cleanup handlers from restoring a save.
 window.__gameErasingData=true;window.__gameApplyingUpdate=true;
 for(const storage of [localStorage,sessionStorage]){const keys=Array.from({length:storage.length},(_,i)=>storage.key(i));for(const key of keys)if(key&&appKey(key))storage.removeItem(key);}
 location.replace(new URL(import.meta.env.BASE_URL,location.origin));
}
