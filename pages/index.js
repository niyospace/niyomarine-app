// This is the updated index.js file.
// It now imports the new LoginPage component from the login.js file.

import React, { useState } from 'react';

// Import the LoginPage component from your other file.
// Note: Make sure your file path is correct. If login.js is in the same directory, use './login'.
import LoginPage from './login'; 

// Inline SVG Icons for a more polished look
const BoatIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className="h-8 w-8 text-white"
  >
    <path d="M11 21h-7a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h7" />
    <path d="M16 17a2 2 0 0 0-2-2h-2a2 2 0 0 0-2 2" />
    <path d="M12 15V3" />
    <path d="M12 3l7 4 3-4" />
  </svg>
);

const LockIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className="icon"
  >
    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
  </svg>
);

const BriefcaseIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className="icon"
  >
    <rect x="2" y="7" width="20" height="14" rx="2" ry="2" />
    <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
  </svg>
);

const BarChartIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className="icon"
  >
    <line x1="12" y1="20" x2="12" y2="10" />
    <line x1="18" y1="20" x2="18" y2="4" />
    <line x1="6" y1="20" x2="6" y2="16" />
  </svg>
);

// CSS Styles
const styles = `
.app-container {
  background-color: #f3f4f6;
  color: #1f2937;
  font-family: sans-serif;
  min-height: 100vh;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

.header {
  position: fixed;
  width: 100%;
  z-index: 20;
  background-color: #fff;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  padding: 1rem 2rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  transition: all 0.3s ease-in-out;
}

.logo-container {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.logo-text {
  font-size: 1.25rem;
  font-weight: 800;
  color: #4f46e5;
}

.login-button {
  padding: 0.5rem 1rem;
  background-color: #4f46e5;
  color: #fff;
  font-size: 0.875rem;
  font-weight: 600;
  border-radius: 9999px;
  border: none;
  cursor: pointer;
  transition: all 0.3s ease-in-out;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.login-button:hover {
  background-color: #4338ca;
}

.main-content {
  padding-top: 4rem;
}

.footer {
  background-color: #1f2937;
  color: #d1d5db;
  padding: 2.5rem 2rem;
  text-align: center;
  margin-top: auto;
}

.footer-grid {
  max-width: 80rem;
  margin: 0 auto;
  display: grid;
  grid-template-columns: 1fr;
  gap: 2rem;
}

@media (min-width: 768px) {
  .header {
    padding: 1rem 4rem;
  }
  .footer-grid {
    grid-template-columns: repeat(3, 1fr);
  }
}

.footer h4 {
  color: #fff;
  font-size: 1.125rem;
  font-weight: 700;
  margin-bottom: 0.5rem;
  text-align: left;
}

.footer p {
  font-size: 0.875rem;
  text-align: left;
}

.footer ul {
  font-size: 0.875rem;
  list-style: none;
  padding: 0;
  text-align: left;
}

.footer ul li {
  margin-bottom: 0.25rem;
}

.footer a {
  text-decoration: none;
  color: #d1d5db;
  transition: color 0.2s ease-in-out;
}

.footer a:hover {
  color: #fff;
}

.footer-bottom {
  border-top: 1px solid #374151;
  margin-top: 2rem;
  padding-top: 1.5rem;
}

.hero-section {
  width: 100%;
  background-color: #4f46e5;
  color: #fff;
  text-align: center;
  padding: 6rem 1rem;
  box-shadow: 0 10px 15px rgba(0, 0, 0, 0.1);
  position: relative;
  overflow: hidden;
}

.hero-bg {
  position: absolute;
  inset: 0;
  z-index: 0;
  opacity: 0.2;
}

.hero-bg-image {
  background-size: cover;
  background-position: center;
  width: 100%;
  height: 100%;
}

.hero-content {
  position: relative;
  z-index: 10;
  max-width: 64rem;
  margin: 0 auto;
}

.hero-title {
  font-size: 2.25rem;
  line-height: 1.25;
  font-weight: 800;
  letter-spacing: -0.05em;
  margin-bottom: 1rem;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.5);
}

@media (min-width: 768px) {
  .hero-title {
    font-size: 3.75rem;
  }
}

.hero-subtitle {
  font-size: 1.125rem;
  font-weight: 300;
  max-width: 48rem;
  margin: 0 auto 2rem;
  opacity: 0.9;
}

.cta-button {
  padding: 0.75rem 2rem;
  background-color: #fff;
  color: #4f46e5;
  font-weight: 700;
  border-radius: 9999px;
  border: none;
  cursor: pointer;
  transition: all 0.3s ease-in-out;
  transform: scale(1);
  box-shadow: 0 10px 15px rgba(0, 0, 0, 0.1);
}

.cta-button:hover {
  background-color: #f3f4f6;
  transform: scale(1.05);
}

.features-section {
  padding: 5rem 1rem;
  width: 100%;
  max-width: 80rem;
  margin: 0 auto;
}

@media (min-width: 768px) {
  .features-section {
    padding: 5rem 2rem;
  }
}

.section-title {
  font-size: 1.875rem;
  font-weight: 700;
  text-align: center;
  margin-bottom: 3rem;
  color: #1f2937;
}

@media (min-width: 768px) {
  .section-title {
    font-size: 2.25rem;
  }
}

.features-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 2rem;
}

@media (min-width: 768px) {
  .features-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (min-width: 1024px) {
  .features-grid {
    grid-template-columns: repeat(3, 1fr);
  }
}

.feature-card {
  background-color: #fff;
  padding: 1.5rem;
  border-radius: 0.75rem;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  text-align: center;
  transition: all 0.3s ease-in-out;
  transform: translateY(0);
}

.feature-card:hover {
  box-shadow: 0 10px 15px rgba(0, 0, 0, 0.1);
  transform: translateY(-0.25rem);
}

.feature-icon-container {
  display: flex;
  justify-content: center;
  margin-bottom: 1rem;
  color: #4f46e5;
}

.feature-title {
  font-size: 1.25rem;
  font-weight: 600;
  margin-bottom: 0.5rem;
}

.feature-description {
  color: #4b5563;
}

.testimonials-section {
  padding: 5rem 1rem;
  width: 100%;
  background-color: #f9fafb;
}

@media (min-width: 768px) {
  .testimonials-section {
    padding: 5rem 2rem;
  }
}

.testimonials-grid {
  max-width: 64rem;
  margin: 0 auto;
  display: grid;
  grid-template-columns: 1fr;
  gap: 2rem;
}

@media (min-width: 768px) {
  .testimonials-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

.testimonial-card {
  background-color: #fff;
  padding: 1.5rem;
  border-radius: 0.75rem;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  border: 1px solid #e5e7eb;
}

.testimonial-text {
  color: #374151;
  font-style: italic;
  margin-bottom: 1rem;
}

.testimonial-author {
  font-weight: 600;
  color: #1f2937;
}

.cta-section {
  width: 100%;
  background-color: #4f46e5;
  color: #fff;
  padding: 4rem 1rem;
  text-align: center;
  border-radius: 1.5rem;
  box-shadow: 0 10px 15px rgba(0, 0, 0, 0.1);
  margin: 4rem auto;
  max-width: 72rem;
}

.cta-title {
  font-size: 1.875rem;
  font-weight: 700;
  margin-bottom: 1rem;
}

.cta-subtitle {
  font-size: 1.125rem;
  opacity: 0.9;
  margin-bottom: 2rem;
  max-width: 48rem;
  margin-left: auto;
  margin-right: auto;
}

.login-page-container {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  background-color: #f3f4f6;
  padding: 1rem;
}

.message-box-overlay {
  position: fixed;
  inset: 0;
  background-color: rgba(31, 41, 55, 0.75);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 50;
}

.message-box {
  background-color: #fff;
  padding: 1.5rem;
  border-radius: 0.5rem;
  box-shadow: 0 25px 50px rgba(0, 0, 0, 0.25);
  max-width: 24rem;
  width: 100%;
}

.message-text {
  text-align: center;
  color: #1f2937;
  margin-bottom: 1rem;
}

.message-button {
  width: 100%;
  background-color: #4f46e5;
  color: #fff;
  padding: 0.5rem;
  border-radius: 0.375rem;
  font-weight: 700;
  border: none;
  cursor: pointer;
  transition: background-color 0.3s;
}

.message-button:hover {
  background-color: #4338ca;
}

.login-form-card {
  background-color: #fff;
  padding: 2rem;
  border-radius: 0.75rem;
  box-shadow: 0 10px 15px rgba(0, 0, 0, 0.1);
  width: 100%;
  max-width: 28rem;
}

.login-form-title {
  font-size: 1.5rem;
  font-weight: 700;
  text-align: center;
  margin-bottom: 1.5rem;
}

.form-group {
  margin-bottom: 1rem;
}

.form-label {
  display: block;
  color: #374151;
  font-size: 0.875rem;
  font-weight: 500;
  margin-bottom: 0.5rem;
}

.form-input {
  width: 100%;
  padding: 0.5rem 1rem;
  border: 1px solid #d1d5db;
  border-radius: 0.375rem;
  outline: none;
  transition: all 0.2s;
}

.form-input:focus {
  border-color: #4f46e5;
  box-shadow: 0 0 0 3px rgba(79, 70, 229, 0.5);
}

.form-button {
  width: 100%;
  background-color: #4f46e5;
  color: #fff;
  padding: 0.5rem;
  border-radius: 0.375rem;
  font-weight: 700;
  border: none;
  cursor: pointer;
  transition: background-color 0.3s;
}

.form-button:hover {
  background-color: #4338ca;
}

.signup-text {
  margin-top: 1rem;
  text-align: center;
  font-size: 0.875rem;
  color: #4b5563;
}

.signup-text a {
  color: #4f46e5;
  font-weight: 700;
  text-decoration: none;
}

.signup-text a:hover {
  text-decoration: underline;
}

.back-link-container {
  margin-top: 1rem;
  text-align: center;
}

.back-link {
  color: #4f46e5;
  font-weight: 700;
  text-decoration: none;
}

.back-link:hover {
  text-decoration: underline;
}

`;

