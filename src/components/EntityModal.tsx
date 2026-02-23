"use client";

import EntityLogo from "@/components/EntityLogo";
import PrincipalOrganField, {
  getPrincipalOrganLabel,
} from "@/components/PrincipalOrganField";
import CloseButton from "@/components/CloseButton";
import ShareButton from "@/components/ShareButton";
import { generateContributeUrl } from "@/lib/utils";
import { Entity } from "@/types/entity";
import {
  BarChart3,
  Book,
  Briefcase,
  Database,
  DollarSign,
  Eye,
  FileEdit,
  Globe,
  Instagram,
  Linkedin,
  Network,
  Newspaper,
  Palette,
  ScrollText,
  Target,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";

// Custom X (Twitter) icon component to match lucide-react style
const XTwitterIcon = ({
  size = 24,
  className = "",
}: {
  size?: number;
  className?: string;
}) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <path d="M4 4l11.733 16h4.267l-11.733 -16z" />
    <path d="M4 20l6.768 -6.768m2.46 -2.46l6.772 -6.772" />
  </svg>
);

interface EntityModalProps {
  entity: Entity | null;
  onClose: () => void;
  loading: boolean;
}

export default function EntityModal({
  entity,
  onClose,
  loading,
}: EntityModalProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  const modalRef = useRef<HTMLDivElement>(null);
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);

  // Animation state management
  useEffect(() => {
    // Trigger entrance animation after mount
    const timer = setTimeout(() => setIsVisible(true), 10);
    return () => clearTimeout(timer);
  }, []);

  const handleClose = useCallback(() => {
    setIsClosing(true);
    // Wait for exit animation before actually closing
    setTimeout(() => {
      onClose();
    }, 300);
  }, [onClose]);

  // Close modal on escape key and open Airtable on 'e' key
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        handleClose();
      } else if (e.key === "e" && entity?.record_id) {
        // Open Airtable record in new tab
        window.open(
          `https://airtable.com/appJtP9H7xvsl3yAN/tblUbh0OZdOiZyrZ3/${entity.record_id}`,
          "_blank",
        );
      }
    };

    document.addEventListener("keydown", handleKeyPress);
    return () => document.removeEventListener("keydown", handleKeyPress);
  }, [handleClose, entity]);

  // Swipe handling
  const minSwipeDistance = 50;

  const onTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const onTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    const distance = touchStart - touchEnd;
    const isRightSwipe = distance < -minSwipeDistance;

    // Close on right swipe (swipe to dismiss)
    if (isRightSwipe) {
      handleClose();
    }
  };

  // Prevent body scroll when modal is open while maintaining scrollbar space
  useEffect(() => {
    // Store original values
    const originalOverflow = document.documentElement.style.overflow;

    // Prevent scrolling on the html element instead of body to preserve scrollbar
    document.documentElement.style.overflow = "hidden";

    return () => {
      // Restore original values
      document.documentElement.style.overflow = originalOverflow;
    };
  }, []);

  // Handle click outside to close
  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      handleClose();
    }
  };

  // Reusable subheader component
  const SubHeader = ({ children }: { children: React.ReactNode }) => (
    <h3 className="mb-3 text-lg font-normal tracking-wider text-gray-900 uppercase sm:text-xl">
      {children}
    </h3>
  );

  // Reusable field label component
  const FieldLabel = ({ children }: { children: React.ReactNode }) => (
    <span className="text-sm font-normal tracking-wide text-gray-600 uppercase">
      {children}
    </span>
  );

  // Reusable badge/chip component
  const Badge = ({ children }: { children: React.ReactNode }) => (
    <span className="inline-block rounded-full bg-gray-200 px-3 py-1 text-sm font-medium text-gray-800">
      {children}
    </span>
  );

  // Reusable field value wrapper component
  const FieldValue = ({ children }: { children: React.ReactNode }) => (
    <div className="mt-0.5">{children}</div>
  );

  // Complete field component combining label and value
  const Field = ({
    label,
    children,
  }: {
    label: string;
    children: React.ReactNode;
  }) => (
    <div>
      <FieldLabel>{label}</FieldLabel>
      <FieldValue>{children}</FieldValue>
    </div>
  );

  // Helper function to check if a link is valid
  const isValidLink = (link: string | null | undefined): boolean => {
    return link ? link.startsWith("https") : false;
  };

  // Reusable link component
  const LinkItem = ({
    href,
    icon: Icon,
    label,
  }: {
    href: string;
    icon: React.ComponentType<{ size: number; className: string }>;
    label: string;
  }) => (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="-ml-1 flex touch-manipulation items-center gap-3 rounded-lg py-2 pr-3 pl-2 text-un-blue transition-opacity duration-200 hover:bg-un-blue/10"
    >
      <Icon size={18} className="shrink-0" />
      <span className="text-base sm:text-lg">{label}</span>
    </a>
  );

  // Render header content based on state
  const renderHeader = () => {
    if (loading) {
      return (
        <div className="flex items-center justify-between">
          <div className="mr-4 h-6 w-48 flex-1 animate-pulse rounded bg-gray-200"></div>
          <CloseButton onClick={handleClose} />
        </div>
      );
    }

    if (!entity) {
      return (
        <div className="flex items-center justify-between">
          <h2 className="flex-1 pr-4 text-lg font-semibold text-gray-900 sm:text-xl">
            Entity Not Found
          </h2>
          <CloseButton onClick={handleClose} />
        </div>
      );
    }

    return (
      <div className="flex items-start justify-between gap-4">
        <h2
          className={`flex-1 leading-tight font-bold text-gray-900 ${
            (entity.entity + ": " + entity.entity_long).length > 60
              ? "text-xl sm:text-2xl lg:text-2xl"
              : "text-2xl sm:text-3xl lg:text-3xl"
          }`}
        >
          {entity.entity}: {entity.entity_long}
        </h2>
        <div className="flex flex-col items-end gap-1">
          <div className="flex items-center gap-1.5">
            <ShareButton />
            <CloseButton onClick={handleClose} />
          </div>
          <Link
            href={generateContributeUrl(entity)}
            target="_blank"
            rel="noopener noreferrer"
            className="shrink-0s-center flex h-8 w-full justify-start gap-2 rounded-md border border-gray-200 bg-white px-2 text-sm font-normal text-gray-500 transition-colors hover:border-un-blue hover:bg-un-blue/10 hover:text-un-blue sm:px-3"
            aria-label={`Contribute information about ${entity.entity}`}
          >
            <FileEdit className="h-4 w-4" />
            <span>Needs edit?</span>
          </Link>
        </div>
      </div>
    );
  };

  // Render body content based on state
  const renderBody = () => {
    if (loading) {
      return (
        <div className="space-y-4 p-4 sm:p-6">
          <div className="h-4 w-full animate-pulse rounded bg-gray-200"></div>
          <div className="h-4 w-3/4 animate-pulse rounded bg-gray-200"></div>
          <div className="h-4 w-1/2 animate-pulse rounded bg-gray-200"></div>
        </div>
      );
    }

    if (!entity) {
      return (
        <div className="p-4 sm:p-6">
          <p className="text-gray-600">
            The requested entity could not be found.
          </p>
        </div>
      );
    }

    // Full entity content - only if entity exists
    return (
      <div className="space-y-6 px-5 pt-4 pb-6 sm:px-7 sm:pt-5 sm:pb-8">
        {/* Logo */}
        {entity!.entity_logo_available && (
          <EntityLogo
            entityName={entity!.entity}
            entityLong={entity!.entity_long ?? undefined}
            className="h-12 w-auto max-w-48 sm:h-14 lg:h-16"
          />
        )}

        {/* Description */}
        {/* Temporarily hidden
        {entity!.entity_description && (
          <div>
            <p className="text-sm leading-relaxed text-gray-700 sm:text-base">
              {entity!.entity_description}
            </p>
          </div>
        )}
        */}

        {/* Basic Info */}
        <div>
          <SubHeader>Overview</SubHeader>
          <div className="space-y-4">
            {/* Principal Organ(s) */}
            <Field label={getPrincipalOrganLabel(entity!.un_principal_organ)}>
              <PrincipalOrganField
                principalOrgan={entity!.un_principal_organ}
              />
            </Field>
            {/* Headquarters */}
            {entity!.entity_headquarters && (
              <Field label="Headquarters">
                <span className="font-bold text-gray-700">
                  {entity!.entity_headquarters}
                </span>
              </Field>
            )}
          </div>
        </div>

        {/* Leadership */}
        {(() => {
          // Check if there's any actual displayable leadership information
          const hasName =
            entity!.head_of_entity_name &&
            entity!.head_of_entity_name !== "Not applicable";
          const hasLevel =
            entity!.head_of_entity_level &&
            entity!.head_of_entity_level !== "Not applicable";

          // Only show the section if there's at least a name or level to display
          if (!hasName && !hasLevel) {
            return null;
          }

          return (
            <div>
              <SubHeader>Leadership</SubHeader>
              <div className="space-y-4">
                {hasName && (
                  <Field label="">
                    {(() => {
                      // Temporarily hidden until headshot links are fixed
                      const hasPhoto = false; // entity!.head_of_entity_headshot_link && entity!.head_of_entity_headshot_link.trim() !== '';

                      if (hasPhoto) {
                        return (
                          <div className="ml-0.5 flex items-start gap-4">
                            <div className="shrink-0flow-hidden relative h-20 w-16 rounded-xl bg-gray-100">
                              <Image
                                src={entity!.head_of_entity_headshot_link!}
                                alt={`Portrait of ${entity!.head_of_entity_name}`}
                                fill
                                className="object-cover object-top"
                                unoptimized={true}
                                onError={(e) => {
                                  console.log(
                                    "Image failed to load:",
                                    entity!.head_of_entity_headshot_link,
                                  );
                                  e.currentTarget.style.display = "none";
                                }}
                              />
                            </div>
                            <div className="flex min-h-20 flex-col justify-center">
                              <div>
                                {/* Temporarily disabled link */}
                                {/* {entity!.head_of_entity_bio_link && entity!.head_of_entity_bio_link.startsWith('https') ? (
                                                                    <a
                                                                        href={entity!.head_of_entity_bio_link}
                                                                        target="_blank"
                                                                        rel="noopener noreferrer"
                                                                        className="text-un-blue hover:opacity-80 transition-opacity duration-200 text-base font-semibold underline decoration-1 underline-offset-2 leading-relaxed block"
                                                                    >
                                                                        {entity!.head_of_entity_name}
                                                                    </a>
                                                                ) : ( */}
                                <span className="block text-base leading-relaxed font-semibold text-un-blue">
                                  {entity!.head_of_entity_name}
                                </span>
                                {/* )} */}
                                {entity!.head_of_entity_title_specific &&
                                  entity!.head_of_entity_title_specific !==
                                    "Not applicable" && (
                                    <div className="text-base leading-tight text-gray-500">
                                      {entity!.head_of_entity_title_specific}
                                    </div>
                                  )}
                              </div>
                            </div>
                          </div>
                        );
                      } else {
                        // No photo - content shifts up to align with label but maintains consistent indent
                        return (
                          <div className="ml-0.5">
                            {/* Temporarily disabled link */}
                            {/* {entity!.head_of_entity_bio_link && entity!.head_of_entity_bio_link.startsWith('https') ? (
                                                            <a
                                                                href={entity!.head_of_entity_bio_link}
                                                                target="_blank"
                                                                rel="noopener noreferrer"
                                                                className="text-un-blue hover:opacity-80 transition-opacity duration-200 text-base font-semibold underline decoration-1 underline-offset-2 leading-relaxed block"
                                                            >
                                                                {entity!.head_of_entity_name}
                                                            </a>
                                                        ) : ( */}
                            <span className="block text-base leading-relaxed font-semibold text-un-blue">
                              {entity!.head_of_entity_name}
                            </span>
                            {/* )} */}
                            {entity!.head_of_entity_title_specific &&
                              entity!.head_of_entity_title_specific !==
                                "Not applicable" && (
                                <div className="text-base leading-tight text-gray-500">
                                  {entity!.head_of_entity_title_specific}
                                </div>
                              )}
                          </div>
                        );
                      }
                    })()}
                  </Field>
                )}
                {hasLevel && (
                  <Field label="">
                    <Badge>{entity!.head_of_entity_level}</Badge>
                  </Field>
                )}
              </div>
            </div>
          );
        })()}

        {/* Links */}
        {(() => {
          const hasLinks =
            isValidLink(entity!.entity_link) ||
            isValidLink(entity!.entity_news_page) ||
            isValidLink(entity!.entity_branding_page) ||
            isValidLink(entity!.entity_data_page) ||
            isValidLink(entity!.entity_careers_page) ||
            isValidLink(entity!.annual_reports_link) ||
            isValidLink(entity!.transparency_portal_link) ||
            isValidLink(entity!.budget_financial_reporting_link) ||
            isValidLink(entity!.strategic_plan_link) ||
            isValidLink(entity!.results_framework_link) ||
            isValidLink(entity!.organizational_chart_link) ||
            isValidLink(entity!.entity_custom_mandate_registry);

          if (!hasLinks) {
            return null;
          }

          return (
            <div>
              <SubHeader>Links</SubHeader>
              <div className="space-y-0.5">
                {/* Website */}
                {isValidLink(entity!.entity_link) && (
                  <LinkItem
                    href={entity!.entity_link!}
                    icon={Globe}
                    label="Official Website"
                  />
                )}

                {/* Annual Report */}
                {isValidLink(entity!.annual_reports_link) && (
                  <LinkItem
                    href={entity!.annual_reports_link!}
                    icon={Book}
                    label="Reports"
                  />
                )}

                {/* UN Mandate Source Registry - Always show */}
                {(() => {
                  const mandateUrl = isValidLink(
                    entity!.entity_mandate_registry,
                  )
                    ? entity!.entity_mandate_registry!
                    : `https://mandates.un.org/entity/${entity!.entity.toUpperCase()}`;

                  return (
                    <LinkItem
                      href={mandateUrl}
                      icon={ScrollText}
                      label="UN Mandate Source Registry"
                    />
                  );
                })()}

                {/* Entity Mandate Registry - Only show if custom mandate registry exists */}
                {isValidLink(entity!.entity_custom_mandate_registry) && (
                  <LinkItem
                    href={entity!.entity_custom_mandate_registry!}
                    icon={ScrollText}
                    label="Custom Mandate Registry"
                  />
                )}

                {/* Financials */}
                {isValidLink(entity!.budget_financial_reporting_link) && (
                  <LinkItem
                    href={entity!.budget_financial_reporting_link!}
                    icon={DollarSign}
                    label="Financials & Budget"
                  />
                )}

                {/* Transparency Portal */}
                {isValidLink(entity!.transparency_portal_link) && (
                  <LinkItem
                    href={entity!.transparency_portal_link!}
                    icon={Eye}
                    label="Transparency Portal"
                  />
                )}

                {/* Strategic Plan */}
                {isValidLink(entity!.strategic_plan_link) && (
                  <LinkItem
                    href={entity!.strategic_plan_link!}
                    icon={Target}
                    label="Strategic Plan"
                  />
                )}

                {/* Results Framework */}
                {isValidLink(entity!.results_framework_link) && (
                  <LinkItem
                    href={entity!.results_framework_link!}
                    icon={BarChart3}
                    label="Results Framework"
                  />
                )}

                {/* Organizational Chart */}
                {isValidLink(entity!.organizational_chart_link) && (
                  <LinkItem
                    href={entity!.organizational_chart_link!}
                    icon={Network}
                    label="Organizational Chart"
                  />
                )}

                {/* Data Page */}
                {isValidLink(entity!.entity_data_page) && (
                  <LinkItem
                    href={entity!.entity_data_page!}
                    icon={Database}
                    label="Data Portal"
                  />
                )}

                {/* News Portal */}
                {isValidLink(entity!.entity_news_page) && (
                  <LinkItem
                    href={entity!.entity_news_page!}
                    icon={Newspaper}
                    label="News"
                  />
                )}

                {/* Branding Page */}
                {isValidLink(entity!.entity_branding_page) && (
                  <LinkItem
                    href={entity!.entity_branding_page!}
                    icon={Palette}
                    label="Branding"
                  />
                )}

                {/* Jobs Page */}
                {isValidLink(entity!.entity_careers_page) && (
                  <LinkItem
                    href={entity!.entity_careers_page!}
                    icon={Briefcase}
                    label="Careers"
                  />
                )}
              </div>
            </div>
          );
        })()}

        {/* Socials */}
        {(() => {
          const hasSocials =
            isValidLink(entity!.socials_linkedin) ||
            isValidLink(entity!.socials_twitter) ||
            isValidLink(entity!.socials_instagram);

          if (!hasSocials) {
            return null;
          }

          return (
            <div>
              <SubHeader>Socials</SubHeader>
              <div className="space-y-0.5">
                {/* LinkedIn */}
                {isValidLink(entity!.socials_linkedin) && (
                  <LinkItem
                    href={entity!.socials_linkedin!}
                    icon={Linkedin}
                    label="LinkedIn"
                  />
                )}

                {/* X (formerly Twitter) */}
                {isValidLink(entity!.socials_twitter) && (
                  <LinkItem
                    href={entity!.socials_twitter!}
                    icon={XTwitterIcon}
                    label="X (formerly Twitter)"
                  />
                )}

                {/* Instagram */}
                {isValidLink(entity!.socials_instagram) && (
                  <LinkItem
                    href={entity!.socials_instagram!}
                    icon={Instagram}
                    label="Instagram"
                  />
                )}
              </div>
            </div>
          );
        })()}

        {/* Contribution Prompt */}
        <div className="mt-8 mr-2 -ml-1 rounded-lg border border-gray-200 bg-gray-50 px-5 py-3">
          <p className="text-sm leading-relaxed text-gray-700">
            Notice something incorrect or have information to add?{" "}
            <a
              href={generateContributeUrl(entity!)}
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium text-un-blue underline decoration-1 underline-offset-2 hover:text-un-blue/80"
            >
              Let us know.
            </a>
          </p>
        </div>

        {/* Footnotes */}
        {entity!.entity_footnotes && entity!.entity_footnotes.trim() !== "" && (
          <div className="mt-6 border-t border-gray-100 pt-2">
            <div className="mb-1 text-xs font-medium tracking-wider text-gray-400 uppercase">
              Notes
            </div>
            <div className="ml-1.5 space-y-0.5 text-xs leading-snug text-gray-500">
              {entity!.entity_footnotes
                .split("\n")
                .filter((line) => line.trim())
                .map((line, index) => (
                  <div key={index} className="flex items-start">
                    <span className="mr-2 shrink-0 text-gray-400">•</span>
                    <span>{line.replace(/^-\s*/, "").trim()}</span>
                  </div>
                ))}
            </div>
          </div>
        )}
      </div>
    );
  };

  // Single modal wrapper with dynamic content
  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-end bg-black/50 transition-all duration-300 ease-out ${
        isVisible && !isClosing ? "opacity-100" : "opacity-0"
      }`}
      onClick={handleBackdropClick}
    >
      <div
        ref={modalRef}
        className={`h-full w-full bg-white shadow-2xl transition-transform duration-300 ease-out sm:w-2/3 sm:min-w-100 md:w-1/2 lg:w-1/3 lg:min-w-125 ${entity ? "overflow-y-auto" : ""} ${
          isVisible && !isClosing ? "translate-x-0" : "translate-x-full"
        }`}
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
      >
        {/* Header */}
        <div
          className={`border-b border-gray-300 px-5 pt-3 pb-2 sm:px-7 sm:pt-4 sm:pb-3 ${entity ? "sticky top-0 bg-white" : ""}`}
        >
          {renderHeader()}
        </div>

        {/* Body Content */}
        {renderBody()}
      </div>
    </div>
  );
}
