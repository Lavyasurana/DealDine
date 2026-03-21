export function Terms() {
    return (
      <div className="min-h-screen bg-gray-100 px-6 py-12">
        <div className="max-w-4xl mx-auto bg-white p-8 rounded-2xl shadow-lg">
          
          <h1 className="text-3xl font-bold mb-6">
            Terms & Conditions
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
              Welcome to DealDine. By accessing or using our platform, you agree
              to comply with and be bound by these Terms & Conditions.
            </p>
          </section>
  
          {/* 2 */}
          <section className="mb-6">
            <h2 className="text-xl font-semibold mb-2">
              2. Use of Platform
            </h2>
            <p className="text-gray-700">
              DealDine provides users with access to exclusive dining deals and
              coupons. Users agree to use the platform only for lawful purposes
              and not to misuse or exploit the services.
            </p>
          </section>
  
          {/* 3 */}
          <section className="mb-6">
            <h2 className="text-xl font-semibold mb-2">
              3. Account Responsibility
            </h2>
            <p className="text-gray-700">
              You are responsible for maintaining the confidentiality of your
              account and login credentials. Any activity under your account is
              your responsibility.
            </p>
          </section>
  
          {/* 4 */}
          <section className="mb-6">
            <h2 className="text-xl font-semibold mb-2">
              4. Payments & Transactions
            </h2>
            <p className="text-gray-700">
              All payments made through DealDine are processed via secure
              third-party payment gateways. DealDine is not responsible for any
              payment failures, delays, or issues caused by these providers.
            </p>
          </section>
  
          {/* 5 */}
          <section className="mb-6">
            <h2 className="text-xl font-semibold mb-2">
              5. Refund Policy
            </h2>
            <p className="text-gray-700">
              All purchases are final. Refunds are not provided once a coupon has
              been successfully issued, except in cases of technical errors or
              duplicate charges.
            </p>
          </section>
  
          {/* 6 */}
          <section className="mb-6">
            <h2 className="text-xl font-semibold mb-2">
              6. Coupon Usage
            </h2>
            <p className="text-gray-700">
              Coupons are subject to availability, validity period, and
              restaurant-specific terms. Misuse of coupons may result in account
              suspension.
            </p>
          </section>
  
          {/* 7 */}
          <section className="mb-6">
            <h2 className="text-xl font-semibold mb-2">
              7. Limitation of Liability
            </h2>
            <p className="text-gray-700">
              DealDine is not liable for any issues related to food quality,
              service, or experience at partner restaurants. Any disputes must be
              resolved directly with the restaurant.
            </p>
          </section>
  
          {/* 8 */}
          <section className="mb-6">
            <h2 className="text-xl font-semibold mb-2">
              8. Changes to Terms
            </h2>
            <p className="text-gray-700">
              DealDine reserves the right to update or modify these terms at any
              time without prior notice.
            </p>
          </section>
  
          {/* 9 */}
          <section>
            <h2 className="text-xl font-semibold mb-2">
              9. Contact Us
            </h2>
            <p className="text-gray-700">
              If you have any questions, please contact us at{" "}
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