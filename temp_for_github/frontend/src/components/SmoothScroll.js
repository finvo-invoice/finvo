import { useEffect } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

// Register the ScrollTrigger plugin
gsap.registerPlugin(ScrollTrigger);

// Simple smooth scroll implementation
const SmoothScroll = () => {
  useEffect(() => {
    // Check if user prefers reduced motion
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    
    if (prefersReducedMotion) {
      return; // Don't implement smooth scrolling for users who prefer reduced motion
    }

    let currentScroll = window.scrollY;
    let targetScroll = window.scrollY;
    let ease = 0.075; // Lower = smoother but slower
    let rafID = null;
    const container = document.querySelector('.home');
    const content = document.querySelector('.content-wrapper');
    const heroSection = document.querySelector('.hero-fullscreen');
    
    // Animation function
    const smoothScroll = () => {
      // Update current scroll position with easing
      currentScroll = currentScroll + (targetScroll - currentScroll) * ease;
      
      // Apply transform to hero section for parallax effect
      if (heroSection) {
        heroSection.style.transform = `translateY(${targetScroll * 0.05}px)`;
      }
      
      // Continue animation loop
      rafID = requestAnimationFrame(smoothScroll);
    };
    
    // Start the animation
    smoothScroll();
    
    // Update target scroll on scroll event
    const handleScroll = () => {
      targetScroll = window.scrollY;
    };
    
    // Handle anchor links with smooth scrolling
    const handleAnchorClick = (e) => {
      const target = e.target.closest('a[href^="#"]');
      if (!target) return;
      
      e.preventDefault();
      const targetId = target.getAttribute('href');
      
      // Only process if ID exists and element exists
      if (targetId !== '#' && document.querySelector(targetId)) {
        const targetElement = document.querySelector(targetId);
        const elementPosition = targetElement.getBoundingClientRect().top;
        const offsetPosition = elementPosition + window.scrollY - 100;
        
        // Smooth scroll to element
        window.scrollTo({
          top: offsetPosition,
          behavior: 'smooth'
        });
      }
    };
    
    // Animate sections as they come into view
    const animateSections = () => {
      const sections = document.querySelectorAll('.benefits-section, .features-section, .testimonial-section, .final-cta');
      
      sections.forEach((section) => {
        gsap.fromTo(
          section, 
          { 
            opacity: 0, 
            y: 50 
          }, 
          {
            opacity: 1,
            y: 0,
            duration: 1,
            ease: 'power2.out',
            scrollTrigger: {
              trigger: section,
              start: 'top 80%',
            },
          }
        );
      });
    };
    
    // Initialize animations
    animateSections();
    
    // Add event listeners
    window.addEventListener('scroll', handleScroll, { passive: true });
    document.addEventListener('click', handleAnchorClick);
    
    // Cleanup
    return () => {
      if (rafID) {
        cancelAnimationFrame(rafID);
      }
      window.removeEventListener('scroll', handleScroll);
      document.removeEventListener('click', handleAnchorClick);
      ScrollTrigger.getAll().forEach(trigger => trigger.kill());
    };
  }, []);

  return null;
};

export default SmoothScroll; 