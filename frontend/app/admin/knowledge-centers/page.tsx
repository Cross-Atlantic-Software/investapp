"use client";

import { useState, useEffect } from "react";
import { Plus, Search, Edit, Trash2, Eye, Tag, Building2, Palette, Upload, X } from "lucide-react";
import ManageDropdown from "@/components/admin/ManageDropdown";
import InsightTaxonomyModal from "@/components/admin/InsightTaxonomyModal";
import { NotificationContainer, NotificationData } from "@/components/admin/shared/Notification";
import Image from "next/image";

interface KnowledgeCenter {
  id: number;
  slug: string;
  is_featured: boolean;
  title: string;
  blog_image: string;
  teaser: string;
  summary: string;
  content_type: 'TEXT' | 'VIDEO';
  first_part?: string;
  second_part?: string;
  video_file?: string;
  knowledge_sector_id?: number;
  knowledge_subsector_ids?: string; // JSON string of array
  knowledge_topic_id?: number;
  knowledge_subtopic_ids?: string; // JSON string of array
  knowledge_theme_id?: number;
  company_ids?: string; // JSON string of array
  KnowledgeSector?: { id: number; name: string };
  KnowledgeTopic?: { id: number; name: string };
  KnowledgeTheme?: { id: number; name: string };
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

interface VideoUploadState {
  file: File | null;
  preview: string | null;
  uploading: boolean;
  progress: number;
  error: string | null;
}

interface KnowledgeSector {
  id: number;
  name: string;
  is_active: boolean;
}

interface KnowledgeSubsector {
  id: number;
  name: string;
  knowledge_sector_id: number;
  is_active: boolean;
}

interface KnowledgeTopic {
  id: number;
  name: string;
  is_active: boolean;
}

interface KnowledgeSubtopic {
  id: number;
  name: string;
  knowledge_topic_id: number;
  is_active: boolean;
}

interface KnowledgeTheme {
  id: number;
  name: string;
  is_active: boolean;
}

interface Product {
  id: number;
  company_name: string;
}

export default function KnowledgeCentersPage() {
  const [knowledgeCenters, setKnowledgeCenters] = useState<KnowledgeCenter[]>([]);
  const [knowledgeSectors, setKnowledgeSectors] = useState<KnowledgeSector[]>([]);
  const [knowledgeSubsectors, setKnowledgeSubsectors] = useState<KnowledgeSubsector[]>([]);
  const [knowledgeTopics, setKnowledgeTopics] = useState<KnowledgeTopic[]>([]);
  const [knowledgeSubtopics, setKnowledgeSubtopics] = useState<KnowledgeSubtopic[]>([]);
  const [knowledgeThemes, setKnowledgeThemes] = useState<KnowledgeTheme[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [notifications, setNotifications] = useState<NotificationData[]>([]);
  
  const [showModal, setShowModal] = useState(false);
  const [editingKnowledgeCenter, setEditingKnowledgeCenter] = useState<KnowledgeCenter | null>(null);
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
    content_type: "TEXT" as 'TEXT' | 'VIDEO',
    first_part: "",
    second_part: "",
    video_file: "",
    knowledge_sector_id: "",
    knowledge_subsector_ids: [] as number[],
    knowledge_topic_id: "",
    knowledge_subtopic_ids: [] as number[],
    knowledge_theme_id: "",
    company_ids: [] as number[]
  });

  const [imageUpload, setImageUpload] = useState<ImageUploadState>({
    file: null,
    preview: null,
    uploading: false,
    progress: 0,
    error: null,
  });

  const [videoUpload, setVideoUpload] = useState<VideoUploadState>({
    file: null,
    preview: null,
    uploading: false,
    progress: 0,
    error: null,
  });

  const [companySearchTerm, setCompanySearchTerm] = useState("");
  const [showCompanyDropdown, setShowCompanyDropdown] = useState(false);

