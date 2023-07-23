"use client"
import React from 'react'
import { Box, Button, Flex, Text, Center, Heading } from '@chakra-ui/react'
import Link from 'next/link'

const PropertyList = () => {
    return (
        <Flex wrap="wrap" justifyContent="space-around">
            <Box w="500px" m="2">
                <Box h="500px" p="2" bg="lightblue" borderRadius="md" boxShadow="lg" borderColor="darkslateblue" borderWidth="2px"
                    backgroundImage="/images/Morgon.png" backgroundSize="cover">
                    <Flex direction="column" h="100%" justifyContent="flex-end" alignItems="center" p={5}>
                        <Link href="/ourListings/morgon">
                            <Button colorScheme="purple">Access Presale !</Button>
                        </Link>
                    </Flex>
                </Box>
                <Box bg="lavender" p="4" borderRadius="md" boxShadow="lg" mt="2" borderColor="darkslateblue" borderWidth="2px">
                    <Heading size="lg" fontWeight="bold" mb="2"><Center>Property 1 - Morgon Overview</Center></Heading>
                    <Box bg="white" p="2" borderRadius="md" boxShadow="lg" mt="2" borderColor="darkslateblue" borderWidth="2px" mb="2">
                        <Text fontWeight="bold">Location and Size :</Text>
                        <Text>Located in AOP Morgon, this property sprawls across 1 hectare.</Text>
                    </Box>
                    <Box bg="white" p="2" borderRadius="md" boxShadow="lg" mt="2" borderColor="darkslateblue" borderWidth="2px">
                        <Text fontWeight="bold">Parcel Value :</Text>
                        <Text>The parcel is valued at $100,000.</Text>
                    </Box>
                </Box>
            </Box>
    
            <Box w="500px" m="2">
                <Box h="500px" p="2" bg="lightblue" borderRadius="md" boxShadow="lg" borderColor="darkslateblue" borderWidth="2px"
                    backgroundImage="url('https://images.winalist.com/blog/wp-content/uploads/2021/03/26144459/AdobeStock_211595652-1-copy.jpeg')" backgroundSize="cover">
                    <Flex direction="column" h="100%" justifyContent="flex-end" alignItems="center" p={5}>
                        <Link href="/ourListings/stEmilion">
                            <Button colorScheme="purple">Access Presale !</Button>
                        </Link>
                    </Flex>
                </Box>
                <Box bg="lavender" p="4" borderRadius="md" boxShadow="lg" mt="2" borderColor="darkslateblue" borderWidth="2px">
                    <Heading size="lg" fontWeight="bold" mb="2"><Center>Property 2 - St-Emilion Overview</Center></Heading>
                    <Box bg="white" p="2" borderRadius="md" boxShadow="lg" mt="2" borderColor="darkslateblue" borderWidth="2px" mb="2">
                        <Text fontWeight="bold">Location and Size :</Text>
                        <Text>Located in AOP St-Emilion, this property sprawls across 3.5 hectares.</Text>
                    </Box>
                    <Box bg="white" p="2" borderRadius="md" boxShadow="lg" mt="2" borderColor="darkslateblue" borderWidth="2px" mb="2">
                        <Text fontWeight="bold">Parcel Value :</Text>
                        <Text>The parcel is valued at $1.2 million.</Text>
                    </Box>
                    <Box bg="lightgray" p="2" borderRadius="md" alignItems="center" boxShadow="lg" mt="2" borderColor="darkslateblue" borderWidth="2px">
                        <Text fontWeight="bold"><Center>Coming Soon!</Center></Text>
                    </Box>
                </Box>
            </Box>
        </Flex>
    )
}

export default PropertyList
