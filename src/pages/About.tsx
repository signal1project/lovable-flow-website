
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { ArrowRight, Target, Eye, Users, Mail, Phone, MapPin } from 'lucide-react';
import { useEffect, useState } from 'react';

const About = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  const values = [
    {
      icon: Target,
      title: "Our Mission",
      description: "To revolutionize real estate finance by creating seamless connections between brokers and lenders through innovative technology."
    },
    {
      icon: Eye,
      title: "Our Vision",
      description: "A future where real estate transactions are faster, more transparent, and accessible to everyone through cutting-edge digital solutions."
    },
    {
      icon: Users,
      title: "Our Values",
      description: "Trust, innovation, and excellence drive everything we do. We believe in building lasting partnerships that benefit all stakeholders."
    }
  ];

  const contactInfo = [
    {
      icon: Mail,
      title: "Email",
      value: "hello@signal1.com",
      link: "mailto:hello@signal1.com"
    },
    {
      icon: Phone,
      title: "Phone",
      value: "+1 (555) 123-4567",
      link: "tel:+15551234567"
    },
    {
      icon: MapPin,
      title: "Address",
      value: "123 Innovation Drive, Tech City, TC 12345",
      link: "#"
    }
  ];

  return (
    <div className="min-h-screen">
      <Navigation />
      
      {/* Hero Section */}
      <section className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 via-white to-teal-50 pt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center">
            <div className={`transition-all duration-1000 ${
              isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
            }`}>
              <h1 className="text-5xl md:text-7xl font-bold text-gray-900 mb-6 leading-tight">
                About
                <span className="block text-teal-600">Signal1</span>
              </h1>
            </div>
            
            <div className={`transition-all duration-1000 delay-300 ${
              isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
            }`}>
              <p className="text-xl md:text-2xl text-gray-600 mb-8 max-w-4xl mx-auto leading-relaxed">
                Signal1 is transforming the real estate finance industry by bridging the gap between brokers and lenders. 
                Our innovative platform streamlines processes, enhances communication, and delivers results that matter.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Mission, Vision, Values Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              Who We Are
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Built on a foundation of innovation and trust
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {values.map((value, index) => (
              <div key={index} className="text-center p-8 rounded-2xl bg-gray-50 hover:bg-teal-50 transition-colors duration-300">
                <div className="w-16 h-16 bg-teal-600 rounded-full mx-auto mb-6 flex items-center justify-center">
                  <value.icon className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-2xl font-semibold text-gray-900 mb-4">{value.title}</h3>
                <p className="text-gray-600 leading-relaxed">{value.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Company Story Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
                Our Story
              </h2>
              <div className="space-y-6 text-lg text-gray-600 leading-relaxed">
                <p>
                  Founded in 2024, Signal1 emerged from a simple observation: the real estate finance industry 
                  needed a modern, efficient way to connect brokers and lenders.
                </p>
                <p>
                  Our team of industry veterans and technology experts came together with a shared vision of 
                  creating a platform that would eliminate friction, reduce transaction times, and improve 
                  outcomes for everyone involved.
                </p>
                <p>
                  Today, Signal1 serves hundreds of brokers and lenders across the country, facilitating 
                  millions in transactions and continuing to innovate at the intersection of real estate and technology.
                </p>
              </div>
            </div>
            <div className="bg-white rounded-2xl shadow-xl p-8">
              <div className="bg-gradient-to-br from-teal-100 to-teal-200 rounded-lg h-80 flex items-center justify-center">
                <div className="text-center">
                  <div className="w-20 h-20 bg-teal-600 rounded-full mx-auto mb-4 flex items-center justify-center">
                    <Users className="w-10 h-10 text-white" />
                  </div>
                  <p className="text-teal-700 font-medium">Our Team</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              Get In Touch
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Ready to learn more about Signal1? We'd love to hear from you.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 mb-12">
            {contactInfo.map((contact, index) => (
              <div key={index} className="text-center p-6 rounded-2xl bg-gray-50 hover:bg-teal-50 transition-colors duration-300">
                <div className="w-12 h-12 bg-teal-600 rounded-full mx-auto mb-4 flex items-center justify-center">
                  <contact.icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{contact.title}</h3>
                {contact.link.startsWith('#') ? (
                  <p className="text-gray-600">{contact.value}</p>
                ) : (
                  <a href={contact.link} className="text-teal-600 hover:text-teal-700 transition-colors">
                    {contact.value}
                  </a>
                )}
              </div>
            ))}
          </div>

          <div className="text-center">
            <Button size="lg" className="bg-teal-600 hover:bg-teal-700 text-white px-8">
              Contact Us
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default About;
