import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Download, Loader2, ExternalLink, Music, Youtube } from 'lucide-react';
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
  const { toast } = useToast();

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

  return (
    <div className="min-h-screen bg-gradient-background flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl mx-auto shadow-card-custom border-border/50 bg-card/80 backdrop-blur-sm">
        <CardHeader className="text-center space-y-4">
          <div className="flex items-center justify-center gap-2 text-primary">
            <Youtube className="h-8 w-8" />
            <Music className="h-6 w-6" />
          </div>
          <CardTitle className="text-3xl font-bold bg-gradient-primary bg-clip-text text-transparent">
            YouTube to MP3 Converter
          </CardTitle>
          <CardDescription className="text-muted-foreground text-lg">
            Convert any YouTube video to high-quality MP3 audio
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="youtube-url" className="text-sm font-medium text-foreground">
                YouTube Video URL
              </label>
              <Input
                id="youtube-url"
                type="url"
                placeholder="https://www.youtube.com/watch?v=..."
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                className="text-base h-12 bg-background/50 border-border/70 focus:border-primary transition-colors"
                disabled={isLoading}
              />
            </div>

            <Button
              onClick={handleDownload}
              disabled={isLoading || !url.trim()}
              variant="gradient"
              size="xl"
              className="w-full"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <Download className="h-5 w-5" />
                  Convert to MP3
                </>
              )}
            </Button>
          </div>

          {/* Results Section */}
          {result && (
            <div className="space-y-4 p-6 rounded-lg bg-background/50 border border-border/70">
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-lg bg-success/10">
                  <Music className="h-5 w-5 text-success" />
                </div>
                <div className="flex-1 space-y-2">
                  <h3 className="font-semibold text-foreground text-lg">
                    {result.title}
                  </h3>
                  <p className="text-muted-foreground text-sm">
                    Your MP3 file is ready for download
                  </p>
                </div>
              </div>

              <Button
                onClick={handleDownloadFile}
                variant="success"
                size="lg"
                className="w-full"
              >
                <ExternalLink className="h-5 w-5" />
                Download MP3 Now
              </Button>
            </div>
          )}

        </CardContent>
      </Card>
    </div>
  );
};

export default YouTubeDownloader;