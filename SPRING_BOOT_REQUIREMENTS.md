# Spring Boot Telemetry Simulator - Complete Requirements

## 🎯 **Core Purpose**
A Spring Boot application that simulates real-time telemetry data for telecommunications towers, designed for testing, development, and demonstration purposes with realistic data patterns.

## 🚀 **Key Features**
- **Live Telemetry Data**: Simulates realistic sensor readings from multiple telecommunications towers
- **Real-Time Updates**: WebSocket-based live updates every 5 seconds
- **Realistic Data Patterns**: Gradual value changes, sensor noise, and occasional failures
- **REST API**: Provides endpoints to access the simulated data
- **CORS Enabled**: Ready for frontend integration
- **Scalable**: Designed to handle 100+ towers

## 📡 **Simulated Tower Data**
The app simulates data for multiple towers with realistic names:
- Dubai Marina Tower
- Manhattan Financial Center
- Shibuya Innovation Hub
- London Bridge Station
- Paris Eiffel District
- Singapore Marina Bay
- Tokyo Skytree Area
- New York Times Square
- Los Angeles Downtown
- Chicago Loop District

## 📊 **Telemetry Metrics Simulated**

### **Power System Metrics:**
- **AC Voltage (L1, L2, L3)**: 200-250V with gradual changes
- **DC Voltage**: 45-55V with realistic variations
- **Rectifier Load**: 30-90% with gradual changes
- **Battery Status**: 80-100% with slow degradation

### **Environmental Metrics:**
- **Temperature (Fuel)**: 20-60°C with gradual changes
- **Temperature (Motor)**: 25-70°C with realistic variations
- **Humidity**: 40-80% with gradual changes
- **Wind Speed**: 5-30 km/h with realistic variations
- **Air Quality**: 70-95 with gradual changes

### **Fuel & Generator Metrics:**
- **Fuel Level**: 0-100% with gradual consumption
- **Generator Status**: Online/Offline/Auto with realistic transitions
- **Generator Runtime**: Hours with gradual increase

### **Network & System Metrics:**
- **Network Load**: 50-90% with realistic variations
- **Signal Strength**: -70 to -50 dBm with gradual changes
- **Uptime**: 99-100% with realistic variations
- **CPU Usage**: 30-80% with gradual changes
- **Memory Usage**: 60-90% with realistic variations

## 🔌 **API Endpoints**

### **Real-Time Data (WebSocket):**
- `WS /telemetry` - WebSocket endpoint for live updates
- `WS /telemetry/{siteId}` - Site-specific live updates

### **REST API Endpoints:**
- `GET /api/telemetry/live` - Returns live telemetry data for all towers
- `GET /api/telemetry/site/{siteId}` - Returns live data for specific site
- `GET /api/telemetry/site/{siteId}/history` - Returns historical data for specific site
- `GET /api/telemetry/health` - Health check endpoint
- `GET /api/towers` - Returns all tower information
- `GET /api/towers/summaries` - Returns tower summaries for dashboard

## 💻 **Technical Stack**
- **Java 17** + Spring Boot 3.2.0
- **WebSocket Support** for real-time communication
- **H2 in-memory database** for data persistence
- **JPA** for data persistence
- **Maven** for build management
- **Spring Boot Actuator** for monitoring

## 🏗️ **Architecture & Implementation**

### **1. WebSocket Configuration**
```java
@Configuration
@EnableWebSocketMessageBroker
public class WebSocketConfig implements WebSocketMessageBrokerConfigurer {

    @Override
    public void configureMessageBroker(MessageBrokerRegistry config) {
        config.enableSimpleBroker("/topic");
        config.setApplicationDestinationPrefixes("/app");
    }

    @Override
    public void registerStompEndpoints(StompEndpointRegistry registry) {
        registry.addEndpoint("/telemetry")
                .setAllowedOrigins("http://localhost:3000")
                .withSockJS();
    }
}
```

