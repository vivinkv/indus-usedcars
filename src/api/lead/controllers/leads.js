"use strict";
const axios = require("axios");
const XLSX = require("xlsx");
/**
 * A set of functions called "actions" for `generateLead`
 */

module.exports = {
  createLead: async (ctx, next) => {
    try {
      const {
        name,
        email,
        utmsource,
        source_type,
        lead_type,
        phone_number,
        city,
        recaptcha_token,
        source_url,
        car_id
      } = ctx.request.body;

      console.log(ctx.request.body);

      // Validate required fields
      if (!name || !lead_type || !phone_number || !recaptcha_token) {
        ctx.status = 400;
        ctx.body = {
          message: "All fields including recaptcha are required",
        };
        return;
      }

      // Verify reCAPTCHA token
      const recaptchaSecret = process.env.RECAPTCHA_SECRECT_KEY;
      const verificationUrl = `https://www.google.com/recaptcha/api/siteverify?secret=${recaptchaSecret}&response=${recaptcha_token}`;
      
      const recaptchaResponse = await axios.post(verificationUrl);
      if (!recaptchaResponse.data.success) {
        ctx.status = 400;
        ctx.body = {
          message: "reCAPTCHA verification failed",
        };
        return;
      }

      let car;

      if(car_id){
        console.log('yes');
        
        car=await strapi.documents('api::car.car').findOne({
          documentId:car_id,
          populate:{
            Brand:{
              populate:'*'
            },
            Model:{
              populate:'*'
            },
            Location:{
              populate:'*'
            },
            Outlet:{
              populate:{
                Location:{
                  populate:'*'
                }
              }
            }
          }
        });

        console.log({car});
        
      }

      // Create lead based on type
     let leadData = {
        CustomerName: name,
        MobileNumber: phone_number,
        City: city,
        Lead_Type: lead_type,
        utmSource: utmsource,
        SourceType: source_type,
        SourceURL:source_url,
        
      };

      if(lead_type == 'Test Drive'){
        console.log('yes');
        console.log({car});
        
        
        leadData.Car={
          Name:car?.Name,
          Model:car?.Model?.Name,
          Brand:car?.Brand?.Name,
          Variant:car?.Variant,
          Registration:car?.Vehicle_Reg_No,
          Outlet:car?.Outlet?.Name,
          Color:car?.Color,
          Location:car?.Outlet?.Location?.Name,
        }
        console.log(leadData);
      const data=  await strapi.documents("api::lead.lead").create({
          data: leadData,
          status: "published",
        });
        console.log({data});
        
        ctx.status = 200;
        ctx.body = {
          message: "Form Submitted Successfully",
          success: true,
        };

        return;
        
      }

      if (lead_type === "Book") {
        leadData.Date = new Date().toISOString().slice(0, 10);
      } else {
        leadData.CustomerEmail = email;
      }

      await strapi.documents("api::lead.lead").create({
        data: leadData,
        status: "published",
      });

      ctx.status = 200;
      ctx.body = {
        message: "Form Submitted Successfully",
        success: true,
      };
    } catch (err) {
      console.log(err);
      console.log(err?.message);
      ctx.status = 500;
      ctx.body = {
        success: false,
        error: err.message,
      };
    }
  },
  sendLeads: async (ctx, next) => {
    try {
      const leads = await strapi.documents("api::lead.lead").findMany({
        filters: {
          API_Status: false,
        },
      });
      console.log(leads);
      for (let lead of leads) {
        const curlCommand = `curl -X POST http://vt_web.indusmis.in/Api/SaveWebsiteEnquiryDetails \
        -H "Content-Type: application/x-www-form-urlencoded" \
        -d "CustomerName=${encodeURIComponent(lead.CustomerName)}" \
        -d "CustomerEmail=${encodeURIComponent(lead.CustomerEmail || "")}" \
        -d "MobileNumber=${encodeURIComponent(lead.MobileNumber)}" \
        -d "City=${encodeURIComponent(lead.City)}" \
        -d "Lead_Type=${encodeURIComponent(lead.Lead_Type)}" \
        -d "Date=${encodeURIComponent(lead.Date ? lead.Date : new Date().toISOString().slice(0, 10))}" \
        -d "Notes=${encodeURIComponent(lead.Notes)}" \
        -d "utmSource=${encodeURIComponent(lead.utmSource)}" \
        -d "SourceType=${encodeURIComponent(lead.SourceType)}"`;

        try {
          const { exec } = require("child_process");
          exec(curlCommand, async (error, stdout, stderr) => {
            if (!error) {
              await strapi.documents("api::lead.lead").update({
                documentId: lead.documentId,
                data: { API_Status: true },
              });
            } else {
              ctx.body = {
                sucess: false,
                message: `Failed to update lead in external system `,
              };
              console.error(
                "cURL error:",
                error.message || "Failed to update lead in external system"
              );
            }
          });
        } catch (err) {
          ctx.body = {
            sucess: false,
            message: `Failed to update lead in external system`,
          };
        }
      }
      if(leads?.length > 0 ){
        ctx.body = {
          success: true,
          message: "The lead was successfully updated in the external system.",
          leads: leads,
        };
      }else{
        ctx.body={
          success: true,
          message: "Latest Leads Not Found",
          leads: leads,
        }
      }
     
    } catch (error) {
      console.log(error?.message);
    }
  },
  exportLeads: async (ctx)=> {
    try {
      // Fetch all leads from the database
      const leads = await strapi.db.query("api::leads.leads").findMany({
        populate: true, // Include related fields if needed
      });

      if (!leads || leads.length === 0) {
        return ctx.send({ message: "No leads found." }, 404);
      }

      // Convert data to worksheet
      const worksheet = XLSX.utils.json_to_sheet(leads);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Leads");

      // Generate buffer and send response
      const buffer = XLSX.write(workbook, { type: "buffer", bookType: "xlsx" });

      ctx.set("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
      ctx.set("Content-Disposition", 'attachment; filename="leads.xlsx"');
      return ctx.send(buffer);
    } catch (err) {
      ctx.throw(500, err);
    }
  },
};



