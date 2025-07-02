# QR Code Scanner App

A modern QR code scanner application built with Next.js 15, React, and ZXing library.

## Features

- 📱 Camera access to scan QR codes
- 🎯 Real-time QR code detection
- 📝 Scan history tracking
- 🔗 Automatic URL detection and link opening
- 🌓 Dark/Light mode support
- 📱 Responsive design for mobile and desktop

## Getting Started

1. **Install dependencies:**

   ```bash
   npm install
   ```

2. **Run the development server:**

   ```bash
   npm run dev
   ```

3. **Open in browser:**
   Navigate to [http://localhost:5000](http://localhost:5000)

## How to Use

1. **Allow Camera Access:** When prompted, grant camera permissions to the browser
2. **Start Scanning:** Click the "Start Scanning" button to activate the camera
3. **Scan QR Codes:** Point your camera at a QR code
4. **View Results:** Scanned results will appear in the results panel
5. **Access History:** View your last 10 scanned QR codes

## Technical Details

- **Framework:** Next.js 15 with App Router
- **Styling:** Tailwind CSS
- **QR Scanner:** @zxing/library and @zxing/browser
- **TypeScript:** Full TypeScript support

## Camera Requirements

- HTTPS is required for camera access (except on localhost)
- Mobile devices will use the rear camera by default
- Desktop computers will use the default camera

## Browser Compatibility

This app works on all modern browsers that support:

- MediaDevices API
- getUserMedia API
- WebRTC

## Development

The project structure:

- `src/app/page.tsx` - Main scanner page
- `src/components/QRScanner.tsx` - QR scanner component
- `src/app/globals.css` - Global styles
- `src/app/layout.tsx` - App layout

## Build and Deploy

```bash
# Build for production
npm run build

# Start production server
npm start
```
