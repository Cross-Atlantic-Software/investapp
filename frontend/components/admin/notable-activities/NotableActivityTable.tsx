'use client';

import React from 'react';
import Image from 'next/image';
import { Edit, Trash2 } from 'lucide-react';
import { Loader, SortableHeader } from '@/components/admin/shared';
import { NotableActivityTableProps } from './types';

const NotableActivityTable: React.FC<NotableActivityTableProps> = ({
  activities,
  loading,
  onEdit,
  onDelete,
  sortBy,
  sortOrder,
  onSort
}) => {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

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
                field="description"
                sortBy={sortBy}
                sortOrder={sortOrder}
                onSort={onSort}
              >
                Description
              </SortableHeader>
              <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                Activity Types
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
            {activities.map((activity, index) => (
              <tr key={activity.id} className={index % 2 === 0 ? "bg-white" : "bg-themeTealWhite"}>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-center">
                  {activity.icon ? (
                    <div className="flex justify-center">
                      <Image
                        src={activity.icon}
                        alt="Activity Icon"
                        width={32}
                        height={32}
                        className="rounded-full"
                      />
                    </div>
                  ) : (
                    <div className="flex justify-center">
                      <div className="w-8 h-8 bg-themeTealLighter rounded-full flex items-center justify-center">
                        <span className="text-themeTeal text-xs font-semibold">
                          {activity.description.substring(0, 2).toUpperCase()}
                        </span>
                      </div>
                    </div>
                  )}
                </td>
                <td className="px-6 py-4 text-sm text-themeTeal">
                  <div className="max-w-xs">
                    <p className="truncate">{activity.description}</p>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-themeTeal">
                  <div className="flex flex-wrap gap-1">
                    {activity.activity_types?.map((type) => (
                      <span 
                        key={type.id}
                        className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-themeTealLighter text-themeTeal"
                      >
                        {type.name}
                      </span>
                    ))}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-themeTeal">
                  {formatDate(activity.created_at)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <div className="flex items-center space-x-1">
                    <button
                      onClick={() => onEdit(activity)}
                      className="p-2 bg-blue-600 text-white hover:bg-blue-700 rounded transition duration-300 cursor-pointer flex gap-1"
                      title="Edit Activity"
                    >
                      <Edit width={16} height={16}/>
                      <span className="text-xs font-medium">Edit</span>
                    </button>
                    <button
                      onClick={() => onDelete(activity.id)}
                      className="p-2 bg-red-700 text-themeTealWhite hover:text-red-700 hover:bg-white rounded transition duration-300 cursor-pointer flex gap-1"
                      title="Delete Activity"
                    >
                      <Trash2 width={16} height={16}/>
                      <span className="text-xs font-medium">Delete</span>
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {activities.length === 0 && (
              <tr>
                <td colSpan={5} className="px-6 py-4 text-center text-themeTeal">
                  No notable activities found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default NotableActivityTable;
