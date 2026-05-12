import React from 'react';
import { Link } from 'react-router-dom';
import { Github, GitBranch, Users, Zap, Shield, ArrowRight, ExternalLink } from 'lucide-react';

function Landing() {
  const features = [
    {
      icon: <GitBranch size={24} />,
      title: "Powerful Version Control",
      description: "Track every change with Git-based repository management"
    },
    {
      icon: <Users size={24} />,
      title: "Collaboration",
      description: "Work together seamlessly with pull requests and code reviews"
    },
    {
      icon: <Shield size={24} />,
      title: "Security",
      description: "Enterprise-grade security for your code and projects"
    },
    {
      icon: <Zap size={24} />,
      title: "Performance",
      description: "Lightning-fast repository operations and deployments"
    },
  ];

  return (
    <div style={{
      minHeight: '100vh',
      background: 'var(--bg-canvas)',
      color: 'var(--fg-default)',
    }}>
      {/* Navigation */}
      <nav style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '16px 40px',
        borderBottom: '1px solid var(--border-default)',
        background: 'var(--bg-default)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '20px', fontWeight: 700 }}>
          <Github size={28} />
          <span>DevHub</span>
        </div>
        <div style={{ display: 'flex', gap: '16px' }}>
          <Link to="/login" style={{
            padding: '8px 16px',
            color: 'var(--fg-default)',
            textDecoration: 'none',
            borderRadius: 'var(--radius-md)',
            transition: 'opacity var(--transition-fast)',
          }}>
            Sign in
          </Link>
          <Link to="/signup" style={{
            padding: '8px 16px',
            background: 'var(--accent-emphasis)',
            color: '#fff',
            textDecoration: 'none',
            borderRadius: 'var(--radius-md)',
            fontWeight: 600,
            transition: 'opacity var(--transition-fast)',
          }}>
            Sign up
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <section style={{
        padding: '80px 40px',
        textAlign: 'center',
        background: 'linear-gradient(135deg, var(--bg-default) 0%, var(--bg-canvas) 100%)',
        borderBottom: '1px solid var(--border-default)',
      }}>
        <h1 style={{
          fontSize: '56px',
          fontWeight: 800,
          marginBottom: '16px',
          background: 'linear-gradient(135deg, var(--fg-default) 0%, var(--fg-muted) 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text',
        }}>
          The future of building happens together
        </h1>
        <p style={{
          fontSize: '20px',
          color: 'var(--fg-muted)',
          marginBottom: '32px',
          maxWidth: '700px',
          margin: '0 auto 32px',
          lineHeight: '1.6',
        }}>
          Tools and trends evolve, but collaboration endures. With DevHub, developers, agents, and code come together on one platform.
        </p>
        <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap' }}>
          <Link to="/signup" style={{
            padding: '12px 32px',
            background: 'var(--accent-emphasis)',
            color: '#fff',
            textDecoration: 'none',
            borderRadius: 'var(--radius-md)',
            fontWeight: 600,
            fontSize: '16px',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            transition: 'opacity var(--transition-fast)',
          }}>
            Get Started <ArrowRight size={18} />
          </Link>
          <a href="#features" style={{
            padding: '12px 32px',
            border: '1px solid var(--border-default)',
            color: 'var(--fg-default)',
            textDecoration: 'none',
            borderRadius: 'var(--radius-md)',
            fontWeight: 600,
            fontSize: '16px',
            transition: 'opacity var(--transition-fast)',
          }}>
            Learn More
          </a>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" style={{
        padding: '80px 40px',
        maxWidth: '1200px',
        margin: '0 auto',
      }}>
        <h2 style={{
          fontSize: '40px',
          fontWeight: 700,
          marginBottom: '48px',
          textAlign: 'center',
        }}>
          Powerful Features
        </h2>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: '32px',
        }}>
          {features.map((feature, idx) => (
            <div key={idx} style={{
              padding: '32px',
              background: 'var(--bg-default)',
              border: '1px solid var(--border-default)',
              borderRadius: 'var(--radius-lg)',
              transition: 'all var(--transition-fast)',
            }} onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = 'var(--accent-emphasis)';
              e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.1)';
            }} onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = 'var(--border-default)';
              e.currentTarget.style.boxShadow = 'none';
            }}>
              <div style={{
                color: 'var(--accent-emphasis)',
                marginBottom: '16px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '56px',
                height: '56px',
                background: 'rgba(31, 111, 235, 0.1)',
                borderRadius: 'var(--radius-md)',
              }}>
                {feature.icon}
              </div>
              <h3 style={{
                fontSize: '18px',
                fontWeight: 600,
                marginBottom: '12px',
              }}>
                {feature.title}
              </h3>
              <p style={{
                color: 'var(--fg-muted)',
                lineHeight: '1.6',
                margin: 0,
              }}>
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Solutions Section */}
      <section style={{
        padding: '80px 40px',
        background: 'var(--bg-default)',
        borderTop: '1px solid var(--border-default)',
        borderBottom: '1px solid var(--border-default)',
      }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <h2 style={{
            fontSize: '40px',
            fontWeight: 700,
            marginBottom: '48px',
            textAlign: 'center',
          }}>
            Solutions for Every Need
          </h2>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
            gap: '24px',
          }}>
            {['Open Source', 'Enterprise', 'Marketplace', 'Pricing'].map((solution, idx) => (
              <div key={idx} style={{
                padding: '24px',
                background: 'var(--bg-canvas)',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--border-default)',
                cursor: 'pointer',
                transition: 'all var(--transition-fast)',
              }} onMouseEnter={(e) => {
                e.currentTarget.style.background = 'var(--bg-default)';
                e.currentTarget.style.borderColor = 'var(--accent-emphasis)';
              }} onMouseLeave={(e) => {
                e.currentTarget.style.background = 'var(--bg-canvas)';
                e.currentTarget.style.borderColor = 'var(--border-default)';
              }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}>
                  <span style={{ fontWeight: 600, fontSize: '16px' }}>
                    {solution}
                  </span>
                  <ExternalLink size={18} style={{ color: 'var(--fg-muted)' }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section style={{
        padding: '80px 40px',
        textAlign: 'center',
      }}>
        <h2 style={{
          fontSize: '40px',
          fontWeight: 700,
          marginBottom: '16px',
        }}>
          Ready to get started?
        </h2>
        <p style={{
          fontSize: '18px',
          color: 'var(--fg-muted)',
          marginBottom: '32px',
        }}>
          Join thousands of developers building amazing projects.
        </p>
        <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap' }}>
          <Link to="/signup" style={{
            padding: '12px 32px',
            background: 'var(--accent-emphasis)',
            color: '#fff',
            textDecoration: 'none',
            borderRadius: 'var(--radius-md)',
            fontWeight: 600,
            fontSize: '16px',
            transition: 'opacity var(--transition-fast)',
          }}>
            Create Account
          </Link>
          <Link to="/login" style={{
            padding: '12px 32px',
            border: '1px solid var(--border-default)',
            color: 'var(--fg-default)',
            textDecoration: 'none',
            borderRadius: 'var(--radius-md)',
            fontWeight: 600,
            fontSize: '16px',
            transition: 'opacity var(--transition-fast)',
          }}>
            Sign In
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer style={{
        padding: '40px',
        borderTop: '1px solid var(--border-default)',
        textAlign: 'center',
        color: 'var(--fg-muted)',
        fontSize: '14px',
      }}>
        <p>© 2026 DevHub. All rights reserved.</p>
      </footer>
    </div>
  );
}

export default Landing;
