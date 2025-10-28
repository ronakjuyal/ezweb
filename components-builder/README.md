# EZWeb Component Builder

This tool builds React components into standalone JavaScript files that can be uploaded to the EZWeb admin panel.

## Directory Structure

```
components-builder/
├── src/                    # Source JSX components
│   ├── HeroComponent.jsx
│   └── ContactComponent.jsx
├── schemas/                # Component schemas (JSON)
│   ├── HeroComponent.schema.json
│   └── ContactComponent.schema.json
├── dist/                   # Built components (generated)
│   ├── HeroComponent.bundle.js
│   └── ContactComponent.bundle.js
├── build.js               # Build script
├── package.json           # Dependencies
└── README.md             # This file
```

## How to Build Components

### Step 1: Install Dependencies

```bash
cd components-builder
npm install
```

### Step 2: Add Your Component

Create a new JSX file in the `src/` directory:

```jsx
// src/MyComponent.jsx
import React from 'react';

export default function MyComponent({ data }) {
  const { title, backgroundColor } = data || {};

  return (
    <div style={{ backgroundColor: backgroundColor || '#fff', padding: '2rem' }}>
      <h1>{title || 'Default Title'}</h1>
    </div>
  );
}
```

### Step 3: Create Schema File

Create a matching schema in `schemas/`:

```json
// schemas/MyComponent.schema.json
{
  "componentId": "my-component-001",
  "name": "My Component",
  "schema": {
    "title": {
      "type": "text",
      "default": "Default Title",
      "editable": true,
      "label": "Title",
      "required": true
    },
    "backgroundColor": {
      "type": "color",
      "default": "#ffffff",
      "editable": true,
      "label": "Background Color",
      "required": false
    }
  }
}
```

### Step 4: Build

```bash
npm run build
```

Built files will be in the `dist/` directory.

### Step 5: Upload to Admin Panel

1. Go to: http://localhost:3003/admin/login
2. Login with admin credentials
3. Navigate to: Dashboard → Components → Upload Component
4. Upload the `.bundle.js` file from `dist/`
5. Copy/paste the schema JSON from `schemas/`

## Component Guidelines

### Props Structure

Components receive a `data` prop with all customizable values:

```jsx
export default function MyComponent({ data }) {
  const {
    title = 'Default',        // Use destructuring with defaults
    color = '#000'
  } = data || {};             // Always provide fallback for data

  return <div>...</div>;
}
```

### Styling

Use inline styles for better compatibility:

```jsx
<div style={{
  backgroundColor: data.backgroundColor,
  padding: '2rem',
  textAlign: 'center'
}}>
  ...
</div>
```

### State Management

You can use React hooks:

```jsx
import React, { useState } from 'react';

export default function MyComponent({ data }) {
  const [count, setCount] = useState(0);

  return (
    <button onClick={() => setCount(count + 1)}>
      Clicked {count} times
    </button>
  );
}
```

## Schema Field Types

- `text`: Single-line text input
- `richtext`: Multi-line text area
- `url`: URL input with validation
- `color`: Color picker
- `number`: Numeric input
- `boolean`: Toggle switch
- `image`: Image upload (returns S3 URL)

## Troubleshooting

### Build fails
- Make sure all dependencies are installed: `npm install`
- Check that your JSX syntax is valid
- Ensure you're exporting a default function

### Component doesn't load
- Check the browser console for errors
- Verify the schema JSON is valid
- Make sure the component is marked as "active" in admin panel

### Styling doesn't work
- Use inline styles instead of CSS classes
- Avoid external CSS files
- Use camelCase for style properties (backgroundColor not background-color)
