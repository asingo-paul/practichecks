'use client';

import React, { useState } from 'react';
import { 
  MagnifyingGlassIcon,
  MapPinIcon,
  BriefcaseIcon,
  ClockIcon,
  CurrencyDollarIcon,
  BuildingOffice2Icon,
  AdjustmentsHorizontalIcon,
  BookmarkIcon,
  XMarkIcon,
  ChevronDownIcon,
  CheckIcon
} from '@heroicons/react/24/outline';
import { BookmarkIcon as BookmarkSolidIcon } from '@heroicons/react/24/solid';
import { Logo } from '../../components/Logo';
import Link from 'next/link';

interface Internship {
  id: string;
  title: string;
  company: string;
  location: string;
  type: 'Remote' | 'On-site' | 'Hybrid';
  duration: string;
  salary: string;
  postedDate: string;
  description: string;
  requirements: string[];
  tags: string[];
  logo?: string;
}

export default function InternshipsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [locationQuery, setLocationQuery] = useState('');
  const [selectedType, setSelectedType] = useState<string[]>([]);
  const [selectedRegion, setSelectedRegion] = useState<string[]>([]);
  const [selectedDuration, setSelectedDuration] = useState<string[]>([]);
  const [showFilters, setShowFilters] = useState(false);
  const [savedJobs, setSavedJobs] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Mock internship data
  const internships: Internship[] = [
    {
      id: '1',
      title: 'Software Engineering Intern',
      company: 'Safaricom PLC',
      location: 'Nairobi, Kenya',
      type: 'Hybrid',
      duration: '3-6 months',
      salary: 'KES 40,000 - 60,000/month',
      postedDate: '2 days ago',
      description: 'Join our engineering team to work on cutting-edge mobile and web applications. You will collaborate with experienced developers and contribute to real-world projects.',
      requirements: ['Computer Science or related field', 'Knowledge of Java/Python', 'Problem-solving skills', 'Team player'],
      tags: ['Software', 'Engineering', 'Mobile', 'Web Development']
    },
    {
      id: '2',
      title: 'Data Science Intern',
      company: 'Equity Bank',
      location: 'Nairobi, Kenya',
      type: 'On-site',
      duration: '6 months',
      salary: 'KES 50,000 - 70,000/month',
      postedDate: '1 week ago',
      description: 'Work with our data analytics team to analyze customer data, build predictive models, and generate insights for business decisions.',
      requirements: ['Statistics or Data Science background', 'Python, R, SQL', 'Machine Learning basics', 'Analytical mindset'],
      tags: ['Data Science', 'Analytics', 'Machine Learning', 'Banking']
    },
    {
      id: '3',
      title: 'Marketing Intern',
      company: 'Jumia Kenya',
      location: 'Remote',
      type: 'Remote',
      duration: '3 months',
      salary: 'KES 30,000 - 45,000/month',
      postedDate: '3 days ago',
      description: 'Support our marketing campaigns, social media management, and content creation. Learn digital marketing strategies in e-commerce.',
      requirements: ['Marketing or Communications student', 'Social media savvy', 'Creative writing', 'Basic design skills'],
      tags: ['Marketing', 'Digital Marketing', 'E-commerce', 'Social Media']
    },
    {
      id: '4',
      title: 'Mechanical Engineering Intern',
      company: 'Kenya Airways',
      location: 'Nairobi, Kenya',
      type: 'On-site',
      duration: '6 months',
      salary: 'KES 45,000 - 65,000/month',
      postedDate: '5 days ago',
      description: 'Gain hands-on experience in aircraft maintenance, engineering operations, and quality assurance processes.',
      requirements: ['Mechanical Engineering student', 'Technical drawing skills', 'Safety conscious', 'Attention to detail'],
      tags: ['Mechanical', 'Engineering', 'Aviation', 'Maintenance']
    },
    {
      id: '5',
      title: 'UI/UX Design Intern',
      company: 'Andela',
      location: 'Remote',
      type: 'Remote',
      duration: '4 months',
      salary: 'KES 35,000 - 55,000/month',
      postedDate: '1 day ago',
      description: 'Design user interfaces and experiences for web and mobile applications. Work with product teams to create intuitive designs.',
      requirements: ['Design portfolio', 'Figma/Adobe XD', 'User research skills', 'Creative problem solver'],
      tags: ['Design', 'UI/UX', 'Product Design', 'Tech']
    },
    {
      id: '6',
      title: 'Finance Intern',
      company: 'KPMG Kenya',
      location: 'Nairobi, Kenya',
      type: 'On-site',
      duration: '6 months',
      salary: 'KES 40,000 - 60,000/month',
      postedDate: '1 week ago',
      description: 'Support financial analysis, auditing, and consulting projects. Learn from experienced professionals in a Big 4 firm.',
      requirements: ['Finance or Accounting student', 'Excel proficiency', 'Analytical skills', 'Professional attitude'],
      tags: ['Finance', 'Accounting', 'Consulting', 'Audit']
    },
    {
      id: '7',
      title: 'Network Engineering Intern',
      company: 'Liquid Intelligent Technologies',
      location: 'Mombasa, Kenya',
      type: 'On-site',
      duration: '5 months',
      salary: 'KES 38,000 - 52,000/month',
      postedDate: '4 days ago',
      description: 'Learn network infrastructure management, troubleshooting, and support. Work with enterprise-level networking equipment.',
      requirements: ['IT or Computer Networks student', 'CCNA knowledge', 'Problem-solving', 'Quick learner'],
      tags: ['Networking', 'IT', 'Infrastructure', 'Telecommunications']
    },
    {
      id: '8',
      title: 'Content Writing Intern',
      company: 'Nation Media Group',
      location: 'Nairobi, Kenya',
      type: 'Hybrid',
      duration: '3 months',
      salary: 'KES 25,000 - 40,000/month',
      postedDate: '2 days ago',
      description: 'Write articles, blog posts, and digital content for various platforms. Learn journalism and content creation.',
      requirements: ['Journalism or Communications student', 'Excellent writing', 'Research skills', 'Deadline-oriented'],
      tags: ['Writing', 'Journalism', 'Content', 'Media']
    },
    {
      id: '9',
      title: 'Mobile App Developer Intern',
      company: 'M-PESA Africa',
      location: 'Nairobi, Kenya',
      type: 'Hybrid',
      duration: '6 months',
      salary: 'KES 45,000 - 65,000/month',
      postedDate: '3 days ago',
      description: 'Develop and maintain mobile applications for Android and iOS platforms. Work on fintech solutions used by millions.',
      requirements: ['Computer Science student', 'Flutter/React Native', 'Mobile development experience', 'API integration'],
      tags: ['Mobile Development', 'Flutter', 'Fintech', 'Android', 'iOS']
    },
    {
      id: '10',
      title: 'Human Resources Intern',
      company: 'Unilever Kenya',
      location: 'Nairobi, Kenya',
      type: 'On-site',
      duration: '4 months',
      salary: 'KES 35,000 - 50,000/month',
      postedDate: '1 week ago',
      description: 'Support recruitment, employee engagement, and HR operations. Learn HR best practices in a multinational company.',
      requirements: ['HR or Business student', 'Communication skills', 'Organizational skills', 'Confidentiality'],
      tags: ['Human Resources', 'Recruitment', 'FMCG', 'Operations']
    },
    {
      id: '11',
      title: 'Cybersecurity Intern',
      company: 'Serianu Limited',
      location: 'Nairobi, Kenya',
      type: 'On-site',
      duration: '6 months',
      salary: 'KES 40,000 - 60,000/month',
      postedDate: '5 days ago',
      description: 'Learn about security assessments, penetration testing, and security operations. Work with cybersecurity experts.',
      requirements: ['IT Security student', 'Networking basics', 'Ethical hacking interest', 'Security certifications (plus)'],
      tags: ['Cybersecurity', 'Penetration Testing', 'Security', 'IT']
    },
    {
      id: '12',
      title: 'Business Analyst Intern',
      company: 'Deloitte Kenya',
      location: 'Nairobi, Kenya',
      type: 'Hybrid',
      duration: '5 months',
      salary: 'KES 42,000 - 58,000/month',
      postedDate: '6 days ago',
      description: 'Analyze business processes, gather requirements, and support consulting projects. Learn business analysis methodologies.',
      requirements: ['Business or IT student', 'Analytical thinking', 'Excel & PowerPoint', 'Communication skills'],
      tags: ['Business Analysis', 'Consulting', 'Strategy', 'Process Improvement']
    },
    {
      id: '13',
      title: 'Graphic Design Intern',
      company: 'Scanad Kenya',
      location: 'Nairobi, Kenya',
      type: 'On-site',
      duration: '3 months',
      salary: 'KES 28,000 - 42,000/month',
      postedDate: '2 days ago',
      description: 'Create visual designs for advertising campaigns, branding projects, and digital media. Work with creative teams.',
      requirements: ['Graphic Design student', 'Adobe Creative Suite', 'Portfolio required', 'Creative mindset'],
      tags: ['Graphic Design', 'Advertising', 'Branding', 'Creative']
    },
    {
      id: '14',
      title: 'Supply Chain Intern',
      company: 'DHL Kenya',
      location: 'Mombasa, Kenya',
      type: 'On-site',
      duration: '6 months',
      salary: 'KES 38,000 - 52,000/month',
      postedDate: '1 week ago',
      description: 'Support logistics operations, inventory management, and supply chain optimization. Learn global logistics practices.',
      requirements: ['Supply Chain or Logistics student', 'Organizational skills', 'Excel proficiency', 'Problem-solving'],
      tags: ['Supply Chain', 'Logistics', 'Operations', 'Inventory']
    },
    {
      id: '15',
      title: 'Environmental Science Intern',
      company: 'Kenya Wildlife Service',
      location: 'Nairobi, Kenya',
      type: 'On-site',
      duration: '4 months',
      salary: 'KES 30,000 - 45,000/month',
      postedDate: '4 days ago',
      description: 'Support conservation projects, environmental research, and wildlife management initiatives. Field work included.',
      requirements: ['Environmental Science student', 'Research skills', 'Passion for conservation', 'Physical fitness'],
      tags: ['Environmental Science', 'Conservation', 'Wildlife', 'Research']
    },
    {
      id: '16',
      title: 'DevOps Engineer Intern',
      company: 'Twiga Foods',
      location: 'Remote',
      type: 'Remote',
      duration: '5 months',
      salary: 'KES 40,000 - 58,000/month',
      postedDate: '1 day ago',
      description: 'Learn CI/CD pipelines, cloud infrastructure, and automation. Work with AWS, Docker, and Kubernetes.',
      requirements: ['Computer Science student', 'Linux basics', 'Scripting (Python/Bash)', 'Cloud interest'],
      tags: ['DevOps', 'Cloud', 'AWS', 'Docker', 'Automation']
    },
  ];

  const toggleSaveJob = (jobId: string) => {
    setSavedJobs(prev => 
      prev.includes(jobId) 
        ? prev.filter(id => id !== jobId)
        : [...prev, jobId]
    );
  };

  const filteredInternships = internships.filter(internship => {
    const matchesSearch = internship.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         internship.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         internship.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesLocation = !locationQuery || 
                           internship.location.toLowerCase().includes(locationQuery.toLowerCase());
    
    const matchesType = selectedType.length === 0 || selectedType.includes(internship.type);
    
    const matchesRegion = selectedRegion.length === 0 || 
                         selectedRegion.some(region => internship.location.includes(region));
    
    const matchesDuration = selectedDuration.length === 0 || 
                           selectedDuration.some(duration => internship.duration.includes(duration));
    
    return matchesSearch && matchesLocation && matchesType && matchesRegion && matchesDuration;
  });

  // Pagination calculations
  const totalPages = Math.ceil(filteredInternships.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentInternships = filteredInternships.slice(startIndex, endIndex);

  // Reset to page 1 when filters change
  React.useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, locationQuery, selectedType, selectedRegion, selectedDuration]);

  const toggleFilter = (filterArray: string[], setFilter: React.Dispatch<React.SetStateAction<string[]>>, value: string) => {
    setFilter(prev => 
      prev.includes(value) 
        ? prev.filter(item => item !== value)
        : [...prev, value]
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-50">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <Link href="/">
              <Logo size="md" />
            </Link>
            <div className="flex items-center space-x-4">
              <Link 
                href="/auth/hirer/login" 
                className="text-gray-600 hover:text-primary-600 transition-colors"
              >
                Sign In
              </Link>
              <Link 
                href="/auth/hirer/register" 
                className="text-gray-600 hover:text-primary-600 transition-colors"
              >
                Register as Hirer
              </Link>
              <Link
                href="/auth/hirer/login"
                className="btn-primary"
              >
                Post Internship
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Search Section */}
      <div className="bg-white border-b border-gray-200">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">
            Find Your Perfect Internship
          </h1>
          
          {/* Search Bar */}
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <MagnifyingGlassIcon className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Job title, keywords, or company"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>
            
            <div className="flex-1 relative">
              <MapPinIcon className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="City or region"
                value={locationQuery}
                onChange={(e) => setLocationQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>
            
            <button className="btn-primary px-8 py-3 whitespace-nowrap">
              Find Internships
            </button>
          </div>

          {/* Filter Toggle Button (Mobile) */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="mt-4 md:hidden flex items-center gap-2 text-primary-600 font-medium"
          >
            <AdjustmentsHorizontalIcon className="h-5 w-5" />
            {showFilters ? 'Hide Filters' : 'Show Filters'}
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col md:flex-row gap-8">
          {/* Filters Sidebar */}
          <aside className={`md:w-64 flex-shrink-0 ${showFilters ? 'block' : 'hidden md:block'}`}>
            <div className="bg-white rounded-lg shadow-soft p-6 sticky top-24">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900">Filters</h2>
                {(selectedType.length > 0 || selectedRegion.length > 0 || selectedDuration.length > 0) && (
                  <button
                    onClick={() => {
                      setSelectedType([]);
                      setSelectedRegion([]);
                      setSelectedDuration([]);
                    }}
                    className="text-sm text-primary-600 hover:text-primary-700"
                  >
                    Clear all
                  </button>
                )}
              </div>

              {/* Work Type Filter */}
              <div className="mb-6">
                <h3 className="text-sm font-medium text-gray-900 mb-3">Work Type</h3>
                <div className="space-y-2">
                  {['Remote', 'On-site', 'Hybrid'].map((type) => (
                    <label key={type} className="flex items-center cursor-pointer group">
                      <input
                        type="checkbox"
                        checked={selectedType.includes(type)}
                        onChange={() => toggleFilter(selectedType, setSelectedType, type)}
                        className="h-4 w-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                      />
                      <span className="ml-3 text-sm text-gray-700 group-hover:text-gray-900">
                        {type}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Region Filter */}
              <div className="mb-6">
                <h3 className="text-sm font-medium text-gray-900 mb-3">Region</h3>
                <div className="space-y-2">
                  {['Nairobi', 'Mombasa', 'Kisumu', 'Nakuru', 'Eldoret'].map((region) => (
                    <label key={region} className="flex items-center cursor-pointer group">
                      <input
                        type="checkbox"
                        checked={selectedRegion.includes(region)}
                        onChange={() => toggleFilter(selectedRegion, setSelectedRegion, region)}
                        className="h-4 w-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                      />
                      <span className="ml-3 text-sm text-gray-700 group-hover:text-gray-900">
                        {region}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Duration Filter */}
              <div className="mb-6">
                <h3 className="text-sm font-medium text-gray-900 mb-3">Duration</h3>
                <div className="space-y-2">
                  {['3 months', '4 months', '5 months', '6 months'].map((duration) => (
                    <label key={duration} className="flex items-center cursor-pointer group">
                      <input
                        type="checkbox"
                        checked={selectedDuration.includes(duration)}
                        onChange={() => toggleFilter(selectedDuration, setSelectedDuration, duration)}
                        className="h-4 w-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                      />
                      <span className="ml-3 text-sm text-gray-700 group-hover:text-gray-900">
                        {duration}
                      </span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </aside>

          {/* Job Listings */}
          <main className="flex-1">
            <div className="mb-4 flex items-center justify-between">
              <p className="text-sm text-gray-600">
                {filteredInternships.length} internship{filteredInternships.length !== 1 ? 's' : ''} found
              </p>
              <select className="text-sm border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-transparent">
                <option>Most Recent</option>
                <option>Salary: High to Low</option>
                <option>Salary: Low to High</option>
                <option>Company A-Z</option>
              </select>
            </div>

            <div className="space-y-4">
              {currentInternships.map((internship) => (
                <div
                  key={internship.id}
                  className="bg-white rounded-lg shadow-soft hover:shadow-medium transition-shadow duration-200 p-6 cursor-pointer"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-start gap-4">
                        {/* Company Logo Placeholder */}
                        <div className="w-12 h-12 bg-gradient-to-br from-primary-500 to-primary-600 rounded-lg flex items-center justify-center flex-shrink-0">
                          <BuildingOffice2Icon className="h-6 w-6 text-white" />
                        </div>

                        <div className="flex-1">
                          <h3 className="text-lg font-semibold text-gray-900 hover:text-primary-600 transition-colors">
                            {internship.title}
                          </h3>
                          <p className="text-gray-600 font-medium mt-1">{internship.company}</p>
                          
                          <div className="flex flex-wrap items-center gap-4 mt-3 text-sm text-gray-600">
                            <div className="flex items-center gap-1">
                              <MapPinIcon className="h-4 w-4" />
                              {internship.location}
                            </div>
                            <div className="flex items-center gap-1">
                              <BriefcaseIcon className="h-4 w-4" />
                              {internship.type}
                            </div>
                            <div className="flex items-center gap-1">
                              <ClockIcon className="h-4 w-4" />
                              {internship.duration}
                            </div>
                            <div className="flex items-center gap-1">
                              <CurrencyDollarIcon className="h-4 w-4" />
                              {internship.salary}
                            </div>
                          </div>

                          <p className="mt-3 text-gray-700 line-clamp-2">
                            {internship.description}
                          </p>

                          <div className="flex flex-wrap gap-2 mt-3">
                            {internship.tags.map((tag) => (
                              <span
                                key={tag}
                                className="px-3 py-1 bg-gray-100 text-gray-700 text-xs font-medium rounded-full"
                              >
                                {tag}
                              </span>
                            ))}
                          </div>

                          <p className="text-xs text-gray-500 mt-3">
                            Posted {internship.postedDate}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Save Button */}
                    <button
                      onClick={() => toggleSaveJob(internship.id)}
                      className="ml-4 p-2 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                      {savedJobs.includes(internship.id) ? (
                        <BookmarkSolidIcon className="h-6 w-6 text-primary-600" />
                      ) : (
                        <BookmarkIcon className="h-6 w-6 text-gray-400" />
                      )}
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {filteredInternships.length === 0 && (
              <div className="text-center py-12">
                <BriefcaseIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No internships found</h3>
                <p className="text-gray-600">Try adjusting your search or filters</p>
              </div>
            )}

            {/* Pagination */}
            {filteredInternships.length > 0 && totalPages > 1 && (
              <div className="mt-8 flex items-center justify-center gap-2">
                {/* Previous Button */}
                <button
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                  className={`px-3 py-2 rounded-lg border ${
                    currentPage === 1
                      ? 'border-gray-200 text-gray-400 cursor-not-allowed'
                      : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <ChevronDownIcon className="h-5 w-5 rotate-90" />
                </button>

                {/* Page Numbers */}
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => {
                  // Show first page, last page, current page, and pages around current
                  const showPage = 
                    page === 1 || 
                    page === totalPages || 
                    (page >= currentPage - 1 && page <= currentPage + 1);
                  
                  // Show ellipsis
                  const showEllipsisBefore = page === currentPage - 2 && currentPage > 3;
                  const showEllipsisAfter = page === currentPage + 2 && currentPage < totalPages - 2;

                  if (showEllipsisBefore || showEllipsisAfter) {
                    return (
                      <span key={page} className="px-3 py-2 text-gray-400">
                        ...
                      </span>
                    );
                  }

                  if (!showPage) return null;

                  return (
                    <button
                      key={page}
                      onClick={() => setCurrentPage(page)}
                      className={`px-4 py-2 rounded-lg border font-medium transition-colors ${
                        currentPage === page
                          ? 'bg-primary-600 text-white border-primary-600'
                          : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      {page}
                    </button>
                  );
                })}

                {/* Next Button */}
                <button
                  onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                  disabled={currentPage === totalPages}
                  className={`px-3 py-2 rounded-lg border ${
                    currentPage === totalPages
                      ? 'border-gray-200 text-gray-400 cursor-not-allowed'
                      : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <ChevronDownIcon className="h-5 w-5 -rotate-90" />
                </button>
              </div>
            )}

            {/* Results Info */}
            {filteredInternships.length > 0 && (
              <p className="text-center text-sm text-gray-600 mt-4">
                Showing {startIndex + 1}-{Math.min(endIndex, filteredInternships.length)} of {filteredInternships.length} internships
              </p>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}