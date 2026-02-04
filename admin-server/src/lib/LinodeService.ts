import {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
  CopyObjectCommand,
} from "@aws-sdk/client-s3";
import {config} from '../config/config.js'

/**
 * Service for interacting with Linode Object Storage
 */
class LinodeStorageService {
  private client: S3Client;
  private bucketName: string;
  private publicDomain: string;

  constructor() {
    // Linode Storage configuration
    this.bucketName = config.linode.bucket;
    // Initialize publicDomain to match the example construction style: https://${config.LINODE_BUCKET}
    this.publicDomain = `https://${this.bucketName}`;

    if (
      !config.linode.endpoint ||
      !config.linode.accessKey ||
      !config.linode.secretKey ||
      !config.linode.region
    ) {
      throw new Error(
        "Missing Linode Storage configuration. Please set LINODE_ENDPOINT, LINODE_ACCESS_KEY, LINODE_SECRET_KEY, LINODE_BUCKET, and LINODE_REGION environment variables.",
      );
    }

    this.client = new S3Client({
      region: config.linode.region,
      endpoint: config.linode.endpoint,
      credentials: {
        accessKeyId: config.linode.accessKey,
        secretAccessKey: config.linode.secretKey,
      },
      forcePathStyle: true,
    });
  }

  /**
   * Upload a file to storage
   */
  async uploadFile(
    file: Buffer,
    fileName: string,
    mimeType: string,
  ): Promise<{ key: string; url: string }> {
    try {
      const timestamp = Date.now();
      const uniqueId = Math.random().toString(36).substring(2, 18);
      const key = `kmg-news-fact-check/${config.server.NODE_ENV}/${timestamp}-${uniqueId}-${fileName.replace(/\s+/g, "-")}`;

      const command = new PutObjectCommand({
        Bucket: this.bucketName,
        Key: key,
        Body: file,
        ContentType: mimeType,
        ACL: "public-read", // Ensure the file is publicly readable
      });

      await this.client.send(command);

      // Construct permanent URL exactly like the example: https://${config.LINODE_BUCKET}/${uploadKey}
      const url = `https://${this.bucketName}/${key}`;

      return { key, url };
    } catch (error) {
      console.error("Error uploading to Linode Storage:", error);
      throw new Error("Failed to upload file to cloud storage");
    }
  }

  /**
   * Delete a file from storage
   */
  async deleteFile(key: string): Promise<void> {
    try {
      const command = new DeleteObjectCommand({
        Bucket: this.bucketName,
        Key: key,
      });

      await this.client.send(command);
    } catch (error) {
      console.error("Error deleting from Linode Storage:", error);
      throw new Error("Failed to delete file from cloud storage");
    }
  }

  /**
   * Get the public URL for a file
   */
  getPublicUrl(key: string): string {
    return `${this.publicDomain}/${key}`;
  }

  /**
   * Move a file from one folder to another
   */
  async moveFile(
    oldUrl: string,
    newFolder: "approved" | "suggested",
  ): Promise<string> {
    try {
      // Extract the key from the URL
      // Example URL: https://bucket.endpoint/key or https://bucket.linodeobjects.com/key
      const urlParts = oldUrl.split(`${this.bucketName}/`);
      if (urlParts.length < 2) {
        // If it's not a storage URL, return as is
        return oldUrl;
      }
      const oldKey = urlParts[1];

      // Generate new key by replacing the folder
      const newKey = oldKey.replace(
        /\/suggested\/|\/approved\//,
        `/${newFolder}/`,
      );

      if (oldKey === newKey) {
        return oldUrl; // Already in the correct folder
      }

      // 1. Copy the object
      const copyCommand = new CopyObjectCommand({
        Bucket: this.bucketName,
        CopySource: `/${this.bucketName}/${oldKey}`,
        Key: newKey,
        ACL: "public-read",
      });
      await this.client.send(copyCommand);

      // 2. Delete the old object
      await this.deleteFile(oldKey);

      // 3. Return the new URL
      return `https://${this.bucketName}/${newKey}`;
    } catch (error) {
      console.error("Error moving file in Linode Storage:", error);
      // Don't throw error here, just return oldUrl if migration fails but log it
      // This prevents the whole approval process from failing if storage move fails
      return oldUrl;
    }
  }

  /**
   * Check if the service is properly configured
   */
  isConfigured(): boolean {
    return !!(
      config.linode.endpoint &&
      config.linode.accessKey &&
      config.linode.secretKey &&
      config.linode.bucket
    );
  }
}

// Export as a singleton
export const storageService = new LinodeStorageService();

