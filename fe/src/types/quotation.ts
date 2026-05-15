// ============ Motor Quote Input ============
export interface MotorQuoteInput {
  // Vehicle information
  vehicle_type: 'car' | 'motorcycle' | 'truck' | 'bus';
  vehicle_brand: string;
  vehicle_model: string;
  vehicle_year: number;
  license_plate: string;
  engine_capacity: number;
  vehicle_value: number;
  seats: number;
  usage: 'personal' | 'commercial' | 'taxi';

  // Owner information
  owner_name: string;
  owner_id_number?: string;
  owner_phone?: string;

  // Coverage options
  coverage_type: 'tnds' | 'comprehensive' | 'both';
  coverage_duration: number; // 12, 24, 36
  additional_coverage?: {
    passenger_accident?: boolean;
    flood_damage?: boolean;
    scratch_damage?: boolean;
    theft?: boolean;
  };

  // Discount factors
  no_claims_years?: number;
  has_garage?: boolean;
  has_dashcam?: boolean;
}

// ============ Quick Quote Response ============
export interface QuickQuoteResponse {
  premium: {
    base: number;
    discount: number;
    tax: number;
    total: number;
  };
  premium_breakdown: {
    tnds_premium: number;
    comprehensive_premium: number;
    additional_premium: number;
    subtotal: number;
    discount_amount: number;
    vat: number;
    total: number;
  };
  coverage_details: CoverageDetail[];
  valid_until: string;
}

export interface CoverageDetail {
  name: string;
  description: string;
  coverage_amount: number;
  premium: number;
}

// ============ Multi-Insurer Quote Response ============
export interface MultiInsurerQuoteResponse {
  quotes: InsurerQuote[];
  total_quotes: number;
  errors?: Array<{ insurer_code: string; error: string }>;
  vehicle: {
    type: string;
    brand: string;
    model: string;
    year: number;
    value: number;
  };
  coverage: {
    type: string;
    duration: number;
    additional?: Record<string, boolean>;
  };
}

export interface InsurerQuote {
  insurer: {
    code: string;
    name: string;
    rating: number;
    features: string[];
  };
  product_name: string;
  premium: {
    base: number;
    discount: number;
    tax: number;
    total: number;
  };
  premium_breakdown: Array<{
    item: string;
    amount: number;
  }>;
  coverage_details: Array<{
    name: string;
    sum_insured: number;
    description?: string;
  }>;
  valid_until: string;
  quote_ref?: string;
}

// ============ Quote Form State ============
export type QuoteStep = 'vehicle' | 'coverage' | 'owner' | 'comparison';

export interface VehicleBrand {
  name: string;
  models: string[];
}

export const VEHICLE_BRANDS: Record<string, VehicleBrand[]> = {
  car: [
    { name: 'Toyota', models: ['Vios', 'Camry', 'Corolla Cross', 'Fortuner', 'Innova', 'Land Cruiser', 'Yaris'] },
    { name: 'Honda', models: ['City', 'Civic', 'CR-V', 'HR-V', 'Accord', 'BR-V'] },
    { name: 'Hyundai', models: ['Accent', 'Tucson', 'Santa Fe', 'Creta', 'Stargazer', 'i10'] },
    { name: 'Kia', models: ['Morning', 'Seltos', 'Sportage', 'Sorento', 'Carnival', 'K3', 'K5'] },
    { name: 'Mazda', models: ['Mazda2', 'Mazda3', 'Mazda6', 'CX-3', 'CX-5', 'CX-8'] },
    { name: 'VinFast', models: ['VF3', 'VF5', 'VF6', 'VF7', 'VF8', 'VF9', 'Fadil', 'Lux A', 'Lux SA'] },
    { name: 'Mercedes-Benz', models: ['C-Class', 'E-Class', 'S-Class', 'GLC', 'GLE', 'A-Class'] },
    { name: 'BMW', models: ['3 Series', '5 Series', '7 Series', 'X1', 'X3', 'X5'] },
    { name: 'Ford', models: ['Ranger', 'Everest', 'Territory', 'Explorer'] },
    { name: 'Mitsubishi', models: ['Xpander', 'Outlander', 'Pajero Sport', 'Attrage'] },
  ],
  motorcycle: [
    { name: 'Honda', models: ['Wave', 'Vision', 'Air Blade', 'SH', 'Lead', 'Winner X', 'CB150R'] },
    { name: 'Yamaha', models: ['Exciter', 'NVX', 'Janus', 'Grande', 'Sirius', 'MT-15', 'R15'] },
    { name: 'Suzuki', models: ['Raider', 'GSX-R150', 'Satria', 'Address'] },
    { name: 'Piaggio', models: ['Vespa', 'Liberty', 'Medley'] },
  ],
  truck: [
    { name: 'Hyundai', models: ['HD65', 'HD72', 'HD120', 'Mighty', 'New Mighty'] },
    { name: 'Isuzu', models: ['QKR', 'NMR', 'NPR', 'FRR', 'FVM'] },
    { name: 'Hino', models: ['300', '500', '700'] },
    { name: 'Thaco', models: ['Ollin', 'Aumark', 'Auman'] },
  ],
  bus: [
    { name: 'Hyundai', models: ['County', 'Universe', 'Aero City'] },
    { name: 'Thaco', models: ['Town', 'Meadow', 'Garden'] },
    { name: 'Samco', models: ['Felix', 'Primas', 'Growin'] },
  ],
};
