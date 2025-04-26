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

  const fetchStorageFiles = async () => {
    try {
      const response = await storage.listFiles(bucketId);
      const files = response.files.map(file => ({
        id: file.$id,
        name: file.name,
        url: storage.getFileView(bucketId, file.$id),
        mimeType: file.mimeType,
        size: file.sizeOriginal,
        // Optionally, you can add more metadata here
      }));
      setList(files);
      setFilteredList(files);
    } catch (error) {
      setList([]);
      setFilteredList([]);
    }
  };

  useEffect(() => {
    getUser();
    fetchStorageFiles();
    // eslint-disable-next-line
  }, []);

  useEffect(() => {
    let filtered = list;
    if (itemToBeSearched) {
      filtered = filtered.filter(
        (item) =>
          item.name.toLowerCase().includes(itemToBeSearched.toLowerCase())
      );
    }
    // You can add more filter logic for dept/month if you store that info in file metadata
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

      {/* Filters (not functional unless you store dept/month info in metadata) */}
      <div className="flex flex-col md:flex-row justify-center gap-4 mb-6">
        <input
          type="month"
          className="px-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-400"
          onChange={(e) => setSelectedMonth(e.target.value)}
        />
        <select
          className="px-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-400"
          onChange={(e) => setSelectedDept(e.target.value)}
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

      {/* List Container */}
      <main className="flex-1 flex flex-col items-center">
        <div className="w-full max-w-5xl grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 px-4">
          {filteredList.length > 0 ? (
            filteredList.map((item) => (
              <div key={item.id} className="bg-white rounded-lg shadow p-4 flex flex-col items-center">
                <div className="font-semibold text-indigo-700 truncate w-full">{item.name}</div>
                <a
                  href={item.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-500 underline mt-2"
                >
                  View / Download
                </a>
                <div className="text-xs text-gray-500 mt-1">{item.mimeType} | {(item.size / 1024).toFixed(2)} KB</div>
              </div>
            ))
          ) : (
            <div className="col-span-full text-center text-gray-500 py-12">
              No files found.
            </div>
          )}
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
