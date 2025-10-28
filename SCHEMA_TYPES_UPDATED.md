# Component Schema Types - Complete Documentation (Updated)

This document describes all available schema field types used in the EZWeb platform for component customization and rendering in the mobile app.

**NEW FEATURES:**
- ✨ **multi-images** type for uploading multiple images (carousels, galleries, product images)
- ✨ **advanced** section for collapsible/expandable advanced settings

---

## Overview

The schema system allows components to define customizable properties that users can edit through the **Flutter mobile app**. Each field type determines how the property is displayed and edited in the app's UI.

###Schema Structure

```json
{
  "name": "ComponentName",
  "displayName": "Display Name",
  "description": "Component description",
  "category": "Category",
  "version": "1.0.0",
  "schema": {
    "fieldName": {
      "type": "text|image|multi-images|color|number|boolean|richtext|url|advanced",
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

**Use Cases:**
- Long descriptions
- Paragraphs
- Article content

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
- Validation: URL format validation

**Use Cases:**
- Button links
- External URLs
- Navigation links

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
- Value Format: Hex color code (e.g., `#1e3a8a`)

**Use Cases:**
- Background colors
- Text colors
- Border colors

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
- Parses to `double` in Flutter

**Use Cases:**
- Prices
- Quantities
- Dimensions

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

**Use Cases:**
- Show/hide elements
- Enable/disable features

---

### 7. **image** 🎯
Single image upload field with picker and preview.

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
- Input: Image picker from gallery
- Upload: Uploads to S3 via API
- Display: Shows image preview with remove button

**API Endpoint:**
```
POST /api/media/upload
Response: s3Url (string)
```

**Use Cases:**
- Single hero images
- Background images
- Profile pictures
- Logos

**Data Format:**
```json
"imageUrl": "https://ezweb-bucket.s3.amazonaws.com/components/image.jpg"
```

---

### 8. **multi-images** 🆕
Multiple image upload field with gallery grid.

**Schema Definition:**
```json
{
  "productImages": {
    "type": "multi-images",
    "label": "Product Images",
    "default": [],
    "required": true,
    "maxImages": 5,
    "description": "Upload up to 5 product images"
  }
}
```

**Mobile App UI:**
- Renders as: 3-column grid of uploaded images + upload button
- Input: Multi-image picker from gallery (uses `pickMultiImage`)
- Process:
  1. User taps "Upload Images" or "Add More Images"
  2. Opens multi-select gallery picker
  3. Selects multiple images (up to maxImages limit)
  4. Each image uploads to S3 sequentially
  5. Stores array of S3 URLs in schema data
- Features:
  - Grid preview of all uploaded images
  - Individual remove button (X) on each image
  - Counter showing "X/Y" (current/max)
  - Button disabled when max reached
  - Loading indicator during uploads
  - Success message shows count uploaded

**Parameters:**
- `maxImages`: Maximum number of images allowed (default: 10)
- `default`: Empty array `[]`

**Mobile Implementation:**
```dart
Widget _buildMultiImagePicker(String key, String label, Map field, bool required) {
  // Shows 3-column GridView with images
  // Upload button picks multiple images
  // Each image gets X button to remove
  return GridView.builder(...);
}
```

**Use Cases:**
- 🎠 **Carousel/Slider images**
- 🖼️ **Image galleries**
- 🛍️ **Product image collections**
- 📸 **Photo albums**
- 🏠 **Property listing images**

**Data Format:**
```json
"productImages": [
  "https://ezweb-bucket.s3.amazonaws.com/components/product-1.jpg",
  "https://ezweb-bucket.s3.amazonaws.com/components/product-2.jpg",
  "https://ezweb-bucket.s3.amazonaws.com/components/product-3.jpg"
]
```

**Validation:**
- Required check: At least 1 image if `required: true`
- Max limit: Cannot exceed `maxImages` count

---

### 9. **advanced** 🆕
Collapsible section for advanced/optional settings.

**Schema Definition:**
```json
{
  "advanced": {
    "type": "advanced",
    "label": "Advanced Settings",
    "schema": {
      "backgroundColor": {
        "type": "color",
        "label": "Background Color",
        "default": "#ffffff",
        "required": false
      },
      "borderRadius": {
        "type": "number",
        "label": "Border Radius (px)",
        "default": 8,
        "required": false
      },
      "customCSS": {
        "type": "richtext",
        "label": "Custom CSS",
        "default": "",
        "required": false
      }
    }
  }
}
```

**Mobile App UI:**
- Renders as: `ExpansionTile` with card
- Title: "Advanced Settings" with settings icon
- State: Collapsed by default (can be expanded)
- Children: All nested schema fields rendered inside when expanded

