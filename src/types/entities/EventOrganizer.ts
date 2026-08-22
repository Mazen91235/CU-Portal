export type EventOrganizer = {
  id?: number;
  name?: string;
  logo?: string;
  attached_links?: string[];
  events_count?: number;
  total_attendees?: number;
  created_at?: string | null;
  modified_at?: string | null;
};
