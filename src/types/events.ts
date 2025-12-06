export type StartTime = {
  dateTime: string | null;
  unix: number | null;
};

export type Location = {
  venue: string;
  locality: string | null;
  administrativeArea: string | null;
  country: string | null;
};

export type EventInfo = {
  name: string;
  headline?: string;
  date: string;
  slug: string;
};

export type Event = {
  event: EventInfo;
  mainCard: StartTime;
  prelim: StartTime;
  location: Location;
};

export type EventList = Event[];
