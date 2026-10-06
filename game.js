const $=s=>document.querySelector(s),$$=s=>[...document.querySelectorAll(s)];
const pages={dashboard:"Dashboard",truth:"Truth Tables",equivalence:"Equivalence",inference:"Inference Rules",proof:"Proof Assistant",challenges:"Challenge Mode"};
const KEY="logicmaster-progress",DEF={xp:0,completed:0,streak:0,lastVisit:null,answered:false,best:0};
let progress;try{progress={...DEF,...JSON.parse(localStorage.getItem(KEY))}}catch{progress={...DEF}}
const save=()=>{try{localStorage.setItem(KEY,JSON.stringify(progress))}catch{}};
function updateStreak(){const d=x=>x.toLocaleDateString("en-CA"),t=d(new Date());if(progress.lastVisit==t)return;const y=new Date();y.setDate(y.getDate()-1);progress.streak=progress.lastVisit==d(y)?progress.streak+1:1;progress.lastVisit=t;save()}
const LV=[[0,"Explorer"],[100,"Logic Solver"],[250,"Reasoning Pro"],[500,"Proof Master"],[1000,"Logic Legend"]];
function getLevel(xp){const i=LV.filter(l=>xp>=l[0]).length-1,n=LV[i+1];return{level:i+1,name:LV[i][1],next:n&&n[0],pct:n?(xp-LV[i][0])/(n[0]-LV[i][0]):1}}
function renderProgress(){const l=getLevel(progress.xp),p=progress;
$("#xp").textContent=p.xp+" XP";$("#streak").textContent=p.streak;$("#dashXP").textContent=p.xp;$("#dashStreak").textContent=p.streak+" days";$("#completed").textContent=p.completed;
$("#dashLevel").textContent="Level "+l.level;$("#sideLevel").textContent=l.level;$("#sideName").textContent=l.name;$("#bar").style.width=Math.round(l.pct*100)+"%";
$("#nextLevel").textContent=l.name+" · "+(l.next?l.next-p.xp+" XP to next milestone":"Max level reached");
$("#badges").innerHTML=[["First Step","✓",p.completed>=1],["Combo ×5","⚡",p.best>=5],["Solver","★",p.xp>=100],["Reasoning Pro","♜",p.xp>=250],["Week Streak","🔥",p.streak>=7],["Legend","👑",p.xp>=1000]].map(b=>`<span class="badge${b[2]?"":" lock"}">${b[1]} ${b[0]}</span>`).join("")}
function showPage(n){if(!pages[n])return;$$(".page").forEach(p=>p.classList.toggle("active",p.id==n));$$(".nav-item").forEach(b=>b.classList.toggle("active",b.dataset.page==n));$("#pageTitle").textContent=pages[n];scrollTo(0,0)}
$$("[data-page]").forEach(b=>b.addEventListener("click",e=>{e.preventDefault();showPage(b.dataset.page)}));
function awardXP(a){const l=getLevel(progress.xp).level;progress.xp+=a;progress.completed++;save();renderProgress();const n=getLevel(progress.xp);if(n.level>l){toast("🎉 Level up! "+n.name);burst($("#xp"))}}
function toast(t){const d=document.createElement("div");d.className="toast";d.textContent=t;document.body.appendChild(d);setTimeout(()=>d.remove(),2600)}
function shake(el){el.classList.remove("shake");void el.offsetWidth;el.classList.add("shake")}
function burst(el){const r=el.getBoundingClientRect(),x=r.left+r.width/2,y=r.top+Math.min(r.height,160)/2;for(let i=0;i<18;i++){const p=document.createElement("i"),a=Math.random()*6.28,d=60+Math.random()*90;p.className="pf";p.style.cssText=`left:${x}px;top:${y}px;background:${["#3fe8b8","#ffc66b","#ff8a78","#fff"][i%4]};--dx:${Math.cos(a)*d}px;--dy:${Math.sin(a)*d}px`;document.body.appendChild(p);setTimeout(()=>p.remove(),850)}}

