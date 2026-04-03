/// <reference path="./client.d.ts" />

import { useErrorHandler } from '~/composables/useErrorHandler'
import api from './client-optimized'

export async function safeGet<T = any>(url: string, params?: Record<string, any>) {
  const handler = useErrorHandler({ component: 'http' })
  try {
    const res = await api.get<T>(url, { params })
    return res.data as unknown as T
  }
  catch (e) {
    handler.handleError(e instanceof Error ? e : new Error(String(e)))
    throw e
  }
}

export async function safePost<T = any>(url: string, body?: unknown) {
  const handler = useErrorHandler({ component: 'http' })
  try {
    const res = await api.post<T>(url, body)
    return res.data as unknown as T
  }
  catch (e) {
    handler.handleError(e instanceof Error ? e : new Error(String(e)))
    throw e
  }
}

export default {
  get: safeGet,
  post: safePost,
}
