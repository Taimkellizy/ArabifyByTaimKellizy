import { useRef } from 'react';
import { gsap } from 'gsap';
import { useGSAP } from '@gsap/react';

const SplitText = ({
  text,
  className = '',
  mode = 'chars',
  delay = 100,
  duration = 1.2,
  stagger = 0.05, 
  onLetterAnimationComplete
}) => {
  const containerRef = useRef(null);

  useGSAP(() => {
    const el = containerRef.current;
    if (!el) return;

    // Select targets based on mode
    // Note: In 'chars' mode (English), we still animate the .split-char inside the wrapper
    const targetClass = mode === 'words' ? '.split-word' : '.split-char';
    const targets = el.querySelectorAll(targetClass);
    
    gsap.killTweensOf(targets);

    gsap.fromTo(
      targets,
      { 
        opacity: 0, 
        y: 50,
        rotateX: -90,
        transformOrigin: "50% 50% -50px",
      },
      {
        opacity: 1,
        y: 0,
        rotateX: 0,
        duration: duration,
        ease: "back.out(1.5)",
        stagger: stagger,
        delay: delay / 1000,
        force3D: true, 
        onComplete: () => {
          if (onLetterAnimationComplete) onLetterAnimationComplete();
        }
      }
    );
  }, { scope: containerRef, dependencies: [text, mode] }); 

  const renderContent = () => {
    if (mode === 'words') {
      // --- ARABIC MODE (Keep as is) ---
      return text.split(' ').map((word, index) => (
        <span 
          key={index} 
          className="split-word"
          style={{ 
            display: 'inline-block', 
            whiteSpace: 'pre',
            // Arabic usually needs a bit less spacing if using this method, 
            // but paddingLeft works for RTL direction.
            paddingLeft: '0.3em', 
            willChange: 'transform, opacity',
            backfaceVisibility: 'hidden'
          }}
        >
          {word}
        </span>
      ));
    } else {
      // --- ENGLISH MODE (Word Wrapper + Margin) ---
      const words = text.split(" ");
      return words.map((word, i) => (
        <span
          key={i}
          style={{ 
            display: 'inline-block', 
            whiteSpace: 'nowrap',
            // ADD MARGIN EXCEPT FOR THE LAST WORD:
            marginRight: i < words.length - 1 ? '0.3em' : '0' 
          }} 
        >
          {word.split("").map((char, j) => (
            <span
              key={j}
              className="split-char"
              style={{ 
                display: 'inline-block', 
                willChange: 'transform, opacity',
                backfaceVisibility: 'hidden',
                transformOrigin: '50% 50%'
              }}
            >
              {char}
            </span>
          ))}
        </span>
      ));
    }
  };

  return (
    <div 
      ref={containerRef} 
      className={className} 
      style={{ overflow: 'visible', perspective: '1000px' }} 
    >
      {renderContent()}
    </div>
  );
};

export default SplitText;