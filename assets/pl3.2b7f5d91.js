/* ============================================================================
   批量修瑕疵 · 独立版 b3（纯新增，不改动 b1 / b2 的任何文件）

   相对 b2：只精简页面文案（黄色提醒两句、格式说明一行、去掉修图力度说明块）。
        功能逻辑与 b2 逐字一致：整批固定 背景 40 / 产品 2、可视化待修列表、
        格式白名单 JPG/PNG/WebP/BMP、离屏 iframe 复用现有修瑕疵算法。
   ★ 算法文件 nr.54a82120.js 一字节未改，效果与单张页完全一致。
   ============================================================================ */
(function () {
  'use strict';

  var $ = function (id) { return document.getElementById(id); };
  var eng = $('pl-engine'), input = $('plInput'), dirInput = $('plDirInput'), goBtn = $('plGo');
  var inPick = $('plPickIn'), outPick = $('plPickOut'), note = $('plNote');
  var qList = $('plQList'), qCount = $('plQCount');

  /* 整批固定力度（b2：不再有滑块） */
  var BG_R = 40, PROD_R = 2;
  /* 格式白名单：浏览器能解码的才收，相机 RAW / TIFF / HEIC 一律跳过 */
  var OK_EXT = /\.(jpe?g|png|webp|bmp)$/i;
  var FMT_NAME = { jpg: 'JPG', jpeg: 'JPG', png: 'PNG', webp: 'WEBP', bmp: 'BMP' };

  var allFiles = [], seen = {}, skipped = 0, urls = [];
  var outDir = null, running = false;
  var savedUsed = null, hadUsed = false, usedTouched = false;

  var sleep = function (ms) { return new Promise(function (r) { setTimeout(r, ms); }); };
  var waitFor = function (fn, ms, tick) {
    return new Promise(function (res, rej) {
      var t0 = Date.now();
      (function poll() {
        var v = false;
        try { v = !!fn(); } catch (e) { v = false; }
        if (v) return res(true);
        if (Date.now() - t0 > ms) return rej(new Error('等待超时'));
        setTimeout(poll, tick || 100);
      })();
    });
  };

  /* ---------- 浏览器能力检测 + 提醒（按娜家要求放在功能最前面） ---------- */
  var canPick = typeof window.showDirectoryPicker === 'function';
  var secure = window.isSecureContext;
  if (!canPick || !secure) {
    note.className = 'pl-note bad';
    note.innerHTML = '<b>当前浏览器不能直接保存文件夹。</b><br>' +
      '请用 <b>Edge 或 Chrome</b> 打开本页（网址需是 https 开头）。' +
      '其余浏览器会自动改成「打包下载」，下载后自己解压到想放的文件夹。';
  }

  /* ---------- 选图：两个入口都汇进同一个待修列表（追加去重） ---------- */
  function selected() { return allFiles.filter(function (x) { return x.on; }); }

  function handleFiles(list) {
    var arr = Array.prototype.slice.call(list || []);
    arr.forEach(function (f) {
      if (!OK_EXT.test(f.name)) { skipped++; return; }
      var key = f.name + '|' + f.size + '|' + f.lastModified;
      if (seen[key]) return;
      seen[key] = 1;
      allFiles.push({ file: f, on: true });
    });
    allFiles.sort(function (a, b) {
      var pa = a.file.webkitRelativePath || a.file.name;
      var pb = b.file.webkitRelativePath || b.file.name;
      return pa.localeCompare(pb, 'zh-CN');
    });
    renderQueue();
    inPick.classList.toggle('on', allFiles.length > 0);
    $('plInSub').textContent = allFiles.length
      ? '已读到 ' + allFiles.length + ' 张图片' + (skipped ? '（已跳过 ' + skipped + ' 个不支持的文件）' : '')
      : (skipped ? '没找到支持的图片，已跳过 ' + skipped + ' 个文件' : '按住 Ctrl 可挑多张，Ctrl+A 全选');
    refreshGo();
  }
  input.addEventListener('change', function () { handleFiles(input.files); input.value = ''; });
  dirInput.addEventListener('change', function () { handleFiles(dirInput.files); dirInput.value = ''; });

  /* ---------- 待修列表：缩略图 + 勾选（单张 / 多张 / 全部） ---------- */
  function updCount() {
    qCount.textContent = allFiles.length
      ? '共 ' + allFiles.length + ' 张 · 已选 ' + selected().length + ' 张'
      : '还没选图片';
  }
  function renderQueue() {
    urls.forEach(function (u) { try { URL.revokeObjectURL(u); } catch (e) {} });
    urls = [];
    qList.innerHTML = '';
    if (!allFiles.length) {
      qList.innerHTML = '<div class="pl-qempty">选好的图片会在这里显示缩略图，<br>默认全部勾上；不想修的把勾去掉就行。</div>';
      updCount(); return;
    }
    var frag = document.createDocumentFragment();
    allFiles.forEach(function (it) {
      var row = document.createElement('label');
      row.className = 'pl-qitem' + (it.on ? '' : ' off');
      var cb = document.createElement('input');
      cb.type = 'checkbox'; cb.checked = it.on;
      cb.addEventListener('change', function () {
        it.on = cb.checked;
        row.classList.toggle('off', !it.on);
        updCount(); refreshGo();
      });
      var img = document.createElement('img');
      img.className = 'pl-qthumb'; img.alt = '';
      var u = URL.createObjectURL(it.file);
      urls.push(u); img.src = u;
      img.addEventListener('error', function () { img.style.visibility = 'hidden'; });
      var n = document.createElement('span');
      n.className = 'pl-qname';
      n.textContent = it.file.webkitRelativePath || it.file.name;
      n.title = n.textContent;
      var f = document.createElement('span');
      f.className = 'pl-qfmt';
      var ext = (it.file.name.split('.').pop() || '').toLowerCase();
      f.textContent = FMT_NAME[ext] || ext.toUpperCase();
      row.appendChild(cb); row.appendChild(img); row.appendChild(n); row.appendChild(f);
      frag.appendChild(row);
    });
    qList.appendChild(frag);
    updCount();
  }
  function setAll(on) {
    allFiles.forEach(function (x) { x.on = on; });
    Array.prototype.forEach.call(qList.querySelectorAll('.pl-qitem'), function (row) {
      row.querySelector('input').checked = on;
      row.classList.toggle('off', !on);
    });
    updCount(); refreshGo();
  }
  $('plSelAll').addEventListener('click', function () { setAll(true); });
  $('plSelNone').addEventListener('click', function () { setAll(false); });

  /* ---------- 选输出文件夹 ---------- */
  outPick.addEventListener('click', async function () {
    if (!canPick) {
      $('plOutSub').textContent = '当前浏览器不支持，结束后会自动打包下载';
      $('plOutT').textContent = '打包下载（不保存文件夹）';
      outDir = 'ZIP';
      outPick.classList.add('on');
      refreshGo();
      return;
    }
    try {
      var h = await window.showDirectoryPicker({ mode: 'readwrite' });
      outDir = h;
      outPick.classList.add('on');
      $('plOutSub').textContent = '已选择：' + h.name;
      $('plOutT').textContent = '换一个文件夹';
    } catch (e) {
      if (e && e.name !== 'AbortError') $('plOutSub').textContent = '没选成功：' + (e.message || e.name);
    }
    refreshGo();
  });

  function refreshGo() {
    var n = selected().length;
    goBtn.disabled = running || !n || !outDir;
    if (!running) {
      goBtn.textContent = n ? '开始批量修（' + n + ' 张）' : '开始批量修';
      $('plTotal').textContent = '/ ' + n + ' 张';
    }
  }

  /* ---------- 引擎：跳过单张页的「免费 6 次」闸门 ----------
     批量工具属于本地不限次工具。只临时把「已用次数」归零（每张处理前），
     批量结束立刻还原客户原本的次数；绝不写 nj_lic_rt 解锁标记，
     因此不影响主站单张页的解锁状态与商业钩子。 */
  function engineUsedReset() {
    try {
      var w = eng.contentWindow;
      if (!w) return;
      if (!usedTouched) {
        savedUsed = w.localStorage.getItem('nj_free_used_rt');
        hadUsed = savedUsed !== null;
        usedTouched = true;
      }
      w.localStorage.setItem('nj_free_used_rt', '0');
    } catch (e) {}
  }
  function engineRestore() {
    if (!usedTouched) return;
    try {
      var w = eng.contentWindow;
      if (!w) return;
      if (hadUsed) w.localStorage.setItem('nj_free_used_rt', savedUsed);
      else w.localStorage.removeItem('nj_free_used_rt');
    } catch (e) {}
    usedTouched = false;
  }

  /* ---------- ZIP（仅不支持文件夹写入时的兜底，纯 JS、无外部库、不联网） ---------- */
  var CRC_T = (function () {
    var t = new Uint32Array(256);
    for (var n = 0; n < 256; n++) { var c = n; for (var k = 0; k < 8; k++) c = (c & 1) ? (0xEDB88320 ^ (c >>> 1)) : (c >>> 1); t[n] = c >>> 0; }
    return t;
  })();
  function crc32(u8) {
    var c = 0xFFFFFFFF;
    for (var i = 0; i < u8.length; i++) c = CRC_T[(c ^ u8[i]) & 0xFF] ^ (c >>> 8);
    return (c ^ 0xFFFFFFFF) >>> 0;
  }
  function dosStamp(d) {
    return {
      time: ((d.getHours() << 11) | (d.getMinutes() << 5) | (d.getSeconds() >> 1)) & 0xFFFF,
      date: (((d.getFullYear() - 1980) << 9) | ((d.getMonth() + 1) << 5) | d.getDate()) & 0xFFFF
    };
  }
  function concat(parts) {
    var n = 0; parts.forEach(function (p) { n += p.length; });
    var out = new Uint8Array(n), o = 0;
    parts.forEach(function (p) { out.set(p, o); o += p.length; });
    return out;
  }
  function u16(v) { return new Uint8Array([v & 255, (v >>> 8) & 255]); }
  function u32(v) { return new Uint8Array([v & 255, (v >>> 8) & 255, (v >>> 16) & 255, (v >>> 24) & 255]); }
  function buildZip(items) {
    var enc = new TextEncoder(), local = [], central = [], offset = 0;
    var st = dosStamp(new Date());
    items.forEach(function (it) {
      var name = enc.encode(it.name), data = new Uint8Array(it.buf), crc = crc32(data);
      var lh = concat([u32(0x04034b50), u16(20), u16(0x0800), u16(0), u16(st.time), u16(st.date),
        u32(crc), u32(data.length), u32(data.length), u16(name.length), u16(0)]);
      local.push(lh, name, data);
      var ch = concat([u32(0x02014b50), u16(20), u16(20), u16(0x0800), u16(0), u16(st.time), u16(st.date),
        u32(crc), u32(data.length), u32(data.length), u16(name.length), u16(0), u16(0),
        u16(0), u16(0), u32(0), u32(offset)]);
      central.push(ch, name);
      offset += lh.length + name.length + data.length;
    });
    var cd = concat(central);
    var eocd = concat([u32(0x06054b50), u16(0), u16(0), u16(items.length), u16(items.length),
      u32(cd.length), u32(offset), u16(0)]);
    return new Blob([concat(local), cd, eocd], { type: 'application/zip' });
  }

  /* ---------- 结果列表 ---------- */
  var thumbs = 0;
  function addItem(name, status, cls) {
    var box = $('plList');
    var empty = box.querySelector('.pl-empty');
    if (empty) empty.remove();
    var row = document.createElement('div');
    row.className = 'pl-item';
    var img = document.createElement('img');
    img.style.visibility = 'hidden';
    var n = document.createElement('div'); n.className = 'n'; n.textContent = name; n.title = name;
    var s = document.createElement('div'); s.className = 's ' + cls; s.textContent = status;
    row.appendChild(img); row.appendChild(n); row.appendChild(s);
    box.insertBefore(row, box.firstChild);
    return { img: img, n: n, s: s };
  }
  function tinyThumb(cv) {
    try {
      var c = document.createElement('canvas');
      var s = Math.min(1, 96 / Math.max(cv.width, cv.height));
      c.width = Math.max(1, Math.round(cv.width * s));
      c.height = Math.max(1, Math.round(cv.height * s));
      c.getContext('2d').drawImage(cv, 0, 0, c.width, c.height);
      return c.toDataURL('image/jpeg', 0.6);
    } catch (e) { return ''; }
  }

  /* ---------- 单张处理 ---------- */
  async function runOne(file, idx) {
    var w = eng.contentWindow, d = eng.contentDocument;
    var apply = d.getElementById('btnApply'), slBg = d.getElementById('slBg');

    // 每张处理前把「已用次数」临时归零；批量是本地不限次工具，
    // 不写解锁标记、不碰主站解锁状态；批量结束统一还原。
    engineUsedReset();

    // 先置回禁用，避免上一张的「已就绪」状态被误判为本张识别完成
    apply.disabled = true; slBg.disabled = true;
    w.__njLoad(file);
    await sleep(140);
    await waitFor(function () { return !apply.disabled && !slBg.disabled; }, 30000, 120);

    // 自动识别分不出产品的图：跳过，不卡住整批
    var ai = d.getElementById('autoInfo');
    if (ai && /自动分不干净/.test(ai.textContent || '')) {
      return { skip: true, reason: '背景和产品颜色太接近' };
    }

    // b2：整批固定力度，不再读滑块
    d.getElementById('slBg').value = BG_R;
    d.getElementById('slProd').value = PROD_R;
    apply.click();
    await sleep(260);
    // 保险：万一次数闸门真弹出来了，applyAll 会直接 return、画面根本没被处理，
    // 此时绝不能把原图当「已修」写出去，直接判这张失败。
    var bm = d.getElementById('buyMask');
    if (bm && bm.style.display === 'flex') throw new Error('引擎次数闸门拦截，请重试');
    await waitFor(function () {
      var b = d.getElementById('busy');
      return b && !b.classList.contains('on');
    }, 180000, 150);

    var cv = d.getElementById('cvBase');
    var blob = await new Promise(function (res) { cv.toBlob(res, 'image/png'); });
    if (!blob) throw new Error('导出失败');
    return { blob: blob, thumb: tinyThumb(cv), w: cv.width, h: cv.height };
  }

  /* ---------- 批量主流程 ---------- */
  goBtn.addEventListener('click', async function () {
    var files = selected().map(function (x) { return x.file; });
    if (running || !files.length || !outDir) return;
    running = true; refreshGo();
    goBtn.textContent = '正在批量修…';
    $('plList').innerHTML = '';
    thumbs = 0;
    var done = 0, failed = 0, zipItems = [], usedNames = {};
    var total = files.length;
    $('plTotal').textContent = '/ ' + total + ' 张';

    try {
      await waitFor(function () {
        try { return typeof eng.contentWindow.__njLoad === 'function'; } catch (e) { return false; }
      }, 30000, 150);

      for (var i = 0; i < total; i++) {
        var f = files[i];
        $('plNow').textContent = '正在修第 ' + (i + 1) + ' / ' + total + ' 张：' + f.name;
        var item = addItem(f.name, '处理中', 'run');
        try {
          var r = await runOne(f, i);
          if (r.skip) {
            failed++;
            item.s.className = 's no';
            item.s.textContent = '已跳过 · ' + r.reason;
            continue;
          }
          var base = f.name.replace(/\.[^.]+$/, '');
          var name = base + '_已修.png';
          if (usedNames[name]) { var k = 2; while (usedNames[base + '_已修(' + k + ').png']) k++; name = base + '_已修(' + k + ').png'; }
          usedNames[name] = 1;

          if (outDir === 'ZIP') {
            zipItems.push({ name: name, buf: await r.blob.arrayBuffer() });
          } else {
            var fh = await outDir.getFileHandle(name, { create: true });
            var wr = await fh.createWritable();
            await wr.write(r.blob);
            await wr.close();
          }
          done++;
          item.s.className = 's ok';
          item.s.textContent = '已保存 · ' + r.w + '×' + r.h;
          item.n.textContent = name;
          item.n.title = f.name + ' → ' + name;
          if (r.thumb && thumbs < 80) { item.img.src = r.thumb; item.img.style.visibility = 'visible'; thumbs++; }
        } catch (e) {
          failed++;
          item.s.className = 's no';
          item.s.textContent = '没修成 · ' + (e.message || '跳过');
        }
        $('plDone').textContent = done;
        $('plBar').style.width = Math.round((i + 1) / total * 100) + '%';
        await sleep(80);   // 让引擎把上一张的异步收尾释放掉
      }

      if (outDir === 'ZIP' && zipItems.length) {
        var z = buildZip(zipItems);
        var a = document.createElement('a');
        a.href = URL.createObjectURL(z);
        a.download = '批量修瑕疵_' + zipItems.length + '张.zip';
        document.body.appendChild(a); a.click(); a.parentNode.removeChild(a);
        setTimeout(function () { URL.revokeObjectURL(a.href); }, 60000);
      }
      $('plNow').textContent = '全部完成：成功 ' + done + ' 张' + (failed ? '，跳过 ' + failed + ' 张' : '') +
        (outDir === 'ZIP' ? '（已打包下载）' : '（已存进你选的文件夹）');
    } catch (e) {
      $('plNow').textContent = '批量中断：' + (e.message || e);
    } finally {
      engineRestore();
      running = false;
      refreshGo();
      goBtn.textContent = '再跑一批';
    }
  });

  /* 引擎 iframe 加载完即可用；次数归零只在批量运行时逐张做，闲置时不改动任何状态 */
  refreshGo();
})();
