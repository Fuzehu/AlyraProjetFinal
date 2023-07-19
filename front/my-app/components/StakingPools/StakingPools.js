"use client"

import React from 'react'
import StakingPoolID1 from './StakingPoolsID1';
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
            {isConnected ? <StakingPoolID1 /> : <NotConnected />}
        </Box>
    )
}

export default MyVines