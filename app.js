import {BOX_STYLES} from './box-styles.js';
import {layoutLetter} from './layout.js';
import {createScene} from './scene.bundle.js';
const $=s=>document.querySelector(s), canvas=$('#card'),ctx=canvas.getContext('2d');
let view3D=null,sceneStrokes=[];try{view3D=createScene($('.card-wrap'));document.body.classList.add('webgl-ready');}catch(e){console.warn('3D renderer unavailable; using canvas fallback',e);}
let letterLayout=layoutLetter('',600);
const state={flavor:'almond',paper:'cream',wrap:'yellow',box:'green'};
const papers={cream:['#faf3df','바닐라 크림'],pink:['#f7dfe2','딸기 우유'],mint:['#dfe9dd','피스타치오'],cocoa:['#544139','코코아']};
const initials=[...'ㄱㄲㄴㄷㄸㄹㅁㅂㅃㅅㅆㅇㅈㅉㅊㅋㅌㅍㅎ'], vowels=[...'ㅏㅐㅑㅒㅓㅔㅕㅖㅗㅘㅙㅚㅛㅜㅝㅞㅟㅠㅡㅢㅣ'], finals=['',...'ㄱㄲㄳㄴㄵㄶㄷㄹㄺㄻㄼㄽㄾㄿㅀㅁㅂㅄㅅㅆㅇㅈㅊㅋㅌㅍㅎ'];
const paths={
'ㄱ':[[.12,.12,.88,.12,.88,.88]],'ㄴ':[[.12,.12,.12,.88,.88,.88]],'ㄷ':[[.88,.12,.12,.12,.12,.88,.88,.88]],'ㄹ':[[.12,.12,.88,.12,.88,.49,.12,.49,.12,.88,.88,.88]],'ㅁ':[[.12,.12,.88,.12,.88,.88,.12,.88,.12,.12]],'ㅂ':[[.12,.1,.12,.88,.88,.88,.88,.1],[.12,.47,.88,.47]],'ㅅ':[[.5,.12,.1,.88],[.5,.12,.9,.88]],'ㅇ':'circle','ㅈ':[[.12,.12,.88,.12],[.5,.17,.12,.88],[.5,.17,.88,.88]],'ㅊ':[[.37,.04,.63,.04],[.12,.25,.88,.25],[.5,.3,.12,.9],[.5,.3,.88,.9]],'ㅋ':[[.12,.12,.88,.12,.88,.88],[.12,.48,.88,.48]],'ㅌ':[[.88,.12,.12,.12,.12,.88,.88,.88],[.12,.48,.85,.48]],'ㅍ':[[.08,.12,.92,.12],[.08,.88,.92,.88],[.28,.16,.28,.84],[.72,.16,.72,.84]],'ㅎ':[[.4,.02,.6,.02],[.12,.21,.88,.21]],
'ㅏ':[[.4,.08,.4,.92],[.4,.5,.9,.5]],'ㅑ':[[.4,.08,.4,.92],[.4,.35,.9,.35],[.4,.65,.9,.65]],'ㅓ':[[.6,.08,.6,.92],[.1,.5,.6,.5]],'ㅕ':[[.6,.08,.6,.92],[.1,.35,.6,.35],[.1,.65,.6,.65]],'ㅗ':[[.1,.7,.9,.7],[.5,.12,.5,.7]],'ㅛ':[[.1,.7,.9,.7],[.32,.12,.32,.7],[.68,.12,.68,.7]],'ㅜ':[[.1,.3,.9,.3],[.5,.3,.5,.9]],'ㅠ':[[.1,.3,.9,.3],[.32,.3,.32,.9],[.68,.3,.68,.9]],'ㅡ':[[.08,.5,.92,.5]],'ㅣ':[[.5,.08,.5,.92]]};
const doubles={'ㄲ':'ㄱ','ㄸ':'ㄷ','ㅃ':'ㅂ','ㅆ':'ㅅ','ㅉ':'ㅈ'};
const pairs={'ㄳ':'ㄱㅅ','ㄵ':'ㄴㅈ','ㄶ':'ㄴㅎ','ㄺ':'ㄹㄱ','ㄻ':'ㄹㅁ','ㄼ':'ㄹㅂ','ㄽ':'ㄹㅅ','ㄾ':'ㄹㅌ','ㄿ':'ㄹㅍ','ㅀ':'ㄹㅎ','ㅄ':'ㅂㅅ'};
let seed=1;function random(){seed=(seed*1664525+1013904223)>>>0;return seed/4294967296;}
function paintStick(ctx,x1,y1,x2,y2,width){const len=Math.hypot(x2-x1,y2-y1);if(len<1)return;ctx.save();width*=.86+random()*.25;ctx.translate(x1+(random()-.5)*width*.6,y1+(random()-.5)*width*.6);ctx.rotate(Math.atan2(y2-y1,x2-x1)+(random()-.5)*.065);ctx.shadowColor='#321b1655';ctx.shadowBlur=width*.7;ctx.shadowOffsetX=width*.18;ctx.shadowOffsetY=width*.5;ctx.fillStyle='#d8a15c';ctx.beginPath();ctx.roundRect(-width/2,-width/2,len+width,width,width*.45);ctx.fill();ctx.shadowColor='transparent';const tip=Math.min(len*(.23+random()*.08),width*3.5);const grad=ctx.createLinearGradient(0,-width/2,0,width/2);let colors=['#51321e','#986c43','#472b1b'];grad.addColorStop(0,colors[0]);grad.addColorStop(.35,colors[1]);grad.addColorStop(1,colors[2]);ctx.fillStyle=grad;ctx.beginPath();ctx.roundRect(-width/2,-width*.56,Math.max(width,len-tip+width/2),width*1.12,width*.48);ctx.fill();ctx.globalAlpha=.32;ctx.strokeStyle='#fff0c8';ctx.lineWidth=Math.max(1,width*.1);ctx.beginPath();ctx.moveTo(1,-width*.27);ctx.lineTo(Math.max(2,len-tip-2),-width*.27);ctx.stroke();ctx.globalAlpha=1;
for(let k=0;k<len/5;k++){ctx.fillStyle=k%2?'#ffffff0d':'#210d0c16';ctx.beginPath();ctx.ellipse(random()*Math.max(1,len-tip),(random()-.5)*width*.8,.4+random()*.9,.5+random(),0,0,7);ctx.fill();}const decoration=['plain','almond','drizzle','almond','plain','crumb','almond','drizzle'][(sceneStrokes.length-1)%8];if(decoration==='almond'||decoration==='crumb'){for(let i=0;i<len/6;i++){const px=random()*Math.max(1,len-tip),py=(random()-.5)*width*.8;ctx.fillStyle=decoration==='crumb'?['#69452e','#a1744c','#43291c'][i%3]:['#d7ad76','#e9ca95','#bd8a50'][i%3];ctx.beginPath();ctx.ellipse(px,py,width*.19,width*.12,random()*3,0,Math.PI*2);ctx.fill();}}if(decoration==='drizzle'){ctx.save();ctx.beginPath();ctx.rect(0,-width*.56,Math.max(1,len-tip),width*1.12);ctx.clip();ctx.strokeStyle=(sceneStrokes.length-1)%8===7?'#ead2aa':'#43271a';ctx.lineWidth=width*.14;for(let x=0;x<len-tip;x+=width*1.4){ctx.beginPath();ctx.moveTo(x-width*.3,-width);ctx.lineTo(x+width*.5,width);ctx.stroke();}ctx.restore();}ctx.restore();}
let captureSprites=false,sprites=[];
function stick(x1,y1,x2,y2,width){
 const before=seed,m=ctx.getTransform();const a=new DOMPoint(x1,y1).matrixTransform(m),b=new DOMPoint(x2,y2).matrixTransform(m);sceneStrokes.push({x1:a.x,y1:a.y,x2:b.x,y2:b.y,width});paintStick(ctx,x1,y1,x2,y2,width);if(!captureSprites)return;
 const after=seed,p1=new DOMPoint(x1,y1).matrixTransform(m),p2=new DOMPoint(x2,y2).matrixTransform(m),pad=width*4;
 const left=Math.floor(Math.min(p1.x,p2.x)-pad),top=Math.floor(Math.min(p1.y,p2.y)-pad);
 const tile=document.createElement('canvas');tile.width=Math.ceil(Math.abs(p2.x-p1.x)+pad*2);tile.height=Math.ceil(Math.abs(p2.y-p1.y)+pad*2);
 const c=tile.getContext('2d');c.setTransform(m.a,m.b,m.c,m.d,m.e-left,m.f-top);seed=before;paintStick(c,x1,y1,x2,y2,width);seed=after;
 sprites.push({src:tile.toDataURL(),left,top,width:tile.width,height:tile.height});
}
function linePath(p,x,y,w,h,th){for(let i=0;i<p.length-2;i+=2)stick(x+p[i]*w,y+p[i+1]*h,x+p[i+2]*w,y+p[i+3]*h,th);}
function ring(x,y,w,h,th){const n=9;for(let i=0;i<n;i++){const a=i/n*Math.PI*2,b=(i+1)/n*Math.PI*2;stick(x+w/2+Math.cos(a)*w*.36,y+h/2+Math.sin(a)*h*.36,x+w/2+Math.cos(b)*w*.36,y+h/2+Math.sin(b)*h*.36,th);}}
function jamo(c,x,y,w,h,t){if(doubles[c]||pairs[c]){const s=doubles[c]?doubles[c].repeat(2):pairs[c];jamo(s[0],x,y,w*.45,h,t*.85);jamo(s[1],x+w*.55,y,w*.45,h,t*.85);return;}
if(['ㅐ','ㅒ','ㅔ','ㅖ'].includes(c)){jamo({'ㅐ':'ㅏ','ㅒ':'ㅑ','ㅔ':'ㅓ','ㅖ':'ㅕ'}[c],x,y,w*.65,h,t);jamo('ㅣ',x+w*.65,y,w*.35,h,t);return;}
const compound={'ㅘ':['ㅗ','ㅏ'],'ㅙ':['ㅗ','ㅐ'],'ㅚ':['ㅗ','ㅣ'],'ㅝ':['ㅜ','ㅓ'],'ㅞ':['ㅜ','ㅔ'],'ㅟ':['ㅜ','ㅣ'],'ㅢ':['ㅡ','ㅣ']}[c];if(compound){jamo(compound[0],x,y+h*.52,w*.65,h*.48,t);jamo(compound[1],x+w*.65,y,w*.35,h,t);return;}
if(c==='ㅇ')ring(x,y,w,h,t);else{(paths[c]||[]).forEach(p=>linePath(p,x,y,w,h,t));if(c==='ㅎ')ring(x+w*.1,y+h*.34,w*.8,h*.65,t);}}
const latin={A:[[.1,.9,.5,.1,.9,.9],[.26,.57,.74,.57]],B:[[.15,.1,.15,.9,.65,.9,.85,.7,.65,.5,.15,.5],[.65,.5,.85,.3,.65,.1,.15,.1]],C:[[.85,.15,.25,.15,.12,.35,.12,.7,.3,.9,.85,.9]],D:[[.15,.1,.15,.9,.65,.9,.88,.68,.88,.32,.65,.1,.15,.1]],E:[[.85,.1,.15,.1,.15,.9,.85,.9],[.15,.5,.7,.5]],F:[[.85,.1,.15,.1,.15,.9],[.15,.5,.7,.5]],G:[[.85,.15,.25,.15,.12,.35,.12,.7,.3,.9,.85,.9,.85,.55,.55,.55]],H:[[.15,.1,.15,.9],[.85,.1,.85,.9],[.15,.5,.85,.5]],I:[[.2,.1,.8,.1],[.5,.1,.5,.9],[.2,.9,.8,.9]],J:[[.2,.1,.85,.1,.85,.75,.65,.9,.25,.9,.12,.7]],K:[[.15,.1,.15,.9],[.85,.1,.15,.55,.85,.9]],L:[[.15,.1,.15,.9,.85,.9]],M:[[.1,.9,.1,.1,.5,.55,.9,.1,.9,.9]],N:[[.15,.9,.15,.1,.85,.9,.85,.1]],O:'circle',P:[[.15,.9,.15,.1,.7,.1,.88,.3,.7,.5,.15,.5]],Q:[[.65,.65,.95,.95]],R:[[.15,.9,.15,.1,.7,.1,.88,.3,.7,.5,.15,.5],[.5,.5,.9,.9]],S:[[.85,.1,.3,.1,.12,.3,.3,.5,.7,.5,.88,.7,.7,.9,.15,.9]],T:[[.1,.1,.9,.1],[.5,.1,.5,.9]],U:[[.15,.1,.15,.7,.3,.9,.7,.9,.85,.7,.85,.1]],V:[[.1,.1,.5,.9,.9,.1]],W:[[.08,.1,.25,.9,.5,.5,.75,.9,.92,.1]],X:[[.1,.1,.9,.9],[.9,.1,.1,.9]],Y:[[.1,.1,.5,.5,.9,.1],[.5,.5,.5,.9]],Z:[[.1,.1,.9,.1,.1,.9,.9,.9]],'!':[[.5,.1,.5,.65],[.5,.85,.5,.9]],'?':[[.15,.25,.3,.1,.7,.1,.85,.3,.5,.55,.5,.65],[.5,.85,.5,.9]],'1':[[.3,.3,.5,.1,.5,.9],[.25,.9,.75,.9]],'2':[[.15,.2,.3,.1,.7,.1,.85,.3,.15,.9,.85,.9]],'3':[[.15,.1,.85,.1,.5,.5,.85,.6,.85,.9,.15,.9]],'4':[[.7,.9,.7,.1,.1,.65,.9,.65]],'5':[[.85,.1,.15,.1,.15,.5,.75,.5,.85,.65,.85,.9,.15,.9]],'6':[[.8,.1,.2,.1,.15,.9,.85,.9,.85,.5,.15,.5]],'7':[[.1,.1,.9,.1,.4,.9]],'8':[[.2,.1,.8,.1,.8,.9,.2,.9,.2,.1],[.2,.5,.8,.5]],'9':[[.85,.5,.15,.5,.15,.1,.85,.1,.85,.9,.2,.9]],'0':'circle','♡':[[.5,.9,.08,.4,.08,.2,.25,.1,.5,.3,.75,.1,.92,.2,.92,.4,.5,.9]]};
function glyph(c,x,y,size){const cp=c.codePointAt(0),t=size*.064,w=size*.86,h=size*.86;if(cp>=0xac00&&cp<=0xd7a3){const n=cp-0xac00,L=initials[Math.floor(n/588)],V=vowels[Math.floor(n/28)%21],T=finals[n%28];const upper=T?h*.66:h;const horizontal=['ㅗ','ㅛ','ㅜ','ㅠ','ㅡ'].includes(V),mixed=['ㅘ','ㅙ','ㅚ','ㅝ','ㅞ','ㅟ','ㅢ'].includes(V);if(horizontal){jamo(L,x+w*.12,y,w*.76,upper*.56,t);jamo(V,x,y+upper*.57,w,upper*.43,t);}else if(mixed){jamo(L,x,y,w*.61,upper*.57,t);const vmap={'ㅘ':'ㅗ','ㅙ':'ㅗ','ㅚ':'ㅗ','ㅝ':'ㅜ','ㅞ':'ㅜ','ㅟ':'ㅜ','ㅢ':'ㅡ'},rmap={'ㅘ':'ㅏ','ㅙ':'ㅐ','ㅚ':'ㅣ','ㅝ':'ㅓ','ㅞ':'ㅔ','ㅟ':'ㅣ','ㅢ':'ㅣ'};jamo(vmap[V],x,y+upper*.57,w*.62,upper*.43,t);jamo(rmap[V],x+w*.67,y,w*.33,upper,t);}else{jamo(L,x,y,w*.59,upper,t);jamo(V,x+w*.65,y,w*.35,upper,t);}if(T)jamo(T,x+w*.12,y+h*.73,w*.76,h*.27,t*.85);return;}
if(paths[c]||doubles[c]){jamo(c,x,y,w,h,t);return;}if(c===' ')return;const normalized=['♥','❤','💕','💗','❤️'].includes(c)?'♡':c.toUpperCase();const p=latin[normalized];if(p==='circle')ring(x,y,w,h,t);else if(p){if(normalized==='Q')ring(x,y,w,h,t);p.forEach(a=>linePath(a,x,y,w,h,t));}else{ctx.save();ctx.fillStyle=state.paper==='cocoa'?'#f3d3aa':'#714633';ctx.font=`700 ${size*.8}px sans-serif`;ctx.fillText(c,x,y+size*.77);ctx.restore();}}
function heart(x,y,s,color){ctx.save();ctx.translate(x,y);ctx.scale(s,s);ctx.fillStyle=color;ctx.beginPath();ctx.moveTo(0,.3);ctx.bezierCurveTo(-1,-.3,-.6,-1,0,-.4);ctx.bezierCurveTo(.6,-1,1,-.3,0,.3);ctx.fill();ctx.restore();}
function render(){
sceneStrokes=[];seed=1111;const text=$('#message').value;
letterLayout=layoutLetter(text,canvas.clientWidth||600);
const {lines,size,lineHeight,height,startY,columns,toY,fromY}=letterLayout;
if(canvas.height!==height)canvas.height=height;
ctx.clearRect(0,0,1200,height);ctx.fillStyle='#ffffff';ctx.fillRect(0,0,1200,height);const dark=false;ctx.textAlign='center';
const scale=canvas.clientWidth/1200,input=$('#message');input.style.fontSize=`${size*.86*scale}px`;input.style.lineHeight=`${lineHeight*scale}px`;input.style.letterSpacing=`${size*.14*scale}px`;input.style.paddingTop=`${(startY-size*.15)*scale}px`;input.style.paddingLeft=input.style.paddingRight=`${Math.max(24,(1200-columns*size)/2-1)*scale}px`;
$('#name-to').style.top=`${toY/height*100}%`;$('#name-from').style.top=`${fromY/height*100}%`;
for(let i=0;i<lines.length;i++){let startX=600-lines[i].length*size/2+size*.07;lines[i].forEach((c,j)=>{const n=(c.codePointAt(0)*13+j*37+i*83)%101;const tilt=((n%17)-8)*.012;const dx=((n%11)-5)*size*.008,dy=((n%13)-6)*size*.008;const k=.94+(n%9)*.013;ctx.save();ctx.translate(startX+j*size+size*.43+dx,startY+i*lineHeight+size*.43+dy);ctx.rotate(tilt);ctx.scale(k,1+(n%7-3)*.018);glyph(c,-size*.43,-size*.43,size);ctx.restore();});}if(!text.trim()){ctx.fillStyle=dark?'#ead6bb':'#ad9580';ctx.font='30px sans-serif';ctx.fillStyle='#c3b8ae';ctx.fillText('여기를 눌러 입력하세요',600,600);}ctx.fillStyle=dark?'#ead6bb':'#9c7e64';ctx.font='19px sans-serif';const to=$('#to').value.trim(),from=$('#from').value.trim();if(to)ctx.fillText(`TO. ${to}`,600,toY);if(from)ctx.fillText(`FROM. ${from}`,600,fromY);canvas.setAttribute('aria-label',`${text||'빈'} 빼빼로 편지`);$('#empty-state').hidden=!!text.trim();$('#name-to').textContent=to?`TO. ${to}`:'';$('#name-from').textContent=from?`FROM. ${from}`:'';view3D?.update(sceneStrokes,state.flavor,height);view3D?.canvas.setAttribute('aria-label',`${text||'빈'} 빼빼로 편지 3D`);}
let timer;function toast(s){$('#toast').textContent=s;$('#toast').classList.add('visible');clearTimeout(timer);timer=setTimeout(()=>$('#toast').classList.remove('visible'),3500);}
$('#message').value='';['message','to','from'].forEach(id=>$('#'+id).addEventListener('input',render));

