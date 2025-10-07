'use client';

import React from 'react';
import { X, Upload, BarChart3, FileText, TrendingUp, ChevronRight } from 'lucide-react';

interface Stock {
  id: number;
  company_name: string;
  logo: string;
}

interface StockModulesSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  stock: Stock | null;
  onSelectModule: (module: string) => void;
}

const modules = [
  {
    id: 'price-data',
    title: 'Upload Price Data CSV',
    description: 'Import historical price data',
    icon: Upload,
    color: 'blue',
    bgColor: 'bg-blue-50',
    hoverBg: 'hover:bg-blue-100',
    iconColor: 'text-blue-600',
    borderColor: 'border-blue-500',
  },
  {
    id: 'scorecards',
    title: 'Manage Scorecards',
    description: 'Configure performance metrics',
    icon: BarChart3,
    color: 'teal',
    bgColor: 'bg-teal-50',
    hoverBg: 'hover:bg-teal-100',
    iconColor: 'text-teal-600',
    borderColor: 'border-teal-500',
  },
  {
    id: 'rationales',
    title: 'Manage Investment Rationales',
    description: 'Add investment analysis',
    icon: FileText,
    color: 'indigo',
    bgColor: 'bg-indigo-50',
    hoverBg: 'hover:bg-indigo-100',
    iconColor: 'text-indigo-600',
    borderColor: 'border-indigo-500',
  },
  {
    id: 'performance-pdfs',
    title: 'Manage Performance PDFs',
    description: 'Upload performance reports',
    icon: Upload,
    color: 'orange',
    bgColor: 'bg-orange-50',
    hoverBg: 'hover:bg-orange-100',
    iconColor: 'text-orange-600',
    borderColor: 'border-orange-500',
  },
  {
    id: 'sector-outlook',
    title: 'Manage Sector Outlook',
    description: 'Configure sector analysis',
    icon: TrendingUp,
    color: 'purple',
    bgColor: 'bg-purple-50',
    hoverBg: 'hover:bg-purple-100',
    iconColor: 'text-purple-600',
    borderColor: 'border-purple-500',
  },
  {
    id: 'sector-insights',
    title: 'Manage Sector Insights PDFs',
    description: 'Upload sector insights',
    icon: FileText,
    color: 'emerald',
    bgColor: 'bg-emerald-50',
    hoverBg: 'hover:bg-emerald-100',
    iconColor: 'text-emerald-600',
    borderColor: 'border-emerald-500',
  },
];

const StockModulesSidebar: React.FC<StockModulesSidebarProps> = ({
  isOpen,
  onClose,
  stock,
  onSelectModule,
}) => {
  const [lastSelectedModule, setLastSelectedModule] = React.useState<string | null>(null);

  const handleModuleClick = (moduleId: string) => {
    setLastSelectedModule(moduleId);
    onSelectModule(moduleId);
    
    // Clear selection after a short delay for visual feedback
    setTimeout(() => setLastSelectedModule(null), 1000);
  };

  if (!isOpen || !stock) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/30 backdrop-blur-sm z-40 transition-opacity duration-300"
        onClick={onClose}
      />

      {/* Sidebar */}
      <div className="fixed left-0 top-0 h-screen w-96 bg-white shadow-2xl z-50 transform transition-transform duration-300 ease-out flex flex-col">
        {/* Header */}
        <div className="h-16 bg-gradient-to-r from-themeTeal to-themeTealLight px-6 flex items-center justify-between border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-lg bg-white/20 backdrop-blur-sm flex items-center justify-center">
              <BarChart3 className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-white">Stock Modules</h2>
              <p className="text-xs text-white/80">{stock.company_name}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/20 rounded-lg transition-colors duration-200"
          >
            <X className="w-5 h-5 text-white" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          <div className="p-4 space-y-2">
            {modules.map((module) => {
              const Icon = module.icon;
              return (
                <button
                  key={module.id}
                  onClick={() => handleModuleClick(module.id)}
                  className={`w-full p-4 rounded-xl ${module.bgColor} ${module.hoverBg} border-2 border-transparent hover:border-${module.color}-200 transition-all duration-200 group ${
                    lastSelectedModule === module.id ? 'ring-2 ring-green-400 ring-opacity-50 bg-green-50' : ''
                  }`}
                >
                  <div className="flex items-start gap-4">
                    {/* Icon */}
                    <div className={`flex-shrink-0 w-12 h-12 rounded-lg bg-white shadow-sm flex items-center justify-center group-hover:scale-110 transition-transform duration-200`}>
                      <Icon className={`w-6 h-6 ${module.iconColor}`} />
                    </div>

                    {/* Content */}
                    <div className="flex-1 text-left">
                      <div className="flex items-center justify-between">
                        <h3 className="text-sm font-semibold text-gray-900 group-hover:text-gray-700">
                          {module.title}
                        </h3>
                        <div className="flex items-center gap-2">
                          {lastSelectedModule === module.id && (
                            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                          )}
                          <ChevronRight className={`w-4 h-4 ${module.iconColor} opacity-0 group-hover:opacity-100 transition-opacity duration-200`} />
                        </div>
                      </div>
                      <p className="text-xs text-gray-600 mt-1">
                        {module.description}
                      </p>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </>
  );
};

export default StockModulesSidebar;
