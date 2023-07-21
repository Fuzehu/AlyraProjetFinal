"use client"
import React, { useState, useEffect } from 'react'
import { Heading, Flex, Text, Input, Button, useToast, Box, UnorderedList, ListItem, Checkbox } from '@chakra-ui/react'
import Contract from '../../../../public/artifacts/contracts/Tokenize.sol/Tokenize.json'
import { ethers } from "ethers"
import { prepareWriteContract, writeContract, readContract } from '@wagmi/core'
import { useAccount } from 'wagmi'
import { createPublicClient, http, parseAbiItem } from 'viem'
import { hardhat, sepolia } from 'viem/chains'

const ERC1155 = () => {
    const contractAddress = process.env.NEXT_PUBLIC_TOKENIZE_CONTRACT_ADDRESS
    const client = createPublicClient({
        chain: hardhat, sepolia,
        transport: http(),
    })
    const { isConnected, address } = useAccount()
    const toast = useToast()

    //states
    const [isInitialized, setIsInitialized] = useState(false)
    const [to, setTo] = useState('')
    const [totalSupply, setTotalSupply] = useState([])
    const [tokenName, setTokenName] = useState('')
    const [tokenURI, setTokenURI] = useState('')
    const [operatorAddress, setOperatorAddress] = useState('')
    const [approved, setApproved] = useState(false)
    const [mintedTokensLogs, setMintedTokensLogs] = useState([])
    const [approvedAddresses, setApprovedAddresses] = useState([])


    const init = async () => {
        try {
            const { request } = await prepareWriteContract({
                address: contractAddress,
                abi: Contract.abi,
                functionName: "init",
                args: [],
            })
            await writeContract(request)

            localStorage.setItem('initialized', 'true');
            setIsInitialized(true)

            toast({
                title: 'Success !',
                description: `GENESIS Token has been successfully minted as TokenID0!`,
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

    const mintToken = async (_to, _totalSupply, _tokenName, _tokenURI) => {
        try {
            const { request } = await prepareWriteContract({
                address: contractAddress,
                abi: Contract.abi,
                functionName: "mintToken",
                args: [_to, _totalSupply, _tokenName, _tokenURI],
            })

            await writeContract(request)

            toast({
                title: 'Success !',
                description: `${_tokenName} has been successfully minted with a total supply of ${_totalSupply} tokens and sent to ${_to} address`,
                status: 'success',
                duration: 8000,
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

    const setApprovalForAll = async (_operator, _approved) => {
        try {
            const { request } = await prepareWriteContract({
                address: contractAddress,
                abi: Contract.abi,
                functionName: "setApprovalForAll",
                args: [_operator, _approved],
            })

            await writeContract(request)

            toast({
                title: 'Success !',
                description: `The ${_operator} address has been ${_approved ? 'approved' : 'disapproved'} successfully`,
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

            const initialized = localStorage.getItem('initialized');
            if (initialized) {
                setIsInitialized(true);
            }

            const tokensMintedLogs = await client.getLogs({
                event: parseAbiItem('event TokenMinted(uint256 indexed tokenId, string tokenName, uint16 totalSupply, string uri)'),
                fromBlock: 0n,
                toBlock: 'latest'
            })
            setMintedTokensLogs(tokensMintedLogs)

            const approvedAddressesLogs = await client.getLogs({
                event: parseAbiItem('event ApprovalForAll(address indexed _owner, address indexed _operator, bool _approved)'),
                fromBlock: 0n,
                toBlock: 'latest'
            })
            setApprovedAddresses(approvedAddressesLogs)

        }
        getPastEvents()
    }, [mintedTokensLogs, approvedAddresses]);


    
    return (
        <Flex flexDirection="column" mt="5rem">
            {!isInitialized && (
                <Box width="100%" p={5} bg="#F3F2FF" border="3px solid darkslateblue" borderRadius="lg" ml={0} mt={3} mb={3}>
                    <Heading color="darkslateblue" mb={4}>Proceed to initialize the GFV array at index 0</Heading>
                    <Flex justifyContent="space-between" alignItems="center">
                        <Flex flexDirection="column">
                            <Text color="darkslateblue">Before minting any other token, we need to first initialize the contract by minting the GENESIS token which will possess the ID 0.</Text>
                            <Text color="darkslateblue">This is a necessary step to prepare the contract for future operations.</Text>
                        </Flex>
                        <Button onClick={init} bg="slateblue" color="white">Initialize Contract</Button>
                    </Flex>
                </Box>
            )}
            {isInitialized && (
                <Flex flexDirection="row" flexWrap="wrap" justifyContent="space-around">
                    <Box width={["100%", "45%"]} p={5} bg="#F3F2FF" border="3px solid darkslateblue" borderRadius="lg" ml={0} mt={3} mb={3}>
                        <Heading color="darkslateblue" mb={4}>Set Approval For All</Heading>
                        <Flex justifyContent="space-between" alignItems="center">
                            <Flex flexDirection="column">
                                <Input placeholder="Operator address" value={operatorAddress} onChange={e => setOperatorAddress(e.target.value)} />
                                <Checkbox isChecked={approved} onChange={e => setApproved(e.target.checked)}>Approve ?</Checkbox>
                            </Flex>
                            <Button onClick={() => setApprovalForAll(operatorAddress, approved)} bg="slateblue" color="white">Set / Revoke Approval</Button>
                        </Flex>
                    </Box>
                    <Box width={["100%", "45%"]} p={5} bg="#F3F2FF" border="3px solid darkslateblue" borderRadius="lg" ml={0} mt={3} mb={3} style={{maxHeight: '20vh', overflowY: 'auto'}}>
                        <Heading color="darkslateblue" mb={4}>Approved Addresses Logs</Heading>
                        <UnorderedList>
                            {approvedAddresses.map((event, index) => (
                                <ListItem key={index}>
                                    Operator: {event.operator}, Approved: {event.approved ? 'Yes' : 'No'}
                                </ListItem>
                            ))}
                        </UnorderedList>
                    </Box>
                    <Box width={["100%", "45%"]} p={5} bg="#F3F2FF" border="3px solid darkslateblue" borderRadius="lg" ml={0} mt={3} mb={3}>
                        <Heading color="darkslateblue" mb={4}>Mint a new token</Heading>
                        <Flex justifyContent="space-between" alignItems="center">
                            <Flex flexDirection="column">
                                <Input placeholder="Recipient address" value={to} onChange={e => setTo(e.target.value)} />
                                <Input placeholder="Total supply" type="number" value={totalSupply} onChange={e => setTotalSupply(e.target.value)} />
                                <Input placeholder="Token name" value={tokenName} onChange={e => setTokenName(e.target.value)} />
                                <Input placeholder="Token URI" value={tokenURI} onChange={e => setTokenURI(e.target.value)} />
                            </Flex>
                            <Button onClick={() => mintToken(to, totalSupply, tokenName, tokenURI)} bg="slateblue" color="white">Mint Token</Button>
                        </Flex>
                    </Box>
                    <Box width={["100%", "45%"]} p={5} bg="#F3F2FF" border="3px solid darkslateblue" borderRadius="lg" ml={0} mt={3} mb={3} style={{maxHeight: '28vh', overflowY: 'auto'}}>
                        <Heading color="darkslateblue" mb={4}>ERC1155 Mint Logs</Heading>
                        <UnorderedList>
                            {mintedTokensLogs.map((token, index) => (
                                <ListItem key={index}>
                                    TokenID: {token.tokenId}, TokenName: {token.tokenName}, TotalSupply: {token.totalSupply}, URI: {token.uri}
                                </ListItem>
                            ))}
                        </UnorderedList>
                    </Box>
                </Flex>
            )}
        </Flex>
    )
}

export default ERC1155