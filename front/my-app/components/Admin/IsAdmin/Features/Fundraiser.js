"use client"
import React, { useState, useEffect } from 'react'
import { Heading, Flex, Text, Input, Button, useToast, Box } from '@chakra-ui/react'
import { ethers } from "ethers"
import { prepareWriteContract, writeContract, readContract } from '@wagmi/core'
import { useAccount } from 'wagmi'
import { createPublicClient, http, parseAbiItem } from 'viem'
import { goerli, hardhat, sepolia } from 'viem/chains'
import FundraiserContract from '../../../../public/artifacts/contracts/FundRaiser.sol/FundRaiser.json'

const FundRaiser = () => {
    const fundraiserContractAddress = process.env.NEXT_PUBLIC_FUNDRAISER_CONTRACT_ADDRESS
    const client = createPublicClient({
        chain: goerli, sepolia,
        transport: http(),
    })
    const { isConnected, address } = useAccount()
    const toast = useToast()

    // States
    const [addressToWhitelist, setAddressToWhitelist] = useState('');
    const [addressToRevoke, setAddressToRevoke] = useState('');
    const [whitelistedAddresses, setWhitelistedAddresses] = useState([]);
    const [fundraisingLive, setFundraisingLive] = useState(false);
    const [fundraisingComplete, setFundraisingComplete] = useState(false);
    const [mintingLive, setMintingLive] = useState(false);

    const addToWhitelist = async (_addr) => {
        try {
            const { request } = await prepareWriteContract({
                address: fundraiserContractAddress,
                abi: FundraiserContract.abi,
                functionName: "addToWhitelist",
                args: [_addr],
            })
            
            await writeContract(request)
            setWhitelistedAddresses([...whitelistedAddresses, _addr])

            toast({
                title: 'Success !',
                description: `${_addr} has been successfully added to whitelist !`,
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
    }

    const removeFromWhitelist = async (_addr) => {
        try {
            const { request } = await prepareWriteContract({
                address: fundraiserContractAddress,
                abi: FundraiserContract.abi,
                functionName: "removeFromWhitelist",
                args: [_addr],
            })

            await writeContract(request)
            setWhitelistedAddresses(whitelistedAddresses.filter(address => address !== _addr))

            toast({
                title: 'Success !',
                description: `${_addr} has been successfully removed from whitelist !`,
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
    }

    const startFundraising = async () => {
        try {
            const { request } = await prepareWriteContract({
                address: fundraiserContractAddress,
                abi: FundraiserContract.abi,
                functionName: "startFundraising",
                args: [],
            })
    
            await writeContract(request)
            setFundraisingLive(true)
    
            toast({
                title: 'Success !',
                description: `Fundraising has been successfully started!`,
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
    }
    
    const endFundraiser = async () => {
        try {
            const { request } = await prepareWriteContract({
                address: fundraiserContractAddress,
                abi: FundraiserContract.abi,
                functionName: "endFundraiser",
                args: [],
            })
    
            await writeContract(request)
            setFundraisingLive(false)
            setFundraisingComplete(true)
    
            toast({
                title: 'Success !',
                description: `Fundraising has been successfully ended!`,
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
    }
    
    const startMinting = async () => {
        try {
            const { request } = await prepareWriteContract({
                address: fundraiserContractAddress,
                abi: FundraiserContract.abi,
                functionName: "startMinting",
                args: [],
            })
    
            await writeContract(request)
            setMintingLive(true)
    
            toast({
                title: 'Success !',
                description: `Minting has been successfully started!`,
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
    }


    useEffect(() => {
        const getPastEvents = async () => {
            const addToWhitelistLogs = await client.getLogs({
                event: parseAbiItem('event AddedToWhitelist(address indexed account)'),
                fromBlock: 0n,
                toBlock: 'latest'
            })

            const removeFromWhitelistLogs = await client.getLogs({
                event: parseAbiItem('event RemovedFromWhitelist(address indexed account)'),
                fromBlock: 0n,
                toBlock: 'latest'
            })
            const addedAddresses = addToWhitelistLogs.map(log => log.args.account)
            const removedAddresses = removeFromWhitelistLogs.map(log => log.args.account)
            const currentWhitelistedAddresses = addedAddresses.filter(address => !removedAddresses.includes(address))
            setWhitelistedAddresses(currentWhitelistedAddresses)
        }
        getPastEvents()
    }, []);

    return (
        <Flex flexDirection="column" mt="5rem">
            <Flex flexDirection="row" width="100%" justifyContent="space-around">
                <Box width="28%" p={5} bg="#F3F2FF" border="3px solid darkslateblue" borderRadius="lg" mt={3} mb={3} mr={3}>
                    <Heading color="darkslateblue">Add to Whitelist</Heading>
                    <Input placeholder="Enter address" mb={3} value={addressToWhitelist} onChange={e => setAddressToWhitelist(e.target.value)} />
                    <Button onClick={() => addToWhitelist(addressToWhitelist)} bg="slateblue" color="white">Add to Whitelist</Button>
                </Box>
                <Box width="40%" p={5} bg="#F3F2FF" border="3px solid darkslateblue" borderRadius="lg" mt={3} mb={3}>
                    <Heading color="darkslateblue">Whitelisted Addresses</Heading>
                    <Box overflowY="auto" maxHeight="200px">
                        {whitelistedAddresses.map((address, index) => 
                            <Text key={index}>{address}</Text>
                        )}
                    </Box>
                </Box>
                <Box width="28%" p={5} bg="#F3F2FF" border="3px solid darkslateblue" borderRadius="lg" mt={3} mb={3} ml={3}>
                    <Heading color="darkslateblue">Remove Whitelist</Heading>
                    <Input placeholder="Enter address" mb={3} value={addressToRevoke} onChange={e => setAddressToRevoke(e.target.value)} />
                    <Button onClick={() => removeFromWhitelist(addressToRevoke)} bg="slateblue" color="white">Remove from Whitelist</Button>
                </Box>
            </Flex>
            <Flex flexDirection="column" width="100%" mb="5rem">
                <Box mb="1rem">
                    <Text mb="1rem">Start Fundraising: This will start the fundraising. Only available when the status is in "Listing".</Text>
                    <Button onClick={startFundraising} bg="slateblue" color="white" disabled={fundraisingLive}>Start Fundraising</Button>
                </Box>
                <Box mb="1rem">
                    <Text mb="1rem">End Fundraising: This will end the fundraising. Only available when the status is "Fundraisinglive" and tickets sold have reached the maximum tickets.</Text>
                    <Button onClick={endFundraiser} bg="slateblue" color="white" disabled={!fundraisingLive || fundraisingComplete}>End Fundraising</Button>
                </Box>
                <Box mb="1rem">
                    <Text mb="1rem">Start Minting: This will start minting the tokens. Only available when the status is "FundraisingComplete".</Text>
                    <Button onClick={startMinting} bg="slateblue" color="white" disabled={!fundraisingComplete || mintingLive}>Start Minting</Button>
                </Box>
            </Flex>
        </Flex>
        
    )
}

export default FundRaiser
