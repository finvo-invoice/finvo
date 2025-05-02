const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

// Initialize Supabase client
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

class ProjectService {
  async getAllProjects(userId, supabase) {
    try {
      console.log('Fetching projects for user:', userId);
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching projects:', error);
        throw error;
      }

      // Format the data for frontend
      const formattedData = await Promise.all(data.map(async project => {
        // Get metadata for each project
        const metadata = await this.getProjectMetadata(project.id, userId, supabase);
        
        return {
          id: project.id,
          projectName: project.project_name,
          clientName: project.client_name,
          numberOfFiles: project.number_of_files,
          unitPrice: project.unit_price,
          total: project.total,
          projectStatus: project.project_status,
          paymentStatus: project.payment_status,
          userId: project.user_id,
          createdAt: project.created_at,
          updatedAt: project.updated_at,
          notes: metadata.notes || '',
          links: metadata.links || ''
        };
      }));

      console.log(`Fetched ${formattedData.length} projects`);
      return formattedData;
    } catch (error) {
      console.error('ProjectService.getAllProjects error:', error);
      throw error;
    }
  }

  async getProjectById(id, userId, supabase) {
    try {
      console.log('Fetching project by ID:', id, 'for user:', userId);
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .eq('id', id)
        .eq('user_id', userId)
        .single();

      if (error) {
        console.error('Error fetching project:', error);
        throw error;
      }

      // Format the data for frontend
      if (!data) return null;
      
      // Get metadata for the project
      const metadata = await this.getProjectMetadata(id, userId, supabase);
      
      const formattedData = {
        id: data.id,
        projectName: data.project_name,
        clientName: data.client_name,
        numberOfFiles: data.number_of_files,
        unitPrice: data.unit_price,
        total: data.total,
        projectStatus: data.project_status,
        paymentStatus: data.payment_status,
        userId: data.user_id,
        createdAt: data.created_at,
        updatedAt: data.updated_at,
        notes: metadata.notes || '',
        links: metadata.links || ''
      };
      
      console.log('Project fetched successfully:', formattedData);
      return formattedData;
    } catch (error) {
      console.error('ProjectService.getProjectById error:', error);
      throw error;
    }
  }

  validateProjectData(projectData) {
    const errors = [];
    
    // Validate number_of_files
    const numberOfFiles = parseInt(projectData.number_of_files || projectData.numberOfFiles);
    if (isNaN(numberOfFiles) || numberOfFiles <= 0) {
      errors.push('Number of files must be greater than 0');
    }
    if (numberOfFiles > Number.MAX_SAFE_INTEGER) {
      errors.push(`Number of files cannot exceed ${Number.MAX_SAFE_INTEGER}`);
    }

    // Validate unit_price
    const unitPrice = parseFloat(projectData.unit_price || projectData.unitPrice);
    if (isNaN(unitPrice) || unitPrice <= 0) {
      errors.push('Unit price must be greater than 0');
    }
    if (unitPrice > 9999999999.99) { // Max value for numeric(12,2)
      errors.push('Unit price cannot exceed 9,999,999,999.99');
    }

    // Validate total
    const total = numberOfFiles * unitPrice;
    if (total > 999999999999999.99) { // Max value for numeric(15,2)
      errors.push('Total amount would exceed maximum allowed value of 999,999,999,999,999.99');
    }

    if (errors.length > 0) {
      throw new Error(errors.join('. '));
    }

    // Return the validated and parsed values
    return {
      numberOfFiles,
      unitPrice,
      total
    };
  }

  async createProject(projectData, userId, supabase) {
    try {
      console.log('Creating project for user:', userId);
      console.log('Project data:', projectData);

      // Validate project data and get parsed values
      const validatedData = this.validateProjectData(projectData);

      // If clientName doesn't match any existing client, create a basic client record
      const { data: existingClients } = await supabase
        .from('clients')
        .select('name')
        .eq('user_id', userId)
        .eq('name', projectData.clientName);

      if (!existingClients || existingClients.length === 0) {
        console.log('Creating new client with basic info:', projectData.clientName);
        
        // Prepare the new client data with all required fields
        const newClientData = {
          name: projectData.clientName,
          user_id: userId,
          has_gst: 'false',  // Required field as TEXT, not boolean
          company_details: JSON.stringify({
            address: '',
            phone: '',
            email: '',
            gst: '',
            notes: 'Created via quick project creation'
          }),
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };

        console.log('Attempting to create new client with data:', newClientData);
        
        const { data: newClient, error: clientError } = await supabase
          .from('clients')
          .insert([newClientData])
          .select()
          .single();

        if (clientError) {
          console.error('Error creating basic client:', clientError);
          // Provide more detailed error message
          const errorMessage = clientError.message || 'Failed to create client';
          throw new Error(`Client creation failed: ${errorMessage}`);
        }

        if (!newClient) {
          throw new Error('No data returned after client creation');
        }

        console.log('Successfully created new client:', newClient);
      }

      // Convert camelCase to snake_case for database and ensure user_id is set
      const projectWithUserId = {
        project_name: projectData.projectName,
        client_name: projectData.clientName,
        number_of_files: validatedData.numberOfFiles,
        unit_price: validatedData.unitPrice,
        total: validatedData.total,
        project_status: 'Not Started', // Default value
        payment_status: 'Pending', // Default value
        start_date: projectData.startDate ? new Date(projectData.startDate).toISOString() : new Date().toISOString(),
        end_date: projectData.endDate ? new Date(projectData.endDate).toISOString() : new Date().toISOString(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        user_id: userId
      };
      
      console.log('Inserting project with data:', projectWithUserId);

      const { data, error } = await supabase
        .from('projects')
        .insert([projectWithUserId])
        .select()
        .single();

      if (error) {
        console.error('Error creating project:', error);
        throw new Error(error.message);
      }

      if (!data) {
        throw new Error('No data returned after project creation');
      }

      // Store notes and links in the project_metadata table
      const metadata = {
        notes: projectData.notes || '',
        links: projectData.links || ''
      };
      
      await this.storeProjectMetadata(data.id, metadata, userId, supabase);

      // Convert snake_case back to camelCase for frontend
      const formattedData = {
        id: data.id,
        projectName: data.project_name,
        clientName: data.client_name,
        numberOfFiles: data.number_of_files,
        unitPrice: data.unit_price,
        total: data.total,
        projectStatus: data.project_status,
        paymentStatus: data.payment_status,
        userId: data.user_id,
        createdAt: data.created_at,
        updatedAt: data.updated_at,
        notes: metadata.notes,
        links: metadata.links
      };

      console.log('Project created successfully:', formattedData);
      return formattedData;
    } catch (error) {
      console.error('ProjectService.createProject error:', error);
      throw error;
    }
  }

  // Helper method to store project metadata in the database or fallback to memory
  async storeProjectMetadata(projectId, metadata, userId, supabaseClient) {
    try {
      console.log(`Storing metadata for project ${projectId}, user ${userId}:`, metadata);
      
      // Use the provided supabase client or the default one
      const client = supabaseClient || supabase;
      
      try {
        // Check if metadata already exists for this project
        const { data: existingData, error: checkError } = await client
          .from('project_metadata')
          .select('id')
          .eq('project_id', projectId)
          .single();
        
        if (checkError && checkError.code !== 'PGRST116') { // PGRST116 is "no rows returned"
          // If the error is that the table doesn't exist, fall back to memory storage
          if (checkError.code === '42P01') { // 42P01 is "relation does not exist"
            throw new Error('Table does not exist');
          }
          console.error('Error checking existing metadata:', checkError);
          throw checkError;
        }
        
        let result;
        
        if (existingData) {
          // Update existing metadata
          const { data, error } = await client
            .from('project_metadata')
            .update({
              notes: metadata.notes,
              links: metadata.links,
              updated_at: new Date().toISOString()
            })
            .eq('project_id', projectId)
            .select()
            .single();
          
          if (error) {
            console.error('Error updating project metadata:', error);
            throw error;
          }
          
          result = data;
          console.log('Updated existing metadata:', result);
        } else {
          // Insert new metadata
          const { data, error } = await client
            .from('project_metadata')
            .insert([{
              project_id: projectId,
              user_id: userId,
              notes: metadata.notes,
              links: metadata.links
            }])
            .select()
            .single();
          
          if (error) {
            console.error('Error inserting project metadata:', error);
            throw error;
          }
          
          result = data;
          console.log('Inserted new metadata:', result);
        }
        
        // Always store in memory as well for redundancy
        this.storeProjectMetadataInMemory(projectId, metadata, userId);
        
        return result;
      } catch (dbError) {
        // If there's any database error, fall back to memory storage
        console.error('Database error, falling back to memory storage:', dbError);
        this.storeProjectMetadataInMemory(projectId, metadata, userId);
        return null;
      }
    } catch (error) {
      console.error('Error in storeProjectMetadata:', error);
      
      // Fallback to global variable if database operation fails
      console.log('Falling back to global variable storage');
      this.storeProjectMetadataInMemory(projectId, metadata, userId);
      
      return null;
    }
  }

  // Helper method to retrieve project metadata from the database or fallback to memory
  async getProjectMetadata(projectId, userId, supabaseClient) {
    try {
      console.log(`Retrieving metadata for project ${projectId}, user ${userId}`);
      
      // Use the provided supabase client or the default one
      const client = supabaseClient || supabase;
      
      try {
        // Get metadata from database
        const { data, error } = await client
          .from('project_metadata')
          .select('notes, links')
          .eq('project_id', projectId)
          .eq('user_id', userId)
          .single();
        
        if (error) {
          // If the error is that the table doesn't exist, fall back to memory retrieval
          if (error.code === '42P01') { // 42P01 is "relation does not exist"
            throw new Error('Table does not exist');
          }
          
          console.error('Error retrieving project metadata:', error);
          
          // If no rows found, try memory retrieval
          if (error.code === 'PGRST116') {
            console.log('No metadata found in database, trying memory retrieval');
            return this.getProjectMetadataFromMemory(projectId, userId);
          }
          
          throw error;
        }
        
        console.log('Retrieved metadata from database:', data);
        const result = {
          notes: data.notes || '',
          links: data.links || ''
        };
        
        // Store in memory for redundancy
        this.storeProjectMetadataInMemory(projectId, result, userId);
        
        return result;
      } catch (dbError) {
        // If there's any database error, fall back to memory retrieval
        console.error('Database error, falling back to memory retrieval:', dbError);
        return this.getProjectMetadataFromMemory(projectId, userId);
      }
    } catch (error) {
      console.error('Error in getProjectMetadata:', error);
      
      // Fallback to global variable if database operation fails
      console.log('Falling back to global variable retrieval');
      return this.getProjectMetadataFromMemory(projectId, userId);
    }
  }
  
  // Fallback method to store metadata in memory
  storeProjectMetadataInMemory(projectId, metadata, userId) {
    try {
      console.log(`Storing metadata in memory for project ${projectId}, user ${userId}`);
      // In Node.js environment, we'll use a global variable
      if (typeof global.projectMetadata === 'undefined') {
        console.log('Initializing global.projectMetadata');
        global.projectMetadata = {};
      }
      
      if (typeof global.projectMetadata[userId] === 'undefined') {
        console.log(`Initializing metadata for user ${userId}`);
        global.projectMetadata[userId] = {};
      }
      
      global.projectMetadata[userId][projectId] = metadata;
      console.log(`Successfully stored metadata in memory for project ${projectId}`);
    } catch (error) {
      console.error('Error storing project metadata in memory:', error);
    }
  }
  
  // Fallback method to retrieve metadata from memory
  getProjectMetadataFromMemory(projectId, userId) {
    try {
      console.log(`Retrieving metadata from memory for project ${projectId}, user ${userId}`);
      // In Node.js environment, we'll use a global variable
      if (typeof global.projectMetadata === 'undefined') {
        console.log('global.projectMetadata is undefined');
        return { notes: '', links: '' };
      }
      
      if (typeof global.projectMetadata[userId] === 'undefined') {
        console.log(`No metadata found for user ${userId}`);
        return { notes: '', links: '' };
      }
      
      if (typeof global.projectMetadata[userId][projectId] === 'undefined') {
        console.log(`No metadata found for project ${projectId}`);
        return { notes: '', links: '' };
      }
      
      console.log(`Retrieved metadata from memory for project ${projectId}`);
      return global.projectMetadata[userId][projectId];
    } catch (error) {
      console.error('Error retrieving project metadata from memory:', error);
      return { notes: '', links: '' };
    }
  }

  async updateProject(id, projectData, userId, supabase) {
    try {
      console.log('Updating project:', id, 'for user:', userId);
      console.log('Update data:', projectData);
      
      // First verify the project belongs to the user
      const { data: project, error: fetchError } = await supabase
        .from('projects')
        .select('*')
        .eq('id', id)
        .eq('user_id', userId)
        .single();

      if (fetchError || !project) {
        throw new Error('Project not found or access denied');
      }

      // Validate project data and get parsed values
      const validatedData = this.validateProjectData(projectData);

      // Prepare the data for update
      const updateData = {
        project_name: projectData.projectName,
        client_name: projectData.clientName,
        number_of_files: validatedData.numberOfFiles,
        unit_price: validatedData.unitPrice,
        total: validatedData.total,
        project_status: projectData.projectStatus,
        payment_status: projectData.paymentStatus,
        updated_at: new Date().toISOString()
      };

      console.log('Updating project with data:', updateData);

      const { data, error } = await supabase
        .from('projects')
        .update(updateData)
        .eq('id', id)
        .eq('user_id', userId)
        .select()
        .single();

      if (error) {
        console.error('Error updating project:', error);
        throw new Error(error.message);
      }

      // Store notes and links in the project_metadata table
      const metadata = {
        notes: projectData.notes || '',
        links: projectData.links || ''
      };
      
      await this.storeProjectMetadata(id, metadata, userId, supabase);

      // Format the response
      const formattedData = {
        id: data.id,
        projectName: data.project_name,
        clientName: data.client_name,
        numberOfFiles: data.number_of_files,
        unitPrice: data.unit_price,
        total: data.total,
        projectStatus: data.project_status,
        paymentStatus: data.payment_status,
        userId: data.user_id,
        createdAt: data.created_at,
        updatedAt: data.updated_at,
        notes: metadata.notes,
        links: metadata.links
      };
      
      console.log('Project updated successfully:', formattedData);
      return formattedData;
    } catch (error) {
      console.error('ProjectService.updateProject error:', error);
      throw error;
    }
  }

  async deleteProject(id, userId, supabase) {
    try {
      console.log('Deleting project:', id, 'for user:', userId);
      
      // First verify the project belongs to the user
      const { data: project, error: fetchError } = await supabase
        .from('projects')
        .select('id')
        .eq('id', id)
        .eq('user_id', userId)
        .single();

      if (fetchError) {
        console.error('Error verifying project ownership:', fetchError);
        throw new Error('Project not found or access denied');
      }

      // Delete project metadata first (this will be automatically handled by the ON DELETE CASCADE constraint)
      console.log('Deleting project metadata');
      const { error: metadataError } = await supabase
        .from('project_metadata')
        .delete()
        .eq('project_id', id)
        .eq('user_id', userId);

      if (metadataError) {
        console.error('Error deleting project metadata:', metadataError);
        // Continue with project deletion even if metadata deletion fails
      }

      // Delete the project
      console.log('Deleting project');
      const { error } = await supabase
        .from('projects')
        .delete()
        .eq('id', id)
        .eq('user_id', userId);

      if (error) {
        console.error('Error deleting project:', error);
        throw error;
      }

      console.log('Project deleted successfully');
      return { success: true };
    } catch (error) {
      console.error('ProjectService.deleteProject error:', error);
      throw error;
    }
  }
}

module.exports = new ProjectService(); 