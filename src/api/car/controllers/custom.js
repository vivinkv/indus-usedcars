'use strict';

/**
 * A set of functions called "actions" for `custom`
 */

module.exports = {
  getBySlug: async (ctx, next) => {
    try {
      const {slug}=ctx.params;

      const cars=await strapi.documents('api::car.car').findFirst({
        filters:{
          Slug:slug
        },
        populate:{
          Brand:{
            populate:'*'
          },
          Model:{
            populate:'*'
          },
          Outlet:{
            populate:'*'
          },
          Fuel_Type:{
            populate:'*'
          },
          Vehicle_Category:{
            populate:'*'
          },
          Image:{
            populate:'*'
          },
          Inspection_Report:{
            populate:'*'
          },
          Find_More:{
            populate:'*'
          },
          Location:{
            populate:'*'
          },
          SEO:{
            populate:{
              Meta_Image:{
                populate:'*'
              },
            }
          }
        }
      })
      ctx.status=200;
      ctx.body = {
        data: cars
      };
    } catch (err) {
      ctx.status=500
      ctx.body = err;
    }
  }
};
