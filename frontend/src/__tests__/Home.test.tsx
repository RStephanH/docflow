import { render, screen } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import { MemoryRouter } from 'react-router-dom'
import Home from '../pages/Home'

// Mock de l'API
vi.mock('../api/documents', () => ({
  login: vi.fn(),
  generateDocument: vi.fn(),
  downloadDocument: vi.fn(),
}))

describe('Home', () => {
  it('affiche la page de login quand non connecté', () => {
    localStorage.clear()
    render(<MemoryRouter><Home /></MemoryRouter>)
    expect(screen.getByText('DocFlow')).toBeInTheDocument()
    expect(screen.getByText('Connexion admin')).toBeInTheDocument()
  })

  it('affiche le bouton de connexion admin', () => {
    localStorage.clear()
    render(<MemoryRouter><Home /></MemoryRouter>)
    const btn = screen.getByRole('button', { name: /connexion admin/i })
    expect(btn).toBeInTheDocument()
  })
})