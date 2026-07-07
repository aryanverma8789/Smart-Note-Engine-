/**
 * pages/LandingPage.jsx
 * ----------------------
 * 3D-styled, immersive landing page for the Smart Note Engine.
 *
 * Sections:
 *   1. Hero — Animated 3D floating brain with CTA buttons
 *   2. Features — What users get (3D card tilt effect)
 *   3. Advantages — Why choose this platform (animated stats)
 *   4. Policies — Privacy, Security, Terms (glassmorphism accordion)
 *   5. Footer — Quick links + copyright
 *
 * All buttons route to /register or /login via React Router.
 */

import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

// ── Animated 3D Floating Brain (CSS-driven) ─────────────────────────────────
function FloatingBrain() {
  return (
    <div className="hero-3d-scene">
      <div className="hero-3d-orbit">
        <div className="hero-3d-ring hero-3d-ring--1" />
        <div className="hero-3d-ring hero-3d-ring--2" />
        <div className="hero-3d-ring hero-3d-ring--3" />
        <div className="hero-3d-brain">🧠</div>
      </div>
      {/* Floating particles */}
      {Array.from({ length: 12 }).map((_, i) => (
        <div
          key={i}
          className="hero-particle"
          style={{
            '--delay': `${i * 0.5}s`,
            '--x': `${Math.cos((i / 12) * Math.PI * 2) * 140}px`,
            '--y': `${Math.sin((i / 12) * Math.PI * 2) * 140}px`,
            '--size': `${3 + Math.random() * 5}px`,
          }}
        />
      ))}
    </div>
  );
}

// ── 3D Tilt Card Component ──────────────────────────────────────────────────
function TiltCard({ icon, title, description, delay }) {
  const cardRef = useRef(null);

  const handleMouseMove = (e) => {
    const card = cardRef.current;
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    const rotateX = ((y - centerY) / centerY) * -8;
    const rotateY = ((x - centerX) / centerX) * 8;
    card.style.transform = `perspective(800px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(1.02)`;
  };

  const handleMouseLeave = () => {
    cardRef.current.style.transform = 'perspective(800px) rotateX(0) rotateY(0) scale(1)';
  };

  return (
    <div
      ref={cardRef}
      className="landing-card"
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{ animationDelay: delay }}
    >
      <div className="landing-card-icon">{icon}</div>
      <h3>{title}</h3>
      <p>{description}</p>
    </div>
  );
}

// ── Animated Counter ────────────────────────────────────────────────────────
function AnimatedCounter({ end, suffix = '', label }) {
  const [count, setCount] = useState(0);
  const ref = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          let current = 0;
          const step = Math.max(1, Math.floor(end / 60));
          const interval = setInterval(() => {
            current += step;
            if (current >= end) {
              current = end;
              clearInterval(interval);
            }
            setCount(current);
          }, 25);
          observer.disconnect();
        }
      },
      { threshold: 0.3 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [end]);

  return (
    <div className="stat-item" ref={ref}>
      <span className="stat-number">{count}{suffix}</span>
      <span className="stat-label">{label}</span>
    </div>
  );
}

// ── Policy Accordion ────────────────────────────────────────────────────────
function PolicyAccordion({ items }) {
  const [open, setOpen] = useState(null);

  return (
    <div className="policy-list">
      {items.map((item, i) => (
        <div key={i} className={`policy-item ${open === i ? 'policy-item--open' : ''}`}>
          <button
            className="policy-header"
            onClick={() => setOpen(open === i ? null : i)}
            aria-expanded={open === i}
          >
            <span className="policy-icon">{item.icon}</span>
            <span className="policy-title">{item.title}</span>
            <span className="policy-chevron">{open === i ? '−' : '+'}</span>
          </button>
          <div className="policy-body">
            <p>{item.content}</p>
          </div>
        </div>
      ))}
    </div>
  );
}

