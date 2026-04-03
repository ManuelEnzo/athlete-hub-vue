const fs = require('node:fs')
const path = require('node:path')

function walk(dir) {
  const files = []
  const items = fs.readdirSync(dir, { withFileTypes: true })
  for (const it of items) {
    const full = path.join(dir, it.name)
    if (it.isDirectory())
      files.push(...walk(full))
    else files.push(full)
  }
  return files
}

function getKeysFromFile(file) {
  const txt = fs.readFileSync(file, 'utf8')
  const re = /t\((?:'|")([^'"]+)(?:'|")/g
  const keys = new Set()
  let m
  while ((m = re.exec(txt)) !== null) {
    keys.add(m[1])
  }
  return Array.from(keys)
}

function hasNested(obj, pathArr) {
  let cur = obj
  for (let i = 0; i < pathArr.length; i++) {
    const k = pathArr[i]
    if (cur && Object.prototype.hasOwnProperty.call(cur, k))
      cur = cur[k]
    else return false
  }
  return true
}

function main() {
  const appDir = path.join(__dirname, '..', 'app')
  const allFiles = walk(appDir).filter(f => f.endsWith('.vue') || f.endsWith('.ts') || f.endsWith('.js'))
  const collected = new Set()
  allFiles.forEach((f) => {
    try { getKeysFromFile(f).forEach(k => collected.add(k)) }
    catch (e) {}
  })
  const keys = Array.from(collected).sort()

  const enPath = path.join(__dirname, '..', 'i18n', 'en.json')
  const itPath = path.join(__dirname, '..', 'i18n', 'it.json')
  const en = JSON.parse(fs.readFileSync(enPath, 'utf8'))
  const it = JSON.parse(fs.readFileSync(itPath, 'utf8'))

  const missingEn = []
  const missingIt = []
  keys.forEach((k) => {
    const p = k.split('.')
    if (!hasNested(en, p))
      missingEn.push(k)
    if (!hasNested(it, p))
      missingIt.push(k)
  })

  const report = { totalKeys: keys.length, missingEn: missingEn.length, missingIt: missingIt.length, missingEnList: missingEn, missingItList: missingIt }
  console.log(JSON.stringify(report, null, 2))
}

main()
