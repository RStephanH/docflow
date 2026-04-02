import { render, screen } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import { MemoryRouter } from 'react-router-dom'
import Dashboard from '../pages/Dashboard'

vi.mock('../api/documents', () => ({
  getDocuments: vi.fn().mockResolvedValue({ docs: [], total: 0, page: 1, totalPages: 1 }),
  getMetrics: vi.fn().mockResolvedValue({
    totalDocs: 0, totalErrors: 0, uptime: 100,
    dbStatus: 'connected', avgGenerationMs: 0, circuitBreaker: 'CLOSED'
  }),
  downloadDocument: vi.fn(),
}))

const mockNavigate = vi.fn()
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return { ...actual, useNavigate: () => mockNavigate }
})

describe('Dashboard', () => {
  it('affiche le titre Dashboard', async () => {
    render(<MemoryRouter><Dashboard /></MemoryRouter>)
    expect(screen.getByText('📊 Dashboard')).toBeInTheDocument()
  })

  it('affiche le message chargement initial', () => {
    render(<MemoryRouter><Dashboard /></MemoryRouter>)
    expect(screen.getByText('Chargement...')).toBeInTheDocument()
  })
})