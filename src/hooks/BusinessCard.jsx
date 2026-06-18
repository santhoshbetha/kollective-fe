

import React from 'react';
import { 
  MapPinIcon, 
  PhoneIcon, 
  GlobeAltIcon, 
  EnvelopeIcon, 
  ChatBubbleLeftRightIcon,
  HandThumbUpIcon
} from '@heroicons/react/24/outline';

const BusinessCard = ({ business, onUpvote, onJoinDiscussion }) => {
  const isOnline = business.category === 'online';
  const isProposal = business.type === 'proposal';

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow mb-4">
      {/* Header: Name and Category Badge */}
      <div className="flex justify-between items-start mb-3">
        <div>
          <h3 className="text-lg font-bold text-gray-900">{business.name}</h3>
        
            {/* District Badge Row */}
            <div className="flex flex-wrap gap-2 mt-2">
            {/* Federal District Badge (Blue) */}
            <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-100 uppercase">
                🏛️ {business.districts.federal}
            </span>
            
            {/* State Senate Badge (Purple) */}
            <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-purple-50 text-purple-700 border border-purple-100 uppercase">
                📜 {business.districts.state_senate}
            </span>
            </div>

          <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-blue-50 text-blue-600 uppercase tracking-wider">
            {business.category.replace('_', ' ')}
          </span>
        </div>
        
        {/* Verification Status */}
        {business.verification_status === 'verified' && (
          <span className="text-[10px] bg-green-100 text-green-700 px-2 py-1 rounded font-bold uppercase">
            Verified
          </span>
        )}
      </div>

      {/* Description */}
      <p className="text-gray-600 text-sm mb-4 line-clamp-2">
        {business.description}
      </p>

      {/* Dynamic Info Section */}
      <div className="space-y-2 mb-6">
        {isOnline ? (
          <div className="flex items-center text-sm text-purple-600">
            <GlobeAltIcon className="h-4 w-4 mr-2" />
            <span className="truncate">{business.website || "Online Storefront"}</span>
          </div>
        ) : (
          <div className="flex items-center text-sm text-gray-500">
            <MapPinIcon className="h-4 w-4 mr-2 text-red-400" />
            <span className="truncate">{business.address}, {business.zip}</span>
          </div>
        )}
        
        {business.phone && (
          <div className="flex items-center text-sm text-gray-500">
            <PhoneIcon className="h-4 w-4 mr-2 text-green-500" />
            <span>{business.phone}</span>
          </div>
        )}
      </div>

      {/* Quick Action Bar */}
      <div className="flex items-center justify-between pt-4 border-t border-gray-100">
        <div className="flex space-x-3">
          {/* Proposal specific actions */}
          {isProposal ? (
            <>
              <button 
                onClick={() => onUpvote(business.id)}
                className="flex items-center text-sm font-semibold text-blue-600 hover:text-blue-800"
              >
                <HandThumbUpIcon className="h-5 w-5 mr-1" />
                Interested
              </button>
              <button 
                onClick={() => onJoinDiscussion(business.id)}
                className="flex items-center text-sm font-semibold text-gray-600 hover:text-gray-800"
              >
                <ChatBubbleLeftRightIcon className="h-5 w-5 mr-1" />
                Discuss
              </button>
            </>
          ) : (
            /* Existing Business specific actions */
            <>
              {isOnline ? (
                <a 
                  href={business.website} 
                  target="_blank" 
                  className="bg-purple-600 text-white px-4 py-2 rounded-lg text-sm font-bold"
                >
                  Visit Store
                </a>
              ) : (
                <a 
                  href={`https://maps.google.com{business.address}`} 
                  target="_blank" 
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-bold"
                >
                  Get Directions
                </a>
              )}
              <a 
                href={`mailto:${business.email}`}
                className="p-2 border border-gray-200 rounded-lg text-gray-500 hover:bg-gray-50"
              >
                <EnvelopeIcon className="h-5 w-5" />
              </a>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default BusinessCard;

/*
2. How it works for Discovery

    Visual Logic: If a user is browsing the "Idea Proposals" tab, they see "Interested" and "Discuss" buttons. If they switch to the "Directory" tab, they see "Get Directions" or "Visit Store."
    The "Online" Distinction: We use purple accents for online businesses and blue/red for physical ones, helping users visually sort their local economy.
    Performance: By using Line Clamping (line-clamp-2), we keep the cards uniform in size, making the 60-mile radius feed scannable and clean.

    3. CSS Utility Requirement
Make sure you have the @tailwindcss/line-clamp plugin enabled (or use the native line-clamp classes in Tailwind v3.3+) to handle the truncated descriptions.

Why this is a Discovery Powerhouse

    Hyper-Local Identity: When a user in Federal District 12 sees a business idea tagged with that exact same district badge, their sense of "ownership" and interest in the discussion increases.
    Constituent Loyalty: For existing businesses, these badges signal to residents: "This shop is in YOUR district—support your local economy." house.gov
    Navigation: As users scroll through the 60-mile radius feed, the badges act as visual landmarks, helping them distinguish between businesses in their immediate city versus neighboring districts. visitthecapitol.gov
*/

