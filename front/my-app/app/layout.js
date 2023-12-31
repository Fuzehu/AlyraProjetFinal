"use client"
import './globals.css'
import { ChakraProvider } from '@chakra-ui/react'
import '@rainbow-me/rainbowkit/styles.css';
import {getDefaultWallets, RainbowKitProvider} from '@rainbow-me/rainbowkit';
import { alchemyProvider } from 'wagmi/providers/alchemy';
import { configureChains, createConfig, WagmiConfig } from 'wagmi';
import { hardhat, polygonMumbai, sepolia, goerli } from 'wagmi/chains';
import { publicProvider } from 'wagmi/providers/public';


const { chains, publicClient } = configureChains(
  [hardhat, goerli, sepolia, polygonMumbai],
  [
    alchemyProvider({ apiKey: process.env.NEXT_PUBLIC_ALCHEMY_ID_GOERLI }),
    publicProvider()
  ]
);

const { connectors } = getDefaultWallets({
  appName: 'My RainbowKit App',
  projectId: '486af15f855934361232339a1566082b',
  chains
});

const wagmiConfig = createConfig({
  autoConnect: false,
  connectors,
  publicClient
})

/*
export const metadata = {
  title: 'Create Next App',
  description: 'Generated by create next app',
}
*/

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <WagmiConfig config={wagmiConfig}>
          <RainbowKitProvider chains={chains}>
            <ChakraProvider>
              {children}
            </ChakraProvider>
          </RainbowKitProvider>
        </WagmiConfig>
      </body>
    </html>
  )
}