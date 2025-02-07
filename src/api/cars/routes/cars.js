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
  ],
};
