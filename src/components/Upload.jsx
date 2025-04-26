import React, { useState } from "react";
import Modal from "react-modal";
import { FileUploader } from "react-drag-drop-files";
import ReactLoading from "react-loading";
import { getFileHash } from "../utils/fileUtils";
import { checkDuplicateHash, saveFileMetadata, uploadFileToStorage } from "../services/fileService";
import { toast } from "react-toastify";

const Upload = ({ onUploadSuccess }) => {
  const [modalIsOpen, setIsOpen] = useState(false);
  const [file, setFile] = useState(null);
  const [nfile, setNFile] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (file) => setFile(file);

  const closeModal = () => {
    setIsOpen(false);
    setLoading(false);
    setFile(null);
    setNFile("");
  };

  const uploadFileToAppwrite = async () => {
    if (!file || !nfile) {
      toast.error("Please provide a file and a name.");
      return;
    }
    setLoading(true);
    try {
      //1. Generate  SHA-256 hash value
      const hash = await getFileHash(file);
      //2. Check for duplicates
      const isDuplicate = await checkDuplicateHash(hash);
      if(isDuplicate){
        toast.error("This file has already been uploaded.");
        return;
      }
      //3. Upload file to appwrite
      const uploadResponse = await uploadFileToStorage(file);
      //4. Save metaData to database
      await saveFileMetadata(uploadResponse.$id, nfile, hash);
      
      toast.success("File uploaded successfully");
      if (onUploadSuccess) onUploadSuccess();
    } catch (error) {
      toast.error("Failed to upload file, PLease try again")
      console.error(error);
    } finally {
      closeModal();
    }
  };

  return (
    <div>
      <button
        onClick={() => setIsOpen(true)}
        className="bg-emerald-500 px-4 py-2 rounded-lg text-white hover:bg-emerald-800 transition"
      >
        UPLOAD
      </button>
      <Modal
        isOpen={modalIsOpen}
        onRequestClose={closeModal}
        className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-30"
        overlayClassName="fixed inset-0"
        ariaHideApp={false}
      >
        <div className="bg-white rounded-lg p-8 w-full max-w-md">
          <h2 className="text-xl font-semibold mb-4">Upload File</h2>
          {loading ? (
            <div className="flex justify-center items-center">
              <ReactLoading type="spokes" color="green" height={60} width={60} />
            </div>
          ) : (
            <>
              <input
                type="text"
                placeholder="Enter file name"
                value={nfile}
                onChange={(e) => setNFile(e.target.value)}
                className="mb-4 w-full px-3 py-2 border rounded"
              />
              <FileUploader handleChange={handleChange} name="file" />
              <button
                onClick={uploadFileToAppwrite}
                disabled={!file || !nfile}
                className="mt-4 bg-indigo-500 text-white px-4 py-2 rounded hover:bg-indigo-700 transition"
              >
                Upload
              </button>
              <button
                onClick={closeModal}
                className="mt-2 ml-2 text-gray-600 hover:underline"
              >
                Cancel
              </button>
            </>
          )}
        </div>
      </Modal>
    </div>
  );
};

export default Upload;
