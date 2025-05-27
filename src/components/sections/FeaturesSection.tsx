
import { useEffect, useRef, useState } from 'react';

const FeaturesSection = () => {
  const [visibleItems, setVisibleItems] = useState<number[]>([]);
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const index = parseInt(entry.target.getAttribute('data-index') || '0');
            setVisibleItems(prev => [...prev, index]);
          }
        });
      },
      { threshold: 0.3 }
    );

    const items = sectionRef.current?.querySelectorAll('[data-index]');
    items?.forEach(item => observer.observe(item));

    return () => observer.disconnect();
  }, []);

  const features = [
    {
      title: "AI-Powered Development",
      description: "Our advanced AI understands natural language and transforms your ideas into clean, production-ready code instantly.",
      image: "bg-gradient-to-br from-purple-100 to-purple-200",
      reverse: false
    },
    {
      title: "Real-time Collaboration",
      description: "Work with your team in real-time. Share projects, get feedback, and iterate together seamlessly.",
      image: "bg-gradient-to-br from-blue-100 to-blue-200",
      reverse: true
    },
    {
      title: "One-Click Deployment",
      description: "Deploy your applications to the web instantly. No complex setup, no DevOps headaches - just pure simplicity.",
      image: "bg-gradient-to-br from-green-100 to-green-200",
      reverse: false
    }
  ];

  return (
    <section id="features" ref={sectionRef} className="py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            Powerful Features
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Everything you need to build amazing applications, powered by cutting-edge AI
          </p>
        </div>

        <div className="space-y-20">
          {features.map((feature, index) => (
            <div
              key={index}
              data-index={index}
              className={`grid md:grid-cols-2 gap-12 items-center ${
                feature.reverse ? 'md:grid-flow-col-dense' : ''
              }`}
            >
              <div className={`transition-all duration-1000 ${
                visibleItems.includes(index) 
                  ? 'opacity-100 translate-x-0' 
                  : `opacity-0 ${feature.reverse ? 'translate-x-8' : '-translate-x-8'}`
              } ${feature.reverse ? 'md:col-start-2' : ''}`}>
                <h3 className="text-3xl font-bold text-gray-900 mb-6">{feature.title}</h3>
                <p className="text-lg text-gray-600 leading-relaxed">{feature.description}</p>
              </div>
              
              <div className={`transition-all duration-1000 delay-300 ${
                visibleItems.includes(index) 
                  ? 'opacity-100 translate-x-0' 
                  : `opacity-0 ${feature.reverse ? '-translate-x-8' : 'translate-x-8'}`
              } ${feature.reverse ? 'md:col-start-1' : ''}`}>
                <div className={`${feature.image} rounded-2xl h-64 md:h-80 flex items-center justify-center shadow-lg`}>
                  <div className="text-center">
                    <div className="w-16 h-16 bg-white rounded-full mx-auto mb-4 flex items-center justify-center shadow-md">
                      <div className="w-6 h-6 bg-teal-600 rounded-full"></div>
                    </div>
                    <p className="text-gray-700 font-medium">Feature Preview</p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;
