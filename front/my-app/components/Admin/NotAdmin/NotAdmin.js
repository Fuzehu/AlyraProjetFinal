"use client"
import React from 'react'
import { Flex, Box, Heading, Text } from '@chakra-ui/react';

const NotAdmin = () => {
  return (
    <Flex flexGrow={1} minHeight="100vh" flexDirection="column" justifyContent="flex-start" alignItems="center">
        <Box p={5} bg="#F3F2FF" border="3px solid darkslateblue" borderRadius="lg" width="50%" mt={10}>
            <Heading color="darkslateblue" mb={4}>Access Restricted</Heading>
            <Text fontSize="xl" color="darkslateblue">You can't access this page as you are not an Admin.</Text>
        </Box>
    </Flex>
  )
}

export default NotAdmin