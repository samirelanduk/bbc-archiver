import Link from "next/link";
import SearchBar from "./SearchBar";

export default function Nav() {
  return (
    <nav className="bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="text-xl font-bold tracking-tight hover:text-gray-300 transition-colors">
            BBC News Archive
          </Link>
          <div className="flex items-center gap-6">
            <Link href="/browse" className="text-sm text-gray-300 hover:text-white transition-colors">
              Browse
            </Link>
            <SearchBar />
          </div>
        </div>
      </div>
    </nav>
  );
}