/* ---- logic engine ---- */
const norm=s=>s.replace(/<->|<=>|↔/g,"↔").replace(/->|=>|→/g,"→").replace(/[!~¬]/g,"¬").replace(/&&|&|∧|\^/g,"∧").replace(/\|\||\||∨/g,"∨");
function parse(src){const t=[...norm(src)].filter(c=>!/\s/.test(c));let i=0;
const bad=c=>{throw Error(c?`Unexpected "${c}"`:"The expression ended unexpectedly")};
const bi=()=>{let a=imp();while(t[i]=="↔"){i++;a={o:"↔",a,b:imp()}}return a};
const imp=()=>{const a=or();if(t[i]=="→"){i++;return{o:"→",a,b:imp()}}return a};
const or=()=>{let a=and();while(t[i]=="∨"){i++;a={o:"∨",a,b:and()}}return a};
const and=()=>{let a=un();while(t[i]=="∧"){i++;a={o:"∧",a,b:un()}}return a};
const un=()=>{const c=t[i++];if(c=="¬")return{o:"¬",a:un()};if(c=="("){const e=bi();if(t[i++]!=")")bad(t[i-1]);return e}if(/^[A-Za-z]$/.test(c))return{o:"v",n:c.toUpperCase()};bad(c)};
const r=bi();if(i<t.length)bad(t[i]);return r}
const ev=(n,e)=>n.o=="v"?e[n.n]:n.o=="¬"?!ev(n.a,e):n.o=="∧"?ev(n.a,e)&&ev(n.b,e):n.o=="∨"?ev(n.a,e)||ev(n.b,e):n.o=="→"?!ev(n.a,e)||ev(n.b,e):ev(n.a,e)==ev(n.b,e);
const str=(n,top=1)=>{if(n.o=="v")return n.n;if(n.o=="¬")return"¬"+str(n.a,0);const s=str(n.a,0)+" "+n.o+" "+str(n.b,0);return top?s:"("+s+")"};
const vars=(...ns)=>{const s=new Set,w=n=>n.o=="v"?s.add(n.n):(w(n.a),n.b&&w(n.b));ns.forEach(w);return[...s].sort()};
function rows(vs){if(vs.length>6)throw Error("Please use at most 6 variables.");return Array.from({length:1<<vs.length},(_,k)=>Object.fromEntries(vs.map((v,j)=>[v,!(k&(1<<(vs.length-1-j)))])))}
function subs(n,o=[]){if(n.o=="v")return o;subs(n.a,o);n.b&&subs(n.b,o);if(!o.some(x=>str(x)==str(n)))o.push(n);return o}
const tf=b=>`<td class="${b?"t":"f"}">${b?"T":"F"}</td>`;
const table=(vs,cols,rs)=>`<table><tr>${vs.map(v=>`<th>${v}</th>`).join("")}${cols.map((c,i)=>`<th${i==cols.length-1?' class="fin"':""}>${str(c)}</th>`).join("")}</tr>${rs.map(r=>`<tr>${vs.map(v=>tf(r[v])).join("")}${cols.map(c=>tf(ev(c,r))).join("")}</tr>`).join("")}</table>`;
const card=(c,h,b)=>`<div class="result-card ${c}"><h3>${h}</h3>${b}</div>`;
const valid=(ps,c)=>{const P=ps.map(parse),C=parse(c);return rows(vars(C,...P)).every(r=>!P.every(p=>ev(p,r))||ev(C,r))};

const RULES=[["Modus Ponens","P→Q,P","Q"],["Modus Tollens","P→Q,¬Q","¬P"],["Hypothetical Syllogism","P→Q,Q→R","P→R"],["Disjunctive Syllogism","P∨Q,¬P","Q"],["Disjunctive Syllogism","P∨Q,¬Q","P"],["Conjunction","P,Q","P∧Q"],["Simplification","P∧Q","P"],["Simplification","P∧Q","Q"],["Addition","P","P∨Q"],["Double Negation","¬¬P","P"]];
const NAMES=[...new Set(RULES.map(r=>r[0]))];
function match(p,n,b){if(p.o=="v"){const k=str(n);if(b[p.n]!==undefined)return b[p.n]==k;b[p.n]=k;return true}return p.o==n.o&&match(p.a,n.a,b)&&(!p.b||match(p.b,n.b,b))}
function rule(prems,c){for(const[name,ps,cs]of RULES){const pp=ps.split(",").map(parse);if(pp.length!=prems.length)continue;
for(const ord of[prems,[...prems].reverse()]){const b={};if(pp.every((p,i)=>match(p,ord[i],b))&&match(parse(cs),c,b))return name}}}

const neg=n=>n.o=="¬"?n.a:{o:"¬",a:n};
function derive(prems,goal){const F=[],seen={},g=n=>seen[str(n)];
const add=(n,why,from=[])=>{const k=str(n);if(seen[k]!==undefined||F.length>80)return;seen[k]=F.length;F.push({n,why,from})};
prems.forEach(p=>add(p,"Premise"));
for(let ch=1,it=0;ch&&it<8;it++){const L=F.length;
for(let i=0;i<F.length;i++){const x=F[i].n,I=[i];
if(x.o=="∧"){add(x.a,"Simplification",I);add(x.b,"Simplification",I)}
if(x.o=="¬"&&x.a.o=="¬")add(x.a.a,"Double Negation",I);
if(x.o=="↔"){add({o:"→",a:x.a,b:x.b},"Biconditional elim.",I);add({o:"→",a:x.b,b:x.a},"Biconditional elim.",I)}
if(x.o=="→"){let j=g(x.a);if(j>=0)add(x.b,"Modus Ponens",[i,j]);j=g(neg(x.b));if(j>=0)add(neg(x.a),"Modus Tollens",[i,j]);
for(let k=0;k<F.length;k++){const y=F[k].n;if(y.o=="→"&&str(y.a)==str(x.b)&&str(y.b)!=str(x.a))add({o:"→",a:x.a,b:y.b},"Hypothetical Syllogism",[i,k])}}
if(x.o=="∨"){let j=g(neg(x.a));if(j>=0)add(x.b,"Disjunctive Syllogism",[i,j]);j=g(neg(x.b));if(j>=0)add(x.a,"Disjunctive Syllogism",[i,j])}}
ch=F.length>L}
if(g(goal)===undefined){const a=goal.a,b=goal.b;
if(goal.o=="∧"&&g(a)>=0&&g(b)>=0)add(goal,"Conjunction",[g(a),g(b)]);
if(goal.o=="∨"){const j=g(a)>=0?g(a):g(b);if(j>=0)add(goal,"Addition",[j])}}
const t=g(goal);if(t===undefined)return null;
const need=new Set,w=i=>{need.add(i);F[i].from.forEach(w)};w(t);
const ids=[...need].sort((a,b)=>a-b),m=Object.fromEntries(ids.map((o,i)=>[o,i+1]));
return ids.map(o=>({s:str(F[o].n),why:F[o].why,from:F[o].from.map(f=>m[f])}))}

