import { ref } from 'vue'

export function useToggle(initial = false) {
  const state = ref<boolean>(initial)
  function toggle() {
    state.value = !state.value
  }
  function set(value: boolean) {
    state.value = value
  }
  function on() { set(true) }
  function off() { set(false) }
  return { state, toggle, set, on, off }
}

export default useToggle
