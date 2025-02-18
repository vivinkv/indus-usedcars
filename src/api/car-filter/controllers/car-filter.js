"use strict";

/**
 * A set of functions called "actions" for `car-filter`
 */

module.exports = {
  filters: async (ctx, next) => {
    try {
      const manimum_price = await strapi.documents("api::car.car").findMany({
        sort: "PSP:asc",
        limit: 1,
      });
      const minimumPrice = manimum_price[0]?.PSP;

      const maximum_price = await strapi.documents("api::car.car").findMany({
        sort: "PSP:desc",
        limit: 1,
      });
      const maximumPrice = maximum_price[0]?.PSP;

      const max_year = await strapi.documents("api::car.car").findMany({
        sort: "Year_Of_Month:desc",
        limit: 1,
      });
      const maxYear = max_year[0]?.Year_Of_Month;

      const min_year = await strapi.documents("api::car.car").findMany({
        sort: "Year_Of_Month:asc",
        limit: 1,
      });
      const minYear = min_year[0]?.Year_Of_Month;

      const min_kilometers = await strapi.documents("api::car.car").findMany({
        sort: "Kilometers:asc",
        limit: 1,
      });
      const minKilometers = min_kilometers[0]?.Kilometers;

      const max_kilometers = await strapi.documents("api::car.car").findMany({
        sort: "Kilometers:desc",
        limit: 1,
      });
      const maxKilometers = max_kilometers[0]?.Kilometers;

      const Fuels = await strapi
        .documents("api::fuel-type.fuel-type")
        .findMany({
          populate: "*",
        });

      // const brands = await strapi.documents("api::brand.brand").findMany({
      //   populate: "*",
      // });

      // const models = await strapi.documents("api::model.model").findMany({
      //   populate: "*",
      // });

      ctx.status = 200;
      ctx.body = {
        data: {
          Price: {
            Minimum: minimumPrice,
            Maximum: maximumPrice,
          },
          Year: {
            Maximum: maxYear,
            Minimum: minYear,
          },
          Kilometers: {
            Maximum: maxKilometers,
            Minimum: minKilometers,
          },
          Transmission: [
            {
              id: 1,
              name: "Automatic",
            },
            {
              id: 2,
              name: "Manual",
            },
          ],
          Fuel_Type: Fuels || [],
          // Brands: brands || [],
          // Models: models?.data || [],
        },
      };
    } catch (err) {
      ctx.status = 500;
      ctx.body = err;
    }
  },
  searchBrand: async (ctx, next) => {
    try {
      const { search, page = 1, limit = 10 } = ctx.query;
      const pagination = {
        page: parseInt(page),
        pageSize: parseInt(limit),
        start: (page - 1) * limit,
        limit: parseInt(limit),
      };
      let count = await strapi.documents("api::brand.brand").count();

      let brand;
      if (!search) {
        brand = await strapi.documents("api::brand.brand").findMany({
          populate: "*",
          limit: pagination.limit,
          start: pagination.start,
        });
        console.log(brand);

        ctx.status = 200;
        ctx.body = {
          data: brand || [],
          meta: {
            page: pagination.page,
            pageSize: pagination.pageSize,
            totalPage: Math.ceil(count / pagination.limit),
            pageCount: count || 0,
          },
        };
        return;
      }

      brand = await strapi.documents("api::brand.brand").findMany({
        filters: {
          Name: {
            $containsi: search,
          },
        },
        limit: pagination.limit,
        start: pagination.start,
      });
      count = await strapi.documents("api::brand.brand").count({
        filters: {
          Name: {
            $containsi: search,
          },
        },
      });
      ctx.status = 200;
      ctx.body = {
        data: brand || [],
        meta: {
          page: pagination.page,
          pageSize: pagination.pageSize,
          totalPage: Math.ceil(count / pagination.limit),
          pageCount: count || 0,
        },
      };
    } catch (error) {
      ctx.status = 500;
      ctx.body = error;
    }
  },
  staticContent:async(ctx,next)=>{
    try {
      const {location}=ctx.params;
      const static_content=await strapi.documents('api::location.location').findFirst({
        filters:{
          Slug:location
        },
        populate:{
          Offer_Section:{
            populate:'*'
          },
          Exclusive_Section:{
            populate:'*'
          },
          Assurance_Section:{
            populate:'*'
          },
          Benefit_Section:{
            populate:'*'
          },
          SEO:{
            populate:{
              Meta_Image:{
                populate:'*'
              }
            }
          }
        }
      })

      ctx.status=200;
      ctx.body={
        data:static_content
      }
    } catch (error) {
        ctx.status=500;
        ctx.body=error
    }
  },
  filterCars: async (ctx, next) => {
    try {
      const { location } = ctx.params;
      const { fuel, brand, transmission, year, kilometers, price, page = 1, pageSize = 10 } = ctx.query;
      console.log(ctx.query);

      // Calculate pagination values
      const limit = parseInt(pageSize);
      const start = (parseInt(page) - 1) * limit;

      // Build filters dynamically based on provided query parameters
      const filters = {};

      // Add location filter based on slug
      if (location) {
        filters.Location = {
          Slug: location,
        };
      }

      if (fuel) {
        filters.Fuel_Type = {
          Name: fuel,
        };
      }
      if (brand) {
        filters.Brand = {
          Name: {
            $containsi: brand,
          },
        };
      }
      if (transmission) {
        filters.Transmission_Type = transmission;
      }
      if (year) {
        filters.Year_Of_Month = {
          $lte: parseInt(year), // Filter for years less than or equal to selected
        };
      }
      if (kilometers) {
        filters.Kilometers = {
          $lte: parseInt(kilometers), // Filter for kilometers less than or equal to selected
        };
      }
      if (price) {
        filters.PSP = {
          $lte: parseInt(price), // Filter for price less than or equal to selected
        };
      }
      const locationPage=await strapi.documents('api::location.location').findFirst({
        filters:{
          Slug:location
        }
      })
      // Fetch cars with dynamic filters and pagination
      const [cars, count] = await Promise.all([
        strapi.documents("api::car.car").findMany({
          filters: Object.keys(filters).length > 0 ? filters : undefined,
          populate: ["Brand", "Model", "Outlet", "Fuel_Type", "Image"],
          limit,
          start,
        }),
        strapi.documents("api::car.car").count({
          filters: Object.keys(filters).length > 0 ? filters : undefined,
        }),
      ]);

      ctx.status = 200;
      ctx.body = {
        data: cars,
        meta: {
          filtersApplied: Object.keys(filters),
          pagination: {
            page: parseInt(page),
            pageSize: limit,
            total: count,
            pageCount: Math.ceil(count / limit),
          },
        },
      };
    } catch (error) {
      ctx.status = 500;
      ctx.body = error;
    }
  },
};
