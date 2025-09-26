'use client';

import React from 'react';
import Image from 'next/image';
import { Edit, Trash2 } from 'lucide-react';
import { Loader, SortableHeader } from '@/components/admin/shared';
import { NewsTableProps } from './types';

const NewsTable: React.FC<NewsTableProps> = ({
  news,
  loading,
  onEdit,
  onDelete,
  sortBy,
  sortOrder,
  onSort,
  formatDate,
  parseTaxonomyIds,
  taxonomies
}) => {
  if (loading) {
    return (
      <div className="w-100 md:w-full overflow-hidden">
        <div className="flex justify-center items-center py-12">
          <Loader />
        </div>
      </div>
    );
  }

  return (
    <div className="w-100 md:w-full overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-themeTealLighter">
          <thead className="bg-themeTeal">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                Icon
              </th>
              <SortableHeader
                field="title"
                sortBy={sortBy}
                sortOrder={sortOrder}
                onSort={onSort}
              >
                Title
              </SortableHeader>
              <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                URL
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                Taxonomies
              </th>
              <SortableHeader
                field="created_at"
                sortBy={sortBy}
                sortOrder={sortOrder}
                onSort={onSort}
              >
                Date Added
              </SortableHeader>
              <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-themeTealLighter">
            {news.map((item, index) => (
              <tr key={item.id} className={index % 2 === 0 ? "bg-white" : "bg-themeTealWhite"}>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-center">
                  {item.icon ? (
                    <div className="flex justify-center">
                      <Image
                        src={item.icon}
                        alt="News Icon"
                        width={32}
                        height={32}
                        className="rounded-full"
                      />
                    </div>
                  ) : (
                    <div className="flex justify-center">
                      <div className="w-8 h-8 bg-themeTealLighter rounded-full flex items-center justify-center">
                        <span className="text-themeTeal text-xs font-semibold">
                          {item.title.substring(0, 2).toUpperCase()}
                        </span>
                      </div>
                    </div>
                  )}
                </td>
                <td className="px-6 py-4 text-sm text-themeTeal">
                  <div className="max-w-xs">
                    <p className="font-medium truncate">{item.title}</p>
                  </div>
                </td>
                <td className="px-6 py-4 text-sm text-themeTeal">
                  <div className="max-w-xs">
                    <a 
                      href={item.url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-800 truncate block"
                    >
                      {item.url}
                    </a>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-themeTeal">
                  <div className="flex flex-wrap gap-1">
                    {parseTaxonomyIds(item.taxonomy_ids).map((taxonomyId) => {
                      const taxonomy = taxonomies.find(t => t.id === taxonomyId);
                      return taxonomy ? (
                        <span 
                          key={taxonomy.id}
                          className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium text-white"
                          style={{ backgroundColor: taxonomy.color }}
                        >
                          {taxonomy.name}
                        </span>
                      ) : null;
                    })}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-themeTeal">
                  {formatDate(item.created_at)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <div className="flex items-center space-x-1">
                    <button
                      onClick={() => onEdit(item)}
                      className="p-2 bg-blue-600 text-white hover:bg-blue-700 rounded transition duration-300 cursor-pointer flex gap-1"
                      title="Edit News"
                    >
                      <Edit width={16} height={16}/>
                      <span className="text-xs font-medium">Edit</span>
                    </button>
                    <button
                      onClick={() => onDelete(item.id)}
                      className="p-2 bg-red-700 text-themeTealWhite hover:text-red-700 hover:bg-white rounded transition duration-300 cursor-pointer flex gap-1"
                      title="Delete News"
                    >
                      <Trash2 width={16} height={16}/>
                      <span className="text-xs font-medium">Delete</span>
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {news.length === 0 && (
              <tr>
                <td colSpan={6} className="px-6 py-4 text-center text-themeTeal">
                  No news found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default NewsTable;
