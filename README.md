# Mero Aausadhi

## Overview
Mero Aausadhi is an innovative medicine analysis application that helps users identify and learn about medications through image recognition technology. Simply take a picture of any medicine, and get instant access to detailed information about its composition, uses, and precautions.

## Key Features
- Medicine identification through image recognition
- Detailed medication information including:
  - Active ingredients
  - Usage instructions
  - Side effects
  - Contraindications
  - Generic alternatives
- Offline medicine database
- Multi-language support (English & Nepali)
- Medicine reminder system
- Emergency medicine information
- Pharmacy locator

## Technical Stack
- Frontend: React (NEXT JS)
- Backend: Node.js & Express
- Image Recognition: TensorFlow
- OCR: Tesseract.js

## Installation

### Prerequisites
- Node.js (v14 or higher)
- React Native development environment
- Android Studio / Xcode

### Setup Steps
1. Clone the repository
```bash
git clone https://github.com/yourusername/mero-aausadhi.git
cd mero-aausadhi
```

2. Install dependencies
```bash
npm install
cd ios && pod install && cd .. # For iOS development
```

3. Configure environment
```bash
cp .env.example .env
```
Edit `.env` with your API keys and database configuration

## Usage
1. Development
```bash
npm run start # Start Metro bundler
npm run android # Run on Android
npm run ios # Run on iOS
```

2. Build
```bash
npm run build:android # For Android APK
npm run build:ios # For iOS IPA
```

## Project Structure
```
mero-aausadhi/
├── src/
│   ├── components/
│   ├── screens/
│   ├── services/
│   │   ├── imageRecognition/
│   │   └── database/
│   ├── models/
│   └── utils/
├── assets/
│   ├── ml-models/
│   └── images/
├── docs/
└── tests/
```

## API Documentation
Detailed API documentation is available in the `/docs` directory.

## Privacy & Security
- All image processing is done locally on the device
- No personal medical data is stored on remote servers
- Compliant with healthcare data protection standards

## Contributing
We welcome contributions! Please see our contributing guidelines in CONTRIBUTING.md.

## License
This project is licensed under the MIT License - see the LICENSE file for details.

## Support
For support:
- Open an issue on GitHub
- Email: subodhpandey657@gmail.com

## Acknowledgments
- Medicine database provided by Nepal Medical Council
- Image recognition model trained in collaboration with leading pharmacologists
