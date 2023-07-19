import React, { useState, useEffect } from 'react';
import { Button, Input, Text, Box, Heading, Flex, Grid, useToast, VStack, Stat, StatLabel, StatNumber, StatHelpText, StatArrow } from '@chakra-ui/react';
import Contract from '../../public/artifacts/contracts/StakingERC1155Id1.sol/StakingERC1155Id1.json'; 
import { ethers } from 'ethers';
import { useAccount } from 'wagmi';
import { prepareWriteContract, writeContract, readContract } from '@wagmi/core';

const StakingPoolID1 = () => {
  const contractAddress = process.env.NEXT_PUBLIC_STAKINGERC1155ID1_CONTRACT_ADDRESS; 
  const { isConnected, address } = useAccount();
  const toast = useToast();
  const [tokenAmountToStake, setTokenAmountToStake] = useState('');
  const [stakedAmount, setStakedAmount] = useState('');
  const [rewards, setRewards] = useState('');
  const [tokenAmountToUnstake, setTokenAmountToUnstake] = useState('');
  const [updateFlag, setUpdateFlag] = useState(false);

  const stake = async (_amount) => {
    try {
      const { request } = await prepareWriteContract({
        address: contractAddress,
        abi: Contract.abi,
        functionName: "stakeERC1155ID1",
        args: [_amount]
      });
      await writeContract(request);
      setUpdateFlag(prevState => !prevState);

      toast({
        title: 'Success!',
        description: `${_amount} tokens have been staked successfully!`,
        status: 'success',
        duration: 5000,
        isClosable: true
      });
    } catch (err) {
      console.log(err);
      toast({
        title: 'Error!',
        description: 'An error occurred.',
        status: 'error',
        duration: 3000,
        isClosable: true
      });
    }
  };

  const unstake = async (_amount) => {
    try {
      const { request } = await prepareWriteContract({
        address: contractAddress,
        abi: Contract.abi,
        functionName: "unstake",
        args: [_amount]
      });
      await writeContract(request);
      setUpdateFlag(prevState => !prevState);

      toast({
        title: 'Success!',
        description: `${_amount} tokens have been unstaked successfully!`,
        status: 'success',
        duration: 5000,
        isClosable: true
      });
    } catch (err) {
      console.log(err);
      toast({
        title: 'Error!',
        description: 'An error occurred.',
        status: 'error',
        duration: 3000,
        isClosable: true
      });
    }
  };

  const claimRewards = async () => {
    try {
      const { request } = await prepareWriteContract({
        address: contractAddress,
        abi: Contract.abi,
        functionName: "claimRewards",
        args: []
      });
      await writeContract(request);
      setUpdateFlag(prevState => !prevState);

      toast({
        title: 'Success!',
        description: `Rewards have been claimed successfully!`,
        status: 'success',
        duration: 5000,
        isClosable: true
      });
    } catch (err) {
      console.log(err);
      toast({
        title: 'Error!',
        description: 'An error occurred.',
        status: 'error',
        duration: 3000,
        isClosable: true
      });
    }
  };

  useEffect(() => {
    const getStakedAmount = async () => {
      const amount = await readContract({
        address: contractAddress,
        abi: Contract.abi,
        functionName: "getStakedAmount",
        args: [address]
      });
      setStakedAmount(amount.toString());
    };

    const getPendingRewards = async () => {
      const rewards = await readContract({
        address: contractAddress,
        abi: Contract.abi,
        functionName: "getPendingRewards",
        args: []
      });
      console.log('getPendingRewards:', rewards);
      
      setRewards(rewards.toString());
    };

    if (isConnected) {
      getStakedAmount().then(() => {
        if (stakedAmount > 0) {
          getPendingRewards();
        }
      });
    }
  }, [isConnected, address, stakedAmount, updateFlag]);

  

  return (
    <Flex direction="column" align="center" justify="center" mt="2rem" p={5} w="80%" mx="auto">
      <Heading textAlign="center" mb={5} size="xl" fontWeight="bold" color="darkslateblue">Staking Interface</Heading>
      <Grid templateColumns={["1fr", "repeat(2, 1fr)"]} gap={5} alignItems="start" bg="#1E1E3F" border="1px solid #FFF" borderRadius="lg" p={8} mb={8} color="white">
        <Box bg="#F3F2FF" border="3px solid darkslateblue" borderRadius="lg" p={5} color="black">
          <Heading color="darkslateblue" mb={5} size="xl">Staking Operations</Heading>
          <VStack spacing={5} align="stretch">
            <Box bg="#D3D2FF" borderRadius="lg" p={5}>  
              <Flex direction="column">
                <Text mb={2}>Stake Tokens</Text>
                <Input placeholder="Enter amount" value={tokenAmountToStake} onChange={e => setTokenAmountToStake(e.target.value)} color="darkslateblue" />
                <Button onClick={() => stake(tokenAmountToStake)} bg="slateblue" color="white" mt={2}>Stake Tokens</Button>
              </Flex>
            </Box>
            <Box bg="#D3D2FF" borderRadius="lg" p={5}>  
              <Flex direction="column">
                <Text mb={2}>Unstake Tokens</Text>
                <Input placeholder="Enter amount" value={tokenAmountToUnstake} onChange={e => setTokenAmountToUnstake(e.target.value)} color="darkslateblue" />
                <Button onClick={() => unstake(tokenAmountToUnstake)} bg="slateblue" color="white" mt={2}>Unstake Tokens</Button>
              </Flex>
            </Box>
            <Box bg="#D3D2FF" borderRadius="lg" p={5}>  
              <Flex direction="column">
                <Text mb={2}>Claim Rewards</Text>
                <Button onClick={claimRewards} bg="slateblue" color="white">Claim Rewards</Button>
              </Flex>
            </Box>
          </VStack>
          <Box bg="lightgray" borderRadius="lg" p={5} mt={5}>
            <Heading size="lg" mb={2}>Your Staking Information</Heading>
            <Text fontSize="lg">Tokens staked: <Text as="span" fontWeight="bold" color="darkslateblue">{stakedAmount}</Text></Text>
            <Text fontSize="lg">Pending rewards: <Text as="span" fontWeight="bold" color="darkslateblue">{rewards}</Text></Text>
          </Box>
        </Box>
        <Box bg="#F3F2FF" border="3px solid darkslateblue" borderRadius="lg" p={5} color="black">
          <Heading color="darkslateblue" mb={5} size="xl">Staking Informations</Heading>
          <VStack spacing={5} align="stretch">
            <Box bg="#D3D2FF" borderRadius="lg" p={5}>
              <Text fontWeight="bold">Reward Rate:</Text>
              <Text mb={3}>6 MDT/NFT generated for an effective 9 months staking period</Text>
            </Box>
            <Box bg="#D3D2FF" borderRadius="lg" p={5}>
              <Text fontWeight="bold">Token Application:</Text>
              <Text mb={3}>As utility tokens, MDT tokens offer holders a 30% discount on the purchase of wine bottles originating from the vineyard in which they own a tokenized share</Text>
            </Box>
            <Box bg="#D3D2FF" borderRadius="lg" p={5}>
              <Text fontWeight="bold">Minimum Tokens for a Command:</Text>
              <Text>6 bottles, explaining therefore the aimed rate</Text>
            </Box>
          </VStack>
        </Box>
      </Grid>
    </Flex>
  )
  
  
};


export default StakingPoolID1