async function getFile(bare=false){if(!$('#message').value.trim()){toast('전하고 싶은 마음을 먼저 적어주세요.');$('#message').focus();return null;}const out=document.createElement('canvas');const packed=!bare && $('#package-dialog').open && $('#parcel').classList.contains('packed');out.width=1080;out.height=packed?1080:Math.round(1080*canvas.height/1200);if(packed)await drawPackage(out);else out.getContext('2d').drawImage(artwork(),0,0,out.width,out.height);const blob=await new Promise(r=>out.toBlob(r,'image/png'));if(!blob)throw Error('image');return new File([blob],!bare && $('#package-dialog').open && $('#parcel').classList.contains('packed')?'빼빼로-포장.png':'빼빼로-편지.png',{type:'image/png'});}
function download(file){const url=URL.createObjectURL(file),a=document.createElement('a');a.href=url;a.download=file.name;a.click();setTimeout(()=>URL.revokeObjectURL(url),10000);}
$('#save').onclick=async()=>{try{const file=await getFile();if(file){download(file);toast('이미지를 저장했어요.');}}catch{toast('이미지를 저장하지 못했어요. 다시 시도해주세요.');}};
$('#received-save').onclick=$('#save').onclick;
function createShareURL(){const data={v:1,m:$('#message').value,f:state.flavor,w:state.wrap,b:state.box,t:$('#to').value,r:$('#from').value};const bytes=new TextEncoder().encode(JSON.stringify(data));let raw='';bytes.forEach(b=>raw+=String.fromCharCode(b));return location.origin+location.pathname+'#letter='+btoa(raw).replaceAll('+','-').replaceAll('/','_').replace(/=+$/,'');}
async function copyShareLink(){try{await navigator.clipboard.writeText($('#share-url').value);toast('공유 링크를 복사했어요.');}catch{$('#share-url').focus();$('#share-url').select();toast('링크를 선택했어요. 복사해서 보내주세요.');}}
$('#copy-url').onclick=copyShareLink;
$('#share').onclick=async()=>{if(!$('#message').value.trim())return;const url=createShareURL();$('#share-url').value=url;$('#preview-link').href=url;$('#share-result').hidden=false;if(navigator.share){try{await navigator.share({title:'빼빼로 편지가 도착했어요',url});}catch(e){if(e.name!=='AbortError')await copyShareLink();}}else await copyShareLink();};

