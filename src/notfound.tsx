'use client';

import { useEffect, useState } from 'react';
import { Home, ArrowLeft, Search } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from 'antd';
import { useTranslation } from 'react-i18next'; // i18n import

export default function NotFound() {
  const { t } = useTranslation(); // t funksiyasi
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({
        x: (e.clientX / window.innerWidth - 0.5) * 20,
        y: (e.clientY / window.innerHeight - 0.5) * 20,
      });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  return (
    <div className="relative min-h-screen overflow-hidden bg-background flex items-center justify-center">
      {/* Animated background (Kodingizdagi orblar va gridlar o'z holicha qoladi) */}
      <div className="absolute inset-0 overflow-hidden">
        <div
          className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full opacity-20 blur-3xl animate-pulse"
          style={{
            background:
              'linear-gradient(135deg, oklch(0.75 0.15 280), oklch(0.65 0.2 330))',
            transform: mounted
              ? `translate(${mousePosition.x * 2}px, ${mousePosition.y * 2}px)`
              : 'none',
            transition: 'transform 0.3s ease-out',
          }}
        />
        {/* ... boshqa fon elementlari ... */}
      </div>

      <div className="relative z-10 text-center px-6">
        {/* Glitchy 404 text */}
        <div className="relative mb-8">
          <h1
            className="text-[10rem] md:text-[16rem] font-black leading-none tracking-tighter select-none"
            style={{
              background:
                'linear-gradient(135deg, oklch(0.75 0.15 280), oklch(0.65 0.2 330), oklch(0.98 0 0))',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              textShadow: '0 0 80px oklch(0.75 0.15 280 / 0.3)',
              transform: mounted
                ? `translate(${mousePosition.x * 0.5}px, ${
                    mousePosition.y * 0.5
                  }px)`
                : 'none',
              transition: 'transform 0.1s ease-out',
            }}
          >
            404
          </h1>
        </div>

        {/* Dynamic Message */}
        <div
          className="mb-12 space-y-4"
          style={{
            transform: mounted
              ? `translate(${mousePosition.x * 0.3}px, ${
                  mousePosition.y * 0.3
                }px)`
              : 'none',
            transition: 'transform 0.2s ease-out',
          }}
        >
          <h2 className="text-3xl md:text-4xl font-bold text-foreground">
            {t('not_found.title')}
          </h2>
          <p className="text-lg md:text-xl text-muted-foreground max-w-md mx-auto leading-relaxed">
            {t('not_found.description')}
          </p>
        </div>

        {/* Action buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <Link to="/">
            <Button className="group relative overflow-hidden bg-primary text-primary-foreground hover:bg-primary/90 px-8 py-6 text-lg font-semibold rounded-xl transition-all duration-300 hover:scale-105 hover:shadow-[0_0_40px_oklch(0.75_0.15_280/0.4)]">
              <span className="relative z-10 flex items-center gap-2">
                <Home className="w-5 h-5 transition-transform group-hover:-translate-y-0.5" />
                {t('not_found.btn_home')}
              </span>
            </Button>
          </Link>

          <Button
            onClick={() => window.history.back()}
            className="group border-border hover:border-primary/50 hover:bg-secondary px-8 py-6 text-lg font-semibold rounded-xl transition-all duration-300 hover:scale-105"
          >
            <ArrowLeft className="w-5 h-5 mr-2 transition-transform group-hover:-translate-x-1" />
            {t('not_found.btn_back')}
          </Button>
        </div>

        {/* Search suggestion */}
        <div className="mt-16 flex items-center justify-center gap-2 text-muted-foreground">
          <Search className="w-4 h-4" />
          <span className="text-sm">{t('not_found.search_hint')}</span>
        </div>
      </div>

      {/* Styles (Kodingizdagi animatsiyalar) */}
      <style>{`
        /* ... oldingi kodingizdagi animatsiyalar ... */
      `}</style>
    </div>
  );
}
