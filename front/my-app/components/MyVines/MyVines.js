"use client"

import React from 'react'
import MyVinesContent from './MyVinesContent'
import NotConnected from '../NotConnected/NotConnected'

// WAGMI
import { useAccount } from 'wagmi';

const MyVines = () => {

    // Get logged wallet infos
    const { isConnected } = useAccount()

    return (
        <div>
          {isConnected ? <MyVinesContent /> : <NotConnected />}
        </div>
    )
}

export default MyVines