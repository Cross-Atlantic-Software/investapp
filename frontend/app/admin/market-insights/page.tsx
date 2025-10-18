"use client";

import { useState, useEffect } from "react";
import { Plus, Search, Filter, Edit, Trash2, Eye, Calendar, Tag, Building, Users, Building2, Clock, DollarSign, Palette, FileText, Upload, X } from "lucide-react";
import ManageDropdown from "@/components/admin/ManageDropdown";
import InsightTaxonomyModal from "@/components/admin/InsightTaxonomyModal";
import Image from "next/image";

interface MarketInsight {
  id: number;
  slug: string;
  is_featured: boolean;
  title: string;
  blog_image: string;
  teaser: string;
  summary: string;
  first_part: string;
  second_part: string;
  insight_sector_id?: number;
  insight_subsector_id?: number;
  insight_topic_id?: number;
  insight_subtopic_id?: number;
  insight_theme_id?: number;
  InsightSector?: { id: number; name: string };
  InsightSubsector?: { id: number; name: string };
  InsightTopic?: { id: number; name: string };
  InsightSubtopic?: { id: number; name: string };
  InsightTheme?: { id: number; name: string };
  Companies?: Array<{ id: number; company_name: string }>;
  created_at: string;
  updated_at: string;
}

interface ImageUploadState {
  file: File | null;
  preview: string | null;
  uploading: boolean;
  progress: number;
  error: string | null;
}

interface InsightSector {
  id: number;
  name: string;
  is_active: boolean;
}

interface InsightSubsector {
  id: number;
  name: string;
  insight_sector_id: number;
  is_active: boolean;
}

interface InsightTopic {
  id: number;
  name: string;
  is_active: boolean;
}

interface InsightSubtopic {
  id: number;
  name: string;
  insight_topic_id: number;
  is_active: boolean;
}

interface InsightTheme {
  id: number;
  name: string;
  is_active: boolean;
}

interface Product {
  id: number;
  company_name: string;
}

