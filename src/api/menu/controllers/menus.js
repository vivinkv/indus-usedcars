'use strict';

/**
 * A set of functions called "actions" for `menus`
 */

module.exports = {
  menus: async (ctx, next) => {
    try {
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
      ctx.body ={data:menu};
    } catch (err) {
      ctx.status=500
      ctx.body = err;
    }
  }
};
