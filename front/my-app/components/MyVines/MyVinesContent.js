"use client"
import React, { useState, useEffect } from 'react'
import TokenizeContract from '../../public/artifacts/contracts/Tokenize.sol/Tokenize.json';
import { useAccount } from 'wagmi';
import { createPublicClient, http, parseAbiItem } from 'viem'
import { sepolia, goerli } from 'viem/chains'
import { prepareWriteContract, writeContract, readContract } from '@wagmi/core';

const MyVinesContent = () => {
    const contractAddress = process.env.NEXT_PUBLIC_TOKENIZE_CONTRACT_ADDRESS
    const client = createPublicClient({
        chain: sepolia, goerli,
        transport: http(),
    })
    const { isConnected, address } = useAccount()
    const [nftDetails, setNftDetails] = useState([]);
    
    useEffect(() => {
        const fetchNFTData = async () => {
            if (!isConnected) return;

            try {
                const balance = await readContract({
                    address: contractAddress,
                    abi: TokenizeContract.abi,
                    functionName: 'balanceOf',
                    args: [address, 1], 
                });

                const uri = await readContract({
                    address: contractAddress,
                    abi: TokenizeContract.abi,
                    functionName: 'uri',
                    args: [1], 
                });

                setNftDetails([...nftDetails, { balance, uri }]);
            } catch (err) {
                console.log(err);
            }
        };

        fetchNFTData();
    }, [address, isConnected]);

    return (
        <div>
          {nftDetails.map((nft, index) => (
            <div key={index}>
                <h3>NFT URI: {nft.uri}</h3>
                <h4>Balance: {nft.balance}</h4>
            </div>
          ))}
        </div>
    )
}

export default MyVinesContent
