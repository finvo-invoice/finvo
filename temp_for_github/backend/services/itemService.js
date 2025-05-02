const supabase = require('../config/supabase');

class ItemService {
  async getAllItems() {
    const { data, error } = await supabase
      .from('items')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  }

  async getItemById(id) {
    const { data, error } = await supabase
      .from('items')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    return data;
  }

  async createItem(itemData) {
    const { name, description, logo } = itemData;
    let logoUrl = null;

    // Handle logo upload if provided
    if (logo) {
      const fileName = `${Date.now()}-${logo.name}`;
      const { data, error } = await supabase.storage
        .from('logos')
        .upload(fileName, logo);

      if (error) throw error;

      // Get public URL for the uploaded file
      const { data: { publicUrl } } = supabase.storage
        .from('logos')
        .getPublicUrl(fileName);

      logoUrl = publicUrl;
    }

    // Create item with logo URL
    const { data, error } = await supabase
      .from('items')
      .insert([
        {
          name,
          description,
          logo_url: logoUrl
        }
      ])
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async updateItem(id, itemData) {
    const { name, description, logo } = itemData;
    const updates = { name, description };

    // Handle logo upload if provided
    if (logo) {
      const fileName = `${Date.now()}-${logo.name}`;
      const { data, error } = await supabase.storage
        .from('logos')
        .upload(fileName, logo);

      if (error) throw error;

      // Get public URL for the uploaded file
      const { data: { publicUrl } } = supabase.storage
        .from('logos')
        .getPublicUrl(fileName);

      updates.logo_url = publicUrl;
    }

    const { data, error } = await supabase
      .from('items')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async deleteItem(id) {
    // Get item to find logo URL
    const { data: item } = await supabase
      .from('items')
      .select('logo_url')
      .eq('id', id)
      .single();

    // Delete logo from storage if exists
    if (item?.logo_url) {
      const fileName = item.logo_url.split('/').pop();
      await supabase.storage
        .from('logos')
        .remove([fileName]);
    }

    // Delete item
    const { error } = await supabase
      .from('items')
      .delete()
      .eq('id', id);

    if (error) throw error;
    return true;
  }
}

module.exports = new ItemService(); 