import fs from 'fs'
import path from 'path'
import { baseCompile } from '@intlify/message-compiler'
const files = ['i18n/en.json', 'i18n/it.json']
for (const file of files) {
  const data = JSON.parse(fs.readFileSync(path.resolve(file), 'utf8'))
  function walk(obj, keyPath = []) {
    if (typeof obj === 'string') {
      try {
        baseCompile(obj)
      } catch (err) {
        console.error('ERROR', file, keyPath.join('.'), err.message)
      }
      return
    }
    if (Array.isArray(obj)) {
      obj.forEach((item, i) => walk(item, [...keyPath, i]))
      return
    }
    for (const [k, v] of Object.entries(obj)) {
      walk(v, [...keyPath, k])
    }
  }
  walk(data)
}
