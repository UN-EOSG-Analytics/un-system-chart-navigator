import { cn } from "@/lib/utils";
import { ExternalLink as ExternalLinkIcon } from "lucide-react";

interface ExternalLinkProps extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
  href: string;
  children: React.ReactNode;
  className?: string;
  iconClassName?: string;
  /** Set false to suppress the outlink icon (e.g. when placing it manually after a footnote) */
  icon?: boolean;
}

export default function ExternalLink({
  href,
  children,
  className,
  iconClassName,
  icon = true,
  ...props
}: ExternalLinkProps) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={cn(
        "inline-flex items-center gap-[0.2em] font-bold text-un-blue transition-all hover:underline",
        className,
      )}
      {...props}
    >
      {children}
      {icon && (
        <ExternalLinkIcon
          className={cn(
            "h-[0.75em] w-[0.75em] shrink-0 -translate-y-[0.1em]",
            iconClassName,
          )}
          aria-hidden="true"
        />
      )}
    </a>
  );
}
