import { useState } from "react";
import Link from "next/link";
import SearchBar from "./SearchBar";

export default function Nav() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <nav className="bg-slate-700 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="text-xl font-light tracking-wide hover:text-slate-300 transition-colors font-serif italic">
            BBC News Archive
          </Link>
          <div className="hidden sm:flex items-center gap-6">
            <Link href="/browse" className="text-sm text-slate-300 hover:text-white transition-colors">
              Browse
            </Link>
            <SearchBar />
          </div>
          <button
            className="sm:hidden p-2 text-slate-300 hover:text-white transition-colors"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Toggle menu"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {menuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>
      </div>
      {menuOpen && (
        <div className="sm:hidden border-t border-slate-600 px-4 py-3 flex flex-wrap items-center justify-between gap-3">
          <Link
            href="/browse"
            className="text-sm text-slate-300 hover:text-white transition-colors"
            onClick={() => setMenuOpen(false)}
          >
            Browse
          </Link>
          <SearchBar onSubmit={() => setMenuOpen(false)} />
        </div>
      )}
    </nav>
  );
}
