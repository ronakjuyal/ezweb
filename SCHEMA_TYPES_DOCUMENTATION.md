# Component Schema Types - Complete Documentation

This document describes all available schema field types used in the EZWeb platform for component customization and rendering in the mobile app.

---

## Overview

The schema system allows components to define customizable properties that users can edit through the **Flutter mobile app**. Each field type determines how the property is displayed and edited in the app's UI.

### Schema Structure

```json
{
  "name": "ComponentName",
  "displayName": "Display Name",
  "description": "Component description",
  "category": "Category",
  "version": "1.0.0",
  "schema": {
    "fieldName": {
      "type": "text|image|color|number|boolean|richtext|url",
      "label": "Field Label",
      "default": "default value",
      "required": true|false,
      "description": "Field description"
    }
  }
}
```

---

## Available Field Types

### 1. **text**
Single-line text input field.

**Schema Definition:**
```json
{
  "title": {
    "type": "text",
    "label": "Title",
    "default": "Default Title",
    "required": true
  }
}
```

**Mobile App UI:**
- Renders as: `TextFormField` (single line)
- Input: Keyboard text input
- Validation: Required check if `required: true`

**Use Cases:**
- Titles, headings
- Short text labels
- Button text
- Names, tags

**Example Value:**
```json
"title": "Welcome to Our Website"
```

---

### 2. **richtext**
Multi-line text area for longer content.

**Schema Definition:**
```json
{
  "description": {
    "type": "richtext",
    "label": "Description",
    "default": "Enter description here",
    "required": false
  }
}
```

**Mobile App UI:**
- Renders as: `TextFormField` with `maxLines: 5`
- Input: Keyboard text input (multi-line)
- Validation: Required check if `required: true`

**Use Cases:**
- Long descriptions
- Paragraphs
- Article content
- Multi-line messages

**Example Value:**
```json
"description": "This is a longer description that can span multiple lines and contain detailed information about the component."
```

---

### 3. **url**
URL input field with validation.

**Schema Definition:**
```json
{
  "buttonLink": {
    "type": "url",
    "label": "Button Link",
    "default": "#",
    "required": false
  }
}
```

**Mobile App UI:**
- Renders as: `TextFormField` with link icon
- Input: Keyboard with URL type
- Validation:
  - Required check if `required: true`
  - URL format validation (must have scheme: http/https)

**Use Cases:**
- Button links
- External URLs
- Navigation links
- Social media links

**Example Value:**
```json
"buttonLink": "https://example.com/contact"
```

---

### 4. **color**
Color picker for selecting colors.

**Schema Definition:**
```json
{
  "backgroundColor": {
    "type": "color",
    "label": "Background Color",
    "default": "#1e3a8a",
    "required": false
  }
}
```

**Mobile App UI:**
- Renders as: Color preview box with picker dialog
- Input: Color picker dialog (uses `flutter_colorpicker`)
- Display: Shows current color in a preview box
- Value Format: Hex color code (e.g., `#1e3a8a`)

**Use Cases:**
- Background colors
- Text colors
- Border colors
- Theme colors

**Example Value:**
```json
"backgroundColor": "#1e3a8a"
```

---

### 5. **number**
Numeric input field.

**Schema Definition:**
```json
{
  "price": {
    "type": "number",
    "label": "Price",
    "default": 0,
    "required": true
  }
}
```

**Mobile App UI:**
- Renders as: `TextFormField` with numeric keyboard
- Input: Numeric keyboard
- Validation:
  - Required check if `required: true`
  - Parses to `double` in Flutter

**Use Cases:**
- Prices
- Quantities
- Dimensions (width, height)
- Percentages
- Counters

**Example Value:**
```json
"price": 29.99
```

---

### 6. **boolean**
Toggle switch for true/false values.

**Schema Definition:**
```json
{
  "showButton": {
    "type": "boolean",
    "label": "Show Button",
    "default": true,
    "required": false
  }
}
```