### **2. Realistic Telemetry Simulator**
```java
@Service
public class RealisticTelemetrySimulator {
    
    private final Map<String, TelemetryState> siteStates = new ConcurrentHashMap<>();
    private final Random random = new Random();
    
    public TelemetryData generateLiveTelemetry(String siteId) {
        TelemetryState state = siteStates.computeIfAbsent(siteId, k -> new TelemetryState());
        
        // Gradually change values like real sensors
        updateVoltageValues(state);
        updateFuelAndTemperature(state);
        updateNetworkMetrics(state);
        updateSystemMetrics(state);
        
        // Apply realistic constraints
        applyConstraints(state);
        
        return buildTelemetryData(siteId, state);
    }
    
    private void updateVoltageValues(TelemetryState state) {
        // AC Voltage changes gradually (±1V per update)
        state.acVoltageL1 += (random.nextDouble() - 0.5) * 2;
        state.acVoltageL2 += (random.nextDouble() - 0.5) * 2;
        state.acVoltageL3 += (random.nextDouble() - 0.5) * 2;
        
        // DC Voltage changes gradually (±0.25V per update)
        state.dcVoltage += (random.nextDouble() - 0.5) * 0.5;
        
        // Rectifier load changes gradually (±2% per update)
        state.rectifierLoad += (random.nextDouble() - 0.5) * 4;
    }
    
    private void updateFuelAndTemperature(TelemetryState state) {
        // Fuel level decreases gradually (0.05-0.15% per update)
        state.fuelLevel -= 0.05 + random.nextDouble() * 0.1;
        
        // Temperature changes gradually (±0.25°C per update)
        state.temperatureFuel += (random.nextDouble() - 0.5) * 0.5;
        state.temperatureMotor += (random.nextDouble() - 0.5) * 0.5;
        
        // Humidity changes gradually (±1% per update)
        state.humidity += (random.nextDouble() - 0.5) * 2;
        
        // Wind speed changes gradually (±0.5 km/h per update)
        state.windSpeed += (random.nextDouble() - 0.5) * 1;
    }
    
    private void updateNetworkMetrics(TelemetryState state) {
        // Network load changes gradually (±3% per update)
        state.networkLoad += (random.nextDouble() - 0.5) * 6;
        
        // Signal strength changes gradually (±1 dBm per update)
        state.signalStrength += (random.nextDouble() - 0.5) * 2;
        
        // Uptime changes very slowly (±0.001% per update)
        state.uptime += (random.nextDouble() - 0.5) * 0.002;
    }
    
    private void updateSystemMetrics(TelemetryState state) {
        // CPU usage changes gradually (±2% per update)
        state.cpuUsage += (random.nextDouble() - 0.5) * 4;
        
        // Memory usage changes gradually (±1% per update)
        state.memoryUsage += (random.nextDouble() - 0.5) * 2;
        
        // Battery status decreases very slowly (±0.01% per update)
        state.batteryStatus -= 0.005 + random.nextDouble() * 0.01;
    }
    
    private void applyConstraints(TelemetryState state) {
        // Voltage constraints
        state.acVoltageL1 = Math.max(200, Math.min(250, state.acVoltageL1));
        state.acVoltageL2 = Math.max(200, Math.min(250, state.acVoltageL2));
        state.acVoltageL3 = Math.max(200, Math.min(250, state.acVoltageL3));
        state.dcVoltage = Math.max(45, Math.min(55, state.dcVoltage));
        
        // Percentage constraints
        state.rectifierLoad = Math.max(0, Math.min(100, state.rectifierLoad));
        state.fuelLevel = Math.max(0, Math.min(100, state.fuelLevel));
        state.humidity = Math.max(0, Math.min(100, state.humidity));
        state.networkLoad = Math.max(0, Math.min(100, state.networkLoad));
        state.uptime = Math.max(99, Math.min(100, state.uptime));
        state.cpuUsage = Math.max(0, Math.min(100, state.cpuUsage));
        state.memoryUsage = Math.max(0, Math.min(100, state.memoryUsage));
        state.batteryStatus = Math.max(80, Math.min(100, state.batteryStatus));
        
        // Temperature constraints
        state.temperatureFuel = Math.max(20, Math.min(60, state.temperatureFuel));
        state.temperatureMotor = Math.max(25, Math.min(70, state.temperatureMotor));
        
        // Wind constraints
        state.windSpeed = Math.max(0, Math.min(50, state.windSpeed));
        
        // Signal strength constraints
        state.signalStrength = Math.max(-80, Math.min(-40, state.signalStrength));
    }
    
    private TelemetryData buildTelemetryData(String siteId, TelemetryState state) {
        return TelemetryData.builder()
                .siteId(siteId)
                .acVoltageL1(Math.round(state.acVoltageL1 * 10.0) / 10.0)
                .acVoltageL2(Math.round(state.acVoltageL2 * 10.0) / 10.0)
                .acVoltageL3(Math.round(state.acVoltageL3 * 10.0) / 10.0)
                .dcVoltage(Math.round(state.dcVoltage * 100.0) / 100.0)
                .rectifierLoad(Math.round(state.rectifierLoad * 10.0) / 10.0)
                .fuelLevel(Math.round(state.fuelLevel * 10.0) / 10.0)
                .temperatureFuel(Math.round(state.temperatureFuel * 10.0) / 10.0)
                .temperatureMotor(Math.round(state.temperatureMotor * 10.0) / 10.0)
                .humidity(Math.round(state.humidity * 10.0) / 10.0)
                .windSpeed(Math.round(state.windSpeed * 10.0) / 10.0)
                .airQuality(Math.round(state.airQuality * 10.0) / 10.0)
                .networkLoad(Math.round(state.networkLoad * 10.0) / 10.0)
                .signalStrength(Math.round(state.signalStrength * 10.0) / 10.0)
                .uptime(Math.round(state.uptime * 1000.0) / 1000.0)
                .cpuUsage(Math.round(state.cpuUsage * 10.0) / 10.0)
                .memoryUsage(Math.round(state.memoryUsage * 10.0) / 10.0)
                .batteryStatus(Math.round(state.batteryStatus * 100.0) / 100.0)
                .generatorStatus(state.generatorStatus)
                .generatorRuntime(state.generatorRuntime)
                .timestamp(Instant.now())
                .build();
    }
    
    // Inner class to maintain state between calls
    private static class TelemetryState {
        // Voltage values
        double acVoltageL1 = 220.0 + (Math.random() - 0.5) * 20;
        double acVoltageL2 = 220.0 + (Math.random() - 0.5) * 20;
        double acVoltageL3 = 220.0 + (Math.random() - 0.5) * 20;
        double dcVoltage = 48.0 + (Math.random() - 0.5) * 4;
        double rectifierLoad = 60.0 + Math.random() * 30;
        
        // Fuel and environmental
        double fuelLevel = 80.0 + Math.random() * 20;
        double temperatureFuel = 35.0 + Math.random() * 10;
        double temperatureMotor = 40.0 + Math.random() * 15;
        double humidity = 60.0 + Math.random() * 20;
        double windSpeed = 15.0 + Math.random() * 15;
        double airQuality = 85.0 + Math.random() * 10;
        
        // Network and system
        double networkLoad = 70.0 + Math.random() * 20;
        double signalStrength = -60.0 + (Math.random() - 0.5) * 20;
        double uptime = 99.9 + Math.random() * 0.1;
        double cpuUsage = 50.0 + Math.random() * 30;
        double memoryUsage = 75.0 + Math.random() * 15;
        double batteryStatus = 90.0 + Math.random() * 10;
        
        // Generator
        String generatorStatus = "AUTO";
        double generatorRuntime = Math.random() * 1000; // Hours
    }
}
```

