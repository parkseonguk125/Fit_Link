export type PlaceAddress = {
  state?: string;
  city?: string;
  borough?: string;
  county?: string;
  city_district?: string;
  suburb?: string;
  town?: string;
  village?: string;
  road?: string;
};

export type PlaceResult = {
  id: string;
  name: string;
  region: string;
  gymName: string;
  addressLabel: string;
  lat: number;
  lon: number;
};

export type NominatimSearchItem = {
  place_id: number;
  lat: string;
  lon: string;
  name?: string;
  display_name: string;
  type?: string;
  class?: string;
  address?: PlaceAddress;
};

export type NominatimReverseResult = {
  place_id: number;
  lat: string;
  lon: string;
  name?: string;
  display_name: string;
  address?: PlaceAddress;
};
