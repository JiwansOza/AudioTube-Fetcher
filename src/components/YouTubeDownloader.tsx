import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Download, Loader2, ExternalLink, Music, Youtube, Play, Headphones, CloudDownload, CheckCircle, Link, MousePointer, Home, Info, Download as DownloadIcon } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import axios from 'axios';

interface DownloadResponse {
  status: string;
  title: string;
  link: string;
}

const BottomNav: React.FC<{ onHome: () => void; onConvert: () => void; onAbout: () => void; active: string }> = ({ onHome, onConvert, onAbout, active }) => (
  <nav className="fixed bottom-0 left-0 right-0 z-40 bg-card/95 backdrop-blur-md border-t border-border flex justify-around items-center h-16 md:hidden" style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}>
    <button onClick={onHome} className={`flex flex-col items-center flex-1 py-2 min-h-[44px] ${active === 'home' ? 'text-primary' : 'text-muted-foreground'}`}> <Home className="h-6 w-6" /> <span className="text-xs mt-1">Home</span> </button>
    <button onClick={onConvert} className={`flex flex-col items-center flex-1 py-2 min-h-[44px] ${active === 'convert' ? 'text-primary' : 'text-muted-foreground'}`}> <DownloadIcon className="h-6 w-6" /> <span className="text-xs mt-1">Convert</span> </button>
    <button onClick={onAbout} className={`flex flex-col items-center flex-1 py-2 min-h-[44px] ${active === 'about' ? 'text-primary' : 'text-muted-foreground'}`}> <Info className="h-6 w-6" /> <span className="text-xs mt-1">About</span> </button>
  </nav>
);

