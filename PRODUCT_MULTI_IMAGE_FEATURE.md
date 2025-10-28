# Product Multi-Image Upload Feature

## Summary

Added support for uploading multiple images (max 5) for products, and confirmed drag-and-drop reordering is already implemented for components.

---

## 1. Product Multi-Image Upload

### Overview
Products can now have up to 5 images instead of just 1. Images are uploaded to S3 and stored as a JSON array in the database.

### Changes Made

#### Backend (Spring Boot)

**1. Database Schema**
- Added `image_urls` column to `products` table
- Type: `TEXT` (stores JSON array)
- Migration: `backend/add_product_images.sql`

```sql
ALTER TABLE products ADD COLUMN IF NOT EXISTS image_urls TEXT;
```

**2. Product Model** ([Product.java](C:\Users\ronak\OneDrive\Documents\ezweb\backend\src\main\java\com\ezweb\model\Product.java))
```java
@Column(name = "image_urls", columnDefinition = "TEXT")
private String imageUrls;  // JSON array of image URLs (max 5)
```

**3. DTOs Updated**
- **ProductRequest.java**: Added `List<String> imageUrls`
- **ProductResponse.java**: Added `List<String> imageUrls`

**4. ProductService.java**
- Serializes `List<String>` to JSON when saving
- Deserializes JSON to `List<String>` when retrieving
- Uses Jackson `ObjectMapper` for JSON conversion

```java
// Serialize on save
if (request.getImageUrls() != null && !request.getImageUrls().isEmpty()) {
    product.setImageUrls(objectMapper.writeValueAsString(request.getImageUrls()));
}

// Deserialize on retrieve
if (product.getImageUrls() != null) {
    List<String> imageUrls = objectMapper.readValue(
        product.getImageUrls(),
        objectMapper.getTypeFactory().constructCollectionType(List.class, String.class)
    );
    response.setImageUrls(imageUrls);
}
```

#### Flutter App

**1. Product Model** ([product.dart](C:\Users\ronak\OneDrive\Documents\ezweb\userapp\flutter_application_1\lib\models\product.dart))
```dart
final List<String>? imageUrls;  // Multiple images (max 5)
```

**2. Product Form Screen** ([product_form_screen.dart](C:\Users\ronak\OneDrive\Documents\ezweb\userapp\flutter_application_1\lib\screens\products\product_form_screen.dart))

**Added UI Elements:**
- Header with image counter: "Product Images 3/5"
- 3-column GridView displaying uploaded images
- Each image has a remove button (X)
- "Upload Product Images" / "Add More Images" button
- Button disabled when max (5) images reached

**Added Methods:**
```dart
Future<void> _pickAndUploadMultipleImages() async {
  // Multi-select from gallery
  final List<XFile> images = await picker.pickMultiImage(...);

  // Upload each image to S3
  for (final image in imagesToUpload) {
    final imageUrl = await _apiService.uploadMedia(...);
    uploadedUrls.add(imageUrl);
  }

  // Add to list
  _imageUrls.addAll(uploadedUrls);
}
```

**Data Flow:**
1. User taps "Upload Product Images"
2. Multi-select image picker opens
3. User selects multiple images
4. Each image uploads to S3 sequentially
5. S3 URLs stored in `_imageUrls` list
6. Grid updates to show all images
7. On save, list sent to backend as `imageUrls` field

### UI Mockup

```
┌────────────────────────────────────────┐
│  Product Images                   3/5  │
├────────────────────────────────────────┤
│  ┌──────┐  ┌──────┐  ┌──────┐         │
│  │  📷  │  │  📷  │  │  📷  │         │
│  │ Img1 │  │ Img2 │  │ Img3 │         │
│  │  ❌  │  │  ❌  │  │  ❌  │         │
│  └──────┘  └──────┘  └──────┘         │
│                                        │
│  ┌──────────────────────────────────┐ │
│  │  ➕  Add More Images             │ │
│  └──────────────────────────────────┘ │
└────────────────────────────────────────┘
```

### Features
- ✅ Upload multiple images (max 5)
- ✅ 3-column grid preview
- ✅ Individual remove buttons
- ✅ Counter display (X/5)
- ✅ Button disabled at max
- ✅ Loading indicators
- ✅ Success/error messages
- ✅ Image compression (1920x1080, 85% quality)
- ✅ S3 storage in "products" folder

---

## 2. Component Drag-and-Drop Reordering

### Status: ✅ Already Implemented

The component reordering feature was already fully implemented in the Flutter app.

### Implementation Details

**File:** [components_list_screen.dart](C:\Users\ronak\OneDrive\Documents\ezweb\userapp\flutter_application_1\lib\screens\components\components_list_screen.dart)

**Widget:** `ReorderableListView.builder`

**Code:**
```dart
ReorderableListView.builder(
  itemCount: provider.websiteComponents.length,
  onReorder: (oldIndex, newIndex) async {
    if (newIndex > oldIndex) newIndex--;

    final components = List.of(provider.websiteComponents);
    final item = components.removeAt(oldIndex);
    components.insert(newIndex, item);

    final componentIds = components.map((c) => c.id).toList();
    await provider.reorderComponents(websiteId, componentIds);
  },
  itemBuilder: (context, index) {
    // Component card with drag handle
  },
)
```

### How It Works
1. User **long-presses** on a component card
2. **Drags** the component up or down
3. **Drops** it in the new position
4. App automatically:
   - Reorders the list locally
   - Calls backend API to update positions
   - Refreshes the component list

### Features
- ✅ Long-press and drag
- ✅ Visual feedback during drag
- ✅ Automatic position updates
- ✅ Backend API synchronization
- ✅ No manual position input needed

**User Experience:**
- **Before:** Had to manually enter position numbers
- **After:** Simply drag and drop to reorder

