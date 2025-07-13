import React from 'react';
import { Youtube, Music } from 'lucide-react';

const Header: React.FC = () => {
  return (
    <header className="w-full bg-card/80 backdrop-blur-md shadow-card sticky top-0 z-30">
      <div className="max-w-6xl mx-auto flex items-center justify-between px-4 py-3">
        <div className="flex items-center gap-2">
          <Youtube className="h-7 w-7" color="#FF0000" />
          <Music className="h-6 w-6 text-primary" />
          <span className="ml-2 text-xl font-bold tracking-tight text-foreground">AudioTube Fetcher</span>
        </div>
      </div>
    </header>
  );
};

export default Header; 