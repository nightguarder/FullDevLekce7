import { S3Client} from '@aws-sdk/client-s3'
import dotenv from 'dotenv';
dotenv.config();

//Variables for S3 bucket
const bucket = process.env.AWS_BUCKET_NAME
const region = process.env.AWS_REGION
const accessKeyId = process.env.AWS_ACCESS_KEY_ID
const secretAccessKey= process.env.AWS_SECRET_ACCESS_KEY
export const fileUrl = `https://${bucket}.s3.${region}.amazonaws.com/`;
//USE AWS Config v3 only!
export const S3Instance = new S3Client({ 
    region: region,
    credentials: {
        accessKeyId: accessKeyId,
        secretAccessKey: secretAccessKey,
  },
})