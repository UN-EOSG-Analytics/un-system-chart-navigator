import ExternalLink from "./ExternalLink";

export default function ExplainerText() {
  return (
    <p className="mt-1 mb-0.5 text-base leading-snug text-gray-600 sm:text-base sm:leading-relaxed lg:text-lg">
      The <strong>UN System Chart</strong> intends to provide a graphical
      reflection of the functional organization of the United Nations system and
      is for informational purposes only. The print version is available{" "}
      <ExternalLink href="https://www.un.org/en/delegate/page/un-system-chart">
        here
      </ExternalLink>
      .
    </p>
  );
}
