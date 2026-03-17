import ExternalLink from "./ExternalLink";

export default function ExplainerText() {
  return (
    <p className="mt-0.5 mb-0 text-[13px] leading-snug text-gray-600 sm:text-sm sm:leading-snug lg:text-[15px]">
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
