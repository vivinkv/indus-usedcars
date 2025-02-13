module.exports = () => ({
  documentation: {
    enabled: false,
  },
  seo: {
    enabled: true,
  },
  'strapi5-excel-export': {
    enabled: true,
    resolve: './src/plugins/excel-export'
  },

  
});