export default function MarketInsightsPage() {
  const [marketInsights, setMarketInsights] = useState<MarketInsight[]>([]);
  const [insightSectors, setInsightSectors] = useState<InsightSector[]>([]);
  const [insightSubsectors, setInsightSubsectors] = useState<InsightSubsector[]>([]);
  const [insightTopics, setInsightTopics] = useState<InsightTopic[]>([]);
  const [insightSubtopics, setInsightSubtopics] = useState<InsightSubtopic[]>([]);
  const [insightThemes, setInsightThemes] = useState<InsightTheme[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedSector, setSelectedSector] = useState("");
  const [selectedTopic, setSelectedTopic] = useState("");
  const [selectedTheme, setSelectedTheme] = useState("");
  const [showFeaturedOnly, setShowFeaturedOnly] = useState(false);
  
  const [showModal, setShowModal] = useState(false);
  const [editingInsight, setEditingInsight] = useState<MarketInsight | null>(null);
  const [isViewMode, setIsViewMode] = useState(false);
  const [showSectorModal, setShowSectorModal] = useState(false);
  const [showTopicModal, setShowTopicModal] = useState(false);
  const [showThemeModal, setShowThemeModal] = useState(false);
  const [formData, setFormData] = useState({
    slug: "",
    is_featured: false,
    title: "",
    blog_image: "",
    teaser: "",
    summary: "",
    first_part: "",
    second_part: "",
    insight_sector_id: "",
    insight_subsector_id: "",
    insight_topic_id: "",
    insight_subtopic_id: "",
    insight_theme_id: "",
    company_ids: [] as number[]
  });

  const [imageUpload, setImageUpload] = useState<ImageUploadState>({
    file: null,
    preview: null,
    uploading: false,
    progress: 0,
    error: null,
  });

  // Fetch data
  useEffect(() => {
    fetchMarketInsights();
    fetchTaxonomies();
    fetchProducts();
  }, []);

  const fetchMarketInsights = async () => {
    try {
      const token = sessionStorage.getItem('adminToken') || '';
      const response = await fetch('/api/admin/market-insights', {
        headers: { 'token': token }
      });
      const data = await response.json();
      if (data.success) {
        setMarketInsights(data.data);
      }
    } catch (error) {
      console.error('Error fetching market insights:', error);
    }
  };

  const fetchTaxonomies = async () => {
    try {
      const token = sessionStorage.getItem('adminToken') || '';
      const [sectorsRes, subsectorsRes, topicsRes, subtopicsRes, themesRes] = await Promise.all([
        fetch('/api/admin/insight-sectors', { headers: { 'token': token } }),
        fetch('/api/admin/insight-subsectors', { headers: { 'token': token } }),
        fetch('/api/admin/insight-topics', { headers: { 'token': token } }),
        fetch('/api/admin/insight-subtopics', { headers: { 'token': token } }),
        fetch('/api/admin/insight-themes', { headers: { 'token': token } })
      ]);

      const [sectorsData, subsectorsData, topicsData, subtopicsData, themesData] = await Promise.all([
        sectorsRes.json(),
        subsectorsRes.json(),
        topicsRes.json(),
        subtopicsRes.json(),
        themesRes.json()
      ]);

      if (sectorsData.success) setInsightSectors(sectorsData.data);
      if (subsectorsData.success) setInsightSubsectors(subsectorsData.data);
      if (topicsData.success) setInsightTopics(topicsData.data);
      if (subtopicsData.success) setInsightSubtopics(subtopicsData.data);
      if (themesData.success) setInsightThemes(themesData.data);
    } catch (error) {
      console.error('Error fetching taxonomies:', error);
    }
  };

  const fetchProducts = async () => {
    try {
      const token = sessionStorage.getItem('adminToken') || '';
      const response = await fetch('/api/admin/stocks', {
        headers: { 'token': token }
      });
      const data = await response.json();
      if (data.success) {
        setProducts(data.data.stocks || []);
      }
    } catch (error) {
      console.error('Error fetching products:', error);
    }
  };

  const handleCreateInsight = async () => {
    try {
      const token = sessionStorage.getItem('adminToken') || '';
      
      // Create FormData for file upload
      const formDataToSend = new FormData();
      formDataToSend.append('slug', formData.slug);
      formDataToSend.append('is_featured', formData.is_featured.toString());
      formDataToSend.append('title', formData.title);
      formDataToSend.append('teaser', formData.teaser);
      formDataToSend.append('summary', formData.summary);
      formDataToSend.append('first_part', formData.first_part);
      formDataToSend.append('second_part', formData.second_part);
      formDataToSend.append('insight_sector_id', formData.insight_sector_id);
      formDataToSend.append('insight_subsector_id', formData.insight_subsector_id);
      formDataToSend.append('insight_topic_id', formData.insight_topic_id);
      formDataToSend.append('insight_subtopic_id', formData.insight_subtopic_id);
      formDataToSend.append('insight_theme_id', formData.insight_theme_id);
      formDataToSend.append('company_ids', JSON.stringify(formData.company_ids));
      
      // Add blog image file if selected
      if (imageUpload.file) {
        formDataToSend.append('blog_image', imageUpload.file);
      }

      const response = await fetch('/api/admin/market-insights', {
        method: 'POST',
        headers: { 
          'token': token
        },
        body: formDataToSend
      });
      
      const data = await response.json();
      if (data.success) {
        setShowModal(false);
        resetForm();
        fetchMarketInsights();
      } else {
        alert(data.message || 'Failed to create market insight');
      }
    } catch (error) {
      console.error('Error creating market insight:', error);
      alert('Failed to create market insight');
    }
  };

  const handleUpdateInsight = async () => {
    if (!editingInsight) return;
    
    try {
      const token = sessionStorage.getItem('adminToken') || '';
      
      // Create FormData for file upload
      const formDataToSend = new FormData();
      formDataToSend.append('slug', formData.slug);
      formDataToSend.append('is_featured', formData.is_featured.toString());
      formDataToSend.append('title', formData.title);
      formDataToSend.append('teaser', formData.teaser);
      formDataToSend.append('summary', formData.summary);
      formDataToSend.append('first_part', formData.first_part);
      formDataToSend.append('second_part', formData.second_part);
      formDataToSend.append('insight_sector_id', formData.insight_sector_id);
      formDataToSend.append('insight_subsector_id', formData.insight_subsector_id);
      formDataToSend.append('insight_topic_id', formData.insight_topic_id);
      formDataToSend.append('insight_subtopic_id', formData.insight_subtopic_id);
      formDataToSend.append('insight_theme_id', formData.insight_theme_id);
      formDataToSend.append('company_ids', JSON.stringify(formData.company_ids));
      
      // Add blog image file if selected
      if (imageUpload.file) {
        formDataToSend.append('blog_image', imageUpload.file);
      }

      const response = await fetch(`/api/admin/market-insights/${editingInsight.id}`, {
        method: 'PUT',
        headers: { 
          'token': token
        },
        body: formDataToSend
      });
      
      const data = await response.json();
      if (data.success) {
        setShowModal(false);
        setEditingInsight(null);
        resetForm();
        fetchMarketInsights();
      } else {
        alert(data.message || 'Failed to update market insight');
      }
    } catch (error) {
      console.error('Error updating market insight:', error);
      alert('Failed to update market insight');
    }
  };

  const handleDeleteInsight = async (id: number) => {
    if (!confirm('Are you sure you want to delete this market insight?')) return;
    
    try {
      const token = sessionStorage.getItem('adminToken') || '';
      const response = await fetch(`/api/admin/market-insights/${id}`, {
        method: 'DELETE',
        headers: { 'token': token }
      });
      
      const data = await response.json();
      if (data.success) {
        fetchMarketInsights();
      } else {
        alert(data.message || 'Failed to delete market insight');
      }
    } catch (error) {
      console.error('Error deleting market insight:', error);
      alert('Failed to delete market insight');
    }
  };

  const resetForm = () => {
    setFormData({
      slug: "",
      is_featured: false,
      title: "",
      blog_image: "",
      teaser: "",
      summary: "",
      first_part: "",
      second_part: "",
      insight_sector_id: "",
      insight_subsector_id: "",
      insight_topic_id: "",
      insight_subtopic_id: "",
      insight_theme_id: "",
      company_ids: []
    });
    setIsViewMode(false);
    setImageUpload({
      file: null,
      preview: null,
      uploading: false,
      progress: 0,
      error: null,
    });
  };

  // Image upload handlers
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        setImageUpload(prev => ({
          ...prev,
          error: 'Please select an image file'
        }));
        return;
      }

      // Validate file size (5MB limit)
      if (file.size > 5 * 1024 * 1024) {
        setImageUpload(prev => ({
          ...prev,
          error: 'File size must be less than 5MB'
        }));
        return;
      }

      const preview = URL.createObjectURL(file);
      setImageUpload({
        file,
        preview,
        uploading: false,
        progress: 0,
        error: null,
      });
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file) {
      const inputEvent = {
        target: { files: [file] }
      } as React.ChangeEvent<HTMLInputElement>;
      handleFileChange(inputEvent);
    }
  };

  const removeImage = () => {
    if (imageUpload.preview) {
      URL.revokeObjectURL(imageUpload.preview);
    }
    setImageUpload({
      file: null,
      preview: null,
      uploading: false,
      progress: 0,
      error: null,
    });
  };

  const handleView = (insight: MarketInsight) => {
    setEditingInsight(insight);
    setIsViewMode(true);
    setFormData({
      slug: insight.slug,
      is_featured: insight.is_featured,
      title: insight.title,
      blog_image: insight.blog_image,
      teaser: insight.teaser,
      summary: insight.summary,
      first_part: insight.first_part,
      second_part: insight.second_part,
      insight_sector_id: insight.insight_sector_id?.toString() || "",
      insight_subsector_id: insight.insight_subsector_id?.toString() || "",
      insight_topic_id: insight.insight_topic_id?.toString() || "",
      insight_subtopic_id: insight.insight_subtopic_id?.toString() || "",
      insight_theme_id: insight.insight_theme_id?.toString() || "",
      company_ids: insight.Companies?.map(c => c.id) || []
    });
    setShowModal(true);
  };

  const handleEdit = (insight: MarketInsight) => {
    setEditingInsight(insight);
    setIsViewMode(false);
    setFormData({
      slug: insight.slug,
      is_featured: insight.is_featured,
      title: insight.title,
      blog_image: insight.blog_image,
      teaser: insight.teaser,
      summary: insight.summary,
      first_part: insight.first_part,
      second_part: insight.second_part,
      insight_sector_id: insight.insight_sector_id?.toString() || "",
      insight_subsector_id: insight.insight_subsector_id?.toString() || "",
      insight_topic_id: insight.insight_topic_id?.toString() || "",
      insight_subtopic_id: insight.insight_subtopic_id?.toString() || "",
      insight_theme_id: insight.insight_theme_id?.toString() || "",
      company_ids: insight.Companies?.map(c => c.id) || []
    });
    setShowModal(true);
  };

  const filteredInsights = marketInsights.filter(insight => {
    const matchesSearch = insight.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         insight.teaser.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSector = !selectedSector || insight.insight_sector_id?.toString() === selectedSector;
    const matchesTopic = !selectedTopic || insight.insight_topic_id?.toString() === selectedTopic;
    const matchesTheme = !selectedTheme || insight.insight_theme_id?.toString() === selectedTheme;
    const matchesFeatured = !showFeaturedOnly || insight.is_featured;
    
    return matchesSearch && matchesSector && matchesTopic && matchesTheme && matchesFeatured;
  });

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-themeTeal">Market Insights</h1>
          <p className="text-themeTealLighter">Manage market insights and content</p>
        </div>
        <div className="flex items-center gap-3">
          <ManageDropdown
            label="Manage Taxonomies"
            options={[
              { label: 'Sectors & Subsectors', onClick: () => setShowSectorModal(true), icon: Building2 },
              { label: 'Topics & Subtopics', onClick: () => setShowTopicModal(true), icon: Tag },
              { label: 'Themes', onClick: () => setShowThemeModal(true), icon: Palette },
            ]}
          />
          <button
            onClick={() => {
              resetForm();
              setEditingInsight(null);
              setShowModal(true);
            }}
            className="flex items-center gap-2 bg-themeTeal text-white px-4 py-2 rounded-lg hover:bg-themeSkyBlue transition-colors"
          >
            <Plus className="w-4 h-4" />
            Add Market Insight
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg shadow-sm border">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-themeTealLighter w-4 h-4" />
            <input
              type="text"
              placeholder="Search insights..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-3 py-2 border border-themeTealLighter rounded-lg focus:outline-none focus:ring-2 focus:ring-themeTeal"
            />
          </div>
          
          <select
            value={selectedSector}
            onChange={(e) => setSelectedSector(e.target.value)}
            className="px-3 py-2 border border-themeTealLighter rounded-lg focus:outline-none focus:ring-2 focus:ring-themeTeal"
          >
            <option value="">All Sectors</option>
            {insightSectors.map(sector => (
              <option key={sector.id} value={sector.id.toString()}>{sector.name}</option>
            ))}
          </select>
          
          <select
            value={selectedTopic}
            onChange={(e) => setSelectedTopic(e.target.value)}
            className="px-3 py-2 border border-themeTealLighter rounded-lg focus:outline-none focus:ring-2 focus:ring-themeTeal"
          >
            <option value="">All Topics</option>
            {insightTopics.map(topic => (
              <option key={topic.id} value={topic.id.toString()}>{topic.name}</option>
            ))}
          </select>
          
          <select
            value={selectedTheme}
            onChange={(e) => setSelectedTheme(e.target.value)}
            className="px-3 py-2 border border-themeTealLighter rounded-lg focus:outline-none focus:ring-2 focus:ring-themeTeal"
          >
            <option value="">All Themes</option>
            {insightThemes.map(theme => (
              <option key={theme.id} value={theme.id.toString()}>{theme.name}</option>
            ))}
          </select>
          
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={showFeaturedOnly}
              onChange={(e) => setShowFeaturedOnly(e.target.checked)}
              className="rounded border-themeTealLighter"
            />
            <span className="text-sm text-themeTeal">Featured Only</span>
          </label>
        </div>
      </div>

      {/* Insights Table */}
      <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-themeTealWhite">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-medium text-themeTeal">Title</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-themeTeal">Sector</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-themeTeal">Topic</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-themeTeal">Theme</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-themeTeal">Featured</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-themeTeal">Updated</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-themeTeal">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-themeTealLighter">
              {filteredInsights.map((insight) => (
                <tr key={insight.id} className="hover:bg-themeTealWhite/50">
                  <td className="px-4 py-3">
                    <div className="max-w-xs">
                      <p className="text-sm font-medium text-themeTeal truncate">{insight.title}</p>
                      <p className="text-xs text-themeTealLighter truncate">{insight.teaser}</p>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm text-themeTeal">
                    {insight.InsightSector?.name || '-'}
                  </td>
                  <td className="px-4 py-3 text-sm text-themeTeal">
                    {insight.InsightTopic?.name || '-'}
                  </td>
                  <td className="px-4 py-3 text-sm text-themeTeal">
                    {insight.InsightTheme?.name || '-'}
                  </td>
                  <td className="px-4 py-3">
                    {insight.is_featured ? (
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        Featured
                      </span>
                    ) : (
                      <span className="text-themeTealLighter">-</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-sm text-themeTealLighter">
                    {formatDate(insight.updated_at)}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleView(insight)}
                        className="p-1 text-blue-500 hover:text-blue-700 transition-colors"
                        title="View"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleEdit(insight)}
                        className="p-1 text-themeTeal hover:text-themeSkyBlue transition-colors"
                        title="Edit"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteInsight(insight.id)}
                        className="p-1 text-red-500 hover:text-red-700 transition-colors"
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {filteredInsights.length === 0 && (
          <div className="text-center py-8 text-themeTealLighter">
            No market insights found
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold text-themeTeal mb-4">
              {isViewMode ? 'View Market Insight' : editingInsight ? 'Edit Market Insight' : 'Add Market Insight'}
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-themeTeal mb-1">Slug *</label>
                <input
                  type="text"
                  value={formData.slug}
                  onChange={(e) => setFormData({...formData, slug: e.target.value})}
                  className="w-full px-3 py-2 border border-themeTealLighter rounded-lg focus:outline-none focus:ring-2 focus:ring-themeTeal"
                  disabled={isViewMode}
                  placeholder="market-insight-slug"
                  readOnly={isViewMode}
                />
              </div>
              
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="is_featured"
                  checked={formData.is_featured}
                  onChange={(e) => setFormData({...formData, is_featured: e.target.checked})}
                  className="rounded border-themeTealLighter"
                  disabled={isViewMode}
                />
                <label htmlFor="is_featured" className="text-sm font-medium text-themeTeal">Featured</label>
              </div>
              
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-themeTeal mb-1">Title *</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({...formData, title: e.target.value})}
                  className="w-full px-3 py-2 border border-themeTealLighter rounded-lg focus:outline-none focus:ring-2 focus:ring-themeTeal"
                  disabled={isViewMode}
                  placeholder="Market Insight Title"
                  readOnly={isViewMode}
                />
              </div>
              
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-themeTeal mb-1">
                  Blog Image <span className="text-red-500">*</span>
                </label>
                
                {isViewMode ? (
                  /* View Mode - Show existing image */
                  formData.blog_image ? (
                    <div className="mt-1">
                      <Image
                        src={formData.blog_image}
                        alt="Blog Image"
                        width={200}
                        height={200}
                        className="rounded-lg border border-gray-200 object-cover"
                      />
                    </div>
                  ) : (
                    <div className="mt-1 text-themeTealLighter text-sm">No image uploaded</div>
                  )
                ) : (
                  /* Edit Mode - Show upload interface */
                  <>
                    {/* Error Message */}
                    {imageUpload.error && (
                      <div className="mb-2 p-2 bg-red-50 border border-red-200 rounded-md">
                        <p className="text-xs text-red-600">{imageUpload.error}</p>
                      </div>
                    )}
                    
                    {/* Upload Area */}
                    <label 
                      htmlFor="blog-image-upload"
                      className={`mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-dashed border-themeTealLighter rounded transition-colors duration-200 cursor-pointer ${
                        imageUpload.error 
                          ? 'border-red-300 bg-red-50' 
                          : imageUpload.preview 
                            ? 'border-green-300 bg-green-50' 
                            : 'border-gray-300 hover:border-themeTealLighter hover:bg-themeTealWhite'
                      }`}
                      onDragOver={handleDragOver}
                      onDragEnter={handleDragEnter}
                      onDragLeave={handleDragLeave}
                      onDrop={handleDrop}
                    >
                      {imageUpload.preview ? (
                        /* Image Preview */
                        <div className="space-y-3 text-center">
                          <div className="relative inline-block">
                            <Image
                              src={imageUpload.preview}
                              alt="Blog Image Preview"
                              width={120}
                              height={120}
                              className="rounded-lg border border-gray-200 object-cover"
                            />
                            <button
                              type="button"
                              onClick={(e) => {
                                e.preventDefault();
                                removeImage();
                              }}
                              className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                          <div>
                            <p className="text-green-600 font-medium text-sm">✓ Image uploaded successfully</p>
                            <p className="text-gray-500 text-xs">
                              {imageUpload.file?.name}
                            </p>
                          </div>
                        </div>
                      ) : (
                        /* Upload Prompt */
                        <div className="space-y-3 text-center">
                          <div className="mx-auto w-12 h-12 text-themeTealLighter">
                            <Upload className="w-full h-full" />
                          </div>
                          <div>
                            <p className="text-sm text-themeTeal">
                              <span className="font-medium">Click to upload</span> or drag and drop
                            </p>
                            <p className="text-xs text-themeTealLighter">
                              PNG, JPG, GIF up to 5MB
                            </p>
                          </div>
                        </div>
                      )}
                    </label>
                    
                    <input
                      id="blog-image-upload"
                      type="file"
                      accept="image/*"
                      onChange={handleFileChange}
                      className="hidden"
                    />
                  </>
                )}
              </div>
              
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-themeTeal mb-1">Teaser *</label>
                <textarea
                  value={formData.teaser}
                  onChange={(e) => setFormData({...formData, teaser: e.target.value})}
                  className="w-full px-3 py-2 border border-themeTealLighter rounded-lg focus:outline-none focus:ring-2 focus:ring-themeTeal"
                  disabled={isViewMode}
                  rows={2}
                  placeholder="Brief teaser text"
                  readOnly={isViewMode}
                />
              </div>
              
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-themeTeal mb-1">Summary *</label>
                <textarea
                  value={formData.summary}
                  onChange={(e) => setFormData({...formData, summary: e.target.value})}
                  className="w-full px-3 py-2 border border-themeTealLighter rounded-lg focus:outline-none focus:ring-2 focus:ring-themeTeal"
                  disabled={isViewMode}
                  rows={3}
                  placeholder="Summary of the insight"
                  readOnly={isViewMode}
                />
              </div>
              
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-themeTeal mb-1">First Part *</label>
                <textarea
                  value={formData.first_part}
                  onChange={(e) => setFormData({...formData, first_part: e.target.value})}
                  className="w-full px-3 py-2 border border-themeTealLighter rounded-lg focus:outline-none focus:ring-2 focus:ring-themeTeal"
                  disabled={isViewMode}
                  rows={4}
                  placeholder="First part of the content"
                  readOnly={isViewMode}
                />
              </div>
              
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-themeTeal mb-1">Second Part *</label>
                <textarea
                  value={formData.second_part}
                  onChange={(e) => setFormData({...formData, second_part: e.target.value})}
                  className="w-full px-3 py-2 border border-themeTealLighter rounded-lg focus:outline-none focus:ring-2 focus:ring-themeTeal"
                  disabled={isViewMode}
                  rows={4}
                  placeholder="Second part of the content"
                  readOnly={isViewMode}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-themeTeal mb-1">Sector</label>
                <select
                  value={formData.insight_sector_id}
                  onChange={(e) => setFormData({...formData, insight_sector_id: e.target.value})}
                  className="w-full px-3 py-2 border border-themeTealLighter rounded-lg focus:outline-none focus:ring-2 focus:ring-themeTeal"
                  disabled={isViewMode}
                  disabled={isViewMode}
                >
                  <option value="">Select Sector</option>
                  {insightSectors.map(sector => (
                    <option key={sector.id} value={sector.id.toString()}>{sector.name}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-themeTeal mb-1">Subsector</label>
                <select
                  value={formData.insight_subsector_id}
                  onChange={(e) => setFormData({...formData, insight_subsector_id: e.target.value})}
                  className="w-full px-3 py-2 border border-themeTealLighter rounded-lg focus:outline-none focus:ring-2 focus:ring-themeTeal"
                  disabled={isViewMode}
                >
                  <option value="">Select Subsector</option>
                  {insightSubsectors
                    .filter(sub => sub.insight_sector_id.toString() === formData.insight_sector_id)
                    .map(subsector => (
                      <option key={subsector.id} value={subsector.id.toString()}>{subsector.name}</option>
                    ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-themeTeal mb-1">Topic</label>
                <select
                  value={formData.insight_topic_id}
                  onChange={(e) => setFormData({...formData, insight_topic_id: e.target.value})}
                  className="w-full px-3 py-2 border border-themeTealLighter rounded-lg focus:outline-none focus:ring-2 focus:ring-themeTeal"
                  disabled={isViewMode}
                >
                  <option value="">Select Topic</option>
                  {insightTopics.map(topic => (
                    <option key={topic.id} value={topic.id.toString()}>{topic.name}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-themeTeal mb-1">Subtopic</label>
                <select
                  value={formData.insight_subtopic_id}
                  onChange={(e) => setFormData({...formData, insight_subtopic_id: e.target.value})}
                  className="w-full px-3 py-2 border border-themeTealLighter rounded-lg focus:outline-none focus:ring-2 focus:ring-themeTeal"
                  disabled={isViewMode}
                >
                  <option value="">Select Subtopic</option>
                  {insightSubtopics
                    .filter(sub => sub.insight_topic_id.toString() === formData.insight_topic_id)
                    .map(subtopic => (
                      <option key={subtopic.id} value={subtopic.id.toString()}>{subtopic.name}</option>
                    ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-themeTeal mb-1">Theme</label>
                <select
                  value={formData.insight_theme_id}
                  onChange={(e) => setFormData({...formData, insight_theme_id: e.target.value})}
                  className="w-full px-3 py-2 border border-themeTealLighter rounded-lg focus:outline-none focus:ring-2 focus:ring-themeTeal"
                  disabled={isViewMode}
                >
                  <option value="">Select Theme</option>
                  {insightThemes.map(theme => (
                    <option key={theme.id} value={theme.id.toString()}>{theme.name}</option>
                  ))}
                </select>
              </div>
              
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-themeTeal mb-1">Companies</label>
                <div className="max-h-32 overflow-y-auto border border-themeTealLighter rounded-lg p-2">
                  {(products || []).map(product => (
                    <label key={product.id} className="flex items-center gap-2 p-1 hover:bg-themeTealWhite rounded">
                      <input
                        type="checkbox"
                        checked={formData.company_ids.includes(product.id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setFormData({...formData, company_ids: [...formData.company_ids, product.id]});
                          } else {
                            setFormData({...formData, company_ids: formData.company_ids.filter(id => id !== product.id)});
                          }
                        }}
                        className="rounded border-themeTealLighter"
                      />
                      <span className="text-sm text-themeTeal">{product.company_name}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
            
            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => {
                  setShowModal(false);
                  setEditingInsight(null);
                  resetForm();
                }}
                className="px-4 py-2 text-themeTeal border border-themeTeal rounded-lg hover:bg-themeTealWhite transition-colors"
              >
                {isViewMode ? 'Close' : 'Cancel'}
              </button>
              {!isViewMode && (
                <button
                  onClick={editingInsight ? handleUpdateInsight : handleCreateInsight}
                  className="px-4 py-2 bg-themeTeal text-white rounded-lg hover:bg-themeSkyBlue transition-colors"
                >
                  {editingInsight ? 'Update' : 'Create'}
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Separate Taxonomy Management Modals */}
      <InsightTaxonomyModal
        isOpen={showSectorModal}
        onClose={() => {
          setShowSectorModal(false);
          fetchTaxonomies(); // Refresh taxonomy data when modal closes
        }}
        type="sectors"
      />

      <InsightTaxonomyModal
        isOpen={showTopicModal}
        onClose={() => {
          setShowTopicModal(false);
          fetchTaxonomies(); // Refresh taxonomy data when modal closes
        }}
        type="topics"
      />

      <InsightTaxonomyModal
        isOpen={showThemeModal}
        onClose={() => {
          setShowThemeModal(false);
          fetchTaxonomies(); // Refresh taxonomy data when modal closes
        }}
        type="themes"
      />
    </div>
  );
}
