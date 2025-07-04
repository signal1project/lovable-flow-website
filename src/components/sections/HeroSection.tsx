
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

const HeroSection = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  return (
    <section className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 via-white to-teal-50 pt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center">
          <div className={`transition-all duration-1000 ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}>
            <h1 className="text-5xl md:text-7xl font-bold text-gray-900 mb-6 leading-tight">
              Welcome to
              <span className="block text-teal-600">Signal1</span>
            </h1>
          </div>
          
          <div className={`transition-all duration-1000 delay-300 ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}>
            <p className="text-xl md:text-2xl text-gray-600 mb-8 max-w-3xl mx-auto leading-relaxed">
              Connecting brokers and lenders through innovative technology and streamlined processes. 
              Experience the future of real estate finance.
            </p>
          </div>

          <div className={`transition-all duration-1000 delay-500 ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-8">
              <Link to="/about">
                <Button size="lg" className="bg-teal-600 hover:bg-teal-700 text-white px-8 py-3 text-lg group">
                  Learn More
                  <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
              <Button variant="outline" size="lg" className="px-8 py-3 text-lg border-gray-300 hover:border-teal-600 hover:text-teal-600">
                Watch Demo
              </Button>
            </div>

            {/* User Type Selection */}
            <div className="flex flex-col sm:flex-row gap-6 justify-center items-center max-w-2xl mx-auto">
              <div className="text-center">
                <p className="text-gray-600 mb-3">Are you a broker?</p>
                <Link to="/brokers">
                  <Button variant="outline" className="border-teal-600 text-teal-600 hover:bg-teal-600 hover:text-white px-6 py-2">
                    Explore for Brokers
                  </Button>
                </Link>
              </div>
              
              <div className="text-center">
                <p className="text-gray-600 mb-3">Are you a lender?</p>
                <Link to="/lenders">
                  <Button variant="outline" className="border-purple-600 text-purple-600 hover:bg-purple-600 hover:text-white px-6 py-2">
                    Explore for Lenders
                  </Button>
                </Link>
              </div>
            </div>
          </div>

          <div className={`mt-16 transition-all duration-1000 delay-700 ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}>
            <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-4xl mx-auto">
              <div className="bg-gray-100 rounded-lg h-64 md:h-80 flex items-center justify-center">
                <div className="text-center">
                  <div className="w-16 h-16 bg-teal-600 rounded-full mx-auto mb-4 flex items-center justify-center">
                    <div className="w-6 h-6 bg-white rounded-full"></div>
                  </div>
                  <p className="text-gray-600">Signal1 Platform Preview</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
