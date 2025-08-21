import { useEffect, useState } from "react";

export default function Home() {
  const [q, setQ] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const onSearch = async (e) => {
    e.preventDefault();
    setLoading(true); setError(""); setResults([]);
    try {
      const res = await fetch(`/api/search?q=${encodeURIComponent(q)}`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      setResults(data.results);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-start p-6">
      <header className="w-full max-w-3xl pt-16 pb-8 text-center">
        <h1 className="text-4xl font-bold">My Search</h1>
        <p className="text-gray-600 mt-2">A tiny crawler-powered search (demo)</p>
      </header>

      <main className="w-full max-w-3xl">
        <form onSubmit={onSearch} className="flex gap-2 mb-6">
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search the index..."
            className="flex-1 border rounded-full px-4 py-3 outline-none"
          />
          <button
            type="submit"
            className="px-5 py-3 rounded-full border shadow"
            disabled={loading}
          >
            {loading ? "Searching..." : "Search"}
          </button>
        </form>

        {error && <div className="text-red-600 mb-4">Error: {error}</div>}

        <ul className="space-y-5">
          {results.map((r) => (
            <li key={r.url}>
              <a href={r.url} target="_blank" rel="noreferrer" className="text-blue-700 font-semibold hover:underline">
                {r.title || r.url}
              </a>
              <div className="text-xs text-gray-500">{r.url}</div>
              <p className="text-sm text-gray-800 mt-1 line-clamp-3">{r.snippet}</p>
            </li>
          ))}
        </ul>
      </main>

      <footer className="mt-auto py-10 text-xs text-gray-500">
        Built with Next.js · Demo index from local crawl
      </footer>
    </div>
  );
}
