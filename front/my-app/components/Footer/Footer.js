"use client"

import { Flex, Text } from '@chakra-ui/react'

const Footer = () => {
  return (
    <Flex
        p="2rem"
        justifyContent="center"
        alignItems="center"
        bg="darkslateblue"
        color="white"
    >
        <Text>All rights reserved &copy; MCDV {new Date().getFullYear()}</Text>
    </Flex>
  )
}

export default Footer
