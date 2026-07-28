"use client";

import React, { createContext, useContext, useState } from "react";

// Definitions for supported main category slugs (now open to DB-driven slugs)
export type MainCategory = string;

// Supported languages
export type Language = "en" | "am" | "or";

// Type definition for the Context State and Modifiers
interface MenuContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  mainCategory: MainCategory;
  setMainCategory: (category: MainCategory) => void;
  subCategory: string;
  setSubCategory: (sub: string) => void;
  maxPrice: number;
  setMaxPrice: (price: number) => void;
}

// Create Context with a default undefined state
const MenuContext = createContext<MenuContextType | undefined>(undefined);

interface MenuProviderProps {
  children: React.ReactNode;
}

export function MenuProvider({ children }: MenuProviderProps) {
  const [language, setLanguage] = useState<Language>("en");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [mainCategory, setMainCategory] = useState<MainCategory>("all");
  const [subCategory, setSubCategory] = useState<string>("all");
  const [maxPrice, setMaxPrice] = useState<number>(1500);

  return (
    <MenuContext.Provider
      value={{
        language,
        setLanguage,
        searchQuery,
        setSearchQuery,
        mainCategory,
        setMainCategory,
        subCategory,
        setSubCategory,
        maxPrice,
        setMaxPrice,
      }}
    >
      {children}
    </MenuContext.Provider>
  );
}

// Custom hook to consume the MenuContext easily
export function useMenu() {
  const context = useContext(MenuContext);
  if (!context) {
    throw new Error("useMenu must be used within a MenuProvider");
  }
  return context;
}

export default useMenu;