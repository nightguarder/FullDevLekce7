const express = require('express');
const cors = require('cors');
import dotenv from 'dotenv'

const app = express();

//dotenv config
const HOST = process.env.HOST || 'localhost'
const PORT = process.env.PORT || "3000"

//CORS config
app.use(cors()); 
app.use(cors({
    origin:['*'],
    methods:['GET','POST'],
    credentials: true 
  })); 

//Default endpoint
app.get('/',(req,res) => {
    res.send(' Nothing to see here: GET/')
})

app.post('/begin-upload', (req, res) => {
  // Handle the upload here
});

app.listen(PORT, HOST, () => {
    console.log(`Server is running at http://${HOST}:${PORT}`);
  });
