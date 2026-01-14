"use client"

import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { LogOut, User as UserIcon, Shield, BookOpen, LayoutDashboard, Settings, Menu, X } from 'lucide-react';
import { useState } from 'react';

export function Header() {
  const { user, isAuthenticated, isAdmin, logout, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    setMobileMenuOpen(false);
  };

  const isActive = (path: string) => {
    return pathname === path || pathname?.startsWith(path + '/');
  };

  const navLinkClass = (path: string) => {
    return `text-sm font-medium transition-colors ${
      isActive(path)
        ? 'text-blue-600 dark:text-blue-400'
        : 'text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400'
    }`;
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-gray-200 dark:border-gray-800 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <Link href="/" className="flex items-center space-x-2">
            <div className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              QuizPoint
            </div>
          </Link>
          
          {!loading && (
            <>
              {isAuthenticated ? (
                <>
                  {/* Desktop Navigation */}
                  <nav className="hidden md:flex items-center space-x-6">
                    <Link href="/quizzes" className={navLinkClass('/quizzes')}>
                      <BookOpen className="h-4 w-4 inline mr-1" />
                      Quizzes
                    </Link>
                    <Link href="/dashboard" className={navLinkClass('/dashboard')}>
                      <LayoutDashboard className="h-4 w-4 inline mr-1" />
                      Dashboard
                    </Link>
                    <Link href="/about" className={navLinkClass('/about')}>
                      About
                    </Link>
                    {isAdmin && (
                      <>
                        <Link href="/admin/dashboard" className={navLinkClass('/admin')}>
                          <Shield className="h-4 w-4 inline mr-1" />
                          Admin
                        </Link>
                        <Link href="/admin/quizzes" className={navLinkClass('/admin/quizzes')}>
                          <Settings className="h-4 w-4 inline mr-1" />
                          Manage Quizzes
                        </Link>
                      </>
                    )}
                  </nav>

                  {/* Mobile Menu Button */}
                  <div className="md:hidden">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                    >
                      {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
                    </Button>
                  </div>

                  {/* Desktop User Menu */}
                  <div className="hidden md:flex items-center space-x-4">
                    <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-sm font-bold">
                        {user?.name?.charAt(0).toUpperCase() || 'U'}
                      </div>
                      <span className="font-medium text-foreground">{user?.name}</span>
                    </div>
                    <Link href="/profile">
                      <Button variant="ghost" size="sm">
                        <UserIcon className="h-4 w-4 mr-2" />
                        Profile
                      </Button>
                    </Link>
                    <Button variant="ghost" size="sm" onClick={handleLogout}>
                      <LogOut className="h-4 w-4 mr-2" />
                      Logout
                    </Button>
                  </div>
                </>
              ) : (
                <>
                  {/* Public Navigation */}
                  <nav className="hidden md:flex items-center space-x-6">
                    <Link href="/quizzes" className={navLinkClass('/quizzes')}>
                      <BookOpen className="h-4 w-4 inline mr-1" />
                      Quizzes
                    </Link>
                    <Link href="/about" className={navLinkClass('/about')}>
                      About
                    </Link>
                  </nav>

                  {/* Mobile Menu Button */}
                  <div className="md:hidden">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                    >
                      {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
                    </Button>
                  </div>

                  {/* Desktop Auth Buttons */}
                  <div className="hidden md:flex items-center space-x-4">
                    <Link href="/login">
                      <Button variant="ghost" size="sm">
                        Sign In
                      </Button>
                    </Link>
                    <Link href="/register">
                      <Button variant="default" size="sm" className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
                        Get Started
                      </Button>
                    </Link>
                  </div>
                </>
              )}
            </>
          )}
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && !loading && (
          <div className="md:hidden border-t border-gray-200 dark:border-gray-800 py-4">
            {isAuthenticated ? (
              <div className="space-y-4">
                <div className="flex items-center space-x-3 px-2 pb-4 border-b border-gray-200 dark:border-gray-800">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-sm font-bold">
                    {user?.name?.charAt(0).toUpperCase() || 'U'}
                  </div>
                  <div>
                    <p className="font-medium text-foreground">{user?.name}</p>
                    <p className="text-xs text-muted-foreground">{user?.email || user?.mobile}</p>
                  </div>
                </div>
                
                <nav className="space-y-2">
                  <Link
                    href="/quizzes"
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex items-center space-x-2 px-2 py-2 rounded-md ${isActive('/quizzes') ? 'bg-blue-50 dark:bg-blue-900/20' : ''}`}
                  >
                    <BookOpen className="h-4 w-4" />
                    <span className={navLinkClass('/quizzes')}>Quizzes</span>
                  </Link>
                  <Link
                    href="/dashboard"
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex items-center space-x-2 px-2 py-2 rounded-md ${isActive('/dashboard') ? 'bg-blue-50 dark:bg-blue-900/20' : ''}`}
                  >
                    <LayoutDashboard className="h-4 w-4" />
                    <span className={navLinkClass('/dashboard')}>Dashboard</span>
                  </Link>
                  <Link
                    href="/about"
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex items-center space-x-2 px-2 py-2 rounded-md ${isActive('/about') ? 'bg-blue-50 dark:bg-blue-900/20' : ''}`}
                  >
                    <span className={navLinkClass('/about')}>About</span>
                  </Link>
                  {isAdmin && (
                    <>
                      <Link
                        href="/admin/dashboard"
                        onClick={() => setMobileMenuOpen(false)}
                        className={`flex items-center space-x-2 px-2 py-2 rounded-md ${isActive('/admin') ? 'bg-blue-50 dark:bg-blue-900/20' : ''}`}
                      >
                        <Shield className="h-4 w-4" />
                        <span className={navLinkClass('/admin')}>Admin Dashboard</span>
                      </Link>
                      <Link
                        href="/admin/quizzes"
                        onClick={() => setMobileMenuOpen(false)}
                        className={`flex items-center space-x-2 px-2 py-2 rounded-md ${isActive('/admin/quizzes') ? 'bg-blue-50 dark:bg-blue-900/20' : ''}`}
                      >
                        <Settings className="h-4 w-4" />
                        <span className={navLinkClass('/admin/quizzes')}>Manage Quizzes</span>
                      </Link>
                    </>
                  )}
                  <Link
                    href="/profile"
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex items-center space-x-2 px-2 py-2 rounded-md ${isActive('/profile') ? 'bg-blue-50 dark:bg-blue-900/20' : ''}`}
                  >
                    <UserIcon className="h-4 w-4" />
                    <span className={navLinkClass('/profile')}>Profile</span>
                  </Link>
                </nav>

                <div className="pt-4 border-t border-gray-200 dark:border-gray-800">
                  <Button
                    variant="ghost"
                    className="w-full justify-start"
                    onClick={handleLogout}
                  >
                    <LogOut className="h-4 w-4 mr-2" />
                    Logout
                  </Button>
                </div>
              </div>
            ) : (
              <div className="space-y-2">
                <Link
                  href="/quizzes"
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center space-x-2 px-2 py-2 rounded-md ${isActive('/quizzes') ? 'bg-blue-50 dark:bg-blue-900/20' : ''}`}
                >
                  <BookOpen className="h-4 w-4" />
                  <span className={navLinkClass('/quizzes')}>Quizzes</span>
                </Link>
                <Link
                  href="/about"
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center space-x-2 px-2 py-2 rounded-md ${isActive('/about') ? 'bg-blue-50 dark:bg-blue-900/20' : ''}`}
                >
                  <span className={navLinkClass('/about')}>About</span>
                </Link>
                <div className="pt-2 space-y-2">
                  <Link href="/login" onClick={() => setMobileMenuOpen(false)}>
                    <Button variant="ghost" className="w-full justify-start">
                      Sign In
                    </Button>
                  </Link>
                  <Link href="/register" onClick={() => setMobileMenuOpen(false)}>
                    <Button className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
                      Get Started
                    </Button>
                  </Link>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </header>
  );
}
