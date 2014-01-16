"use strict";

$(".plain-list")
    .on("click", ".attachLink", function (e) {
    e.preventDefault();
    e.stopPropagation();
    var plainList = $(this)
        .closest(".plain-list")[0];
    var url = "/" + plainList.id + "/" + $(plainList).data('pageid')  + "/" + $(this)[0].title;
    window.location = url;
    /*$.ajax({
        url: url        
    })
    .done(function (dat, text) {
        
    });*/
});
