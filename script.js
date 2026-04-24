// --- SLIDE MANAGER ---
let currentSlide = 0;
const slides = document.querySelectorAll(".slide");
let isAnimating = false;
let ramAnimationInterval;

document.addEventListener("DOMContentLoaded", () => {
    
    // Initial setup for perfect centering
    gsap.set(".hero-image-container", { xPercent: -50, yPercent: -50 });
    
    // Hide all models except motherboard initially
    gsap.set("#global-chipset", { opacity: 0, scale: 0.5, rotationY: 90, x: 200 });
    gsap.set("#global-gpu-slot", { opacity: 0, scale: 1.5, rotationX: -20, y: -200 });
    gsap.set("#global-ram", { opacity: 0, scale: 0.5, rotationY: -90, x: -200 });
    gsap.set("#global-cooling", { opacity: 0, scale: 0.5, rotationY: 90, x: 200 });
    gsap.set("#global-connectivity", { opacity: 0, scale: 0.5, rotationY: -90, x: -200 });
    gsap.set("#global-bios", { opacity: 0, scale: 0.5, rotationY: 90, x: 200 });
    gsap.set("#global-future", { opacity: 0, scale: 0.5, rotationY: -90, x: -200 });

    // Initial entrance animations for the first slide
    animateSlideIn(0);
    
    // Continuous floating animations (disabled for first 2 slides with interactive 3D models)
    // gsap.to("#global-model .hero-image", ...);
    // gsap.to("#global-chipset .hero-image", ...);
    gsap.to("#global-ram .hero-image", { y: -18, duration: 3.8, ease: "sine.inOut", yoyo: true, repeat: -1, delay: 0.4 });
    gsap.to("#global-cooling .hero-image", { y: -10, duration: 4, ease: "sine.inOut", yoyo: true, repeat: -1, delay: 0.3 });
    gsap.to("#global-connectivity .hero-image", { y: -12, duration: 4.2, ease: "sine.inOut", yoyo: true, repeat: -1, delay: 0.2 });
    gsap.to("#global-bios .hero-image", { y: -10, duration: 3.5, ease: "sine.inOut", yoyo: true, repeat: -1, delay: 0.5 });
    gsap.to("#global-future .future-shard", { y: -15, duration: 4.5, ease: "sine.inOut", yoyo: true, repeat: -1, delay: 0.6 });

    // Setup 3D Parallax hover effect
    setupParallax();
    
    // Init canvas background
    initDustParticles();
});

// --- KEYBOARD NAVIGATION (A / D Keys) ---
window.addEventListener("keydown", (e) => {
    if (isAnimating) return; 

    const key = e.key.toLowerCase();
    
    if (key === "d" || key === "arrowright") {
        if (currentSlide < slides.length - 1) {
            goToSlide(currentSlide + 1, "forward");
        }
    } else if (key === "a" || key === "arrowleft") {
        if (currentSlide > 0) {
            goToSlide(currentSlide - 1, "backward");
        }
    }
});

