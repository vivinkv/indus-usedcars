"use strict";

/**
 * A set of functions called "actions" for `index`
 */

module.exports = {
  index: async (ctx, next) => {
    try {
      const indexPage = await strapi.documents("api::home.home").findMany({
        populate: {
          Banner_Section: {
            populate: "*",
          },
          Featured_Cars: {
            populate: {
              Brand: {
                populate: "*",
              },
              Model: {
                populate: "*",
              },
              Outlet: {
                populate: "*",
              },
              Fuel_Type: {
                populate: "*",
              },
              Vehicle_Category: { populate: "*" },
            },
          },
          Journey: {
            populate: {
              Journey:{
                populate:'*'
              }
            },
           
          },
          Buy_Sell: {
            populate: "*",
          },
          Insight: {
            populate: '*',
            
          },
          Testimonials: {
            populate: "*",
          },
          Brands: {
            populate: "*",
          },
          FAQ: {
            populate: "*",
          },
          SEO: {
            populate: "*",
          },
        },
      });
      ctx.body = indexPage;
    } catch (err) {
      ctx.body = err;
    }
  },
};
