# PowerCoin - Smart Energy Management System

PowerCoin is a comprehensive solution that combines IoT hardware with a web-based dashboard to revolutionize energy management in underserved communities. The system enables real-time energy monitoring, theft detection, and introduces a digital currency (PowerCoin) for energy transactions.

![PowerCoin Dashboard](power/public/dashboard-preview.png)

## Project Overview

PowerCoin addresses several key challenges in energy distribution and management:

- **Real-time Monitoring**: Track energy consumption patterns with precise metrics
- **Theft Detection**: Advanced sensors detect tampering and unauthorized access
- **Digital Currency**: PowerCoins facilitate energy transactions and incentivize conservation
- **Mesh Network**: Distributed architecture ensures reliability even in areas with limited connectivity

## Repository Structure

- **`/arduino`**: Contains the embedded firmware for smart meter nodes
- **`/power`**: Next.js web application for the management dashboard

## Technology Stack

### Hardware Components
- ESP32 microcontrollers
- Voltage and current sensors
- LCD displays for local monitoring
- Ultrasonic sensors for tamper detection
- Mesh network using PainlessMesh library

### Web Application
- Next.js 15.2 with App Router
- React 19
- TypeScript
- Chart.js for data visualization
- Tailwind CSS for styling

## Getting Started

### Hardware Setup

1. Flash the Arduino sketch to your ESP32 device:
   ```bash
   arduino-cli compile --fqbn esp32:esp32:esp32 arduino/sketch.ino
   arduino-cli upload --port /dev/ttyUSB0 --fqbn esp32:esp32:esp32 arduino/sketch.ino
   ```

2. Connect the following components:
   - Voltage sensor to pin 27
   - Current sensor to pin 26
   - Proximity sensor trigger to pin 12 and echo to pin 14
   - Tamper detection button to pin 13
   - I2C LCD display to SDA/SCL pins

### Dashboard Setup

1. Navigate to the web application directory:
   ```bash
   cd power
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Run the development server:
   ```bash
   npm run dev
   ```

4. Open [http://localhost:3000](http://localhost:3000) to view the dashboard

## Features

### Smart Meter Capabilities
- Real-time voltage and current measurement
- Power factor calculation
- Energy consumption tracking
- Tamper detection with multiple sensor inputs
- Mesh networking for robust communication

### Dashboard Features
- User management and monitoring
- Real-time data visualization
- Energy consumption analytics
- Theft alert management
- PowerCoin transaction history

## Contributing

We welcome contributions to the PowerCoin project! Please follow these steps:

1. Fork the repository
2. Create a feature branch: `git checkout -b my-new-feature`
3. Commit your changes: `git commit -am 'Add some feature'`
4. Push to the branch: `git push origin my-new-feature`
5. Submit a pull request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- This project was developed as part of the Hack for Impact 2025 initiative
- Thanks to all contributors and supporters who made this possible