// NegotiationGuide.jsx
import React from 'react';

function NegotiationGuide({ totalEstimate }) {
  return (
    <div className="bg-white/50 backdrop-blur-sm border rounded-xl shadow-sm p-6 mb-8">
      <h2 className="text-2xl font-semibold tracking-tight mb-6">Next Steps: Negotiation Guide</h2>
      
      <div className="space-y-6">
        <div className="p-4 rounded-lg border bg-gradient-to-b from-blue-50/50 to-blue-100/50">
          <h3 className="text-sm font-medium text-gray-500 mb-1">Estimated Repairs Total</h3>
          <p className="text-3xl font-semibold text-blue-700">
            {totalEstimate.toLocaleString('en-US', {
              style: 'currency',
              currency: 'USD'
            })}
          </p>
        </div>

        <div className="space-y-2">
          <h3 className="text-sm font-medium text-gray-500">Negotiation Strategy</h3>
          <ul className="space-y-2 text-sm text-gray-600">
            <li className="flex items-center gap-2">
              <span className="h-1 w-1 rounded-full bg-gray-400"></span>
              Start by requesting {(totalEstimate * 1.1).toLocaleString('en-US', {
                style: 'currency',
                currency: 'USD'
              })} to account for potential cost increases
            </li>
            <li className="flex items-center gap-2">
              <span className="h-1 w-1 rounded-full bg-gray-400"></span>
              Consider asking for a credit at closing rather than repairs by seller
            </li>
            <li className="flex items-center gap-2">
              <span className="h-1 w-1 rounded-full bg-gray-400"></span>
              Prioritize major issues related to safety and structural integrity
            </li>
            <li className="flex items-center gap-2">
              <span className="h-1 w-1 rounded-full bg-gray-400"></span>
              Be prepared to compromise on cosmetic issues
            </li>
          </ul>
        </div>

        <div className="space-y-2">
          <h3 className="text-sm font-medium text-gray-500">Understanding the Inspection Contingency</h3>
          <div className="rounded-lg border p-4 space-y-3 text-sm text-gray-600">
            <p>Standard contracts include 5-10 day inspection period</p>
            <div>
              <p className="mb-2">Your options after inspection:</p>
              <ul className="space-y-2 pl-4">
                <li className="flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-blue-400"></span>
                  Request repairs from seller
                </li>
                <li className="flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-blue-400"></span>
                  Negotiate price reduction
                </li>
                <li className="flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-blue-400"></span>
                  Request closing cost credits
                </li>
                <li className="flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-blue-400"></span>
                  Walk away (with earnest money, per contract terms)
                </li>
              </ul>
            </div>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <h3 className="text-sm font-medium text-gray-500">What to Negotiate</h3>
            <div className="rounded-lg border bg-green-50/50 p-4">
              <ul className="space-y-2 text-sm text-gray-600">
                {['Structural issues', 'Major plumbing/electrical problems', 'HVAC system failures',
                  'Water damage or mold', 'Pest infestations', 'Undisclosed issues', 
                  'Health and safety concerns'].map((item) => (
                  <li key={item} className="flex items-center gap-2">
                    <svg className="w-4 h-4 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="space-y-2">
            <h3 className="text-sm font-medium text-gray-500">What Not to Negotiate</h3>
            <div className="rounded-lg border bg-red-50/50 p-4">
              <ul className="space-y-2 text-sm text-gray-600">
                {['Minor cosmetic issues', 'Normal wear and tear', 'Small maintenance items',
                  'Outdated but functional features', 'Minor aesthetic preferences'].map((item) => (
                  <li key={item} className="flex items-center gap-2">
                    <svg className="w-4 h-4 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <h3 className="text-sm font-medium text-gray-500">Negotiation Best Practices</h3>
          <div className="rounded-lg border bg-blue-50/50 p-4">
            <ul className="space-y-2 text-sm text-gray-600">
              {['Work closely with your real estate agent', 'Focus on major issues rather than minor repairs',
                'Get professional estimates for repairs', 'Be prepared to compromise',
                'Consider current market conditions', 'Document all requests and communications'].map((item) => (
                <li key={item} className="flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-blue-400"></span>
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="rounded-lg border bg-yellow-50/50 p-4 space-y-2">
          <h3 className="text-sm font-medium text-gray-500">Important Considerations</h3>
          <ul className="space-y-2 text-sm text-gray-600">
            {['State laws and local practices may vary', 'Seller\'s motivation affects negotiation flexibility',
              'Older homes typically require more repairs', 'Market conditions influence negotiating power'].map((item) => (
              <li key={item} className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-yellow-400"></span>
                {item}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}

export default NegotiationGuide;