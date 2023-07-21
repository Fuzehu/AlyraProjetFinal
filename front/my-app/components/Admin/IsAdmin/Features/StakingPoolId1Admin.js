import React, { useState, useEffect } from 'react';
import { Button, Input, Text, Box, Heading, Flex, useToast } from '@chakra-ui/react';
import { ethers } from 'ethers';
import { useAccount } from 'wagmi';
import { prepareWriteContract, writeContract, readContract } from '@wagmi/core';

const StakingPoolId1Admin = () => {
  const contractAddress = process.env.NEXT_PUBLIC_STAKINGPOOLID1_CONTRACT_ADDRESS; // Replace with the correct contract address
  const { isConnected, address } = useAccount();
  const toast = useToast();
  const [stakedAmount, setStakedAmount] = useState('');
  const [newRewardsRate, setNewRewardsRate] = useState('');
  const [userAddress, setUserAddress] = useState('');

  const getStakedAmount = async (userAddress) => {
    try {
      const amount = await readContract({
        address: contractAddress,
        abi: Contract.abi,
        functionName: "getStakedAmount",
        args: [userAddress]
      });
      setStakedAmount(amount);
    } catch (err) {
      console.log(err);
      toast({
        title: 'Error!',
        description: 'An error occurred while fetching the staked amount.',
        status: 'error',
        duration: 3000,
        isClosable: true
      });
    }
  };

  const updateRewardsRate = async () => {
    try {
      const { request } = await prepareWriteContract({
        address: contractAddress,
        abi: Contract.abi,
        functionName: "updateRewardsRatePerSeconds",
        args: [newRewardsRate]
      });
      await writeContract(request);
      toast({
        title: 'Success!',
        description: 'Rewards rate updated successfully!',
        status: 'success',
        duration: 5000,
        isClosable: true
      });
    } catch (err) {
      console.log(err);
      toast({
        title: 'Error!',
        description: 'An error occurred while updating the rewards rate.',
        status: 'error',
        duration: 3000,
        isClosable: true
      });
    }
  };

  const handleUserAddressChange = (e) => {
    setUserAddress(e.target.value);
  };

  const handleGetStakedAmount = () => {
    getStakedAmount(userAddress);
  };


  return (
    <Flex direction="column" align="center" mt="5rem" p={5}>
      <Box bg="#F3F2FF" border="3px solid darkslateblue" borderRadius="lg" w="100%" p={5} mb={5}>
        <Flex mt={4} justify="space-between" align="center">
          <Box>
            <Heading color="darkslateblue" mb={5}>Get Staked Amount for a given Address</Heading>
            <Input placeholder="Enter address" value={userAddress} onChange={handleUserAddressChange} />
            <Button onClick={handleGetStakedAmount} bg="slateblue" color="white">Get Staked Amount</Button>
            <Box bg="darkslateblue" color="white" p={2} mt={2} borderRadius="md" w="20rem">
              <Text fontWeight="bold">Staked Amount:</Text>
              <Text>{stakedAmount}</Text>
            </Box>
          </Box>
          <Box>
            <Heading color="darkslateblue" mb={5}>Update Rewards Rate</Heading>
            <Input placeholder="Enter new rate" value={newRewardsRate} onChange={e => setNewRewardsRate(e.target.value)} />
            <Button onClick={updateRewardsRate} bg="slateblue" color="white">Update Rewards Rate</Button>
            <Box bg="darkslateblue" color="white" p={2} mt={2} borderRadius="md" w="20rem">
              <Text fontWeight="bold">New Rate:</Text>
              <Text>{newRewardsRate}</Text>
            </Box>
          </Box>
        </Flex>
      </Box>
    </Flex>
  );
  
  
}

export default StakingPoolId1Admin;
