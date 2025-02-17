'use strict'

module.exports={
    routes:[{
        method:'GET',
        path:'/blogs/:slug',
        handler:'slug.getBlog',
        config:{
            auth:false,
            policies:[],
            middleware:[]
        }
    }]
}