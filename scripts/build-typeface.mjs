// Step 2 of the 3D typeface build: convert a static TTF into the JSON format read by three's FontLoader / drei <Text3D>.
// usage: node scripts/build-typeface.mjs <in.ttf> <out.json>
// Needs a throwaway install: `npm i --no-save opentype.js`
import opentype from 'opentype.js'
import { readFileSync, writeFileSync } from 'node:fs'

const [input, output] = process.argv.slice(2)
const font = opentype.parse(readFileSync(input).buffer.slice(0))
const CHARS = ' ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789.,:;!?&+-–—·/()\'’"@#%→'
const round = (n) => Math.round(n)

const glyphs = {}
for (const char of CHARS) {
  const glyph = font.charToGlyph(char)
  if (!glyph || (glyph.index === 0 && char !== ' ')) continue
  const commands = []
  for (const c of glyph.path.commands) {
    if (c.type === 'M') commands.push('m', round(c.x), round(c.y))
    else if (c.type === 'L') commands.push('l', round(c.x), round(c.y))
    else if (c.type === 'Q') commands.push('q', round(c.x), round(c.y), round(c.x1), round(c.y1))
    else if (c.type === 'C') commands.push('b', round(c.x), round(c.y), round(c.x1), round(c.y1), round(c.x2), round(c.y2))
    else if (c.type === 'Z') commands.push('z')
  }
  const box = glyph.getBoundingBox()
  glyphs[char] = { ha: round(glyph.advanceWidth), x_min: round(box.x1), x_max: round(box.x2), o: commands.join(' ') }
}

const typeface = {
  glyphs,
  familyName: 'Bricolage Grotesque 800 Condensed',
  ascender: round(font.ascender),
  descender: round(font.descender),
  underlinePosition: -100,
  underlineThickness: 50,
  boundingBox: { yMin: round(font.descender), xMin: 0, yMax: round(font.ascender), xMax: 1000 },
  resolution: font.unitsPerEm,
  original_font_information: {
    note: 'Derived from Bricolage Grotesque (SIL Open Font License 1.1), instanced at wght 800 / wdth 75. See public/fonts/OFL.txt.',
  },
}
writeFileSync(output, JSON.stringify(typeface))
console.log(`wrote ${output}: ${Object.keys(glyphs).length} glyphs, unitsPerEm ${font.unitsPerEm}`)
