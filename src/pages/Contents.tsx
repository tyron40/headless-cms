import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery, useMutation, gql } from '@apollo/client';
import { PlusCircle, Edit, Trash2, AlertCircle, Filter, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const GET_CONTENT_TYPES = gql`
  query GetContentTypes {
    contentTypes {
      id
      name
      slug
    }
  }
`;

const GET_CONTENTS = gql`
  query GetContents($filter: ContentFilterInput) {
    contents(filter: $filter) {
      id
      title
      slug
      status
      contentType {
        id
        name
      }
      createdAt
      updatedAt
      publishedAt
      createdBy {
        username
      }
    }
  }
`;

const DELETE_CONTENT = gql`
  mutation DeleteContent($id: ID!) {
    deleteContent(id: $id)
  }
`;

const PUBLISH_CONTENT = gql`
  mutation PublishContent($id: ID!) {
    publishContent(id: $id) {
      id
      status
      publishedAt
    }
  }
`;

const UNPUBLISH_CONTENT = gql`
  mutation UnpublishContent($id: ID!) {
    unpublishContent(id: $id) {
      id
      status
      publishedAt
    }
  }
`;

const Contents: React.FC = () => {
  const { user } = useAuth();
  const [selectedContentType, setSelectedContentType] = useState<string>('');
  const [selectedStatus, setSelectedStatus] = useState<string>('');
  
  const { data: contentTypesData } = useQuery(GET_CONTENT_TYPES);
  
  const { data, loading, error, refetch } = useQuery(GET_CONTENTS, {
    variables: {
      filter: {
        ...(selectedContentType ? { contentTypeId: selectedContentType } : {}),
        ...(selectedStatus ? { status: selectedStatus } : {}),
      },
    },
  });
  
  const [deleteContent] = useMutation(DELETE_CONTENT, {
    refetchQueries: [{ query: GET_CONTENTS }],
  });
  
  const [publishContent] = useMutation(PUBLISH_CONTENT);
  const [unpublishContent] = useMutation(UNPUBLISH_CONTENT);
  
  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this content? This action cannot be undone.')) {
      try {
        await deleteContent({
          variables: { id },
        });
      } catch (err) {
        console.error('Error deleting content:', err);
      }
    }
  };
  
  const handlePublish = async (id: string) => {
    try {
      await publishContent({
        variables: { id },
      });
      refetch();
    } catch (err) {
      console.error('Error publishing content:', err);
    }
  };
  
  const handleUnpublish = async (id: string) => {
    try {
      await unpublishContent({
        variables: { id },
      });
      refetch();
    } catch (err) {
      console.error('Error unpublishing content:', err);
    }
  };
  
  const handleFilter = () => {
    refetch({
      filter: {
        ...(selectedContentType ? { contentTypeId: selectedContentType } : {}),
        ...(selectedStatus ? { status: selectedStatus } : {}),
      },
    });
  };
  
  const handleClearFilters = () => {
    setSelectedContentType('');
    setSelectedStatus('');
    refetch({ filter: {} });
  };
  
  if (loading) return <div className="text-center py-10">Loading...</div>;
  if (error) return <div className="text-center py-10 text-red-500">Error: {error.message}</div>;
  
  const contents = data?.contents || [];
  const contentTypes = contentTypesData?.contentTypes || [];
  
  const isAdmin = user?.role === 'admin';
  const isEditor = user?.role === 'editor';
  const canPublish = isAdmin || isEditor;
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Content</h1>
        <Link
          to="/contents/new"
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          <PlusCircle className="h-4 w-4 mr-2" />
          New Content
        </Link>
      </div>
      
      <div className="bg-white shadow rounded-lg p-4">
        <div className="flex flex-col md:flex-row md:items-center md:space-x-4 space-y-4 md:space-y-0">
          <div className="flex items-center">
            <Filter className="h-5 w-5 text-gray-400 mr-2" />
            <span className="text-sm font-medium text-gray-700">Filter by:</span>
          </div>
          
          <div className="flex-1">
            <select
              value={selectedContentType}
              onChange={(e) => setSelectedContentType(e.target.value)}
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            >
              <option value="">All Content Types</option>
              {contentTypes.map((type) => (
                <option key={type.id} value={type.id}>
                  {type.name}
                </option>
              ))}
            </select>
          </div>
          
          <div className="flex-1">
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            >
              <option value="">All Statuses</option>
              <option value="DRAFT">Draft</option>
              <option value="PUBLISHED">Published</option>
              <option value="ARCHIVED">Archived</option>
            </select>
          </div>
          
          <div className="flex space-x-2">
            <button
              onClick={handleFilter}
              className="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Apply Filters
            </button>
            <button
              onClick={handleClearFilters}
              className="inline-flex items-center px-3 py-2 border border-gray-300 text-sm font-medium rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Clear
            </button>
          </div>
        </div>
      </div>
      
      {contents.length === 0 ? (
        <div className="bg-white shadow rounded-lg p-6 text-center">
          <AlertCircle className="h-12 w-12 text-yellow-500 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Content Found</h3>
          <p className="text-gray-500 mb-4">
            {contentTypes.length === 0 
              ? "You need to create a content type before adding content."
              : "No content entries match your criteria. Try creating new content or adjusting your filters."}
          </p>
          {contentTypes.length === 0 ? (
            isAdmin && (
              <Link
                to="/content-types/new"
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Create Content Type
              </Link>
            )
          ) : (
            <Link
              to="/contents/new"
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Create Content
            </Link>
          )}
        </div>
      ) : (
        <div className="bg-white shadow rounded-lg">
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
                    Author
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Last Updated
                  </th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {contents.map((content) => (
                  <tr key={content.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        <Link to={`/contents/${content.id}`} className="hover:text-indigo-600">
                          {content.title}
                        </Link>
                      </div>
                      <div className="text-sm text-gray-500 font-mono">{content.slug}</div>
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
                      {content.createdBy.username}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(content.updatedAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end space-x-2">
                        {canPublish && content.status !== 'PUBLISHED' && (
                          <button
                            onClick={() => handlePublish(content.id)}
                            className="text-green-600 hover:text-green-900"
                            title="Publish"
                          >
                            <Eye className="h-4 w-4" />
                          </button>
                        )}
                        
                        {canPublish && content.status === 'PUBLISHED' && (
                          <button
                            onClick={() => handleUnpublish(content.id)}
                            className="text-yellow-600 hover:text-yellow-900"
                            title="Unpublish"
                          >
                            <EyeOff className="h-4 w-4" />
                          </button>
                        )}
                        
                        <Link
                          to={`/contents/${content.id}`}
                          className="text-indigo-600 hover:text-indigo-900"
                          title="Edit"
                        >
                          <Edit className="h-4 w-4" />
                        </Link>
                        
                        <button
                          onClick={() => handleDelete(content.id)}
                          className="text-red-600 hover:text-red-900"
                          title="Delete"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default Contents;