"use client"

import React from 'react'
import NotConnected from '../NotConnected/NotConnected'
import PropertyList from './PropertyList/PropertyList'

//CHAKRA UI
import { Box, Flex, Text } from '@chakra-ui/react'

// WAGMI
import { useAccount } from 'wagmi';

const AllPropertiesIndex = () => {

    // Get logged wallet infos
    const { isConnected } = useAccount()

    return (
        <Box flexGrow={1} minHeight="100vh" display="flex" flexDirection="column">
            {isConnected ? <PropertyList /> : <NotConnected />}
        </Box>
    )
}

export default AllPropertiesIndex