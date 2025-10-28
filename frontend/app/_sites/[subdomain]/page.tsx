import { apiClient } from '@/lib/api-client';
import { WebsiteRenderer } from '@/components/WebsiteRenderer';
import type { Website, WebsiteComponent } from '@/types';

interface SubdomainPageProps {
  params: Promise<{
    subdomain: string;
  }>;
}

export default async function SubdomainPage({ params }: SubdomainPageProps) {
  const { subdomain } = await params;

  try {
    // Fetch website data by subdomain
    const website: Website = await apiClient.getWebsiteBySubdomain(subdomain);

    // Check if website is published
    if (!website.published) {
      return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
          <div className="text-center p-8">
            <h1 className="text-3xl font-bold text-gray-800 mb-2">Website Not Published</h1>
            <p className="text-gray-600">This website is not yet available.</p>
          </div>
        </div>
      );
    }

    // Fetch visible components for this website
    const components: WebsiteComponent[] = await apiClient.getVisibleComponents(website.id);

    return (
      <>
        <head>
          <title>{website.title}</title>
          {website.description && <meta name="description" content={website.description} />}
        </head>
        <WebsiteRenderer components={components} />
      </>
    );
  } catch (error) {
    console.error('Error loading website:', error);

    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center p-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Website Not Found</h1>
          <p className="text-gray-600">
            The website <span className="font-mono text-blue-600">{subdomain}</span> does not exist.
          </p>
        </div>
      </div>
    );
  }
}

// Generate metadata for SEO
export async function generateMetadata({ params }: SubdomainPageProps) {
  const { subdomain } = await params;

  try {
    const website = await apiClient.getWebsiteBySubdomain(subdomain);

    return {
      title: website.title,
      description: website.description || `Welcome to ${website.title}`,
    };
  } catch (error) {
    return {
      title: 'Website Not Found',
      description: 'The requested website could not be found.',
    };
  }
}
