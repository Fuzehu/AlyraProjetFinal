"use client"

import React from 'react'
import MyVinesContent from './MyVinesContent'
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
            {isConnected ? <MyVinesContent /> : <NotConnected />}
        </Box>
    )
}

export default MyVines