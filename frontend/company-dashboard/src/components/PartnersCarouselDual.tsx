'use client';

import React, { useEffect, useState } from 'react';
import { AcademicCapIcon, MapPinIcon, UsersIcon, CheckBadgeIcon } from '@heroicons/react/24/solid';

interface University {
  id: string;
  name: string;
  shortName: string;
  location: string;
  students: number;
  established: string;
}

export default function PartnersCarouselDual() {
  const [universities, setUniversities] = useState<University[]>([]);

  useEffect(() => {
    const mockUniversities: University[] = [
      { id: '1', name: 'University of Nairobi', shortName: 'UoN', location: 'Nairobi', students: 2450, established: '1956' },
      { id: '2', name: 'Kenyatta University', shortName: 'KU', location: 'Nairobi', students: 1890, established: '1985' },
      { id: '3', name: 'Moi University', shortName: 'MU', location: 'Eldoret', students: 1560, established: '1984' },
      { id: '4', name: 'Jomo Kenyatta University', shortName: 'JKUAT', location: 'Juja', students: 2030, established: '1994' },
      { id: '5', name: 'Egerton University', shortName: 'EU', location: 'Njoro', students: 1340, established: '1987' },
      { id: '6', name: 'Maseno University', shortName: 'MSU', location: 'Maseno', students: 1120, established: '1991' },
      { id: '7', name: 'Technical University of Kenya', shortName: 'TUK', location: 'Nairobi', students: 980, established: '2013' },
      { id: '8', name: 'Machakos University', shortName: 'MksU', location: 'Machakos', students: 850, established: '2011' },
      { id: '9', name: 'Multimedia University', shortName: 'MMU', location: 'Nairobi', students: 720, established: '2013' },
      { id: '10', name: 'Strathmore University', shortName: 'SU', location: 'Nairobi', students: 1450, established: '2002' },
      { id: '11', name: 'Daystar University', shortName: 'DU', location: 'Nairobi', students: 890, established: '1994' },
      { id: '12', name: 'Mount Kenya University', shortName: 'MKU', location: 'Thika', students: 1670, established: '2011' },
    ];
    setUniversities(mockUniversities);
  }, []);

  // Split universities into two rows
  const firstRow = universities.filter((_, index) => index % 2 === 0);
  const secondRow = universities.filter((_, index) => index % 2 === 1);

  // Duplicate for seamless scroll
  const duplicatedFirstRow = [...firstRow, ...firstRow, ...firstRow];
  const duplicatedSecondRow = [...secondRow, ...secondRow, ...secondRow];

  const getUniversityColor = (name: string) => {
    const colors = [
      'from-blue-500 to-blue-600',
      'from-green-500 to-green-600',
      'from-purple-500 to-purple-600',
      'from-red-500 to-red-600',
      'from-indigo-500 to-indigo-600',
      'from-pink-500 to-pink-600',
      'from-teal-500 to-teal-600',
      'from-orange-500 to-orange-600',
    ];
    const index = name.charCodeAt(0) % colors.length;
    return colors[index];
  };

  return (
    <section className="py-16 bg-gradient-to-br from-gray-50 via-white to-gray-50 overflow-hidden">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 mb-12">
        <div className="text-center">
          <div className="inline-flex items-center justify-center px-4 py-2 bg-primary-50 rounded-full mb-4">
            <CheckBadgeIcon className="h-5 w-5 text-primary-600 mr-2" />
            <span className="text-sm font-semibold text-primary-600 uppercase tracking-wide">
              Trusted Partners
            </span>
          </div>
          <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
            Leading Universities Choose PractiCheck
          </h2>
          <p className="mt-4 text-lg text-gray-600 max-w-2xl mx-auto">
            Join {universities.length}+ prestigious institutions transforming their industrial attachment programs
          </p>
        </div>
      </div>

      {/* First Row - Scrolling Right to Left */}
      <div className="relative mb-6">
        <div className="absolute left-0 top-0 bottom-0 w-32 bg-gradient-to-r from-gray-50 to-transparent z-10 pointer-events-none" />
        <div className="absolute right-0 top-0 bottom-0 w-32 bg-gradient-to-l from-gray-50 to-transparent z-10 pointer-events-none" />

        <div className="flex animate-scroll-rtl hover:pause-animation">
          {duplicatedFirstRow.map((university, index) => (
            <div
              key={`row1-${university.id}-${index}`}
              className="flex-shrink-0 w-72 mx-3"
            >
              <div className="bg-white rounded-xl shadow-soft hover:shadow-medium transition-all duration-300 p-5 border border-gray-100 hover:border-primary-200 group h-full">
                <div className="flex items-start space-x-4">
                  {/* Logo */}
                  <div className={`flex-shrink-0 w-14 h-14 rounded-lg bg-gradient-to-br ${getUniversityColor(university.name)} flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-md`}>
                    <span className="text-white font-bold text-sm">
                      {university.shortName}
                    </span>
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-semibold text-gray-900 mb-1 truncate group-hover:text-primary-600 transition-colors">
                      {university.name}
                    </h3>
                    <div className="flex items-center text-xs text-gray-500 mb-1">
                      <MapPinIcon className="h-3 w-3 mr-1" />
                      {university.location}
                    </div>
                    <div className="flex items-center text-xs text-gray-500">
                      <UsersIcon className="h-3 w-3 mr-1" />
                      {university.students.toLocaleString()} students
                    </div>
                  </div>
                </div>

                {/* Badge */}
                <div className="mt-3 pt-3 border-t border-gray-100">
                  <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-green-50 text-green-700">
                    ✓ Active Partner
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Second Row - Scrolling Left to Right */}
      <div className="relative">
        <div className="absolute left-0 top-0 bottom-0 w-32 bg-gradient-to-r from-gray-50 to-transparent z-10 pointer-events-none" />
        <div className="absolute right-0 top-0 bottom-0 w-32 bg-gradient-to-l from-gray-50 to-transparent z-10 pointer-events-none" />

        <div className="flex animate-scroll-ltr hover:pause-animation">
          {duplicatedSecondRow.map((university, index) => (
            <div
              key={`row2-${university.id}-${index}`}
              className="flex-shrink-0 w-72 mx-3"
            >
              <div className="bg-white rounded-xl shadow-soft hover:shadow-medium transition-all duration-300 p-5 border border-gray-100 hover:border-primary-200 group h-full">
                <div className="flex items-start space-x-4">
                  {/* Logo */}
                  <div className={`flex-shrink-0 w-14 h-14 rounded-lg bg-gradient-to-br ${getUniversityColor(university.name)} flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-md`}>
                    <span className="text-white font-bold text-sm">
                      {university.shortName}
                    </span>
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-semibold text-gray-900 mb-1 truncate group-hover:text-primary-600 transition-colors">
                      {university.name}
                    </h3>
                    <div className="flex items-center text-xs text-gray-500 mb-1">
                      <MapPinIcon className="h-3 w-3 mr-1" />
                      {university.location}
                    </div>
                    <div className="flex items-center text-xs text-gray-500">
                      <UsersIcon className="h-3 w-3 mr-1" />
                      {university.students.toLocaleString()} students
                    </div>
                  </div>
                </div>

                {/* Badge */}
                <div className="mt-3 pt-3 border-t border-gray-100">
                  <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-green-50 text-green-700">
                    ✓ Active Partner
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Stats Section */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 mt-12">
        <div className="bg-gradient-to-r from-primary-600 to-primary-700 rounded-2xl shadow-xl p-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            <div>
              <div className="text-3xl font-bold text-white">{universities.length}+</div>
              <div className="text-sm text-primary-100 mt-1">Partner Universities</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-white">
                {universities.reduce((sum, uni) => sum + uni.students, 0).toLocaleString()}+
              </div>
              <div className="text-sm text-primary-100 mt-1">Active Students</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-white">500+</div>
              <div className="text-sm text-primary-100 mt-1">Industry Partners</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-white">99.9%</div>
              <div className="text-sm text-primary-100 mt-1">Platform Uptime</div>
            </div>
          </div>
        </div>
      </div>

      {/* CSS for Animation */}
      <style jsx>{`
        @keyframes scroll-rtl {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(-33.333%);
          }
        }

        @keyframes scroll-ltr {
          0% {
            transform: translateX(-33.333%);
          }
          100% {
            transform: translateX(0);
          }
        }

        .animate-scroll-rtl {
          animation: scroll-rtl 60s linear infinite;
        }

        .animate-scroll-ltr {
          animation: scroll-ltr 60s linear infinite;
        }

        .pause-animation:hover {
          animation-play-state: paused;
        }

        @media (prefers-reduced-motion: reduce) {
          .animate-scroll-rtl,
          .animate-scroll-ltr {
            animation: none;
          }
        }
      `}</style>
    </section>
  );
}