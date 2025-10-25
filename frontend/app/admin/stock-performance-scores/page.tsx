"use client";

import { useEffect, useState } from "react";
import { Plus, Edit, Trash2, Search, X } from "lucide-react";

interface StockPerformanceScore {
  id: number;
  stock_id: number;
  score: string;
  created_at: string;
  updated_at: string;
  stock: {
    id: number;
    company_name: string;
  };
}

interface Product {
  id: number;
  company_name: string;
}

export default function StockPerformanceScoresPage() {
  const [scores, setScores] = useState<StockPerformanceScore[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingScore, setEditingScore] = useState<StockPerformanceScore | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [stockSearchTerm, setStockSearchTerm] = useState("");
  const [showStockDropdown, setShowStockDropdown] = useState(false);
  const [selectedStock, setSelectedStock] = useState<Product | null>(null);
  const [formData, setFormData] = useState({
    stock_id: "",
    score: ""
  });
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  // Fetch data
  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const token = sessionStorage.getItem('adminToken') || '';
      
      const [scoresRes, productsRes] = await Promise.all([
        fetch('/api/admin/stock-performance-scores', {
          headers: { 'token': token }
        }),
        fetch('/api/admin/products', {
          headers: { 'token': token }
        })
      ]);

      const [scoresData, productsData] = await Promise.all([
        scoresRes.json(),
        productsRes.json()
      ]);

      if (scoresData.success) {
        setScores(scoresData.data);
      }
      if (productsData.success) {
        setProducts(productsData.data);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Filter scores based on search term
  const filteredScores = scores.filter(score =>
    score.stock.company_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    score.score.includes(searchTerm)
  );

  // Filter products for dropdown
  const filteredProducts = products.filter(product =>
    product.company_name.toLowerCase().includes(stockSearchTerm.toLowerCase())
  );

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    const newErrors: { [key: string]: string } = {};
    if (!formData.stock_id) newErrors.stock_id = "Please select a stock";
    if (!formData.score) newErrors.score = "Please enter a score";
    
    const scoreNum = parseInt(formData.score);
    if (isNaN(scoreNum) || scoreNum < 1 || scoreNum > 100) {
      newErrors.score = "Score must be between 1 and 100";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    try {
      const token = sessionStorage.getItem('adminToken') || '';
      const url = editingScore 
        ? `/api/admin/stock-performance-scores/${editingScore.id}`
        : '/api/admin/stock-performance-scores';
      
      const method = editingScore ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'token': token
        },
        body: JSON.stringify(formData)
      });

      const data = await response.json();
      
      if (data.success) {
        await fetchData();
        handleCloseModal();
      } else {
        setErrors({ general: data.message });
      }
    } catch (error) {
      console.error('Error saving score:', error);
      setErrors({ general: 'Failed to save score' });
    }
  };

  // Handle delete
  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this performance score?')) {
      return;
    }

    try {
      const token = sessionStorage.getItem('adminToken') || '';
      const response = await fetch(`/api/admin/stock-performance-scores/${id}`, {
        method: 'DELETE',
        headers: { 'token': token }
      });

      const data = await response.json();
      
      if (data.success) {
        await fetchData();
      } else {
        alert(data.message);
      }
    } catch (error) {
      console.error('Error deleting score:', error);
      alert('Failed to delete score');
    }
  };

  // Handle edit
  const handleEdit = (score: StockPerformanceScore) => {
    setEditingScore(score);
    setFormData({
      stock_id: score.stock_id.toString(),
      score: score.score
    });
    setSelectedStock(score.stock);
    setShowModal(true);
  };

  // Handle close modal
  const handleCloseModal = () => {
    setShowModal(false);
    setEditingScore(null);
    setFormData({ stock_id: "", score: "" });
    setSelectedStock(null);
    setStockSearchTerm("");
    setErrors({});
  };

  // Handle stock selection
  const handleStockSelect = (product: Product) => {
    setSelectedStock(product);
    setFormData(prev => ({ ...prev, stock_id: product.id.toString() }));
    setStockSearchTerm(product.company_name);
    setShowStockDropdown(false);
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-themeTeal">Stock Performance Scores</h1>
        <button
          onClick={() => setShowModal(true)}
          className="bg-themeTeal text-white px-4 py-2 rounded-lg hover:bg-themeSkyBlue transition duration-500 flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Create Score Performance
        </button>
      </div>

      {/* Search */}
      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-themeTealLight w-4 h-4" />
          <input
            type="text"
            placeholder="Search by company name or score..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-themeTealLighter rounded-lg focus:outline-none focus:ring-2 focus:ring-themeTeal"
          />
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="w-full">
          <thead className="bg-themeTealWhite">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-themeTeal uppercase tracking-wider">
                Company Name
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-themeTeal uppercase tracking-wider">
                Score
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-themeTeal uppercase tracking-wider">
                Created At
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-themeTeal uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {loading ? (
              <tr>
                <td colSpan={4} className="px-6 py-4 text-center text-themeTealLighter">
                  Loading...
                </td>
              </tr>
            ) : filteredScores.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-6 py-4 text-center text-themeTealLighter">
                  No performance scores found
                </td>
              </tr>
            ) : (
              filteredScores.map((score) => (
                <tr key={score.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-themeTeal">
                    {score.stock.company_name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-themeTeal">
                    {score.score}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-themeTealLighter">
                    {new Date(score.created_at).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleEdit(score)}
                        className="text-themeTeal hover:text-themeSkyBlue transition duration-500"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(score.id)}
                        className="text-red-500 hover:text-red-700 transition duration-500"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-themeTeal">
                {editingScore ? 'Edit Performance Score' : 'Create Performance Score'}
              </h2>
              <button
                onClick={handleCloseModal}
                className="text-themeTealLighter hover:text-themeTeal transition duration-500"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Stock Selection */}
              <div>
                <label className="block text-sm font-medium text-themeTeal mb-1">
                  Stock <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search for a stock..."
                    value={stockSearchTerm}
                    onChange={(e) => {
                      setStockSearchTerm(e.target.value);
                      setShowStockDropdown(true);
                    }}
                    onFocus={() => setShowStockDropdown(true)}
                    className="w-full px-3 py-2 border border-themeTealLighter rounded-lg focus:outline-none focus:ring-2 focus:ring-themeTeal"
                    disabled={!!editingScore}
                  />
                  
                  {showStockDropdown && !editingScore && (
                    <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-themeTealLighter rounded-lg shadow-lg z-10 max-h-60 overflow-y-auto">
                      {filteredProducts.map((product) => (
                        <button
                          key={product.id}
                          type="button"
                          onClick={() => handleStockSelect(product)}
                          className="w-full px-3 py-2 text-left hover:bg-themeTealWhite transition duration-500"
                        >
                          {product.company_name}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
                {errors.stock_id && (
                  <p className="text-red-500 text-xs mt-1">{errors.stock_id}</p>
                )}
              </div>

              {/* Score Input */}
              <div>
                <label className="block text-sm font-medium text-themeTeal mb-1">
                  Score (1-100) <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="Enter score (1-100)"
                  value={formData.score}
                  onChange={(e) => setFormData(prev => ({ ...prev, score: e.target.value }))}
                  className="w-full px-3 py-2 border border-themeTealLighter rounded-lg focus:outline-none focus:ring-2 focus:ring-themeTeal"
                />
                {errors.score && (
                  <p className="text-red-500 text-xs mt-1">{errors.score}</p>
                )}
              </div>

              {errors.general && (
                <p className="text-red-500 text-sm">{errors.general}</p>
              )}

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="flex-1 px-4 py-2 border border-themeTealLighter text-themeTeal rounded-lg hover:bg-themeTealWhite transition duration-500"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-themeTeal text-white rounded-lg hover:bg-themeSkyBlue transition duration-500"
                >
                  {editingScore ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
