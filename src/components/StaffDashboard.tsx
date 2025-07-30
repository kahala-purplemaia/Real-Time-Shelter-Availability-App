import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import type { Shelter } from '../types/shelter';
import { 
  LogOut, 
  Bed, 
  Save, 
  RefreshCw, 
  Dog, 
  Users, 
  AlertCircle,
  Phone,
  Mail,
  MapPin,
  Clock,
  Shield,
  Home
} from 'lucide-react';

interface StaffDashboardProps {
  onLogout: () => void;
}

export default function StaffDashboard({ onLogout }: StaffDashboardProps) {
  const [shelter, setShelter] = useState<Shelter | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [formData, setFormData] = useState({
    available_beds: 0,
    allows_pets: false,
    requires_sobriety: false,
    accepts_families: false,
  });

  useEffect(() => {
    fetchShelterData();
  }, []);

  const fetchShelterData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // For demo purposes, we'll assign the first shelter to any authenticated user
      // In a real app, you'd have a proper user-shelter relationship
      const { data, error } = await supabase
        .from('shelters')
        .select('*')
        .limit(1)
        .single();

      if (error) throw error;
      
      setShelter(data);
      setFormData({
        available_beds: data.available_beds,
        allows_pets: data.allows_pets,
        requires_sobriety: data.requires_sobriety,
        accepts_families: data.accepts_families,
      });
    } catch (error) {
      console.error('Error fetching shelter data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!shelter) return;
    
    setSaving(true);
    setMessage('');

    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      const { error } = await supabase
        .from('shelters')
        .update({
          ...formData,
          last_updated: new Date().toISOString(),
          updated_by: user?.email || 'Staff'
        })
        .eq('id', shelter.id);

      if (error) throw error;

      setMessage('Shelter information updated successfully!');
      fetchShelterData(); // Refresh data
      
      // Clear message after 3 seconds
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      setMessage('Error updating shelter information');
      console.error('Error:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    onLogout();
  };

  const formatLastUpdated = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="h-12 w-12 animate-spin mx-auto mb-4 text-blue-600" />
          <p className="text-gray-700 text-lg">Loading your shelter dashboard...</p>
        </div>
      </div>
    );
  }

  if (!shelter) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl p-8 border border-blue-200">
          <AlertCircle className="h-12 w-12 mx-auto mb-4 text-red-600" />
          <p className="text-gray-700 text-lg">No shelter assigned to your account.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white/90 backdrop-blur-sm shadow-lg border-b border-blue-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="bg-gradient-to-br from-blue-600 to-blue-700 p-3 rounded-xl shadow-lg">
                <Shield className="h-8 w-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Staff Dashboard</h1>
                <p className="text-gray-600 mt-1">Managing {shelter.name}</p>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <a 
                href="/" 
                className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-blue-600 transition-colors"
              >
                <Home className="h-4 w-4" />
                Public View
              </a>
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-red-600 transition-colors"
              >
                <LogOut className="h-4 w-4" />
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Shelter Info Card */}
        <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl border border-blue-200 p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Shelter Information</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-4">
              <div className="flex items-center text-gray-700">
                <MapPin className="h-5 w-5 mr-3 text-blue-600" />
                <span className="font-medium">{shelter.address}</span>
              </div>
              <div className="flex items-center text-gray-700">
                <Phone className="h-5 w-5 mr-3 text-green-600" />
                <span className="font-medium">{shelter.contact_phone}</span>
              </div>
              <div className="flex items-center text-gray-700">
                <Mail className="h-5 w-5 mr-3 text-purple-600" />
                <span className="font-medium">{shelter.contact_email}</span>
              </div>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center text-gray-700">
                <Bed className="h-5 w-5 mr-3 text-indigo-600" />
                <span className="font-medium">Total Capacity: {shelter.total_beds} beds</span>
              </div>
              <div className="flex items-center text-gray-700">
                <Clock className="h-5 w-5 mr-3 text-orange-600" />
                <span className="font-medium">Last Updated: {formatLastUpdated(shelter.last_updated)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Update Form */}
        <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl border border-blue-200 p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-8">Update Availability & Policies</h2>
          
          <div className="space-y-8">
            {/* Bed Availability */}
            <div>
              <label htmlFor="available_beds" className="block text-sm font-bold text-gray-700 mb-3 uppercase tracking-wide">
                Available Beds
              </label>
              <div className="flex items-center gap-6">
                <input
                  type="number"
                  id="available_beds"
                  min="0"
                  max={shelter.total_beds}
                  value={formData.available_beds}
                  onChange={(e) => setFormData({ ...formData, available_beds: parseInt(e.target.value) || 0 })}
                  className="w-32 px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent text-lg font-bold text-center"
                />
                <span className="text-gray-600 font-medium">out of {shelter.total_beds} total beds</span>
              </div>
              
              {/* Availability Bar */}
              <div className="mt-4">
                <div className="w-full bg-gray-200 rounded-full h-4 shadow-inner">
                  <div 
                    className={`h-4 rounded-full transition-all duration-500 shadow-sm ${
                      formData.available_beds === 0 
                        ? 'bg-gradient-to-r from-red-500 to-red-600' 
                        : formData.available_beds / shelter.total_beds < 0.25 
                          ? 'bg-gradient-to-r from-orange-500 to-orange-600' 
                          : 'bg-gradient-to-r from-green-500 to-green-600'
                    }`}
                    style={{ width: `${(formData.available_beds / shelter.total_beds) * 100}%` }}
                  />
                </div>
                <p className="text-sm text-gray-600 mt-2 font-medium">
                  {Math.round((formData.available_beds / shelter.total_beds) * 100)}% available
                </p>
              </div>
            </div>

            {/* Policies */}
            <div>
              <p className="text-sm font-bold text-gray-700 mb-4 uppercase tracking-wide">Shelter Policies</p>
              <div className="space-y-4">
                <label className="flex items-center p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.allows_pets}
                    onChange={(e) => setFormData({ ...formData, allows_pets: e.target.checked })}
                    className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <span className="ml-4 flex items-center text-gray-800 font-medium">
                    <Dog className="h-5 w-5 mr-3 text-green-600" />
                    Allow pets
                  </span>
                </label>
                
                <label className="flex items-center p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.accepts_families}
                    onChange={(e) => setFormData({ ...formData, accepts_families: e.target.checked })}
                    className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <span className="ml-4 flex items-center text-gray-800 font-medium">
                    <Users className="h-5 w-5 mr-3 text-purple-600" />
                    Accept families with children
                  </span>
                </label>
                
                <label className="flex items-center p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.requires_sobriety}
                    onChange={(e) => setFormData({ ...formData, requires_sobriety: e.target.checked })}
                    className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <span className="ml-4 flex items-center text-gray-800 font-medium">
                    <AlertCircle className="h-5 w-5 mr-3 text-blue-600" />
                    Require sobriety
                  </span>
                </label>
              </div>
            </div>

            {/* Save Button */}
            <div className="flex items-center justify-between pt-8 border-t border-gray-200">
              <div>
                {message && (
                  <div className={`text-sm font-medium ${message.includes('Error') ? 'text-red-600' : 'text-green-600'}`}>
                    {message}
                  </div>
                )}
              </div>
              
              <button
                onClick={handleSave}
                disabled={saving}
                className="flex items-center gap-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white px-8 py-3 rounded-xl hover:from-blue-700 hover:to-blue-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 font-semibold shadow-lg hover:shadow-xl"
              >
                {saving ? (
                  <>
                    <RefreshCw className="h-5 w-5 animate-spin" />
                    Saving Changes...
                  </>
                ) : (
                  <>
                    <Save className="h-5 w-5" />
                    Save Changes
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Current Status Summary */}
        <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl border border-blue-200 p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Current Status Overview</h2>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="text-center p-6 bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl border border-blue-200">
              <Bed className="h-8 w-8 mx-auto mb-3 text-blue-600" />
              <p className="text-3xl font-bold text-gray-900">{formData.available_beds}</p>
              <p className="text-sm text-gray-600 font-medium">Available Beds</p>
            </div>
            
            <div className="text-center p-6 bg-gradient-to-br from-green-50 to-green-100 rounded-xl border border-green-200">
              <Dog className={`h-8 w-8 mx-auto mb-3 ${formData.allows_pets ? 'text-green-600' : 'text-gray-400'}`} />
              <p className="text-sm font-bold text-gray-900 mb-1">Pet Policy</p>
              <p className="text-sm text-gray-600">{formData.allows_pets ? 'Pets Allowed' : 'No Pets'}</p>
            </div>
            
            <div className="text-center p-6 bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl border border-purple-200">
              <Users className={`h-8 w-8 mx-auto mb-3 ${formData.accepts_families ? 'text-purple-600' : 'text-gray-400'}`} />
              <p className="text-sm font-bold text-gray-900 mb-1">Family Policy</p>
              <p className="text-sm text-gray-600">{formData.accepts_families ? 'Families Welcome' : 'Adults Only'}</p>
            </div>
            
            <div className="text-center p-6 bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl border border-orange-200">
              <AlertCircle className={`h-8 w-8 mx-auto mb-3 ${formData.requires_sobriety ? 'text-orange-600' : 'text-gray-400'}`} />
              <p className="text-sm font-bold text-gray-900 mb-1">Sobriety</p>
              <p className="text-sm text-gray-600">{formData.requires_sobriety ? 'Required' : 'Not Required'}</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}