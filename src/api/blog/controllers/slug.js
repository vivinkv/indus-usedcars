const axios=require('axios');
'use strict';

/**
 * A set of functions called "actions" for `slug`
 */

module.exports = {
  getBlog: async (ctx, next) => {
    try {
      const {slug}=ctx.params;
      const blog=await strapi.documents('api::blog.blog').findFirst({
        filters:{
          Slug:slug
        }
      })
      ctx.status=200
      ctx.body={data:blog}
    } catch (err) {
      ctx.body = err;
    }
  },
  fetchBlog: async (ctx, next) => {
    try {
      let page=1;
      const blogsList=await axios.get(`https://indususedcars.com/api/pages?page=${page}`);

      for(const blog of blogsList?.data?.data){
        if(blog?.type=='Blog'){
          const findBlog=await strapi.documents('api::blog.blog').findFirst({
            filters:{
              Slug:blog?.slug
            }
          })
          if(!findBlog){
            const blogDetail=await axios.get(`https://indususedcars.com/api/pages/${blog?.slug}`)
            await strapi.documents('api::blog.blog').create({
              data:{
                Title:blog?.name,
                Slug:blog?.slug,
            }})
          }
        }
        
      }

      const {slug}=ctx.params;
      const blog=await strapi.documents('api::blog.blog').findFirst({
        filters:{
          Slug:slug
        }
      })
      ctx.status=200
      ctx.body={data:blog}
    } catch (err) {
      ctx.body = err;
    }
  }
};
