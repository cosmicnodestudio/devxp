import { useEffect, useState } from 'react';
import apiService, { Api } from '../services/apiService';
import { Plus, Search, Filter, Edit2, Trash2, ExternalLink } from 'lucide-react';
import { getStatusColor, getMethodColor, formatDateTime } from '../utils/helpers';

export default function ApisPage() {
  const [apis, setApis] = useState<Api[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [showCreateModal, setShowCreateModal] = useState(false);

  useEffect(() => {
    loadApis();
  }, [statusFilter]);

  const loadApis = async () => {
    try {
      setLoading(true);
      const filters = statusFilter ? { status: statusFilter } : undefined;
      const data = await apiService.getAllApis(filters);
      setApis(data);
    } catch (error) {
      console.error('Error loading APIs:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this API?')) return;

    try {
      await apiService.deleteApi(id);
      loadApis();
    } catch (error) {
      console.error('Error deleting API:', error);
      alert('Failed to delete API');
    }
  };

  const filteredApis = apis.filter(api =>
    api.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    api.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">API Catalog</h1>
          <p className="text-gray-600 mt-1">Manage your internal and external APIs</p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="btn-primary flex items-center space-x-2"
        >
          <Plus size={20} />
          <span>Add API</span>
        </button>
      </div>

      {/* Filters */}
      <div className="card">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Search APIs..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input pl-10"
            />
          </div>

          {/* Status Filter */}
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="input pl-10"
            >
              <option value="">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="deprecated">Deprecated</option>
            </select>
          </div>
        </div>
      </div>

      {/* APIs List */}
      {filteredApis.length === 0 ? (
        <div className="card text-center py-12">
          <p className="text-gray-500">No APIs found</p>
          <button
            onClick={() => setShowCreateModal(true)}
            className="btn-primary mt-4 inline-flex items-center space-x-2"
          >
            <Plus size={20} />
            <span>Create your first API</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {filteredApis.map(api => (
            <div key={api.id} className="card hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <h3 className="text-lg font-semibold text-gray-900">{api.name}</h3>
                    <span className={`badge ${getMethodColor(api.method)}`}>
                      {api.method}
                    </span>
                    <span className={`badge ${getStatusColor(api.status)}`}>
                      {api.status}
                    </span>
                    {api.category && (
                      <span className="badge bg-gray-100 text-gray-700">
                        {api.category}
                      </span>
                    )}
                  </div>

                  {api.description && (
                    <p className="text-gray-600 text-sm mb-3">{api.description}</p>
                  )}

                  <div className="flex items-center space-x-4 text-sm text-gray-500">
                    <a
                      href={api.base_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center space-x-1 text-primary-600 hover:text-primary-700"
                    >
                      <ExternalLink size={14} />
                      <span className="font-mono">{api.base_url}</span>
                    </a>
                  </div>

                  {api.tags && api.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-3">
                      {api.tags.map(tag => (
                        <span key={tag} className="text-xs px-2 py-1 bg-gray-100 text-gray-600 rounded">
                          #{tag}
                        </span>
                      ))}
                    </div>
                  )}

                  <div className="mt-3 text-xs text-gray-500">
                    Created {formatDateTime(api.created_at)}
                  </div>
                </div>

                <div className="flex items-center space-x-2 ml-4">
                  <button
                    className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                    title="Edit API"
                  >
                    <Edit2 size={18} />
                  </button>
                  <button
                    onClick={() => handleDelete(api.id)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    title="Delete API"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create Modal Placeholder */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full p-6">
            <h2 className="text-2xl font-bold mb-4">Create New API</h2>
            <p className="text-gray-600 mb-4">This feature is coming soon!</p>
            <button
              onClick={() => setShowCreateModal(false)}
              className="btn-secondary"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
