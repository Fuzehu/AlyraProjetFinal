"use client"

import React from 'react'
import { VStack, Heading, Text, Box, Divider, Flex, Badge, Image, Icon, useColorModeValue } from '@chakra-ui/react'
import { FaWineBottle, FaHandHoldingUsd, FaLock } from 'react-icons/fa'

const Index = () => {
    const boxBg = useColorModeValue('white', 'gray.700');
    const titleColor = useColorModeValue('teal.600', 'teal.300');
    const badgeColor = useColorModeValue('green.500', 'green.200');
    const dividerColor = useColorModeValue('gray.200', 'gray.500');

    return (
        <Flex direction="column" align="start" justify="start" mt="2rem" p={5} w="80%" mx="auto" bg="#1E1E3F" color="white" borderRadius="lg" border="1px solid #FFF">
            <Heading textAlign="center" mb={5} size="2xl" fontWeight="bold" color="white">Welcome to "My Vine Stalks"</Heading>
            <Text fontSize="lg" fontStyle="italic" mb={6} color="white">
                Embark on a journey where the romance of winemaking meets the innovation of technology!
            </Text>

            <Divider borderColor="white" />

            <Box bg="#F3F2FF" p={6} borderRadius="lg" shadow="md" color="black" mt={4}>
                <Heading as="h2" size="lg" mb={3} color="darkslateblue">
                    Understanding Your Needs
                </Heading>
                <Text fontSize="md">
                    At MSV, we recognize the struggles and opportunities within the wine industry. From tracing property history, managing vineyard costs, to facilitating international vineyard acquisition, our platform is designed to address these challenges.
                </Text>
            </Box>

            <Box bg="#F3F2FF" p={6} borderRadius="lg" shadow="md" color="black" mt={4}>
                <Heading as="h2" size="lg" mb={3} color="darkslateblue">
                    Our Unique Solution
                </Heading>
                <Text fontSize="md">
                    Leveraging blockchain technology, MSV simplifies ownership, diversifies investments, and enhances traceability. Here's a quick look at how we do it:
                </Text>

                <Box mt={4} bg="#D3D2FF" borderRadius="lg" p={6}>
                    <Heading as="h3" size="md" mb={2} color="darkslateblue">Tokenization</Heading>
                    <Text fontSize="sm">
                        The Groupement Foncier Viticole (GFV) that owns a vineyard plot is tokenized. Each plot is represented by multiple ERC1155 tokens sharing the same ID, democratizing access to vineyard ownership and providing complete transparency.
                    </Text>
                </Box>

                <Box mt={4} bg="#D3D2FF" borderRadius="lg" p={6}>
                    <Heading as="h3" size="md" mb={2} color="darkslateblue">Unique ERC20 Tokens</Heading>
                    <Text fontSize="sm">
                        Our unique ERC20 tokens offer discounts on wine bottle purchases from the vineyard plots you invest in.
                    </Text>
                </Box>

                <Box mt={4} bg="#D3D2FF" borderRadius="lg" p={6}>
                    <Heading as="h3" size="md" mb={2} color="darkslateblue">Staking Pool</Heading>
                    <Text fontSize="sm">
                        Stake your ERC1155 tokens for at least 9 months of the current year, and earn ERC20 discount tokens at a fixed rate.
                    </Text>
                </Box>
            </Box>

            <Text fontSize="xl" fontWeight="bold" color="white" mt={4}>
                Whether you're a WineLover or an Investor, MSV offers an accessible and enjoyable platform that merges business with pleasure. Join us in reshaping the wine industry!
            </Text>
        </Flex>
    )

}

export default Index
