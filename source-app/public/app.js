(function(){
'use strict';
var AR='٠١٢٣٤٥٦٧٨٩';
function ar(n){return String(n).replace(/[0-9]/g,function(d){return AR[+d]})}
function $(s){return document.querySelector(s)}
function pad(n){return (n<10?'0':'')+n}
function key(d){return d.getFullYear()+'-'+pad(d.getMonth()+1)+'-'+pad(d.getDate())}
function parse(k){var p=k.split('-');return new Date(+p[0],+p[1]-1,+p[2],12)}
function addD(k,n){var d=parse(k);d.setDate(d.getDate()+n);return key(d)}
function today(){return key(new Date())}
function isFri(k){return parse(k).getDay()===5}
function hm(t){var d=new Date(t),h=d.getHours(),m=d.getMinutes(),s=h<12?'ص':'م';h=h%12;if(h===0)h=12;return ar(h)+':'+ar(pad(m))+' '+s}
function hmMin(m){var h=Math.floor(m/60),mm=m%60,s=h<12?'ص':'م',h2=h%12;if(h2===0)h2=12;return ar(h2)+':'+ar(pad(mm))+' '+s}

/* ---------- bridge (or a browser stand-in for previews) ---------- */
var B=window.SN,isWeb=!B;
if(!B){
  var LS=window.localStorage;
  var readSt=function(){try{return JSON.parse(LS.getItem('st')||'{}')}catch(e){return{}}};
  var solar=function(k){var st=readSt(),loc=st.loc||{},lat=typeof loc.lat==='number'?loc.lat:24.4672,lon=typeof loc.lon==='number'?loc.lon:39.6111,p=k.split('-').map(Number),y=p[0],m=p[1],d=p[2];
    function d2r(x){return x*Math.PI/180}function r2d(x){return x*180/Math.PI}function fx(a,b){return((a%b)+b)%b}
    var mid=new Date(y,m-1,d,0,0,0).getTime(),tz=-new Date(y,m-1,d,12).getTimezoneOffset()/60;
    var Y=y,M=m;if(M<=2){Y--;M+=12}var A=Math.floor(Y/100),Bb=2-A+Math.floor(A/4);
    var jd=Math.floor(365.25*(Y+4716))+Math.floor(30.6001*(M+1))+d+Bb-1524.5+0.5-lon/360,D=jd-2451545;
    var g=fx(357.529+0.98560028*D,360),q=fx(280.459+0.98564736*D,360),L=fx(q+1.915*Math.sin(d2r(g))+0.02*Math.sin(d2r(2*g)),360),e=23.439-0.00000036*D;
    var ra=fx(r2d(Math.atan2(Math.cos(d2r(e))*Math.sin(d2r(L)),Math.cos(d2r(L))))/15,24),dec=r2d(Math.asin(Math.sin(d2r(e))*Math.sin(d2r(L)))),eqt=q/15-ra;
    var noon=fx(12+tz-lon/15-eqt,24);function T(a){var v=(-Math.sin(d2r(a))-Math.sin(d2r(dec))*Math.sin(d2r(lat)))/(Math.cos(d2r(dec))*Math.cos(d2r(lat)));return r2d(Math.acos(Math.max(-1,Math.min(1,v))))/15}
    var asrA=-r2d(Math.atan(1/(1+Math.tan(d2r(Math.abs(lat-dec)))))),H=3600000,ss=noon+T(0.833);
    return {fajr:mid+(noon-T(18.5))*H,sunrise:mid+(noon-T(0.833))*H,dhuhr:mid+(noon+1/60)*H,asr:mid+(noon+T(asrA))*H,maghrib:mid+ss*H,isha:mid+(ss+1.5)*H}};
  B={state:function(){return LS.getItem('st')||'{}'},
     mark:function(d,id,v){var j=readSt();j.days=j.days||{};j.days[d]=j.days[d]||{};j.days[d][id]=v;if(!j.start)j.start=d;LS.setItem('st',JSON.stringify(j));if(typeof armWebAlarms==='function')armWebAlarms()},
     put:function(k,v){var j=readSt();j[k]=JSON.parse(v);if(k==='loc'||k==='off'||k==='sabahAt'||k==='masaAt'||k==='azkarOn'||k==='notif'||k==='habits'){TM={};if(j.fired&&j.firedDay===today()){var nk=today()+':';for(var fk in j.fired){if(fk.indexOf(nk)===0)delete j.fired[fk]}}}LS.setItem('st',JSON.stringify(j));if(typeof armWebAlarms==='function')armWebAlarms()},
     times:function(k){return JSON.stringify(solar(k))},
     askNotif:function(){if(!('Notification' in window))return;if(Notification.permission==='default'){try{Notification.requestPermission().then(function(){render()})}catch(e){}}else if(Notification.permission==='denied'){toast('فعّل الإشعارات من المتصفح — والتنبيه الداخلي شغّال')}},
     notifOk:function(){return !('Notification' in window)||Notification.permission==='granted'},
     exactOk:function(){return true},askExact:function(){},
     test:function(kind){if(typeof fireWebAlarm==='function')fireWebAlarm(kind||'dhuhr',today(),true);else toast('🔔 (تجربة)')},
     fullOk:function(){return true},askFull:function(){},hear:function(){},
     locate:function(){if(navigator.geolocation){navigator.geolocation.getCurrentPosition(function(pos){window.onEv({ev:'loc',lat:pos.coords.latitude,lon:pos.coords.longitude})},function(){window.onEv({ev:'loc',lat:24.4672,lon:39.6111})},{timeout:4000})}else{setTimeout(function(){window.onEv({ev:'loc',lat:24.4672,lon:39.6111})},300)}},
     share:function(txt){if(navigator.share){navigator.share({text:txt}).catch(function(){})}else if(navigator.clipboard&&navigator.clipboard.writeText){navigator.clipboard.writeText(txt).then(function(){toast('تم نسخ نص المشاركة 📋')})}else{toast(txt)}}};
}
var S={};
function load(){try{S=JSON.parse(B.state())}catch(e){S={}}S.days=S.days||{};S.habits=S.habits||[];S.stage=S.stage||{}}
function put(k,v){S[k]=v;B.put(k,JSON.stringify(v))}

/* ---------- the two tracks ---------- */
var ITEMS={
 dhA:{n:'بعدية الظهر',r:'ركعتين',w:'بعد صلاة الظهر',ic:'🌤️',pr:'dhuhr'},
 mag:{n:'سنة المغرب',r:'ركعتين',w:'بعد صلاة المغرب',ic:'🌇',pr:'maghrib'},
 isha:{n:'سنة العشاء',r:'ركعتين',w:'بعد صلاة العشاء',ic:'🌙',pr:'isha'},
 fajr:{n:'سنة الفجر',r:'ركعتين',w:'قبل صلاة الفجر',ic:'🌅',pr:'fajr',d:'«ركعتا الفجر خير من الدنيا وما فيها»'},
 dhB:{n:'قبلية الظهر',r:'٤ ركعات',w:'قبل صلاة الظهر',ic:'☀️',pr:'dhuhr',d:'من الرواتب الـ١٢ اللي يُبنى بها بيت في الجنة'},
 witr:{n:'الوتر',r:'١ أو ٣',w:'بعد العشاء وقبل الفجر',ic:'✨',d:'«إن الله وتر يحب الوتر»'},
 duha:{n:'صلاة الضحى',r:'ركعتين+',w:'بعد الشروق بربع ساعة إلى قبل الظهر',ic:'🌞',d:'تجزئ عن صدقة كل مفصل فيك'},
 asr4:{n:'٤ قبل العصر',r:'٤ ركعات',w:'قبل صلاة العصر',ic:'🕓',pr:'asr',d:'«رحم الله امرأً صلى قبل العصر أربعاً»'},
 qiyam:{n:'قيام الليل',r:'ركعتين+',w:'آخر الليل قبل الفجر',ic:'🌌',d:'«أفضل الصلاة بعد الفريضة صلاة الليل»'},
 wudu:{n:'ركعتين بعد الوضوء',r:'ركعتين',w:'بعد ما تتوضأ',ic:'💧',d:'سنة بلال رضي الله عنه'},
 sabah:{n:'أذكار الصباح',r:'',w:'',ic:'🌄',read:'sabah'},
 masa:{n:'أذكار المساء',r:'',w:'',ic:'🌆',read:'masa'},
 kahf:{n:'سورة الكهف',r:'',w:'يوم الجمعة',ic:'📖',fri:1,d:'«من قرأ سورة الكهف يوم الجمعة أضاء له من النور ما بين الجمعتين»'},
 jumua:{n:'دعاء آخر ساعة من الجمعة',r:'',w:'قبل المغرب بساعة',ic:'🤲',fri:1,d:'ساعة الإجابة: «فالتمسوها آخر ساعة بعد العصر»'},
 nawm:{n:'أذكار النوم',r:'',w:'قبل تنام',ic:'😴',read:'nawm',d:'آية الكرسي والمعوذات و«باسمك ربي وضعت جنبي»'},
 salat:{n:'أذكار بعد الصلاة',r:'',w:'بعد كل فرض',ic:'📿',d:'الاستغفار ٣، والتسبيح ٣٣ والتحميد ٣٣ والتكبير ٣٣، وآية الكرسي'},
 istig:{n:'الاستغفار ١٠٠',r:'',w:'بأي وقت',ic:'💚',count:100,d:'«إني لأستغفر الله في اليوم مئة مرة»'},
 salawat:{n:'الصلاة على النبي ﷺ',r:'',w:'١٠ مرات أو أكثر',ic:'🌹',count:10,d:'«من صلى علي صلاة صلى الله عليه بها عشراً»'},
 adhan:{n:'الدعاء بين الأذان والإقامة',r:'',w:'كل صلاة',ic:'🕌',d:'«الدعاء لا يُرد بين الأذان والإقامة»'},
 mulk:{n:'سورة الملك',r:'',w:'كل ليلة',ic:'📗',d:'تشفع لصاحبها حتى يُغفر له'},
 tardid:{n:'الترديد مع المؤذن',r:'',w:'كل أذان + الدعاء بعده',ic:'📢',d:'«اللهم رب هذه الدعوة التامة…» حلّت له شفاعتي'},
 tahlil:{n:'التهليل ١٠٠',r:'',w:'بأي وقت',ic:'☝️',count:100,d:'«لا إله إلا الله وحده لا شريك له، له الملك وله الحمد وهو على كل شيء قدير» عدل عشر رقاب'},
 tasbih:{n:'سبحان الله وبحمده ١٠٠',r:'',w:'بأي وقت',ic:'🌿',count:100,d:'حُطّت خطاياه وإن كانت مثل زبد البحر'},
 wird:{n:'ورد القرآن',r:'',w:'صفحة أو أكثر يومياً',ic:'📖',d:'«اقرؤوا القرآن فإنه يأتي يوم القيامة شفيعاً لأصحابه»'},
 thuluth:{n:'دعاء الثلث الأخير',r:'',w:'آخر الليل قبل الفجر',ic:'🌌',d:'«ينزل ربنا… من يدعوني فأستجيب له»'},
 siyam:{n:'صيام الاثنين والخميس',r:'',w:'يوم الاثنين والخميس',ic:'🌙',wd:[1,4],d:'«تُعرض الأعمال يوم الاثنين والخميس فأحب أن يُعرض عملي وأنا صائم»'},
 tahiya:{n:'تحية المسجد',r:'ركعتين',w:'إذا دخلت المسجد',ic:'🕌',d:'«إذا دخل أحدكم المسجد فلا يجلس حتى يصلي ركعتين»'},
 jamaa:{n:'الصلوات بالمسجد',r:'',w:'الفروض جماعة',ic:'👥',count:5,cnt:'فرض',d:'صلاة الجماعة تفضل صلاة الفذ بسبع وعشرين درجة'},
 takbir:{n:'التبكير للجمعة',r:'',w:'يوم الجمعة',ic:'🚶',fri:1,d:'«من راح في الساعة الأولى فكأنما قرّب بدنة»'}};
for(var _k in ITEMS)ITEMS[_k].id=_k;
var TR={
 sunan:{n:'السنن',ic:'🕌',base:['dhA','mag','isha'],ladder:['fajr','dhB','witr','duha','asr4','qiyam','wudu','tahiya','jamaa','takbir'],comp:['witr','duha','qiyam']},
 azkar:{n:'الأذكار والأدعية',ic:'📿',base:['sabah','masa','kahf','jumua'],ladder:['salat','nawm','mulk','istig','salawat','adhan','tardid','tahlil','tasbih','wird','thuluth','siyam'],comp:['istig']}};
var STAGE=90;
function on(t){return t==='sunan'||S.azkarOn===true}
function req(t,k){var T=TR[t],l=T.base.concat(T.ladder.filter(function(x){return S.habits.indexOf(x)>=0}));return l.filter(function(x){var it=ITEMS[x];if(it.fri&&!isFri(k))return false;if(it.wd&&it.wd.indexOf(parse(k).getDay())<0)return false;return true}).map(function(x){return ITEMS[x]})}
function dayObj(k){return S.days[k]||{}}
function doneN(t,k){var d=dayObj(k);return req(t,k).filter(function(s){return d[s.id]===1}).length}
function pct(t,k){var n=req(t,k).length;return n?Math.round(100*doneN(t,k)/n):100}
function missN(t,k){return req(t,k).length-doneN(t,k)}
function compKey(t){return t==='sunan'?'comp':'compZ'}
function maxComp(t){return t==='sunan'?2:1}
function startOf(t){return (t==='azkar'?S.azkarStart:S.start)||today()}
function dayOk(t,k){if(k<startOf(t))return false;var m=missN(t,k);return m===0||(m<=maxComp(t)&&dayObj(k)[compKey(t)]===1)}
function streakAt(t,k){var n=0,c=k;while(dayOk(t,c)){n++;c=addD(c,-1);if(n>4000)break}return n}
function streak(t){var k=today();return dayOk(t,k)?streakAt(t,k):streakAt(t,addD(k,-1))}
function best(t){var b=0,run=0,prev=null;Object.keys(S.days).sort().forEach(function(k){if(dayOk(t,k)){run=(prev&&addD(prev,1)===k)?run+1:1;prev=k;if(run>b)b=run}else{run=0;prev=null}});return Math.max(b,streak(t))}
function stageStreak(t){var from=S.stage[t],n=0,c=dayOk(t,today())?today():addD(today(),-1);while(dayOk(t,c)&&(!from||c>=from)){n++;c=addD(c,-1);if(n>4000)break}return n}
function compOpts(t){var T=TR[t];var o=T.comp.filter(function(x){return S.habits.indexOf(x)<0});return o.length?o:[t==='sunan'?'nafl':'istig']}
ITEMS.nafl={id:'nafl',n:'ركعتين نافلة',ic:'🤲'};

/* ---------- prayer times ---------- */
var TM={};
function times(k){if(!TM[k])TM[k]=JSON.parse(B.times(k));return TM[k]}
var PN={fajr:'الفجر',sunrise:'الشروق',dhuhr:'الظهر',asr:'العصر',maghrib:'المغرب',isha:'العشاء'};
function nextPrayer(){var now=Date.now(),t=times(today()),o=['fajr','sunrise','dhuhr','asr','maghrib','isha'];for(var i=0;i<o.length;i++)if(t[o[i]]>now)return{k:o[i],at:t[o[i]]};return{k:'fajr',at:times(addD(today(),1)).fajr}}
function left(ms){var m=Math.max(0,Math.round(ms/60000)),h=Math.floor(m/60);m=m%60;return h?ar(h)+' س '+ar(m)+' د':ar(m)+' دقيقة'}
function sabahMin(){return typeof S.sabahAt==='number'?S.sabahAt:480}
function itemWhen(s,k){var t=times(k);if(s.pr)return hm(t[s.pr]);if(s.id==='sabah')return 'الساعة '+hmMin(sabahMin());if(s.id==='masa')return S.masaAt==='adhan'?'مع أذان المغرب ('+hm(t.maghrib)+')':'قبل المغرب بربع ساعة ('+hm(t.maghrib-15*60000)+')';if(s.id==='jumua')return 'من '+hm(t.maghrib-60*60000)+' إلى المغرب';return ''}

/* ---------- adhkar texts (from حصن المسلم) ---------- */
var Z={
 sabah:[
  ['آية الكرسي: «الله لا إله إلا هو الحي القيوم، لا تأخذه سنة ولا نوم، له ما في السماوات وما في الأرض، من ذا الذي يشفع عنده إلا بإذنه، يعلم ما بين أيديهم وما خلفهم، ولا يحيطون بشيء من علمه إلا بما شاء، وسع كرسيه السماوات والأرض، ولا يؤوده حفظهما، وهو العلي العظيم»',1],
  ['سورة الإخلاص، والفلق، والناس',3],
  ['أصبحنا وأصبح الملك لله، والحمد لله، لا إله إلا الله وحده لا شريك له، له الملك وله الحمد وهو على كل شيء قدير. رب أسألك خير ما في هذا اليوم وخير ما بعده، وأعوذ بك من شر ما في هذا اليوم وشر ما بعده. رب أعوذ بك من الكسل وسوء الكبر، رب أعوذ بك من عذاب في النار وعذاب في القبر',1],
  ['اللهم بك أصبحنا، وبك أمسينا، وبك نحيا، وبك نموت، وإليك النشور',1],
  ['سيد الاستغفار: اللهم أنت ربي لا إله إلا أنت، خلقتني وأنا عبدك، وأنا على عهدك ووعدك ما استطعت، أعوذ بك من شر ما صنعت، أبوء لك بنعمتك علي، وأبوء بذنبي، فاغفر لي فإنه لا يغفر الذنوب إلا أنت',1],
  ['اللهم عافني في بدني، اللهم عافني في سمعي، اللهم عافني في بصري، لا إله إلا أنت',3],
  ['بسم الله الذي لا يضر مع اسمه شيء في الأرض ولا في السماء، وهو السميع العليم',3],
  ['رضيت بالله رباً، وبالإسلام ديناً، وبمحمد صلى الله عليه وسلم نبياً',3],
  ['يا حي يا قيوم برحمتك أستغيث، أصلح لي شأني كله، ولا تكلني إلى نفسي طرفة عين',1],
  ['حسبي الله لا إله إلا هو، عليه توكلت، وهو رب العرش العظيم',7],
  ['لا إله إلا الله وحده لا شريك له، له الملك وله الحمد، وهو على كل شيء قدير',10],
  ['سبحان الله وبحمده',100]],
 masa:[
  ['آية الكرسي: «الله لا إله إلا هو الحي القيوم، لا تأخذه سنة ولا نوم، له ما في السماوات وما في الأرض، من ذا الذي يشفع عنده إلا بإذنه، يعلم ما بين أيديهم وما خلفهم، ولا يحيطون بشيء من علمه إلا بما شاء، وسع كرسيه السماوات والأرض، ولا يؤوده حفظهما، وهو العلي العظيم»',1],
  ['سورة الإخلاص، والفلق، والناس',3],
  ['أمسينا وأمسى الملك لله، والحمد لله، لا إله إلا الله وحده لا شريك له، له الملك وله الحمد وهو على كل شيء قدير. رب أسألك خير ما في هذه الليلة وخير ما بعدها، وأعوذ بك من شر ما في هذه الليلة وشر ما بعدها. رب أعوذ بك من الكسل وسوء الكبر، رب أعوذ بك من عذاب في النار وعذاب في القبر',1],
  ['اللهم بك أمسينا، وبك أصبحنا، وبك نحيا، وبك نموت، وإليك المصير',1],
  ['سيد الاستغفار: اللهم أنت ربي لا إله إلا أنت، خلقتني وأنا عبدك، وأنا على عهدك ووعدك ما استطعت، أعوذ بك من شر ما صنعت، أبوء لك بنعمتك علي، وأبوء بذنبي، فاغفر لي فإنه لا يغفر الذنوب إلا أنت',1],
  ['اللهم عافني في بدني، اللهم عافني في سمعي، اللهم عافني في بصري، لا إله إلا أنت',3],
  ['بسم الله الذي لا يضر مع اسمه شيء في الأرض ولا في السماء، وهو السميع العليم',3],
  ['أعوذ بكلمات الله التامات من شر ما خلق',3],
  ['رضيت بالله رباً، وبالإسلام ديناً، وبمحمد صلى الله عليه وسلم نبياً',3],
  ['يا حي يا قيوم برحمتك أستغيث، أصلح لي شأني كله، ولا تكلني إلى نفسي طرفة عين',1],
  ['حسبي الله لا إله إلا هو، عليه توكلت، وهو رب العرش العظيم',7],
  ['سبحان الله وبحمده',100]],
 nawm:[
  ['آية الكرسي',1],['سورة الإخلاص، والفلق، والناس (تجمع كفيك وتنفث فيهما وتمسح جسدك)',3],
  ['باسمك ربي وضعت جنبي، وبك أرفعه، إن أمسكت نفسي فارحمها، وإن أرسلتها فاحفظها بما تحفظ به عبادك الصالحين',1],
  ['اللهم قني عذابك يوم تبعث عبادك',3],['باسمك اللهم أموت وأحيا',1],
  ['سبحان الله ٣٣، والحمد لله ٣٣، والله أكبر ٣٤',1]]};
var ZN={sabah:'أذكار الصباح',masa:'أذكار المساء',nawm:'أذكار النوم'};

/* ---------- small UI helpers ---------- */
var tT;function toast(s){var t=$('#toast');t.textContent=s;t.classList.add('on');clearTimeout(tT);tT=setTimeout(function(){t.classList.remove('on')},1800)}
function confetti(){var cs=['#F4C85A','#FF8A2A','#3DDC97','#fff','#6B4BD8'];for(var i=0;i<40;i++){var c=document.createElement('div');c.className='confetti';c.style.left=Math.random()*100+'vw';c.style.background=cs[i%5];c.style.animationDelay=Math.random()*.5+'s';c.style.animationDuration=1.2+Math.random()+'s';document.body.appendChild(c);(function(c){setTimeout(function(){c.remove()},2600)})(c)}}
function vib(){try{navigator.vibrate&&navigator.vibrate(15)}catch(e){}}
function flame(blue){return blue?'<svg viewBox="0 0 64 72"><path fill="#2E9BFF" d="M32 2C34 16 52 24 52 46a20 20 0 0 1-40 0c0-10 6-16 9-22 2 6 5 9 8 10-2-12 1-22 3-32z"/><path fill="#6FD3FF" d="M32 18c2 10 14 16 14 30a14 14 0 0 1-28 0c0-7 4-11 6-15 1 4 4 6 5 7-1-8 1-15 3-22z"/><path fill="#E6FBFF" d="M32 34c2 7 9 10 9 18a9 9 0 0 1-18 0c0-5 3-8 5-11 1 3 2 4 3 4-1-4 0-8 1-11z"/></svg>':
 '<svg viewBox="0 0 64 72"><path fill="#FF7A1A" d="M32 2C34 16 52 24 52 46a20 20 0 0 1-40 0c0-10 6-16 9-22 2 6 5 9 8 10-2-12 1-22 3-32z"/><path fill="#FFB347" d="M32 18c2 10 14 16 14 30a14 14 0 0 1-28 0c0-7 4-11 6-15 1 4 4 6 5 7-1-8 1-15 3-22z"/><path fill="#FFF1C2" d="M32 34c2 7 9 10 9 18a9 9 0 0 1-18 0c0-5 3-8 5-11 1 3 2 4 3 4-1-4 0-8 1-11z"/></svg>'}
var CHK='<svg viewBox="0 0 24 24"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg>';
function hijri(d){try{return new Intl.DateTimeFormat('ar-SA-u-ca-islamic-umalqura',{day:'numeric',month:'long',year:'numeric'}).format(d)}catch(e){return ''}}
function greg(d){try{return new Intl.DateTimeFormat('ar-SA-u-ca-gregory',{weekday:'long',day:'numeric',month:'long'}).format(d)}catch(e){return key(d)}}
var QUOTES=[
 ['«من صلّى اثنتي عشرة ركعة في يوم وليلة بُني له بهن بيت في الجنة»','رواه مسلم'],
 ['«أحبّ الأعمال إلى الله أدومها وإن قلّ»','متفق عليه'],
 ['«ألا بذكر الله تطمئن القلوب»','الرعد ٢٨'],
 ['«ركعتا الفجر خيرٌ من الدنيا وما فيها»','رواه مسلم'],
 ['«فاذكروني أذكركم واشكروا لي ولا تكفرون»','البقرة ١٥٢'],
 ['«ما تقرّب إليّ عبدي بشيء أحب إليّ مما افترضت عليه، وما يزال عبدي يتقرب إليّ بالنوافل حتى أحبه»','رواه البخاري']];

/* ---------- اليوم ---------- */
var viewDay=null;
function ring(p,col,sz){var r=sz/2-8,C=2*Math.PI*r;return '<svg viewBox="0 0 '+sz+' '+sz+'"><circle cx="'+sz/2+'" cy="'+sz/2+'" r="'+r+'" stroke="#143A3D" stroke-width="10" fill="none"/><circle cx="'+sz/2+'" cy="'+sz/2+'" r="'+r+'" stroke="'+col+'" stroke-width="10" fill="none" stroke-linecap="round" stroke-dasharray="'+C+'" stroke-dashoffset="'+C*(1-p/100)+'" style="transition:stroke-dashoffset .6s"/></svg>'}
function itemRow(s,k){var d=dayObj(k),v=d[s.id]||0,sub=[s.r,s.w,itemWhen(s,k)].filter(function(x){return x}).join(' • ');
  return '<div class="item'+(v===1?' done':v===-1?' miss':'')+'"><div class="ic">'+s.ic+'</div><div class="tx"><b>'+s.n+'</b><span>'+sub+'</span>'+(s.read?'<a class="rd" data-read="'+s.read+'">📖 اقرأها هنا</a>':'')+(s.count?'<a class="rd" data-cnt="'+s.id+'">📿 العدّاد '+ar(Math.min(cntOf(k,s.id),s.count))+' / '+ar(s.count)+'</a>':'')+'</div>'+(s.read?'':'<button class="x" data-x="'+s.id+'">✕</button>')+'<button class="chk" data-c="'+s.id+'">'+CHK+'</button></div>'}
function trackBlock(t,k,inSheet){
  var T=TR[t],L=req(t,k),d=dayObj(k),p=pct(t,k),dn=doneN(t,k),miss=missN(t,k),st=streak(t),now=Date.now(),blue=t==='azkar';
  var h='<div class="trk"><div class="trk-h"><div class="ring sm">'+ring(p,p===100?'#3DDC97':(blue?'#5BC0FF':'#F4C85A'),84)+'<div class="v"><b>'+ar(p)+'٪</b></div></div><div class="msg"><b>'+T.ic+' '+T.n+'</b><span class="mu sm">'+ar(dn)+' من '+ar(L.length)+(p===100?' — ما شاء الله 🎉':'')+'</span></div><div class="flame-chip'+(blue?' blue':'')+'">'+flame(blue)+ar(st)+'</div></div><div class="list">';
  L.forEach(function(s){h+=itemRow(s,k)});h+='</div>';
  var t2=times(k),late=k<today()||now>(t==='sunan'?t2.isha+30*60000:t2.maghrib+30*60000),ck=compKey(t);
  if(miss>0&&miss<=maxComp(t)&&(late||L.some(function(s){return d[s.id]===-1}))){
    if(d[ck]===1)h+='<div class="comp okd"><b>✅ تم التعويض</b><span class="sm mu">شعلتك ما طارت</span></div>';
    else{h+='<div class="comp'+(blue?' bl':'')+'"><b>🔥 شعلة '+T.n+' بخطر!</b><span class="sm" style="color:#FFD7A8">فاتك '+(miss===1?'واحد':'اثنين')+' — عوّض وما يروح تقدمك</span><div class="row">';
      compOpts(t).forEach(function(a){var it=ITEMS[a];h+='<button class="btn f" data-comp="'+t+':'+a+'">'+it.ic+' '+(t==='sunan'?'صليت ':'قلت ')+it.n+'</button>'});h+='</div></div>'}
  }else if(miss>maxComp(t)&&late&&!inSheet)h+='<div class="comp" style="border-color:rgba(255,107,107,.4)"><b>اليوم فاتك '+ar(miss)+' 😔</b><span class="sm mu">التعويض لـ'+(maxComp(t)===2?'واحد أو اثنين':'واحد')+' بس. بكرة بداية جديدة</span></div>';
  return h+'</div>'}
function rToday(){
  var k=today(),np=nextPrayer(),now=Date.now();
  var h='<div class="top"><div><h1>سنن</h1><div class="date">'+greg(new Date())+'<br>'+hijri(new Date())+'</div></div><div class="np">'+PN[np.k]+'<b>'+left(np.at-now)+'</b></div></div>';
  h+=trackBlock('sunan',k);
  if(S.azkarOn===true)h+=trackBlock('azkar',k);
  else if(S.azkarOn!==false)h+='<div class="trk invite"><b>📿 قسم الأذكار والأدعية</b><span class="sm mu">أذكار الصباح والمساء، الكهف يوم الجمعة، ودعاء ساعة الإجابة — بشعلة لحالها 💙</span><div class="row"><button class="btn bl" data-act="azOn">ابدأه الحين</button><button class="btn g" data-act="azLater">بعدين</button></div></div>';
  var q=QUOTES[(new Date().getDate())%QUOTES.length];
  h+='<div class="quote">'+q[0]+'<small>'+q[1]+'</small></div>';
  var t=times(k);h+='<h2>مواقيت اليوم • '+(S.loc&&S.loc.name?S.loc.name:'المدينة المنورة')+'</h2><div class="times">';
  ['fajr','sunrise','dhuhr','asr','maghrib','isha'].forEach(function(x){h+='<div class="'+(np.k===x&&np.at===t[x]?'nx':'')+'"><span>'+PN[x]+'</span><b>'+hm(t[x])+'</b></div>'});
  $('#t-today').innerHTML=h+'</div>'}
function trackOf(id){return TR.azkar.base.concat(TR.azkar.ladder).indexOf(id)>=0?'azkar':'sunan'}
function setMark(k,id,v){var t=trackOf(id),prev=pct(t,k);B.mark(k,id,v);load();vib();
  var p=pct(t,k);if(p===100&&prev<100){confetti();toast('كمّلت '+TR[t].n+' اليوم 🎉 الشعلة '+ar(streak(t)))}else if(v===1)toast(t==='sunan'?'تقبّل الله 🤲':'ذكرت الله 💙');
  checkStage();render()}
document.addEventListener('click',function(e){
  var t=e.target.closest?e.target.closest('[data-c],[data-x],[data-comp],[data-day],[data-add],[data-loc],[data-sw],[data-act],[data-read],[data-zc],[data-ft],[data-cnt],[data-tap],.sheet'):null;if(!t)return;
  var k=viewDay||today();
  if(t.dataset.c){var cur1=dayObj(k)[t.dataset.c]===1;setMark(k,t.dataset.c,cur1?0:1)}
  else if(t.dataset.x){var c2=dayObj(k)[t.dataset.x]===-1;setMark(k,t.dataset.x,c2?0:-1)}
  else if(t.dataset.comp){var pr=t.dataset.comp.split(':');if(pr[1]!=='nafl')B.mark(k,pr[1],1);B.mark(k,compKey(pr[0]),1);load();S.days[k][compKey(pr[0])+'By']=pr[1];B.put('days',JSON.stringify(S.days));load();confetti();toast('تم التعويض ✅ الشعلة '+ar(streak(pr[0])));render()}
  else if(t.dataset.day){openDay(t.dataset.day)}
  else if(t.dataset.add){addHabit(t.dataset.add)}
  else if(t.dataset.loc){setCity(t.dataset.loc)}
  else if(t.dataset.sw){toggle(t.dataset.sw)}
  else if(t.dataset.act){act(t.dataset.act,t)}
  else if(t.dataset.read){openRead(t.dataset.read)}
  else if(t.dataset.cnt){openCnt(t.dataset.cnt)}
  else if(t.dataset.tap){cTap()}
  else if(t.dataset.zc){zTap(+t.dataset.zc)}
  else if(t.dataset.ft){fireT=t.dataset.ft;render()}
  else if(t.classList.contains('sheet')&&e.target===t){closeSheet()}
});
function go(n){viewDay=null;document.querySelectorAll('.tab').forEach(function(x){x.classList.toggle('on',x.id==='t-'+n)});document.querySelectorAll('nav button').forEach(function(x){x.classList.toggle('on',x.dataset.t===n)});cur=n;render();var tb=$('#t-'+n);if(tb)tb.scrollTop=0}
var cur='today',fireT='sunan';

/* ---------- reader with counters ---------- */
var RD=null;
function openRead(w){var k=today();RD={w:w,c:Z[w].map(function(){return 0})};var saved=dayObj(k)['rd_'+w];if(saved&&saved.length===Z[w].length)RD.c=saved.slice();drawRead()}
function drawRead(){var L=Z[RD.w],done=L.filter(function(z,i){return RD.c[i]>=z[1]}).length;
  var h='<div class="rh"><b>'+ZN[RD.w]+'</b><span class="mu sm">'+ar(done)+' من '+ar(L.length)+' • اضغط الذكر يعدّ</span></div><div class="bar"><i style="width:'+(100*done/L.length)+'%;background:linear-gradient(90deg,#5BC0FF,#2E9BFF)"></i></div><div class="zl">';
  L.forEach(function(z,i){var c=RD.c[i],ok=c>=z[1];h+='<div class="z'+(ok?' ok':'')+'" data-zc="'+i+'"><p>'+z[0]+'</p><div class="zc"><span>'+(z[1]>1?ar(Math.min(c,z[1]))+' / '+ar(z[1]):(ok?'✓':'مرة'))+'</span>'+(ok?'<em>✓</em>':'')+'</div></div>'});
  h+='</div><div class="row" style="margin-top:12px"><button class="btn bl" data-act="zDone">✅ خلصتها</button><button class="btn g" data-act="close">إغلاق</button></div>';
  $('.sh-in').innerHTML=h;$('#sheet').classList.add('on')}
function zTap(i){var z=Z[RD.w][i];if(RD.c[i]<z[1]){RD.c[i]++;vib()}B.mark(today(),'rd_'+RD.w,0);load();S.days[today()]['rd_'+RD.w]=RD.c;B.put('days',JSON.stringify(S.days));
  var sc=$('.sh-in').scrollTop;drawRead();$('.sh-in').scrollTop=sc;
  if(Z[RD.w].every(function(z,j){return RD.c[j]>=z[1]})){var id=RD.w;if(dayObj(today())[id]!==1){setTimeout(function(){closeSheet();setMark(today(),id,1)},350)}}}


/* ---------- tap counter (tasbih) ---------- */
var CN=null;
function cntOf(k,id){var v=dayObj(k)['n_'+id];return typeof v==='number'?v:0}
function openCnt(id){CN=id;drawCnt()}
function drawCnt(){var it=ITEMS[CN],n=cntOf(today(),CN),ok=n>=it.count;
  var h='<div class="rh"><b>'+it.ic+' '+it.n+'</b><span class="mu sm">'+(it.d||'')+'</span></div><button class="tapc'+(ok?' ok':'')+'" data-tap="1"><b>'+ar(n)+'</b><span>من '+ar(it.count)+(it.cnt?' '+it.cnt:'')+'</span></button><div class="note" style="text-align:center">'+(ok?'✅ تم — تقبّل الله':'اضغط الدائرة مع كل '+(it.cnt||'مرة'))+'</div><div class="row" style="margin-top:12px"><button class="btn g" data-act="cntReset">تصفير</button><button class="btn g" data-act="close">إغلاق</button></div>';
  $('.sh-in').innerHTML=h;$('#sheet').classList.add('on')}
function cTap(){var k=today(),it=ITEMS[CN],n=cntOf(k,CN)+1;B.mark(k,'n_'+CN,n);vib();load();
  if(n===it.count&&dayObj(k)[CN]!==1){B.mark(k,CN,1);load();confetti();toast('✅ '+it.n)}drawCnt()}

/* ---------- الشعلة ---------- */
var BADGES=[[3,'🌱','بداية'],[7,'🔥','أسبوع'],[14,'⭐','أسبوعين'],[30,'🏅','شهر'],[60,'💎','شهرين'],[90,'👑','عادة ثابتة'],[180,'🕌','نصف سنة'],[365,'🌟','سنة كاملة']];
function rFire(){var t=on(fireT)?fireT:'sunan',blue=t==='azkar',st=streak(t),b=best(t),ss=stageStreak(t);
  var h='<div class="seg"><button data-ft="sunan" class="'+(t==='sunan'?'on':'')+'">🕌 السنن</button><button data-ft="azkar" class="'+(t==='azkar'?'on':'')+(S.azkarOn===true?'':' dis')+'">📿 الأذكار</button></div>';
  h+='<div class="big-fire'+(st?'':' off')+'">'+flame(blue)+'<div class="n">'+ar(st)+'</div><div class="l">'+(st?'يوم متتالي ما قطعت '+TR[t].n:'ابدأ شعلتك اليوم')+'</div></div>';
  var full=Object.keys(S.days).filter(function(k){return k>=startOf(t)&&pct(t,k)===100}).length,cps=Object.keys(S.days).filter(function(k){return S.days[k][compKey(t)]===1}).length;
  h+='<div class="stats"><div class="stat"><b>'+ar(b)+'</b><span>أطول شعلة</span></div><div class="stat"><b>'+ar(full)+'</b><span>يوم كامل</span></div><div class="stat"><b>'+ar(cps)+'</b><span>تعويض</span></div></div>';
  var left_=TR[t].ladder.filter(function(x){return S.habits.indexOf(x)<0});
  if(left_.length)h+='<div class="goal"><b>'+(ss>=STAGE?'🎉 خلصت المرحلة! اختر عادتك الجديدة':'المرحلة الجاية: عادة جديدة تختارها')+'</b><div class="bar"><i style="width:'+Math.min(100,100*ss/STAGE)+'%'+(blue?';background:linear-gradient(90deg,#5BC0FF,#2E9BFF)':'')+'"></i></div><div class="note">'+(ss>=STAGE?'روح «العادات» وأضف اللي تبي':'باقي '+ar(STAGE-ss)+' يوم من '+ar(STAGE)+' وتصير عادة ثابتة')+'</div></div>';
  h+='<h2>آخر ٧ أيام</h2><div class="week">';
  for(var i=6;i>=0;i--){var k=addD(today(),-i),p=k<startOf(t)?0:pct(t,k),dn=parse(k);h+='<div><i style="height:'+Math.max(3,p)+'%;'+(dayObj(k)[compKey(t)]===1&&p<100?'background:linear-gradient(180deg,#8A6BFF,#4B35B5)':blue?'background:linear-gradient(180deg,#6FD3FF,#2E9BFF)':'')+'"></i><span>'+['أحد','اثن','ثلا','أرب','خمي','جمع','سبت'][dn.getDay()]+'</span></div>'}
  h+='</div><h2>الشهر</h2><div class="cal">';
  ['ح','ن','ث','ر','خ','ج','س'].forEach(function(x){h+='<div class="h">'+x+'</div>'});
  var td=parse(today()),first=new Date(td.getFullYear(),td.getMonth(),1,12),dim=new Date(td.getFullYear(),td.getMonth()+1,0).getDate();
  for(var e=0;e<first.getDay();e++)h+='<div class="h"></div>';
  for(var dd=1;dd<=dim;dd++){var kk=key(new Date(td.getFullYear(),td.getMonth(),dd,12)),pp=kk<startOf(t)?-1:pct(t,kk),cl=kk>today()?'fu':pp<0?'':(pp===100?(blue?'b3':'p3'):dayObj(kk)[compKey(t)]===1&&dayOk(t,kk)?'cp':pp>=60?'p2':pp>0?'p1':'');
    h+='<div class="'+cl+(kk===today()?' td':'')+'" '+(kk<=today()?'data-day="'+kk+'"':'')+'>'+ar(dd)+'</div>'}
  h+='</div><div class="legend"><span><i style="background:'+(blue?'linear-gradient(135deg,#6FD3FF,#2E9BFF)':'linear-gradient(135deg,#FFB347,#FF7A1A)')+'"></i>كامل</span><span><i style="background:linear-gradient(135deg,#6B4BD8,#3F2C9A)"></i>بتعويض</span><span><i style="background:rgba(255,138,42,.4)"></i>ناقص</span></div><div class="note">اضغط أي يوم فات تعدّله</div>';
  h+='<h2>الأوسمة</h2><div class="badges">';
  BADGES.forEach(function(x){h+='<div class="badge'+(b>=x[0]?'':' lock')+'"><div class="e">'+x[1]+'</div><b>'+x[2]+'</b><span>'+ar(x[0])+' يوم</span></div>'});
  h+='</div><button class="btn g" style="width:100%;margin-top:16px" data-act="share">📤 شارك شعلتك</button>';
  $('#t-fire').innerHTML=h}
function openDay(k){viewDay=k;var h='<h2 style="margin-top:0">'+greg(parse(k))+'</h2>'+trackBlock('sunan',k,true)+(S.azkarOn===true?trackBlock('azkar',k,true):'')+'<button class="btn g" style="width:100%;margin-top:14px" data-act="close">تم</button>';
  $('.sh-in').innerHTML=h;$('#sheet').classList.add('on')}
function closeSheet(){$('#sheet').classList.remove('on');viewDay=null;RD=null;CN=null;render()}

/* ---------- العادات ---------- */
function checkStage(){['sunan','azkar'].forEach(function(t){if(!on(t))return;var left_=TR[t].ladder.filter(function(x){return S.habits.indexOf(x)<0});var tag=t+':'+(S.stage[t]||'0');
  if(left_.length&&stageStreak(t)>=STAGE&&S.unlockShown!==tag){put('unlockShown',tag);setTimeout(function(){confetti();toast('👑 '+ar(STAGE)+' يوم في '+TR[t].n+'! اختر عادة جديدة')},400)}})}
function addHabit(id){var h=S.habits.slice();if(h.indexOf(id)<0)h.push(id);put('habits',h);var t=trackOf(id),st=S.stage;st[t]=today();put('stage',st);confetti();toast('أضفنا '+ITEMS[id].n+' ✨');render()}
function rHabits(){var h='<h1>العادات</h1><div class="note" style="margin-bottom:6px">كل قسم له شعلة لحاله. إذا ثبّت '+ar(STAGE)+' يوم متتالي، تختار أنت عادة جديدة (وحدة أو أكثر) وتبدأ مرحلة جديدة 🌱</div>';
  ['sunan','azkar'].forEach(function(t){var T=TR[t],ss=stageStreak(t),ready=ss>=STAGE,blue=t==='azkar';
    h+='<h2>'+T.ic+' '+T.n+'</h2>';
    if(t==='azkar'&&S.azkarOn!==true){h+='<div class="hab"><div class="ic">📿</div><div class="tx"><b>قسم الأذكار مو شغّال</b><span>أذكار الصباح والمساء + الكهف ودعاء آخر ساعة يوم الجمعة</span></div><button class="btn bl" style="flex:none;padding:10px 14px" data-act="azOn">ابدأه</button></div>';return}
    h+='<div class="hab on"><div class="ic">'+(t==='sunan'?'🕌':'📿')+'</div><div class="tx"><b>'+(t==='sunan'?'البداية: ٣ سنن':'البداية')+'</b><span>'+T.base.map(function(x){return ITEMS[x].n}).join('، ')+'</span></div><span class="tag on">شغّالة</span></div>';
    if(!ready)h+='<div class="goal" style="margin:0 0 10px"><b>باقي '+ar(STAGE-ss)+' يوم وتختار عادتك الجديدة</b><div class="bar"><i style="width:'+Math.min(100,100*ss/STAGE)+'%'+(blue?';background:linear-gradient(90deg,#5BC0FF,#2E9BFF)':'')+'"></i></div></div>';
    T.ladder.forEach(function(id){var a=ITEMS[id],isOn=S.habits.indexOf(id)>=0;
      h+='<div class="hab'+(isOn?' on':ready?'':' lock')+'"><div class="ic">'+a.ic+'</div><div class="tx"><b>'+a.n+'</b><span>'+(a.d||'')+'<br>'+a.w+'</span></div>'+
       (isOn?'<span class="tag on">شغّالة</span>':ready?'<button class="btn'+(blue?' bl':'')+'" style="flex:none;padding:10px 14px" data-add="'+id+'">أضفها</button>':'<button class="tag" data-act="early" data-id="'+id+'">🔒 أبدأ بدري؟</button>')+'</div>'})});
  $('#t-habits').innerHTML=h}

/* ---------- الإعدادات ---------- */
var CITIES=[['المدينة المنورة',24.4672,39.6111],['مكة المكرمة',21.4225,39.8262],['الرياض',24.7136,46.6753],['جدة',21.4858,39.1925],['الدمام',26.4207,50.0888],['الطائف',21.2703,40.4158],['تبوك',28.3835,36.5662],['أبها',18.2164,42.5053],['بريدة',26.326,43.975],['حائل',27.5114,41.7208],['جازان',16.8892,42.5511],['نجران',17.5656,44.2289],['ينبع',24.0895,38.0618],['الأحساء',25.3833,49.5833],['خميس مشيط',18.3,42.7333],['الجبيل',27.0046,49.646]];
function setCity(i){if(i==='gps'){toast('📍 أحدد موقعك…');B.locate();return}var c=CITIES[+i];put('loc',{lat:c[1],lon:c[2],name:c[0]});TM={};toast('✅ '+c[0]);render()}
window.onEv=function(e){if(e.ev==='loc'){if(e.err){toast(e.err==='denied'?'ما فيه إذن موقع':'ما قدرنا نحدد الموقع');return}var n='موقعي',bd=1e9;CITIES.forEach(function(c){var dd=Math.pow(c[1]-e.lat,2)+Math.pow(c[2]-e.lon,2);if(dd<bd){bd=dd;n=c[0]}});if(bd>0.5)n='موقعي';put('loc',{lat:e.lat,lon:e.lon,name:n});TM={};toast('📍 '+n);render()}};
function toggle(k){if(k==='notif'){var v=S.notif===false;put('notif',v);if(v)B.askNotif();render()}else if(k==='az'){if(S.azkarOn===true){put('azkarOn',false)}else act('azOn');render()}}
function act(a,el){if(a==='close')closeSheet();else if(a==='test'){B.askNotif();B.test('dhuhr');if(!isWeb)toast((S.mode||'alarm')==='alarm'?'⏰ يرن الحين…':'🔔 وصلك تنبيه تجربة')}else if(a==='hear'){B.hear(S.voice||'m1')}else if(a==='full'){B.askFull()}else if(a==='exact')B.askExact();
  else if(a==='cntReset'){B.mark(today(),'n_'+CN,0);load();drawCnt()}
  else if(a==='zDone'){var id=RD.w;closeSheet();if(dayObj(today())[id]!==1)setMark(today(),id,1)}
  else if(a==='azOn'){put('azkarOn',true);if(!S.azkarStart)put('azkarStart',today());B.askNotif();toast('📿 بدأ قسم الأذكار 💙');render()}
  else if(a==='azLater'){put('azkarOn',false);toast('تقدر تشغّله من «العادات» بأي وقت');render()}
  else if(a==='early'){var id2=el.dataset.id;if(confirm('تبي تضيف «'+ITEMS[id2].n+'» من الحين؟ تصير من ضمن عدّاد يومك'))addHabit(id2)}
  else if(a==='share'){B.share('شعلتي في «سنن» 🔥 '+ar(streak('sunan'))+' يوم ما قطعت السنن'+(S.azkarOn===true?' و💙 '+ar(streak('azkar'))+' يوم أذكار':'')+' — الله يثبتنا')}
  else if(a==='notifp')B.askNotif();
  else if(a==='reset'){if(confirm('تمسح كل السجل وتبدأ من الصفر؟')){put('days',{});put('habits',[]);put('stage',{});put('start',today());if(S.azkarOn)put('azkarStart',today());load();render();toast('بدأنا من جديد')}}}
function rSet(){var nOn=S.notif!==false,lc=S.loc&&S.loc.name?S.loc.name:'المدينة المنورة',o=S.off||35,sm=sabahMin();
  var h='<h1 style="margin-bottom:14px">الإعدادات</h1>';
  if(nOn&&!B.notifOk())h+='<div class="warn">🔕 التنبيهات مقفلة للتطبيق. <a data-act="notifp" style="color:var(--gold)">اسمح لها</a> عشان يسألك بعد كل صلاة</div>';
  else if(nOn&&(S.mode||'alarm')==='alarm'&&B.fullOk&&!B.fullOk())h+='<div class="warn">📱 عشان المنبه يطلع شاشة كاملة والجوال مقفل، <a data-act="full" style="color:var(--gold)">اسمح بـ«إشعارات ملء الشاشة»</a></div>';
  else if(nOn&&!B.exactOk())h+='<div class="warn">⏰ عشان التذكير يجي بوقته بالضبط، <a data-act="exact" style="color:var(--gold)">فعّل «المنبهات والتذكيرات»</a></div>';
  h+='<div class="set"><div class="r"><div><b>🔔 التنبيهات</b><span>«صليت السنة؟» وتجاوب من التنبيه نفسه</span></div><div class="sw'+(nOn?' on':'')+'" data-sw="notif"></div></div>';
  h+='<div class="r"><div><b>⏱️ سؤال السنة</b><span>بعد الأذان بكم دقيقة</span></div><select id="off">'+[15,25,35,45,60].map(function(m){return '<option value="'+m+'"'+(m===o?' selected':'')+'>'+ar(m)+' دقيقة</option>'}).join('')+'</select></div>';
  var md=S.mode||'alarm',vc=S.voice||'m1';
  h+='<div class="r"><div><b>⏰ شكل التذكير</b><span>'+(md==='alarm'?'زي المنبه: شاشة كاملة ورنّة':'تنبيه عادي')+'</span></div><select id="mode"><option value="alarm"'+(md==='alarm'?' selected':'')+'>منبه 🔊</option><option value="notif"'+(md!=='alarm'?' selected':'')+'>تنبيه عادي</option></select></div>';
  h+='<div class="r"><div><b>🧪 جرّب المنبه</b><span>يرن الحين تجربة</span></div><button class="btn g" style="flex:none;padding:9px 14px" data-act="test">جرّب</button></div></div>';
  h+='<div class="set"><div class="r"><div><b>📿 قسم الأذكار</b><span>بشعلة لحاله</span></div><div class="sw'+(S.azkarOn===true?' on':'')+'" data-sw="az"></div></div>';
  h+='<div class="r"><div><b>🌄 أذكار الصباح</b><span>متى تصحى؟</span></div><select id="sab">'+[300,360,390,420,450,480,510,540,600,660].map(function(m){return '<option value="'+m+'"'+(m===sm?' selected':'')+'>'+hmMin(m)+'</option>'}).join('')+'</select></div>';
  h+='<div class="r"><div><b>🌆 أذكار المساء</b><span>وقت التذكير</span></div><select id="mas"><option value="b15"'+(S.masaAt!=='adhan'?' selected':'')+'>قبل المغرب بربع</option><option value="adhan"'+(S.masaAt==='adhan'?' selected':'')+'>مع أذان المغرب</option></select></div></div>';
  h+='<div class="set"><div class="r"><div><b>📍 المدينة</b><span>للمواقيت (تقويم أم القرى)</span></div><select id="city">'+CITIES.map(function(c,i){return '<option value="'+i+'"'+(c[0]===lc?' selected':'')+'>'+c[0]+'</option>'}).join('')+(CITIES.some(function(c){return c[0]===lc})?'':'<option selected>'+lc+'</option>')+'</select></div>';
  h+='<div class="r"><div><b>حدد موقعي تلقائي</b><span>لو أنت برّا هالمدن</span></div><button class="btn g" style="flex:none;padding:9px 14px" data-loc="gps">📍 حدّد</button></div></div>';
  h+='<div class="set"><div class="r"><div><b>🗑️ ابدأ من جديد</b><span>يمسح السجل والشعلات</span></div><button class="btn g" style="flex:none;padding:9px 14px;color:var(--bad)" data-act="reset">مسح</button></div></div>';
  h+='<div class="note">التعويض: السنن، إذا فاتتك وحدة أو ثنتين تعوّض بالوتر أو الضحى. الأذكار، إذا فاتك واحد تعوّض بالاستغفار ١٠٠. أكثر من كذا ما ينفع تعويض.<br>كل بياناتك على جوالك بس، بدون نت.</div>';
  $('#t-set').innerHTML=h;
  $('#off').onchange=function(){put('off',+this.value);toast('✅ بعد الأذان بـ'+ar(this.value)+' دقيقة')};
  $('#mode').onchange=function(){put('mode',this.value);toast('✅ '+(this.value==='alarm'?'منبه':'تنبيه عادي'));render()};
  $('#sab').onchange=function(){put('sabahAt',+this.value);toast('✅ أذكار الصباح '+hmMin(+this.value))};
  $('#mas').onchange=function(){put('masaAt',this.value);toast('✅ تم')};
  $('#city').onchange=function(){if(this.value>=0)setCity(this.value)}}

/* ---------- web alarm & notification scheduler ---------- */
var ringAud=null,ringCtx=null,ringToneT=null,ringStopT=null,alarmTimer=null,activeAlarm=null;
function ensureAlarmDOM(){
  if(!$('#alarm-ov')){var d1=document.createElement('div');d1.id='alarm-ov';d1.className='alarm-ov';document.body.appendChild(d1)}
  if(!$('#notif-ban')){var d2=document.createElement('div');d2.id='notif-ban';d2.className='notif-ban';document.body.appendChild(d2)}
}
function unlockAudio(){
  if(!isWeb)return;
  try{
    if(!ringAud){ringAud=new Audio('./alarm_beep.ogg');ringAud.preload='auto'}
    if(!ringCtx&&(window.AudioContext||window.webkitAudioContext)){var AC=window.AudioContext||window.webkitAudioContext;ringCtx=new AC()}
    if(ringCtx&&ringCtx.state==='suspended')ringCtx.resume().catch(function(){});
  }catch(e){}
}
document.addEventListener('pointerdown',unlockAudio,{once:true});
function beepOnce(){
  try{
    if(!ringCtx&&(window.AudioContext||window.webkitAudioContext)){var AC=window.AudioContext||window.webkitAudioContext;ringCtx=new AC()}
    if(!ringCtx)return;
    if(ringCtx.state==='suspended')ringCtx.resume().catch(function(){});
    var now=ringCtx.currentTime;
    [880,1174].forEach(function(freq,idx){
      var o=ringCtx.createOscillator(),g=ringCtx.createGain();
      o.type='sine';o.frequency.value=freq;
      g.gain.setValueAtTime(0.001,now+idx*0.18);
      g.gain.exponentialRampToValueAtTime(0.22,now+idx*0.18+0.03);
      g.gain.exponentialRampToValueAtTime(0.001,now+idx*0.18+0.16);
      o.connect(g);g.connect(ringCtx.destination);
      o.start(now+idx*0.18);o.stop(now+idx*0.18+0.17);
    });
  }catch(e){}
}
function playRing(loop){
  stopRing();
  try{
    if(!ringAud)ringAud=new Audio('./alarm_beep.ogg');
    ringAud.currentTime=0;
    ringAud.loop=!!loop;
    var pr=ringAud.play();
    if(pr&&pr.catch){
      pr.catch(function(){
        beepOnce();
        if(loop)ringToneT=setInterval(beepOnce,1400);
      });
    }
  }catch(e){
    beepOnce();
    if(loop)ringToneT=setInterval(beepOnce,1400);
  }
  if(loop){
    try{navigator.vibrate&&navigator.vibrate([500,400,500,1200])}catch(e){}
    ringStopT=setTimeout(stopRing,120000);
  }
}
function stopRing(){
  clearInterval(ringToneT);ringToneT=null;
  clearTimeout(ringStopT);ringStopT=null;
  if(ringAud){try{ringAud.pause();ringAud.currentTime=0}catch(e){}}
  try{navigator.vibrate&&navigator.vibrate(0)}catch(e){}
}
function closeAlarmUI(){
  stopRing();
  activeAlarm=null;
  var ov=$('#alarm-ov'),bn=$('#notif-ban');
  if(ov){ov.classList.remove('on');ov.innerHTML=''}
  if(bn){bn.classList.remove('on');bn.innerHTML=''}
}
function alarmSpec(kind,day,isTest){
  var d=dayObj(day),hb=S.habits||[],done=function(id){return !isTest&&d[id]===1};
  if(kind==='fajr'){if(done('fajr'))return null;return{ic:'🌅',t:'صليت سنة الفجر؟',b:'ركعتين خفيفتين قبل صلاة الفجر — «ركعتا الفجر خير من الدنيا وما فيها»',acts:[{l:'✅ صليتها',c:'ok',m:['fajr']},{l:'❌ فاتتني',c:'bad',m:['-fajr']}]}}
  if(kind==='dhuhr'){
    var hasDhB=hb.indexOf('dhB')>=0;
    if(!isTest&&d.dhA===1&&(!hasDhB||d.dhB===1))return null;
    if(hasDhB)return{ic:'☀️',t:'صليت سنن الظهر؟',b:'ركعتين بعد الظهر (وقبلية الظهر: ٤ قبلها)',acts:[{l:'✅ صليتهما',c:'ok',m:['dhB','dhA']},{l:'✅ بعدية الظهر فقط',c:'g',m:['dhA']},{l:'❌ فاتتني',c:'bad',m:['-dhA']}]};
    return{ic:'🌤️',t:'صليت سنة الظهر؟',b:'ركعتين بعد الظهر — سجّلها عشان شعلتك',acts:[{l:'✅ صليتها',c:'ok',m:['dhA']},{l:'❌ فاتتني',c:'bad',m:['-dhA']}]};
  }
  if(kind==='asr4'){if(done('asr4'))return null;return{ic:'🕓',t:'صليت ٤ قبل العصر؟',b:'«رحم الله امرأً صلى قبل العصر أربعاً»',acts:[{l:'✅ صليتها',c:'ok',m:['asr4']},{l:'❌ فاتتني',c:'bad',m:['-asr4']}]}}
  if(kind==='maghrib'){if(done('mag'))return null;return{ic:'🌇',t:'صليت سنة المغرب؟',b:'ركعتين بعد صلاة المغرب',acts:[{l:'✅ صليتها',c:'ok',m:['mag']},{l:'❌ فاتتني',c:'bad',m:['-mag']}]}}
  if(kind==='isha'){if(done('isha'))return null;return{ic:'🌙',t:'صليت سنة العشاء؟',b:'ركعتين بعد صلاة العشاء — آخر سنة اليوم',acts:[{l:'✅ صليتها',c:'ok',m:['isha']},{l:'❌ فاتتني',c:'bad',m:['-isha']}]}}
  if(kind==='duha'){if(done('duha'))return null;return{ic:'🌞',t:'وقت صلاة الضحى ☀️',b:'من بعد الشروق بربع ساعة إلى قبل الظهر — تجزئ عن صدقة كل مفصل فيك',acts:[{l:'✅ صليتها',c:'ok',m:['duha']},{l:'❌ فاتتني',c:'bad',m:['-duha']}]}}
  if(kind==='witr'){if(done('witr'))return null;return{ic:'✨',t:'لا تنام قبل الوتر ✨',b:'أوتروا يا أهل القرآن، فإن الله وتر يحب الوتر',acts:[{l:'✅ صليته',c:'ok',m:['witr']},{l:'❌ فاتني',c:'bad',m:['-witr']}]}}
  if(kind==='sabah'){if(done('sabah'))return null;return{ic:'🌄',t:'أذكار الصباح 🌄',b:'اضغط تقرأها بالتطبيق، أو سجّلها لو قريتها',read:'sabah',acts:[{l:'📖 اقرأها الآن',c:'bl',read:'sabah'},{l:'✅ قريتها',c:'ok',m:['sabah']}]}}
  if(kind==='masa'){if(done('masa'))return null;return{ic:'🌆',t:'أذكار المساء 🌆',b:'اضغط تقرأها بالتطبيق، أو سجّلها لو قريتها',read:'masa',acts:[{l:'📖 اقرأها الآن',c:'bl',read:'masa'},{l:'✅ قريتها',c:'ok',m:['masa']}]}}
  if(kind==='kahf'){if(done('kahf'))return null;return{ic:'📖',t:'يوم الجمعة — سورة الكهف',b:'«من قرأ سورة الكهف يوم الجمعة أضاء له من النور ما بين الجمعتين»',acts:[{l:'✅ قريتها',c:'ok',m:['kahf']}]}}
  if(kind==='jumua'){if(done('jumua'))return null;return{ic:'🤲',t:'ساعة الإجابة',b:'آخر ساعة بعد العصر يوم الجمعة — ادعُ لك ولأهلك قبل المغرب',acts:[{l:'✅ دعيت',c:'ok',m:['jumua']}]}}
  if(kind==='nawm'){
    var hasNawm=hb.indexOf('nawm')>=0,hasMulk=hb.indexOf('mulk')>=0;
    if(!isTest&&(!hasNawm||d.nawm===1)&&(!hasMulk||d.mulk===1))return null;
    var mArr=[];if(hasNawm)mArr.push('nawm');if(hasMulk)mArr.push('mulk');
    return{ic:'😴',t:hasMulk&&hasNawm?'أذكار النوم وسورة الملك':'أذكار النوم',b:'افتح التطبيق وتلقى الأذكار مكتوبة ومعها عدّاد',read:hasNawm?'nawm':null,acts:(hasNawm?[{l:'📖 اقرأها الآن',c:'bl',read:'nawm'}]:[]).concat([{l:'✅ قريتها',c:'ok',m:mArr}])};
  }
  if(kind==='siyamR'){return{ic:'🌙',t:'نويت الصيام؟',b:'لا تنسى السحور — صيام الاثنين والخميس',acts:[]}}
  if(kind==='comp'){
    var ms=missN('sunan',day);
    if(!isTest&&(ms<=0||ms>2||d.comp===1))return null;
    return{ic:'🔥',t:'شعلة السنن بخطر!',b:'فاتتك سنة اليوم؟ صلّ الوتر أو الضحى وسجّل تم التعويض وما تطير الشعلة',acts:compOpts('sunan').map(function(a){var it=ITEMS[a];return{l:'✅ '+it.n+' تعويض',c:'f',comp:'sunan:'+a}})};
  }
  if(kind==='compZ'){
    var mz=missN('azkar',day);
    if(!isTest&&(mz!==1||d.compZ===1))return null;
    return{ic:'💙',t:'شعلة الأذكار بخطر!',b:'فاتك ذكر اليوم — عوّض بالاستغفار ١٠٠ مرة وما تطير شعلة الأذكار',acts:[{l:'✅ الاستغفار ١٠٠ تعويض',c:'bl',comp:'azkar:istig'}]};
  }
  return null;
}
function fireWebAlarm(kind,day,isTest){
  load();
  var spec=alarmSpec(kind,day,isTest);
  if(!spec)return;
  ensureAlarmDOM();
  var md=S.mode||'alarm',isAlarm=(md==='alarm');
  activeAlarm={kind:kind,day:day,spec:spec,isTest:!!isTest};
  if('Notification' in window&&Notification.permission==='granted'){
    try{new Notification(spec.ic+' '+spec.t,{body:spec.b,tag:'sunan-'+kind,requireInteraction:isAlarm})}catch(e){}
  }
  var actsHtml='';
  spec.acts.forEach(function(a,idx){actsHtml+='<button class="btn '+a.c+'" data-alact="'+idx+'">'+a.l+'</button>'});
  if(spec.acts.length>0&&spec.acts.length<3)actsHtml+='<button class="btn g" data-alact="snooze">⏰ بعد ١٠ د</button>';
  actsHtml+='<button class="btn g" data-alact="dismiss">إغلاق</button>';
  if(isAlarm){
    var ov=$('#alarm-ov');
    ov.innerHTML='<div class="alarm-ic">'+spec.ic+'</div><div class="alarm-time">'+hm(Date.now())+(isTest?' • تجربة':'')+'</div><div class="alarm-t">'+spec.t+'</div><div class="alarm-b">'+spec.b+'</div><div class="alarm-acts">'+actsHtml+'</div>';
    ov.classList.add('on');
    playRing(true);
  }else{
    var bn=$('#notif-ban');
    bn.innerHTML='<div class="notif-ban-h"><div class="ic">'+spec.ic+'</div><div><b>'+spec.t+'</b><span>'+spec.b+'</span></div></div><div class="notif-ban-acts">'+actsHtml+'</div>';
    bn.classList.add('on');
    playRing(false);
  }
}
document.addEventListener('click',function(e){
  var b=e.target.closest?e.target.closest('[data-alact]'):null;
  if(!b||!activeAlarm)return;
  var actId=b.dataset.alact,al=activeAlarm;
  if(actId==='dismiss'){closeAlarmUI();return}
  if(actId==='snooze'){
    closeAlarmUI();
    var sn=S.snoozes||[];
    sn.push({at:Date.now()+10*60000,kind:al.kind,day:al.day});
    S.snoozes=sn;B.put('snoozes',JSON.stringify(sn));
    toast('⏰ بنبهك بعد ١٠ دقائق');
    return;
  }
  var a=al.spec.acts[+actId];
  closeAlarmUI();
  if(!a)return;
  if(a.read){openRead(a.read);return}
  if(a.m&&a.m.length){
    a.m.forEach(function(m){
      if(m.charAt(0)==='-')B.mark(al.day,m.slice(1),-1);
      else B.mark(al.day,m,1);
    });
    load();confetti();toast('✅ تم التسجيل');render();
  }else if(a.comp){
    var pr=a.comp.split(':');
    if(pr[1]!=='nafl')B.mark(al.day,pr[1],1);
    B.mark(al.day,compKey(pr[0]),1);
    load();S.days[al.day][compKey(pr[0])+'By']=pr[1];
    B.put('days',JSON.stringify(S.days));
    confetti();toast('تم التعويض ✅');render();
  }
});
function dayEvents(k){
  var t=times(k),off=(S.off||35)*60000,hb=S.habits||[],ev=[];
  ev.push({at:t.dhuhr+off,kind:'dhuhr',day:k});
  ev.push({at:t.maghrib+off,kind:'maghrib',day:k});
  ev.push({at:t.isha+off,kind:'isha',day:k});
  ev.push({at:t.isha+110*60000,kind:'comp',day:k});
  if(hb.indexOf('fajr')>=0)ev.push({at:t.fajr+off,kind:'fajr',day:k});
  if(hb.indexOf('asr4')>=0)ev.push({at:t.asr+off,kind:'asr4',day:k});
  if(hb.indexOf('duha')>=0)ev.push({at:t.sunrise+(t.dhuhr-t.sunrise)/2,kind:'duha',day:k});
  if(hb.indexOf('witr')>=0)ev.push({at:t.isha+75*60000,kind:'witr',day:k});
  if(S.azkarOn===true){
    var p=k.split('-').map(Number),mid=new Date(p[0],p[1]-1,p[2],0,0,0).getTime();
    ev.push({at:mid+sabahMin()*60000,kind:'sabah',day:k});
    ev.push({at:S.masaAt==='adhan'?t.maghrib:t.maghrib-15*60000,kind:'masa',day:k});
    if(isFri(k)){
      ev.push({at:mid+600*60000,kind:'kahf',day:k});
      ev.push({at:t.maghrib-60*60000,kind:'jumua',day:k});
    }
    if(hb.indexOf('nawm')>=0||hb.indexOf('mulk')>=0)ev.push({at:t.isha+150*60000,kind:'nawm',day:k});
    var wd=parse(k).getDay();
    if(hb.indexOf('siyam')>=0&&(wd===0||wd===3))ev.push({at:t.isha+30*60000,kind:'siyamR',day:k});
    ev.push({at:t.isha+100*60000,kind:'compZ',day:k});
  }
  ev.sort(function(a,b){return a.at-b.at});
  return ev;
}
function checkWebAlarms(){
  if(!isWeb)return;
  load();
  if(S.notif===false)return;
  var now=Date.now(),k=today(),fired=(S.firedDay===k&&S.fired)?S.fired:{},changed=false;
  if(S.firedDay!==k){S.firedDay=k;S.fired={};fired=S.fired;changed=true}
  var evs=dayEvents(k);
  for(var i=0;i<evs.length;i++){
    var e=evs[i],fk=k+':'+e.kind;
    if(now>=e.at&&now-e.at<=300000&&fired[fk]!==e.at){
      fired[fk]=e.at;changed=true;
      if(!activeAlarm)fireWebAlarm(e.kind,e.day,false);
      break;
    }
  }
  var sn=S.snoozes||[],rem=[];
  sn.forEach(function(s){
    if(now>=s.at&&now-s.at<=300000){
      if(!activeAlarm)fireWebAlarm(s.kind,s.day,false);
      changed=true;
    }else if(s.at>now){rem.push(s)}
  });
  if(rem.length!==sn.length){S.snoozes=rem;B.put('snoozes',JSON.stringify(rem))}
  if(changed){
    var j=readSt();j.firedDay=k;j.fired=fired;LS.setItem('st',JSON.stringify(j));
  }
  armWebAlarms();
}
function armWebAlarms(){
  if(!isWeb)return;
  clearTimeout(alarmTimer);alarmTimer=null;
  load();
  if(S.notif===false)return;
  var now=Date.now(),k=today(),fired=(S.firedDay===k&&S.fired)?S.fired:{},nextAt=Infinity;
  dayEvents(k).forEach(function(e){
    var fk=k+':'+e.kind;
    if(e.at>now&&fired[fk]!==e.at&&e.at<nextAt)nextAt=e.at;
  });
  (S.snoozes||[]).forEach(function(s){if(s.at>now&&s.at<nextAt)nextAt=s.at});
  if(nextAt<Infinity){
    alarmTimer=setTimeout(checkWebAlarms,Math.max(500,Math.min(nextAt-now+150,2147483000)));
  }
}

function render(){try{render0()}catch(e){console.log('RENDER ERR '+e+' '+(e.stack||''))}}
function render0(){load();if(cur==='today')rToday();else if(cur==='fire')rFire();else if(cur==='habits')rHabits();else rSet();console.log('render '+cur+' '+($('#t-'+cur).innerHTML.length));if($('#sheet').classList.contains('on')){if(CN)drawCnt();else if(RD)drawRead();else if(viewDay)openDay(viewDay)}}
window.onState=function(){render()};
window.onerror=function(m,u,l){try{console.log('ERR '+m+' @'+l)}catch(e){}};
window.onBack=function(){if(activeAlarm){closeAlarmUI();return true}if($('#sheet').classList.contains('on')){closeSheet();return true}if(cur!=='today'){go('today');return true}return false};
document.querySelectorAll('nav button').forEach(function(b){b.addEventListener('click',function(){go(b.dataset.t)})});
load();if(!S.start)put('start',today());
render();
if(isWeb){checkWebAlarms();setInterval(checkWebAlarms,5000);document.addEventListener('visibilitychange',function(){if(!document.hidden)checkWebAlarms()});window.addEventListener('focus',checkWebAlarms)}
setInterval(function(){if(cur==='today'&&!$('#sheet').classList.contains('on'))rToday()},60000);
})();