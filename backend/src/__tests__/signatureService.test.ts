import { signDocument, getCircuitState } from '../services/signatureService'

describe('signatureService', () => {
  it('retourne une signature pour un documentId valide', async () => {
    const sig = await signDocument('test-doc-123')
    expect(sig).toMatch(/^SIG-test-doc-123-\d+$/)
  }, 15000)

  it('getCircuitState retourne un état valide', () => {
    const state = getCircuitState()
    expect(['CLOSED', 'OPEN', 'HALF_OPEN']).toContain(state)
  })
})