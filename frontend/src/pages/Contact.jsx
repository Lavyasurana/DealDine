import { Mail, MapPin, Phone, Send, CheckCircle } from "lucide-react"
import { motion } from "framer-motion"
import emailjs from "@emailjs/browser"
import { useRef, useState } from "react"
import { formatDateTime } from "../utils/dateTime"

export function Contact() {

  const form = useRef()

  const [loading,setLoading] = useState(false)
  const [success,setSuccess] = useState(false)
  const [error,setError] = useState(false)

  const sendEmail = (e) => {
    e.preventDefault()

    setLoading(true)

    emailjs.sendForm(
        "service_5x21ogy",
        "template_f2eu5u9",
        form.current,
        "aydma_Jty-3eCy_Qd"
      )
    .then(()=>{
      setLoading(false)
      setSuccess(true)
      form.current.reset()

      setTimeout(()=>{
        setSuccess(false)
      },3000)
    })
    .catch(()=>{
      setLoading(false)
      setError(true)

      setTimeout(()=>{
        setError(false)
      },3000)
    })
  }

  return (
    <div className="relative min-h-screen flex items-center justify-center px-6 py-16 bg-gradient-to-br from-emerald-100 via-teal-100 to-green-100 overflow-hidden">

      {/* Success Popup */}
      {success && (
       <motion.div
       initial={{ opacity: 0, y: -50 }}
       animate={{ opacity: 1, y: 0 }}
       className="fixed top-24 left-1/2 -translate-x-1/2 z-50 bg-white shadow-xl px-6 py-4 rounded-xl flex items-center gap-3 border border-emerald-200"
     >
       <CheckCircle className="text-emerald-600" />
       Message sent successfully!
     </motion.div>
      )}

      {/* Error Popup */}
      {error && (
        <motion.div
          initial={{opacity:0,y:-50}}
          animate={{opacity:1,y:0}}
          className="fixed top-10 bg-white shadow-xl z-50 px-6 py-4 rounded-xl border border-red-200"
        >
          Failed to send message
        </motion.div>
      )}

      {/* Floating Icons */}
      <motion.div
        animate={{ y: [0,-25,0] }}
        transition={{ duration:6, repeat:Infinity }}
        className="absolute top-24 left-20 text-emerald-300"
      >
        <Mail size={60}/>
      </motion.div>

      <motion.div
        animate={{ y: [0,25,0] }}
        transition={{ duration:7, repeat:Infinity }}
        className="absolute bottom-20 right-20 text-green-300"
      >
        <Phone size={70}/>
      </motion.div>

      <motion.div
        animate={{ y: [0,-30,0] }}
        transition={{ duration:8, repeat:Infinity }}
        className="absolute top-40 right-40 text-teal-300"
      >
        <Send size={60}/>
      </motion.div>

      {/* Card */}
      <motion.div
        initial={{opacity:0,y:40}}
        animate={{opacity:1,y:0}}
        transition={{duration:0.7}}
        className="max-w-6xl w-full grid md:grid-cols-2 gap-10 backdrop-blur-xl bg-white/60 border border-white/40 shadow-2xl rounded-3xl p-10"
      >

        {/* Left Info */}
        <div className="space-y-6">
          <h1 className="text-4xl font-bold text-gray-800">
            Contact <span className="text-emerald-600">Rescue</span>
          </h1>

          <p className="text-gray-600">
            Want to partner with Rescue or list restaurant deals?
            Reach out and we'll respond shortly.
          </p>

          <div className="space-y-5 mt-6">

            <div className="flex items-center gap-4">
              <div className="bg-emerald-100 p-3 rounded-xl">
                <Mail className="text-emerald-600"/>
              </div>
              dealdine24@gmail.com
            </div>

            <div className="flex items-center gap-4">
              <div className="bg-emerald-100 p-3 rounded-xl">
                <MapPin className="text-emerald-600"/>
              </div>
              Mumbai, India
            </div>

           

          </div>
        </div>

        {/* Form */}
        <form ref={form} onSubmit={sendEmail} className="space-y-5">

          <input
            type="text"
            name="name"
            placeholder="Your Name"
            required
            className="w-full border border-gray-200 bg-white/70 rounded-xl p-3 focus:ring-2 focus:ring-emerald-400 outline-none"
          />

          <input
            type="email"
            name="email"
            placeholder="Your Email"
            required
            className="w-full border border-gray-200 bg-white/70 rounded-xl p-3 focus:ring-2 focus:ring-emerald-400 outline-none"
          />

          <textarea
            name="message"
            rows="5"
            placeholder="Your Message"
            required
            className="w-full border border-gray-200 bg-white/70 rounded-xl p-3 focus:ring-2 focus:ring-emerald-400 outline-none"
          />

          <input
            type="hidden"
            name="time"
            value={formatDateTime(new Date())}
          />

          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-emerald-500 to-green-500 text-white py-3 rounded-xl font-semibold hover:scale-105 transition"
          >

            {loading ? "Sending..." : (
              <>
                <Send size={18}/>
                Send Message
              </>
            )}

          </button>

        </form>

      </motion.div>
    </div>
  )
}
