!function(){"use strict";
var $=function(i){return document.getElementById(i)};

/* ========== 授权 ========== */
var WX="najia9864",LK="nj_lic_wb",FK="nj_free_used_wb",FREE=6;
function isLic(){try{return localStorage.getItem(LK)==="1"}catch(e){return!1}}
function usedCnt(){try{return parseInt(localStorage.getItem(FK)||"0",10)||0}catch(e){return 0}}
function freeLeft(){return Math.max(0,FREE-usedCnt())}
function h4(s){for(var e=0,n=0;n<s.length;n++)e=31*e+s.charCodeAt(n)>>>0;return e.toString(36).toUpperCase().padStart(4,"0").slice(0,4)}
function paintQuota(){
  ["quotaTag","quotaSide"].forEach(function(id){
    var n=$(id); if(!n) return;
    if(isLic()){ n.className="quota-tag"; n.innerHTML="已解锁 · 不限次"; n.onclick=null; n.style.cursor=""; return; }
    var i=freeLeft(), side=(id==="quotaSide");
    if(side){
      n.className="quota-cta"+(i===0?" used":"");
      n.innerHTML=i>0?("还剩 <b>"+i+"</b> 次免费体验 · 想一直用？点此解锁"):"免费体验已用完 · 点此解锁 →";
    }else{
      n.className="quota-tag"+(i===0?" used":"");
      n.innerHTML=i>0?("免费体验剩 <b>"+i+"</b> 次 · 解锁"):"免费体验已用完 · 点此解锁";
    }
    n.onclick=openBuy; n.style.cursor="pointer";
  });
}
function openBuy(){ $("buyMask").style.display="flex"; $("licErr").textContent="" }
function closeBuy(){ $("buyMask").style.display="none" }
function toggleLic(){
  var r=$("licRow"), m=$("licMini"), on=(r.style.display==="none");
  r.style.display=on?"flex":"none";
  if(m) m.style.display=on?"none":"block";
  if(on){ var inp=$("licInput"); inp&&setTimeout(function(){inp.focus()},60) }
}
function copyWx(){
  var n=$("qrId"); if(!n) return;
  var done=function(){ n.classList.add("copied"); n.textContent="已复制 "+WX; setTimeout(function(){ n.classList.remove("copied"); n.textContent=WX },1600) };
  var fb=function(){ var ta=document.createElement("textarea"); ta.value=WX; ta.style.position="fixed"; ta.style.opacity="0";
    document.body.appendChild(ta); ta.select(); try{document.execCommand("copy");done()}catch(e){} document.body.removeChild(ta) };
  if(navigator.clipboard&&navigator.clipboard.writeText) navigator.clipboard.writeText(WX).then(done).catch(fb); else fb();
}
function tryLic(){
  var v=($("licInput").value||"").trim();
  if(!v){ $("licErr").textContent="请先填激活码"; return }
  var m=v.toUpperCase().replace(/[\s-]/g,"").match(/^NJ([A-Z0-9]{8})([A-Z0-9]{4})$/);
  if(m && h4("naji-ark-2026-wb"+m[1])===m[2]){
    try{localStorage.setItem(LK,"1")}catch(e){}
    $("licErr").textContent=""; closeBuy(); paintQuota();
  }else{
    $("licErr").textContent="激活码不对，或不是本工具的码";
  }
}
function bindGate(){
  $("buyClose").addEventListener("click",closeBuy);
  $("buyDone").addEventListener("click",closeBuy);
  $("qrId").addEventListener("click",copyWx);
  $("licMini").addEventListener("click",toggleLic);
  $("licGo").addEventListener("click",tryLic);
  var inp=$("licInput");
  inp.addEventListener("keydown",function(e){ if(e.key==="Enter"||e.keyCode===13){ e.preventDefault(); tryLic() } });
  inp.addEventListener("input",function(){ $("licErr").textContent="" });
}

/* ========== 画布 ========== */
var cv=$("cvView"), ctx=cv.getContext("2d",{willReadFrequently:!0});
var srcImg=null, full=null, fctx=null, W=0, H=0;   // 原图
var pv=null, pw=0, ph=0;                            // 预览 ImageData
var wp=null;                                        // 白点
var cmpOn=!1;

/* 亮度 */
function lum(r,g,b){ return (r*77+g*150+b*29)>>8 }

/* 白点检测：避开过曝，取 80~96 分位 */
function detectWP(){
  var d=pv.data, n=d.length>>2;
  var hist=new Uint32Array(256), cnt=0;
  for(var i=0;i<d.length;i+=4){
    var y=(d[i]*77+d[i+1]*150+d[i+2]*29)>>8;
    if(y>=252) continue;
    hist[y]++; cnt++;
  }
  if(cnt<n*0.15){                       // 过曝太多 → 退回全量
    hist=new Uint32Array(256); cnt=0;
    for(var i=0;i<d.length;i+=4){ hist[lum(d[i],d[i+1],d[i+2])]++; cnt++ }
  }
  if(!cnt) return {r:128,g:128,b:128,ok:!1};

  var lo=Math.floor(cnt*0.80), hi=Math.floor(cnt*0.96);
  var cum=0, vLo=255, vHi=255, v;
  for(v=0;v<256;v++){ cum+=hist[v]; if(cum>=lo){ vLo=v; break } }
  cum=0;
  for(v=255;v>=0;v--){ cum+=hist[v]; if(cum>=(cnt-hi)){ vHi=v; break } }
  if(vHi<vLo) vHi=vLo;

  var sr=0,sg=0,sb=0,c=0;
  for(var i=0;i<d.length;i+=4){
    var y=(d[i]*77+d[i+1]*150+d[i+2]*29)>>8;
    if(y>=vLo&&y<=vHi){ sr+=d[i]; sg+=d[i+1]; sb+=d[i+2]; c++ }
  }
  if(c<30){                             // 区间太窄 → 灰世界
    sr=sg=sb=0;c=0;
    for(var i=0;i<d.length;i+=4){ sr+=d[i]; sg+=d[i+1]; sb+=d[i+2]; c++ }
  }
  if(!c) return {r:128,g:128,b:128,ok:!1};
  var R=sr/c, G=sg/c, B=sb/c;
  var mx=Math.max(R,G,B), mn=Math.min(R,G,B);
  return {r:R,g:G,b:B,sat:mx>0?(mx-mn)/mx:0,ok:!0};
}

/* RGB → 色温（McCamy） */
function toCCT(r,g,b){
  function lin(c){ c/=255; return c<=0.04045?c/12.92:Math.pow((c+0.055)/1.055,2.4) }
  var R=lin(r),G=lin(g),B=lin(b);
  var X=R*0.4124+G*0.3576+B*0.1805;
  var Y=R*0.2126+G*0.7152+B*0.0722;
  var Z=R*0.0193+G*0.1192+B*0.9505;
  var s=X+Y+Z;
  if(s<=1e-6) return 0;
  var x=X/s, y=Y/s, den=0.1858-y;
  if(Math.abs(den)<1e-4) return 0;
  var nn=(x-0.3320)/den;
  var c=449*nn*nn*nn+3525*nn*nn+6823.3*nn+5520.33;
  if(!isFinite(c)||c<800) return 0;
  if(c>40000) c=40000;
  return Math.round(c);
}

/* 由滑块算通道增益 */
function gains(t,g){
  var tt=t/100, gg=g/100;
  return {
    r:(1+0.20*tt)*(1+0.06*gg),
    b:(1-0.20*tt)*(1+0.06*gg),
    g:(1-0.15*gg)
  };
}
function buildLUT(t,g){
  var k=gains(t,g), lr=new Uint8Array(256), lg=new Uint8Array(256), lb=new Uint8Array(256);
  for(var i=0;i<256;i++){
    var a=i*k.r, b=i*k.g, c=i*k.b;
    lr[i]=a>255?255:(a<0?0:a|0);
    lg[i]=b>255?255:(b<0?0:b|0);
    lb[i]=c>255?255:(c<0?0:c|0);
  }
  return [lr,lg,lb];
}
function render(){
  if(!pv) return;
  var L=buildLUT(+$("slT").value,+$("slG").value);
  var lr=L[0],lg=L[1],lb=L[2];
  var d=new Uint8ClampedArray(pv.data), n=d.length;
  for(var i=0;i<n;i+=4){ d[i]=lr[d[i]]; d[i+1]=lg[d[i+1]]; d[i+2]=lb[d[i+2]] }
  ctx.putImageData(new ImageData(d,pw,ph),0,0);
}

/* ========== 诊断 ========== */
/* 白点是否可靠 */
function wpBad(){
  if(!wp||!wp.ok) return !0;
  var mx=Math.max(wp.r,wp.g,wp.b);
  return (wp.sat>0.25)||(mx<185);
}

/* 自动算并设滑块 */
function autoCalc(){
  if(!wp||!wp.ok) return;
  var r=wp.r, g=Math.max(1,wp.g), b=wp.b;
  var rr=r/g, bb=b/g;
  var t=Math.round((bb-rr)/(0.20*(rr+bb))*100);
  t=Math.max(-100,Math.min(100,t));
  var tg=Math.round((1-(rr+bb)/2)/0.15*100);
  if(Math.abs(tg)<10) tg=0;
  tg=Math.max(-100,Math.min(100,tg));
  if(wpBad()){ t=0; tg=0 }
  $("slT").value=t; $("slG").value=tg;
  $("slTVal").textContent=t;
  $("slGVal").textContent=(tg>0?"+":"")+tg;
  render();
  updateAdv();
}

/* 只更新诊断文案，不动滑块 */
function updateAdv(){
  if(!wp||!wp.ok) return;
  var r=wp.r, g=Math.max(1,wp.g), b=wp.b;
  var dgK=$("dgK"), dgDir=$("dgDir"), dgK2=$("dgK2"), adv=$("adv");
  var c0=toCCT(r,g,b);
  dgK.textContent=c0?c0+" K":"—";

  if(wpBad()){
    dgDir.textContent="不可靠"; dgDir.className="";
    dgK2.textContent="—";
    adv.className="adv warn";
    adv.innerHTML="这张图里没有真正的白/灰区域（高光本身是彩色的，或者整张偏暗），自动判断不可靠。请自己拉色温，拉到看着舒服为止。";
    return;
  }

  var k=gains(+$("slT").value,+$("slG").value);
  var c1=toCCT(Math.min(255,r*k.r),Math.min(255,g*k.g),Math.min(255,b*k.b));
  dgK2.textContent=c1?c1+" K":"—";

  if(!c0){
    dgDir.textContent="—"; dgDir.className="";
    adv.className="adv warn";
    adv.innerHTML="这张图没找到可靠的白点参考，自动值只能估个大概，建议自己拉一下色温。";
    return;
  }

  var diff=c0-6500;
  if(Math.abs(diff)<220){ dgDir.textContent="基本中性"; dgDir.className="neu" }
  else if(diff<0){ dgDir.textContent="偏暖"; dgDir.className="warm" }
  else { dgDir.textContent="偏蓝"; dgDir.className="cool" }

  var cam=parseFloat($("camK").value)||5500;
  var mWp=1e6/c0, mCam=1e6/cam, mNeu=1e6/6500;
  var mL=mWp-mNeu+mCam;
  var cL=mL>0?Math.round(1e6/mL):0;
  if(cL<2500) cL=2500;
  if(cL>12000) cL=12000;

  if(Math.abs(diff)<220){
    adv.className="adv";
    adv.innerHTML="白点已经接近中性，这张不用调。相机保持 <b>"+Math.round(cam)+"K</b> 就对了。";
  }else if(diff<0){
    adv.className="adv";
    adv.innerHTML="偏暖发黄。相机白平衡要往<b>低</b>调 —— 你当时设的是 "+Math.round(cam)+"K，改成 <b>"+cL+"K</b> 左右拍出来就准了。";
  }else{
    adv.className="adv";
    adv.innerHTML="偏蓝发冷。相机白平衡要往<b>高</b>调 —— 你当时设的是 "+Math.round(cam)+"K，改成 <b>"+cL+"K</b> 左右拍出来就准了。";
  }
}

/* ========== 载入 ========== */
function load(file){
  if(!file||String(file.type).indexOf("image")!==0) return;
  var fr=new FileReader();
  fr.onload=function(ev){
    var img=new Image();
    img.onload=function(){
      srcImg=img;
      W=img.naturalWidth; H=img.naturalHeight;
      var sc=1;
      if(Math.max(W,H)>7000) sc=7000/Math.max(W,H);
      W=Math.round(W*sc); H=Math.round(H*sc);
      full=document.createElement("canvas");
      full.width=W; full.height=H;
      fctx=full.getContext("2d",{willReadFrequently:!0});
      fctx.clearRect(0,0,W,H);
      fctx.drawImage(img,0,0,W,H);

      var s2=Math.min(1,1400/Math.max(W,H));
      pw=Math.max(1,Math.round(W*s2)); ph=Math.max(1,Math.round(H*s2));
      cv.width=pw; cv.height=ph;
      ctx.clearRect(0,0,pw,ph);
      ctx.imageSmoothingQuality="high";
      ctx.drawImage(img,0,0,pw,ph);
      pv=ctx.getImageData(0,0,pw,ph);

      wp=detectWP();
      autoCalc();

      $("empty").style.display="none";
      $("stage").style.display="block";
      $("stageTools").style.display="";
      $("secDiag").classList.remove("off");
      $("secAdj").classList.remove("off");
      $("slT").disabled=!1; $("slG").disabled=!1;
      cmpOn=!1; $("cmpBadge").classList.remove("on");
      fitStage();
      step(2);
    };
    img.onerror=function(){ alert("图片读不出来，换一张试试") };
    img.src=ev.target.result;
  };
  fr.readAsDataURL(file);
}

function fitStage(){
  if(!W) return;
  var wrap=$("stageWrap");
  var aw=wrap.clientWidth-36, ah=wrap.clientHeight-36;
  var s=Math.min(aw/W,ah/H,1);
  var iw=Math.round(W*s), ih=Math.round(H*s);
  cv.style.width=iw+"px"; cv.style.height=ih+"px";
  $("stage").style.width=iw+"px"; $("stage").style.height=ih+"px";
}
function step(n){
  for(var i=1;i<=3;i++){
    var a=$("st"+i);
    if(a) a.className="step"+(i<n?" done":i===n?" on":"");
  }
}

/* ========== PNG 300DPI ========== */
var crcT=null;
function crc32(buf){
  if(!crcT){ crcT=new Uint32Array(256);
    for(var i=0;i<256;i++){ var c=i; for(var k=0;k<8;k++) c=(c&1)?(3988292384^(c>>>1)):(c>>>1); crcT[i]=c>>>0 } }
  var c=4294967295;
  for(var i=0;i<buf.length;i++) c=crcT[(c^buf[i])&255]^(c>>>8);
  return (4294967295^c)>>>0;
}
function tagDpi(blob,cb){
  try{
    var fr=new FileReader();
    fr.onload=function(){
      var u=new Uint8Array(fr.result||[]);
      if(u.length<34){ cb(blob); return }
      var ch=new Uint8Array(21);
      ch[0]=0;ch[1]=0;ch[2]=0;ch[3]=9;
      ch[4]=112;ch[5]=72;ch[6]=89;ch[7]=115;
      ch[8]=0;ch[9]=0;ch[10]=46;ch[11]=35;
      ch[12]=0;ch[13]=0;ch[14]=46;ch[15]=35;
      ch[16]=1;
      var r=crc32(ch.subarray(4,17));
      ch[17]=(r>>>24)&255; ch[18]=(r>>>16)&255; ch[19]=(r>>>8)&255; ch[20]=r&255;
      var out=new Uint8Array(u.length+ch.length);
      out.set(u.subarray(0,33),0);
      out.set(ch,33);
      out.set(u.subarray(33),33+ch.length);
      cb(new Blob([out],{type:"image/png"}));
    };
    fr.onerror=function(){ cb(blob) };
    fr.readAsArrayBuffer(blob);
  }catch(e){ cb(blob) }
}

/* ========== 下载 ========== */
function save(){
  if(!W) return;
  if(!isLic()&&freeLeft()===0){ openBuy(); return }
  $("busy").classList.add("on");
  $("busyTxt").textContent="正在导出…";
  setTimeout(function(){
    try{
      var L=buildLUT(+$("slT").value,+$("slG").value);
      var lr=L[0],lg=L[1],lb=L[2];
      var id=fctx.getImageData(0,0,W,H), d=id.data;
      for(var i=0;i<d.length;i+=4){ d[i]=lr[d[i]]; d[i+1]=lg[d[i+1]]; d[i+2]=lb[d[i+2]] }
      fctx.putImageData(id,0,0);
      $("busyTxt").textContent="正在保存文件…";

      var once=!1;
      var done=function(b){
        if(once) return; once=!0;
        try{
          var u=URL.createObjectURL(b);
          var a=document.createElement("a");
          a.download="wb-"+Date.now()+".png";
          a.href=u;
          document.body.appendChild(a); a.click(); if(a.remove) a.remove(); else if(a.parentNode) a.parentNode.removeChild(a);
          setTimeout(function(){URL.revokeObjectURL(u)},30000);
          if(!isLic()){ try{localStorage.setItem(FK,String(usedCnt()+1))}catch(e){} paintQuota() }
          if(srcImg){ fctx.clearRect(0,0,W,H); fctx.drawImage(srcImg,0,0,W,H) }
          $("busyTxt").textContent="已保存 ✓ 想再调一点，改完还能继续下载";
          setTimeout(function(){ $("busy").classList.remove("on") },900);
        }catch(e){
          alert("导出失败，再试一次；还不行就换个浏览器试试");
          $("busy").classList.remove("on");
        }
      };

      if(full.toBlob){
        full.toBlob(function(b){
          if(!b){ $("busy").classList.remove("on"); alert("导出失败，再试一次；还不行就换个浏览器试试"); return }
          tagDpi(b,done);
        },"image/png");
      }else{
        var b64=atob(full.toDataURL("image/png").split(",")[1]);
        var arr=new Uint8Array(b64.length);
        for(var i=0;i<b64.length;i++) arr[i]=b64.charCodeAt(i);
        tagDpi(new Blob([arr],{type:"image/png"}),done);
      }
    }catch(e){
      alert("导出失败，再试一次；还不行就换个浏览器试试");
      $("busy").classList.remove("on");
    }
  },30);
}

/* ========== 事件 ========== */
function boot(){
  bindGate(); paintQuota();

  $("drop").addEventListener("click",function(){ $("file").click() });
  $("file").addEventListener("change",function(e){
    if(e.target.files&&e.target.files[0]) load(e.target.files[0]);
    e.target.value="";
  });
  ["dragenter","dragover"].forEach(function(ev){
    $("drop").addEventListener(ev,function(e){ e.preventDefault(); $("drop").classList.add("over") });
  });
  ["dragleave","drop"].forEach(function(ev){
    $("drop").addEventListener(ev,function(e){ e.preventDefault(); $("drop").classList.remove("over") });
  });
  $("drop").addEventListener("drop",function(e){
    var f=e.dataTransfer.files&&e.dataTransfer.files[0];
    if(f) load(f);
  });
  document.addEventListener("paste",function(e){
    var it=e.clipboardData&&e.clipboardData.items;
    if(!it) return;
    for(var i=0;i<it.length;i++) if(it[i].type.indexOf("image")===0){ load(it[i].getAsFile()); break }
  });

  $("slT").addEventListener("input",function(){
    $("slTVal").textContent=$("slT").value;
    if(cmpOn){ cmpOn=!1; $("cmpBadge").classList.remove("on") }
    render(); updateAdv();
  });
  $("slG").addEventListener("input",function(){
    var v=parseInt($("slG").value,10);
    $("slGVal").textContent=(v>0?"+":"")+v;
    if(cmpOn){ cmpOn=!1; $("cmpBadge").classList.remove("on") }
    render(); updateAdv();
  });

  $("btnAuto").addEventListener("click",function(){ if(wp) autoCalc() });
  $("btnReset").addEventListener("click",function(){
    $("slT").value=0; $("slG").value=0;
    $("slTVal").textContent="0"; $("slGVal").textContent="0";
    if(cmpOn){ cmpOn=!1; $("cmpBadge").classList.remove("on") }
    render(); updateAdv();
  });

  var bc=$("btnCmp");
  bc.addEventListener("pointerdown",function(e){
    e.preventDefault();
    if(!pv) return;
    ctx.putImageData(pv,0,0);
    cmpOn=!0; $("cmpBadge").classList.add("on");
  });
  ["pointerup","pointerleave","pointercancel"].forEach(function(ev){
    bc.addEventListener(ev,function(){
      if(pv&&cmpOn){ cmpOn=!1; $("cmpBadge").classList.remove("on"); render() }
    });
  });

  $("btnDl").addEventListener("click",save);
  $("camK").addEventListener("change",function(){ if(wp) updateAdv() });
  $("camK").addEventListener("input",function(){ if(wp) updateAdv() });

  window.addEventListener("resize",fitStage);
  step(1);
  window.__njLoad=load;
}

if(document.readyState==="loading") document.addEventListener("DOMContentLoaded",boot); else boot();
}();
