export class ScrapingError extends Error {
  constructor(message: string, public readonly context?: Record<string, unknown>) {
    super(message)
    this.name = 'ScrapingError'
  }
}

export class ValidationError extends Error {
  constructor(message: string, public readonly parameter?: string) {
    super(message)
    this.name = 'ValidationError'
  }
}

export class NetworkError extends Error {
  constructor(message: string, public readonly url?: string, public readonly statusCode?: number) {
    super(message)
    this.name = 'NetworkError'
  }
}
