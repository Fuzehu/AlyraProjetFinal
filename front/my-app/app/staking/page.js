"use client"

import { Box, Heading } from '@chakra-ui/react';
import Layout from '@/components/Layout/Layout';
import StakingPools from '@/components/StakingPools/StakingPools';


export default function Staking() {
    return (
        <Layout>
            <StakingPools />
        </Layout>
    );
}