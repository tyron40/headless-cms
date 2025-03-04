import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { useMutation, useQuery, gql } from '@apollo/client';
import { Save, ArrowLeft } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const GET_CONTENT_TYPES = gql`
  query GetContentTypes {
    contentTypes {
      id
      name
      fields {
        id
        name
        slug
        type
        required
        multiple
        description
      }
    }
  }
`;

const GET_CONTENT = gql`
  query GetContent($id: ID!) {
    content(id: $id) {
      id
      title
      slug
      status
      contentType {
        id
        name
        fields {
          id
          name
          slug
          type
          required
          multiple
          description
        }
      }
      fields {
        fieldId
        fieldName
        value
      }
      createdAt
      updatedAt
    }
  }
`;

const CREATE_CONTENT = gql`
  mutation CreateContent($input: CreateContentInput!) {
    createContent(input: $input) {
      id
    }
  }
`;

const UPDATE_CONTENT = gql`
  mutation UpdateContent($id: ID!, $input: UpdateContentInput!) {
    updateContent(id: $id, input: $input) {
      id
    }
  }
`;

interface FormValues {
  title: string;
  slug: string;
  status: string;
  contentTypeId: string;
  fields: Record<string, string>;
}

const ContentForm: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const isEditing = !!id;
  
  const [selectedContentType, setSelectedContentType] = useState<any>(null);
  
  const { data: contentTypesData, loading: contentTypesLoading } = useQuery(GET_CONTENT_TYPES);
  
  const { data: contentData, loading: contentLoading } = useQuery(GET_CONTENT, {
    variables: { id },
    skip: !isEditing,
  });
  
  const [createContent, { loading: createLoading }] = useMutation(CREATE_CONTENT);
  const [updateContent, { loading: updateLoading }] = useMutation(UPDATE_CONTENT);
  
  const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm<FormValues>({
    defaultValues: {
      title: '',
      slug: '',
      status: 'DRAFT',
      contentTypeId: '',
      fields: {},
    },
  });
  
  const contentTitle = watch('title');
  const contentTypeId = watch('contentTypeId');
  
  // Auto-generate slug from title
  useEffect(() => {
    if (!isEditing && contentTitle) {
      const slug = contentTitle
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '');
      
      setValue('slug', slug);
    }
  }, [contentTitle, setValue, isEditing]);
  
  // Update selected content type when contentTypeId changes
  useEffect(() => {
    if (contentTypeId && contentTypesData) {
      const selectedType = contentTypesData.contentTypes.find(
        (type: any) => type.id === contentTypeId
      );
      setSelectedContentType(selectedType);
    }
  }, [contentTypeId, contentTypesData]);
  
  // Set form values when editing
  useEffect(() => {
    if (isEditing && contentData?.content) {
      const { content } = contentData;
      
      setValue('title', content.title);
      setValue('slug', content.slug);
      setValue('status', content.status);
      setValue('contentTypeId', content.contentType.id);
      
      // Set field values
      content.fields.forEach((field: any) => {
        setValue(`fields.${field.fieldId}`, field.value);
      });
      
      setSelectedContentType(content.contentType);
    }
  }, [isEditing, contentData, setValue]);
  
  const onSubmit = async (data: FormValues) => {
    try {
      const fieldValues = Object.entries(data.fields).map(([fieldId, value]) => ({
        fieldId,
        value: value.toString(),
      }));
      
      if (isEditing) {
        await updateContent({
          variables: {
            id,
            input: {
              title: data.title,
              slug: data.slug,
              status: data.status,
              fields: fieldValues,
            },
          },
        });
      } else {
        await createContent({
          variables: {
            input: {
              contentTypeId: data.contentTypeId,
              title: data.title,
              slug: data.slug,
              status: data.status,
              fields: fieldValues,
            },
          },
        });
      }
      
      navigate('/contents');
    } catch (err) {
      console.error('Error saving content:', err);
    }
  };
  
  if ((contentTypesLoading && !isEditing) || (contentLoading && isEditing)) {
    return <div className="text-center py-10">Loading...</div>;
  }
  
  const contentTypes = contentTypesData?.contentTypes || [];
  const loading = createLoading || updateLoading;
  
  // Render field based on its type
  const renderField = (field: any) => {
    const fieldValue = watch(`fields.${field.id}`);
    
    switch (field.type) {
      case 'TEXT':
        return (
          <input
            type="text"
            id={`field-${field.id}`}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            placeholder={field.description || `Enter ${field.name.toLowerCase()}`}
            {...register(`fields.${field.id}` as const, {
              required: field.required ? `${field.name} is required` : false,
            })}
          />
        );
      case 'RICH_TEXT':
        return (
          <textarea
            id={`field-${field.id}`}
            rows={5}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            placeholder={field.description || `Enter ${field.name.toLowerCase()}`}
            {...register(`fields.${field.id}` as const, {
              required: field.required ? `${field.name} is required` : false,
            })}
          />
        );
      case 'NUMBER':
        return (
          <input
            type="number"
            id={`field-${field.id}`}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            placeholder={field.description || `Enter ${field.name.toLowerCase()}`}
            {...register(`fields.${field.id}` as const, {
              required: field.required ? `${field.name} is required` : false,
              valueAsNumber: true,
            })}
          />
        );
      case 'BOOLEAN':
        return (
          <div className="mt-1">
            <input
              type="checkbox"
              id={`field-${field.id}`}
              className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
              {...register(`fields.${field.id}` as const)}
            />
            <label htmlFor={`field-${field.id}`} className="ml-2 block text-sm text-gray-700">
              {field.description || field.name}
            </label>
          </div>
        );
      case 'DATE':
        return (
          <input
            type="date"
            id={`field-${field.id}`}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            {...register(`fields.${field.id}` as const, {
              required: field.required ? `${field.name} is required` : false,
            })}
          />
        );
      case 'MEDIA':
        return (
          <div className="mt-1">
            <input
              type="text"
              id={`field-${field.id}`}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              placeholder="Enter media URL"
              {...register(`fields.${field.id}` as const, {
                required: field.required ? `${field.name} is required` : false,
              })}
            />
            {fieldValue && (
              <div className="mt-2">
                <img 
                  src={fieldValue} 
                  alt="Media preview" 
                  className="h-24 w-auto object-cover rounded-md"
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = 'none';
                  }}
                />
              </div>
            )}
          </div>
        );
      case 'REFERENCE':
        return (
          <input
            type="text"
            id={`field-${field.id}`}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            placeholder="Enter reference ID"
            {...register(`fields.${field.id}` as const, {
              required: field.required ? `${field.name} is required` : false,
            })}
          />
        );
      default:
        return (
          <input
            type="text"
            id={`field-${field.id}`}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            placeholder={field.description || `Enter ${field.name.toLowerCase()}`}
            {...register(`fields.${field.id}` as const, {
              required: field.required ? `${field.name} is required` : false,
            })}
          />
        );
    }
  };
  
  return (
    <div className="space-y-6">
      <div className="flex items-center">
        <button
          onClick={() => navigate('/contents')}
          className="mr-4 text-gray-500 hover:text-gray-700"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <h1 className="text-2xl font-bold text-gray-900">
          {isEditing ? 'Edit Content' : 'Create Content'}
        </h1>
      </div>
      
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
        <div className="bg-white shadow rounded-lg p-6">
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <div className="md:col-span-2">
              <label htmlFor="title" className="block text-sm font-medium text-gray-700">
                Title
              </label>
              <input
                type="text"
                id="title"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                placeholder="Enter title"
                {...register('title', { required: 'Title is required' })}
              />
              {errors.title && (
                <p className="mt-2 text-sm text-red-600">{errors.title.message}</p>
              )}
            </div>
            
            <div>
              <label htmlFor="slug" className="block text-sm font-medium text-gray-700">
                Slug
              </label>
              <input
                type="text"
                id="slug"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                placeholder="Enter slug"
                {...register('slug', { 
                  required: 'Slug is required',
                  pattern: {
                    value: /^[a-z0-9-]+$/,
                    message: 'Slug can only contain lowercase letters, numbers, and hyphens',
                  },
                })}
              />
              {errors.slug && (
                <p className="mt-2 text-sm text-red-600">{errors.slug.message}</p>
              )}
            </div>
            
            <div>
              <label htmlFor="status" className="block text-sm font-medium text-gray-700">
                Status
              </label>
              <select
                id="status"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                {...register('status', { required: true })}
              >
                <option value="DRAFT">Draft</option>
                {(user?.role === 'admin' || user?.role === 'editor') && (
                  <option value="PUBLISHED">Published</option>
                )}
                <option value="ARCHIVED">Archived</option>
              </select>
            </div>
            
            {!isEditing && (
              <div className="md:col-span-2">
                <label htmlFor="contentTypeId" className="block text-sm font-medium text-gray-700">
                  Content Type
                </label>
                <select
                  id="contentTypeId"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  {...register('contentTypeId', { required: 'Content Type is required' })}
                >
                  <option value="">Select a content type</option>
                  {contentTypes.map((type: any) => (
                    <option key={type.id} value={type.id}>
                      {type.name}
                    </option>
                  ))}
                </select>
                {errors.contentTypeId && (
                  <p className="mt-2 text-sm text-red-600">{errors.contentTypeId.message}</p>
                )}
              </div>
            )}
          </div>
        </div>
        
        {selectedContentType && (
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-6">
              {selectedContentType.name} Fields
            </h2>
            
            <div className="space-y-6">
              {selectedContentType.fields.map((field: any) => (
                <div key={field.id}>
                  <label htmlFor={`field-${field.id}`} className="block text-sm font-medium text-gray-700">
                    {field.name} {field.required && <span className="text-red-500">*</span>}
                  </label>
                  {field.description && (
                    <p className="mt-1 text-sm text-gray-500">{field.description}</p>
                  )}
                  {renderField(field)}
                  {errors.fields && errors.fields[field.id] && (
                    <p className="mt-2 text-sm text-red-600">{errors.fields[field.id]?.message}</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
        
        <div className="flex justify-end">
          <button
            type="button"
            onClick={() => navigate('/contents')}
            className="mr-4 px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
          >
            <Save className="h-4 w-4 mr-2" />
            {loading ? 'Saving...' : 'Save Content'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ContentForm;