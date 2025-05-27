
import { useEffect, useRef, useState } from 'react';

const HowItWorksSection = () => {
  const [isVisible, setIsVisible] = useState(false);
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.3 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => observer.disconnect();
  }, []);

  const steps = [
    {
      number: '01',
      title: 'Describe Your Vision',
      description: 'Tell our AI what you want to build. Use natural language to describe your app\'s features and design.',
      delay: 'delay-0'
    },
    {
      number: '02',
      title: 'AI Generates Code',
      description: 'Our advanced AI understands your requirements and generates clean, production-ready React code.',
      delay: 'delay-200'
    },
    {
      number: '03',
      title: 'Customize & Deploy',
      description: 'Fine-tune your app with our visual editor, then deploy to the web with one click.',
      delay: 'delay-400'
    }
  ];

  return (
    <section id="how-it-works" ref={sectionRef} className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className={`text-4xl md:text-5xl font-bold text-gray-900 mb-6 transition-all duration-1000 ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}>
            How It Works
          </h2>
          <p className={`text-xl text-gray-600 max-w-3xl mx-auto transition-all duration-1000 delay-200 ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}>
            From idea to deployed app in three simple steps
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {steps.map((step, index) => (
            <div
              key={index}
              className={`text-center transition-all duration-1000 ${step.delay} ${
                isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
              }`}
            >
              <div className="bg-teal-50 rounded-2xl p-8 mb-6 hover:bg-teal-100 transition-colors duration-300">
                <div className="text-6xl font-bold text-teal-600 mb-4">{step.number}</div>
                <h3 className="text-2xl font-semibold text-gray-900 mb-4">{step.title}</h3>
                <p className="text-gray-600 leading-relaxed">{step.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HowItWorksSection;
