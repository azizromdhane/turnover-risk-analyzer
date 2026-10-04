import {useState,useMemo,useEffect} from 'react'
import * as XLSX from 'xlsx'
import {VARS,THRESH,compute,demo} from './scoring.js'
import {Home,Import,Dashboard,List,Profile,Method,Compare,Actions} from './Pages.jsx'

const NAV=[['home','Accueil'],['import','Importation'],['dashboard','Dashboard'],['list','Salariés'],['profile','Profil'],['compare','Comparaison'],['actions',"Plan d'action"],['method','Méthodologie']]
const PAGES={home:Home,import:Import,dashboard:Dashboard,list:List,profile:Profile,compare:Compare,actions:Actions,method:Method}
const W0=()=>Object.fromEntries(Object.entries(VARS).map(([k,v])=>[k,v.w]))

export default function App(){
  const[page,go]=useState('home'),[src,setSrc]=useState(null),[W,setW]=useState(W0),[T,setT]=useState(THRESH),[sel,setSel]=useState(null),[err,setErr]=useState(''),[anon,setAnon]=useState(false),[dark,setDark]=useState(false)
  useEffect(()=>{document.documentElement.dataset.theme=dark?'dark':'light'},[dark])
  const d=useMemo(()=>src?compute(src.rows,src.cols,W,T):[],[src,W,T])
  const load=(rows,name,isDemo)=>{if(!rows.length){setErr('Fichier vide.');return}setErr('');setSrc({rows,cols:Object.keys(rows[0]),name,isDemo})}
  const loadDemo=()=>{load(demo(),'Demo Dataset',true);go('dashboard')}
  const onFile=ev=>{const f=ev.target.files[0];if(!f)return;const r=new FileReader()
    r.onload=e=>{try{const wb=XLSX.read(e.target.result,{type:'array'});load(XLSX.utils.sheet_to_json(wb.Sheets[wb.SheetNames[0]],{defval:null}),f.name,false)}catch(x){setErr('Lecture impossible : '+x.message)}}
    r.readAsArrayBuffer(f)}
  const open=id=>{setSel(id);go('profile')}
  const search=e=>{if(e.key!=='Enter')return;const f=d.find(x=>[String(x.id),anon?'':x.name||''].some(v=>v.toLowerCase()===e.target.value.trim().toLowerCase()));if(f){open(f.id);e.target.value=''}else alert('Salarié introuvable')}
  const Page=PAGES[page]
  return <>
    <header className="top"><span className="brand" onClick={()=>go('home')}>📊 Turnover Risk Analyzer</span>
      <nav>{NAV.map(([k,l])=><button key={k} className={page===k?'on':''} onClick={()=>go(k)}>{l}</button>)}</nav>
      {src?.isDemo&&<span className="badge">Demo Dataset (fictif)</span>}
      <button className="ic" title="Masquer les noms (anonymisation)" onClick={()=>setAnon(!anon)}>{anon?'🔒 Mode anonyme':'👁 Noms visibles'}</button><button className="ic" onClick={()=>setDark(!dark)}>{dark?'☀️':'🌙'}</button>
      <input className="srch" placeholder="Rechercher un salarié (ID ou nom) + Entrée" onKeyDown={search}/></header>
    <main className="main" key={page}><Page {...{anon,d,src,T,W,setW,setT,go,open,sel,load,loadDemo,onFile,err}}/></main>
    <footer className="foot noprint">Turnover Risk Analyzer · Projet universitaire Management des Affaires / RH · Le score est un indicateur d'aide à la décision, pas une prédiction. Mode démo : données fictives.</footer>
  </>
}
