module.exports = {
  routes: [
    {
     method: 'GET',
     path: '/getcars',
     handler: 'cars.getCars',
     config: {
       policies: [],
       middlewares: [],
     },
    },
    {
      method:'GET',
      path:'/getcars/updateSlug',
      handler:'cars.updateSlug',
      config: {
        auth:false,
        policies: [],
        middlewares: [],
      },
    }
  ],
};
