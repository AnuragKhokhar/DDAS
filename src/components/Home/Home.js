import React, { useEffect } from "react";
import styles from "./Home.module.css";
import { Link, useNavigate } from "react-router-dom";
import { account } from "../../appwriteConfig";

const Home = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const checkAuthAndSignOut = async () => {
      try {
        const user = await account.get();

        if (user) {
          await account.deleteSession("current");
          console.log("User logged out successfully");
          navigate("/");
        }
      } catch (error) {
        console.error("Error checking user session:", error);
      }
    };

    checkAuthAndSignOut();
  }, [navigate]);

  return (
    <div className={styles.container}>
      <div className={styles.welcomeText}>Alert System For Data Download Duplication</div>
      <Link to="/login" className={styles.loginLink}>
        Click here to login
      </Link>
      <div className="absolute bottom-5 right-5 bg-gray-800 text-white p-4 rounded-md shadow-md">
  <p className="font-bold mb-2">Group Members</p>
  <ol className="list-disc ml-5">
    <li>Aditya Gupta</li>
    <li>Anurag Khokhar</li>
    <li>Kulgaurav Tripathi</li>
    <li>Utkarsh Singh</li>
  </ol>
</div>

    </div>
  );
};

export default Home;
