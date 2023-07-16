"use client"

import Header from '../Header/Header'
import Footer from '../Footer/Footer'
import Admin from '../Admin/Admin'
import Index from '../Index/Index'
import MyVines from '../MyVines/MyVines'
import StakingPools from '../StakingPools/StakingPools'

import { useRouter } from 'next/router'
import { Flex } from '@chakra-ui/react'

const Layout = ({ children  }) => {

    return (
        <Flex direction="column" justifyContent="center">
            <Header />
                { children }
            <Footer />
        </Flex>
    )
}

export default Layout