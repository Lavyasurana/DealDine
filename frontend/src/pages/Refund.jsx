export function RefundPolicy() {
    return (
      <div className="min-h-screen bg-gray-100 px-6 py-12">
        <div className="max-w-4xl mx-auto bg-white p-8 rounded-2xl shadow-lg">
  
          <h1 className="text-3xl font-bold mb-6">
            Refund Policy
          </h1>
  
          <p className="text-gray-600 mb-6">
            Last Updated: {new Date().toLocaleDateString("en-IN")}
          </p>
  
          {/* 1 */}
          <section className="mb-6">
            <h2 className="text-xl font-semibold mb-2">
              1. Overview
            </h2>
            <p className="text-gray-700">
              At DealDine, we strive to provide a seamless experience for users
              purchasing dining deals. This Refund Policy outlines the conditions
              under which refunds may be issued.
            </p>
          </section>
  
          {/* 2 */}
          <section className="mb-6">
            <h2 className="text-xl font-semibold mb-2">
              2. Eligible Refund Cases
            </h2>
            <p className="text-gray-700">
              Refunds will only be provided under the following circumstances:
            </p>
            <ul className="list-disc pl-5 mt-2 text-gray-700 space-y-1">
              <li>Payment was successfully deducted but no coupon was issued</li>
              <li>Duplicate payment was made for the same transaction</li>
              <li>
                The partner restaurant refuses to honor a valid, unexpired coupon
              </li>
              <li>Technical errors caused incorrect billing or transaction failure</li>
            </ul>
          </section>
  
          {/* 3 */}
          <section className="mb-6">
            <h2 className="text-xl font-semibold mb-2">
              3. Non-Refundable Cases
            </h2>
            <p className="text-gray-700">
              Refunds will NOT be provided in the following situations:
            </p>
            <ul className="list-disc pl-5 mt-2 text-gray-700 space-y-1">
              <li>Coupon has already been redeemed</li>
              <li>Coupon has expired</li>
              <li>User changes their mind after purchase</li>
              <li>Failure to use the coupon within its validity period</li>
              <li>
                Dissatisfaction with food, service, or experience at the restaurant
              </li>
            </ul>
          </section>
  
          {/* 4 */}
          <section className="mb-6">
            <h2 className="text-xl font-semibold mb-2">
              4. Refund Process
            </h2>
            <p className="text-gray-700">
              To request a refund, users must contact us within a reasonable time
              from the transaction date by emailing{" "}
              <span className="font-medium">dealdine24@gmail.com</span> with
              transaction details.
              <br /><br />
              DealDine reserves the right to verify the request before processing
              any refund.
            </p>
          </section>
  
          {/* 5 */}
          <section className="mb-6">
            <h2 className="text-xl font-semibold mb-2">
              5. Refund Timeline
            </h2>
            <p className="text-gray-700">
              Approved refunds will be processed within 5–7 business days. The
              actual credit time may vary depending on the payment provider or bank.
            </p>
          </section>
  
          {/* 6 */}
          <section className="mb-6">
            <h2 className="text-xl font-semibold mb-2">
              6. Chargebacks & Fraud
            </h2>
            <p className="text-gray-700">
              Users are encouraged to contact DealDine before initiating a chargeback.
              Fraudulent disputes, misuse of coupons, or abuse of refund policies
              may result in account suspension or permanent ban.
            </p>
          </section>
  
          {/* 7 */}
          <section className="mb-6">
            <h2 className="text-xl font-semibold mb-2">
              7. Platform Responsibility
            </h2>
            <p className="text-gray-700">
              DealDine acts as an intermediary platform connecting users and
              partner restaurants. While we assist in resolving disputes, we are
              not responsible for service-related issues at restaurants.
            </p>
          </section>
  
          {/* 8 */}
          <section className="mb-6">
            <h2 className="text-xl font-semibold mb-2">
              8. Policy Updates
            </h2>
            <p className="text-gray-700">
              DealDine reserves the right to update this Refund Policy at any time.
              Continued use of the platform constitutes acceptance of the updated
              policy.
            </p>
          </section>
  
          {/* 9 */}
          <section>
            <h2 className="text-xl font-semibold mb-2">
              9. Contact Us
            </h2>
            <p className="text-gray-700">
              For refund-related queries, contact us at{" "}
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