const supabase = require('../config/supabase');

class InvoiceNumberService {
  constructor(supabaseClient) {
    this.supabase = supabaseClient || supabase;
  }

  async getNextInvoiceNumber(userId) {
    try {
      // Call the simpler function to get next invoice number
      const { data, error } = await this.supabase.rpc('get_next_invoice_number', {
        user_id_param: userId
      });
            
      if (error) {
        console.error('Error getting next invoice number:', error);
        return `${new Date().getFullYear()}001`; // Default fallback
      }

      return data || `${new Date().getFullYear()}001`;
    } catch (error) {
      console.error('Error in getNextInvoiceNumber:', error);
      return `${new Date().getFullYear()}001`; // Safe fallback
    }
  }

  async incrementInvoiceNumber(userId) {
    try {
      // Call the simpler function to increment the invoice number
      const { data, error } = await this.supabase.rpc('increment_invoice_number', {
        user_id_param: userId
      });
      
      if (error) {
        console.error('Error incrementing invoice number:', error);
      
        // Try direct update as fallback
        const { data: counter } = await this.supabase
        .from('invoice_counters')
          .select('last_invoice_number')
        .eq('user_id', userId)
          .single();
      
        if (!counter) {
          // Create new counter
          const { data: newCounter, error: insertError } = await this.supabase
            .from('invoice_counters')
            .insert([{ user_id: userId, last_invoice_number: 2025002 }])
            .select()
            .single();
            
          if (insertError) {
            console.error('Error creating counter:', insertError);
          }

          return newCounter?.last_invoice_number || 2025002;
        }

        // Increment existing counter
        const newValue = (counter.last_invoice_number || 2025001) + 1;
        const { data: updated, error: updateError } = await this.supabase
        .from('invoice_counters')
        .update({ last_invoice_number: newValue })
          .eq('user_id', userId)
          .select()
          .single();
        
      if (updateError) {
        console.error('Error updating counter:', updateError);
        }

        return updated?.last_invoice_number || newValue;
      }
      
      return data || 2025002;
    } catch (error) {
      console.error('Error incrementing invoice number:', error);
      return 2025002; // Safe default
    }
  }
}

module.exports = new InvoiceNumberService(); 