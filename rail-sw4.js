/* ============================================================
   修图工作室 · 左侧导航 · 草稿版（给 sewen-v4.html 用）
   ------------------------------------------------------------
   这是 rail.js 的一份独立副本，只给新页 sewen-v4.html 用。
   ⚠️ 线上四页仍引 rail.js，本文件不改动它们，也不覆盖 rail.js。
   娜家说「切」之后，才把这一行同步进 rail.js 并指向正式地址 sewen.html。
   ------------------------------------------------------------
   高亮规则：按当前页面文件名前缀自动判断，无需在页面手写 class。
   归属：界面层（小B）。功能代码请勿在此文件内添加。
   ============================================================ */
(function () {
  var TOOLS = [
    { key: 'retouch', href: 'retouch.html',        img: 'img/cover-retouch-lr3.jpg', label: '一键修瑕疵' },
    { key: 'quhui',   href: 'quhui.html',          img: 'img/cover-quhui.jpg',      label: '一键去灰' },
    { key: 'ruihua',  href: 'ruihua.html',         img: 'img/cover-ruihua.jpg',     label: '一键补锐' },
    { key: 'sewen',   href: 'sewen-v4.html',       img: 'img/cover-sewen-v4.jpg',   label: '一键校色温' }
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
})();
