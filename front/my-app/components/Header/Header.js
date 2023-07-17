"use client"

import { Flex, Text, Box, Link as ChakraLink } from '@chakra-ui/react';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import NextLink from 'next/link';

const Header = () => {
  return (
    <Flex
      justifyContent="space-between"
      alignItems="center"
      p="2rem"
    >
      <Text>
        <img src="../../public/images/MCDVLogo.png" alt="Logo" />
      </Text>

      <Box display="flex" justifyContent="space-between" width="50%">
        <NextLink href="/" passHref>
          <ChakraLink>Index</ChakraLink>
        </NextLink>

        <NextLink href="/myVinesNFTs" passHref>
          <ChakraLink>My Vines</ChakraLink>
        </NextLink>

        <NextLink href="/staking" passHref>
          <ChakraLink>Staking Pools</ChakraLink>
        </NextLink>

        <NextLink href="/admin" passHref>
          <ChakraLink>Admin Panel</ChakraLink>
        </NextLink>
      </Box>

      <ConnectButton />
    </Flex>
  )
}

export default Header;
