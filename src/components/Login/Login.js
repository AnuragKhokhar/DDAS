import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { account } from "../../appwriteConfig";

const Login = () => {
  const [values, setValues] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const validEmailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  const passwordRegex = /^(?=.*[A-Z])(?=.*[!@#$%^&*])[A-Za-z\d!@#$%^&*]{6,}$/;

  useEffect(() => {
    const checkAuthAndSignOut = async () => {
      try {
        const user = await account.get();
        if (user) await account.deleteSession("current");
      } catch (error) {}
    };
    checkAuthAndSignOut();
  }, [navigate]);

  const validateEmail = (email) => validEmailRegex.test(email);
  const validatePassword = (password) => passwordRegex.test(password);

  const handleSubmission = async () => {
    setError("");
    if (!values.email || !values.password) {
      setError("Please fill all fields");
      return;
    }
    if (!validateEmail(values.email)) {
      setError("Please enter a valid email address");
      setLoading(false);
      return;
    }
    if (!validatePassword(values.password)) {
      setError("Password must contain at least one uppercase letter, one special character");
      return;
    }
    setLoading(true);
    try {
      await account.createEmailPasswordSession(values.email, values.password);
      setLoading(false);
      navigate("/landing-page", { replace: true });
    } catch (error) {
      setError(error.message);
      setLoading(false);
    }
  };

  const handleKeyDown = (event) => {
    if (event.key === "Enter") {
      event.preventDefault();
      handleSubmission();
    }
  };

  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => setError(""), 5000);
      return () => clearTimeout(timer);
    }
  }, [error]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-indigo-100 px-4">
      <div
        className="bg-white rounded-lg shadow-lg p-8 w-full max-w-md flex flex-col gap-5"
        onKeyDown={handleKeyDown}
      >
        <h1 className="text-2xl md:text-3xl font-bold text-center text-indigo-700 mb-4">Login</h1>
        <div>
          <label className="block mb-1 font-semibold">Email</label>
          <input
            type="email"
            className="w-full px-4 py-2 rounded border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-400"
            placeholder="Enter Email Address"
            onChange={(e) => setValues((prev) => ({ ...prev, email: e.target.value }))}
          />
        </div>
        <div>
          <label className="block mb-1 font-semibold">Password</label>
          <input
            type="password"
            className="w-full px-4 py-2 rounded border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-400"
            placeholder="Enter Password"
            onChange={(e) => setValues((prev) => ({ ...prev, password: e.target.value }))}
          />
        </div>
        <div className="flex flex-col items-center gap-2">
          <span className="text-red-600 font-medium min-h-[1.5rem]">{error}</span>
          <button
            onClick={handleSubmission}
            disabled={loading}
            className="w-full bg-indigo-600 text-white py-2 rounded-lg font-bold hover:bg-indigo-800 transition flex items-center justify-center"
          >
            {loading ? (
              <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
            ) : (
              "Login"
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Login;
