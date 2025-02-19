const axios = require("axios");
const { Blob } = require('buffer');
("use strict");

/**
 * A set of functions called "actions" for `custom`
 */

module.exports = {
  fetchModels: async (ctx, next) => {
    try {
      console.log("models");

      const models = await axios.get(
        "https://indususedcars.com/api/combination-pages"
      );

      console.log(models.data?.last_page);

      const processPage = async (pageNumber) => {
        console.log(pageNumber);
        
        const data = await axios.get(
          `https://indususedcars.com/api/combination-pages?page=${pageNumber}`
        );

        const processModel = async (model) => {
          const findModel = await strapi.documents('api::model.model').findFirst({
            filters: {
              Slug: model.slug
            }
          });
          
          if (!findModel) {
            const modelData = await axios.get(
              `https://indususedcars.com/api/combination-pages/${model.slug}`
            );

            if(modelData.status == 200 || modelData.status == 201){
              let uploadedImage = null;
              if (modelData?.data?.og_image?.file_path) {
                const imageResponse = await axios.get(
                  `https://indususedcars.com/${modelData.data.og_image.file_path}`,
                  { responseType: 'arraybuffer' }
                );
  
                const formData = new FormData();
                const imageBlob = new Blob([Buffer.from(imageResponse.data)], { type: imageResponse.headers['content-type'] });
                formData.append('files', imageBlob, modelData.data.og_image.file_path.split('/').pop());
  
                const uploadResponse = await strapi.plugins.upload.services.upload.upload({
                  data: {},
                  files: formData
                });
  
                if (uploadResponse && uploadResponse.length > 0) {
                  uploadedImage = uploadResponse[0].id;
                }
              }
  
              const createModel = await strapi.documents("api::model.model").create({
                data: {
                  Name: modelData?.data?.page_heading,
                  Slug: modelData?.data?.slug,
                  Page_Heading: modelData?.data?.page_heading,
                  Top_Description: modelData?.data?.top_description,
                  Bottom_Description: modelData?.data?.bottom_description,
                  Extra_JS: modelData?.data?.extra_js,
                  Related_Type: modelData?.data?.related_type,
                  SEO: {
                    Meta_Title: modelData?.data?.browser_title,
                    Meta_Description: modelData?.data?.meta_description,
                    Meta_Keywords: modelData?.data?.meta_keywords,
                    Meta_Image: uploadedImage || modelData?.data?.og_image_id,
                    OG_Title: modelData?.data?.og_title,
                    OG_Description: modelData?.data?.og_description,
                  },
                },
                status: "published",
              });
              console.log(createModel);
  
              if (modelData?.data?.faq != null) {
                console.log(modelData?.data?.faq);
              }
              if (modelData?.data?.og_image_id != null) {
                console.log(modelData?.data?.og_image_id, modelData?.data?.og_image);
              }
            }
            
           
          }
        };

        for (const model of data.data?.data) {
          await processModel(model);
          await new Promise(resolve => setTimeout(resolve, 10000)); // Wait for 10 seconds
        }
      };

      // Process all pages
      for (let i = 1; i <= models.data?.last_page; i++) {
        console.log(`processing page ${i}`);
        
        await processPage(i);
      }

      ctx.body = {
        msg: "completed",
      };
    } catch (err) {
      ctx.body = err;
    }
  },
};
