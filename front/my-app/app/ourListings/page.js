"use client"

import { Box, Heading } from '@chakra-ui/react';
import Layout from '@/components/Layout/Layout';
import AllPropertiesIndex from '@/components/Properties/AllPropertiesIndex';


export default function OurListings() {
    return (
        <Layout>
            <AllPropertiesIndex />
        </Layout>
        
    );
}