import { recordError } from '../routes/metrics'

// --- Types ---
type CircuitState = 'CLOSED' | 'OPEN' | 'HALF_OPEN'

// --- Config ---
const MAX_RETRIES     = 3
const BACKOFF_BASE_MS = 200   // 200ms, 400ms, 800ms
const FAILURE_RATE    = 0.3   // 30% d'échecs simulés
const OPEN_TIMEOUT_MS = 10_000 // 10s avant de passer en HALF_OPEN

// --- État du circuit breaker (singleton en mémoire) ---
let state: CircuitState = 'CLOSED'
let failureCount  = 0
let lastFailureAt = 0
const FAILURE_THRESHOLD = 3  // 3 échecs consécutifs → OPEN

// --- Simulation API externe ---
const callExternalSignatureApi = async (documentId: string): Promise<string> => {
  // Simule une latence réseau
  await new Promise(r => setTimeout(r, 50 + Math.random() * 100))

  // Simule 30% d'échecs aléatoires
  if (Math.random() < FAILURE_RATE) {
    throw new Error('API signature externe indisponible')
  }

  return `SIG-${documentId}-${Date.now()}`
}

// --- Transition d'état du circuit breaker ---
const transitionTo = (next: CircuitState) => {
  console.log(`[CircuitBreaker] ${state} → ${next}`)
  state = next
}

// --- Logique circuit breaker ---
const callWithCircuitBreaker = async (documentId: string): Promise<string> => {
  // OPEN : vérifier si le timeout est écoulé
  if (state === 'OPEN') {
    if (Date.now() - lastFailureAt >= OPEN_TIMEOUT_MS) {
      transitionTo('HALF_OPEN')
    } else {
      throw new Error('[CircuitBreaker] Circuit OPEN — appel rejeté')
    }
  }

  try {
    const result = await callExternalSignatureApi(documentId)

    // Succès → reset
    if (state === 'HALF_OPEN') transitionTo('CLOSED')
    failureCount = 0

    return result
  } catch (err) {
    failureCount++
    lastFailureAt = Date.now()

    if (failureCount >= FAILURE_THRESHOLD) {
      transitionTo('OPEN')
    }

    throw err
  }
}

// --- Retry avec backoff exponentiel ---
const sleep = (ms: number) => new Promise(r => setTimeout(r, ms))

export const signDocument = async (documentId: string): Promise<string> => {
  let lastError: Error | null = null

  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
      console.log(`[Signature] Tentative ${attempt}/${MAX_RETRIES} pour doc ${documentId}`)
      const signature = await callWithCircuitBreaker(documentId)
      console.log(`[Signature] ✅ Succès à la tentative ${attempt}`)
      return signature

    } catch (err) {
      lastError = err as Error
      console.warn(`[Signature] ❌ Tentative ${attempt} échouée : ${lastError.message}`)

      // Ne pas attendre après la dernière tentative
      if (attempt < MAX_RETRIES) {
        const backoff = BACKOFF_BASE_MS * Math.pow(2, attempt - 1)
        console.log(`[Signature] Backoff ${backoff}ms avant tentative ${attempt + 1}`)
        await sleep(backoff)
      }
    }
  }

  recordError()
  throw new Error(`Signature échouée après ${MAX_RETRIES} tentatives : ${lastError?.message}`)
}

// --- Exposer l'état du circuit (pour /api/metrics) ---
export const getCircuitState = (): CircuitState => state