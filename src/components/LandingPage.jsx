import React, { useEffect, useState } from "react";
import { IoMdSearch } from "react-icons/io";
import Upload from "./Upload";
import { useNavigate } from "react-router-dom";
import { account, storage, db } from "../appwriteConfig";

const LandingPage = () => {
  const [list, setList] = useState([]);
  const [filteredList, setFilteredList] = useState([]);
  const [itemToBeSearched, setItemToBeSearched] = useState("");
  const [selectedDept, setSelectedDept] = useState("ALL");
  const [selectedMonth, setSelectedMonth] = useState("");
  const [holder, setHolder] = useState("");
  const [duplicateHash, setDuplicateHash] = useState(null);

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const filesPerPage = 10;

  const navigate = useNavigate();

  const bucketId = process.env.REACT_APP_APPWRITE_BUCKET_ID;
  const databaseId = process.env.REACT_APP_APPWRITE_DATABASE_ID;
  const collectionId = process.env.REACT_APP_DATABASE_COLLECTION_ID;

  const getUser = async () => {
    try {
      const user = await account.get();
      setHolder(user.email);
    } catch (error) {
      navigate("/");
    }
  };

  const handleDownload = async (file) => {
    try {
      const response = await fetch(file.url);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = file.name;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      alert("Failed to download file.");
    }
  };

  // Fetches storage files and joins with metadata
  const fetchStorageFiles = async () => {
    try {
      // 1. Fetch files from storage
      const storageResponse = await storage.listFiles(bucketId);
      // 2. Fetch all metadata from database
      const metadataResponse = await db.listDocuments(databaseId, collectionId);

      // 3. Map fileId to metadata
      const metadataMap = {};
      metadataResponse.documents.forEach(doc => {
        metadataMap[doc.fileId] = doc;
      });

      // 4. Merge storage file info with metadata
      const files = storageResponse.files.map(file => {
        const meta = metadataMap[file.$id] || {};
        return {
          id: file.$id,
          name: file.name,
          url: storage.getFileView(bucketId, file.$id),
          mimeType: file.mimeType,
          size: file.sizeOriginal,
          createdAt: file.$createdAt,
          uploaderDepartment: meta.uploaderDepartment || 'Unknown',
          uploaderEmail: meta.uploaderEmail || 'Unknown',
          uploaderName: meta.uploaderName || 'Unknown',
          hash: meta.hash || null // Ensure hash is present for duplicate filtering
        };
      });

      setList(files);
      setFilteredList(files);
      setCurrentPage(1); // Reset to first page on refetch
    } catch (error) {
      setList([]);
      setFilteredList([]);
      setCurrentPage(1);
    }
  };

  useEffect(() => {
    getUser();
    fetchStorageFiles();
    // eslint-disable-next-line
  }, []);

  useEffect(() => {
    let filtered = list;

    // If a duplicate hash is set, filter ONLY for that hash
    if (duplicateHash) {
      filtered = list.filter(item => item.hash === duplicateHash);
    } else {
      // Search filter
      if (itemToBeSearched) {
        filtered = filtered.filter(item =>
          item.name.toLowerCase().includes(itemToBeSearched.toLowerCase()) ||
          (item.uploaderName && item.uploaderName.toLowerCase().includes(itemToBeSearched.toLowerCase()))
        );
      }
      // Month filter
      if (selectedMonth) {
        filtered = filtered.filter(item => {
          const fileDate = new Date(item.createdAt);
          const selectedDate = new Date(selectedMonth);
          return (
            fileDate.getFullYear() === selectedDate.getFullYear() &&
            fileDate.getMonth() === selectedDate.getMonth()
          );
        });
      }
      // Department filter
      if (selectedDept !== "ALL") {
        filtered = filtered.filter(item =>
          item.uploaderDepartment === selectedDept
        );
      }
    }

    setFilteredList(filtered);
    setCurrentPage(1); // Reset to first page on filter change
  }, [itemToBeSearched, selectedDept, selectedMonth, list, duplicateHash]);

  const signOutUser = async () => {
    await account.deleteSession("current");
    navigate("/");
  };

  // Handler to receive duplicate hash from Upload component
  const handleDuplicateFound = (hash) => {
    setDuplicateHash(hash);
  };

  const clearDuplicateFilter = () => setDuplicateHash(null);

  // Pagination logic
  const totalFiles = filteredList.length;
  const totalPages = Math.ceil(totalFiles / filesPerPage);
  const indexOfLastFile = currentPage * filesPerPage;
  const indexOfFirstFile = indexOfLastFile - filesPerPage;
  const currentFiles = filteredList.slice(indexOfFirstFile, indexOfLastFile);

  const goToPage = (pageNumber) => {
    if (pageNumber < 1 || pageNumber > totalPages) return;
    setCurrentPage(pageNumber);
  };

  // Tailwind-styled pagination component
  const Pagination = () => (
    <nav className="flex justify-center mt-6" aria-label="Table pagination">
      <ul className="inline-flex -space-x-px text-base h-10">
        <li>
          <button
            onClick={() => goToPage(currentPage - 1)}
            disabled={currentPage === 1}
            className={`flex items-center justify-center px-4 h-10 ms-0 leading-tight border rounded-s-lg
              ${currentPage === 1
                ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                : "bg-white text-gray-500 border-gray-300 hover:bg-gray-100 hover:text-gray-700"
              }`}
          >
            Previous
          </button>
        </li>
        {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
          <li key={page}>
            <button
              onClick={() => goToPage(page)}
              className={`flex items-center justify-center px-4 h-10 leading-tight border
                ${currentPage === page
                  ? "text-blue-600 border-gray-300 bg-blue-50 hover:bg-blue-100 hover:text-blue-700"
                  : "text-gray-500 bg-white border-gray-300 hover:bg-gray-100 hover:text-gray-700"
                }`}
              aria-current={currentPage === page ? "page" : undefined}
            >
              {page}
            </button>
          </li>
        ))}
        <li>
          <button
            onClick={() => goToPage(currentPage + 1)}
            disabled={currentPage === totalPages || totalPages === 0}
            className={`flex items-center justify-center px-4 h-10 leading-tight border rounded-e-lg
              ${currentPage === totalPages || totalPages === 0
                ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                : "bg-white text-gray-500 border-gray-300 hover:bg-gray-100 hover:text-gray-700"
              }`}
          >
            Next
          </button>
        </li>
      </ul>
    </nav>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-100 flex flex-col">
      {/* Navbar */}
      <nav className="flex flex-col sm:flex-row justify-between items-center px-4 sm:px-6 py-3 shadow bg-white gap-3">
        <div className="text-xl sm:text-2xl font-bold text-indigo-700 text-center">
          Alert System for Data Download Duplication
        </div>
        <div className="flex items-center gap-2">
          <Upload onUploadSuccess={fetchStorageFiles} onDuplicateFound={handleDuplicateFound} />
          <button
            className="px-3 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition"
            onClick={signOutUser}
          >
            LOGOUT
          </button>
        </div>
      </nav>

      {/* Duplicate Filter Notice */}
      {duplicateHash && (
        <div className="text-center my-2">
          <button onClick={clearDuplicateFilter} className="bg-yellow-400 px-3 py-1 rounded">
            Show All Files
          </button>
          <div className="text-red-600 mt-1">Showing only the duplicate file.</div>
        </div>
      )}

      {/* Search Bar */}
      <div className="flex justify-center mt-6 mb-3 px-2">
        <div className="flex w-full max-w-lg bg-white rounded-lg shadow">
          <input
            type="text"
            className="flex-1 px-3 py-2 rounded-l-lg focus:outline-none focus:ring-2 focus:ring-indigo-400 text-sm"
            placeholder="Enter Name of file or uploader..."
            value={itemToBeSearched}
            onChange={(e) => setItemToBeSearched(e.target.value)}
          />
          <button
            className="px-3 bg-indigo-500 text-white rounded-r-lg hover:bg-indigo-600 transition"
            onClick={() => setItemToBeSearched(itemToBeSearched)}
          >
            <IoMdSearch size={20} />
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row justify-center gap-3 mb-4 px-2">
        <input
          type="month"
          className="px-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-400 text-sm"
          onChange={(e) => setSelectedMonth(e.target.value)}
        />
        <select
          className="px-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-400 text-sm"
          onChange={(e) => setSelectedDept(e.target.value)}
          value={selectedDept}
        >
          <option value="ALL">ALL</option>
          <option value="Computer Science & Engineering Department">
            Computer Science & Engineering Department
          </option>
          <option value="Electronics and Electrical Department">
            Electronics and Electrical Department
          </option>
          <option value="Mechanical Engineering Department">
            Mechanical Engineering Department
          </option>
          <option value="Civil Engineering Department">
            Civil Engineering Department
          </option>
          <option value="Chemical Technology Department">
            Chemical Technology Department
          </option>
          <option value="Paint Technology Department">
            Paint Technology Department
          </option>
          <option value="Plastic Technology Department">
            Plastic Technology Department
          </option>
          <option value="Oil Technology Department">
            Oil Technology Department
          </option>
          <option value="Food Technology Department">
            Food Technology Department
          </option>
          <option value="Bio Technology Department">
            Bio Technology Department
          </option>
          <option value="Leather Technology Department">
            Leather Technology Department
          </option>
        </select>
      </div>

      {/* Table Container */}
      <main className="flex-1 flex flex-col items-center w-full">
        <div className="w-full max-w-full px-2 sm:px-6 overflow-x-auto">
          <table className="min-w-full border-collapse block md:table bg-white shadow rounded-lg">
            <thead className="hidden md:table-header-group bg-gray-100 sticky top-0 z-10">
              <tr className="block md:table-row">
                <th className="p-2 text-left font-semibold text-gray-700 block md:table-cell">File Name</th>
                <th className="p-2 text-left font-semibold text-gray-700 block md:table-cell">Type</th>
                <th className="p-2 text-left font-semibold text-gray-700 block md:table-cell">Size (KB)</th>
                <th className="p-2 text-left font-semibold text-gray-700 block md:table-cell">Upload time</th>
                <th className="p-2 text-left font-semibold text-gray-700 block md:table-cell">Uploader Name</th>
                <th className="p-2 text-left font-semibold text-gray-700 block md:table-cell">Uploader Email</th>
                <th className="p-2 text-left font-semibold text-gray-700 block md:table-cell">Department</th>
                <th className="p-2 text-left font-semibold text-gray-700 block md:table-cell">Actions</th>
              </tr>
            </thead>
            <tbody className="block md:table-row-group">
              {currentFiles.length > 0 ? (
                currentFiles.map((item) => (
                  <tr key={item.id} className="bg-white border-b border-gray-200 block md:table-row hover:bg-gray-50 transition">
                    <td className="p-2 block md:table-cell text-xs break-words">
                      <span className="font-semibold md:hidden block">File Name: </span>
                      {item.name}
                    </td>
                    <td className="p-2 block md:table-cell text-xs">
                      <span className="font-semibold md:hidden block">Type: </span>
                      {item.mimeType}
                    </td>
                    <td className="p-2 block md:table-cell text-xs">
                      <span className="font-semibold md:hidden block">Size (KB): </span>
                      {(item.size / 1024).toFixed(2)}
                    </td>
                    <td className="p-2 block md:table-cell text-xs">
                      <span className="font-semibold md:hidden block">Upload time: </span>
                      {new Date(item.createdAt).toDateString()}
                    </td>
                    <td className="p-2 block md:table-cell text-xs">
                      <span className="font-semibold md:hidden block">Uploader Name: </span>
                      {item.uploaderName}
                    </td>
                    <td className="p-2 block md:table-cell text-xs break-all">
                      <span className="font-semibold md:hidden block">Uploader Email: </span>
                      {item.uploaderEmail}
                    </td>
                    <td className="p-2 block md:table-cell text-xs">
                      <span className="font-semibold md:hidden block">Department: </span>
                      {item.uploaderDepartment}
                    </td>
                    <td className="p-2 block md:table-cell flex-col md:flex-row gap-1">
                      <span className="font-semibold md:hidden block">Actions: </span>
                      <a
                        href={item.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-2 py-1 bg-blue-500 text-white rounded hover:bg-blue-700 transition text-xs text-center"
                      >
                        View
                      </a>
                      <button
                        onClick={() => handleDownload(item)}
                        className="px-2 py-1 bg-green-500 text-white rounded hover:bg-green-700 transition text-xs"
                      >
                        Download
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr className="block md:table-row">
                  <td colSpan={8} className="text-center py-8 text-gray-500 block md:table-cell">
                    No files found matching your criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        {/* Pagination */}
        {totalPages > 1 && <Pagination />}
        {/* Showing range info */}
        <div className="mt-2 text-sm text-gray-600">
          Showing {totalFiles === 0 ? 0 : indexOfFirstFile + 1} - {indexOfLastFile > totalFiles ? totalFiles : indexOfLastFile} of {totalFiles} files
        </div>
      </main>

      {/* Footer */}
      <footer className="mt-8 py-4 bg-white text-center text-gray-500 shadow-inner">
        <span className="text-base sm:text-lg">Made with <span className="text-pink-500">💖</span> © Alert System for Data Download Duplication</span>
      </footer>
    </div>
  );
};

export default LandingPage;
