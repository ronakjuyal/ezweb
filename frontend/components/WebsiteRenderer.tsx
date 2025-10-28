'use client';

import React from 'react';
import { DynamicComponentRenderer } from './DynamicComponentRenderer';
import type { WebsiteComponent } from '@/types';

interface WebsiteRendererProps {
  components: WebsiteComponent[];
}

export function WebsiteRenderer({ components }: WebsiteRendererProps) {
  if (!components || components.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center p-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-2">No Components Yet</h2>
          <p className="text-gray-600">
            This website doesn't have any components configured yet.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full">
      {components.map((component) => (
        <div key={component.id} className="w-full">
          <DynamicComponentRenderer websiteComponent={component} />
        </div>
      ))}
    </div>
  );
}
