// Configuration (variables, poids, grilles de risque) et calcul du score.
/* ===== MÉTHODE : SCORING PAR GRILLES DE RISQUE =====
   Pour chaque facteur, la valeur du salarié est rangée dans une tranche.
   La tranche donne un score de risque de 0 à 100.
   Contribution du facteur = score de risque × poids ÷ 100
   Score final = somme des contributions (sur 100).
   Les grilles ci-dessous sont construites à partir des 150 salariés du fichier
   de démonstration (min, max, quartiles) et sont modifiables dans la page Méthodologie.
   Convention : borne supérieure incluse, borne inférieure exclue. */

export const VARS = { // clé:{libellé, poids par défaut, noms de colonnes acceptés, facteur, reco}
  sat:{l:'Satisfaction',w:20,al:['satisfaction'],f:'Satisfaction faible',r:'Prévoir un entretien individuel ou une enquête de satisfaction.'},
  ten:{l:'Ancienneté',w:15,al:['tenure','anciennete','seniority'],f:'Ancienneté faible (risque d\'intégration)',r:"Soigner l'intégration et l'accompagnement des nouveaux salariés."},
  se:{l:'Évolution salariale',w:15,al:['salaryevolution','evolutionsalariale'],f:'Faible évolution salariale',r:"Étudier la politique d'évolution salariale."},
  abs:{l:'Absentéisme',w:15,al:['absenteeism','absenteisme'],f:'Absentéisme important',r:"Identifier les causes et analyser la situation avec le service RH."},
  wl:{l:'Charge de travail',w:15,al:['workload','chargedetravail'],f:'Charge de travail élevée',r:'Analyser la charge et la répartition des tâches.'},
  ot:{l:'Heures supplémentaires',w:10,al:['overtime','heuressupplementaires'],f:'Heures supplémentaires élevées',r:"Examiner le recours aux heures supplémentaires et l'équilibre vie pro/perso."},
  cp:{l:'Évolution de carrière',w:10,al:['careerprogression','evolutiondecarriere'],f:'Faible évolution de carrière',r:"Proposer une discussion sur les perspectives d'évolution, la formation ou la mobilité interne."}};

export const OPT={id:['employeeid','id'],name:['name','nom','fullname','nomcomplet','employeename','nomprenom'],dept:['department','departement'],job:['jobposition','poste'],salary:['salary','salaire']};

/* Grilles de risque : 4 tranches simples par facteur. rows trié par max croissant, last max = Infinity.
   Convention : borne supérieure incluse, borne inférieure exclue. */
export const GRID={
 sat:{u:'note / 5',just:"Une satisfaction faible est le signal le plus direct d'un désengagement.",
  rows:[{max:2,score:100},{max:3,score:70},{max:4,score:40},{max:Infinity,score:10}]},
 ten:{u:'années',just:"Moins d'un an : risque d'intégration. À partir de 5 ans : profil stable, risque faible.",
  rows:[{max:1,score:100},{max:2,score:30},{max:5,score:40},{max:Infinity,score:20}]},
 se:{u:'% par an',just:"Une faible augmentation salariale est mal perçue et pousse à chercher ailleurs.",
  rows:[{max:2,score:100},{max:4,score:70},{max:6,score:40},{max:Infinity,score:10}]},
 abs:{u:'jours / an',just:"Plus l'absentéisme est élevé, plus le risque augmente. Seuils proches de 2 %, 4 % et 6 % des jours ouvrés.",
  rows:[{max:4,score:10},{max:8,score:40},{max:13,score:70},{max:Infinity,score:100}]},
 wl:{u:'note / 5',just:"Une charge trop élevée favorise la fatigue, le stress et le départ.",
  rows:[{max:2,score:10},{max:3,score:40},{max:4,score:70},{max:Infinity,score:100}]},
 ot:{u:'heures / mois',just:"Trop d'heures supplémentaires déséquilibre la vie professionnelle et personnelle.",
  rows:[{max:5,score:10},{max:15,score:40},{max:25,score:70},{max:Infinity,score:100}]},
 cp:{u:'note / 5',just:"Sans perspective d'évolution, les salariés cherchent des opportunités ailleurs.",
  rows:[{max:2,score:100},{max:3,score:70},{max:4,score:40},{max:Infinity,score:10}]}};

export const THRESH=[40,70]; // seuils du score final : <40 faible, <70 moyen, sinon élevé