render();

new ResizeObserver(()=>render()).observe(canvas);
if(!location.hash.startsWith('#letter='))$('#message').focus({preventScroll:true});

let packageRun=0,packageTimer;
function chooseBox(style){
 state.box=BOX_STYLES[style]?style:'green';$('#parcel').dataset.box=state.box;view3D?.setBoxStyle(state.box);const palette=BOX_STYLES[state.box];
 $('#parcel').style.setProperty('--box-side',palette.bottom);$('#parcel').style.setProperty('--box-paper',palette.cream);
 $('#box-print').src=view3D?.boxArtwork()||'pepero-heart.png';
 document.querySelectorAll('[data-box]').forEach(button=>{const selected=button.dataset.box===state.box;button.classList.toggle('selected',selected);button.setAttribute('aria-pressed',String(selected));});
 if(!$('#share-result').hidden){const url=createShareURL();$('#share-url').value=url;$('#preview-link').href=url;}
}
for(const [style,palette] of Object.entries(BOX_STYLES)){
 const button=document.createElement('button');button.type='button';button.className='box-choice';button.dataset.box=style;button.setAttribute('aria-pressed',String(style===state.box));
 const img=document.createElement('img');img.src=view3D?.boxArtwork(style,true)||'pepero-heart.png';img.alt='';const label=document.createElement('span');label.textContent=palette.name;button.append(img,label);button.onclick=()=>chooseBox(style);$('#box-options').append(button);
}

