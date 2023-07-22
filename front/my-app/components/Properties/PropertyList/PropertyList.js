"use client"
import React from 'react'
import { Box, Button, Flex, Text } from '@chakra-ui/react'
import Link from 'next/link'

const PropertyList = () => {
    return (
        <Flex wrap="wrap" justifyContent="space-around">
            <Box w="500px" m="2">
                <Box h="500px" p="2" bg="lightblue" borderRadius="md" boxShadow="lg" borderColor="darkslateblue" borderWidth="2px"
                    backgroundImage="/images/Morgon.png" backgroundSize="cover">
                    <Flex direction="column" h="100%" justifyContent="space-between" alignItems="center" p={5}>
                        <Text fontSize="2xl" color="black">MVS - Morgon</Text>
                        <Link href="/ourListings/morgon">
                            <Button colorScheme="purple">
                              Access Presale
                            </Button>
                        </Link>
                    </Flex>
                </Box>
                <Box bg="lavender" p="2" borderRadius="md" boxShadow="lg" mt="2" borderColor="darkslateblue" borderWidth="2px">
                    <Text>Property Informations</Text>
                </Box>
            </Box>
    
            <Box w="500px" m="2">
                <Box h="500px" p="2" bg="lightblue" borderRadius="md" boxShadow="lg" borderColor="darkslateblue" borderWidth="2px"
                    backgroundImage="url('https://images.winalist.com/blog/wp-content/uploads/2021/03/26144459/AdobeStock_211595652-1-copy.jpeg')" backgroundSize="cover">
                    <Flex direction="column" h="100%" justifyContent="space-between" alignItems="center" p={5}>
                        <Text fontSize="2xl" color="black">MVS - StEmilion</Text>
                        <Link href="/ourListings/stEmilion">
                            <Button colorScheme="purple">
                              Access Presale
                            </Button>
                        </Link>
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
