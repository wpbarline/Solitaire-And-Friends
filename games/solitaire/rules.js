// Visible-information hints. Legal does not mean guaranteed to win.
export function validRun(run){
  return run.length>0 && run.every((c,i)=>c.up && (!i || (run[i-1].rank===c.rank+1 && run[i-1].color!==c.color)));
}
export function acceptsTableau(card,pile){
  const top=pile.at(-1);
  return top ? top.up && top.color!==card.color && top.rank===card.rank+1 : card.rank===13;
}
export function acceptsFoundation(card,pile){ return card.rank===pile.length+1 && (!pile.length || pile.at(-1).suit===card.suit); }
export function safeFoundation(card,foundations){
  const color=suit=>suit===1||suit===2?'red':'black';
  return card.rank<=2 || foundations.every((pile,suit)=> color(suit)===color(card.suit) || pile.length>=card.rank-1);
}
export function hints({waste,tableau,foundations,stock}){
  const options=[];
  const add=(card,run,from,exposes)=>{
    if(run.length===1 && acceptsFoundation(card,foundations[card.suit])) options.push({card:card.id,from,to:'f'+card.suit,score:exposes?110:safeFoundation(card,foundations)?90:10,kind:'foundation'});
    tableau.forEach((pile,col)=>{
      if(from.type==='tableau' && col===from.col) return;
      // Moving a whole king column between empty spaces does not advance play.
      if(!pile.length && from.type==='tableau' && from.idx===0) return;
      if(acceptsTableau(card,pile)) options.push({card:card.id,from,to:'t'+col,score:exposes?120:from.type==='waste'?80:40,kind:'tableau'});
    });
  };
  if(waste.length) add(waste.at(-1),[waste.at(-1)],{type:'waste'},false);
  tableau.forEach((pile,col)=>pile.forEach((card,idx)=>{
    const run=pile.slice(idx); if(validRun(run)) add(card,run,{type:'tableau',col,idx},idx>0&&!pile[idx-1].up);
  }));
  options.sort((a,b)=>b.score-a.score);
  foundations.forEach((pile,col)=>{
    const card=pile.at(-1);if(!card)return;
    tableau.forEach((target,c)=>{if(target.length&&acceptsTableau(card,target))options.push({card:card.id,from:{type:'foundation',col},to:'t'+c,score:0,kind:'tableau'});});
  });
  if(stock.length || waste.length) options.push({kind:'stock',to:'stock'});
  return options;
}
export function validSnapshot(s){
  if(!s || !Array.isArray(s.stock)||!Array.isArray(s.waste)||s.foundations?.length!==4||s.tableau?.length!==7||!Number.isInteger(s.moves)||s.moves<0) return false;
  const piles=[s.stock,s.waste,...s.foundations,...s.tableau];
  if(!piles.every(Array.isArray)) return false;
  const all=piles.flat();
  if(all.length!==52 || !all.every(c=>Number.isInteger(c.id)&&c.id>=0&&c.id<52&&typeof c.up==='boolean')||new Set(all.map(c=>c.id)).size!==52) return false;
  if(s.stock.some(c=>c.up)||s.waste.some(c=>!c.up)) return false;
  if(!s.foundations.every((p,suit)=>p.every((c,i)=>c.up&&Math.floor(c.id/13)===suit&&c.id%13===i)))return false;
  return s.tableau.every(p=>{let seen=false;return p.every(c=>{if(c.up)seen=true;return c.up||!seen;});});
}