function wire(id,fn){$("#"+id+"Form").addEventListener("submit",e=>{e.preventDefault();const out=$("#"+id+"Result");try{out.innerHTML=fn()}catch(x){out.innerHTML=card("error","Check your input",x.message.replace(/[<>&]/g,""))}})}
wire("truth",()=>{const n=parse($("#truthExpression").value),vs=vars(n),rs=rows(vs),r=rs.map(x=>ev(n,x)),c=r.filter(Boolean).length,
k=c==r.length?["success","Tautology","true under every assignment"]:c?["","Contingency","true for some assignments and false for others"]:["error","Contradiction","false under every assignment"];
return card(k[0],k[1],`${str(n)} is ${k[2]} (${c} of ${r.length} rows true).`)+table(vs,subs(n),rs)});
wire("equivalence",()=>{const a=parse($("#expressionA").value),b=parse($("#expressionB").value),vs=vars(a,b),rs=rows(vs),d=rs.filter(r=>ev(a,r)!=ev(b,r));
return card(d.length?"error":"success",d.length?"Not equivalent":"Equivalent",d.length?`They differ in ${d.length} of ${rs.length} rows. Showing those rows:`:`${str(a)} and ${str(b)} agree on all ${rs.length} rows.`)+table(vs,[a,b],d.length?d:rs)});
wire("inference",()=>{const ps=[$("#premiseA").value,$("#premiseB").value].filter(s=>s.trim()).map(parse),c=parse($("#conclusion").value),vs=vars(c,...ps),rs=rows(vs),
bad=rs.filter(r=>ps.every(p=>ev(p,r))&&!ev(c,r)),nm=!bad.length&&rule(ps,c);
return card(bad.length?"error":"success",bad.length?"Invalid inference":"Valid inference",(bad.length?"These assignments make every premise true but the conclusion false:":`In every row where the premises hold, ${str(c)} holds too.`)+(nm?` Matches <b>${nm}</b>.`:""))+table(vs,[...ps,c],bad.length?bad:rs)});
wire("proof",()=>{const ps=$("#proofPremises").value.split("\n").filter(s=>s.trim()).map(parse),goal=parse($("#proofGoal").value),st=derive(ps,goal);
if(st)return card("success","Proof found",`Derived ${str(goal)} in ${st.length} steps.`)+`<div class="steps">${st.map((x,i)=>`<div class="step"><b>${i+1}</b><code>${x.s}</code><em>${x.why}${x.from.length?" ("+x.from.join(", ")+")":""}</em></div>`).join("")}</div>`;
const vs=vars(goal,...ps),bad=rows(vs).find(r=>ps.every(p=>ev(p,r))&&!ev(goal,r));
return bad?card("error","Goal does not follow","Counterexample: "+vs.map(v=>`${v}=${bad[v]?"T":"F"}`).join(", ")+" makes every premise true and the goal false."):card("","Valid, but beyond my rules","The goal does follow logically, but it needs a technique this assistant lacks (like conditional proof).")});

/* ---- example chips ---- */
const F={truth:["truthExpression"],equivalence:["expressionA","expressionB"],inference:["premiseA","premiseB","conclusion"],proof:["proofPremises","proofGoal"]};
const EX={truth:[["(P -> Q) & P"],["P | !P"],["(P & Q) -> P"]],equivalence:[["P -> Q","!P | Q"],["!(P & Q)","!P | !Q"],["P <-> Q","(P -> Q) & (Q -> P)"]],inference:[["P -> Q","P","Q"],["P -> Q","!Q","!P"],["P | Q","!P","Q"],["P -> Q","Q","P"]],proof:[["P -> Q\nQ -> R\nP","R"],["P | Q\n!P","Q"],["(P & Q) -> R\nP\nQ","R"]]};
Object.keys(EX).forEach(k=>{const f=$("#"+k+"Form");f.insertAdjacentHTML("beforebegin",`<div class="chips">${EX[k].map((v,i)=>`<button type="button" class="chip" data-i="${i}">${norm(v.join(" ⊢ ").replace(/\n/g,", "))}</button>`).join("")}</div>`);
f.previousElementSibling.onclick=e=>{const c=e.target.closest(".chip");if(!c)return;F[k].forEach((id,j)=>$("#"+id).value=EX[k][c.dataset.i][j]||"");f.requestSubmit()}});

