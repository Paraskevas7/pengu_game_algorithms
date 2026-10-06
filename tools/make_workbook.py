#!/usr/bin/env python3
"""Builds www/worksheets/cs-penguins-workbook-en.pdf and -el.pdf (one page per lesson, plus answers)."""
import json, os, subprocess, sys
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from reportlab.lib.pagesizes import A4
from reportlab.lib.units import mm
from reportlab.lib import colors
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.platypus import BaseDocTemplate, PageTemplate, Frame, Paragraph, Spacer, PageBreak, Table, TableStyle, KeepTogether
from reportlab.lib.styles import ParagraphStyle
import workbook_data as W

root = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..')
pdfmetrics.registerFont(TTFont('DV', '/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf'))
pdfmetrics.registerFont(TTFont('DVB', '/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf'))
pdfmetrics.registerFontFamily('DV', normal='DV', bold='DVB')
content = json.loads(subprocess.check_output(['node', os.path.join(root, 'tools/dump_content.js')], cwd=root))

NAVY, GOLD, SOFT = colors.HexColor('#17304d'), colors.HexColor('#e8a317'), colors.HexColor('#eef6fb')
st = {
    'h1': ParagraphStyle('h1', fontName='DVB', fontSize=24, leading=30, textColor=NAVY, spaceAfter=6),
    'h2': ParagraphStyle('h2', fontName='DVB', fontSize=15, leading=20, textColor=NAVY, spaceBefore=10, spaceAfter=4),
    'h3': ParagraphStyle('h3', fontName='DVB', fontSize=11, leading=15, textColor=colors.HexColor('#b86e00'), spaceBefore=12, spaceAfter=3),
    'p': ParagraphStyle('p', fontName='DV', fontSize=10.5, leading=15.5, textColor=colors.HexColor('#1b2a3a')),
    'sub': ParagraphStyle('sub', fontName='DV', fontSize=12, leading=17, textColor=colors.HexColor('#4a5b6d')),
    'q': ParagraphStyle('q', fontName='DV', fontSize=10.5, leading=15.5, textColor=colors.HexColor('#1b2a3a'), spaceBefore=8),
    'a': ParagraphStyle('a', fontName='DV', fontSize=9.5, leading=14, textColor=colors.HexColor('#1b2a3a'), leftIndent=10),
}

def penguin(c, x, y, s=1.0):
    c.saveState(); c.translate(x, y); c.scale(s, s)
    c.setFillColor(colors.HexColor('#1d2b3a')); c.roundRect(0, 0, 34, 46, 15, fill=1, stroke=0)
    c.setFillColor(colors.white); c.roundRect(6, 3, 22, 31, 11, fill=1, stroke=0)
    c.circle(11, 36, 3.2, fill=1, stroke=0); c.circle(23, 36, 3.2, fill=1, stroke=0)
    c.setFillColor(colors.black); c.circle(11.5, 36, 1.4, fill=1, stroke=0); c.circle(23.5, 36, 1.4, fill=1, stroke=0)
    c.setFillColor(colors.HexColor('#f4a21d')); p = c.beginPath(); p.moveTo(14, 33); p.lineTo(20, 33); p.lineTo(17, 28); p.close(); c.drawPath(p, fill=1, stroke=0)
    c.ellipse(5, -3, 29, 3, fill=1, stroke=0)
    c.restoreState()

