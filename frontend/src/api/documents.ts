import axios from 'axios'

const API = axios.create({
  baseURL: '',
})

// Injecte le token JWT automatiquement
API.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

export interface Document {
  _id: string
  title: string
  content: string
  fileId?: string        // ← AJOUT
  createdAt: string
}

// ← AJOUT — réponse de /generate avec GridFS
export interface GeneratedDocument {
  id: string
  title: string
  fileId: string
  createdAt: string
  downloadUrl: string
}

export interface PaginatedDocuments {
  docs: Document[]
  total: number
  page: number
  totalPages: number
}

export interface Metrics {
  totalDocs: number
  totalErrors: number
  uptime: number
  dbStatus: string
  avgGenerationMs: number
  circuitBreaker: string
}

export const login = async (email: string, password: string) => {
  const { data } = await API.post('/auth/login', { email, password })
  localStorage.setItem('token', data.token)
  return data
}

export const logout = () => localStorage.removeItem('token')

// ← MODIFIÉ — retourne les métadonnées au lieu d'un Blob
export const generateDocument = async (title: string, content: string): Promise<GeneratedDocument> => {
  const { data } = await API.post('/api/documents/generate', { title, content })
  return data
}

// ← AJOUT — télécharge le PDF via GridFS
export const downloadDocument = async (id: string, title: string): Promise<void> => {
  const { data } = await API.get(`/api/documents/${id}/download`, {
    responseType: 'blob'
  })
  const url = URL.createObjectURL(data)
  const a = document.createElement('a')
  a.href = url
  a.download = `${title}.pdf`
  a.click()
  URL.revokeObjectURL(url)
}

export const getDocuments = async (page = 1, limit = 10): Promise<PaginatedDocuments> => {
  const { data } = await API.get(`/api/documents?page=${page}&limit=${limit}`)
  return data
}

export const getMetrics = async (): Promise<Metrics> => {
  const { data } = await API.get('/api/metrics')
  return data
}