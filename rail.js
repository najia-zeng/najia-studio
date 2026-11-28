/* ============================================================
   修图工作室 · 左侧导航 · 文字版草稿（txt1）
   基于线上 u2 版 rail.js，仅把「图片卡」改成「细线图标 + 文字」行。
   本文件为新建草稿，不覆盖 rail.js，主地址页面不引用它。
   ------------------------------------------------------------
   ★ 选中态：浅紫底 + 右侧实心小三角；按娜家要求，不要左侧竖线。
   ★ 顶部 logo / 工作室名 / 「修图工具」分组标题 / 底部文字，全部保留。
   ★ 样式全部内联注入，不改动任何现有 CSS 文件。
   ★ 自动适配两种容器：修图 4 页 <aside class="rail">，
     批量修瑕疵 <aside class="nsrail">。
   归属：界面层（小B）。功能代码请勿在此文件内添加。
   ============================================================ */
(function () {
  var TOOLS = [
    { key: 'piliang', href: 'piliang.html', label: '\u6279\u91cf\u4fee\u7455\u75b5' },
    { key: 'retouch', href: 'retouch.html', label: '\u4e00\u952e\u4fee\u7455\u75b5' },
    { key: 'quhui',   href: 'quhui.html',   label: '\u4e00\u952e\u53bb\u7070' },
    { key: 'ruihua',  href: 'ruihua.html',  label: '\u6e05\u6670\u9510\u5316' },
    { key: 'sewen',   href: 'sewen.html',   label: '\u8c03\u8272\u5de5\u5177' }
  ];

  var S = '<svg class="ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">';
  var ICONS = {
    piliang: S + '<rect x="3" y="3" width="12" height="12" rx="2"/><path d="M9 21h9a3 3 0 0 0 3-3V9"/></svg>',
    retouch: S + '<path d="m3 21 12-12 3 3L6 24H3z"/><path d="m14 6 4 4M18 2l1 3 3 1-3 1-1 3-1-3-3-1 3-1z"/></svg>',
    quhui:   S + '<path d="M12 2a7 7 0 0 0-7 7c0 5 7 13 7 13s7-8 7-13a7 7 0 0 0-7-7z"/><path d="M12 22V9"/></svg>',
    ruihua:  S + '<circle cx="12" cy="12" r="9"/><path d="m12 6 1.6 4.4L18 12l-4.4 1.6L12 18l-1.6-4.4L6 12l4.4-1.6z"/></svg>',
    sewen:   S + '<path d="M12 3a9 9 0 1 0 0 18h1.2a2 2 0 0 0 1.5-3.3 2 2 0 0 1 1.5-3.3H18a3 3 0 0 0 3-3A9 9 0 0 0 12 3z"/><circle cx="7.5" cy="11" r="1"/><circle cx="10" cy="7" r="1"/><circle cx="15" cy="7.5" r="1"/></svg>'
  };
  var TRI = '<svg class="tri" viewBox="0 0 24 24"><path d="M8 4 L19 12 L8 20 Z" fill="#534AB7"/></svg>';

  var host = document.getElementById('ns-rail');
  var P = (host && host.classList.contains('nsrail')) ? 'nsrail' : 'rail';

  var page = (location.pathname.split('/').pop() || '').toLowerCase();
  var active = '';
  TOOLS.forEach(function (t) { if (page.indexOf(t.key) === 0) active = t.key; });

  var cards = TOOLS.map(function (t) {
    var inner = ICONS[t.key] + '<span class="cap">' + t.label + '</span>' + TRI;
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

  var st = document.createElement('style');
  st.id = 'rail-txt1';
  st.textContent =
    /* 大屏沿用 u2 口径：220 宽、左右留白 16 */
    '@media (min-width:1101px){' +
      '.workspace{grid-template-columns:220px minmax(0,1fr)!important}' +
      '.rail-brand,.rail-label,.rail-list,.rail-foot,' +
      '.nsrail-brand,.nsrail-label,.nsrail-list,.nsrail-foot{padding-left:16px!important;padding-right:16px!important}' +
    '}' +
    /* 列表：紧凑行距 */
    '.rail-list,.nsrail-list{gap:3px!important}' +
    /* 卡片：从图片卡改成文字行 */
    '.rail .rail-card,.nsrail .nsrail-card{' +
      'position:static!important;display:flex!important;align-items:center!important;gap:10px!important;' +
      'aspect-ratio:auto!important;height:auto!important;min-height:40px!important;' +
      'padding:10px 9px!important;border:0!important;border-radius:6px!important;' +
      'background:transparent!important;box-shadow:none!important;overflow:visible!important;' +
      'color:#2c2c2a!important;font-size:13px!important;font-weight:400!important;' +
      'text-decoration:none!important;line-height:1.3!important;cursor:pointer!important}' +
    '.rail-card img,.nsrail-card img{display:none!important}' +
    '.rail-card .cap,.nsrail-card .cap{' +
      'position:static!important;padding:0!important;color:inherit!important;' +
      'font-size:13px!important;font-weight:inherit!important;letter-spacing:normal!important;' +
      'background:none!important;line-height:1.3!important;flex:0 1 auto!important}' +
    '.rail-card .ico,.nsrail-card .ico{width:17px;height:17px;flex:none;display:block}' +
    '.rail-card .tri,.nsrail-card .tri{width:11px;height:11px;flex:none;margin-left:auto;display:none}' +
    /* 选中态：浅紫底 + 右侧小三角，无左侧竖线 */
    '.rail .rail-card.on,.nsrail .nsrail-card.on{' +
      'background:#EEEDFE!important;color:#26215C!important;font-weight:500!important;' +
      'border:0!important;box-shadow:none!important;cursor:default!important}' +
    '.rail .rail-card.on .tri,.nsrail .nsrail-card.on .tri{display:block!important}' +
    'a.rail-card:hover,a.nsrail-card:hover{background:#f6f4fd!important;border:0!important}' +
    /* 小屏横排时，文字行按内容宽自适应 */
    '@media (max-width:900px){' +
      '.rail-list,.nsrail-list{flex-direction:row!important;flex-wrap:nowrap!important;' +
        'overflow-x:auto!important;gap:6px!important}' +
      '.rail .rail-card,.nsrail .nsrail-card{min-width:auto!important;width:auto!important;' +
        'flex:0 0 auto!important;white-space:nowrap!important;padding:8px 12px!important}' +
    '}';
  document.head.appendChild(st);
})();

/* 首屏「前 / 后」示意图下方文案 -> 「示例图」；与线上 u2 版保持一致 */
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

/* 工具改名：清晰锐化 / 调色工具；与线上 u2 版保持一致 */
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
