const lines={
1:["تجریش","قیطریه","شهید صدر","قلهک","دکتر شریعتی","میرداماد","شهید حقانی","شهید همت","مصلی امام خمینی","شهید بهشتی","شهید مفتح","طالقانی","دروازه دولت","سعدی","امام خمینی","پانزده خرداد","خیام","میدان محمدیه","شوش","پایانه جنوب","شهید بخارایی","علی‌آباد","جوانمرد قصاب","شهرری","پالایشگاه","باقرشهر","کهریزک"],
2:["فرهنگسرا","تهرانپارس","شهید باقری","دانشگاه علم و صنعت","سرسبز","جانبازان","فدک","سبلان","مدنی","امام حسین","بهارستان","ملت","امام خمینی","حسن‌آباد","دانشگاه امام علی","میدان حر","شهید نواب صفوی","شادمان","دانشگاه شریف","طرشت","صادقیه"],
3:["قائم","نوبنیاد","حسین‌آباد","هروی","شهید زین‌الدین","خواجه عبدالله انصاری","شهید صیاد شیرازی","شهید قدوسی","سهروردی","شهید بهشتی","میرزای شیرازی","میدان جهاد","میدان ولیعصر","تئاتر شهر","منیریه","مهدیه","راه‌آهن","جوادیه","زمزم","عبدل‌آباد","نعمت‌آباد","آزادگان"],
4:["شهید کلاهدوز","نیروی هوایی","نبرد","پیروزی","ابن‌سینا","میدان شهدا","دروازه شمیران","دروازه دولت","فردوسی","تئاتر شهر","میدان انقلاب اسلامی","توحید","شادمان","دکتر حبیب‌الله","استاد معین","میدان آزادی","بیمه","شهرک اکباتان","ارم سبز","علامه جعفری"]
};
const transfers=[["شهید بهشتی",1,3],["دروازه دولت",1,4],["امام خمینی",1,2],["دروازه شمیران",2,4],["شادمان",2,4],["تئاتر شهر",3,4]];
const norm=s=>s.replace(/[يى]/g,"ی").replace(/ك/g,"ک").replace(/‌/g,"").replace(/\s+/g,"").trim();
const graph=new Map(), names=new Map();
function add(n,l){const id=norm(n)+"|"+l;if(!graph.has(id))graph.set(id,[]);names.set(id,n);return id}
for(const [l,arr] of Object.entries(lines)){arr.forEach((n,i)=>{const id=add(n,+l);if(i){const prev=norm(arr[i-1])+"|"+l;graph.get(id).push([prev,1]);graph.get(prev).push([id,1]);}})}
for(const [n,a,b] of transfers){const x=norm(n)+"|"+a,y=norm(n)+"|"+b;if(graph.has(x)&&graph.has(y)){graph.get(x).push([y,3]);graph.get(y).push([x,3]);}}
const stationNames=[...new Set(Object.values(lines).flat())].sort((a,b)=>a.localeCompare(b,'fa'));
const from=document.getElementById('from'),to=document.getElementById('to');
for(const n of stationNames){for(const el of [from,to]){const o=document.createElement('option');o.value=n;o.textContent=n;el.append(o)}}
document.getElementById('swap').onclick=()=>{const x=from.value;from.value=to.value;to.value=x};
function shortest(start,end){const starts=[...graph.keys()].filter(k=>k.startsWith(norm(start)+'|'));const ends=new Set([...graph.keys()].filter(k=>k.startsWith(norm(end)+'|')));const d=new Map(),prev=new Map(),used=new Set();starts.forEach(s=>d.set(s,0));while(true){let u=null,best=Infinity;for(const [k,v] of d)if(!used.has(k)&&v<best){u=k;best=v}if(!u||best===Infinity)break;if(ends.has(u)){const path=[];for(let x=u;x;x=prev.get(x)?.[0])path.unshift({id:x,via:prev.get(x)?.[1]});return path}used.add(u);for(const [v,w] of graph.get(u)||[]){const nd=best+w;if(nd<(d.get(v)??Infinity)){d.set(v,nd);prev.set(v,[u,w])}}}return null}
function render(){const a=from.value,b=to.value;if(!a||!b){alert('لطفاً مبدأ و مقصد را انتخاب کن.');return}if(norm(a)===norm(b)){alert('مبدأ و مقصد نمی‌توانند یکسان باشند.');return}const path=shortest(a,b);if(!path){alert('برای این دو ایستگاه مسیری در داده‌های فعلی پیدا نشد.');return}
const stations=path.map(p=>({name:names.get(p.id),line:+p.id.split('|').pop()}));let changes=0,ride=0,walk=0;for(let i=1;i<stations.length;i++){if(stations[i].line!==stations[i-1].line){changes++;walk+=4}else ride+=2.5}
const now=new Date(),h=now.getHours(),peak=(h>=7&&h<9)||(h>=16&&h<19),headway=peak?5:10,firstWait=headway/2,transferWait=changes*headway/2,total=Math.round(ride+walk+firstWait+transferWait);
document.getElementById('duration').textContent=total;document.getElementById('count').textContent=stations.length;document.getElementById('changes').textContent=changes;document.getElementById('transferBadge').textContent=changes?changes+' بار تعویض خط':'بدون تعویض خط';
const transferSet=new Set(transfers.map(t=>norm(t[0])));document.getElementById('timeline').innerHTML=stations.map((s,i)=>{const changed=i>0&&stations[i].line!==stations[i-1].line;return `<div class="stop ${changed?'transfer':''}"><div class="rail"><i class="dot"></i></div><div><b>${s.name}</b><small>خط ${s.line}${changed?' · تعویض خط':''}</small></div></div>`}).join('');
document.getElementById('map').innerHTML=stations.map((s,i)=>`<div class="mapnode ${(i>0&&s.line!==stations[i-1].line)?'transfer':''}"><i></i><span>${s.name}</span></div>`).join('');
document.getElementById('timeBreakdown').textContent=`برآورد زمان: حدود ${Math.round(ride)} دقیقه حرکت قطار + ${walk} دقیقه پیاده‌روی تعویض + ${Math.round(firstWait+transferWait)} دقیقه انتظار. فاصله حرکت فرضی قطار: ${headway} دقیقه. زمان رسیدن دقیق و زنده نیست.`;
document.getElementById('result').classList.add('show');document.getElementById('result').scrollIntoView({behavior:'smooth',block:'start'});
}
document.getElementById('search').onclick=render;