import React, { useEffect, useRef, useState } from 'react';
import './index.css';

const App = () => {
  const canvasRef = useRef(null);
  
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const toggleMenu = () => setIsMobileMenuOpen(!isMobileMenuOpen);

  useEffect(() => {
    const reveals = document.querySelectorAll(".reveal, .reveal-left, .reveal-right");
    const revealOptions = { threshold: 0.15, rootMargin: "0px 0px -50px 0px" };

    const revealOnScroll = new IntersectionObserver(function(entries, observer) {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("active");
        observer.unobserve(entry.target); 
      });
    }, revealOptions);

    reveals.forEach(reveal => revealOnScroll.observe(reveal));
    return () => reveals.forEach(reveal => revealOnScroll.unobserve(reveal));
  }, []);

  const [cocardPos, setCocardPos] = useState({ x: 0, y: 0, rotate: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const startPos = useRef({ x: 0, y: 0 });

  const handleMouseDown = (e) => {
    setIsDragging(true);
    startPos.current = { x: e.clientX - cocardPos.x, y: e.clientY - cocardPos.y };
  };

  const handleTouchStart = (e) => {
    setIsDragging(true);
    startPos.current = { x: e.touches[0].clientX - cocardPos.x, y: e.touches[0].clientY - cocardPos.y };
  };

  useEffect(() => {
    const handleMove = (clientX, clientY) => {
      if (!isDragging) return;
      const x = clientX - startPos.current.x;
      const y = clientY - startPos.current.y;
      const clampedY = Math.max(-60, y); 
      const rotate = x * 0.05; 
      setCocardPos({ x, y: clampedY, rotate });
    };

    const handleMouseMove = (e) => handleMove(e.clientX, e.clientY);
    const handleTouchMove = (e) => {
      if (!isDragging) return;
      e.preventDefault(); 
      handleMove(e.touches[0].clientX, e.touches[0].clientY);
    };

    const handleEnd = () => {
      if (isDragging) {
        setIsDragging(false);
        setCocardPos({ x: 0, y: 0, rotate: 0 });
      }
    };

    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleEnd);
      window.addEventListener('touchmove', handleTouchMove, { passive: false });
      window.addEventListener('touchend', handleEnd);
    }
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleEnd);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', handleEnd);
    };
  }, [isDragging]);

  const orgSlides = [
    { id: 1, img: '/css.jpeg', title: 'Rapat Kerja Tahunan', desc: 'Merumuskan dan mendiskusikan program kerja BP2M Unnes.' },
    { id: 2, img: '/interface.jpeg', title: 'Pelatihan Jurnalistik', desc: 'Meningkatkan keterampilan peliputan dan penulisan media.' },
    { id: 3, img: '/studibanding.jpeg', title: 'Liputan Lapangan', desc: 'Melakukan reportase acara dan dinamika kampus secara langsung.' },
    { id: 4, img: '/hima.jpeg', title: 'Malam Keakraban', desc: 'Membangun solidaritas dan koneksi antar anggota organisasi.' }
  ];

  const [currentSlide, setCurrentSlide] = useState(0);
  const nextSlide = () => setCurrentSlide((prev) => (prev === orgSlides.length - 1 ? 0 : prev + 1));
  const prevSlide = () => setCurrentSlide((prev) => (prev === 0 ? orgSlides.length - 1 : prev - 1));

  useEffect(() => {
    const slideInterval = setInterval(nextSlide, 4000);
    return () => clearInterval(slideInterval);
  }, []);

  // --- LOGIKA MESH GRADIENT AURORA MENGKILAU & JELAS BERGERAK ---
  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    let animationFrameId;
    
    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', resize);
    resize();

    let mouse = { x: window.innerWidth / 2, y: window.innerHeight / 2 };
    
    // Trail kursor
    let trailPoints = [
      { x: window.innerWidth / 2, y: window.innerHeight / 2, lerp: 0.1, r: 250 },
      { x: window.innerWidth / 2, y: window.innerHeight / 2, lerp: 0.05, r: 150 }
    ];

    let time = 0;

    const handleMouseMove = (e) => { 
      mouse.x = e.clientX; 
      mouse.y = e.clientY; 
    };
    window.addEventListener('mousemove', handleMouseMove);

    const animate = () => {
      // Kelajuan ditingkatkan agar pergerakan sangat jelas terlihat
      time += 0.0035; 
      animationFrameId = requestAnimationFrame(animate);
      
      const w = canvas.width;
      const h = canvas.height;

      // 1. Dasar Hitam Pekat
      ctx.globalCompositeOperation = 'source-over';
      ctx.fillStyle = '#050505'; 
      ctx.fillRect(0, 0, w, h);

      // Gunakan mode 'screen' supaya warna lebih menyala dan terang
      ctx.globalCompositeOperation = 'screen'; 

      const maxDim = Math.max(w, h);

      // 2. Aurora Mencolok dengan Pergerakan Luas
      const orbs = [
        // Oren Terang (Bergerak dari kiri ke kanan)
        { 
          x: w * 0.4 + Math.sin(time * 0.8) * (w * 0.4), 
          y: h * 0.6 + Math.cos(time * 0.6) * (h * 0.3), 
          r: maxDim * 0.5, 
          color: 'rgba(255, 87, 34, 0.45)' // Opasiti tinggi
        },
        // Ungu Neon (Bergerak berlawanan arah)
        { 
          x: w * 0.6 + Math.cos(time * 0.7) * (w * 0.4), 
          y: h * 0.4 + Math.sin(time * 0.9) * (h * 0.3), 
          r: maxDim * 0.55, 
          color: 'rgba(160, 32, 240, 0.4)' 
        },
        // Merah Jambu Menyala (Melayang & berputar di kawasan tengah)
        { 
          x: w * 0.5 + Math.sin(time * 1.1) * (w * 0.3), 
          y: h * 0.5 + Math.cos(time * 1.2) * (h * 0.3), 
          r: maxDim * 0.45, 
          color: 'rgba(255, 64, 129, 0.35)' 
        }
      ];

      orbs.forEach(orb => {
        const bgGradient = ctx.createRadialGradient(orb.x, orb.y, 0, orb.x, orb.y, orb.r);
        bgGradient.addColorStop(0, orb.color);
        bgGradient.addColorStop(1, 'rgba(5, 5, 5, 0)'); 

        ctx.fillStyle = bgGradient;
        ctx.beginPath();
        ctx.arc(orb.x, orb.y, orb.r, 0, Math.PI * 2);
        ctx.fill();
      });

      // 3. Mouse Trail (Sedikit lebih terang)
      trailPoints.forEach((p, index) => {
        let targetX = index === 0 ? mouse.x : trailPoints[index - 1].x;
        let targetY = index === 0 ? mouse.y : trailPoints[index - 1].y;

        p.x += (targetX - p.x) * p.lerp;
        p.y += (targetY - p.y) * p.lerp;

        const trailGradient = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.r);
        const opacity = 0.15 - (index * 0.05); 
        
        trailGradient.addColorStop(0, `rgba(255, 138, 101, ${opacity})`); 
        trailGradient.addColorStop(1, 'rgba(5, 5, 5, 0)');     

        ctx.fillStyle = trailGradient;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fill();
      });

      ctx.globalCompositeOperation = 'source-over';
    };

    animate();
    
    return () => { 
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('resize', resize);
      cancelAnimationFrame(animationFrameId); 
    };
  }, []);

  return (
    <>
      <canvas ref={canvasRef} id="bg-canvas"></canvas>
      
      <nav className="navbar navbar-expand-lg navbar-dark fixed-top glass-nav py-3">
        <div className="container">
          <a className="navbar-brand fw-bold fs-4" href="#">Portogue<span style={{color: '#FF5722'}}>.</span></a>
          
          <button 
            className="navbar-toggler" 
            type="button" 
            onClick={toggleMenu}
            aria-expanded={isMobileMenuOpen}
            aria-label="Toggle navigation"
          >
            <span className="navbar-toggler-icon"></span>
          </button>

          <div className={`collapse navbar-collapse d-lg-flex ${isMobileMenuOpen ? 'show' : ''}`}>
            
            <ul className="navbar-nav ms-auto mb-auto mb-lg-0 gap-3 gap-lg-4 mt-4 mt-lg-0">
              <li className="nav-item"><a className="nav-link text-light opacity-75" href="#home" onClick={() => setIsMobileMenuOpen(false)}>Beranda</a></li>
              <li className="nav-item"><a className="nav-link text-light opacity-75" href="#skills" onClick={() => setIsMobileMenuOpen(false)}>Keahlian</a></li>
              <li className="nav-item"><a className="nav-link text-light opacity-75" href="#projects" onClick={() => setIsMobileMenuOpen(false)}>Karya</a></li>
              <li className="nav-item"><a className="nav-link text-light opacity-75" href="#experience" onClick={() => setIsMobileMenuOpen(false)}>Pengalaman</a></li>
            </ul>

            <div className="mobile-contact-container d-lg-none mt-auto pt-4 pb-3 w-100 text-center">
              <p className="opacity-75 small mb-3 fw-bold letter-spacing-1">HUBUNGI SAYA</p>
              <div className="d-flex justify-content-center gap-4">
                <a href="https://www.instagram.com/herdirzky" target="_blank" rel="noreferrer" className="mobile-social-icon"><i className="fab fa-instagram"></i></a>
                <a href="https://www.linkedin.com/in/herdi-rizky" target="_blank" rel="noreferrer" className="mobile-social-icon"><i className="fab fa-linkedin-in"></i></a>
                <a href="https://github.com/IkiBOYY21" target="_blank" rel="noreferrer" className="mobile-social-icon"><i className="fab fa-github"></i></a>
                <a href="https://wa.me/6281284180949" target="_blank" rel="noreferrer" className="mobile-social-icon"><i className="fab fa-whatsapp"></i></a>
              </div>
            </div>

          </div>
        </div>
      </nav>

      <section id="home" className="hero-section container">
        <div className="row align-items-center justify-content-between flex-column-reverse flex-lg-row w-100 mx-0">
          
          <div className="col-12 col-lg-7 mb-5 mb-lg-0 z-3 text-center text-lg-start d-flex flex-column align-items-center align-items-lg-start reveal-left pe-lg-4">
            <div className="d-inline-block rounded-pill px-4 py-2 mb-4" style={{border: '1px solid rgba(255,255,255,0.1)', backgroundColor: 'rgba(255,255,255,0.03)'}}>
              <span className="text-light opacity-75 small"><i className="fas fa-map-marker-alt me-2" style={{color: '#FF5722'}}></i>Universitas Negeri Semarang '24</span>
            </div>
            
            <h1 className="hero-title fw-bold mb-4 text-white">
              Merancang Antarmuka yang Hidup, <br className="d-none d-md-block" /> Membangun Web yang <span style={{color: '#FF5722'}}>Tangguh.</span>
            </h1>
            
            <p className="text-light opacity-75 mb-5 fs-5" style={{maxWidth: '650px', lineHeight: '1.8'}}>
              Halo, saya <strong>Herdi Rizky</strong>. Mahasiswa Sistem Informasi di UNNES sekaligus penggiat UI/UX Design dan Web Development yang berfokus menciptakan pengalaman digital yang intuitif dan berdampak nyata.
            </p>
            
            <div className="d-flex flex-column flex-sm-row gap-3 mt-2 justify-content-center justify-content-lg-start">
              <a href="#projects" className="btn px-4 py-3 rounded-pill fw-bold btn-primary-glow">Lihat Proyek</a>
              <a href="#contact" className="btn px-4 py-3 rounded-pill fw-bold btn-outline-glow">Mari Berkolaborasi</a>
            </div>
          </div>
          
          <div className="col-12 col-lg-4 position-relative z-1 mb-5 mb-lg-0 d-flex justify-content-center justify-content-lg-end">
            <div className="cocard-container w-100">
              
              <svg style={{ position: 'absolute', top: '0px', left: '50%', transform: 'translateX(-50%)', width: '200px', height: '100%', overflow: 'visible', zIndex: 1, pointerEvents: 'none' }}>
                <g transform="translate(100, 0)">
                  <defs>
                     <pattern id="lanyard-pattern" width="40" height="40" patternUnits="userSpaceOnUse" patternTransform="rotate(15)">
                         <rect width="40" height="40" fill="#111" />
                         <path d="M 0 10 Q 10 20 20 10 T 40 10" stroke="#FF5722" strokeWidth="6" fill="none" />
                         <path d="M 0 30 Q 10 40 20 30 T 40 30" stroke="#FF8A65" strokeWidth="2" fill="none" />
                     </pattern>
                     <radialGradient id="rivet-grad" cx="30%" cy="30%">
                         <stop offset="0%" stopColor="#888" />
                         <stop offset="100%" stopColor="#111" />
                     </radialGradient>
                  </defs>
                  
                  <path d={`M 0 -1500 Q ${cocardPos.x * 0.4} ${cocardPos.y - 400} ${cocardPos.x} ${cocardPos.y + 80}`} stroke="url(#lanyard-pattern)" strokeWidth="35" fill="none" strokeLinecap="square" />
                  <circle cx={cocardPos.x} cy={cocardPos.y + 55} r="6" fill="url(#rivet-grad)" stroke="#000" strokeWidth="1" />
                </g>
              </svg>

              <div 
                className={`cocard-wrapper ${isDragging ? 'dragging' : 'snap-back'}`}
                onMouseDown={handleMouseDown} onTouchStart={handleTouchStart}
                style={{ transform: `translate(${cocardPos.x}px, ${cocardPos.y}px) rotate(${cocardPos.rotate}deg)` }}
              >
                <div className="cocard-d-ring"></div>
                <div className="cocard-swivel"></div>
                <div className="cocard-hook"></div>
                
                <div className="cocard-body">
                  <div className="cocard-header">Mahasiswa</div>
                  <img src="/profil-herdi.jpeg" alt="Foto Herdi" className="cocard-photo" />
                  <h3 className="cocard-name">Herdi Rizky G.</h3>
                  <p className="cocard-role">S1 Sistem Informasi</p>
                  <div className="cocard-barcode"></div>
                </div>
              </div>

            </div>
          </div>

        </div>
      </section>

      <section id="skills" className="container pt-5 mt-5 z-1 position-relative">
        <p className="text-center mb-5 reveal section-subtitle">TEKNOLOGI & TOOLS</p>
        
        <div className="row align-items-start mx-auto g-5 mb-5" style={{ maxWidth: '1100px' }}>
          
          <div className="col-12 col-md-6 reveal-left delay-100">
            <h5 className="fw-bold mb-4 opacity-75 text-center text-md-start">Bahasa Pemrograman</h5>
            <div className="skills-wrapper">
              <span className="skill-pill">
                <img src="/java.webp" alt="JavaScript" className="skill-icon-img" /> JavaScript
              </span>
              <span className="skill-pill">
                <img src="/React.png" alt="React.js" className="skill-icon-img" /> React.js
              </span>
              <span className="skill-pill full-width">
                <img src="/php.png" alt="PHP & MySQL" className="skill-icon-img" /> PHP & MySQL
              </span>
              <span className="skill-pill">
                <img src="/css.png" alt="CSS" className="skill-icon-img" /> CSS
              </span>
              <span className="skill-pill">
                <img src="/html.png" alt="HTML" className="skill-icon-img" /> HTML
              </span>
            </div>
          </div>

          <div className="col-12 col-md-6 reveal-right delay-200">
            <h5 className="fw-bold mb-4 opacity-75 text-center text-md-start">Tools & Aplikasi</h5>
            <div className="skills-wrapper">
              <span className="skill-pill">
                <img src="/canva-icon-logo.png" alt="Canva" className="skill-icon-img" /> Canva
              </span>
              <span className="skill-pill">
                <img src="/figma-sign-logo.png" alt="Figma" className="skill-icon-img" /> Figma
              </span>
              <span className="skill-pill full-width">
                <img src="/alightmotion.png" alt="Alight Motion" className="skill-icon-img" /> Alight Motion
              </span>
              <span className="skill-pill">
                <img src="/capcut.png" alt="CapCut" className="skill-icon-img" /> CapCut
              </span>
              <span className="skill-pill">
                <img src="/lr.png" alt="Lightroom" className="skill-icon-img" /> Lightroom
              </span>
            </div>
          </div>
          
        </div>

        <div className="row justify-content-center g-4 mt-2">
          <div className="col-12 col-lg-6 reveal-left delay-100">
            <div className="skill-list-card">
              <h4 className="fw-bold mb-4"><i className="fas fa-laptop-code me-3" style={{color: '#FF5722'}}></i> Kapabilitas Teknis</h4>
              <div className="skill-item">
                <div className="skill-icon-box"><i className="fas fa-layer-group"></i></div>
                <div><h6 className="fw-bold mb-1">UI/UX & Prototyping</h6><p className="opacity-75 small mb-0">Merancang wireframe, antarmuka responsif, dan alur pengguna.</p></div>
              </div>
              <div className="skill-item">
                <div className="skill-icon-box"><i className="fas fa-code"></i></div>
                <div><h6 className="fw-bold mb-1">Web Development</h6><p className="opacity-75 small mb-0">Pengembangan frontend dan integrasi backend database relasional.</p></div>
              </div>
              <div className="skill-item">
                <div className="skill-icon-box"><i className="fas fa-server"></i></div>
                <div><h6 className="fw-bold mb-1">Web Administration</h6><p className="opacity-75 small mb-0">Pengelolaan domain, cPanel, dan manajemen WordPress.</p></div>
              </div>
              <div className="skill-item">
                <div className="skill-icon-box"><i className="fas fa-network-wired"></i></div>
                <div><h6 className="fw-bold mb-1">Machine Learning Basic</h6><p className="opacity-75 small mb-0">Implementasi algoritma klasifikasi menggunakan Python.</p></div>
              </div>
            </div>
          </div>

          <div className="col-12 col-lg-6 reveal-right delay-200">
            <div className="skill-list-card">
              <h4 className="fw-bold mb-4"><i className="fas fa-user-tie me-3" style={{color: '#FF5722'}}></i> Kapabilitas Personal</h4>
              <div className="skill-item">
                <div className="skill-icon-box"><i className="fas fa-calendar-check"></i></div>
                <div><h6 className="fw-bold mb-1">Event Management</h6><p className="opacity-75 small mb-0">Mengoordinasikan agenda dan infrastruktur acara mahasiswa.</p></div>
              </div>
              <div className="skill-item">
                <div className="skill-icon-box"><i className="fas fa-puzzle-piece"></i></div>
                <div><h6 className="fw-bold mb-1">Problem Solving</h6><p className="opacity-75 small mb-0">Menganalisis dan memecahkan tantangan teknis (misal: CTF).</p></div>
              </div>
              <div className="skill-item">
                <div className="skill-icon-box"><i className="fas fa-comments"></i></div>
                <div><h6 className="fw-bold mb-1">Komunikasi & Tim</h6><p className="opacity-75 small mb-0">Koordinasi solid di akademik dan organisasi jurnalistik.</p></div>
              </div>
              <div className="skill-item">
                <div className="skill-icon-box"><i className="fas fa-lightbulb"></i></div>
                <div><h6 className="fw-bold mb-1">Berpikir Kreatif</h6><p className="opacity-75 small mb-0">Mengeksekusi desain grafis dan konten digital tepat sasaran.</p></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="projects" className="container py-5 my-5">
        <h2 className="display-5 fw-bold mb-5 text-center reveal">Proyek <span style={{color: '#FF5722'}}>Pilihan</span></h2>
        
        <div className="bento-grid">
          <div className="bento-item bento-large reveal delay-100">
            <img src="/proyek1.png" alt="Proyek 1" className="bento-img" onError={(e) => { e.target.style.display = 'none'; }} />
            <span className="bento-tag">UI/UX Design</span>
            <div className="bento-content mt-4">
              <h3 className="fw-bold fs-3 mb-3">Official Numanke Web</h3>
              <p className="opacity-75 mb-0 lh-lg">Perancangan antarmuka aplikasi berbasis AI untuk membantu perencanaan konten digital bisnis skala kecil. Fokus pada alur pengguna yang intuitif.</p>
            </div>
          </div>

          <div className="bento-item reveal delay-200">
            <img src="/proyek2.png" alt="Proyek 2" className="bento-img" onError={(e) => { e.target.style.display = 'none'; }} />
            <span className="bento-tag" style={{background: '#333', color: '#fff'}}>Web Dev</span>
            <div className="bento-content mt-4">
              <h4 className="fw-bold mb-2">Booking Mini Soccer</h4>
              <p className="opacity-75 mb-0">Platform pemesanan lapangan futsal dengan integrasi backend PHP dan sistem database relasional MySQL.</p>
            </div>
          </div>

          <div className="bento-item reveal delay-300">
            <img src="/proyek3.png" alt="Proyek 3" className="bento-img" onError={(e) => { e.target.style.display = 'none'; }} />
            <span className="bento-tag">Machine Learning</span>
            <div className="bento-content mt-4">
              <h4 className="fw-bold mb-2">Laba Pintar</h4>
              <p className="opacity-75 mb-0">Riset perbandingan performa algoritma Naive Bayes, Decision Tree, dan Random Forest menggunakan Python.</p>
            </div>
          </div>

          <div className="bento-item bento-wide reveal delay-100">
             <img src="/proyek4.png" alt="Proyek 4" className="bento-img" onError={(e) => { e.target.style.display = 'none'; }} />
             <span className="bento-tag" style={{background: '#333', color: '#fff'}}>Frontend</span>
             <div className="bento-content mt-4">
                <h4 className="fw-bold mb-2">Draft Pick - Mobile Legend</h4>
                <p className="opacity-75 mb-0">Pengembangan website portofolio interaktif dengan animasi HTML5 Canvas dan arsitektur komponen React yang responsif.</p>
             </div>
          </div>
        </div>
      </section>

      <section id="experience" className="container py-5 my-5">
        <div className="row justify-content-between g-5 align-items-start">
          
          <div className="col-12 col-lg-4 z-1 reveal-left">
            <h4 className="fw-bold mb-4 text-center text-lg-start" style={{color: '#FF5722'}}><i className="fas fa-award me-3"></i> Sertifikat</h4>
            <div className="d-flex flex-column gap-4">
              <a href="/FILE-SERTIFIKAT-CTF.pdf" target="_blank" rel="noreferrer" className="cert-card p-3 rounded-4 border-start border-4">
                <img src="/mvpcss.png" alt="Sertifikat CTF" className="cert-thumb" />
                <div>
                  <h6 className="fw-bold mb-1">MVP Panitia Perkap</h6>
                  <p className="opacity-75 small mb-0">Himpunan Program CSS 2025</p>
                </div>
              </a>
              <a href="/FILE-SERTIFIKAT-GEMASTIK.pdf" target="_blank" rel="noreferrer" className="cert-card p-3 rounded-4 border-start border-4">
                <img src="/dicoding.png" alt="Sertifikat GEMASTIK" className="cert-thumb" />
                <div>
                  <h6 className="fw-bold mb-1">Mulai Pemrograman Dengan C</h6>
                  <p className="opacity-75 small mb-0">Dicoding 2024 </p>
                </div>
              </a>
              <a href="/FILE-SERTIFIKAT-WEB.pdf" target="_blank" rel="noreferrer" className="cert-card p-3 rounded-4 border-start border-4">
                <img src="/netacad.png" alt="Sertifikat Web Dev" className="cert-thumb" />
                <div>
                  <h6 className="fw-bold mb-1">Cyberecurity Essentials</h6>
                  <p className="opacity-75 small mb-0">Cisco Networking Academy 2026</p>
                </div>
              </a>
            </div>
          </div>

          <div className="col-12 col-lg-7 mt-5 mt-lg-0 z-1 reveal-right delay-200">
            <div className="d-flex justify-content-between align-items-end mb-4">
              <h4 className="fw-bold mb-0" style={{color: '#FF5722'}}><i className="fas fa-users me-3"></i> Organisasi</h4>
              <span className="badge glass text-light opacity-75 px-3 py-2">BP2M Unnes</span>
            </div>
            
            <div className="slider-container shadow-lg">
              <button className="slider-btn prev" onClick={prevSlide}><i className="fas fa-chevron-left"></i></button>
              <button className="slider-btn next" onClick={nextSlide}><i className="fas fa-chevron-right"></i></button>

              {orgSlides.map((slide, index) => (
                <div key={slide.id} className={`slide-item ${index === currentSlide ? 'active' : ''}`}>
                  <img src={slide.img} alt={slide.title} />
                  <div className="slide-overlay">
                    <h4 className="fw-bold mb-3">{slide.title}</h4>
                    <p className="mb-0 opacity-75 lh-lg">{slide.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section id="contact" className="container py-5 my-5 reveal">
        <div className="glass p-5 mx-auto rounded-5 border-0 shadow-lg col-lg-10 text-center">
          <h2 className="display-6 fw-bold mb-4">Mau mengenalku lebih dekat?</h2>
          <p className="opacity-75 mb-5 mx-auto fs-5 lh-lg" style={{maxWidth: '700px'}}>
            Saya selalu terbuka untuk mendiskusikan peluang kolaborasi, proyek pengembangan web, atau sekadar bertukar pikiran mengenai industri UI/UX.
          </p>
          <div className="d-flex justify-content-center gap-4 flex-wrap">
            <a href="https://www.instagram.com/herdirzky" target="_blank" rel="noreferrer" className="social-icon"><i className="fab fa-instagram"></i></a>
            <a href="https://www.linkedin.com/in/herdi-rizky" target="_blank" rel="noreferrer" className="social-icon"><i className="fab fa-linkedin-in"></i></a>
            <a href="https://github.com/IkiBOYY21" target="_blank" rel="noreferrer" className="social-icon"><i className="fab fa-github"></i></a>
            <a href="mailto:herdirizky84@gmail.com" className="social-icon"><i className="fas fa-envelope"></i></a>
            <a href="https://wa.me/6281284180949" target="_blank" rel="noreferrer" className="social-icon"><i className="fab fa-whatsapp"></i></a>
          </div>
        </div>
      </section>

      <footer className="text-center py-4 opacity-50 mt-5 reveal">
        <p className="mb-0 small letter-spacing-1">&copy; 2026 Herdi Rizky (Mahendra Arqudanta).</p>
      </footer>
    </>
  );
};

export default App;