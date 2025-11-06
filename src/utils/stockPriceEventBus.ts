// src/utils/stockPriceEventBus.ts

type EventCallback = (data?: any) => void

interface Events {
  'price:fetched': { casablancaApiId: string; price: number; timestamp: string }
  'price:refresh': void
  'transaction:created': { symbol: string; transactionType: 'BUY' | 'SELL' }
  'portfolio:updated': void
}

class StockPriceEventBus {
  private events: Map<keyof Events, EventCallback[]> = new Map()

  /**
   * S'abonner à un événement
   */
  on<K extends keyof Events>(event: K, callback: (data: Events[K]) => void): () => void {
    if (!this.events.has(event)) {
      this.events.set(event, [])
    }
    
    const callbacks = this.events.get(event)!
    callbacks.push(callback as EventCallback)

    console.log(`📡 [EventBus] Subscribed to '${event}' (${callbacks.length} listeners)`)

    // Retourner une fonction de désabonnement
    return () => {
      const callbacks = this.events.get(event)
      if (callbacks) {
        const index = callbacks.indexOf(callback as EventCallback)
        if (index > -1) {
          callbacks.splice(index, 1)
          console.log(`📡 [EventBus] Unsubscribed from '${event}' (${callbacks.length} listeners remaining)`)
        }
      }
    }
  }

  /**
   * Émettre un événement
   */
  emit<K extends keyof Events>(event: K, data?: Events[K]): void {
    const callbacks = this.events.get(event)
    
    if (!callbacks || callbacks.length === 0) {
      console.log(`📡 [EventBus] No listeners for '${event}'`)
      return
    }

    console.log(`📡 [EventBus] Emitting '${event}' to ${callbacks.length} listeners`, data)
    
    callbacks.forEach(callback => {
      try {
        callback(data)
      } catch (error) {
        console.error(`❌ [EventBus] Error in '${event}' callback:`, error)
      }
    })
  }

  /**
   * Se désabonner de tous les événements
   */
  clear(): void {
    this.events.clear()
    console.log(`📡 [EventBus] All events cleared`)
  }
}

// Export d'une instance singleton
export const stockPriceEventBus = new StockPriceEventBus()