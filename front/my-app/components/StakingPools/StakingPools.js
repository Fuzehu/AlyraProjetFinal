"use client"

import React from 'react'
import StakingPoolsContent from './StakingPoolsContent';
import NotConnected from '../NotConnected/NotConnected'

// WAGMI
import { useAccount } from 'wagmi';

const MyVines = () => {

    // Get logged wallet infos
    const { isConnected } = useAccount()

    return (
        <div>
          {isConnected ? <StakingPoolsContent /> : <NotConnected />}
        </div>
    )
}

export default MyVines