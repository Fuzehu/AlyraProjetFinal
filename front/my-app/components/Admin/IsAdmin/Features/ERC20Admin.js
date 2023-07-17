import React, { useState, useEffect} from 'react'
// CHAKRA-UI
import { Heading, Flex, Text, Input, Button, useToast } from '@chakra-ui/react'
// CONTRACT
import { ethers } from "ethers"
// WAGMI
import { prepareWriteContract, writeContract, readContract } from '@wagmi/core'
import { useAccount } from 'wagmi'
// VIEM (events)
import { createPublicClient, http, parseAbiItem } from 'viem'
import { hardhat, sepolia } from 'viem/chains'



const ERC20Admin = () => {


    // CONTRACT ADDRESS
    const contractAddress = process.env.NEXT_PUBLIC_DISCOUNTTOKEN_CONTRACT_ADDRESS

    /*// CREATE VIEM CLIENT (events)
    const client = createPublicClient({
      chain: hardhat,
      transport: http(),
    })*/

    // GET LOGGED WALLET INFO
    const { isConnected, address } = useAccount()

    // CHAKRA-UI TOAST 
    const toast = useToast()

    //STATES



    const addAdminRightsDiscountToken = async () => {

      try {
        const { request } = await prepareWriteContract({
            address: contractAddress,
            abi: Contract.abi,
            functionName: "addVoter",
            args: [addVoter],
        })

        await writeContract(request)

        await getWhitelistLogs()            

        toast({
            title: 'Success !',
            description: `${addVoter} has been successfully added to the voting whitelist`,
            status: 'success',
            duration: 5000,
            isClosable: true,
        })
    } catch (err) {
        console.log(err);
        toast({
            title: 'Error!',
            description: 'An error occured.',
            status: 'error',
            duration: 3000,
            isClosable: true,
        })
    }




/*
let adminAddresses = [];

// Initialisation : chargez tous les administrateurs précédents
const pastGrantEvents = await discountToken.getPastEvents('AdminRightsGranted');
const pastRevokeEvents = await discountToken.getPastEvents('AdminRightsRevoked');

for(let event of pastGrantEvents) {
    adminAddresses.push(event.returnValues.adminAddress);
}

for(let event of pastRevokeEvents) {
    const index = adminAddresses.indexOf(event.returnValues.adminAddress);
    if(index !== -1) {
        adminAddresses.splice(index, 1);
    }
}

// Écoute des événements futurs
discountToken.events.AdminRightsGranted({}, (error, event) => {
    if (error) console.error(error);
    else adminAddresses.push(event.returnValues.adminAddress);
});

discountToken.events.AdminRightsRevoked({}, (error, event) => {
    if (error) console.error(error);
    else {
        const index = adminAddresses.indexOf(event.returnValues.adminAddress);
        if(index !== -1) {
            adminAddresses.splice(index, 1);
        }
    }
});
*/




    }

    const revokeAdminRightsDiscountToken = async () => {

      
    }    
    










    return (
        <div>
            ERC20 Admin
        </div>
    )
}

export default ERC20Admin
