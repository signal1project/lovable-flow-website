
import { useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { ArrowLeft, ArrowRight } from 'lucide-react';

const TestimonialsSection = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
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

  const testimonials = [
    {
      quote: "Lovable transformed how we build applications. What used to take weeks now takes hours. The AI is incredibly intuitive.",
      author: "Sarah Chen",
      role: "CTO at TechStart",
      avatar: "SC"
    },
    {
      quote: "The best development tool I've ever used. The code quality is exceptional and the deployment process is seamless.",
      author: "Marcus Johnson",
      role: "Lead Developer at InnovateCorp",
      avatar: "MJ"
    },
    {
      quote: "Our productivity increased by 300% since adopting Lovable. It's like having a senior developer as your AI assistant.",
      author: "Elena Rodriguez",
      role: "Product Manager at NextGen",
      avatar: "ER"
    }
  ];

  const nextTestimonial = () => {
    setCurrentIndex((prev) => (prev + 1) % testimonials.length);
  };

  const prevTestimonial = () => {
    setCurrentIndex((prev) => (prev - 1 + testimonials.length) % testimonials.length);
  };

  return (
    <section id="testimonials" ref={sectionRef} className="py-20 bg-teal-600">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className={`text-4xl md:text-5xl font-bold text-white mb-6 transition-all duration-1000 ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}>
            What Our Users Say
          </h2>
          <p className={`text-xl text-teal-100 max-w-3xl mx-auto transition-all duration-1000 delay-200 ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}>
            Join thousands of developers who trust Lovable
          </p>
        </div>

        <div className={`max-w-4xl mx-auto transition-all duration-1000 delay-400 ${
          isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
        }`}>
          <div className="bg-white rounded-2xl p-8 md:p-12 shadow-xl">
            <div className="text-center">
              <blockquote className="text-2xl md:text-3xl text-gray-900 mb-8 leading-relaxed">
                "{testimonials[currentIndex].quote}"
              </blockquote>
              
              <div className="flex items-center justify-center mb-8">
                <div className="w-16 h-16 bg-teal-600 rounded-full flex items-center justify-center text-white font-bold text-xl mr-4">
                  {testimonials[currentIndex].avatar}
                </div>
                <div className="text-left">
                  <div className="font-semibold text-gray-900 text-lg">
                    {testimonials[currentIndex].author}
                  </div>
                  <div className="text-gray-600">
                    {testimonials[currentIndex].role}
                  </div>
                </div>
              </div>

              <div className="flex justify-center items-center space-x-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={prevTestimonial}
                  className="border-teal-600 text-teal-600 hover:bg-teal-50"
                >
                  <ArrowLeft className="h-4 w-4" />
                </Button>
                
                <div className="flex space-x-2">
                  {testimonials.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentIndex(index)}
                      className={`w-3 h-3 rounded-full transition-colors ${
                        index === currentIndex ? 'bg-teal-600' : 'bg-gray-300'
                      }`}
                    />
                  ))}
                </div>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={nextTestimonial}
                  className="border-teal-600 text-teal-600 hover:bg-teal-50"
                >
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default TestimonialsSection;
