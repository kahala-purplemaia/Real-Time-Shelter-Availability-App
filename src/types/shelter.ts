export interface Shelter {
  id: string;
  name: string;
  total_beds: number;
  available_beds: number;
  allows_pets: boolean;
  requires_sobriety: boolean;
  accepts_families: boolean;
  contact_phone: string;
  contact_email: string;
  address: string;
  latitude: number;
  longitude: number;
  last_updated: string;
  updated_by: string;
  created_at: string;
}

export interface ShelterUpdate {
  available_beds?: number;
  allows_pets?: boolean;
  requires_sobriety?: boolean;
  accepts_families?: boolean;
}