// pages/index.js
import { useState, useEffect } from 'react';
import { supabase } from '../utils/supabaseClient'; // Make sure this path is correct
import Navbar from '../components/Vessel/Navbar'; // Corrected path to Navbar
import Link from 'next/link'; // Import Link component
import { useRouter } from 'next/router'; // Import useRouter for navigation

export default function Home() {
  const [session, setSession] = useState(null);
  const [vessels, setVessels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newVesselName, setNewVesselName] = useState('');
  const [filterText, setFilterText] = useState('');
  const [editingVesselId, setEditingVesselId] = useState(null);
  const [editedVesselName, setEditedVesselName] = useState('');
  const router = useRouter(); // Initialize router

  // Fetch initial session when the component mounts
  useEffect(() => {
    console.log("useEffect: Initial session check started.");
    const getSession = async () => {
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      if (sessionError) {
        console.error("Error getting session:", sessionError.message);
      }
      setSession(session);
      setLoading(false); // Set loading to false after initial session check
      console.log("useEffect: Initial session check finished. Session:", session);
    };

    getSession();

    // Set up real-time listener for auth state changes
    const { data: authListener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        console.log("Auth state changed:", _event, "Session:", session);
        setSession(session);
      }
    );

    // Cleanup the subscription on component unmount
    return () => {
      if (authListener && authListener.subscription) {
        authListener.subscription.unsubscribe();
        console.log("Auth listener unsubscribed.");
      }
    };
  }, []);

  // Fetch vessels whenever the session changes (e.g., user logs in/out)
  useEffect(() => {
    if (session && session.user) { // Ensure session and user exist before fetching
      console.log("useEffect: Session and user found. Fetching vessels for user:", session.user.id);
      fetchVessels(session.user.id);
    } else {
      console.log("useEffect: No session or user found. Clearing vessels.");
      setVessels([]); // Clear vessels if no session (logged out)
      setLoading(false); // Ensure loading is false if no session
    }
  }, [session]);

  async function fetchVessels(userId) {
    try {
      setLoading(true);
      console.log("fetchVessels: Attempting to fetch vessels for userId:", userId);
      const { data, error } = await supabase
        .from('vessels')
        .select('*')
        .eq('owner_id', userId); // Filter by owner_id

      if (error) {
        console.error('fetchVessels Error:', error.message);
        throw error;
      }
      console.log("fetchVessels: Successfully fetched vessels:", data);
      setVessels(data);
    } catch (error) {
      console.error('Error in fetchVessels catch block:', error.message);
    } finally {
      setLoading(false);
    }
  }

  async function addVessel() {
    if (!newVesselName.trim() || !session?.user) { // Check for user session
      alert('Vessel name cannot be empty or user not logged in.');
      console.warn("Add Vessel: Validation failed. Name empty or no user.");
      return;
    }
    try {
      setLoading(true);
      console.log("addVessel: Attempting to add vessel:", newVesselName, "for user:", session.user.id);
      const { data, error } = await supabase
        .from('vessels')
        .insert([{ name: newVesselName.trim(), owner_id: session.user.id }]); // Use session.user.id

      if (error) throw error;
      setNewVesselName('');
      console.log("addVessel: Vessel added successfully. Data:", data);
      fetchVessels(session.user.id); // Re-fetch for current user
    } catch (error) {
      console.error('Error adding vessel:', error.message);
      alert(`Failed to add vessel: ${error.message}`);
    } finally {
      setLoading(false);
    }
  }

  async function updateVessel(vesselId) {
    if (!editedVesselName.trim() || !session?.user) { // Check for user session
      alert('Vessel name cannot be empty or user not logged in.');
      console.warn("Update Vessel: Validation failed. Name empty or no user.");
      return;
    }
    try {
      setLoading(true);
      console.log("updateVessel: Attempting to update vessel ID:", vesselId, "to name:", editedVesselName, "for user:", session.user.id);
      const { error } = await supabase
        .from('vessels')
        .update({ name: editedVesselName.trim() })
        .eq('id', vesselId)
        .eq('owner_id', session.user.id); // Ensure only updating user's own vessel

      if (error) throw error;
      setEditingVesselId(null);
      setEditedVesselName('');
      console.log("updateVessel: Vessel updated successfully.");
      fetchVessels(session.user.id); // Re-fetch for current user
    } catch (error) {
      console.error('Error updating vessel:', error.message);
      alert(`Failed to update vessel: ${error.message}`);
    } finally {
      setLoading(false);
    }
  }

  async function deleteVessel(vesselId) {
    console.log("deleteVessel: Delete button clicked for vessel ID:", vesselId);
    // IMPORTANT: Use a custom modal in production, window.confirm is blocked in Canvas iframe.
    if (!window.confirm('Are you sure you want to delete this vessel and all its associated certificates? This action cannot be undone.')) {
      console.log("deleteVessel: User cancelled deletion.");
      return;
    }
    if (!session?.user) { // Check for user session
        alert('User not logged in. Cannot delete vessel.');
        console.warn("deleteVessel: No user session found for deletion.");
        return;
    }
    try {
      setLoading(true);
      console.log(`deleteVessel: Attempting to delete vessel ID: ${vesselId} for user ID: ${session.user.id}`);
      const { error } = await supabase
        .from('vessels')
        .delete()
        .eq('id', vesselId)
        .eq('owner_id', session.user.id); // Crucial: Ensure only the user's own vessel is deleted

      if (error) {
        console.error('deleteVessel Error:', error.message);
        throw error;
      }
      console.log(`deleteVessel: Vessel ${vesselId} deleted successfully.`);
      fetchVessels(session.user.id); // Re-fetch vessels to update the list
    } catch (error) {
      console.error('Error in deleteVessel catch block:', error.message);
      alert(`Failed to delete vessel: ${error.message}`);
    } finally {
      setLoading(false);
    }
  }

  const filteredVessels = vessels.filter(vessel =>
    vessel.name.toLowerCase().includes(filterText.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center py-10 px-4 sm:px-6 lg:px-8">
      <Navbar session={session} /> {/* Navbar is assumed to handle its own logout */}

      <div className="container mx-auto px-4 py-8 bg-white shadow-lg rounded-lg max-w-4xl w-full">
        <h1 className="text-4xl font-extrabold text-blue-700 mb-6 text-center">
          MemoryDeck
        </h1>
        <p className="text-lg text-gray-700 mb-8 text-center">
          Secure and professional vessel and certificate management.
        </p>

        {!session ? (
          <div className="text-center p-6 bg-gray-100 rounded-lg shadow-inner">
            <p className="text-gray-700 text-xl mb-6">Please log in to manage your vessels.</p>
            <Link href="/login" className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-8 rounded-md transition duration-300 text-lg shadow-md">
              Go to Login
            </Link>
          </div>
        ) : (
          <div className="space-y-8">
            {/* Dashboard Header Section */}
            <div className="flex flex-col sm:flex-row justify-between items-center mb-8 gap-4">
              <h2 className="text-3xl font-bold text-gray-800 text-center sm:text-left">Your Vessels</h2>
              <input
                type="text"
                placeholder="🔍 Filter vessels..."
                className="p-3 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 w-full sm:w-auto"
                value={filterText}
                onChange={(e) => setFilterText(e.target.value)}
              />
            </div>

            {/* Add New Vessel Section */}
            <div className="bg-white p-6 rounded-lg shadow-md mb-8 border border-gray-200">
              <h3 className="text-2xl font-semibold text-gray-900 mb-4">Add New Vessel</h3>
              <div className="flex flex-col sm:flex-row items-center space-y-4 sm:space-y-0 sm:space-x-4">
                <input
                  type="text"
                  placeholder="New vessel name"
                  className="flex-grow px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-gray-700"
                  value={newVesselName}
                  onChange={(e) => setNewVesselName(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') addVessel();
                  }}
                />
                <button
                  onClick={addVessel}
                  disabled={loading}
                  className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-6 rounded-lg shadow-md transition duration-150 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Adding...' : 'Add Vessel'}
                </button>
              </div>
            </div>

            {/* Vessels List */}
            {loading && vessels.length === 0 ? (
              <p className="text-center text-gray-500 text-lg">Loading vessels...</p>
            ) : filteredVessels.length === 0 ? (
              <p className="text-center text-gray-500 text-lg">No vessels found. Add a new one!</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredVessels.map((vessel) => (
                  <div
                    key={vessel.id}
                    className="bg-white p-6 rounded-lg shadow-md border border-gray-200 hover:shadow-lg transition-shadow duration-200 flex flex-col justify-between h-52" // Increased height slightly
                  >
                    <div className="flex items-center mb-3">
                      <span className="text-yellow-500 text-3xl mr-3">📁</span>
                      {editingVesselId === vessel.id ? (
                        <input
                          type="text"
                          value={editedVesselName}
                          onChange={(e) => setEditedVesselName(e.target.value)}
                          className="flex-grow text-xl font-semibold text-gray-900 p-2 border border-blue-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                        />
                      ) : (
                        <h3 className="text-xl font-semibold text-gray-900 truncate">
                          {vessel.name}
                        </h3>
                      )}
                    </div>

                    <div className="flex flex-wrap gap-3 mt-auto"> {/* mt-auto pushes buttons to bottom */}
                      {editingVesselId === vessel.id ? (
                        <button
                          onClick={() => updateVessel(vessel.id)}
                          disabled={loading}
                          className="flex-grow bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-4 rounded-md shadow-sm transition duration-150 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-opacity-50 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          Save
                        </button>
                      ) : (
                        <Link
                          href={`/vessels/${vessel.id}`}
                          className="flex-grow text-center bg-green-500 hover:bg-green-600 text-white font-medium py-2 px-4 rounded-md shadow-sm transition duration-150 ease-in-out focus:outline-none focus:ring-2 focus:ring-green-400 focus:ring-opacity-50"
                        >
                          View Details
                        </Link>
                      )}
                      
                      {editingVesselId === vessel.id ? (
                        <button
                          onClick={() => {
                            setEditingVesselId(null);
                            setEditedVesselName('');
                          }}
                          className="flex-grow bg-gray-400 hover:bg-gray-500 text-white font-medium py-2 px-4 rounded-md shadow-sm transition duration-150 ease-in-out focus:outline-none focus:ring-2 focus:ring-gray-300 focus:ring-opacity-50"
                        >
                          Cancel
                        </button>
                      ) : (
                        <button
                          onClick={() => {
                            setEditingVesselId(vessel.id);
                            setEditedVesselName(vessel.name);
                          }}
                          className="flex-grow bg-yellow-500 hover:bg-yellow-600 text-white font-medium py-2 px-4 rounded-md text-sm shadow-sm transition duration-150 ease-in-out focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:ring-opacity-50"
                        >
                          Edit
                        </button>
                      )}
                      <button
                        onClick={() => deleteVessel(vessel.id)}
                        disabled={loading}
                        className="flex-grow bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-4 rounded-md text-sm shadow-sm transition duration-150 ease-in-out focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-opacity-50 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      <footer className="mt-10 text-center text-gray-500 text-sm">
        <p>&copy; {new Date().getFullYear()} MemoryDeck. All rights reserved.</p>
      </footer>
    </div>
  );
}
