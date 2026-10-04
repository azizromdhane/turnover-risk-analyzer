import {useState,useMemo} from 'react'
import {PieChart,Pie,Cell,BarChart,Bar,XAxis,YAxis,Tooltip,Legend,ResponsiveContainer,LineChart,Line,ComposedChart,Area,ReferenceLine,LabelList,ScatterChart,Scatter,CartesianGrid,RadarChart,Radar,PolarGrid,PolarAngleAxis,PolarRadiusAxis} from 'recharts'
import {VARS,OPT,THRESH,lvlOf,mapCols,compute,demo} from './scoring.js'

export const HEX={Faible:'#16a34a',Moyen:'#f59e0b','Élevé':'#dc2626'}
const LV=['Faible','Moyen','Élevé'],TB=['< 1 an','1–3 ans','3–5 ans','5–10 ans','10+ ans']
const avg=a=>a.length?Math.round(a.reduce((s,e)=>s+e.score,0)/a.length):0
const tb=t=>t==null?null:t<1?TB[0]:t<3?TB[1]:t<5?TB[2]:t<10?TB[3]:TB[4]
const C=({t,s,children,cls=''})=><section className={'card '+cls}><h3>{t}</h3>{s&&<p className="sub">{s}</p>}{children}</section>
const nm=(e,a)=>a||!e.name?e.id:e.name
const Who=({e,anon})=>anon||!e.name?<>{e.id}</>:<><b>{e.name}</b><br/><small className="sub">{e.id}</small></>
const Tip=({active,payload,label})=>active&&payload?.length?<div className="tip"><b>{label??payload[0].name}</b>{payload.map((x,i)=><div key={i}><i style={{background:x.color||x.fill||x.payload?.fill}}/>{x.name} : <b>{x.value}</b></div>)}</div>:null
const Gauge=({v,T})=>{const P=a=>[100+80*Math.cos(Math.PI*(1-a/100)),100-80*Math.sin(Math.PI*(1-a/100))],arc=(a,b,c)=>{const[x1,y1]=P(a),[x2,y2]=P(b);return <path d={`M${x1} ${y1}A80 80 0 0 1 ${x2} ${y2}`} stroke={c} strokeWidth="16" fill="none"/>},[nx,ny]=P(v)
  return <svg viewBox="0 0 200 120" style={{width:'100%',maxWidth:300,display:'block',margin:'0 auto'}}>{arc(0,T[0],HEX.Faible)}{arc(T[0],T[1],HEX.Moyen)}{arc(T[1],100,HEX['Élevé'])}<line x1="100" y1="100" x2={100+(nx-100)*.85} y2={100+(ny-100)*.85} stroke="currentColor" strokeWidth="3" strokeLinecap="round"/><circle cx="100" cy="100" r="6" fill="currentColor"/><text x="12" y="116" fontSize="10" fill="currentColor">0</text><text x="172" y="116" fontSize="10" fill="currentColor">100</text></svg>}
