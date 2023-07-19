import React, { useState, useEffect } from 'react';
import { Button, Input, Text, Box, Heading, Flex, useToast } from '@chakra-ui/react';
import { ethers } from 'ethers';
import { useAccount } from 'wagmi';
import { prepareWriteContract, writeContract, readContract } from '@wagmi/core';

const StakingPoolId1Admin = () => {


    return (
        <div>
          admin staking content
        </div>
    )
}

export default StakingPoolId1Admin