---

## Testing

### Product Multi-Image Upload

**Test Steps:**
1. Open Flutter app
2. Navigate to a website
3. Go to Products section
4. Click "Add Product" or edit existing product
5. Tap "Upload Product Images"
6. Select multiple images (up to 5)
7. Images upload and appear in grid
8. Tap X on any image to remove it
9. Try uploading more images
10. Button disables at 5 images
11. Save product
12. Verify images saved correctly
13. Edit product and verify images load correctly

**Expected Results:**
- ✅ Can upload multiple images
- ✅ Max 5 images enforced
- ✅ Grid shows all uploaded images
- ✅ Can remove individual images
- ✅ Counter shows "X/5"
- ✅ Images persist after save
- ✅ Images load when editing

### Component Drag-and-Drop

**Test Steps:**
1. Open Flutter app
2. Navigate to a website with multiple components
3. Go to "Manage Components"
4. Long-press on any component card
5. Drag it up or down
6. Drop in new position
7. Verify position updated
8. Refresh page
9. Verify order persisted

**Expected Results:**
- ✅ Can drag components
- ✅ Visual feedback during drag
- ✅ Position updates immediately
- ✅ Order persists after refresh

---

## Database Schema

```sql
-- Products table
CREATE TABLE products (
  id BIGSERIAL PRIMARY KEY,
  website_id BIGINT NOT NULL,
  name VARCHAR(200) NOT NULL,
  description VARCHAR(1000),
  price NUMERIC(10,2) NOT NULL,
  image_url VARCHAR(500),           -- Legacy single image
  image_urls TEXT,                   -- NEW: JSON array of images
  stock INTEGER NOT NULL DEFAULT 0,
  available BOOLEAN NOT NULL DEFAULT true,
  category VARCHAR(100),
  sku VARCHAR(50),
  created_at TIMESTAMP NOT NULL,
  updated_at TIMESTAMP
);
```

**Example `image_urls` value:**
```json
["https://ezweb-bucket.s3.amazonaws.com/products/img1.jpg",
 "https://ezweb-bucket.s3.amazonaws.com/products/img2.jpg",
 "https://ezweb-bucket.s3.amazonaws.com/products/img3.jpg"]
```

---

## API

### Product Endpoints

**Create Product:**
```http
POST /api/websites/{websiteId}/products
Content-Type: application/json

{
  "name": "Product Name",
  "description": "Description",
  "price": 29.99,
  "imageUrl": "https://...",           // Optional: legacy single image
  "imageUrls": [                       // NEW: Multiple images
    "https://ezweb-bucket.s3.amazonaws.com/products/img1.jpg",
    "https://ezweb-bucket.s3.amazonaws.com/products/img2.jpg"
  ],
  "stock": 100,
  "available": true
}
```

**Update Product:**
```http
PUT /api/websites/{websiteId}/products/{productId}
Content-Type: application/json

{
  "name": "Updated Product Name",
  "imageUrls": [
    "https://ezweb-bucket.s3.amazonaws.com/products/img1.jpg",
    "https://ezweb-bucket.s3.amazonaws.com/products/img2.jpg",
    "https://ezweb-bucket.s3.amazonaws.com/products/img3.jpg"
  ],
  ...
}
```

**Response:**
```json
{
  "id": 1,
  "websiteId": 1,
  "name": "Product Name",
  "imageUrl": "https://...",
  "imageUrls": [
    "https://ezweb-bucket.s3.amazonaws.com/products/img1.jpg",
    "https://ezweb-bucket.s3.amazonaws.com/products/img2.jpg"
  ],
  ...
}
```

---

## Files Modified

### Backend
1. ✅ `Product.java` - Added imageUrls field
2. ✅ `ProductRequest.java` - Added imageUrls field
3. ✅ `ProductResponse.java` - Added imageUrls field
4. ✅ `ProductService.java` - Added JSON serialization/deserialization
5. ✅ `add_product_images.sql` - Database migration

### Frontend (Flutter)
1. ✅ `product.dart` - Added imageUrls field
2. ✅ `product.g.dart` - Regenerated JSON serialization
3. ✅ `product_form_screen.dart` - Complete UI overhaul for multi-images

### Already Implemented
- ✅ `components_list_screen.dart` - Drag-and-drop already working

---

## Migration Guide

### For Existing Products

**Products with only single image:**
- `imageUrl` field remains unchanged
- `imageUrls` will be null or empty
- Both fields can coexist

**Migrating to multi-images:**
1. Edit product in Flutter app
2. Upload new images using multi-image picker
3. Old `imageUrl` can be kept or removed
4. Save product
5. New `imageUrls` array will be populated

**Backward Compatibility:**
- ✅ Old products with only `imageUrl` still work
- ✅ New products can use `imageUrls`
- ✅ Products can have both fields
- ✅ No breaking changes

---

## Summary

### What Works Now:

**Product Management:**
- ✅ Upload up to 5 images per product
- ✅ Remove individual images
- ✅ Visual grid preview
- ✅ Counter showing image count
- ✅ Automatic S3 upload
- ✅ JSON storage in database
- ✅ Backward compatible with single image

**Component Management:**
- ✅ Drag-and-drop to reorder (already implemented)
- ✅ Long-press and drag
- ✅ Automatic position updates
- ✅ No manual position input needed

### Next Steps (Optional):

1. **Image Ordering:** Allow reordering images within the product grid
2. **Set Primary Image:** Mark one image as primary/featured
3. **Image Captions:** Add descriptions to individual images
4. **Bulk Upload:** Upload all 5 images at once instead of sequentially

---

**Created:** 2025-10-18
**Features:** Product multi-image upload, Component drag-and-drop
**Status:** ✅ Fully implemented and ready for testing
