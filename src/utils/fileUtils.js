/**
 * Generates a SHA-256 hash of a file's contents for deduplication and verification purposes.
 * Uses the Web Crypto API for secure hashing.
 * 
 * @param {File} file - The file object to hash (from file input or drag-and-drop)
 * @returns {Promise<string>} - Hexadecimal string representation of the SHA-256 hash
 * @throws {Error} - If the input is invalid or hashing fails
 */
export const getFileHash = async (file) => {
  try {
    // Validate input
    if (!file || !(file instanceof Blob)) {
      throw new Error("Invalid file input: Must be a valid File or Blob object");
    }

    if (file.size === 0) {
      throw new Error("Cannot hash empty file");
    }

    // Step 1: Convert file to ArrayBuffer for hashing
    const arrayBuffer = await file.arrayBuffer();

    // Step 2: Generate SHA-256 hash (returns a Promise)
    const hashBuffer = await crypto.subtle.digest('SHA-256', arrayBuffer);

    // Step 3: Convert the hash buffer to a Uint8Array
    const hashArray = new Uint8Array(hashBuffer);

    // Step 4: Convert each byte to hexadecimal string
    const hashHexParts = Array.from(hashArray).map(byte => 
      byte.toString(16).padStart(2, '0')
    );

    // Step 5: Combine all hex parts into a single string
    const hashHex = hashHexParts.join('');

    // Validate the resulting hash (SHA-256 should be 64 chars)
    if (hashHex.length !== 64) {
      throw new Error("Unexpected hash length - hashing may have failed");
    }

    return hashHex;
  } catch (error) {
    console.error("File hashing failed:", error);

    // Enhance specific error messages
    if (error.name === 'NotSupportedError') {
      throw new Error("SHA-256 hashing is not supported in this context");
    }
    if (error.name === 'DataError') {
      throw new Error("Invalid data format for hashing");
    }
    throw new Error(`Failed to generate file hash: ${error.message}`);
  }
};
