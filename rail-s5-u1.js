/* ============================================================
   场景风格包 · 左侧导航 · 唯一内容源（u1 统一版）
   3 个风格包页共用；以后加新风格，在 TOOLS 里加一行即可。
   只做界面：body 末尾挂左栏 + 加 class，不移动任何既有 DOM。
   ★ 无占位卡；高亮按页面文件名前缀自动判断。
   ============================================================ */
(function () {
  var TOOLS = [
    { key: 'scene-gen',    href: 'scene-gen-u1.html',    img: 'img/cover-scene.jpg',  label: '\u79d1\u7814\u533b\u7f8e\u98ce' },
    { key: 'scene-flower', href: 'scene-flower-u1.html', img: 'img/cover-flower.jpg', label: '\u9c9c\u82b1\u6c1b\u56f4' },
    { key: 'scene-light',  href: 'scene-light-u1.html',  img: 'img/cover-light.jpg',  label: '\u5149\u5f71\u6c1b\u56f4' }
  ];

  var page = (location.pathname.split('/').pop() || '').toLowerCase();
  var active = '';
  TOOLS.forEach(function (t) { if (page.indexOf(t.key) === 0) active = t.key; });

  var cards = TOOLS.map(function (t) {
    var inner = '<img src="' + t.img + '" alt="' + t.label + '">' +
                '<span class="cap">' + t.label + '</span>';
    if (t.key === active) {
      return '<div class="nsrail-card on" aria-current="page">' + inner + '</div>';
    }
    return '<a class="nsrail-card" href="' + t.href + '">' + inner + '</a>';
  }).join('');

  var html =
    '<div class="nsrail-brand">' +
      '<a class="nsrail-logo-link" href="index.html" title="\u8fd4\u56de\u9996\u9875"><img class="nsrail-logo" src="img/logo.png" alt="NaStudio \u5a1c\u5bb6\u89c6\u89c9"></a>' +
      '<div>' +
        '<div class="nsrail-name">\u573a\u666f\u98ce\u683c\u5305</div>' +
        '<div class="nsrail-sub">SCENE PACKS</div>' +
      '</div>' +
    '</div>' +
    '<div class="nsrail-label">\u5168\u90e8\u98ce\u683c</div>' +
    '<div class="nsrail-list">' + cards + '</div>' +
    '<div class="nsrail-foot">\u98ce\u683c\u6301\u7eed\u589e\u52a0</div>';

  function mount() {
    if (document.querySelector('.nsrail')) return;
    var rail = document.createElement('aside');
    rail.className = 'nsrail';
    rail.innerHTML = html;
    document.body.appendChild(rail);
    document.body.classList.add('has-scene-rail');
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', mount);
  else mount();
})();