// Main App component
export default function App() {
  const [activePage, setActivePage] = useState('landing');

  const renderContent = () => {
    switch (activePage) {
      case 'landing':
        return <LandingPage setActivePage={setActivePage} />;
      case 'login':
        return <LoginPage setActivePage={setActivePage} />;
      default:
        return <LandingPage setActivePage={setActivePage} />;
    }
  };

  return (
    <div className="app-container">
      <style>{styles}</style>
      <header className="header">
        <div className="logo-container">
          <BoatIcon />
          <span className="logo-text">MemoryDeck</span>
        </div>
        <nav>
          <button
            onClick={() => setActivePage('login')}
            className="login-button"
          >
            Login
          </button>
        </nav>
      </header>
      <main className="main-content">
        {renderContent()}
      </main>
      <footer className="footer">
        <div className="footer-grid">
          <div className="text-left md:col-span-1">
            <h4>MemoryDeck</h4>
            <p>Secure and professional vessel and certificate management.</p>
          </div>
          <div className="text-left md:col-span-1">
            <h4>Quick Links</h4>
            <ul>
              <li><a href="#">Home</a></li>
              <li><a href="#">Features</a></li>
              <li><a href="#">Contact</a></li>
            </ul>
          </div>
          <div className="text-left md:col-span-1">
            <h4>Connect</h4>
            <p>Follow us on social media for updates.</p>
          </div>
        </div>
        <div className="footer-bottom">
          <p>&copy; 2025 MemoryDeck. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}

// Landing Page component
const LandingPage = ({ setActivePage }) => {
  return (
    <div className="landing-page">
      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-bg">
          <div className="hero-bg-image" style={{ backgroundImage: "url('https://placehold.co/1200x800/2f3640/white?text=Professional+Marine+Software')" }}></div>
        </div>
        <div className="hero-content">
          <h1 className="hero-title">
            The Ultimate Platform for Marine Asset Management
          </h1>
          <p className="hero-subtitle">
            Streamline your fleet operations, ensure compliance, and secure your data with MemoryDeck.
          </p>
          <button
            onClick={() => setActivePage('login')}
            className="cta-button"
          >
            Start Your Free Trial
          </button>
        </div>
      </section>

      {/* Features Section */}
      <section className="features-section">
        <h2 className="section-title">
          Features Built for Efficiency
        </h2>
        <div className="features-grid">
          <FeatureCard
            icon={<BriefcaseIcon />}
            title="Simplified Document Management"
            description="Effortlessly organize and access vessel and crew certificates, licenses, and other crucial documents."
          />
          <FeatureCard
            icon={<LockIcon />}
            title="Robust Data Security"
            description="Protect your sensitive information with end-to-end encryption and a secure, private cloud infrastructure."
          />
          <FeatureCard
            icon={<BarChartIcon />}
            title="Real-time Compliance Tracking"
            description="Monitor certification expiry dates and regulatory changes to ensure your fleet is always compliant."
          />
        </div>
      </section>
      
      {/* Testimonials Section */}
      <section className="testimonials-section">
        <div className="testimonials-grid">
          <h2 className="section-title">
            Trusted by Maritime Professionals
          </h2>
          <TestimonialCard
            text="MemoryDeck has revolutionized how we manage our vessel documents. The platform is intuitive and has saved us countless hours."
            author="— Sarah Chen, Fleet Manager"
          />
          <TestimonialCard
            text="The security features are top-notch. I feel confident that our critical data is safe and easily accessible when we need it."
            author="— Captain James Miller"
          />
        </div>
      </section>

      {/* Call to Action Section */}
      <section className="cta-section">
        <h2 className="cta-title">
          Ready to Modernize Your Fleet?
        </h2>
        <p className="cta-subtitle">
          Experience the future of marine asset management. Sign up for a free trial and see the difference.
        </p>
        <button
          onClick={() => setActivePage('login')}
          className="cta-button"
        >
          Get Started Now
        </button>
      </section>
    </div>
  );
};

// Reusable Feature Card component
const FeatureCard = ({ icon, title, description }) => {
  return (
    <div className="feature-card">
      <div className="feature-icon-container">{icon}</div>
      <h3 className="feature-title">{title}</h3>
      <p className="feature-description">{description}</p>
    </div>
  );
};

// Reusable Testimonial Card component
const TestimonialCard = ({ text, author }) => {
  return (
    <div className="testimonial-card">
      <p className="testimonial-text">"{text}"</p>
      <p className="testimonial-author">{author}</p>
    </div>
  );
};
