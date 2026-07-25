import axios from 'axios';
import {
  ApiResponse,
  Farmer,
  CoffeeBag,
  TraceabilityResult,
  ForwardTraceResult,
  DashboardSummary,
  UpdateFarmerPayload,
} from '../types';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || '/api/v1',
  headers: {
    'Content-Type': 'application/json',
  },
});

export const fetchFarmers = async (page = 1, limit = 5, search = '') => {
  const { data } = await api.get<ApiResponse<Farmer[]>>('/farmers', {
    params: { page, limit, search },
  });
  return data;
};

export const createFarmer = async (farmerData: Partial<Farmer>) => {
  const { data } = await api.post<ApiResponse<Farmer>>('/farmers', farmerData);
  return data;
};

export const fetchFarmerById = async (idOrCode: string) => {
  const { data } = await api.get<ApiResponse<Farmer>>(`/farmers/${encodeURIComponent(idOrCode)}`);
  return data;
};

export const updateFarmer = async (idOrCode: string, farmerData: UpdateFarmerPayload) => {
  const { data } = await api.patch<ApiResponse<Farmer>>(
    `/farmers/${encodeURIComponent(idOrCode)}`,
    farmerData
  );
  return data;
};

export const deleteFarmer = async (idOrCode: string) => {
  const { data } = await api.delete<ApiResponse<null>>(`/farmers/${encodeURIComponent(idOrCode)}`);
  return data;
};

export const fetchBags = async (page = 1, limit = 5, status = '', search = '') => {
  const { data } = await api.get<ApiResponse<CoffeeBag[]>>('/bags', {
    params: { page, limit, status: status || undefined, search },
  });
  return data;
};

export const createBag = async (bagData: Partial<CoffeeBag>) => {
  const { data } = await api.post<ApiResponse<CoffeeBag>>('/bags', bagData);
  return data;
};

export type MergePayload = {
  targetBagCode: string;
  sources: { bagId: string; weightUsedKg?: number }[];
  variety?: string;
};

export const mergeBags = async (payload: MergePayload) => {
  const { data } = await api.post<ApiResponse<CoffeeBag>>('/bags/merge', payload);
  return data;
};

export const fetchBagTrace = async (bagIdOrCode: string) => {
  const { data } = await api.get<ApiResponse<TraceabilityResult>>(
    `/bags/${encodeURIComponent(bagIdOrCode)}/trace`
  );
  return data;
};

export const fetchBagForwardTrace = async (bagIdOrCode: string) => {
  const { data } = await api.get<ApiResponse<ForwardTraceResult>>(
    `/bags/${encodeURIComponent(bagIdOrCode)}/trace/forward`
  );
  return data;
};

export const fetchDashboardSummary = async () => {
  const { data } = await api.get<ApiResponse<DashboardSummary>>('/analytics/summary');
  return data;
};
