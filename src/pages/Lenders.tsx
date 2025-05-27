
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { ArrowRight, Shield, Target, Zap, BarChart3 } from 'lucide-react';
import { useEffect, useState } from 'react';

const Lenders = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  const benefits = [
    {
      icon: Target,
      title: "Quality Deal Flow",
      description: "Access pre-qualified deals from vetted brokers in your target markets"
    },
    {
      icon: Shield,
      title: "Risk Management",
      description: "Advanced analytics and due diligence tools to minimize lending risk"
    },
    {
      icon: Zap,
      title: "Fast Processing",
      description: "Streamlined underwriting process with AI-powered document analysis"
    },
    {
      icon: BarChart3,
      title: "Portfolio Growth",
      description: "Scale your lending business with data-driven insights and automation"
    }
  ];

  return (
    <div className="min-h-screen">
      <Navigation />
      
      {/* Hero Section */}
      <section className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 via-white to-blue-50 pt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center">
            <div className={`transition-all duration-1000 ${
              isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
            }`}>
              <h1 className="text-5xl md:text-7xl font-bold text-gray-900 mb-6 leading-tight">
                Signal1 for
                <span className="block text-purple-600">Lenders</span>
              </h1>
            </div>
            
            <div className={`transition-all duration-1000 delay-300 ${
              isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
            }`}>
              <p className="text-xl md:text-2xl text-gray-600 mb-8 max-w-3xl mx-auto leading-relaxed">
                Access high-quality deal flow, streamline underwriting, and grow your lending portfolio 
                with Signal1's innovative platform designed for modern lenders.
              </p>
            </div>

            <div className={`transition-all duration-1000 delay-500 ${
              isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
            }`}>
              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                <Button size="lg" className="bg-purple-600 hover:bg-purple-700 text-white px-8 py-3 text-lg group">
                  Get Started as Lender
                  <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </Button>
                <Button variant="outline" size="lg" className="px-8 py-3 text-lg border-gray-300 hover:border-purple-600 hover:text-purple-600">
                  Learn More
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              Why Lenders Choose Signal1
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Everything you need to source deals and grow your lending portfolio
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {benefits.map((benefit, index) => (
              <div key={index} className="text-center p-6 rounded-2xl bg-gray-50 hover:bg-purple-50 transition-colors duration-300">
                <div className="w-16 h-16 bg-purple-600 rounded-full mx-auto mb-4 flex items-center justify-center">
                  <benefit.icon className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">{benefit.title}</h3>
                <p className="text-gray-600">{benefit.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Ready to expand your portfolio?
          </h2>
          <p className="text-xl text-gray-300 mb-8 max-w-3xl mx-auto">
            Join leading lenders who are already growing their business with Signal1.
          </p>
          <Button size="lg" className="bg-purple-600 hover:bg-purple-700 text-white px-8">
            Start Free Trial
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Lenders;
