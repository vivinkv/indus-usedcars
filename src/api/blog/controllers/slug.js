const axios = require("axios");
const path = require("path");
const fs = require("fs");
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
      const failedUploads = [];
      const failedBlogs = [];

      const uploadImage = async (filePath) => {
        if (!filePath) return null;
        try {
          const cleanedPath = filePath?.trim().replaceAll(/ /g, '%20');
          if (!cleanedPath) return null;

          const response = await axios.get(
            `https://indususedcars.com/${cleanedPath}`,
            {
              responseType: "arraybuffer",
              timeout: 30000,
              maxContentLength: 10 * 1024 * 1024
            }
          );

          const formData = new FormData();
          const blob = new Blob([response.data], {
            type: response.headers["content-type"] || 'image/jpeg'
          });
          formData.append("files", blob, `image_${Date.now()}.jpg`);

          const uploadResponse = await axios.post(
            `${process.env.STRAPI_URL || "http://localhost:1337"}/api/upload`,
            formData,
            {
              headers: { "Content-Type": "multipart/form-data" },
              timeout: 30000
            }
          );

          return uploadResponse.data[0]?.id || null;
        } catch (error) {
          console.error("Error uploading image:", error.message);
          return null;
        }
      };

      const uploadWithRetry = async (filePath, blog, retries = 3) => {
        for (let i = 0; i < retries; i++) {
          const result = await uploadImage(filePath);
          if (result) return result;
          await new Promise(resolve => setTimeout(resolve, 2000));
        }
        failedUploads.push({ filePath, slug: blog?.slug });
        return null;
      };

      const blogsCount = await axios.get(`https://indususedcars.com/api/pages`);
      let blogList;

      for (let i = 1; i <= blogsCount?.data?.last_page; i++) {
        try {
          blogList = await axios.get(`https://indususedcars.com/api/pages?page=${i}`);

          for (const blog of blogList?.data?.data) {
            if (blog?.type !== "Blog") continue;

            try {
              const existingBlog = await strapi.documents("api::blog.blog").findFirst({
                filters: { Slug: blog?.slug },
                populate: ['Featured_Image', 'Banner_Image', 'SEO.Meta_Image']
              });

              if (!existingBlog) {
                const blogDetail = (await axios.get(`https://indususedcars.com/api/pages/${blog?.slug}`)).data;
                const featuredImageId = await uploadWithRetry(blogDetail?.featured_image?.file_path, blog);
                const bannerImageId = await uploadWithRetry(blogDetail?.banner_image?.file_path || blogDetail?.featured_image?.file_path, blog);
                const metaImageId = await uploadWithRetry(blogDetail?.og_image?.file_path || blogDetail?.featured_image?.file_path, blog);

                const truncate = (str, maxLength = 255) => str && str.length > maxLength ? str.substring(0, maxLength) : str;

                const blogData = {
                  Title: truncate(blogDetail?.name),
                  Slug: truncate(blogDetail?.slug),
                  Content: blogDetail?.content || "",
                  Featured_Image: featuredImageId ? { id: featuredImageId } : null,
                  Banner_Image: bannerImageId ? { id: bannerImageId } : null,
                  SEO: {
                    Meta_Image: metaImageId ? { id: metaImageId } : null
                  },
                  publishedAt: blogDetail?.created_at || new Date()
                };

                await strapi.documents("api::blog.blog").create({
                  data: blogData,
                  status: 'published'
                });
              }
            } catch (error) {
              console.error(`Error processing blog ${blog?.slug}:`, error.message);
              failedBlogs.push({
                slug: blog?.slug,
                error: error.message,
                stage: 'processing'
              });
              continue;
            }
          }
        } catch (error) {
          console.error(`Error fetching page ${i}:`, error.message);
          continue;
        }
      }

      if (failedUploads.length > 0) {
        console.log("Failed uploads:", failedUploads);
      }

      if (failedBlogs.length > 0) {
        console.log("Failed blogs:", failedBlogs);
      }

      ctx.status = 200;
      ctx.body = {
        data: {
          success: true,
          msg: "Import completed with some skipped items",
          failedUploads,
          failedBlogs
        }
      };
    } catch (err) {
      ctx.status = 500;
      ctx.body = {
        error: "Internal Server Error",
        details: err.message
      };
    }
  },

  blogsList: async (ctx, next) => {
    try {
      console.log('working');

      const { start = 1, limit = 10 } = ctx.query;

      // Get total count of blogs
      const total = await strapi.documents("api::blog.blog").count();

      // Fetch paginated results
      const results = await strapi.documents("api::blog.blog").findMany({
        start: (Number(start)-1)*Number(limit),
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
            current_page: Number(start),
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
    // Track errors and failures
    const errors = [];
    const failedOperations = [];

    try {
      const generateUniqueSlug = async (baseSlug) => {
        if (!baseSlug) {
          throw new Error('Base slug is required');
        }

        let slug = baseSlug;
        let counter = 1;
        let existingBlog;
        let maxAttempts = 10; // Prevent infinite loops
        
        do {
          try {
            existingBlog = await strapi.documents('api::blog.blog').findFirst({
              filters: { Slug: slug }
            });
          } catch (error) {
            console.error('Error checking slug existence:', error);
            throw new Error(`Failed to check slug existence: ${error.message}`);
          }
          
          if (existingBlog) {
            slug = `${baseSlug}-${Date.now()}-${counter}`;
            counter++;
          }

          maxAttempts--;
        } while (existingBlog && maxAttempts > 0);

        if (maxAttempts <= 0) {
          throw new Error('Max attempts reached while generating unique slug');
        }
        
        return slug;
      };

      // First, fetch and update from external API
      // Helper function to check if blog exists
      const checkBlogExists = async (slug) => {
        const existingBlog = await strapi.documents("api::blog.blog").findFirst({
          filters: { Slug: slug },
          populate: ['Featured_Image', 'Banner_Image', 'SEO.Meta_Image']
        });
        return existingBlog;
      };

      // Track failed blogs for reporting
      const failedBlogs = [];

      const blogsCount = await axios.get(`https://indususedcars.com/api/pages`);
      for (let i = 1; i <= blogsCount?.data?.last_page; i++) {
        // const blogList = await axios.get(
        //   `https://indususedcars.com/api/pages?page=${i}`
        // );
        const blogList=await strapi.documents('api::blog.blog').findMany({
          filters:{},
          status:'published'
        })

        for (const blog of blogList) {
          if (blog?.type === "Blog") {
            // const blogDetail = (await axios.get(
            //   `https://indususedcars.com/api/pages/${blog?.slug}`
            // )).data;

            const blogDetail=await strapi.documents('api::blog.blog').findFirst({
              filters:{
                Slug:blog?.Slug
              },
              status:'published'
            })
            
            
            console.log('Blog'); 
            
            
            

            const existingBlog = await strapi.documents('api::blog.blog').findFirst({
              filters: { Slug: blogDetail?.Slug },
              populate: ['Featured_Image', 'Banner_Image', 'SEO.Meta_Image']
            });
            console.log(existingBlog);
            

            if (existingBlog) {
              console.log('yes');
              
              const processContent = async (content) => {
                if (!content) return '';
                const imgRegex = /<img[^>]+src="([^"]+)"[^>]*>/g;
                let match;
                let processedContent = content;
                const strapiUrl = process.env.STRAPI_URL || 'http://localhost:1337';

                while ((match = imgRegex.exec(content)) !== null) {
                  const originalUrl = match[1];
                  
                  // Skip if the URL already contains STRAPI_URL
                  if (originalUrl.includes(strapiUrl)) {
                    continue;
                  }

                  const uploadedImage = await uploadImage(originalUrl);

                  if (uploadedImage) {
                    const newUrl = `${strapiUrl}${uploadedImage.url}`;
                    processedContent = processedContent.replace(originalUrl, newUrl);
                  }
                }
                return processedContent;
              };
              console.log('yes');
              
              const processedContent = await processContent(blogDetail?.content || '');

              await strapi.documents('api::blog.blog').update({
                documentId: existingBlog.documentId,
                data: { 
                  Slug: blog?.slug,
                  Content: processedContent,
                  Top_Description: blogDetail?.top_description || '',
                  Bottom_Description: blogDetail?.bottom_description || '',
                  publishedAt: blogDetail?.created_at,
                  createdAt: blogDetail?.created_at
                },
                status: 'published'
              });
            }
          }
        }
      }

      // Then process local blog entries
      const blogs = await strapi.documents('api::blog.blog').findMany({
        status: 'draft',
        populate: ['Featured_Image', 'Banner_Image', 'SEO.Meta_Image']
      });

      const processContent = async (content, blogTitle = 'Unknown') => {
        if (!content) {
          console.warn(`Empty content for blog: ${blogTitle}`);
          return '';
        }

        try {
          const imgRegex = /<img[^>]+src="([^"]+)"[^>]*>/g;
          let match;
          let processedContent = content;
          let failedImages = [];
      
          while ((match = imgRegex.exec(content)) !== null) {
            try {
              const originalUrl = match[1];
              if (!originalUrl) continue;

              // Download the image but skip upload to media library
              const downloadedFilePath = await downloadImage(originalUrl);
              
              if (downloadedFilePath) {
                // Use the downloaded file name in the content
                const fileName = path.basename(downloadedFilePath);
                const newUrl = `/uploads/${fileName}`;
                processedContent = processedContent.replace(originalUrl, newUrl);
              } else {
                failedImages.push(originalUrl);
              }
            } catch (imageError) {
              console.error(`Error processing image in content for ${blogTitle}:`, imageError);
              failedImages.push(match[1]);
            }
          }

          if (failedImages.length > 0) {
            failedOperations.push({
              type: 'content_images',
              blogTitle,
              failedImages
            });
          }
      
          return processedContent;
        } catch (error) {
          console.error(`Error processing content for ${blogTitle}:`, error);
          errors.push({
            type: 'content_processing',
            blogTitle,
            error: error.message
          });
          return content; // Return original content on error
        }
      };
    
      const downloadImage = async (imageUrl, retryAttempts = 3) => {
        if (!imageUrl) {
          console.warn('No image URL provided');
          return null;
        }

        for (let attempt = 1; attempt <= retryAttempts; attempt++) {
          try {
            const fullUrl = imageUrl.startsWith('http') ? 
              imageUrl : 
              `https://indususedcars.com/${imageUrl}`;

            const response = await axios.get(fullUrl, { 
              responseType: 'arraybuffer',
              timeout: 30000,
              maxContentLength: 10 * 1024 * 1024
            });

            if (!response.data || !response.headers['content-type']) {
              throw new Error('Invalid image response');
            }

            // Create unique file name
            const fileName = `image_${Date.now()}_${attempt}.jpg`;
            const filePath = path.join(process.cwd(), 'public', 'uploads', fileName);

            // Ensure uploads directory exists
            await fs.promises.mkdir(path.dirname(filePath), { recursive: true });

            // Save the file
            await fs.promises.writeFile(filePath, response.data);

            return filePath;
          } catch (error) {
            console.error(`Error downloading image (attempt ${attempt}/${retryAttempts}):`, error);
            
            if (attempt === retryAttempts) {
              failedOperations.push({
                type: 'image_download',
                imageUrl,
                error: error.message
              });
              return null;
            }

            await new Promise(resolve => setTimeout(resolve, 2000));
          }
        }
      };
    
      for (const blog of blogs) {
        console.log('Processing blog:', blog.Title);
        
        const updateData = {};
    
        if (blog.Content) {
          // Check if content already contains STRAPI_URL
          const strapiUrl = process.env.STRAPI_URL || 'http://localhost:1337';
          if (!blog.Content.includes(strapiUrl)) {
            const processedContent = await processContent(blog.Content);
            if (processedContent !== blog.Content) {
              updateData.Content = processedContent;
            }
          }
        }

        // if (!blog.Featured_Image) {
        //   const featuredImageId = await uploadImage(blog.featured_image?.file_path);
        //   if (featuredImageId) {
        //     updateData.Featured_Image = { id: featuredImageId };
        //   }
        // }

        // if (!blog.Banner_Image) {
        //   const bannerImageId = await uploadImage(blog.banner_image?.file_path);
        //   if (bannerImageId) {
        //     updateData.Banner_Image = { id: bannerImageId };
        //   }
        // }

        // if (!blog.SEO?.Meta_Image) {
        //   const metaImageId = await uploadImage(blog.og_image?.file_path);
        //   if (metaImageId) {
        //     updateData.SEO = {
        //       ...blog.SEO,
        //       Meta_Image: { id: metaImageId }
        //     };
        //   }
        // }

        if (Object.keys(updateData).length > 0) {
          try {
            await strapi.documents('api::blog.blog').update({
              documentId: blog.documentId,
              data: {
                ...updateData,
                Slug: blog.Slug
              },
              status: 'published'
            });
          } catch (error) {
            console.error('Error updating blog:', error);
          }
        }
      }

      // Prepare response with error information
      const hasErrors = errors.length > 0 || failedOperations.length > 0;
      
      ctx.body = {
        data: {
          success: !hasErrors,
          msg: hasErrors ? 
            'Blogs updated with some errors' : 
            'Blogs updated and published successfully',
          errors: errors.length > 0 ? errors : undefined,
          failedOperations: failedOperations.length > 0 ? failedOperations : undefined
        }
      };
    } catch (err) {
      ctx.status = 500;
      ctx.body = {
        error: 'Internal Server Error',
        details: err.message
      };
    }
  }
}
