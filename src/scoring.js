// Configuration (variables, poids, seuils) et calcul du score.
/* ===== CONFIGURATION (modifiable) ===== */
export const VARS={ // clé:{libellé, poids par défaut, noms de colonnes acceptés, sens du risque, facteur, reco}
 sat:{l:'Satisfaction',w:20,al:['satisfaction'],dir:'low',f:'Satisfaction faible',r:'Prévoir un entretien individuel ou une enquête de satisfaction.'},
 ten:{l:'Ancienneté',w:15,al:['tenure','anciennete','seniority'],dir:'tenure',f:'Ancienneté à risque (très faible ou très élevée)',r:"Soigner l'intégration ou discuter des perspectives pour les profils de longue date."},
 se:{l:'Évolution salariale',w:15,al:['salaryevolution','evolutionsalariale'],dir:'low',f:'Faible évolution salariale',r:"Étudier la politique d'évolution salariale."},
 abs:{l:'Absentéisme',w:15,al:['absenteeism','absenteisme'],dir:'high',f:'Absentéisme important',r:"Identifier les causes et analyser la situation avec le service RH."},
 wl:{l:'Charge de travail',w:15,al:['workload','chargedetravail'],dir:'high',f:'Charge de travail élevée',r:'Analyser la charge et la répartition des tâches.'},
 ot:{l:'Heures supplémentaires',w:10,al:['overtime','heuressupplementaires'],dir:'high',f:'Heures supplémentaires élevées',r:"Examiner le recours aux heures supplémentaires et l'équilibre vie pro/perso."},
 cp:{l:'Évolution de carrière',w:10,al:['careerprogression','evolutiondecarriere'],dir:'low',f:'Faible évolution de carrière',r:"Proposer une discussion sur les perspectives d'évolution, la formation ou la mobilité interne."}};
export const OPT={id:['employeeid','id'],name:['name','nom','fullname','nomcomplet','employeename','nomprenom'],dept:['department','departement'],job:['jobposition','poste'],salary:['salary','salaire']};
export const THRESH=[40,70]; // seuils: <40 faible, <70 moyen, sinon élevé
/* Ancienneté (années) : très faible = risque fort ; très forte = risque modéré */
export const tenRisk=t=>t<1?1:t<3?.7:t<5?.4:t<10?.2:t>=20?.4:.25;
/* ===== OUTILS ===== */
export const nz=s=>String(s).toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[^a-z0-9]/g,'');
export const num=v=>{const x=parseFloat(String(v).replace(',','.'));return isNaN(x)?null:x};
export const lvlOf=(s,t)=>s<t[0]?'Faible':s<t[1]?'Moyen':'Élevé';
export const COL={Faible:'var(--g)',Moyen:'var(--o)','Élevé':'var(--r)'};
export function mapCols(cols){const m={};const all={...Object.fromEntries(Object.entries(VARS).map(([k,v])=>[k,v.al])),...OPT};
 for(const k in all){const c=cols.find(c=>all[k].includes(nz(c)));if(c)m[k]=c}return m}
export function compute(rows,cols,W,T){const m=mapCols(cols),st={};
 for(const k in VARS){if(!m[k])continue;const v=rows.map(r=>num(r[m[k]])).filter(x=>x!==null);if(v.length)st[k]=[Math.min(...v),Math.max(...v)]}
 return rows.map((r,i)=>{const f=[];let sw=0,sp=0;
  for(const k in st){const v=num(r[m[k]]);if(v===null)continue;const[a,b]=st[k];let q;
   if(VARS[k].dir==='tenure')q=tenRisk(v);else{const n=(v-a)/((b-a)||1);q=VARS[k].dir==='low'?1-n:n}
   sw+=W[k];f.push({k,v,q,w:W[k]})}
  f.forEach(x=>{x.pts=sw?x.w*x.q/sw*100:0;sp+=x.pts});
  const score=Math.round(sp);
  return{id:m.id?r[m.id]:'E'+(i+1),name:m.name?r[m.name]:null,sal:m.salary?num(r[m.salary]):null,dept:m.dept?r[m.dept]:'—',job:m.job?r[m.job]:'—',ten:m.ten?num(r[m.ten]):null,sat:m.sat?num(r[m.sat]):null,abs:m.abs?num(r[m.abs]):null,wl:m.wl?num(r[m.wl]):null,raw:r,score,lvl:lvlOf(score,T),
   all:f,fac:f.filter(x=>x.q>=.5).sort((a,b)=>b.pts-a.pts)}})}
/* Jeu de données PÉDAGOGIQUE (Demo Dataset, fictif) */
export function demo(){let s=7;const F=['Mohamed','Ahmed','Youssef','Karim','Mehdi','Amine','Sarra','Ines','Amel','Rim','Nour','Salma','Hela','Yasmine','Emna','Rania'],L=['Ben Ali','Trabelsi','Gharbi','Jebali','Mansouri','Chaabane','Khelifi','Hamdi','Sassi','Mejri','Ayadi','Dridi'];const R=()=>(s=(s*16807)%2147483647)/2147483647,D=['Ventes','Production','Finance','IT','Marketing'],J=['Analyste','Technicien','Assistant','Responsable'];
 return Array.from({length:60},(_,i)=>{const z=R();return{Employee_ID:'DEMO-'+String(i+1).padStart(3,'0'),Name:F[i%16]+' '+L[(i*7+Math.floor(i/16))%12],Department:D[i%5],Job_Position:J[Math.floor(R()*4)],Tenure:+(R()*15+.2).toFixed(1),
 Satisfaction:+Math.max(1,Math.min(5,5-z*3+R()*1.2)).toFixed(1),Absenteeism:Math.round(z*14+R()*5),Workload:+Math.max(1,Math.min(5,1+z*3+R()*1.5)).toFixed(1),
 Overtime:Math.round(z*25+R()*6),Salary_Evolution:+(8-z*6+R()*2).toFixed(1),Career_Progression:+Math.max(1,Math.min(5,4.5-z*3+R())).toFixed(1)}})}
