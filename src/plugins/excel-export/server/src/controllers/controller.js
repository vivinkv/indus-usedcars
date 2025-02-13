const controller = ({ strapi }) => ({
  index(ctx) {
    ctx.body = strapi
      .plugin('excel-export')
      // the name of the service file & the method.
      .service('service')
      
  },
  msg(ctx) {
    ctx.body={
      message: "Welcome to Strapi 🚀",
      env:process.env.BACKEND_URL
    }
  },
  async exportLeads(ctx) {
    const { from, to } = ctx.query;
    const filters = {};
    if (from && to) {
      filters.createdAt = { $gte: from, $lte: to };
    }
    const leads = await strapi.entityService.findMany('api::lead.lead', { filters });
    
    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet('Leads');
    sheet.addRow(['ID', 'Name', 'Email', 'Created At']);
    leads.forEach(lead => {
      sheet.addRow([lead.id, lead.name, lead.email, lead.createdAt]);
    });
    
    ctx.set('Content-Disposition', 'attachment; filename=leads.xlsx');
    ctx.set('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    ctx.body = await workbook.xlsx.writeBuffer();
  },
});

export default controller;
