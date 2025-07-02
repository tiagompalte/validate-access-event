'use client';

import { useState } from "react";
import QRScanner from "../components/QRScanner";
import { TicketData, markTicketAsUsed } from "@/services/Web3Service"; // Adjust the import path as necessary
import { Exception } from "@zxing/library";

interface ScanResult {
  rawData: string;
  ticketData?: TicketData;
  timestamp: Date;
}

export default function Home() {
  const [currentScan, setCurrentScan] = useState<ScanResult | null>(null);
  const [scanHistory, setScanHistory] = useState<ScanResult[]>([]);
  const [error, setError] = useState<string | null>(null);

  const handleQRResult = async (rawData: string, ticketData?: TicketData) => {
    const scanResult: ScanResult = {
      rawData,
      ticketData,
      timestamp: new Date(),
    };   

    let err
    try {
      if (!ticketData) {
        // If ticketData is not provided, treat it as an invalid format
        throw new Exception(`Invalid QR code format: ${rawData}`);
      }

      await markTicketAsUsed(ticketData);
      setCurrentScan(scanResult);
      handleQRError(null)
    } catch (error) {
      err = error;
    }  

    if (err != null) {
      scanResult.ticketData = undefined; // Mark as invalid format
      setCurrentScan(scanResult);
      handleQRError(`Ticket validation failed: ${err}`);
    }
    
    setScanHistory(prev => [scanResult, ...prev.slice(0, 9)]); // Keep last 10 scans
  };

  const handleQRError = (error: string | null) => {
    setError(error);
  };

  const clearHistory = () => {
    setScanHistory([]);
    setCurrentScan(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 p-4">
      <div className="max-w-4xl mx-auto">
        <header className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
            Ticket Validator
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Scan QR codes to validate event tickets
          </p>
        </header>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Scanner Section */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
              Ticket Scanner
            </h2>
            <QRScanner onResult={handleQRResult} onError={handleQRError} />
          </div>

          {/* Results Section */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">
                Validation Results
              </h2>
              {scanHistory.length > 0 && (
                <button
                  onClick={clearHistory}
                  className="text-sm px-3 py-1 text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 border border-red-300 rounded hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                >
                  Clear History
                </button>
              )}
            </div>

            {currentScan ? (
              <div className="space-y-4">
                {currentScan.ticketData ? (
                  <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-700">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="font-semibold text-green-800 dark:text-green-400">
                        Valid Ticket Scanned ✓
                      </h3>
                      <span className="text-xs text-green-600 dark:text-green-400">
                        {currentScan.timestamp.toLocaleTimeString()}
                      </span>
                    </div>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                      <div className="bg-white dark:bg-gray-800 p-3 rounded border">
                        <label className="font-medium text-gray-700 dark:text-gray-300">Ticket ID:</label>
                        <p className="text-gray-900 dark:text-white font-mono">{currentScan.ticketData.ticketId}</p>
                      </div>
                      
                      <div className="bg-white dark:bg-gray-800 p-3 rounded border">
                        <label className="font-medium text-gray-700 dark:text-gray-300">Quantity:</label>
                        <p className="text-gray-900 dark:text-white font-semibold">{currentScan.ticketData.quantity}</p>
                      </div>
                      
                      <div className="bg-white dark:bg-gray-800 p-3 rounded border sm:col-span-2">
                        <label className="font-medium text-gray-700 dark:text-gray-300">Address:</label>
                        <p className="text-gray-900 dark:text-white font-mono text-xs break-all">{currentScan.ticketData.address}</p>
                      </div>
                      
                      <div className="bg-white dark:bg-gray-800 p-3 rounded border">
                        <label className="font-medium text-gray-700 dark:text-gray-300">Date:</label>
                        <p className="text-gray-900 dark:text-white">{currentScan.ticketData.date}</p>
                      </div>
                      
                      <div className="bg-white dark:bg-gray-800 p-3 rounded border">
                        <label className="font-medium text-gray-700 dark:text-gray-300">Signature:</label>
                        <p className="text-gray-900 dark:text-white font-mono text-xs break-all">{currentScan.ticketData.signature}</p>
                      </div>
                    </div>
                  </div>
                ) : (
                    <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-700">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="font-semibold text-yellow-800 dark:text-yellow-400">
                      Invalid QR Code Format ⚠️
                      </h3>
                      <span className="text-xs text-yellow-600 dark:text-yellow-400">
                      {currentScan.timestamp.toLocaleTimeString()}
                      </span>
                    </div>
                    <p className="text-yellow-700 dark:text-yellow-300 text-sm mb-2">
                      The scanned QR code is not a valid ticket format.
                    </p>
                    {error && (
                      <div className="mb-2 text-xs text-red-700 dark:text-red-400 bg-red-100 dark:bg-red-900/30 rounded p-2">
                      Error: {error}
                      </div>
                    )}
                    <details className="text-xs">
                      <summary className="cursor-pointer text-yellow-600 dark:text-yellow-400 hover:text-yellow-800 dark:hover:text-yellow-200">
                      Show raw data
                      </summary>
                      <pre className="mt-2 p-2 bg-yellow-100 dark:bg-yellow-800/30 rounded text-yellow-800 dark:text-yellow-200 break-all whitespace-pre-wrap">
                      {currentScan.rawData}
                      </pre>
                    </details>
                    </div>
                )}

                {scanHistory.length > 1 && (
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                      Scan History:
                    </h3>
                    <div className="space-y-2 max-h-64 overflow-y-auto">
                      {scanHistory.slice(1).map((scanResult, index) => (
                        <div
                          key={index}
                          className="p-3 bg-gray-50 dark:bg-gray-700 rounded border text-sm"
                        >
                          <div className="flex justify-between items-center mb-2">
                            <span className={`text-xs px-2 py-1 rounded ${
                              scanResult.ticketData 
                                ? 'bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100' 
                                : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-800 dark:text-yellow-100'
                            }`}>
                              {scanResult.ticketData ? 'Valid Ticket' : 'Invalid Format'}
                            </span>
                            <span className="text-xs text-gray-500 dark:text-gray-400">
                              {scanResult.timestamp.toLocaleTimeString()}
                            </span>
                          </div>
                          {scanResult.ticketData ? (
                            <div className="text-xs space-y-1">
                              <p><span className="font-medium">ID:</span> {scanResult.ticketData.ticketId}</p>
                              <p><span className="font-medium">Qty:</span> {scanResult.ticketData.quantity}</p>
                              <p><span className="font-medium">Date:</span> {scanResult.ticketData.date}</p>
                            </div>
                          ) : (
                            <p className="text-gray-700 dark:text-gray-300 break-all font-mono text-xs">
                              {scanResult.rawData.length > 100 
                                ? `${scanResult.rawData.substring(0, 100)}...` 
                                : scanResult.rawData}
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-8">
                <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center">
                  <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
                  </svg>
                </div>
                <p className="text-gray-500 dark:text-gray-400">
                  No tickets scanned yet
                </p>
                <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">
                  Scan a QR code containing ticket data
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Info Section */}
        <div className="mt-8 bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
            How to Validate Tickets
          </h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0 w-6 h-6 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
                <span className="text-blue-600 dark:text-blue-400 font-semibold text-xs">1</span>
              </div>
              <p className="text-gray-600 dark:text-gray-400">
                Allow camera permissions when prompted
              </p>
            </div>
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0 w-6 h-6 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
                <span className="text-blue-600 dark:text-blue-400 font-semibold text-xs">2</span>
              </div>
              <p className="text-gray-600 dark:text-gray-400">
                Click "Start Scanning" to activate the camera
              </p>
            </div>
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0 w-6 h-6 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
                <span className="text-blue-600 dark:text-blue-400 font-semibold text-xs">3</span>
              </div>
              <p className="text-gray-600 dark:text-gray-400">
                Point your camera at a ticket QR code
              </p>
            </div>
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0 w-6 h-6 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
                <span className="text-blue-600 dark:text-blue-400 font-semibold text-xs">4</span>
              </div>
              <p className="text-gray-600 dark:text-gray-400">
                View ticket details and validation status
              </p>
            </div>
          </div>
          
          <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
            <h3 className="font-semibold text-blue-800 dark:text-blue-400 mb-2">
              Valid Ticket Format
            </h3>
            <p className="text-blue-700 dark:text-blue-300 text-sm mb-2">
              QR codes must contain JSON data with the following fields:
            </p>
            <pre className="text-xs bg-blue-100 dark:bg-blue-800/30 p-2 rounded font-mono text-blue-800 dark:text-blue-200">
{`{
  "ticketId": "string",
  "quantity": number,
  "address": "string", 
  "date": "string",
  "signature": "string"
}`}
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
}
