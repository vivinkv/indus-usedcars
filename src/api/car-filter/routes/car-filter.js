module.exports = {
  routes: [
    {
     method: 'GET',
     path: '/car-filter',
     handler: 'car-filter.filters',
     config: {
       auth:false,
       policies: [],
       middlewares: [],
     },
    },
    {
      method: 'GET',
      path: '/car-filter/search-brand',
      handler: 'car-filter.searchBrand',
      config: {
        auth: false,
        policies: [],
        middlewares: [],
      },
    },{
      method: 'GET',
      path: '/car-filter/filter/:location',
      handler: 'car-filter.filterCars',
      config: {
        auth: false,
        policies: [],
        middlewares: [],
      },
    }
  ],
};
