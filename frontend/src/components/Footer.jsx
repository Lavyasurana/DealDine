import { Mail } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-black text-white mt-16">
      <div className="max-w-6xl mx-auto px-6 py-10 flex flex-col md:flex-row justify-between items-center gap-6">
        
        {/* 🔹 Brand */}
        <div className="text-center md:text-left">
          <h2 className="text-xl font-bold">DealDine</h2>
          <p className="text-sm text-gray-400">
            Discover the best dining deals near you 🍽️
          </p>
        </div>

        {/* 🔹 Links */}
        <div className="flex gap-6 text-sm">
          <a
            href="/terms"
            className="hover:text-gray-300 transition"
          >
            Terms & Conditions
          </a>
          <a
            href="/privacy"
            className="hover:text-gray-300 transition"
          >
            Privacy Policy
          </a>
        </div>

        {/* 🔹 Contact */}
        <div className="flex items-center gap-2 text-sm">
          <Mail size={16} />
          <a
            href="mailto:dealdine24@gmail.com"
            className="hover:text-gray-300 transition"
          >
            dealdine24@gmail.com
          </a>
        </div>
      </div>

      {/* 🔻 Bottom */}
      <div className="text-center text-xs text-gray-500 pb-4">
        © {new Date().getFullYear()} DealDine. All rights reserved.
      </div>
    </footer>
  );
}