import { useEffect, useRef } from 'react';
import lottie from 'lottie-web';
import mahalaJumpLogo from '../assets/mahalaJumpLogo.json';

export default function LottieBox({ className }: { className: string }) {
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!containerRef.current) {
      return undefined;
    }

    const animation = lottie.loadAnimation({
      animationData: mahalaJumpLogo,
      autoplay: true,
      container: containerRef.current,
      loop: true,
      renderer: 'svg',
    });

    return () => animation.destroy();
  }, []);

  return <div className={className} ref={containerRef} />;
}
