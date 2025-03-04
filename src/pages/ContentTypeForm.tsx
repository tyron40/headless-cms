import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useForm, useFieldArray } from 'react-hook-form';
import { useMutation, useQuery, gql } from '@apollo/client';
import { PlusCircle, X, Save, ArrowLeft } from 'lucide-react';

const GET_CONTENT_TYPE = gql`
  query GetContentType($id: ID!) {
    contentType(id: $id) {
      id
      name
      slug
      description
      fields {
        id
        name
        slug
        type
        required
        multiple
        description
        validations {
          type
          params
        }
      }
    }
  }
`;

const CREATE_CONTENT_TYPE = gql`
  mutation CreateContentType($input: CreateContentTypeInput!) {
    createContentType(input: $input) {
      id
    }
  }
`;

const UPDATE_CONTENT_TYPE = gql`
  mutation UpdateContentType($id: ID!, $input: UpdateContentTypeInput!) {
    updateContentType(id: $id, input: $input) {
      id
    }
  }
`;

interface FormValues {
  name: string;
  slug: string;
  description: string;
  fields: {
    name: string;
    slug: string;
    type: string;
    required: boolean;
    multiple: boolean;
    description: string;
  }[];
}

const fieldTypes = [
  { value: 'TEXT', label: 'Text' },
  { value: 'RICH_TEXT', label: 'Rich Text' },
  { value: 'NUMBER', label: 'Number' },
  { value: 'BOOLEAN', label: 'Boolean' },
  { value: 'DATE', label: 'Date' },
  { value: 'MEDIA', label: 'Media' },
  { value: 'REFERENCE', label: 'Reference' },
];

