import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import type { Shelter } from '../types/shelter';
import { 
  Bed, 
  Phone, 
  Mail, 
  MapPin, 
  Clock, 
  Dog, 
  Users, 
  AlertCircle,
  Map,
  List,
  RefreshCw,
  Home
} from 'lucide-react';
import ShelterMap from './ShelterMap';

export default function PublicDashboard() {
  const navigate = useNavigate();
  const [shelters, setShelters] = useState<Shelter[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'list' | 'map'>('list');
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());

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
    } catch (error) {
      console.error('Error fetching shelters:', error);
    } finally {
      setLoading(false);
    }
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
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="h-12 w-12 animate-spin mx-auto mb-4 text-blue-600" />
          <p className="text-gray-700 text-lg">Loading shelter information...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white/90 backdrop-blur-sm shadow-lg border-b border-blue-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="bg-blue-600 p-3 rounded-xl shadow-lg">
                <Home className="h-8 w-8 text-white" />
              </div>
              <div>
                <h1 className="text-4xl font-bold text-gray-900">Emergency Shelter Network</h1>
                <p className="text-gray-600 mt-2 text-lg">Real-time bed availability across the city</p>
              </div>
            </div>
            
            <div className="flex items-center gap-6">
              <div className="flex items-center text-sm text-gray-600 bg-white px-4 py-2 rounded-lg shadow-sm">
                <Clock className="h-4 w-4 mr-2" />
                Updated {formatLastUpdated(lastRefresh.toISOString())}
              </div>
              
              <div className="flex bg-white rounded-xl p-1 shadow-sm">
                <button
                  onClick={() => setViewMode('list')}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                    viewMode === 'list' 
                      ? 'bg-blue-600 text-white shadow-md' 
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                  }`}
                >
                  <List className="h-4 w-4 mr-2 inline" />
                  List View
                </button>
                <button
                  onClick={() => setViewMode('map')}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                    viewMode === 'map' 
                      ? 'bg-blue-600 text-white shadow-md' 
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                  }`}
                >
                  <Map className="h-4 w-4 mr-2 inline" />
                  Map View
                </button>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {viewMode === 'map' ? (
          <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl border border-blue-200 p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
              <MapPin className="h-6 w-6 text-blue-600" />
              Shelter Locations
            </h2>
            <ShelterMap shelters={shelters} />
          </div>
        ) : (
          <>
            {/* Summary Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl border border-blue-200 p-8 hover:shadow-2xl transition-shadow duration-300">
                <div className="flex items-center">
                  <div className="bg-gradient-to-br from-blue-500 to-blue-600 p-4 rounded-xl shadow-lg">
                    <Bed className="h-8 w-8 text-white" />
                  </div>
                  <div className="ml-6">
                    <p className="text-sm font-semibold text-gray-600 uppercase tracking-wide">Total Available</p>
                    <p className="text-3xl font-bold text-gray-900">
                      {shelters.reduce((sum, shelter) => sum + shelter.available_beds, 0)}
                    </p>
                    <p className="text-sm text-gray-500">beds right now</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl border border-blue-200 p-8 hover:shadow-2xl transition-shadow duration-300">
                <div className="flex items-center">
                  <div className="bg-gradient-to-br from-green-500 to-green-600 p-4 rounded-xl shadow-lg">
                    <MapPin className="h-8 w-8 text-white" />
                  </div>
                  <div className="ml-6">
                    <p className="text-sm font-semibold text-gray-600 uppercase tracking-wide">Shelters Open</p>
                    <p className="text-3xl font-bold text-gray-900">
                      {shelters.filter(s => s.available_beds > 0).length}
                    </p>
                    <p className="text-sm text-gray-500">of {shelters.length} total</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl border border-blue-200 p-8 hover:shadow-2xl transition-shadow duration-300">
                <div className="flex items-center">
                  <div className="bg-gradient-to-br from-purple-500 to-purple-600 p-4 rounded-xl shadow-lg">
                    <Users className="h-8 w-8 text-white" />
                  </div>
                  <div className="ml-6">
                    <p className="text-sm font-semibold text-gray-600 uppercase tracking-wide">Family-Friendly</p>
                    <p className="text-3xl font-bold text-gray-900">
                      {shelters.filter(s => s.accepts_families).length}
                    </p>
                    <p className="text-sm text-gray-500">accept families</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Shelter List */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {shelters.map((shelter) => (
                <div 
                  key={shelter.id} 
                  onClick={() => navigate(`/shelter/${shelter.id}`)}
                  className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl border border-blue-200 hover:shadow-2xl transition-all duration-300 hover:scale-[1.02] cursor-pointer"
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
                      
                      <div className={`px-4 py-2 rounded-xl text-sm font-bold border-2 ${getAvailabilityColor(shelter.available_beds, shelter.total_beds)}`}>
                        {shelter.available_beds}/{shelter.total_beds} beds
                      </div>
                    </div>

                    {/* Availability Bar */}
                    <div className="mb-6">
                      <div className="flex justify-between text-sm text-gray-600 mb-2">
                        <span className="font-medium">Bed Availability</span>
                        <span className="font-bold">{Math.round((shelter.available_beds / shelter.total_beds) * 100)}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-3 shadow-inner">
                        <div 
                          className={`h-3 rounded-full transition-all duration-500 shadow-sm ${
                            shelter.available_beds === 0 
                              ? 'bg-gradient-to-r from-red-500 to-red-600' 
                              : shelter.available_beds / shelter.total_beds < 0.25 
                                ? 'bg-gradient-to-r from-orange-500 to-orange-600' 
                                : 'bg-gradient-to-r from-green-500 to-green-600'
                          }`}
                          style={{ width: `${(shelter.available_beds / shelter.total_beds) * 100}%` }}
                        />
                      </div>
                    </div>

                    {/* Rules & Policies */}
                    <div className="mb-6">
                      <p className="text-sm font-bold text-gray-700 mb-3 uppercase tracking-wide">Shelter Policies</p>
                      <div className="flex flex-wrap gap-2">
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
                      </div>
                    </div>

                    {/* Contact Info */}
                    <div className="border-t border-gray-200 pt-6 space-y-3">
                      <div className="flex items-center text-sm text-gray-700">
                        <Phone className="h-4 w-4 mr-3 text-green-600" />
                        <a href={`tel:${shelter.contact_phone}`} className="hover:text-blue-600 transition-colors font-medium">
                          {shelter.contact_phone}
                        </a>
                      </div>
                      <div className="flex items-center text-sm text-gray-700">
                        <Mail className="h-4 w-4 mr-3 text-blue-600" />
                        <a href={`mailto:${shelter.contact_email}`} className="hover:text-blue-600 transition-colors font-medium">
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
              ))}
            </div>

            {/* Staff Access Link */}
            <div className="mt-12 text-center">
              <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl border border-blue-200 p-8 inline-block">
                <p className="text-gray-600 mb-4">Are you shelter staff?</p>
                <a 
                  href="/staff/login" 
                  className="inline-flex items-center px-6 py-3 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 transition-colors shadow-lg hover:shadow-xl"
                >
                  Staff Login
                </a>
              </div>
            </div>
          </>
        )}
      </main>
    </div>
  );
}