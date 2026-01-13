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
import { ExternalLink, Search, ArrowUpDown, ArrowUp, ArrowDown } from "lucide-react";
import data from "../../../../public/entity_link_verification_results.json";

type SortField = "entity" | "accessible" | "status_code" | "content_length";
type SortDirection = "asc" | "desc" | null;

export default function DevPage() {
  const [searchTerm, setSearchTerm] = useState("");
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

  const filteredAndSortedData = useMemo(() => {
    let filtered = data.filter(
      (item) =>
        item.entity.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.url.toLowerCase().includes(searchTerm.toLowerCase())
    );

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
  }, [searchTerm, sortField, sortDirection]);

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

        {/* Search */}
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <Input
            type="text"
            placeholder="Search entities or URLs..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9 border-gray-200 focus:border-un-blue focus:ring-un-blue/20"
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
                  className="cursor-pointer font-semibold text-gray-700 hover:bg-gray-100/80 hover:text-un-blue whitespace-nowrap"
                  onClick={() => handleSort("entity")}
                >
                  <div className="flex items-center">
                    Entity
                    {getSortIcon("entity")}
                  </div>
                </TableHead>
                <TableHead className="font-semibold text-gray-700 w-[30%]">URL</TableHead>
                <TableHead
                  className="cursor-pointer font-semibold text-gray-700 hover:bg-gray-100/80 hover:text-un-blue whitespace-nowrap"
                  onClick={() => handleSort("accessible")}
                >
                  <div className="flex items-center">
                    Status
                    {getSortIcon("accessible")}
                  </div>
                </TableHead>
                <TableHead
                  className="cursor-pointer font-semibold text-gray-700 hover:bg-gray-100/80 hover:text-un-blue whitespace-nowrap"
                  onClick={() => handleSort("status_code")}
                >
                  <div className="flex items-center">
                    HTTP Status
                    {getSortIcon("status_code")}
                  </div>
                </TableHead>
                <TableHead
                  className="cursor-pointer font-semibold text-gray-700 hover:bg-gray-100/80 hover:text-un-blue whitespace-nowrap"
                  onClick={() => handleSort("content_length")}
                >
                  <div className="flex items-center">
                    Size
                    {getSortIcon("content_length")}
                  </div>
                </TableHead>
                <TableHead className="font-semibold text-gray-700 w-[25%]">Redirect</TableHead>
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
                    className="group border-b border-gray-100 hover:bg-gray-50 transition-colors"
                  >
                    <TableCell className="font-medium text-gray-900 whitespace-nowrap">{item.entity}</TableCell>
                    <TableCell className="max-w-0">
                      <a
                        href={item.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1 text-un-blue hover:underline"
                      >
                        <span className="truncate block">{item.url}</span>
                        <ExternalLink className="h-3 w-3 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" />
                      </a>
                    </TableCell>
                    <TableCell className="whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        {item.accessible ? (
                          <Badge
                            variant="success"
                            className="bg-green-100 text-green-700 hover:bg-green-100"
                          >
                            ✓ Accessible
                          </Badge>
                        ) : (
                          <Badge variant="destructive" className="bg-red-100 text-red-700">
                            ✗ Failed
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
                          <span className="truncate block">{item.redirect_url}</span>
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
