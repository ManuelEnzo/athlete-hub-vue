// middleware/auth.global.ts
export default defineNuxtRouteMiddleware((to) => {
  const authStore = useAuthStore()
  
  // Forza la lettura del cookie direttamente, per evitare stati "fantasma" di Pinia
  const token = useCookie('auth_token').value
  console.log("Middleware entrato con token" + token);

  const isPublicPage = ['/login', '/register'].includes(to.path)

  console.log(`MIDDLEWARE: Navigo verso ${to.path} | Token presente: ${!!token}`)

  // 1. Se NON c'è il token e la pagina NON è pubblica -> Blocca e vai al login
  if (!token && !isPublicPage) {
    console.warn("Accesso negato: Reindirizzamento al login")
    return navigateTo('/login')
  }

  // 2. Se C'È il token e l'utente prova ad andare su login/register -> Vai alla home
  if (token && isPublicPage) {
    return navigateTo('/')
  }
})