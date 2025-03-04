import gql from 'graphql-tag';

export const typeDefs = gql`
  # Base types
  type User {
    id: ID!
    username: String!
    email: String!
    role: String!
    createdAt: String!
    updatedAt: String!
  }

  type ContentType {
    id: ID!
    name: String!
    slug: String!
    description: String
    fields: [Field!]!
    createdAt: String!
    updatedAt: String!
  }

  type Field {
    id: ID!
    name: String!
    slug: String!
    type: FieldType!
    required: Boolean!
    multiple: Boolean!
    description: String
    validations: [Validation]
  }

  enum FieldType {
    TEXT
    RICH_TEXT
    NUMBER
    BOOLEAN
    DATE
    MEDIA
    REFERENCE
  }

  type Validation {
    type: String!
    params: String
  }

  type Content {
    id: ID!
    contentType: ContentType!
    title: String!
    slug: String!
    status: ContentStatus!
    fields: [ContentField!]!
    createdBy: User!
    updatedBy: User
    createdAt: String!
    updatedAt: String!
    publishedAt: String
  }

  type ContentField {
    fieldId: ID!
    fieldName: String!
    value: String!
  }

  enum ContentStatus {
    DRAFT
    PUBLISHED
    ARCHIVED
  }

  type Media {
    id: ID!
    filename: String!
    mimetype: String!
    size: Int!
    url: String!
    createdBy: User!
    createdAt: String!
    updatedAt: String!
  }

  type AuthPayload {
    token: String!
    user: User!
  }

  # Inputs
  input CreateUserInput {
    username: String!
    email: String!
    password: String!
    role: String!
  }

  input LoginInput {
    email: String!
    password: String!
  }

  input CreateContentTypeInput {
    name: String!
    slug: String!
    description: String
    fields: [FieldInput!]!
  }

  input UpdateContentTypeInput {
    name: String
    description: String
    fields: [FieldInput!]
  }

  input FieldInput {
    name: String!
    slug: String!
    type: FieldType!
    required: Boolean!
    multiple: Boolean!
    description: String
    validations: [ValidationInput]
  }

  input ValidationInput {
    type: String!
    params: String
  }

  input CreateContentInput {
    contentTypeId: ID!
    title: String!
    slug: String!
    status: ContentStatus!
    fields: [ContentFieldInput!]!
  }

  input UpdateContentInput {
    title: String
    slug: String
    status: ContentStatus
    fields: [ContentFieldInput!]
  }

  input ContentFieldInput {
    fieldId: ID!
    value: String!
  }

  input ContentFilterInput {
    contentTypeId: ID
    status: ContentStatus
  }

  # Queries and Mutations
  type Query {
    # User queries
    me: User
    users: [User!]!
    user(id: ID!): User

    # Content Type queries
    contentTypes: [ContentType!]!
    contentType(id: ID!): ContentType

    # Content queries
    contents(filter: ContentFilterInput): [Content!]!
    content(id: ID!): Content
    contentBySlug(contentTypeSlug: String!, slug: String!): Content

    # Media queries
    medias: [Media!]!
    media(id: ID!): Media
  }

  type Mutation {
    # Auth mutations
    register(input: CreateUserInput!): AuthPayload!
    login(input: LoginInput!): AuthPayload!
    guestLogin: AuthPayload!

    # Content Type mutations
    createContentType(input: CreateContentTypeInput!): ContentType!
    updateContentType(id: ID!, input: UpdateContentTypeInput!): ContentType!
    deleteContentType(id: ID!): Boolean!

    # Content mutations
    createContent(input: CreateContentInput!): Content!
    updateContent(id: ID!, input: UpdateContentInput!): Content!
    deleteContent(id: ID!): Boolean!
    publishContent(id: ID!): Content!
    unpublishContent(id: ID!): Content!

    # Media mutations
    deleteMedia(id: ID!): Boolean!
  }
`;