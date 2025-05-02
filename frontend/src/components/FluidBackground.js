import React, { useRef, useEffect } from 'react';

const FluidBackground = () => {
  const canvasRef = useRef(null);
  const particlesRef = useRef([]);
  const mouseRef = useRef({ x: 0, y: 0, px: 0, py: 0 });
  const requestRef = useRef();
  const previousTimeRef = useRef();

  // Create particles
  const createParticles = (width, height) => {
    const particles = [];
    const particleCount = 150; // Increased particle count

    for (let i = 0; i < particleCount; i++) {
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: 0,
        vy: 0,
        radius: Math.random() * 4 + 2, // Larger particles
        color: getRandomGreenColor(),
        opacity: Math.random() * 0.6 + 0.3 // Higher opacity
      });
    }

    return particles;
  };

  const getRandomGreenColor = () => {
    // Generate vibrant green colors
    const r = Math.floor(Math.random() * 100); 
    const g = Math.floor(Math.random() * 100 + 155); // Mostly green
    const b = Math.floor(Math.random() * 100);
    return `rgb(${r}, ${g}, ${b})`;
  };

  const animate = (time) => {
    if (previousTimeRef.current === undefined) {
      previousTimeRef.current = time;
    }
    const deltaTime = Math.min((time - previousTimeRef.current) / 1000, 0.016); // Cap delta time
    previousTimeRef.current = time;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;
    
    // Create a fluid-like background with slightly more fade
    ctx.globalCompositeOperation = 'source-over';
    ctx.fillStyle = 'rgba(26, 56, 0, 0.1)'; // Increased opacity for trail effect
    ctx.fillRect(0, 0, width, height);
    
    // Mouse influence parameters
    const mouse = mouseRef.current;
    const mouseForce = 2500; // Increased force
    const mouseDx = mouse.x - mouse.px;
    const mouseDy = mouse.y - mouse.py;
    const mouseDist = Math.sqrt(mouseDx * mouseDx + mouseDy * mouseDy);
    const mouseSpeed = Math.min(mouseDist * 15, 150); // Increased speed multiplier
    
    // Update mouse previous position
    mouse.px = mouse.x;
    mouse.py = mouse.y;

    // Add random movement even when mouse is still
    if (mouseDist < 5) {
      // Add small random movement to particles when mouse is not moving
      particlesRef.current.forEach(particle => {
        particle.vx += (Math.random() - 0.5) * 0.5;
        particle.vy += (Math.random() - 0.5) * 0.5;
      });
    }

    // Update and draw particles
    ctx.globalCompositeOperation = 'screen';
    
    particlesRef.current.forEach(particle => {
      // Calculate distance to mouse
      const dx = particle.x - mouse.x;
      const dy = particle.y - mouse.y;
      const dist = Math.max(Math.sqrt(dx * dx + dy * dy), 30); // Reduced minimum distance
      const angle = Math.atan2(dy, dx);
      
      // Apply mouse influence with falloff
      const falloff = mouseForce / (dist * dist);
      const forceX = Math.cos(angle) * falloff * mouseSpeed;
      const forceY = Math.sin(angle) * falloff * mouseSpeed;
      
      // Apply force to particle
      particle.vx += forceX * deltaTime;
      particle.vy += forceY * deltaTime;
      
      // Apply damping
      particle.vx *= 0.97; // Less damping for more fluid motion
      particle.vy *= 0.97;
      
      // Update position
      particle.x += particle.vx * deltaTime;
      particle.y += particle.vy * deltaTime;
      
      // Wrap around edges
      if (particle.x < -50) particle.x = width + 50;
      if (particle.x > width + 50) particle.x = -50;
      if (particle.y < -50) particle.y = height + 50;
      if (particle.y > height + 50) particle.y = -50;
      
      // Draw particle as a glowing circle
      const grd = ctx.createRadialGradient(
        particle.x, particle.y, 0,
        particle.x, particle.y, particle.radius * 3
      );
      grd.addColorStop(0, `${particle.color.replace('rgb', 'rgba').replace(')', `,${particle.opacity})`)}`);
      grd.addColorStop(1, 'rgba(0, 50, 0, 0)');
      
      ctx.beginPath();
      ctx.fillStyle = grd;
      ctx.arc(particle.x, particle.y, particle.radius * 3, 0, Math.PI * 2);
      ctx.fill();
    });
    
    // Draw larger glow at mouse position
    if (mouseDist > 3) {
      const grd = ctx.createRadialGradient(
        mouse.x, mouse.y, 0,
        mouse.x, mouse.y, 150
      );
      grd.addColorStop(0, 'rgba(200, 255, 150, 0.4)');
      grd.addColorStop(0.5, 'rgba(120, 210, 40, 0.1)');
      grd.addColorStop(1, 'rgba(40, 120, 10, 0)');
      
      ctx.beginPath();
      ctx.fillStyle = grd;
      ctx.arc(mouse.x, mouse.y, 150, 0, Math.PI * 2);
      ctx.fill();
    }
    
    requestRef.current = requestAnimationFrame(animate);
  };

  // Initialize with mouse in center
  useEffect(() => {
    if (canvasRef.current) {
      const rect = canvasRef.current.getBoundingClientRect();
      mouseRef.current = {
        x: rect.width / 2,
        y: rect.height / 2,
        px: rect.width / 2,
        py: rect.height / 2
      };
    }
  }, []);

  // Set up the canvas and event listeners
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const handleResize = () => {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
      particlesRef.current = createParticles(canvas.width, canvas.height);
      
      // Center mouse position on resize
      mouseRef.current = {
        x: canvas.width / 2,
        y: canvas.height / 2,
        px: canvas.width / 2,
        py: canvas.height / 2
      };
    };
    
    const handleMouseMove = (e) => {
      const rect = canvas.getBoundingClientRect();
      mouseRef.current.x = e.clientX - rect.left;
      mouseRef.current.y = e.clientY - rect.top;
    };
    
    const handleMouseLeave = () => {
      // Instead of moving far away, move to center when mouse leaves
      mouseRef.current.x = canvas.width / 2;
      mouseRef.current.y = canvas.height / 2;
    };
    
    // Set initial size
    handleResize();
    
    // Add event listeners
    window.addEventListener('resize', handleResize);
    canvas.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mousemove', handleMouseMove); // Listen on entire document
    
    // Touch support
    const handleTouchMove = (e) => {
      e.preventDefault();
      const rect = canvas.getBoundingClientRect();
      const touch = e.touches[0];
      mouseRef.current.x = touch.clientX - rect.left;
      mouseRef.current.y = touch.clientY - rect.top;
    };
    
    canvas.addEventListener('touchmove', handleTouchMove, { passive: false });
    document.addEventListener('touchmove', handleTouchMove, { passive: false });
    
    canvas.addEventListener('mouseleave', handleMouseLeave);
    document.addEventListener('touchend', handleMouseLeave);
    
    // Start animation
    requestRef.current = requestAnimationFrame(animate);
    
    return () => {
      window.removeEventListener('resize', handleResize);
      canvas.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mousemove', handleMouseMove);
      canvas.removeEventListener('touchmove', handleTouchMove);
      document.removeEventListener('touchmove', handleTouchMove);
      canvas.removeEventListener('mouseleave', handleMouseLeave);
      document.removeEventListener('touchend', handleMouseLeave);
      cancelAnimationFrame(requestRef.current);
    };
  }, []);

  return (
    <canvas 
      ref={canvasRef} 
      className="fluid-canvas"
    />
  );
};

export default FluidBackground; 