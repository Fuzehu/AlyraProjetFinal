import React, {useState, useEffect, useRef} from 'react'

//CHAKRA UI
import { AlertDialog, AlertDialogBody, AlertDialogFooter, AlertDialogHeader, AlertDialogContent, AlertDialogOverlay, Box, Flex, Text, Button, Center, Heading } from '@chakra-ui/react'

const NotConnected = () => {
    const [isOpen, setIsOpen] = useState(true)
    const onClose = () => setIsOpen(false)
    const cancelRef = useRef()

    return (
        <Flex flexGrow={1} minHeight="100vh" flexDirection="column" justifyContent="flex-start" alignItems="center">
            <Box p={5} bg="#F3F2FF" border="3px solid darkslateblue" borderRadius="lg" width="50%" mt={10}>
                <Heading color="darkslateblue" mb={4}>WEB3 Provider Connection Required</Heading>
                <Text fontSize="xl" color="darkslateblue">You are not connected. Please connect your Wallet to continue.</Text>
            </Box>
        </Flex>
    )
}

export default NotConnected
