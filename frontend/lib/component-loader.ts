import React from 'react';
import type { ComponentSchema, LoadedComponent } from '@/types';

// Cache for loaded components
const componentCache = new Map<string, LoadedComponent>();

/**
 * Dynamically loads a React component from a URL (S3)
 * The component file should be a compiled JavaScript module that exports a default component
 */
export async function loadComponentFromUrl(
  componentUrl: string,
  schema: ComponentSchema
): Promise<LoadedComponent> {
  // Check cache first
  if (componentCache.has(componentUrl)) {
    return componentCache.get(componentUrl)!;
  }

  try {
    // Fetch the component code from S3
    const response = await fetch(componentUrl);
    if (!response.ok) {
      throw new Error(`Failed to load component from ${componentUrl}`);
    }

    const componentCode = await response.text();

    // Create a module from the code
    // The component file should export a default React component
    const Component = await executeComponentCode(componentCode);

    const loadedComponent: LoadedComponent = {
      Component,
      schema,
    };

    // Cache the loaded component
    componentCache.set(componentUrl, loadedComponent);

    return loadedComponent;
  } catch (error) {
    console.error('Error loading component:', error);
    throw error;
  }
}

/**
 * Executes component code and returns the React component
 * This uses dynamic import with data URLs to safely execute the code
 */
async function executeComponentCode(code: string): Promise<React.ComponentType<any>> {
  try {
    // Import React from Next.js to reuse the same instance
    const ReactModule = await import('react');
    const JsxRuntimeModule = await import('react/jsx-runtime');

    // Make React globally available for this context
    (window as any).__REACT__ = ReactModule;
    (window as any).__JSX_RUNTIME__ = JsxRuntimeModule;

    // Replace imports with references to global variables
    let processedCode = code;

    // Remove/replace standalone react import
    processedCode = processedCode.replace(/import\s*"react"\s*;/g, '');

    // Replace React hook imports - handle "as" aliasing
    processedCode = processedCode.replace(
      /import\s*\{([^}]+)\}\s*from\s*"react"\s*;/g,
      (match, imports) => {
        // Parse imports like "useState as m,useEffect as h"
        const mappings = imports.split(',').map((imp: string) => {
          const parts = imp.trim().split(/\s+as\s+/);
          if (parts.length === 2) {
            // Has alias: "useState as m" -> "const m = window.__REACT__.useState;"
            return `const ${parts[1].trim()} = window.__REACT__.${parts[0].trim()};`;
          } else {
            // No alias: "useState" -> "const useState = window.__REACT__.useState;"
            const name = parts[0].trim();
            return `const ${name} = window.__REACT__.${name};`;
          }
        });
        return mappings.join('');
      }
    );

    // Replace jsx-runtime imports - handle "as" aliasing
    processedCode = processedCode.replace(
      /import\s*\{([^}]+)\}\s*from\s*"react\/jsx-runtime"\s*;/g,
      (match, imports) => {
        // Parse imports like "jsx as e,jsxs as l"
        const mappings = imports.split(',').map((imp: string) => {
          const parts = imp.trim().split(/\s+as\s+/);
          if (parts.length === 2) {
            // Has alias: "jsx as e" -> "const e = window.__JSX_RUNTIME__.jsx;"
            return `const ${parts[1].trim()} = window.__JSX_RUNTIME__.${parts[0].trim()};`;
          } else {
            // No alias: "jsx" -> "const jsx = window.__JSX_RUNTIME__.jsx;"
            const name = parts[0].trim();
            return `const ${name} = window.__JSX_RUNTIME__.${name};`;
          }
        });
        return mappings.join('');
      }
    );

    console.log('Original code (first 300 chars):', code.substring(0, 300));
    console.log('Processed code (first 300 chars):', processedCode.substring(0, 300));

    // Create a blob URL for the module
    const blob = new Blob([processedCode], { type: 'text/javascript' });
    const url = URL.createObjectURL(blob);

    try {
      // Import the module
      const module = await import(/* webpackIgnore: true */ url);

      // Clean up the blob URL
      URL.revokeObjectURL(url);

      // Return the default export
      return module.default;
    } catch (importError) {
      URL.revokeObjectURL(url);
      console.error('Import error details:', importError);
      throw importError;
    }
  } catch (error) {
    console.error('Error executing component code:', error);
    throw error;
  }
}