function goToSlide(nextIndex, direction) {
    if (isAnimating || nextIndex === currentSlide) return;
    isAnimating = true;

    // Stop RAM particles if leaving slide 4
    if (currentSlide === 3) {
        clearInterval(ramAnimationInterval);
        document.getElementById('ram-particles').innerHTML = '';
    }

    // Stop connectivity animation if leaving slide 6
    if (currentSlide === 5) {
        clearInterval(connAnimationInterval);
        document.getElementById('data-particles-container').innerHTML = '';
    }

    // Stop BIOS animation if leaving slide 7
    if (currentSlide === 6) {
        clearInterval(biosFlickerInterval);
    }

    // Stop Future animation if leaving slide 8
    if (currentSlide === 7) {
        clearInterval(futureParticleInterval);
        document.getElementById('future-particles').innerHTML = '';
    }

    const currentSlideEl = slides[currentSlide];
    const nextSlideEl = slides[nextIndex];

    // Advanced Text Exit Animation
    gsap.to(currentSlideEl.querySelectorAll(".left-column > *"), {
        opacity: 0,
        x: direction === "forward" ? -50 : 50,
        duration: 0.5,
        stagger: 0.05,
        ease: "power2.in",
        onComplete: () => {
            currentSlideEl.classList.remove("active");
            nextSlideEl.classList.add("active");
            animateSlideIn(nextIndex, direction);
            currentSlide = nextIndex;
            setTimeout(() => { isAnimating = false; }, 1200);
        }
    });

    // --- ADVANCED 3D GLOBAL MODEL TRANSITIONS ---
    const globalModel = document.getElementById("global-model");
    const globalChipset = document.getElementById("global-chipset");
    const globalGpuSlot = document.getElementById("global-gpu-slot");
    const globalRam = document.getElementById("global-ram");
    const globalCooling = document.getElementById("global-cooling");
    const globalConnectivity = document.getElementById("global-connectivity");
    const globalBios = document.getElementById("global-bios");
    const globalFuture = document.getElementById("global-future");

    // Hide everything that is NOT the next slide
    const models = [globalModel, globalChipset, globalGpuSlot, globalRam, globalCooling, globalConnectivity, globalBios, globalFuture];
    const nextModel = models[nextIndex];

    models.forEach((model, idx) => {
        if (idx !== nextIndex && model.style.opacity > 0) {
            // Animate out dynamically based on index
            gsap.to(model, {
                opacity: 0, 
                scale: direction === "forward" ? 2 : 0.2, 
                rotationY: direction === "forward" ? -45 : 45, 
                x: direction === "forward" ? -300 : 300, 
                duration: 1.2, pointerEvents: "none", ease: "power3.inOut"
            });
        }
    });

    // Animate IN the next model
    let fromProps = { opacity: 0, filter: "blur(20px)" };
    
    if (direction === "forward") {
        fromProps = { ...fromProps, scale: 0.2, rotationY: 180, x: 300 };
    } else {
        fromProps = { ...fromProps, scale: 2, rotationY: -180, x: -300 };
    }

    // Special cinematic entrance for GPU Slot (Slide 3)
    if (nextIndex === 2) {
        fromProps = { opacity: 0, filter: "blur(20px)", scale: 1.5, rotationX: -20, y: -200 };
        gsap.fromTo(nextModel, fromProps, {
            opacity: 1, scale: 1, rotationX: 0, rotationY: 0, x: 0, y: 0, filter: "blur(0px)", 
            duration: 1.8, pointerEvents: "auto", ease: "power4.out", delay: 0.3
        });
    } else {
        // Standard cinematic entrance
        gsap.fromTo(nextModel, fromProps, {
            opacity: 1, scale: 1, rotationY: 0, rotationX: 0, x: 0, y: 0, filter: "blur(0px)", 
            duration: 1.8, pointerEvents: "auto", ease: "power4.out", delay: 0.3
        });
    }
}

function animateSlideIn(index, direction = "forward") {
    const slideEl = slides[index];
    
    // --- ADVANCED TEXT ENTRANCE ---
    const textEls = slideEl.querySelectorAll(".left-column > *");
    if (textEls.length > 0) {
        gsap.fromTo(textEls, 
            { opacity: 0, x: direction === "forward" ? 50 : -50 }, 
            { opacity: 1, x: 0, duration: 1, stagger: 0.1, ease: "power3.out", delay: 0.2 }
        );
    }

    // Trigger light sweeps on entrance
    const models = ["#global-model", "#global-chipset", "#global-gpu-slot", "#global-ram", "#global-cooling", "#global-connectivity", "#global-bios", "#global-future"];
    const sweep = document.querySelector(`${models[index]} .light-sweep`);
    if (sweep) {
        gsap.fromTo(sweep, { left: "-150%" }, { left: "150%", duration: 2, ease: "power2.inOut", delay: 0.8 });
    }

    // Trigger GPU Connection Animation if Slide 3
    if (index === 2) {
        startGpuConnection();
    }

    // Trigger RAM Data Particles & Video replay if Slide 4
    if (index === 3) {
        const ramVideo = document.getElementById('ram-module');
        if (ramVideo && ramVideo.tagName.toLowerCase() === 'video') {
            ramVideo.currentTime = 0;
            ramVideo.play().catch(e => console.log('Video autoplay blocked', e));
        }
        startRamParticles();
    }

    // Trigger Cooling Installation if Slide 5
    if (index === 4) {
        startCoolingInstallation();
    }

    // Trigger Connectivity Animation if Slide 6
    if (index === 5) {
        startConnectivityAnimation();
    }

    // Trigger BIOS Animation if Slide 7
    if (index === 6) {
        startBiosAnimation();
    }

    // Trigger Future Animation if Slide 8
    if (index === 7) {
        startFutureAnimation();
    }
}

