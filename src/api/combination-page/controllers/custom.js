"use strict";

const axios = require("axios");
const ExcelJS = require("exceljs");

/**
 * A set of functions called "actions" for `custom`
 */

module.exports = {
  fetchCombinationPage: async (ctx, next) => {
    try {
      console.log("models");
      const nonDetailSlugs = [];

      const verifySlug = (slug) => {
        if (!slug) {
          return "Slug is empty";
        }
        if (typeof slug !== "string") {
          return "Slug is not a string";
        }

        // Generate a clean slug if invalid
        if (slug.length > 100 || !/^[a-z0-9-]+$/.test(slug)) {
          return slug
            .toLowerCase()
            .replace(/[^a-z0-9-]/g, "-") // Replace invalid chars with -
            .replace(/-+/g, "-") // Replace multiple - with single -
            .replace(/^-|-$/g, "") // Remove leading/trailing -
            .substring(0, 100); // Truncate to max length
        }

        return null; // Slug is valid
      };

      const data = await axios.get(
        "https://indususedcars.com/api/combination-pages"
      );
      console.log(data);

      // Process pages from 1 to 40
      for (let page = 1; page <= data?.data?.last_page; page++) {
        console.log(`processing page ${page}`);

        try {
          const pageData = await axios.get(
            `https://indususedcars.com/api/combination-pages?page=${page}`
          );

          for (const model of pageData.data?.data) {
            let slug = model.slug;
            const slugError = verifySlug(slug);
            if (slugError) {
              // If slug is invalid, generate a verified slug
              slug = slugError;
              nonDetailSlugs.push({ slug: model.slug, problem: "Invalid slug, generated new one" });
            }

            const existingModel = await strapi
              .documents("api::combination-page.combination-page")
              .findFirst({
                filters: { Slug: slug },
              });

            if (!existingModel) {
              try {
                const modelData = await axios.get(
                  `https://indususedcars.com/api/combination-pages/${model.slug}`
                );

                if ([200, 201].includes(modelData.status)) {
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

                    if (uploadResponse?.length > 0) {
                      uploadedImage = uploadResponse[0].id;
                    }
                  }

                  const createdCombinationPage = await strapi
                    .documents("api::combination-page.combination-page")
                    .create({
                      data: {
                        Slug: slug,
                        Page_Heading: modelData?.data?.page_heading,
                        Top_Description: modelData?.data?.top_description,
                        Bottom_Description: modelData?.data?.bottom_description,
                        Extra_JS: modelData?.data?.extra_js,
                        Related_Type: modelData?.data?.related_type,
                        FAQ: {
                          Title: modelData?.data?.faq?.name,
                        },
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
                      populate: ["SEO", "FAQ"],
                    });

                  console.log(createdCombinationPage);
                }
              } catch (error) {
                if (error.response?.status === 404) {
                  console.log(`No detail page found for slug: ${slug}`);
                  nonDetailSlugs.push({
                    slug: model.slug,
                    problem: "No detail page found",
                  });
                } else {
                  throw error;
                }
              }
            } else {
              // Update the Slug if the model already exists
              await strapi
                .documents("api::combination-page.combination-page")
                .update({
                  documentId: existingModel.documentId,
                  data: {
                    Slug: slug,
                  },
                });
              console.log(`Updated Slug for existing model: ${slug}`);
            }
          }
        } catch (error) {
          nonDetailSlugs.push({ slug: `Page ${page}`, problem: error.message });
        }
      }

      console.log("Non-detail pages:", nonDetailSlugs);
      ctx.body = { success: true, msg: "Process completed", nonDetailSlugs };
    } catch (err) {
      ctx.body = err;
    }
  },
  list: async (ctx, next) => {
    try {
      const { page = 1, limit = 10 } = ctx.query;

      const data = await strapi
        .documents("api::combination-page.combination-page")
        .findMany({
          start: (page - 1) * limit,
          limit: limit,
        });
      ctx.status = 200;
      ctx.body = data;
    } catch (error) {
      ctx.status = 500;
      ctx.body = error;
    }
  },
  detail: async (ctx, next) => {
    const { slug } = ctx.params;
    try {
      const data = await strapi
        .documents("api::combination-page.combination-page")
        .findFirst({
          filters: {
            Slug: slug,
          },
          populate: {
            FAQ: { populate: "*" },
            SEO: {
              populate: {
                Meta_Image: {
                  populate: "*",
                },
              },
            },
          },
        });
      ctx.status = 200;
      ctx.body = data;
    } catch (error) {
      ctx.status = 500;
      ctx.body = error;
    }
  },
};
