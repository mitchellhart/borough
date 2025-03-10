// NegotiationGuide.jsx
import React from 'react';
import { useNavigate, Link } from 'react-router-dom';




function NegotiationGuide({ totalEstimate }) {
  const printRef = React.useRef(null);

  
  const handleDownloadPDF = async () => {
    
    window.print()

    const element = printRef.current;
  
    if(!element) {
      return null;
    }

    const canvas = await html2canvas(element);
  }
  return (
<>
    <h2 className="text-4xl ml-14 font-bold mb-8 text-[#395E44] mt-20">Negotiation Guide</h2>
    <div className="rounded-lg border bg-card p-8 shadow-sm mb-8 space-y-10">

    <button
              onClick={ handleDownloadPDF}
              className="hover:bg-gray-400 text-sm text-gray-800 font-bold py-2 px-2 rounded-xl inline-flex gap-2 items-center border"
            >
              Save to PDF
        </button>

    <div ref={printRef} className="space-y-4">
        <h3 className="text-2xl font-semibold text-foreground mb-4">Strategy</h3>
        <ol className="space-y-4 list-decimal pl-5">
          <li className="pl-2">
            <span className="text-base">Request {(totalEstimate * 1.1).toLocaleString('en-US', {
              style: 'currency',
              currency: 'USD'
            })} (10% over this estimate) to account for potential cost increases</span>
          </li>
          <li className="pl-2">
            <span className="text-base">Consider asking for a credit at closing rather than repairs by seller. <Link to="/articles" >Learn more about why → </Link></span>
           
          </li>
          <li className="pl-2">
            <span className="text-base">Prioritize major issues related to safety and structural integrity</span>
          </li>
          <li className="pl-2">
            <span className="text-base">Be prepared to compromise on cosmetic issues</span>
          </li>
        </ol>
      </div>

    <div className="grid md:grid-cols-2 gap-8">
        <div className="space-y-4">
          <h3 className="text-2xl font-semibold text-foreground mb-4">What to Negotiate</h3>
          <div className="rounded-md border p-6">
            <ul className="space-y-3">
              {['Structural issues', 'Major plumbing/electrical problems', 'HVAC system failures',
                'Water damage or mold', 'Pest infestations', 'Undisclosed issues', 
                'Health and safety concerns'].map((item) => (
                <li key={item} className="flex items-start gap-3">
                  <svg className="mt-1 w-5 h-5 text-green-600 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="text-base">{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="text-2xl font-semibold text-foreground mb-4">What Not to Negotiate</h3>
          <div className="rounded-md border p-6">
            <ul className="space-y-3">
              {['Minor cosmetic issues', 'Normal wear and tear', 'Small maintenance items',
                'Outdated but functional features', 'Minor aesthetic preferences'].map((item) => (
                <li key={item} className="flex items-start gap-3">
                  <svg className="mt-1 w-5 h-5 text-destructive flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                  <span className="text-base">{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
      



      <div className="space-y-4">
        <h3 className="text-2xl font-semibold text-foreground mb-4">Important Considerations</h3>
        <div className="rounded-md border p-6">
          <ul className="space-y-3">
            {['State laws and local practices may vary', 'Seller\'s motivation affects negotiation flexibility',
              'Older homes typically require more repairs', 'Market conditions influence negotiating power'].map((item) => (
              <li key={item} className="flex items-start gap-3">
                <span className="mt-1.5 h-2 w-2 rounded-full bg-amber-500 flex-shrink-0"></span>
                <span className="text-base">{item}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
    </>
  );
}

export default NegotiationGuide;