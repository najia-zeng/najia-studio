/* ============================================================================
   u2 · 统一外壳逻辑（所有工具页共用一份）
   ----------------------------------------------------------------------------
   只做一件事：修图 4 页原本把标题 .func-head 闷在左豆腐块 .func 里面，
   这里把它提到工作区 .content-area 顶部，横跨整宽，跟批量页 / 风格包一致。
   其余页面（批量修瑕疵、三个风格包）没有 .func-head，直接跳过，零开销。
   不改任何功能代码与资源；幂等，可重复执行。
   ============================================================================ */
(function () {
  var f = (location.pathname.split('/').pop() || '').toLowerCase();
  if (!/^(retouch|quhui|ruihua|sewen)[^/]*\.html$/.test(f)) return;

  function lift() {
    var area = document.querySelector('.content-area');
    var head = document.querySelector('.func-head');
    if (!area || !head) return false;
    if (area.classList.contains('u1-lift')) return true;
    area.insertBefore(head, area.firstChild);
    area.classList.add('u1-lift');
    return true;
  }

  if (lift()) return;
  var tries = 0;
  var timer = setInterval(function () {
    tries++;
    if (lift() || tries > 200) clearInterval(timer);
  }, 60);
})();
