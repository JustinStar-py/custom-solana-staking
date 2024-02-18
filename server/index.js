// server/index.js
const express = require("express");
const admin = require("firebase-admin");
const cors = require("cors");
const PORT = process.env.PORT || 5000;
const app = express();

// Middleware
app.use(express.json());
app.use(cors({origin: "http://localhost:3000", credentials: true}));

// Initialize Firebase
var serviceAccount = require("./firebase-adminsdk.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://wagmi-staking-default-rtdb.firebaseio.com"
});

const db = admin.database();

// Sign up a new user
app.post('/signup', (req, res) => {
    const { walletAddress, userId } = req.body;
   console.log(req.body);
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
            totalStaked: 0,
            claimableTokens: 0,
            stakingStartDate: null,
            stakingDuration: 0,
            stakingRewards: null
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

app.get("/stake", (req, res) => {
    console.log("here")
    res.json({ message: "Hello from server!" });
});

app.listen(PORT, () => {
    console.log(`Server listening on ${PORT}`);
});
