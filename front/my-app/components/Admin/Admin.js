"use client"

import React from 'react'
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

    const [isAdmin, setIsAdmin] = useState(null)

    const contractAddress1 = process.env.NEXT_PUBLIC_DISCOUNTTOKEN_CONTRACT_ADDRESS
    const contractAddress2 = process.env.NEXT_PUBLIC_TOKENIZE_CONTRACT_ADDRESS
    const contractAddress3 = process.env.NEXT_PUBLIC_STAKINGERC1155ID1_CONTRACT_ADDRESS
    const { JsonRpcProvider } = require("ethers/providers");

    const { isConnected, address } = useAccount()
  

    useEffect(() => {
        async function checkAdmin() {
            const provider = new JsonRpcProvider();
            const contract1 = new ethers.Contract(contractAddress1, DiscountToken.abi, provider);
            const contract2 = new ethers.Contract(contractAddress2, Tokenize.abi, provider);
            const contract3 = new ethers.Contract(contractAddress3, StakingERC1155ID1.abi, provider);
            
            const owner1 = await contract1.owner();
            const owner2 = await contract2.owner();
            const owner3 = await contract3.owner();

            setIsAdmin(owner1 === address && owner2 === address && owner3 === address)
        }
        if (isConnected) {
            checkAdmin()
        } 
    }, [isConnected]);




    return (
        <div>
          
            {isConnected ? (
                isAdmin === null ? (
                    "Loading..."
                ) : isAdmin ? (
                    <Admin />
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
