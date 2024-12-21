import React from 'react';

function Terms() {
  return (
    <div className=" mx-auto py-8 bg-surface">
      <div className="max-w-3xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Terms of Service</h1>
      
      <div className="space-y-6">
        <section>
          <h2 className="text-xl font-semibold mb-3">1. Acceptance of Terms</h2>
          <p className="text-gray-600">
            By accessing and using Borough's services, you agree to be bound by these Terms of Service. 
            If you do not agree to these terms, please do not use our services.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3">2. Description of Service</h2>
          <p className="text-gray-600">
            Borough provides AI-powered analysis of home inspection reports. Our service is provided 
            "as is" and we make no warranties about the accuracy or completeness of the analysis.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3">3. User Responsibilities</h2>
          <p className="text-gray-600">
            Users are responsible for maintaining the confidentiality of their account information 
            and for all activities that occur under their account.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3">4. Privacy Policy</h2>
          <p className="text-gray-600">
            Your use of Borough's services is also governed by our Privacy Policy. Please review 
            our Privacy Policy to understand our practices.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3">5. Modifications to Service</h2>
          <p className="text-gray-600">
            We reserve the right to modify or discontinue our service with or without notice to you. 
            We shall not be liable to you or any third party should we exercise this right.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3">6. Customer Service</h2>
          <p className="text-gray-600">
            For any questions or concerns about our service, please contact our customer support team at{' '}
            <a href="mailto:help@borough-ai.com" className="text-blue-600 hover:underline">
              help@borough-ai.com
            </a>
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3">7. Refund and Dispute Policy</h2>
          <p className="text-gray-600">
            If you are unsatisfied with our service, you may request a refund within 14 days of your initial purchase. 
            Refund requests will be evaluated on a case-by-case basis. To initiate a refund request or dispute, 
            please contact our customer service team with details about your concern.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3">8. Cancellation Policy</h2>
          <p className="text-gray-600">
            Borough is a subscription-based service billed monthly. You may cancel your subscription at any time 
            through your account settings or by contacting customer service. Upon cancellation, your subscription 
            will remain active until the end of your current billing period, after which no further charges will 
            be made. You will continue to have access to the service until the end of your paid period.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3">9. Legal and Export Restrictions</h2>
          <p className="text-gray-600">
            Our services are intended for use in accordance with United States laws and regulations. 
            Users are responsible for ensuring their use of Borough's services complies with all applicable 
            local, state, national, and international laws and regulations.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3">10. Promotional Terms</h2>
          <p className="text-gray-600">
            Currently, Borough does not offer any promotional programs. Any future promotions, discounts, 
            or special offers will be subject to their own specific terms and conditions, which will be 
            clearly communicated at the time of the offer.
          </p>
        </section>
      </div>
      </div>
    </div>
  );
}

export default Terms; 