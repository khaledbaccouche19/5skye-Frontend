# Backend 3D Model Upload Endpoint

## Overview
The frontend now includes a 3D model upload feature for towers. You need to implement a backend endpoint to handle GLB file uploads.

## Required Endpoint

### POST `/api/upload/model`
Handles 3D model file uploads for towers.

**Request:**
- Method: `POST`
- Content-Type: `multipart/form-data`
- Body:
  - `file`: GLB file (required)
  - `towerName`: String (required) - Name of the tower for file organization

**Response:**
```json
{
  "fileUrl": "string", // URL/path to the uploaded file
  "fileName": "string", // Original filename
  "fileSize": "number", // File size in bytes
  "uploadedAt": "string" // ISO timestamp
}
```

**Error Response:**
```json
{
  "error": "string", // Error message
  "code": "string"   // Error code
}
```

## Implementation Notes

1. **File Validation:**
   - Only accept `.glb` files
   - Maximum file size: 50MB
   - Validate file integrity

2. **File Storage:**
   - Store files in a dedicated directory (e.g., `/uploads/models/`)
   - Use unique filenames to prevent conflicts
   - Consider organizing by tower name or date

3. **Security:**
   - Validate file types
   - Sanitize filenames
   - Consider virus scanning for uploaded files
   - Implement proper authentication/authorization

4. **File Naming Convention:**
   - Format: `{towerName}_{timestamp}_{randomId}.glb`
   - Example: `Downtown5GTower_20241201_abc123.glb`

5. **Database Update:**
   - Add `modelUrl` field to your towers table
   - Store the file path/URL returned by the upload endpoint

## Example Implementation (Node.js/Express)

```javascript
const multer = require('multer');
const path = require('path');

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/models/');
  },
  filename: (req, file, cb) => {
    const towerName = req.body.towerName || 'unnamed';
    const timestamp = Date.now();
    const randomId = Math.random().toString(36).substring(2, 8);
    cb(null, `${towerName}_${timestamp}_${randomId}.glb`);
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'model/gltf-binary' || path.extname(file.originalname).toLowerCase() === '.glb') {
      cb(null, true);
    } else {
      cb(new Error('Only GLB files are allowed'));
    }
  }
});

app.post('/api/upload/model', upload.single('file'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const fileUrl = `/uploads/models/${req.file.filename}`;
    
    res.json({
      fileUrl: fileUrl,
      fileName: req.file.originalname,
      fileSize: req.file.size,
      uploadedAt: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({ error: 'Upload failed', code: 'UPLOAD_ERROR' });
  }
});
```

## Frontend Integration

The frontend will:
1. Allow users to select GLB files
2. Show upload progress
3. Send the file to this endpoint
4. Store the returned `fileUrl` in the tower data
5. Use the `modelUrl` in the 3D viewer component

## Testing

1. Test with valid GLB files
2. Test with invalid file types (should be rejected)
3. Test with files larger than 50MB (should be rejected)
4. Verify the returned fileUrl is accessible
5. Test the 3D viewer with uploaded models
