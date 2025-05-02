/**
 * Dashboard Service
 * Handles fetching dashboard statistics from Supabase
 */

/**
 * Get dashboard statistics for a user
 * @param {string} userId - The user ID
 * @param {object} supabase - The Supabase client instance
 * @returns {object} Dashboard statistics
 */
const getDashboardStats = async (userId, supabase) => {
  try {
    console.log('Fetching dashboard stats for user:', userId);

    // Initialize default values
    let projects = [];
    let companies = [];
    let clients = [];
    let invoices = [];

    try {
      // Get projects
      const { data: projectsData, error: projectsError } = await supabase
        .from('projects')
        .select('id, project_name, project_status, created_at')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });
      
      if (projectsError) {
        console.error('Error fetching projects:', projectsError);
        // Continue with empty projects array instead of throwing
      } else {
        projects = projectsData || [];
      }
    } catch (error) {
      console.error('Exception fetching projects:', error);
      // Continue with empty projects array
    }
    
    try {
      // Get companies count
      const { data: companiesData, error: companiesError } = await supabase
        .from('companies')
        .select('id, name, created_at')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });
      
      if (companiesError) {
        console.error('Error fetching companies:', companiesError);
        // Continue with empty companies array instead of throwing
      } else {
        companies = companiesData || [];
      }
    } catch (error) {
      console.error('Exception fetching companies:', error);
      // Continue with empty companies array
    }
    
    try {
      // Get clients count
      const { data: clientsData, error: clientsError } = await supabase
        .from('clients')
        .select('id, name, created_at')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });
      
      if (clientsError) {
        console.error('Error fetching clients:', clientsError);
        // Continue with empty clients array instead of throwing
      } else {
        clients = clientsData || [];
      }
    } catch (error) {
      console.error('Exception fetching clients:', error);
      // Continue with empty clients array
    }
    
    try {
      // Get invoices and calculate total revenue
      const { data: invoicesData, error: invoicesError } = await supabase
        .from('invoices')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });
      
      if (invoicesError) {
        console.error('Error fetching invoices:', invoicesError);
        // Continue with empty invoices array instead of throwing
      } else {
        invoices = invoicesData || [];
      }
    } catch (error) {
      console.error('Exception fetching invoices:', error);
      // Continue with empty invoices array
    }
    
    // Calculate total revenue
    const totalRevenue = invoices.reduce((sum, invoice) => sum + parseFloat(invoice.total || 0), 0);
    
    // Get recent invoices (last 5)
    const recentInvoices = invoices.slice(0, 5);
    
    // Get recent projects (last 5)
    const recentProjects = projects.slice(0, 5).map(project => ({
      id: project.id,
      name: project.project_name || 'Unnamed Project',
      status: project.project_status || 'Unknown',
      created_at: project.created_at
    }));

    // Calculate monthly revenue
    const currentDate = new Date();
    const currentMonth = currentDate.getMonth();
    const currentYear = currentDate.getFullYear();
    
    const monthlyRevenue = invoices.reduce((sum, invoice) => {
      try {
        const invoiceDate = new Date(invoice.date);
        if (invoiceDate.getMonth() === currentMonth && invoiceDate.getFullYear() === currentYear) {
          return sum + parseFloat(invoice.total || 0);
        }
      } catch (error) {
        console.error('Error parsing invoice date:', error);
      }
      return sum;
    }, 0);

    // Prepare response with both new and old format for backward compatibility
    const stats = {
      counts: {
        projects: projects.length,
        companies: companies.length,
        clients: clients.length,
        invoices: invoices.length
      },
      revenue: {
        total: totalRevenue,
        monthly: monthlyRevenue
      },
      financials: {
        totalRevenue: totalRevenue,
        averageInvoiceValue: invoices.length > 0 ? totalRevenue / invoices.length : 0
      },
      recent: {
        invoices: recentInvoices,
        projects: recentProjects
      }
    };

    console.log('Successfully fetched dashboard stats');
    return stats;

  } catch (error) {
    console.error('Error in getDashboardStats:', error);
    
    // Return default stats instead of throwing
    return {
      counts: {
        projects: 0,
        companies: 0,
        clients: 0,
        invoices: 0
      },
      revenue: {
        total: 0,
        monthly: 0
      },
      financials: {
        totalRevenue: 0,
        averageInvoiceValue: 0
      },
      recent: {
        invoices: [],
        projects: []
      }
    };
  }
};

module.exports = {
  getDashboardStats
}; 