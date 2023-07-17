import React, { useState, useEffect} from 'react'
// CHAKRA-UI
import { Heading, Flex, Text, Input, Button, useToast } from '@chakra-ui/react'
// CONTRACT
import { ethers } from "ethers"
// WAGMI
import { prepareWriteContract, writeContract, readContract } from '@wagmi/core'
import { useAccount } from 'wagmi'
// VIEM (events)
import { createPublicClient, http, parseAbiItem } from 'viem'
import { hardhat, sepolia } from 'viem/chains'




const ERC1155Admin = () => {


    /*// CREATE VIEM CLIENT (events)
    const client = createPublicClient({
      chain: hardhat,
      transport: http(),
    })*/








    return (
        <div>
            ERC1155 Admin Panel
        </div>
    )
}

export default ERC1155Admin
