"use client";

import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { APP_NAME, APP_DESCRIPTION } from '@/constants';
import { BookOpen, LayoutDashboard, Shield, Mail, Github, Twitter, Facebook, Linkedin, HelpCircle } from 'lucide-react';

export function Footer() {
  const { isAuthenticated, isAdmin } = useAuth();
  const currentYear = new Date().getFullYear();

  const exploreLinks = [
    { href: '/quizzes', label: 'All Quizzes', icon: BookOpen },
    { href: '/about', label: 'About Us' },
  ];

  const userLinks = isAuthenticated
    ? [
        { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
        { href: '/profile', label: 'Profile' },
      ]
    : [
        { href: '/login', label: 'Sign In' },
        { href: '/register', label: 'Get Started' },
      ];

  const adminLinks = isAdmin
    ? [
        { href: '/admin/dashboard', label: 'Admin Dashboard', icon: Shield },
        { href: '/admin/quizzes', label: 'Manage Quizzes' },
      ]
    : [];

  const supportLinks = [
    { href: '/about', label: 'About' },
    { href: '/contact', label: 'Contact' },
    { href: '/faq', label: 'FAQ', icon: HelpCircle },
  ];

  const legalLinks = [
    { href: '/privacy', label: 'Privacy Policy' },
    { href: '/terms', label: 'Terms of Service' },
  ];

  const socialLinks = [
    { href: 'https://github.com', label: 'GitHub', icon: Github, external: true },
    { href: 'https://twitter.com', label: 'Twitter', icon: Twitter, external: true },
    { href: 'https://facebook.com', label: 'Facebook', icon: Facebook, external: true },
    { href: 'https://linkedin.com', label: 'LinkedIn', icon: Linkedin, external: true },
  ];

  return (
    <footer className="border-t border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
          {/* Brand Section */}
          <div className="lg:col-span-2">
            <Link href="/" className="inline-block mb-4">
              <h3 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                {APP_NAME}
              </h3>
            </Link>
            <p className="text-gray-600 dark:text-gray-400 text-sm mb-4 max-w-md">
              {APP_DESCRIPTION}
            </p>
            {/* Social Links */}
            <div className="flex items-center space-x-4 mt-4">
              {socialLinks.map((social) => {
                const Icon = social.icon;
                return (
                  <a
                    key={social.label}
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                    aria-label={social.label}
                  >
                    <Icon className="h-5 w-5" />
                  </a>
                );
              })}
            </div>
          </div>

          {/* Explore Section */}
          <div>
            <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-4">Explore</h4>
            <ul className="space-y-2 text-sm">
              {exploreLinks.map((link) => {
                const Icon = link.icon;
                return (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                    >
                      {Icon && <Icon className="h-4 w-4" />}
                      {link.label}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>

          {/* User Section */}
          <div>
            <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-4">
              {isAuthenticated ? 'Account' : 'Get Started'}
            </h4>
            <ul className="space-y-2 text-sm">
              {userLinks.map((link) => {
                const Icon = link.icon;
                return (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                    >
                      {Icon && <Icon className="h-4 w-4" />}
                      {link.label}
                    </Link>
                  </li>
                );
              })}
              {adminLinks.map((link) => {
                const Icon = link.icon;
                return (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                    >
                      {Icon && <Icon className="h-4 w-4" />}
                      {link.label}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>

          {/* Support & Legal Section */}
          <div>
            <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-4">Support</h4>
            <ul className="space-y-2 text-sm mb-6">
              {supportLinks.map((link) => {
                const Icon = link.icon;
                return (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                    >
                      {Icon && <Icon className="h-4 w-4" />}
                      {link.label}
                    </Link>
                  </li>
                );
              })}
            </ul>
            <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-4">Legal</h4>
            <ul className="space-y-2 text-sm">
              {legalLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="mt-8 pt-8 border-t border-gray-200 dark:border-gray-800">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-sm text-gray-600 dark:text-gray-400 text-center md:text-left">
              &copy; {currentYear} {APP_NAME}. All rights reserved.
            </p>
            <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
              <Mail className="h-4 w-4" />
              <a
                href="mailto:support@quizpoint.com"
                className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
              >
                support@quizpoint.com
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
