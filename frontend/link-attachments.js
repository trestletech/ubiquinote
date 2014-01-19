"use strict";

var message = require('./message');
var modal = require('./modal');
var __ = require("./translate");

$(".plain-list")
    .on("click", ".attachLink", function (e) {
        e.preventDefault();
        e.stopPropagation();
        var plainList = $(this)
            .closest(".plain-list")[0];
        
        var file = $(this)[0].title;
        
        $.ajax({
            // At this point, plainList.id is always "attachments", but historically images were
            // kept separately. I suppose we can keep it this way even though "attachments/preview" is
            // currently the only mapped URL on the server.
            url: "/"+plainList.id+"/preview",
            data: {
                file: file,
                pageId: $(plainList).data('pageid')
            }
        })
        .done(function (dat, status, xhr) {
            console.log(dat);
            if (dat.html){
                modal({
                    title: __('attachment-preview'),
                    description: dat.html,
                    fields: [],
                    cancle: false,
                    confirm: __("close")
                }).on("submit", function(){
                    $(this).modal("hide");
                });    
            } else if (dat.redirect){
                $('<iframe />')
                .attr('src', dat.redirect)
                .attr('width', '0')
                .attr('height', '0')
                .appendTo('body')
                .hide();
            } else{
                message("warn", __("no-preview"));    
            }
            
        })
        .fail(function (err){
            message("warn", __("no-preview"));
        });
    });
