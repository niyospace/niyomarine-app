// components/vessel/Navbar.js
import React from 'react';
import Link from 'next/link'; // Import Link component
import { supabase } from '../../utils/supabaseClient'; // <--- ADDED/CORRECTED: Import supabase here!

export default function Navbar({ session }) {
  return (
    <nav className="bg-gray-800 p-4 text-white w-full">
      <div className="container mx-auto flex justify-between items-center">
        {/* CORRECTED LINK SYNTAX: Removed <a> tag, moved className to Link */}
        <Link href="/" className="text-xl font-bold hover:text-blue-400">
          HelmLog
        </Link>
        <div>
          {session ? (
            <>
              {/* CORRECTED LINK SYNTAX: Removed <a> tag, moved className to Link */}
              <Link href="/dashboard" className="ml-4 hover:text-blue-400">
                Dashboard
              </Link>
              <button
                onClick={async () => {
                  // Ensure supabase is available here, if not, pass signOut as a prop from index.js
                  // The import for supabase is now at the top of this file
                  if (supabase) {
                    await supabase.auth.signOut();
                    window.location.reload(); // Simple reload after logout
                  } else {
                    console.error("Supabase client not available in Navbar for logout.");
                  }
                }}
                className="ml-4 bg-red-600 hover:bg-red-700 py-1 px-3 rounded-md text-sm"
              >
                Logout
              </button>
            </>
          ) : (
            // CORRECTED LINK SYNTAX: Removed <a> tag, moved className to Link
            <Link href="/login" className="ml-4 hover:text-blue-400">
              Login
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}