const ContentTypeForm: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isEditing = !!id;
  
  const { data, loading: queryLoading } = useQuery(GET_CONTENT_TYPE, {
    variables: { id },
    skip: !isEditing,
  });
  
  const [createContentType, { loading: createLoading }] = useMutation(CREATE_CONTENT_TYPE);
  const [updateContentType, { loading: updateLoading }] = useMutation(UPDATE_CONTENT_TYPE);
  
  const { register, control, handleSubmit, setValue, watch, formState: { errors } } = useForm<FormValues>({
    defaultValues: {
      name: '',
      slug: '',
      description: '',
      fields: [{ name: '', slug: '', type: 'TEXT', required: false, multiple: false, description: '' }],
    },
  });
  
  const { fields, append, remove } = useFieldArray({
    control,
    name: 'fields',
  });
  
  const contentTypeName = watch('name');
  
  // Auto-generate slug from name
  useEffect(() => {
    if (!isEditing && contentTypeName) {
      const slug = contentTypeName
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '_')
        .replace(/^_|_$/g, '');
      
      setValue('slug', slug);
    }
  }, [contentTypeName, setValue, isEditing]);
  
  // Set form values when editing
  useEffect(() => {
    if (isEditing && data?.contentType) {
      setValue('name', data.contentType.name);
      setValue('slug', data.contentType.slug);
      setValue('description', data.contentType.description || '');
      
      // Clear default field
      remove(0);
      
      // Add fields from data
      data.contentType.fields.forEach((field: any) => {
        append({
          name: field.name,
          slug: field.slug,
          type: field.type,
          required: field.required,
          multiple: field.multiple,
          description: field.description || '',
        });
      });
    }
  }, [isEditing, data, setValue, append, remove]);
  
  const onSubmit = async (data: FormValues) => {
    try {
      if (isEditing) {
        await updateContentType({
          variables: {
            id,
            input: {
              name: data.name,
              description: data.description,
              fields: data.fields.map(field => ({
                name: field.name,
                slug: field.slug,
                type: field.type,
                required: field.required,
                multiple: field.multiple,
                description: field.description,
                validations: [],
              })),
            },
          },
        });
      } else {
        await createContentType({
          variables: {
            input: {
              name: data.name,
              slug: data.slug,
              description: data.description,
              fields: data.fields.map(field => ({
                name: field.name,
                slug: field.slug,
                type: field.type,
                required: field.required,
                multiple: field.multiple,
                description: field.description,
                validations: [],
              })),
            },
          },
        });
      }
      
      navigate('/content-types');
    } catch (err) {
      console.error('Error saving content type:', err);
    }
  };
  
  // Auto-generate field slug from name
  const handleFieldNameChange = (index: number, value: string) => {
    const slug = value
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '_')
      .replace(/^_|_$/g, '');
    
    setValue(`fields.${index}.slug`, slug);
  };
  
  if (queryLoading && isEditing) return <div className="text-center py-10">Loading...</div>;
  
  const loading = createLoading || updateLoading;
  
  return (
    <div className="space-y-6">
      <div className="flex items-center">
        <button
          onClick={() => navigate('/content-types')}
          className="mr-4 text-gray-500 hover:text-gray-700"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <h1 className="text-2xl font-bold text-gray-900">
          {isEditing ? 'Edit Content Type' : 'Create Content Type'}
        </h1>
      </div>
      
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
        <div className="bg-white shadow rounded-lg p-6">
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                Name
              </label>
              <input
                type="text"
                id="name"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                placeholder="e.g. Blog Post"
                {...register('name', { required: 'Name is required' })}
              />
              {errors.name && (
                <p className="mt-2 text-sm text-red-600">{errors.name.message}</p>
              )}
            </div>
            
            <div>
              <label htmlFor="slug" className="block text-sm font-medium text-gray-700">
                API ID
              </label>
              <input
                type="text"
                id="slug"
                className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm ${
                  isEditing ? 'bg-gray-100' : ''
                }`}
                placeholder="e.g. blog_post"
                {...register('slug', { 
                  required: 'API ID is required',
                  pattern: {
                    value: /^[a-z0-9_]+$/,
                    message: 'API ID can only contain lowercase letters, numbers, and underscores',
                  },
                })}
                readOnly={isEditing}
              />
              {errors.slug && (
                <p className="mt-2 text-sm text-red-600">{errors.slug.message}</p>
              )}
            </div>
          </div>
          
          <div className="mt-6">
            <label htmlFor="description" className="block text-sm font-medium text-gray-700">
              Description (optional)
            </label>
            <textarea
              id="description"
              rows={3}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              placeholder="Describe this content type..."
              {...register('description')}
            />
          </div>
        </div>
        
        <div className="bg-white shadow rounded-lg p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-medium text-gray-900">Fields</h2>
            <button
              type="button"
              onClick={() => append({ 
                name: '', 
                slug: '', 
                type: 'TEXT', 
                required: false, 
                multiple: false, 
                description: '' 
              })}
              className="inline-flex items-center px-3 py-1.5 border border-transparent text-sm font-medium rounded-md text-indigo-700 bg-indigo-100 hover:bg-indigo-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              <PlusCircle className="h-4 w-4 mr-1" />
              Add Field
            </button>
          </div>
          
          {fields.length === 0 ? (
            <div className="text-center py-6 bg-gray-50 rounded-lg">
              <p className="text-gray-500">No fields added yet. Add your first field to define the content structure.</p>
            </div>
          ) : (
            <div className="space-y-6">
              {fields.map((field, index) => (
                <div key={field.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-md font-medium text-gray-900">Field {index + 1}</h3>
                    <button
                      type="button"
                      onClick={() => remove(index)}
                      className="text-red-500 hover:text-red-700"
                    >
                      <X className="h-5 w-5" />
                    </button>
                  </div>
                  
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Field Name
                      </label>
                      <input
                        type="text"
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                        placeholder="e.g. Title"
                        {...register(`fields.${index}.name` as const, { 
                          required: 'Field name is required' 
                        })}
                        onChange={(e) => handleFieldNameChange(index, e.target.value)}
                      />
                      {errors.fields?.[index]?.name && (
                        <p className="mt-1 text-sm text-red-600">{errors.fields[index]?.name?.message}</p>
                      )}
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Field ID
                      </label>
                      <input
                        type="text"
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                        placeholder="e.g. title"
                        {...register(`fields.${index}.slug` as const, { 
                          required: 'Field ID is required',
                          pattern: {
                            value: /^[a-z0-9_]+$/,
                            message: 'Field ID can only contain lowercase letters, numbers, and underscores',
                          },
                        })}
                      />
                      {errors.fields?.[index]?.slug && (
                        <p className="mt-1 text-sm text-red-600">{errors.fields[index]?.slug?.message}</p>
                      )}
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Field Type
                      </label>
                      <select
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                        {...register(`fields.${index}.type` as const, { required: true })}
                      >
                        {fieldTypes.map((type) => (
                          <option key={type.value} value={type.value}>
                            {type.label}
                          </option>
                        ))}
                      </select>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Options
                      </label>
                      <div className="mt-2 space-y-2">
                        <div className="flex items-center">
                          <input
                            type="checkbox"
                            id={`required-${index}`}
                            className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                            {...register(`fields.${index}.required` as const)}
                          />
                          <label htmlFor={`required-${index}`} className="ml-2 block text-sm text-gray-700">
                            Required field
                          </label>
                        </div>
                        <div className="flex items-center">
                          <input
                            type="checkbox"
                            id={`multiple-${index}`}
                            className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                            {...register(`fields.${index}.multiple` as const)}
                          />
                          <label htmlFor={`multiple-${index}`} className="ml-2 block text-sm text-gray-700">
                            Allow multiple values
                          </label>
                        </div>
                      </div>
                    </div>
                    
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700">
                        Description (optional)
                      </label>
                      <input
                        type="text"
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                        placeholder="Describe this field..."
                        {...register(`fields.${index}.description` as const)}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        
        <div className="flex justify-end">
          <button
            type="button"
            onClick={() => navigate('/content-types')}
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
            {loading ? 'Saving...' : 'Save Content Type'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ContentTypeForm;