/* ---- challenge mode ---- */
const POOL={truth:["P ∨ ¬P","P ∧ ¬P","(P → Q) ∧ P","(P → Q) ∨ (Q → P)","P → (Q → P)","(P ∧ Q) → P","P ↔ ¬P","¬(P ∧ Q) ↔ (¬P ∨ ¬Q)","(P → Q) ∧ (P ∧ ¬Q)","(P ∧ Q) ∨ R","(P → Q) → (¬Q → ¬P)","(P ∨ Q) ∧ ¬P ∧ ¬Q","(P → Q) ↔ (P ∧ ¬Q)","(P ∨ Q) → (Q ∨ P)"],
inf:[[["P → Q","P"],["Q","¬Q","¬P","P ∧ ¬Q"]],[["P → Q","¬Q"],["¬P","P","Q","¬P ∧ Q"]],[["P ∨ Q","¬P"],["Q","P","¬Q","P ∧ Q"]],[["P ∧ Q"],["P","¬Q","¬P ∧ Q","P → ¬Q"]],[["P → Q","Q → R"],["P → R","R → P","Q → P","¬R → P"]],[["¬(P ∧ Q)"],["¬P ∨ ¬Q","¬P ∧ ¬Q","¬P","¬Q"]],[["P ↔ Q","P"],["Q","¬Q","¬P","P → ¬Q"]]],
rule:[[["P → Q","P"],"Q"],[["R → S","¬S"],"¬R"],[["P → Q","Q → R"],"P → R"],[["A ∨ B","¬A"],"B"],[["P","Q"],"P ∧ Q"],[["P ∧ Q"],"Q"],[["P"],"P ∨ R"],[["¬¬P"],"P"],[["(P ∧ Q) → R","P ∧ Q"],"R"]]};
const TITLES={truth:"TRUTH TABLE PRACTICE",inference:"INFERENCE CHALLENGE",proof:"RULE SPOTTING",table:"TABLE BUILDER",speed:"SPEED ROUND",switch:"SWITCH PUZZLE",boss:"BOSS BATTLE",fall:"FALLING FORMULAS"};
const pick=a=>a[Math.floor(Math.random()*a.length)],shuffle=a=>[...a].sort(()=>Math.random()-.5);
const mk={
truth(){const f=pick(POOL.truth),r=rows(vars(parse(f))).map(x=>ev(parse(f),x)),c=r.filter(Boolean).length,a=c==r.length?"Tautology":c?"Contingency":"Contradiction";return{q:`Classify <code>${f}</code>`,opts:["Tautology","Contradiction","Contingency"],a,why:`It is true in ${c} of ${r.length} rows.`}},
inference(){const[ps,cs]=pick(POOL.inf.filter(([p,c])=>c.filter(x=>valid(p,x)).length==1)),a=cs.find(c=>valid(ps,c));return{q:`Premises: <code>${ps.join(" , ")}</code><br>Which conclusion must follow?`,opts:shuffle(cs),a,why:`Only ${a} holds in every row where the premises are true.`}},
proof(){const[ps,c]=pick(POOL.rule),a=rule(ps.map(parse),parse(c));return{q:`From <code>${ps.join(" , ")}</code> we conclude <code>${c}</code>. Which rule is this?`,opts:shuffle([a,...shuffle(NAMES.filter(n=>n!=a)).slice(0,3)]),a,why:`That pattern is ${a}.`}}};
let cur=null,combo=0;
const fb=(t,c)=>{$("#cfb").textContent=t;$("#cfb").style.color=c};
let timer=null,speed=null,tbl=null,fl=null,sw=null,boss=null,bossLv=0,swLv=0;const RND=()=>pick(["truth","inference","proof"]);
function ask(type){cur={...mk[type](),type};$("#ctype").textContent=speed?TITLES.speed:TITLES[type];$("#cq").innerHTML=cur.q;$("#copts").innerHTML=cur.opts.map(o=>`<button class="opt">${o}</button>`).join("");fb("","");$("#cnext").hidden=true;$("#cnext").textContent="Next question →";if(!speed)$("#cbox").scrollIntoView({behavior:"smooth",block:"nearest"})}
function start(type){clearInterval(timer);speed=tbl=fl=sw=boss=null;cur={type};$("#cbox").hidden=false;$("#hud").hidden=true;$("#ccheck").hidden=true;$("#ctable").innerHTML="";
if(type=="table")return tableGame();if(type=="switch")return switchGame();if(type=="boss")return bossGame();if(type=="fall")return fallGame();
if(type=="speed"){speed={t:60,lives:3,score:0};$("#hud").hidden=false;hud();timer=setInterval(tick,100);return ask(RND())}
ask(type)}
function hud(){$("#lives").textContent="♥".repeat(Math.max(0,speed.lives))||"✖";$("#score").textContent=speed.score+" pts";$("#tleft").textContent=Math.max(0,Math.ceil(speed.t))+"s";$("#tfill").style.width=Math.max(0,speed.t)/60*100+"%"}
function tick(){if(!speed)return;speed.t-=.1;hud();if(speed.t<=0)endSpeed()}
function endSpeed(){clearInterval(timer);const sc=speed.score,xp=Math.round(sc/2);speed=null;cur={type:"speed",done:1};$("#hud").hidden=true;
$("#cq").innerHTML=`Round over! You scored <b>${sc}</b> points.`;$("#copts").innerHTML="";fb(xp?`+${xp} XP earned`:"No XP this time. Try again!","var(--g)");
if(xp)awardXP(xp);else save();if(xp>=20)burst($("#cq"));$("#cnext").textContent="Play again →";$("#cnext").hidden=false}
function tableGame(){const f=pick(POOL.truth.filter(x=>vars(parse(x)).length<=3)),n=parse(f),vs=vars(n),rs=rows(vs);
tbl={ans:rs.map(r=>ev(n,r)),st:rs.map(()=>null),tries:0};cur={type:"table"};
$("#ctype").textContent=TITLES.table;$("#cq").innerHTML=`Fill in the result column for <code>${f}</code>. Click a cell to cycle ? → T → F.`;$("#copts").innerHTML="";
$("#ctable").innerHTML=`<table><tr>${vs.map(v=>`<th>${v}</th>`).join("")}<th class="fin">${str(n)}</th></tr>${rs.map((r,i)=>`<tr>${vs.map(v=>tf(r[v])).join("")}<td><button class="cell" data-i="${i}">?</button></td></tr>`).join("")}</table>`;
$("#ccheck").hidden=false;$("#cnext").hidden=true;fb("","");$("#cbox").scrollIntoView({behavior:"smooth",block:"nearest"})}
$$("[data-challenge]").forEach(b=>b.onclick=()=>start(b.dataset.challenge));
$("#cnext").onclick=()=>start(cur.type);
$("#copts").onclick=e=>{const b=e.target.closest(".opt");if(fl&&b)return fallPick(b.dataset.o);if(!b||cur.done)return;cur.done=1;const ok=b.textContent==cur.a;if(boss)return bossHit(b,ok);
$$("#copts .opt").forEach(x=>{x.disabled=true;if(x.textContent==cur.a)x.classList.add("ok")});
if(ok){combo++;progress.best=Math.max(progress.best,combo);burst(b);
if(speed){const p=10+Math.min(combo,5)*2;speed.score+=p;speed.t=Math.min(60,speed.t+2);hud();fb(`Correct! +${p} pts · combo ×${combo} · +2s`,"var(--g)")}
else{const xp=15+Math.min(combo-1,5)*3;awardXP(xp);fb(`Correct! +${xp} XP · combo ×${combo}. ${cur.why}`,"var(--g)")}}
else{b.classList.add("no");combo=0;shake($("#cbox"));
if(speed){speed.lives--;speed.t-=3;hud();fb(`Wrong! It was ${cur.a}. −3s`,"#d66a40")}else fb(`Not quite. The answer is ${cur.a}. ${cur.why}`,"#d66a40")}
if(speed)setTimeout(()=>{if(!speed)return;speed.lives<=0||speed.t<=0?endSpeed():ask(RND())},700);else $("#cnext").hidden=false};
$("#ctable").onclick=e=>{if(sw&&swClick(e))return;const b=e.target.closest(".cell");if(!b||!tbl||tbl.done)return;const i=+b.dataset.i,s=tbl.st[i]=tbl.st[i]===null?true:tbl.st[i]===true?false:null;b.textContent=s===null?"?":s?"T":"F";b.className="cell"+(s===null?"":s?" t":" f")};
$("#ccheck").onclick=()=>{if(!tbl||tbl.done)return;if(tbl.st.includes(null)){fb("Fill every cell first.","#d66a40");return}tbl.tries++;let bad=0;
$$("#ctable .cell").forEach((b,i)=>{const ok=tbl.st[i]===tbl.ans[i];b.classList.toggle("good",ok);b.classList.toggle("bad",!ok);bad+=!ok});
if(bad){combo=0;shake($("#cbox"));fb(`${bad} cell${bad>1?"s are":" is"} wrong (red). Fix and check again.`,"#d66a40")}
else{combo++;progress.best=Math.max(progress.best,combo);const xp=Math.max(5,25-(tbl.tries-1)*8);tbl.done=1;burst($("#ccheck"));awardXP(xp);fb(`Perfect! +${xp} XP`,"var(--g)");$("#ccheck").hidden=true;$("#cnext").textContent="Next table →";$("#cnext").hidden=false}};
/* ---- new games ---- */
const klass=f=>{const r=rows(vars(parse(f))).map(x=>ev(parse(f),x)),n=r.filter(Boolean).length;return n==r.length?"Tautology":n?"Contingency":"Contradiction"};
function H(l,s,t,p){$("#hud").hidden=false;$("#lives").textContent="♥".repeat(Math.max(0,l))||"✖";$("#score").textContent=s;$("#tleft").textContent=t;$("#tfill").style.width=Math.max(0,p)+"%"}
const SW=["P ∧ ¬Q","(P ∨ Q) ∧ ¬P","(P → Q) ∧ P ∧ ¬R","(P ↔ Q) ∧ (Q ↔ R)","¬(P ∧ Q) ∧ (P ∨ R)","(P ∨ Q) → (R ∧ ¬P)","(P → Q) ∧ (Q → R) ∧ P","¬P ∧ ¬Q ∧ R","(P ∨ Q) ∧ (¬P ∨ ¬Q)","(P ∧ Q) ∨ (¬P ∧ ¬Q)"];
function switchGame(){let f,n,vs,rs,tg,pool;
do{f=pick(SW);n=parse(f);vs=vars(n);rs=rows(vs);tg=!(swLv>1&&Math.random()<.35);pool=rs.filter(r=>ev(n,r)!=tg)}while(!pool.length||rs.every(r=>ev(n,r)!=tg));
sw={n,vs,tg,env:{...pick(pool)},moves:0};swLv++;cur={type:"switch"};
$("#ctype").textContent=TITLES.switch;$("#cq").innerHTML=`Flip the switches to make <code>${f}</code> <b>${tg?"TRUE":"FALSE"}</b>.`;$("#copts").innerHTML="";fb("","");$("#cnext").hidden=true;$("#cnext").textContent="Next puzzle →";swDraw();$("#cbox").scrollIntoView({behavior:"smooth",block:"nearest"})}
function swDraw(){const v=ev(sw.n,sw.env);$("#ctable").innerHTML=`<div class="lamp ${v==sw.tg?"on":"off"}">${v?"TRUE":"FALSE"}</div><div class="sws">${sw.vs.map(x=>`<button class="sw ${sw.env[x]?"t":"f"}" data-v="${x}"><b>${x}</b>${sw.env[x]?"T":"F"}</button>`).join("")}</div><div class="subs">${subs(sw.n).map(s=>`<span class="sub ${ev(s,sw.env)?"t":"f"}">${str(s)}</span>`).join("")}</div>`}
function swClick(e){const w=e.target.closest(".sw");if(!w)return false;if(sw.done)return true;sw.env[w.dataset.v]=!sw.env[w.dataset.v];sw.moves++;swDraw();
if(ev(sw.n,sw.env)==sw.tg){sw.done=1;combo++;progress.best=Math.max(progress.best,combo);const xp=Math.max(8,22-(sw.moves-1)*3);awardXP(xp);burst($(".lamp"));fb(`Lit up in ${sw.moves} flip${sw.moves>1?"s":""}! +${xp} XP`,"var(--g)");$("#cnext").hidden=false}return true}

