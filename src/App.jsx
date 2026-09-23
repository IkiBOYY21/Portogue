import React, { useEffect, useRef, useState } from 'react';
import './index.css';

const App = () => {
  const canvasRef = useRef(null);

  // --- LOGIKA DRAG CO-CARD ---
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
    const handleTouchMove = (e) => handleMove(e.touches[0].clientX, e.touches[0].clientY);

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

  // --- LOGIKA SLIDER ORGANISASI ---
  const orgSlides = [
    { id: 1, img: '/GAMBAR-KEGIATAN-1.jpg', title: 'Rapat Kerja Tahunan', desc: 'Merumuskan dan mendiskusikan program kerja BP2M Unnes.' },
    { id: 2, img: '/GAMBAR-KEGIATAN-2.jpg', title: 'Pelatihan Jurnalistik', desc: 'Meningkatkan keterampilan peliputan dan penulisan media.' },
    { id: 3, img: '/GAMBAR-KEGIATAN-3.jpg', title: 'Liputan Lapangan', desc: 'Melakukan reportase acara dan dinamika kampus secara langsung.' },
    { id: 4, img: '/GAMBAR-KEGIATAN-4.jpg', title: 'Malam Keakraban', desc: 'Membangun solidaritas dan koneksi antar anggota organisasi.' }
  ];

  const [currentSlide, setCurrentSlide] = useState(0);
  const nextSlide = () => setCurrentSlide((prev) => (prev === orgSlides.length - 1 ? 0 : prev + 1));
  const prevSlide = () => setCurrentSlide((prev) => (prev === 0 ? orgSlides.length - 1 : prev - 1));

  useEffect(() => {
    const slideInterval = setInterval(nextSlide, 4000);
    return () => clearInterval(slideInterval);
  }, []);


  // --- LOGIKA BACKGROUND CANVAS ---
  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    let animationFrameId;
    let particlesArray = [];
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const handleResize = () => { canvas.width = window.innerWidth; canvas.height = window.innerHeight; init(); };
    window.addEventListener('resize', handleResize);

    class Particle {
      constructor(x, y, directionX, directionY, size) {
        this.x = x; this.y = y; this.directionX = directionX; this.directionY = directionY; this.size = size;
      }
      draw() {
        ctx.beginPath(); ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2, false); 
        ctx.fillStyle = '#00f2fe'; ctx.fill();
      }
      update() {
        if (this.x > canvas.width || this.x < 0) this.directionX = -this.directionX;
        if (this.y > canvas.height || this.y < 0) this.directionY = -this.directionY;
        this.x += this.directionX; this.y += this.directionY; this.draw();
      }
    }

    const init = () => {
      particlesArray = [];
      let numberOfParticles = (canvas.height * canvas.width) / 12000;
      for (let i = 0; i < numberOfParticles; i++) {
        let size = (Math.random() * 2) + 1;
        let x = Math.random() * ((window.innerWidth - size * 2) - (size * 2)) + size * 2;
        let y = Math.random() * ((window.innerHeight - size * 2) - (size * 2)) + size * 2;
        let directionX = (Math.random() * 1) - 0.5;
        let directionY = (Math.random() * 1) - 0.5;
        particlesArray.push(new Particle(x, y, directionX, directionY, size));
      }
    };

    const connect = () => {
      for (let a = 0; a < particlesArray.length; a++) {
        for (let b = a; b < particlesArray.length; b++) {
            let distance = ((particlesArray[a].x - particlesArray[b].x) * (particlesArray[a].x - particlesArray[b].x)) + ((particlesArray[a].y - particlesArray[b].y) * (particlesArray[a].y - particlesArray[b].y));
            if (distance < (canvas.width / 7) * (canvas.height / 7)) {
                let opacityValue = 1 - (distance / 20000);
                ctx.strokeStyle = `rgba(0, 242, 254, ${opacityValue - 0.5})`;
                ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(particlesArray[a].x, particlesArray[a].y); ctx.lineTo(particlesArray[b].x, particlesArray[b].y); ctx.stroke();
            }
        }
      }
    };

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      ctx.clearRect(0, 0, innerWidth, innerHeight);
      for (let i = 0; i < particlesArray.length; i++) { particlesArray[i].update(); }
      connect();
    };

    init(); animate();

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <>
      <canvas ref={canvasRef} id="bg-canvas"></canvas>
      
      <nav className="navbar navbar-expand-lg navbar-dark fixed-top glass-nav py-3">
        <div className="container">
          <a className="navbar-brand fw-bold fs-4" href="#">Portogue<span style={{color: '#00f2fe'}}>.</span></a>
          <div className="collapse navbar-collapse" id="navbarNav">
            <ul className="navbar-nav ms-auto gap-3">
              <li className="nav-item"><a className="nav-link" href="#home">Beranda</a></li>
              <li className="nav-item"><a className="nav-link" href="#skills">Keahlian</a></li>
              <li className="nav-item"><a className="nav-link" href="#projects">Karya</a></li>
              <li className="nav-item"><a className="nav-link" href="#experience">Pengalaman</a></li>
            </ul>
          </div>
        </div>
      </nav>

      {/* Hero Section - Updated Responsive Layout */}
      <section id="home" className="hero-section container">
        {/* flex-column-reverse makes the Cocard render on top of the text on mobile devices */}
        <div className="row align-items-center w-100 justify-content-between flex-column-reverse flex-lg-row">
          
          {/* Bagian Kiri (Teks) */}
          <div className="col-lg-6 mb-5 mb-lg-0 z-3 text-center text-lg-start mt-4 mt-lg-0">
            <div className="d-inline-block border border-info border-opacity-25 rounded-pill px-3 py-2 mb-4 glass mx-auto mx-lg-0">
              <span className="text-light opacity-75">📍 Universitas Negeri Semarang '24</span>
            </div>
            
            <h1 className="hero-title fw-bold mb-3">
              Kreativitas <br/> Bertemu dengan <br/>
              <span className="gradient-text">Logika.</span>
            </h1>
            
            <h4 className="text-light opacity-75 mb-4 fw-light lh-base mx-auto mx-lg-0" style={{maxWidth: '450px'}}>
              Halo, saya <strong>Herdi Rizky</strong>. Mahasiswa Sistem Informasi dan anggota BP2M Unnes yang fokus pada UI/UX Design dan Web Development.
            </h4>
            
            {/* Tombol responsif: Menumpuk vertikal di layar yang sangat kecil */}
            <div className="d-flex flex-column flex-sm-row justify-content-center justify-content-lg-start gap-3 mt-4">
              <a href="#projects" className="btn px-4 py-3 rounded-pill fw-bold shadow-sm" style={{backgroundColor: '#00f2fe', color: '#0f172a'}}>Lihat Proyek</a>
              <a href="#contact" className="btn btn-outline-light px-4 py-3 rounded-pill glass fw-bold">Mari Berkolaborasi</a>
            </div>
          </div>
          
          {/* Bagian Kanan - CO-CARD (Berada di atas saat mode HP) */}
          <div className="col-lg-5 position-relative z-1 mb-4 mb-lg-0">
            <div className="cocard-container">
              <svg style={{ position: 'absolute', top: '80px', left: '50%', transform: 'translateX(-50%)', width: '200px', height: '100%', overflow: 'visible', zIndex: 1, pointerEvents: 'none' }}>
                <g transform="translate(100, 0)">
                  <defs>
                     <pattern id="lanyard-pattern" width="40" height="40" patternUnits="userSpaceOnUse" patternTransform="rotate(15)">
                         <rect width="40" height="40" fill="#111827" />
                         <path d="M 0 10 Q 10 20 20 10 T 40 10" stroke="#047857" strokeWidth="6" fill="none" />
                         <path d="M 0 30 Q 10 40 20 30 T 40 30" stroke="#064e3b" strokeWidth="6" fill="none" />
                     </pattern>
                     <radialGradient id="rivet-grad" cx="30%" cy="30%">
                         <stop offset="0%" stopColor="#94a3b8" />
                         <stop offset="100%" stopColor="#334155" />
                     </radialGradient>
                  </defs>
                  
                  <path d={`M 0 -1500 Q ${cocardPos.x * 0.4} ${cocardPos.y - 400} ${cocardPos.x} ${cocardPos.y}`} stroke="url(#lanyard-pattern)" strokeWidth="38" fill="none" strokeLinecap="square" />
                  <circle cx={cocardPos.x} cy={cocardPos.y - 25} r="7" fill="url(#rivet-grad)" stroke="#020617" strokeWidth="1.5" />
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
                  <div className="cocard-header">Crew / Panitia</div>
                  <img src="/FOTO-PROFIL-ANDA.jpg" alt="Foto Herdi" className="cocard-photo" />
                  <h3 className="cocard-name">Herdi Rizky G.</h3>
                  <p className="cocard-role">UI/UX & Web Dev</p>
                  <div className="cocard-barcode"></div>
                </div>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* Tech Stack & Logos */}
      <section id="skills" className="container pt-5 mt-5 z-1 position-relative">
        <p className="text-center text-uppercase tracking-widest fw-bold mb-5" style={{color: '#4facfe'}}>Teknologi & Tools</p>
        
        <div className="row g-5 mb-5">
          <div className="col-md-6">
            <h4 className="text-center fw-bold mb-4" style={{color: '#cbd5e1'}}>Bahasa Pemrograman</h4>
            <div className="d-flex flex-wrap justify-content-center gap-2">
              <span className="skill-pill"><i className="fab fa-js skill-icon" style={{color: '#f7df1e'}}></i> JavaScript</span>
              <span className="skill-pill"><i className="fab fa-react skill-icon" style={{color: '#61dafb'}}></i> React.js</span>
              <span className="skill-pill"><i className="fab fa-php skill-icon" style={{color: '#777bb4'}}></i> PHP & MySQL</span>
              <span className="skill-pill"><i className="fab fa-css3-alt skill-icon" style={{color: '#1572b6'}}></i> CSS</span>
              <span className="skill-pill"><i className="fab fa-html5 skill-icon" style={{color: '#e34f26'}}></i> HTML</span>
            </div>
          </div>

          <div className="col-md-6">
            <h4 className="text-center fw-bold mb-4" style={{color: '#cbd5e1'}}>Tools & Aplikasi</h4>
            <div className="d-flex flex-wrap justify-content-center gap-2">
              <span className="skill-pill"><i className="fas fa-palette skill-icon" style={{color: '#00c4cc'}}></i> Canva</span>
              <span className="skill-pill"><i className="fab fa-figma skill-icon" style={{color: '#f24e1e'}}></i> Figma</span>
              <span className="skill-pill"><i className="fas fa-cut skill-icon" style={{color: '#f8fafc'}}></i> CapCut</span>
              <span className="skill-pill"><i className="fas fa-camera-retro skill-icon" style={{color: '#31a8ff'}}></i> Lightroom</span>
              <span className="skill-pill"><i className="fas fa-play-circle skill-icon" style={{color: '#00e5ff'}}></i> Alight Motion</span>
            </div>
          </div>
        </div>

        {/* Hard Skill & Soft Skill */}
        <div className="row g-4 mt-2">
          <div className="col-lg-6">
            <div className="skill-list-card">
              <h4 className="fw-bold mb-4"><i className="fas fa-laptop-code me-2" style={{color: '#00f2fe'}}></i> Kapabilitas Teknis</h4>
              <div className="skill-item">
                <div className="skill-icon-box"><i className="fas fa-layer-group"></i></div>
                <div><h6 className="fw-bold mb-1">UI/UX & Prototyping</h6><p className="text-light opacity-75 small mb-0">Merancang wireframe, antarmuka responsif, dan alur pengguna.</p></div>
              </div>
              <div className="skill-item">
                <div className="skill-icon-box"><i className="fas fa-code"></i></div>
                <div><h6 className="fw-bold mb-1">Web Development</h6><p className="text-light opacity-75 small mb-0">Pengembangan frontend dan integrasi backend database relasional.</p></div>
              </div>
              <div className="skill-item">
                <div className="skill-icon-box"><i className="fas fa-server"></i></div>
                <div><h6 className="fw-bold mb-1">Web Administration</h6><p className="text-light opacity-75 small mb-0">Pengelolaan domain, cPanel, dan manajemen WordPress.</p></div>
              </div>
              <div className="skill-item">
                <div className="skill-icon-box"><i className="fas fa-network-wired"></i></div>
                <div><h6 className="fw-bold mb-1">Machine Learning Basic</h6><p className="text-light opacity-75 small mb-0">Implementasi algoritma klasifikasi menggunakan Python.</p></div>
              </div>
            </div>
          </div>

          <div className="col-lg-6">
            <div className="skill-list-card">
              <h4 className="fw-bold mb-4"><i className="fas fa-user-tie me-2" style={{color: '#00f2fe'}}></i> Kapabilitas Personal</h4>
              <div className="skill-item">
                <div className="skill-icon-box"><i className="fas fa-calendar-check"></i></div>
                <div><h6 className="fw-bold mb-1">Event Management</h6><p className="text-light opacity-75 small mb-0">Mengoordinasikan agenda dan infrastruktur acara mahasiswa.</p></div>
              </div>
              <div className="skill-item">
                <div className="skill-icon-box"><i className="fas fa-puzzle-piece"></i></div>
                <div><h6 className="fw-bold mb-1">Problem Solving</h6><p className="text-light opacity-75 small mb-0">Menganalisis dan memecahkan tantangan teknis (misal: CTF).</p></div>
              </div>
              <div className="skill-item">
                <div className="skill-icon-box"><i className="fas fa-comments"></i></div>
                <div><h6 className="fw-bold mb-1">Komunikasi & Tim</h6><p className="text-light opacity-75 small mb-0">Koordinasi solid di akademik dan organisasi jurnalistik.</p></div>
              </div>
              <div className="skill-item">
                <div className="skill-icon-box"><i className="fas fa-lightbulb"></i></div>
                <div><h6 className="fw-bold mb-1">Berpikir Kreatif</h6><p className="text-light opacity-75 small mb-0">Mengeksekusi desain grafis dan konten digital tepat sasaran.</p></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Projects */}
      <section id="projects" className="container py-5 my-5">
        <h2 className="display-5 fw-bold mb-5 text-center">Proyek <span className="gradient-text">Pilihan</span></h2>
        
        <div className="bento-grid">
          
          <div className="bento-item bento-large">
            <img src="/GAMBAR-PROYEK-1-UMKM.jpg" alt="Proyek 1" className="bento-img" />
            <span className="bento-tag">UI/UX Design</span>
            <div className="bento-content mt-4">
              <h3 className="fw-bold display-6">UMKM Boost</h3>
              <p className="opacity-75 fs-5">Perancangan antarmuka aplikasi berbasis AI untuk membantu perencanaan konten digital bisnis skala kecil. Fokus pada alur pengguna yang intuitif.</p>
            </div>
          </div>

          <div className="bento-item">
            <img src="/GAMBAR-PROYEK-2-MINISOCCER.jpg" alt="Proyek 2" className="bento-img" />
            <span className="bento-tag" style={{background: '#38bdf8'}}>Web Dev</span>
            <div className="bento-content mt-4">
              <h4 className="fw-bold">Booking Mini Soccer</h4>
              <p className="opacity-75 mb-0">Platform pemesanan lapangan futsal dengan integrasi backend PHP dan sistem database relasional MySQL.</p>
            </div>
          </div>

          <div className="bento-item">
            <img src="/GAMBAR-PROYEK-3-MACHINELEARNING.jpg" alt="Proyek 3" className="bento-img" />
            <span className="bento-tag" style={{background: '#34d399'}}>Machine Learning</span>
            <div className="bento-content mt-4">
              <h4 className="fw-bold">Anemia Risk Classification</h4>
              <p className="opacity-75 mb-0">Riset perbandingan performa algoritma Naive Bayes, Decision Tree, dan Random Forest menggunakan Python.</p>
            </div>
          </div>

          <div className="bento-item bento-wide">
             <img src="/GAMBAR-PROYEK-4-PORTOGUE.jpg" alt="Proyek 4" className="bento-img" />
             <span className="bento-tag" style={{background: '#fbbf24'}}>Frontend</span>
             <div className="bento-content mt-4">
                <h4 className="fw-bold">Portogue - Personal Web</h4>
                <p className="opacity-75 mb-0">Pengembangan website portofolio interaktif dengan animasi HTML5 Canvas dan arsitektur komponen React yang responsif.</p>
             </div>
          </div>

        </div>
      </section>

      {/* SERTIFIKAT & KEGIATAN ORGANISASI */}
      <section id="experience" className="container py-5 my-5">
        <div className="row g-5 align-items-start">
          
          <div className="col-lg-4 z-1">
            <h3 className="fw-bold mb-4" style={{color: '#4facfe'}}><i className="fas fa-award me-2"></i> Sertifikat</h3>
            <div className="d-flex flex-column gap-3">
              
              <a href="/FILE-SERTIFIKAT-CTF.pdf" target="_blank" rel="noreferrer" className="cert-card glass p-3 rounded-4 border-start border-4">
                <img src="/THUMBNAIL-SERTIFIKAT-CTF.jpg" alt="Sertifikat CTF" className="cert-thumb" />
                <div>
                  <h6 className="fw-bold mb-1">Peserta CTF ILKOM</h6>
                  <p className="text-secondary small mb-0">Tahun 2026</p>
                </div>
              </a>

              <a href="/FILE-SERTIFIKAT-GEMASTIK.pdf" target="_blank" rel="noreferrer" className="cert-card glass p-3 rounded-4 border-start border-4">
                <img src="/THUMBNAIL-SERTIFIKAT-GEMASTIK.jpg" alt="Sertifikat GEMASTIK" className="cert-thumb" />
                <div>
                  <h6 className="fw-bold mb-1">Finalis UI/UX GEMASTIK</h6>
                  <p className="text-secondary small mb-0">Tahun 2025</p>
                </div>
              </a>

              <a href="/FILE-SERTIFIKAT-WEB.pdf" target="_blank" rel="noreferrer" className="cert-card glass p-3 rounded-4 border-start border-4">
                <img src="/THUMBNAIL-SERTIFIKAT-WEB.jpg" alt="Sertifikat Web Dev" className="cert-thumb" />
                <div>
                  <h6 className="fw-bold mb-1">Pemateri Web Dev</h6>
                  <p className="text-secondary small mb-0">Pokdarwis Desa Tluwuk, 2025</p>
                </div>
              </a>
            </div>
          </div>

          <div className="col-lg-8 z-1">
            <div className="d-flex justify-content-between align-items-end mb-4">
              <h3 className="fw-bold mb-0" style={{color: '#4facfe'}}><i className="fas fa-users me-2"></i> Organisasi</h3>
              <span className="badge glass text-light opacity-75">BP2M Unnes</span>
            </div>
            
            <div className="slider-container">
              <button className="slider-btn prev" onClick={prevSlide}><i className="fas fa-chevron-left"></i></button>
              <button className="slider-btn next" onClick={nextSlide}><i className="fas fa-chevron-right"></i></button>

              {orgSlides.map((slide, index) => (
                <div key={slide.id} className={`slide-item ${index === currentSlide ? 'active' : ''}`}>
                  <img src={slide.img} alt={slide.title} />
                  <div className="slide-overlay">
                    <h4 className="fw-bold mb-2">{slide.title}</h4>
                    <p className="mb-0 opacity-75">{slide.desc}</p>
                  </div>
                </div>
              ))}
            </div>

          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="container py-5 my-5">
        <div className="glass p-5 rounded-5 border-0 shadow-lg col-lg-10 mx-auto text-center" style={{background: 'linear-gradient(145deg, rgba(255,255,255,0.05) 0%, rgba(0,242,254,0.08) 100%)'}}>
          <h2 className="display-5 fw-bold mb-3">Punya Ide Proyek?</h2>
          <p className="lead opacity-75 mb-5 mx-auto" style={{maxWidth: '600px'}}>
            Saya selalu terbuka untuk mendiskusikan peluang kolaborasi, proyek pengembangan web, atau sekadar bertukar pikiran mengenai UI/UX.
          </p>
          <div className="d-flex justify-content-center gap-3 flex-wrap">
            <a href="https://www.instagram.com/herdirzky" target="_blank" rel="noreferrer" className="social-icon"><i className="fab fa-instagram"></i></a>
            <a href="https://www.linkedin.com/in/herdi-rizky" target="_blank" rel="noreferrer" className="social-icon"><i className="fab fa-linkedin-in"></i></a>
            <a href="https://github.com/IkiBOYY21" target="_blank" rel="noreferrer" className="social-icon"><i className="fab fa-github"></i></a>
            <a href="mailto:herdirizky84@gmail.com" className="social-icon"><i className="fas fa-envelope"></i></a>
            <a href="https://wa.me/6281284180949" target="_blank" rel="noreferrer" className="social-icon"><i className="fab fa-whatsapp"></i></a>
          </div>
        </div>
      </section>

      <footer className="text-center py-4 opacity-50 mt-5">
        <p className="mb-0">&copy; 2026 Herdi Rizky (Mahendra Arqudanta).</p>
      </footer>
    </>
  );
};

export default App;