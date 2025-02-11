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
      } = ctx.request.body;

      console.log(ctx.request.body);

      if (!name || !lead_type || !phone_number || !city) {
        ctx.body = {
          message: "All fields are required",
        };
        return;
      }

      if (lead_type == "Book") {
        await strapi.documents("api::lead.lead").create({
          data: {
            CustomerName: name,
            MobileNumber: phone_number,
            City: city,
            Lead_Type: lead_type,
            Date: new Date().toISOString().slice(0, 10),
            utmSource: utmsource,
            SourceType: source_type,
          },
          status: "published",
        });
      } else {
        await strapi.documents("api::lead.lead").create({
          data: {
            CustomerName: name,
            CustomerEmail: email,
            MobileNumber: phone_number,
            City: city,
            Lead_Type: lead_type,
            utmSource: utmsource,
            SourceType: source_type,
          },
          status: "published",
        });
      }

      ctx.body = {
        message: "Form Submitted Successfully",
        success: true,
      };
    } catch (err) {
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



