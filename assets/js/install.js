let installPrompt;
const button=document.getElementById('installGame'),status=document.getElementById('installStatus');
const standalone=matchMedia('(display-mode: standalone)').matches||navigator.standalone;
if(button&&standalone)button.hidden=true;
addEventListener('beforeinstallprompt',e=>{e.preventDefault();installPrompt=e;});
addEventListener('appinstalled',()=>{if(button)button.hidden=true;if(status)status.textContent='Installed. Find Solitaire and Friends on your home screen.';});
button?.addEventListener('click',async()=>{
  if(installPrompt){await installPrompt.prompt();await installPrompt.userChoice;installPrompt=null;}
  else if(status)status.textContent=/iPad|iPhone/.test(navigator.userAgent)?'In Safari, choose Share, then Add to Home Screen.':'In Chrome or Edge, open the browser menu and choose Install app or Add to Home screen.';
});
