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
          <h2 className="text-xl font-semibold mb-2">1. Introduction</h2>
          <p className="text-gray-700">
            Welcome to DealDine. By accessing or using our platform, you agree
            to comply with and be bound by these Terms & Conditions. If you do
            not agree, please do not use our services.
          </p>
        </section>

        {/* 2 */}
        <section className="mb-6">
          <h2 className="text-xl font-semibold mb-2">2. Platform Role</h2>
          <p className="text-gray-700">
            DealDine acts solely as an intermediary platform that connects users
            with partner restaurants offering promotional deals and coupons.
            DealDine does not own, operate, or control any restaurant and is not
            responsible for the quality, safety, or availability of services
            provided by them.
          </p>
        </section>

        {/* 3 */}
        <section className="mb-6">
          <h2 className="text-xl font-semibold mb-2">3. Use of Platform</h2>
          <p className="text-gray-700">
            Users agree to use DealDine only for lawful purposes. Any misuse,
            fraudulent activity, or attempt to exploit the platform may result
            in suspension or termination of access.
          </p>
        </section>

        {/* 4 */}
        <section className="mb-6">
          <h2 className="text-xl font-semibold mb-2">4. Account Responsibility</h2>
          <p className="text-gray-700">
            You are responsible for maintaining the confidentiality of your
            account credentials. Any activity conducted through your account
            shall be your responsibility.
          </p>
        </section>

        {/* 5 */}
        <section className="mb-6">
          <h2 className="text-xl font-semibold mb-2">5. Payments & Transactions</h2>
          <p className="text-gray-700">
            All payments on DealDine are processed through third-party payment
            gateways. DealDine is not responsible for payment failures, delays,
            or security issues arising from these providers.
            <br /><br />
            In case of pricing errors, duplicate payments, or failed
            transactions, DealDine reserves the right to investigate and take
            appropriate action.
          </p>
        </section>

        {/* 6 */}
        <section className="mb-6">
          <h2 className="text-xl font-semibold mb-2">6. Coupon Usage</h2>
          <p className="text-gray-700">
            Coupons purchased on DealDine are subject to availability, validity
            period, and specific terms set by partner restaurants. Users must
            verify deal availability before visiting.
            <br /><br />
            Coupons cannot be resold, transferred, or reused once redeemed.
          </p>
        </section>

        {/* 7 */}
        <section className="mb-6">
          <h2 className="text-xl font-semibold mb-2">7. Refund Policy</h2>
          <p className="text-gray-700">
            Refunds will only be provided under the following conditions:
            <ul className="list-disc ml-6 mt-2">
              <li>Payment was deducted but coupon was not issued</li>
              <li>Duplicate transaction occurred</li>
              <li>Restaurant refuses to honor a valid coupon</li>
            </ul>
            <br />
            No refunds will be issued once a coupon has been successfully
            redeemed or after its expiry.
          </p>
        </section>

        {/* 8 */}
        <section className="mb-6">
          <h2 className="text-xl font-semibold mb-2">
            8. Restaurant Responsibility
          </h2>
          <p className="text-gray-700">
            DealDine is not responsible for any service-related issues,
            including food quality, delays, or refusal of service by partner
            restaurants. Any disputes must be resolved directly with the
            restaurant.
          </p>
        </section>

        {/* 9 */}
        <section className="mb-6">
          <h2 className="text-xl font-semibold mb-2">
            9. Fraud & Misuse
          </h2>
          <p className="text-gray-700">
            DealDine reserves the right to suspend or terminate accounts
            involved in fraudulent activities, abuse of coupons, or excessive
            chargebacks.
          </p>
        </section>

        {/* 10 */}
        <section className="mb-6">
          <h2 className="text-xl font-semibold mb-2">
            10. Limitation of Liability
          </h2>
          <p className="text-gray-700">
            DealDine shall not be liable for any indirect, incidental, or
            consequential damages arising from the use of the platform or
            services provided by partner restaurants.
          </p>
        </section>

        {/* 11 */}
        <section className="mb-6">
          <h2 className="text-xl font-semibold mb-2">
            11. Termination
          </h2>
          <p className="text-gray-700">
            DealDine reserves the right to suspend or terminate access to the
            platform at its sole discretion, without prior notice, for violation
            of these terms.
          </p>
        </section>

        {/* 12 */}
        <section className="mb-6">
          <h2 className="text-xl font-semibold mb-2">
            12. Changes to Terms
          </h2>
          <p className="text-gray-700">
            DealDine may update these Terms & Conditions at any time. Continued
            use of the platform constitutes acceptance of the updated terms.
          </p>
        </section>

        {/* 13 */}
        <section className="mb-6">
          <h2 className="text-xl font-semibold mb-2">
            13. Governing Law
          </h2>
          <p className="text-gray-700">
            These Terms shall be governed by and interpreted in accordance with
            the laws of India.
          </p>
        </section>

        {/* 14 */}
        <section>
          <h2 className="text-xl font-semibold mb-2">
            14. Contact Us
          </h2>
          <p className="text-gray-700">
            For any questions or concerns, contact us at{" "}
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