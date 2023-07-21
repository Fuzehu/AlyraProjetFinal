"use client"

import React, { useState } from 'react'
import { Menu, MenuButton, Button, MenuList, MenuItem, Box, Heading, Flex, Text } from '@chakra-ui/react'
import { ChevronDownIcon } from '@chakra-ui/icons'
import ERC1155 from './Features/ERC1155'
import ERC20 from './Features/ERC20'
import StakingPoolId1Admin from './Features/StakingPoolId1Admin'
import Fundraiser from './Features/Fundraiser'

const IsAdmin = () => {
    const [selectedOption, setSelectedOption] = useState('Functionality of your choice');

    const renderComponent = () => {
        switch(selectedOption) {
            case 'FundRaising Admin = NFT presale & mint':
                return <Fundraiser />;
            case 'Tokenize Admin = ERC1155':
                return <ERC1155 />;
            case 'DiscountToken Admin = ERC20':
                return <ERC20 />;
            case 'Staking Pool ID1 Admin':
                return <StakingPoolId1Admin />;
            default:
                return null;
        }
    }

    return (
        <Box flexGrow={1} p="3em">
            <Heading fontSize="2xl" color="darkslateblue" ml="1em" mt="1em">Welcome to the Admin page!</Heading>
            <Text fontSize="lg" color="darkslateblue" ml="1em" mb="1em">Here you can manage different aspects from the contracts used in the DAPP, such as Tokenization, Discount Tokens, Fundraising and the Staking Pool Management. Choose a functionality from the dropdown below to proceed.</Text>
            <Box bg="darkslateblue" p={5} borderRadius="lg" boxShadow="md" mb={5}>
                <Flex alignItems="center" mb={3}>
                    <Text fontSize="xl" color="white" ml="1em">Select the Admin functionalities you want to access :</Text>
                    <Menu>
                        <MenuButton as={Button} rightIcon={<ChevronDownIcon />} bg="white" color="darkslateblue" ml="1em">
                            {selectedOption}
                        </MenuButton>
                        <MenuList color="darkslateblue" bg="lightgray">
                            <MenuItem onClick={() => setSelectedOption('Tokenize Admin = ERC1155')}>Tokenize = ERC1155</MenuItem>
                            <MenuItem onClick={() => setSelectedOption('DiscountToken Admin = ERC20')}>DiscountToken = ERC20</MenuItem>
                            <MenuItem onClick={() => setSelectedOption('FundRaising Admin = NFT presale & mint')}>FundRaiser = Tokenized GFV presale & mint</MenuItem>
                            <MenuItem onClick={() => setSelectedOption('Staking Pool ID1 Admin')}>Staking Pool ID1</MenuItem>
                        </MenuList>
                    </Menu>
                </Flex>
            </Box>
            {renderComponent()}
        </Box>
    )
}

export default IsAdmin
