import Link from 'next/link';

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto text-center">
          {/* Hero Section */}
          <h1 className="text-5xl font-bold text-gray-900 mb-6">
            Build Websites Without Coding
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            Create beautiful, professional websites using our drag-and-drop platform.
            No technical skills required.
          </p>

          {/* CTA Buttons */}
          <div className="flex gap-4 justify-center mb-16">
            <Link
              href="/admin"
              className="px-8 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors"
            >
              Get Started
            </Link>
            <Link
              href="/admin/components"
              className="px-8 py-3 bg-white text-blue-600 rounded-lg font-semibold border-2 border-blue-600 hover:bg-blue-50 transition-colors"
            >
              Browse Components
            </Link>
          </div>

          {/* Features */}
          <div className="grid md:grid-cols-3 gap-8 mt-16">
            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="text-4xl mb-4">🎨</div>
              <h3 className="text-xl font-semibold mb-2">Dynamic Components</h3>
              <p className="text-gray-600">
                Load pre-built components from S3 and customize them in real-time
              </p>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="text-4xl mb-4">📱</div>
              <h3 className="text-xl font-semibold mb-2">Mobile Management</h3>
              <p className="text-gray-600">
                Manage your website from anywhere using our mobile app
              </p>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="text-4xl mb-4">🚀</div>
              <h3 className="text-xl font-semibold mb-2">Custom Subdomain</h3>
              <p className="text-gray-600">
                Get your own subdomain instantly - yourname.ezweb.com
              </p>
            </div>
          </div>

          {/* Tech Stack */}
          <div className="mt-16 pt-16 border-t border-gray-300">
            <h2 className="text-2xl font-bold mb-4 text-gray-800">Built with Modern Technology</h2>
            <div className="flex flex-wrap justify-center gap-4 text-sm text-gray-600">
              <span className="px-4 py-2 bg-white rounded-full">Next.js</span>
              <span className="px-4 py-2 bg-white rounded-full">Spring Boot</span>
              <span className="px-4 py-2 bg-white rounded-full">Flutter</span>
              <span className="px-4 py-2 bg-white rounded-full">AWS S3</span>
              <span className="px-4 py-2 bg-white rounded-full">PostgreSQL</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
