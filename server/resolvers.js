import { User, ContentType, Content, Media } from './models/index.js';
import { generateToken, isAuthenticated, hasRole } from './utils/auth.js';

export const resolvers = {
  Query: {
    // User queries
    me: (_, __, { user }) => {
      isAuthenticated(user);
      return user;
    },
    users: async (_, __, { user }) => {
      hasRole(user, 'admin');
      return await User.find();
    },
    user: async (_, { id }, { user }) => {
      hasRole(user, 'admin');
      return await User.findById(id);
    },

    // Content Type queries
    contentTypes: async () => {
      return await ContentType.find();
    },
    contentType: async (_, { id }) => {
      return await ContentType.findById(id);
    },

    // Content queries
    contents: async (_, { filter = {} }) => {
      const query = {};
      
      if (filter.contentTypeId) {
        query.contentType = filter.contentTypeId;
      }
      
      if (filter.status) {
        query.status = filter.status;
      }
      
      return await Content.find(query)
        .populate('contentType')
        .populate('createdBy')
        .populate('updatedBy');
    },
    content: async (_, { id }) => {
      return await Content.findById(id)
        .populate('contentType')
        .populate('createdBy')
        .populate('updatedBy');
    },
    contentBySlug: async (_, { contentTypeSlug, slug }) => {
      const contentType = await ContentType.findOne({ slug: contentTypeSlug });
      if (!contentType) return null;
      
      return await Content.findOne({ contentType: contentType._id, slug })
        .populate('contentType')
        .populate('createdBy')
        .populate('updatedBy');
    },

    // Media queries
    medias: async () => {
      return await Media.find().populate('createdBy');
    },
    media: async (_, { id }) => {
      return await Media.findById(id).populate('createdBy');
    },
  },

  Mutation: {
    // Auth mutations
    register: async (_, { input }) => {
      const { username, email, password, role } = input;
      
      // Check if user already exists
      const existingUser = await User.findOne({ $or: [{ email }, { username }] });
      if (existingUser) {
        throw new Error('User already exists');
      }
      
      // Create new user
      const user = new User({ username, email, password, role });
      await user.save();
      
      // Generate token
      const token = generateToken(user);
      
      return { token, user };
    },
    login: async (_, { input }) => {
      const { email, password } = input;
      
      // Find user
      const user = await User.findOne({ email });
      if (!user) {
        throw new Error('Invalid credentials');
      }
      
      // Check password
      const isMatch = await user.comparePassword(password);
      if (!isMatch) {
        throw new Error('Invalid credentials');
      }
      
      // Generate token
      const token = generateToken(user);
      
      return { token, user };
    },
    guestLogin: async () => {
      // Find or create a guest user
      let guestUser = await User.findOne({ username: 'guest' });
      
      if (!guestUser) {
        guestUser = new User({
          username: 'guest',
          email: 'guest@example.com',
          password: 'guest123', // This won't be used for login
          role: 'author',
        });
        await guestUser.save();
      }
      
      // Generate token with limited expiration
      const token = generateToken(guestUser, '24h');
      
      return { token, user: guestUser };
    },

    // Content Type mutations
    createContentType: async (_, { input }, { user }) => {
      hasRole(user, 'admin');
      
      const contentType = new ContentType(input);
      await contentType.save();
      
      return contentType;
    },
    updateContentType: async (_, { id, input }, { user }) => {
      hasRole(user, 'admin');
      
      const contentType = await ContentType.findByIdAndUpdate(
        id,
        { $set: input },
        { new: true }
      );
      
      if (!contentType) {
        throw new Error('Content type not found');
      }
      
      return contentType;
    },
    deleteContentType: async (_, { id }, { user }) => {
      hasRole(user, 'admin');
      
      // Check if there are contents using this content type
      const contentCount = await Content.countDocuments({ contentType: id });
      if (contentCount > 0) {
        throw new Error('Cannot delete content type with existing content');
      }
      
      const result = await ContentType.deleteOne({ _id: id });
      return result.deletedCount > 0;
    },

    // Content mutations
    createContent: async (_, { input }, { user }) => {
      isAuthenticated(user);
      
      const { contentTypeId, title, slug, status, fields } = input;
      
      // Check if content type exists
      const contentType = await ContentType.findById(contentTypeId);
      if (!contentType) {
        throw new Error('Content type not found');
      }
      
      // Check if slug is unique for this content type
      const existingContent = await Content.findOne({
        contentType: contentTypeId,
        slug,
      });
      
      if (existingContent) {
        throw new Error('Slug must be unique for this content type');
      }
      
      // Create content
      const content = new Content({
        contentType: contentTypeId,
        title,
        slug,
        status,
        fields,
        createdBy: user._id,
        publishedAt: status === 'PUBLISHED' ? new Date() : null,
      });
      
      await content.save();
      
      return await Content.findById(content._id)
        .populate('contentType')
        .populate('createdBy');
    },
    updateContent: async (_, { id, input }, { user }) => {
      isAuthenticated(user);
      
      const content = await Content.findById(id);
      if (!content) {
        throw new Error('Content not found');
      }
      
      // Check if user has permission
      if (user.role !== 'admin' && user.role !== 'editor' && 
          content.createdBy.toString() !== user._id.toString()) {
        throw new Error('Not authorized to update this content');
      }
      
      // Check if slug is unique if changing
      if (input.slug && input.slug !== content.slug) {
        const existingContent = await Content.findOne({
          contentType: content.contentType,
          slug: input.slug,
          _id: { $ne: id },
        });
        
        if (existingContent) {
          throw new Error('Slug must be unique for this content type');
        }
      }
      
      // Update publishedAt if status is changing to PUBLISHED
      if (input.status === 'PUBLISHED' && content.status !== 'PUBLISHED') {
        input.publishedAt = new Date();
      } else if (input.status && input.status !== 'PUBLISHED') {
        input.publishedAt = null;
      }
      
      // Update content
      const updatedContent = await Content.findByIdAndUpdate(
        id,
        { 
          $set: { 
            ...input, 
            updatedBy: user._id 
          } 
        },
        { new: true }
      )
        .populate('contentType')
        .populate('createdBy')
        .populate('updatedBy');
      
      return updatedContent;
    },
    deleteContent: async (_, { id }, { user }) => {
      isAuthenticated(user);
      
      const content = await Content.findById(id);
      if (!content) {
        throw new Error('Content not found');
      }
      
      // Check if user has permission
      if (user.role !== 'admin' && user.role !== 'editor' && 
          content.createdBy.toString() !== user._id.toString()) {
        throw new Error('Not authorized to delete this content');
      }
      
      const result = await Content.deleteOne({ _id: id });
      return result.deletedCount > 0;
    },
    publishContent: async (_, { id }, { user }) => {
      isAuthenticated(user);
      hasRole(user, ['admin', 'editor']);
      
      const content = await Content.findById(id);
      if (!content) {
        throw new Error('Content not found');
      }
      
      const updatedContent = await Content.findByIdAndUpdate(
        id,
        { 
          $set: { 
            status: 'PUBLISHED',
            publishedAt: new Date(),
            updatedBy: user._id 
          } 
        },
        { new: true }
      )
        .populate('contentType')
        .populate('createdBy')
        .populate('updatedBy');
      
      return updatedContent;
    },
    unpublishContent: async (_, { id }, { user }) => {
      isAuthenticated(user);
      hasRole(user, ['admin', 'editor']);
      
      const content = await Content.findById(id);
      if (!content) {
        throw new Error('Content not found');
      }
      
      const updatedContent = await Content.findByIdAndUpdate(
        id,
        { 
          $set: { 
            status: 'DRAFT',
            publishedAt: null,
            updatedBy: user._id 
          } 
        },
        { new: true }
      )
        .populate('contentType')
        .populate('createdBy')
        .populate('updatedBy');
      
      return updatedContent;
    },

    // Media mutations
    deleteMedia: async (_, { id }, { user }) => {
      isAuthenticated(user);
      
      const media = await Media.findById(id);
      if (!media) {
        throw new Error('Media not found');
      }
      
      // Check if user has permission
      if (user.role !== 'admin' && media.createdBy.toString() !== user._id.toString()) {
        throw new Error('Not authorized to delete this media');
      }
      
      const result = await Media.deleteOne({ _id: id });
      return result.deletedCount > 0;
    },
  },
};