// --- GPU CONNECTION ANIMATION ---
function startGpuConnection() {
    const gpuCard = document.getElementById('gpu-card');
    const arrowPath = document.getElementById('arrow-path');
    const arrowHead = document.getElementById('arrow-head');
    const arrowText = document.getElementById('arrow-text');
    const arrowTarget = document.getElementById('arrow-target');

    // 1. Reset everything
    gsap.set([arrowPath, arrowHead, arrowText, arrowTarget], { opacity: 0 });
    gsap.set(gpuCard, { x: 250, y: -200, rotation: 0, opacity: 0, scale: 1.1, filter: "drop-shadow(0 0 30px rgba(0, 210, 255, 0.4)) contrast(1.8) brightness(0.85)" });

    // 2. Animate Target Circle pulsating
    gsap.to(arrowTarget, { opacity: 1, scale: 1.5, duration: 1, repeat: 3, yoyo: true, ease: "sine.inOut", delay: 0.5 });
    
    // 3. Arrow & text fades in to point at slot
    gsap.fromTo([arrowPath, arrowHead, arrowText], 
        { opacity: 0, x: 20 },
        { opacity: 1, x: 0, duration: 1, ease: "power2.out", delay: 0.8 }
    );

    // 4. Arrow path dash animation to draw attention
    gsap.to(arrowPath, { strokeDashoffset: -20, duration: 0.5, repeat: 4, ease: "linear", delay: 0.8 });

    // 5. Arrow fades out after showing location
    gsap.to([arrowPath, arrowHead, arrowText, arrowTarget], { opacity: 0, duration: 0.5, delay: 3.5 });

    // 6. GPU flies in and inserts exactly into the slot
    gsap.to(gpuCard, {
        x: -210, // Move left to align with PCIe slot
        y: 120,  // Move down so pins touch the slot
        rotation: -12, // Slight rotate to fit perfectly
        opacity: 1,
        scale: 0.85,
        duration: 2,
        ease: "power3.inOut",
        delay: 4,
        onComplete: () => {
            // "Click" flash effect upon insertion
            gsap.fromTo(gpuCard, 
                { filter: "drop-shadow(0 0 80px rgba(0, 210, 255, 1)) contrast(1.8) brightness(1.5)" },
                { filter: "drop-shadow(0 0 30px rgba(0, 210, 255, 0.5)) contrast(1.8) brightness(0.85)", duration: 1 }
            );
            // Subtle hover after inserting
            gsap.to(gpuCard, { y: "+=5", duration: 3, yoyo: true, repeat: -1, ease: "sine.inOut" });
        }
    });
}

// --- RAM DATA PARTICLES ANIMATION ---
function startRamParticles() {
    const container = document.getElementById('ram-particles');
    
    ramAnimationInterval = setInterval(() => {
        const particle = document.createElement('div');
        particle.classList.add('ram-data-particle');
        container.appendChild(particle);

        // Random start position around the center of the image container
        const startX = Math.random() * 200 + 150; // Random X around center
        const startY = Math.random() * 300 + 100; // Random Y along the sticks

        gsap.fromTo(particle, 
            { x: startX, y: startY, opacity: 0, scale: 0 },
            { 
                x: startX + (Math.random() > 0.5 ? 100 : -100), // flow outwards
                y: startY - 150, // flow upwards
                opacity: 1,
                scale: Math.random() * 1.5 + 0.5,
                duration: 1.5 + Math.random(),
                ease: "power1.out",
                onComplete: () => {
                    gsap.to(particle, { opacity: 0, duration: 0.5, onComplete: () => particle.remove() });
                }
            }
        );
    }, 300); // Reduced spawn rate for performance
}

