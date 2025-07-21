'use client';

import { useRef, useEffect, useState } from 'react';
import { Button } from './Button';
import { Camera as CameraIcon, X, Loader2 } from 'lucide-react';
import { useLanguage } from '@/context/language';
import { motion } from 'framer-motion';

interface CameraProps {
  onCapture: (image: string) => void;
  onClose: () => void;
}

const content = {
  en: {
    title: 'Scan Medicine',
    error: 'Could not access camera. Please make sure you have given permission.',
    capture: 'Capture',
    retake: 'Retake',
    loading: 'Starting camera...',
    guide: 'Position the medicine package in the frame',
    upload: 'Upload Image',
    or: 'or'
  },
  np: {
    title: 'औषधि स्क्यान गर्नुहोस्',
    error: 'क्यामेरामा पहुँच प्राप्त गर्न सकिएन। कृपया तपाईंले अनुमति दिनुभएको छ भनी सुनिश्चित गर्नुहोस्।',
    capture: 'क्याप्चर गर्नुहोस्',
    retake: 'पुन: लिनुहोस्',
    loading: 'क्यामेरा सुरु गर्दै...',
    guide: 'औषधि प्याकेजलाई फ्रेममा राख्नुहोस्',
    upload: 'तस्बिर अपलोड गर्नुहोस्',
    or: 'वा'
  }
} as const;

export const Camera = ({ onCapture, onClose }: CameraProps) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [error, setError] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const { lang } = useLanguage();
  const t = content[lang];
  const fileInputRef = useRef<HTMLInputElement>(null);

  const stopCamera = async () => {
    try {
      if (streamRef.current) {
        const tracks = streamRef.current.getTracks();
        tracks.forEach(track => {
          track.stop();
        });
        streamRef.current = null;
      }
      if (videoRef.current) {
        const oldStream = videoRef.current.srcObject as MediaStream | null;
        if (oldStream) {
          oldStream.getTracks().forEach(track => track.stop());
        }
        videoRef.current.srcObject = null;
      }
    } catch (err) {
      console.error('Error stopping camera:', err);
    }
  };

  const startCamera = async () => {
    try {
      setIsLoading(true);
      setError('');
      
      await stopCamera();
      
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { 
          facingMode: 'environment',
          width: { ideal: 1280 },
          height: { ideal: 720 }
        },
        audio: false
      });

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        streamRef.current = stream;
        
        // Wait for loadedmetadata before playing
        await new Promise((resolve) => {
          if (videoRef.current) {
            videoRef.current.onloadedmetadata = resolve;
          }
        });
        
        await videoRef.current.play();
      }
    } catch (err) {
      console.error('Camera error:', err);
      setError(t.error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    let mounted = true;

    const init = async () => {
      if (!mounted) return;
      try {
        await startCamera();
      } catch (err) {
        if (mounted) {
          console.error('Camera initialization error:', err);
          setError(t.error);
        }
      }
    };

    init();

    return () => {
      mounted = false;
      stopCamera();
    };
  }, [t.error]);

  const handleCapture = async () => {
    if (!videoRef.current) return;

    try {
      const canvas = document.createElement('canvas');
      canvas.width = videoRef.current.videoWidth;
      canvas.height = videoRef.current.videoHeight;
      
      const context = canvas.getContext('2d');
      if (!context) return;

      context.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
      const imageDataUrl = canvas.toDataURL('image/jpeg', 0.8);
      
      setPreviewImage(imageDataUrl);
    } catch (err) {
      console.error('Capture error:', err);
      setError('Failed to capture image');
    }
  };

  const handleConfirm = async () => {
    if (previewImage) {
      await stopCamera();
      onCapture(previewImage);
    }
  };

  const handleClose = async () => {
    await stopCamera();
    onClose();
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const imageDataUrl = e.target?.result as string;
      setPreviewImage(imageDataUrl);
    };
    reader.readAsDataURL(file);
  };

  // Add cleanup on unmount
  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/90 backdrop-blur-sm flex items-center justify-center z-50 p-4"
    >
      <motion.div 
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-white rounded-2xl shadow-2xl max-w-lg w-full mx-auto overflow-hidden"
      >
        <div className="p-4 border-b border-gray-100 flex justify-between items-center">
          <h3 className="text-xl font-semibold text-gray-900">{t.title}</h3>
          <Button
            variant="outline"
            size="sm"
            onClick={handleClose}
            className="rounded-full hover:bg-gray-100 transition-colors"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        <div className="relative">
          {isLoading && (
            <div className="absolute inset-0 bg-gray-100 flex items-center justify-center z-10">
              <div className="flex flex-col items-center gap-2">
                <Loader2 className="h-8 w-8 animate-spin text-[#0ea0d9]" />
                <p className="text-gray-600">{t.loading}</p>
              </div>
            </div>
          )}

          {error ? (
            <div className="p-8">
              <div className="bg-red-50 rounded-lg p-4 text-center">
                <p className="text-red-600">{error}</p>
                <Button 
                  onClick={startCamera}
                  className="mt-4"
                >
                  Retry
                </Button>
              </div>
            </div>
          ) : (
            <div className="relative">
              <div className="relative aspect-[4/3] overflow-hidden bg-black">
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  className="absolute inset-0 h-full w-full object-cover"
                />
                {!previewImage && !isLoading && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="absolute inset-x-4 h-0.5 bg-white/30" />
                  </div>
                )}
                {previewImage && (
                  <img 
                    src={previewImage} 
                    alt="Captured" 
                    className="absolute inset-0 h-full w-full object-cover"
                  />
                )}
              </div>

              {!isLoading && !error && !previewImage && (
                <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 text-white text-sm bg-black/50 px-4 py-2 rounded-full backdrop-blur-sm">
                  {t.guide}
                </div>
              )}
            </div>
          )}
        </div>

        {!error && (
          <div className="p-4 flex flex-col items-center justify-center gap-4">
            {previewImage ? (
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => {
                    setPreviewImage(null);
                    startCamera();
                  }}
                >
                  {t.retake}
                </Button>
                <Button
                  onClick={handleConfirm}
                  className="bg-[#0ea0d9] hover:bg-[#0ea0d9]/90 text-white font-medium"
                >
                  {t.capture}
                </Button>
              </div>
            ) : (
              <>
                <Button
                  onClick={handleCapture}
                  disabled={isLoading}
                  className="bg-[#0ea0d9] hover:bg-[#0ea0d9]/90 text-white font-medium px-8"
                >
                  <CameraIcon className="h-5 w-5 mr-2" />
                  {t.capture}
                </Button>
                
                <div className="flex items-center gap-3 text-sm text-gray-500">
                  <div className="h-px w-12 bg-gray-200" />
                  {t.or}
                  <div className="h-px w-12 bg-gray-200" />
                </div>

                <input
                  type="file"
                  ref={fileInputRef}
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="hidden"
                />
                <Button
                  variant="outline"
                  onClick={() => fileInputRef.current?.click()}
                  className="hover:bg-gray-50"
                >
                  {t.upload}
                </Button>
              </>
            )}
          </div>
        )}
      </motion.div>
    </motion.div>
  );
};