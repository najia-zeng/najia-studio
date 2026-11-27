/* ============================================================
   批量修瑕疵 · 独立版 b1 左侧导航（纯新增，不改动通用 rail.js）
   「批量修瑕疵」排在一键修瑕疵前面；样式与修图工作室完全一套。
   切换主地址时使用 _staging/pl/rail-final-pl.js（卡片链接指主地址）。
   ============================================================ */
(function () {
  var TOOLS = [
    { key: 'piliang', href: 'piliang-b1.html', img: 'img/cover-piliang.jpg', label: '批量修瑕疵' },
    { key: 'retouch', href: 'retouch.html', img: 'img/cover-retouch-lr3.jpg', label: '一键修瑕疵' },
    { key: 'quhui',   href: 'quhui.html',   img: 'img/cover-quhui.jpg',      label: '一键去灰' },
    { key: 'ruihua',  href: 'ruihua.html',  img: 'img/cover-ruihua.jpg',     label: '清晰锐化' },
    { key: 'sewen',   href: 'sewen.html',  img: 'img/cover-sewen-v6.jpg',   label: '调色工具' }
  ];

  var page = (location.pathname.split('/').pop() || '').toLowerCase();
  var active = '';
  TOOLS.forEach(function (t) { if (page.indexOf(t.key) === 0) active = t.key; });

  var cards = TOOLS.map(function (t) {
    var inner = '<img src="' + t.img + '" alt="' + t.label + '">' +
                '<span class="cap">' + t.label + '</span>';
    if (t.key === active) return '<div class="nsrail-card on" aria-current="page">' + inner + '</div>';
    return '<a class="nsrail-card" href="' + t.href + '">' + inner + '</a>';
  }).join('');

  var html =
    '<div class="nsrail-brand">' +
      '<a class="nsrail-logo-link" href="index.html" title="返回首页"><img class="nsrail-logo" src="img/logo.png" alt="NaStudio 娜家视觉"></a>' +
      '<div>' +
        '<div class="nsrail-name">娜家修图工作室</div>' +
        '<div class="nsrail-sub">NAJIA RETOUCH STUDIO</div>' +
      '</div>' +
    '</div>' +
    '<div class="nsrail-label">修图工具</div>' +
    '<div class="nsrail-list">' + cards + '</div>' +
    '<div class="nsrail-foot">工具会陆续增加 · 娜家</div>';

  var host = document.getElementById('ns-rail');
  if (host) { host.className = 'nsrail'; host.innerHTML = html; }
})();
