import React, { useRef, useEffect } from 'react';

const FluidSimulation = () => {
  const canvasRef = useRef(null);
  
  useEffect(() => {
    const canvas = canvasRef.current;
    const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
    
    if (!gl) {
      console.warn('WebGL not supported');
      return;
    }
    
    // Configuration and simulation parameters
    const config = {
      TEXTURE_DOWNSAMPLE: 1,
      DENSITY_DISSIPATION: 0.98,
      VELOCITY_DISSIPATION: 0.99,
      PRESSURE_DISSIPATION: 0.8,
      PRESSURE_ITERATIONS: 25,
      CURL: 28,
      SPLAT_RADIUS: 0.004
    };

    let pointers = [];
    let splatStack = [];
    
    class Pointer {
      constructor() {
        this.id = -1;
        this.x = 0;
        this.y = 0;
        this.dx = 0;
        this.dy = 0;
        this.down = false;
        this.moved = false;
        this.color = [30, 0, 300];
      }
    }
    
    pointers.push(new Pointer());
    
    // Shader code
    const baseVertexShader = `
      precision highp float;
      precision mediump sampler2D;

      attribute vec2 aPosition;
      varying vec2 vUv;
      varying vec2 vL;
      varying vec2 vR;
      varying vec2 vT;
      varying vec2 vB;
      uniform vec2 texelSize;

      void main () {
        vUv = aPosition * 0.5 + 0.5;
        vL = vUv - vec2(texelSize.x, 0.0);
        vR = vUv + vec2(texelSize.x, 0.0);
        vT = vUv + vec2(0.0, texelSize.y);
        vB = vUv - vec2(0.0, texelSize.y);
        gl_Position = vec4(aPosition, 0.0, 1.0);
      }
    `;

    const clearShader = `
      precision highp float;
      precision mediump sampler2D;

      varying vec2 vUv;
      uniform sampler2D uTexture;
      uniform float value;

      void main () {
        gl_FragColor = value * texture2D(uTexture, vUv);
      }
    `;

    const displayShader = `
      precision highp float;
      precision mediump sampler2D;

      varying vec2 vUv;
      uniform sampler2D uTexture;

      void main () {
        vec3 C = texture2D(uTexture, vUv).rgb;
        float a = max(C.r, max(C.g, C.b));
        gl_FragColor = vec4(C, a);
      }
    `;

    const splatShader = `
      precision highp float;
      precision mediump sampler2D;

      varying vec2 vUv;
      uniform sampler2D uTarget;
      uniform float aspectRatio;
      uniform vec3 color;
      uniform vec2 point;
      uniform float radius;

      void main () {
        vec2 p = vUv - point.xy;
        p.x *= aspectRatio;
        vec3 splat = exp(-dot(p, p) / radius) * color;
        vec3 base = texture2D(uTarget, vUv).xyz;
        gl_FragColor = vec4(base + splat, 1.0);
      }
    `;

    const advectionShader = `
      precision highp float;
      precision mediump sampler2D;

      varying vec2 vUv;
      uniform sampler2D uVelocity;
      uniform sampler2D uSource;
      uniform vec2 texelSize;
      uniform float dt;
      uniform float dissipation;

      void main () {
        vec2 coord = vUv - dt * texture2D(uVelocity, vUv).xy * texelSize;
        gl_FragColor = dissipation * texture2D(uSource, coord);
        gl_FragColor.a = 1.0;
      }
    `;

    const divergenceShader = `
      precision highp float;
      precision mediump sampler2D;

      varying vec2 vUv;
      varying vec2 vL;
      varying vec2 vR;
      varying vec2 vT;
      varying vec2 vB;
      uniform sampler2D uVelocity;

      void main () {
        float L = texture2D(uVelocity, vL).x;
        float R = texture2D(uVelocity, vR).x;
        float T = texture2D(uVelocity, vT).y;
        float B = texture2D(uVelocity, vB).y;
        float div = 0.5 * (R - L + T - B);
        gl_FragColor = vec4(div, 0.0, 0.0, 1.0);
      }
    `;

    const curlShader = `
      precision highp float;
      precision mediump sampler2D;

      varying vec2 vUv;
      varying vec2 vL;
      varying vec2 vR;
      varying vec2 vT;
      varying vec2 vB;
      uniform sampler2D uVelocity;

      void main () {
        float L = texture2D(uVelocity, vL).y;
        float R = texture2D(uVelocity, vR).y;
        float T = texture2D(uVelocity, vT).x;
        float B = texture2D(uVelocity, vB).x;
        float vorticity = R - L - T + B;
        gl_FragColor = vec4(vorticity, 0.0, 0.0, 1.0);
      }
    `;

    const vorticityShader = `
      precision highp float;
      precision mediump sampler2D;

      varying vec2 vUv;
      varying vec2 vL;
      varying vec2 vR;
      varying vec2 vT;
      varying vec2 vB;
      uniform sampler2D uVelocity;
      uniform sampler2D uCurl;
      uniform float curl;
      uniform float dt;

      void main () {
        float L = texture2D(uCurl, vL).x;
        float R = texture2D(uCurl, vR).x;
        float T = texture2D(uCurl, vT).x;
        float B = texture2D(uCurl, vB).x;
        float C = texture2D(uCurl, vUv).x;
        vec2 force = vec2(abs(T) - abs(B), abs(R) - abs(L));
        force *= 1.0 / length(force + 0.00001) * curl * C;
        vec2 vel = texture2D(uVelocity, vUv).xy;
        gl_FragColor = vec4(vel + force * dt, 0.0, 1.0);
      }
    `;

    const pressureShader = `
      precision highp float;
      precision mediump sampler2D;

      varying vec2 vUv;
      varying vec2 vL;
      varying vec2 vR;
      varying vec2 vT;
      varying vec2 vB;
      uniform sampler2D uPressure;
      uniform sampler2D uDivergence;

      void main () {
        float L = texture2D(uPressure, vL).x;
        float R = texture2D(uPressure, vR).x;
        float T = texture2D(uPressure, vT).x;
        float B = texture2D(uPressure, vB).x;
        float C = texture2D(uPressure, vUv).x;
        float divergence = texture2D(uDivergence, vUv).x;
        float pressure = (L + R + B + T - divergence) * 0.25;
        gl_FragColor = vec4(pressure, 0.0, 0.0, 1.0);
      }
    `;

    const gradientSubtractShader = `
      precision highp float;
      precision mediump sampler2D;

      varying vec2 vUv;
      varying vec2 vL;
      varying vec2 vR;
      varying vec2 vT;
      varying vec2 vB;
      uniform sampler2D uPressure;
      uniform sampler2D uVelocity;

      void main () {
        float L = texture2D(uPressure, vL).x;
        float R = texture2D(uPressure, vR).x;
        float T = texture2D(uPressure, vT).x;
        float B = texture2D(uPressure, vB).x;
        vec2 velocity = texture2D(uVelocity, vUv).xy;
        velocity.xy -= vec2(R - L, T - B);
        gl_FragColor = vec4(velocity, 0.0, 1.0);
      }
    `;

    // Utility functions
    const compileShader = (type, source) => {
      const shader = gl.createShader(type);
      gl.shaderSource(shader, source);
      gl.compileShader(shader);
      
      if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        console.error('Shader compilation error:', gl.getShaderInfoLog(shader));
        gl.deleteShader(shader);
        return null;
      }
      
      return shader;
    };

    const createProgram = (vertexShader, fragmentShader) => {
      const program = gl.createProgram();
      gl.attachShader(program, vertexShader);
      gl.attachShader(program, fragmentShader);
      gl.linkProgram(program);
      
      if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
        console.error('Program link error:', gl.getProgramInfoLog(program));
        gl.deleteProgram(program);
        return null;
      }
      
      return program;
    };
    
    // Compile shaders
    const vertexShader = compileShader(gl.VERTEX_SHADER, baseVertexShader);
    const clearFragmentShader = compileShader(gl.FRAGMENT_SHADER, clearShader);
    const displayFragmentShader = compileShader(gl.FRAGMENT_SHADER, displayShader);
    const splatFragmentShader = compileShader(gl.FRAGMENT_SHADER, splatShader);
    const advectionFragmentShader = compileShader(gl.FRAGMENT_SHADER, advectionShader);
    const divergenceFragmentShader = compileShader(gl.FRAGMENT_SHADER, divergenceShader);
    const curlFragmentShader = compileShader(gl.FRAGMENT_SHADER, curlShader);
    const vorticityFragmentShader = compileShader(gl.FRAGMENT_SHADER, vorticityShader);
    const pressureFragmentShader = compileShader(gl.FRAGMENT_SHADER, pressureShader);
    const gradientSubtractFragmentShader = compileShader(gl.FRAGMENT_SHADER, gradientSubtractShader);
    
    // Create shader programs
    const clearProgram = createProgram(vertexShader, clearFragmentShader);
    const displayProgram = createProgram(vertexShader, displayFragmentShader);
    const splatProgram = createProgram(vertexShader, splatFragmentShader);
    const advectionProgram = createProgram(vertexShader, advectionFragmentShader);
    const divergenceProgram = createProgram(vertexShader, divergenceFragmentShader);
    const curlProgram = createProgram(vertexShader, curlFragmentShader);
    const vorticityProgram = createProgram(vertexShader, vorticityFragmentShader);
    const pressureProgram = createProgram(vertexShader, pressureFragmentShader);
    const gradientSubtractProgram = createProgram(vertexShader, gradientSubtractFragmentShader);
    
    // Set up attribute and uniforms
    const getUniforms = (program) => {
      const uniforms = {};
      const uniformCount = gl.getProgramParameter(program, gl.ACTIVE_UNIFORMS);
      
      for (let i = 0; i < uniformCount; i++) {
        const uniformName = gl.getActiveUniform(program, i).name;
        uniforms[uniformName] = gl.getUniformLocation(program, uniformName);
      }
      
      return uniforms;
    };
    
    const clearUniforms = getUniforms(clearProgram);
    const displayUniforms = getUniforms(displayProgram);
    const splatUniforms = getUniforms(splatProgram);
    const advectionUniforms = getUniforms(advectionProgram);
    const divergenceUniforms = getUniforms(divergenceProgram);
    const curlUniforms = getUniforms(curlProgram);
    const vorticityUniforms = getUniforms(vorticityProgram);
    const pressureUniforms = getUniforms(pressureProgram);
    const gradientSubtractUniforms = getUniforms(gradientSubtractProgram);
    
    // Set up vertex data
    const positionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, -1, 1, 1, 1, 1, -1]), gl.STATIC_DRAW);
    
    const indexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array([0, 1, 2, 0, 2, 3]), gl.STATIC_DRAW);
    
    const aPosition = gl.getAttribLocation(displayProgram, 'aPosition');
    gl.enableVertexAttribArray(aPosition);
    gl.vertexAttribPointer(aPosition, 2, gl.FLOAT, false, 0, 0);
    
    // Set up framebuffers and textures
    let textureWidth;
    let textureHeight;
    let density;
    let velocity;
    let divergence;
    let curl;
    let pressure;
    
    const createFBO = (texId, width, height, internalFormat, format, type, param) => {
      gl.activeTexture(gl.TEXTURE0 + texId);
      const texture = gl.createTexture();
      gl.bindTexture(gl.TEXTURE_2D, texture);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, param);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, param);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
      gl.texImage2D(gl.TEXTURE_2D, 0, internalFormat, width, height, 0, format, type, null);
      
      const fbo = gl.createFramebuffer();
      gl.bindFramebuffer(gl.FRAMEBUFFER, fbo);
      gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, texture, 0);
      gl.viewport(0, 0, width, height);
      gl.clear(gl.COLOR_BUFFER_BIT);
      
      return [texture, fbo, texId];
    };
    
    const createDoubleFBO = (texId, width, height, internalFormat, format, type, param) => {
      let fbo1 = createFBO(texId, width, height, internalFormat, format, type, param);
      let fbo2 = createFBO(texId + 1, width, height, internalFormat, format, type, param);
      
      return {
        get read() {
          return fbo1;
        },
        get write() {
          return fbo2;
        },
        swap() {
          const temp = fbo1;
          fbo1 = fbo2;
          fbo2 = temp;
        }
      };
    };
    
    const blit = (() => {
      gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
      gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);
      gl.enableVertexAttribArray(0);
      
      return (destination) => {
        gl.bindFramebuffer(gl.FRAMEBUFFER, destination);
        gl.drawElements(gl.TRIANGLES, 6, gl.UNSIGNED_SHORT, 0);
      };
    })();
    
    let lastTime = Date.now();
    
    const resizeCanvas = () => {
      if (canvas.width !== canvas.clientWidth || canvas.height !== canvas.clientHeight) {
        canvas.width = canvas.clientWidth;
        canvas.height = canvas.clientHeight;
        initFramebuffers();
      }
    };
    
    const initFramebuffers = () => {
      textureWidth = gl.drawingBufferWidth >> config.TEXTURE_DOWNSAMPLE;
      textureHeight = gl.drawingBufferHeight >> config.TEXTURE_DOWNSAMPLE;
      
      const texType = gl.HALF_FLOAT || gl.HALF_FLOAT_OES;
      const internalFormat = gl.RGBA;
      const format = gl.RGBA;
      
      density = createDoubleFBO(2, textureWidth, textureHeight, internalFormat, format, texType, gl.LINEAR);
      velocity = createDoubleFBO(0, textureWidth, textureHeight, internalFormat, format, texType, gl.LINEAR);
      divergence = createFBO(4, textureWidth, textureHeight, internalFormat, format, texType, gl.NEAREST);
      curl = createFBO(5, textureWidth, textureHeight, internalFormat, format, texType, gl.NEAREST);
      pressure = createDoubleFBO(6, textureWidth, textureHeight, internalFormat, format, texType, gl.NEAREST);
    };
    
    const update = () => {
      resizeCanvas();
      
      const dt = Math.min((Date.now() - lastTime) / 1000, 0.016);
      lastTime = Date.now();
      
      gl.viewport(0, 0, textureWidth, textureHeight);
      
      if (splatStack.length > 0) {
        multipleSplats(splatStack.pop());
      }
      
      gl.useProgram(advectionProgram);
      gl.uniform2f(advectionUniforms.texelSize, 1.0 / textureWidth, 1.0 / textureHeight);
      gl.uniform1i(advectionUniforms.uVelocity, velocity.read[2]);
      gl.uniform1i(advectionUniforms.uSource, velocity.read[2]);
      gl.uniform1f(advectionUniforms.dt, dt);
      gl.uniform1f(advectionUniforms.dissipation, config.VELOCITY_DISSIPATION);
      blit(velocity.write[1]);
      velocity.swap();
      
      gl.uniform1i(advectionUniforms.uVelocity, velocity.read[2]);
      gl.uniform1i(advectionUniforms.uSource, density.read[2]);
      gl.uniform1f(advectionUniforms.dissipation, config.DENSITY_DISSIPATION);
      blit(density.write[1]);
      density.swap();
      
      for (let i = 0; i < pointers.length; i++) {
        const pointer = pointers[i];
        if (pointer.moved) {
          splat(pointer.x, pointer.y, pointer.dx, pointer.dy, pointer.color);
          pointer.moved = false;
        }
      }
      
      gl.useProgram(curlProgram);
      gl.uniform2f(curlUniforms.texelSize, 1.0 / textureWidth, 1.0 / textureHeight);
      gl.uniform1i(curlUniforms.uVelocity, velocity.read[2]);
      blit(curl[1]);
      
      gl.useProgram(vorticityProgram);
      gl.uniform2f(vorticityUniforms.texelSize, 1.0 / textureWidth, 1.0 / textureHeight);
      gl.uniform1i(vorticityUniforms.uVelocity, velocity.read[2]);
      gl.uniform1i(vorticityUniforms.uCurl, curl[2]);
      gl.uniform1f(vorticityUniforms.curl, config.CURL);
      gl.uniform1f(vorticityUniforms.dt, dt);
      blit(velocity.write[1]);
      velocity.swap();
      
      gl.useProgram(divergenceProgram);
      gl.uniform2f(divergenceUniforms.texelSize, 1.0 / textureWidth, 1.0 / textureHeight);
      gl.uniform1i(divergenceUniforms.uVelocity, velocity.read[2]);
      blit(divergence[1]);
      
      gl.useProgram(clearProgram);
      gl.uniform1i(clearUniforms.uTexture, pressure.read[2]);
      gl.uniform1f(clearUniforms.value, config.PRESSURE_DISSIPATION);
      blit(pressure.write[1]);
      pressure.swap();
      
      gl.useProgram(pressureProgram);
      gl.uniform2f(pressureUniforms.texelSize, 1.0 / textureWidth, 1.0 / textureHeight);
      gl.uniform1i(pressureUniforms.uDivergence, divergence[2]);
      
      for (let i = 0; i < config.PRESSURE_ITERATIONS; i++) {
        gl.uniform1i(pressureUniforms.uPressure, pressure.read[2]);
        blit(pressure.write[1]);
        pressure.swap();
      }
      
      gl.useProgram(gradientSubtractProgram);
      gl.uniform2f(gradientSubtractUniforms.texelSize, 1.0 / textureWidth, 1.0 / textureHeight);
      gl.uniform1i(gradientSubtractUniforms.uPressure, pressure.read[2]);
      gl.uniform1i(gradientSubtractUniforms.uVelocity, velocity.read[2]);
      blit(velocity.write[1]);
      velocity.swap();
      
      gl.viewport(0, 0, gl.drawingBufferWidth, gl.drawingBufferHeight);
      gl.useProgram(displayProgram);
      gl.uniform1i(displayUniforms.uTexture, density.read[2]);
      blit(null);
      
      requestAnimationFrame(update);
    };
    
    const splat = (x, y, dx, dy, color) => {
      gl.useProgram(splatProgram);
      gl.uniform1i(splatUniforms.uTarget, velocity.read[2]);
      gl.uniform1f(splatUniforms.aspectRatio, canvas.width / canvas.height);
      gl.uniform2f(splatUniforms.point, x / canvas.width, 1.0 - y / canvas.height);
      gl.uniform3f(splatUniforms.color, dx, -dy, 1.0);
      gl.uniform1f(splatUniforms.radius, config.SPLAT_RADIUS);
      blit(velocity.write[1]);
      velocity.swap();
      
      gl.uniform1i(splatUniforms.uTarget, density.read[2]);
      // Choose different colors based on input for a more vibrant effect
      color = color || [Math.random() + 0.2, Math.random() + 0.2, Math.random() + 0.2];
      gl.uniform3f(splatUniforms.color, color[0] * 0.3, color[1] * 0.3, color[2] * 0.3);
      blit(density.write[1]);
      density.swap();
    };
    
    const multipleSplats = (amount) => {
      for (let i = 0; i < amount; i++) {
        const color = [Math.random() * 10, Math.random() * 10, Math.random() * 10];
        const x = canvas.width * Math.random();
        const y = canvas.height * Math.random();
        const dx = 1000 * (Math.random() - 0.5);
        const dy = 1000 * (Math.random() - 0.5);
        splat(x, y, dx, dy, color);
      }
    };
    
    // Initialize the simulation
    initFramebuffers();
    multipleSplats(Math.random() * 5 + 5);
    update();
    
    // Event handlers for mouse/touch interaction
    const handleCanvasMouseMove = (e) => {
      pointers[0].moved = pointers[0].down;
      pointers[0].dx = (e.offsetX - pointers[0].x) * 10.0;
      pointers[0].dy = (e.offsetY - pointers[0].y) * 10.0;
      pointers[0].x = e.offsetX;
      pointers[0].y = e.offsetY;
    };
    
    const handleCanvasMouseDown = () => {
      pointers[0].down = true;
      pointers[0].color = [Math.random() + 0.2, Math.random() + 0.2, Math.random() + 0.2];
    };
    
    const handleWindowMouseUp = () => {
      pointers[0].down = false;
    };
    
    const handleCanvasTouchMove = (e) => {
      e.preventDefault();
      const touches = e.targetTouches;
      
      for (let i = 0; i < touches.length; i++) {
        let pointer = pointers[i];
        pointer.moved = pointer.down;
        pointer.dx = (touches[i].pageX - pointer.x) * 10.0;
        pointer.dy = (touches[i].pageY - pointer.y) * 10.0;
        pointer.x = touches[i].pageX;
        pointer.y = touches[i].pageY;
      }
    };
    
    const handleCanvasTouchStart = (e) => {
      e.preventDefault();
      const touches = e.targetTouches;
      
      for (let i = 0; i < touches.length; i++) {
        if (i >= pointers.length) {
          pointers.push(new Pointer());
        }
        
        pointers[i].id = touches[i].identifier;
        pointers[i].down = true;
        pointers[i].x = touches[i].pageX;
        pointers[i].y = touches[i].pageY;
        pointers[i].color = [Math.random() + 0.2, Math.random() + 0.2, Math.random() + 0.2];
      }
    };
    
    const handleCanvasTouchEnd = (e) => {
      const touches = e.changedTouches;
      
      for (let i = 0; i < touches.length; i++) {
        for (let j = 0; j < pointers.length; j++) {
          if (touches[i].identifier === pointers[j].id) {
            pointers[j].down = false;
          }
        }
      }
    };
    
    // Add event listeners
    canvas.addEventListener('mousemove', handleCanvasMouseMove);
    canvas.addEventListener('mousedown', handleCanvasMouseDown);
    window.addEventListener('mouseup', handleWindowMouseUp);
    canvas.addEventListener('touchmove', handleCanvasTouchMove, { passive: false });
    canvas.addEventListener('touchstart', handleCanvasTouchStart, { passive: false });
    canvas.addEventListener('touchend', handleCanvasTouchEnd);
    
    // Cleanup
    return () => {
      canvas.removeEventListener('mousemove', handleCanvasMouseMove);
      canvas.removeEventListener('mousedown', handleCanvasMouseDown);
      window.removeEventListener('mouseup', handleWindowMouseUp);
      canvas.removeEventListener('touchmove', handleCanvasTouchMove);
      canvas.removeEventListener('touchstart', handleCanvasTouchStart);
      canvas.removeEventListener('touchend', handleCanvasTouchEnd);
    };
  }, []);
  
  return (
    <canvas
      ref={canvasRef}
      style={{
        width: '100%',
        height: '100%',
        position: 'absolute',
        top: 0,
        left: 0,
        zIndex: 0
      }}
    />
  );
};

export default FluidSimulation; 