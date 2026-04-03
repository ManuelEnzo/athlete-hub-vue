<script setup lang="ts">
import type { BulletLegendItemInterface } from '@unovis/ts'
import type { Component } from 'vue'
import { omit } from '@unovis/ts'
import { VisCrosshair, VisTooltip } from '@unovis/vue'

const props = withDefaults(defineProps<{
  colors?: string[]
  index: string
  items: BulletLegendItemInterface[]
  customTooltip?: Component
}>(), {
  colors: () => [],
})

function escapeHtml(str: string) {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;')
}

// Use weakmap to store reference to each datapoint for Tooltip
const wm = new WeakMap()
function template(d: any) {
  if (!import.meta.client)
    return ''
  if (wm.has(d)) {
    return wm.get(d)
  }
  else {
    const omittedData = Object.entries(omit(d, [props.index])).map(([key, value]) => {
      const legendReference = props.items.find(i => i.name === key)
      return { ...legendReference, value }
    })
    const title = escapeHtml(String(d[props.index] ?? ''))
    const list = omittedData.map(item => `<li><strong>${escapeHtml(String(item.name ?? ''))}</strong>: ${escapeHtml(String(item.value ?? ''))}</li>`).join('')
    const html = `<div class=\"ah-tooltip\"><div class=\"ah-tooltip-title\">${title}</div><ul>${list}</ul></div>`
    wm.set(d, html)
    return html
  }
}

function color(d: unknown, i: number) {
  return props.colors[i] ?? 'transparent'
}
</script>

<template>
  <VisTooltip :horizontal-shift="20" :vertical-shift="20" />
  <VisCrosshair :template="template" :color="color" />
</template>
