import React, { useState } from "react";
import { storage, db, account } from "../appwriteConfig";
import { ID } from "appwrite";
import Modal from "react-modal";
import { FileUploader } from "react-drag-drop-files";
import ReactLoading from "react-loading";
import { getFileHash } from "../utils/fileUtils";
import { checkDuplicateHash, saveFileMetadata, uploadFileToStorage } from "../services/fileService";
import { toast } from "react-toastify";

const Upload = ({ onUploadSuccess, onDuplicateFound }) => {
  const [modalIsOpen, setIsOpen] = useState(false);
  const [file, setFile] = useState(null);
  const [nfile, setNFile] = useState("");
  const [department, setDepartment] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (file) => setFile(file);

  const closeModal = () => {
    setIsOpen(false);
    setLoading(false);
    setFile(null);
    setNFile("");
    setDepartment("");
  };

  const uploadFileToAppwrite = async () => {
    if (!file) {
      toast.error("Please provide a file and a name.");
      return;
    }
    setLoading(true);
    try {
      // 1. Generate SHA-256 hash value
      const hash = await getFileHash(file);
      const user = await account.get();
      const uploaderEmail = user.email;
      const uploaderName = user.name;
      const uploaderDepartment = department;
      // 2. Check for duplicates
      const isDuplicate = await checkDuplicateHash(hash);
      if (isDuplicate) {
        toast.error("This file has already been uploaded.");
        // Notify parent about the duplicate hash
        if (onDuplicateFound) onDuplicateFound(hash);
        return;
      }
      // 3. Upload file to appwrite
      const uploadResponse = await uploadFileToStorage(file);
      // 4. Save metaData to database
      await saveFileMetadata(uploadResponse.$id, nfile, hash, uploaderName, uploaderEmail, uploaderDepartment);

      toast.success("File uploaded successfully");
      if (onUploadSuccess) onUploadSuccess();
    } catch (error) {
      toast.error("Failed to upload file, Please try again");
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
        shouldCloseOnOverlayClick={true}
        className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-30 z-50"
        overlayClassName="fixed inset-0"
        ariaHideApp={false}
      >
        <div
          className="bg-white rounded-lg p-8 w-full max-w-md"
          onClick={(e) => e.stopPropagation()}
        >
          <h2 className="text-xl font-semibold mb-4">Upload File</h2>
          {loading ? (
            <div className="flex justify-center items-center">
              <ReactLoading type="spokes" color="green" height={60} width={60} />
            </div>
          ) : (
            <>
              <select
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                className="mb-4 w-full px-3 py-2 border rounded"
                required
              >
                <option value="">Select Department...</option>
                <option value="Computer Science & Engineering Department">Computer Science & Engineering Department</option>
                <option value="Electronics and Electrical Department">Electronics and Electrical Department</option>
                <option value="Mechanical Engineering Department">Mechanical Engineering Department</option>
                <option value="Civil Engineering Department">Civil Engineering Department</option>
                <option value="Chemical Technology Department">Chemical Technology Department</option>
                <option value="Paint Technology Department">Paint Technology Department</option>
                <option value="Plastic Technology Department">Plastic Technology Department</option>
                <option value="Oil Technology Department">Oil Technology Department</option>
                <option value="Food Technology Department">Food Technology Department</option>
                <option value="Bio Technology Department">Bio Technology Department</option>
                <option value="Leather Technology Department">Leather Technology Department</option>
              </select>
              <FileUploader handleChange={handleChange} name="file" />
              <button
                onClick={uploadFileToAppwrite}
                disabled={!file || !department}
                className="mt-4 bg-indigo-500 text-white px-4 py-2 rounded hover:bg-indigo-700 transition"
              >
                Upload
              </button>
              <button
                onClick={closeModal}
                className="mt-4 bg-red-500 text-white px-4 py-2 rounded hover:bg-red-700 transition ml-5"
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
