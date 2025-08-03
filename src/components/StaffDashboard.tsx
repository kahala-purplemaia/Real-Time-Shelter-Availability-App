import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
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
  Edit3,
  X
} from 'lucide-react';

interface StaffDashboardProps {
  onLogout: () => void;
}

export default function StaffDashboard({ onLogout }: StaffDashboardProps) {
  const navigate = useNavigate();
  const [shelters, setShelters] = useState<Shelter[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());
  const [editingShelterId, setEditingShelterId] = useState<string | null>(null);
  const [saving, setSaving] = useState<string | null>(null);
  const [message, setMessage] = useState('');
  const [formData, setFormData] = useState<{[key: string]: {
    available_beds: number;
    allows_pets: boolean;
    requires_sobriety: boolean;
    accepts_families: boolean;
  }}>({});

  useEffect(() => {
    fetchShelters();
    
    // Set up real-time subscription
    const subscription = supabase
      .channel('shelters')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'shelters' }, () => {
        fetchShelters();
      })
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const fetchShelters = async () => {
    try {
      const { data, error } = await supabase
        .from('shelters')
        .select('*')
        .order('name');

      if (error) throw error;
      setShelters(data || []);
      setLastRefresh(new Date());
      
      // Initialize form data for all shelters
      const initialFormData: {[key: string]: any} = {};
      (data || []).forEach(shelter => {
        initialFormData[shelter.id] = {
          available_beds: shelter.available_beds,
          allows_pets: shelter.allows_pets,
          requires_sobriety: shelter.requires_sobriety,
          accepts_families: shelter.accepts_families,
        };
      });
      setFormData(initialFormData);
    } catch (error) {
      console.error('Error fetching shelters:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (shelterId: string) => {
    setEditingShelterId(shelterId);
    setMessage('');
  };

  const handleCancelEdit = (shelterId: string) => {
    setEditingShelterId(null);
    setMessage('');
    // Reset form data to original values
    const shelter = shelters.find(s => s.id === shelterId);
    if (shelter) {
      setFormData(prev => ({
        ...prev,
        [shelterId]: {
          available_beds: shelter.available_beds,
          allows_pets: shelter.allows_pets,
          requires_sobriety: shelter.requires_sobriety,
          accepts_families: shelter.accepts_families,
        }
      }));
    }
  };

  const handleSave = async (shelterId: string) => {
    setSaving(shelterId);
    setMessage('');

    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      const { error } = await supabase
        .from('shelters')
        .update({
          ...formData[shelterId],
          last_updated: new Date().toISOString(),
          updated_by: user?.email || 'Staff'
        })
        .eq('id', shelterId);

      if (error) throw error;

      setMessage('Shelter information updated successfully!');
      setEditingShelterId(null);
      fetchShelters(); // Refresh data
      
      // Clear message after 3 seconds
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      setMessage('Error updating shelter information');
      console.error('Error:', error);
    } finally {
      setSaving(null);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    onLogout();
  };

  const getAvailabilityColor = (available: number, total: number) => {
    const percentage = (available / total) * 100;
    if (percentage === 0) return 'text-red-600 bg-red-50 border-red-200';
    if (percentage < 25) return 'text-orange-600 bg-orange-50 border-orange-200';
    return 'text-green-600 bg-green-50 border-green-200';
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-100 flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="h-12 w-12 animate-spin mx-auto mb-4 text-purple-600" />
          <p className="text-gray-700 text-lg">Loading staff dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-100">
      {/* Header */}
      <header className="bg-white/90 backdrop-blur-sm shadow-lg border-b border-purple-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="bg-purple-600 p-3 rounded-xl shadow-lg">
                <Shield className="h-8 w-8 text-white" />
              </div>
              <div>
                <h1 className="text-4xl font-bold text-gray-900">Staff Dashboard</h1>
                <p className="text-gray-600 mt-2 text-lg">Manage shelter availability and policies</p>
              </div>
            </div>
            
            <div className="flex items-center gap-6">
              <div className="flex items-center text-sm text-gray-600 bg-white px-4 py-2 rounded-lg shadow-sm">
                <Clock className="h-4 w-4 mr-2" />
                Updated {formatLastUpdated(lastRefresh.toISOString())}
              </div>
              
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors font-medium shadow-md"
              >
                <LogOut className="h-4 w-4" />
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Message Display */}
        {message && (
          <div className={`mb-6 p-4 rounded-xl border-2 ${
            message.includes('Error') 
              ? 'bg-red-50 border-red-200 text-red-800' 
              : 'bg-green-50 border-green-200 text-green-800'
          }`}>
            <p className="font-medium">{message}</p>
          </div>
        )}

        {/* Bed Utilization Stat Card */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl border border-purple-200 p-8 hover:shadow-2xl transition-shadow duration-300">
            <div className="flex items-center">
              <div className="bg-gradient-to-br from-purple-500 to-purple-600 p-4 rounded-xl shadow-lg">
                <Bed className="h-8 w-8 text-white" />
              </div>
              <div className="ml-6">
                <p className="text-sm font-semibold text-gray-600 uppercase tracking-wide">Bed Utilization</p>
                <p className="text-3xl font-bold text-gray-900">
                  {(() => {
                    const totalBeds = shelters.reduce((sum, s) => sum + (s.total_beds || 0), 0);
                    const availableBeds = shelters.reduce((sum, s) => sum + (s.available_beds || 0), 0);
                    if (!totalBeds) return 'N/A';
                    const utilized = totalBeds - availableBeds;
                    const percent = (utilized / totalBeds) * 100;
                    return `${percent.toFixed(1)}%`;
                  })()} 
                </p>
                <p className="text-sm text-gray-500">of beds utilized</p>
              </div>
            </div>
          </div>
        </div>

        {/* Shelter List */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {shelters.map((shelter) => {
            const isEditing = editingShelterId === shelter.id;
            const currentFormData = formData[shelter.id] || {
              available_beds: shelter.available_beds,
              allows_pets: shelter.allows_pets,
              requires_sobriety: shelter.requires_sobriety,
              accepts_families: shelter.accepts_families,
            };
            
            return (
              <div 
                key={shelter.id} 
                className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl border border-purple-200 hover:shadow-2xl transition-all duration-300"
              >
                <div className="p-8">
                  <div className="flex items-start justify-between mb-6">
                    <div className="flex-1">
                      <h3 className="text-2xl font-bold text-gray-900 mb-2">{shelter.name}</h3>
                      <div className="flex items-center text-gray-600">
                        <MapPin className="h-4 w-4 mr-2" />
                        <span className="text-sm">{shelter.address}</span>
                      </div>
                    </div>
                    
                    {/* Edit Controls */}
                    <div className="flex items-center gap-2">
                      {isEditing ? (
                        <>
                          <button
                            onClick={() => handleCancelEdit(shelter.id)}
                            className="flex items-center gap-1 px-3 py-1 text-gray-600 hover:text-gray-800 transition-colors text-sm"
                          >
                            <X className="h-4 w-4" />
                            Cancel
                          </button>
                          <button
                            onClick={() => handleSave(shelter.id)}
                            disabled={saving === shelter.id}
                            className="flex items-center gap-1 bg-green-600 text-white px-3 py-1 rounded-lg hover:bg-green-700 disabled:opacity-50 transition-colors text-sm font-medium"
                          >
                            {saving === shelter.id ? (
                              <>
                                <RefreshCw className="h-4 w-4 animate-spin" />
                                Saving...
                              </>
                            ) : (
                              <>
                                <Save className="h-4 w-4" />
                                Save
                              </>
                            )}
                          </button>
                        </>
                      ) : (
                        <button
                          onClick={() => handleEdit(shelter.id)}
                          className="flex items-center gap-1 bg-purple-600 text-white px-3 py-1 rounded-lg hover:bg-purple-700 transition-colors text-sm font-medium"
                        >
                          <Edit3 className="h-4 w-4" />
                          Edit
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Availability Section */}
                  <div className="mb-6">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-sm font-bold text-gray-700 uppercase tracking-wide">Bed Availability</span>
                      {isEditing ? (
                        <div className="flex items-center gap-2">
                          <input
                            type="number"
                            min="0"
                            max={shelter.total_beds}
                            value={currentFormData.available_beds}
                            onChange={(e) => setFormData(prev => ({
                              ...prev,
                              [shelter.id]: {
                                ...currentFormData,
                                available_beds: parseInt(e.target.value) || 0
                              }
                            }))}
                            className="w-20 px-2 py-1 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                          />
                          <span className="text-sm text-gray-600">/ {shelter.total_beds}</span>
                        </div>
                      ) : (
                        <div className={`px-4 py-2 rounded-xl text-sm font-bold border-2 ${getAvailabilityColor(shelter.available_beds, shelter.total_beds)}`}>
                          {shelter.available_beds}/{shelter.total_beds} beds
                        </div>
                      )}
                    </div>
                    
                    <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                      <div 
                        className={`h-full transition-all duration-300 ${
                          (isEditing ? currentFormData.available_beds : shelter.available_beds) === 0
                            ? 'bg-gradient-to-r from-red-500 to-red-600'
                            : (isEditing ? currentFormData.available_beds : shelter.available_beds) / shelter.total_beds < 0.25
                            ? 'bg-gradient-to-r from-orange-500 to-orange-600' 
                            : 'bg-gradient-to-r from-green-500 to-green-600'
                        }`}
                        style={{ width: `${((isEditing ? currentFormData.available_beds : shelter.available_beds) / shelter.total_beds) * 100}%` }}
                      />
                    </div>
                  </div>

                  {/* Rules & Policies */}
                  <div className="mb-6">
                    <p className="text-sm font-bold text-gray-700 mb-3 uppercase tracking-wide">Shelter Policies</p>
                    <div className="flex flex-wrap gap-2">
                      {isEditing ? (
                        <>
                          <label className="flex items-center gap-2 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={currentFormData.allows_pets}
                              onChange={(e) => setFormData(prev => ({
                                ...prev,
                                [shelter.id]: {
                                  ...currentFormData,
                                  allows_pets: e.target.checked
                                }
                              }))}
                              className="w-4 h-4 text-green-600 border-gray-300 rounded focus:ring-green-500"
                            />
                            <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${
                              currentFormData.allows_pets ? 'bg-green-100 text-green-800 border border-green-200' : 'bg-red-100 text-red-800 border border-red-200'
                            }`}>
                              <Dog className="h-3 w-3 mr-1" />
                              {currentFormData.allows_pets ? 'Pets Welcome' : 'No Pets'}
                            </span>
                          </label>
                          
                          <label className="flex items-center gap-2 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={currentFormData.accepts_families}
                              onChange={(e) => setFormData(prev => ({
                                ...prev,
                                [shelter.id]: {
                                  ...currentFormData,
                                  accepts_families: e.target.checked
                                }
                              }))}
                              className="w-4 h-4 text-green-600 border-gray-300 rounded focus:ring-green-500"
                            />
                            <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${
                              currentFormData.accepts_families ? 'bg-green-100 text-green-800 border border-green-200' : 'bg-gray-100 text-gray-800 border border-gray-200'
                            }`}>
                              <Users className="h-3 w-3 mr-1" />
                              {currentFormData.accepts_families ? 'Families Welcome' : 'Adults Only'}
                            </span>
                          </label>
                          
                          <label className="flex items-center gap-2 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={currentFormData.requires_sobriety}
                              onChange={(e) => setFormData(prev => ({
                                ...prev,
                                [shelter.id]: {
                                  ...currentFormData,
                                  requires_sobriety: e.target.checked
                                }
                              }))}
                              className="w-4 h-4 text-orange-600 border-gray-300 rounded focus:ring-orange-500"
                            />
                            <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${
                              currentFormData.requires_sobriety ? 'bg-blue-100 text-blue-800 border border-blue-200' : 'bg-gray-100 text-gray-800 border border-gray-200'
                            }`}>
                              <AlertCircle className="h-3 w-3 mr-1" />
                              {currentFormData.requires_sobriety ? 'Sobriety Required' : 'No Sobriety Requirement'}
                            </span>
                          </label>
                        </>
                      ) : (
                        <>
                          <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${
                            shelter.allows_pets ? 'bg-green-100 text-green-800 border border-green-200' : 'bg-red-100 text-red-800 border border-red-200'
                          }`}>
                            <Dog className="h-3 w-3 mr-1" />
                            {shelter.allows_pets ? 'Pets Welcome' : 'No Pets'}
                          </span>
                          
                          <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${
                            shelter.accepts_families ? 'bg-green-100 text-green-800 border border-green-200' : 'bg-gray-100 text-gray-800 border border-gray-200'
                          }`}>
                            <Users className="h-3 w-3 mr-1" />
                            {shelter.accepts_families ? 'Families Welcome' : 'Adults Only'}
                          </span>
                          
                          {shelter.requires_sobriety && (
                            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-800 border border-blue-200">
                              <AlertCircle className="h-3 w-3 mr-1" />
                              Sobriety Required
                            </span>
                          )}
                        </>
                      )}
                    </div>
                  </div>

                  {/* Contact Info */}
                  <div className="border-t border-gray-200 pt-6 space-y-3">
                    <div className="flex items-center text-sm text-gray-700">
                      <Phone className="h-4 w-4 mr-3 text-green-600" />
                      <a href={`tel:${shelter.contact_phone}`} className="hover:text-purple-600 transition-colors font-medium">
                        {shelter.contact_phone}
                      </a>
                    </div>
                    <div className="flex items-center text-sm text-gray-700">
                      <Mail className="h-4 w-4 mr-3 text-purple-600" />
                      <a href={`mailto:${shelter.contact_email}`} className="hover:text-purple-600 transition-colors font-medium">
                        {shelter.contact_email}
                      </a>
                    </div>
                    <div className="flex items-center text-xs text-gray-500 pt-2">
                      <Clock className="h-3 w-3 mr-2" />
                      Last updated {formatLastUpdated(shelter.last_updated)} by {shelter.updated_by}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </main>
    </div>
  );
}
