import { notFound } from 'next/navigation';
import { Entity } from '@/types/entity';
import { ExternalLink, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { findEntityBySlug } from '@/lib/utils';

interface Props {
  params: Promise<{ slug: string }>;
}

async function getEntity(slug: string): Promise<Entity | null> {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
    const response = await fetch(`${baseUrl}/api/entities`, {
      cache: 'no-store' // For demo purposes, in production you might want caching
    });
    
    if (!response.ok) {
      throw new Error('Failed to fetch entities');
    }
    
    const data = await response.json();
    
    // Use the utility function for consistent matching
    return findEntityBySlug(data.entities, slug);
  } catch (error) {
    console.error('Error fetching entity:', error);
    return null;
  }
}

export default async function EntityPage({ params }: Props) {
  const { slug } = await params;
  const entity = await getEntity(slug);

  if (!entity) {
    notFound();
  }

  return (
    <main className="min-h-screen w-full p-4">
      <div className="w-full max-w-4xl mx-auto">
        <Link 
          href="/"
          className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-800 mb-6"
        >
          <ArrowLeft size={16} />
          Back to UN System Chart
        </Link>

        <div className="bg-white rounded-lg shadow-lg p-8">
          {/* Header */}
          <div className="border-b border-gray-200 pb-6 mb-6">
            <h1 className="text-3xl font-bold text-gray-900">{entity.entity}</h1>
            <p className="text-xl text-gray-600 mt-2">{entity.entity_long}</p>
          </div>

          {/* Content */}
          <div className="space-y-8">
            {/* Basic Info */}
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Overview</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p><span className="font-medium">Group:</span> {entity.group}</p>
                  {entity.sub_group && (
                    <p><span className="font-medium">Sub Group:</span> {entity.sub_group}</p>
                  )}
                  <p><span className="font-medium">Category:</span> {entity.category}</p>
                </div>
                <div>
                  <p><span className="font-medium">UN Principal Organ:</span> {entity.un_principal_organ}</p>
                  <p><span className="font-medium">CEB Member:</span> {entity["ceb_member?"]}</p>
                </div>
              </div>
            </div>

            {/* Description */}
            {entity.description && (
              <div>
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Description</h2>
                <p className="text-gray-700 leading-relaxed">{entity.description}</p>
              </div>
            )}

            {/* Leadership */}
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Leadership</h2>
              <div className="space-y-2">
                <p><span className="font-medium">Head of Entity:</span> {entity.head_of_entity_name}</p>
                <p><span className="font-medium">Title:</span> {entity.head_of_entity_title}</p>
                <p><span className="font-medium">Level:</span> {entity.head_of_entity_level}</p>
              </div>
            </div>

            {/* Links */}
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Resources</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {entity.entity_url && (
                  <a
                    href={entity.entity_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-blue-600 hover:text-blue-800 p-3 border border-gray-200 rounded-lg hover:bg-gray-50"
                  >
                    <ExternalLink size={20} />
                    Official Website
                  </a>
                )}
                {entity.annual_report_link && (
                  <a
                    href={entity.annual_report_link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-blue-600 hover:text-blue-800 p-3 border border-gray-200 rounded-lg hover:bg-gray-50"
                  >
                    <ExternalLink size={20} />
                    Annual Report
                  </a>
                )}
                {entity.transparency_portal_link && (
                  <a
                    href={entity.transparency_portal_link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-blue-600 hover:text-blue-800 p-3 border border-gray-200 rounded-lg hover:bg-gray-50"
                  >
                    <ExternalLink size={20} />
                    Transparency Portal
                  </a>
                )}
                {entity.organizational_chart && (
                  <a
                    href={entity.organizational_chart}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-blue-600 hover:text-blue-800 p-3 border border-gray-200 rounded-lg hover:bg-gray-50"
                  >
                    <ExternalLink size={20} />
                    Organizational Chart
                  </a>
                )}
              </div>
            </div>

            {/* Additional Info */}
            {(entity.budget || entity.comment) && (
              <div>
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Additional Information</h2>
                <div className="space-y-2">
                  {entity.budget && (
                    <p><span className="font-medium">Budget:</span> {entity.budget}</p>
                  )}
                  {entity.comment && (
                    <p><span className="font-medium">Notes:</span> {entity.comment}</p>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
