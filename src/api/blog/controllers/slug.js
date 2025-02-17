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
  }
};
