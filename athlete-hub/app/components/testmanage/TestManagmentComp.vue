<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { PlusCircle, Loader2, Trash2, Pencil, Ruler, Save, Hash, Type } from 'lucide-vue-next'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select'
import { athleteApi } from '~/api/business'
import type { TestDefinitionDto, TestManagementCreateRequest } from '~/types/api'
import { toast } from 'vue-sonner'

const { t } = useI18n()

// --- State ---
const tests = ref<TestDefinitionDto[]>([])
const loading = ref(false)
const isFormVisible = ref(false)
const editingId = ref<number | null>(null)

// --- Form State (Tutto in camelCase per TS) ---
const form = ref<TestManagementCreateRequest>({
  name: '',
  description: '',
  metrics: []
})

// Caricamento dati
async function fetchTests() {
  loading.value = true
  try {
    const res = await athleteApi.testDefGetAllDefinitions()
    if (res.data.isSuccess) {
      tests.value = res.data.value ?? []
    }
  } catch (err) {
    toast.error(t('common.error'))
  } finally {
    loading.value = false
  }
}

// Gestione Metriche
function addMetric() {
  form.value.metrics.push({
    id: 0,
    name: '',
    unit: '',
    dataType: 0,
    standardValue: null,
    normativeDataRef: '',
    formula: ''
  })
}

function removeMetric(index: number) {
  form.value.metrics.splice(index, 1)
}

// Gestione Form
function resetForm() {
  form.value = { name: '', description: '', metrics: [] }
  editingId.value = null
  isFormVisible.value = false
}

async function saveTest() {
  if (!form.value.name || form.value.metrics.length === 0) {
    toast.error(t('tests.validationError'))
    return
  }

  try {
    let res;
    if (editingId.value) {
      res = await athleteApi.testDefUpdate(editingId.value, form.value)
    } else {
      res = await athleteApi.testDefCreate(form.value)
    }

    if (res.data.isSuccess) {
      toast.success(t('tests.saveSuccess'))
      resetForm()
      fetchTests()
    }
  } catch (err) {
    toast.error(t('common.error'))
  }
}

function editTest(test: TestDefinitionDto) {
  editingId.value = test.id
  form.value = {
    name: test.name,
    description: test.description ?? '',
    metrics: test.metrics.map(m => ({ ...m }))
  }
  isFormVisible.value = true
}

async function deleteTest(id: number) {
  if (!confirm(t('tests.deleteConfirm'))) return
  try {
    const res = await athleteApi.testDefDelete(id)
    if (res.data.isSuccess) {
      toast.success(t('common.success'))
      fetchTests()
    }
  } catch (err) {
    toast.error(t('common.error'))
  }
}

onMounted(fetchTests)
</script>

