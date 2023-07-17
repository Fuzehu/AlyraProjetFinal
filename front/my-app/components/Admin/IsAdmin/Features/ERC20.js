import React, { useState, useEffect} from 'react'
// CHAKRA-UI
import { Heading, Flex, Text, Input, Button, useToast, Box } from '@chakra-ui/react'
// CONTRACT
import Contract from '../../../../public/artifacts/contracts/DiscountToken.sol/DiscountToken.json'
import { ethers } from "ethers"
// WAGMI
import { prepareWriteContract, writeContract, readContract } from '@wagmi/core'
import { useAccount } from 'wagmi'
// VIEM (events)
import { createPublicClient, http, parseAbiItem } from 'viem'
import { hardhat, sepolia } from 'viem/chains'



const ERC20 = () => {

    // CONTRACT ADDRESS
    const contractAddress = process.env.NEXT_PUBLIC_DISCOUNTTOKEN_CONTRACT_ADDRESS

    // CREATE VIEM CLIENT (events)
    const client = createPublicClient({
      chain: hardhat, sepolia,
      transport: http(),
    })

    // GET LOGGED WALLET INFO
    const { isConnected, address } = useAccount()

    // CHAKRA-UI TOAST 
    const toast = useToast()

    //STATES
    const [adminAddressToAdd, setAdminAddressToAdd] = useState('');
    const [adminAddressToRevoke, setAdminAddressToRevoke] = useState('');
    const [addAdminRightsEvent, setAddAdminRightsEvent] = useState([]);
    const [revokeAdminRightsEvent, setRevokeAdminRightsEvent] = useState([]);


////////////////////////////////////////////////////// *-- Functions *-- //////////////////////////////////////////////////////


    const addAdminRights = async (_addr) => {

        try {
            const { request } = await prepareWriteContract({
                address: contractAddress,
                abi: Contract.abi,
                functionName: "addAdminRights",
                args: [_addr],
            })

            await writeContract(request)
            await getAddAdminRightsLogs()            

            toast({
                title: 'Success !',
                description: `${_addr} has been successfully registered as admin !`,
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


    const revokeAdminRights = async (_addr) => {

        try {
            const { request } = await prepareWriteContract({
                address: contractAddress,
                abi: Contract.abi,
                functionName: "revokeAdminRights",
                args: [_addr],
            })

            await writeContract(request)
            await getRevokeAdminRightsLogs()            

            toast({
                title: 'Success !',
                description: `${_addr} has been successfully revoked as admin !`,
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
  
    


////////////////////////////////////////////////////// *-- Events *-- //////////////////////////////////////////////////////


    const getAddAdminRightsLogs = async () => {
        const addAdminRightsLogs = await client.getLogs({
            event: parseAbiItem('event AdminRightsGranted(address indexed newAdminAddress)'),
            fromBlock: 0n,
            toBlock: 'latest'
        })
        setAddAdminRightsEvent(addAdminRightsLogs.map(
            log => ({
                address: log.args.newAdminAddress
            })
        ))
  }

  const getRevokeAdminRightsLogs = async () => {
      const revokeAdminRightsLogs = await client.getLogs({
          event: parseAbiItem('event AdminRightsRevoked(address indexed adminAddress)'),
          fromBlock: 0n,
          toBlock: 'latest'
      })
      setRevokeAdminRightsEvent(revokeAdminRightsLogs.map(
          log => ({
              address: log.args.adminAddress
          })
      ))
  }

  useEffect(() => {
      getAddAdminRightsLogs()
      getRevokeAdminRightsLogs()
  }, []);




    return (
        <Flex flexDirection="column" alignItems="center">
            <Flex flexDirection="row" width="100%" justifyContent="space-around">
                <Box width="50%" p={5}>
                    <Heading>Add Admin Rights</Heading>
                    <Input placeholder="Enter address" mb={3} value={adminAddressToAdd} onChange={e => setAdminAddressToAdd(e.target.value)} />
                    <Button onClick={() => addAdminRights(adminAddressToAdd)} colorScheme="blue">Add Admin Rights</Button>
                </Box>

                <Box width="50%" p={5}>
                    <Heading>Revoke Admin Rights</Heading>
                    <Input placeholder="Enter address" mb={3} value={adminAddressToRevoke} onChange={e => setAdminAddressToRevoke(e.target.value)} />
                    <Button onClick={() => revokeAdminRights(adminAddressToRevoke)} colorScheme="blue">Revoke Admin Rights</Button>
                </Box>
            </Flex>

            <Box width="100%" p={5}>
                <Heading>Admin Addresses</Heading>
                {addAdminRightsEvent.map((event, index) => 
                    <Text key={index}>{event.address}</Text>
                )}
            </Box>
        </Flex>
        
    )
}

export default ERC20
