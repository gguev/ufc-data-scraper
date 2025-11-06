export interface StartTime {
  dateTime: string | null
  unix: number | null
}

export interface Location {
  venue: string
  locality: string | null
  administrativeArea: string | null
  country: string | null
}

export interface Event {
  eventName: string
  headline: string
  mainCard: StartTime
  prelim: StartTime
  slug: string
  location: Location
}
