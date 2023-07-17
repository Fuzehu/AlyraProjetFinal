"use client"

import Header from '../Header/Header'
import Footer from '../Footer/Footer'
import { Box, Flex } from '@chakra-ui/react'

const Layout = ({ children  }) => {

    return (
        <Flex direction="column" minHeight="100vh">
            <Header />
            <Flex direction="column" flexGrow="1">
                <Box bg="lavenderblush" p={5} minHeight="100%">
                    { children }
                </Box>
            </Flex>
            <Footer />
        </Flex>
    )
}

export default Layout