function packPreview(){
 const run=++packageRun;clearTimeout(packageTimer);$('#parcel').classList.remove('packed');$('#unpack').disabled=true;$('#share').disabled=true;$('#unpack').textContent='펼쳐보기';
 packageTimer=setTimeout(()=>{if(run!==packageRun)return;$('#parcel').classList.add('packed');packageTimer=setTimeout(()=>{if(run===packageRun){$('#unpack').disabled=false;$('#share').disabled=false;}},2200);},650);
}
$('#pack').onclick=()=>{
 if(!$('#message').value.trim()){toast('문구를 먼저 입력해주세요.');$('#message').focus();return;}
 $('#share-result').hidden=true;$('#letter-image').src=artwork().toDataURL();chooseBox(state.box);$('#package-dialog').showModal();packPreview();
};
$('#close-package').onclick=()=>$('#package-dialog').close();
$('#unpack').onclick=()=>{
 if($('#parcel').classList.contains('packed')){packageRun++;clearTimeout(packageTimer);$('#parcel').classList.remove('packed');$('#unpack').textContent='다시 포장하기';}
 else packPreview();
};
$('#package-dialog').addEventListener('close',()=>{packageRun++;clearTimeout(packageTimer);$('#message').focus({preventScroll:true});});
async function drawPackage(out){const picture=new Image();picture.src=view3D?.boxArtwork(state.box,true)||$('#box-print').src;await picture.decode();const c=out.getContext('2d');c.fillStyle='#fff';c.fillRect(0,0,out.width,out.height);c.save();c.translate(out.width/2,out.height/2);c.rotate(-.06);c.shadowColor='#30201430';c.shadowBlur=25;c.shadowOffsetY=18;c.drawImage(picture,-190,-337,380,674);c.restore();}

