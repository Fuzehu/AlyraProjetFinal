"use client"
import React, { useState } from 'react'
import { Box, Button, Flex, Text } from '@chakra-ui/react'
import Morgon from './Property 1/Morgon'
import StEmilion from './Property 2/StEmilion'

const PropertyList = () => {
    const [selectedProperty, setSelectedProperty] = useState(null);

    if (selectedProperty === 'morgon') {
        return <Morgon />
    }

    if (selectedProperty === 'stEmilion') {
        return <StEmilion />
    }

    return (
        <Flex wrap="wrap" justifyContent="space-around">
            <Box w="500px" m="2">
                <Box h="500px" p="2" bg="lightblue" borderRadius="md" boxShadow="lg" borderColor="darkslateblue" borderWidth="2px"
                    backgroundImage="/images/Morgon.png" backgroundSize="cover">
                    <Flex direction="column" h="100%" justifyContent="flex-end" alignItems="center">
                        <Button colorScheme="purple" onClick={() => setSelectedProperty('morgon')}>
                          Access Presale
                        </Button>
                    </Flex>
                </Box>
                <Box bg="lavender" p="2" borderRadius="md" boxShadow="lg" mt="2" borderColor="darkslateblue" borderWidth="2px">
                    <Text>Property Informations</Text>
                </Box>
            </Box>
    
            <Box w="500px" m="2">
                <Box h="500px" p="2" bg="lightblue" borderRadius="md" boxShadow="lg" borderColor="darkslateblue" borderWidth="2px"
                    backgroundImage="url('https://images.winalist.com/blog/wp-content/uploads/2021/03/26144459/AdobeStock_211595652-1-copy.jpeg')" backgroundSize="cover">
                    <Flex direction="column" h="100%" justifyContent="flex-end" alignItems="center">
                        <Button colorScheme="purple" onClick={() => setSelectedProperty('stEmilion')}>
                          Access Presale
                        </Button>
                    </Flex>
                </Box>
                <Box bg="lavender" p="2" borderRadius="md" boxShadow="lg" mt="2" borderColor="darkslateblue" borderWidth="2px">
                    <Text>Property Informations</Text>
                </Box>
            </Box>
        </Flex>
    )
}

export default PropertyList
