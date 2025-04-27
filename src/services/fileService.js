import { db, storage } from "../appwriteConfig";
import { Query } from "appwrite";

const databaseId = process.env.REACT_APP_APPWRITE_DATABASE_ID;
const collectionId = process.env.REACT_APP_DATABASE_COLLECTION_ID;
const bucketId = process.env.REACT_APP_APPWRITE_BUCKET_ID;

/**
 * Checks if a file with the same hash already exists in the database.
 * This helps prevent duplicate file uploads and enables deduplication.
 * 
 * @param {string} hash - The file's unique hash (e.g., SHA-256 checksum)
 * @returns {Promise<boolean>} - True if a duplicate exists, false otherwise
 * @throws {Error} - If the database query fails
 */
export const checkDuplicateHash = async (hash) => {
  try {
    if (!hash) {
      throw new Error("Hash parameter is required");
    }
    const response = await db.listDocuments(databaseId, collectionId, [
      Query.equal("hash", hash)
    ]);
    return response.documents.length > 0;
  } catch (error) {
    console.error("Error checking for duplicate hash:", error);
    throw new Error(`Failed to check for duplicates: ${error.message}`);
  }
};

/**
 * Saves file metadata to the database.
 * 
 * @param {string} fileId - The ID of the file in storage
 * @param {string} name - The original filename
 * @param {string} hash - The file's unique hash
 * @param {string} uploaderName
 * @param {string} uploaderEmail
 * @param {string} uploaderDepartment
 * @returns {Promise<object>} - The created document
 * @throws {Error} - If the operation fails
 */
export const saveFileMetadata = async (fileId, name, hash, uploaderName, uploaderEmail, uploaderDepartment) => {
  try {
    if (!fileId || !name || !hash || !uploaderName || !uploaderDepartment || !uploaderEmail) {
      throw new Error("All parameters (fileId, name, hash, uploaderName, uploaderEmail, uploaderDepartment) are required");
    }
    return await db.createDocument(databaseId, collectionId, "unique()", {
      fileId,
      name,
      hash,
      uploaderName,
      uploaderEmail,
      uploaderDepartment
    });
  } catch (error) {
    console.error("Error saving file metadata:", error);
    throw new Error(`Failed to save file metadata: ${error.message}`);
  }
};

/**
 * Uploads a file to Appwrite storage.
 * 
 * @param {File} file - The file to upload
 * @returns {Promise<object>} - The uploaded file object
 * @throws {Error} - If the upload fails
 */
export const uploadFileToStorage = async (file) => {
  try {
    if (!file) {
      throw new Error("File parameter is required");
    }
    return await storage.createFile(bucketId, "unique()", file);
  } catch (error) {
    console.error("Error uploading file to storage:", error);
    if (error.code === 'storage_quota_exceeded') {
      throw new Error("Storage quota exceeded. Please upgrade your plan.");
    }
    throw new Error(`Failed to upload file: ${error.message}`);
  }
};
