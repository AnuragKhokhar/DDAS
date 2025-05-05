import React, { useEffect } from "react";
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
          navigate("/");
        }
      } catch (error) {
        // Not logged in, do nothing
      }
    };
    checkAuthAndSignOut();
  }, [navigate]);

  return (
    <div className="min-h-screen flex flex-col justify-center items-center bg-gradient-to-br from-blue-50 via-white to-indigo-100 px-4">
      <div className="text-2xl md:text-4xl font-bold text-indigo-700 text-center mb-8">
        Alert System For Data Download Duplication
      </div>
      <Link
        to="/login"
        className="mb-6 px-6 py-3 rounded-lg bg-indigo-600 text-white text-lg font-semibold hover:bg-indigo-800 transition w-full max-w-xs text-center"
      >
        Click here to login
      </Link>
      <div className="bg-white rounded-lg shadow p-6 w-full max-w-xs text-center">
        <p className="font-semibold mb-2">Test Credentials:</p>
        <p className="break-all">Email: <span className="font-mono">anurag@gmail.com</span></p>
        <p className="break-all">Password: <span className="font-mono">Password@123</span></p>
      </div>
    </div>
  );
};

export default Home;
