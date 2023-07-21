"use client"

import { Flex, Text, Box, Link as ChakraLink } from '@chakra-ui/react';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import Link from 'next/link';

const Header = () => {
  return (
    <Flex
      justifyContent="space-between"
      alignItems="center"
      p="1rem"
      bg="darkslateblue"
      color="white"
    >
      <Box display="flex" fontWeight="bold">
        <ChakraLink as={Link} href="/" fontSize="2xl" m={4}>Index</ChakraLink>
        <ChakraLink as={Link} href="/ourListings" fontSize="2xl" m={4}>Our Listings</ChakraLink>
        <ChakraLink as={Link} href="/myVinesTokens" fontSize="2xl" m={4}>My Vines</ChakraLink>
        <ChakraLink as={Link} href="/staking" fontSize="2xl" m={4}>Staking Pools</ChakraLink>
        <ChakraLink as={Link} href="/admin" fontSize="2xl" m={4}>Admin Panel</ChakraLink>
      </Box>

      <ConnectButton bg="slateblue" color="white" />
    </Flex>
  )
}

export default Header;
