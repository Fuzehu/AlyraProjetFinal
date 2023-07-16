"use client"

import { Box, Heading } from '@chakra-ui/react';
import Layout from '@/components/Layout/Layout';
import Admin from '@/components/Admin/Admin';


export default function AdminPanel() {
    return (
        <Layout>
            <Admin />
        </Layout>
        
    );
}