let flightTimer,flightRun=0;
async function playLetter(){
 if(view3D){$('#replay').disabled=true;$('#received-save').disabled=true;document.body.classList.remove('awaiting-letter');document.body.classList.add('opening-letter');await view3D.replay();document.body.classList.remove('opening-letter');$('#replay').disabled=false;$('#received-save').disabled=false;return;}
 document.body.classList.remove('awaiting-letter');
 const run=++flightRun;clearTimeout(flightTimer);const layer=$('#flight-layer'),card=$('.card-wrap');layer.replaceChildren();card.classList.remove('playing');
 captureSprites=true;sprites=[];render();captureSprites=false;
 if(matchMedia('(prefers-reduced-motion: reduce)').matches)return;
 card.classList.add('playing');$('#replay').disabled=true;$('#received-save').disabled=true;
 const nodes=await Promise.all(sprites.map(async(s,i)=>{const img=new Image();img.src=s.src;img.className='flying-stick';img.style.left=s.left/12+'%';img.style.top=s.top/canvas.height*100+'%';img.style.width=s.width/12+'%';img.style.height=s.height/canvas.height*100+'%';const bx=150,by=canvas.height-200;
 img.style.setProperty('--dx',(bx-s.left)/s.width*100+'%');img.style.setProperty('--dy',(by-s.top)/s.height*100+'%');img.style.setProperty('--mx',((bx-s.left)*.45+(i%5-2)*35)/s.width*100+'%');img.style.setProperty('--my',((by-s.top)*.2-200-(i%7)*25)/s.height*100+'%');img.style.setProperty('--turn',((i%2?1:-1)*(120+i%8*45))+'deg');img.style.animationDelay=(.45+i*.014)+'s';await img.decode().catch(()=>{});return img;}));
 if(run!==flightRun)return;layer.replaceChildren(...nodes);
 flightTimer=setTimeout(()=>{if(run!==flightRun)return;card.classList.remove('playing');layer.replaceChildren();$('#replay').disabled=false;$('#received-save').disabled=false;},1900+sprites.length*14);
}
function prepareLetter(){document.body.classList.add('awaiting-letter');view3D?.setReceived(true);window.scrollTo({top:0,behavior:'instant'});}
$('#open-letter').onclick=playLetter;
$('#replay').onclick=prepareLetter;
function loadReceivedLetter(){if(!location.hash.startsWith('#letter='))return;try{const raw=location.hash.slice(8).replaceAll('-','+').replaceAll('_','/');if(raw.length>3000)throw Error('long');const data=JSON.parse(new TextDecoder().decode(Uint8Array.from(atob(raw),c=>c.charCodeAt(0))));if(data.v!==1||typeof data.m!=='string'||!data.m.trim()||data.m.length>24)throw Error('invalid');
 $('#message').value=data.m;$('#message').disabled=true;$('#to').value=typeof data.t==='string'?data.t.slice(0,12):'';$('#from').value=typeof data.r==='string'?data.r.slice(0,12):'';state.flavor='almond';state.box=BOX_STYLES[data.b]?data.b:'green';view3D?.setBoxStyle(state.box);state.wrap=['yellow','pink','kraft'].includes(data.w)?data.w:'yellow';document.body.classList.add('received');$('#snack-box').dataset.flavor=state.flavor;document.title='너에게 온 빼빼로 편지';render();prepareLetter();
 }catch{toast('편지 링크를 읽지 못했어요. 링크 전체를 확인해주세요.');}}
