"use strict";

var __ = require("./translate");
var message = require("./message");
var ProgressBar = require("./progress-bar");
var Dropzone = require("./dropzone");
var handleErrors = require("./handle-xhr-errors");
var injectMedia = require("./inject-media");

if ($(".drop-here").length > 0){
    $(function () {
        if (!(window.File && window.FileReader && window.FileList && window.Blob)) {
            return $('.drop-here').hide();
        }

        // Setup the dnd listeners.
        new Dropzone({
            element: document.getElementById('drop-zone'),
            handleFileSelect: handleFileSelect
        });
    });
}

function handleFileSelect(evt) {
    evt.stopPropagation();
    evt.preventDefault();
    $("body").trigger("save");

    uploadFiles(document.location.href, evt.dataTransfer.files);
}

if ($("#content.editable").length > 0){
    $(function () {
        if (!(window.File && window.FileReader && window.FileList && window.Blob)) {
            return $(".drop-here").hide();
        }

        // Setup the dnd listeners.
        new Dropzone({
            element: document.getElementById("content").parentNode,
            handleFileSelect: handleDrop
        });
    });
}

function handleDrop(evt) {
    evt.stopPropagation();
    evt.preventDefault();
    $("body").trigger("save");

    var uri = evt.dataTransfer.getData("text/uri-list");
    if (uri && !uri.match('^file:\/\//')) {
        return injectMedia(uri, evt.target);
    }

    uploadFiles(document.location.href, evt.dataTransfer.files, evt.target);
}

function uploadFiles(url, files, targetElement) {
    var formData = new FormData();

    for (var i = 0, file; file = files[i]; ++i) {
        formData.append("attachments", file);        
    }

    formData.append("insertion", !!targetElement);

    var xhr = new XMLHttpRequest();
    var finished = false;
    xhr.open('POST', "/attachments", true);
    xhr.onload = function (e) {
        if (!finished && xhr.status == 200) {
            finished = true;
            var response = JSON.parse(xhr.responseText);
            handleResponse(response);
            if (targetElement){
                // If this is going to be inserted somewhere, grab the 
                // relevant portion of the response.
                handleInsert.bind(targetElement)(response);
            }
            message("success", __("successfully-uploaded"));
        }

        handleErrors(xhr);
    };

    var progressBar = new ProgressBar('#attachments', xhr.upload);

    xhr.send(formData); // multipart/form-data
}

var handleResponse = function (response) {
    response.attachments.forEach(function (attachment) {
        $('#attachments').append("<li><a href=\"attachments/"+response.pageId+"/"+attachment.name+"\" class=\"attachLink\" title='" + attachment.name + "'><i class='icon-file'></i>" + attachment.name + "</a><a href='#' class='icon-remove-sign'</li>");
    });
    $("h1:first").data().lastModified = response.lastModified;
};

var handleInsert = function (response) {
    var targetElement = $(this);
    response.attachments.forEach(function (attachment) {
        targetElement.append(attachment.html);
    });
    $("h1:first").data().lastModified = response.lastModified;
    $("body").trigger("save");
};