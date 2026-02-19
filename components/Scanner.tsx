import React, { useRef, useEffect, useState } from 'react';
import { X, Camera, Zap, Maximize, AlertCircle } from 'lucide-react';

interface ScannerProps {
  onScan: (data: string) => void;
  onClose: () => void;
  title?: string;
}

const Scanner: React.FC<ScannerProps> = ({ onScan, onClose, title = "Barcode Scanner" }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isScanning, setIsScanning] = useState(true);

  useEffect(() => {
    let detector: any = null;
    let animationFrame: number;

    const startCamera = async () => {
      try {
        const mediaStream = await navigator.mediaDevices.getUserMedia({ 
          video: { 
            facingMode: 'environment',
            width: { ideal: 1280 },
            height: { ideal: 720 }
          } 
        });
        setStream(mediaStream);
        if (videoRef.current) {
          videoRef.current.srcObject = mediaStream;
        }

        // Use Native BarcodeDetector if available
        if ('BarcodeDetector' in window) {
          // @ts-ignore
          detector = new window.BarcodeDetector({
            formats: ['code_128', 'code_39', 'ean_13', 'ean_8', 'qr_code', 'upc_a']
          });
          
          const renderFrame = async () => {
            if (videoRef.current && isScanning && detector) {
              try {
                const barcodes = await detector.detect(videoRef.current);
                if (barcodes.length > 0) {
                  onScan(barcodes[0].rawValue);
                  setIsScanning(false);
                }
              } catch (e) {
                // Silently fail frame detection
              }
            }
            animationFrame = requestAnimationFrame(renderFrame);
          };
          renderFrame();
        }
      } catch (err) {
        setError("Camera access denied or hardware busy.");
      }
    };
    
    startCamera();

    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
      cancelAnimationFrame(animationFrame);
    };
  }, [onScan, isScanning]);

  const simulateScan = () => {
    // Fallback/Demo manual trigger
    onScan("PRD-" + Math.floor(Math.random() * 6 + 1).toString().padStart(3, '0'));
  };

  return (
    <div className="fixed inset-0 z-[100] bg-slate-900/90 backdrop-blur-xl flex items-center justify-center p-6 animate-in fade-in duration-300">
      <div className="bg-white w-full max-w-2xl rounded-[3.5rem] shadow-2xl overflow-hidden relative border-4 border-blue-500/20">
        <div className="absolute top-8 right-8 z-50">
          <button 
            onClick={onClose}
            className="p-4 bg-white/20 backdrop-blur-md hover:bg-white/40 text-white rounded-full transition-all active:scale-90"
          >
            <X size={28}/>
          </button>
        </div>

        <div className="bg-black aspect-video relative flex items-center justify-center overflow-hidden">
          {error ? (
            <div className="text-white text-center p-12">
              <AlertCircle size={64} className="mx-auto mb-6 text-rose-500"/>
              <p className="text-2xl font-black mb-2">{error}</p>
              <p className="text-slate-400 font-medium">Please verify device camera permissions.</p>
            </div>
          ) : (
            <>
              <video 
                ref={videoRef} 
                autoPlay 
                playsInline 
                className="w-full h-full object-cover opacity-90 scale-105"
              />
              {/* Scanner HUD Overlay */}
              <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                {/* Visual Frame */}
                <div className="w-80 h-48 border-2 border-blue-500/50 rounded-3xl relative">
                  {/* Corners */}
                  <div className="absolute -top-1 -left-1 w-12 h-12 border-t-8 border-l-8 border-blue-500 rounded-tl-2xl"></div>
                  <div className="absolute -top-1 -right-1 w-12 h-12 border-t-8 border-r-8 border-blue-500 rounded-tr-2xl"></div>
                  <div className="absolute -bottom-1 -left-1 w-12 h-12 border-b-8 border-l-8 border-blue-500 rounded-bl-2xl"></div>
                  <div className="absolute -bottom-1 -right-1 w-12 h-12 border-b-8 border-r-8 border-blue-500 rounded-br-2xl"></div>
                  
                  {/* High-speed Laser Animation */}
                  <div className="w-full h-1 bg-gradient-to-r from-transparent via-blue-400 to-transparent shadow-[0_0_20px_rgba(59,130,246,1)] absolute animate-[laser_1.5s_infinite_linear]"></div>
                </div>
              </div>
              
              <div className="absolute bottom-10 left-0 right-0 flex justify-center">
                <div className="bg-blue-600/20 backdrop-blur-md border border-white/20 px-6 py-2 rounded-full flex items-center gap-3 text-white text-xs font-black uppercase tracking-widest">
                  <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                  High-Frequency AI Vision Active
                </div>
              </div>
            </>
          )}
        </div>

        <div className="p-12 bg-white">
          <div className="flex items-center gap-6 mb-10">
            <div className="p-4 bg-blue-50 text-blue-600 rounded-[1.5rem] shadow-sm">
              <Maximize size={28}/>
            </div>
            <div>
              <h3 className="text-3xl font-black text-slate-900 leading-tight">{title}</h3>
              <p className="text-slate-500 font-bold text-lg">Compatible with all standard 1D/2D Retail Barcodes</p>
            </div>
          </div>
          <button 
            onClick={simulateScan}
            className="w-full py-6 bg-slate-900 text-white rounded-[2rem] font-black text-xl flex items-center justify-center gap-4 hover:bg-slate-800 transition-all active:scale-[0.98] shadow-xl shadow-slate-200"
          >
            <Zap size={24} className="text-amber-400 fill-amber-400"/>
            Manual Trigger (Test Environment)
          </button>
        </div>
      </div>

      <style>{`
        @keyframes laser {
          0% { top: 0%; opacity: 0; }
          10% { opacity: 1; }
          90% { opacity: 1; }
          100% { top: 100%; opacity: 0; }
        }
      `}</style>
    </div>
  );
};

export default Scanner;