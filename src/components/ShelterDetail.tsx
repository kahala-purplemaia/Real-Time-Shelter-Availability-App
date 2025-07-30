import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import type { Shelter } from '../types/shelter';
import { 
  ArrowLeft,
  Bed, 
  Phone, 
  Mail, 
  MapPin, 
  Clock, 
  Dog, 
  Users, 
  AlertCircle,
  RefreshCw,
  Home,
  Shield,
  ExternalLink,
  Edit3,
  Save,
  X
} from 'lucide-react';

export default function ShelterDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [shelter, setShelter] = useState<Shelter | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [formData, setFormData] = useState({
    available_beds: 0,
    allows_pets: false,
    requires_sobriety: false,
    accepts_families: false,
  });

  useEffect(() => {
    if (id) {
      fetchShelterData();
      checkAuthStatus();
    }
  }, [id]);

  const checkAuthStatus = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      setIsAuthenticated(!!session);
    } catch (error) {
      console.error('Error checking auth status:', error);
    }
  };

  const fetchShelterData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const { data, error } = await supabase
        .from('shelters')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      
      if (!data) {
        setError('Shelter not found');
        return;
      }
      
      setShelter(data);
      setFormData({
        available_beds: data.available_beds,
        allows_pets: data.allows_pets,
        requires_sobriety: data.requires_sobriety,
        accepts_families: data.accepts_families,
      });
    } catch (error) {
      console.error('Error fetching shelter data:', error);
      setError('Failed to load shelter information');
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
      setIsEditing(false);
      
      // Clear message after 3 seconds
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      setMessage('Error updating shelter information');
      console.error('Error:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setMessage('');
    // Reset form data to original values
    if (shelter) {
      setFormData({
        available_beds: shelter.available_beds,
        allows_pets: shelter.allows_pets,
        requires_sobriety: shelter.requires_sobriety,
        accepts_families: shelter.accepts_families,
      });
    }
  };

  const formatLastUpdated = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    return date.toLocaleDateString();
  };

  const getAvailabilityStatus = () => {
    if (!shelter) return { color: 'gray', text: 'Unknown' };
    
    const percentage = (shelter.available_beds / shelter.total_beds) * 100;
    if (percentage === 0) return { color: 'red', text: 'Full' };
    if (percentage < 25) return { color: 'orange', text: 'Limited' };
    return { color: 'green', text: 'Available' };
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="h-12 w-12 animate-spin mx-auto mb-4 text-blue-600" />
          <p className="text-gray-700 text-lg">Loading shelter details...</p>
        </div>
      </div>
    );
  }

  if (error || !shelter) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl p-8 border border-red-200">
          <AlertCircle className="h-12 w-12 mx-auto mb-4 text-red-600" />
          <h2 className="text-xl font-bold text-gray-900 mb-2">Shelter Not Found</h2>
          <p className="text-gray-700 mb-6">{error || 'The requested shelter could not be found.'}</p>
          <button
            onClick={() => navigate('/')}
            className="flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-xl hover:bg-blue-700 transition-colors font-semibold shadow-lg hover:shadow-xl mx-auto"
          >
            <ArrowLeft className="h-5 w-5" />
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  const availabilityStatus = getAvailabilityStatus();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white/90 backdrop-blur-sm shadow-lg border-b border-blue-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate('/')}
                className="flex items-center gap-2 text-gray-600 hover:text-blue-600 transition-colors"
              >
                <ArrowLeft className="h-5 w-5" />
                <span className="font-medium">Back to Dashboard</span>
              </button>
            </div>
            
            <div className="flex items-center justify-between w-full">
              <div className="flex items-center gap-4">
                <div className="bg-blue-600 p-3 rounded-xl shadow-lg">
                  <Home className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">{shelter.name}</h1>
                  <p className="text-gray-600">Shelter Details</p>
                </div>
              </div>
              
              {/* Staff Edit Controls */}
              {isAuthenticated && (
                <div className="flex items-center gap-3">
                  {isEditing ? (
                    <>
                      <button
                        onClick={handleCancelEdit}
                        className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
                      >
                        <X className="h-4 w-4" />
                        Cancel
                      </button>
                      <button
                        onClick={handleSave}
                        disabled={saving}
                        className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 disabled:opacity-50 transition-colors font-medium shadow-md"
                      >
                        {saving ? (
                          <>
                            <RefreshCw className="h-4 w-4 animate-spin" />
                            Saving...
                          </>
                        ) : (
                          <>
                            <Save className="h-4 w-4" />
                            Save Changes
                          </>
                        )}
                      </button>
                    </>
                  ) : (
                    <button
                      onClick={() => setIsEditing(true)}
                      className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors font-medium shadow-md"
                    >
                      <Edit3 className="h-4 w-4" />
                      Edit Shelter
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Message Display */}
        {message && (
          <div className={`p-4 rounded-xl border-2 ${message.includes('Error') ? 'bg-red-50 border-red-200 text-red-800' : 'bg-green-50 border-green-200 text-green-800'}`}>
            <p className="font-medium">{message}</p>
          </div>
        )}
        {/* Availability Status Banner */}
        <div className={`bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl border p-6 ${
          availabilityStatus.color === 'red' ? 'border-red-200' :
          availabilityStatus.color === 'orange' ? 'border-orange-200' : 'border-green-200'
        }`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className={`p-3 rounded-xl ${
                availabilityStatus.color === 'red' ? 'bg-red-100' :
                availabilityStatus.color === 'orange' ? 'bg-orange-100' : 'bg-green-100'
              }`}>
                <Bed className={`h-8 w-8 ${
                  availabilityStatus.color === 'red' ? 'text-red-600' :
                  availabilityStatus.color === 'orange' ? 'text-orange-600' : 'text-green-600'
                }`} />
              </div>
              <div>
                {isEditing ? (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Available Beds
                      </label>
                      <input
                        type="number"
                        min="0"
                        max={shelter.total_beds}
                        value={formData.available_beds}
                        onChange={(e) => setFormData({ ...formData, available_beds: parseInt(e.target.value) || 0 })}
                        className="w-32 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                      <span className="ml-2 text-gray-600">of {shelter.total_beds} total beds</span>
                    </div>
                    <p className={`text-lg font-semibold ${
                      availabilityStatus.color === 'red' ? 'text-red-600' :
                      availabilityStatus.color === 'orange' ? 'text-orange-600' : 'text-green-600'
                    }`}>
                      Status: {availabilityStatus.text}
                    </p>
                  </div>
                ) : (
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">
                      {shelter.available_beds} of {shelter.total_beds} beds available
                    </h2>
                    <p className={`text-lg font-semibold ${
                      availabilityStatus.color === 'red' ? 'text-red-600' :
                      availabilityStatus.color === 'orange' ? 'text-orange-600' : 'text-green-600'
                    }`}>
                      Status: {availabilityStatus.text}
                    </p>
                  </div>
                )}
              </div>
            </div>
            
            <div className="text-right">
              <div className="w-32 h-3 bg-gray-200 rounded-full overflow-hidden">
                <div 
                  className={`h-full transition-all duration-300 ${
                    availabilityStatus.color === 'red' ? 'bg-gradient-to-r from-red-500 to-red-600' :
                    availabilityStatus.color === 'orange' ? 'bg-gradient-to-r from-orange-500 to-orange-600' :
                    'bg-gradient-to-r from-green-500 to-green-600'
                  }`}
                  style={{ width: `${(shelter.available_beds / shelter.total_beds) * 100}%` }}
                />
              </div>
              <p className="text-sm text-gray-600 mt-2">
                {Math.round((shelter.available_beds / shelter.total_beds) * 100)}% available
              </p>
            </div>
          </div>
        </div>

        {/* Shelter Information */}
        <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl border border-blue-200 p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Shelter Information</h2>
          
          {/* Location */}
          <div className="mb-8">
            <div className="flex items-start gap-4 mb-4">
              <MapPin className="h-6 w-6 text-blue-600 mt-1" />
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Location</h3>
                <p className="text-gray-700 text-lg">{shelter.address}</p>
                <a
                  href={`https://maps.google.com/?q=${encodeURIComponent(shelter.address)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 mt-3 text-blue-600 hover:text-blue-700 font-medium"
                >
                  <ExternalLink className="h-4 w-4" />
                  View on Google Maps
                </a>
              </div>
            </div>
          </div>

          {/* Policies & Rules */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Shield className="h-5 w-5 text-blue-600" />
              Shelter Policies
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className={`p-4 rounded-xl border-2 ${
                (isEditing ? formData.allows_pets : shelter.allows_pets)
                  ? 'bg-green-50 border-green-200' 
                  : 'bg-red-50 border-red-200'
              }`}>
                <div className="flex items-center gap-3 mb-2">
                  <Dog className={`h-5 w-5 ${(isEditing ? formData.allows_pets : shelter.allows_pets) ? 'text-green-600' : 'text-red-600'}`} />
                  <span className="font-semibold text-gray-900">Pet Policy</span>
                </div>
                {isEditing ? (
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.allows_pets}
                      onChange={(e) => setFormData({ ...formData, allows_pets: e.target.checked })}
                      className="w-4 h-4 text-green-600 border-gray-300 rounded focus:ring-green-500"
                    />
                    <span className="text-sm text-gray-700">
                      {formData.allows_pets ? 'Pets are welcome' : 'No pets allowed'}
                    </span>
                  </label>
                ) : (
                  <p className={`text-sm ${shelter.allows_pets ? 'text-green-700' : 'text-red-700'}`}>
                    {shelter.allows_pets ? 'Pets are welcome' : 'No pets allowed'}
                  </p>
                )}
              </div>

              <div className={`p-4 rounded-xl border-2 ${
                (isEditing ? formData.accepts_families : shelter.accepts_families)
                  ? 'bg-green-50 border-green-200' 
                  : 'bg-gray-50 border-gray-200'
              }`}>
                <div className="flex items-center gap-3 mb-2">
                  <Users className={`h-5 w-5 ${(isEditing ? formData.accepts_families : shelter.accepts_families) ? 'text-green-600' : 'text-gray-600'}`} />
                  <span className="font-semibold text-gray-900">Family Policy</span>
                </div>
                {isEditing ? (
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.accepts_families}
                      onChange={(e) => setFormData({ ...formData, accepts_families: e.target.checked })}
                      className="w-4 h-4 text-green-600 border-gray-300 rounded focus:ring-green-500"
                    />
                    <span className="text-sm text-gray-700">
                      {formData.accepts_families ? 'Families welcome' : 'Adults only'}
                    </span>
                  </label>
                ) : (
                  <p className={`text-sm ${shelter.accepts_families ? 'text-green-700' : 'text-gray-700'}`}>
                    {shelter.accepts_families ? 'Families welcome' : 'Adults only'}
                  </p>
                )}
              </div>

              <div className={`p-4 rounded-xl border-2 ${
                (isEditing ? formData.requires_sobriety : shelter.requires_sobriety)
                  ? 'bg-orange-50 border-orange-200' 
                  : 'bg-gray-50 border-gray-200'
              }`}>
                <div className="flex items-center gap-3 mb-2">
                  <AlertCircle className={`h-5 w-5 ${(isEditing ? formData.requires_sobriety : shelter.requires_sobriety) ? 'text-orange-600' : 'text-gray-600'}`} />
                  <span className="font-semibold text-gray-900">Sobriety</span>
                </div>
                {isEditing ? (
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.requires_sobriety}
                      onChange={(e) => setFormData({ ...formData, requires_sobriety: e.target.checked })}
                      className="w-4 h-4 text-orange-600 border-gray-300 rounded focus:ring-orange-500"
                    />
                    <span className="text-sm text-gray-700">
                      {formData.requires_sobriety ? 'Sobriety required' : 'No sobriety requirement'}
                    </span>
                  </label>
                ) : (
                  <p className={`text-sm ${shelter.requires_sobriety ? 'text-orange-700' : 'text-gray-700'}`}>
                    {shelter.requires_sobriety ? 'Sobriety required' : 'No sobriety requirement'}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Contact Information */}
          <div className="border-t border-gray-200 pt-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">Contact Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex items-center gap-4 p-4 bg-green-50 rounded-xl border border-green-200">
                <div className="bg-green-100 p-3 rounded-xl">
                  <Phone className="h-6 w-6 text-green-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600 uppercase tracking-wide">Phone</p>
                  <a 
                    href={`tel:${shelter.contact_phone}`} 
                    className="text-lg font-semibold text-green-700 hover:text-green-800 transition-colors"
                  >
                    {shelter.contact_phone}
                  </a>
                </div>
              </div>

              <div className="flex items-center gap-4 p-4 bg-blue-50 rounded-xl border border-blue-200">
                <div className="bg-blue-100 p-3 rounded-xl">
                  <Mail className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600 uppercase tracking-wide">Email</p>
                  <a 
                    href={`mailto:${shelter.contact_email}`} 
                    className="text-lg font-semibold text-blue-700 hover:text-blue-800 transition-colors break-all"
                  >
                    {shelter.contact_email}
                  </a>
                </div>
              </div>
            </div>
          </div>

          {/* Last Updated */}
          <div className="border-t border-gray-200 pt-6 mt-8">
            <div className="flex items-center justify-between text-sm text-gray-500">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                <span>Last updated {formatLastUpdated(shelter.last_updated)}</span>
              </div>
              <span>Updated by {shelter.updated_by}</span>
            </div>
          </div>
        </div>

        {/* Emergency Notice */}
        <div className="bg-red-50 border border-red-200 rounded-2xl p-6">
          <div className="flex items-start gap-4">
            <AlertCircle className="h-6 w-6 text-red-600 mt-1" />
            <div>
              <h3 className="text-lg font-semibold text-red-900 mb-2">Important Notice</h3>
              <p className="text-red-800">
                Bed availability changes frequently. Please call ahead to confirm availability before arriving. 
                In case of emergency, contact 911 or your local emergency services.
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
