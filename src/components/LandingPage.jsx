import React, { useEffect, useState } from "react";
import "../global.css";
import { IoMdSearch } from "react-icons/io";
import Upload from "./Upload";
import ListItem from "./ListItem";
import { useNavigate } from "react-router-dom";
import { account, db } from "../appwriteConfig";

const LandingPage = () => {
  const [list, setList] = useState([]);
  const [filteredList, setFilteredList] = useState([]);
  const [itemToBeSearched, setItemToBeSearched] = useState("");
  const [selectedDept, setSelectedDept] = useState("ALL");
  const [selectedMonth, setSelectedMonth] = useState("");
  const navigate = useNavigate();
  const [holder, setHolder] = React.useState("");

  const databaseId = process.env.REACT_APP_APPWRITE_DATABASE_ID;
  const collectionId = process.env.REACT_APP_APPWRITE_COLLECTION_ID;

  const getUser = async () => {
    try {
      const user = await account.get();
      setHolder(user.email);
    } catch (error) {
      console.error("Error fetching user:", error);
      navigate("/");
    }
  };

  useEffect(() => {
    getUser();
  }, []);

  const fetchDataFiles = async () => {
    try {
      const response = await db.listDocuments(databaseId, collectionId);
      const fetchedList = response.documents.map((doc) => ({
        ...doc,
        id: doc.$id,
      }));
      setList(fetchedList);
      setFilteredList(fetchedList);
    } catch (error) {
      console.error("Error fetching documents:", error);
    }
  };

  // fetchDataFiles();
  useEffect(() => {
    fetchDataFiles();
  }, [list]);

  useEffect(() => {
    let filtered = list;

    if (itemToBeSearched) {
      filtered = filtered.filter(
        (item) =>
          item.name.toLowerCase().includes(itemToBeSearched.toLowerCase()) ||
          item.owner.toLowerCase().includes(itemToBeSearched.toLowerCase())
      );
    }

    if (selectedDept !== "ALL") {
      filtered = filtered.filter((item) => item.dept === selectedDept);
    }

    if (selectedMonth) {
      const [year, month] = selectedMonth.split("-");
      const monthNames = [
        "January",
        "February",
        "March",
        "April",
        "May",
        "June",
        "July",
        "August",
        "September",
        "October",
        "November",
        "December",
      ];
      const selectedTime = `${year} ${monthNames[parseInt(month, 10) - 1]}`;
      filtered = filtered.filter((item) => item.time === selectedTime);
    }

    setFilteredList(filtered);
  }, [itemToBeSearched, selectedDept, selectedMonth, list]);

  const signOutUser = async () => {
    await account
      .deleteSession("current")
      .then(() => {
        console.log("User logged out successfully");
        navigate("/");
      })
      .catch((error) => {
        console.error("Error logging out:", error);
      });
  };

  return (
    <div>
      <div id="navbar">
        <div id="name">Alert System for Data Download Duplication</div>
        <div id="upload">
          <Upload list={list} setList={setList} holder={holder} />
          <button className="button-68" id="lo" onClick={signOutUser}>
            LOGOUT
          </button>
          <button id="email">{holder ? holder[0].toUpperCase() : ""}</button>
        </div>
      </div>
      <div id="search">
        <input
          type="text"
          id="srchBar"
          placeholder="Enter Name of file or uploader.... "
          onChange={(e) => setItemToBeSearched(e.target.value)}
        />
        <button
          className="button-6"
          onClick={() => setItemToBeSearched(itemToBeSearched)}
        >
          <IoMdSearch />
        </button>
      </div>

      <div id="filter">
        <input
          type="month"
          id="month"
          onChange={(e) => setSelectedMonth(e.target.value)}
        />
        <select id="dept" onChange={(e) => setSelectedDept(e.target.value)}>
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
      <div id="container">
        {filteredList.map((item) => (
          <ListItem
            key={item.$id}
            name={item.name}
            owner={item.owner}
            cid={item.cid}
            dept={item.dept}
            time={item.time}
          />
        ))}
      </div>
      <div id="footer">
        <pre>Made with 💖 © Alert System for Data Download Duplication</pre>
      </div>
    </div>
  );
};

export default LandingPage;
