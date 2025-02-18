'use strict';

/**
 * A set of functions called "actions" for `menus`
 */

module.exports = {
  menus: async (ctx, next) => {
    try {
      const general=await strapi.documents('api::general.general').findFirst({
        populate:'*'
      })
      const location=await strapi.documents('api::location.location').findMany({});
      console.log(location);
      
      const menu=await strapi.documents('api::menu.menu').findFirst({
        populate:{
          Header:{
            populate:'*'
          },
          Footer:{ 
            populate:{
              Page:{
                populate:'*'
              }
            }
          }
        }
      })
      ctx.status=200
      ctx.body ={data:{...menu,...general,location:location}};
    } catch (err) {
      ctx.status=500
      ctx.body = err;
    }
  }
};
