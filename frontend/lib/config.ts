export const config = {
  apiUrl: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api',
  mainDomain: process.env.NEXT_PUBLIC_MAIN_DOMAIN || 'localhost:3000',
  s3BucketUrl: process.env.NEXT_PUBLIC_S3_BUCKET_URL || '',
};
