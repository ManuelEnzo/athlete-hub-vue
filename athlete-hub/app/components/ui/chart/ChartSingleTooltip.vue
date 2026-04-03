<script setup lang="ts">
import type { BulletLegendItemInterface } from '@unovis/ts'
import type { Component } from 'vue'
import { omit } from '@unovis/ts'
import { VisTooltip } from '@unovis/vue'

const props = defineProps<{
  selector: string
  index: string
  items?: BulletLegendItemInterface[]
  valueFormatter?: (tick: number, i?: number, ticks?: number[]) => string
  customTooltip?: Component
}>()

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
function template(d: any, i: number, elements: (HTMLElement | SVGElement)[]) {
  if (!import.meta.client)
    return ''
  const valueFormatter = props.valueFormatter ?? ((tick: number) => `${tick}`)
  if (props.index in d) {
    if (wm.has(d)) {
      return wm.get(d)
    }
    else {
      const omittedData = Object.entries(omit(d, [props.index])).map(([key, value]) => {
        const legendReference = props.items?.find(i => i.name === key)
        return { ...legendReference, value: valueFormatter(value) }
      })
      const title = escapeHtml(String(d[props.index] ?? ''))
      const list = omittedData.map((item) => {
        const name = escapeHtml(String(item.name ?? ''))
        const value = escapeHtml(String(item.value ?? ''))
        const color = escapeHtml(String(item.color ?? ''))
        return `<li style="display:flex;gap:8px;align-items:center"><span style=\"width:10px;height:10px;background:${color};display:inline-block;border-radius:2px;margin-right:6px\"></span><strong>${name}</strong>: ${value}</li>`
      }).join('')

      const html = `<div class=\"ah-tooltip\"><div class=\"ah-tooltip-title\">${title}</div><ul class=\"ah-tooltip-list\">${list}</ul></div>`
      wm.set(d, html)
      return html
    }
  }

  else {
    const data = d.data

    if (wm.has(data)) {
      return wm.get(data)
    }
    else {
      const style = getComputedStyle(elements[i]!)
      const omittedData = [{ name: data.name, value: valueFormatter(data[props.index]), color: style.fill }]
      const title = escapeHtml(String(d[props.index] ?? ''))
      const list = omittedData.map((item) => {
        const name = escapeHtml(String(item.name ?? ''))
        const value = escapeHtml(String(item.value ?? ''))
        const color = escapeHtml(String(item.color ?? ''))
        return `<li style="display:flex;gap:8px;align-items:center"><span style=\"width:10px;height:10px;background:${color};display:inline-block;border-radius:2px;margin-right:6px\"></span><strong>${name}</strong>: ${value}</li>`
      }).join('')
      const html = `<div class="ah-tooltip"><div class="ah-tooltip-title">${title}</div><ul class="ah-tooltip-list">${list}</ul></div>`
      wm.set(d, html)
      return html
    }
  }
}
</script>

<template>
  <VisTooltip
    :horizontal-shift="20" :vertical-shift="20" :triggers="{
      [selector]: template,
    }"
  />
</template>
