"use client"
import React, { useState, useEffect } from 'react'
import { Heading, Flex, Text, Input, Button, useToast, Box } from '@chakra-ui/react'
import Contract from '../../../../public/artifacts/contracts/DiscountToken.sol/DiscountToken.json'
import { ethers } from "ethers"
import { prepareWriteContract, writeContract, readContract } from '@wagmi/core'
import { useAccount } from 'wagmi'
import { createPublicClient, http, parseAbiItem } from 'viem'
import { sepolia, goerli } from 'viem/chains'

const ERC20 = () => {
    const contractAddress = process.env.NEXT_PUBLIC_DISCOUNTTOKEN_CONTRACT_ADDRESS
    const client = createPublicClient({
        chain: sepolia, goerli,
        transport: http(),
    })
    const { isConnected, address } = useAccount()
    const toast = useToast()

    // States
    const [adminAddressToAdd, setAdminAddressToAdd] = useState('');
    const [adminAddressToRevoke, setAdminAddressToRevoke] = useState('');
    const [adminAddresses, setAdminAddresses] = useState([]);
    const [mintAddress, setMintAddress] = useState([]);
    const [mintAmount, setMintAmount] = useState([]);
    const [mintedTokensReceiver, setMintedTokensReceiver] = useState([]);
    const [mintedTokensAmount, setMintedTokensAmount] = useState([]);

    const addAdminRights = async (_addr) => {
        try {
            const { request } = await prepareWriteContract({
                address: contractAddress,
                abi: Contract.abi,
                functionName: "addAdminRights",
                args: [_addr],
            })
            
            await writeContract(request)
            setAdminAddresses([adminAddresses, _addr])

            toast({
                title: 'Success !',
                description: `${_addr} has been successfully registered as admin !`,
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

    const revokeAdminRights = async (_addr) => {
        try {
            const { request } = await prepareWriteContract({
                address: contractAddress,
                abi: Contract.abi,
                functionName: "revokeAdminRights",
                args: [_addr],
            })

            await writeContract(request)
            setAdminAddresses(adminAddresses.filter(address => address !== _addr))

            toast({
                title: 'Success !',
                description: `${_addr} has been successfully revoked as admin !`,
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

    const mint = async (_to, _amount) => {
        try {
            const { request } = await prepareWriteContract({
                address: contractAddress,
                abi: Contract.abi,
                functionName: "mint",
                args: [_to, _amount],
            })

            await writeContract(request)
            setMintedTokensReceiver([...mintedTokensReceiver, {receiver: _to}])
            setMintedTokensAmount([...mintedTokensAmount, {amount: _amount}])
    
            toast({
                title: 'Success !',
                description: `${_amount} has been successfully transfered to ${_to} !`,
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

            const addAdminRightsLogs = await client.getLogs({
                event: parseAbiItem('event AdminRightsGranted(address indexed newAdminAddress)'),
                fromBlock: 0n,
                toBlock: 'latest'
            })

            const revokeAdminRightsLogs = await client.getLogs({
                event: parseAbiItem('event AdminRightsRevoked(address indexed adminAddress)'),
                fromBlock: 0n,
                toBlock: 'latest'
            })

            const tokensMintedLogs = await client.getLogs({
                event: parseAbiItem('event TokensMinted(address indexed receiver, uint amount)'),
                fromBlock: 0n,
                toBlock: 'latest'
            })

            const addedAdminAddresses = addAdminRightsLogs.map(log => log.args.newAdminAddress)
            const revokedAdminAddresses = revokeAdminRightsLogs.map(log => log.args.adminAddress)
            const currentAdminAddresses = addedAdminAddresses.filter(address => !revokedAdminAddresses.includes(address))
            setAdminAddresses(currentAdminAddresses)

            const setReceiverLogs = tokensMintedLogs.map(log => ({receiver: log.args.receiver}));
            const setAmountLogs = tokensMintedLogs.map(log => ({amount: log.args.amount}));
            setMintedTokensReceiver(setReceiverLogs);
            setMintedTokensAmount(setAmountLogs);
        }
        getPastEvents()
    }, []);

    return (
        <Flex flexDirection="column" mt="5rem">
            <Text fontSize="xl" color="darkslateblue" ml="2em" mb="1rem">Only the different Staking Pools (rewards minting) and the Contract Owner (in case of airdrops) should have the Admin Rights</Text>
            <Flex flexDirection="row" width="100%" justifyContent="space-around">
                <Box width="33%" p={5} bg="#F3F2FF" border="3px solid darkslateblue" borderRadius="lg" mt={3} mb={3} mr={3}>
                    <Heading color="darkslateblue">Add Admin Rights</Heading>
                    <Input placeholder="Enter address" mb={3} value={adminAddressToAdd} onChange={e => setAdminAddressToAdd(e.target.value)} />
                    <Button onClick={() => addAdminRights(adminAddressToAdd)} bg="slateblue" color="white">Add Admin Rights</Button>
                </Box>
                <Box width="33%" p={5} bg="#F3F2FF" border="3px solid darkslateblue" borderRadius="lg" mt={3} mb={3}>
                    <Heading color="darkslateblue">Admin Addresses</Heading>
                    <Box overflowY="auto" maxHeight="200px">
                        {adminAddresses.map((address, index) => 
                            <Text key={index}>{address}</Text>
                        )}
                    </Box>
                </Box>
                <Box width="33%" p={5} bg="#F3F2FF" border="3px solid darkslateblue" borderRadius="lg" mt={3} mb={3} ml={3}>
                    <Heading color="darkslateblue">Revoke Rights</Heading>
                    <Input placeholder="Enter address" mb={3} value={adminAddressToRevoke} onChange={e => setAdminAddressToRevoke(e.target.value)} />
                    <Button onClick={() => revokeAdminRights(adminAddressToRevoke)} bg="slateblue" color="white">Revoke Admin Rights</Button>
                </Box>
            </Flex>
            <Flex flexDirection="row" width="100%" justifyContent="space-around">
                <Box width="40%" p={5} bg="#F3F2FF" border="3px solid darkslateblue" borderRadius="lg" mt={3} mb={3} mr={3}>
                    <Heading color="darkslateblue">Mint Tokens</Heading>
                    <Input placeholder="Enter address" mb={3} value={mintAddress} onChange={e => setMintAddress(e.target.value)} />
                    <Input placeholder="Enter amount" mb={3} value={mintAmount} onChange={e => setMintAmount(e.target.value)} />
                    <Button onClick={() => mint(mintAddress, mintAmount)} bg="slateblue" color="white">Mint Tokens</Button>
                </Box>
                <Box width="60%" p={5} bg="#F3F2FF" border="3px solid darkslateblue" borderRadius="lg" mt={3} mb={3} ml={3 }style={{maxHeight: '25vh', overflowY: 'auto'}}>
                    <Heading color="darkslateblue">Minted Tokens</Heading>
                    <Box overflowY="auto" maxHeight="200px">
                        {mintedTokensReceiver.map((log, index) => 
                            <Text key={index}>{log.receiver}: {(parseFloat(mintedTokensAmount[index].amount.toString()) / 10**18).toFixed(10)} tokens</Text>
                        )}
                    </Box>
                </Box>
            </Flex>
        </Flex>
    )
}

export default ERC20