**Mobile App UI:**
- Renders as: `SwitchListTile` (toggle switch)
- Input: Tap to toggle on/off
- Display: Shows label with switch

**Use Cases:**
- Show/hide elements
- Enable/disable features
- True/false options
- Active/inactive states

**Example Value:**
```json
"showButton": true
```

---

### 7. **image** 🎯
Image upload field with picker and preview.

**Schema Definition:**
```json
{
  "imageUrl": {
    "type": "image",
    "label": "Side Image",
    "default": "",
    "required": false,
    "description": "Image to display beside the content"
  }
}
```

**Mobile App UI:**
- Renders as: Image preview + upload button
- Input: Image picker from gallery (uses `image_picker`)
- Process:
  1. User taps "Upload Image" button
  2. Opens gallery picker
  3. Selects image (max 1920x1080, 85% quality)
  4. Uploads to S3 via API (`/api/media/upload`)
  5. Stores returned S3 URL in schema data
- Display: Shows image preview if URL exists
- Features:
  - Remove image button (X icon)
  - Loading indicator during upload
  - Error handling with snackbar
  - Image compression

**API Endpoint Used:**
```
POST /api/media/upload
Parameters:
  - file: MultipartFile (image bytes)
  - folder: "components" (default)
Response:
  - s3Url: string (full S3 URL)
```

**Use Cases:**
- Hero images
- Background images
- Product images
- Profile pictures
- Thumbnails
- Gallery images

**Example Value:**
```json
"imageUrl": "https://ezweb-bucket.s3.amazonaws.com/components/hero-image-123.jpg"
```

---

## Flutter Mobile App Implementation

### How Schema Types are Rendered

The Flutter app's `ComponentFormBuilder` widget (`component_form_builder.dart`) dynamically generates form fields based on the schema:

```dart
Widget _buildFieldWidget(String key, Map<String, dynamic> field) {
  final type = field['type'] as String;

  switch (type) {
    case 'text':
      return TextFormField(...);

    case 'url':
      return TextFormField(keyboardType: TextInputType.url, ...);

    case 'number':
      return TextFormField(keyboardType: TextInputType.number, ...);

    case 'boolean':
      return SwitchListTile(...);

    case 'color':
      return _buildColorPicker(...);

    case 'image':
      return _buildImagePicker(...);

    case 'richtext':
      return TextFormField(maxLines: 5, ...);

    default:
      return TextFormField(...);
  }
}
```

### Image Upload Flow

```
User Action → Image Picker → Read Bytes → API Upload → S3 URL Returned → Store in Form Data
```

**Code Reference:**
```dart
// File: component_form_builder.dart (lines 448-496)
Future<void> _pickAndUploadImage(String key) async {
  // 1. Pick image from gallery
  final XFile? image = await picker.pickImage(
    source: ImageSource.gallery,
    maxWidth: 1920,
    maxHeight: 1080,
    imageQuality: 85,
  );

  // 2. Upload to S3
  final imageUrl = await _apiService.uploadMedia(
    bytes,
    fileName,
    'image/jpeg',
    'components',
  );

  // 3. Store S3 URL
  setState(() {
    _formData[key] = imageUrl;
  });
}
```

---

## Complete Schema Example

Here's a complete schema using all available field types:

