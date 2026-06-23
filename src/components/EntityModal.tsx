"use client";

import CloseButton from "@/components/CloseButton";
import EntityLogo from "@/components/EntityLogo";
import PrincipalOrganField, {
  getPrincipalOrganLabel,
} from "@/components/PrincipalOrganField";
import ShareButton from "@/components/ShareButton";
import { featureFlags } from "@/lib/constants";
import { generateContributeUrl } from "@/lib/utils";
import { Entity } from "@/types/entity";
import {
  BarChart3,
  Book,
  Briefcase,
  Database,
  DollarSign,
  Eye,
  Globe,
  Network,
  Newspaper,
  Palette,
  ScrollText,
  Target,
} from "lucide-react";
import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";
import { entityModal } from "@/lib/styles";

const LINKEDIN_ICON_PATH =
  "M347.445,0H34.555C15.471,0,0,15.471,0,34.555v312.889C0,366.529,15.471,382,34.555,382h312.889 C366.529,382,382,366.529,382,347.444V34.555C382,15.471,366.529,0,347.445,0z M118.207,329.844c0,5.554-4.502,10.056-10.056,10.056 H65.345c-5.554,0-10.056-4.502-10.056-10.056V150.403c0-5.554,4.502-10.056,10.056-10.056h42.806 c5.554,0,10.056,4.502,10.056,10.056V329.844z M86.748,123.432c-22.459,0-40.666-18.207-40.666-40.666S64.289,42.1,86.748,42.1 s40.666,18.207,40.666,40.666S109.208,123.432,86.748,123.432z M341.91,330.654c0,5.106-4.14,9.246-9.246,9.246H286.73 c-5.106,0-9.246-4.14-9.246-9.246v-84.168c0-12.556,3.683-55.021-32.813-55.021c-28.309,0-34.051,29.066-35.204,42.11v97.079 c0,5.106-4.139,9.246-9.246,9.246h-44.426c-5.106,0-9.246-4.14-9.246-9.246V149.593c0-5.106,4.14-9.246,9.246-9.246h44.426 c5.106,0,9.246,4.14,9.246,9.246v15.655c10.497-15.753,26.097-27.912,59.312-27.912c73.552,0,73.131,68.716,73.131,106.472 L341.91,330.654L341.91,330.654z";

