"use client";
import React, { useState, useEffect } from "react";
import {
  MessageCircle,
  FileText,
  BookOpen,
  Download,
  Send,
  Loader2,
  Upload,
} from "lucide-react";

// Types
interface Document {
  id: string;
  file_name: string;
  created_at: string;
  processed?: boolean;
}

interface ChatMessage {
  id: string;
  message: string;
  response: string;
  timestamp: Date;
  sources?: Array<{ title: string; fileName: string }>;
}

// Main App Component
export default function DocumentAIChat() {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [selectedDocument, setSelectedDocument] = useState<Document | null>(
    null
  );
  const [activeTab, setActiveTab] = useState<"chat" | "summary" | "notes">(
    "chat"
  );
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [currentMessage, setCurrentMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [summary, setSummary] = useState("");
  const [notes, setNotes] = useState("");

  // Fetch documents from Supabase (mock data for demo)
  useEffect(() => {
    fetchDocuments();
  }, []);

  const fetchDocuments = async () => {
    // Mock data - replace with actual Supabase query
    const mockDocuments: Document[] = [
      {
        id: "1",
        file_name: "Research_Paper_2024.pdf",
        created_at: "2024-06-20T10:30:00Z",
        processed: true,
      },
      {
        id: "2",
        file_name: "Meeting_Notes.docx",
        created_at: "2024-06-21T14:15:00Z",
        processed: false,
      },
      {
        id: "3",
        file_name: "Project_Proposal.pdf",
        created_at: "2024-06-22T09:45:00Z",
        processed: true,
      },
    ];
    setDocuments(mockDocuments);
  };

  const processDocument = async (documentId: string) => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/documents/process", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ documentId }),
      });

      if (response.ok) {
        // Update document as processed
        setDocuments((docs) =>
          docs.map((doc) =>
            doc.id === documentId ? { ...doc, processed: true } : doc
          )
        );
        alert("Document processed successfully!");
      } else {
        alert("Failed to process document");
      }
    } catch (error) {
      console.error("Error processing document:", error);
      alert("Error processing document");
    } finally {
      setIsLoading(false);
    }
  };

  const sendChatMessage = async () => {
    if (
      !currentMessage.trim() ||
      !selectedDocument ||
      !selectedDocument.processed
    )
      return;

    setIsLoading(true);
    const messageId = Date.now().toString();

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: currentMessage,
          documentId: selectedDocument.id,
        }),
      });

      if (response.ok) {
        const result = await response.json();
        const newMessage: ChatMessage = {
          id: messageId,
          message: currentMessage,
          response: result.response,
          timestamp: new Date(),
          sources: result.sources,
        };

        setChatMessages((prev) => [...prev, newMessage]);
        setCurrentMessage("");
      } else {
        alert("Failed to get response");
      }
    } catch (error) {
      console.error("Error sending message:", error);
      alert("Error sending message");
    } finally {
      setIsLoading(false);
    }
  };

  const generateSummary = async () => {
    if (!selectedDocument || !selectedDocument.processed) return;

    setIsLoading(true);
    try {
      const response = await fetch("/api/documents/summary", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ documentId: selectedDocument.id }),
      });

      if (response.ok) {
        const result = await response.json();
        setSummary(result.summary);
      } else {
        alert("Failed to generate summary");
      }
    } catch (error) {
      console.error("Error generating summary:", error);
      alert("Error generating summary");
    } finally {
      setIsLoading(false);
    }
  };

  const saveNotes = () => {
    // Save notes to local storage or send to backend
    localStorage.setItem(`notes_${selectedDocument?.id}`, notes);
    alert("Notes saved!");
  };

  const loadNotes = (documentId: string) => {
    const savedNotes = localStorage.getItem(`notes_${documentId}`);
    setNotes(savedNotes || "");
  };

  useEffect(() => {
    if (selectedDocument) {
      loadNotes(selectedDocument.id);
      setChatMessages([]); // Clear previous chats
      setSummary(""); // Clear previous summary
    }
  }, [selectedDocument]);

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">
          Document AI Assistant
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Document List Sidebar */}
          <div className="lg:col-span-1 bg-white rounded-lg shadow-md p-4">
            <h2 className="text-lg font-semibold mb-4 flex items-center">
              <FileText className="mr-2 h-5 w-5" />
              Documents
            </h2>

            <div className="space-y-2">
              {documents.map((doc) => (
                <div
                  key={doc.id}
                  className={`p-3 rounded-lg border-2 cursor-pointer transition-all ${
                    selectedDocument?.id === doc.id
                      ? "border-blue-500 bg-blue-50"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                  onClick={() => setSelectedDocument(doc)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {doc.file_name}
                      </p>
                      <p className="text-xs text-gray-500">
                        {new Date(doc.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="ml-2">
                      {doc.processed ? (
                        <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                      ) : (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            processDocument(doc.id);
                          }}
                          className="text-xs bg-blue-500 text-white px-2 py-1 rounded hover:bg-blue-600"
                          disabled={isLoading}
                        >
                          Process
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Main Content Area */}
          <div className="lg:col-span-3">
            {!selectedDocument ? (
              <div className="bg-white rounded-lg shadow-md p-8 text-center">
                <FileText className="mx-auto h-16 w-16 text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Select a Document
                </h3>
                <p className="text-gray-500">
                  Choose a document from the sidebar to start chatting,
                  summarizing, or taking notes.
                </p>
              </div>
            ) : (
              <>
                {/* Document Header */}
                <div className="bg-white rounded-lg shadow-md p-4 mb-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-xl font-semibold text-gray-900">
                        {selectedDocument.file_name}
                      </h2>
                      <p className="text-sm text-gray-500">
                        Uploaded:{" "}
                        {new Date(
                          selectedDocument.created_at
                        ).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${
                          selectedDocument.processed
                            ? "bg-green-100 text-green-800"
                            : "bg-yellow-100 text-yellow-800"
                        }`}
                      >
                        {selectedDocument.processed
                          ? "Processed"
                          : "Processing Required"}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Tab Navigation */}
                <div className="bg-white rounded-lg shadow-md mb-6">
                  <div className="border-b border-gray-200">
                    <nav className="flex space-x-8 px-4">
                      {[
                        { id: "chat", label: "Chat", icon: MessageCircle },
                        { id: "summary", label: "Summary", icon: FileText },
                        { id: "notes", label: "Notes", icon: BookOpen },
                      ].map((tab) => (
                        <button
                          key={tab.id}
                          onClick={() => setActiveTab(tab.id as any)}
                          className={`flex items-center py-3 px-1 border-b-2 font-medium text-sm ${
                            activeTab === tab.id
                              ? "border-blue-500 text-blue-600"
                              : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                          }`}
                        >
                          <tab.icon className="mr-2 h-4 w-4" />
                          {tab.label}
                        </button>
                      ))}
                    </nav>
                  </div>

                  <div className="p-6">
                    {/* Chat Tab */}
                    {activeTab === "chat" && (
                      <div>
                        {!selectedDocument.processed ? (
                          <div className="text-center py-8">
                            <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                            <p className="text-gray-500">
                              Document needs to be processed before chatting.
                            </p>
                            <button
                              onClick={() =>
                                processDocument(selectedDocument.id)
                              }
                              className="mt-4 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                              disabled={isLoading}
                            >
                              {isLoading ? "Processing..." : "Process Document"}
                            </button>
                          </div>
                        ) : (
                          <>
                            {/* Chat Messages */}
                            <div className="space-y-4 mb-6 max-h-96 overflow-y-auto">
                              {chatMessages.length === 0 ? (
                                <p className="text-gray-500 text-center py-8">
                                  Start a conversation about this document...
                                </p>
                              ) : (
                                chatMessages.map((msg) => (
                                  <div key={msg.id} className="space-y-2">
                                    <div className="bg-blue-100 rounded-lg p-3 ml-12">
                                      <p className="font-medium text-blue-900">
                                        You:
                                      </p>
                                      <p className="text-blue-800">
                                        {msg.message}
                                      </p>
                                    </div>
                                    <div className="bg-gray-100 rounded-lg p-3 mr-12">
                                      <p className="font-medium text-gray-900">
                                        AI:
                                      </p>
                                      <p className="text-gray-800">
                                        {msg.response}
                                      </p>
                                      {msg.sources &&
                                        msg.sources.length > 0 && (
                                          <div className="mt-2 text-xs text-gray-600">
                                            Sources:{" "}
                                            {msg.sources
                                              .map((s) => s.fileName)
                                              .join(", ")}
                                          </div>
                                        )}
                                    </div>
                                  </div>
                                ))
                              )}
                            </div>

                            {/* Chat Input */}
                            <div className="flex space-x-2">
                              <input
                                type="text"
                                value={currentMessage}
                                onChange={(e) =>
                                  setCurrentMessage(e.target.value)
                                }
                                onKeyPress={(e) =>
                                  e.key === "Enter" && sendChatMessage()
                                }
                                placeholder="Ask a question about this document..."
                                className="flex-1 border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                disabled={isLoading}
                              />
                              <button
                                onClick={sendChatMessage}
                                disabled={isLoading || !currentMessage.trim()}
                                className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
                              >
                                {isLoading ? (
                                  <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                  <Send className="h-4 w-4" />
                                )}
                              </button>
                            </div>
                          </>
                        )}
                      </div>
                    )}

                    {/* Summary Tab */}
                    {activeTab === "summary" && (
                      <div>
                        {!selectedDocument.processed ? (
                          <div className="text-center py-8">
                            <p className="text-gray-500 mb-4">
                              Document needs to be processed before generating
                              summary.
                            </p>
                            <button
                              onClick={() =>
                                processDocument(selectedDocument.id)
                              }
                              className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                              disabled={isLoading}
                            >
                              Process Document
                            </button>
                          </div>
                        ) : (
                          <>
                            <div className="flex justify-between items-center mb-4">
                              <h3 className="text-lg font-medium">
                                Document Summary
                              </h3>
                              <button
                                onClick={generateSummary}
                                disabled={isLoading}
                                className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 disabled:opacity-50"
                              >
                                {isLoading ? (
                                  <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                  "Generate Summary"
                                )}
                              </button>
                            </div>

                            {summary ? (
                              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                                <h4 className="font-medium text-green-900 mb-2">
                                  Summary:
                                </h4>
                                <p className="text-green-800 leading-relaxed">
                                  {summary}
                                </p>
                              </div>
                            ) : (
                              <div className="text-center py-8 text-gray-500">
                                <FileText className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                                <p>
                                  Click "Generate Summary" to create an AI
                                  summary of this document.
                                </p>
                              </div>
                            )}
                          </>
                        )}
                      </div>
                    )}

                    {/* Notes Tab */}
                    {activeTab === "notes" && (
                      <div>
                        <div className="flex justify-between items-center mb-4">
                          <h3 className="text-lg font-medium">
                            Personal Notes
                          </h3>
                          <button
                            onClick={saveNotes}
                            className="bg-purple-500 text-white px-4 py-2 rounded hover:bg-purple-600"
                          >
                            <Download className="h-4 w-4 inline mr-2" />
                            Save Notes
                          </button>
                        </div>

                        <textarea
                          value={notes}
                          onChange={(e) => setNotes(e.target.value)}
                          placeholder="Take notes about this document..."
                          className="w-full h-96 border border-gray-300 rounded-lg p-4 focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
                        />

                        <div className="mt-4 text-sm text-gray-500">
                          <p>
                            💡 Tip: Your notes are automatically saved to your
                            browser's local storage.
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Loading Overlay */}
      {isLoading && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 flex items-center space-x-3">
            <Loader2 className="h-6 w-6 animate-spin text-blue-500" />
            <span className="text-gray-700">Processing...</span>
          </div>
        </div>
      )}
    </div>
  );
}
