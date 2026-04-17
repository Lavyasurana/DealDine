import { useContext, useState } from "react";
import axios from "axios";
import { adminContext } from "../context/adminContext";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export function Login() {
  const { setAdminLogin, backendUrl, navigate } = useContext(adminContext);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const onSubmitHandler = async (e) => {
    e.preventDefault();
    if (loading) return;

    setLoading(true);

    try {
      const response = await axios.post(
        `${backendUrl}/api/admin/login`,
        {
          email: form.email,
          password: form.password,
        },
        { withCredentials: true }
      );

      if (response.data.success) {
        setAdminLogin(true);
        toast.success("Login successful");
        navigate("/");
      } else {
        toast.error(response.data.message);
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
          Admin Login
        </h1>

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
            loading ? "bg-gray-400" : "bg-emerald-600 hover:bg-emerald-700"
          }`}
        >
          {loading ? "Please wait..." : "Login"}
        </button>
      </form>
    </div>
  );
}
