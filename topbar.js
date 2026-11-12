/* ============================================================
   全站顶栏 · 唯一内容源
   每个页面只需：<div id="ns-topbar"></div> + 引入本文件
   改这里，全站所有页面同时生效。
   归属：界面层（小B）。功能代码请勿在此文件内添加。
   ------------------------------------------------------------
   高亮规则：按当前文件名自动判断，无需在每个页面手写 class
   ============================================================ */
(function () {
  var page = (location.pathname.split('/').pop() || 'index.html').toLowerCase();

  var belongTo = {
    'product.html': 'product',
    'tools.html': 'tools',
    'scene-gen.html': 'tools',
    'scene-flower.html': 'tools',
    'scene-flower1.html': 'tools',
    'scene-gen1.html': 'tools',
    'kuociq.html': 'tools',
    'retouch.html': 'tools',
    'kuociq-chatsdk.html': 'tools',
    'remove-bg.html': 'tools',
    'fusion-pro.html': 'tools',
    'member.html': 'manual'
  };
  var active = belongTo[page] || '';

  var items = [
    { key: 'product', href: 'product.html', label: '娜家拍摄台系列产品' },
    { key: 'tools',   href: 'tools.html',   label: 'AI 工具' },
    { key: 'manual',  href: 'member.html',  label: '实拍+AI实操手册' }
  ];

  var navHtml = items.map(function (it) {
    var cls = 'tbtn' + (it.key === active ? ' on' : '');
    return '<a class="' + cls + '" href="' + it.href + '">' + it.label + '</a>';
  }).join('');

  var homeHref = (active === '') ? '#top' : 'index.html';

  var html =
    '<a class="brand" href="' + homeHref + '">' +
      '<div class="logo"><img src="img/logo.png" alt="NaStudio"></div>' +
      '<div class="bt"><b>NaStudio</b><span>娜家视觉</span></div>' +
      '<div class="tagline">帮企业搭视觉生产流水线</div>' +
    '</a>' +
    '<div class="topnav">' +
      '<span class="quota-tag" id="quotaTag"></span>' +
      navHtml +
    '</div>';

  var host = document.getElementById('ns-topbar');
  if (host) host.innerHTML = html;
})();
