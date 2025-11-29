import CodeWindow from '../components/CodeWindow';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faYoutube } from '@fortawesome/free-brands-svg-icons';
import React, { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const Blog = ({ text, lang }) => {
  const isAr = lang === 'ar';

  // --- NEW: Scroll to Hash Logic ---
  const { hash } = useLocation();

  useEffect(() => {
    // If there is a hash (e.g., #post-2), scroll to it
    if (hash) {
      // Small timeout ensures the DOM is fully loaded before scrolling
      setTimeout(() => {
        const element = document.getElementById(hash.replace('#', ''));
        if (element) {
          element.scrollIntoView({ behavior: 'smooth' });
          // Optional: Add a "highlight" effect
          element.style.backgroundColor = "rgba(255, 255, 255, 0.05)";
          setTimeout(() => { element.style.backgroundColor = "transparent"; }, 2000);
        }
      }, 100);
    }
  }, [hash]);

  return (
    // 1. Use 'blog-container' class
    <div className="boarders blog-container">

      {/* Page Header */}
      <div className="blog-header">
        <h1 className="blog-title">{text.blog}</h1>
        <p className="blog-subtitle">{text.blogSubtitle}</p>
      </div>

      {/* Blog Posts Loop */}
      <div className="blog-grid">
        {text.blogPosts.map((post) => (
          <article key={post.id} id={`post-${post.id}`} className="blog-article">

            <h2 className="article-title">{post.title}</h2>
            <p className="article-desc">{post.desc}</p>

            {/* Fix Box */}
            <div className="fix-box">
              <strong className="fix-label">{text.blogFixLabel}</strong>
              <span className="fix-text">{post.fix}</span>
            </div>

            {/* Code Window */}
            <div style={{ marginBottom: '1.5rem' }}>
              <CodeWindow
                code={post.code}
                fileName={isAr ? "مثال.css" : "Example.css"}
                language={post.language || "css"}
              />
            </div>

            {/* Video Button */}
            {post.videoUrl && (
              <a
                href={post.videoUrl}
                target="_blank"
                rel="noreferrer"
                className="btn video-btn"
              >
                <FontAwesomeIcon icon={faYoutube} style={{ color: '#ff0033' }} />

                {/* Text */}
                <span>{text.videoWatch} {post.videoTitle}</span>
              </a>
            )}

            <hr className="divider" />
          </article>
        ))}
      </div>
    </div>
  );
};

export default Blog;