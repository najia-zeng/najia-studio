/* ============================================================
   修图工作室 · 左侧导航 · 唯一内容源（u1 统一版）
   5 个修图工具页共用本文件；以后加工具 / 改名字 / 改顺序，只改这里。
   ------------------------------------------------------------
   ★ 自动适配两种容器：修图 4 页是 <aside class="rail">，
     批量修瑕疵是 <aside class="nsrail">；按容器类名生成对应前缀，
     这样各自功能 CSS 的小屏适配都能原样生效。
   ★ 无占位卡；高亮按页面文件名前缀自动判断。
   归属：界面层（小B）。功能代码请勿在此文件内添加。
   ============================================================ */
(function () {
  var TOOLS = [
    { key: 'piliang', href: 'piliang-u1.html', img: 'img/cover-piliang.jpg',    label: '\u6279\u91cf\u4fee\u7455\u75b5' },
    { key: 'retouch', href: 'retouch-u1.html', img: 'img/cover-retouch-lr3.jpg', label: '\u4e00\u952e\u4fee\u7455\u75b5' },
    { key: 'quhui',   href: 'quhui-u1.html',   img: 'img/cover-quhui.jpg',      label: '\u4e00\u952e\u53bb\u7070' },
    { key: 'ruihua',  href: 'ruihua-u1.html',   img: 'img/cover-ruihua.jpg',     label: '\u6e05\u6670\u9510\u5316' },
    { key: 'sewen',   href: 'sewen-u1.html',    img: 'img/cover-sewen-v6.jpg',   label: '\u8c03\u8272\u5de5\u5177' }
  ];

  var host = document.getElementById('ns-rail');
  var P = (host && host.classList.contains('nsrail')) ? 'nsrail' : 'rail';

  var page = (location.pathname.split('/').pop() || '').toLowerCase();
  var active = '';
  TOOLS.forEach(function (t) { if (page.indexOf(t.key) === 0) active = t.key; });

  var cards = TOOLS.map(function (t) {
    var inner = '<img src="' + t.img + '" alt="' + t.label + '">' +
                '<span class="cap">' + t.label + '</span>';
    if (t.key === active) {
      return '<div class="' + P + '-card on" aria-current="page">' + inner + '</div>';
    }
    return '<a class="' + P + '-card" href="' + t.href + '">' + inner + '</a>';
  }).join('');

  var html =
    '<div class="' + P + '-brand">' +
      '<a class="' + P + '-logo-link" href="index.html" title="\u8fd4\u56de\u9996\u9875"><img class="' + P + '-logo" src="img/logo.png" alt="NaStudio \u5a1c\u5bb6\u89c6\u89c9"></a>' +
      '<div>' +
        '<div class="' + P + '-name">\u5a1c\u5bb6\u4fee\u56fe\u5de5\u4f5c\u5ba4</div>' +
        '<div class="' + P + '-sub">NAJIA RETOUCH STUDIO</div>' +
      '</div>' +
    '</div>' +
    '<div class="' + P + '-label">\u4fee\u56fe\u5de5\u5177</div>' +
    '<div class="' + P + '-list">' + cards + '</div>' +
    '<div class="' + P + '-foot">\u5de5\u5177\u4f1a\u9646\u7eed\u589e\u52a0 \u00b7 \u5a1c\u5bb6</div>';

  if (host) host.innerHTML = html;

  /* 大屏 220 / 间距 16 / 左右留白 16（沿用线上口径） */
  var st = document.createElement('style');
  st.id = 'rail-u1';
  st.textContent = '@media (min-width:1101px){.workspace{grid-template-columns:220px minmax(0,1fr)!important}' +
    '.rail-list,.nsrail-list{gap:16px!important}' +
    '.rail-brand,.rail-label,.rail-list,.rail-foot,' +
    '.nsrail-brand,.nsrail-label,.nsrail-list,.nsrail-foot{padding-left:16px!important;padding-right:16px!important}}';
  document.head.appendChild(st);
})();

/* 首屏「前 / 后」示意图下方文案 -> 「示例图」；只在修图四个工具页生效 */
(function () {
  var f = (location.pathname.split('/').pop() || '').toLowerCase();
  if (!/^(quhui|retouch|ruihua|sewen)[^/]*\.html$/.test(f)) return;
  function apply() {
    var t = document.querySelector('.demo-t');
    if (t) t.textContent = '\u793a\u4f8b\u56fe';
    var s = document.querySelector('.demo-s');
    if (s) { s.textContent = ''; s.style.display = 'none'; }
  }
  apply();
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', apply);
})();

/* 工具改名：一键补锐 -> 清晰锐化；一键校色温 -> 调色工具 */
(function () {
  var f = (location.pathname.split('/').pop() || '').toLowerCase();
  var NAME = null;
  if (/^ruihua[^/]*\.html$/.test(f)) NAME = '\u6e05\u6670\u9510\u5316';
  else if (/^sewen[^/]*\.html$/.test(f)) NAME = '\u8c03\u8272\u5de5\u5177';
  if (!NAME) return;
  function apply() {
    document.title = NAME + ' \u00b7 NaStudio';
    var em = document.querySelector('.func-head h1 em');
    if (em) em.textContent = NAME;
  }
  apply();
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', apply);
})();
