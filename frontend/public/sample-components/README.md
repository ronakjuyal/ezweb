# Sample Components

These are sample React components that demonstrate the dynamic component system.

## Components Included

1. **HeroComponent.jsx** - A hero section with customizable title, subtitle, CTA button, and background
2. **ProductGridComponent.jsx** - A product grid that fetches products from the API
3. **ContactComponent.jsx** - A contact section with info and form

## How to Use

### 1. Compile Components

Before uploading to S3, you need to compile these components to standalone JavaScript files:

```bash
# Install dependencies if needed
npm install @babel/core @babel/cli @babel/preset-react

# Compile each component
npx babel HeroComponent.jsx --out-file HeroComponent.compiled.js --presets=@babel/preset-react
npx babel ProductGridComponent.jsx --out-file ProductGridComponent.compiled.js --presets=@babel/preset-react
npx babel ContactComponent.jsx --out-file ContactComponent.compiled.js --presets=@babel/preset-react
```

### 2. Upload to S3

Upload the compiled `.js` files to your S3 bucket in the `components/` folder:

```
s3://ezweb-bucket/components/HeroComponent.compiled.js
s3://ezweb-bucket/components/ProductGridComponent.compiled.js
s3://ezweb-bucket/components/ContactComponent.compiled.js
```

### 3. Register Components in Admin Panel

Use the Admin Panel to register each component:

- **Name**: Hero Section
- **S3 File URL**: https://ezweb-bucket.s3.amazonaws.com/components/HeroComponent.compiled.js
- **Schema**: Paste the content from `HeroComponent.schema.json`
- **Category**: layout
- **Version**: 1.0.0

## Component Schema Format

Each component has a corresponding `.schema.json` file that defines:

- **componentId**: Unique identifier
- **name**: Display name
- **schema**: Object defining all customizable properties
  - **type**: text, image, color, number, boolean, richtext, url
  - **default**: Default value
  - **editable**: Whether users can edit this property
  - **label**: Display label for the property
  - **required**: Whether the property is required

## Creating New Components

To create a new component:

1. Create a `.jsx` file with your React component
2. Use props for all customizable properties
3. Add default values for all props
4. Create a `.schema.json` file defining the schema
5. Compile the component
6. Upload to S3
7. Register in the Admin Panel

## Example: Adding a Footer Component

```jsx
// FooterComponent.jsx
import React from 'react';

export default function FooterComponent({
  companyName = 'My Company',
  copyright = '© 2024 All rights reserved',
  backgroundColor = '#1f2937',
  textColor = '#ffffff',
}) {
  return (
    <footer style={{
      backgroundColor,
      color: textColor,
      padding: '2rem',
      textAlign: 'center'
    }}>
      <h3>{companyName}</h3>
      <p>{copyright}</p>
    </footer>
  );
}
```

```json
{
  "componentId": "footer-001",
  "name": "Footer Section",
  "schema": {
    "companyName": {
      "type": "text",
      "default": "My Company",
      "editable": true,
      "label": "Company Name",
      "required": true
    },
    "copyright": {
      "type": "text",
      "default": "© 2024 All rights reserved",
      "editable": true,
      "label": "Copyright Text",
      "required": true
    },
    "backgroundColor": {
      "type": "color",
      "default": "#1f2937",
      "editable": true,
      "label": "Background Color",
      "required": true
    },
    "textColor": {
      "type": "color",
      "default": "#ffffff",
      "editable": true,
      "label": "Text Color",
      "required": true
    }
  }
}
```

## Notes

- Components must be valid React components
- Keep components self-contained (no external dependencies except React)
- Use inline styles or CSS-in-JS for styling
- Test components locally before uploading to S3
- Always update the schema when changing component props