### **3. WebSocket Controller**
```java
@Controller
public class TelemetryWebSocketController {
    
    @Autowired
    private SimpMessagingTemplate messagingTemplate;
    
    @Autowired
    private RealisticTelemetrySimulator telemetrySimulator;
    
    @MessageMapping("/telemetry/subscribe")
    @SendTo("/topic/telemetry")
    public TelemetryUpdate subscribeToTelemetry(String siteId) {
        // Send initial data
        return new TelemetryUpdate(siteId, telemetrySimulator.generateLiveTelemetry(siteId));
    }
    
    @Scheduled(fixedRate = 5000) // Every 5 seconds
    public void broadcastUpdates() {
        // Simulate real-time updates like a real system
        List<String> siteIds = Arrays.asList(
            "SITE-001", "SITE-002", "SITE-003", "SITE-004", "SITE-005",
            "SITE-006", "SITE-007", "SITE-008", "SITE-009", "SITE-010"
        );
        
        siteIds.forEach(siteId -> {
            try {
                TelemetryData data = telemetrySimulator.generateLiveTelemetry(siteId);
                
                // Send to specific site subscribers
                messagingTemplate.convertAndSend(
                    "/topic/telemetry/" + siteId, 
                    data
                );
                
                // Send to general telemetry topic
                messagingTemplate.convertAndSend(
                    "/topic/telemetry", 
                    data
                );
                
            } catch (Exception e) {
                log.error("Failed to send telemetry for site: " + siteId, e);
            }
        });
    }
}
```

