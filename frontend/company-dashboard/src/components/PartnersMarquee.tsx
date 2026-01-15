'use client';

import React from 'react';

interface University {
  id: string;
  name: string;
  shortName: string;
}

export default function PartnersMarquee() {
  const universities: University[] = [
    { id: '1', name: 'University of Nairobi', shortName: 'UoN' },
    { id: '2', name: 'Kenyatta University', shortName: 'KU' },
    { id: '3', name: 'Moi University', shortName: 'MU' },
    { id: '4', name: 'Jomo Kenyatta University', shortName: 'JKUAT' },
    { id: '5', name: 'Egerton University', shortName: 'EU' },
    { id: '6', name: 'Maseno University', shortName: 'MSU' },
    { id: '7', name: 'Technical University of Kenya', shortName: 'TUK' },
    { id: '8', name: 'Machakos University', shortName: 'MksU' },
    { id: '9', name: 'Multimedia University', shortName: 'MMU' },
    { id: '10', name: 'Strathmore University', shortName: 'SU' },
    { id: '11', name: 'Daystar University', shortName: 'DU' },
    { id: '12', name: 'Mount Kenya University', shortName: 'MKU' },
    { id: '13', name: 'Pwani University', shortName: 'PU' },
    { id: '14', name: 'Karatina University', shortName: 'KarU' },
    { id: '15', name: 'Chuka University', shortName: 'CU' },
    { id: '16', name: 'Kisii University', shortName: 'KSU' },
  ];

  // Split into two rows
  const firstRow = universities.filter((_, index) => index % 2 === 0);
  const secondRow = universities.filter((_, index) => index % 2 === 1);

  // Duplicate for seamless infinite scroll
  const duplicatedFirstRow = [...firstRow, ...firstRow, ...firstRow, ...firstRow];
  const duplicatedSecondRow = [...secondRow, ...secondRow, ...secondRow, ...secondRow];

  // Generate color for logo
  const getLogoColor = (name: string) => {
    const colors = [
      'from-blue-600 to-blue-700',
      'from-green-600 to-green-700',
      'from-purple-600 to-purple-700',
      'from-red-600 to-red-700',
      'from-indigo-600 to-indigo-700',
      'from-pink-600 to-pink-700',
      'from-teal-600 to-teal-700',
      'from-orange-600 to-orange-700',
      'from-cyan-600 to-cyan-700',
      'from-yellow-600 to-yellow-700',
    ];
    const index = name.charCodeAt(0) % colors.length;
    return colors[index];
  };

  return (
    <>
      <style jsx>{`
        @keyframes scroll-left {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(-50%);
          }
        }

        @keyframes scroll-right {
          0% {
            transform: translateX(-50%);
          }
          100% {
            transform: translateX(0);
          }
        }

        .animate-scroll-left {
          animation: scroll-left 80s linear infinite;
        }

        .animate-scroll-right {
          animation: scroll-right 80s linear infinite;
        }

        .animate-scroll-left:hover,
        .animate-scroll-right:hover {
          animation-play-state: paused;
        }
      `}</style>

      <section className="py-16 bg-white overflow-hidden">
        {/* Header */}
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 mb-12">
          <div className="text-center">
            <p className="text-sm font-semibold text-primary-600 uppercase tracking-wide mb-2">
              Trusted By
            </p>
            <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
              Our University Partners
            </h2>
          </div>
        </div>

        {/* First Row - Right to Left */}
        <div className="relative mb-8">
          <div className="absolute left-0 top-0 bottom-0 w-20 bg-gradient-to-r from-white to-transparent z-10 pointer-events-none" />
          <div className="absolute right-0 top-0 bottom-0 w-20 bg-gradient-to-l from-white to-transparent z-10 pointer-events-none" />

          <div className="flex overflow-hidden">
            <div className="flex gap-8 animate-scroll-left">
              {duplicatedFirstRow.map((university, index) => (
                <div
                  key={`row1-${university.id}-${index}`}
                  className="flex items-center gap-4 flex-shrink-0 group cursor-pointer"
                >
                  {/* Logo Circle */}
                  <div className={`w-16 h-16 rounded-full bg-gradient-to-br ${getLogoColor(university.name)} flex items-center justify-center shadow-lg group-hover:shadow-xl group-hover:scale-110 transition-all duration-300`}>
                    <span className="text-white font-bold text-lg">
                      {university.shortName}
                    </span>
                  </div>
                  
                  {/* University Name */}
                  <div className="text-gray-900 font-semibold text-lg whitespace-nowrap group-hover:text-primary-600 transition-colors">
                    {university.name}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Second Row - Left to Right */}
        <div className="relative">
          <div className="absolute left-0 top-0 bottom-0 w-20 bg-gradient-to-r from-white to-transparent z-10 pointer-events-none" />
          <div className="absolute right-0 top-0 bottom-0 w-20 bg-gradient-to-l from-white to-transparent z-10 pointer-events-none" />

          <div className="flex overflow-hidden">
            <div className="flex gap-8 animate-scroll-right">
              {duplicatedSecondRow.map((university, index) => (
                <div
                  key={`row2-${university.id}-${index}`}
                  className="flex items-center gap-4 flex-shrink-0 group cursor-pointer"
                >
                  {/* Logo Circle */}
                  <div className={`w-16 h-16 rounded-full bg-gradient-to-br ${getLogoColor(university.name)} flex items-center justify-center shadow-lg group-hover:shadow-xl group-hover:scale-110 transition-all duration-300`}>
                    <span className="text-white font-bold text-lg">
                      {university.shortName}
                    </span>
                  </div>
                  
                  {/* University Name */}
                  <div className="text-gray-900 font-semibold text-lg whitespace-nowrap group-hover:text-primary-600 transition-colors">
                    {university.name}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </>
  );
}