// NegotiationGuide.jsx
import React from 'react';

function NegotiationGuide({ totalEstimate }) {
  return (
    <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
      <h2 className="text-2xl font-bold mb-4">Next Steps: Negotiation Guide</h2>
      
      <div className="space-y-8">
        <div>
          <h3 className="text-lg font-semibold mb-2">Estimated Repairs Total</h3>
          <p className="text-3xl font-bold text-blue-600">
            {totalEstimate.toLocaleString('en-US', {
              style: 'currency',
              currency: 'USD'
            })}
          </p>
        </div>

        <div>
          <h3 className="text-lg font-semibold mb-2">Negotiation Strategy</h3>
          <ul className="list-disc pl-5 space-y-2">
            <li>Start by requesting {(totalEstimate * 1.1).toLocaleString('en-US', {
              style: 'currency',
              currency: 'USD'
            })} to account for potential cost increases</li>
            <li>Consider asking for a credit at closing rather than repairs by seller</li>
            <li>Prioritize major issues related to safety and structural integrity</li>
            <li>Be prepared to compromise on cosmetic issues</li>
          </ul>
        </div>

        <div>
          <h3 className="text-lg font-semibold mb-3">Understanding the Inspection Contingency</h3>
          <div className="bg-gray-50 p-4 rounded-lg">
            <ul className="space-y-3">
              <li>• Standard contracts include 5-10 day inspection period</li>
              <li>• Your options after inspection:</li>
              <ul className="ml-6 space-y-2 mt-2">
                <li>1. Request repairs from seller</li>
                <li>2. Negotiate price reduction</li>
                <li>3. Request closing cost credits</li>
                <li>4. Walk away (with earnest money, per contract terms)</li>
              </ul>
            </ul>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <h3 className="text-lg font-semibold mb-3">What to Negotiate</h3>
            <div className="bg-green-50 p-4 rounded-lg">
              <ul className="space-y-2">
                <li>✓ Structural issues</li>
                <li>✓ Major plumbing/electrical problems</li>
                <li>✓ HVAC system failures</li>
                <li>✓ Water damage or mold</li>
                <li>✓ Pest infestations</li>
                <li>✓ Undisclosed issues</li>
                <li>✓ Health and safety concerns</li>
              </ul>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-3">What Not to Negotiate</h3>
            <div className="bg-red-50 p-4 rounded-lg">
              <ul className="space-y-2">
                <li>✗ Minor cosmetic issues</li>
                <li>✗ Normal wear and tear</li>
                <li>✗ Small maintenance items</li>
                <li>✗ Outdated but functional features</li>
                <li>✗ Minor aesthetic preferences</li>
              </ul>
            </div>
          </div>
        </div>

        <div>
          <h3 className="text-lg font-semibold mb-3">Negotiation Best Practices</h3>
          <div className="bg-blue-50 p-4 rounded-lg">
            <ul className="space-y-3">
              <li>• Work closely with your real estate agent</li>
              <li>• Focus on major issues rather than minor repairs</li>
              <li>• Get professional estimates for repairs</li>
              <li>• Be prepared to compromise</li>
              <li>• Consider current market conditions</li>
              <li>• Document all requests and communications</li>
            </ul>
          </div>
        </div>

        <div className="bg-yellow-50 p-4 rounded-lg">
          <h3 className="text-lg font-semibold mb-3">Important Considerations</h3>
          <ul className="space-y-2">
            <li>• State laws and local practices may vary</li>
            <li>• Seller's motivation affects negotiation flexibility</li>
            <li>• Older homes typically require more repairs</li>
            <li>• Market conditions influence negotiating power</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

export default NegotiationGuide;