// Block content types
export interface WifiBlockContent {
  ssid: string;
  password: string;
}

export interface MapBlockContent {
  address: string;
  latitude: number;
  longitude: number;
  description?: string;
}

export interface CheckinBlockContent {
  checkinTime: string; // "15:00"
  checkoutTime: string; // "11:00"
  instructions?: string;
}

export interface RecommendationBlockContent {
  places: {
    name: string;
    category: 'restaurant' | 'cafe' | 'attraction' | 'other';
    description?: string;
    address?: string;
    latitude?: number;
    longitude?: number;
    imageUrl?: string;
  }[];
}

export interface CustomBlockContent {
  body: string; // Markdown or HTML
}

export type BlockContent =
  | WifiBlockContent
  | MapBlockContent
  | CheckinBlockContent
  | RecommendationBlockContent
  | CustomBlockContent;

// API Response types
export interface ApiResponse<T> {
  data: T;
  error?: never;
}

export interface ApiError {
  data?: never;
  error: {
    code: string;
    message: string;
  };
}

export type ApiResult<T> = ApiResponse<T> | ApiError;
