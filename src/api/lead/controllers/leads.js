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
      if (!name || !lead_type || !phone_number||!recaptcha_token) {
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
        CustomerEmail: email
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
      }

      await strapi.documents("api::lead.lead").create({
        data: leadData,
        status: "published",
      });

      // Send email notifications
      try {
        let adminEmailSubject = '';
        let adminEmailTemplate = '';
        let userEmailSubject = '';
        let userEmailTemplate = '';

        if (lead_type === 'Test Drive') {
          adminEmailSubject = 'New Test Drive Request';
          adminEmailTemplate = `
            <!DOCTYPE html>
            <html>
            <head>
              <meta charset="utf-8">
              <meta name="viewport" content="width=device-width, initial-scale=1.0">
              <title>${adminEmailSubject}</title>
              <style>
                * { margin: 0; padding: 0; box-sizing: border-box; }
                body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                .header { text-align: center; margin-bottom: 30px; }
                .header img { width: 200px; height: auto; }
                .content { background: #f9f9f9; border-radius: 8px; padding: 25px; margin-bottom: 20px; }
                h2 { color: #1a73e8; margin-bottom: 20px; }
                .details { margin-bottom: 20px; }
                .details h3 { color: #2c3e50; margin-bottom: 10px; }
                ul { list-style: none; }
                li { padding: 8px 0; border-bottom: 1px solid #eee; }
                li:last-child { border-bottom: none; }
                @media only screen and (max-width: 480px) {
                  .container { padding: 15px; }
                  .content { padding: 15px; }
                }
              </style>
            </head>
            <body>
              <div class="container">
               
                <div class="content">
                  <h2>New Test Drive Request</h2>
                  <div class="details">
                    <h3>Customer Details</h3>
                    <ul>
                      <li><strong>Name:</strong> ${name}</li>
                      <li><strong>Phone:</strong> ${phone_number}</li>
                      <li><strong>Email:</strong> ${email || 'N/A'}</li>
                      <li><strong>City:</strong> ${city}</li>
                      <li><strong>Source Type:</strong> ${source_type || 'N/A'}</li>
                      <li><strong>UTM Source:</strong> ${utmsource || 'N/A'}</li>
                      <li><strong>Source URL:</strong> ${source_url || 'N/A'}</li>
                    </ul>
                  </div>
                  <div class="details">
                    <h3>Car Details</h3>
                    <ul>
                      <li><strong>Brand:</strong> ${car?.Brand?.Name || 'N/A'}</li>
                      <li><strong>Model:</strong> ${car?.Model?.Name || 'N/A'}</li>
                      <li><strong>Variant:</strong> ${car?.Variant || 'N/A'}</li>
                      <li><strong>Color:</strong> ${car?.Color || 'N/A'}</li>
                      <li><strong>Location:</strong> ${car?.Outlet?.Location?.Name || 'N/A'}</li>
                      <li><strong>Registration:</strong> ${car?.Vehicle_Reg_No || 'N/A'}</li>
                    </ul>
                  </div>
                </div>
              </div>
            </body>
            </html>
          `;
          userEmailSubject = 'Test Drive Request Confirmation';
          userEmailTemplate = `
            <!DOCTYPE html>
            <html>
            <head>
              <meta charset="utf-8">
              <meta name="viewport" content="width=device-width, initial-scale=1.0">
              <title>${userEmailSubject}</title>
              <style>
                * { margin: 0; padding: 0; box-sizing: border-box; }
                body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                .header { text-align: center; margin-bottom: 30px; }
                .header img { width: 200px; height: auto; }
                .content { background: #f9f9f9; border-radius: 8px; padding: 25px; margin-bottom: 20px; }
                h2 { color: #1a73e8; margin-bottom: 20px; }
                .message { margin-bottom: 20px; }
                ul { list-style: none; margin: 15px 0; }
                li { padding: 8px 0; }
                .footer { text-align: left; color: #666; font-size: 14px; }
                @media only screen and (max-width: 480px) {
                  .container { padding: 15px; }
                  .content { padding: 15px; }
                }
              </style>
            </head>
            <body>
              <div class="container">
               
                <div class="content">
                  <h2>Test Drive Request Confirmation</h2>
                  <div class="message">
                    <p>Dear ${name},</p>
                    <p>Thank you for requesting a test drive. We have received your request for:</p>
                    <ul>
                      <li><strong>Car:</strong> ${car?.Brand?.Name || ''} ${car?.Model?.Name || ''}</li>
                      <li><strong>Location:</strong> ${car?.Outlet?.Location?.Name || ''}</li>
                    </ul>
                    <p>Our team will contact you shortly at ${phone_number} to schedule your test drive.</p>
                  </div>
                  <div class="footer">
                    <p>Best regards,<br>Indus Motors</p>
                  </div>
                </div>
              </div>
            </body>
            </html>
          `;
        }
        else if (lead_type === 'Book') {
          adminEmailSubject = 'New Car Booking Request';
          adminEmailTemplate = `
            <div style="max-width: 600px; margin: 0 auto;">
             
              <h2>New Car Booking Request</h2>
              <p>Customer Details:</p>
              <ul>
                <li>Name: ${name}</li>
                <li>Phone: ${phone_number}</li>
                <li>Email: ${email || 'N/A'}</li>
                <li>City: ${city}</li>
                <li>Date: ${new Date().toISOString().slice(0, 10)}</li>
                <li>Source Type: ${source_type || 'N/A'}</li>
                <li>UTM Source: ${utmsource || 'N/A'}</li>
                <li>Source URL: ${source_url || 'N/A'}</li>
              </ul>
            </div>
          `;
          userEmailSubject = 'Booking Request Confirmation';
          userEmailTemplate = `
            <div style="max-width: 600px; margin: 0 auto;">
             
              <h2>Booking Request Confirmation</h2>
              <p>Dear ${name},</p>
              <p>Thank you for your booking request. We have received your request and our team will contact you shortly at ${phone_number}.</p>
              <p>Best regards,<br>Indus Motors</p>
            </div>
          `;
        } else if (lead_type === 'Buy') {
          adminEmailSubject = 'New Car Purchase Inquiry';
          adminEmailTemplate = `
            <h2>New Car Purchase Inquiry</h2>
            <ul>
              <li>Name: ${name}</li>
              <li>Email: ${email || 'N/A'}</li>
              <li>Phone: ${phone_number}</li>
              <li>City: ${city}</li>
              <li>Source Type: ${source_type || 'N/A'}</li>
              <li>UTM Source: ${utmsource || 'N/A'}</li>
              <li>Source URL: ${source_url || 'N/A'}</li>
            </ul>
          `;
          userEmailSubject = 'Purchase Inquiry Confirmation';
          userEmailTemplate = `
            <h2>Purchase Inquiry Confirmation</h2>
            <p>Dear ${name},</p>
            <p>Thank you for your interest in purchasing a car from us. Our team will contact you shortly at ${phone_number} to discuss your requirements.</p>
            <p>Best regards,<br>Indus Motors</p>
          `;
        } else if (lead_type === 'Sell') {
          adminEmailSubject = 'New Car Sell Request';
          adminEmailTemplate = `
            <h2>New Car Sell Request</h2>
            <ul>
              <li>Name: ${name}</li>
              <li>Email: ${email || 'N/A'}</li>
              <li>Phone: ${phone_number}</li>
              <li>City: ${city}</li>
              <li>Source Type: ${source_type || 'N/A'}</li>
              <li>UTM Source: ${utmsource || 'N/A'}</li>
              <li>Source URL: ${source_url || 'N/A'}</li>
            </ul>
          `;
          userEmailSubject = 'Car Sell Request Confirmation';
          userEmailTemplate = `
            <h2>Car Sell Request Confirmation</h2>
            <p>Dear ${name},</p>
            <p>Thank you for your interest in selling your car through us. Our team will contact you shortly at ${phone_number} to discuss your car details.</p>
            <p>Best regards,<br>Indus Motors</p>
          `;
        } else if (lead_type === 'Request Callback') {
          adminEmailSubject = 'New Callback Request';
          adminEmailTemplate = `
            <h2>New Callback Request</h2>
            <ul>
              <li>Name: ${name}</li>
              <li>Email: ${email || 'N/A'}</li>
              <li>Phone: ${phone_number}</li>
              <li>City: ${city}</li>
              <li>Source Type: ${source_type || 'N/A'}</li>
              <li>UTM Source: ${utmsource || 'N/A'}</li>
              <li>Source URL: ${source_url || 'N/A'}</li>
            </ul>
          `;
          userEmailSubject = 'Callback Request Confirmation';
          userEmailTemplate = `
            <h2>Callback Request Confirmation</h2>
            <p>Dear ${name},</p>
            <p>Thank you for requesting a callback. Our team will contact you shortly at ${phone_number}.</p>
            <p>Best regards,<br>Indus Motors</p>
          `;
        } else {
          adminEmailSubject = 'New Lead Generated';
          adminEmailTemplate = `
            <h2>New Lead Details</h2>
            <ul>
              <li>Name: ${name}</li>
              <li>Email: ${email || 'N/A'}</li>
              <li>Phone: ${phone_number}</li>
              <li>City: ${city}</li>
              <li>Lead Type: ${lead_type}</li>
              <li>Source Type: ${source_type || 'N/A'}</li>
              <li>UTM Source: ${utmsource || 'N/A'}</li>
              <li>Source URL: ${source_url || 'N/A'}</li>
            </ul>
          `;
          userEmailSubject = 'Thank You for Contacting Us';
          userEmailTemplate = `
            <h2>Thank You for Contacting Us</h2>
            <p>Dear ${name},</p>
            <p>Thank you for reaching out to us. Our team will contact you shortly at ${phone_number}.</p>
            <p>Best regards,<br>Indus Motors</p>
          `;
        }

        const admin = await strapi.query('admin::user').findOne({
          where: {
            roles: {
              code: 'strapi-super-admin'
            }
          },
          select: ['email']
        });

        console.log({admin});
        

        // Send email to admin
        try {
          if (admin?.email) {
            await strapi.plugins['email'].services.email.send({
              to: admin.email,
              from: `${process.env.SMTP_DEFAULT_NAME} <${process.env.SMTP_USERNAME}>`,
              subject: adminEmailSubject,
              text: adminEmailSubject, // Plain text version
              html: adminEmailTemplate,
            });
            console.log('Admin email sent successfully');
          } else {
            console.warn('Admin email not found');
          }

          // Send email to user if email is provided
          if (email) {
            await strapi.plugins['email'].services.email.send({
              to: email,
              from: `${process.env.SMTP_DEFAULT_NAME} <${process.env.SMTP_USERNAME}>`,
              subject: userEmailSubject,
              text: userEmailSubject, // Plain text version
              html: userEmailTemplate,
            });
            console.log('User email sent successfully');
          }
        } catch (sendError) {
          console.error('Email sending error:', sendError?.response?.data || sendError.message);
          // Continue execution as email sending is not critical
        }

      } catch (emailError) {
        console.error('Failed to send email notification:', emailError);
        // Don't throw error as lead is already created
      }

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



