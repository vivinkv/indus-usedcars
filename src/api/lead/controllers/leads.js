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
        car_id,
        message
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

      if(message){
        leadData.Notes=message
      }

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
        const admin = await strapi.query('admin::user').findMany({
          where: {
            roles: {
              code: 'strapi-super-admin'
            }
          },
          select: ['email']
        });

        console.log({admin});

        // Define email templates based on lead type
        const emailTemplates = {
          'Test Drive': {
            admin: {
              subject: 'New Test Drive Request',
              text: 'New test drive request received',
              html: `
                <!DOCTYPE html>
                <html>
                <head>
                  <meta charset="utf-8">
                  <meta name="viewport" content="width=device-width, initial-scale=1.0">
                  <title>New Test Drive Request</title>
                  <style>
                    * { margin: 0; padding: 0; box-sizing: border-box; }
                    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                    .content { background: #f9f9f9; border-radius: 8px; padding: 25px; }
                    h2 { color: #1a73e8; margin-bottom: 20px; }
                    .details { margin-bottom: 20px; }
                    ul { list-style: none; }
                    li { padding: 8px 0; border-bottom: 1px solid #eee; }
                  </style>
                </head>
                <body>
                  <div class="container">
                    <div class="content">
                      <h2>New Test Drive Request</h2>
                      <div class="details">
                        <h3>Customer Details</h3>
                        <ul>
                          <li><strong>Name:</strong> <%= data.name %></li>
                          <li><strong>Phone:</strong> <%= data.phone_number %></li>
                          <li><strong>Email:</strong> <%= data.email || 'N/A' %></li>
                          <li><strong>City:</strong> <%= data.city %></li>
                          <li><strong>Source Type:</strong> <%= data.source_type || 'N/A' %></li>
                          <li><strong>UTM Source:</strong> <%= data.utmsource || 'N/A' %></li>
                          <li><strong>Source URL:</strong> <%= data.source_url || 'N/A' %></li>
                        </ul>
                      </div>
                      <div class="details">
                        <h3>Car Details</h3>
                        <ul>
                          <li><strong>Brand:</strong> <%= data.car?.Brand?.Name || 'N/A' %></li>
                          <li><strong>Model:</strong> <%= data.car?.Model?.Name || 'N/A' %></li>
                          <li><strong>Variant:</strong> <%= data.car?.Variant || 'N/A' %></li>
                          <li><strong>Color:</strong> <%= data.car?.Color || 'N/A' %></li>
                          <li><strong>Location:</strong> <%= data.car?.Outlet?.Location?.Name || 'N/A' %></li>
                          <li><strong>Registration:</strong> <%= data.car?.Vehicle_Reg_No || 'N/A' %></li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </body>
                </html>
              `
            },
            user: {
              subject: 'Test Drive Request Confirmation',
              text: 'Thank you for requesting a test drive',
              html: `
                <!DOCTYPE html>
                <html>
                <head>
                  <meta charset="utf-8">
                  <meta name="viewport" content="width=device-width, initial-scale=1.0">
                  <title>Test Drive Request Confirmation</title>
                  <style>
                    * { margin: 0; padding: 0; box-sizing: border-box; }
                    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                    .content { background: #f9f9f9; border-radius: 8px; padding: 25px; }
                    h2 { color: #1a73e8; margin-bottom: 20px; }
                  </style>
                </head>
                <body>
                  <div class="container">
                    <div class="content">
                      <h2>Test Drive Request Confirmation</h2>
                      <div class="message">
                        <p>Dear <%= data.name %>,</p>
                        <p>Thank you for requesting a test drive. We have received your request for:</p>
                        <ul>
                          <li><strong>Car:</strong> <%= data.car?.Brand?.Name || '' %> <%= data.car?.Model?.Name || '' %></li>
                          <li><strong>Location:</strong> <%= data.car?.Outlet?.Location?.Name || '' %></li>
                        </ul>
                        <p>Our team will contact you shortly at <%= data.phone_number %> to schedule your test drive.</p>
                      </div>
                      <div class="footer">
                        <p>Best regards,<br>Indus Motors</p>
                      </div>
                    </div>
                  </div>
                </body>
                </html>
              `
            }
          },
          'Book': {
            admin: {
              subject: 'New Car Booking Request',
              text: 'New car booking request received',
              html: `
                <div style="max-width: 600px; margin: 0 auto;">
                  <h2>New Car Booking Request</h2>
                  <p>Customer Details:</p>
                  <ul>
                    <li>Name: <%= data.name %></li>
                    <li>Phone: <%= data.phone_number %></li>
                    <li>Email: <%= data.email || 'N/A' %></li>
                    <li>City: <%= data.city %></li>
                    <li>Date: <%= data.date %></li>
                    <li>Source Type: <%= data.source_type || 'N/A' %></li>
                    <li>UTM Source: <%= data.utmsource || 'N/A' %></li>
                    <li>Source URL: <%= data.source_url || 'N/A' %></li>
                  </ul>
                </div>
              `
            },
            user: {
              subject: 'Booking Request Confirmation',
              text: 'Thank you for your booking request',
              html: `
                <div style="max-width: 600px; margin: 0 auto;">
                  <h2>Booking Request Confirmation</h2>
                  <p>Dear <%= data.name %>,</p>
                  <p>Thank you for your booking request. We have received your request and our team will contact you shortly at <%= data.phone_number %>.</p>
                  <p>Best regards,<br>Indus Motors</p>
                </div>
              `
            }
          },
          'Buy': {
            admin: {
              subject: 'New Car Purchase Inquiry',
              text: 'New car purchase inquiry received',
              html: `
                <h2>New Car Purchase Inquiry</h2>
                <ul>
                  <li>Name: <%= data.name %></li>
                  <li>Email: <%= data.email || 'N/A' %></li>
                  <li>Phone: <%= data.phone_number %></li>
                  <li>City: <%= data.city %></li>
                  <li>Source Type: <%= data.source_type || 'N/A' %></li>
                  <li>UTM Source: <%= data.utmsource || 'N/A' %></li>
                  <li>Source URL: <%= data.source_url || 'N/A' %></li>
                </ul>
              `
            },
            user: {
              subject: 'Purchase Inquiry Confirmation',
              text: 'Thank you for your purchase inquiry',
              html: `
                <h2>Purchase Inquiry Confirmation</h2>
                <p>Dear <%= data.name %>,</p>
                <p>Thank you for your interest in purchasing a car from us. Our team will contact you shortly at <%= data.phone_number %> to discuss your requirements.</p>
                <p>Best regards,<br>Indus Motors</p>
              `
            }
          },
          'Sell': {
            admin: {
              subject: 'New Car Sell Request',
              text: 'New car sell request received',
              html: `
                <h2>New Car Sell Request</h2>
                <ul>
                  <li>Name: <%= data.name %></li>
                  <li>Email: <%= data.email || 'N/A' %></li>
                  <li>Phone: <%= data.phone_number %></li>
                  <li>City: <%= data.city %></li>
                  <li>Source Type: <%= data.source_type || 'N/A' %></li>
                  <li>UTM Source: <%= data.utmsource || 'N/A' %></li>
                  <li>Source URL: <%= data.source_url || 'N/A' %></li>
                </ul>
              `
            },
            user: {
              subject: 'Car Sell Request Confirmation',
              text: 'Thank you for your car sell request',
              html: `
                <h2>Car Sell Request Confirmation</h2>
                <p>Dear <%= data.name %>,</p>
                <p>Thank you for your interest in selling your car through us. Our team will contact you shortly at <%= data.phone_number %> to discuss your car details.</p>
                <p>Best regards,<br>Indus Motors</p>
              `
            }
          },
          'Request Callback': {
            admin: {
              subject: 'New Callback Request',
              text: 'New callback request received',
              html: `
                <h2>New Callback Request</h2>
                <ul>
                  <li>Name: <%= data.name %></li>
                  <li>Email: <%= data.email || 'N/A' %></li>
                  <li>Phone: <%= data.phone_number %></li>
                  <li>City: <%= data.city %></li>
                  <li>Source Type: <%= data.source_type || 'N/A' %></li>
                  <li>UTM Source: <%= data.utmsource || 'N/A' %></li>
                  <li>Source URL: <%= data.source_url || 'N/A' %></li>
                </ul>
              `
            },
            user: {
              subject: 'Callback Request Confirmation',
              text: 'Thank you for your callback request',
              html: `
                <h2>Callback Request Confirmation</h2>
                <p>Dear <%= data.name %>,</p>
                <p>Thank you for requesting a callback. Our team will contact you shortly at <%= data.phone_number %>.</p>
                <p>Best regards,<br>Indus Motors</p>
              `
            }
          },
          'default': {
            admin: {
              subject: 'New Lead Generated',
              text: 'New lead generated',
              html: `
                <h2>New Lead Details</h2>
                <ul>
                  <li>Name: <%= data.name %></li>
                  <li>Email: <%= data.email || 'N/A' %></li>
                  <li>Phone: <%= data.phone_number %></li>
                  <li>City: <%= data.city %></li>
                  <li>Lead Type: <%= data.lead_type %></li>
                  <li>Source Type: <%= data.source_type || 'N/A' %></li>
                  <li>UTM Source: <%= data.utmsource || 'N/A' %></li>
                  <li>Source URL: <%= data.source_url || 'N/A' %></li>
                </ul>
              `
            },
            user: {
              subject: 'Thank You for Contacting Us',
              text: 'Thank you for contacting us',
              html: `
                <h2>Thank You for Contacting Us</h2>
                <p>Dear <%= data.name %>,</p>
                <p>Thank you for reaching out to us. Our team will contact you shortly at <%= data.phone_number %>.</p>
                <p>Best regards,<br>Indus Motors</p>
              `
            }
          }
        };

        const template = emailTemplates[lead_type] || emailTemplates['default'];
        const templateData = {
          name,
          email,
          phone_number,
          city,
          lead_type,
          source_type,
          utmsource,
          source_url,
          car,
          date: new Date().toISOString().slice(0, 10)
        };

        // Send email to admin
        try {
          if (admin && Array.isArray(admin) && admin.length > 0) {
            const validEmails = admin.filter(user => user?.email).map(user => user.email);
            if (validEmails.length > 0) {
              await strapi.plugins['email'].services.email.sendTemplatedEmail(
                {
                  to: validEmails,
                  from: `${process.env.SMTP_DEFAULT_NAME} <${process.env.SMTP_USERNAME}>`
                },
                template.admin,
                {
                  data: templateData
                }
              );
              console.log(`Admin emails sent successfully to ${validEmails.join(', ')}`);
            } else {
              console.warn('No valid admin email addresses found');
            }
          } else {
            console.warn('No admin users found');
          }

          // Send email to user if email is provided
          if (email) {
            await strapi.plugins['email'].services.email.sendTemplatedEmail(
              {
                to: email,
                from: `${process.env.SMTP_DEFAULT_NAME} <${process.env.SMTP_USERNAME}>`
              },
              template.user,
              {
                data: templateData
              }
            );
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



