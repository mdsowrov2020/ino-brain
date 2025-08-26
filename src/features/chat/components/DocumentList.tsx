"use client";

import { usePathname, useSearchParams, useRouter } from "next/navigation";

const DocumentList = ({ data }) => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const selectedId = searchParams.get("documentId");

  function selectDocument(id) {
    console.log(id);
    const params = new URLSearchParams(searchParams.toString());
    params.set("documentId", id);
    router.push(`${pathname}?${params.toString()}`);
  }

  return (
    <div className="w-full max-w-md mx-auto  rounded-lg shadow-lg overflow-hidden">
      <div className="px-6 py-4">
        <h2 className="text-white text-xl font-semibold">Documents</h2>
        <p className="text-blue-100 text-sm mt-1">
          {data.length} document{data.length !== 1 ? "s" : ""} available
        </p>
      </div>

      <div className="max-h-96 overflow-y-auto">
        <ul className="divide-y divide-gray-100">
          {data.map((doc: any) => {
            const isSelected = selectedId === String(doc.id);

            return (
              <li
                key={doc.id}
                onClick={() => selectDocument(doc.id)}
                className={`
                  group relative px-6 py-4 cursor-pointer transition-all duration-200 ease-in-out
                  hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50
                  ${
                    isSelected
                      ? "bg-gradient-to-r from-blue-100 to-purple-100 border-r-4 border-blue-500"
                      : "hover:shadow-sm"
                  }
                `}
              >
                {/* Selection indicator */}
                {isSelected && (
                  <div className="absolute left-2 top-1/2 transform -translate-y-1/2">
                    <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                  </div>
                )}

                {/* Document icon */}
                <div className="flex items-center space-x-4">
                  <div
                    className={`
                    flex-shrink-0 w-10 h-10 rounded-lg flex items-center justify-center
                    ${
                      isSelected
                        ? "bg-blue-500 text-white"
                        : "bg-gray-100 text-gray-600 group-hover:bg-blue-100 group-hover:text-blue-600"
                    }
                    transition-colors duration-200
                  `}
                  >
                    <svg
                      className="w-5 h-5"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>

                  {/* Document name and metadata */}
                  <div className="flex-1 min-w-0">
                    <p
                      className={`
                      text-sm font-medium truncate
                      ${
                        isSelected
                          ? "text-blue-900"
                          : "text-gray-50 group-hover:text-blue-700"
                      }
                      transition-colors duration-200
                    `}
                    >
                      {doc.fileName}
                    </p>

                    {/* Optional: Add file size or date if available in doc object */}
                    <p
                      className={`
                      text-xs truncate mt-1
                      ${
                        isSelected
                          ? "text-blue-600"
                          : "text-gray-500 group-hover:text-blue-500"
                      }
                      transition-colors duration-200
                    `}
                    >
                      ID: {doc.id}
                    </p>
                  </div>

                  {/* Arrow indicator */}
                  <div
                    className={`
                    flex-shrink-0 transition-all duration-200
                    ${
                      isSelected
                        ? "text-blue-500 transform scale-110"
                        : "text-gray-400 group-hover:text-blue-500 group-hover:transform group-hover:translate-x-1"
                    }
                  `}
                  >
                    <svg
                      className="w-4 h-4"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                </div>

                {/* Subtle hover effect overlay */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-0 group-hover:opacity-10 transition-opacity duration-300 pointer-events-none"></div>
              </li>
            );
          })}
        </ul>
      </div>

      {/* Empty state */}
      {data.length === 0 && (
        <div className="px-6 py-12 text-center">
          <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
            <svg
              className="w-8 h-8 text-gray-400"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z"
                clipRule="evenodd"
              />
            </svg>
          </div>
          <p className="text-gray-500 text-sm">No documents available</p>
        </div>
      )}
    </div>
  );
};

export default DocumentList;
