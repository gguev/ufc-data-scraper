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

export interface EventInfo {
  name: string
  headline?: string
  date: string
  slug: string
}

export interface Event {
  event: EventInfo
  mainCard: StartTime
  prelim: StartTime
  location: Location
}
