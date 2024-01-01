import { S3Client} from '@aws-sdk/client-s3'
import { createPresignedPost} from '@aws-sdk/s3-presigned-post'
import dotenv from 'dotenv';
import  {v4 as uuid} from 'uuid';
dotenv.config();

//Variables for S3 bucket
export const bucket = process.env.AWS_BUCKET_NAME //fulldevlekce7
export const region = process.env.AWS_REGION //eu-north-1
const accessKeyId = process.env.AWS_ACCESS_KEY_ID //env secret
const secretAccessKey= process.env.AWS_SECRET_ACCESS_KEY //env secret

//USE AWS Config v3 only!
export const S3Instance = new S3Client({ 
    region: region,
    credentials: {
        accessKeyId: accessKeyId,
        secretAccessKey: secretAccessKey,
  },
});

export async function generateUploadUrl(type) {
    //Generate temporary id to avoid conflicts
    const name = uuid();
    const expiresInMinutes = 5; //5 minutes
    //using Amazon AWS S3's "presigned post url" feature
    const data = await createPresignedPost(S3Instance, {
      Bucket: bucket,
      Key: `public/${name}`,
      Expires: expiresInMinutes * 60,
      Conditions: [["eq", "$Content-Type", type]],
    });
    return data;
  }