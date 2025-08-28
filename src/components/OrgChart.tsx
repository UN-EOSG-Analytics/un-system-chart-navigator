"use client"
import React, { useEffect, useMemo, useRef, useState } from "react";
import dynamic from 'next/dynamic';

// Minimal types for compacted JSON-LD (rdflib output)
interface JsonLd {
  [k: string]: any;
  "@context"?: any;
  "@graph"?: any[];
}

export interface OrgChartProps {
  src?: string; // URL to JSON-LD
  data?: JsonLd; // already-loaded JSON-LD
  height?: number;
  className?: string;
}

// Helper to read a value that might be an object with @id/@value or a plain string
function getIdish(v: any): string | undefined {
  if (!v) return undefined;
  if (typeof v === "string") return v;
  if (v["@id"]) return v["@id"]; // JSON-LD object reference
  return undefined;
}
function getLabelish(v: any): string | undefined {
  if (!v) return undefined;
  if (typeof v === "string") return v;
  if (v["@value"]) return v["@value"];
  return undefined;
}

function iri(v: string) {
  // Keep IRIs as-is for node ids
  return v;
}

// Transform ORG JSON-LD → flat nodes for d3-org-chart
function jsonldToOrgChartNodes(jsonld: JsonLd) {
  const g = (jsonld["@graph"] || []) as any[];
  const nodes: any[] = [];
  const byId = new Map<string, any>();
  const add = (n: any) => {
    if (!byId.has(n.id)) {
      byId.set(n.id, n);
      nodes.push(n);
    }
  };

  const ORG_ORG = "org:Organization";
  const ORG_UNIT = "org:OrganizationalUnit";
  const ORG_POST = "org:Post";
  const ORG_MEMB = "org:Membership";
  const FOAF_PERS = "foaf:Person";

  console.log("JSON-LD graph has", g.length, "items");
  
  // Check @type handling - might be string or array
  const isType = (o: any, t: string) => {
    const type = o["@type"];
    if (Array.isArray(type)) {
      return type.includes(t);
    } else if (typeof type === "string") {
      return type === t;
    }
    return false;
  };
  
  const getId = (o: any) => o["@id"] as string;
  const label = (o: any) => getLabelish(o["skos:prefLabel"]) || getId(o);

  // Find all organizations
  const orgs = g.filter((o) => isType(o, ORG_ORG));
  console.log("Found organizations:", orgs.length, orgs);
  
  const root = orgs[0]; // Take the first organization as root
  if (root) {
    const rootNode = { id: iri(getId(root)), parentId: null, name: label(root), title: "Organization" };
    console.log("Adding root node:", rootNode);
    add(rootNode);
  } else {
    console.log("No root organization found");
  }

  // Units
  const units = g.filter((o) => isType(o, ORG_UNIT));
  console.log("Found units:", units.length, units);
  for (const u of units) {
    const uid = iri(getId(u));
    const parent = getIdish(u["org:unitOf"]) || (root ? iri(getId(root)) : null);
    const unitNode = { id: uid, parentId: parent, name: label(u), title: "Unit" };
    console.log("Adding unit node:", unitNode);
    add(unitNode);
  }

  // Posts
  const posts = g.filter((o) => isType(o, ORG_POST));
  for (const p of posts) {
    const pid = iri(getId(p));
    const unit = getIdish(p["org:postIn"]) || (root ? iri(getId(root)) : null);
    const name = getLabelish(p["skos:prefLabel"]) || "Post";
    add({ id: pid, parentId: unit, name, title: "Post" });
  }

  // Persons via Memberships (member → role(Post))
  const persons = new Map<string, any>(
    g.filter((o) => isType(o, FOAF_PERS)).map((o) => [getId(o), o])
  );
  const memberships = g.filter((o) => isType(o, ORG_MEMB));
  for (const m of memberships) {
    const personId = getIdish(m["org:member"]);
    const roleId = getIdish(m["org:role"]); // Post IRI
    if (!personId || !roleId) continue;
    const person = persons.get(personId);
    const name = person ? getLabelish(person["foaf:name"]) || personId : personId;
    add({ id: iri(personId), parentId: iri(roleId), name, title: "Person" });
  }

  return nodes;
}

// Internal component that does the actual chart rendering
function OrgChartInternal({ src, data, height = 700, className }: OrgChartProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [nodes, setNodes] = useState<any[] | null>(null);

  // Load JSON-LD if we have a URL
  useEffect(() => {
    let cancel = false;
    async function load() {
      try {
        console.log("OrgChart loading data:", { src, data });
        const jsonld: JsonLd = data || (src ? await (await fetch(src)).json() : ({} as any));
        if (!jsonld || cancel) return;
        
        console.log("Loaded JSON-LD:", jsonld);
        const transformedNodes = jsonldToOrgChartNodes(jsonld);
        console.log("Transformed nodes:", transformedNodes);
        
        if (transformedNodes.length === 0) {
          console.log("ORG CHART - Data is empty");
        }
        
        setNodes(transformedNodes);
      } catch (e) {
        console.error("Failed to load JSON-LD", e);
        setNodes([]);
      }
    }
    load();
    return () => { cancel = true; };
  }, [src, data]);

  // Render with d3-org-chart (loaded dynamically to avoid SSR issues)
  useEffect(() => {
    if (!containerRef.current || !nodes || nodes.length === 0) {
      console.log("OrgChart render conditions not met:", { hasContainer: !!containerRef.current, hasNodes: !!nodes, nodeCount: nodes?.length });
      return;
    }
    
    let destroyed = false;
    (async () => {
      try {
        console.log("Starting OrgChart render with nodes:", nodes);
        const d3 = await import("d3");
        const { OrgChart } = await import("d3-org-chart");

        // Clear container (hot reload safety)
        containerRef.current!.innerHTML = "";

        const chart = new (OrgChart as any)()
          .container(containerRef.current)
          .data(nodes)
          .nodeWidth(() => 150)
          .nodeHeight(() => 100)
          .childrenMargin(() => 60)
          .compact(true)
          .initialExpandLevel(2)
          .nodeContent((d: any) => {
            const n = d.data;
            return `
              <div style="padding:10px;border:1px solid #e5e7eb;border-radius:12px;background:#fff;box-shadow:0 1px 2px rgba(0,0,0,.06);">
                <div style="font-weight:700">${n.name || ""}</div>
                <div style="opacity:.7">${n.title || ""}</div>
                <div style="font-size:11px;opacity:.6;word-break:break-all">${n.id || ""}</div>
              </div>
            `;
          })
          .onNodeClick((d: any) => console.log("clicked", d.data))
          .render()

        console.log("OrgChart rendered successfully:", chart);

        // Resize handling
        const resize = () => {
          if (chart && typeof chart.fit === 'function') {
            chart.fit();
          }
        };
        window.addEventListener("resize", resize);
        
        // Call fit after a short delay to ensure DOM is ready
        setTimeout(() => {
          if (!destroyed) {
            resize();
          }
        }, 100);

        if (destroyed) return;
      } catch (error) {
        console.error("Error rendering OrgChart:", error);
      }
    })();

    return () => { destroyed = true; };
  }, [nodes]);

  return (
    <div className={className} style={{ width: "100%", height }}>
      <div ref={containerRef} style={{ width: "100%", height: "100%" }} />
    </div>
  );
}

// Main component with dynamic import
const OrgChart = dynamic(() => Promise.resolve(OrgChartInternal), { ssr: false });

export default OrgChart;