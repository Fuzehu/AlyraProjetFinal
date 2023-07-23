"use client"
import React, { useState, useEffect } from 'react'
import IsAdmin from './IsAdmin/IsAdmin'
import NotAdmin from './NotAdmin/NotAdmin'
import NotConnected from '../NotConnected/NotConnected'
import { Box } from '@chakra-ui/react'
import { useAccount } from 'wagmi'
import { hardhat, goerli } from 'viem/chains'
import { createPublicClient, http, parseAbiItem } from 'viem'
import { readContract } from '@wagmi/core';
import DiscountToken from '../../public/artifacts/contracts/DiscountToken.sol/DiscountToken.json'
import Tokenize from '../../public/artifacts/contracts/Tokenize.sol/Tokenize.json'
import StakingERC1155ID1 from '../../public/artifacts/contracts/StakingERC1155ID1.sol/StakingERC1155ID1.json'


const Admin = () => {

    // Contracts addresses
    const contractAddress1 = process.env.NEXT_PUBLIC_DISCOUNTTOKEN_CONTRACT_ADDRESS
    const contractAddress2 = process.env.NEXT_PUBLIC_TOKENIZE_CONTRACT_ADDRESS
    const contractAddress3 = process.env.NEXT_PUBLIC_STAKINGERC1155ID1_CONTRACT_ADDRESS
    const client = createPublicClient({
        chain: goerli, hardhat,
        transport: http(),
    })

    // Get logged wallet infos
    const { isConnected, address } = useAccount()

    // States
    const [isAdmin, setIsAdmin] = useState(null)

    useEffect(() => {

        const checkAdmin = async () => {

            const owner1 = await client.readContract({
                address: contractAddress1,
                abi: DiscountToken.abi,
                functionName: "owner",
                args: []
            });

            const owner2 = await client.readContract({
                address: contractAddress2,
                abi: Tokenize.abi,
                functionName: "owner",
                args: []
            });

            const owner3 = await client.readContract({
                address: contractAddress3,
                abi: StakingERC1155ID1.abi,
                functionName: "owner",
                args: []
            });

            const adminStatus = owner1 === address && owner2 === address && owner3 === address;
            setIsAdmin(adminStatus)
        }
        if (isConnected) {
            checkAdmin()
        } 
    }, [isConnected]);

    return (
        <Box flexGrow={1} minHeight="100vh" display="flex" flexDirection="column">
          {isConnected ? (
              isAdmin ? (
                  <IsAdmin />
              ) : ( 
                  <NotAdmin />
              )
          ) : (
              <NotConnected />
          )}
        </Box>
      )
    }

export default Admin