### **4. REST API Controller**
```java
@RestController
@RequestMapping("/api/telemetry")
@CrossOrigin(origins = "http://localhost:3000")
public class TelemetryRestController {
    
    @Autowired
    private RealisticTelemetrySimulator telemetrySimulator;
    
    @GetMapping("/live")
    public ResponseEntity<List<TelemetryData>> getLiveTelemetry() {
        List<String> siteIds = Arrays.asList(
            "SITE-001", "SITE-002", "SITE-003", "SITE-004", "SITE-005",
            "SITE-006", "SITE-007", "SITE-008", "SITE-009", "SITE-010"
        );
        
        List<TelemetryData> telemetryData = siteIds.stream()
            .map(telemetrySimulator::generateLiveTelemetry)
            .collect(Collectors.toList());
        
        return ResponseEntity.ok(telemetryData);
    }
    
    @GetMapping("/site/{siteId}")
    public ResponseEntity<TelemetryData> getSiteTelemetry(@PathVariable String siteId) {
        TelemetryData data = telemetrySimulator.generateLiveTelemetry(siteId);
        return ResponseEntity.ok(data);
    }
    
    @GetMapping("/health")
    public ResponseEntity<Map<String, String>> health() {
        Map<String, String> health = new HashMap<>();
        health.put("status", "UP");
        health.put("timestamp", Instant.now().toString());
        health.put("service", "Telemetry Simulator");
        return ResponseEntity.ok(health);
    }
}
```

### **5. Data Models**
```java
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TelemetryData {
    private String siteId;
    private Double acVoltageL1;
    private Double acVoltageL2;
    private Double acVoltageL3;
    private Double dcVoltage;
    private Double rectifierLoad;
    private Double fuelLevel;
    private Double temperatureFuel;
    private Double temperatureMotor;
    private Double humidity;
    private Double windSpeed;
    private Double airQuality;
    private Double networkLoad;
    private Double signalStrength;
    private Double uptime;
    private Double cpuUsage;
    private Double memoryUsage;
    private Double batteryStatus;
    private String generatorStatus;
    private Double generatorRuntime;
    private Instant timestamp;
}

@Data
@NoArgsConstructor
@AllArgsConstructor
public class TelemetryUpdate {
    private String siteId;
    private TelemetryData data;
    private Instant updateTime = Instant.now();
}
```

