import React from 'react'

//CHAKRA UI
import { AlertDialog, AlertDialogBody, AlertDialogFooter, AlertDialogHeader, AlertDialogContent, AlertDialogOverlay, Box, Flex, Text, Button } from '@chakra-ui/react'

const NotConnected = () => {
    const [isOpen, setIsOpen] = React.useState(true)
    const onClose = () => setIsOpen(false)
    const cancelRef = React.useRef()

    return (
        <Box flexGrow={1} minHeight="100vh" display="flex" flexDirection="column">
            <AlertDialog
                isOpen={isOpen}
                leastDestructiveRef={cancelRef}
                onClose={onClose}
            >
                <AlertDialogOverlay>
                    <AlertDialogContent>
                        <AlertDialogHeader fontSize="lg" fontWeight="bold">
                            Connection required
                        </AlertDialogHeader>

                        <AlertDialogBody>
                            You are not connected. Please connect your Wallet to continue.
                        </AlertDialogBody>

                        <AlertDialogFooter>
                            <Button ref={cancelRef} onClick={onClose}>
                                Ok
                            </Button>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialogOverlay>
            </AlertDialog>
        </Box>
    )
}

export default NotConnected