**Structure:**
- Top-level `advanced` field has `type: "advanced"`
- Contains nested `schema` object
- Nested schema contains normal field definitions
- Fields outside `advanced` are always visible
- Fields inside `advanced` are hidden until user expands

**Mobile Implementation:**
```dart
ExpansionTile(
  title: Text('Advanced Settings'),
  leading: Icon(Icons.settings_outlined),
  initiallyExpanded: false,
  children: [
    // Renders all nested schema fields
  ],
)
```

**Use Cases:**
- 🎨 **Styling options** (colors, borders, spacing)
- ⚙️ **Technical settings** (intervals, durations)
- 🔧 **Expert options** (custom CSS, advanced config)
- 📐 **Fine-tuning** (precise dimensions, offsets)

**Example - Product Card with Advanced:**
```json
{
  "productName": { "type": "text" },        // ✅ Always visible
  "price": { "type": "number" },             // ✅ Always visible
  "productImages": { "type": "multi-images" }, // ✅ Always visible
  "advanced": {                              // 🔽 Collapsible section
    "type": "advanced",
    "schema": {
      "backgroundColor": { "type": "color" },  // Hidden until expanded
      "borderRadius": { "type": "number" }     // Hidden until expanded
    }
  }
}
```

**Benefits:**
- ✅ Cleaner UI - Hide complex/optional settings
- ✅ Better UX - Beginners see simple options first
- ✅ Organized - Group related advanced settings
- ✅ Flexible - Power users can still access all options

---

## Complete Examples

### Example 1: Hero Component with Advanced Section

```json
{
  "name": "HeroComponent",
  "displayName": "Hero Section",
  "category": "Hero",
  "version": "1.0.0",
  "schema": {
    "title": {
      "type": "text",
      "label": "Title",
      "default": "Welcome",
      "required": true
    },
    "subtitle": {
      "type": "text",
      "label": "Subtitle",
      "default": "Build amazing websites",
      "required": true
    },
    "showButton": {
      "type": "boolean",
      "label": "Show Button",
      "default": true
    },
    "imageUrl": {
      "type": "image",
      "label": "Hero Image",
      "default": ""
    },
    "advanced": {
      "type": "advanced",
      "label": "Advanced Settings",
      "schema": {
        "backgroundColor": {
          "type": "color",
          "label": "Background Color",
          "default": "#1e3a8a"
        },
        "textColor": {
          "type": "color",
          "label": "Text Color",
          "default": "#ffffff"
        },
        "imagePosition": {
          "type": "text",
          "label": "Image Position",
          "default": "right",
          "description": "'left' or 'right'"
        }
      }
    }
  }
}
```

**Mobile UI Rendering:**
1. Title (text input) - visible
2. Subtitle (text input) - visible
3. Show Button (toggle) - visible
4. Hero Image (upload button) - visible
5. **Advanced Settings** (collapsed card)
   - Click to expand
   - Shows: Background Color, Text Color, Image Position

---

### Example 2: Product Card with Multi-Images

```json
{
  "name": "ProductCardComponent",
  "displayName": "Product Card",
  "category": "Product",
  "version": "1.0.0",
  "schema": {
    "productName": {
      "type": "text",
      "label": "Product Name",
      "default": "Product Title",
      "required": true
    },
    "description": {
      "type": "richtext",
      "label": "Description",
      "default": "",
      "required": true
    },
    "price": {
      "type": "number",
      "label": "Price",
      "default": 29.99,
      "required": true
    },
    "productImages": {
      "type": "multi-images",
      "label": "Product Images",
      "default": [],
      "required": true,
      "maxImages": 5,
      "description": "Upload up to 5 images"
    },
    "buttonText": {
      "type": "text",
      "label": "Button Text",
      "default": "Add to Cart"
    },
    "advanced": {
      "type": "advanced",
      "schema": {
        "backgroundColor": {
          "type": "color",
          "default": "#ffffff"
        },
        "showBorder": {
          "type": "boolean",
          "default": true
        },
        "borderColor": {
          "type": "color",
          "default": "#e0e0e0"
        }
      }
    }
  }
}
```

**Mobile UI Rendering:**
1. Product Name (text input)
2. Description (textarea)
3. Price (number input)
4. Product Images (grid + upload button) - **NEW!**
   - Shows 3-column grid of uploaded images
   - Each image has X to remove
   - "Upload Images" button to add more
   - Counter: "3/5"
5. Button Text (text input)
6. Advanced Settings (collapsed)
   - Background Color
   - Show Border
   - Border Color

---

### Example 3: Carousel Component

