import React from 'react';
import { useQuery, gql } from '@apollo/client';
import { FileText, Database, Image, Users } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const GET_DASHBOARD_DATA = gql`
  query GetDashboardData {
    contentTypes {
      id
      name
    }
    contents {
      id
      title
      status
      contentType {
        name
      }
      updatedAt
    }
    medias {
      id
    }
    users {
      id
    }
  }
`;

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const { data, loading, error } = useQuery(GET_DASHBOARD_DATA);
  
  const isAdmin = user?.role === 'admin';
  
  if (loading) return <div className="text-center py-10">Loading...</div>;
  if (error) return <div className="text-center py-10 text-red-500">Error: {error.message}</div>;
  
  const contentTypeCount = data?.contentTypes?.length || 0;
  const contentCount = data?.contents?.length || 0;
  const mediaCount = data?.medias?.length || 0;
  const userCount = data?.users?.length || 0;
  
  const recentContents = data?.contents?.slice(0, 5) || [];
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
      </div>
      
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {/* Content Types Card */}
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-indigo-500 rounded-md p-3">
                <Database className="h-6 w-6 text-white" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Content Types
                  </dt>
                  <dd>
                    <div className="text-lg font-medium text-gray-900">
                      {contentTypeCount}
                    </div>
                  </dd>
                </dl>
              </div>
            </div>
          </div>
          <div className="bg-gray-50 px-5 py-3">
            <div className="text-sm">
              <Link to="/content-types" className="font-medium text-indigo-600 hover:text-indigo-500">
                View all
              </Link>
            </div>
          </div>
        </div>
        
        {/* Content Card */}
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-green-500 rounded-md p-3">
                <FileText className="h-6 w-6 text-white" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Content Entries
                  </dt>
                  <dd>
                    <div className="text-lg font-medium text-gray-900">
                      {contentCount}
                    </div>
                  </dd>
                </dl>
              </div>
            </div>
          </div>
          <div className="bg-gray-50 px-5 py-3">
            <div className="text-sm">
              <Link to="/contents" className="font-medium text-indigo-600 hover:text-indigo-500">
                View all
              </Link>
            </div>
          </div>
        </div>
        
        {/* Media Card */}
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-yellow-500 rounded-md p-3">
                <Image className="h-6 w-6 text-white" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Media Files
                  </dt>
                  <dd>
                    <div className="text-lg font-medium text-gray-900">
                      {mediaCount}
                    </div>
                  </dd>
                </dl>
              </div>
            </div>
          </div>
          <div className="bg-gray-50 px-5 py-3">
            <div className="text-sm">
              <Link to="/media" className="font-medium text-indigo-600 hover:text-indigo-500">
                View all
              </Link>
            </div>
          </div>
        </div>
        
        {/* Users Card */}
        {isAdmin && (
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0 bg-purple-500 rounded-md p-3">
                  <Users className="h-6 w-6 text-white" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      Users
                    </dt>
                    <dd>
                      <div className="text-lg font-medium text-gray-900">
                        {userCount}
                      </div>
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
            <div className="bg-gray-50 px-5 py-3">
              <div className="text-sm">
                <Link to="/settings" className="font-medium text-indigo-600 hover:text-indigo-500">
                  Manage
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
      
      {/* Recent Content */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:px-6 flex justify-between items-center">
          <h3 className="text-lg leading-6 font-medium text-gray-900">
            Recent Content
          </h3>
          <Link to="/contents" className="text-sm font-medium text-indigo-600 hover:text-indigo-500">
            View all
          </Link>
        </div>
        <div className="border-t border-gray-200">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Title
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Content Type
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Last Updated
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {recentContents.length > 0 ? (
                  recentContents.map((content) => (
                    <tr key={content.id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          <Link to={`/contents/${content.id}`} className="hover:text-indigo-600">
                            {content.title}
                          </Link>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500">{content.contentType.name}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          content.status === 'PUBLISHED' 
                            ? 'bg-green-100 text-green-800' 
                            : content.status === 'DRAFT' 
                              ? 'bg-yellow-100 text-yellow-800' 
                              : 'bg-gray-100 text-gray-800'
                        }`}>
                          {content.status.charAt(0) + content.status.slice(1).toLowerCase()}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(content.updatedAt).toLocaleDateString()}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={4} className="px-6 py-4 text-center text-sm text-gray-500">
                      No content entries yet
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;