export async function shareGame(score){
  const url=new URL('../../',import.meta.url).href;
  const text=score?`I won Solitaire and Friends! ${score.score} points, ${score.moves} moves, Draw ${score.draw}. Come play with me.`:'A little good company: play Solitaire and Friends with hints, beautiful cards, and no ads.';
  try{
    if(navigator.share){await navigator.share({title:'Solitaire and Friends',text,url});return 'Shared!';}
    if(navigator.clipboard?.writeText){await navigator.clipboard.writeText(text+' '+url);return 'Link copied. Paste it into a message.';}
  }catch(e){if(e.name==='AbortError')return '';}
  prompt('Copy this to share:',text+' '+url);return '';
}
document.querySelectorAll('[data-share-game]').forEach(button=>button.addEventListener('click',async()=>{
  let score;
  if(button.dataset.shareGame==='score'){try{const stats=JSON.parse(localStorage.getItem('solitaire-friends-stats-v1'));score=stats?.highScores?.[0];}catch{}}
  const result=await shareGame(score);const status=document.getElementById('shareStatus');if(status)status.textContent=result;
}));