/**
 * Alternative method using eval (less safe but more compatible)
 * Use this if the blob URL method doesn't work in your environment
 */
export function loadComponentWithEval(code: string): React.ComponentType<any> {
  try {
    // Create a safe execution context
    const React = require('react');
    const exports: any = {};
    const module = { exports };

    // Execute the code
    const func = new Function('React', 'exports', 'module', code);
    func(React, exports, module);

    // Return the component
    return module.exports.default || module.exports;
  } catch (error) {
    console.error('Error executing component with eval:', error);
    throw error;
  }
}

/**
 * Parse component schema data with default values
 */
export function parseSchemaData(schemaDataJson: string, schema: ComponentSchema): any {
  try {
    const customData = JSON.parse(schemaDataJson);
    const finalData: any = {};

    console.log('Schema fields:', Object.keys(schema.schema));
    console.log('Custom data keys:', Object.keys(customData));

    // Merge schema defaults with custom data
    Object.keys(schema.schema).forEach((key) => {
      const field = schema.schema[key];

      // Handle 'advanced' type which has nested schema - flatten the fields to root level
      if (field.type === 'advanced' && field.schema) {
        console.log('Processing advanced field:', key);
        console.log('Advanced nested fields:', Object.keys(field.schema));

        // Parse nested schema fields and add them directly to finalData (flattened)
        Object.keys(field.schema).forEach((nestedKey) => {
          const nestedField = field.schema![nestedKey];

          // Check if the nested field exists at root level of customData (Flutter saves it flattened)
          if (customData[nestedKey] !== undefined) {
            finalData[nestedKey] = customData[nestedKey];
            console.log(`Advanced field ${nestedKey}: using custom value`, customData[nestedKey]);
          } else {
            finalData[nestedKey] = nestedField.default;
            console.log(`Advanced field ${nestedKey}: using default`, nestedField.default);
          }
        });
      } else {
        // Regular field
        finalData[key] = customData[key] !== undefined ? customData[key] : field.default;
      }
    });

    console.log('Final parsed data:', finalData);
    return finalData;
  } catch (error) {
    console.error('Error parsing schema data:', error);
    return {};
  }
}

/**
 * Validate component data against schema
 */
export function validateComponentData(data: any, schema: ComponentSchema): boolean {
  try {
    for (const key in schema.schema) {
      const field = schema.schema[key];

      // Check required fields
      if (field.required && (data[key] === undefined || data[key] === null || data[key] === '')) {
        console.error(`Required field '${key}' is missing`);
        return false;
      }

      // Type validation
      if (data[key] !== undefined) {
        const value = data[key];
        switch (field.type) {
          case 'number':
            if (typeof value !== 'number' && isNaN(Number(value))) {
              console.error(`Field '${key}' must be a number`);
              return false;
            }
            break;
          case 'boolean':
            if (typeof value !== 'boolean') {
              console.error(`Field '${key}' must be a boolean`);
              return false;
            }
            break;
          case 'url':
            try {
              new URL(value);
            } catch {
              console.error(`Field '${key}' must be a valid URL`);
              return false;
            }
            break;
        }
      }
    }

    return true;
  } catch (error) {
    console.error('Error validating component data:', error);
    return false;
  }
}

/**
 * Clear component cache
 */
export function clearComponentCache() {
  componentCache.clear();
}

/**
 * Get cached component count
 */
export function getCachedComponentCount(): number {
  return componentCache.size;
}