// ── Main Landing Page ───────────────────────────────────────────────────────
export default function LandingPage() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  // If already logged in, redirect to dashboard
  useEffect(() => {
    if (isAuthenticated) navigate('/dashboard');
  }, [isAuthenticated, navigate]);

  const features = [
    {
      icon: '📝',
      title: 'Intelligent Note-Taking',
      description: 'Create rich notes with smart tag autocomplete powered by a custom Trie data structure. Organize your thoughts with blazing-fast O(L) prefix search.',
    },
    {
      icon: '🕸️',
      title: 'Knowledge Graph',
      description: 'Link notes together and visualize your entire knowledge network with an interactive force-directed graph. See how your ideas connect.',
    },
    {
      icon: '🔍',
      title: 'BFS Network Discovery',
      description: 'Explore note connections using Breadth-First Search algorithm. Discover hidden relationships up to 3 degrees of separation.',
    },
    {
      icon: '🔒',
      title: 'Secure & Private',
      description: 'JWT authentication, bcrypt password hashing, user-isolated data, rate limiting, and Helmet security headers. Your notes are yours alone.',
    },
    {
      icon: '⚡',
      title: 'Real-Time Performance',
      description: 'MongoDB compound indexes, optimized queries, and a MERN stack architecture deliver sub-100ms response times on all operations.',
    },
    {
      icon: '🎨',
      title: 'Beautiful Dark UI',
      description: 'Glassmorphism design with smooth micro-animations, responsive layouts, and a premium dark theme that reduces eye strain.',
    },
  ];

  const advantages = [
    { icon: '🧬', title: 'DSA-Powered', desc: 'Not just CRUD — real Computer Science. Trie for autocomplete, Graph + BFS for network traversal.' },
    { icon: '🌐', title: 'Full-Stack MERN', desc: 'React, Express, MongoDB Atlas, Node.js — production-grade architecture from day one.' },
    { icon: '📊', title: 'Visual Learning', desc: 'Force-directed graph turns your notes into a living, interactive knowledge map.' },
    { icon: '🛡️', title: 'Enterprise Security', desc: '12-round bcrypt, JWT with 7-day expiry, Helmet headers, rate limiting on all endpoints.' },
  ];

  const policies = [
    {
      icon: '🔐',
      title: 'Privacy Policy',
      content: 'Smart Note Engine is committed to protecting your privacy. We collect only the minimum data required to provide our service: your username, email, and encrypted password. Your notes, tags, and knowledge graph data are stored securely in MongoDB Atlas with AES-256 encryption at rest. We never sell, share, or analyze your personal content. All data transmission is encrypted via TLS 1.3. You can export or delete your data at any time through your account settings.',
    },
    {
      icon: '📜',
      title: 'Terms of Service',
      content: 'By using Smart Note Engine, you agree to use the platform responsibly and lawfully. You retain full ownership of all content you create. We provide the service "as is" without warranty of uninterrupted availability. We reserve the right to terminate accounts that violate these terms, engage in automated abuse, or attempt to compromise system security. Free-tier users receive unlimited notes and tags with a fair-use data limit of 500MB.',
    },
    {
      icon: '🍪',
      title: 'Cookie & Storage Policy',
      content: 'We use localStorage to persist your authentication session (JWT token and user profile). We do not use tracking cookies, third-party analytics, or advertising pixels. The only data stored in your browser is your authentication token (sne_token) and a JSON representation of your user profile (sne_user). You can clear this data at any time by logging out or clearing your browser storage.',
    },
    {
      icon: '♿',
      title: 'Accessibility Commitment',
      content: 'Smart Note Engine is built with WCAG 2.1 AA compliance in mind. All interactive elements have proper ARIA labels, keyboard navigation is fully supported, and our color contrast ratios exceed the 4.5:1 minimum. We use semantic HTML throughout, provide focus indicators on all controls, and ensure our interface works with popular screen readers. If you encounter any accessibility barriers, please contact our team.',
    },
    {
      icon: '🔄',
      title: 'Data Retention & Deletion',
      content: 'Your notes and account data are retained as long as your account is active. If you request account deletion, all personal data — including notes, tags, links, and your user profile — will be permanently removed from our database within 30 days. Automated backups that may contain your data are rotated and overwritten within 90 days. We do not maintain shadow copies of deleted data.',
    },
  ];

  return (
    <div className="landing-page">
      {/* ── Navigation ────────────────────────────────────────────────── */}
      <nav className="landing-nav">
        <div className="landing-nav-brand">
          <span className="landing-nav-logo">🧠</span>
          <span className="landing-nav-name">Smart Note Engine</span>
        </div>
        <div className="landing-nav-links">
          <a href="#features" className="landing-nav-link">Features</a>
          <a href="#advantages" className="landing-nav-link">Advantages</a>
          <a href="#policies" className="landing-nav-link">Policies</a>
          <Link to="/login" className="btn btn-ghost btn-sm">Sign In</Link>
          <Link to="/register" className="btn btn-primary btn-sm">Get Started</Link>
        </div>
      </nav>

      {/* ── Hero ──────────────────────────────────────────────────────── */}
      <section className="landing-hero">
        <FloatingBrain />
        <div className="landing-hero-content">
          <div className="landing-badge">✨ Powered by DSA — Trie + Graph BFS</div>
          <h1 className="landing-hero-title">
            Your Second Brain,<br />
            <span className="gradient-text">Visualized.</span>
          </h1>
          <p className="landing-hero-subtitle">
            Smart Note Engine transforms your notes into an interactive knowledge graph.
            Create, connect, and discover ideas with the power of real data structures and algorithms.
          </p>
          <div className="landing-hero-cta">
            <Link to="/register" className="btn btn-primary btn-lg" id="hero-register-btn">
              🚀 Start Building Your Knowledge Graph
            </Link>
            <Link to="/login" className="btn btn-ghost btn-lg" id="hero-login-btn">
              Sign In →
            </Link>
          </div>
        </div>

        {/* Stats strip */}
        <div className="landing-stats">
          <AnimatedCounter end={100} suffix="%" label="Open Source" />
          <AnimatedCounter end={9} suffix="" label="API Endpoints" />
          <AnimatedCounter end={2} suffix="" label="DSA Structures" />
          <AnimatedCounter end={256} suffix="-bit" label="Encryption" />
        </div>
      </section>

      {/* ── What is the Platform? ─────────────────────────────────────── */}
      <section className="landing-section" id="about">
        <div className="landing-section-header">
          <span className="section-badge">🌐 The Platform</span>
          <h2>What is Smart Note Engine?</h2>
          <p className="section-desc">
            Smart Note Engine is a full-stack MERN application that reimagines note-taking
            as a <strong>graph problem</strong>. Unlike flat note apps, every note is a <em>node</em>
            and every connection is an <em>edge</em> — giving you a living, breathing knowledge network
            that grows with your ideas.
          </p>
        </div>

        <div className="about-grid">
          <div className="about-item">
            <div className="about-icon">🏗️</div>
            <h3>MERN Architecture</h3>
            <p>MongoDB Atlas, Express.js, React 18, Node.js — a battle-tested stack used by Netflix, Uber, and Airbnb.</p>
          </div>
          <div className="about-item">
            <div className="about-icon">🧬</div>
            <h3>Computer Science Core</h3>
            <p>Custom Trie data structure for O(L) autocomplete. Graph with BFS for network traversal. Real DSA, not just CRUD.</p>
          </div>
          <div className="about-item">
            <div className="about-icon">📈</div>
            <h3>Production-Ready</h3>
            <p>JWT auth, bcrypt hashing, Helmet security, rate limiting, compound indexes, and user isolation built in from day one.</p>
          </div>
        </div>
      </section>

      {/* ── Features — What Users Get ─────────────────────────────────── */}
      <section className="landing-section" id="features">
        <div className="landing-section-header">
          <span className="section-badge">🎁 Features</span>
          <h2>What You Get</h2>
          <p className="section-desc">
            Everything you need to build, connect, and explore your knowledge — with real CS algorithms under the hood.
          </p>
        </div>

        <div className="features-grid">
          {features.map((f, i) => (
            <TiltCard
              key={i}
              icon={f.icon}
              title={f.title}
              description={f.description}
              delay={`${i * 0.1}s`}
            />
          ))}
        </div>
      </section>

      {/* ── Advantages ────────────────────────────────────────────────── */}
      <section className="landing-section landing-section--accent" id="advantages">
        <div className="landing-section-header">
          <span className="section-badge">⚡ Advantages</span>
          <h2>Why Smart Note Engine?</h2>
          <p className="section-desc">
            Not another boring note app. Built with real data structures, production security, and a stunning UI.
          </p>
        </div>

        <div className="advantages-grid">
          {advantages.map((a, i) => (
            <div key={i} className="advantage-card" style={{ animationDelay: `${i * 0.15}s` }}>
              <div className="advantage-icon">{a.icon}</div>
              <h3>{a.title}</h3>
              <p>{a.desc}</p>
            </div>
          ))}
        </div>

        <div className="landing-cta-block">
          <h3>Ready to supercharge your note-taking?</h3>
          <Link to="/register" className="btn btn-primary btn-lg" id="advantages-register-btn">
            Create Free Account
          </Link>
        </div>
      </section>

      {/* ── Policies ──────────────────────────────────────────────────── */}
      <section className="landing-section" id="policies">
        <div className="landing-section-header">
          <span className="section-badge">📋 Policies</span>
          <h2>Transparency & Trust</h2>
          <p className="section-desc">
            We believe in radical transparency. Here are our policies — no legalese, just plain language.
          </p>
        </div>

        <PolicyAccordion items={policies} />
      </section>

      {/* ── Footer ────────────────────────────────────────────────────── */}
      <footer className="landing-footer">
        <div className="footer-content">
          <div className="footer-brand">
            <span className="landing-nav-logo">🧠</span>
            <span className="landing-nav-name">Smart Note Engine</span>
            <p className="footer-tagline">Your second brain, visualized.</p>
          </div>

          <div className="footer-links">
            <div className="footer-col">
              <h4>Product</h4>
              <a href="#features">Features</a>
              <a href="#advantages">Advantages</a>
              <a href="#policies">Policies</a>
            </div>
            <div className="footer-col">
              <h4>Account</h4>
              <Link to="/register">Register</Link>
              <Link to="/login">Sign In</Link>
            </div>
            <div className="footer-col">
              <h4>Tech Stack</h4>
              <span>React 18</span>
              <span>Express.js</span>
              <span>MongoDB Atlas</span>
            </div>
          </div>
        </div>

        <div className="footer-bottom">
          <p>© {new Date().getFullYear()} Smart Note Engine. Built with 🧠 and real DSA.</p>
        </div>
      </footer>
    </div>
  );
}
