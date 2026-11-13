/*! NaStudio · 客户专区通行证（gate v1）
 *  改密码：把 PASS_HASH 换成新密码的 SHA-256（小写十六进制），推送即可。
 *  已发放的通行证存的是旧哈希，换完自动失效，无需通知客户。 */
(function () {
  var KEY = 'ns_pass_v1';
  var PASS_HASH = '28bcf493a3b5186da0cea356231de8965a6bdf98c9cc8f5b09274bee370eab8d';

  var store = null, saved = null;
  try { store = window.localStorage; } catch (e) {}
  try { saved = store ? store.getItem(KEY) : null; } catch (e) {}
  if (saved === PASS_HASH) return;

  var de = document.documentElement;
  de.style.visibility = 'hidden';

  var K = [
    0x428a2f98, 0x71374491, 0xb5c0fbcf, 0xe9b5dba5, 0x3956c25b, 0x59f111f1, 0x923f82a4, 0xab1c5ed5,
    0xd807aa98, 0x12835b01, 0x243185be, 0x550c7dc3, 0x72be5d74, 0x80deb1fe, 0x9bdc06a7, 0xc19bf174,
    0xe49b69c1, 0xefbe4786, 0x0fc19dc6, 0x240ca1cc, 0x2de92c6f, 0x4a7484aa, 0x5cb0a9dc, 0x76f988da,
    0x983e5152, 0xa831c66d, 0xb00327c8, 0xbf597fc7, 0xc6e00bf3, 0xd5a79147, 0x06ca6351, 0x14292967,
    0x27b70a85, 0x2e1b2138, 0x4d2c6dfc, 0x53380d13, 0x650a7354, 0x766a0abb, 0x81c2c92e, 0x92722c85,
    0xa2bfe8a1, 0xa81a664b, 0xc24b8b70, 0xc76c51a3, 0xd192e819, 0xd6990624, 0xf40e3585, 0x106aa070,
    0x19a4c116, 0x1e376c08, 0x2748774c, 0x34b0bcb5, 0x391c0cb3, 0x4ed8aa4a, 0x5b9cca4f, 0x682e6ff3,
    0x748f82ee, 0x78a5636f, 0x84c87814, 0x8cc70208, 0x90befffa, 0xa4506ceb, 0xbef9a3f7, 0xc67178f2
  ];

  function rotr(x, n) { return (x >>> n) | (x << (32 - n)); }

  function toUtf8(s) {
    var out = [], i, c, c2, cp;
    for (i = 0; i < s.length; i++) {
      c = s.charCodeAt(i);
      if (c < 0x80) out.push(c);
      else if (c < 0x800) out.push(0xc0 | (c >> 6), 0x80 | (c & 63));
      else if (c >= 0xd800 && c <= 0xdbff) {
        c2 = s.charCodeAt(++i);
        cp = 0x10000 + ((c & 0x3ff) << 10) + (c2 & 0x3ff);
        out.push(0xf0 | (cp >> 18), 0x80 | ((cp >> 12) & 63), 0x80 | ((cp >> 6) & 63), 0x80 | (cp & 63));
      } else out.push(0xe0 | (c >> 12), 0x80 | ((c >> 6) & 63), 0x80 | (c & 63));
    }
    return out;
  }

  function sha256hex(str) {
    var b = toUtf8(str), len = b.length, i, t;
    var bitLenHi = Math.floor(len / 536870912), bitLenLo = (len * 8) >>> 0;
    b.push(0x80);
    while (b.length % 64 !== 56) b.push(0);
    b.push((bitLenHi >>> 24) & 255, (bitLenHi >>> 16) & 255, (bitLenHi >>> 8) & 255, bitLenHi & 255);
    b.push((bitLenLo >>> 24) & 255, (bitLenLo >>> 16) & 255, (bitLenLo >>> 8) & 255, bitLenLo & 255);

    var H = [0x6a09e667, 0xbb67ae85, 0x3c6ef372, 0xa54ff53a, 0x510e527f, 0x9b05688c, 0x1f83d9ab, 0x5be0cd19];
    var w = new Array(64);

    for (i = 0; i < b.length; i += 64) {
      for (t = 0; t < 16; t++) {
        w[t] = (b[i + t * 4] << 24) | (b[i + t * 4 + 1] << 16) | (b[i + t * 4 + 2] << 8) | b[i + t * 4 + 3];
      }
      for (t = 16; t < 64; t++) {
        var s0 = rotr(w[t - 15], 7) ^ rotr(w[t - 15], 18) ^ (w[t - 15] >>> 3);
        var s1 = rotr(w[t - 2], 17) ^ rotr(w[t - 2], 19) ^ (w[t - 2] >>> 10);
        w[t] = (w[t - 16] + s0 + w[t - 7] + s1) | 0;
      }
      var a = H[0], bb = H[1], c = H[2], d = H[3], e = H[4], f = H[5], g = H[6], h = H[7];
      for (t = 0; t < 64; t++) {
        var S1 = rotr(e, 6) ^ rotr(e, 11) ^ rotr(e, 25);
        var ch = (e & f) ^ (~e & g);
        var t1 = (h + S1 + ch + K[t] + w[t]) | 0;
        var S0 = rotr(a, 2) ^ rotr(a, 13) ^ rotr(a, 22);
        var maj = (a & bb) ^ (a & c) ^ (bb & c);
        var t2 = (S0 + maj) | 0;
        h = g; g = f; f = e; e = (d + t1) | 0; d = c; c = bb; bb = a; a = (t1 + t2) | 0;
      }
      H[0] = (H[0] + a) | 0; H[1] = (H[1] + bb) | 0; H[2] = (H[2] + c) | 0; H[3] = (H[3] + d) | 0;
      H[4] = (H[4] + e) | 0; H[5] = (H[5] + f) | 0; H[6] = (H[6] + g) | 0; H[7] = (H[7] + h) | 0;
    }

    var hex = '';
    for (i = 0; i < 8; i++) {
      var v = (H[i] >>> 0).toString(16);
      while (v.length < 8) v = '0' + v;
      hex += v;
    }
    return hex;
  }

  var CSS = [
    '#nsgate{position:fixed;inset:0;z-index:2147483000;display:flex;align-items:center;justify-content:center;',
    'padding:24px;background:radial-gradient(120% 90% at 50% 0%,#ffffff 0%,#f4f3f9 55%,#eeecf6 100%);',
    'font-family:"Space Grotesk","PingFang SC","Noto Sans SC","Microsoft YaHei",sans-serif;-webkit-font-smoothing:antialiased;}',
    '#nsgate *{box-sizing:border-box;}',
    '#nsgate .g-box{width:100%;max-width:392px;background:#fff;border:1px solid #ece9f6;border-radius:22px;',
    'padding:38px 34px 26px;box-shadow:0 18px 50px rgba(37,26,86,.10),0 2px 6px rgba(37,26,86,.04);text-align:center;}',
    '#nsgate .g-logo{width:52px;height:52px;border-radius:15px;display:block;margin:0 auto 18px;object-fit:cover;background:#0a0a0a;}',
    '#nsgate h2{margin:0 0 10px;font-size:23px;font-weight:700;color:#1a1a2e;letter-spacing:.2px;}',
    '#nsgate .g-sub{margin:0 0 24px;font-size:13.5px;line-height:1.75;color:#6a6483;}',
    '#nsgate .g-row{display:flex;gap:9px;}',
    '#nsgate input{flex:1;min-width:0;height:48px;padding:0 14px;font-size:16px;color:#1a1a2e;',
    'background:#faf9fe;border:1.5px solid #e6e2f5;border-radius:12px;outline:none;transition:border-color .15s,background .15s;',
    'font-family:inherit;letter-spacing:1px;}',
    '#nsgate input::placeholder{color:#a8a2c0;letter-spacing:0;}',
    '#nsgate input:focus{border-color:#6b5ce7;background:#fff;}',
    '#nsgate button{height:48px;padding:0 22px;font-size:15px;font-weight:650;color:#fff;background:#6b5ce7;',
    'border:0;border-radius:12px;cursor:pointer;font-family:inherit;transition:background .15s,transform .1s;white-space:nowrap;}',
    '#nsgate button:hover{background:#5b4ddb;}',
    '#nsgate button:active{transform:scale(.98);}',
    '#nsgate .g-err{height:20px;margin:10px 0 0;font-size:12.5px;color:#c0392b;opacity:0;transition:opacity .15s;}',
    '#nsgate .g-err.on{opacity:1;}',
    '#nsgate.shake .g-box{animation:nsg .34s;}',
    '@keyframes nsg{0%,100%{transform:translateX(0)}22%{transform:translateX(-7px)}44%{transform:translateX(6px)}70%{transform:translateX(-3px)}}',
    '#nsgate .g-foot{margin-top:22px;padding-top:20px;border-top:1px solid #f0eef8;display:flex;align-items:center;gap:12px;text-align:left;}',
    '#nsgate .g-qr{width:62px;height:62px;border-radius:9px;border:1px solid #ece9f6;object-fit:cover;flex-shrink:0;background:#f7f7fa;}',
    '#nsgate .g-foot span{font-size:12px;line-height:1.65;color:#8d87a3;}',
    '#nsgate .g-foot b{color:#4b4566;font-weight:600;}',
    '@media(max-width:420px){#nsgate .g-box{padding:30px 22px 20px;}#nsgate .g-qr{width:56px;height:56px;}}'
  ].join('');

  function ui() {
    if (document.getElementById('nsgate')) return;
    var st = document.createElement('style');
    st.textContent = CSS;
    document.head.appendChild(st);

    var wrap = document.createElement('div');
    wrap.id = 'nsgate';
    wrap.innerHTML =
      '<div class="g-box">' +
        '<img class="g-logo" src="img/logo.png" alt="">' +
        '<h2>客户专区</h2>' +
        '<p class="g-sub">输入密码继续使用。</p>' +
        '<div class="g-row">' +
          '<input id="nsgInput" type="password" inputmode="latin" autocomplete="current-password" placeholder="输入密码" maxlength="32">' +
          '<button id="nsgBtn" type="button">进入</button>' +
        '</div>' +
        '<p class="g-err" id="nsgErr">密码不对，再试一次</p>' +
        '<div class="g-foot">' +
          '<img class="g-qr" src="img/qr-weixin.png" alt="" onerror="this.style.display=\'none\'">' +
          '<span>还没有密码？<br>扫码加微信，回复<b>「工具」</b></span>' +
        '</div>' +
      '</div>';
    document.body.appendChild(wrap);
    de.style.visibility = '';
    document.body.style.overflow = 'hidden';

    var inp = document.getElementById('nsgInput');
    var err = document.getElementById('nsgErr');
    var btn = document.getElementById('nsgBtn');

    setTimeout(function () { try { inp.focus(); } catch (e) {} }, 60);

    function fail() {
      err.classList.add('on');
      wrap.classList.add('shake');
      setTimeout(function () { wrap.classList.remove('shake'); }, 400);
      inp.select();
    }

    function submit() {
      var v = (inp.value || '').replace(/^\s+|\s+$/g, '').toLowerCase();
      if (!v) return;
      if (sha256hex(v) === PASS_HASH) {
        try { store.setItem(KEY, PASS_HASH); } catch (e) {}
        wrap.parentNode.removeChild(wrap);
        document.body.style.overflow = '';
      } else {
        fail();
      }
    }

    btn.addEventListener('click', submit);
    inp.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' || e.keyCode === 13) { e.preventDefault(); submit(); }
    });
    inp.addEventListener('input', function () { err.classList.remove('on'); });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', ui);
  else ui();
})();