def build(lang):
    U, L, D = W.UI[lang], content[lang], (W.EL if lang == 'el' else W.EN)
    out = os.path.join(root, 'www/worksheets/cs-penguins-workbook-%s.pdf' % lang)
    os.makedirs(os.path.dirname(out), exist_ok=True)
    def deco(c, doc):
        c.saveState()
        c.setFillColor(NAVY); c.rect(0, A4[1] - 14 * mm, A4[0], 14 * mm, fill=1, stroke=0)
        penguin(c, 14 * mm, A4[1] - 12 * mm, 0.45)
        c.setFillColor(colors.white); c.setFont('DVB', 11); c.drawString(26 * mm, A4[1] - 9 * mm, 'CS Penguins')
        c.setFillColor(colors.HexColor('#7a8a99')); c.setFont('DV', 8.5)
        c.drawString(18 * mm, 10 * mm, U['footer']); c.drawRightString(A4[0] - 18 * mm, 10 * mm, '%s %d' % (U['page'], doc.page))
        c.restoreState()
    doc = BaseDocTemplate(out, pagesize=A4, title=U['title'], author='CS Penguins')
    doc.addPageTemplates([PageTemplate(id='p', frames=[Frame(18 * mm, 16 * mm, A4[0] - 36 * mm, A4[1] - 36 * mm, id='f')], onPage=deco)])
    S = []
    S += [Spacer(1, 4 * mm), Paragraph(U['title'], st['h1']), Paragraph(U['sub'], st['sub']), Spacer(1, 5 * mm)]
    S.append(Table([[U['name'] + ':', ''], [U['cls'] + ':', ''], [U['date'] + ':', '']], colWidths=[30 * mm, 90 * mm], rowHeights=9 * mm,
                   style=TableStyle([('FONT', (0, 0), (-1, -1), 'DV', 11), ('LINEBELOW', (1, 0), (1, -1), 0.6, colors.HexColor('#8aa0b4')), ('VALIGN', (0, 0), (-1, -1), 'BOTTOM')])))
    S += [Spacer(1, 5 * mm), Paragraph(U['how'], st['h2'])] + [Paragraph(x, st['q']) for x in U['intro']]
    S += [Paragraph(U['lessons'], st['h2'])]
    rows = [[str(i + 1) + '.', L[k]['title'], U['age'] + ' ' + W.AGES[k]] for i, k in enumerate(W.ORDER)]
    S.append(Table(rows, colWidths=[10 * mm, 100 * mm, 40 * mm], style=TableStyle([('FONT', (0, 0), (-1, -1), 'DV', 10), ('TEXTCOLOR', (2, 0), (2, -1), colors.HexColor('#4a5b6d')),
                                                                                   ('LINEBELOW', (0, 0), (-1, -1), 0.3, colors.HexColor('#d5e2ec')), ('TOPPADDING', (0, 0), (-1, -1), 2), ('BOTTOMPADDING', (0, 0), (-1, -1), 2)])))
    for i, k in enumerate(W.ORDER):
        act, qa = D[k]
        S += [PageBreak(), Paragraph('%d. %s' % (i + 1, L[k]['title']), st['h1']), Paragraph('%s %s' % (U['age'], W.AGES[k]), st['sub']),
              Paragraph(U['learn'], st['h3']), Paragraph(L[k]['goal'], st['p']),
              Paragraph(U['act'], st['h3']), Table([[Paragraph(act, st['p'])]], colWidths=[A4[0] - 36 * mm],
                                                  style=TableStyle([('BACKGROUND', (0, 0), (-1, -1), SOFT), ('BOX', (0, 0), (-1, -1), 0.8, GOLD), ('LEFTPADDING', (0, 0), (-1, -1), 8), ('RIGHTPADDING', (0, 0), (-1, -1), 8), ('TOPPADDING', (0, 0), (-1, -1), 8), ('BOTTOMPADDING', (0, 0), (-1, -1), 8)])),
              Paragraph(U['ask'], st['h3'])]
        for n, (q, _) in enumerate(qa, 1):
            S.append(KeepTogether([Paragraph('%d. %s' % (n, q), st['q']), Spacer(1, 16 * mm),
                                   Table([['']], colWidths=[A4[0] - 36 * mm], rowHeights=1, style=TableStyle([('LINEBELOW', (0, 0), (-1, -1), 0.5, colors.HexColor('#8aa0b4'))]))]))
    S += [PageBreak(), Paragraph(U['ans'], st['h1'])]
    for i, k in enumerate(W.ORDER):
        S.append(Paragraph('%d. %s' % (i + 1, L[k]['title']), st['h3']))
        for n, (_, a) in enumerate(D[k][1], 1):
            S.append(Paragraph('%d) %s' % (n, a), st['a']))
    doc.build(S)
    print('wrote', out, os.path.getsize(out) // 1024, 'KB')

for lg in ('en', 'el'):
    build(lg)
