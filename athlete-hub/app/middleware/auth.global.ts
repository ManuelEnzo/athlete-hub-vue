export default defineNuxtRouteMiddleware((to) => {
  const token = useCookie('auth_token').value

  const requiresAuth = to.meta.auth !== false
  const guestOnly = to.meta.guestOnly === true

  // 🔒 Pagina protetta
  if (requiresAuth && !token) {
    return navigateTo('/login')
  }

  // 🚫 Login / Register se già loggato
  if (guestOnly && token) {
    return navigateTo('/')
  }
})
