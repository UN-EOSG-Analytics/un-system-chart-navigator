"use client";

import { useState, useMemo } from "react";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  ExternalLink,
  Search,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Shield,
  CheckCircle2,
  XCircle,
  AlertCircle,
} from "lucide-react";
import data from "../../../../public/entity_link_verification_results.json";

type SortField = "entity" | "accessible" | "status_code" | "content_length";
type SortDirection = "asc" | "desc" | null;

const isInvalidUrl = (url: string, error: string | null) => {
  return (
    !url ||
    url === "" ||
    error === "Invalid or placeholder URL" ||
    [
      "Not found",
      "Not found.",
      "Not applicable",
      "No link found",
      "null",
      "None",
    ].includes(url)
  );
};

export default function DevPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<
    "all" | "accessible" | "inaccessible" | "protected" | "missing"
  >("all");
  const [sortField, setSortField] = useState<SortField | null>(null);
  const [sortDirection, setSortDirection] = useState<SortDirection>(null);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      if (sortDirection === "asc") {
        setSortDirection("desc");
      } else if (sortDirection === "desc") {
        setSortField(null);
        setSortDirection(null);
      } else {
        setSortDirection("asc");
      }
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  const getSortIcon = (field: SortField) => {
    if (sortField !== field) {
      return <ArrowUpDown className="ml-2 h-4 w-4" />;
    }
    if (sortDirection === "asc") {
      return <ArrowUp className="ml-2 h-4 w-4" />;
    }
    return <ArrowDown className="ml-2 h-4 w-4" />;
  };

  const stats = useMemo(() => {
    const total = data.length;
    const accessible = data.filter((item) => item.accessible).length;
    const missing = data.filter((item) =>
      isInvalidUrl(item.url, item.error),
    ).length;
    const protected_sites = data.filter(
      (item) =>
        !isInvalidUrl(item.url, item.error) &&
        !item.accessible &&
        (item.cloudflare_protected || item.status_code === 403),
    ).length;
    const failed = total - accessible - missing - protected_sites;
    return { total, accessible, failed, missing, protected: protected_sites };
  }, []);

  const filteredAndSortedData = useMemo(() => {
    let filtered = data.filter(
      (item) =>
        item.entity.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.url.toLowerCase().includes(searchTerm.toLowerCase()),
    );

    // Apply status filter
    if (filterStatus === "accessible") {
      filtered = filtered.filter((item) => item.accessible);
    } else if (filterStatus === "missing") {
      filtered = filtered.filter((item) => isInvalidUrl(item.url, item.error));
    } else if (filterStatus === "protected") {
      filtered = filtered.filter(
        (item) =>
          !isInvalidUrl(item.url, item.error) &&
          !item.accessible &&
          (item.cloudflare_protected || item.status_code === 403),
      );
    } else if (filterStatus === "inaccessible") {
      filtered = filtered.filter(
        (item) =>
          !item.accessible &&
          !isInvalidUrl(item.url, item.error) &&
          !(item.cloudflare_protected || item.status_code === 403),
      );
    }

    if (sortField && sortDirection) {
      filtered = [...filtered].sort((a, b) => {
        let aVal = a[sortField];
        let bVal = b[sortField];

        if (sortField === "accessible") {
          aVal = a.accessible ? 1 : 0;
          bVal = b.accessible ? 1 : 0;
        }

        if (aVal === null || aVal === undefined) return 1;
        if (bVal === null || bVal === undefined) return -1;

        if (sortDirection === "asc") {
          return aVal > bVal ? 1 : -1;
        } else {
          return aVal < bVal ? 1 : -1;
        }
      });
    }

    return filtered;
  }, [searchTerm, filterStatus, sortField, sortDirection]);

  const getStatusBadge = (statusCode: number, statusName: string) => {
    let className = "font-mono border-0";

    if (statusCode >= 200 && statusCode < 300) {
      className += " bg-green-100 text-green-700";
    } else if (statusCode >= 300 && statusCode < 400) {
      className += " bg-blue-100 text-blue-700";
    } else {
      className += " bg-red-100 text-red-700";
    }

    return (
      <Badge className={className}>
        {statusCode} {statusName}
      </Badge>
    );
  };

  return (
    <main className="w-full grow pt-2 pb-3 sm:pt-3 sm:pb-4 md:pt-4 md:pb-6">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-4 px-4 sm:gap-6">
        {/* Header */}
        <div className="flex flex-col gap-3">
          <h1 className="text-left">
            <div className="inline-flex flex-wrap items-center gap-x-1.5 gap-y-0 text-left sm:gap-x-2">
              <span className="text-2xl leading-tight font-bold whitespace-nowrap text-foreground sm:text-4xl lg:text-5xl">
                Entity Link
              </span>
              <span className="text-2xl leading-tight font-normal whitespace-nowrap text-foreground sm:text-4xl lg:text-5xl">
                Verification
              </span>
            </div>
          </h1>
          <p className="mt-1 mb-0.5 text-base leading-snug text-gray-600 sm:text-base sm:leading-relaxed lg:text-lg">
            Verification results for{" "}
            <code className="rounded bg-gray-100 px-1.5 py-0.5 font-mono text-sm text-un-blue">
              entity_link
            </code>{" "}
            — <strong>{data.length}</strong> total entities
          </p>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setFilterStatus("all")}
            className={`rounded-lg px-4 py-2 text-sm font-medium shadow-sm transition-all ${
              filterStatus === "all"
                ? "bg-un-blue text-white shadow-md ring-2 ring-un-blue/20"
                : "border border-gray-200 bg-white text-gray-700 hover:bg-gray-50"
            }`}
          >
            All ({data.length})
          </button>
          <button
            onClick={() => setFilterStatus("accessible")}
            className={`rounded-lg px-4 py-2 text-sm font-medium shadow-sm transition-all ${
              filterStatus === "accessible"
                ? "bg-green-600 text-white shadow-md ring-2 ring-green-600/20"
                : "border border-green-200 bg-white text-green-700 hover:bg-green-50"
            }`}
          >
            <CheckCircle2 className="-mt-0.5 mr-1.5 inline h-3.5 w-3.5" />
            Accessible ({stats.accessible})
          </button>
          <button
            onClick={() => setFilterStatus("protected")}
            className={`rounded-lg px-4 py-2 text-sm font-medium shadow-sm transition-all ${
              filterStatus === "protected"
                ? "bg-amber-600 text-white shadow-md ring-2 ring-amber-600/20"
                : "border border-amber-200 bg-white text-amber-700 hover:bg-amber-50"
            }`}
          >
            <Shield className="-mt-0.5 mr-1.5 inline h-3.5 w-3.5" />
            Protected ({stats.protected})
          </button>
          <button
            onClick={() => setFilterStatus("inaccessible")}
            className={`rounded-lg px-4 py-2 text-sm font-medium shadow-sm transition-all ${
              filterStatus === "inaccessible"
                ? "bg-red-600 text-white shadow-md ring-2 ring-red-600/20"
                : "border border-red-200 bg-white text-red-700 hover:bg-red-50"
            }`}
          >
            <XCircle className="-mt-0.5 mr-1.5 inline h-3.5 w-3.5" />
            Failed ({stats.failed})
          </button>
          <button
            onClick={() => setFilterStatus("missing")}
            className={`rounded-lg px-4 py-2 text-sm font-medium shadow-sm transition-all ${
              filterStatus === "missing"
                ? "bg-slate-600 text-white shadow-md ring-2 ring-slate-600/20"
                : "border border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
            }`}
          >
            <AlertCircle className="-mt-0.5 mr-1.5 inline h-3.5 w-3.5" />
            Missing ({stats.missing})
          </button>
        </div>

        {/* Search */}
        <div className="relative max-w-md">
          <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <Input
            type="text"
            placeholder="Search entities or URLs..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="border-gray-200 pl-9 focus:border-un-blue focus:ring-un-blue/20"
          />
        </div>

        {/* Results count */}
        {searchTerm && (
          <p className="text-sm text-gray-600">
            Showing <strong>{filteredAndSortedData.length}</strong> of{" "}
            <strong>{data.length}</strong> results
          </p>
        )}

        {/* Table */}
        <div className="w-full overflow-hidden rounded-lg border border-gray-200 bg-white">
          <div className="overflow-auto">
            <Table>
              <TableHeader>
                <TableRow className="border-b border-gray-200 bg-gray-50">
                  <TableHead
                    className="cursor-pointer font-semibold whitespace-nowrap text-gray-700 hover:bg-gray-100/80 hover:text-un-blue"
                    onClick={() => handleSort("entity")}
                  >
                    <div className="flex items-center">
                      Entity
                      {getSortIcon("entity")}
                    </div>
                  </TableHead>
                  <TableHead className="w-[30%] font-semibold text-gray-700">
                    URL
                  </TableHead>
                  <TableHead
                    className="cursor-pointer font-semibold whitespace-nowrap text-gray-700 hover:bg-gray-100/80 hover:text-un-blue"
                    onClick={() => handleSort("accessible")}
                  >
                    <div className="flex items-center">
                      Status
                      {getSortIcon("accessible")}
                    </div>
                  </TableHead>
                  <TableHead
                    className="cursor-pointer font-semibold whitespace-nowrap text-gray-700 hover:bg-gray-100/80 hover:text-un-blue"
                    onClick={() => handleSort("status_code")}
                  >
                    <div className="flex items-center">
                      HTTP Status
                      {getSortIcon("status_code")}
                    </div>
                  </TableHead>
                  <TableHead
                    className="cursor-pointer font-semibold whitespace-nowrap text-gray-700 hover:bg-gray-100/80 hover:text-un-blue"
                    onClick={() => handleSort("content_length")}
                  >
                    <div className="flex items-center">
                      Size
                      {getSortIcon("content_length")}
                    </div>
                  </TableHead>
                  <TableHead className="w-[25%] font-semibold text-gray-700">
                    Redirect
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredAndSortedData.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={6}
                      className="h-24 text-center text-gray-500"
                    >
                      No results found
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredAndSortedData.map((item, index) => (
                    <TableRow
                      key={index}
                      className="group border-b border-gray-100 transition-colors hover:bg-gray-50"
                    >
                      <TableCell className="font-medium whitespace-nowrap text-gray-900">
                        {item.entity}
                      </TableCell>
                      <TableCell className="max-w-0">
                        <a
                          href={item.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1 text-un-blue hover:underline"
                        >
                          <span className="block truncate">{item.url}</span>
                          <ExternalLink className="h-3 w-3 flex-shrink-0 opacity-0 transition-opacity group-hover:opacity-100" />
                        </a>
                      </TableCell>
                      <TableCell className="whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          {isInvalidUrl(item.url, item.error) ? (
                            <Badge className="border-0 bg-slate-100 font-medium text-slate-700">
                              <AlertCircle className="mr-1 h-3 w-3" />
                              Missing
                            </Badge>
                          ) : item.accessible ? (
                            <Badge className="border-0 bg-green-100 font-medium text-green-700">
                              <CheckCircle2 className="mr-1 h-3 w-3" />
                              OK
                            </Badge>
                          ) : item.cloudflare_protected ||
                            item.status_code === 403 ? (
                            <Badge className="border-0 bg-amber-100 font-medium text-amber-700">
                              <Shield className="mr-1 h-3 w-3" />
                              Protected
                            </Badge>
                          ) : (
                            <Badge className="border-0 bg-red-100 font-medium text-red-700">
                              <XCircle className="mr-1 h-3 w-3" />
                              Failed
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="whitespace-nowrap">
                        {getStatusBadge(item.status_code, item.status_name)}
                      </TableCell>
                      <TableCell className="whitespace-nowrap">
                        <span className="font-mono text-sm text-gray-600">
                          {item.content_length?.toLocaleString() ?? "-"}
                        </span>
                      </TableCell>
                      <TableCell className="max-w-0">
                        {item.redirect_url ? (
                          <a
                            href={item.redirect_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-1 text-sm text-un-blue hover:underline"
                          >
                            <span className="block truncate">
                              {item.redirect_url}
                            </span>
                            <ExternalLink className="h-3 w-3 flex-shrink-0" />
                          </a>
                        ) : (
                          <span className="text-sm text-gray-500">-</span>
                        )}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </div>
      </div>
    </main>
  );
}
