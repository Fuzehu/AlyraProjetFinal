"use client"

import React, { useState, useEffect } from 'react'
import IsAdmin from './IsAdmin'
import NotAdmin from './NotAdmin'
import NotConnected from '../NotConnected/NotConnected'

// WAGMI
import { useAccount } from 'wagmi';

// CONTRACTS
import DiscountToken from '../../public/artifacts/contracts/DiscountToken.sol/DiscountToken.json'
import Tokenize from '../../public/artifacts/contracts/Tokenize.sol/Tokenize.json'
import StakingERC1155ID1 from '../../public/artifacts/contracts/StakingERC1155ID1.sol/StakingERC1155ID1.json'
import { ethers } from "ethers"


const Admin = () => {

    // Contracts addresses
    const contractAddress1 = process.env.NEXT_PUBLIC_DISCOUNTTOKEN_CONTRACT_ADDRESS
    const contractAddress2 = process.env.NEXT_PUBLIC_TOKENIZE_CONTRACT_ADDRESS
    const contractAddress3 = process.env.NEXT_PUBLIC_STAKINGERC1155ID1_CONTRACT_ADDRESS
    const { JsonRpcProvider } = require("ethers/providers");

    // Get logged wallet infos
    const { isConnected, address } = useAccount()

    // States
    const [isAdmin, setIsAdmin] = useState(null)

  
    useEffect(() => {

        async function checkAdmin() {
            const provider = new JsonRpcProvider();
            const contract1 = new ethers.Contract(contractAddress1, DiscountToken.abi, provider);
            const contract2 = new ethers.Contract(contractAddress2, Tokenize.abi, provider);
            const contract3 = new ethers.Contract(contractAddress3, StakingERC1155ID1.abi, provider);

            const owner1 = await contract1.owner();
            const owner2 = await contract2.owner();
            const owner3 = await contract3.owner();
            /*console.log('Owner1:', owner1);
            console.log('Owner2:', owner2);
            console.log('Owner3:', owner3);
            console.log('Address:', address);*/
    
            const adminStatus = owner1 === address && owner2 === address && owner3 === address;
            console.log('Admin status:', adminStatus);
            setIsAdmin(adminStatus)
        }
        if (isConnected) {
            checkAdmin()
        } 
    }, [isConnected]);

    return (
        <div>
          
            {isConnected ? (
                isAdmin ? (
                    <IsAdmin />
                ) : ( 
                    <NotAdmin />
                )
            ) : (
                <NotConnected />
            )}
        
        </div>
    )
  }

export default Admin
