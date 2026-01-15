'use client';

import React, { useEffect, useState } from 'react';

interface University {
  id: string;
  name: string;
  shortName: string;
  location: string;
  students: number;
}

export default function PartnersCarouselLogos() {
  const [universities, setUniversities] = useState<University[]>([]);

  useEffect(() => {
    // Mock data with Kenyan universities
    const mockUniversities: University[] = [
      { id: '1', name: 'University of Nairobi', shortName: 'UoN', location: 'Nairobi', students: 2450 },
      { id: '2', name: 'Kenyatta University', shortName: 'KU', location: 'Nairobi', students: 1890 },
      { id: '3', name: 'Moi University', shortName: 'MU', location: 'Eldoret', students: 1560 },
      { id: '4', name: 'Jomo Kenyatta University', shortName: 'JKUAT', location: 'Juja', students: 2030 },
      { id: '5', name: 'Egerton University', shortName: 'EU', location: 'Njoro', students: 1340 },
      { id: '6', name: 'Maseno University', shortName: 'MSU', location: 'Maseno', students: 1120 },
      { id: '7', name: 'Technical University of Kenya', shortName: 'TUK', location: 'Nairobi', students: 980 },
      { id: '8', name: 'Machakos University', shortName: 'MksU', location: 'Machakos', students: 850 },
      { id: '9', name: 'Multimedia University', shortName: 'MMU', location: 'Nairobi', students: 720 },
      { id: '10', name: 'Strathmore University', shortName: 'SU', location: 'Nairobi', students: 1450 },
      { id: '11', name: 'Daystar University', shortName: 'DU', location: 'Nairobi', students: 890 },
      { id: '12', name: 'Mount Kenya University', shortName: 'MKU', location: 'Thika', students: 1670 },
    ];
    setUniversities(mockUniversities);
  }, []);

  // Duplicate for seamless scroll
  const duplicatedUniversities = [...universities, ...universities, ...universities];

  // Generate a color based on university name
  const getUniversityColor = (name: string) => {
    const colors = [
      'from-blue-500 to-blue-600',
      'from-green-500 to-green-600',
      'from-purple-500 to-purple-600',
      'from-red-500 to-red-600',
      'from-yellow-500 to-yellow-600',
      'from-indigo-500 to-indigo-600',
      'from-pink-500 to-pink-600',
      'from-teal-500 to-teal-600',
    ];
    const index = name.charCodeAt(0) % colors.length;
    return colors[index];
  };

  return (
    <section className="py-12 bg-white overflow-hidden border-y border-gray-100">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 mb-8">
        <div className="text-center">
          <p className="text-sm font-semibold text-primary-600 uppercase tracking-wide">
            Trusted By Leading Institutions
          </p>
          <h2 className="mt-2 text-2xl font-bold text-gray-900">
            Our University Partners
          </h2>
        </div>
      </div>

      {/* Scrolling Container */}
      <div className="relative">
        {/* Gradient Overlays */}
        <div className="absolute left-0 top-0 bottom-0 w-24 bg-gradient-to-r from-white to-transparent z-10 pointer-events-none" />
        <div className="absolute right-0 top-0 bottom-0 w-24 bg-gradient-to-l from-white to-transparent z-10 pointer-events-none" />

        {/* Scrolling Track */}
        <div className="flex animate-scroll-continuous hover:pause-animation">
          {duplicatedUniversities.map((university, index) => (
            <div
              key={`${university.id}-${index}`}
              className="flex-shrink-0 mx-6"
            >
              <div className="group cursor-pointer">
                {/* Logo Circle */}
                <div className={`w-24 h-24 rounded-full bg-gradient-to-br ${getUniversityColor(university.name)} flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-300 group-hover:scale-110`}>
                  <span className="text-white font-bold text-xl">
                    {university.shortName}
                  </span>
                </div>
                
                {/* University Name on Hover */}
                <div className="mt-3 text-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <p className="text-sm font-medium text-gray-900 whitespace-nowrap">
                    {university.name}
                  </p>
                  <p className="text-xs text-gray-500">
                    {university.students.toLocaleString()} students
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* CSS for Animation */}
      <style jsx>{`
        @keyframes scroll-continuous {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(-33.333%);
          }
        }

        .animate-scroll-continuous {
          animation: scroll-continuous 90s linear infinite;
        }

        .pause-animation:hover {
          animation-play-state: paused;
        }

        @media (prefers-reduced-motion: reduce) {
          .animate-scroll-continuous {
            animation: none;
          }
        }
      `}</style>
    </section>
  );
}