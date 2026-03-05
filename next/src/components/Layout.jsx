import Nav from "./Nav";

export default function Layout({ children }) {
  return (
    <div className="min-h-screen bg-stone-50 flex flex-col">
      <Nav />
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
      <footer className="bg-slate-700 text-slate-400 text-sm text-center py-4">
        BBC News Archive · By <a href="https://samireland.com" className="text-slate-300 hover:text-slate-100 transition-colors">Sam Ireland</a>
      </footer>
    </div>
  );
}
