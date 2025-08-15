"use client";

import { ChevronLeft, ChevronRight, MoreHorizontal } from "lucide-react";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  totalItems?: number;
  itemsPerPage?: number;
  showItemsInfo?: boolean;
  maxPageNumbers?: number;
}

export function Pagination({
  currentPage,
  totalPages,
  onPageChange,
  totalItems,
  itemsPerPage,
  showItemsInfo = true,
  maxPageNumbers = 7,
}: PaginationProps) {
  const getPageNumbers = () => {
    if (totalPages <= maxPageNumbers) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }

    const halfWindow = Math.floor(maxPageNumbers / 2);
    let start = Math.max(currentPage - halfWindow, 1);
    let end = Math.min(start + maxPageNumbers - 1, totalPages);

    if (end - start + 1 < maxPageNumbers) {
      start = Math.max(end - maxPageNumbers + 1, 1);
    }

    const pages: (number | string)[] = [];

    if (start > 1) {
      pages.push(1);
      if (start > 2) pages.push("ellipsis-start");
    }

    for (let i = start; i <= end; i++) {
      pages.push(i);
    }

    if (end < totalPages) {
      if (end < totalPages - 1) pages.push("ellipsis-end");
      pages.push(totalPages);
    }

    return pages;
  };

  const pageNumbers = getPageNumbers();

  const handlePageClick = (page: number) => {
    if (page !== currentPage && page >= 1 && page <= totalPages) {
      onPageChange(page);
    }
  };

  if (totalPages <= 1) return null;

  const startItem =
    totalItems && itemsPerPage ? (currentPage - 1) * itemsPerPage + 1 : 0;
  const endItem =
    totalItems && itemsPerPage
      ? Math.min(currentPage * itemsPerPage, totalItems)
      : 0;

  return (
    <div className="flex items-center justify-between">
      {showItemsInfo && totalItems && itemsPerPage && (
        <div className="text-sm text-gray-600">
          Showing {startItem} to {endItem} of {totalItems} results
        </div>
      )}

      <nav className="flex items-center space-x-1">
        <button
          onClick={() => handlePageClick(currentPage - 1)}
          disabled={currentPage === 1}
          className={`p-2 rounded-lg transition-colors ${
            currentPage === 1
              ? "text-gray-300 cursor-not-allowed"
              : "text-gray-600 hover:bg-gray-100"
          }`}
          aria-label="Previous page"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>

        {pageNumbers.map((pageNumber, index) => {
          if (typeof pageNumber === "string") {
            return (
              <span
                key={`${pageNumber}-${index}`}
                className="px-3 py-2 text-gray-400"
              >
                <MoreHorizontal className="w-4 h-4" />
              </span>
            );
          }

          return (
            <button
              key={pageNumber}
              onClick={() => handlePageClick(pageNumber)}
              className={`px-3 py-2 rounded-lg font-medium transition-colors ${
                currentPage === pageNumber
                  ? "bg-primary-500 text-white"
                  : "text-gray-600 hover:bg-gray-100"
              }`}
              aria-label={`Go to page ${pageNumber}`}
              aria-current={currentPage === pageNumber ? "page" : undefined}
            >
              {pageNumber}
            </button>
          );
        })}

        <button
          onClick={() => handlePageClick(currentPage + 1)}
          disabled={currentPage === totalPages}
          className={`p-2 rounded-lg transition-colors ${
            currentPage === totalPages
              ? "text-gray-300 cursor-not-allowed"
              : "text-gray-600 hover:bg-gray-100"
          }`}
          aria-label="Next page"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </nav>
    </div>
  );
}
