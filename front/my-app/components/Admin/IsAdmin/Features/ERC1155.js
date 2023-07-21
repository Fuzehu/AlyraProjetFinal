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
    const [tokenIdForInit, setTokenIdForInit] = useState('');
    const [sharePrice, setSharePrice] = useState('');
    const [initTokenURI, setInitTokenURI] = useState('');
    const [initTokenName, setInitTokenName] = useState('');
    const [tokenIdForUpdate, setTokenIdForUpdate] = useState('');
    const [newSharePrice, setNewSharePrice] = useState('');
    const [newTokenURI, setNewTokenURI] = useState('');
    const [contractAddressToAdd, setContractAddressToAdd] = useState('');
    const [contractAddressToRevoke, setContractAddressToRevoke] = useState('')
    const [contractAddresses, setContractAddresses] = useState([]);
    const [tokenId, setTokenId] = useState('');
    

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

    const authorizeContract = async (_addr) => {
        try {
            const { request } = await prepareWriteContract({
                address: contractAddress,
                abi: Contract.abi,
                functionName: "authorizeContract",
                args: [_addr],
            })
            
            await writeContract(request)
            setContractAddresses([...contractAddresses, _addr])

            toast({
                title: 'Success !',
                description: `${_addr} has been successfully authorized !`,
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

    const revokeContract = async (_addr) => {
        try {
            const { request } = await prepareWriteContract({
                address: contractAddress,
                abi: Contract.abi,
                functionName: "revokeContract",
                args: [_addr],
            })

            await writeContract(request)
            setContractAddresses(contractAddresses.filter(address => address !== _addr))

            toast({
                title: 'Success !',
                description: `${_addr} has been successfully revoked !`,
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

    const mintToken = async (_to, _tokenId, _totalSupply) => {
        try {
            const { request } = await prepareWriteContract({
                address: contractAddress,
                abi: Contract.abi,
                functionName: "mintTokenEmergency", 
                args: [_to, _tokenId, _totalSupply], 
            });
    
            await writeContract(request);
    
            toast({
                title: 'Success !',
                description: `${_totalSupply} tokens with ID ${_tokenId} have been successfully minted and sent to ${_to} address`,
                status: 'success',
                duration: 8000,
                isClosable: true,
            });
        } catch (err) {
            console.log(err);
            toast({
                title: 'Error!',
                description: 'An error occurred.',
                status: 'error',
                duration: 3000,
                isClosable: true,
            });
        }
    };

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

    const initGfvInfo = async () => {
        try {
          await writeContract({
            address: contractAddress,
            abi: Contract.abi,
            functionName: "initGfvInfoForATokenId",
            args: [tokenIdForInit, sharePrice, initTokenURI, initTokenName],
          });
    
          toast({
            title: 'Success!',
            description: `GFV Info has been successfully initialized for Token ID ${tokenIdForInit}`,
            status: 'success',
            duration: 5000,
            isClosable: true,
          });
        } catch (err) {
          console.log(err);
          toast({
            title: 'Error!',
            description: 'An error occurred.',
            status: 'error',
            duration: 3000,
            isClosable: true,
          });
        }
    };
    
    const updateSharePriceAndTokenURI = async () => {
        try {
            await writeContract({
            address: contractAddress,
            abi: Contract.abi,
            functionName: "updateSharePriceAndUri",
            args: [tokenIdForUpdate, newSharePrice, newTokenURI],
            });

            toast({
            title: 'Success!',
            description: `Share Price and Token URI have been successfully updated for Token ID ${tokenIdForUpdate}`,
            status: 'success',
            duration: 5000,
            isClosable: true,
            });
        } catch (err) {
            console.log(err);
            toast({
            title: 'Error!',
            description: 'An error occurred.',
            status: 'error',
            duration: 3000,
            isClosable: true,
            });
        }
    };

    const updateTokenURIHandler = async () => {
        try {
            await writeContract({
            address: contractAddress,
            abi: Contract.abi,
            functionName: "updateTokenURI",
            args: [tokenIdForUpdate, newTokenURI],
            });

            toast({
            title: 'Success!',
            description: `Token URI has been successfully updated for Token ID ${tokenIdForUpdate}`,
            status: 'success',
            duration: 5000,
            isClosable: true,
            });
        } catch (err) {
            console.log(err);
            toast({
            title: 'Error!',
            description: 'An error occurred.',
            status: 'error',
            duration: 3000,
            isClosable: true,
            });
        }
    };


    useEffect(() => {
        const getPastEvents = async () => {

            const initialized = localStorage.getItem('initialized');
            if (initialized) {
                setIsInitialized(true);
            }

            const tokensMintedLogs = await client.getLogs({
                event: parseAbiItem('event TokenMinted(address indexed to, uint256 indexed tokenId, uint256 amount)'),
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

            const authorizeContractLogs = await client.getLogs({
                event: parseAbiItem('event ContractAuthorized(address indexed contractAddress)'),
                fromBlock: 0n,
                toBlock: 'latest'
            })

            const revokeContractLogs = await client.getLogs({
                event: parseAbiItem('event ContractRevoked(address indexed contractAddress)'),
                fromBlock: 0n,
                toBlock: 'latest'
            })

        }
        getPastEvents()
    }, [mintedTokensLogs, approvedAddresses]);

    
    return (
        <Flex flexDirection="column" mt="5rem">
            {/* Ligne 1: Initialize GENESIS NFT with tokenId 0 */}
            <Box width="100%" p={5} bg="#F3F2FF" border="3px solid darkslateblue" borderRadius="lg" ml={0} mt={3} mb={3}>
                <Heading color="darkslateblue" mb={4}>Initialize GENESIS NFT with tokenId 0</Heading>
                <Flex justifyContent="space-between" alignItems="center">
                    <Flex flexDirection="column">
                        <Text color="darkslateblue">Before minting any other token, we need to first initialize the contract by minting the GENESIS token which will possess the ID 0.</Text>
                        <Text color="darkslateblue">This is a necessary step to prepare the contract for future operations.</Text>
                    </Flex>
                    <Button onClick={init} bg="slateblue" color="white">Initialize Contract</Button>
                </Flex>
            </Box>
      
          {/* Ligne 2: Authorize Contract & Revoke Contract */}
            <Flex justifyContent="space-between">
                <Box width={["100%", "30%"]} p={5} bg="#F3F2FF" border="3px solid darkslateblue" borderRadius="lg" ml={0} mt={3} mb={3}>
                    <Heading color="darkslateblue" mb={4}>Authorize Contract</Heading>
                    <Flex flexDirection="column">
                        <Input placeholder="Contract address" value={contractAddressToAdd} onChange={e => setContractAddressToAdd(e.target.value)} mb={2} />
                        <Button onClick={() => authorizeContract(contractAddressToAdd)} bg="slateblue" color="white" mb={2}>Authorize Contract</Button>
                    </Flex>
                </Box>
                <Box width={["100%", "30%"]} p={5} bg="#F3F2FF" border="3px solid darkslateblue" borderRadius="lg" ml={0} mt={3} mb={3}>
                    <Heading color="darkslateblue" mb={4}>List of Authorized Contract</Heading>
                    <Box overflowY="scroll" height="200px" p={2}>
                        <UnorderedList>
                            {contractAddresses.map((addr, index) => (
                                <ListItem key={index}>{addr}</ListItem>
                            ))}
                        </UnorderedList>
                    </Box>
                </Box>
                <Box width={["100%", "30%"]} p={5} bg="#F3F2FF" border="3px solid darkslateblue" borderRadius="lg" ml={0} mt={3} mb={3}>
                    <Heading color="darkslateblue" mb={4}>Revoke Contract</Heading>
                    <Flex flexDirection="column">
                        <Input placeholder="Contract address" value={contractAddressToRevoke} onChange={e => setContractAddressToRevoke(e.target.value)} mb={2} />
                        <Button onClick={() => revokeContract(contractAddressToRevoke)} bg="slateblue" color="white" mb={2}>Revoke Contract</Button>
                    </Flex>
                </Box>
            </Flex>
            
              {/* Ligne 3: Init GFV Info for Token, Update Share Price and Token URI, Update Token URI */}
            <Flex justifyContent="space-between" flexWrap="wrap">
                <Box width={["100%", "30%"]} p={5} bg="#F3F2FF" border="3px solid darkslateblue" borderRadius="lg" ml={0} mt={3} mb={3}>
                <Heading color="darkslateblue" mb={4}>Init GFV Info for Token</Heading>
                <Flex flexDirection="column">
                    <Input placeholder="Token ID" type="number" value={tokenIdForInit} onChange={(e) => setTokenIdForInit(e.target.value)} mb={2} />
                    <Input placeholder="Share Price" type="number" value={sharePrice} onChange={(e) => setSharePrice(e.target.value)} mb={2} />
                    <Input placeholder="Token URI" value={initTokenURI} onChange={(e) => setInitTokenURI(e.target.value)} mb={2} />
                    <Input placeholder="Token Name" value={initTokenName} onChange={(e) => setInitTokenName(e.target.value)} mb={2} />
                    <Button onClick={initGfvInfo} bg="slateblue" color="white" mt={2}>Init GFV Info</Button>
                </Flex>
                </Box>
                <Box width={["100%", "30%"]} p={5} bg="#F3F2FF" border="3px solid darkslateblue" borderRadius="lg" ml={0} mt={3} mb={3}>
                    <Heading color="darkslateblue" mb={4}>Update Share Price and Token URI</Heading>
                    <Flex flexDirection="column">
                        <Input placeholder="Token ID" type="number" value={tokenIdForUpdate} onChange={(e) => setTokenIdForUpdate(e.target.value)} mb={2} />
                        <Input placeholder="New Share Price" type="number" value={newSharePrice} onChange={(e) => setNewSharePrice(e.target.value)} mb={2} />
                        <Input placeholder="New Token URI" value={newTokenURI} onChange={(e) => setNewTokenURI(e.target.value)} mb={2} />
                        <Button onClick={updateSharePriceAndTokenURI} bg="slateblue" color="white" mt={2}>Update Share Price and Token URI</Button>
                    </Flex>
                </Box>
                <Box width={["100%", "30%"]} p={5} bg="#F3F2FF" border="3px solid darkslateblue" borderRadius="lg" ml={0} mt={3} mb={3}>
                    <Heading color="darkslateblue" mb={4}>Update Token URI</Heading>
                    <Flex flexDirection="column">
                        <Input placeholder="Token ID" type="number" value={tokenIdForUpdate} onChange={(e) => setTokenIdForUpdate(e.target.value)} mb={2} />
                        <Input placeholder="New Token URI" value={newTokenURI} onChange={(e) => setNewTokenURI(e.target.value)} mb={2} />
                        <Button onClick={updateTokenURIHandler} bg="slateblue" color="white" mt={2}>Update Token URI</Button>
                    </Flex>
                </Box>
            </Flex>

            {/* Ligne 4: Mint a new token & ERC1155 Mint Logs */}
            <Flex justifyContent="space-between" flexWrap="wrap">
                <Box width={["100%", "45%"]} p={5} bg="#F3F2FF" border="3px solid darkslateblue" borderRadius="lg" ml={0} mt={3} mb={3} style={{ maxHeight: '28vh', overflowY: 'auto' }}>
                    <Heading color="darkslateblue" mb={4}>Mint a new Token "Emergency"</Heading>
                    <Flex justifyContent="space-between" alignItems="center">
                        <Flex flexDirection="column">
                            <Input placeholder="Recipient address" value={to} onChange={e => setTo(e.target.value)} mb={2} />
                            <Input placeholder="Token ID" type="number" value={tokenId} onChange={e => setTokenId(e.target.value)} mb={2} />
                            <Input placeholder="Total supply" type="number" value={totalSupply} onChange={e => setTotalSupply(e.target.value)} mb={2} />
                        </Flex>
                        <Button onClick={() => mintToken(to, tokenId, totalSupply)} bg="slateblue" color="white" mb={2}>Mint Token</Button>
                    </Flex>
                </Box>
                <Box width={["100%", "45%"]} p={5} bg="#F3F2FF" border="3px solid darkslateblue" borderRadius="lg" ml={0} mt={3} mb={3} style={{ maxHeight: '28vh', overflowY: 'auto' }}>
                    <Heading color="darkslateblue" mb={4}>ERC1155 Mint Logs</Heading>
                    <UnorderedList>
                        {mintedTokensLogs.map((token, index) => (
                        <ListItem key={index}>
                            To: {token.to}, TokenID: {token.tokenId}, Amount: {token.amount}
                        </ListItem>
                        ))}
                    </UnorderedList>
                </Box>
            </Flex>
        </Flex>
    );

};

export default ERC1155