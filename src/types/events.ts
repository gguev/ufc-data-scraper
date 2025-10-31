export interface Event {
  eventName: string
  headline: string
  mainCard: {
    dateTime: string
    unix: number
  }
  prelim: {
    dateTime: string | null
    unix: number | null
  }
  slug: string
  location: {
    venue: string
    locality: string | null
    administrativeArea: string | null
    country: string | null
  }
}
