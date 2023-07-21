"use client"
import React, { useState, useEffect } from 'react'
import { Heading, Flex, Text, Input, Button, useToast, Box, UnorderedList, ListItem, Checkbox } from '@chakra-ui/react'
import FundRaiserContract from '../../../../public/artifacts/contracts/FundRaiser.sol/FundRaiser.json'
import TokenizeContract from '../../../../public/artifacts/contracts/Tokenize.sol/Tokenize.json'
import { ethers } from "ethers"
import { prepareWriteContract, writeContract, readContract } from '@wagmi/core'
import { useAccount } from 'wagmi'
import { createPublicClient, http, parseAbiItem } from 'viem'
import { hardhat, sepolia } from 'viem/chains'

const Fundraiser = () => {
    const fundraiserContractAddress = process.env.NEXT_PUBLIC_FUNDRAISER_CONTRACT_ADDRESS
    const tokenizeContractAddress = process.env.NEXT_PUBLIC_TOKENIZE_CONTRACT_ADDRESS
    const client = createPublicClient({
        chain: hardhat, sepolia,
        transport: http(),
    })
    const { isConnected, address } = useAccount()
    const toast = useToast()



    
  return (
    <div>
      Fundrazeeer admin bitches
    </div>
  )
}

export default Fundraiser
