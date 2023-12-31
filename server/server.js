import express from 'express'
import cors from 'cors';
import fileUpload from 'express-fileupload'
import dotenv from 'dotenv';
import {ListBucketsCommand, ListObjectsCommand} from '@aws-sdk/client-s3';
import { S3Instance, generateUploadUrl, bucket,region} from './AWSClient.js'
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
    credentials: true, 
    exposedHeaders: 'Location'
  })); 


//Default endpoint
app.get('/',(req,res) => {
    res.send(' Nothing to see here... GET/')
})

//AWS upload
app.post('/begin-upload', async function (req, res) {
    try {
        const type = req.body.type;
        //console.log(type)
        if (!type) {
          return res.status(400).json("invalid request body");
        }
        //This will generate S3 Signed Upload url
        const data = await generateUploadUrl(type);
        console.log('Data from generateUploadUrl:', data);
        return res.json(data);
      } catch (e) {
        console.error('Error in /begin-upload:', e);
        return res.status(500).json(e.message);
      }
});
//Respond with the url of the uploaded file
app.post('/process-upload', async function (req, res) {
    const uploadID = req.body.fileKey;
    const fileUrl = `https://${bucket}.s3.${region}.amazonaws.com/${uploadID}`;
    res.send({ fileUrl: fileUrl });
});
  //List all available S3 buckets
app.get('/buckets', async (req, res) => {
    const command = new ListBucketsCommand({}) 
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

//List all available files in /fulldevlekce7/public
app.get('/files', async (req, res) => {
    const command = new ListObjectsCommand({ Bucket: process.env.AWS_BUCKET_NAME, Prefix: 'public/' }) 
    try {
        const data = await S3Instance.send(command);
        const files = data.Contents.map(file => file.Key);
        res.json(files);
    } catch(e) {
        console.error(e);
        res.status(400).json({
            error: e.message
        });
    }
});
//Delete a file with the provided key
app.delete('/delete-file',async(req,res)=>{
    const uniqueKey = req.body.fileKey;

  const params = {
    Bucket: bucket,
    Key: 'public/' + uniqueKey
  };

  try {
    const data = await S3Instance.deleteObject(params).promise();
    res.json({ message: `File at  public/${uniqueKey} has been deleted!` });
  } 
  catch (error) {
    console.log('ERROR in file Deleting : ' + JSON.stringify(error));
    res.status(500).json({ error: 'Error -> ' + error });
  }
});

//Delete the uploaded file
app.listen(PORT, HOST, () => {
    console.log(`Server is running at http://${HOST}:${PORT}`);
  });
