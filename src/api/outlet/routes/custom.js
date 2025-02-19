'use strict'

module.exports={
    routes:[{
        method:'GET',
        path:'/outlets/list',
        handler:'outletslist.outletList',
        config:{
            auth:false,
            policies:[],
            middleware:[]
        }
    }]
}