// --- COOLING INSTALLATION ANIMATION ---
function startCoolingInstallation() {
    const cooler = document.getElementById('cooling-cooler');
    const airflowContainer = document.getElementById('airflow-waves');

    // Reset positions
    gsap.set(cooler, { y: -300, opacity: 0, scale: 1.2, rotationX: 10 });
    airflowContainer.innerHTML = '';

    // Animate cooler installation
    gsap.to(cooler, {
        y: 0,
        opacity: 1,
        scale: 1,
        rotationX: 0,
        duration: 1.8,
        ease: "power3.out",
        delay: 0.5,
        onComplete: () => {
            // Add subtle floating to cooler
            gsap.to(cooler, { y: -5, duration: 2, yoyo: true, repeat: -1, ease: "sine.inOut" });
            
            // Create airflow waves after installation
            for (let i = 0; i < 8; i++) {
                const wave = document.createElement('div');
                wave.classList.add('airflow-wave');
                airflowContainer.appendChild(wave);

                // Create blue-ish glowing dust/air particles
                gsap.set(wave, { 
                    x: Math.random() * 400 - 200, 
                    y: Math.random() * 200 + 100,
                    scale: Math.random() * 0.5 + 0.5,
                    opacity: 0,
                    background: "radial-gradient(circle, rgba(0,200,255,0.8) 0%, rgba(0,0,0,0) 70%)",
                    width: "10px", height: "10px", borderRadius: "50%",
                    boxShadow: "0 0 20px 5px rgba(0,200,255,0.5)",
                    position: "absolute",
                    left: "50%",
                    top: "50%"
                });
                
                gsap.to(wave, {
                    y: "-=200",
                    x: "+=" + (Math.random() * 100 - 50),
                    opacity: 0.6,
                    duration: 2 + Math.random() * 2,
                    ease: "power1.out",
                    delay: Math.random() * 2,
                    repeat: -1,
                    onRepeat: () => {
                        gsap.set(wave, { y: Math.random() * 200 + 100, x: Math.random() * 400 - 200 });
                    }
                });
            }
        }
    });
}

// --- CONNECTIVITY ANIMATION ---
let connAnimationInterval;

function startConnectivityAnimation() {
    const container = document.getElementById('data-particles-container');
    const icons = [
        { id: 'icon-wifi', x: 10, y: 15 },
        { id: 'icon-usb', x: 20, y: 75 },
        { id: 'icon-eth', x: 85, y: 40 }
    ];

    // Antigravity float for icons
    icons.forEach(iconData => {
        const el = document.getElementById(iconData.id);
        gsap.to(el, {
            y: "+=15",
            x: "+=5",
            rotation: "+=5",
            duration: 2 + Math.random(),
            yoyo: true,
            repeat: -1,
            ease: "sine.inOut"
        });
    });

    const portX = 30; // %
    const portY = 50; // %

    connAnimationInterval = setInterval(() => {
        // Create data packet
        const particle = document.createElement('div');
        particle.style.position = 'absolute';
        particle.style.width = '4px';
        particle.style.height = '4px';
        particle.style.background = '#ffffff';
        particle.style.borderRadius = '50%';
        particle.style.boxShadow = '0 0 15px 3px #00d2ff';
        particle.style.zIndex = '6';
        container.appendChild(particle);

        // Pick random target
        const target = icons[Math.floor(Math.random() * icons.length)];

        gsap.fromTo(particle, 
            { left: `${portX}%`, top: `${portY}%`, opacity: 0, scale: 0 },
            { 
                left: `${target.x + 2}%`, // Aim near center of icon wrapper
                top: `${target.y + 2}%`, 
                opacity: 1,
                scale: 1.5,
                duration: 1.5 + Math.random() * 0.5,
                ease: "power2.inOut",
                onComplete: () => {
                    // Small burst on arrival
                    gsap.to(particle, { scale: 3, opacity: 0, duration: 0.3, onComplete: () => particle.remove() });
                }
            }
        );
    }, 400); // Reduced spawn rate for performance
}

// --- BIOS ANIMATION ---
let biosFlickerInterval;

function startBiosAnimation() {
    const panels = document.querySelectorAll('.hologram-panel');
    const cpuVal = document.getElementById('holo-cpu');
    const ramVal = document.getElementById('holo-ram');
    const tempVal = document.getElementById('holo-temp-val');
    
    // Animate panels in
    gsap.fromTo(panels, 
        { opacity: 0, scale: 0.8, y: 50, rotationX: -10 },
        { opacity: 1, scale: 1, y: 0, rotationX: 0, duration: 1.5, stagger: 0.2, ease: "power3.out", delay: 0.5 }
    );

    // Antigravity float
    panels.forEach((panel, i) => {
        gsap.to(panel, {
            y: "+=10",
            rotationY: i % 2 === 0 ? 3 : -3,
            duration: 2.5 + Math.random(),
            yoyo: true,
            repeat: -1,
            ease: "sine.inOut"
        });
    });

    // Animate lines
    gsap.fromTo(".holo-line", 
        { opacity: 0 }, 
        { opacity: 1, duration: 1, delay: 1 }
    );

    // Data flicker effect
    biosFlickerInterval = setInterval(() => {
        if(Math.random() > 0.5) {
            cpuVal.innerText = Math.floor(Math.random() * 15 + 35); // 35-50%
        }
        if(Math.random() > 0.7) {
            ramVal.innerText = Math.floor(Math.random() * 4 + 14); // 14-18GB
        }
        if(Math.random() > 0.8) {
            tempVal.innerText = Math.floor(Math.random() * 5 + 35); // 35-40C
        }
    }, 200);
}