loadReceivedLetter();

function artwork(){if(!view3D)return canvas;view3D.draw();const out=document.createElement('canvas');out.width=1200;out.height=canvas.height;const c=out.getContext('2d');c.drawImage(view3D.canvas,0,0,1200,canvas.height);c.textAlign='center';c.fillStyle='#9c7e64';c.font='19px sans-serif';if($('#to').value.trim())c.fillText('TO. '+$('#to').value.trim(),600,letterLayout.toY);if($('#from').value.trim())c.fillText('FROM. '+$('#from').value.trim(),600,letterLayout.fromY);return out;}


$('#clear-message').onclick=()=>{if(document.body.classList.contains('received'))return;$('#message').value='';render();$('#message').focus({preventScroll:true});};
// Keep mobile actions attached to the visible viewport above the keyboard.
const viewport=window.visualViewport;
let viewportFrame=0;
function syncActionBar(){
 cancelAnimationFrame(viewportFrame);
 viewportFrame=requestAnimationFrame(()=>{
  const editing=document.activeElement?.matches('input,textarea');
  const keyboard=!!(viewport&&editing&&window.innerHeight-viewport.height>120);
  document.body.classList.toggle('keyboard-open',keyboard);
  const inset=keyboard?Math.max(0,window.innerHeight-viewport.height-viewport.offsetTop):0;
  document.documentElement.style.setProperty('--keyboard-inset',`${inset}px`);
 });
}
viewport?.addEventListener('resize',syncActionBar);
viewport?.addEventListener('scroll',syncActionBar);
window.addEventListener('resize',syncActionBar);
document.addEventListener('focusin',syncActionBar);
document.addEventListener('focusout',syncActionBar);
syncActionBar();
