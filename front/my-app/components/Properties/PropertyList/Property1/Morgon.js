"use client"
import React, { useState, useEffect } from 'react'
import { Box, Flex, Text } from '@chakra-ui/react'
import { useAccount } from 'wagmi';
import { ethers } from "ethers"


const MorgonContent = () => {
    const fundraiserContractAddress = process.env.NEXT_PUBLIC_TOKENIZE_CONTRACT_ADDRESS
    const tokenizeContractAddress2 = process.env.NEXT_PUBLIC_TOKENIZE_CONTRACT_ADDRESS
    const { isConnected, address } = useAccount()
    // States
    const [isAdmin, setIsAdmin] = useState(null)

  

    return (
        <Box flexGrow={1} minHeight="100vh" display="flex" flexDirection="column">
            MORGON TOKEN
        </Box>
    )
}

export default MorgonContent
