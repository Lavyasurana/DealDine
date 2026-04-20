import React, { useContext, useState, useRef, useEffect } from "react";
import { Menu, X, User } from "lucide-react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { rescueContext } from "../context/rescueContext";
import logo from '../assets/logo.png'
import axios from "axios";

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [isUserOpen, setIsUserOpen] = useState(false);
  const { userLogin, logout,backendUrl } = useContext(rescueContext);
  const userRef = useRef();
  const navigate = useNavigate();

  // Close user dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (userRef.current && !userRef.current.contains(event.target)) {
        setIsUserOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Logout function
  const handleLogout = async() => {
    setIsUserOpen(false);
    setIsOpen(false);
    await logout();
    const fcmToken = localStorage.getItem("fcmToken");
    if (fcmToken) {
      await axios.post(
        `${backendUrl}/api/user/remove-token`,
        { token: fcmToken },
        { withCredentials: true }
      );
    }
    navigate("/");
  };
  

  return (
    <nav className="w-full bg-white/80 backdrop-blur-md border-b border-gray-200 fixed top-0 left-0 z-50">
      <div className="max-w-6xl mx-auto px-6 py-4 flex justify-between items-center">

        {/* Logo */}
        <Link to="/" className="flex items-center shrink-0">
          <div className="h-12 w-[190px] overflow-hidden sm:h-14 sm:w-[230px] curoser-pointer">
            <img
              src={logo}
              alt="DealDine"
              className="w-full h-auto -translate-y-[37%] curoser-pointer"
            />
          </div>
        </Link>

        {/* Desktop Links */}
        <div className="hidden md:flex gap-8 items-center">
          <NavLink
            to="/upcoming"
            className="text-gray-700 hover:text-emerald-600"
          >
            Upcoming
          </NavLink>

          <NavLink
            to="/search"
            className="text-gray-700 hover:text-emerald-600"
          >
            Search
          </NavLink>

          <NavLink
            to="/contact"
            className="text-gray-700 hover:text-emerald-600"
          >
            Contact
          </NavLink>
        </div>

        {/* Desktop Right Section */}
        <div className="hidden md:flex items-center">
          {!userLogin ? (
            <Link
              to="/login"
              className="bg-emerald-100 text-emerald-700 px-4 py-2 rounded-xl hover:bg-emerald-200 transition"
            >
              Login / Sign Up
            </Link>
          ) : (
            <div className="relative" ref={userRef}>
              <button
                onClick={() => setIsUserOpen(!isUserOpen)}
                className="p-2 rounded-full hover:bg-gray-100 transition"
              >
                <User className="w-6 h-6 text-gray-600" />
              </button>

              {isUserOpen && (
                <div className="absolute right-0 mt-3 w-44 bg-white rounded-xl shadow-lg border border-gray-200 py-2">
                  <Link
                    to="/profile"
                    onClick={() => setIsUserOpen(false)}
                    className="block px-4 py-2 text-gray-700 hover:bg-emerald-50"
                  >
                    Profile
                  </Link>

                  <button
                    onClick={handleLogout}
                    className="w-full text-left px-4 py-2 text-red-600 hover:bg-red-50"
                  >
                    Logout
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Mobile Menu Button */}
        <div className="md:hidden">
          <button onClick={() => setIsOpen(!isOpen)}>
            {isOpen ? <X /> : <Menu />}
          </button>
        </div>
      </div>

      {/* Mobile Dropdown */}
      {isOpen && (
        <div className="md:hidden bg-white border-t border-gray-200 px-6 py-4 space-y-4">
          <NavLink
            to="/upcoming"
            onClick={() => setIsOpen(false)}
            className="block text-gray-700 hover:text-emerald-600"
          >
            Upcoming
          </NavLink>

          <NavLink
            to="/search"
            onClick={() => setIsOpen(false)}
            className="block text-gray-700 hover:text-emerald-600"
          >
           Search
          </NavLink>

          <NavLink
            to="/contact"
            onClick={() => setIsOpen(false)}
            className="block text-gray-700 hover:text-emerald-600"
          >
            Contact
          </NavLink>

          {!userLogin ? (
            <Link
              to="/login"
              onClick={() => setIsOpen(false)}
              className="block bg-emerald-100 text-emerald-700 px-4 py-2 rounded-xl hover:bg-emerald-200 transition"
            >
              Login / Sign Up
            </Link>
          ) : (
            <>
              <NavLink
                to="/profile"
                onClick={() => setIsOpen(false)}
                className="block text-gray-700 hover:text-emerald-600"
              >
                Profile
              </NavLink>

              <button
                onClick={handleLogout}
                className="block text-red-600"
              >
                Logout
              </button>
            </>
          )}
        </div>
      )}
    </nav>
  );
}
