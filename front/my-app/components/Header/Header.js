"use client"

import { Flex, Text, Box, Link as ChakraLink } from '@chakra-ui/react';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import Link from 'next/link';

const Header = () => {
  return (
    <Flex
      justifyContent="space-between"
      alignItems="center"
      p="2rem"
    >
      <Text>Mes Ceps de Vigne(logo)</Text>

      <Box display="flex" justifyContent="space-between" width="50%">
        <Link href="/">Index</Link>
        <Link href="myVinesTokens">My Vines</Link>
        <Link href="/staking">Staking Pools</Link>
        <Link href="/admin">Admin Panel</Link>
      </Box>

      <ConnectButton />
    </Flex>
  )
}

export default Header;
