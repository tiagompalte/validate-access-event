import { ethers } from 'ethers';
import contractAbi from './ABI.json';
import { TransactionResponse } from 'ethers';

export interface TicketData {
    ticketId: string;
    quantity: number;
    address: string;
    date: number;
    signature: string;
}

async function validateTicket(ticketData: TicketData): Promise<void> {
    // Validate the ticket data structure
    if (
        !ticketData.ticketId ||
        typeof ticketData.quantity !== 'number' ||
        !ethers.isAddress(ticketData.address) ||
        !ticketData.date ||
        !ticketData.signature
    ) {
        throw new Error('Invalid ticket data');
    }

    const ticketDate = new Date(ticketData.date);
    const now = new Date();
    const diffMs = Math.abs(now.getTime() - ticketDate.getTime());
    if (diffMs > 60 * 1000) {
        throw new Error('Ticket date is too old');
    }

    const message: any = {
        ticketId: ticketData.ticketId,
        quantity: ticketData.quantity,
        address: ticketData.address,
        date: ticketData.date,
    }

    const recoveredAddress = ethers.verifyMessage(JSON.stringify(message), ticketData.signature);

    if (recoveredAddress.toLowerCase() !== ticketData.address.toLowerCase()) {
        throw new Error('Invalid signature');
    }
}

export async function markTicketAsUsed(ticketData: TicketData): Promise<void> {
    // Validate the ticket data
    await validateTicket(ticketData);

    // Connect to Ethereum provider (e.g., Infura or local node)
    const provider = new ethers.JsonRpcProvider(process.env.ETH_RPC_URL);

    // Create a wallet instance from private key
    const privateKey = process.env.PRIVATE_KEY;
    if (!privateKey) {
        throw new Error('Missing PRIVATE_KEY in environment variables');
    }
    const wallet = new ethers.Wallet(privateKey, provider);

    const contractAddress = process.env.CONTRACT_ADDRESS;
    if (!contractAddress) {
        throw new Error('Missing CONTRACT_ADDRESS in environment variables');
    }

    // Connect to the contract
    const contract = new ethers.Contract(contractAddress, contractAbi, wallet);

    console.log('Marking ticket as used:', ticketData);

    // Call the contract method to mark the ticket as used
    const tx = await contract.markTicketAsUsed(
        ticketData.address,
        ticketData.ticketId,
        ticketData.quantity,
    ) as TransactionResponse;

    console.log('Transaction sent:', tx.hash);

    // Wait for the transaction to be mined
    console.log('Waiting for transaction to be mined...');
    await tx.wait();
}