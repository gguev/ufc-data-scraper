export class ScrapingError extends Error {
  readonly context?: Record<string, unknown>;

  constructor(message: string, context?: Record<string, unknown>) {
    super(message);
    this.name = "ScrapingError";
    this.context = context;
  }
}

export class ValidationError extends Error {
  readonly parameter?: string;

  constructor(message: string, parameter?: string) {
    super(message);
    this.name = "ValidationError";
    this.parameter = parameter;
  }
}

export class NetworkError extends Error {
  readonly url?: string;
  readonly statusCode?: number;

  constructor(message: string, url?: string, statusCode?: number) {
    super(message);
    this.name = "NetworkError";
    this.url = url;
    this.statusCode = statusCode;
  }
}