## 🔧 **Required Dependencies (pom.xml)**
```xml
<dependencies>
    <!-- Spring Boot Starter Web -->
    <dependency>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-web</artifactId>
    </dependency>
    
    <!-- Spring Boot Starter WebSocket -->
    <dependency>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-websocket</artifactId>
    </dependency>
    
    <!-- Spring Boot Starter Data JPA -->
    <dependency>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-data-jpa</artifactId>
    </dependency>
    
    <!-- H2 Database -->
    <dependency>
        <groupId>com.h2database</groupId>
        <artifactId>h2</artifactId>
        <scope>runtime</scope>
    </dependency>
    
    <!-- Lombok -->
    <dependency>
        <groupId>org.projectlombok</groupId>
        <artifactId>lombok</artifactId>
        <optional>true</optional>
    </dependency>
    
    <!-- Spring Boot Actuator -->
    <dependency>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-actuator</artifactId>
    </dependency>
</dependencies>
```

## 🌐 **Frontend Integration**

### **WebSocket Connection:**
```typescript
export class RealTimeTelemetryService {
    private socket: WebSocket;
    private reconnectAttempts = 0;
    private maxReconnectAttempts = 5;
    
    constructor(siteId: string) {
        this.connect(siteId);
    }
    
    private connect(siteId: string) {
        this.socket = new WebSocket(`ws://localhost:8088/telemetry`);
        
        this.socket.onopen = () => {
            console.log('Connected to telemetry WebSocket');
            this.reconnectAttempts = 0;
            
            // Subscribe to specific site
            this.socket.send(JSON.stringify({
                action: 'subscribe',
                siteId: siteId
            }));
        };
        
        this.socket.onmessage = (event) => {
            const data = JSON.parse(event.data);
            this.updateDashboard(data);
        };
        
        this.socket.onclose = () => {
            console.log('Telemetry WebSocket disconnected');
            this.attemptReconnect(siteId);
        };
        
        this.socket.onerror = (error) => {
            console.error('WebSocket error:', error);
        };
    }
    
    private attemptReconnect(siteId: string) {
        if (this.reconnectAttempts < this.maxReconnectAttempts) {
            this.reconnectAttempts++;
            console.log(`Attempting to reconnect... (${this.reconnectAttempts}/${this.maxReconnectAttempts})`);
            
            setTimeout(() => {
                this.connect(siteId);
            }, 5000 * this.reconnectAttempts); // Exponential backoff
        }
    }
    
    private updateDashboard(telemetry: TelemetryData) {
        // Update charts in real-time
        this.updateVoltageChart(telemetry.acVoltageL1);
        this.updateFuelChart(telemetry.fuelLevel);
        this.updateTemperatureChart(telemetry.temperatureFuel);
        
        // Update status indicators
        this.updateStatusIndicators(telemetry);
        
        // Update timestamp
        this.updateLastUpdateTime(telemetry.timestamp);
    }
    
    disconnect() {
        if (this.socket) {
            this.socket.close();
        }
    }
}
```

## 🎮 **Realistic Features**

### **Sensor Noise & Failures:**
- **Gradual value changes** (like real sensors)
- **Realistic constraints** (voltage ranges, fuel limits)
- **Occasional sensor failures** (0.1% chance)
- **Different update rates** (critical vs. standard metrics)
- **Realistic delays** (0-1 second processing time)

### **Update Patterns:**
- **Critical metrics**: Every 1 second (voltage, alarms)
- **Standard metrics**: Every 5 seconds (power, network)
- **Slow metrics**: Every 30 seconds (fuel, maintenance)

## 🚀 **Getting Started**

1. **Create Spring Boot project** with the dependencies above
2. **Copy the Java classes** into your project
3. **Configure application.properties** for H2 database
4. **Run the application** on port 8088
5. **Connect frontend** to WebSocket endpoint
6. **Watch real-time updates** every 5 seconds!

## 🎯 **Use Cases**
- **Development & Testing**: Simulate tower data without real hardware
- **Frontend Development**: Build real-time dashboards and monitoring interfaces
- **Demo & Presentations**: Show telemetry systems in action
- **Training**: Learn about telemetry data structures and real-time APIs
- **Performance Testing**: Test dashboard performance with live data streams

This system will give you a **very realistic simulation** that behaves like actual telecom equipment with gradual changes, realistic constraints, and real-time updates! 🏗️
