import {preferences,setPreference} from '../../assets/js/preferences.js';
const menu=document.getElementById('gameMenu');
document.getElementById('openMenu').onclick=()=>menu.showModal();
document.getElementById('closeMenu').onclick=()=>menu.close();
menu.addEventListener('click',e=>{if(e.target===menu)menu.close();});
menu.querySelectorAll('#newGame,#restartBtn,#dailyBtn,#autoBtn,#shuffleBtn').forEach(button=>button.addEventListener('click',()=>menu.close()));
document.getElementById('drawMode').addEventListener('change',()=>menu.close());
document.addEventListener('click',e=>{if(e.target.closest('#menuSettings')&&menu.open)menu.close();},true);

const side=document.getElementById('deckSide');side.value=preferences.deckOnRight?'right':'left';side.addEventListener('change',()=>{setPreference('deckOnRight',side.value==='right');menu.close();});