const INSTAGRAM_ICON_PATH =
  "M12 18C15.3137 18 18 15.3137 18 12C18 8.68629 15.3137 6 12 6C8.68629 6 6 8.68629 6 12C6 15.3137 8.68629 18 12 18ZM12 16C14.2091 16 16 14.2091 16 12C16 9.79086 14.2091 8 12 8C9.79086 8 8 9.79086 8 12C8 14.2091 9.79086 16 12 16Z M18 5C17.4477 5 17 5.44772 17 6C17 6.55228 17.4477 7 18 7C18.5523 7 19 6.55228 19 6C19 5.44772 18.5523 5 18 5Z M1.65396 4.27606C1 5.55953 1 7.23969 1 10.6V13.4C1 16.7603 1 18.4405 1.65396 19.7239C2.2292 20.8529 3.14708 21.7708 4.27606 22.346C5.55953 23 7.23969 23 10.6 23H13.4C16.7603 23 18.4405 23 19.7239 22.346C20.8529 21.7708 21.7708 20.8529 22.346 19.7239C23 18.4405 23 16.7603 23 13.4V10.6C23 7.23969 23 5.55953 22.346 4.27606C21.7708 3.14708 20.8529 2.2292 19.7239 1.65396C18.4405 1 16.7603 1 13.4 1H10.6C7.23969 1 5.55953 1 4.27606 1.65396C3.14708 2.2292 2.2292 3.14708 1.65396 4.27606ZM13.4 3H10.6C8.88684 3 7.72225 3.00156 6.82208 3.0751C5.94524 3.14674 5.49684 3.27659 5.18404 3.43597C4.43139 3.81947 3.81947 4.43139 3.43597 5.18404C3.27659 5.49684 3.14674 5.94524 3.0751 6.82208C3.00156 7.72225 3 8.88684 3 10.6V13.4C3 15.1132 3.00156 16.2777 3.0751 17.1779C3.14674 18.0548 3.27659 18.5032 3.43597 18.816C3.81947 19.5686 4.43139 20.1805 5.18404 20.564C5.49684 20.7234 5.94524 20.8533 6.82208 20.9249C7.72225 20.9984 8.88684 21 10.6 21H13.4C15.1132 21 16.2777 20.9984 17.1779 20.9249C18.0548 20.8533 18.5032 20.7234 18.816 20.564C19.5686 20.1805 20.1805 19.5686 20.564 18.816C20.7234 18.5032 20.8533 18.0548 20.9249 17.1779C20.9984 16.2777 21 15.1132 21 13.4V10.6C21 8.88684 20.9984 7.72225 20.9249 6.82208C20.8533 5.94524 20.7234 5.49684 20.564 5.18404C20.1805 4.43139 19.5686 3.81947 18.816 3.43597C18.5032 3.27659 18.0548 3.14674 17.1779 3.0751C16.2777 3.00156 15.1132 3 13.4 3Z";

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
    <h3 className={entityModal.subHeader}>{children}</h3>
  );

  // Reusable field label component
  const FieldLabel = ({ children }: { children: React.ReactNode }) => (
    <span className={entityModal.fieldLabel}>{children}</span>
  );

  // Reusable badge/chip component
  const Badge = ({ children }: { children: React.ReactNode }) => (
    <span className={entityModal.badge}>{children}</span>
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
      className={entityModal.linkItem}
    >
      <Icon size={18} className="shrink-0" />
      <span className="text-base sm:text-lg">{label}</span>
    </a>
  );

  const LinkedinIcon = ({
    size = 18,
    className = "",
  }: {
    size?: number;
    className?: string;
  }) => (
    <svg
      width={size}
      height={size}
      viewBox="0 0 382 382"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      <path fill="currentColor" d={LINKEDIN_ICON_PATH} />
    </svg>
  );

  const InstagramIcon = ({
    size = 18,
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
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        fill="currentColor"
        d={INSTAGRAM_ICON_PATH}
      />
    </svg>
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
      <>
        <div className="pr-20">
          <span className={entityModal.acronym}>{entity.entity}</span>
          <h2 className={entityModal.title}>{entity.entity_long}</h2>
        </div>
        <div className="absolute top-4 right-6 flex items-center gap-1.5">
          <ShareButton />
          <CloseButton onClick={handleClose} />
        </div>
      </>
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
      <div className={entityModal.body}>
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
                <span className="text-sm text-gray-900">
                  {entity!.entity_headquarters}
                </span>
              </Field>
            )}
          </div>
        </div>

        {/* Leadership — hidden, do not remove */}
        {false &&
          (() => {
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
                    icon={LinkedinIcon}
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
                    icon={InstagramIcon}
                    label="Instagram"
                  />
                )}
              </div>
            </div>
          );
        })()}

        {featureFlags.contribute && (
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
        )}

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
      className={`${entityModal.backdrop} ${isVisible && !isClosing ? "opacity-100" : "opacity-0"}`}
      onClick={handleBackdropClick}
    >
      <div
        ref={modalRef}
        className={`${entityModal.panel} ${entity ? "overflow-y-auto" : ""} ${isVisible && !isClosing ? "translate-x-0" : "translate-x-full"}`}
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
      >
        {/* Header */}
        <div
          className={`${entityModal.header} ${entity ? "sticky top-0 bg-white" : ""}`}
        >
          {renderHeader()}
        </div>

        {/* Body Content */}
        {renderBody()}
      </div>
    </div>
  );
}
