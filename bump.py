#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""把 kuociq-book.html 里引用的资源版本号刷成当前文件内容的 md5 前8位。
以后每次改完 kcb.* 文件，先跑 python3 bump.py，再 git push。"""
import hashlib, re, sys

HTML = 'kuociq-book.html'
FILES = ['assets/kcb.css', 'assets/kcb.pre.js', 'assets/kcb.js']

def ver(f):
    return hashlib.md5(open(f, 'rb').read()).hexdigest()[:8]

h = open(HTML, encoding='utf-8').read()
changed = []

for f in FILES:
    v = ver(f)
    # 匹配 assets/kcb.xxx.js 后面可选的 ?v=xxxx
    pat = re.compile(r'(%s)(\?v=[0-9a-f]+)?' % re.escape(f))
    m = pat.search(h)
    if not m:
        print('未找到引用:', f); sys.exit(1)
    old = m.group(2) or ''
    new = '?v=' + v
    if old != new:
        h = h[:m.start()] + f + new + h[m.end():]
        changed.append('%s %s -> %s' % (f, old or '(无)', new))

open(HTML, 'w', encoding='utf-8').write(h)
if changed:
    print('版本号已更新:')
    for c in changed: print('  ', c)
else:
    print('版本号无变化')
