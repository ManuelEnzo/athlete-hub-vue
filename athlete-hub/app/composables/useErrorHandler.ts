/**
 * 🛡️ ERROR HANDLER COMPOSABLE
 *
 * Centralizza gestione errori con:
 * - Mapping errori API
 * - Notifiche automatiche
 * - Logging e tracking
 * - Recovery suggestions
 *
 * Save as: app/composables/useErrorHandler.ts
 */

import { t } from '~/lib/i18n-client'
import { DataServiceError } from '~/services/dataService'
import { useNotificationStore } from '~/stores/notificationStore'

interface ErrorContext {
  component?: string
  action?: string
  data?: Record<string, any>
}

function useErrorHandler(context?: ErrorContext) {
  const notifications = useNotificationStore()

  /**
   * Mappa codici errore a messaggi user-friendly
   */
  const getErrorMessage = (error: Error | DataServiceError): {
    title: string
    message: string
    recovery?: string
  } => {
    if (error instanceof DataServiceError) {
      switch (error.code) {
        case 'NETWORK_ERROR':
          return {
            title: t('errorTitles.network'),
            message: t('errorMessages.network'),
            recovery: t('errorMessages.networkRecovery'),
          }
        case 'UNAUTHORIZED':
          return {
            title: t('errorTitles.unauthorized'),
            message: t('errorMessages.unauthorized'),
            recovery: t('errorMessages.unauthorizedRecovery'),
          }
        case 'NOT_FOUND':
          return {
            title: t('errorTitles.notFound'),
            message: t('errorMessages.notFound'),
            recovery: t('errorMessages.notFoundRecovery'),
          }
        case 'VALIDATION_ERROR':
          return {
            title: t('errorTitles.validation'),
            message: error.message,
            recovery: t('errorMessages.validationRecovery'),
          }
        case 'API_ERROR':
          return {
            title: t('errorTitles.api'),
            message: error.message || t('errorMessages.api'),
            recovery: t('errorMessages.apiRecovery'),
          }
        default:
          return {
            title: t('errorTitles.unknown'),
            message: error.message || t('errorMessages.unknown'),
            recovery: t('errorMessages.unknownRecovery'),
          }
      }
    }

    // Generic Error
    return {
      title: 'Errore',
      message: error.message || 'Qualcosa è andato storto',
      recovery: 'Riprova',
    }
  }

  /**
   * Handle e mostra errore con notifica
   */
  const handleError = (error: Error | DataServiceError, autoNotify: boolean = true) => {
    const { title, message, recovery } = getErrorMessage(error)

    // Log error
    console.error('[ErrorHandler]', {
      context,
      title,
      message,
      error,
    })

    // Show notification
    if (autoNotify) {
      notifications.error(title, `${message}${recovery ? `. ${recovery}` : ''}`)
    }

    return { title, message, recovery }
  }

  /**
   * Wrap async function con error handling
   */
  const withErrorHandling = async <T>(
    fn: () => Promise<T>,
    onError?: (error: Error | DataServiceError) => void,
  ): Promise<T | null> => {
    try {
      return await fn()
    }
    catch (error) {
      const err = error instanceof Error ? error : new Error(String(error))
      handleError(err)
      onError?.(err)
      return null
    }
  }

  /**
   * Track error for analytics
   */
  const trackError = (error: Error | DataServiceError) => {
    // Integration point for Sentry, DataDog, etc.
    if (import.meta.env.PROD) {
      // Example: Sentry.captureException(error)
      console.warn('[Analytics]', {
        error: error.message,
        context,
        timestamp: new Date().toISOString(),
      })
    }
  }

  return {
    getErrorMessage,
    handleError,
    withErrorHandling,
    trackError,
  }
}

export { useErrorHandler }