// --- FUTURE ANIMATION ---
let futureParticleInterval;

function startFutureAnimation() {
    const shards = document.querySelectorAll('.future-shard');
    const core = document.getElementById('future-core');
    const particleContainer = document.getElementById('future-particles');
    const quantumImg = document.getElementById('future-quantum');
    
    // Reset shards
    gsap.set(shards, { x: 0, y: 0, rotationX: 0, rotationY: 0, rotationZ: 0, opacity: 1, filter: "brightness(1) blur(0px)" });
    gsap.set(core, { scale: 0, opacity: 0 });
    gsap.set(quantumImg, { scale: 0.2, opacity: 0, rotationY: -90 });
    particleContainer.innerHTML = '';

    // Break apart animation
    shards.forEach((shard, i) => {
        const dirX = i === 0 || i === 2 ? -1 : 1;
        const dirY = i === 0 || i === 1 ? -1 : 1;
        
        gsap.to(shard, {
            x: dirX * (50 + Math.random() * 50),
            y: dirY * (50 + Math.random() * 50),
            rotationZ: dirX * dirY * (5 + Math.random() * 10),
            rotationY: dirX * 15,
            rotationX: dirY * 15,
            opacity: 0.3,
            filter: "brightness(2) blur(3px)",
            duration: 4,
            ease: "power2.inOut",
            delay: 1
        });
        
        // Float continuously after breaking
        gsap.to(shard, {
            y: `+=${dirY * 15}`,
            x: `+=${dirX * 5}`,
            rotationZ: `+=${dirX * 2}`,
            duration: 3 + Math.random(),
            yoyo: true,
            repeat: -1,
            ease: "sine.inOut",
            delay: 5
        });
    });

    // Core forms and glows
    gsap.to(core, {
        scale: 1,
        opacity: 1,
        duration: 3,
        ease: "power2.inOut",
        delay: 2.5,
        onComplete: () => {
            gsap.to(core, { scale: 1.2, opacity: 0.8, duration: 2, yoyo: true, repeat: -1, ease: "sine.inOut" });
        }
    });

    // Quantum motherboard emerges
    gsap.to(quantumImg, {
        scale: 1,
        opacity: 1,
        rotationY: 0,
        duration: 4,
        ease: "power3.out",
        delay: 3.5, // Appears right as core peaks
        onComplete: () => {
            // Give it a subtle continuous float
            gsap.to(quantumImg, { y: -15, duration: 4, yoyo: true, repeat: -1, ease: "sine.inOut" });
        }
    });

    // Rising light particles
    futureParticleInterval = setInterval(() => {
        const particle = document.createElement('div');
        particle.classList.add('future-light-particle');
        
        const startX = 50 + (Math.random() * 40 - 20); 
        const startY = 60 + Math.random() * 20;
        
        gsap.set(particle, { left: `${startX}%`, top: `${startY}%` });
        particleContainer.appendChild(particle);

        gsap.to(particle, {
            top: "-=30%",
            x: (Math.random() * 100 - 50),
            opacity: Math.random() * 0.8 + 0.2,
            scale: Math.random() * 2 + 0.5,
            duration: 3 + Math.random() * 2,
            ease: "power1.out",
            onComplete: () => {
                gsap.to(particle, { opacity: 0, duration: 0.5, onComplete: () => particle.remove() });
            }
        });
    }, 150);
}

// --- 3D PARALLAX HOVER EFFECT ---
function setupParallax() {
    window.addEventListener("mousemove", (e) => {
        if (currentSlide === 0 || currentSlide === 1) return; // Do not apply GSAP parallax to interactive model-viewer
        const xAxis = (window.innerWidth / 2 - e.pageX) / 40; 
        const yAxis = (window.innerHeight / 2 - e.pageY) / 40;

        const models = ["#global-model", "#global-chipset", "#global-gpu-slot", "#global-ram", "#global-cooling", "#global-connectivity", "#global-bios", "#global-future"];
        gsap.to(models[currentSlide], { rotationY: xAxis, rotationX: -yAxis, duration: 0.5, ease: "power1.out", transformPerspective: 1000 });
    });

    window.addEventListener("mouseleave", () => {
        if (currentSlide === 0 || currentSlide === 1) return;
        const models = ["#global-model", "#global-chipset", "#global-gpu-slot", "#global-ram", "#global-cooling", "#global-connectivity", "#global-bios", "#global-future"];
        gsap.to(models[currentSlide], { rotationY: 0, rotationX: 0, duration: 1, ease: "power2.out" });
    });
}

