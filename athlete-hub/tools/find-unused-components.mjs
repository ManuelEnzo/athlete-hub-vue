import fs from 'fs'
import path from 'path'

const ROOT = path.resolve('app')

function walk(dir) {
  const files = []
  for (const name of fs.readdirSync(dir)) {
    const full = path.join(dir, name)
    const stat = fs.statSync(full)
    if (stat.isDirectory()) {
      if (name === 'node_modules' || name === '.git') continue
      files.push(...walk(full))
    } else {
      files.push(full)
    }
  }
  return files
}

function readAllFiles(dir) {
  return walk(dir).map(f => ({ path: f, content: fs.readFileSync(f, 'utf8') }))
}

const allFiles = readAllFiles(ROOT)
const vueFiles = allFiles.filter(f => f.path.endsWith('.vue'))

const fileContentsMap = {}
for (const f of allFiles) fileContentsMap[f.path] = f.content

function basenameNoExt(p) {
  return path.basename(p, '.vue')
}

const candidates = []
for (const vf of vueFiles) {
  const name = basenameNoExt(vf.path)
  // Search for occurrences of the name in other files
  let found = false
  for (const other of allFiles) {
    if (other.path === vf.path) continue
    if (other.content.includes(name)) { found = true; break }
  }
  if (!found) candidates.push({ path: vf.path, name })
}

console.log('Total .vue components:', vueFiles.length)
console.log('Potentially unused components (heuristic):', candidates.length)
for (const c of candidates.slice(0, 200)) {
  console.log(c.path)
}

if (candidates.length > 200) console.log('...more omitted')
process.exit(0)
