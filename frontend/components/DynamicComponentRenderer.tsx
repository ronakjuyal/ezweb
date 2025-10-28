'use client';

import React, { useEffect, useState, Suspense } from 'react';
import { loadComponentFromUrl, parseSchemaData } from '@/lib/component-loader';
import type { WebsiteComponent, ComponentSchema } from '@/types';

interface DynamicComponentRendererProps {
  websiteComponent: WebsiteComponent;
}

export function DynamicComponentRenderer({ websiteComponent }: DynamicComponentRendererProps) {
  const [Component, setComponent] = useState<React.ComponentType<any> | null>(null);
  const [componentData, setComponentData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadComponent() {
      try {
        setLoading(true);
        setError(null);

        // Parse the schema from the component registry
        const schema: ComponentSchema = JSON.parse(websiteComponent.componentRegistry.schema);

        // Parse the component data with schema defaults
        const parsedData = parseSchemaData(websiteComponent.schemaData, schema);

        console.log('Component Registry:', websiteComponent.componentRegistry.name);
        console.log('Schema Data (raw):', websiteComponent.schemaData);
        console.log('Parsed Data:', parsedData);

        // Load the component from S3
        const loadedComponent = await loadComponentFromUrl(
          websiteComponent.componentRegistry.s3FileUrl,
          schema
        );

        setComponent(() => loadedComponent.Component);
        setComponentData(parsedData);
        setLoading(false);
      } catch (err) {
        console.error('Failed to load component:', err);
        setError('Failed to load component');
        setLoading(false);
      }
    }

    loadComponent();
  }, [websiteComponent]);

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (error || !Component) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4 m-4">
        <p className="text-red-800">{error || 'Component not found'}</p>
      </div>
    );
  }

  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center p-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
        </div>
      }
    >
      <Component {...componentData} />
    </Suspense>
  );
}
