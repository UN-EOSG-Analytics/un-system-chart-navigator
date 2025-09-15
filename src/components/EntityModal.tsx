'use client';

import { Entity } from '@/types/entity';
import { X, ExternalLink } from 'lucide-react';
import { useEffect } from 'react';

interface EntityModalProps {
  entity: Entity | null;
  onClose: () => void;
  loading: boolean;
}

export default function EntityModal({ entity, onClose, loading }: EntityModalProps) {
  // Close modal on escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [onClose]);

  // Prevent body scroll when modal is open while maintaining scrollbar space
  useEffect(() => {
    // Get the current scrollbar width
    const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
    
    // Store original values
    const originalOverflow = document.body.style.overflow;
    const originalPaddingRight = document.body.style.paddingRight;
    
    // Apply styles to prevent scrolling while maintaining layout
    document.body.style.overflow = 'hidden';
    document.body.style.paddingRight = `${scrollbarWidth}px`;
    
    return () => {
      // Restore original values
      document.body.style.overflow = originalOverflow;
      document.body.style.paddingRight = originalPaddingRight;
    };
  }, []);

  // Handle click outside to close
  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  if (loading) {
    return (
      <div 
        className="fixed inset-0 bg-black/50 flex items-center justify-end z-50 transition-all duration-500 ease-out"
        onClick={handleBackdropClick}
      >
        <div className="w-1/3 min-w-[500px] h-full bg-white shadow-2xl transform translate-x-0 transition-transform duration-500 ease-out">
          <div className="p-6 border-b border-gray-200 flex items-center justify-between">
            <div className="h-6 bg-gray-200 rounded w-48 animate-pulse"></div>
            <button
              onClick={onClose}
              className="p-1 hover:bg-gray-100 rounded-full transition-colors"
            >
              <X size={24} />
            </button>
          </div>
          <div className="p-6 space-y-4">
            <div className="h-4 bg-gray-200 rounded w-full animate-pulse"></div>
            <div className="h-4 bg-gray-200 rounded w-3/4 animate-pulse"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2 animate-pulse"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!entity) {
    return (
      <div 
        className="fixed inset-0 bg-black/50 flex items-center justify-end z-50 transition-all duration-500 ease-out"
        onClick={handleBackdropClick}
      >
        <div className="w-1/3 min-w-[500px] h-full bg-white shadow-2xl transform translate-x-0 transition-transform duration-500 ease-out">
          <div className="p-6 border-b border-gray-200 flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-900">Entity Not Found</h2>
            <button
              onClick={onClose}
              className="p-1 hover:bg-gray-100 rounded-full transition-colors"
            >
              <X size={24} />
            </button>
          </div>
          <div className="p-6">
            <p className="text-gray-600">The requested entity could not be found.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div 
      className="fixed inset-0 bg-black/50 flex items-center justify-end z-50 transition-all duration-500 ease-out"
      onClick={handleBackdropClick}
    >
      <div className="w-1/3 min-w-[500px] h-full bg-white shadow-2xl transform translate-x-0 transition-transform duration-500 ease-out overflow-y-auto">
        {/* Header */}
        <div className="p-6 border-b border-gray-200 flex items-center justify-between sticky top-0 bg-white">
          <h2 className="text-xl font-semibold text-gray-900">{entity.entity_long}</h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Basic Info */}
          <div>
            <h3 className="text-xl font-medium text-gray-900 mb-3">Overview</h3>
            <div className="space-y-2">
              <p><span className="font-medium">Category:</span> {entity.category}</p>
              <p><span className="font-medium">UN Principal Organ:</span> {entity.un_principal_organ}</p>
            </div>
          </div>

          {/* Description */}
          {entity.entity_description && (
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-3">Description</h3>
              <p className="text-gray-700 leading-relaxed">{entity.entity_description}</p>
            </div>
          )}

          {/* Links */}
          <div>
            <h3 className="text-xl font-medium text-gray-900 mb-3">Links</h3>
            <div className="space-y-3">
              {entity.entity_link && (
                <a
                  href={entity.entity_link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-un-blue hover:opacity-80 transition-opacity"
                >
                  <ExternalLink size={16} />
                  Official Website
                </a>
              )}
              {entity.annual_reports_link && (
                <a
                  href={entity.annual_reports_link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-un-blue hover:opacity-80 transition-opacity"
                >
                  <ExternalLink size={16} />
                  Annual Report
                </a>
              )}
              {entity.transparency_portal_link && (
                <a
                  href={entity.transparency_portal_link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-un-blue hover:opacity-80 transition-opacity"
                >
                  <ExternalLink size={16} />
                  Transparency Portal
                </a>
              )}
              {entity.organizational_chart_link && (
                <a
                  href={entity.organizational_chart_link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-un-blue hover:opacity-80 transition-opacity"
                >
                  <ExternalLink size={16} />
                  Organizational Chart
                </a>
              )}
            </div>
          </div>

          {/* Additional Info */}
          {(entity.budget_financial_reporting_link || entity.comment) && (
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-3">Additional Information</h3>
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
                <p><span className="font-medium">CEB Member:</span> {entity["ceb_member?"]}</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
