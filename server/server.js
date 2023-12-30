import express from 'express'
import cors from 'cors';
import fileUpload from 'express-fileupload'
import dotenv from 'dotenv';
import { S3Client, ListBucketsCommand, PutObjectCommand } from '@aws-sdk/client-s3'

//Express setup
const app = express();
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(fileUpload())

//dotenv config
const HOST = process.env.HOST || 'localhost'
const PORT = process.env.PORT || "5000"
dotenv.config();

app.options('*', cors());

//CORS config
app.use(cors()); 
app.use(cors({
    origin:['*'],
    methods:['GET','POST'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true 
  })); 

//AWS config
const s3Client = new S3Client({ 
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    region: process.env.AWS_REGION,
    signatureVersion: process.env.AWS_SIGNATURE_VERSION });

//Default endpoint
app.get('/',(req,res) => {
    res.send(' Nothing to see here... GET/')
})

app.post('/begin-upload', async (req, res) => {
  //naming has to be same on frontend and here
  let fileName = req.body.fileName;
  let fileType = req.body.fileType;
  //console.log(fileType)
  // Check the file type

  // PutObjeckCommand to S3 bucket
  const command = new PutObjectCommand({
    Bucket: process.env.AWS_BUCKET_NAME,
    Key: fileName.name,
    Body: fileName.data,
  });

  try {
    // Upload the file to S3
    const response = await s3Client.send(command);

    // Get the signed URL of the uploaded file
    const url = await getSignedUrl(s3Client, command, { expiresIn: 3600 });

    // Respond with the file location and a fake uploadID
    res.send({
      fileLocation: url,
      uploadID: 70,
    });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
});

app.post('/process-upload', async (req, res) => {
    let fileName = req.files.image;

    if (!req.files || Object.keys(req.files).length === 0) {
      return res.status(400).send('No files were uploaded.');
    }
    
    // Create a new PutObjectCommand
    const command = new PutObjectCommand({
      Bucket: process.env.AWS_BUCKET_NAME,
      Key: fileName.name,
      Body: fileName.data,
    });
  
    try {
      // Upload the file to S3
      const response = await s3Client.send(command);
  
      res.json({ success: true, message: 'Image uploaded!' });
    } catch (error) {
      res.json({ success: false, message: error.message });
    }
  });
  //List all available S3 buckets
  app.get('/buckets', async (req, res) => {
    const command = new ListBucketsCommand({})
    try {
        const { Owner, Buckets } = await s3Client.send(command)
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