  // Load initial data
  useEffect(() => {
    const loadInitialData = async () => {
      setLoading(true);
      try {
        await Promise.all([
          fetchKnowledgeCenters(),
          fetchTaxonomies(),
          fetchProducts()
        ]);
      } catch (error) {
        console.error('Error loading initial data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadInitialData();
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (showCompanyDropdown && !(event.target as Element).closest('.company-dropdown')) {
        setShowCompanyDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showCompanyDropdown]);

  // Notification helper functions
  const addNotification = (notification: Omit<NotificationData, 'id'>) => {
    const id = Date.now().toString();
    setNotifications(prev => [...prev, { ...notification, id }]);
  };

  const removeNotification = (id: string) => {
    setNotifications(prev => prev.filter(notification => notification.id !== id));
  };

  const fetchKnowledgeCenters = async () => {
    try {
      const token = sessionStorage.getItem('adminToken') || '';
      const response = await fetch('/api/admin/knowledge-centers', {
        headers: { 'token': token }
      });
      const data = await response.json();
      if (data.success) {
        setKnowledgeCenters(data.data);
      }
    } catch (error) {
      console.error('Error fetching knowledge centers:', error);
    }
  };

  const fetchTaxonomies = async () => {
    try {
      const token = sessionStorage.getItem('adminToken') || '';
      const [sectorsRes, subsectorsRes, topicsRes, subtopicsRes, themesRes] = await Promise.all([
        fetch('/api/admin/knowledge-sectors', { headers: { 'token': token } }),
        fetch('/api/admin/knowledge-subsectors', { headers: { 'token': token } }),
        fetch('/api/admin/knowledge-topics', { headers: { 'token': token } }),
        fetch('/api/admin/knowledge-subtopics', { headers: { 'token': token } }),
        fetch('/api/admin/knowledge-themes', { headers: { 'token': token } })
      ]);

      const [sectorsData, subsectorsData, topicsData, subtopicsData, themesData] = await Promise.all([
        sectorsRes.json(),
        subsectorsRes.json(),
        topicsRes.json(),
        subtopicsRes.json(),
        themesRes.json()
      ]);

      if (sectorsData.success) setKnowledgeSectors(sectorsData.data);
      if (subsectorsData.success) setKnowledgeSubsectors(subsectorsData.data);
      if (topicsData.success) setKnowledgeTopics(topicsData.data);
      if (subtopicsData.success) setKnowledgeSubtopics(subtopicsData.data);
      if (themesData.success) setKnowledgeThemes(themesData.data);
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

  const handleCreateKnowledgeCenter = async () => {
    try {
      const token = sessionStorage.getItem('adminToken') || '';
      
      // Create FormData for file upload
      const formDataToSend = new FormData();
      formDataToSend.append('slug', formData.slug);
      formDataToSend.append('is_featured', formData.is_featured.toString());
      formDataToSend.append('title', formData.title);
      formDataToSend.append('teaser', formData.teaser);
      formDataToSend.append('summary', formData.summary);
      formDataToSend.append('content_type', formData.content_type);
      
      // Add content-specific fields
      if (formData.content_type === 'TEXT') {
        formDataToSend.append('first_part', formData.first_part);
        formDataToSend.append('second_part', formData.second_part);
      }
      
      formDataToSend.append('knowledge_sector_id', formData.knowledge_sector_id);
      formDataToSend.append('knowledge_subsector_ids', JSON.stringify(formData.knowledge_subsector_ids));
      formDataToSend.append('knowledge_topic_id', formData.knowledge_topic_id);
      formDataToSend.append('knowledge_subtopic_ids', JSON.stringify(formData.knowledge_subtopic_ids));
      formDataToSend.append('knowledge_theme_id', formData.knowledge_theme_id);
      formDataToSend.append('company_ids', JSON.stringify(formData.company_ids));
      
      // Add file uploads
      if (imageUpload.file) {
        formDataToSend.append('blog_image', imageUpload.file);
      }
      if (formData.content_type === 'VIDEO' && videoUpload.file) {
        formDataToSend.append('video_file', videoUpload.file);
      }

      const response = await fetch('/api/admin/knowledge-centers', {
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
        fetchKnowledgeCenters();
        addNotification({
          type: 'success',
          title: 'Success',
          message: 'Knowledge center created successfully!',
          duration: 5000
        });
      } else {
        addNotification({
          type: 'error',
          title: 'Error',
          message: data.message || 'Failed to create knowledge center',
          duration: 5000
        });
      }
    } catch (error) {
      console.error('Error creating knowledge center:', error);
      alert('Failed to create knowledge center');
    }
  };

  const handleUpdateKnowledgeCenter = async () => {
    if (!editingKnowledgeCenter) return;
    
    try {
      const token = sessionStorage.getItem('adminToken') || '';
      
      // Create FormData for file upload
      const formDataToSend = new FormData();
      formDataToSend.append('slug', formData.slug);
      formDataToSend.append('is_featured', formData.is_featured.toString());
      formDataToSend.append('title', formData.title);
      formDataToSend.append('teaser', formData.teaser);
      formDataToSend.append('summary', formData.summary);
      formDataToSend.append('content_type', formData.content_type);
      
      // Add content-specific fields
      if (formData.content_type === 'TEXT') {
        formDataToSend.append('first_part', formData.first_part);
        formDataToSend.append('second_part', formData.second_part);
      }
      
      formDataToSend.append('knowledge_sector_id', formData.knowledge_sector_id);
      formDataToSend.append('knowledge_subsector_ids', JSON.stringify(formData.knowledge_subsector_ids));
      formDataToSend.append('knowledge_topic_id', formData.knowledge_topic_id);
      formDataToSend.append('knowledge_subtopic_ids', JSON.stringify(formData.knowledge_subtopic_ids));
      formDataToSend.append('knowledge_theme_id', formData.knowledge_theme_id);
      formDataToSend.append('company_ids', JSON.stringify(formData.company_ids));
      
      // Add file uploads
      if (imageUpload.file) {
        formDataToSend.append('blog_image', imageUpload.file);
      }
      if (formData.content_type === 'VIDEO' && videoUpload.file) {
        formDataToSend.append('video_file', videoUpload.file);
      }

      const response = await fetch(`/api/admin/knowledge-centers/${editingKnowledgeCenter.id}`, {
        method: 'PUT',
        headers: { 
          'token': token
        },
        body: formDataToSend
      });
      
      const data = await response.json();
      if (data.success) {
        setShowModal(false);
        setEditingKnowledgeCenter(null);
        resetForm();
        fetchKnowledgeCenters();
        addNotification({
          type: 'success',
          title: 'Success',
          message: 'Knowledge center updated successfully!',
          duration: 5000
        });
      } else {
        addNotification({
          type: 'error',
          title: 'Error',
          message: data.message || 'Failed to update knowledge center',
          duration: 5000
        });
      }
    } catch (error) {
      console.error('Error updating knowledge center:', error);
      alert('Failed to update knowledge center');
    }
  };

  const handleDeleteKnowledgeCenter = async (id: number) => {
    if (!confirm('Are you sure you want to delete this knowledge center?')) return;
    
    try {
      const token = sessionStorage.getItem('adminToken') || '';
      const response = await fetch(`/api/admin/knowledge-centers/${id}`, {
        method: 'DELETE',
        headers: { 'token': token }
      });
      
      const data = await response.json();
      if (data.success) {
        fetchKnowledgeCenters();
        addNotification({
          type: 'success',
          title: 'Success',
          message: 'Knowledge center deleted successfully!',
          duration: 5000
        });
      } else {
        addNotification({
          type: 'error',
          title: 'Error',
          message: data.message || 'Failed to delete knowledge center',
          duration: 5000
        });
      }
    } catch (error) {
      console.error('Error deleting knowledge center:', error);
      alert('Failed to delete knowledge center');
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
      content_type: "TEXT" as 'TEXT' | 'VIDEO',
      first_part: "",
      second_part: "",
      video_file: "",
      knowledge_sector_id: "",
      knowledge_subsector_ids: [],
      knowledge_topic_id: "",
      knowledge_subtopic_ids: [],
      knowledge_theme_id: "",
      company_ids: [] as number[]
    });
    setCompanySearchTerm("");
    setShowCompanyDropdown(false);
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
      } as unknown as React.ChangeEvent<HTMLInputElement>;
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

  // Video upload handlers
  const handleVideoFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      if (file.type !== 'video/mp4') {
        setVideoUpload(prev => ({
          ...prev,
          error: 'Please select an MP4 video file'
        }));
        return;
      }

      // Validate file size (100MB limit)
      if (file.size > 100 * 1024 * 1024) {
        setVideoUpload(prev => ({
          ...prev,
          error: 'File size must be less than 100MB'
        }));
        return;
      }

      const preview = URL.createObjectURL(file);
      setVideoUpload({
        file,
        preview,
        uploading: false,
        progress: 0,
        error: null,
      });
    }
  };

  const handleVideoDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleVideoDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleVideoDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleVideoDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file) {
      const inputEvent = {
        target: { files: [file] }
      } as unknown as React.ChangeEvent<HTMLInputElement>;
      handleVideoFileChange(inputEvent);
    }
  };

  const removeVideo = () => {
    if (videoUpload.preview) {
      URL.revokeObjectURL(videoUpload.preview);
    }
    setVideoUpload({
      file: null,
      preview: null,
      uploading: false,
      progress: 0,
      error: null,
    });
  };

  const handleView = (knowledgeCenter: KnowledgeCenter) => {
    setEditingKnowledgeCenter(knowledgeCenter);
    setIsViewMode(true);
    setFormData({
      slug: knowledgeCenter.slug,
      is_featured: knowledgeCenter.is_featured,
      title: knowledgeCenter.title,
      blog_image: knowledgeCenter.blog_image,
      teaser: knowledgeCenter.teaser,
      summary: knowledgeCenter.summary,
      content_type: knowledgeCenter.content_type,
      first_part: knowledgeCenter.first_part || "",
      second_part: knowledgeCenter.second_part || "",
      video_file: knowledgeCenter.video_file || "",
      knowledge_sector_id: knowledgeCenter.knowledge_sector_id?.toString() || "",
      knowledge_subsector_ids: knowledgeCenter.knowledge_subsector_ids ? JSON.parse(knowledgeCenter.knowledge_subsector_ids) : [],
      knowledge_topic_id: knowledgeCenter.knowledge_topic_id?.toString() || "",
      knowledge_subtopic_ids: knowledgeCenter.knowledge_subtopic_ids ? JSON.parse(knowledgeCenter.knowledge_subtopic_ids) : [],
      knowledge_theme_id: knowledgeCenter.knowledge_theme_id?.toString() || "",
      company_ids: knowledgeCenter.company_ids ? JSON.parse(knowledgeCenter.company_ids) : []
    });
    setShowModal(true);
  };

  const handleEdit = (knowledgeCenter: KnowledgeCenter) => {
    setEditingKnowledgeCenter(knowledgeCenter);
    setIsViewMode(false);
    setFormData({
      slug: knowledgeCenter.slug,
      is_featured: knowledgeCenter.is_featured,
      title: knowledgeCenter.title,
      blog_image: knowledgeCenter.blog_image,
      teaser: knowledgeCenter.teaser,
      summary: knowledgeCenter.summary,
      content_type: knowledgeCenter.content_type,
      first_part: knowledgeCenter.first_part || "",
      second_part: knowledgeCenter.second_part || "",
      video_file: knowledgeCenter.video_file || "",
      knowledge_sector_id: knowledgeCenter.knowledge_sector_id?.toString() || "",
      knowledge_subsector_ids: knowledgeCenter.knowledge_subsector_ids ? JSON.parse(knowledgeCenter.knowledge_subsector_ids) : [],
      knowledge_topic_id: knowledgeCenter.knowledge_topic_id?.toString() || "",
      knowledge_subtopic_ids: knowledgeCenter.knowledge_subtopic_ids ? JSON.parse(knowledgeCenter.knowledge_subtopic_ids) : [],
      knowledge_theme_id: knowledgeCenter.knowledge_theme_id?.toString() || "",
      company_ids: knowledgeCenter.company_ids ? JSON.parse(knowledgeCenter.company_ids) : []
    });
    setShowModal(true);
  };

  const filteredKnowledgeCenters = knowledgeCenters.filter(knowledgeCenter => {
    const matchesSearch = knowledgeCenter.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         knowledgeCenter.teaser.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesSearch;
  });

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-themeTeal mx-auto mb-4"></div>
          <p className="text-themeTealLighter">Loading knowledge centers...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-themeTeal">Knowledge Centers</h1>
          <p className="text-themeTealLighter">Manage knowledge centers and content</p>
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
              setEditingKnowledgeCenter(null);
              setShowModal(true);
            }}
            className="flex items-center gap-2 bg-themeTeal text-white px-4 py-2 rounded-lg hover:bg-themeSkyBlue transition-colors"
          >
            <Plus className="w-4 h-4" />
            Add Knowledge Center
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg shadow-sm border">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-1 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-themeTealLighter w-4 h-4" />
            <input
              type="text"
              placeholder="Search knowledge centers..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-3 py-2 border border-themeTealLighter rounded-lg focus:outline-none focus:ring-2 focus:ring-themeTeal"
            />
          </div>
        </div>
      </div>