const YouTubeDownloader: React.FC = () => {
  const [url, setUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<DownloadResponse | null>(null);
  const [scrollY, setScrollY] = useState(0);
  const { toast } = useToast();
  const [parallax, setParallax] = useState(0);
  const prefersReducedMotion = useRef(false);
  const [activeTab, setActiveTab] = useState<'home' | 'convert' | 'about'>('home');

  // Improved Parallax scroll effect
  useEffect(() => {
    prefersReducedMotion.current = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion.current) return;
    let ticking = false;
    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          setParallax(window.scrollY * 0.5);
          ticking = false;
        });
        ticking = true;
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Intersection Observer for section reveal
  const howItWorksRef = useRef<HTMLDivElement>(null);
  const resultRef = useRef<HTMLDivElement>(null);
  const [howItWorksVisible, setHowItWorksVisible] = useState(false);
  const [resultVisible, setResultVisible] = useState(false);

  useEffect(() => {
    if (prefersReducedMotion.current) {
      setHowItWorksVisible(true);
      setResultVisible(true);
      return;
    }
    const observer = new window.IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.target === howItWorksRef.current && entry.isIntersecting) {
            setHowItWorksVisible(true);
          }
          if (entry.target === resultRef.current && entry.isIntersecting) {
            setResultVisible(true);
          }
        });
      },
      { threshold: 0.2 }
    );
    if (howItWorksRef.current) observer.observe(howItWorksRef.current);
    if (resultRef.current) observer.observe(resultRef.current);
    return () => observer.disconnect();
  }, [result]);

  // Extract video ID from YouTube URL
  const extractVideoId = (url: string): string | null => {
    const regex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/;
    const match = url.match(regex);
    return match ? match[1] : null;
  };

  // Validate YouTube URL
  const isValidYouTubeUrl = (url: string): boolean => {
    return extractVideoId(url) !== null;
  };

  const handleDownload = async () => {
    if (!url.trim()) {
      toast({
        title: "Error",
        description: "Please enter a YouTube URL",
        variant: "destructive",
      });
      return;
    }

    if (!isValidYouTubeUrl(url)) {
      toast({
        title: "Invalid URL",
        description: "Please enter a valid YouTube URL",
        variant: "destructive",
      });
      return;
    }

    const videoId = extractVideoId(url);
    if (!videoId) return;

    setIsLoading(true);
    setResult(null);

    try {
      const response = await axios.get<DownloadResponse>(
        `https://youtube-mp36.p.rapidapi.com/dl?id=${videoId}`,
        {
          headers: {
            'X-RapidAPI-Key': '4fb1134a93msh86b7223029cf8c6p1b9b89jsnf4c9c1af9073',
            'X-RapidAPI-Host': 'youtube-mp36.p.rapidapi.com'
          }
        }
      );

      console.log('API Response:', response.data);
      console.log('API Status:', response.status);

      if (response.data.status === 'ok') {
        setResult(response.data);
        toast({
          title: "Success!",
          description: `"${response.data.title}" is ready for download`,
        });
      } else {
        console.log('API returned status:', response.data.status);
        throw new Error(`API returned status: ${response.data.status}`);
      }
    } catch (error) {
      console.error('Download error:', error);
      toast({
        title: "Download Failed",
        description: "Unable to process the video. Please check your API key or try again later.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownloadFile = () => {
    if (result?.link) {
      window.open(result.link, '_blank');
    }
  };

  // Floating background icons
  const FloatingIcon = ({ icon: Icon, className, color }: { icon: any, className: string, color?: string }) => (
    <Icon className={`absolute text-primary/10 animate-float ${className}`} size={32} {...(color ? { color } : {})} />
  );

  return (
    <div className="min-h-screen bg-gradient-hero relative overflow-hidden flex flex-col" style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}>
      {/* Floating Background Icons */}
      <div className="absolute inset-0 pointer-events-none">
        <FloatingIcon icon={Music} className="top-20 left-10" />
        <FloatingIcon icon={Youtube} className="top-32 right-20" color="#FF0000" />
        <FloatingIcon icon={Headphones} className="top-64 left-1/4" />
        <FloatingIcon icon={Play} className="top-96 right-1/3" />
        <FloatingIcon icon={CloudDownload} className="bottom-32 left-16" />
      </div>

      {/* Main Content as mobile app layout */}
      <main className="flex-1 min-h-0 w-full max-w-md mx-auto px-0 sm:px-4 pt-4 pb-32 md:pb-0">
        {/* Home tab: full conversion UI, no How It Works */}
        {activeTab === 'home' && (
          <>
            {/* Hero Section */}
            <section className="relative flex flex-col items-center justify-center px-2 py-8">
              <div
                className="animate-parallax"
                style={{ '--parallax-offset': prefersReducedMotion.current ? '0px' : `${parallax}px` } as React.CSSProperties}
              >
                <div className="w-full text-center max-w-full mx-auto space-y-8">
                  {/* Logo and Title */}
                  <div className="space-y-6 animate-fade-in">
                    <div className="flex items-center justify-center gap-3">
                      <Youtube className="h-12 w-12" color="#FF0000" />
                      <Music className="h-10 w-10 text-primary" />
                    </div>
                    
                    <h1 className="text-5xl md:text-6xl font-bold text-foreground leading-tight">
                      Download YouTube Videos as{' '}
                      <span className="bg-gradient-to-r from-primary to-primary-glow bg-clip-text text-transparent">
                        MP3 Instantly
                      </span>
                    </h1>
                    
                    <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                      Paste a link, convert, and enjoy your music. Fast, free, and high-quality audio downloads.
                    </p>
                  </div>

                  {/* Input and Button */}
                  <Card className="max-w-2xl mx-auto shadow-float border-0 bg-card/80 backdrop-blur-sm animate-slide-up">
                    <CardContent className="p-8">
                      <div className="space-y-6">
                        <div className="space-y-3">
                          <label htmlFor="youtube-url" className="block text-sm font-medium text-foreground text-left">
                            YouTube Video URL
                          </label>
                          <Input
                            id="youtube-url"
                            type="url"
                            placeholder="https://www.youtube.com/watch?v=..."
                            value={url}
                            onChange={(e) => setUrl(e.target.value)}
                            className="h-14 min-h-[44px] text-lg bg-muted/50 border-border/70 focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all rounded-2xl px-4"
                            disabled={isLoading}
                          />
                        </div>

                        <Button
                          onClick={handleDownload}
                          disabled={isLoading || !url.trim()}
                          className="w-full h-14 min-h-[44px] text-lg font-semibold bg-primary hover:bg-primary/90 text-primary-foreground rounded-2xl shadow-card-hover transition-all duration-300 hover:shadow-float mt-4"
                        >
                          {isLoading ? (
                            <>
                              <Loader2 className="h-6 w-6 animate-spin mr-2" />
                              Converting to MP3...
                            </>
                          ) : (
                            <>
                              <Download className="h-6 w-6 mr-2" />
                              Convert to MP3
                            </>
                          )}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </section>
            {/* Result Section as bottom sheet on mobile (only in Home tab) */}
            {result && (
              <div className="fixed inset-x-0 bottom-0 z-50 md:static md:inset-auto md:bottom-auto flex justify-center items-end md:items-center pointer-events-none">
                <div className="w-full max-w-md mx-auto pointer-events-auto">
                  <div className="relative rounded-t-2xl md:rounded-2xl p-[2px] bg-gradient-to-r from-primary via-accent to-primary-glow shadow-glow animate-slide-up">
                    <Card className="border-0 bg-card/95 backdrop-blur-xl rounded-t-2xl md:rounded-2xl overflow-hidden shadow-xl">
                      <CardContent className="p-6 md:p-8">
                        <div className="space-y-8">
                          <div className="flex items-start gap-6">
                            {/* Thumbnail */}
                            <img
                              src={`https://img.youtube.com/vi/${extractVideoId(url)}/hqdefault.jpg`}
                              alt="YouTube thumbnail"
                              className="w-20 h-20 rounded-xl object-cover shadow-card border border-border/40 bg-muted/30"
                              loading="lazy"
                            />
                            <div className="flex-1 space-y-2">
                              <h3 className="text-2xl font-bold text-foreground truncate" title={result.title}>
                                {result.title}
                              </h3>
                              <p className="text-muted-foreground text-sm">
                                Your MP3 file is ready for download
                              </p>
                            </div>
                            <div className="w-12 h-12 bg-success/10 rounded-full flex items-center justify-center flex-shrink-0 animate-bounce">
                              <CheckCircle className="h-7 w-7 text-success" />
                            </div>
                          </div>

                          <Button
                            onClick={handleDownloadFile}
                            className="w-full h-14 min-h-[44px] bg-gradient-to-r from-success to-primary text-success-foreground rounded-2xl shadow-card-hover transition-all duration-300 hover:shadow-float text-lg font-semibold flex items-center justify-center gap-2 group mt-2"
                          >
                            <ExternalLink className="h-5 w-5 mr-1 group-hover:scale-110 transition-transform" />
                            Download MP3 Now
                            <span className="ml-2 inline-flex items-center justify-center w-5 h-5 bg-success/80 rounded-full text-white animate-pulse">
                              <CheckCircle className="h-4 w-4" />
                            </span>
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
        {/* Convert tab: only How It Works/Guide */}
        {activeTab === 'convert' && (
          <section
            ref={howItWorksRef}
            className={`bg-gradient-section py-24 px-4 transition-opacity duration-700 ${howItWorksVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
            style={{ transitionProperty: 'opacity, transform' }}
          >
            <div className="max-w-6xl mx-auto">
              <div className="text-center mb-16 animate-fade-in">
                <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
                  How It Works
                </h2>
                <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                  Convert your favorite YouTube videos to MP3 in just a few simple steps
                </p>
              </div>

              <div className="grid md:grid-cols-4 gap-8">
                {[
                  { icon: Link, title: "Paste YouTube Link", description: "Copy and paste any YouTube video URL into the input field above" },
                  { icon: MousePointer, title: "Click Convert", description: "Hit the convert button and our system will process your video" },
                  { icon: Loader2, title: "Wait for Conversion", description: "Our servers will extract the audio and convert it to high-quality MP3" },
                  { icon: CloudDownload, title: "Download Your MP3", description: "Click the download button to save your MP3 file to your device" }
                ].map((step, index) => (
                  <Card key={index} className="text-center p-6 border-0 shadow-card hover:shadow-card-hover transition-all duration-300 animate-slide-up bg-card/80 backdrop-blur-sm">
                    <CardContent className="space-y-4">
                      <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
                        <step.icon className="h-8 w-8 text-primary" />
                      </div>
                      <h3 className="text-lg font-semibold text-foreground">
                        {step.title}
                      </h3>
                      <p className="text-muted-foreground text-sm">
                        {step.description}
                      </p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </section>
        )}
        {/* About Section as Disclaimer */}
        {activeTab === 'about' && (
          <section className="min-h-screen flex flex-col justify-between p-6">
            <div className="text-center space-y-4 mt-8">
              <h2 className="text-2xl font-bold text-foreground">Disclaimer</h2>
              <p className="text-muted-foreground text-base max-w-md mx-auto">
                This tool is provided for personal and educational use only. Downloading copyrighted material without permission may violate YouTube’s terms of service and local laws. The developer is not responsible for any misuse. Please respect content creators and copyright regulations.
              </p>
            </div>
            {/* Desktop footer credit */}
            <div className="pt-8 border-t border-border/50 mt-8 text-center hidden md:block">
              <a
                href="https://jiwans-oza.vercel.app/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline text-base font-medium"
              >
                Made by Jiwans Oza
              </a>
            </div>
          </section>
        )}
        {/* Mobile fixed footer credit (always above bottom nav) */}
        <div className="fixed bottom-16 left-0 right-0 z-40 md:hidden pointer-events-none">
          <div className="flex justify-center pointer-events-auto">
            <a
              href="https://jiwans-oza.vercel.app/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline text-base font-medium bg-card/90 px-4 py-2 rounded-t-xl shadow-card border-t border-border"
            >
              Made by Jiwans Oza
            </a>
          </div>
        </div>
      </main>
      {/* Bottom Navigation Bar for mobile */}
      <BottomNav
        onHome={() => setActiveTab('home')}
        onConvert={() => setActiveTab('convert')}
        onAbout={() => setActiveTab('about')}
        active={activeTab}
      />
    </div>
  );
};

export default YouTubeDownloader;