// --- CANVAS DUST PARTICLES ---
function initDustParticles() {
    const canvas = document.getElementById("dustCanvas");
    const ctx = canvas.getContext("2d");
    
    let width, height;
    let particles = [];
    
    function resize() {
        width = window.innerWidth;
        height = window.innerHeight;
        canvas.width = width;
        canvas.height = height;
    }
    
    window.addEventListener("resize", resize);
    resize();
    
    const isMobile = window.innerWidth <= 768;
    const particleCount = isMobile 
        ? Math.floor((width * height) / 80000)  // Fewer particles on mobile
        : Math.floor((width * height) / 35000);
    
    for (let i = 0; i < particleCount; i++) {
        particles.push({
            x: Math.random() * width,
            y: Math.random() * height,
            radius: Math.random() * 1.5,
            vx: (Math.random() - 0.5) * 0.2,
            vy: (Math.random() - 0.5) * 0.2,
            alpha: Math.random() * 0.5 + 0.1
        });
    }
    
    function animate() {
        ctx.clearRect(0, 0, width, height);
        
        particles.forEach(p => {
            p.x += p.vx;
            p.y += p.vy;
            
            if (p.x < 0) p.x = width;
            if (p.x > width) p.x = 0;
            if (p.y < 0) p.y = height;
            if (p.y > height) p.y = 0;
            
            if (Math.random() > 0.99) {
                p.alpha = Math.random() * 0.5 + 0.1;
            }
            
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(255, 255, 255, ${p.alpha})`;
            ctx.fill();
        });
        
        requestAnimationFrame(animate);
    }
    
    animate();
}

// ============================================================
//  MOBILE TOUCH SWIPE NAVIGATION
// ============================================================
(function initMobileSwipe() {
    let touchStartX = 0;
    let touchStartY = 0;
    let touchEndX = 0;
    let touchEndY = 0;
    const SWIPE_THRESHOLD = 50; // Minimum swipe distance in px

    document.addEventListener("touchstart", (e) => {
        touchStartX = e.changedTouches[0].screenX;
        touchStartY = e.changedTouches[0].screenY;
    }, { passive: true });

    document.addEventListener("touchend", (e) => {
        touchEndX = e.changedTouches[0].screenX;
        touchEndY = e.changedTouches[0].screenY;
        handleSwipe();
    }, { passive: true });

    function handleSwipe() {
        if (isAnimating) return;

        const diffX = touchStartX - touchEndX;
        const diffY = touchStartY - touchEndY;

        // Only trigger if horizontal swipe is dominant
        if (Math.abs(diffX) < SWIPE_THRESHOLD) return;
        if (Math.abs(diffX) < Math.abs(diffY)) return;

        if (diffX > 0) {
            // Swiped LEFT → next slide
            if (currentSlide < slides.length - 1) {
                goToSlide(currentSlide + 1, "forward");
            }
        } else {
            // Swiped RIGHT → previous slide
            if (currentSlide > 0) {
                goToSlide(currentSlide - 1, "backward");
            }
        }
    }
})();

// ============================================================
//  MOBILE PROGRESS DOTS
// ============================================================
(function initProgressDots() {
    // Create progress dots container
    const dotsContainer = document.createElement("div");
    dotsContainer.classList.add("slide-progress");
    dotsContainer.id = "slide-progress";

    for (let i = 0; i < slides.length; i++) {
        const dot = document.createElement("div");
        dot.classList.add("dot");
        if (i === 0) dot.classList.add("active");
        dot.dataset.index = i;
        dotsContainer.appendChild(dot);
    }

    document.body.appendChild(dotsContainer);

    // Update dots when slide changes — hook into goToSlide
    const originalGoToSlide = window.goToSlide || goToSlide;
    
    // We observe slide changes via a MutationObserver on the slide classes
    const observer = new MutationObserver(() => {
        const allDots = dotsContainer.querySelectorAll(".dot");
        allDots.forEach((d, i) => {
            d.classList.toggle("active", i === currentSlide);
        });
    });

    slides.forEach(slide => {
        observer.observe(slide, { attributes: true, attributeFilter: ["class"] });
    });
})();
