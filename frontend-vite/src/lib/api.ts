import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export interface PinRequest {
  image: string;
  metadata: object;
}

export interface PinResponse {
  cid: string;
  tokenURI: string;
}

export interface MintRequest {
  to: string;
  tokenURI: string;
  templateId: string;
  pricePaid?: string;
}

export interface MintResponse {
  txHash: string;
  tokenId: string;
}

export interface StatsResponse {
  totalMints: number;
  activeUsers: number;
  templates: number;
}

export interface Template {
  id: string;
  name: string;
  description: string;
  price: number;
  animated: boolean;
  premium: boolean;
  features: string[];
  preview: string;
}

export const apiClient = {
  async pinToIPFS(request: PinRequest): Promise<PinResponse> {
    const response = await api.post('/api/pin', request);
    return response.data.data;
  },

  async mintNFT(request: MintRequest): Promise<MintResponse> {
    const response = await api.post('/api/mint', request);
    return response.data.data;
  },

  async getStats(): Promise<StatsResponse> {
    const response = await api.get('/api/stats');
    return response.data.data;
  },

  async getTemplates(): Promise<Template[]> {
    const response = await api.get('/api/templates');
    return response.data.data;
  },
};