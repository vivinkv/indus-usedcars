'use strict';

const axios = require("axios");

/**
 * A set of functions called "actions" for `custom`
 */

module.exports = {

  fetchDealers:async(ctx,next)=>{
    try {
      const fetchDealerAPI=await axios.get('https://indususedcars.com/api/dealers');
      const dealerList=fetchDealerAPI.data;
      
      
      for(const dealer of dealerList){
        console.log(dealer?.meta_data?.slug);
        const findDealer = await strapi.documents('api::dealer-list.dealer-list').findFirst({
          filters:{
            Slug:dealer?.meta_data?.slug
          }
        })

        if(!findDealer){
        
          const findLocation=await strapi.documents('api::location.location').findFirst({
            filters:{
              Slug:dealer?.location?.slug
            }
          })
          
          const createDealer=await strapi.documents('api::dealer-list.dealer-list').create({
            data:{
              Page_Heading:dealer?.meta_data?.page_heading,
              Slug:dealer?.meta_data?.slug,
              Top_Description:dealer?.meta_data?.top_description,
              Bottom_Description:dealer?.meta_data?.bottom_description,
              Related_Type:dealer?.meta_data?.related_type,
              Dealer_Detail:{
                Name:dealer?.dealership_name,
                Address:dealer?.address,
                Location_Map:dealer?.location_map,
                Landline:dealer?.landline,
                Branch_Email:dealer?.branch_email,
              },
              Head:{
                Name:dealer?.head,
                Mobile_Number:dealer?.head_no,
                Email:dealer?.head_mail,
              },
              Manager:{
                Name:dealer?.manager,
                Mobile_Number:dealer?.manager_no,
                Email:dealer?.manager_mail,
              },
              Additional:{
                Mobile_Number:dealer?.public_no,
              },
              SEO:{
                Meta_Title:dealer?.meta_data?.meta_title?.toString(),
                Meta_Description:dealer?.meta_data?.meta_description?.toString(),
                OG_Title:dealer?.meta_data?.og_title?.toString(),
                OG_Description:dealer?.meta_data?.og_description?.toString(),
                Keywords:dealer?.meta_data?.meta_keywords?.toString(),
                
              }
              
            },
            populate:['Dealer_Detail','Head','Manager','Additional','SEO'],
            status:'published'
        })

      }else{
        const findLocation=await strapi.documents('api::location.location').findFirst({
          filters:{
            Slug:dealer?.location?.slug
          }
        })
        console.log(dealer?.meta_data?.slug);
        
        const updateData = {
          Slug: dealer?.meta_data?.slug,
        };

        if (findLocation?.documentId) {
          updateData.Outlet = {
            connect: [findLocation.documentId]
          };
        }
        
        const updateDealer = await strapi.documents('api::dealer-list.dealer-list').update({
          documentId: findDealer?.documentId,
          data: updateData,
          populate: ['Dealer_Detail', 'Head', 'Manager', 'Additional', 'SEO', 'Outlet'],
          status: 'published'
        })

        

      }



    }

    ctx.status=200;
    ctx.body={
      data:'Dealer List Created Successfully'
    }
  }
    catch (err) {
      ctx.status=500;
      ctx.body=err;
    }
  },


  // Get All Dealer List
  list: async (ctx, next) => {
    try {
      const {page=1,limit=12,location}=ctx.query;

      if(location){
        const [dealersList,count]=await Promise.all([
          strapi.documents('api::dealer-list.dealer-list').findMany({
            filters:{
              Outlet:{
                Location:{
                  Slug:{
                    $containsi:location
                  }
                  
                }
              }
            },
            populate:{
              Dealer_Detail:{
                populate:'*'
              },
              Head:{
                populate:'*'
              },
              Manager:{
                populate:'*'
              },
              Additional:{
                populate:'*'
              },
              Outlet:{
                populate:{
                  Location:{
                    populate:'*'
                  }
                }
              },
              SEO:{
                populate:{
                  Meta_Image:{
                    populate:'*'
                  }
                }
              }
            },
            start:(page-1)*limit,
            limit:limit
          }),
          strapi.documents('api::dealer-list.dealer-list').count({
            filters:{
              Outlet:{
                Location:{
                  Slug:{
                    $containsi:location
                  }
                  
                }
              }
            }
          })
        ])

        ctx.status=200;
        ctx.body={
          data:dealersList,
          meta:{
            page:page,
            limit:limit,
            last_Page:Math.ceil(count/limit),
            total:count
          }
        }
        return;

      }

      const [dealersList,count]=await Promise.all([
        strapi.documents('api::dealer-list.dealer-list').findMany({
          filters:{},
          populate:{
            Dealer_Detail:{
              populate:'*'
            },
            Head:{
              populate:'*'
            },
            Manager:{
              populate:'*'
            },
            Additional:{
              populate:'*'
            },
            Outlet:{
              populate:'*'
            },
            SEO:{
              populate:{
                Meta_Image:{
                  populate:'*'
                }
              }
            }
          },
          start:(page-1)*limit,
          limit:limit
        }),
        strapi.documents('api::dealer-list.dealer-list').count({})
      ]) 

      ctx.status=200;
      ctx.body={
        data:dealersList,
        meta:{
          page:page,
          limit:limit,
          last_Page:Math.ceil(count/limit),
          total:count
        }
      }

    } catch (err) {
      ctx.status=500;
      ctx.body = err?.message;
    }
  },
  detail:async(ctx,next)=>{
    try {
      const {slug}=ctx.params;
      const dealer=await strapi.documents('api::dealer-list.dealer-list').findFirst({
        filters:{
          Slug:slug
        },
        populate:{
          Dealer_Detail:{
            populate:'*'
          },
          Head:{
            populate:'*'
          },
          Manager:{
            populate:'*'
          },
          Additional:{
            populate:'*'
          },
          Outlet:{
            populate:'*'
          },
          SEO:{
            populate:{
              Meta_Image:{
                populate:'*'
              }
            }
          }
        }
      })
      ctx.status=200;
      ctx.body={
        data:dealer
      }
    } catch (err) {
      ctx.status=500;
    }
  }
};
