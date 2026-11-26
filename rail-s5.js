/* ============================================================
   场景风格包 · 左侧导航 · 唯一内容源（独立版 s5）
   三个风格包页共用；以后加新风格，在 TOOLS 里加一行即可。
   只做界面：自己往 body 末尾挂一个左栏 + 给 body 加 class，
   不移动、不修改任何既有 DOM 节点与功能代码。
   高亮按页面文件名前缀自动判断。
   ============================================================ */
(function () {
  var TOOLS = [
    { key: 'scene-gen',    href: 'scene-gen-s5.html',    img: 'img/cover-scene.jpg',  label: '科研医美风' },
    { key: 'scene-flower', href: 'scene-flower-s5.html', img: 'img/cover-flower.jpg', label: '鲜花氛围' },
    { key: 'scene-light',  href: 'scene-light-s5.html',  img: 'img/cover-light.jpg',  label: '光影氛围' }
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
      return '<div class="nsrail-card on" aria-current="page">' + inner + '</div>';
    }
    return '<a class="nsrail-card" href="' + t.href + '">' + inner + '</a>';
  }).join('');

  var html =
    '<div class="nsrail-brand">' +
      '<a class="nsrail-logo-link" href="index.html" title="返回首页"><img class="nsrail-logo" src="img/logo.png" alt="NaStudio 娜家视觉"></a>' +
      '<div>' +
        '<div class="nsrail-name">场景风格包</div>' +
        '<div class="nsrail-sub">SCENE PACKS</div>' +
      '</div>' +
    '</div>' +
    '<div class="nsrail-label">全部风格</div>' +
    '<div class="nsrail-list">' + cards +
      '<div class="nsrail-card soon"><span class="plus">＋</span><span>未来再加新风格</span></div>' +
    '</div>' +
    '<div class="nsrail-foot">风格持续增加</div>';

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
