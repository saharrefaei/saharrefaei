"""Step 1 of the 3D typeface build: pin the variable display font to one condensed, heavy instance.

usage: python instance-font.py <variable.woff2> <out.ttf>
Requires: fonttools, brotli. The source font (Bricolage Grotesque) is SIL OFL 1.1.
"""
import sys
from fontTools.ttLib import TTFont
from fontTools.varLib.instancer import instantiateVariableFont

src, out = sys.argv[1], sys.argv[2]
font = TTFont(src)
print('axes:', [(a.axisTag, a.minValue, a.maxValue) for a in font['fvar'].axes])
pinned = {a.axisTag: v for a, v in ((a, {'wght': 800, 'wdth': 75}.get(a.axisTag, a.defaultValue)) for a in font['fvar'].axes)}
instance = instantiateVariableFont(font, pinned)
instance.flavor = None
instance.save(out)
print('saved', out)
