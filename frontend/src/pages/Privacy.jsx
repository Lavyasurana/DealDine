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
          <h2 className="text-xl font-semibold mb-2">1. Introduction</h2>
          <p className="text-gray-700">
            DealDine values your privacy. By using our platform, you consent
            to the collection and use of your information as described in this
            Privacy Policy.
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
            <li>Device and usage data (IP address, browser type, activity)</li>
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
            <li>To communicate updates, offers, and support</li>
            <li>To prevent fraud and misuse</li>
          </ul>
        </section>

        {/* 4 */}
        <section className="mb-6">
          <h2 className="text-xl font-semibold mb-2">
            4. Payment Information
          </h2>
          <p className="text-gray-700">
            Payments are processed through third-party providers such as
            UPI apps and payment providers. DealDine does not store your card or
            banking details.
          </p>
        </section>

        {/* 5 */}
        <section className="mb-6">
          <h2 className="text-xl font-semibold mb-2">
            5. Data Sharing
          </h2>
          <p className="text-gray-700">
            We do not sell your personal data. However, we may share your data
            with:
            <ul className="list-disc pl-5 mt-2">
              <li>Partner restaurants (for deal redemption)</li>
              <li>Payment providers (for transaction processing)</li>
              <li>Service providers (hosting, analytics, support)</li>
            </ul>
          </p>
        </section>

        {/* 6 */}
        <section className="mb-6">
          <h2 className="text-xl font-semibold mb-2">
            6. Data Retention
          </h2>
          <p className="text-gray-700">
            We retain your data only as long as necessary to provide services
            and comply with legal obligations. You may request deletion of your
            account and data at any time.
          </p>
        </section>

        {/* 7 */}
        <section className="mb-6">
          <h2 className="text-xl font-semibold mb-2">
            7. Data Security
          </h2>
          <p className="text-gray-700">
            We implement reasonable security measures to protect your data.
            However, no system is completely secure, and DealDine cannot
            guarantee absolute protection.
          </p>
        </section>

        {/* 8 */}
        <section className="mb-6">
          <h2 className="text-xl font-semibold mb-2">
            8. Cookies & Tracking
          </h2>
          <p className="text-gray-700">
            We use cookies and similar technologies to improve user experience
            and analyze platform usage.
          </p>
        </section>

        {/* 9 */}
        <section className="mb-6">
          <h2 className="text-xl font-semibold mb-2">
            9. Your Rights
          </h2>
          <p className="text-gray-700">
            You have the right to:
            <ul className="list-disc pl-5 mt-2">
              <li>Access your personal data</li>
              <li>Request correction or deletion</li>
              <li>Withdraw consent</li>
              <li>Opt-out of marketing communications</li>
            </ul>
          </p>
        </section>

       

        {/* 10 */}
        <section className="mb-6">
          <h2 className="text-xl font-semibold mb-2">
            10. Changes to This Policy
          </h2>
          <p className="text-gray-700">
            We may update this Privacy Policy at any time. Continued use of the
            platform constitutes acceptance of the updated policy.
          </p>
        </section>

        {/* 11 */}
        <section className="mb-6">
          <h2 className="text-xl font-semibold mb-2">
            11. Governing Law
          </h2>
          <p className="text-gray-700">
            This Privacy Policy shall be governed by the laws of India.
          </p>
        </section>

        {/* 12 */}
        <section>
          <h2 className="text-xl font-semibold mb-2">
            12. Contact Us
          </h2>
          <p className="text-gray-700">
            For any privacy-related concerns, contact us at{" "}
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
