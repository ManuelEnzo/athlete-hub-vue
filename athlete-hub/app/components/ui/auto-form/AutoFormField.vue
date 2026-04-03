<script setup lang="ts" generic="U extends ZodAny">
import type { ZodAny } from 'zod'
import type { Config, ConfigItem, Shape } from './interface'
import { computed } from 'vue'
import { DEFAULT_ZOD_HANDLERS, INPUT_COMPONENTS } from './constant'
import useDependencies from './dependencies'

const props = defineProps<{
  fieldName: string
  shape: Shape
  config?: ConfigItem | Config<U>
}>()

function isValidConfig(config: any): config is ConfigItem {
  return !!config?.component
}

const delegatedProps = computed(() => {
  if (['ZodObject', 'ZodArray'].includes((props.shape as any)?.type))
    return { schema: (props.shape as any)?.schema }
  return undefined
})

const componentToUse = computed(() => {
  // Resolve configured component or pick from default handlers
  if (isValidConfig(props.config)) {
    if (typeof (props.config as any).component === 'string')
      return (INPUT_COMPONENTS as any)[(props.config as any).component]
    return (props.config as any).component
  }

  const handlerKey = (DEFAULT_ZOD_HANDLERS as any)[(props.shape as any).type]
  return (INPUT_COMPONENTS as any)[handlerKey]
})

const { isDisabled, isHidden, isRequired, overrideOptions } = useDependencies(props.fieldName)
</script>

<template>
  <component
    :is="componentToUse"
    v-if="!isHidden"
    :field-name="fieldName"
    :label="(shape as any).schema?.description"
    :required="isRequired || (shape as any).required"
    :options="overrideOptions || (shape as any).options"
    :disabled="isDisabled"
    :config="config"
    v-bind="delegatedProps"
  >
    <slot />
  </component>
</template>
