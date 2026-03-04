import Nav from "./Nav";

export default function Layout({ children }) {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Nav />
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
      <footer className="bg-gray-900 text-gray-400 text-sm text-center py-4">
        BBC News Archive · By <a href="https://samireland.com" className="text-gray-500 hover:text-gray-300 transition-colors">Sam Ireland</a>
      </footer>
    </div>
  );
}
