#!/usr/bin/env python3
"""Bundle www/ into single-file pages in dist/:
   dist/index.html    full page you can upload to any static host
   dist/artifact.html fragment (title + style + body) for the claude.ai page publisher
Run: python3 tools/build.py
"""
import os, re
root = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..')
rd = lambda p: open(os.path.join(root, p), encoding='utf-8').read()
css = rd('www/style.css')
names = ['i18n.js', 'i18n-el.js', None, 'algos.js', 'graphs.js', 'frames.js', 'frames-cs.js', 'frames-cs2.js', 'draw.js', 'draw-cs.js', 'draw-cs2.js', 'content.js', 'content-el.js', 'sound.js', 'robot.js', 'circuits.js', 'games-logic.js', 'minigames.js', 'game.js', 'learn.js', 'quiz.js', 'extras.js', 'pwa.js']
scripts = ['I18n.init();' if n is None else rd('www/js/' + n) for n in names]
for s in scripts:
    assert '</script' not in s.lower()
css = css.replace('--bg1: #0b1d33;', 'color-scheme: dark; --bg1: #0b1d33;', 1)
css = css.replace('background: linear-gradient(180deg, var(--bg1), var(--bg2)) fixed;',
                  'background-color: var(--bg1); background-image: linear-gradient(180deg, var(--bg1), var(--bg2)); background-attachment: fixed;', 1)
css = css.replace('body { padding: env(safe-area-inset-top) env(safe-area-inset-right) env(safe-area-inset-bottom) env(safe-area-inset-left); }', '')
assert 'color-scheme: dark' in css and 'background-color: var(--bg1)' in css
body = '<div id="app"></div>\n' + ''.join('<script>\n' + s + '\n</script>\n' for s in scripts)
frag = '<title>CS Penguins</title>\n<style>\n' + css + '\n</style>\n' + body
os.makedirs(os.path.join(root, 'dist'), exist_ok=True)
open(os.path.join(root, 'dist/artifact.html'), 'w', encoding='utf-8').write(frag)
i = frag.index('<div id="app">')
full = ('<!doctype html>\n<html lang="en">\n<head>\n<meta charset="utf-8">\n'
        '<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">\n'
        '<meta name="theme-color" content="#0b1d33">\n<link rel="manifest" href="manifest.webmanifest">\n<link rel="apple-touch-icon" href="icons/icon-180.png">\n'
        '<meta name="description" content="Learn BFS, DFS, Dijkstra, spanning trees and sorting step by step with penguins. Μάθε αλγορίθμους βήμα βήμα με πιγκουίνους.">\n'
        + frag[:i] +
        '<style>body{padding:env(safe-area-inset-top) env(safe-area-inset-right) env(safe-area-inset-bottom) env(safe-area-inset-left)}</style>\n'
        '</head>\n<body>\n' + frag[i:] + '</body>\n</html>\n')
# The hosted page loads app.js as its own file (so a strict Content-Security-Policy can forbid inline scripts).
inline_all = ''.join('<script>\n' + s + '\n</script>\n' for s in scripts)
assert inline_all in full
# One self-contained file (no log-in, everything free) that can be sent in a chat and opened from the phone's files.
open(os.path.join(root, 'dist/cs-penguins-preview.html'), 'w', encoding='utf-8').write(full)
full = full.replace(inline_all, '<script src="app.js"></script>\n', 1)
open(os.path.join(root, 'dist/index.html'), 'w', encoding='utf-8').write(full)
open(os.path.join(root, 'dist/app.js'), 'w', encoding='utf-8').write('\n'.join(scripts) + '\n')
import shutil, hashlib, json
for page in ('privacy.html', 'privacy-el.html', 'teachers.html', 'teachers-el.html', 'demo.gif'):
    shutil.copy(os.path.join(root, 'www', page), os.path.join(root, 'dist', page))
shutil.rmtree(os.path.join(root, 'dist/worksheets'), ignore_errors=True)
shutil.copytree(os.path.join(root, 'www/worksheets'), os.path.join(root, 'dist/worksheets'))
# Installable and offline: manifest, icons and a service worker whose cache name changes with the game.
shutil.copy(os.path.join(root, 'www/manifest.webmanifest'), os.path.join(root, 'dist/manifest.webmanifest'))
shutil.rmtree(os.path.join(root, 'dist/icons'), ignore_errors=True)
shutil.copytree(os.path.join(root, 'www/icons'), os.path.join(root, 'dist/icons'))
sw_files = ['./', 'index.html', 'app.js', 'manifest.webmanifest', 'privacy.html', 'privacy-el.html', 'teachers.html', 'teachers-el.html', 'demo.gif'] + ['icons/' + f for f in sorted(os.listdir(os.path.join(root, 'www/icons')))]
version = hashlib.sha1(('\n'.join(scripts) + css).encode('utf-8')).hexdigest()[:10]
sw = rd('tools/sw.template.js').replace('__VERSION__', version).replace('__FILES__', json.dumps(sw_files))
open(os.path.join(root, 'dist/sw.js'), 'w', encoding='utf-8').write(sw)
open(os.path.join(root, 'dist/_headers'), 'w').write("/*\n  X-Content-Type-Options: nosniff\n  Referrer-Policy: strict-origin-when-cross-origin\n  X-Frame-Options: DENY\n  Strict-Transport-Security: max-age=31536000; includeSubDomains\n  Cross-Origin-Opener-Policy: same-origin\n  Cross-Origin-Resource-Policy: same-origin\n  Permissions-Policy: camera=(), microphone=(), geolocation=(), payment=(), usb=(), interest-cohort=()\n  Content-Security-Policy: default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob:; font-src 'self'; connect-src 'self'; media-src 'none'; object-src 'none'; base-uri 'none'; form-action 'self'; frame-ancestors 'none'; upgrade-insecure-requests\n")
print('built dist/index.html (%d KB) and dist/artifact.html' % (len(full) // 1024))
# GitHub Pages can serve a folder called docs/ (Settings > Pages > Deploy from a branch > /docs).
shutil.rmtree(os.path.join(root, 'docs'), ignore_errors=True)
shutil.copytree(os.path.join(root, 'dist'), os.path.join(root, 'docs'), ignore=shutil.ignore_patterns('cs-penguins-preview.html', 'artifact.html', '_headers'))