```json
{
  "name": "HeroComponent",
  "displayName": "Hero Section",
  "description": "A customizable hero section with title, subtitle, CTA button, and optional image or background",
  "category": "Hero",
  "version": "1.0.0",
  "schema": {
    "title": {
      "type": "text",
      "label": "Title",
      "default": "Welcome to Our Website",
      "required": true
    },
    "subtitle": {
      "type": "text",
      "label": "Subtitle",
      "default": "Build amazing websites without code",
      "required": true
    },
    "description": {
      "type": "richtext",
      "label": "Description",
      "default": "",
      "required": false
    },
    "buttonText": {
      "type": "text",
      "label": "Button Text",
      "default": "Get Started",
      "required": false
    },
    "buttonLink": {
      "type": "url",
      "label": "Button Link",
      "default": "#",
      "required": false
    },
    "showButton": {
      "type": "boolean",
      "label": "Show Button",
      "default": true,
      "required": false
    },
    "backgroundColor": {
      "type": "color",
      "label": "Background Color",
      "default": "#1e3a8a",
      "required": false
    },
    "textColor": {
      "type": "color",
      "label": "Text Color",
      "default": "#ffffff",
      "required": false
    },
    "backgroundImage": {
      "type": "image",
      "label": "Background Image",
      "default": "",
      "required": false,
      "description": "Full-width background image (overrides background color)"
    },
    "showImage": {
      "type": "boolean",
      "label": "Show Side Image",
      "default": false,
      "required": false
    },
    "imageUrl": {
      "type": "image",
      "label": "Side Image",
      "default": "",
      "required": false,
      "description": "Image to display beside the content"
    },
    "imagePosition": {
      "type": "text",
      "label": "Image Position",
      "default": "right",
      "required": false,
      "description": "Position of the side image: 'left' or 'right'"
    },
    "imageAlt": {
      "type": "text",
      "label": "Image Alt Text",
      "default": "Hero Image",
      "required": false
    },
    "minHeight": {
      "type": "number",
      "label": "Minimum Height (vh)",
      "default": 100,
      "required": false
    }
  }
}
```

---

## Schema Data Storage

When a user customizes a component in the mobile app, the values are stored as JSON in the `website_component` table:

**Database Table:** `website_component`
- `id`: Component instance ID
- `website_id`: The website this component belongs to
- `component_registry_id`: Reference to component template
- `schema_data`: JSON string with user-customized values
- `position`: Order on the page
- `visible`: Show/hide component

**Example `schema_data` value:**
```json
{
  "title": "My Custom Website",
  "subtitle": "This is using custom schema data!",
  "buttonText": "Learn More",
  "buttonLink": "https://example.com",
  "showButton": true,
  "backgroundColor": "#7c3aed",
  "textColor": "#ffffff",
  "backgroundImage": "",
  "showImage": true,
  "imageUrl": "https://ezweb-bucket.s3.amazonaws.com/components/my-hero-image.jpg",
  "imagePosition": "right",
  "imageAlt": "Beautiful hero image",
  "minHeight": 80
}
```

---

## Component Props Interface

Components receive the schema data as a `data` prop:

**TypeScript Interface (Frontend):**
```typescript
export interface SchemaField {
  type: 'text' | 'image' | 'color' | 'number' | 'boolean' | 'richtext' | 'url';
  default: any;
  editable: boolean;
  label?: string;
  required?: boolean;
  validation?: any;
}
```

**React Component Props:**
```jsx
export default function HeroComponent({ data }) {
  const {
    title = 'Default Title',
    subtitle = 'Default Subtitle',
    backgroundColor = '#1e3a8a',
    imageUrl = '',
    showButton = true,
    // ... destructure all schema fields with defaults
  } = data || {};

  return (
    <div style={{ backgroundColor }}>
      <h1>{title}</h1>
      <p>{subtitle}</p>
      {showButton && <button>Click me</button>}
      {imageUrl && <img src={imageUrl} alt="Hero" />}
    </div>
  );
}
```

---

## Validation Rules

### Field-Level Validation

1. **text**:
   - Required: Must not be empty if `required: true`

2. **richtext**:
   - Required: Must not be empty if `required: true`

3. **url**:
   - Required: Must not be empty if `required: true`
   - Format: Must be valid URL with scheme (http/https)

4. **number**:
   - Required: Must not be empty if `required: true`
   - Type: Must be parseable as number

