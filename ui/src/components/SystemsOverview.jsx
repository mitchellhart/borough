import React from 'react';
import { FaHome, FaWrench } from 'react-icons/fa';
import { 
  BsFillHouseFill, 
  BsLightningChargeFill, 
  BsThermometerHalf, 
  BsDropletFill 
} from 'react-icons/bs';
import { GiWindow } from 'react-icons/gi';
import { MdOutlineFoundation } from 'react-icons/md';
import { TbPaint } from 'react-icons/tb';
import { FoundationIcon } from './icons/FoundationIcon';
import { RoofIcon } from './icons/RoofIcon';
import { WallsIcon } from './icons/WallsIcon';
import { WindowsIcon} from './icons/WindowsIcon';
import { ElectricalIcon} from './icons/ElectricalIcon';
import { PlumbingIcon} from './icons/PlumbingIcon';
import { HeatingIcon} from './icons/HeatingIcon';
import { FinishesIcon} from './icons/FinishesIcon';

// SystemCard component for individual system cards
const SystemCard = ({ 
  icon, 
  title, 
  status, 
  years, 
  avgLifespan, 
  percentLeft, 
  issueText, 
  issueDescription 
}) => {
  // Status colors
  const statusColors = {
    'GOOD': 'bg-green-500',
    'FAIR': 'bg-gray-400',
    'ALERT': 'bg-red-500'
  };

  // Issue box background colors
  const issueBoxColors = {
    'Minor Issues': 'bg-gray-100',
    'Cosmetic Issues': 'bg-gray-100',
    'Not inspected': 'bg-red-50'
  };

  return (
    <div className="border border-gray-100 rounded-lg p-6 flex flex-col h-full bg-[#ffffff]">
      <div className="flex justify-between items-center mb-2">
        <div className="text-3xl text-gray-800">
          {icon}
        </div>
        <div className={`${statusColors[status]} text-white px-2 py-1 rounded-full text-sm font-medium`}>
          {status}
        </div>
      </div>
      
      <h3 className="text-xl font-bold mb-6">{title}</h3>
      
      {years && (
        <div className="mb-4">
          <div className="flex justify-between text-sm mb-1">
            <div>
              <span className="font-bold">{years} years</span>
              <div className="text-gray-500 text-xs">{avgLifespan}</div>
            </div>
            <div className="text-gray-500">{percentLeft}</div>
          </div>
          
          <div className="w-full bg-gray-200 rounded-full h-2.5">
            <div 
              className="bg-green-500 h-2.5 rounded-full" 
              style={{ width: `${55}%` }}
            ></div>
          </div>
        </div>
      )}
      
      {issueText && (
        <div className={`${issueBoxColors[issueText]} p-4 rounded-md mt-auto`}>
          <h4 className={`font-medium mb-1 ${issueText === 'Not inspected' ? 'text-red-500' : 'text-gray-600'}`}>
            {issueText}
          </h4>
          <p className="text-sm text-gray-600">{issueDescription}</p>
        </div>
      )}
    </div>
  );
};

function SystemsOverview() {
  const systems = [
    {
      icon: <FoundationIcon />,
      title: "Foundation",
      status: "GOOD",
      years: "5",
      avgLifespan: "12 years avg",
      percentLeft: "45% left",
      issueText: null,
      issueDescription: null
    },
    {
      icon: <RoofIcon />,
      title: "Roof",
      status: "GOOD",
      years: "13",
      avgLifespan: "20-30 years avg",
      percentLeft: "45% left",
      issueText: null,
      issueDescription: null
    },
    {
      icon: <WallsIcon/>,
      title: "Walls & Floors",
      status: "GOOD",
      years: "50",
      avgLifespan: "20-30 years avg",
      percentLeft: "45% left",
      issueText: null,
      issueDescription: null
    },
    {
      icon: <WindowsIcon/>,
      title: "Windows & Doors",
      status: "GOOD",
      years: "50",
      avgLifespan: "20-30 years avg",
      percentLeft: "45% left",
      issueText: null,
      issueDescription: null
    },
    {
      icon: <ElectricalIcon />,
      title: "Electrical",
      status: "GOOD",
      years: "5",
      avgLifespan: "12 years avg",
      percentLeft: "45% left",
      issueText: null,
      issueDescription: null
    },
    {
      icon: <PlumbingIcon />,
      title: "Plumbing",
      status: "FAIR",
      years: null,
      avgLifespan: null,
      percentLeft: null,
      issueText: "Minor Issues",
      issueDescription: "Overall the condition is operable with only minor fixes requires at this time"
    },
    {
      icon: <HeatingIcon />,
      title: "Heating & Cooling",
      status: "ALERT",
      years: null,
      avgLifespan: null,
      percentLeft: null,
      issueText: "Not inspected",
      issueDescription: "This system was not found in the inspection report, check with seller for more info"
    },
    {
      icon: <FinishesIcon />,
      title: "Finishes",
      status: "FAIR",
      years: null,
      avgLifespan: null,
      percentLeft: null,
      issueText: "Cosmetic Issues",
      issueDescription: "Minor cosmetic issues from painting to various hardware repairs may be needed"
    }
  ];

  return (
    <div className="max-w-6xl mx-auto px-4 py-12">
      <h2 className="text-4xl font-bold mb-8 text-[#395E44]">Systems Overview</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {systems.map((system, index) => (
          <SystemCard key={index} {...system} />
        ))}
      </div>
    </div>
  );
}

export default SystemsOverview; 