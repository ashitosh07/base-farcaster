import { getDefaultConfig } from '@rainbow-me/rainbowkit';
import { base, baseSepolia } from 'wagmi/chains';

export const config = getDefaultConfig({
  appName: 'FlexCard',
  projectId: import.meta.env.VITE_WALLETCONNECT_PROJECT_ID || 'flexcard-project-id',
  chains: [base, baseSepolia],
  ssr: false,
});