"use client"
import React, { useState, useEffect } from 'react'
import { Box, Flex, Text, Heading } from '@chakra-ui/react'
import { useAccount } from 'wagmi';
import { ethers } from "ethers"


const StEmilionContent = () => {
    const fundraiserContractAddress = process.env.NEXT_PUBLIC_TOKENIZE_CONTRACT_ADDRESS
    const tokenizeContractAddress2 = process.env.NEXT_PUBLIC_TOKENIZE_CONTRACT_ADDRESS
    const { isConnected, address } = useAccount()

    return (
        <Flex flexGrow={1} minHeight="100vh" direction="column" justifyContent="flex-start" alignItems="center">
            <Box p={5} bg="#F3F2FF" border="3px solid darkslateblue" borderRadius="lg" width="70%" mt={10}>
                <Heading color="darkslateblue" mb={4}>This component is for testing purposes only</Heading>
                <Text fontSize="xl">Please head back to "Our Properties" and checkout the Morgon property for more</Text>
            </Box>
        </Flex>
    )
}

export default StEmilionContent