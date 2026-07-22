export interface PaginationParams {
  page: number;
  limit: number;
}

export interface PaginatedResult<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    totalRecords: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
}

export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data: T;
  pagination?: PaginatedResult<unknown>['pagination'];
  timestamp: string;
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
  recentActivity: {
    id: string;
    type: 'BAG_CREATED' | 'BAG_MERGED';
    bagCode: string;
    details: string;
    timestamp: Date;
  }[];
}
