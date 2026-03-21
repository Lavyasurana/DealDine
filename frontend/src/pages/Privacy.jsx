export function Privacy() {
    return (
      <div className="min-h-screen bg-gray-100 px-6 py-12">
        <div className="max-w-4xl mx-auto bg-white p-8 rounded-2xl shadow-lg">
          
          <h1 className="text-3xl font-bold mb-6">
            Privacy Policy
          </h1>
  
          <p className="text-gray-600 mb-6">
            Last Updated: {new Date().toLocaleDateString("en-IN")}
          </p>
  
          {/* 1 */}
          <section className="mb-6">
            <h2 className="text-xl font-semibold mb-2">
              1. Introduction
            </h2>
            <p className="text-gray-700">
              DealDine values your privacy. This Privacy Policy explains how we
              collect, use, and protect your personal information when you use our
              platform.
            </p>
          </section>
  
          {/* 2 */}
          <section className="mb-6">
            <h2 className="text-xl font-semibold mb-2">
              2. Information We Collect
            </h2>
            <ul className="list-disc pl-5 text-gray-700 space-y-1">
              <li>Name, email address, and phone number</li>
              <li>Account and login details</li>
              <li>Transaction and payment information</li>
              <li>Usage data such as app interactions</li>
            </ul>
          </section>
  
          {/* 3 */}
          <section className="mb-6">
            <h2 className="text-xl font-semibold mb-2">
              3. How We Use Your Information
            </h2>
            <ul className="list-disc pl-5 text-gray-700 space-y-1">
              <li>To provide and improve our services</li>
              <li>To process transactions securely</li>
              <li>To personalize your experience</li>
              <li>To communicate updates and offers</li>
            </ul>
          </section>
  
          {/* 4 */}
          <section className="mb-6">
            <h2 className="text-xl font-semibold mb-2">
              4. Payment Information
            </h2>
            <p className="text-gray-700">
              All payments are processed through secure third-party payment
              providers. DealDine does not store your card or payment details.
            </p>
          </section>
  
          {/* 5 */}
          <section className="mb-6">
            <h2 className="text-xl font-semibold mb-2">
              5. Data Sharing
            </h2>
            <p className="text-gray-700">
              We do not sell or rent your personal data. Information may be shared
              with partner restaurants or service providers only to fulfill your
              requests and improve services.
            </p>
          </section>
  
          {/* 6 */}
          <section className="mb-6">
            <h2 className="text-xl font-semibold mb-2">
              6. Data Security
            </h2>
            <p className="text-gray-700">
              We implement appropriate security measures to protect your data.
              However, no system is completely secure, and we cannot guarantee
              absolute security.
            </p>
          </section>
  
          {/* 7 */}
          <section className="mb-6">
            <h2 className="text-xl font-semibold mb-2">
              7. Cookies & Tracking
            </h2>
            <p className="text-gray-700">
              We may use cookies and similar technologies to enhance user
              experience and analyze platform usage.
            </p>
          </section>
  
          {/* 8 */}
          <section className="mb-6">
            <h2 className="text-xl font-semibold mb-2">
              8. Your Rights
            </h2>
            <p className="text-gray-700">
              You may request access, correction, or deletion of your personal
              data by contacting us.
            </p>
          </section>
  
          {/* 9 */}
          <section className="mb-6">
            <h2 className="text-xl font-semibold mb-2">
              9. Changes to This Policy
            </h2>
            <p className="text-gray-700">
              DealDine reserves the right to update this Privacy Policy at any
              time. Continued use of the platform constitutes acceptance of the
              updated policy.
            </p>
          </section>
  
          {/* 10 */}
          <section>
            <h2 className="text-xl font-semibold mb-2">
              10. Contact Us
            </h2>
            <p className="text-gray-700">
              If you have any questions, contact us at{" "}
              <a
                href="mailto:dealdine24@gmail.com"
                className="text-blue-600 underline"
              >
                dealdine24@gmail.com
              </a>
            </p>
          </section>
  
        </div>
      </div>
    );
  }