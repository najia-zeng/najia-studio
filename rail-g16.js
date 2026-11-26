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
    { key: 'retouch', href: 'retouch-g16.html', img: 'img/cover-retouch-lr3.jpg', label: '一键修瑕疵' },
    { key: 'quhui',   href: 'quhui-g16.html',   img: 'img/cover-quhui.jpg',      label: '一键去灰' },
    { key: 'ruihua',  href: 'ruihua-g16.html',  img: 'img/cover-ruihua.jpg',     label: '一键补锐' },
    { key: 'sewen',   href: 'sewen-g16.html',          img: 'img/cover-sewen-v6.jpg',   label: '一键校色温' }
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
  /* 左栏：宽度 220（沿用上一版口径）+ 卡片间距 10 -> 16；
     仅大屏(>1100px)生效，1100px 以下的 168px / 900px 以下的竖排横滑保持原样；
     只覆盖 .rail-list，不影响别的 gap:10px 元素。 */
  var st = document.createElement('style');
  st.id = 'rail-g16';
  st.textContent = '@media (min-width:1101px){.workspace{grid-template-columns:220px minmax(0,1fr)!important}.rail-list{gap:16px!important}}';
  document.head.appendChild(st);
})();
