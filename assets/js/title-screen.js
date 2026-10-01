import sfx from './sfx.js';
const tiles=[...document.querySelectorAll('.tile')];let page=0;const count=Math.ceil(tiles.length/4);
function show(){tiles.forEach((tile,i)=>tile.hidden=Math.floor(i/4)!==page);document.getElementById('gamePage').textContent=(page+1)+' / '+count;document.getElementById('previousGames').disabled=page===0;document.getElementById('nextGames').disabled=page===count-1;}
document.getElementById('previousGames').onclick=()=>{page=Math.max(0,page-1);show();sfx.flip();};
document.getElementById('nextGames').onclick=()=>{page=Math.min(count-1,page+1);show();sfx.flip();};
document.querySelector('.primary-play').textContent=localStorage.getItem('solitaire-friends-game-v1')?'▶ Continue Solitaire':'▶ Play Solitaire';show();
