import React, { useState, useEffect } from "react";
import { X, AlertCircle } from "lucide-react";

const ErrorBar = ({ onClose }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 3000);

    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div className="absolute top-0 left-0 right-0 overflow-hidden rounded-t-2xl">
      <div className="bg-red-500 text-white px-4 py-3 flex items-center justify-between animate-slide-down">
        <div className="flex items-center gap-2">
          <AlertCircle className="h-4 w-4" />
          <p className="text-sm font-medium">Invalid code. Please try again.</p>
        </div>
        <button
          onClick={onClose}
          className="text-white/80 hover:text-white transition-colors"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
      <div className="h-1 bg-red-600">
        <div className="h-full bg-white animate-shrink-bar" />
      </div>
    </div>
  );
};

export default function AdminAuth({ children }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [code, setCode] = useState("");
  const [showError, setShowError] = useState(false);

  useEffect(() => {
    checkAuthentication();
  }, []);

  const checkAuthentication = () => {
    const authToken = localStorage.getItem("adminAuthToken");
    const authExpiry = localStorage.getItem("adminAuthExpiry");

    if (authToken && authExpiry) {
      if (new Date().getTime() < parseInt(authExpiry)) {
        setIsAuthenticated(true);
      } else {
        localStorage.removeItem("adminAuthToken");
        localStorage.removeItem("adminAuthExpiry");
      }
    }
    setIsLoading(false);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (code === "1234") {
      setIsAuthenticated(true);
      const expiryTime = new Date().getTime() + 24 * 60 * 60 * 1000;
      localStorage.setItem("adminAuthToken", "authenticated");
      localStorage.setItem("adminAuthExpiry", expiryTime.toString());
    } else {
      setShowError(true);
      setCode("");
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setCode(""); // Reset the input field
    localStorage.removeItem("adminAuthToken");
    localStorage.removeItem("adminAuthExpiry");
  };

  if (isLoading) {
    return null;
  }

  if (isAuthenticated) {
    return (
      <div>
        <div className="bg-zinc-900 text-black px-6 py-2 flex justify-end">
          <button
            onClick={handleLogout}
            className="bg-white px-2 py-1 rounded-md text-sm font-medium transition-colors"
          >
            Logout
          </button>
        </div>
        {children}
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-6 z-50">
      <div className="bg-white w-full max-w-md rounded-2xl shadow-xl relative overflow-hidden">
        {showError && <ErrorBar onClose={() => setShowError(false)} />}

        <div className="flex items-center justify-between p-6 border-b border-zinc-200">
          <h2 className="text-xl font-medium text-zinc-900">
            Admin Authentication
          </h2>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          <div>
            <label className="block text-sm font-medium text-zinc-700 mb-2">
              Enter 4-digit code
            </label>
            <input
              type="text"
              required
              value={code}
              onChange={(e) => setCode(e.target.value)}
              maxLength={4}
              placeholder="••••"
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-zinc-200"
            />
          </div>

          <div className="flex justify-end gap-3 mt-6">
            <button
              type="button"
              onClick={() => setCode("")}
              className="px-4 py-2 text-zinc-700 hover:bg-zinc-100 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-zinc-900 text-white rounded-lg hover:bg-zinc-800 transition-colors"
            >
              Verify
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
