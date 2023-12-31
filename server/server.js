import express from 'express'
import cors from 'cors';
import fileUpload from 'express-fileupload'
import dotenv from 'dotenv';
import {PutObjectCommand} from '@aws-sdk/client-s3';
import { S3Instance, fileUrl} from './AWSClient.js'
import { getSignedUrl} from "@aws-sdk/s3-request-presigner";
//Express setup
const app = express();
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(fileUpload())

//dotenv config
dotenv.config();
const HOST = process.env.HOST || 'localhost'
const PORT = process.env.PORT || "5000"

//CORS config
app.use(cors({
    origin:['http://localhost:5173', '*'],
    methods:['GET','POST', 'DELETE', 'PUT'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true 
  })); 


//Default endpoint
app.get('/',(req,res) => {
    res.send(' Nothing to see here... GET/')
})

app.post('/begin-upload', async (req, res) => {
  //naming has to be same on frontend and here
  let fileName = req.body.fileName;
  let fileType = req.body.fileType;
  const signedUrlExpireSeconds = 60 * 5; //10 minutes

  let fullUrl = `${fileUrl}${fileName}`;
  
  let uploadParams = {Key:fileName, Bucket: process.env.AWS_BUCKET_NAME, ContentType: fileType }
  // S3 command for SignedUrl
  const command = new PutObjectCommand({uploadParams});
  try {
    // Get the signed URL for the S3 PUT operation
    const url = await getSignedUrl(S3Instance, command, signedUrlExpireSeconds);
    console.log(url)
    // Respond with the uploaded file URL
    res.send({
      fileLocation: url,
      fileUrl: fullUrl
    });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }

});

app.post('/process-upload', async (req, res) => {

    
  });
  //List all available S3 buckets
  app.get('/buckets', async (req, res) => {
    const command = new AWS3.ListBucketsCommand({}) 
    try {
        const { Owner, Buckets } = await S3Instance.send(command)
        res.json({
            owner: Owner.DisplayName,
            buckets: Buckets
        })
    } catch(e) {
        console.error(e)
        res.status(400).json({
            error: e.message
        })
    }
})

app.listen(PORT, HOST, () => {
    console.log(`Server is running at http://${HOST}:${PORT}`);
  });
