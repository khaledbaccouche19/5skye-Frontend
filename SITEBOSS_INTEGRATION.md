# SiteBoss Integration Guide

This document explains how to configure and use the SiteBoss integration in the 5Skye frontend.

## Overview

The SiteBoss integration allows you to connect to real SiteBoss tower monitoring devices and display live sensor data in the frontend. This integration includes:

- Real-time data pulling from SiteBoss devices
- Sensor status monitoring (temperature, contact closures, outputs)
- Alert level visualization (normal, warning, critical)
- Configuration management through the UI
- Integration with the existing tower monitoring system

## Configuration

### Environment Variables

Create a `.env.local` file in the frontend root directory with the following variables:

```bash
# SiteBoss Device Configuration
NEXT_PUBLIC_SITEBOSS_HOST=10.9.1.19
NEXT_PUBLIC_SITEBOSS_USERNAME=admin
NEXT_PUBLIC_SITEBOSS_PASSWORD=password
NEXT_PUBLIC_SITEBOSS_ENABLED=true

# Backend Configuration
NEXT_PUBLIC_BACKEND_URL=http://localhost:8088
```

### UI Configuration

You can also configure SiteBoss through the UI:

1. Navigate to **Settings > SiteBoss** in the frontend
2. Enable SiteBoss integration
3. Enter your device details:
   - **Host/IP**: IP address of your SiteBoss device
   - **Username**: Login username
   - **Password**: Login password
4. Test the connection
5. Save the configuration

## Usage

### Viewing SiteBoss Data

1. Go to any tower details page
2. Click on the **SiteBoss** tab
3. View real-time sensor data including:
   - Site information (name, serial, version, uptime)
   - Sensor readings (temperature, contact closures, outputs)
   - Alert levels and status
   - Summary statistics

### Data Refresh

- **Auto-refresh**: Data automatically refreshes every 30 seconds
- **Manual refresh**: Click the "Refresh" button to get latest cached data
- **Fresh pull**: Click "Pull Fresh" to get new data from the device

## API Endpoints

The integration uses the following backend endpoints:

- `GET /api/siteboss/health` - Check SiteBoss service health
- `POST /api/siteboss/pull` - Pull fresh data from device
- `POST /api/siteboss/pull-async` - Pull data asynchronously
- `GET /api/siteboss/latest` - Get latest cached data

## Data Structure

The SiteBoss data includes:

```typescript
interface SiteBossData {
  success: boolean
  timestamp: string
  siteName: string
  serial: string
  uptime: string
  sensorCount: number
  data: {
    unit: {
      siteName: string
      serial: string
      version: string
      hardware: string
      location: { latitude: number, longitude: number }
      uptime: string
      timestamp: { date: string, time: string, lastUpdated: string }
    }
    sensors: Array<{
      id: string
      group: string
      type: string
      name: string
      status: string
      value: string
      alertLevel: 'normal' | 'warning' | 'critical'
      enabled: boolean
    }>
    summary: {
      totalSensors: number
      sensorsByType: Record<string, number>
      alertCounts: { normal: number, warning: number, critical: number }
      lastPull: string
    }
  }
}
```

## Troubleshooting

### Connection Issues

1. **Check network connectivity** to the SiteBoss device
2. **Verify credentials** are correct
3. **Check backend logs** for Python script execution errors
4. **Test connection** using the UI test button

### Data Not Updating

1. **Check SiteBoss service health** in the backend
2. **Verify Python dependencies** are installed in the virtual environment
3. **Check backend logs** for any errors during data pulling
4. **Try manual refresh** or fresh data pull

### Common Error Messages

- **"Connection failed"**: Check network and credentials
- **"SiteBoss data pull failed with exit code: 1"**: Check Python script and dependencies
- **"Failed to get latest SiteBoss data"**: Check backend service status

## Security Notes

- SiteBoss credentials are stored in environment variables
- The backend handles all communication with SiteBoss devices
- No sensitive data is exposed in the frontend
- Use HTTPS in production environments

## Development

### Adding New Sensor Types

To add support for new sensor types:

1. Update the `getSensorIcon` function in `SiteBossDataDisplay` component
2. Add appropriate icons and styling
3. Update the data structure if needed

### Customizing Display

The SiteBoss data display can be customized by modifying:

- `components/siteboss/siteboss-data-display.tsx` - Main display component
- `components/siteboss/siteboss-config.tsx` - Configuration component
- `lib/api-client.ts` - API client methods

## Support

For issues or questions about the SiteBoss integration:

1. Check the backend logs for detailed error messages
2. Verify the Python script works independently
3. Test the backend API endpoints directly
4. Check network connectivity to the SiteBoss device
