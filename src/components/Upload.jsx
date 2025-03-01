import React, { useState } from "react";
import { storage } from "../appwriteConfig"; // Import Appwrite storage
import Modal from "react-modal";
import { FileUploader } from "react-drag-drop-files";
import ReactLoading from "react-loading";

const Upload = ({ list, setList }) => {
  const [modalIsOpen, setIsOpen] = useState(false);
  const [file, setFile] = useState(null);
  const [nfile, setNFile] = useState("");
  const [loading, setLoading] = useState(false);

  const bucketId = process.env.REACT_APP_APPWRITE_BUCKET_ID;

  const handleChange = (file) => {
    setFile(file);
  };

  const closeModal = () => {
    setIsOpen(false);
    setLoading(false);
    setFile(null);
    setNFile("");
  };

  const uploadFileToAppwrite = async () => {
    if (!file || !nfile) {
      alert("Please provide a file and a name.");
      return;
    }

    setLoading(true);

    try {
      const response = await storage.createFile(bucketId, "unique()", file);
      const fileUrl = storage.getFileView(bucketId, response.$id); // Get file URL

      setList([...list, { id: response.$id, name: nfile, url: fileUrl }]);

      alert("File uploaded successfully!");
    } catch (error) {
      console.error("Error uploading file:", error);
      alert("Upload failed. Please try again.");
    } finally {
      closeModal();
    }
  };

  return (
    <div>
      <button onClick={() => setIsOpen(true)}>UPLOAD</button>
      <Modal isOpen={modalIsOpen} onRequestClose={closeModal}>
        <h2>Upload File</h2>
        {loading ? (
          <ReactLoading type="spokes" color="green" height={100} width={100} />
        ) : (
          <>
            <input
              type="text"
              placeholder="Enter file name"
              value={nfile}
              onChange={(e) => setNFile(e.target.value)}
            />
            <FileUploader handleChange={handleChange} name="file" />
            <button onClick={uploadFileToAppwrite} disabled={!file || !nfile}>
              Upload
            </button>
          </>
        )}
      </Modal>
    </div>
  );
};

export default Upload;
