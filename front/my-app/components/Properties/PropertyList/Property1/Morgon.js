"use client"
import React, { useState, useEffect } from 'react'
import { Box, Flex, Text, VStack, useToast, Button, Input, Heading, Image, Center } from '@chakra-ui/react'
import FundRaiserContract from '../../../../public/artifacts/contracts/FundRaiser.sol/FundRaiser.json';
import TokenizeContract from '../../../../public/artifacts/contracts/Tokenize.sol/Tokenize.json';
import MockedDaiContract from '../../../../public/artifacts/contracts/MockedDai.sol/MockedDai.json';
import { useAccount } from 'wagmi';
import { createPublicClient, http, parseAbiItem } from 'viem'
import { hardhat, sepolia } from 'viem/chains'
import { prepareWriteContract, writeContract, readContract } from '@wagmi/core';
import propertyImage from '../../../../public/images/Morgon.png';


const MorgonFundraiser = () => {
    const fundraiserContractAddress = process.env.NEXT_PUBLIC_FUNDRAISER_CONTRACT_ADDRESS
    const mockedDaiContractAddress = process.env.NEXT_PUBLIC_MOCKEDDAI_CONTRACT_ADDRESS
    const client = createPublicClient({
        chain: hardhat, sepolia,
        transport: http(),
    })
    const { isConnected, address } = useAccount()
    const toast = useToast()

    // states
    const [ticketsSold, setTicketsSold] = useState('')
    const [ticketOwners, setTicketOwners] = useState('')
    const [whitelist, setWhitelist] = useState(false)
    const [numberOfTicketsInput, setNumberOfTicketsInput] = useState(0)
    const [updateFlag, setUpdateFlag] = useState(false)
    const [status, setStatus] = useState({ text: "Listing", color: "gray.100" });
    const [latestEvent, setLatestEvent] = useState(null);

    const STATUS_MAPPING = {
        0: "Listing",
        1: "Fundraising Live",
        2: "Fundraising Complete",
        3: "Minting Live",
    };

    const STATUS_COLORS = {
        active: "blue.500",
        inactive: "gray.100"
    };

    const statusColor = (current, status) => {
        return current === status ? STATUS_COLORS.active : STATUS_COLORS.inactive;
    };

    const approveSpending = async () => {
        const amountToApprove = BigInt("500000000000000000000" * numberOfTicketsInput);
    
        const _approveSpending = await writeContract({
            address: mockedDaiContractAddress,
            abi: MockedDaiContract.abi,
            functionName: 'approve',
            args: [fundraiserContractAddress, amountToApprove],
        });
    }

    const buyTicket = async () => {
        try {
            await approveSpending();
            const _buyTicket = await writeContract({
                address: fundraiserContractAddress,
                abi: FundRaiserContract.abi,
                functionName: 'buyTicket',
                args: [numberOfTicketsInput],
            });
            toast({
                title: "Success",
                description: "Tickets purchased successfully",
                status: "success",
                duration: 5000,
                isClosable: true,
            })
            setUpdateFlag(prev => !prev)
        } catch (err) {
            toast({
                title: "Error!",
                description: 'An error occured.',
                status: "error",
                duration: 5000,
                isClosable: true,
            })
        }
    }

    const claimTokens = async () => {
        try {
            const _claimTokens = await writeContract({
                address: fundraiserContractAddress,
                abi: FundRaiserContract.abi,
                functionName: 'claimTokens',
                args: [],
            });
            toast({
                title: "Success",
                description: "Tokens claimed successfully",
                status: "success",
                duration: 5000,
                isClosable: true,
            })
        } catch (err) {
            toast({
                title: "Error!",
                description: 'An error occured.',
                status: "error",
                duration: 5000,
                isClosable: true,
            })
        }
    }

    const requestRefund = async () => {
        try {
            const _requestRefund = await writeContract({
                address: fundraiserContractAddress,
                abi: FundRaiserContract.abi,
                functionName: 'requestRefund',
                args: [],
            });
            toast({
                title: "Success",
                description: "Refund requested successfully",
                status: "success",
                duration: 5000,
                isClosable: true,
            })
            setUpdateFlag(prev => !prev)
        } catch (err) {
            toast({
                title: "Error!",
                description: 'An error occured.',
                status: "error",
                duration: 5000,
                isClosable: true,
            })
        }
    }


    useEffect(() => {
        const fetchDetails = async () => {
            if (isConnected) {

                const _ticketsSold = await readContract({
                    address: fundraiserContractAddress,
                    abi: FundRaiserContract.abi,
                    functionName: 'ticketsSold',
                    args: [],
                });
                console.log(_ticketsSold)
                setTicketsSold(_ticketsSold);

                const _ticketOwners = await readContract({
                    address: fundraiserContractAddress,
                    abi: FundRaiserContract.abi,
                    functionName: 'ticketOwners',
                    args: [address],
                });
                setTicketOwners(_ticketOwners);

                const _whitelist = await readContract({
                    address: fundraiserContractAddress,
                    abi: FundRaiserContract.abi,
                    functionName: 'whitelist',
                    args: [address],
                });
                setWhitelist(_whitelist);

                const _currentStatus = await readContract({
                    address: fundraiserContractAddress,
                    abi: FundRaiserContract.abi,
                    functionName: 'currentStatus',
                    args: [],
                });
    
                setStatus({ text: STATUS_MAPPING[_currentStatus.toString()], color: "gray.100" });

            }
        };

        const fetchEvents = async () => {
            const events = await client.getLogs({
                address: fundraiserContractAddress,
                event: parseAbiItem('event StatusChanged(uint256 newStatus)'),
                fromBlock: 0n,
                toBlock: 'latest'
            });
        
            if (events.length > 0) {
                const latestEvent = events[events.length - 1];
                setLatestEvent(latestEvent);
                setStatus({ text: STATUS_MAPPING[(latestEvent.args.newStatus.toString())], color: "gray.100" });
            }
        };

        fetchEvents();

        fetchDetails();
    }, [isConnected, address, updateFlag]);


    return (
        <Box flexGrow={1} minHeight="100vh" display="flex" flexDirection="column" p={5}>
            <Heading size="xl" mb="5" color="darkslateblue">Welcome to Property Ticketing</Heading>
            <Text mb="5">On this page, you can view the details of a property, check its current status, buy tickets, and manage your purchases.</Text>
    
            <Flex width="100%" justify="space-between" mb="5">
                <Image src="/images/Morgon.png" alt="Property image" objectFit="cover" width="60%" height="400px" borderRadius="md" boxShadow="lg"/>
                <VStack bg="#F3F2FF" p="5" border="3px solid darkslateblue" borderRadius="lg" spacing={3} width="35%" color="black">
                    <Text fontSize="xl" color="darkslateblue">Current Status: </Text>
                    {Object.entries(STATUS_MAPPING).map(([key, statusText]) => (
                        <Box key={key} display="flex" justifyContent="center" alignItems="center" bg={status.text === statusText ? "slateblue" : "#D3D2FF"} p="2" borderRadius="md" height="60px" width="100%" color={status.text === statusText ? "white" : "black"} border={status.text === statusText ? "2px solid black" : "none"}>
                            <Text>{statusText}</Text>
                        </Box>
                    ))}
                </VStack>
            </Flex>
    
            <Flex width="100%" justify="space-between" mb="5">
                <Box bg="#F3F2FF" p="5" border="3px solid darkslateblue" borderRadius="lg" boxShadow="lg" width="30%" color="black">
                    <Text fontSize="xl" color="darkslateblue">Property Details</Text>
                    <Text>Ticket Price: 500 DAI</Text>
                    <Text>Max Tickets: 200</Text>
                    <Text>Property ID: 1</Text>
                    <Text>Tickets Sold: {ticketsSold.toString()}</Text>
                </Box>
    
                {status.text === STATUS_MAPPING[1] && (
                <Box bg="#E2E1FF" p="5" border="3px solid #4B0082" borderRadius="lg" boxShadow="lg" width="30%" color="#404040">
                    <Heading size="md" mb="2" color="#4B0082">Buy Tickets</Heading>
                    <Text>This function allows you to buy a certain number of tickets.</Text>
                    <Input value={numberOfTicketsInput} onChange={(e) => setNumberOfTicketsInput(e.target.value)} placeholder="Enter the number of tickets" size="md" mb="2" color="#4B0082"/>
                    <Button flexShrink={0} bg="#4B0082" color="white" onClick={buyTicket}>Buy Ticket</Button>
                </Box>
                )}
    
                {status.text === STATUS_MAPPING[1] && (
                <Box bg="#E2E1FF" p="5" border="3px solid #4B0082" borderRadius="lg" boxShadow="lg" width="30%" color="#404040">
                    <Heading size="md" mb="2" color="#4B0082">Request Refund</Heading>
                    <Text>This function allows you to request a refund for your tickets, only if the tickets sale have not already ended</Text>
                    <Button flexShrink={0} bg="#4B0082" color="white" onClick={requestRefund}>Request Refund</Button>
                </Box>
                )}
    
                <Box bg="#F3F2FF" p="5" border="3px solid darkslateblue" borderRadius="lg" boxShadow="lg" width="30%" color="black">
                    <Text fontSize="xl" color="darkslateblue">User Details</Text>
                    <Text>Tickets Owned: {ticketOwners.toString()}</Text>
                    <Text>Whitelist Status: {whitelist ? "Whitelisted" : "Not Whitelisted"}</Text>
                </Box>
            </Flex>
    
            {status.text === STATUS_MAPPING[0] && (
                <Box bg="#F3F2FF" p="5" border="3px solid darkslateblue" borderRadius="lg" boxShadow="lg" mb="5" color="black">
                    <Text>We are currently in the listing phase. Please check back later to purchase tickets.</Text>
                </Box>
            )}
    
            {status.text === STATUS_MAPPING[2] && (
                <Box bg="#F3F2FF" p="5" border="3px solid darkslateblue" borderRadius="lg" boxShadow="lg" width="40%" color="black">
                    <Text>Fundraising has been completed. Thank you for your support!</Text>
                </Box>
            )}
    
            {status.text === STATUS_MAPPING[3] && (
                <Flex justifyContent="center" width="100%">
                    <Box bg="#E2E1FF" p="5" border="3px solid #4B0082" borderRadius="lg" boxShadow="lg" width="40%" color="#404040">
                        <Flex direction="row" justify="space-between" alignItems="center" height="100%">
                            <VStack alignItems="center">
                                <Heading size="md" mb="2" color="#4B0082">Claim Tokens</Heading>
                                <Text textAlign="center">You can now claim tokens corresponding to the number of tickets you have previously purchased</Text>
                            </VStack>
                            <Button flexShrink={0} bg="#4B0082" color="white" onClick={claimTokens} height="80%">Claim Tokens</Button>
                        </Flex>
                    </Box>
                </Flex>
            )}
        </Box>
    )
}

export default MorgonFundraiser

/*
                    <Box bg="gray.100" p="5" borderRadius="md" boxShadow="lg" m={3} width="20%">
                        <Image src="/images/Morgon.png" alt="Property image" objectFit="cover" boxSize="100%"/>
                    </Box>
*/