```json
{
  "name": "CarouselComponent",
  "displayName": "Image Carousel",
  "category": "Media",
  "version": "1.0.0",
  "schema": {
    "title": {
      "type": "text",
      "label": "Carousel Title",
      "default": "Image Gallery"
    },
    "carouselImages": {
      "type": "multi-images",
      "label": "Carousel Images",
      "default": [],
      "required": true,
      "maxImages": 10,
      "description": "Upload up to 10 images for the slider"
    },
    "autoPlay": {
      "type": "boolean",
      "label": "Auto Play",
      "default": true
    },
    "showIndicators": {
      "type": "boolean",
      "label": "Show Indicators",
      "default": true
    },
    "advanced": {
      "type": "advanced",
      "schema": {
        "interval": {
          "type": "number",
          "label": "Auto Play Interval (seconds)",
          "default": 3
        },
        "height": {
          "type": "number",
          "label": "Carousel Height (px)",
          "default": 400
        },
        "indicatorColor": {
          "type": "color",
          "label": "Indicator Color",
          "default": "#ffffff"
        }
      }
    }
  }
}
```

---

## Summary Table

| Type | Mobile UI | Input Method | Example Use | Data Format |
|------|-----------|--------------|-------------|-------------|
| **text** | Single-line input | Keyboard | Titles, labels | String |
| **richtext** | Multi-line textarea | Keyboard | Descriptions | String |
| **url** | URL input | Keyboard (URL type) | Links | String (URL) |
| **number** | Numeric input | Numeric keyboard | Prices, quantities | Number |
| **boolean** | Toggle switch | Tap to toggle | Show/hide | Boolean |
| **color** | Color preview + picker | Color picker dialog | Colors | String (hex) |
| **image** | Preview + upload button | Gallery picker → S3 | Single images | String (URL) |
| **multi-images** 🆕 | Grid + upload button | Multi-select gallery → S3 | Carousels, galleries | Array of URLs |
| **advanced** 🆕 | Collapsible card | Expansion tile | Optional settings | Nested schema |

---

## Flutter Implementation Details

### Multi-Images Picker

```dart
Future<void> _pickAndUploadMultiImage(String key) async {
  final ImagePicker picker = ImagePicker();
  final List<XFile> images = await picker.pickMultiImage(
    maxWidth: 1920,
    maxHeight: 1080,
    imageQuality: 85,
  );

  if (images.isNotEmpty) {
    setState(() => _isUploading = true);

    final currentImages = _formData[key] as List<dynamic>? ?? [];
    final uploadedUrls = <String>[];

    for (final image in images) {
      final bytes = await image.readAsBytes();
      final imageUrl = await _apiService.uploadMedia(
        bytes,
        image.name,
        'image/jpeg',
        'components',
      );
      uploadedUrls.add(imageUrl);
    }

    setState(() {
      _formData[key] = [...currentImages, ...uploadedUrls];
      _isUploading = false;
    });
  }
}
```

### Advanced Section Rendering

```dart
// In build() method:
...schema.entries.where((entry) {
  final field = entry.value as Map<String, dynamic>;
  return field['type'] != 'advanced';  // Show only non-advanced fields
}).map((entry) {
  return _buildFieldWidget(entry.key, entry.value);
}),

// Advanced section (if exists)
if (schema.entries.any((e) => (e.value as Map)['type'] == 'advanced')) ...[
  Card(
    child: ExpansionTile(
      title: Text('Advanced Settings'),
      leading: Icon(Icons.settings_outlined),
      initiallyExpanded: false,
      children: [
        ...// Render nested schema fields
      ],
    ),
  ),
],
```

---

## Best Practices

### 1. Use Multi-Images for Collections
```json
// ✅ Good - Use multi-images for image collections
{
  "productImages": {
    "type": "multi-images",
    "maxImages": 5
  }
}

// ❌ Bad - Don't use multiple single image fields
{
  "image1": { "type": "image" },
  "image2": { "type": "image" },
  "image3": { "type": "image" }
}
```

### 2. Group Advanced Settings Logically
```json
{
  "title": { "type": "text" },  // Basic - always visible
  "subtitle": { "type": "text" },  // Basic - always visible
  "advanced": {
    "type": "advanced",
    "schema": {
      "backgroundColor": { "type": "color" },  // Advanced
      "customCSS": { "type": "richtext" }  // Advanced
    }
  }
}
```

### 3. Set Reasonable Max Limits
```json
{
  "carouselImages": {
    "type": "multi-images",
    "maxImages": 10  // ✅ Reasonable limit
  },
  "thumbnails": {
    "type": "multi-images",
    "maxImages": 3  // ✅ Appropriate for thumbnails
  }
}
```

### 4. Provide Helpful Descriptions
```json
{
  "productImages": {
    "type": "multi-images",
    "description": "Upload 3-5 high-quality product images showing different angles"
  }
}
```

---

**Last Updated:** 2025-10-18
**Version:** 2.0 (Added multi-images and advanced section)
**Project:** EZWeb - No-Code Website Builder
