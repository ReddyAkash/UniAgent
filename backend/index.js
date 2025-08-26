const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const admin = require('firebase-admin');
const serviceAccount = require('./serviceAccountKey.json');

const app = express();
app.use(cors());
app.use(bodyParser.json());

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

// Signup route
app.post('/signup', async (req, res) => {
    const { userId, username, email, passwordHash } = req.body;
    if(!userId || !username || !email || !passwordHash) return res.status(400).json({message:'Missing fields'});

    const userRef = db.collection('users').doc(userId);
    const docSnap = await userRef.get();
    if(docSnap.exists) return res.status(400).json({message:'User ID already exists'});

    await userRef.set({ username, email, passwordHash });
    res.json({message:'User created successfully'});
});

// Signin route
app.post('/signin', async (req, res) => {
    const { userId, passwordHash } = req.body;
    if(!userId || !passwordHash) return res.status(400).json({message:'Missing fields'});

    const userRef = db.collection('users').doc(userId);
    const docSnap = await userRef.get();
    if(!docSnap.exists) return res.status(400).json({message:'User not found'});

    const userData = docSnap.data();
    if(userData.passwordHash !== passwordHash) return res.status(400).json({message:'Incorrect password'});

    res.json({username:userData.username});
});

app.listen(3000, ()=>console.log('Backend running on http://localhost:3000'));