<template>
  <div class="min-h-screen">
    <div class="flex flex-wrap items-center justify-between pb-6 gap-4">
      <div>
        <h2 class="text-2xl font-bold tracking-tight">{{ t('tests.pageTitle') }}</h2>
        <p class="text-sm text-muted-foreground italic">Configura i protocolli e definisci le metriche di input.</p>
      </div>

      <Button :variant="isFormVisible ? 'secondary' : 'default'" @click="isFormVisible ? resetForm() : isFormVisible = true">
        <PlusCircle v-if="!isFormVisible" class="h-4 w-4 mr-2" />
        {{ isFormVisible ? t('common.cancel') : t('tests.newTest') }}
      </Button>
    </div>

    <div v-if="isFormVisible" class="mb-8 animate-in fade-in slide-in-from-top-4 duration-200">
      <Card class="border-2 shadow-lg">
        <CardHeader>
          <CardTitle class="text-lg font-bold">
            {{ editingId ? t('tests.editTest') : t('tests.newTest') }}
          </CardTitle>
        </CardHeader>
        <CardContent class="space-y-6">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div class="space-y-2">
              <label class="text-xs font-bold uppercase text-muted-foreground">{{ t('tests.testName') }}</label>
              <Input v-model="form.name" placeholder="es. Prova di Salto" />
            </div>
            <div class="space-y-2">
              <label class="text-xs font-bold uppercase text-muted-foreground">{{ t('tests.description') }}</label>
              <Textarea v-model="form.description" rows="1" />
            </div>
          </div>

          <div class="space-y-4 pt-4 border-t">
            <div class="flex items-center justify-between">
              <h3 class="text-md font-semibold flex items-center gap-2">
                <Ruler class="h-4 w-4" /> {{ t('tests.metrics') }}
              </h3>
              <Button type="button" variant="outline" size="sm" @click="addMetric">
                <PlusCircle class="h-4 w-4 mr-2" /> {{ t('tests.addMetric') }}
              </Button>
            </div>

            <div v-if="form.metrics.length === 0" class="text-center py-6 border rounded-lg bg-muted/10 text-muted-foreground text-sm">
              Nessuna metrica definita. Aggiungi almeno un parametro (es. Tempo, Distanza).
            </div>

            <div v-for="(metric, index) in form.metrics" :key="index"
                 class="grid grid-cols-1 md:grid-cols-12 gap-3 p-4 border rounded-lg bg-card items-end shadow-sm">

              <div class="md:col-span-3 space-y-1">
                <label class="text-[10px] font-bold uppercase text-muted-foreground">{{ t('tests.metricName') }}</label>
                <Input v-model="metric.name" placeholder="es. Tempo" />
              </div>

              <div class="md:col-span-2 space-y-1">
                <label class="text-[10px] font-bold uppercase text-muted-foreground">{{ t('tests.unit') }}</label>
                <Input v-model="metric.unit" placeholder="s, cm, kg..." />
              </div>

              <div class="md:col-span-3 space-y-1">
                <label class="text-[10px] font-bold uppercase text-muted-foreground">{{ t('tests.dataType') }}</label>
                <Select v-model="metric.dataType">
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem :value="0">
                      <div class="flex items-center gap-2"><Hash class="h-3 w-3" /> Numero</div>
                    </SelectItem>
                    <SelectItem :value="1">
                      <div class="flex items-center gap-2"><Type class="h-3 w-3" /> Testo</div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div class="md:col-span-3 space-y-1">
                <label class="text-[10px] font-bold uppercase text-muted-foreground">{{ t('tests.standardValue') }}</label>
                <Input v-model="metric.standardValue" type="number" step="0.1" />
              </div>

              <div class="md:col-span-1 flex justify-end">
                <Button variant="ghost" size="icon" @click="removeMetric(index)" class="text-destructive hover:bg-destructive/10">
                  <Trash2 class="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>

          <div class="flex justify-end gap-2 pt-4">
            <Button variant="ghost" @click="resetForm">{{ t('common.cancel') }}</Button>
            <Button @click="saveTest">
              <Save class="h-4 w-4 mr-2" /> {{ t('common.save') }}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>

    <div v-if="loading" class="flex justify-center py-20">
      <Loader2 class="h-10 w-10 animate-spin text-primary" />
    </div>

    <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      <Card v-for="test in tests" :key="test.id" class="hover:border-primary/50 transition-colors shadow-sm">
        <CardHeader class="flex flex-row items-center justify-between pb-2">
          <CardTitle class="text-lg font-bold">{{ test.name }}</CardTitle>
          <div class="flex gap-1">
            <Button variant="ghost" size="icon" @click="editTest(test)">
              <Pencil class="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" @click="deleteTest(test.id)">
              <Trash2 class="h-4 w-4 text-destructive" />
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <p class="text-sm text-muted-foreground line-clamp-2 mb-4 h-10">{{ test.description }}</p>
          <div class="flex flex-wrap gap-1.5">
            <span v-for="m in test.metrics" :key="m.id"
                  class="px-2 py-0.5 rounded bg-primary/10 text-primary text-[10px] font-bold uppercase border border-primary/20">
              {{ m.name }} ({{ m.unit }})
            </span>
          </div>
        </CardContent>
      </Card>
    </div>
  </div>
</template>