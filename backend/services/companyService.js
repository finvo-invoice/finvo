const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

class CompanyService {
  async getAllCompanies(userId, supabase) {
    try {
      console.log('Fetching companies for user:', userId);
      const { data, error } = await supabase
        .from('companies')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching companies:', error);
        throw error;
      }

      // Format the data for frontend
      const formattedData = data.map(company => ({
        id: company.id,
        name: company.name,
        address: company.address,
        email: company.email,
        phone: company.phone,
        gst: company.gst,
        pan: company.pan,
        logo_url: company.logo_url,
        bankDetails: typeof company.bank_details === 'string' 
          ? JSON.parse(company.bank_details)
          : company.bank_details || {},
        userId: company.user_id,
        createdAt: company.created_at,
        updatedAt: company.updated_at
      }));

      return formattedData;
    } catch (error) {
      console.error('CompanyService.getAllCompanies error:', error);
      throw error;
    }
  }

  async getCompanyById(id, userId, supabase) {
    try {
      const { data, error } = await supabase
        .from('companies')
        .select('*')
        .eq('id', id)
        .eq('user_id', userId)
        .single();

      if (error) {
        console.error('Error fetching company:', error);
        throw error;
      }

      // Format the data for frontend
      const formattedData = data ? {
        id: data.id,
        name: data.name,
        address: data.address,
        email: data.email,
        phone: data.phone,
        gst: data.gst,
        pan: data.pan,
        logo_url: data.logo_url,
        bankDetails: typeof data.bank_details === 'string' 
          ? JSON.parse(data.bank_details)
          : data.bank_details || {},
        userId: data.user_id,
        createdAt: data.created_at,
        updatedAt: data.updated_at
      } : null;

      return formattedData;
    } catch (error) {
      console.error('CompanyService.getCompanyById error:', error);
      throw error;
    }
  }

  async createCompany(companyData, userId, supabase) {
    try {
      let logoUrl = null;

      // Handle logo upload if provided
      if (companyData.logo) {
        try {
          console.log('Logo file received:', {
            originalname: companyData.logo.originalname,
            mimetype: companyData.logo.mimetype,
            size: companyData.logo.size
          });

          const file = companyData.logo;
          const fileExt = file.originalname.split('.').pop();
          const fileName = `${userId}_${Date.now()}.${fileExt}`;

          console.log('Attempting to upload file:', fileName);

          const { data: uploadData, error: uploadError } = await supabase.storage
            .from('company_logos')
            .upload(fileName, file.buffer, {
              contentType: file.mimetype,
              cacheControl: '3600',
              upsert: false
            });

          if (uploadError) {
            console.error('Supabase storage upload error:', uploadError);
            throw uploadError;
          }

          console.log('File uploaded successfully:', uploadData);

          // Get public URL for the uploaded logo
          const { data: { publicUrl } } = supabase.storage
            .from('company_logos')
            .getPublicUrl(fileName);

          console.log('Generated public URL:', publicUrl);
          logoUrl = publicUrl;
        } catch (error) {
          console.error('Error in logo upload process:', error);
          throw error;
        }
      }

      // Format the company data for creation
      const company = {
        name: companyData.name,
        address: companyData.address,
        email: companyData.email,
        phone: companyData.phone,
        gst: companyData.gst,
        pan: companyData.pan || '', // Always include pan, default to empty string
        logo_url: logoUrl,
        bank_details: typeof companyData.bankDetails === 'string'
          ? JSON.parse(companyData.bankDetails)
          : companyData.bankDetails || {},
        user_id: userId
      };

      console.log('Creating company with data:', company);

      // Try to insert with the complete data
      let insertResult = await supabase
        .from('companies')
        .insert([company])
        .select()
        .single();

      // Check for any remaining errors
      if (insertResult.error) {
        console.error('Error creating company in database:', insertResult.error);
        throw insertResult.error;
      }

      const data = insertResult.data;

      // Format the response data for frontend
      const formattedData = {
        id: data.id,
        name: data.name,
        address: data.address,
        email: data.email,
        phone: data.phone,
        gst: data.gst,
        pan: data.pan || '', // Always include pan in response
        logo_url: data.logo_url,
        bankDetails: data.bank_details,
        userId: data.user_id,
        createdAt: data.created_at,
        updatedAt: data.updated_at
      };

      return formattedData;
    } catch (error) {
      console.error('CompanyService.createCompany error:', error);
      throw error;
    }
  }

  async updateCompany(id, companyData, userId, supabase) {
    try {
      let logoUrl = null;

      // First verify the company belongs to the user
      const { data: existingCompany, error: fetchError } = await supabase
        .from('companies')
        .select('*')
        .eq('id', id)
        .eq('user_id', userId)
        .single();

      if (fetchError || !existingCompany) {
        throw new Error('Company not found or access denied');
      }

      // Handle logo upload if provided
      if (companyData.logo) {
        try {
          // Delete old logo if exists
          if (existingCompany.logo_url) {
            const oldFileName = existingCompany.logo_url.split('/').pop();
            console.log('Attempting to delete old logo:', oldFileName);
            
            const { error: deleteError } = await supabase.storage
              .from('company_logos')
              .remove([oldFileName]);
              
            if (deleteError) {
              console.error('Error deleting old logo:', deleteError);
            }
          }

          // Upload new logo
          const file = companyData.logo;
          const fileExt = file.originalname.split('.').pop();
          const fileName = `${userId}_${Date.now()}.${fileExt}`;

          console.log('Attempting to upload new file:', fileName);

          const { data: uploadData, error: uploadError } = await supabase.storage
            .from('company_logos')
            .upload(fileName, file.buffer, {
              contentType: file.mimetype,
              cacheControl: '3600',
              upsert: false
            });

          if (uploadError) {
            console.error('Supabase storage upload error:', uploadError);
            throw uploadError;
          }

          console.log('File uploaded successfully:', uploadData);

          // Get public URL for the uploaded logo
          const { data: { publicUrl } } = supabase.storage
            .from('company_logos')
            .getPublicUrl(fileName);

          console.log('Generated public URL:', publicUrl);
          logoUrl = publicUrl;
        } catch (error) {
          console.error('Error in logo upload process:', error);
          throw error;
        }
      }

      // Format the company data
      const company = {
        name: companyData.name,
        address: companyData.address,
        email: companyData.email,
        phone: companyData.phone,
        gst: companyData.gst,
        pan: companyData.pan || '', // Always include pan, default to empty string
        ...(logoUrl && { logo_url: logoUrl }),
        bank_details: typeof companyData.bankDetails === 'string'
          ? JSON.parse(companyData.bankDetails)
          : companyData.bankDetails
      };

      console.log('Updating company with data:', company);

      // Try to update with the complete data
      let updateResult = await supabase
        .from('companies')
        .update(company)
        .eq('id', id)
        .eq('user_id', userId)
        .select()
        .single();

      // Check for any remaining errors
      if (updateResult.error) {
        console.error('Error updating company in database:', updateResult.error);
        throw updateResult.error;
      }

      const data = updateResult.data;

      // Format the response data for frontend
      const formattedData = {
        id: data.id,
        name: data.name,
        address: data.address,
        email: data.email,
        phone: data.phone,
        gst: data.gst,
        pan: data.pan || '', // Always include pan in response
        logo_url: data.logo_url,
        bankDetails: data.bank_details,
        userId: data.user_id,
        createdAt: data.created_at,
        updatedAt: data.updated_at
      };

      return formattedData;
    } catch (error) {
      console.error('CompanyService.updateCompany error:', error);
      throw error;
    }
  }

  async deleteCompany(id, userId, supabase) {
    try {
      // First verify the company belongs to the user
      const { data: company, error: fetchError } = await supabase
        .from('companies')
        .select('logo_url')
        .eq('id', id)
        .eq('user_id', userId)
        .single();

      if (fetchError || !company) {
        throw new Error('Company not found or access denied');
      }

      // Delete logo if exists
      if (company.logo_url) {
        const fileName = company.logo_url.split('/').pop();
        const { error: deleteError } = await supabase.storage
          .from('company_logos')
          .remove([fileName]);

        if (deleteError) {
          console.error('Error deleting logo:', deleteError);
        }
      }

      const { error } = await supabase
        .from('companies')
        .delete()
        .eq('id', id)
        .eq('user_id', userId);

      if (error) {
        console.error('Error deleting company:', error);
        throw error;
      }

      return true;
    } catch (error) {
      console.error('CompanyService.deleteCompany error:', error);
      throw error;
    }
  }
}

module.exports = new CompanyService(); 