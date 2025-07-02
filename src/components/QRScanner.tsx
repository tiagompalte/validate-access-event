'use client';

import { useEffect, useRef, useState } from 'react';
import { BrowserMultiFormatReader, NotFoundException } from '@zxing/library';
import { TicketData } from '@/services/Web3Service'; // Adjust the import path as necessary

interface QRScannerProps {
  onResult: (result: string, ticketData?: TicketData) => void;
  onError?: (error: string) => void;
}

export default function QRScanner({ onResult, onError }: QRScannerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const codeReaderRef = useRef<BrowserMultiFormatReader | null>(null);

  const parseTicketData = (rawData: string): TicketData | null => {
    try {
      const parsed = JSON.parse(rawData);
      
      // Validate required fields
      if (
        typeof parsed.ticketId === 'string' &&
        typeof parsed.quantity === 'number' &&
        typeof parsed.address === 'string' &&
        typeof parsed.date === 'number' &&
        typeof parsed.signature === 'string'
      ) {
        return {
          ticketId: parsed.ticketId,
          quantity: parsed.quantity,
          address: parsed.address,
          date: parsed.date,
          signature: parsed.signature
        };
      } else {
        throw new Error('Missing or invalid required fields');
      }
    } catch (err) {
      console.warn('Failed to parse ticket data:', err);
      return null;
    }
  };

  useEffect(() => {
    const initializeScanner = async () => {
      try {
        // Request camera permission
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'environment' }
        });
        
        setHasPermission(true);
        
        // Stop the initial stream
        stream.getTracks().forEach(track => track.stop());
        
        // Initialize the code reader
        codeReaderRef.current = new BrowserMultiFormatReader();
        
      } catch (err) {
        console.error('Camera access denied:', err);
        setError('Camera access denied. Please allow camera permissions.');
        setHasPermission(false);
        onError?.('Camera access denied');
      }
    };

    initializeScanner();

    return () => {
      if (codeReaderRef.current) {
        codeReaderRef.current.reset();
      }
    };
  }, [onError]);

  const startScanning = async () => {
    if (!codeReaderRef.current || !videoRef.current) return;

    try {
      setIsScanning(true);
      setError(null);

      await codeReaderRef.current.decodeFromVideoDevice(
        null, // use default video device
        videoRef.current,
        (result, error) => {
          if (result) {
            const rawResult = result.getText();
            const ticketData = parseTicketData(rawResult);
            onResult(rawResult, ticketData || undefined);
            setIsScanning(false);
          }
          if (error && !(error instanceof NotFoundException)) {
            console.error('QR Scanner error:', error);
            setError('Error scanning QR code');
            onError?.(error.message);
          }
        }
      );
    } catch (err) {
      console.error('Failed to start scanning:', err);
      setError('Failed to start camera');
      setIsScanning(false);
      onError?.('Failed to start camera');
    }
  };

  const stopScanning = () => {
    if (codeReaderRef.current) {
      codeReaderRef.current.reset();
    }
    setIsScanning(false);
  };

  if (hasPermission === false) {
    return (
      <div className="flex flex-col items-center justify-center p-8 bg-red-50 dark:bg-red-900/20 rounded-lg">
        <div className="text-red-600 dark:text-red-400 text-center">
          <h3 className="text-lg font-semibold mb-2">Camera Access Required</h3>
          <p className="mb-4">Please allow camera permissions to scan QR codes.</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (hasPermission === null) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2">Requesting camera access...</span>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center space-y-4">
      <div className="relative">
        <video
          ref={videoRef}
          className="w-full max-w-md h-auto rounded-lg shadow-lg"
          style={{ display: isScanning ? 'block' : 'none' }}
        />
        
        {!isScanning && (
          <div className="w-full max-w-md h-64 bg-gray-200 dark:bg-gray-700 rounded-lg flex items-center justify-center">
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 bg-gray-300 dark:bg-gray-600 rounded-lg flex items-center justify-center">
                <svg className="w-8 h-8 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <p className="text-gray-500 dark:text-gray-400">Camera ready to scan</p>
            </div>
          </div>
        )}
      </div>

      {error && (
        <div className="text-red-600 dark:text-red-400 text-center p-2 bg-red-50 dark:bg-red-900/20 rounded">
          {error}
        </div>
      )}

      <div className="flex space-x-4">
        {!isScanning ? (
          <button
            onClick={startScanning}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold"
          >
            Start Scanning
          </button>
        ) : (
          <button
            onClick={stopScanning}
            className="px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-semibold"
          >
            Stop Scanning
          </button>
        )}
      </div>

      {isScanning && (
        <div className="text-center">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Point your camera at a QR code to scan it
          </p>
        </div>
      )}
    </div>
  );
}
