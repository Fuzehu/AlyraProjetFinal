"use client"
import React, { useState, useEffect } from 'react'
import { Box, Flex, Text, VStack, useToast, Button, Input, Heading, Image, Center, HStack } from '@chakra-ui/react'
import FundRaiserContract from '../../../../public/artifacts/contracts/FundRaiser.sol/FundRaiser.json';
import MockedDaiContract from '../../../../public/artifacts/contracts/MockedDai.sol/MockedDai.json';
import { useAccount } from 'wagmi';
import { createPublicClient, http, parseAbiItem } from 'viem'
import { sepolia, goerli } from 'viem/chains'
import { prepareWriteContract, writeContract, readContract } from '@wagmi/core';


const MorgonFundraiser = () => {
    const fundraiserContractAddress = process.env.NEXT_PUBLIC_FUNDRAISER_CONTRACT_ADDRESS
    const mockedDaiContractAddress = process.env.NEXT_PUBLIC_MOCKEDDAI_CONTRACT_ADDRESS
    const client = createPublicClient({
        chain: sepolia, goerli,
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
            <Text mb="5">Enter the world of property tokenization, a revolutionary way to invest in and own properties. We are delighted to introduce the first tokenized plot subject to fundraising from My Vine Stalks, a property within the Morgon AOP designation.</Text>
    
            <Box bg="#F3F2FF" p="5" border="3px solid darkslateblue" borderRadius="lg" boxShadow="lg" mb="5" color="black" display="flex" flexDirection="column" alignItems="center" justifyContent="center">
                <Text fontSize="2xl" fontWeight="bold" color="darkslateblue" textAlign="center">Current Property : MVS - Morgon</Text>
                <Text textAlign="center" mb={3}>
                    Located in the esteemed AOP Morgon, this property sprawls across 1 hectare, bearing vines that are 40 years old. Predominantly growing the widely revered Gamay grape variety, the farm yields 8HL/HA annually. The parcel is valued at $100,000 and the 2022 yield stands at 338 dollars/HL. 
                </Text>
                <Text textAlign="center">
                    Each ticket you purchase lets you mint an equivalent NFT, further marking your stake in the property. Remember, the value of the parcel will be reassessed every year, promising an exciting journey in the world of wine. Let's toast to that!
                </Text>
            </Box>
    
            <Flex width="100%" justify="space-between" mb="5">
                <Box position="relative" width="60%" height="400px">
                    <Image src="/images/Morgon.png" alt="Property image" border="3px solid darkslateblue" objectFit="cover" width="100%" height="100%" borderRadius="md" boxShadow="lg"/>
                    <Text 
                        position="absolute" 
                        bottom="0" 
                        left="0" 
                        bg="rgba(255,255,255,0.7)" 
                        color="black" 
                        p="2"
                        whiteSpace="nowrap"
                    >
                        MVS - Morgon
                    </Text>
                </Box>
                <VStack bg="#F3F2FF" p="5" border="3px solid darkslateblue" borderRadius="lg" spacing={3} width="35%" color="black">
                    <Text fontSize="2xl" fontWeight="bold" color="darkslateblue" textAlign="center">Current Status: </Text>
                    {Object.entries(STATUS_MAPPING).map(([key, statusText]) => (
                        <Box key={key} display="flex" justifyContent="center" alignItems="center" bg={status.text === statusText ? "slateblue" : "#D3D2FF"} p="2" borderRadius="md" height="60px" width="100%" color={status.text === statusText ? "white" : "black"} border={status.text === statusText ? "2px solid black" : "none"}>
                            <Text>{statusText}</Text>
                        </Box>
                    ))}
                </VStack>
            </Flex>
    
            <Flex width="100%" justify="space-between" mb="5" direction={["column", "row"]} alignItems="center">
                <Box minHeight="200px" bg="#F3F2FF" border="3px solid darkslateblue" borderRadius="lg" p={5} color="black" width={["100%", "35%"]} justifyContent="center">
                    <Text fontSize="2xl" fontWeight="bold" mb="4" color="darkslateblue" textAlign="center">User Details</Text>
                    <HStack spacing={5} align="center">
                        <Box bg="#D3D2FF" borderRadius="lg" p={5} border="1px" borderColor="darkslateblue" width="170px" height="80px" d="flex" justifyContent="center" alignItems="center" flexDirection="column">
                            <Text>Tickets Owned</Text>
                            <Text fontWeight="bold" color="darkslateblue">{ticketOwners.toString()}</Text>
                        </Box>
                        <Box bg="#D3D2FF" borderRadius="lg" p={5} border="1px" borderColor="darkslateblue" width="170px" height="80px" d="flex" justifyContent="center" alignItems="center" flexDirection="column">
                            <Text>Whitelist Status</Text>
                            <Text fontWeight="bold" color={whitelist ? "green" : "red"}>{whitelist ? "Whitelisted" : "Not Whitelisted"}</Text>
                        </Box>
                    </HStack>
                </Box>

                <Box minHeight="200px" bg="#F3F2FF" border="3px solid darkslateblue" borderRadius="lg" p={5} color="black" width={["100%", "60%"]} justifyContent="center">
                    <Text fontSize="2xl" fontWeight="bold" mb="4" color="darkslateblue" textAlign="center">Property Details</Text>
                    <HStack spacing={5} align="center">
                        <Box bg="#D3D2FF" borderRadius="lg" p={5} border="1px" borderColor="darkslateblue" width="170px" height="80px" d="flex" justifyContent="center" alignItems="center" flexDirection="column">
                            <Text>Ticket Price</Text>
                            <Text fontWeight="bold" color="darkslateblue">500 DAI</Text>
                        </Box>
                        <Box bg="#D3D2FF" borderRadius="lg" p={5} border="1px" borderColor="darkslateblue" width="170px" height="80px" d="flex" justifyContent="center" alignItems="center" flexDirection="column">
                            <Text>Max Tickets</Text>
                            <Text fontWeight="bold" color="darkslateblue">200</Text>
                        </Box>
                        <Box bg="#D3D2FF" borderRadius="lg" p={5} border="1px" borderColor="darkslateblue" width="170px" height="80px" d="flex" justifyContent="center" alignItems="center" flexDirection="column">
                            <Text>Property ID</Text>
                            <Text fontWeight="bold" color="darkslateblue">1</Text>
                        </Box>
                        <Box bg="#D3D2FF" borderRadius="lg" p={5} border="1px" borderColor="darkslateblue" width="170px" height="80px" d="flex" justifyContent="center" alignItems="center" flexDirection="column">
                            <Text>Tickets Sold</Text>
                            <Text fontWeight="bold" color="darkslateblue">{ticketsSold.toString()}</Text>
                        </Box>
                    </HStack>
                </Box>
            </Flex>

            {status.text === STATUS_MAPPING[0] && (
                <Box bg="#D0CFFF" p="5" border="3px solid darkslateblue" borderRadius="lg" boxShadow="lg" mb="5" color="black" display="flex" flexDirection="column" alignItems="center" justifyContent="center">
                    <Text textAlign="center" mb={3}>
                        Welcome to the listing phase of our project! We're making preparations for the fundraising stage which will start soon.
                    </Text>
                    <Text textAlign="center" mb={3}>
                        Please note that only whitelisted and eligible participants will be able to join the presale.
                    </Text>
                    <Text textAlign="center">
                        Ensure that you've completed the Know Your Customer (KYC) process. This step is crucial for your eligibility in the upcoming presale !
                    </Text>
                    <Text textAlign="center">
                        In the meantime, feel free to explore the property characteristics !
                    </Text>
                </Box>
            )}
    
            <Flex justifyContent="center" alignItems="center" width="100%">
                {status.text === STATUS_MAPPING[1] && (
                    <Flex justifyContent="space-around" width="100%">
                        <Box bg="#D0CFFF" p="5" border="3px solid #4B0082" borderRadius="lg" boxShadow="lg" width="35%" color="#404040">
                            <Flex direction="column" height="100%" justifyContent="space-between">
                                <VStack alignItems="center" spacing="5">
                                    <Heading size="md" color="#4B0082">Buy Tickets</Heading>
                                    <Flex direction="column" justifyContent="center" alignItems="center" flexGrow={1}>
                                        <Center>
                                            <Text textAlign="center" mb="1rem">You can buy your desired number of tickets</Text>
                                        </Center>
                                        <Flex direction="column" justifyContent="center" alignItems="center" flexGrow={1}>
                                            <Input textAlign="center" value={numberOfTicketsInput} onChange={(e) => setNumberOfTicketsInput(e.target.value)} placeholder="Enter the number of tickets" size="md" h="2.5rem" mb="2" mt="3" color="#4B0082"/>
                                        </Flex>
                                    </Flex>
                                </VStack>
                                <Button flexShrink={0} h="2.5rem" bg="#4B0082" color="white" onClick={buyTicket}>Buy Ticket</Button>
                            </Flex>
                        </Box>
                        <Box bg="#D0CFFF" p="5" border="3px solid #4B0082" borderRadius="lg" boxShadow="lg" width="35%" color="#404040">
                            <Flex direction="column" height="100%" justifyContent="space-between">
                                <VStack alignItems="center" spacing="5">
                                    <Heading size="md" mb="2" color="#4B0082">Request Refund</Heading>
                                    <Flex direction="column" justifyContent="center" alignItems="center" flexGrow={1}>
                                        <Center>
                                            <Text textAlign="center">This function allows you to request a refund for your tickets. Usable only if the tickets sale have not already ended</Text>
                                        </Center>
                                    </Flex>
                                </VStack>
                                <Button flexShrink={0} bg="#4B0082" color="white" onClick={requestRefund}>Request Refund</Button>
                            </Flex>
                        </Box>
                    </Flex>
                )}

                {status.text === STATUS_MAPPING[2] && (
                    <Box bg="#D0CFFF" p="5" border="3px solid darkslateblue" borderRadius="lg" boxShadow="lg" mb="5" color="black" display="flex" flexDirection="column" alignItems="center" justifyContent="center">
                        <Text textAlign="center" mb={3}>
                            The fundraising for this property has now successfully concluded.
                        </Text>
                        <Text textAlign="center" mb={3}>
                            We are diligently managing the necessary administrative processes to finalize the acquisition.
                        </Text>
                        <Text textAlign="center">
                            Stay tuned for further updates! Once all paperwork is settled, we will announce when the minting process becomes available!
                        </Text>
                    </Box>
                )}

                {status.text === STATUS_MAPPING[3] && (
                    <Center bg="#D0CFFF" p="5" border="3px solid #4B0082" borderRadius="lg" boxShadow="lg" width="30%" color="#404040">
                        <VStack alignItems="center" justifyContent="center">
                            <Heading size="md" mb="2" color="#4B0082">Claim Tokens</Heading>
                            <Text textAlign="center">You can now claim tokens corresponding to the number of tickets you have previously purchased</Text>
                            <Button flexShrink={0} bg="#4B0082" color="white" onClick={claimTokens}>Claim Tokens</Button>
                        </VStack>
                    </Center>
                )}  
            </Flex>
        </Box>
    );
}

export default MorgonFundraiser

/*
                    <Box bg="gray.100" p="5" borderRadius="md" boxShadow="lg" m={3} width="20%">
                        <Image src="/images/Morgon.png" alt="Property image" objectFit="cover" boxSize="100%"/>
                    </Box>
*/