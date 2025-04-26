import React, { useEffect, useState } from "react";
import { IoMdSearch } from "react-icons/io";
import Upload from "./Upload";
import { useNavigate } from "react-router-dom";
import { account, storage } from "../appwriteConfig";

const LandingPage = () => {
  const [list, setList] = useState([]);
  const [filteredList, setFilteredList] = useState([]);
  const [itemToBeSearched, setItemToBeSearched] = useState("");
  const [selectedDept, setSelectedDept] = useState("ALL");
  const [selectedMonth, setSelectedMonth] = useState("");
  const [holder, setHolder] = useState("");
  const navigate = useNavigate();

  const bucketId = process.env.REACT_APP_APPWRITE_BUCKET_ID;

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
      console.error("Download failed", error);
      alert("Failed to download file.");
    }
  };

  const fetchStorageFiles = async () => {
    try {
      const response = await storage.listFiles(bucketId);
      const files = response.files.map(file => ({
        id: file.$id,
        name: file.name,
        url: storage.getFileView(bucketId, file.$id),
        mimeType: file.mimeType,
        size: file.sizeOriginal,
        createdAt: file.$createdAt,
        department: file.metadata?.department || 'Unknown',
        uploaderEmail: file.metadata?.uploaderEmail || 'Unknown',
        uploaderName: file.metadata?.uploaderName || 'Unknown'
      }));
      setList(files);
      setFilteredList(files);
    } catch (error) {
      console.error("Error fetching files:", error);
      setList([]);
      setFilteredList([]);
    }
  };

  useEffect(() => {
    getUser();
    fetchStorageFiles();
  }, []);

  useEffect(() => {
    let filtered = list;
    
    // Search filter
    if (itemToBeSearched) {
      filtered = filtered.filter(item =>
        item.name.toLowerCase().includes(itemToBeSearched.toLowerCase())
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
        item.department === selectedDept);
    }
    
    setFilteredList(filtered);
  }, [itemToBeSearched, selectedDept, selectedMonth, list]);

  const signOutUser = async () => {
    await account.deleteSession("current");
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-100 flex flex-col">
      {/* Navbar */}
      <nav className="flex justify-between items-center px-6 py-4 shadow bg-white">
        <div className="text-2xl font-bold text-indigo-700 tracking-tight">
          Alert System for Data Download Duplication
        </div>
        <div className="flex items-center gap-4">
          <Upload onUploadSuccess={fetchStorageFiles} />
          <button
            className="px-4 py-2 bg-red-500 text-white rounded-lg shadow hover:bg-red-600 transition"
            onClick={signOutUser}
          >
            LOGOUT
          </button>
          <button className="w-10 h-10 rounded-full bg-indigo-100 text-indigo-700 font-bold flex items-center justify-center shadow">
            {holder ? holder[0].toUpperCase() : ""}
          </button>
        </div>
      </nav>

      {/* Search Bar */}
      <div className="flex justify-center mt-8 mb-4">
        <div className="flex w-full max-w-xl bg-white rounded-lg shadow">
          <input
            type="text"
            className="flex-1 px-4 py-2 rounded-l-lg focus:outline-none focus:ring-2 focus:ring-indigo-400"
            placeholder="Enter Name of file or uploader..."
            value={itemToBeSearched}
            onChange={(e) => setItemToBeSearched(e.target.value)}
          />
          <button
            className="px-4 bg-indigo-500 text-white rounded-r-lg hover:bg-indigo-600 transition"
            onClick={() => setItemToBeSearched(itemToBeSearched)}
          >
            <IoMdSearch size={22} />
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row justify-center gap-4 mb-6">
        <input
          type="month"
          className="px-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-400"
          onChange={(e) => setSelectedMonth(e.target.value)}
        />
        <select
          className="px-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-400"
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
        <div className="w-full max-w-6xl px-4 overflow-x-auto">
          <table className="min-w-full border-separate border-spacing-0 bg-white shadow rounded-lg">
            <thead className="bg-gray-100 sticky top-0">
              <tr>
                <th className="py-3 px-4 text-left font-semibold text-gray-700">File Name</th>
                <th className="py-3 px-4 text-left font-semibold text-gray-700">Type</th>
                <th className="py-3 px-4 text-left font-semibold text-gray-700">Size (KB)</th>
                <th className="py-3 px-4 text-left font-semibold text-gray-700">Upload time</th>
                <th className="py-3 px-4 text-left font-semibold text-gray-700">Actions</th>
                <th className="py-3 px-4 text-left font-semibold text-gray-700">Uploader Name</th>
                <th className="py-3 px-4 text-left font-semibold text-gray-700">Uploader Email</th>
                <th className="py-3 px-4 text-left font-semibold text-gray-700">Department</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredList.length > 0 ? (
                filteredList.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50 transition">
                    <td className="py-3 px-4">{item.name}</td>
                    <td className="py-3 px-4">{item.mimeType}</td>
                    <td className="py-3 px-4">{(item.size / 1024).toFixed(2)}</td>
                    <td className="py-3 px-4">{new Date(item.createdAt).toLocaleString()}</td>
                    <td className="py-3 px-4 flex gap-2">
                      <a
                        href={item.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-700 transition text-sm"
                      >
                        View
                      </a>
                      <button
                        onClick={() => handleDownload(item)}
                        className="px-3 py-1 bg-green-500 text-white rounded hover:bg-green-700 transition text-sm"
                      >
                        Download
                      </button>
                    </td>
                    <td className="py-3 px-4">{item.uploaderName}</td>
                    <td className="py-3 px-4">{item.uploaderEmail}</td>
                    <td className="py-3 px-4">{item.department}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={8} className="text-center py-12 text-gray-500">
                    No files found matching your criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </main>

      {/* Footer */}
      <footer className="mt-8 py-4 bg-white text-center text-gray-500 shadow-inner">
        <span className="text-lg">Made with <span className="text-pink-500">💖</span> © Alert System for Data Download Duplication</span>
      </footer>
    </div>
  );
};

export default LandingPage;