export type RegionalPollingResponse = {
  code: string;
  name: string;
  coordinates: {
    lat: string;
    lng: string;
  };
  google_place_id: string;
};

export type PreviewQuery = {
  type: 'pickup' | 'delivery';
  bank: string;
  code?: string;
  quantity?: string;
  address?: string;
  carts?: string[];
};
