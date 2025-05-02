const supabase = require('../config/supabase');

class ClientService {
  async getAllClients(userId, supabase) {
    try {
      console.log('Fetching clients for user:', userId);
      const { data, error } = await supabase
        .from('clients')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching clients:', error);
        throw error;
      }

      // Format the data for frontend
      const formattedData = data.map(client => ({
        id: client.id,
        name: client.name,
        companyDetails: client.company_details,
        hasGst: client.has_gst,
        gstNumber: client.gst_number,
        userId: client.user_id,
        createdAt: client.created_at,
        updatedAt: client.updated_at
      }));

      return formattedData;
    } catch (error) {
      console.error('ClientService.getAllClients error:', error);
      throw error;
    }
  }

  async getClientById(id, userId, supabase) {
    try {
      const { data, error } = await supabase
        .from('clients')
        .select('*')
        .eq('id', id)
        .eq('user_id', userId)
        .single();

      if (error) {
        console.error('Error fetching client:', error);
        throw error;
      }

      // Format the data for frontend
      const formattedData = data ? {
        id: data.id,
        name: data.name,
        companyDetails: data.company_details,
        hasGst: data.has_gst,
        gstNumber: data.gst_number,
        userId: data.user_id,
        createdAt: data.created_at,
        updatedAt: data.updated_at
      } : null;

      return formattedData;
    } catch (error) {
      console.error('ClientService.getClientById error:', error);
      throw error;
    }
  }

  async createClient(clientData, userId, supabase) {
    try {
      console.log('Creating client with data:', clientData);

      // Format the client data for database
      const client = {
        name: clientData.name,
        company_details: clientData.companyDetails,
        has_gst: clientData.hasGst,
        gst_number: clientData.gstNumber,
        user_id: userId
      };

      console.log('Formatted client data:', client);

      const { data, error } = await supabase
        .from('clients')
        .insert([client])
        .select()
        .single();

      if (error) {
        console.error('Error creating client:', error);
        throw error;
      }

      // Format the response data for frontend
      const formattedData = {
        id: data.id,
        name: data.name,
        companyDetails: data.company_details,
        hasGst: data.has_gst,
        gstNumber: data.gst_number,
        userId: data.user_id,
        createdAt: data.created_at,
        updatedAt: data.updated_at
      };

      return formattedData;
    } catch (error) {
      console.error('ClientService.createClient error:', error);
      throw error;
    }
  }

  async updateClient(id, clientData, userId, supabase) {
    try {
      console.log('Updating client with data:', clientData);

      // Format the client data for database
      const client = {
        name: clientData.name,
        company_details: clientData.companyDetails,
        has_gst: clientData.hasGst,
        gst_number: clientData.gstNumber
      };

      const { data, error } = await supabase
        .from('clients')
        .update(client)
        .eq('id', id)
        .eq('user_id', userId)
        .select()
        .single();

      if (error) {
        console.error('Error updating client:', error);
        throw error;
      }

      // Format the response data for frontend
      const formattedData = {
        id: data.id,
        name: data.name,
        companyDetails: data.company_details,
        hasGst: data.has_gst,
        gstNumber: data.gst_number,
        userId: data.user_id,
        createdAt: data.created_at,
        updatedAt: data.updated_at
      };

      return formattedData;
    } catch (error) {
      console.error('ClientService.updateClient error:', error);
      throw error;
    }
  }

  async deleteClient(id, userId, supabase) {
    try {
      const { error } = await supabase
        .from('clients')
        .delete()
        .eq('id', id)
        .eq('user_id', userId);

      if (error) {
        console.error('Error deleting client:', error);
        throw error;
      }

      return true;
    } catch (error) {
      console.error('ClientService.deleteClient error:', error);
      throw error;
    }
  }
}

module.exports = new ClientService(); 