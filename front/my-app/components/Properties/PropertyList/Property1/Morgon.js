"use client"
import React, { useState, useEffect } from 'react'
import { ethers } from "ethers"
import { Box, Flex, Text, VStack, useToast, Button, Input, Heading } from '@chakra-ui/react'
import FundRaiserContract from '../../../../public/artifacts/contracts/FundRaiser.sol/FundRaiser.json';
import TokenizeContract from '../../../../public/artifacts/contracts/Tokenize.sol/Tokenize.json';
import MockedDaiContract from '../../../../public/artifacts/contracts/MockedDai.sol/MockedDai.json';
import { useAccount } from 'wagmi';
import { prepareWriteContract, writeContract, readContract } from '@wagmi/core';


const MorgonFundraiser = () => {
    const fundraiserContractAddress = process.env.NEXT_PUBLIC_FUNDRAISER_CONTRACT_ADDRESS
    const tokenizeContractAddress = process.env.NEXT_PUBLIC_TOKENIZE_CONTRACT_ADDRESS
    const mockedDaiContractAddress = process.env.NEXT_PUBLIC_MOCKEDDAI_CONTRACT_ADDRESS
    const { isConnected, address } = useAccount()
    const toast = useToast()

    // states
    const [ticketsSold, setTicketsSold] = useState('')
    const [ticketOwners, setTicketOwners] = useState('')
    const [whitelist, setWhitelist] = useState(false)
    const [numberOfTicketsInput, setNumberOfTicketsInput] = useState(0);
    const [updateFlag, setUpdateFlag] = useState(false)


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
            }
        };

        fetchDetails();
    }, [isConnected, address]);


    return (
        <Box flexGrow={1} minHeight="100vh" display="flex" flexDirection="column">
          <VStack spacing={10} alignItems="stretch">
            <Box bg="gray.100" p="5" borderRadius="md" boxShadow="lg">
              <Text fontSize="xl">Property Details</Text>
              <Text>Ticket Price: 500 DAI</Text>
              <Text>Max Tickets: 200</Text>
              <Text>Property ID: 1</Text>
              <Text>Tickets Sold: {ticketsSold.toString()}</Text>
            </Box>
            <Box bg="gray.100" p="5" borderRadius="md" boxShadow="lg">
              <Text fontSize="xl">User Details</Text>
              <Text>Tickets Owned: {ticketOwners.toString()}</Text>
              <Text>Whitelist Status: {whitelist ? "Whitelisted" : "Not Whitelisted"}</Text>
            </Box>
            <Flex direction="row" justifyContent="space-between" alignItems="center" bg="gray.100" p="5" borderRadius="md" boxShadow="lg">
              <Box>
                <Heading size="md" mb="2">Buy Tickets</Heading>
                <Text>This function allows you to buy a certain number of tickets.</Text>
                <Input
                  value={numberOfTicketsInput}
                  onChange={(e) => setNumberOfTicketsInput(e.target.value)}
                  placeholder="Enter the number of tickets"
                  size="md"
                  mb="2"
                />
                <Button bg="slateblue" color="white" onClick={buyTicket}>Buy Ticket</Button>
              </Box>
                <Box>
                    <Heading size="md" mb="2">Request Refund</Heading>
                    <Text>This function allows you to request a refund for your tickets.</Text>
                    <Button bg="slateblue" color="white" onClick={requestRefund}>Request Refund</Button>
               </Box>
            </Flex>
                <Box bg="gray.100" p="5" borderRadius="md" boxShadow="lg">
                    <Heading size="md" mb="2">Claim Tokens</Heading>
                    <Text>This function allows you to claim your tokens after buying tickets.</Text>
                    <Button bg="slateblue" color="white" onClick={claimTokens}>Claim Tokens</Button>
                </Box>
          </VStack>
        </Box>
      )
}

export default MorgonFundraiser
