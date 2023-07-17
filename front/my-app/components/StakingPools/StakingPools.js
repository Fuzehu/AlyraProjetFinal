"use client"

import React from 'react'
import StakingPoolsContent from './StakingPoolsContent';
import NotConnected from '../NotConnected/NotConnected'

//CHAKRA UI
import { Box, Flex, Text } from '@chakra-ui/react'

// WAGMI
import { useAccount } from 'wagmi';

const MyVines = () => {

    // Get logged wallet infos
    const { isConnected } = useAccount()

    return (
        <Box flexGrow={1} minHeight="100vh" display="flex" flexDirection="column">
            {isConnected ? <StakingPoolsContent /> : <NotConnected />}
        </Box>
    )
}

export default MyVines