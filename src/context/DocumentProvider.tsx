"use client";
import React, { createContext, ReactNode, useContext, useState } from "react";
interface DocumentInterface {
  children: ReactNode;
}

interface DocumentContextType {
  documentId: number | null;
  setDocumentId: React.Dispatch<React.SetStateAction<number | null>>;
  isSelected: boolean;
  setIsSelected: React.Dispatch<React.SetStateAction<boolean>>;
}
const DocumentContext = createContext<DocumentContextType | null>(null);
const DocumentProvider = ({ children }: DocumentInterface) => {
  const [documentId, setDocumentId] = useState<number | null>(null);
  const [isSelected, setIsSelected] = useState(false);
  return (
    <>
      <DocumentContext.Provider
        value={{ documentId, setDocumentId, isSelected, setIsSelected }}
      ></DocumentContext.Provider>
      {children}
    </>
  );
};

export default DocumentProvider;

export const useDocumentProvider = () => {
  const context = useContext(DocumentContext);
  if (!context) {
    throw new Error("You are using context from outside of provider");
  }
  return context;
};