const BOSS=[["👹","Fallacy Goblin",4],["🧛","Count Contradiction",5],["🐉","Paradox Dragon",6]];
const FAL=[[["P → Q","Q"],"P"],[["P → Q","¬P"],"¬Q"],[["P ∨ Q","P"],"¬Q"],[["(P ∧ Q) → R","R"],"P ∧ Q"],[["R → S","S"],"R"]];
function bossGame(){const b=BOSS[bossLv%3];boss={e:b[0],nm:b[1],max:b[2]+Math.floor(bossLv/3)*2,me:3};boss.hp=boss.max;cur={type:"boss"};
$("#ctype").textContent=TITLES.boss+" · STAGE "+(bossLv+1);$("#ctable").innerHTML=`<div class="bface" id="bface">${boss.e}</div>`;bossTurn();$("#cbox").scrollIntoView({behavior:"smooth",block:"nearest"})}
function bossTurn(){if(!boss)return;const fal=Math.random()<.45,[ps,c]=pick(fal?FAL.filter(([p,q])=>!valid(p,q)):POOL.rule),ans=fal?"Fallacy!":rule(ps.map(parse),parse(c)),cs=new Set([ans,"Fallacy!"]);
shuffle(NAMES).forEach(n=>cs.size<5&&cs.add(n));
cur={type:"boss",a:ans,why:fal?"The premises don't force that conclusion, so it's a fallacy.":`That's ${ans}.`};
H(boss.me,`${boss.nm} ${boss.hp}/${boss.max}`,"",boss.hp/boss.max*100);
$("#cq").innerHTML=`<b>${boss.e} ${boss.nm}</b> attacks: <code>${ps.join(" , ")}</code> therefore <code>${c}</code>. Play the right card!`;
$("#copts").innerHTML=shuffle([...cs]).map(o=>`<button class="opt">${o}</button>`).join("");fb("","");$("#cnext").hidden=true;$("#cnext").textContent="Next stage →"}
function bossHit(b,ok){$$("#copts .opt").forEach(x=>{x.disabled=true;if(x.textContent==cur.a)x.classList.add("ok")});
if(ok){boss.hp--;combo++;progress.best=Math.max(progress.best,combo);burst(b);const f=$("#bface");f.classList.add("hit");setTimeout(()=>f.classList.remove("hit"),450);fb("Direct hit! "+cur.why,"var(--g)")}
else{boss.me--;combo=0;b.classList.add("no");shake($("#cbox"));fb(`Ouch! It was ${cur.a}. ${cur.why}`,"#d66a40")}
H(boss.me,`${boss.nm} ${boss.hp}/${boss.max}`,"",boss.hp/boss.max*100);
if(boss.hp<=0){const xp=30+bossLv*10,e=boss.e;bossLv++;boss=null;cur={type:"boss",done:1};awardXP(xp);toast(`${e} Defeated! +${xp} XP`);burst($("#bface"));fb(`You defeated the boss! +${xp} XP`,"var(--g)");$("#cnext").hidden=false}
else if(boss.me<=0){bossLv=0;boss=null;cur={type:"boss",done:1};$("#cq").innerHTML="💀 You were defeated. Study the rules and try again!";$("#copts").innerHTML="";$("#cnext").textContent="Try again →";$("#cnext").hidden=false}
else setTimeout(bossTurn,1100)}

