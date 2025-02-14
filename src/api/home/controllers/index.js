"use strict";

/**
 * A set of functions called "actions" for `index`
 */

module.exports = {
  index: async (ctx, next) => {
    try {

     
      const featuredCars=await strapi.documents("api::car.car").findMany({
        filters: {
          Featured: true,
        },
        populate:['Brand','Model','Outlet','Fuel_Type','Image'],
      })

      const featuredBrands=await strapi.documents("api::brand.brand").findMany({
        filters: {
          Featured: true,
        },
        populate:['*'],
      })

      const featuredLocation=await strapi.documents("api::location.location").findMany({
        filters: {
          Featured: true,
        },
        populate:['*'],
      })

      const featuredFuelType=await strapi.documents("api::fuel-type.fuel-type").findMany({
        filters: {
          Featured: true,
        },
        populate:['*'],
      })

      const recommendedCars=await strapi.documents("api::car.car").findMany({
        filters: {
          Recommended: true,
        },
        populate:['Brand','Model','Outlet','Fuel_Type','Image'],
      })

      const newlyadded=await strapi.documents("api::car.car").findMany({
        filters: {
          createdAt: {
            $gt: new Date(new Date().getTime() - 5 * 24 * 60 * 60 * 1000).toISOString()
          }
        },
        populate:['Brand','Model','Outlet','Fuel_Type','Image'],
        limit: 20
      })

      const chooseNextCars=await strapi.documents("api::car.car").findMany({
        filters: {
          Choose_Next: true,
        },
        populate:['Brand','Model','Outlet','Fuel_Type','Image'],
      })

      const indexPage = await strapi.documents("api::home.home").findMany({
        populate: {
          Banner_Section: {
            populate: "*",
          },
          Journey: {
            populate: {
              Journey: {
                populate: "*",
              },
            },
          },
          Buy_Sell: {
            populate: "*",
          },
          Insight: {
            populate:{
              Features: {
                populate: {
                  Image:{
                    populate:'*'
                  }
                },
              },
              Button: {
                populate: "*",
              },
            }
          },
          Testimonials: {
            populate:{
              Author:{
                populate:'*'
              }
            }
          },
          
          FAQ: {
            populate: "*",
          },
          Price:{
            populate:"*"
          },
          SEO: {
            populate: {
              Meta_Image: {
                populate: "*",
              },
              Meta_Social: {
                populate: "*",
              },
            },
          },
        },
      });
      ctx.body = {
        data:{
          ...indexPage[0],
          related_sections: {
            brands: featuredBrands,
            locations: featuredLocation,
            fuel_types: featuredFuelType,
            featured: featuredCars,
            choose_next: chooseNextCars,
            recommended: recommendedCars,
            newlyadded: newlyadded,
          }
        }
        
      };
    } catch (err) {
      ctx.body = err;
    }
  },
};
