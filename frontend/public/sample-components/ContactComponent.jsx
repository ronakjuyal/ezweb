// Contact Component
// Schema: { title, subtitle, email, phone, address, backgroundColor, textColor }

import React, { useState } from 'react';

export default function ContactComponent({
  title = 'Get In Touch',
  subtitle = 'We'd love to hear from you',
  email = 'contact@example.com',
  phone = '+1 (555) 123-4567',
  address = '123 Main St, City, State 12345',
  backgroundColor = '#ffffff',
  textColor = '#1f2937',
}) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: '',
  });
  const [status, setStatus] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    // In a real application, you would send this to your backend
    setStatus('Thank you! Your message has been received.');
    setFormData({ name: '', email: '', message: '' });
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const containerStyle = {
    backgroundColor: backgroundColor,
    padding: '4rem 2rem',
  };

  const contentStyle = {
    maxWidth: '1200px',
    margin: '0 auto',
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '4rem',
    color: textColor,
  };

  const headerStyle = {
    marginBottom: '2rem',
  };

  const titleStyle = {
    fontSize: '2.5rem',
    fontWeight: 'bold',
    marginBottom: '1rem',
  };

  const subtitleStyle = {
    fontSize: '1.25rem',
    opacity: 0.8,
  };

  const infoItemStyle = {
    marginBottom: '1.5rem',
  };

  const infoLabelStyle = {
    fontWeight: '600',
    marginBottom: '0.5rem',
    fontSize: '1.125rem',
  };

  const infoTextStyle = {
    fontSize: '1rem',
    opacity: 0.8,
  };

  const formStyle = {
    display: 'flex',
    flexDirection: 'column',
    gap: '1.5rem',
  };

  const inputStyle = {
    padding: '0.75rem 1rem',
    border: '1px solid #d1d5db',
    borderRadius: '0.5rem',
    fontSize: '1rem',
    fontFamily: 'inherit',
  };

  const textareaStyle = {
    ...inputStyle,
    minHeight: '150px',
    resize: 'vertical',
  };

  const buttonStyle = {
    padding: '0.75rem 2rem',
    backgroundColor: '#2563eb',
    color: 'white',
    border: 'none',
    borderRadius: '0.5rem',
    fontSize: '1.125rem',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'background-color 0.2s',
  };

  const statusStyle = {
    padding: '0.75rem',
    backgroundColor: '#d1fae5',
    color: '#065f46',
    borderRadius: '0.5rem',
    textAlign: 'center',
  };

  return (
    <div style={containerStyle}>
      <div style={contentStyle}>
        {/* Contact Info */}
        <div>
          <div style={headerStyle}>
            <h2 style={titleStyle}>{title}</h2>
            <p style={subtitleStyle}>{subtitle}</p>
          </div>

          <div style={infoItemStyle}>
            <div style={infoLabelStyle}>📧 Email</div>
            <div style={infoTextStyle}>
              <a href={`mailto:${email}`} style={{ color: textColor, textDecoration: 'none' }}>
                {email}
              </a>
            </div>
          </div>

          <div style={infoItemStyle}>
            <div style={infoLabelStyle}>📞 Phone</div>
            <div style={infoTextStyle}>
              <a href={`tel:${phone}`} style={{ color: textColor, textDecoration: 'none' }}>
                {phone}
              </a>
            </div>
          </div>

          <div style={infoItemStyle}>
            <div style={infoLabelStyle}>📍 Address</div>
            <div style={infoTextStyle}>{address}</div>
          </div>
        </div>

        {/* Contact Form */}
        <div>
          <form onSubmit={handleSubmit} style={formStyle}>
            <input
              type="text"
              name="name"
              placeholder="Your Name"
              value={formData.name}
              onChange={handleChange}
              required
              style={inputStyle}
            />

            <input
              type="email"
              name="email"
              placeholder="Your Email"
              value={formData.email}
              onChange={handleChange}
              required
              style={inputStyle}
            />

            <textarea
              name="message"
              placeholder="Your Message"
              value={formData.message}
              onChange={handleChange}
              required
              style={textareaStyle}
            />

            <button
              type="submit"
              style={buttonStyle}
              onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#1d4ed8')}
              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#2563eb')}
            >
              Send Message
            </button>

            {status && <div style={statusStyle}>{status}</div>}
          </form>
        </div>
      </div>
    </div>
  );
}
