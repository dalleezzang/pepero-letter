import * as THREE from 'three';
import {BOX_STYLES} from './box-styles.js';
import {RoomEnvironment} from 'three/addons/environments/RoomEnvironment.js';

export function createScene(host,{introScale=3.05}={}){
 const renderer=new THREE.WebGLRenderer({antialias:true,alpha:false,preserveDrawingBuffer:true,powerPreference:'high-performance'});
 renderer.setPixelRatio(Math.min(devicePixelRatio,2));renderer.setSize(host.clientWidth,host.clientWidth);renderer.setClearColor(0xffffff);renderer.shadowMap.enabled=true;renderer.shadowMap.type=THREE.PCFSoftShadowMap;renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=.95;renderer.domElement.id='three-view';host.prepend(renderer.domElement);
 const scene=new THREE.Scene();scene.background=new THREE.Color('white');const camera=new THREE.OrthographicCamera(-600,600,600,-600,1,5000);camera.position.set(0,-220,1600);camera.lookAt(0,0,0);
 const pmrem=new THREE.PMREMGenerator(renderer),envScene=new RoomEnvironment(),environment=pmrem.fromScene(envScene,.05);scene.environment=environment.texture;scene.environmentIntensity=.55;envScene.dispose();pmrem.dispose();
 const hemi=new THREE.HemisphereLight(0xfff9f0,0xc7b4a2,.7);scene.add(hemi);
 const key=new THREE.DirectionalLight(0xfff5e9,2.5);key.position.set(-460,600,900);key.castShadow=true;key.shadow.mapSize.set(2048,2048);Object.assign(key.shadow.camera,{left:-900,right:900,top:900,bottom:-900,near:10,far:2200});key.shadow.bias=-.0003;key.shadow.normalBias=1;key.shadow.radius=6;scene.add(key);
 const fill=new THREE.DirectionalLight(0xffffff,.65);fill.position.set(600,50,500);scene.add(fill);
 const floor=new THREE.Mesh(new THREE.PlaneGeometry(6000,20000),new THREE.ShadowMaterial({color:0x6a4a32,opacity:.12}));floor.position.z=-4;floor.receiveShadow=true;scene.add(floor);
 function noiseTexture(){const c=document.createElement('canvas');c.width=c.height=256;const p=c.getContext('2d'),d=p.createImageData(256,256);let r=83;for(let i=0;i<d.data.length;i+=4){r=(r*1664525+1013904223)>>>0;const n=105+r%70;d.data[i]=d.data[i+1]=d.data[i+2]=n;d.data[i+3]=255;}p.putImageData(d,0,0);const t=new THREE.CanvasTexture(c);t.wrapS=t.wrapT=THREE.RepeatWrapping;t.repeat.set(2,3);return t;}
 const grain=noiseTexture();const mats={chocolate:new THREE.MeshPhysicalMaterial({color:0x452519,roughness:.31,metalness:0,clearcoat:.32,clearcoatRoughness:.32,bumpMap:grain,bumpScale:.28}),strawberry:new THREE.MeshPhysicalMaterial({color:0xd591a1,roughness:.4,clearcoat:.24,clearcoatRoughness:.3,bumpMap:grain,bumpScale:.3}),almond:new THREE.MeshPhysicalMaterial({color:0x603a23,roughness:.48,clearcoat:.15,bumpMap:grain,bumpScale:.5})};
 const biscuit=new THREE.MeshStandardMaterial({color:0xd4a15b,roughness:.82,bumpMap:grain,bumpScale:.6}),nutMat=new THREE.MeshStandardMaterial({color:0xd6af74,roughness:.86});
 const crumbMat=new THREE.MeshStandardMaterial({color:0x6d472d,roughness:.9}),darkDrizzle=new THREE.MeshPhysicalMaterial({color:0x392116,roughness:.33,clearcoat:.2}),whiteDrizzle=new THREE.MeshStandardMaterial({color:0xead3ac,roughness:.5});
 const nutGeo=new THREE.DodecahedronGeometry(1,0),sphereGeo=new THREE.SphereGeometry(1,12,8);

 let boxStyle='green';
 let sheetHeight=1200,phase='editing',finishAnimation=null,receivedMode=false;
 function frameHeight(){return phase==='waiting'?1200:sheetHeight;}
 let rods=[],currentKey='',currentFlavor='almond',animation=null,raf=0,lastPointer=0;const cluster=new THREE.Group();scene.add(cluster);
 function mesh(geo,mat,parent){const m=new THREE.Mesh(geo,mat);m.castShadow=true;m.receiveShadow=true;parent.add(m);return m;}
 function randomFor(i){let n=(i*731+371)>>>0;return()=>{n=(n*1664525+1013904223)>>>0;return n/4294967296;};}
 function makeRod(data,i,flavor){const rand=randomFor(i),group=new THREE.Group(),length=Math.hypot(data.x2-data.x1,data.y2-data.y1),radius=Math.max(3,data.width*.61),coatLength=length*(.72+rand()*.07),decoration=['plain','almond','drizzle','almond','plain','crumb','almond','drizzle'][i%8];
  const body=mesh(new THREE.CylinderGeometry(radius*.69,radius*.72,length,12,1),biscuit,group);const top=mesh(sphereGeo,biscuit,group);top.position.y=length/2;top.scale.set(radius*.69,radius*.42,radius*.69);const bottom=mesh(sphereGeo,biscuit,group);bottom.position.y=-length/2;bottom.scale.set(radius*.7,radius*.42,radius*.7);
  const geo=new THREE.CylinderGeometry(radius*.94,radius,coatLength,18,8);const pos=geo.attributes.position;for(let k=0;k<pos.count;k++){let x=pos.getX(k),y=pos.getY(k),z=pos.getZ(k);const wave=1+Math.sin(y*.12+i*3)*.025+Math.sin(Math.atan2(z,x)*7+i)*.025;pos.setXYZ(k,x*wave,y+(Math.abs(y)>coatLength*.48?(rand()-.5)*radius*.45:0),z*wave);}geo.computeVertexNormals();const coat=mesh(geo,mats[flavor],group);coat.position.y=(length-coatLength)/2;
  const cap=mesh(sphereGeo,mats[flavor],group);cap.position.y=length/2;cap.scale.set(radius*.94,radius*.5,radius*.94);
  if(decoration==='almond'||decoration==='crumb'){const crumb=decoration==='crumb';const count=Math.max(1,Math.min(32,Math.floor(coatLength/4))),nuts=new THREE.InstancedMesh(nutGeo,crumb?crumbMat:nutMat,count),dummy=new THREE.Object3D();nuts.castShadow=true;for(let k=0;k<count;k++){const angle=rand()*Math.PI*2;dummy.position.set(Math.cos(angle)*radius,(length/2-coatLength)+rand()*coatLength,Math.sin(angle)*radius);const scale=crumb?.7:1;dummy.scale.set(radius*.34*scale,radius*.48*scale,radius*.25*scale);dummy.rotation.set(rand()*3,rand()*3,rand()*3);dummy.updateMatrix();nuts.setMatrixAt(k,dummy.matrix);nuts.setColorAt(k,new THREE.Color().setScalar(.78+rand()*.3));}group.add(nuts);}

  if(decoration==='drizzle'){
   const turns=Math.max(1.5,Math.min(7,coatLength/(radius*3.2))),points=[],segments=Math.ceil(turns*18);
   for(let k=0;k<=segments;k++){const t=k/segments,angle=t*turns*Math.PI*2;points.push(new THREE.Vector3(Math.cos(angle)*radius*1.015,length/2-coatLength+radius*.5+t*(coatLength-radius),Math.sin(angle)*radius*1.015));}
   mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(points),segments,radius*.115,5,false),i%8===7?whiteDrizzle:darkDrizzle,group);
  }

  const x=(data.x1+data.x2)/2-600,y=sheetHeight/2-(data.y1+data.y2)/2;group.position.set(x,y,radius+3+(i%4)*.5);const direction=new THREE.Vector3(data.x2-data.x1,-(data.y2-data.y1),0).normalize();group.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),direction);group.rotateY((rand()-.5)*.3);group.userData.target=group.position.clone();group.userData.rotation=group.quaternion.clone();cluster.add(group);return group;
 }
 function disposeRod(g){g.traverse(o=>{if(o.isMesh&&!['SphereGeometry','DodecahedronGeometry'].includes(o.geometry.type))o.geometry.dispose();});cluster.remove(g);}
 function draw(){renderer.render(scene,camera);}
 function update(strokes,flavor,height=1200){const k=JSON.stringify(strokes)+flavor+height;if(k===currentKey){draw();return;}currentKey=k;currentFlavor=flavor;sheetHeight=height;camera.top=frameHeight()/2;camera.bottom=-frameHeight()/2;camera.updateProjectionMatrix();resizeSurface();key.shadow.camera.top=height/2+400;key.shadow.camera.bottom=-height/2-400;key.shadow.camera.far=height+2200;key.shadow.camera.updateProjectionMatrix();if(box)box.position.y=-height/2+220;animation=null;cancelAnimationFrame(raf);finishAnimation?.();finishAnimation=null;rods.forEach(disposeRod);rods=strokes.map((s,i)=>makeRod(s,i,flavor));buildCrumbs();if(phase==='waiting')prepareBox();else if(phase==='opening'){phase='complete';settle();}crumbs.visible=receivedMode&&phase==='complete';draw();}
 function boxTexture(flavor,style=boxStyle,flat=true){
  const palette=BOX_STYLES[style]||BOX_STYLES.green;
  const c=document.createElement('canvas');c.width=768;c.height=1364;const p=c.getContext('2d'),rand=randomFor(710);
  p.fillStyle=palette.cream;p.fillRect(0,0,768,1364);
  const green=p.createLinearGradient(0,0,768,1364);green.addColorStop(0,palette.top);green.addColorStop(1,palette.bottom);
  p.fillStyle=green;p.beginPath();p.moveTo(0,435);p.bezierCurveTo(250,510,500,360,768,470);p.lineTo(768,1364);p.lineTo(0,1364);p.fill();
  p.strokeStyle=palette.gold;p.lineWidth=2;p.strokeRect(25,25,718,1314);p.strokeRect(32,32,704,1300);
  p.textAlign='center';p.fillStyle=palette.ink;p.font='500 23px sans-serif';p.fillText('마음을 담은 작은 선물',384,108);
  p.fillStyle=palette.ink;p.font='900 148px sans-serif';p.fillText('빼빼로',384,288);
  p.fillStyle=style==='gothic'?palette.gold:palette.ink;p.font='600 27px sans-serif';p.fillText('A L M O N D  &  C H O C O L A T E',384,352);
  if(style==='pink'){
   p.fillStyle='#fff4f8';for(let y=510;y<1220;y+=112)for(let x=74;x<740;x+=125){p.font='30px serif';p.fillText('♥',x+(y%224?18:0),y);}
   p.strokeStyle='#fff5ed';p.lineWidth=5;for(const x of [48,720]){p.beginPath();for(let y=52;y<1330;y+=24){p.moveTo(x,y);p.arc(x,y,10,0,Math.PI*2);}p.stroke();}
  }
  if(style==='gothic'){
   p.strokeStyle='#e9d8e5';p.lineWidth=2;
   for(const x of [52,716])for(let y=52;y<1330;y+=30){p.beginPath();p.ellipse(x,y,14,20,0,0,Math.PI*2);p.stroke();p.fillStyle='#e9d8e5';p.beginPath();p.arc(x,y,3,0,7);p.fill();}
   p.fillStyle='#855170';p.fillRect(92,30,24,1304);p.fillRect(652,30,24,1304);
  }
  p.save();p.translate(380,850);p.rotate(-.24);
  for(let i=0;i<3;i++){
   p.save();p.translate((i-1)*134,(i%2)*-60);p.rotate((i-1)*.055);
   p.shadowColor='#0008';p.shadowBlur=20;p.shadowOffsetX=14;p.shadowOffsetY=20;
   let g=p.createLinearGradient(-25,0,25,0);g.addColorStop(0,'#b67e3c');g.addColorStop(.4,'#f6d58a');g.addColorStop(1,'#c18d49');p.fillStyle=g;p.beginPath();p.roundRect(-24,-325,48,670,22);p.fill();
   g=p.createLinearGradient(-35,0,35,0);g.addColorStop(0,'#2b140d');g.addColorStop(.3,'#75452b');g.addColorStop(.58,'#95603c');g.addColorStop(1,'#32190e');p.fillStyle=g;p.beginPath();p.roundRect(-34,-335,68,530,28);p.fill();p.shadowColor='transparent';
   for(let n=0;n<68;n++){const x=(rand()-.5)*60,y=-320+rand()*495;p.save();p.translate(x,y);p.rotate(rand()*6);p.fillStyle=['#d1a05d','#f0cf91','#b88448'][n%3];p.beginPath();p.moveTo(-5,-9);p.lineTo(7,-5);p.lineTo(5,7);p.lineTo(-6,5);p.closePath();p.fill();p.restore();}
   p.restore();
  }p.restore();
  p.fillStyle=palette.gold;p.font='26px serif';p.fillText('♥',384,1250);p.font='500 21px sans-serif';p.fillText('너에게 전하는 달콤한 마음',384,1293);
  if(flat&&(style==='pink'||style==='gothic')){
   const dark=style==='gothic';p.save();p.translate(384,1080);p.shadowColor='#180d2855';p.shadowBlur=16;p.shadowOffsetY=8;
   const satin=p.createLinearGradient(-180,-60,180,80);satin.addColorStop(0,dark?'#643851':'#c95385');satin.addColorStop(.45,dark?'#c29ab3':'#ffdae8');satin.addColorStop(1,dark?'#522c48':'#cf5e8e');p.fillStyle=satin;p.strokeStyle=dark?'#ddc0d2':'#fff0f6';p.lineWidth=3;
   for(const side of [-1,1]){p.save();p.scale(side,1);p.beginPath();p.moveTo(0,0);p.bezierCurveTo(75,-85,200,-90,185,-12);p.bezierCurveTo(215,78,70,49,0,0);p.fill();p.stroke();p.beginPath();p.moveTo(4,10);p.lineTo(75,15);p.lineTo(123,152);p.lineTo(76,126);p.lineTo(43,164);p.closePath();p.fill();p.stroke();p.restore();}
   p.beginPath();p.roundRect(-29,-30,58,64,15);p.fill();p.stroke();p.restore();
  }
  for(let i=0;i<9000;i++){p.fillStyle=i%2?'#ffffff06':'#38230d06';p.fillRect(rand()*768,rand()*1364,1.4,1.4);}
  const t=new THREE.CanvasTexture(c);t.colorSpace=THREE.SRGBColorSpace;t.anisotropy=renderer.capabilities.getMaxAnisotropy();return t;
 }

 function decorateBox(parent,style){
  if(!['pink','gothic'].includes(style))return;
  const gothic=style==='gothic',satin=new THREE.MeshPhysicalMaterial({color:gothic?0x532b50:0xe58eae,roughness:.32,metalness:.08,sheen:1,sheenColor:new THREE.Color(gothic?0xdda8d7:0xffe2ee),side:THREE.DoubleSide}),lace=new THREE.MeshStandardMaterial({color:gothic?0xe9dce8:0xffeee9,roughness:.7}),gemMat=new THREE.MeshPhysicalMaterial({color:gothic?0x9b429c:0xe64f85,metalness:.3,roughness:.1,clearcoat:1});
  const ribbon=mesh(new THREE.BoxGeometry(139,13,1.3),satin,parent);ribbon.position.set(0,-67,33.5);
  for(const side of [-1,1]){const band=mesh(new THREE.BoxGeometry(1.2,13,64),satin,parent);band.position.set(side*69.6,-67,0);}
  function strip(points,width){const curve=new THREE.CatmullRomCurve3(points.map(p=>new THREE.Vector3(...p))),vertices=[],uv=[],indices=[];for(let i=0;i<=48;i++){const t=i/48,p=curve.getPoint(t),tangent=curve.getTangent(t),across=new THREE.Vector3(-tangent.y,tangent.x,0).normalize();for(const side of [-1,1]){const v=p.clone().addScaledVector(across,side*width/2);vertices.push(v.x,v.y,v.z);uv.push(t,(side+1)/2);}if(i<48){const n=i*2;indices.push(n,n+1,n+2,n+1,n+3,n+2);}}const geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.Float32BufferAttribute(vertices,3));geo.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));geo.setIndex(indices);geo.computeVertexNormals();return mesh(geo,satin,parent);}
  for(const side of [-1,1]){
   strip([[side*3,-67,41],[side*21,-49,48],[side*43,-47,42],[side*42,-67,51],[side*23,-72,51],[side*3,-67,41]],14);
   strip([[side*5,-72,40],[side*13,-86,46],[side*21,-103,39],[side*29,-113,43]],16);
  }
  const knot=mesh(new THREE.SphereGeometry(1,18,12),satin,parent);knot.scale.set(8,10,7);knot.position.set(0,-67,46);
  if(gothic){
   const loops=new THREE.InstancedMesh(new THREE.TorusGeometry(2.8,.45,5,12),lace,84),dummy=new THREE.Object3D();let n=0;
   for(const x of [-67,67])for(let y=-116;y<=116;y+=7){dummy.position.set(x,y,34.5);dummy.scale.set(1,1.35,1);dummy.updateMatrix();loops.setMatrixAt(n++,dummy.matrix);}
   for(const y of [-119,119])for(let x=-54;x<=54;x+=14){dummy.position.set(x,y,34.5);dummy.scale.set(1.35,1,1);dummy.updateMatrix();loops.setMatrixAt(n++,dummy.matrix);}
   loops.count=n;loops.castShadow=true;parent.add(loops);
   const pearls=new THREE.InstancedMesh(new THREE.SphereGeometry(1.1,8,6),lace,64);n=0;for(const x of [-61,61])for(let y=-113;y<114;y+=8){dummy.position.set(x,y,35);dummy.scale.setScalar(1);dummy.updateMatrix();pearls.setMatrixAt(n++,dummy.matrix);}pearls.count=n;pearls.castShadow=true;parent.add(pearls);
   const jewel=mesh(new THREE.OctahedronGeometry(7,0),gemMat,parent);jewel.scale.set(.8,1.2,.5);jewel.position.set(0,-67,54);
   const chain=new THREE.CatmullRomCurve3([new THREE.Vector3(0,-76,47),new THREE.Vector3(3,-91,45),new THREE.Vector3(0,-101,43)]);mesh(new THREE.TubeGeometry(chain,16,.55,5,false),lace,parent);
   const drop=mesh(new THREE.OctahedronGeometry(5,0),gemMat,parent);drop.scale.set(.8,1.45,.5);drop.position.set(0,-105,44);
  }else{
   const shape=new THREE.Shape();shape.moveTo(0,-5);shape.bezierCurveTo(-11,1,-8,12,0,6);shape.bezierCurveTo(8,12,11,1,0,-5);
   for(const [x,y,scale] of [[-48,71,.9],[49,86,.6],[-47,25,.55],[47,-23,.8]]){const heart=mesh(new THREE.ExtrudeGeometry(shape,{depth:1.5,bevelEnabled:true,bevelSize:.6,bevelThickness:.5,bevelSegments:2,steps:1}),gemMat,parent);heart.position.set(x,y,34);heart.scale.setScalar(scale);heart.rotation.z=x*.005;}
  }
 }
 let box=null,boxMap=null;function createBox(flavor){if(box){scene.remove(box);box.traverse(o=>{if(o.isMesh){o.geometry.dispose();if(Array.isArray(o.material))o.material.forEach(m=>m.dispose());else if(!Object.values(mats).includes(o.material))o.material.dispose();}});boxMap?.dispose();}
  box=new THREE.Group();box.userData.flavor=flavor;box.userData.snacks=[];boxMap=boxTexture(flavor,boxStyle,false);const paper=new THREE.MeshStandardMaterial({color:BOX_STYLES[boxStyle].bottom,roughness:.82});const front=new THREE.MeshPhysicalMaterial({map:boxMap,roughness:.64,clearcoat:.12,clearcoatRoughness:.5});const cardboard=new THREE.MeshStandardMaterial({color:BOX_STYLES[boxStyle].cream,roughness:.9});
  const body=mesh(new THREE.BoxGeometry(138,245,64),[paper,paper,cardboard,paper,front,paper],box);const inside=mesh(new THREE.BoxGeometry(125,2,50),new THREE.MeshStandardMaterial({color:0x482b24,roughness:1}),box);inside.position.set(0,123,0);
  const edgeMaterial=new THREE.MeshStandardMaterial({color:BOX_STYLES[boxStyle].gold,roughness:.65,metalness:.2});
  for(const y of [-120,120]){const edge=mesh(new THREE.BoxGeometry(136,.7,.6),edgeMaterial,box);edge.position.set(0,y,32.4);}
  const seam=mesh(new THREE.BoxGeometry(.6,241,.5),paper,box);seam.position.set(67,0,32.4);
  const sideBand=mesh(new THREE.BoxGeometry(.5,47,60),cardboard,box);sideBand.position.set(69.3,82,0);
  const hinge=new THREE.Group();hinge.position.set(0,122,-32);box.add(hinge);const lid=mesh(new THREE.BoxGeometry(138,65,2),paper,hinge);lid.position.y=32;hinge.rotation.x=-.65;box.userData.hinge=hinge;
  for(let i=0;i<4;i++){const g=new THREE.Group();const rod=mesh(new THREE.CylinderGeometry(4.5,4.5,110,10),mats[flavor],g);g.position.set(-42+i*27,130,-15+i%2*14);g.rotation.z=(i-1.5)*.08;box.add(g);box.userData.snacks.push(g);}
  decorateBox(box,boxStyle);
  box.position.set(-400,-sheetHeight/2+220,45);box.rotation.set(.07,.08,-.18);scene.add(box);return box;
 }
 // A sparse, deterministic scatter stays with the letter through resize and replay.
 const crumbs=new THREE.Group();scene.add(crumbs);crumbs.visible=false;
 const biscuitCrumb=new THREE.MeshStandardMaterial({color:0xc89858,roughness:.95});
 function buildCrumbs(){
  crumbs.clear();if(!rods.length)return;
  const rand=randomFor(920),count=Math.min(22,Math.max(7,Math.round(rods.length*.28)));
  for(let i=0;i<count;i++){
   const rod=rods[Math.floor(rand()*rods.length)],angle=rand()*Math.PI*2,distance=20+rand()*33,size=2.3+rand()*2.6;
   const crumb=new THREE.Mesh(nutGeo,i%4===0?crumbMat:i%3===0?nutMat:biscuitCrumb);
   crumb.position.set(rod.userData.target.x+Math.cos(angle)*distance,rod.userData.target.y+Math.sin(angle)*distance,size*.35);
   crumb.scale.set(size,size*(.5+rand()*.45),size*.35);crumb.rotation.set(rand()*.5,rand()*.5,rand()*6.28);crumb.castShadow=true;crumb.receiveShadow=true;crumb.userData.rest=crumb.position.clone();crumbs.add(crumb);
  }
 }
 const hearts=new THREE.Group();scene.add(hearts);
 const heartShape=new THREE.Shape();heartShape.moveTo(0,-7);heartShape.bezierCurveTo(-18,3,-12,17,0,8);heartShape.bezierCurveTo(12,17,18,3,0,-7);
 const heartGeometry=new THREE.ShapeGeometry(heartShape);
 const particles=Array.from({length:64},(_,i)=>{const material=new THREE.MeshBasicMaterial({color:[0xe74770,0xf17f9e,0xe8ad35,0xc93358][i%4],side:THREE.DoubleSide,transparent:true,depthWrite:false});const particle=new THREE.Mesh(heartGeometry,material);particle.visible=false;hearts.add(particle);return particle;});
 const trailGeometry=new THREE.BufferGeometry();trailGeometry.setAttribute('position',new THREE.BufferAttribute(new Float32Array(24*6),3));
 const trails=new THREE.LineSegments(trailGeometry,new THREE.LineBasicMaterial({color:0xdcb976,transparent:true,opacity:.4,depthWrite:false}));trails.frustumCulled=false;trails.visible=false;scene.add(trails);
 function prepareBox(){
  crumbs.visible=false;
  rods.forEach(r=>r.visible=false);box.visible=true;box.position.set(0,35,32);box.scale.setScalar(introScale);box.rotation.set(.06,-.15,-.09);box.userData.hinge.rotation.x=Math.PI/2;box.userData.snacks.forEach(r=>r.visible=false);
  camera.top=600;camera.bottom=-600;camera.updateProjectionMatrix();resizeSurface();
  cancelAnimationFrame(raf);
  if(!matchMedia('(prefers-reduced-motion: reduce)').matches){const start=performance.now();function idle(now){if(phase!=='waiting')return;const t=(now-start)/1000;box.rotation.z=-.09+Math.sin(t*2.5)*.055;box.rotation.y=-.15+Math.sin(t*1.8)*.045;box.position.y=35+Math.sin(t*2.5)*7;draw();raf=requestAnimationFrame(idle);}raf=requestAnimationFrame(idle);}

 }
 function settle(){
  crumbs.visible=receivedMode&&phase==='complete';crumbs.children.forEach(c=>c.position.copy(c.userData.rest));
  rods.forEach(r=>{r.visible=true;r.position.copy(r.userData.target);r.quaternion.copy(r.userData.rotation);r.scale.setScalar(1);});
  if(box){box.position.set(-400,-sheetHeight/2+220,45);box.scale.setScalar(1);box.rotation.set(.07,.08,-.18);box.userData.hinge.rotation.x=-.9;box.userData.snacks.forEach(r=>r.visible=true);}
  particles.forEach(p=>p.visible=false);trails.visible=false;
 }
 function setReceived(value){
  receivedMode=value;
  cancelAnimationFrame(raf);finishAnimation?.();finishAnimation=null;animation=null;phase=value?'waiting':'editing';
  if(value){if(!box)createBox(currentFlavor);prepareBox();}else{if(box)box.visible=false;settle();if(box)box.visible=false;}draw();
 }
 function replay(){
  if(phase==='opening')return Promise.resolve();cancelAnimationFrame(raf);phase='opening';camera.top=sheetHeight/2;camera.bottom=-sheetHeight/2;camera.updateProjectionMatrix();resizeSurface();
  if(matchMedia('(prefers-reduced-motion: reduce)').matches){phase='complete';settle();draw();return Promise.resolve();}
  const start=performance.now(),stagger=Math.min(17,850/Math.max(1,rods.length)),duration=3300;
  const origin=new THREE.Vector3(),destination=new THREE.Vector3(-400,-sheetHeight/2+220,45),initial=box.position.clone(),point=new THREE.Vector3();
  function flight(r,i,t,out){const target=r.userData.target,side=i%2?1:-1,arc=Math.sin(Math.PI*t),ease=t*t*(3-2*t);out.lerpVectors(origin,target,ease);out.x+=arc*(side*(230+i%5*45)+Math.sin(t*Math.PI*2+i)*100);out.y+=arc*(220+(i%7)*28);out.z+=arc*(260+(i%6)*40);return out;}
  animation=true;return new Promise(resolve=>{finishAnimation=resolve;
   function tick(now){const elapsed=now-start,move=THREE.MathUtils.clamp((elapsed-260)/1050,0,1),ease=1-Math.pow(1-move,3);
    box.position.lerpVectors(initial,destination,ease);box.position.z+=Math.sin(move*Math.PI)*170;box.scale.setScalar(introScale-(introScale-1)*ease+Math.sin(Math.min(1,elapsed/500)*Math.PI)*.18);box.rotation.set(.06+Math.sin(move*Math.PI)*.35,-.15+Math.sin(move*Math.PI)*.45,-.09-.09*ease+Math.sin(elapsed*.04)*.035*(1-ease));box.userData.hinge.rotation.x=Math.PI/2-(Math.PI/2+.9)*Math.min(1,elapsed/420);box.userData.snacks.forEach(r=>r.visible=elapsed>220);
    box.updateMatrixWorld();origin.set(0,160,15).applyMatrix4(box.matrixWorld);
    const positions=trailGeometry.attributes.position.array;positions.fill(0);
    rods.forEach((r,i)=>{const delay=370+i*stagger,t=THREE.MathUtils.clamp((elapsed-delay)/1500,0,1);r.visible=elapsed>=delay;flight(r,i,t,r.position);r.quaternion.copy(r.userData.rotation);const spin=(1-t)*(1-t);r.rotateX(spin*(i%3+2)*Math.PI*2);r.rotateZ(spin*(i%2?1:-1)*Math.PI*4);r.scale.setScalar(1+Math.sin(t*Math.PI)*.28);if(i<24&&t>0&&t<.94){r.position.toArray(positions,i*6);flight(r,i,Math.max(0,t-.045),point).toArray(positions,i*6+3);}});
    trailGeometry.attributes.position.needsUpdate=true;trails.visible=elapsed>370&&elapsed<2700;
    particles.forEach((p,i)=>{const t=(elapsed-280-i%8*42)/2400;p.visible=t>0&&t<1;if(!p.visible)return;const angle=i*2.39996,radius=(120+(i%9)*43)*Math.sin(Math.min(1,t*1.3)*Math.PI*.65);p.position.set(Math.cos(angle)*radius,60+Math.sin(angle)*radius-t*t*450,130+Math.sin(t*Math.PI)*180);p.rotation.set(Math.sin(t*3+i)*.25,Math.sin(t*4+i)*.35,Math.sin(t*5+i)*.7);p.scale.setScalar((1.05+(i%5)*.32)*Math.min(1,t*10));p.material.opacity=Math.min(1,t*8)*Math.min(1,(1-t)*4)*.95;});
    crumbs.visible=receivedMode&&elapsed>2350;
    if(crumbs.visible)crumbs.children.forEach((c,i)=>{const t=THREE.MathUtils.clamp((elapsed-2350-i*12)/550,0,1);c.position.copy(c.userData.rest);c.position.z+=(1-t)*(1-t)*28+Math.abs(Math.sin(t*Math.PI*2))*(1-t)*5;});
    draw();if(elapsed<duration)raf=requestAnimationFrame(tick);else{phase='complete';animation=null;finishAnimation=null;settle();draw();resolve();}
   }raf=requestAnimationFrame(tick);
  });
 }

 function stop(){cancelAnimationFrame(raf);finishAnimation?.();finishAnimation=null;animation=null;}
 function pack(){
  stop();phase='packing';if(!box)createBox(currentFlavor);settle();
  camera.top=Math.max(600,sheetHeight/2);camera.bottom=-camera.top;camera.updateProjectionMatrix();
  const start=performance.now(),origin=new THREE.Vector3(),initial=new THREE.Vector3(-400,-sheetHeight/2+220,45),end=new THREE.Vector3(0,35,32);
  function finish(){phase='waiting';prepareBox();draw();}
  if(matchMedia('(prefers-reduced-motion: reduce)').matches){finish();return Promise.resolve();}
  return new Promise(resolve=>{finishAnimation=resolve;function tick(now){
   const elapsed=now-start,t=THREE.MathUtils.clamp(elapsed/1700,0,1),ease=t*t*(3-2*t);
   box.visible=true;box.position.lerpVectors(initial,end,ease);box.scale.setScalar(1+(introScale-1)*ease);box.rotation.set(.06,-.15,-.18+.09*ease);box.userData.hinge.rotation.x=-.9;box.updateMatrixWorld();origin.set(0,160,15).applyMatrix4(box.matrixWorld);
   camera.top=sheetHeight/2+(600-sheetHeight/2)*ease;camera.bottom=-camera.top;camera.updateProjectionMatrix();
   rods.forEach((r,i)=>{const progress=THREE.MathUtils.clamp((elapsed-i*Math.min(10,450/Math.max(1,rods.length)))/1050,0,1),travel=progress*progress*(3-2*progress);r.visible=progress<1;r.position.lerpVectors(r.userData.target,origin,travel);r.position.z+=Math.sin(progress*Math.PI)*190;r.quaternion.copy(r.userData.rotation);r.rotateZ(progress*Math.PI*3*(i%2?1:-1));r.scale.setScalar(1-progress*.75);});
   box.userData.snacks.forEach(r=>r.visible=elapsed<1700);if(elapsed>1600)box.userData.hinge.rotation.x=-.9+THREE.MathUtils.clamp((elapsed-1600)/450,0,1)*(Math.PI/2+.9);
   draw();if(elapsed<2150)raf=requestAnimationFrame(tick);else{finishAnimation=null;finish();resolve();}
  }raf=requestAnimationFrame(tick);});
 }

 function resizeSurface(){const width=host.clientWidth,height=width*frameHeight()/1200;renderer.setPixelRatio(Math.min(devicePixelRatio,2,4096/Math.max(1,height)));renderer.setSize(width,height);}
 new ResizeObserver(()=>{resizeSurface();draw();}).observe(host);draw();return {setBoxStyle(style){boxStyle=BOX_STYLES[style]?style:'green';if(box){createBox(currentFlavor);if(phase==='waiting')prepareBox();else{settle();box.visible=receivedMode;}}draw();},boxArtwork(style=boxStyle,flat=false){const texture=boxTexture(currentFlavor,style,flat),url=texture.image.toDataURL();texture.dispose();return url;},update,replay,setReceived,pack,stop,canvas:renderer.domElement,draw};
}
