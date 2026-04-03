const fs = require('node:fs')
const path = require('node:path')

function loadJson(p) {
  return JSON.parse(fs.readFileSync(p, 'utf8'))
}

function saveJson(p, obj) {
  fs.writeFileSync(p, `${JSON.stringify(obj, null, 2)}\n`, 'utf8')
}

function cleanObj(obj) {
  if (obj && typeof obj === 'object') {
    for (const k of Object.keys(obj)) {
      const v = obj[k]
      if (typeof v === 'string') {
        const norm = v.trim().toLowerCase()
        const keyNorm = k.trim().toLowerCase()
        if (norm === keyNorm) {
          delete obj[k]
          continue
        }
      }
      else if (typeof v === 'object') {
        cleanObj(v)
        // remove empty objects
        if (v && Object.keys(v).length === 0)
          delete obj[k]
      }
    }
  }
}

function main() {
  const i18nDir = path.join(__dirname, '..', 'i18n')
  const files = ['en.json', 'it.json']
  for (const f of files) {
    const p = path.join(i18nDir, f)
    const json = loadJson(p)
    cleanObj(json)
    saveJson(p, json)
    console.log('Cleaned', f)
  }
}

main()
