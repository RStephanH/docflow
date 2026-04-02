import { recordGeneration, recordError } from '../routes/metrics'

describe('metrics', () => {
  it('recordGeneration incrémente sans erreur', () => {
    expect(() => recordGeneration(100)).not.toThrow()
    expect(() => recordGeneration(250)).not.toThrow()
  })

  it('recordError incrémente sans erreur', () => {
    expect(() => recordError()).not.toThrow()
  })
})