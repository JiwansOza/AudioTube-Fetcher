import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Download, Loader2, ExternalLink, Music, Youtube, Play, Headphones, CloudDownload, CheckCircle, Link, MousePointer } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import axios from 'axios';

interface DownloadResponse {
  status: string;
  title: string;
  link: string;
}

const YouTubeDownloader: React.FC = () => {
  const [url, setUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<DownloadResponse | null>(null);
  const [scrollY, setScrollY] = useState(0);
  const { toast } = useToast();

  // Parallax scroll effect
  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

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
  const FloatingIcon = ({ icon: Icon, className }: { icon: any, className: string }) => (
    <Icon className={`absolute text-primary/10 animate-float ${className}`} size={32} />
  );

  return (
    <div className="min-h-screen bg-gradient-hero relative overflow-hidden">
      {/* Floating Background Icons */}
      <div className="absolute inset-0 pointer-events-none">
        <FloatingIcon icon={Music} className="top-20 left-10" />
        <FloatingIcon icon={Youtube} className="top-32 right-20" />
        <FloatingIcon icon={Headphones} className="top-64 left-1/4" />
        <FloatingIcon icon={Play} className="top-96 right-1/3" />
        <FloatingIcon icon={CloudDownload} className="bottom-32 left-16" />
      </div>

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center px-4 py-20">
        <div 
          className="animate-parallax"
          style={{ '--parallax-offset': `${scrollY * 0.5}px` } as React.CSSProperties}
        >
          <div className="text-center max-w-4xl mx-auto space-y-8">
            {/* Logo and Title */}
            <div className="space-y-6 animate-fade-in">
              <div className="flex items-center justify-center gap-3 text-primary">
                <Youtube className="h-12 w-12" />
                <Music className="h-10 w-10" />
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
                      className="h-14 text-lg bg-muted/50 border-border/70 focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all rounded-xl px-4"
                      disabled={isLoading}
                    />
                  </div>

                  <Button
                    onClick={handleDownload}
                    disabled={isLoading || !url.trim()}
                    className="w-full h-14 text-lg font-semibold bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl shadow-card-hover transition-all duration-300 hover:shadow-float"
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

      {/* How It Works Section */}
      <section className="bg-gradient-section py-24 px-4">
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

      {/* Result Section */}
      {result && (
        <section className="py-16 px-4 bg-background">
          <div className="max-w-2xl mx-auto animate-slide-up">
            <Card className="border-0 shadow-float bg-card">
              <CardContent className="p-8">
                <div className="space-y-6">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-success/10 rounded-full flex items-center justify-center flex-shrink-0">
                      <CheckCircle className="h-6 w-6 text-success" />
                    </div>
                    <div className="flex-1 space-y-2">
                      <h3 className="text-xl font-semibold text-foreground">
                        {result.title}
                      </h3>
                      <p className="text-muted-foreground">
                        Your MP3 file is ready for download
                      </p>
                    </div>
                  </div>

                  <Button
                    onClick={handleDownloadFile}
                    className="w-full h-12 bg-success hover:bg-success/90 text-success-foreground rounded-xl shadow-card-hover transition-all duration-300 hover:shadow-float"
                  >
                    <ExternalLink className="h-5 w-5 mr-2" />
                    Download MP3 Now
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>
      )}

      {/* Footer Section */}
      <footer className="bg-muted/30 py-16 px-4">
        <div className="max-w-4xl mx-auto text-center space-y-6">
          <div className="flex items-center justify-center gap-2 text-primary">
            <Youtube className="h-8 w-8" />
            <Music className="h-6 w-6" />
          </div>
          <h3 className="text-2xl font-bold text-foreground">
            YouTube to MP3 Converter
          </h3>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Convert any YouTube video to high-quality MP3 audio files. Fast, free, and reliable service for all your music needs.
          </p>
          <div className="pt-8 border-t border-border/50">
            <p className="text-sm text-muted-foreground">
              © 2024 YouTube MP3 Converter. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default YouTubeDownloader;