import { Button } from '@/components/ui/button';
import Link from 'next/link';

export function CTA() {
  return (
    <section className="py-20 sm:py-32 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-4xl sm:text-5xl font-bold text-white mb-6">
            Ready to Start Your Quiz Journey?
          </h2>
          <p className="text-xl text-blue-100 mb-10">
            Join thousands of learners testing their knowledge and improving every day.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/quizzes">
              <Button size="lg" variant="secondary" className="bg-white text-blue-600 hover:bg-gray-100">
                Get Started Free
              </Button>
            </Link>
            <Link href="/quizzes">
              <Button 
                size="lg" 
                variant="ghost" 
                className="border-2 border-white bg-transparent text-white hover:bg-white/10 hover:text-white"
              >
                Browse Quizzes
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