const KL=["Tautology","Contradiction","Contingency"];
function fallGame(){fl={items:[],lives:3,score:0,n:0,sp:0};cur={type:"fall"};$("#ctype").textContent=TITLES.fall;
$("#cq").innerHTML="Classify the <b>lowest</b> formula before it hits the floor. Use the buttons or keys 1 · 2 · 3.";
$("#copts").innerHTML=KL.map((o,i)=>`<button class="opt" data-o="${o}">${i+1} · ${o}</button>`).join("");
$("#ctable").innerHTML='<div class="field" id="field"></div>';fb("","");$("#cnext").hidden=true;$("#cnext").textContent="Play again →";fallHud();timer=setInterval(fallTick,50);$("#cbox").scrollIntoView({behavior:"smooth",block:"nearest"})}
const fallHud=()=>H(fl.lives,fl.score+" pts","Lv "+(1+Math.floor(fl.n/5)),100);
function fallTick(){if(!fl||!$("#challenges").classList.contains("active"))return;const fd=$("#field");fl.sp-=50;
if(fl.sp<=0){const f=pick(POOL.truth),d=document.createElement("div");d.className="fall";d.textContent=f;d.style.left=(3+Math.random()*30)+"%";d.style.top="0px";fd.appendChild(d);fl.items.push({d,y:0,k:klass(f)});fl.sp=Math.max(1000,2600-fl.n*70)}
const v=2+Math.min(6,fl.n*.12),floor=fd.clientHeight-40;
fl.items.forEach((it,i)=>{it.y+=v;it.d.style.top=it.y+"px";it.d.classList.toggle("target",i==0)});
if(fl.items[0]&&fl.items[0].y>=floor){fl.items.shift().d.remove();fallMiss()}}
function fallMiss(){fl.lives--;shake($("#field"));fallHud();if(fl.lives<=0)endFall()}
function fallPick(o){const it=fl&&fl.items[0];if(!it)return;fl.items.shift();
if(it.k==o){fl.score+=10;fl.n++;it.d.classList.add("pop");setTimeout(()=>it.d.remove(),250);fallHud();fb(`✓ ${it.k}!`,"var(--g)")}
else{it.d.remove();fb(`✗ That was a ${it.k}.`,"#d66a40");fallMiss()}}
function endFall(){clearInterval(timer);const sc=fl.score,xp=Math.round(sc/3);fl=null;cur={type:"fall",done:1};$("#hud").hidden=true;
$("#cq").innerHTML=`Game over! You scored <b>${sc}</b> points.`;$("#copts").innerHTML="";fb(xp?`+${xp} XP earned`:"No XP this time. Try again!","var(--g)");if(xp)awardXP(xp);else save();$("#cnext").hidden=false}
addEventListener("keydown",e=>{if(fl&&["1","2","3"].includes(e.key))fallPick(KL[e.key-1])});