/* ===== OUTILS ===== */
export const nz=s=>String(s).toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[^a-z0-9]/g,'');
export const num=v=>{const x=parseFloat(String(v).replace(',','.'));return isNaN(x)?null:x};
export const lvlOf=(s,t)=>s<t[0]?'Faible':s<t[1]?'Moyen':'Élevé';
export const riskLvl=s=>s>=65?'Élevé':s>=35?'Moyen':'Faible';
export const COL={Faible:'var(--g)',Moyen:'var(--o)','Élevé':'var(--r)'};
export function mapCols(cols){const m={};const all={...Object.fromEntries(Object.entries(VARS).map(([k,v])=>[k,v.al])),...OPT};
 for(const k in all){const c=cols.find(c=>all[k].includes(nz(c)));if(c)m[k]=c}return m}

/* Cherche la tranche d'une valeur dans une grille (triée par max croissant) */
export function gridScore(grid,v){
 const rows=[...grid.rows].sort((a,b)=>a.max-b.max);
 let lo=-Infinity;
 for(const r of rows){if(v<=r.max)return{score:r.score,lo,hi:r.max};lo=r.max}
 const last=rows[rows.length-1]||{score:0};
 return{score:last.score,lo,hi:Infinity};
}
/* Applique la méthode à toutes les lignes */
export function compute(rows,cols,W,T,G=GRID){
 const m=mapCols(cols),avail=Object.keys(VARS).filter(k=>m[k]);
 const sw=avail.reduce((s,k)=>s+(+W[k]||0),0);
 return rows.map((r,i)=>{
  const f=[];
  for(const k of avail){
   const v=num(r[m[k]]);if(v===null)continue;
   const g=G[k]||GRID[k];if(!g||!g.rows?.length)continue;
   const h=gridScore(g,v),s=Math.max(0,Math.min(100,h.score));
   f.push({k,v,s,q:s/100,w:+W[k]||0,pts:sw?s*(+W[k]||0)/sw:0,lo:h.lo,hi:h.hi,lvl:riskLvl(s)});
  }
  const score=Math.round(f.reduce((a,x)=>a+x.pts,0));
  return{id:m.id?r[m.id]:'E'+(i+1),name:m.name?r[m.name]:null,sal:m.salary?num(r[m.salary]):null,dept:m.dept?r[m.dept]:'—',job:m.job?r[m.job]:'—',ten:m.ten?num(r[m.ten]):null,sat:m.sat?num(r[m.sat]):null,abs:m.abs?num(r[m.abs]):null,wl:m.wl?num(r[m.wl]):null,raw:r,score,lvl:lvlOf(score,T),
   all:f,fac:f.filter(x=>x.s>=65).sort((a,b)=>b.pts-a.pts)}});
}
/* Exemple pédagogique : Ines Haddad (ligne réelle du fichier de démonstration) */
export const INES={Employee_ID:'EMP-011',Name:'Ines Haddad',Department:'IT',Job_Position:'Administrateur systèmes',Tenure:1.4,Salary:3650,Salary_Evolution:2.2,Absenteeism:17,Satisfaction:1.1,Workload:4.7,Overtime:32,Career_Progression:1};

/* Jeu de données PÉDAGOGIQUE (Demo Dataset, fictif) */
export function demo(){let s=7;const F=['Mohamed','Ahmed','Youssef','Karim','Mehdi','Amine','Sarra','Ines','Amel','Rim','Nour','Salma','Hela','Yasmine','Emna','Rania'],L=['Ben Ali','Trabelsi','Gharbi','Jebali','Mansouri','Chaabane','Khelifi','Hamdi','Sassi','Mejri','Ayadi','Dridi'];const R=()=>(s=(s*16807)%2147483647)/2147483647,D=['Ventes','Production','Finance','IT','Marketing'],J=['Analyste','Technicien','Assistant','Responsable'];
 return Array.from({length:60},(_,i)=>{const z=R();return{Employee_ID:'DEMO-'+String(i+1).padStart(3,'0'),Name:F[i%16]+' '+L[(i*7+Math.floor(i/16))%12],Department:D[i%5],Job_Position:J[Math.floor(R()*4)],Tenure:+(R()*15+.2).toFixed(1),
 Satisfaction:+Math.max(1,Math.min(5,5-z*3+R()*1.2)).toFixed(1),Absenteeism:Math.round(z*14+R()*5),Workload:+Math.max(1,Math.min(5,1+z*3+R()*1.5)).toFixed(1),
 Overtime:Math.round(z*25+R()*6),Salary_Evolution:+(8-z*6+R()*2).toFixed(1),Career_Progression:+Math.max(1,Math.min(5,4.5-z*3+R())).toFixed(1)}})}
