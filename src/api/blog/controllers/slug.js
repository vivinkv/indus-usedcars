const axios = require("axios");
("use strict");

/**
 * A set of functions called "actions" for `slug`
 */

module.exports = {
  getBlog: async (ctx, next) => {
    try {
      const { slug } = ctx.params;
      const blog = await strapi.documents("api::blog.blog").findFirst({
        filters: {
          Slug: slug,
        },
        populate: {
          Featured_Image: {
            populate: "*",
          },
          Banner_Image: {
            populate: "*",
          },
          SEO: {
            populate: {
              Meta_Image: {
                populate: "*",
              },
            },
          },
          Author: {
            populate: "*",
          },
        },
      });

      if (!blog) {
        ctx.status = 404;
        ctx.body = { error: "Blog not found" };
        return;
      }

      ctx.status = 200;
      ctx.body = { data: blog };
    } catch (err) {
      ctx.body = err;
    }
  },
  fetchBlog: async (ctx, next) => {
    try {
      console.log("blog running");
        // Helper function to upload image using Strapi's upload API
        const uploadImage = async (filePath) => {
          try {
            // Trim and encode file path
            const cleanedPath = filePath?.trim().replaceAll(/ /g, '%20');
            if (!cleanedPath) return null;

            const response = await axios.get(
              `https://indususedcars.com/${cleanedPath}`,
              {
                responseType: "arraybuffer",
              }
            );

            // Create FormData for Strapi upload
            const formData = new FormData();
            const blob = new Blob([response.data], {
              type: response.headers["content-type"],
            });
            formData.append("files", blob, `image_${Date.now()}.jpg`);

            // Upload to Strapi
            const uploadResponse = await axios.post(
              `${process.env.STRAPI_URL || "http://localhost:1337"}/api/upload`,
              formData,
              {
                headers: {
                  "Content-Type": "multipart/form-data",
                },
              }
            );

            // Return the first uploaded file's ID
            return uploadResponse.data[0]?.id || null;
          } catch (error) {
            console.error("Error uploading image:", error);
            return { error: true, message: error.message, filePath };
          }
        };

        // Track failed uploads
        const failedUploads = [];

        // Upload images with retry logic
        const uploadWithRetry = async (filePath, blog, retries = 3) => {
          for (let i = 0; i < retries; i++) {
            const result = await uploadImage(filePath);
            if (result && !result.error) return result;
            await new Promise((resolve) => setTimeout(resolve, 1000));
          }
          failedUploads.push({ filePath, slug: blog?.slug });
          return null;
        };
      const blogsCount = await axios.get(`https://indususedcars.com/api/pages`);
      let blogList;
      for (let i = 1; i <= blogsCount?.data?.last_page; i++) { 
        blogList = await axios.get(
          `https://indususedcars.com/api/pages?page=${i}`
        );

        for (const blog of blogList?.data?.data) {
          if (blog?.type == "Blog") {
            const findBlog = await strapi
              .documents("api::blog.blog")
              .findFirst({
                filters: {
                  Slug: blog?.slug,
                },
                populate: ['Featured_Image', 'Banner_Image', 'SEO.Meta_Image']
              });
            if (!findBlog) {
              console.log("yes");

              const blogDetail = (
                await axios.get(
                  `https://indususedcars.com/api/pages/${blog?.slug}`
                )
              ).data;

              const featuredImageId = await uploadWithRetry(
                blogDetail?.featured_image?.file_path
                , blog
              );
              const bannerImageId = await uploadWithRetry(
                blogDetail?.banner_image?.file_path
                , blog
              );
              const metaImageId = await uploadWithRetry(
                blogDetail?.og_image?.file_path
                , blog
              );

              // Truncate long text fields to 255 characters
              const truncate = (str, maxLength = 255) =>
                str && str.length > maxLength
                  ? str.substring(0, maxLength)
                  : str;

              // Create blog data
              const blogData = {
                Title: truncate(blogDetail?.name),
                Slug: truncate(blogDetail?.slug),
                Primary_Heading: truncate(blogDetail?.primary_heading),
                Short_Description: blogDetail?.short_description || "",
                Content: blogDetail?.content || "",
                Top_Description: blogDetail?.top_description || "",
                Bottom_Description: blogDetail?.bottom_description || "",
                Featured_Image: featuredImageId
                  ? { id: featuredImageId }
                  : null,
                Banner_Image: bannerImageId ? { id: bannerImageId } : null,
                SEO: {
                  Meta_Title: truncate(blogDetail?.browser_title),
                  Meta_Description: truncate(blogDetail?.meta_description),
                  Meta_Image: metaImageId ? { id: metaImageId } : null,
                  OG_Title: truncate(blogDetail?.og_title),
                  OG_Description: blogDetail?.og_description || "",
                  Keywords: truncate(blogDetail?.keywords),
                  Meta_Robots: truncate(blogDetail?.meta_robots),
                  Structured_Data: blogDetail?.structured_data
                    ? JSON.parse(blogDetail.structured_data)
                    : null,
                  Meta_Viewport: truncate(blogDetail?.meta_viewport),
                  Canonical_URL: truncate(blogDetail?.canonical_url),
                },
                Author: {
                  Name: truncate(blogDetail?.author_details?.name),
                  Email: truncate(blogDetail?.author_details?.email),
                  Email_Verified_At:
                    blogDetail?.author_details?.email_verified_at || null,
                  Banner_At: blogDetail?.author_details?.banner_at || null,
                },
                publishedAt: blogDetail?.created_at || new Date(),
              };

              // Create and publish the blog
              try {
                const createdBlog = await strapi
                  .documents("api::blog.blog")
                  .create({
                    data: blogData,
                    status:'published',
                    populate: [
                      "Featured_Image",
                      "Banner_Image",
                      "SEO.Meta_Image",
                      "Author",
                    ],
                  });

                console.log({ createdBlog });

                await strapi.documents("api::blog.blog").update({
                  where: { id: createdBlog.id },
                  data: { publishedAt: blogDetail?.created_at },
                });
              } catch (error) {
                console.error("Error creating blog:", error);
                continue; // Skip to next blog on any error
              }
            } else {
              console.log(findBlog);

              // Check and update images if needed 
              const updateData = {};

              // Check and handle Featured_Image
              if (!findBlog.Featured_Image) {
                console.log('yes');
                console.log(blog?.featured_image?.file_path);
                
                
                const blogDetail = (
                  await axios.get(
                    `https://indususedcars.com/api/pages/${blog?.slug}`
                  )
                ).data;
               
                const featuredImageId = await uploadWithRetry(
                  blogDetail?.featured_image?.file_path
                  , blog
                );
                console.log({featuredImageId,id:blogDetail?.id});
                
                if (featuredImageId) {
                  console.log('yes insider');
                  
                  updateData.Featured_Image = { id: featuredImageId };
                }
                console.log('end');
                
              }

              // Check and handle Banner_Image
              if (!findBlog.Banner_Image) {
                console.log('yes');
                console.log(blog?.banner_image?.file_path);
                
                const blogDetail = (
                  await axios.get(
                    `https://indususedcars.com/api/pages/${blog?.slug}`
                  )
                ).data;
               
                const bannerImageId = await uploadWithRetry(
                  blogDetail?.banner_image?.file_path
                  , blog
                );
                console.log(bannerImageId);
                
               
                if (bannerImageId) {
                  console.log('yes insider');
                  updateData.Banner_Image = { id: bannerImageId };
                }
                console.log('end');
              }

              // Check and handle SEO.Meta_Image
              if (!findBlog.SEO?.Meta_Image) {
               
                console.log(blog?.og_image?.file_path);
                const blogDetail = (
                  await axios.get(
                    `https://indususedcars.com/api/pages/${blog?.slug}`
                  )
                ).data;
                const metaImageId = await uploadWithRetry(
                  blogDetail?.og_image?.file_path
                  , blog
                );
                console.log(metaImageId);
                
                if (metaImageId) {
                  
                  updateData.SEO = {
                    ...findBlog.SEO,
                    Meta_Image: { id: metaImageId }
                  };
                }
               
              }

              // Update blog if any images were missing
              console.log(Object.keys(updateData).length > 0,Object.keys(updateData));
              
              if (Object.keys(updateData).length > 0) {
                try {
                  const updatedBlog= await strapi.documents("api::blog.blog").update({
                    documentId: findBlog.documentId,
                    data: updateData,
                    status:'published'
                  });
                  console.log({updatedBlog});
                } catch (error) {
                  console.error("Error updating blog:", error);
                  continue; // Skip to next blog on any error
                }
              }

            

              console.log("done");
            }
          }
        }
      }

      // After all processing, log failed uploads
      if (failedUploads.length > 0) {
        console.log("Failed to upload these images:");
        console.table(failedUploads);
      }

      ctx.status = 200;
      ctx.body = {
        data: {
          success: true,
          msg: "Uploaded Successfully",
        },
      };
    } catch (err) {
      console.error("Error in fetchBlog:", err);
      ctx.status = 500;
      ctx.body = {
        error: "Internal Server Error",
        details: err.message,
      };
    }
  },
  blogsList: async (ctx, next) => {
    try {
      console.log('working');
      
      const { start = 0, limit = 10 } = ctx.query;

      // Get total count of blogs
      const total = await strapi.documents("api::blog.blog").count();

      // Fetch paginated results
      const results = await strapi.documents("api::blog.blog").findMany({
        start: Number(start),
        limit: Number(limit),
        status: "published",
        populate: {
          Featured_Image: {
            populate: "*",
          },
          Banner_Image: {
            populate: "*",
          },
          SEO: {
            populate: {
              Meta_Image: {
                populate: "*",
              },
            },
          },
          Author: {
            populate: "*",
          },
        },
      });

      ctx.status = 200;
      ctx.body = {
        data: results,
        meta: {
          pagination: {
            firstPage: 1,
            current_page: Number(start) + 1,
            limit: Number(limit),
            total: total,
            lastPage: Math.ceil(total / Number(limit)),
          },
        },
      };
    } catch (err) {
      ctx.status = 500;
      ctx.body = {
        error: "Internal Server Error",
        details: err.message,
      };
    }
  },
  updateBlogStatus: async (ctx, next) => {
    try {
      const blogs=await strapi.documents('api::blog.blog').findMany({
        status:'draft'
      })

      for(const blog of blogs){
        console.log({blog});
        // const updatedBlog=await strapi.documents('api::blog.blog').update({
        //   data:{
        //     publishedAt:new Date()
        //   },
        //   status:'published'
        // })
        const updatedBlog=await strapi.documents('api::blog.blog').publish({
          documentId:blog.documentId,
          status:'published'
        })
        console.log({updatedBlog});
        
      }

      ctx.body={
        data:{
          success:true,
          msg:'Updated Successfully'
        }
      }
    }
    catch (err) {
      ctx.status = 500;
      ctx.body = {
        error: "Internal Server Error",
        details: err.message,
      };
}
}
}
