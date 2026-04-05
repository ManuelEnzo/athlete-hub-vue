// Script to replace agenda section in DashboardLayout.vue
const fs = require('fs')
const path = require('path')

const fp = path.join(__dirname, 'app/components/dashboard/DashboardLayout.vue')
const lines = fs.readFileSync(fp, 'utf8').split('\n')

// Find Row 4 start (1-indexed line 299 = 0-indexed 298)
const startIdx = lines.findIndex(l => l.includes('Row 4'))
if (startIdx === -1) { console.error('Row 4 not found'); process.exit(1) }

// Find the closing </div> of the agenda block
// It is at indentation 8 spaces, after p v-else, within ~40 lines
let endIdx = -1
for (let i = startIdx + 30; i < startIdx + 50 && i < lines.length; i++) {
  if (/^\s{8}<\/div>/.test(lines[i])) { endIdx = i; break }
}
if (endIdx === -1) { console.error('End not found'); process.exit(1) }

console.log(`Replacing lines ${startIdx}-${endIdx} (0-indexed)`)
console.log(`Start: ${lines[startIdx]}`)
console.log(`End:   ${lines[endIdx]}`)

const newBlock = `        <!-- Row 4 — Upcoming agenda -->
        <div class="bg-card rounded-xl border border-border shadow-sm p-4 sm:p-5">
          <h3 class="text-base font-semibold text-foreground mb-4">
            {{ t('dashboard.agenda.title') }}
          </h3>
          <div v-if="agendaByDate.length" class="space-y-4">
            <div v-for="group in agendaByDate" :key="group.dateKey">
              <!-- Date header -->
              <div class="flex items-center gap-2 mb-2">
                <span class="text-xs font-semibold uppercase tracking-wide text-primary capitalize">
                  {{ group.dateLabel }}
                </span>
                <div class="flex-1 h-px bg-border" />
                <span class="text-[11px] text-muted-foreground shrink-0">
                  {{ group.items.length }} {{ group.items.length === 1 ? (t('dashboard.agenda.session') || 'sessione') : (t('dashboard.agenda.sessions') || 'sessioni') }}
                </span>
              </div>
              <!-- Items in this date group -->
              <div class="divide-y divide-border rounded-lg border border-border overflow-hidden">
                <div
                  v-for="(item, idx) in group.items"
                  :key="idx"
                  class="px-3 py-2.5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-1 sm:gap-4 bg-muted/20 hover:bg-muted/40 transition-colors"
                >
                  <div class="flex items-center gap-3">
                    <span class="text-xs font-mono text-muted-foreground tabular-nums shrink-0 w-11">
                      {{ new Date(item.scheduledAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }}
                    </span>
                    <div>
                      <p class="font-semibold text-sm text-foreground leading-tight">{{ item.athleteFullName }}</p>
                      <p class="text-xs text-muted-foreground">{{ item.sessionType }}</p>
                    </div>
                  </div>
                  <span
                    v-if="item.priority"
                    class="text-[11px] px-2 py-0.5 rounded-full font-medium shrink-0"
                    :class="{
                      'bg-red-100 text-red-700': item.priority === 'High',
                      'bg-yellow-100 text-yellow-700': item.priority === 'Medium',
                      'bg-green-100 text-green-700': item.priority === 'Low',
                    }"
                  >
                    {{ item.priority }}
                  </span>
                </div>
              </div>
            </div>
          </div>
          <p v-else class="text-sm text-muted-foreground text-center py-4">
            {{ t('dashboard.agenda.empty') }}
          </p>
        </div>`

const before = lines.slice(0, startIdx)
const after = lines.slice(endIdx + 1)
const result = [...before, ...newBlock.split('\n'), ...after].join('\n')
fs.writeFileSync(fp, result, 'utf8')
console.log('Done. New total lines:', result.split('\n').length)