const Tag=({l})=><span className="tag" style={{background:HEX[l]}}>{l.toUpperCase()}</span>
const Chart=({h=240,children})=><ResponsiveContainer width="100%" height={h}>{children}</ResponsiveContainer>
const Bar1=({e})=><div className="bt"><div className="bf" style={{width:e.score+'%',background:HEX[e.lvl]}}/></div>
const group=(d,fn,order)=>{const g={};d.forEach(e=>{const k=fn(e);if(k!=null)(g[k]=g[k]||[]).push(e)});return(order||Object.keys(g)).filter(k=>g[k]).map(k=>({name:k,score:avg(g[k]),n:g[k].length}))}
const third=(d,key)=>{const v=d.map(e=>e[key]).filter(x=>x!=null);if(!v.length)return()=>null;const a=Math.min(...v),b=Math.max(...v);return e=>e[key]==null?null:['Bas','Moyen','Haut'][Math.min(2,Math.floor((e[key]-a)/((b-a)||1)*3))]}
const orgRisk=d=>Object.keys(VARS).map(k=>{const v=d.flatMap(e=>e.all.filter(x=>x.k===k));return{k,v:VARS[k].l,org:v.length?Math.round(v.reduce((s,x)=>s+x.q,0)/v.length*100):null,n:v.filter(x=>x.q>=.5).length}}).filter(x=>x.org!==null)
function exportCsv(rows){const H=['Employee_ID','Département','Poste','Score','Niveau','Facteurs principaux']
  const L=rows.map(e=>[e.id,e.dept,e.job,e.score,e.lvl,e.fac.map(x=>VARS[x.k].f).join(' | ')].map(x=>'"'+String(x).replace(/"/g,'""')+'"').join(';'))
  const a=document.createElement('a');a.href=URL.createObjectURL(new Blob(['\ufeff'+[H.join(';'),...L].join('\n')],{type:'text/csv'}));a.download='resultats_risque_turnover.csv';a.click()}
const Empty=({go,loadDemo})=><C t="Aucune donnée chargée" s="Importez une base RH ou chargez le jeu de démonstration."><button className="btn" onClick={()=>go('import')}>Importer une base RH</button><button className="btn s" onClick={loadDemo}>Charger le Demo Dataset</button></C>
const Mini=({t,data,T})=><C t={t} s="Score moyen par groupe (bas / moyen / haut)"><Chart h={190}><BarChart data={data}><CartesianGrid strokeDasharray="3 3" vertical={false}/><XAxis dataKey="name"/><YAxis domain={[0,100]}/><Tooltip content={<Tip/>} cursor={{fill:"rgba(91,79,240,.08)"}}/><ReferenceLine y={T[1]} stroke="#dc2626" strokeDasharray="4 4"/><Bar dataKey="score" name="Score moyen" radius={[6,6,0,0]}>{data.map((x,i)=><Cell key={i} fill={HEX[lvlOf(x.score,T)]}/>)}<LabelList dataKey="score" position="top" fontSize={12}/></Bar></BarChart></Chart></C>
const Chain=()=><p>{['Données RH','Analyse','Score','Niveau de risque','Facteurs','Action RH'].map(s=><span className="step" key={s}>{s}</span>)}</p>
const NOTE="Le score constitue un indicateur d'aide à la décision RH et ne permet pas de prédire avec certitude le départ d'un salarié."

const PAL=['#4f46e5','#0ea5e9','#14b8a6','#f59e0b','#ef4444','#a855f7','#64748b']
export function Home({go,loadDemo}){
  const S=[['📥','Données RH','Import Excel / CSV'],['🔎','Analyse','Vérification et nettoyage'],['🧮','Score','Sur 100 points pondérés'],['🚦','Niveau de risque','Faible, moyen, élevé'],['🧩','Facteurs','Ce qui explique le score'],['🤝','Action RH','Pistes concrètes']]
  const dd=useMemo(()=>{const r=demo();return compute(r,Object.keys(r[0]),Object.fromEntries(Object.entries(VARS).map(([k,v])=>[k,v.w])),THRESH)},[])
  const cn=Object.fromEntries(LV.map(l=>[l,dd.filter(e=>e.lvl===l).length])),dept=[...new Set(dd.map(e=>e.dept))].map(n=>({name:n,score:avg(dd.filter(e=>e.dept===n))}))
  return <>
  <div className="hero2"><div><span className="pill">People Analytics · Management des Affaires / RH</span><h1>Turnover Risk Analyzer</h1>
    <h2>People Analytics — Analyse et anticipation du risque de turnover</h2>
    <p className="lead">Analysez les données RH, identifiez les facteurs associés au risque de turnover et obtenez un score de risque pour chaque salarié.</p>
    <p style={{marginTop:22}}><button className="btn" onClick={()=>go('import')}>📥 Importer une base RH</button><button className="btn s" onClick={()=>go('dashboard')}>Voir le dashboard</button><button className="btn s" onClick={loadDemo}>▶ Essayer avec le Demo Dataset</button></p>
    <div className="trust"><span>✓ Score transparent</span><span>✓ Recalcul instantané</span><span>✓ Données anonymisables</span><span>✓ Pistes d'action RH</span></div>
    <p className="mini">{NOTE}</p></div>
    <div className="mock"><small className="sub">Exemple illustratif</small><div className="ring" style={{background:'conic-gradient(#dc2626 0 78%,#e5e7eb 0)'}}><div><b>78</b><span>/ 100</span></div></div>
      <Tag l="Élevé"/><p style={{margin:'10px 0 4px'}}><span className="chip">Satisfaction faible</span><span className="chip">Charge élevée</span><span className="chip">Absentéisme</span></p><p className="sub" style={{margin:0}}>→ Entretien individuel, analyse de la charge</p></div></div>
  <h2 className="sect-h">Pourquoi cet outil ?</h2><p className="sect-s">Une démarche People Analytics, du constat à l'action</p>
  <div className="grid g3">{[['🎯','Contexte','Le turnover pèse sur les coûts, la performance et le climat social. Les services RH disposent de données mais les exploitent peu pour anticiper.'],['❓','Problématique','Comment utiliser les données RH pour repérer tôt les situations présentant un risque potentiel de turnover, et orienter l\'action ?'],['✅','Objectifs','Scorer le risque, expliquer le score par ses facteurs, proposer des pistes d\'action RH et rester transparent sur les limites.']].map(([i,t,s])=><C key={t} t={i+' '+t}><p className="sub">{s}</p></C>)}</div>
  <h2 className="sect-h">Aperçu en direct</h2><p className="sect-s">Calculé maintenant sur le Demo Dataset (60 salariés fictifs)</p>
  <section className="card live"><div className="grid k4" style={{marginBottom:12}}>{[['Salariés',dd.length,'#3730d4'],['Risque élevé',cn['Élevé'],HEX['Élevé']],['Risque moyen',cn.Moyen,HEX.Moyen],['Risque faible',cn.Faible,HEX.Faible]].map(([a,b,c])=><div className="kpi" key={a} style={{'--c':c}}><small>{a}</small><b>{b}</b></div>)}</div>
    <div className="grid g2"><Chart h={220}><PieChart><Pie data={LV.map(l=>({name:l,value:cn[l]}))} dataKey="value" innerRadius={50} outerRadius={85} paddingAngle={3}>{LV.map(l=><Cell key={l} fill={HEX[l]}/>)}</Pie><Tooltip content={<Tip/>} cursor={{fill:"rgba(91,79,240,.08)"}}/><Legend/></PieChart></Chart>
    <Chart h={220}><BarChart data={dept}><CartesianGrid strokeDasharray="3 3" vertical={false}/><XAxis dataKey="name"/><YAxis domain={[0,100]}/><Tooltip content={<Tip/>} cursor={{fill:"rgba(91,79,240,.08)"}}/><Bar dataKey="score" name="Score moyen" radius={[6,6,0,0]}>{dept.map((x,i)=><Cell key={i} fill={HEX[lvlOf(x.score,THRESH)]}/>)}</Bar></BarChart></Chart></div>
    <p style={{textAlign:'center',marginBottom:0}}><button className="btn" onClick={loadDemo}>Ouvrir le dashboard complet →</button></p></section>
  <h2 className="sect-h">De la donnée à l'action RH</h2><p className="sect-s">Six étapes, entièrement automatiques</p>
  <div className="tl">{S.map(([i,t,s],k)=><div className="card" key={t}><div className="n">{k+1}</div><b>{i} {t}</b><p>{s}</p></div>)}</div>
  <h2 className="sect-h">Un score transparent</h2><p className="sect-s">Pondérations initiales sur 100 points (modifiables dans la page Méthodologie)</p>
  <div className="card"><div className="wbar">{Object.values(VARS).map((v,i)=><div key={v.l} style={{flex:v.w,background:PAL[i]}}><b>{v.w}</b>{v.l}</div>)}</div></div>
  <h2 className="sect-h">Fonctionnalités</h2><p className="sect-s">Tout ce qu'il faut pour démontrer la démarche</p>
  <div className="grid g3">{[['📊','Dashboard décisionnel','8 graphiques interactifs, filtre par département, synthèse automatique.'],['👤','Profil individuel','Score, radar comparé à la moyenne, facteurs et pistes d\'action.'],['🧪','Simulateur d\'actions','Estimez l\'effet d\'une mesure RH sur le score (hypothèse pédagogique).'],['🆚','Comparaison','Comparez deux départements sur tous les facteurs de risque.'],['🗂️','Plan d\'action RH','Priorités par facteur, entretiens à planifier, exposition financière.'],['🔒','Mode anonyme','Masquez les noms en un clic ; export CSV et impression PDF.']].map(([i,t,s])=><C key={t} t={i+' '+t}><p className="sub">{s}</p></C>)}</div>
  <C t="⚖️ Un indicateur, pas une prédiction"><p className="sub">Le score repose sur des règles transparentes et non sur un modèle entraîné sur des départs réels. Les données doivent être anonymisées : l'application ne doit pas afficher de nom, numéro de téléphone, adresse ou autre donnée personnelle inutile à l'analyse.</p></C>
  <div className="cta"><h2 style={{marginTop:0}}>Prêt à analyser votre base RH ?</h2><button className="btn" onClick={()=>go('import')}>Importer une base RH</button><button className="btn s" onClick={loadDemo}>Essayer avec le Demo Dataset</button></div></>}

export function Import({src,go,load,loadDemo,onFile,err}){const m=src&&mapCols(src.cols);return <>
  <h1>Importation des données</h1><p className="sub">Fichier Excel (.xlsx) ou CSV (.csv) — le premier onglet est lu</p>
  <C t="Source de données"><input type="file" accept=".xlsx,.csv" onChange={onFile}/><button className="btn s" onClick={loadDemo}>Charger le Demo Dataset (fictif)</button>
    {err&&<p className="err">{err}</p>}<p className="note">Données anonymisées uniquement : pas de nom, téléphone ni adresse.</p></C>
  {src&&<><C t={src.isDemo?'Demo Dataset (données fictives pédagogiques)':'Fichier : '+src.name}>
    <div className="grid k5"><div className="kpi"><small>Salariés</small><b>{src.rows.length}</b></div><div className="kpi"><small>Variables</small><b>{src.cols.length}</b></div></div>
    <p>Colonnes détectées : {src.cols.join(', ')}</p>
    <div className="wrap"><table><thead><tr><th>Variable attendue</th><th>Colonne trouvée</th><th>Statut</th></tr></thead><tbody>
      {[['id','Employee_ID'],...Object.entries(VARS).map(([k,v])=>[k,v.l]),['dept','Department'],['job','Job_Position'],['name','Name / Nom']].map(([k,l])=><tr key={k}><td>{l}</td><td>{m[k]||'—'}</td><td className={m[k]?'ok':'err'}>{m[k]?'✓ Présente':(OPT[k]?'Absente (facultative)':'Absente : variable ignorée dans le score')}</td></tr>)}</tbody></table></div></C>
    {m.name&&<p className="note">Colonne « Nom » détectée. En situation réelle, privilégiez des identifiants anonymisés, ou activez le mode anonyme (🔒 en haut) pour masquer les noms.</p>}<C t="Aperçu des premières lignes"><div className="wrap"><table><thead><tr>{src.cols.map(c=><th key={c}>{c}</th>)}</tr></thead><tbody>{src.rows.slice(0,5).map((r,i)=><tr key={i}>{src.cols.map(c=><td key={c}>{String(r[c]??'')}</td>)}</tr>)}</tbody></table></div>
      <p><button className="btn" onClick={()=>go('dashboard')}>Voir le dashboard</button></p></C></>}</>}

export function Dashboard({d:all,src,T,go,open,loadDemo,anon}){
  const[dp,setDp]=useState('')
  if(!src)return <Empty {...{go,loadDemo}}/>
  const d=dp?all.filter(e=>e.dept===dp):all
  const cnt=Object.fromEntries(LV.map(l=>[l,d.filter(e=>e.lvl===l).length]))
  const depts=[...new Set(d.map(e=>e.dept))].map(n=>{const g=d.filter(e=>e.dept===n);return{name:n,...Object.fromEntries(LV.map(l=>[l,g.filter(e=>e.lvl===l).length])),score:avg(g)}})
  const org=orgRisk(d),top=[...d].sort((a,b)=>b.score-a.score).slice(0,8),worst=[...depts].sort((a,b)=>b.score-a.score)[0],tf=[...org].sort((a,b)=>b.n-a.n)[0]
  const hist=Array.from({length:10},(_,i)=>({name:i*10+'–'+(i*10+9),mid:i*10+5,n:d.filter(e=>Math.min(9,Math.floor(e.score/10))===i).length}))
  const heat=depts.map(x=>({n:x.name,c:TB.map(t=>{const g=d.filter(e=>e.dept===x.name&&tb(e.ten)===t);return g.length?{s:avg(g),n:g.length}:null})}))
  const kp=[['Salariés analysés',d.length,'#3730d4'],['Risque élevé',cnt['Élevé'],HEX['Élevé']],['Risque moyen',cnt.Moyen,HEX.Moyen],['Risque faible',cnt.Faible,HEX.Faible],['Score moyen',avg(d)+' / 100','#64748b']]
  return <>
  <div style={{display:'flex',justifyContent:'space-between',flexWrap:'wrap'}}><div><h1>Dashboard RH</h1><p className="sub">{src.isDemo?'Demo Dataset — données fictives':src.name} · indicateur de risque, pas une prédiction</p></div>
    <div className="noprint"><select value={dp} onChange={x=>setDp(x.target.value)}><option value="">Tous départements</option>{[...new Set(all.map(e=>e.dept))].map(x=><option key={x}>{x}</option>)}</select><button className="btn s" onClick={()=>exportCsv(d)}>⬇ Exporter les résultats (CSV)</button><button className="btn" onClick={()=>window.print()}>🖨 Imprimer / PDF</button></div></div>
  <div className="grid k5" style={{marginBottom:16}}>{kp.map(([a,b,c])=><div className="kpi" key={a} style={{'--c':c}}><small>{a}</small><b>{b}</b></div>)}</div>
  <C t="Synthèse automatique et plan d'action prioritaire" s="Données RH → Analyse → Score → Niveau de risque → Facteurs → Action RH"><ul className="ins">
    <li><b>{Math.round(cnt['Élevé']/d.length*100)}%</b> des salariés ({cnt['Élevé']}) présentent un niveau de risque élevé.</li>
    {worst&&<li>Département le plus exposé : <b>{worst.name}</b> (score moyen {worst.score}/100).</li>}
    {tf&&<li>Facteur le plus fréquent : <b>{VARS[tf.k].f}</b> ({tf.n} salariés). Piste d'action RH : {VARS[tf.k].r}</li>}</ul>
    <p className="note">Pistes à discuter, pas des décisions automatiques.</p></C>
  <div className="grid g2">
    <C t="Répartition par niveau de risque"><div className="donut"><Chart h={260}><PieChart><Pie data={LV.map(l=>({name:l,value:cnt[l]}))} dataKey="value" innerRadius={65} outerRadius={100} paddingAngle={3} label={({percent})=>percent>0?Math.round(percent*100)+"%":""}>{LV.map(l=><Cell key={l} fill={HEX[l]}/>)}</Pie><Tooltip content={<Tip/>} cursor={{fill:"rgba(91,79,240,.08)"}}/><Legend/></PieChart></Chart><div><b>{d.length}</b><span className="sub">salariés</span></div></div></C>
    <C t="Risque par département" s="Nombre de salariés par niveau"><Chart h={260}><ComposedChart data={depts}><CartesianGrid strokeDasharray="3 3" vertical={false}/><XAxis dataKey="name"/><YAxis allowDecimals={false}/><YAxis yAxisId="r" orientation="right" domain={[0,100]}/><Tooltip content={<Tip/>} cursor={{fill:"rgba(91,79,240,.08)"}}/><Legend/>{LV.map(l=><Bar key={l} dataKey={l} stackId="a" fill={HEX[l]}/>)}<Line yAxisId="r" type="monotone" dataKey="score" name="Score moyen" stroke="#1b2333" strokeWidth={2.5} strokeDasharray="5 3" dot={{r:4,fill:"#fff",strokeWidth:2}}/></ComposedChart></Chart></C>
    <C t="Flight risk selon l'ancienneté" s="Score moyen par tranche d'ancienneté"><Chart><ComposedChart data={group(d,e=>tb(e.ten),TB)}><defs><linearGradient id="gT" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#4f46e5" stopOpacity={.45}/><stop offset="95%" stopColor="#4f46e5" stopOpacity={0}/></linearGradient></defs><CartesianGrid strokeDasharray="3 3" vertical={false}/><XAxis dataKey="name"/><YAxis domain={[0,100]}/><Tooltip content={<Tip/>} cursor={{fill:"rgba(91,79,240,.08)"}}/><ReferenceLine y={T[0]} stroke="#16a34a" strokeDasharray="5 4" label={{value:"Seuil moyen",fontSize:11,fill:"#16a34a",position:"insideTopRight"}}/><ReferenceLine y={T[1]} stroke="#dc2626" strokeDasharray="5 4" label={{value:"Seuil élevé",fontSize:11,fill:"#dc2626",position:"insideTopRight"}}/><Area type="monotone" dataKey="score" fill="url(#gT)" stroke="none" tooltipType="none" legendType="none"/><Line type="monotone" dataKey="score" name="Score moyen" stroke="#4f46e5" strokeWidth={3} dot={{r:5,strokeWidth:2,fill:"#fff"}}><LabelList dataKey="score" position="top" fontSize={12}/></Line></ComposedChart></Chart></C>
    <C t="Profil de risque de l'organisation" s="Risque moyen par variable (0–100)"><Chart><RadarChart data={org.map(x=>({v:x.v,Risque:x.org}))}><PolarGrid/><PolarAngleAxis dataKey="v" tick={{fontSize:11}}/><PolarRadiusAxis domain={[0,100]}/><Radar dataKey="Risque" stroke="#3730d4" fill="#3730d4" fillOpacity={.35}/><Tooltip content={<Tip/>} cursor={{fill:"rgba(91,79,240,.08)"}}/></RadarChart></Chart></C>
  </div>
  <div className="grid g2">
    <C t="Distribution des scores" s="Nombre de salariés par tranche de 10 points"><Chart><BarChart data={hist}><CartesianGrid strokeDasharray="3 3" vertical={false}/><XAxis dataKey="name"/><YAxis allowDecimals={false}/><Tooltip content={<Tip/>} cursor={{fill:"rgba(91,79,240,.08)"}}/><Bar dataKey="n" name="Salariés" radius={[6,6,0,0]}>{hist.map((x,i)=><Cell key={i} fill={HEX[lvlOf(x.mid,T)]}/>)}<LabelList dataKey="n" position="top" fontSize={12}/></Bar></BarChart></Chart></C>
    <C t="Satisfaction vs absentéisme" s="Chaque point est un salarié, coloré selon son niveau de risque"><Chart><ScatterChart><CartesianGrid strokeDasharray="3 3"/><XAxis type="number" dataKey="sat" name="Satisfaction" domain={['auto','auto']}/><YAxis type="number" dataKey="abs" name="Absentéisme (jours)"/><Tooltip cursor={{strokeDasharray:'3 3'}}/><Legend/>{LV.map(l=><Scatter key={l} name={l} data={d.filter(e=>e.lvl===l&&e.sat!=null&&e.abs!=null)} fill={HEX[l]} fillOpacity={.75}/>)}</ScatterChart></Chart></C></div>
  <C t="Carte de chaleur : département × ancienneté" s="Score moyen (effectif entre parenthèses) — plus la case est rouge, plus le risque est élevé"><div className="wrap"><table className="heat"><thead><tr><th/>{TB.map(t=><th key={t}>{t}</th>)}</tr></thead><tbody>{heat.map(r=><tr key={r.n}><td><b>{r.n}</b></td>{r.c.map((c,i)=><td key={i} style={c?{background:`rgba(220,38,38,${Math.min(.85,c.s/100)})`,color:c.s>45?'#fff':'inherit'}:{}}>{c?<><b>{c.s}</b> <small>({c.n})</small></>:'—'}</td>)}</tr>)}</tbody></table></div></C>
  <div className="grid g21">
    <C t="Facteurs de risque les plus fréquents" s="Nombre de salariés concernés"><Chart><BarChart layout="vertical" data={[...org].sort((a,b)=>b.n-a.n).map(x=>({name:x.v,Salariés:x.n}))}><CartesianGrid strokeDasharray="3 3" horizontal={false}/><XAxis type="number" allowDecimals={false}/><YAxis type="category" dataKey="name" width={130}/><Tooltip content={<Tip/>} cursor={{fill:"rgba(91,79,240,.08)"}}/><Bar dataKey="Salariés" fill="#5b4ff0" radius={[0,6,6,0]}/></BarChart></Chart></C>
    <C t="High-Risk Staff" s="Top 8 des scores"><div className="wrap"><table><tbody>{top.map(e=><tr key={e.id}><td><Who e={e} anon={anon}/></td><td><b>{e.score}</b></td><td><Bar1 e={e}/></td><td className="noprint"><button className="btn sm" onClick={()=>open(e.id)}>Profil</button></td></tr>)}</tbody></table></div></C>
  </div>
  <div className="grid g3"><Mini T={T} t="Risque selon la satisfaction" data={group(d,third(d,'sat'),['Bas','Moyen','Haut'])}/><Mini T={T} t="Risque selon l'absentéisme" data={group(d,third(d,'abs'),['Bas','Moyen','Haut'])}/><Mini T={T} t="Risque selon la charge de travail" data={group(d,third(d,'wl'),['Bas','Moyen','Haut'])}/></div></>}

export function List({d,src,open,go,loadDemo,anon}){
  const[q,setQ]=useState(''),[fd,setFd]=useState(''),[fl,setFl]=useState(''),[so,setSo]=useState(1),[pg,setPg]=useState(0)
  if(!src)return <Empty {...{go,loadDemo}}/>
  const S=15,rows=d.filter(e=>(!q||(String(e.id)+' '+(anon?'':e.name||'')).toLowerCase().includes(q.toLowerCase()))&&(!fd||e.dept===fd)&&(!fl||e.lvl===fl)).sort((a,b)=>(b.score-a.score)*so),np=Math.max(1,Math.ceil(rows.length/S)),f=fn=>x=>{fn(x.target.value);setPg(0)}
  return <><h1>Employee Risk List</h1><p className="sub">{rows.length} salariés</p><C t="Liste des salariés">
    <input placeholder="Rechercher (ID ou nom)…" value={q} onChange={f(setQ)}/>
    <select value={fd} onChange={f(setFd)}><option value="">Tous départements</option>{[...new Set(d.map(e=>e.dept))].map(x=><option key={x}>{x}</option>)}</select>
    <select value={fl} onChange={f(setFl)}><option value="">Tous niveaux</option>{LV.map(x=><option key={x}>{x}</option>)}</select>
    <button className="btn s" onClick={()=>setSo(-so)}>Tri score {so>0?'↓':'↑'}</button><button className="btn s" onClick={()=>exportCsv(rows)}>⬇ Export CSV</button>
    <div className="wrap"><table><thead><tr>{['Salarié','Département','Poste','Ancienneté','Satisfaction','Absentéisme','Charge','Score','','Niveau',''].map((h,i)=><th key={i}>{h}</th>)}</tr></thead><tbody>
      {rows.slice(pg*S,pg*S+S).map(e=><tr key={e.id}><td><Who e={e} anon={anon}/></td><td>{e.dept}</td><td>{e.job}</td><td>{e.ten??'—'}</td><td>{e.sat??'—'}</td><td>{e.abs??'—'}</td><td>{e.wl??'—'}</td><td><b>{e.score}</b></td><td><Bar1 e={e}/></td><td><Tag l={e.lvl}/></td><td><button className="btn sm" onClick={()=>open(e.id)}>Voir le profil</button></td></tr>)}</tbody></table></div>
    <div className="pg"><button className="btn s sm" disabled={pg===0} onClick={()=>setPg(pg-1)}>←</button>Page {pg+1} / {np}<button className="btn s sm" disabled={pg+1>=np} onClick={()=>setPg(pg+1)}>→</button></div></C></>}

export function Profile({d,src,T,go,sel,loadDemo,open,anon}){
  const[act,setAct]=useState({})
  if(!src)return <Empty {...{go,loadDemo}}/>
  const e=d.find(x=>x.id===sel)
  if(!e)return <C t="Profil individuel" s="Sélectionnez un salarié dans la liste ou via la recherche en haut."><button className="btn" onClick={()=>go('list')}>Aller à la liste</button></C>
  const org=orgRisk(d),da=avg(d.filter(x=>x.dept===e.dept)),sorted=[...e.all].sort((a,b)=>b.pts-a.pts),rank=[...d].sort((a,b)=>b.score-a.score),ix=rank.findIndex(x=>x.id===e.id)
  const ns=Math.round(e.all.reduce((s,x)=>s+x.pts*(act[e.id+x.k]?.5:1),0)),ini=anon||!e.name?'#':e.name.split(' ').map(w=>w[0]).slice(0,2).join('')
  return <><div className="noprint"><button className="btn s sm" onClick={()=>go('list')}>← Liste</button> <button className="btn s sm" disabled={ix<1} onClick={()=>open(rank[ix-1].id)}>↑ Plus à risque</button> <button className="btn s sm" disabled={ix>=rank.length-1} onClick={()=>open(rank[ix+1].id)}>↓ Moins à risque</button></div>
  <div className="ph"><div className="av" style={{background:HEX[e.lvl]}}>{ini}</div><div><h1 style={{margin:0}}>{nm(e,anon)}</h1><p className="sub" style={{margin:0}}>{anon||!e.name?'':e.id+' · '}{e.dept} · {e.job} · Ancienneté : {e.ten??'—'} ans · Rang de risque : {ix+1} / {d.length}</p></div></div>
  <div className="grid g2">
    <C t="Score de risque"><div className="big" style={{color:HEX[e.lvl]}}>{e.score} / 100</div><p><Tag l={e.lvl}/> <b>RISQUE {e.lvl.toUpperCase()}</b></p>
      <Gauge v={e.score} T={T}/>
      <p className="sub">Département {e.dept} : {da}/100 · Organisation : {Math.round(d.reduce((s,x)=>s+x.score,0)/d.length)}/100</p><p className="note">Indicateur de risque, pas une prédiction de départ.</p></C>
    <C t="Salarié vs moyenne de l'organisation" s="Niveau de risque par variable (0–100)"><Chart h={250}><RadarChart data={e.all.map(x=>({v:VARS[x.k].l,Salarié:Math.round(x.q*100),Moyenne:org.find(o=>o.k===x.k)?.org}))}><PolarGrid/><PolarAngleAxis dataKey="v" tick={{fontSize:11}}/><PolarRadiusAxis domain={[0,100]}/><Radar name="Salarié" dataKey="Salarié" stroke={HEX[e.lvl]} fill={HEX[e.lvl]} fillOpacity={.35}/><Radar name="Moyenne" dataKey="Moyenne" stroke="#94a3b8" fill="#94a3b8" fillOpacity={.15}/><Legend/><Tooltip content={<Tip/>} cursor={{fill:"rgba(91,79,240,.08)"}}/></RadarChart></Chart></C>
    <C t="Contribution de chaque variable" s="Points de risque"><Chart h={250}><BarChart layout="vertical" data={sorted.map(x=>({name:VARS[x.k].l,Points:+x.pts.toFixed(1)}))}><CartesianGrid strokeDasharray="3 3" horizontal={false}/><XAxis type="number"/><YAxis type="category" dataKey="name" width={130}/><Tooltip content={<Tip/>} cursor={{fill:"rgba(91,79,240,.08)"}}/><Bar dataKey="Points" radius={[0,6,6,0]}>{sorted.map((x,i)=><Cell key={i} fill={x.q>=.75?HEX['Élevé']:x.q>=.5?HEX.Moyen:HEX.Faible}/>)}</Bar></BarChart></Chart></C>
    <C t="Principaux facteurs identifiés">{e.fac.length?e.fac.map((x,i)=><p key={x.k}><b>{i+1}. {VARS[x.k].f}</b><br/><span className="sub">Valeur : {x.v} · Niveau : {x.q>=.75?'fort':'modéré'} · Contribution : +{x.pts.toFixed(1)} pts</span></p>):<p>Aucun facteur de risque marqué dans les données.</p>}</C>
  </div>
  <div className="grid g2"><C t="Pistes d'action RH">{e.fac.length?<ul>{e.fac.map(x=><li key={x.k}>{VARS[x.k].r}</li>)}</ul>:<p>Maintenir le suivi habituel.</p>}<p className="note">Pistes à discuter avec le salarié et son manager, pas des décisions automatiques.</p></C>
  <C cls="sim noprint" t="Simulateur d'actions RH" s="Cochez une action : on suppose que le facteur diminue de moitié (hypothèse pédagogique).">{e.fac.length?e.fac.map(x=><label key={x.k}><input type="checkbox" checked={!!act[e.id+x.k]} onChange={()=>setAct({...act,[e.id+x.k]:!act[e.id+x.k]})}/>{VARS[x.k].r}</label>):<p>Aucun facteur à traiter.</p>}
    <p>Score estimé : <b style={{fontSize:22,color:HEX[lvlOf(ns,T)]}}>{ns}</b> / 100 <Tag l={lvlOf(ns,T)}/> <span className="sub">({ns-e.score} pts)</span></p></C></div></>}

export function Method({W,setW,T,setT}){const tot=Object.values(W).reduce((a,b)=>a+b,0);return <>
  <h1>Méthodologie</h1><p className="sub">Données RH → Analyse → Score → Niveau de risque → Facteurs → Action RH</p>
  <C t="Étapes">{['Importation','Nettoyage et vérification','Analyse des variables','Calcul du score','Classification','Facteurs principaux','Recommandations RH'].map((s,i)=><span className="step" key={s}>{i+1}. {s}</span>)}</C>
  <C t="Pondérations (modifiables, recalcul automatique)"><div className="wrap"><table><thead><tr><th>Variable</th><th>Poids</th><th>Règle de risque</th></tr></thead><tbody>
    {Object.entries(VARS).map(([k,v])=><tr key={k}><td>{v.l}</td><td><input type="number" min="0" style={{width:80,margin:0}} value={W[k]} onChange={x=>setW({...W,[k]:Math.max(0,+x.target.value||0)})}/></td>
      <td>{v.dir==='low'?'Valeur basse → risque élevé':v.dir==='high'?'Valeur haute → risque élevé':'< 1 an : fort · 1–3 : élevé · 3–5 : moyen · 5–10 : faible · 20+ ans : modéré'}</td></tr>)}</tbody></table></div>
    <p>Total : <b>{tot}</b> {tot!==100&&<span className="err">(ramené automatiquement à 100)</span>}</p>
    <p>Seuils : faible &lt; <input type="number" style={{width:70}} value={T[0]} onChange={x=>setT([+x.target.value,T[1]])}/> ≤ moyen &lt; <input type="number" style={{width:70}} value={T[1]} onChange={x=>setT([T[0],+x.target.value])}/> ≤ élevé</p></C>
  <C t="Calcul et limites"><ul className="ins"><li>Chaque valeur est normalisée entre le min et le max du fichier (0 = risque nul, 1 = risque maximal), puis multipliée par son poids.</li>
    <li>Une variable absente est ignorée et les poids restants sont ramenés à 100 : aucune donnée n'est inventée.</li>
    <li>Le score est un <b>indicateur de risque</b>, pas une probabilité statistique. Il ne repose pas sur un modèle entraîné sur des départs réels.</li>
    <li>Les pondérations sont des hypothèses de départ, à valider avec des données historiques de départs.</li><li>{NOTE}</li></ul></C></>}

export function Compare({d,src,go,loadDemo}){
  const[a,setA]=useState(''),[b,setB]=useState('')
  if(!src)return <Empty {...{go,loadDemo}}/>
  const dp=[...new Set(d.map(e=>e.dept))],A=a||dp[0],B=b||dp[1]||dp[0]
  const st=n=>{const g=d.filter(e=>e.dept===n);return{n,o:orgRisk(g),N:g.length,s:avg(g),hi:Math.round(g.filter(e=>e.lvl==='Élevé').length/g.length*100)}}
  const x=st(A),y=st(B),vars=orgRisk(d),gap=[...vars].map(v=>({v:v.v,diff:(x.o.find(z=>z.k===v.k)?.org||0)-(y.o.find(z=>z.k===v.k)?.org||0)})).sort((p,q)=>Math.abs(q.diff)-Math.abs(p.diff))[0]
  return <><h1>Comparaison de départements</h1><p className="sub">Où le risque est-il le plus concentré, et pourquoi ?</p>
  <C t="Choix"><select value={A} onChange={e=>setA(e.target.value)}>{dp.map(v=><option key={v}>{v}</option>)}</select> <b>vs</b> <select value={B} onChange={e=>setB(e.target.value)} style={{marginLeft:8}}>{dp.map(v=><option key={v}>{v}</option>)}</select></C>
  <div className="grid g2">{[x,y].map((z,i)=><div key={i} className="kpi" style={{'--c':i?'#f59e0b':'#3730d4'}}><small>{z.n}</small><b>{z.s} / 100</b><span>{z.N} salariés · {z.hi}% en risque élevé</span></div>)}</div>
  <C t="Profil de risque par variable" s="0 = risque nul, 100 = risque maximal"><Chart h={320}><RadarChart data={vars.map(v=>({v:v.v,A:x.o.find(z=>z.k===v.k)?.org,B:y.o.find(z=>z.k===v.k)?.org}))}><PolarGrid/><PolarAngleAxis dataKey="v"/><PolarRadiusAxis domain={[0,100]}/><Radar name={A} dataKey="A" stroke="#3730d4" fill="#3730d4" fillOpacity={.3}/><Radar name={B} dataKey="B" stroke="#f59e0b" fill="#f59e0b" fillOpacity={.3}/><Legend/><Tooltip content={<Tip/>} cursor={{fill:"rgba(91,79,240,.08)"}}/></RadarChart></Chart></C>
  {gap&&A!==B&&<C t="Lecture automatique"><p>L'écart de score moyen entre <b>{A}</b> et <b>{B}</b> est de <b>{Math.abs(x.s-y.s)} points</b>. La variable qui les différencie le plus est <b>{gap.v}</b> ({gap.diff>0?A:B} plus exposé).</p><p className="note">Lecture descriptive : un écart n'établit pas une cause.</p></C>}</>}

export function Actions({d,src,go,loadDemo,open,anon}){
  const[pct,setPct]=useState(50)
  if(!src)return <Empty {...{go,loadDemo}}/>
  const org=orgRisk(d).map(o=>({...o,hi:d.filter(e=>e.lvl==='Élevé'&&e.fac.some(f=>f.k===o.k)).length})).sort((p,q)=>q.n-p.n)
  const pr=n=>n/d.length>=.4?['Haute','#dc2626']:n/d.length>=.2?['Moyenne','#f59e0b']:['Faible','#16a34a']
  const hi=d.filter(e=>e.lvl==='Élevé'),withSal=hi.filter(e=>e.sal!=null),cost=Math.round(withSal.reduce((s,e)=>s+e.sal*12,0)*pct/100)
  return <><h1>Plan d'action RH</h1><p className="sub">Du risque identifié aux actions à prioriser · pistes à discuter, pas des décisions automatiques</p>
  <C t="Priorités par facteur" s="Priorité selon la part de salariés concernés (≥ 40 % haute, ≥ 20 % moyenne)"><div className="wrap"><table><thead><tr><th>Priorité</th><th>Facteur</th><th>Salariés concernés</th><th>Dont risque élevé</th><th>Action RH proposée</th></tr></thead><tbody>
    {org.map(o=>{const[l,c]=pr(o.n);return <tr key={o.k}><td><span className="prio" style={{background:c}}>{l}</span></td><td><b>{VARS[o.k].f}</b></td><td>{o.n} ({Math.round(o.n/d.length*100)}%)</td><td>{o.hi}</td><td style={{whiteSpace:'normal',minWidth:260}}>{VARS[o.k].r}</td></tr>})}</tbody></table></div></C>
  <C t="Entretiens à planifier en priorité" s="Les 10 scores les plus élevés"><div className="wrap"><table><thead><tr><th>Salarié</th><th>Département</th><th>Score</th><th>Facteur principal</th><th></th></tr></thead><tbody>
    {[...d].sort((p,q)=>q.score-p.score).slice(0,10).map(e=><tr key={e.id}><td><Who e={e} anon={anon}/></td><td>{e.dept}</td><td><b>{e.score}</b> <Tag l={e.lvl}/></td><td>{e.fac[0]?VARS[e.fac[0].k].f:'—'}</td><td><button className="btn sm" onClick={()=>open(e.id)}>Profil</button></td></tr>)}</tbody></table></div></C>
  <C t="Exposition financière potentielle (hypothèse)" s="Estimation indicative, pas une prévision de départs">{withSal.length?<><p>Hypothèse de coût de remplacement : <input type="number" min="0" max="300" style={{width:80}} value={pct} onChange={e=>setPct(Math.max(0,+e.target.value||0))}/> % du salaire annuel (valeur modifiable, à justifier avec des données de l'entreprise).</p>
    <div className="grid k4"><div className="kpi"><small>Salariés à risque élevé</small><b>{hi.length}</b></div><div className="kpi"><small>Masse salariale annuelle</small><b>{Math.round(withSal.reduce((s,e)=>s+e.sal*12,0)).toLocaleString('fr-FR')}</b></div><div className="kpi" style={{'--c':'#dc2626'}}><small>Coût potentiel si tous partaient</small><b>{cost.toLocaleString('fr-FR')}</b></div></div>
    <p className="note">Hypothèses : colonne Salary lue comme salaire mensuel brut ; tous les salariés à risque élevé sont supposés partir, ce qui est un cas extrême.</p></>:<p>Ajoutez une colonne <b>Salary</b> à votre base pour activer cette analyse.</p>}</C></>}
