'use client';

import React, { useEffect, useState } from 'react';
import { AcademicCapIcon, MapPinIcon, UsersIcon } from '@heroicons/react/24/outline';

interface University {
  id: string;
  name: string;
  location: string;
  students: number;
  logo?: string;
  established?: string;
}

export default function PartnersCarousel() {
  const [universities, setUniversities] = useState<University[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchUniversities = async () => {
      try {
        const response = await fetch('http://localhost:8001/universities/public');
        if (response.ok) {
          const data = await response.json();
          setUniversities(data);
        } else {
          // Fallback to mock data with Kenyan universities
          setUniversities(getMockUniversities());
        }
      } catch (error) {
        console.error('Error fetching universities:', error);
        setUniversities(getMockUniversities());
      } finally {
        setIsLoading(false);
      }
    };

    fetchUniversities();
  }, []);

  const getMockUniversities = (): University[] => [
    { 
      id: '1', 
      name: 'University of Nairobi', 
      location: 'Nairobi, Kenya', 
      students: 2450,
      established: '1956'
    },
    { 
      id: '2', 
      name: 'Kenyatta University', 
      location: 'Nairobi, Kenya', 
      students: 1890,
      established: '1985'
    },
    { 
      id: '3', 
      name: 'Moi University', 
      location: 'Eldoret, Kenya', 
      students: 1560,
      established: '1984'
    },
    { 
      id: '4', 
      name: 'Jomo Kenyatta University', 
      location: 'Juja, Kenya', 
      students: 2030,
      established: '1994'
    },
    { 
      id: '5', 
      name: 'Egerton University', 
      location: 'Njoro, Kenya', 
      students: 1340,
      established: '1987'
    },
    { 
      id: '6', 
      name: 'Maseno University', 
      location: 'Maseno, Kenya', 
      students: 1120,
      established: '1991'
    },
    { 
      id: '7', 
      name: 'Technical University of Kenya', 
      location: 'Nairobi, Kenya', 
      students: 980,
      established: '2013'
    },
    { 
      id: '8', 
      name: 'Machakos University', 
      location: 'Machakos, Kenya', 
      students: 850,
      established: '2011'
    },
    { 
      id: '9', 
      name: 'Multimedia University', 
      location: 'Nairobi, Kenya', 
      students: 720,
      established: '2013'
    },
    { 
      id: '10', 
      name: 'Strathmore University', 
      location: 'Nairobi, Kenya', 
      students: 1450,
      established: '2002'
    },
    { 
      id: '11', 
      name: 'Daystar University', 
      location: 'Nairobi, Kenya', 
      students: 890,
      established: '1994'
    },
    { 
      id: '12', 
      name: 'Mount Kenya University', 
      location: 'Thika, Kenya', 
      students: 1670,
      established: '2011'
    }
  ];

  // Duplicate universities for seamless infinite scroll
  const duplicatedUniversities = [...universities, ...universities, ...universities];

  if (isLoading) {
    return (
      <div className="py-16 bg-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
              Our University Partners
            </h2>
            <p className="mt-4 text-lg text-gray-600">Loading partner universities...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <section className="py-16 bg-gradient-to-br from-gray-50 to-white overflow-hidden">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 mb-12">
        <div className="text-center">
          <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
            Our University Partners
          </h2>
          <p className="mt-4 text-lg text-gray-600">
            Trusted by leading universities across Kenya and beyond
          </p>
        </div>
      </div>

      {/* Scrolling Container */}
      <div className="relative">
        {/* Gradient Overlays */}
        <div className="absolute left-0 top-0 bottom-0 w-32 bg-gradient-to-r from-white to-transparent z-10 pointer-events-none" />
        <div className="absolute right-0 top-0 bottom-0 w-32 bg-gradient-to-l from-white to-transparent z-10 pointer-events-none" />

        {/* Scrolling Track */}
        <div className="flex animate-scroll-continuous hover:pause-animation">
          {duplicatedUniversities.map((university, index) => (
            <div
              key={`${university.id}-${index}`}
              className="flex-shrink-0 w-80 mx-4"
            >
              <div className="bg-white rounded-xl shadow-soft hover:shadow-medium transition-all duration-300 p-6 border border-gray-100 hover:border-primary-200 group">
                {/* University Icon/Logo */}
                <div className="flex items-center justify-center w-16 h-16 bg-gradient-to-br from-primary-500 to-primary-600 rounded-lg mb-4 group-hover:scale-110 transition-transform duration-300">
                  <AcademicCapIcon className="h-8 w-8 text-white" />
                </div>

                {/* University Name */}
                <h3 className="text-lg font-semibold text-gray-900 mb-2 group-hover:text-primary-600 transition-colors">
                  {university.name}
                </h3>

                {/* Location */}
                <div className="flex items-center text-gray-600 mb-2">
                  <MapPinIcon className="h-4 w-4 mr-2 text-gray-400" />
                  <span className="text-sm">{university.location}</span>
                </div>

                {/* Students Count */}
                <div className="flex items-center text-gray-600 mb-3">
                  <UsersIcon className="h-4 w-4 mr-2 text-gray-400" />
                  <span className="text-sm">{university.students.toLocaleString()} students</span>
                </div>

                {/* Established Year */}
                {university.established && (
                  <div className="pt-3 border-t border-gray-100">
                    <span className="text-xs text-gray-500">
                      Established {university.established}
                    </span>
                  </div>
                )}

                {/* Partner Badge */}
                <div className="mt-4">
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-primary-50 text-primary-700 border border-primary-200">
                    ✓ Verified Partner
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Partner Stats */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 mt-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          <div className="text-center p-6 bg-white rounded-lg shadow-soft">
            <div className="text-3xl font-bold text-primary-600">{universities.length}+</div>
            <div className="text-sm text-gray-600 mt-1">Partner Universities</div>
          </div>
          <div className="text-center p-6 bg-white rounded-lg shadow-soft">
            <div className="text-3xl font-bold text-primary-600">
              {universities.reduce((sum, uni) => sum + uni.students, 0).toLocaleString()}+
            </div>
            <div className="text-sm text-gray-600 mt-1">Active Students</div>
          </div>
          <div className="text-center p-6 bg-white rounded-lg shadow-soft">
            <div className="text-3xl font-bold text-primary-600">500+</div>
            <div className="text-sm text-gray-600 mt-1">Industry Partners</div>
          </div>
          <div className="text-center p-6 bg-white rounded-lg shadow-soft">
            <div className="text-3xl font-bold text-primary-600">99.9%</div>
            <div className="text-sm text-gray-600 mt-1">Platform Uptime</div>
          </div>
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
          animation: scroll-continuous 60s linear infinite;
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