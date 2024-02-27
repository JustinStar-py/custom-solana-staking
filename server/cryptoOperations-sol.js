require('dotenv').config();
const { Keypair, Transaction, Connection, PublicKey } = require("@solana/web3.js");
const { createTransferCheckedInstruction, TOKEN_PROGRAM_ID, getOrCreateAssociatedTokenAccount } = require("@solana/spl-token");
const bs58 = require("bs58");
const crypto = require("crypto");

const usersRandomHashCode = {};

// Replace with your RPC URL
const connection = new Connection("https://api.testnet.solana.com", "confirmed");

async function transfer(receiptAddress, amount) {
  try {
    const encodedSecret = process.env.PRIVATE_KEY;
    const secretKey = bs58.decode(encodedSecret);
    const payerKeypair = Keypair.fromSecretKey(secretKey);

    // Define public keys
    const mintPubkey = new PublicKey(process.env.TOKEN);

    // Define sender
    const senderPublicKey = new PublicKey(process.env.FROM_TOKEN_ACCOUNT_ADDRESS);

    // Define receiver
    const receiverPublicKey = new PublicKey(receiptAddress);

    // Ensure the recipient has an associated token account
    const toTokenAccount = await getOrCreateAssociatedTokenAccount(connection, payerKeypair, mintPubkey, receiverPublicKey);

    let tx = new Transaction();
    tx.add(
      createTransferCheckedInstruction(
        senderPublicKey, // from token account address
        mintPubkey, // mint (or token) address
        toTokenAccount.address, // to token account address
        payerKeypair.publicKey, // from's owner account (who pays fee as public address)
        amount, // amount
        6 // decimals
      )
    );

    // Sign and send the transaction
    let signature = await connection.sendTransaction(tx, [payerKeypair], {skipPreflight: false});
    return signature
  } catch (error) {
    console.error('Error transferring tokens:', error);
  }
}

async function makeSHA256(data) {
  return crypto.createHash('sha256').update(data).digest('hex');
}

async function getTokenAccountAddress(address) {
  const encodedSecret = process.env.PRIVATE_KEY;
  const secretKey = bs58.decode(encodedSecret);
  const payerKeypair = Keypair.fromSecretKey(secretKey);

  const mintPubkey = new PublicKey(process.env.TOKEN);
  const receiverPublicKey = new PublicKey(address);

  const toTokenAccount = await getOrCreateAssociatedTokenAccount(connection, payerKeypair, mintPubkey, receiverPublicKey);

  return toTokenAccount.address.toString();
}

async function getTransactionInfo(transactionHash) {
  try {
      // Fetch transaction details
      const transaction = await connection.getTransaction(transactionHash);

      // Parse transaction instructions
      const instructions = transaction.transaction.message.instructions;

      // Print transaction details
      const sender = transaction.transaction.message.accountKeys[0].toBase58();
      const receiver = transaction.transaction.message.accountKeys[1].toBase58();
      const transactionToken = transaction.transaction.message.accountKeys[2].toBase58();
      const transactionTimestamp = transaction.blockTime;
      const tokenAmount = transaction.meta.preTokenBalances[1].uiTokenAmount.uiAmount - transaction.meta.postTokenBalances[1].uiTokenAmount.uiAmount;
      
      return { sender, receiver, transactionToken, transactionTimestamp, tokenAmount };
    } catch (error) {
      console.error("Error fetching transaction details:", error);
  }
}

module.exports = { 
   transfer, getTokenAccountAddress, getTransactionInfo, 
   makeSHA256, connection, usersRandomHashCode 
};