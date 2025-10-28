'use client';

import { useState, FormEvent, ChangeEvent } from 'react';
import { useRouter } from 'next/navigation';
import { apiClient } from '@/lib/api-client';

export default function NewComponentPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: 'hero',
    version: '1.0.0',
    active: true,
  });

  const [componentFile, setComponentFile] = useState<File | null>(null);
  const [schemaJson, setSchemaJson] = useState('');

  const categories = [
    'hero',
    'product',
    'contact',
    'about',
    'footer',
    'header',
    'gallery',
    'testimonial',
    'pricing',
    'faq',
  ];

  const defaultSchema = {
    title: {
      type: 'text',
      default: 'Default Title',
      editable: true,
      label: 'Title',
      required: true,
    },
    subtitle: {
      type: 'text',
      default: 'Default Subtitle',
      editable: true,
      label: 'Subtitle',
      required: false,
    },
    backgroundColor: {
      type: 'color',
      default: '#ffffff',
      editable: true,
      label: 'Background Color',
      required: false,
    },
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.name.endsWith('.jsx') && !file.name.endsWith('.js')) {
        setError('Please upload a .jsx or .js file');
        return;
      }
      setComponentFile(file);
      setError('');
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');

    if (!componentFile) {
      setError('Please upload a component file');
      return;
    }

    let schema;
    try {
      schema = schemaJson ? JSON.parse(schemaJson) : defaultSchema;
    } catch (err) {
      setError('Invalid JSON schema');
      return;
    }

    setLoading(true);

    try {
      // Step 1: Upload component file to S3
      const formDataForUpload = new FormData();
      formDataForUpload.append('file', componentFile);
      formDataForUpload.append('folder', 'components');

      const uploadResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/media/upload`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
        },
        body: formDataForUpload,
      });

      if (!uploadResponse.ok) {
        throw new Error('Failed to upload component file');
      }

      const uploadData = await uploadResponse.json();
      const s3FileUrl = uploadData.s3Url || uploadData.url;

      // Step 2: Create component registry entry
      const componentData = {
        name: formData.name,
        description: formData.description || null,
        s3FileUrl,
        schema: JSON.stringify(schema),
        category: formData.category,
        version: formData.version,
        active: formData.active,
      };

      await apiClient.createComponent(componentData);

      router.push('/admin/dashboard/components');
    } catch (err: any) {
      console.error('Error creating component:', err);
      setError(err.message || 'Failed to create component');
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Upload Component</h1>
        <p className="mt-2 text-gray-600">Add a new component to the registry</p>
      </div>

      <div className="bg-white shadow rounded-lg p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          )}

          {/* Component Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Component Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Hero Section"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="A customizable hero section with title, subtitle, and CTA button"
            />
          </div>

          {/* Category */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Category <span className="text-red-500">*</span>
            </label>
            <select
              required
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat.charAt(0).toUpperCase() + cat.slice(1)}
                </option>
              ))}
            </select>
          </div>

          {/* Version */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Version <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              value={formData.version}
              onChange={(e) => setFormData({ ...formData, version: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="1.0.0"
            />
          </div>

          {/* Component File Upload */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Component File (.jsx or .js) <span className="text-red-500">*</span>
            </label>
            <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md hover:border-blue-500 transition-colors">
              <div className="space-y-1 text-center">
                <svg
                  className="mx-auto h-12 w-12 text-gray-400"
                  stroke="currentColor"
                  fill="none"
                  viewBox="0 0 48 48"
                >
                  <path
                    d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                    strokeWidth={2}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                <div className="flex text-sm text-gray-600">
                  <label className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500">
                    <span>Upload a file</span>
                    <input
                      type="file"
                      className="sr-only"
                      accept=".jsx,.js"
                      onChange={handleFileChange}
                      required
                    />
                  </label>
                  <p className="pl-1">or drag and drop</p>
                </div>
                <p className="text-xs text-gray-500">JSX or JS file</p>
                {componentFile && (
                  <p className="text-sm text-blue-600 font-medium">{componentFile.name}</p>
                )}
              </div>
            </div>
          </div>

          {/* Schema JSON */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Schema JSON
            </label>
            <p className="text-xs text-gray-500 mb-2">
              Define customizable properties for this component. Leave empty to use default schema.
            </p>
            <textarea
              value={schemaJson}
              onChange={(e) => setSchemaJson(e.target.value)}
              rows={12}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm"
              placeholder={JSON.stringify(defaultSchema, null, 2)}
            />
            <button
              type="button"
              onClick={() => setSchemaJson(JSON.stringify(defaultSchema, null, 2))}
              className="mt-2 text-sm text-blue-600 hover:text-blue-800"
            >
              Load default schema template
            </button>
          </div>

          {/* Active Status */}
          <div className="flex items-center">
            <input
              type="checkbox"
              id="active"
              checked={formData.active}
              onChange={(e) => setFormData({ ...formData, active: e.target.checked })}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label htmlFor="active" className="ml-2 block text-sm text-gray-900">
              Make component active immediately
            </label>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end space-x-3 pt-6 border-t">
            <button
              type="button"
              onClick={() => router.back()}
              className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Uploading...' : 'Upload Component'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
