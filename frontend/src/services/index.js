// Tat ca goi API dat o day (chua noi vao UI - hien tai app dung mock data trong src/data).
// Khi backend san sang, thay data mock bang cac ham nay.
import { http } from './http'

export const healthApi = {
  // /health nam ngoai /api/v1 nen Nginx/Vite proxy rieng neu can
  ping: () => fetch('/health').then(r => r.json()),
}

export const recipesApi = {
  list: () => http('/recipes'),
  get: id => http('/recipes/' + id),
}