5. **color**:
   - Format: Must be valid hex color (e.g., #1e3a8a)

6. **boolean**:
   - No validation (always true/false)

7. **image**:
   - Required: Must have uploaded image if `required: true`
   - Upload: Max 1920x1080, 85% quality
   - Folder: Stored in "components" S3 folder

---

## Best Practices

### 1. **Always Provide Defaults**
Every field should have a sensible default value:
```json
{
  "title": {
    "type": "text",
    "default": "Default Title",  // ✅ Always provide
    "required": true
  }
}
```

### 2. **Use Descriptive Labels**
```json
{
  "label": "Background Color",  // ✅ Clear and descriptive
  "description": "Color for the section background"  // ✅ Optional help text
}
```

### 3. **Mark Required Fields Appropriately**
```json
{
  "title": { "required": true },      // ✅ Critical field
  "subtitle": { "required": false }   // ✅ Optional enhancement
}
```

### 4. **Use Correct Type for Data**
```json
{
  "price": { "type": "number" },      // ✅ Not "text"
  "imageUrl": { "type": "image" },    // ✅ Not "url" (for upload UI)
  "link": { "type": "url" }           // ✅ Not "text" (for validation)
}
```

### 5. **Group Related Fields**
```json
{
  "showButton": { "type": "boolean" },
  "buttonText": { "type": "text" },
  "buttonLink": { "type": "url" }
}
```

### 6. **Image vs URL Types**
- Use `"type": "image"` when you want users to **upload** images via mobile app
- Use `"type": "url"` when users should **enter** existing URLs

---

## API Endpoints Related to Schema

### Component Registry
```
GET /api/components              - List all components
GET /api/components/{id}         - Get component by ID
POST /api/admin/components       - Create new component (admin only)
```

### Website Components
```
GET /api/websites/{websiteId}/components                    - List components
POST /api/websites/{websiteId}/components                   - Add component to website
PUT /api/websites/{websiteId}/components/{componentId}      - Update component schema data
DELETE /api/websites/{websiteId}/components/{componentId}   - Remove component
```

### Media Upload (for image type)
```
POST /api/media/upload
Body: multipart/form-data
  - file: Image file (JPEG/PNG)
  - folder: "components" (default)
Response: { id, s3Url, filename, size, type }
```

---

## Files Reference

### Backend (Spring Boot)
- `ComponentRegistry.java` - Component template entity
- `WebsiteComponent.java` - Component instance entity
- `MediaService.java` - Image upload logic
- `S3Service.java` - AWS S3 integration

### Frontend (Next.js)
- `types/index.ts` - TypeScript type definitions
- `lib/component-loader.ts` - Dynamic component loading
- `components/DynamicComponentRenderer.tsx` - Renders components with schema data

### Mobile App (Flutter)
- `lib/models/component_registry.dart` - Component model
- `lib/models/website_component.dart` - Instance model
- `lib/screens/components/component_form_builder.dart` - Dynamic form builder (renders all field types)
- `lib/services/api_service.dart` - API client with image upload

### Component Builder
- `components-builder/schemas/*.schema.json` - Schema definitions
- `components-builder/src/*.jsx` - Component source code
- `components-builder/build.js` - Build script

---

## Summary Table

| Type | Mobile UI | Input Method | Example Use | Validation |
|------|-----------|--------------|-------------|------------|
| **text** | Single-line input | Keyboard | Titles, labels, names | Required check |
| **richtext** | Multi-line textarea | Keyboard | Descriptions, paragraphs | Required check |
| **url** | URL input with icon | Keyboard (URL type) | Links, external URLs | Required + URL format |
| **number** | Numeric input | Numeric keyboard | Prices, quantities | Required + numeric |
| **boolean** | Toggle switch | Tap to toggle | Show/hide, enable/disable | None |
| **color** | Color preview + picker | Color picker dialog | Colors (hex format) | Hex format |
| **image** | Preview + upload button | Gallery picker → S3 upload | Images, backgrounds | Required + upload success |

---

**Last Updated:** 2025-10-18
**Project:** EZWeb - No-Code Website Builder
**Platform:** Spring Boot + Next.js + Flutter