$$(".answer-btn").forEach(button=>button.addEventListener("click",()=>{const f=$("#quickFeedback");
if(progress.answered){f.textContent="You've already completed this quick challenge!";return}
if(button.dataset.answer=="Q"){f.textContent="Correct! That's Modus Ponens. +20 XP";f.style.color="var(--g)";progress.answered=true;awardXP(20);$$(".answer-btn").forEach(o=>o.disabled=true)}
else{f.textContent="Not quite. If P → Q and P are both true, what must be true?";f.style.color="#d66a40"}}));
if(progress.answered)$$(".answer-btn").forEach(o=>o.disabled=true);
updateStreak();renderProgress();
(()=>{
const reduced=matchMedia("(prefers-reduced-motion:reduce)").matches;let mx=0,my=0;
addEventListener("pointermove",e=>{mx=e.clientX/innerWidth-.5;my=e.clientY/innerHeight-.5});
$$(".tool-card,.stat-card").forEach(c=>{c.addEventListener("pointermove",e=>{const r=c.getBoundingClientRect(),x=(e.clientX-r.left)/r.width-.5,y=(e.clientY-r.top)/r.height-.5;c.style.setProperty("--ry",x*12+"deg");c.style.setProperty("--rx",-y*12+"deg");c.style.setProperty("--mx",(x+.5)*100+"%");c.style.setProperty("--my",(y+.5)*100+"%")});c.addEventListener("pointerleave",()=>{c.style.setProperty("--rx","0deg");c.style.setProperty("--ry","0deg")})});
if(!window.THREE)return;
function glyph(ch,col){const c=document.createElement("canvas");c.width=c.height=128;const x=c.getContext("2d");x.font="700 84px Inter,system-ui,sans-serif";x.textAlign="center";x.textBaseline="middle";x.shadowColor=col;x.shadowBlur=18;x.fillStyle=col;x.fillText(ch,64,68);return new THREE.SpriteMaterial({map:new THREE.CanvasTexture(c),transparent:true,depthWrite:false})}
function mk3d(cv,hero){
const R=new THREE.WebGLRenderer({canvas:cv,alpha:true,antialias:true});R.setPixelRatio(Math.min(devicePixelRatio,2));
const S=new THREE.Scene(),C=new THREE.PerspectiveCamera(55,1,.1,100),G=new THREE.Group();C.position.z=hero?5.4:9;S.add(G);
const W=()=>hero?cv.clientWidth:innerWidth,H=()=>hero?cv.clientHeight:innerHeight;
const wf=(g,c,o)=>new THREE.Mesh(g,new THREE.MeshBasicMaterial({color:c,wireframe:true,transparent:true,opacity:o}));
let k,sh=[];
if(hero){k=new THREE.Mesh(new THREE.TorusKnotGeometry(1,.3,140,18),new THREE.MeshStandardMaterial({color:0x0fb98f,emissive:0x04372c,metalness:.7,roughness:.25}));G.add(k,wf(new THREE.IcosahedronGeometry(1.9,1),0x5ff0c4,.25));
S.add(new THREE.AmbientLight(0xffffff,.45));const a=new THREE.PointLight(0x14e0b0,2.2,25),b=new THREE.PointLight(0xffb547,2.2,25);a.position.set(4,3,4);b.position.set(-4,-2,3);S.add(a,b)}
else[[new THREE.OctahedronGeometry(1.6),-6,2,-3,0x14e0b0],[new THREE.DodecahedronGeometry(1.4),6,-2,-4,0xffb547],[new THREE.TorusGeometry(1.2,.3,10,30),0,-4,-6,0xe5604d]].forEach(([g,x,y,z,c])=>{const m=wf(g,c,.35);m.position.set(x,y,z);G.add(m);sh.push(m)});
const cols=["#3fe8b8","#ffc66b","#ff8a78","#b9f7e5"],n=hero?6:22,sp=[];
for(let i=0;i<n;i++){const s=new THREE.Sprite(glyph("¬∧∨→↔∴"[i%6],cols[i%4]));if(hero)s.scale.set(.9,.9,1);else{s.scale.set(1.3,1.3,1);s.position.set((Math.random()-.5)*22,(Math.random()-.5)*13,-Math.random()*8);s.userData.y=s.position.y}G.add(s);sp.push(s)}
const pg=new THREE.BufferGeometry(),pa=new Float32Array(900);for(let i=0;i<900;i++)pa[i]=(Math.random()-.5)*(hero?7:24);
pg.setAttribute("position",new THREE.BufferAttribute(pa,3));G.add(new THREE.Points(pg,new THREE.PointsMaterial({color:0x5ff0c4,size:hero?.03:.05,transparent:true,opacity:.7})));
const size=()=>{if(!W())return;R.setSize(W(),H(),false);C.aspect=W()/H();C.updateProjectionMatrix()};size();addEventListener("resize",size);new ResizeObserver(size).observe(cv);
const t0=performance.now();
(function f(){const t=(performance.now()-t0)/1000;
if(W()&&!document.hidden){
if(hero){G.rotation.y=mx*.8;G.rotation.x=my*.5;k.rotation.x=t*.3;k.rotation.y=t*.45;sp.forEach((s,i)=>{const a=t*.45+i*1.0472;s.position.set(Math.cos(a)*2.7,Math.sin(t*.9+i)*.9,Math.sin(a)*2.7)})}
else{C.position.x+=(mx*3-C.position.x)*.04;C.position.y+=(-my*2-C.position.y)*.04;C.lookAt(0,0,0);sh.forEach((m,i)=>{m.rotation.x=t*.1*(i+1);m.rotation.y=t*.25});sp.forEach((s,i)=>s.position.y=s.userData.y+Math.sin(t*.6+i)*.5)}
R.render(S,C)}
if(!reduced)requestAnimationFrame(f)})()}
try{mk3d($("#bg3d"),0)}catch(e){}
try{mk3d($("#hero3d"),1);$(".hero-symbol").classList.add("on3d")}catch(e){}
})();
