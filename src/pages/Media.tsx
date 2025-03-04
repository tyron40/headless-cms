import React, { useState, useRef } from 'react';
import { useMutation, useQuery, gql } from '@apollo/client';
import { Upload, Trash2, Search, X, ExternalLink } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const GET_MEDIA = gql`
  query GetMedia {
    medias {
      id
      filename
      mimetype
      size
      url
      createdAt
      createdBy {
        username
      }
    }
  }
`;

const DELETE_MEDIA = gql`
  mutation DeleteMedia($id: ID!) {
    deleteMedia(id: $id)
  }
`;

// This would be implemented on the server side
const UPLOAD_MEDIA = gql`
  mutation UploadMedia($file: Upload!) {
    uploadMedia(file: $file) {
      id
      filename
      mimetype
      size
      url
    }
  }
`;

const Media: React.FC = () => {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedMedia, setSelectedMedia] = useState<any>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const { data, loading, error, refetch } = useQuery(GET_MEDIA);
  
  const [deleteMedia] = useMutation(DELETE_MEDIA, {
    refetchQueries: [{ query: GET_MEDIA }],
  });
  
  const [uploadMedia, { loading: uploading }] = useMutation(UPLOAD_MEDIA);
  
  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this media? This action cannot be undone.')) {
      try {
        await deleteMedia({
          variables: { id },
        });
      } catch (err) {
        console.error('Error deleting media:', err);
      }
    }
  };
  
  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    
    try {
      // In a real implementation, you would use the Apollo upload client
      // For this demo, we'll just show a placeholder
      alert('File upload functionality would be implemented on the server side.');
      
      // Reset the file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      
      // Refetch the media list
      refetch();
    } catch (err) {
      console.error('Error uploading media:', err);
    }
  };
  
  const handleMediaClick = (media: any) => {
    setSelectedMedia(media);
  };
  
  const closeMediaDetail = () => {
    setSelectedMedia(null);
  };
  
  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };
  
  const filteredMedia = data?.medias
    ? data.medias.filter((media: any) => 
        media.filename.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : [];
  
  if (loading) return <div className="text-center py-10">Loading...</div>;
  if (error) return <div className="text-center py-10 text-red-500">Error: {error.message}</div>;
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Media Library</h1>
        <div>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleUpload}
            className="hidden"
            multiple
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
          >
            <Upload className="h-4 w-4 mr-2" />
            {uploading ? 'Uploading...' : 'Upload Media'}
          </button>
        </div>
      </div>
      
      <div className="bg-white shadow rounded-lg p-4">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="Search media files..."
            className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring- indigo-500 focus:border-indigo-500 sm:text-sm"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>
      
      {filteredMedia.length === 0 ? (
        <div className="bg-white shadow rounded-lg p-6 text-center">
          <div className="mx-auto h-12 w-12 text-gray-400">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
          <h3 className="mt-2 text-sm font-medium text-gray-900">No media files</h3>
          <p className="mt-1 text-sm text-gray-500">
            {searchTerm ? 'No media files match your search criteria.' : 'Get started by uploading a media file.'}
          </p>
          <div className="mt-6">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              <Upload className="-ml-1 mr-2 h-5 w-5" aria-hidden="true" />
              Upload Media
            </button>
          </div>
        </div>
      ) : (
        <div className="bg-white shadow rounded-lg p-6">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {filteredMedia.map((media: any) => (
              <div 
                key={media.id} 
                className="relative group cursor-pointer"
                onClick={() => handleMediaClick(media)}
              >
                <div className="aspect-w-1 aspect-h-1 w-full overflow-hidden rounded-lg bg-gray-200">
                  {media.mimetype.startsWith('image/') ? (
                    <img
                      src={media.url}
                      alt={media.filename}
                      className="h-full w-full object-cover object-center"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = 'https://via.placeholder.com/150?text=Image+Not+Found';
                      }}
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center bg-gray-100">
                      <svg className="h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    </div>
                  )}
                </div>
                <div className="mt-2">
                  <p className="text-sm font-medium text-gray-900 truncate">{media.filename}</p>
                  <p className="text-sm text-gray-500">{formatFileSize(media.size)}</p>
                </div>
                <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDelete(media.id);
                    }}
                    className="p-1 bg-red-100 rounded-full text-red-600 hover:bg-red-200"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      
      {/* Media Detail Modal */}
      {selectedMedia && (
        <div className="fixed inset-0 z-10 overflow-y-auto">
          <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity" aria-hidden="true">
              <div className="absolute inset-0 bg-gray-500 opacity-75" onClick={closeMediaDetail}></div>
            </div>
            
            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
            
            <div className="inline-block align-bottom bg-white rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full sm:p-6">
              <div className="absolute top-0 right-0 pt-4 pr-4">
                <button
                  type="button"
                  className="bg-white rounded-md text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  onClick={closeMediaDetail}
                >
                  <span className="sr-only">Close</span>
                  <X className="h-6 w-6" />
                </button>
              </div>
              
              <div className="sm:flex sm:items-start">
                <div className="mt-3 text-center sm:mt-0 sm:text-left w-full">
                  <h3 className="text-lg leading-6 font-medium text-gray-900">
                    Media Details
                  </h3>
                  
                  <div className="mt-4">
                    {selectedMedia.mimetype.startsWith('image/') ? (
                      <img
                        src={selectedMedia.url}
                        alt={selectedMedia.filename}
                        className="w-full h-auto max-h-64 object-contain rounded-md"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = 'https://via.placeholder.com/300?text=Image+Not+Found';
                        }}
                      />
                    ) : (
                      <div className="flex h-48 items-center justify-center bg-gray-100 rounded-md">
                        <svg className="h-16 w-16 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                      </div>
                    )}
                    
                    <div className="mt-4 space-y-3">
                      <div>
                        <h4 className="text-sm font-medium text-gray-500">Filename</h4>
                        <p className="mt-1 text-sm text-gray-900">{selectedMedia.filename}</p>
                      </div>
                      
                      <div>
                        <h4 className="text-sm font-medium text-gray-500">Type</h4>
                        <p className="mt-1 text-sm text-gray-900">{selectedMedia.mimetype}</p>
                      </div>
                      
                      <div>
                        <h4 className="text-sm font-medium text-gray-500">Size</h4>
                        <p className="mt-1 text-sm text-gray-900">{formatFileSize(selectedMedia.size)}</p>
                      </div>
                      
                      <div>
                        <h4 className="text-sm font-medium text-gray-500">Uploaded by</h4>
                        <p className="mt-1 text-sm text-gray-900">{selectedMedia.createdBy.username}</p>
                      </div>
                      
                      <div>
                        <h4 className="text-sm font-medium text-gray-500">Upload date</h4>
                        <p className="mt-1 text-sm text-gray-900">
                          {new Date(selectedMedia.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                      
                      <div>
                        <h4 className="text-sm font-medium text-gray-500">URL</h4>
                        <div className="mt-1 flex items-center">
                          <input
                            type="text"
                            readOnly
                            value={selectedMedia.url}
                            className="flex-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                            onClick={(e) => (e.target as HTMLInputElement).select()}
                          />
                          <a
                            href={selectedMedia.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="ml-2 p-2 text-indigo-600 hover:text-indigo-900"
                            title="Open in new tab"
                          >
                            <ExternalLink className="h-5 w-5" />
                          </a>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse">
                <button
                  type="button"
                  className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 sm:ml-3 sm:w-auto sm:text-sm"
                  onClick={() => {
                    handleDelete(selectedMedia.id);
                    closeMediaDetail();
                  }}
                >
                  Delete
                </button>
                <button
                  type="button"
                  className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:w-auto sm:text-sm"
                  onClick={closeMediaDetail}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Media;