      {/* Knowledge Centers Table */}
      <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-themeTealWhite">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-medium text-themeTeal">Title</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-themeTeal">Content Type</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-themeTeal">Sector</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-themeTeal">Topic</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-themeTeal">Theme</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-themeTeal">Featured</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-themeTeal">Updated</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-themeTeal">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-themeTealLighter">
              {filteredKnowledgeCenters.map((knowledgeCenter) => (
                <tr key={knowledgeCenter.id} className="hover:bg-themeTealWhite/50">
                  <td className="px-4 py-3">
                    <div className="max-w-xs">
                      <p className="text-sm font-medium text-themeTeal truncate">{knowledgeCenter.title}</p>
                      <p className="text-xs text-themeTealLighter truncate">{knowledgeCenter.teaser}</p>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm text-themeTeal">
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                      knowledgeCenter.content_type === 'TEXT' 
                        ? 'bg-blue-100 text-blue-800' 
                        : 'bg-purple-100 text-purple-800'
                    }`}>
                      {knowledgeCenter.content_type}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-themeTeal">
                    {knowledgeCenter.KnowledgeSector?.name || '-'}
                  </td>
                  <td className="px-4 py-3 text-sm text-themeTeal">
                    {knowledgeCenter.KnowledgeTopic?.name || '-'}
                  </td>
                  <td className="px-4 py-3 text-sm text-themeTeal">
                    {knowledgeCenter.KnowledgeTheme?.name || '-'}
                  </td>
                  <td className="px-4 py-3">
                    {knowledgeCenter.is_featured ? (
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        Featured
                      </span>
                    ) : (
                      <span className="text-themeTealLighter">-</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-sm text-themeTealLighter">
                    {formatDate(knowledgeCenter.updated_at)}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleView(knowledgeCenter)}
                        className="p-1 text-blue-500 hover:text-blue-700 transition-colors"
                        title="View"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleEdit(knowledgeCenter)}
                        className="p-1 text-themeTeal hover:text-themeSkyBlue transition-colors"
                        title="Edit"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteKnowledgeCenter(knowledgeCenter.id)}
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
        
        {filteredKnowledgeCenters.length === 0 && (
          <div className="text-center py-8 text-themeTealLighter">
            No knowledge centers found
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto relative">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-themeTeal">
                {isViewMode ? 'View Knowledge Center' : editingKnowledgeCenter ? 'Edit Knowledge Center' : 'Add Knowledge Center'}
              </h2>
              <button
                onClick={() => {
                  setShowModal(false);
                  setEditingKnowledgeCenter(null);
                  resetForm();
                }}
                className="text-themeTealLighter hover:text-themeTeal transition-colors"
                title="Close"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-themeTeal mb-1">Slug *</label>
                <input
                  type="text"
                  value={formData.slug}
                  onChange={(e) => setFormData({...formData, slug: e.target.value})}
                  className="w-full px-3 py-2 border border-themeTealLighter rounded-lg focus:outline-none focus:ring-2 focus:ring-themeTeal"
                  disabled={isViewMode}
                  placeholder="knowledge-center-slug"
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
                <label className="block text-sm font-medium text-themeTeal mb-2">Content Type *</label>
                <div className="flex gap-4">
                  <label className="flex items-center gap-2">
                    <input
                      type="radio"
                      name="content_type"
                      value="TEXT"
                      checked={formData.content_type === 'TEXT'}
                      onChange={(e) => setFormData({...formData, content_type: e.target.value as 'TEXT' | 'VIDEO'})}
                      className="text-themeTeal"
                      disabled={isViewMode}
                    />
                    <span className="text-sm text-themeTeal">Text Content</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input
                      type="radio"
                      name="content_type"
                      value="VIDEO"
                      checked={formData.content_type === 'VIDEO'}
                      onChange={(e) => setFormData({...formData, content_type: e.target.value as 'TEXT' | 'VIDEO'})}
                      className="text-themeTeal"
                      disabled={isViewMode}
                    />
                    <span className="text-sm text-themeTeal">Video Content</span>
                  </label>
                </div>
              </div>
              
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-themeTeal mb-1">Title *</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({...formData, title: e.target.value})}
                  className="w-full px-3 py-2 border border-themeTealLighter rounded-lg focus:outline-none focus:ring-2 focus:ring-themeTeal"
                  disabled={isViewMode}
                  placeholder="Knowledge Center Title"
                  readOnly={isViewMode}
                />
              </div>
              
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-themeTeal mb-1">
                  Blog Image <span className="text-red-500">*</span>
                </label>
                
                {isViewMode ? (
                  /* View Mode - Show existing blog image */
                  formData.blog_image && formData.blog_image.trim() !== '' ? (
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
                  placeholder="Summary of the knowledge center"
                  readOnly={isViewMode}
                />
              </div>
              
              {/* Text Content Fields - Only show when content_type is TEXT */}
              {formData.content_type === 'TEXT' && (
                <>
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
                </>
              )}

              {/* Video Content Field - Only show when content_type is VIDEO */}
              {formData.content_type === 'VIDEO' && (
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-themeTeal mb-1">
                    Video File <span className="text-red-500">*</span>
                  </label>
                  
                  {isViewMode ? (
                    /* View Mode - Show existing video */
                    formData.video_file ? (
                      <div className="mt-1">
                        <video
                          src={formData.video_file}
                          controls
                          className="w-full max-w-md rounded-lg border border-gray-200"
                        >
                          Your browser does not support the video tag.
                        </video>
                      </div>
                    ) : (
                      <div className="mt-1 text-themeTealLighter text-sm">No video uploaded</div>
                    )
                  ) : (
                    /* Edit Mode - Show upload interface */
                    <>
                      {/* Error Message */}
                      {videoUpload.error && (
                        <div className="mb-2 p-2 bg-red-50 border border-red-200 rounded-md">
                          <p className="text-xs text-red-600">{videoUpload.error}</p>
                        </div>
                      )}
                      
                      {/* Upload Area */}
                      <label 
                        htmlFor="video-upload"
                        className={`mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-dashed border-themeTealLighter rounded transition-colors duration-200 cursor-pointer ${
                          videoUpload.error 
                            ? 'border-red-300 bg-red-50' 
                            : videoUpload.preview 
                              ? 'border-green-300 bg-green-50' 
                              : 'border-gray-300 hover:border-themeTealLighter hover:bg-themeTealWhite'
                        }`}
                        onDragOver={handleVideoDragOver}
                        onDragEnter={handleVideoDragEnter}
                        onDragLeave={handleVideoDragLeave}
                        onDrop={handleVideoDrop}
                      >
                        {videoUpload.preview ? (
                          /* Video Preview */
                          <div className="space-y-3 text-center">
                            <div className="relative inline-block">
                              <video
                                src={videoUpload.preview}
                                controls
                                className="w-64 h-36 rounded-lg border border-gray-200 object-cover"
                              >
                                Your browser does not support the video tag.
                              </video>
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.preventDefault();
                                  removeVideo();
                                }}
                                className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
                              >
                                <X className="w-4 h-4" />
                              </button>
                            </div>
                            <div>
                              <p className="text-green-600 font-medium text-sm">✓ Video uploaded successfully</p>
                              <p className="text-gray-500 text-xs">
                                {videoUpload.file?.name}
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
                                MP4 video files up to 100MB
                              </p>
                            </div>
                          </div>
                        )}
                      </label>
                      
                      <input
                        id="video-upload"
                        type="file"
                        accept="video/mp4"
                        onChange={handleVideoFileChange}
                        className="hidden"
                      />
                    </>
                  )}
                </div>
              )}
              
              <div>
                <label className="block text-sm font-medium text-themeTeal mb-1">Sector</label>
                <select
                  value={formData.knowledge_sector_id}
                  onChange={(e) => setFormData({...formData, knowledge_sector_id: e.target.value, knowledge_subsector_ids: []})}
                  className="w-full px-3 py-2 border border-themeTealLighter rounded-lg focus:outline-none focus:ring-2 focus:ring-themeTeal"
                  disabled={isViewMode}
                >
                  <option value="">Select Sector</option>
                  {knowledgeSectors.map(sector => (
                    <option key={sector.id} value={sector.id.toString()}>{sector.name}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-themeTeal mb-1">Subsectors</label>
                {isViewMode ? (
                  /* View Mode - Show selected subsectors as read-only list */
                  <div className="max-h-32 overflow-y-auto border border-themeTealLighter rounded-lg p-2">
                    {formData.knowledge_subsector_ids.length > 0 ? (
                      formData.knowledge_subsector_ids.map(subsectorId => {
                        const subsector = knowledgeSubsectors.find(s => s.id === subsectorId);
                        return subsector ? (
                          <div key={subsector.id} className="flex items-center gap-2 p-1 bg-themeTealWhite rounded">
                            <span className="text-sm text-themeTeal">{subsector.name}</span>
                          </div>
                        ) : null;
                      })
                    ) : (
                      <div className="text-sm text-themeTealLighter p-2">No subsectors selected</div>
                    )}
                  </div>
                ) : (
                  /* Edit Mode - Show checkboxes */
                  <div className="max-h-32 overflow-y-auto border border-themeTealLighter rounded-lg p-2">
                    {knowledgeSubsectors
                      .filter(sub => formData.knowledge_sector_id && sub.knowledge_sector_id.toString() === formData.knowledge_sector_id)
                      .map(subsector => (
                        <label key={subsector.id} className="flex items-center gap-2 p-1 hover:bg-themeTealWhite rounded">
                          <input
                            type="checkbox"
                            checked={formData.knowledge_subsector_ids.includes(subsector.id)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setFormData({...formData, knowledge_subsector_ids: [...formData.knowledge_subsector_ids, subsector.id]});
                              } else {
                                setFormData({...formData, knowledge_subsector_ids: formData.knowledge_subsector_ids.filter(id => id !== subsector.id)});
                              }
                            }}
                            className="rounded border-themeTealLighter"
                          />
                          <span className="text-sm text-themeTeal">{subsector.name}</span>
                        </label>
                      ))}
                    {formData.knowledge_sector_id && knowledgeSubsectors.filter(sub => sub.knowledge_sector_id.toString() === formData.knowledge_sector_id).length === 0 && (
                      <div className="text-sm text-themeTealLighter p-2">No subsectors available for selected sector</div>
                    )}
                  </div>
                )}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-themeTeal mb-1">Topic</label>
                <select
                  value={formData.knowledge_topic_id}
                  onChange={(e) => setFormData({...formData, knowledge_topic_id: e.target.value, knowledge_subtopic_ids: []})}
                  className="w-full px-3 py-2 border border-themeTealLighter rounded-lg focus:outline-none focus:ring-2 focus:ring-themeTeal"
                  disabled={isViewMode}
                >
                  <option value="">Select Topic</option>
                  {knowledgeTopics.map(topic => (
                    <option key={topic.id} value={topic.id.toString()}>{topic.name}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-themeTeal mb-1">Subtopics</label>
                {isViewMode ? (
                  /* View Mode - Show selected subtopics as read-only list */
                  <div className="max-h-32 overflow-y-auto border border-themeTealLighter rounded-lg p-2">
                    {formData.knowledge_subtopic_ids.length > 0 ? (
                      formData.knowledge_subtopic_ids.map(subtopicId => {
                        const subtopic = knowledgeSubtopics.find(s => s.id === subtopicId);
                        return subtopic ? (
                          <div key={subtopic.id} className="flex items-center gap-2 p-1 bg-themeTealWhite rounded">
                            <span className="text-sm text-themeTeal">{subtopic.name}</span>
                          </div>
                        ) : null;
                      })
                    ) : (
                      <div className="text-sm text-themeTealLighter p-2">No subtopics selected</div>
                    )}
                  </div>
                ) : (
                  /* Edit Mode - Show checkboxes */
                  <div className="max-h-32 overflow-y-auto border border-themeTealLighter rounded-lg p-2">
                    {knowledgeSubtopics
                      .filter(sub => formData.knowledge_topic_id && sub.knowledge_topic_id.toString() === formData.knowledge_topic_id)
                      .map(subtopic => (
                        <label key={subtopic.id} className="flex items-center gap-2 p-1 hover:bg-themeTealWhite rounded">
                          <input
                            type="checkbox"
                            checked={formData.knowledge_subtopic_ids.includes(subtopic.id)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setFormData({...formData, knowledge_subtopic_ids: [...formData.knowledge_subtopic_ids, subtopic.id]});
                              } else {
                                setFormData({...formData, knowledge_subtopic_ids: formData.knowledge_subtopic_ids.filter(id => id !== subtopic.id)});
                              }
                            }}
                            className="rounded border-themeTealLighter"
                          />
                          <span className="text-sm text-themeTeal">{subtopic.name}</span>
                        </label>
                      ))}
                    {formData.knowledge_topic_id && knowledgeSubtopics.filter(sub => sub.knowledge_topic_id.toString() === formData.knowledge_topic_id).length === 0 && (
                      <div className="text-sm text-themeTealLighter p-2">No subtopics available for selected topic</div>
                    )}
                  </div>
                )}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-themeTeal mb-1">Theme</label>
                <select
                  value={formData.knowledge_theme_id}
                  onChange={(e) => setFormData({...formData, knowledge_theme_id: e.target.value})}
                  className="w-full px-3 py-2 border border-themeTealLighter rounded-lg focus:outline-none focus:ring-2 focus:ring-themeTeal"
                  disabled={isViewMode}
                >
                  <option value="">Select Theme</option>
                  {knowledgeThemes.map(theme => (
                    <option key={theme.id} value={theme.id.toString()}>{theme.name}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-themeTeal mb-1">Companies</label>
                {isViewMode ? (
                  /* View Mode - Show selected companies as read-only list */
                  <div className="max-h-32 overflow-y-auto border border-themeTealLighter rounded-lg p-2">
                    {formData.company_ids.length > 0 ? (
                      formData.company_ids.map(companyId => {
                        const company = products.find(p => p.id === companyId);
                        return company ? (
                          <div key={company.id} className="flex items-center gap-2 p-1 bg-themeTealWhite rounded">
                            <span className="text-sm text-themeTeal">{company.company_name}</span>
                          </div>
                        ) : null;
                      })
                    ) : (
                      <div className="text-sm text-themeTealLighter p-2">No companies selected</div>
                    )}
                  </div>
                ) : (
                  /* Edit Mode - Show searchable multiselect dropdown */
                  <div className="relative company-dropdown">
                    {/* Selected companies display */}
                    <div 
                      className="w-full px-3 py-2 border border-themeTealLighter rounded-lg focus:outline-none focus:ring-2 focus:ring-themeTeal cursor-pointer min-h-[40px] flex flex-wrap gap-1 items-center"
                      onClick={() => setShowCompanyDropdown(!showCompanyDropdown)}
                    >
                      {formData.company_ids.length > 0 ? (
                        formData.company_ids.map(companyId => {
                          const company = products.find(p => p.id === companyId);
                          return company ? (
                            <span key={company.id} className="inline-flex items-center gap-1 px-2 py-1 bg-themeTeal text-white text-xs rounded">
                              {company.company_name}
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setFormData({...formData, company_ids: formData.company_ids.filter(id => id !== company.id)});
                                }}
                                className="ml-1 hover:bg-themeTealDark rounded-full w-4 h-4 flex items-center justify-center"
                              >
                                ×
                              </button>
                            </span>
                          ) : null;
                        })
                      ) : (
                        <span className="text-themeTealLighter">Select companies...</span>
                      )}
                    </div>

                    {/* Dropdown */}
                    {showCompanyDropdown && (
                      <div className="absolute z-10 w-full mt-1 bg-white border border-themeTealLighter rounded-lg shadow-lg max-h-60 overflow-hidden">
                        {/* Search input */}
                        <div className="p-2 border-b border-themeTealLighter">
                          <input
                            type="text"
                            placeholder="Search companies..."
                            value={companySearchTerm}
                            onChange={(e) => setCompanySearchTerm(e.target.value)}
                            className="w-full px-2 py-1 border border-themeTealLighter rounded focus:outline-none focus:ring-1 focus:ring-themeTeal text-sm"
                            onClick={(e) => e.stopPropagation()}
                          />
                        </div>

                        {/* Options list */}
                        <div className="max-h-48 overflow-y-auto">
                          {(products || [])
                            .filter(product => 
                              product.company_name.toLowerCase().includes(companySearchTerm.toLowerCase())
                            )
                            .map(product => (
                              <label 
                                key={product.id} 
                                className="flex items-center gap-2 p-2 hover:bg-themeTealWhite cursor-pointer"
                              >
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
                          {((products || []).filter(product => 
                            product.company_name.toLowerCase().includes(companySearchTerm.toLowerCase())
                          )).length === 0 && (
                            <div className="p-2 text-sm text-themeTealLighter text-center">
                              No companies found
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
            
            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => {
                  setShowModal(false);
                  setEditingKnowledgeCenter(null);
                  resetForm();
                }}
                className="px-4 py-2 text-themeTeal border border-themeTeal rounded-lg hover:bg-themeTealWhite transition-colors"
              >
                {isViewMode ? 'Close' : 'Cancel'}
              </button>
              {!isViewMode && (
                <button
                  onClick={editingKnowledgeCenter ? handleUpdateKnowledgeCenter : handleCreateKnowledgeCenter}
                  className="px-4 py-2 bg-themeTeal text-white rounded-lg hover:bg-themeSkyBlue transition-colors"
                >
                  {editingKnowledgeCenter ? 'Update' : 'Create'}
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
        type="knowledge-sectors"
      />

      <InsightTaxonomyModal
        isOpen={showTopicModal}
        onClose={() => {
          setShowTopicModal(false);
          fetchTaxonomies(); // Refresh taxonomy data when modal closes
        }}
        type="knowledge-topics"
      />

      <InsightTaxonomyModal
        isOpen={showThemeModal}
        onClose={() => {
          setShowThemeModal(false);
          fetchTaxonomies(); // Refresh taxonomy data when modal closes
        }}
        type="knowledge-themes"
      />

      {/* Notification Container */}
      <NotificationContainer
        notifications={notifications}
        onRemove={removeNotification}
      />
    </div>
  );
}
