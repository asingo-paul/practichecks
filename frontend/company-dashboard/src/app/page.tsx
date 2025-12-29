'use client';

import React, { useState } from 'react';
import { 
  ChartBarIcon, 
  BuildingOfficeIcon, 
  UsersIcon, 
  ServerIcon,
  CheckCircleIcon,
  ArrowRightIcon,
  AcademicCapIcon,
  BriefcaseIcon,
  ShieldCheckIcon,
  CloudIcon,
  GlobeAltIcon,
  CogIcon
} from '@heroicons/react/24/outline';
import { LoadingButton } from '../components/LoadingSpinner';
import { Logo } from '../components/Logo';

const features = [
  {
    name: 'Multi-Tenant Architecture',
    description: 'Complete isolation between universities with dedicated resources and data separation.',
    icon: ServerIcon,
  },
  {
    name: 'Role-Based Dashboards',
    description: 'Specialized interfaces for students, lecturers, supervisors, and administrators.',
    icon: UsersIcon,
  },
  {
    name: 'Industrial Partnerships',
    description: 'Seamless connection between universities and industry partners for attachments.',
    icon: BriefcaseIcon,
  },
  {
    name: 'Real-Time Monitoring',
    description: 'Live tracking of student progress, assessments, and system health.',
    icon: ChartBarIcon,
  },
  {
    name: 'Secure & Compliant',
    description: 'Enterprise-grade security with complete audit trails and data protection.',
    icon: ShieldCheckIcon,
  },
  {
    name: 'Cloud-Native',
    description: 'Scalable Kubernetes deployment with automatic scaling and fault tolerance.',
    icon: CloudIcon,
  },
];

const stats = [
  { name: 'Universities Served', value: '50+' },
  { name: 'Active Students', value: '25,000+' },
  { name: 'Industry Partners', value: '500+' },
  { name: 'Uptime', value: '99.9%' },
];

const testimonials = [
  {
    content: "PractiCheck has revolutionized how we manage industrial attachments. The platform's multi-tenant architecture ensures our data is completely secure while providing excellent performance.",
    author: "Dr. Sarah Johnson",
    role: "Director of Industrial Relations",
    organization: "University of Technology"
  },
  {
    content: "The role-based dashboards make it incredibly easy for our students, lecturers, and industry supervisors to collaborate effectively throughout the attachment process.",
    author: "Prof. Michael Chen",
    role: "Faculty Administrator",
    organization: "State Engineering College"
  },
  {
    content: "As an industry supervisor, I love how easy it is to track student progress and provide feedback. The platform has streamlined our entire internship program.",
    author: "Jennifer Williams",
    role: "HR Director",
    organization: "TechCorp Industries"
  }
];

