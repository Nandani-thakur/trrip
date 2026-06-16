const { S3Client, DeleteObjectCommand } = require("@aws-sdk/client-s3");

const s3 = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

/**
 * Delete a file from S3 by its key
 */
const deleteFromS3 = async (key) => {
  try {
    const command = new DeleteObjectCommand({
      Bucket: process.env.AWS_S3_BUCKET,
      Key: key,
    });
    await s3.send(command);
    console.log(`🗑️ Deleted from S3: ${key}`);
  } catch (error) {
    console.error(`Failed to delete from S3: ${error.message}`);
    // Don't throw — S3 deletion failure shouldn't break the flow
  }
};

module.exports = { deleteFromS3 };