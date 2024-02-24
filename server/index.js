// server/index.js
require("dotenv").config();
const express = require("express");
const admin = require("firebase-admin");
const cors = require("cors");
const crypto = require("crypto");
const nacl = require('tweetnacl');
const bs58 = require('bs58');
const { transfer, makeSHA256, usersRandomHashCode } = require('./cryptoOperations-sol');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(express.json());
app.use(cors({ origin: "http://localhost:3000", credentials: true }));

// Initialize Firebase
var serviceAccount = require("./firebase-adminsdk.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://wagmi-staking-default-rtdb.firebaseio.com"
});

const db = admin.database();

// Sign up a new user
app.post('/signup', (req, res) => {
    const { walletAddress, userId, pool } = req.body;
    let stakingPool = {};
    
    switch (pool) {
      case 1:
        stakingPool = { apy: 10, lockDuration: 1 };
        break;
      case 2:
        stakingPool = { apy: 35, lockDuration: 3 };
        break;
      case 3:
        stakingPool = { apy: 45, lockDuration: 7 };
        break;
    }

    // Here 'users' is assumed to be the collection where user data is being stored.
    const userRef = admin.database().ref(`users/${userId}`);
    userRef.once('value')
      .then(snapshot => {
        if (snapshot.exists()) {
          // User already exists, return the existing data
          return res.status(200).json({ userId: snapshot.val().userId, ...snapshot.val() });
        } else {
          // User does not exist, create a new user entry
          userRef.set({ 
            userId: userId, 
            walletAddress: walletAddress,
            stakingPool: stakingPool,
            totalStaked: 0,
            claimableTokens: 0,
            stakingStartDate: 0,
            stakingDuration: 0,
            lastUpdate: new Date().getTime()
          })
            .then(() => {
              return res.status(201).json({ userId: userId });
            })
            .catch(error => {
              // Handle errors in creating the user
              return res.status(500).send(error.message);
            });
        }
      })
      .catch(error => {
        // Handle any other errors
        res.status(500).send(error.message);
      });
});  

app.post("/stake", async (req, res) => {
    const { singature, amount, userAddress, userId } = req.body;
    
    // Concatenate the user address, amount, and secret and then hash it
    const dataToHash = userAddress + amount.toString() + process.env.SECRET + usersRandomHashCode[userAddress];
    const hash = await makeSHA256(dataToHash);

    if (hash === singature) {
        // Update the user's total staked amount
        const userRef = admin.database().ref(`users/${userId}`);
        userRef.once('value')
        .then(snapshot => {
          if (snapshot.exists()) {
             const existingData = snapshot.val();
             const totalStaked = Number(existingData.totalStaked) + Number(amount);
             if (snapshot.val().stakingStartDate === 0) {
               const stakingStartDate = Date.now();
               userRef.update({ stakingStartDate, stakingDuration: snapshot.val().stakingPool.lockDuration, lastUpdate: Date.now() });
             }
             userRef.update({ totalStaked, lastUpdate: Date.now() });
             return res.status(200).json({ totalStaked });
            }
          });
    }
});

app.post("/unstake", async (req, res) => {
  const { signature, amount, userAddress, userId } = req.body;

  // Concatenate the user address, amount, and secret and then hash it
  const dataToHash = userAddress + amount.toString() + process.env.SECRET + usersRandomHashCode[userAddress];
  const hash = await makeSHA256(dataToHash);

  // Convert the signature from a Buffer to a Uint8Array
  const signatureUint8Array = new Uint8Array(signature.signature.data);

  // Verify the signature
  const verified = nacl.sign.detached.verify(
    new TextEncoder().encode(hash),
    signatureUint8Array,
    bs58.decode(userAddress) // Assuming the userAddress is the public key
  );

  if (verified) {
    // Update the user's total staked amount
    const userRef = admin.database().ref(`users/${userId}`);
    userRef.once('value')
    .then(snapshot => {
      if (snapshot.exists()) {
        const existingData = snapshot.val();
        const totalStaked = Number(existingData.totalStaked) - Number(amount);
        const signTransaction = transfer(existingData.walletAddress, Number(amount) * 10 ** process.env.TOKEN_DECIMALS);
        userRef.update({ totalStaked, lastUpdate: Date.now() });
        return res.status(200).json({ totalStaked });
      }
    });
  } else {
    // If the signature is not valid, return an error
    res.status(403).send('Invalid signature');
  }
});

app.post("/claim", (req, res) => {
  const { userId } = req.body;

  // Update the user's claimable tokens
  const userRef = admin.database().ref(`users/${userId}`);
  userRef.once('value')
  .then(snapshot => {
    if (snapshot.exists()) {
      const existingData = snapshot.val();
      const claimableTokens = Number(existingData.claimableTokens) + Number(existingData.totalStaked);
      return res.status(200).json({ claimableTokens });
    }
  });
})

app.get("/user/:userId", (req, res) => {
  const { userId } = req.params;
  const userRef = admin.database().ref(`users/${userId}`);
  userRef.once('value')
  .then(snapshot => {
    if (snapshot.exists()) {
      const stakingPool = snapshot.val().stakingPool;
      const totalStaked = snapshot.val().totalStaked;
      const lastUpdate = snapshot.val().lastUpdate;

      // Calculate the number of minutes staked
      const currentDate = Date.now();
      const minutesPassed = Math.floor((currentDate - lastUpdate) / (1000 * 60));

      // Calculate APY per minute
      const apyPerMinute = (stakingPool.apy / 365 / 24 / 60) / 100;

      // Calculate claimable tokens using compounding interest formula
      const claimableTokens =  snapshot.val().claimableTokens + (totalStaked * Math.pow(1 + apyPerMinute, minutesPassed) - totalStaked);

      // Update claimable tokens in the database
      userRef.update({ claimableTokens, lastUpdate: currentDate });

      // Return user data along with claimable tokens
      return res.status(200).json({ ...snapshot.val(), claimableTokens });
    } else {
      return res.status(404).json({ error: "User not found" });
    }
  })
  .catch(error => {
    return res.status(500).json({ error: error.message });
  });
})

app.get("/get-signature/:userAddress/:amount", async (req, res) => {
  const { userAddress, amount } = req.params;

  // Generate a random hash code
  usersRandomHashCode[userAddress] = Math.random() * 1000000;

  // Concatenate the user address, amount, and secret and then hash it
  const dataToHash = userAddress + amount.toString() + process.env.SECRET + usersRandomHashCode[userAddress];
  const signature = await makeSHA256(dataToHash);

  return res.status(200).json({ signature });
});

app.listen(PORT, () => {
    console.log(`Server listening on ${PORT}`);
});