export default function LandingPage() {
  const [isLoading, setIsLoading] = useState(false);

  const handleGetStarted = () => {
    setIsLoading(true);
    // Redirect to login page
    setTimeout(() => {
      window.location.href = '/auth/login';
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="relative bg-white shadow-sm">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <Logo size="md" />
            <nav className="hidden md:flex space-x-8">
              <a href="#features" className="text-gray-600 hover:text-primary-600 transition-colors">Features</a>
              <a href="#about" className="text-gray-600 hover:text-primary-600 transition-colors">About</a>
              <a href="#testimonials" className="text-gray-600 hover:text-primary-600 transition-colors">Testimonials</a>
              <a href="#contact" className="text-gray-600 hover:text-primary-600 transition-colors">Contact</a>
            </nav>
            <div className="flex items-center space-x-4">
              <button className="text-gray-600 hover:text-primary-600 transition-colors">
                Sign In
              </button>
              <LoadingButton
                onClick={handleGetStarted}
                isLoading={isLoading}
                loadingText="Loading..."
                variant="primary"
              >
                Get Started
              </LoadingButton>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-primary-50 to-white py-20 sm:py-32">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-6xl">
              Revolutionize University
              <span className="text-primary-600"> Industrial Attachments</span>
            </h1>
            <p className="mt-6 text-lg leading-8 text-gray-600 max-w-3xl mx-auto">
              PractiCheck is a comprehensive multi-tenant SaaS platform that streamlines industrial attachment 
              programs for universities, connecting students with industry partners through secure, scalable technology.
            </p>
            <div className="mt-10 flex items-center justify-center gap-x-6">
              <LoadingButton
                onClick={handleGetStarted}
                isLoading={isLoading}
                loadingText="Loading Dashboard..."
                variant="primary"
                size="lg"
                className="px-8 py-4"
              >
                Start Free Trial
                <ArrowRightIcon className="ml-2 h-5 w-5" />
              </LoadingButton>
              <button className="text-sm font-semibold leading-6 text-gray-900 hover:text-primary-600 transition-colors">
                Watch Demo <span aria-hidden="true">→</span>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="bg-primary-600 py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
            {stats.map((stat) => (
              <div key={stat.name} className="text-center">
                <div className="text-3xl font-bold text-white">{stat.value}</div>
                <div className="text-primary-100">{stat.name}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-gray-50">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
              Everything you need for industrial attachments
            </h2>
            <p className="mt-4 text-lg text-gray-600">
              Comprehensive platform designed for universities, students, and industry partners
            </p>
          </div>
          <div className="mt-16 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((feature) => (
              <div key={feature.name} className="card hover:shadow-medium transition-shadow duration-200">
                <div className="flex items-center">
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary-600">
                    <feature.icon className="h-6 w-6 text-white" />
                  </div>
                  <div className="ml-4">
                    <h3 className="text-lg font-medium text-gray-900">{feature.name}</h3>
                  </div>
                </div>
                <p className="mt-4 text-gray-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="py-20 bg-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
                Built for the modern university
              </h2>
              <p className="mt-6 text-lg text-gray-600">
                PractiCheck addresses the complex challenges of managing industrial attachment programs 
                at scale. Our platform provides complete tenant isolation, ensuring each university 
                operates independently while benefiting from shared infrastructure.
              </p>
              <div className="mt-8 space-y-4">
                <div className="flex items-center">
                  <CheckCircleIcon className="h-6 w-6 text-green-500 mr-3" />
                  <span className="text-gray-700">Complete data isolation between universities</span>
                </div>
                <div className="flex items-center">
                  <CheckCircleIcon className="h-6 w-6 text-green-500 mr-3" />
                  <span className="text-gray-700">Scalable Kubernetes deployment</span>
                </div>
                <div className="flex items-center">
                  <CheckCircleIcon className="h-6 w-6 text-green-500 mr-3" />
                  <span className="text-gray-700">Enterprise-grade security and compliance</span>
                </div>
                <div className="flex items-center">
                  <CheckCircleIcon className="h-6 w-6 text-green-500 mr-3" />
                  <span className="text-gray-700">Real-time monitoring and analytics</span>
                </div>
              </div>
            </div>
            <div className="relative">
              <div className="aspect-square rounded-2xl bg-gradient-to-br from-primary-100 to-primary-200 p-8">
                <div className="grid grid-cols-2 gap-4 h-full">
                  <div className="bg-white rounded-lg p-4 shadow-soft flex items-center justify-center">
                    <AcademicCapIcon className="h-12 w-12 text-primary-600" />
                  </div>
                  <div className="bg-white rounded-lg p-4 shadow-soft flex items-center justify-center">
                    <BriefcaseIcon className="h-12 w-12 text-primary-600" />
                  </div>
                  <div className="bg-white rounded-lg p-4 shadow-soft flex items-center justify-center">
                    <GlobeAltIcon className="h-12 w-12 text-primary-600" />
                  </div>
                  <div className="bg-white rounded-lg p-4 shadow-soft flex items-center justify-center">
                    <CogIcon className="h-12 w-12 text-primary-600" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section id="testimonials" className="py-20 bg-gray-50">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
              Trusted by leading universities
            </h2>
            <p className="mt-4 text-lg text-gray-600">
              See what our partners say about PractiCheck
            </p>
          </div>
          <div className="mt-16 grid grid-cols-1 gap-8 lg:grid-cols-3">
            {testimonials.map((testimonial, index) => (
              <div key={index} className="card">
                <blockquote className="text-gray-700">
                  "{testimonial.content}"
                </blockquote>
                <div className="mt-6">
                  <div className="font-medium text-gray-900">{testimonial.author}</div>
                  <div className="text-sm text-gray-600">{testimonial.role}</div>
                  <div className="text-sm text-primary-600">{testimonial.organization}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-primary-600 py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
            Ready to transform your industrial attachment program?
          </h2>
          <p className="mt-4 text-lg text-primary-100">
            Join leading universities already using PractiCheck to manage their industrial attachments.
          </p>
          <div className="mt-8">
            <LoadingButton
              onClick={handleGetStarted}
              isLoading={isLoading}
              loadingText="Loading Dashboard..."
              variant="secondary"
              size="lg"
              className="bg-white text-primary-600 hover:bg-gray-50 px-8 py-4"
            >
              Start Your Free Trial
              <ArrowRightIcon className="ml-2 h-5 w-5" />
            </LoadingButton>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="col-span-1 md:col-span-2">
              <Logo size="md" className="mb-4" />
              <p className="text-gray-400 max-w-md">
                PractiCheck is the leading platform for managing university industrial attachment 
                programs with enterprise-grade security and scalability.
              </p>
            </div>
            <div>
              <h3 className="text-white font-medium mb-4">Product</h3>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">Features</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Pricing</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Security</a></li>
                <li><a href="#" className="hover:text-white transition-colors">API</a></li>
              </ul>
            </div>
            <div>
              <h3 className="text-white font-medium mb-4">Company</h3>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">About</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Contact</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Support</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Privacy</a></li>
              </ul>
            </div>
          </div>
          <div className="mt-8 pt-8 border-t border-gray-800 text-center text-gray-400">
            <p>&copy; 2024 PractiCheck. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}