let stats={played:0,wins:0,bestMoves:null,bestTime:null,highScores:[]};
try{stats={...stats,...JSON.parse(localStorage.getItem('solitaire-friends-stats-v1'))};}catch{}
const time=s=>Math.floor(s/60)+':'+String(s%60).padStart(2,'0');
const totals=[['Games started',stats.played],['Wins',stats.wins],['Win rate',stats.played?Math.round(stats.wins/stats.played*100)+'%':'—'],['Fewest moves',stats.bestMoves??'—'],['Fastest win',stats.bestTime===null?'—':time(stats.bestTime)]];
for(const [label,value]of totals){const box=document.createElement('div');box.className='stat';const strong=document.createElement('strong');strong.textContent=value;box.append(strong,document.createTextNode(label));document.getElementById('totals').appendChild(box);}
function render(){
  const filter=document.getElementById('filter').value;
  const scores=(Array.isArray(stats.highScores)?stats.highScores:[]).filter(s=>filter==='all'||String(s.draw)===filter);
  const body=document.getElementById('scoreRows');body.replaceChildren();
  for(const score of scores){const tr=document.createElement('tr');for(const value of [score.score,score.moves,time(score.seconds),'Draw '+score.draw+' · '+score.kind+(score.assisted?' ★':''),new Date(score.date).toLocaleDateString()]){const td=document.createElement('td');td.textContent=value;tr.appendChild(td);}body.appendChild(tr);}
  document.getElementById('empty').textContent=scores.length?'':'Your first win will appear here. Take your time and enjoy the game!';
}
document.getElementById('filter').onchange=render;render();
document.getElementById('exportStats').onclick=()=>{const u=URL.createObjectURL(new Blob([JSON.stringify(stats,null,2)],{type:'application/json'}));const a=document.createElement('a');a.href=u;a.download='solitaire-statistics.json';a.click();setTimeout(()=>URL.revokeObjectURL(u),2000);document.getElementById('exportStatus').textContent='Statistics copy saved.';};
