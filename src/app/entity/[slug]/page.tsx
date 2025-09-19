import { notFound } from 'next/navigation';
import { ExternalLink, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { getEntityBySlug, getAllEntities } from '@/data/entities';
import OrgChart from '../../../components/OrgChart';
import { promises as fs } from 'fs';
import path from 'path';

export async function generateStaticParams() {
  const entities = getAllEntities();
  
  return entities.map((entity) => ({
    slug: entity.entity
      .toLowerCase()
      .replace(/[^\w\s-]/g, '-')
      .replace(/[\s-]+/g, '-')
      .replace(/^-+|-+$/g, ''),
  }));
}

interface Props {
  params: Promise<{ slug: string }>;
}

export default async function EntityPage({ params }: Props) {
  const { slug } = await params;
  const entity = getEntityBySlug(slug);

  if (!entity) {
    notFound();
  }

  const orgChartPath = `/org-charts/${slug}.jsonld`;
  
  // Check if org chart file exists using filesystem
  let orgChartExists = false;
  try {
    const filePath = path.join(process.cwd(), 'public', 'org-charts', `${slug}.jsonld`);
    await fs.access(filePath);
    orgChartExists = true;
  } catch {
    orgChartExists = false;
  }

  return (
    <main className="min-h-screen w-full p-4">
      <div className="w-full max-w-4xl mx-auto">
        <Link 
          href="/"
          className="inline-flex items-center gap-2 text-un-blue hover:opacity-80 transition-opacity mb-6"
        >
          <ArrowLeft size={16} />
          Back to UN System Chart
        </Link>

        <div>
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
                  <p><span className="font-medium">System Grouping:</span> {entity.system_grouping}</p>
                  <p><span className="font-medium">Category:</span> {entity.category}</p>
                </div>
                <div>
                  <p><span className="font-medium">UN Principal Organ:</span> {entity.un_principal_organ}</p>
                  <p><span className="font-medium">CEB Member:</span> {entity["ceb_member?"]}</p>
                </div>
              </div>
            </div>

            {/* Description */}
            {entity.entity_description && (
              <div>
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Description</h2>
                <p className="text-gray-700 leading-relaxed">{entity.entity_description}</p>
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
                {entity.entity_link && (
                  <a
                    href={entity.entity_link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-un-blue hover:opacity-80 p-3 border border-gray-200 rounded-lg hover:bg-gray-50"
                  >
                    <ExternalLink size={20} />
                    Official Website
                  </a>
                )}
                {entity.annual_reports_link && (
                  <a
                    href={entity.annual_reports_link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-un-blue hover:opacity-80 p-3 border border-gray-200 rounded-lg hover:bg-gray-50"
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
                    className="flex items-center gap-2 text-un-blue hover:opacity-80 p-3 border border-gray-200 rounded-lg hover:bg-gray-50"
                  >
                    <ExternalLink size={20} />
                    Transparency Portal
                  </a>
                )}
                {entity.organizational_chart_link && (
                  <a
                    href={entity.organizational_chart_link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-un-blue hover:opacity-80 p-3 border border-gray-200 rounded-lg hover:bg-gray-50"
                  >
                    <ExternalLink size={20} />
                    Organizational Chart
                  </a>
                )}
              </div>
            </div>

            {/* Additional Info */}
            {(entity.budget_financial_reporting_link || entity.comment) && (
              <div>
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Additional Information</h2>
                <div className="space-y-2">
                  {entity.budget_financial_reporting_link && (
                    <p><span className="font-medium">Budget/Financial Reporting:</span> 
                      <a href={entity.budget_financial_reporting_link} target="_blank" rel="noopener noreferrer" className="text-un-blue hover:opacity-80 ml-2">
                        View Link
                      </a>
                    </p>
                  )}
                  {entity.comment && (
                    <p><span className="font-medium">Notes:</span> {entity.comment}</p>
                  )}
                </div>
              </div>
            )}

            {/* Organizational Chart */}
            {orgChartExists && (
              <div>
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Organizational Chart</h2>
                <OrgChart src={orgChartPath} height={900} />
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
