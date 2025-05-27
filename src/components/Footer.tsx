
import { useEffect, useRef, useState } from 'react';

const Footer = () => {
  const [isVisible, setIsVisible] = useState(false);
  const footerRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.3 }
    );

    if (footerRef.current) {
      observer.observe(footerRef.current);
    }

    return () => observer.disconnect();
  }, []);

  const footerLinks = {
    Product: ['Features', 'Pricing', 'Documentation', 'API'],
    Company: ['About', 'Blog', 'Careers', 'Contact'],
    Resources: ['Help Center', 'Community', 'Tutorials', 'Status'],
    Legal: ['Privacy', 'Terms', 'Security', 'Cookies']
  };

  return (
    <footer ref={footerRef} className="bg-gray-50 py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className={`transition-all duration-1000 ${
          isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
        }`}>
          <div className="grid md:grid-cols-6 gap-8 mb-12">
            {/* Brand */}
            <div className="md:col-span-2">
              <h3 className="text-2xl font-bold text-teal-600 mb-4">Lovable</h3>
              <p className="text-gray-600 leading-relaxed mb-6">
                Building the future of web development with AI-powered tools 
                that make creating beautiful applications effortless.
              </p>
              <div className="flex space-x-4">
                <div className="w-8 h-8 bg-gray-300 rounded-full"></div>
                <div className="w-8 h-8 bg-gray-300 rounded-full"></div>
                <div className="w-8 h-8 bg-gray-300 rounded-full"></div>
                <div className="w-8 h-8 bg-gray-300 rounded-full"></div>
              </div>
            </div>

            {/* Links */}
            {Object.entries(footerLinks).map(([category, links]) => (
              <div key={category} className="md:col-span-1">
                <h4 className="font-semibold text-gray-900 mb-4">{category}</h4>
                <ul className="space-y-2">
                  {links.map((link) => (
                    <li key={link}>
                      <a
                        href="#"
                        className="text-gray-600 hover:text-teal-600 transition-colors duration-200"
                      >
                        {link}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <div className="border-t border-gray-200 pt-8 flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-600 text-sm">
              © 2024 Lovable. All rights reserved.
            </p>
            <p className="text-gray-600 text-sm mt-4 md:mt-0">
              Made with ❤️ for developers everywhere
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
