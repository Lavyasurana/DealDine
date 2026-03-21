import { useContext, useState } from "react";
import axios from "axios";
import { adminContext } from "../context/adminContext";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export function Login() {
  const { setAdminLogin, backendUrl, navigate } = useContext(adminContext);

  const [current, setCurrent] = useState("Login");
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    restaurantName: ""
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const onSubmitHandler = async (e) => {
    e.preventDefault();
    if (loading) return;

    setLoading(true);

    try {
      if (current === "Login") {
        const response = await axios.post(
          `${backendUrl}/api/admin/login`,
          {
            email: form.email,
            password: form.password
          }
        );

        if (response.data.success) {
          const token = response.data.token;

          localStorage.setItem("adminToken", token);
          axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
          setAdminLogin(true);

          toast.success("Login successful");

          
            navigate("/");
          
        } else {
          toast.error(response.data.message);
        }
      } else {
        const response = await axios.post(
          `${backendUrl}/api/admin/register`,
          {
            name: form.name,
            email: form.email,
            password: form.password,
            restaurantName: form.restaurantName
          }
        );

        if (response.data.success) {
          toast.success("Registration successful");

          setForm({
            name: "",
            email: "",
            password: "",
            restaurantName: ""
          });

          setCurrent("Login");
        } else {
          toast.error(response.data.message);
        }
      }
    } catch (error) {
      console.log(error);
      toast.error("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100">

      <ToastContainer />

      <form
        onSubmit={onSubmitHandler}
        className="flex flex-col gap-4 w-full sm:max-w-[450px] bg-white p-6 rounded-xl shadow-lg"
      >
        <h1 className="text-2xl font-bold text-emerald-700 text-center">
          {current === "Login" ? "Admin Login" : "Admin Register"}
        </h1>

        {/* REGISTER FIELDS */}
        {current === "Register" && (
          <>
            <input
              name="name"
              value={form.name}
              onChange={handleChange}
              placeholder="Your Name"
              required
              className="input"
            />

            <input
              name="restaurantName"
              value={form.restaurantName}
              onChange={handleChange}
              placeholder="Restaurant Name"
              required
              className="input"
            />
          </>
        )}

        {/* COMMON FIELDS */}
        <input
          name="email"
          type="email"
          value={form.email}
          onChange={handleChange}
          placeholder="Email"
          required
          className="input"
        />

        <input
          name="password"
          type="password"
          value={form.password}
          onChange={handleChange}
          placeholder="Password"
          required
          className="input"
        />

        <button
          type="submit"
          disabled={loading}
          className={`py-2 rounded text-white ${
            loading
              ? "bg-gray-400"
              : "bg-emerald-600 hover:bg-emerald-700"
          }`}
        >
          {loading
            ? "Please wait..."
            : current === "Login"
            ? "Login"
            : "Register"}
        </button>

        {/* TOGGLE */}
        <p className="text-sm text-center">
          {current === "Login"
            ? "Don't have an account?"
            : "Already have an account?"}

          <span
            onClick={() =>
              setCurrent(current === "Login" ? "Register" : "Login")
            }
            className="text-emerald-600 cursor-pointer ml-1"
          >
            {current === "Login" ? "Register" : "Login"}
          </span>
        </p>
      </form>
    </div>
  );
}