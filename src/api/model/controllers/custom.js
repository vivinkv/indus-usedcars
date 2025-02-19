const axios = require("axios");
const { Blob } = require("buffer");
const ExcelJS = require("exceljs");
("use strict");

/**
 * A set of functions called "actions" for `custom`
 */

module.exports = {
  fetchModels: async (ctx, next) => {
    try {
      console.log("models");
      const nonDetailSlugs = [];

      const processPage = async (pageNumber) => {
        console.log(pageNumber);

        const data = await axios.get(
          `https://indususedcars.com/api/combination-pages?page=${pageNumber}`
        );

        const processModel = async (model) => {
          const findModel = await strapi
            .documents("api::model.model")
            .findFirst({
              filters: {
                Slug: model.slug,
              },
            });

          if (!findModel) {
            try {
              const modelData = await axios.get(
                `https://indususedcars.com/api/combination-pages/${model.slug}`
              );

              if (modelData.status == 200 || modelData.status == 201) {
                let uploadedImage = null;
                if (modelData?.data?.og_image?.file_path) {
                  const imageResponse = await axios.get(
                    `https://indususedcars.com/${modelData.data.og_image.file_path}`,
                    { responseType: "arraybuffer" }
                  );

                  const formData = new FormData();
                  const imageBlob = new Blob(
                    [Buffer.from(imageResponse.data)],
                    { type: imageResponse.headers["content-type"] }
                  );
                  formData.append(
                    "files",
                    imageBlob,
                    modelData.data.og_image.file_path.split("/").pop()
                  );

                  const uploadResponse =
                    await strapi.plugins.upload.services.upload.upload({
                      data: {},
                      files: formData,
                    });

                  if (uploadResponse && uploadResponse.length > 0) {
                    uploadedImage = uploadResponse[0].id;
                  }
                }

                const createModel = await strapi
                  .documents("api::model.model")
                  .create({
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
                        Meta_Image:
                          uploadedImage || modelData?.data?.og_image_id,
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
                  console.log(
                    modelData?.data?.og_image_id,
                    modelData?.data?.og_image
                  );
                }
              }
            } catch (error) {
              if (error.response && error.response.status === 404) {
                console.log(`No detail page found for slug: ${model.slug}`);
                nonDetailSlugs.push(model.slug);
              } else {
                throw error;
              }
            }
          }
        };

        // Create Excel file with non-detail slugs and errors
        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet("Issues");
        worksheet.columns = [
          { header: "Slug", key: "slug", width: 50 },
          { header: "Problem", key: "problem", width: 100 }
        ];

        // Add non-detail slugs to the worksheet
        nonDetailSlugs.forEach((slug) => {
          worksheet.addRow({ 
            slug, 
            problem: "No detail page found" 
          });
        });

        // Verify slugs and add validation errors
        const verifySlug = (slug) => {
          if (!slug) return "Slug is empty";
          if (typeof slug !== 'string') return "Slug is not a string";
          if (slug.length > 100) return "Slug is too long (max 100 characters)";
          if (!/^[a-z0-9-]+$/.test(slug)) return "Slug contains invalid characters";
          return null; // No error
        };

        // Process pages from 1 to 40
        for (let i = 1; i <= 40; i++) {
          console.log(`processing page ${i}`);
          try {
            const data = await axios.get(
              `https://indususedcars.com/api/combination-pages?page=${i}`
            );

            for (const model of data.data?.data) {
              const slugError = verifySlug(model.slug);
              if (slugError) {
                worksheet.addRow({
                  slug: model.slug,
                  problem: slugError
                });
                continue; // Skip this model
              }
              await processModel(model);
            }
          } catch (error) {
            worksheet.addRow({
              slug: `Page ${i}`,
              problem: error.message
            });
          }
        }

        // Save the file to a buffer instead of writing to disk
        const buffer = await workbook.xlsx.writeBuffer();

        // Set response headers for file download
        ctx.set(
          "Content-Type",
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
        );
        ctx.set(
          "Content-Disposition",
          `attachment; filename="issues.xlsx"`
        );

        // Send the file in the response
        ctx.body = {
          success: true,
          data: buffer,
        };
      };

      // Process pages from 1 to 40
      for (let i = 1; i <= 40; i++) {
        console.log(`processing page ${i}`);
        await processPage(i);
      }
    } catch (err) {
      ctx.body = err;
    }
  },
};
