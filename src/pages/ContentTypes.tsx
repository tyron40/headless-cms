import React from 'react';
import { Link } from 'react-router-dom';
import { useQuery, useMutation, gql } from '@apollo/client';
import { PlusCircle, Edit, Trash2, AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const GET_CONTENT_TYPES = gql`
  query GetContentTypes {
    contentTypes {
      id
      name
      slug
      description
      fields {
        id
        name
        type
      }
      createdAt
      updatedAt
    }
  }
`;

const DELETE_CONTENT_TYPE = gql`
  mutation DeleteContentType($id: ID!) {
    deleteContentType(id: $id)
  }
`;

const ContentTypes: React.FC = () => {
  const { user } = useAuth();
  const { data, loading, error } = useQuery(GET_CONTENT_TYPES);
  const [deleteContentType, { loading: deleteLoading }] = useMutation(DELETE_CONTENT_TYPE, {
    refetchQueries: [{ query: GET_CONTENT_TYPES }],
  });
  
  const isAdmin = user?.role === 'admin';
  
  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this content type? This action cannot be undone.')) {
      try {
        await deleteContentType({
          variables: { id },
        });
      } catch (err) {
        console.error('Error deleting content type:', err);
        alert('Failed to delete content type. It may have associated content.');
      }
    }
  };
  
  if (loading) return <div className="text-center py-10">Loading...</div>;
  if (error) return <div className="text-center py-10 text-red-500">Error: {error.message}</div>;
  
  const contentTypes = data?.contentTypes || [];
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Content Types</h1>
        {isAdmin && (
          <Link
            to="/content-types/new"
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            <PlusCircle className="h-4 w-4 mr-2" />
            New Content Type
          </Link>
        )}
      </div>
      
      {contentTypes.length === 0 ? (
        <div className="bg-white shadow rounded-lg p-6 text-center">
          <AlertCircle className="h-12 w-12 text-yellow-500 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Content Types Yet</h3>
          <p className="text-gray-500 mb-4">
            Content types define the structure of your content. Create your first content type to get started.
          </p>
          {isAdmin && (
            <Link
              to="/content-types/new"
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              <PlusCircle className="h-4 w-4 mr-2" />
              Create Content Type
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
                    Name
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    API ID
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Fields
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Last Updated
                  </th>
                  {isAdmin && (
                    <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  )}
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {contentTypes.map((contentType) => (
                  <tr key={contentType.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {contentType.name}
                      </div>
                      {contentType.description && (
                        <div className="text-sm text-gray-500 truncate max-w-xs">
                          {contentType.description}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500 font-mono">{contentType.slug}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">{contentType.fields.length} fields</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(contentType.updatedAt).toLocaleDateString()}
                    </td>
                    {isAdmin && (
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <Link
                          to={`/content-types/${contentType.id}`}
                          className="text-indigo-600 hover:text-indigo-900 mr-4"
                        >
                          <Edit className="h-4 w-4 inline" />
                          <span className="ml-1">Edit</span>
                        </Link>
                        <button
                          onClick={() => handleDelete(contentType.id)}
                          disabled={deleteLoading}
                          className="text-red-600 hover:text-red-900"
                        >
                          <Trash2 className="h-4 w-4 inline" />
                          <span className="ml-1">Delete</span>
                        </button>
                      </td>
                    )}
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

export default ContentTypes;