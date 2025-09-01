# 🔋 NYC Fleet Monitor - BatteryHackathon

A real-time fleet monitoring system for electric bikes and scooters in New York City, with advanced battery health tracking and emergency response capabilities.

## 🚀 Project Overview

This project addresses critical challenges in electric vehicle fleet management:
- **Real-time battery health monitoring** across 200+ vehicles
- **Thermal runaway detection** and emergency response
- **Predictive maintenance** through battery analytics
- **Fleet optimization** with location-based insights

## ✨ Key Features

### 🔍 Real-Time Monitoring
- **Live vehicle tracking** across NYC with Mapbox integration
- **Battery level monitoring** with color-coded status indicators
- **Temperature surveillance** to prevent thermal runaway incidents
- **Cycle count tracking** for battery lifespan management

### 🚨 Emergency Response System
- **Automatic thermal runaway detection** (150°C+ threshold)
- **Critical temperature alerts** with real-time notifications
- **Emergency incident management** with response tracking
- **Fire department integration** for severe incidents

### 📊 Advanced Analytics
- **Fleet statistics dashboard** with vehicle distribution
- **Battery health metrics** and risk level assessment
- **Geographic clustering** for efficient fleet management
- **Maintenance scheduling** based on battery condition

### 🗺️ Interactive Map Interface
- **Zoom-based visualization** (clusters → individual vehicles)
- **Real-time status updates** with color-coded markers
- **Quick navigation** to critical incidents
- **NYC hub-based distribution** modeling

## 🛠️ Technology Stack

- **Frontend**: React 18 + TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS
- **Maps**: Mapbox GL + React Map GL
- **Icons**: Lucide React
- **Date Handling**: date-fns
- **Linting**: ESLint + TypeScript ESLint

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn
- Mapbox API token

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd BatteryHackathon
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   Create a `.env` file in the root directory:
   ```env
   VITE_MAPBOX_TOKEN=your_mapbox_access_token_here
   ```

4. **Get Mapbox Token**
   - Sign up at [Mapbox](https://www.mapbox.com/)
   - Create a new access token
   - Add it to your `.env` file

5. **Start Development Server**
   ```bash
   npm run dev
   ```

6. **Open Browser**
   Navigate to `http://localhost:5173`

## 📁 Project Structure

```
src/
├── components/           # React components
│   ├── BikeDashboard.tsx      # Bike-specific dashboard
│   ├── EmergencyDashboard.tsx # Emergency incident management
│   ├── StatsDashboard.tsx     # Fleet statistics
│   └── VehicleDashboard.tsx   # Individual vehicle details
├── types.ts             # TypeScript type definitions
├── App.tsx              # Main application component
├── main.tsx             # Application entry point
└── index.css            # Global styles
```

## 🔧 Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run lint` - Run ESLint
- `npm run preview` - Preview production build

## 🎯 Core Functionality

### Vehicle Generation
- **200+ simulated vehicles** distributed across NYC
- **Realistic location modeling** based on NYC hubs
- **Dynamic battery health** with thermal runaway scenarios
- **Status variations**: available, in-use, maintenance

### Battery Health Algorithm
- **Risk level assessment** (low, moderate, high, critical)
- **Temperature monitoring** with emergency thresholds
- **Cycle count tracking** for battery degradation
- **Voltage stability** monitoring

### Emergency Detection
- **Thermal runaway**: 150°C+ (immediate fire department alert)
- **Critical temperature**: 47°C+ (high priority response)
- **High temperature**: 43°C+ (monitoring required)
- **Low battery**: 15%+ (maintenance scheduling)

## 🗺️ NYC Coverage Areas

- **Midtown**: Times Square, Midtown East/West (40% of fleet)
- **Downtown**: Financial District, Lower Manhattan (30% of fleet)
- **Uptown**: Upper East/West Side, Central Park (20% of fleet)
- **Scattered**: Random distribution across NYC (10% of fleet)

## 🚨 Emergency Response Workflow

1. **Detection**: System monitors vehicle temperatures every 30 seconds
2. **Alert**: Critical incidents trigger emergency notifications
3. **Response**: Emergency dashboard tracks incident status
4. **Resolution**: Incidents marked as responded/resolved
5. **Logging**: All events logged with timestamps and details

## 🎨 UI Components

### Main Dashboard
- **Fleet overview** with total vehicle count
- **Real-time statistics** and health metrics
- **Emergency alerts** with quick navigation
- **Map legend** and status indicators

### Vehicle Dashboard
- **Detailed battery information**
- **Location coordinates**
- **Maintenance history**
- **Risk assessment**

### Emergency Dashboard
- **Active incident list**
- **Response tracking**
- **Location focus** functionality
- **Status updates**

## 🔒 Security & Environment

- **Environment variables** for API tokens
- **No hardcoded secrets** in source code
- **TypeScript** for type safety
- **ESLint** for code quality

## 🚧 Development Notes

- **Mock data generation** for demonstration purposes
- **Real-time updates** every 30 seconds
- **Responsive design** with Tailwind CSS
- **Accessibility** considerations in UI components

## 🤝 Contributing

This project was created for a hackathon focused on battery safety and fleet management. Contributions are welcome for:

- **Additional safety features**
- **Enhanced analytics**
- **Mobile responsiveness**
- **Performance optimization**
- **Testing coverage**

## 📄 License

This project is part of the BatteryHackathon and is open source.

## 🙏 Acknowledgments

- **Mapbox** for mapping services
- **React team** for the amazing framework
- **Tailwind CSS** for utility-first styling
- **Hackathon organizers** for the challenge opportunity

---

**Built with ❤️ for safer electric vehicle fleets**
