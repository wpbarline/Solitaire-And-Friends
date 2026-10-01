import assert from 'node:assert/strict';
import {validRun, acceptsTableau, acceptsFoundation, safeFoundation, hints, validSnapshot} from '../games/solitaire/rules.js';
import {seededRandom,shuffled,dailySeed} from '../assets/js/game-primitives.js';
const card=(suit,rank,up=true)=>({id:suit*13+rank-1,suit,rank,color:[1,2].includes(suit)?'red':'black',up});
assert.ok(validRun([card(0,8),card(1,7),card(3,6)]));
assert.equal(validRun([card(0,8),card(3,7)]),false);
assert.equal(validRun([card(0,8,false)]),false);
assert.ok(acceptsTableau(card(1,7),[card(0,8)]));
assert.equal(acceptsTableau(card(1,7),[]),false);
assert.ok(acceptsTableau(card(0,13),[]));
assert.ok(acceptsFoundation(card(1,1),[]));
assert.equal(acceptsFoundation(card(0,3),[card(1,1),card(1,2)]),false);
const foundations=[[],[card(1,1),card(1,2)],[card(2,1),card(2,2)],[]];
assert.ok(safeFoundation(card(0,3),foundations),'Spades require both red foundations, not suit parity');
foundations[2].pop();assert.equal(safeFoundation(card(0,3),foundations),false);
const table=Array.from({length:7},()=>[]);table[0]=[card(3,4,false),card(0,8)];table[1]=[card(1,9)];
const moves=hints({stock:[],waste:[card(0,1)],foundations:Array.from({length:4},()=>[]),tableau:table});
assert.equal(moves[0].card,card(0,8).id,'Revealing a hidden card has priority');
assert.ok(moves.every(m=>m.card!==card(3,4).id),'Hints do not inspect hidden identities');
const items=Array.from({length:52},(_,id)=>id);
for(let seed=0;seed<100;seed++){
 const a=shuffled(items,seededRandom(seed)),b=shuffled(items,seededRandom(seed));
 assert.deepEqual(a,b);assert.equal(new Set(a).size,52);assert.deepEqual(items,Array.from({length:52},(_,id)=>id));
}
assert.equal(dailySeed(new Date(2026,9,1,9)),dailySeed(new Date(2026,9,1,20)));
const s={stock:items.map(id=>({id,up:false})),waste:[],tableau:Array.from({length:7},()=>[]),foundations:Array.from({length:4},()=>[]),moves:0};
assert.ok(validSnapshot(s));s.stock[1].id=0;assert.equal(validSnapshot(s),false);
console.log('PASS: legal runs/destinations, safe foundations, visible hints, seed repeatability, invalid saved-state rejection.');
