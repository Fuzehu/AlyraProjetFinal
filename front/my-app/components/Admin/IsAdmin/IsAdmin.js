"use client"

import React, { useState } from 'react'
import { Menu, MenuButton, Button, MenuList, MenuItem, Box, Flex, Text } from '@chakra-ui/react'
import { ChevronDownIcon } from '@chakra-ui/icons'
import ERC1155Admin from './Features/ERC1155Admin'
import ERC20Admin from './Features/ERC20Admin'
import StakingPoolId1Admin from './Features/StakingPoolId1Admin'
import ContractsLogs from './Features/ContractsLogs'

const IsAdmin = () => {
    const [selectedOption, setSelectedOption] = useState('Functionality of your choice');

    const renderComponent = () => {
        switch(selectedOption) {
            case 'Tokenize Admin = ERC1155':
                return <ERC1155Admin />;
            case 'DiscountToken Admin = ERC20':
                return <ERC20Admin />;
            case 'Staking Pool ID1 Admin':
                return <StakingPoolId1Admin />;
            case 'Contracts Logs':
                return <ContractsLogs />;
            default:
                return null;
        }
    }

    return (
        <Box flexGrow={1}>
            <Flex alignItems="center" mb={3}>
                <Text fontSize="xl" color="darkslateblue" ml="2em">Select the Admin functionalities you want to access:</Text>
                <Menu>
                    <MenuButton as={Button} rightIcon={<ChevronDownIcon />} bg="slateblue" color="white" ml="2em">
                        {selectedOption}
                    </MenuButton>
                    <MenuList>
                        <MenuItem onClick={() => setSelectedOption('Tokenize Admin = ERC1155')}>Tokenize Admin = ERC1155</MenuItem>
                        <MenuItem onClick={() => setSelectedOption('DiscountToken Admin = ERC20')}>DiscountToken Admin = ERC20</MenuItem>
                        <MenuItem onClick={() => setSelectedOption('Staking Pool ID1 Admin')}>Staking Pool ID1 Admin</MenuItem>
                        <MenuItem onClick={() => setSelectedOption('Contracts Logs')}>Contracts Logs</MenuItem>
                    </MenuList>
                </Menu>
            </Flex>
            {renderComponent()}
        </Box>
    )
}

export default IsAdmin
