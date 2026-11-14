/* ==========================================================================
   装到桌面 · 通用版
   用法：页面底部放
   <script src="/install.js" data-name="娜家·一键修瑕疵" data-url="/retouch.html" defer></script>

   逻辑：
   1) 浏览器支持「网页应用安装」（Chrome / Edge 等）→ 直接走系统安装
   2) 不支持（360 / QQ / 搜狗 / 微信等）→ 弹出一份通用指引：桌面右键新建快捷方式
      这条方法任何 Windows 电脑都能用，不依赖浏览器脾气
   注：service worker 只注册、不缓存任何资源，避免页面更新不生效
   ========================================================================== */
(function () {
  var me = document.currentScript || (function () {
    var a = document.getElementsByTagName('script');
    return a[a.length - 1];
  })();
  var TOOL_NAME = (me && me.getAttribute('data-name')) || '娜家工具';
  var PAGE_PATH = (me && me.getAttribute('data-url')) || location.pathname;
  var FULL_URL = location.origin + PAGE_PATH;

  // 透明 SW：部分 Chromium 版本把「已注册 service worker」当安装前提
  if ('serviceWorker' in navigator && location.protocol === 'https:') {
    try { navigator.serviceWorker.register('/sw.js').catch(function () {}); } catch (e) {}
  }

  // 已经在独立窗口里打开（等于已装过），不再提示
  var standalone = false;
  try {
    standalone = window.matchMedia && window.matchMedia('(display-mode: standalone)').matches;
  } catch (e) {}
  var ua = navigator.userAgent || '';
  var inWeChat = /MicroMessenger/i.test(ua);

  var CSS = ''
    + '#njInstallBtn{position:fixed;right:18px;bottom:18px;z-index:9990;'
    + 'font-family:inherit;font-size:12.5px;font-weight:650;color:#6b5ce7;'
    + 'background:rgba(255,255,255,.94);border:1px solid #c9c1f5;border-radius:999px;'
    + 'padding:9px 16px;cursor:pointer;box-shadow:0 4px 14px rgba(45,35,110,.14);'
    + 'transition:all .15s;-webkit-appearance:none;appearance:none;}'
    + '#njInstallBtn:hover{background:#f4f2fd;transform:translateY(-1px);}'
    + '#njInstMask{position:fixed;top:0;left:0;right:0;bottom:0;z-index:9998;background:rgba(28,25,50,.45);'
    + 'display:none;align-items:center;justify-content:center;padding:20px;}'
    + '#njInstMask.on{display:flex;}'
    + '#njInstCard{background:#fff;border-radius:16px;max-width:440px;width:100%;'
    + 'padding:22px 22px 18px;box-shadow:0 20px 50px rgba(25,20,60,.28);'
    + 'font-family:inherit;color:#2b2740;text-align:left;max-height:88vh;overflow:auto;}'
    + '#njInstCard h3{margin:0 0 6px;font-size:16.5px;font-weight:750;}'
    + '#njInstCard .nj-sub{margin:0 0 14px;font-size:12.5px;color:#7a7690;line-height:1.6;}'
    + '#njInstCard ol{margin:0 0 12px;padding-left:20px;font-size:13px;line-height:1.85;color:#3d3859;}'
    + '#njInstCard ol b{color:#4b3fc4;}'
    + '#njInstUrl{display:flex;gap:8px;align-items:center;background:#f5f4fb;'
    + 'border:1px solid #e4e1f5;border-radius:10px;padding:8px 10px;margin:0 0 12px;}'
    + '#njInstUrl code{flex:1;font-size:11.5px;color:#4a4568;word-break:break-all;'
    + 'font-family:ui-monospace,Menlo,Consolas,monospace;line-height:1.5;}'
    + '#njInstCopy{flex:none;font-family:inherit;font-size:12px;font-weight:700;color:#fff;'
    + 'background:#6b5ce7;border:0;border-radius:8px;padding:7px 12px;cursor:pointer;}'
    + '#njInstCopy.done{background:#2fa36b;}'
    + '#njInstNote{margin:0 0 14px;font-size:12px;color:#8a86a3;line-height:1.7;'
    + 'background:#faf9ff;border-left:3px solid #d9d3f7;padding:9px 12px;border-radius:0 8px 8px 0;}'
    + '#njInstWx{margin:0 0 12px;font-size:12.5px;color:#a05000;background:#fff7ea;'
    + 'border:1px solid #ffe0b2;border-radius:9px;padding:9px 12px;line-height:1.6;display:none;}'
    + '#njInstWx.on{display:block;}'
    + '#njInstFoot{text-align:right;}'
    + '#njInstClose{font-family:inherit;font-size:13px;font-weight:700;color:#5a4fd8;'
    + 'background:#f0edfd;border:0;border-radius:9px;padding:9px 20px;cursor:pointer;}'
    + '@media (max-width:560px){#njInstallBtn{right:12px;bottom:12px;font-size:12px;padding:8px 13px;}}';

  var styleEl = document.createElement('style');
  styleEl.textContent = CSS;
  document.head.appendChild(styleEl);

  var btn = document.createElement('button');
  btn.type = 'button';
  btn.id = 'njInstallBtn';
  btn.textContent = '⤓ 装到桌面，双击就能用';
  document.body.appendChild(btn);

  var mask = document.createElement('div');
  mask.id = 'njInstMask';
  mask.innerHTML = ''
    + '<div id="njInstCard">'
    + '  <h3>装到桌面，双击就能用</h3>'
    + '  <p class="nj-sub">做一次就够，以后双击桌面图标直接打开这个工具。</p>'
    + '  <div id="njInstWx">你现在是在微信里打开的，微信不支持装到桌面。先点右上角「···」→「在浏览器打开」，再按下面 3 步做。</div>'
    + '  <ol>'
    + '    <li>在电脑桌面空白处 <b>右键 → 新建 → 快捷方式</b></li>'
    + '    <li>把下面的网址粘贴进「请键入对象的位置」（点右边的<b>复制网址</b>，再在框里按 Ctrl+V）</li>'
    + '    <li>点「下一步」，名字填 <b>' + TOOL_NAME + '</b>，点「完成」</li>'
    + '  </ol>'
    + '  <div id="njInstUrl"><code>' + FULL_URL + '</code>'
    + '    <button type="button" id="njInstCopy">复制网址</button></div>'
    + '  <p id="njInstNote">用 Chrome 或 Edge 打开本页，也可以点浏览器右上角菜单里的「安装」/「应用 → 将此站点作为应用安装」，装出来的图标更整洁。</p>'
    + '  <div id="njInstFoot"><button type="button" id="njInstClose">我知道了</button></div>'
    + '</div>';
  document.body.appendChild(mask);
  if (inWeChat) document.getElementById('njInstWx').className = 'on';

  function openDlg() { mask.className = 'on'; }
  function closeDlg() { mask.className = ''; }

  document.getElementById('njInstClose').addEventListener('click', closeDlg);
  mask.addEventListener('click', function (e) { if (e.target === mask) closeDlg(); });

  document.getElementById('njInstCopy').addEventListener('click', function () {
    var b = this;
    var ok = false;
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(FULL_URL);
        ok = true;
      }
    } catch (e) {}
    if (!ok) {
      try {
        var ta = document.createElement('textarea');
        ta.value = FULL_URL;
        ta.style.position = 'fixed';
        ta.style.left = '-9999px';
        document.body.appendChild(ta);
        ta.select();
        ok = document.execCommand('copy');
        document.body.removeChild(ta);
      } catch (e) { ok = false; }
    }
    b.textContent = ok ? '已复制 ✓' : '请手动选中复制';
    b.className = ok ? 'done' : '';
    setTimeout(function () { b.textContent = '复制网址'; b.className = ''; }, 2000);
  });

  if (standalone) { btn.style.display = 'none'; return; }

  var dp = null;
  window.addEventListener('beforeinstallprompt', function (e) {
    e.preventDefault();
    dp = e;
  });
  window.addEventListener('appinstalled', function () {
    btn.textContent = '✓ 已装到桌面';
    setTimeout(function () { btn.style.display = 'none'; }, 2400);
  });

  btn.addEventListener('click', function () {
    if (dp) {
      dp.prompt();
      dp.userChoice.then(function () { dp = null; });
      return;
    }
    openDlg();
  });
})();
