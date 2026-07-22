export interface PaginationMeta {
  page: number;
  limit: number;
  totalRecords: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data: T;
  pagination?: PaginationMeta;
  timestamp: string;
}

export interface Farmer {
  id: string;
  code: string;
  name: string;
  email?: string;
  phone?: string;
  region: string;
  country: string;
  elevationM?: number;
  createdAt: string;
  bags?: CoffeeBag[];
  _count?: { bags: number };
}

export enum CoffeeVariety {
  ARABICA = 'ARABICA',
  ROBUSTA = 'ROBUSTA',
  TYPICA = 'TYPICA',
  BOURBON = 'BOURBON',
  GEISHA = 'GEISHA',
}

export enum BagStatus {
  HARVESTED = 'HARVESTED',
  IN_STORAGE = 'IN_STORAGE',
  MERGED = 'MERGED',
  EXPORTED = 'EXPORTED',
}

export interface CoffeeBag {
  id: string;
  bagCode: string;
  initialWeightKg: number;
  currentWeightKg: number;
  moisturePercent?: number;
  qualityScore?: number;
  variety: CoffeeVariety | 'ARABICA' | 'ROBUSTA' | 'TYPICA' | 'BOURBON' | 'GEISHA';
  status: BagStatus | 'HARVESTED' | 'IN_STORAGE' | 'MERGED' | 'EXPORTED';
  farmerId?: string;
  farmer?: Farmer;
  createdAt: string;
}

export interface FarmerAttribution {
  farmerId: string;
  farmerCode: string;
  farmerName: string;
  region: string;
  country: string;
  initialBagCode: string;
  contributedWeightKg: number;
  contributionPercentage: number;
}

export interface TraceGraphNode {
  id: string;
  bagCode: string;
  initialWeightKg: number;
  currentWeightKg: number;
  status: string;
  variety: string;
  qualityScore?: number | null;
  farmerId?: string | null;
  farmerName?: string | null;
  farmerRegion?: string | null;
  depth: number;
}

export type GraphNode = TraceGraphNode;

export interface TraceGraphEdge {
  id: string;
  sourceBagId: string;
  targetBagId: string;
  weightUsedKg: number;
}

export interface TraceabilityResult {
  targetBag: {
    id: string;
    bagCode: string;
    currentWeightKg: number;
    initialWeightKg: number;
    status: string;
    variety: string;
    qualityScore?: number | null;
    moisturePercent?: number | null;
  };
  totalOriginFarmersCount: number;
  farmerAttributions: FarmerAttribution[];
  graphNodes: TraceGraphNode[];
  graphEdges: TraceGraphEdge[];
}

export interface DashboardSummary {
  totalFarmers: number;
  totalCoffeeBags: number;
  totalCoffeeVolumeKg: number;
  totalMergedVolumeKg: number;
  activeStorageBagsCount: number;
  varietyBreakdown: { variety: string; count: number; volumeKg: number }[];
}
