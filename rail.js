/* ============================================================
   修图工作室 · 左侧导航 · 唯一内容源
   每个工具页只需：<aside class="rail" id="ns-rail"></aside> + 引入本文件
   改这里，四个工具页同时生效。
   ------------------------------------------------------------
   ★ 以后每增加一个「不限次、不花钱」的小修图工具：
       在 TOOLS 里加一行（名称 / 地址 / 封面图 / 关键词），
       所有工具页左栏会自动多出这张图片按钮，且自动互相可切。
   ------------------------------------------------------------
   高亮规则：按当前页面文件名前缀自动判断，无需在页面手写 class。
   归属：界面层（小B）。功能代码请勿在此文件内添加。
   ============================================================ */
(function () {
  var TOOLS = [
    { key: 'retouch', href: 'retouch.html', img: 'img/cover-retouch-lr3.jpg', label: '一键修瑕疵' },
    { key: 'quhui',   href: 'quhui.html',   img: 'img/cover-quhui.jpg',      label: '一键去灰' },
    { key: 'ruihua',  href: 'ruihua.html',  img: 'img/cover-ruihua.jpg',     label: '清晰锐化' },
    { key: 'sewen',   href: 'sewen.html',          img: 'img/cover-sewen-v6.jpg',   label: '调色工具' }
  ];

  var page = (location.pathname.split('/').pop() || '').toLowerCase();
  var active = '';
  TOOLS.forEach(function (t) {
    if (page.indexOf(t.key) === 0) active = t.key;
  });

  var cards = TOOLS.map(function (t) {
    var inner = '<img src="' + t.img + '" alt="' + t.label + '">' +
                '<span class="cap">' + t.label + '</span>';
    if (t.key === active) {
      return '<div class="rail-card on" aria-current="page">' + inner + '</div>';
    }
    return '<a class="rail-card" href="' + t.href + '">' + inner + '</a>';
  }).join('');

  var html =
    '<div class="rail-brand">' +
      '<a class="rail-logo-link" href="index.html" title="返回首页"><img class="rail-logo" src="img/logo.png" alt="NaStudio 娜家视觉"></a>' +
      '<div>' +
        '<div class="rail-name">娜家修图工作室</div>' +
        '<div class="rail-sub">NAJIA RETOUCH STUDIO</div>' +
      '</div>' +
    '</div>' +
    '<div class="rail-label">修图工具</div>' +
    '<div class="rail-list">' + cards +
      '<div class="rail-card soon"><span class="plus">＋</span><span>未来再加新功能</span></div>' +
    '</div>' +
    '<div class="rail-foot">工具会陆续增加 · 娜家</div>';

  var host = document.getElementById('ns-rail');
  if (host) host.innerHTML = html;
  /* 左栏：宽 220（沿用上一版口径）+ 卡片间距 16 + 左右留白 14 -> 16；
     四块内容（品牌/标签/卡片列表/页脚）一起改，保持整列对齐；
     仅大屏(>1100px)生效，1100px 以下的 168px / 900px 以下的竖排横滑保持原样；
     只精确覆盖左栏四个选择器的水平 padding，不影响别的 14px 元素。 */
  var st = document.createElement('style');
  st.id = 'rail-t2';
  st.textContent = '@media (min-width:1101px){.workspace{grid-template-columns:220px minmax(0,1fr)!important}.rail-list{gap:16px!important}.rail-brand,.rail-label,.rail-list,.rail-foot{padding-left:16px!important;padding-right:16px!important}}';
  document.head.appendChild(st);
})();

/* 首屏「前 / 后」示意图下方文案 -> 统一标注「示例图」。
   只在四个正式工具页生效；白底校正等其它页面原样不动。
   归属：界面层（小B）。不修改任何功能代码与资源文件。 */
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

/* 工具改名：一键补锐 -> 清晰锐化；一键校色温 -> 调色工具。
   只在这两个工具页生效，去灰 / 修瑕疵 / 白底校正等其它页面原样不动。
   改页面标签标题与主标题 <em>；不改任何功能文案与资源文件。
   归属：界面层（小B）。 */
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
