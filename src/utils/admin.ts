export function isAdmin() {
  try {
    return localStorage.getItem('isAdmin') === 'true'
  } catch {
    return false
  }
}
