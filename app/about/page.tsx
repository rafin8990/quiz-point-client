"use client";

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import Link from 'next/link';
import { 
  Target, 
  Lightbulb, 
  Users, 
  Award, 
  BookOpen, 
  TrendingUp,
  Zap,
  Heart,
  Globe,
  Shield,
  CheckCircle2
} from 'lucide-react';

export default function AboutPage() {
  const stats = [
    { value: '10K+', label: 'Active Users', icon: Users },
    { value: '1000+', label: 'Quiz Questions', icon: BookOpen },
    { value: '50+', label: 'Categories', icon: Globe },
    { value: '98%', label: 'Satisfaction Rate', icon: Award },
  ];

  const values = [
    {
      icon: Target,
      title: 'Our Mission',
      description: 'To make learning engaging and accessible through interactive quizzes that challenge minds and inspire growth.',
      color: 'from-blue-500 to-blue-600',
    },
    {
      icon: Lightbulb,
      title: 'Our Vision',
      description: 'To become the leading platform for knowledge testing and skill development, empowering learners worldwide.',
      color: 'from-purple-500 to-purple-600',
    },
    {
      icon: Heart,
      title: 'Our Values',
      description: 'We believe in making education fun, accessible, and rewarding for everyone, regardless of their background.',
      color: 'from-pink-500 to-pink-600',
    },
  ];

  const features = [
    {
      icon: Zap,
      title: 'Lightning Fast',
      description: 'Experience seamless quiz-taking with instant results and real-time feedback.',
    },
    {
      icon: Shield,
      title: 'Secure & Reliable',
      description: 'Your data is protected with enterprise-grade security and privacy measures.',
    },
    {
      icon: TrendingUp,
      title: 'Track Progress',
      description: 'Monitor your improvement with detailed analytics and performance insights.',
    },
    {
      icon: Award,
      title: 'Achievement System',
      description: 'Earn badges, climb leaderboards, and celebrate your learning milestones.',
    },
  ];

  const benefits = [
    'Interactive learning experience',
    'Real-time scoring and feedback',
    'Comprehensive question bank',
    'Leaderboard competitions',
    'Progress tracking',
    'Mobile-friendly design',
    'Regular content updates',
    'Community-driven platform',
  ];

  return (
    <main className="min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 py-20 sm:py-32">
        <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-block mb-6">
              <span className="px-4 py-2 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-sm font-medium">
                About QuizPoint
              </span>
            </div>
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold mb-6 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent leading-tight">
              Empowering Learning
              <br />
              <span className="text-gray-900 dark:text-gray-100">Through Knowledge</span>
            </h1>
            <p className="text-xl sm:text-2xl text-gray-600 dark:text-gray-300 mb-10 max-w-2xl mx-auto leading-relaxed">
              We're on a mission to make learning engaging, accessible, and fun for everyone. 
              Join thousands of learners who are improving their knowledge every day.
            </p>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => {
              const Icon = stat.icon;
              return (
                <div key={index} className="text-center">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 mb-4">
                    <Icon className="h-8 w-8 text-white" />
                  </div>
                  <div className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
                    {stat.value}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400 font-medium">
                    {stat.label}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Mission, Vision, Values Section */}
      <section className="py-20 sm:py-32 bg-white dark:bg-gray-900">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl sm:text-5xl font-bold text-gray-900 dark:text-gray-100 mb-4">
              What Drives Us
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              Our core principles guide everything we do
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {values.map((value, index) => {
              const Icon = value.icon;
              return (
                <Card key={index} className="border-2 hover:shadow-xl transition-all duration-300 hover:-translate-y-2">
                  <CardHeader>
                    <div className={`inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br ${value.color} mb-4`}>
                      <Icon className="h-8 w-8 text-white" />
                    </div>
                    <CardTitle className="text-2xl mb-2">{value.title}</CardTitle>
                    <CardDescription className="text-base">
                      {value.description}
                    </CardDescription>
                  </CardHeader>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 sm:py-32 bg-gradient-to-br from-gray-50 to-blue-50 dark:from-gray-800 dark:to-gray-900">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl sm:text-5xl font-bold text-gray-900 dark:text-gray-100 mb-4">
              Why Choose QuizPoint?
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              Experience the best in interactive learning
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <Card key={index} className="text-center transition-all duration-300 hover:shadow-xl hover:-translate-y-1 border-2">
                  <CardHeader>
                    <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 mb-4">
                      <Icon className="h-7 w-7 text-white" />
                    </div>
                    <CardTitle className="text-xl mb-2">{feature.title}</CardTitle>
                    <CardDescription>{feature.description}</CardDescription>
                  </CardHeader>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 sm:py-32 bg-white dark:bg-gray-900">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-4xl sm:text-5xl font-bold text-gray-900 dark:text-gray-100 mb-4">
                Everything You Need
              </h2>
              <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
                All the features you need to enhance your learning journey
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {benefits.map((benefit, index) => (
                <div
                  key={index}
                  className="flex items-center space-x-3 p-4 rounded-lg bg-gradient-to-r from-blue-50 to-purple-50 dark:from-gray-800 dark:to-gray-700 border border-blue-100 dark:border-gray-700"
                >
                  <CheckCircle2 className="h-5 w-5 text-green-500 flex-shrink-0" />
                  <span className="text-gray-700 dark:text-gray-300 font-medium">{benefit}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Story Section */}
      <section className="py-20 sm:py-32 bg-gradient-to-br from-purple-50 via-blue-50 to-pink-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto">
            <Card className="border-2 shadow-xl">
              <CardHeader>
                <CardTitle className="text-3xl mb-4 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  Our Story
                </CardTitle>
                <CardDescription className="text-base">
                  <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
                    QuizPoint was born from a simple idea: learning should be engaging, accessible, and rewarding. 
                    We noticed that traditional learning methods often lacked interactivity and immediate feedback, 
                    making it difficult for learners to stay motivated and track their progress.
                  </p>
                  <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
                    Our platform combines the best of interactive learning with modern technology to create an 
                    experience that's both educational and enjoyable. Whether you're a student preparing for exams, 
                    a professional looking to upskill, or someone who simply loves testing their knowledge, 
                    QuizPoint is designed for you.
                  </p>
                  <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                    Today, we're proud to serve thousands of learners worldwide, helping them achieve their 
                    learning goals one quiz at a time. Join us on this journey and discover the joy of 
                    learning through interactive quizzes.
                  </p>
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 sm:py-32 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-4xl sm:text-5xl font-bold text-white mb-6">
              Ready to Start Learning?
            </h2>
            <p className="text-xl text-blue-100 mb-10">
              Join thousands of learners who are improving their knowledge every day. 
              Start your quiz journey today!
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/quizzes">
                <Button size="lg" variant="secondary" className="bg-white text-blue-600 hover:bg-gray-100 w-full sm:w-auto">
                  Explore Quizzes
                </Button>
              </Link>
              <Link href="/register">
                <Button 
                  size="lg" 
                  variant="ghost" 
                  className="border-2 border-white bg-transparent text-white hover:bg-white/10 hover:text-white w-full sm:w-auto"
                >
                  Get Started Free
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
