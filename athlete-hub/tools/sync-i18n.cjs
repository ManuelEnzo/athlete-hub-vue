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

function setNested(obj, pathArr, value) {
  let cur = obj
  for (let i = 0; i < pathArr.length; i++) {
    const k = pathArr[i]
    if (i === pathArr.length - 1) {
      if (cur[k] === undefined)
        cur[k] = value
    }
    else {
      if (typeof cur[k] !== 'object' || cur[k] === null)
        cur[k] = {}
      cur = cur[k]
    }
  }
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
    try {
      getKeysFromFile(f).forEach(k => collected.add(k))
    }
    catch (e) {}
  })

  const keys = Array.from(collected).sort()
  console.log('Found', keys.length, 'i18n keys in code')

  const enPath = path.join(__dirname, '..', 'i18n', 'en.json')
  const itPath = path.join(__dirname, '..', 'i18n', 'it.json')
  const en = JSON.parse(fs.readFileSync(enPath, 'utf8'))
  const it = JSON.parse(fs.readFileSync(itPath, 'utf8'))

  let addedEn = 0
  let addedIt = 0

  for (const key of keys) {
    const pathArr = key.split('.')
    if (!hasNested(en, pathArr)) {
      const placeholder = pathArr[pathArr.length - 1].replace(/([A-Z])/g, ' $1').replace(/[-_]/g, ' ')
      setNested(en, pathArr, placeholder)
      addedEn++
    }
    if (!hasNested(it, pathArr)) {
      const placeholderIt = pathArr[pathArr.length - 1].replace(/([A-Z])/g, ' $1').replace(/[-_]/g, ' ')
      setNested(it, pathArr, placeholderIt)
      addedIt++
    }
  }

  if (addedEn > 0) {
    fs.writeFileSync(enPath, `${JSON.stringify(en, null, 2)}\n`, 'utf8')
  }
  if (addedIt > 0) {
    fs.writeFileSync(itPath, `${JSON.stringify(it, null, 2)}\n`, 'utf8')
  }

  console.log('Added', addedEn, 'keys to en.json,', addedIt, 'keys to it.json')
}

main()
