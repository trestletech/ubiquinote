"use strict";

var Page = require("../models/page");
var parse = require("url").parse;
var moveFiles = require("../lib/move-files");
var fs = require("fs");
var path = require("path");
var request = require("request");
var _ = require('underscore');
var MediaHandler = require('../lib/media-handler');

var loadPage = function (req, res, next) {
    if (!req.headers.referer) {
        return res.send(400);
    }

    var referer = parse(req.headers.referer);

    Page.findOne({path: referer.pathname, deleted: false}, function (err, page) {
        if (err) {
            console.error(err);
            return res.send(400);
        }

        if (!page) return res.send(404);

        req.page = page;
        next();
    });
};

module.exports = function (app) {

    app.post("/attachments", loadPage, function (req, res) {
        if(!req.files.attachments) { return res.send(400); }
        var files = req.files.attachments[0] ? req.files.attachments : [req.files.attachments];

        var page = req.page;

        var upload = new Object(null);
        try{
            _.each(files, function(file){
                MediaHandler.render(file.type, file.name, 0, page._id, function(insert){
                    //FIXME: there's no guarantee that this will resolve before we respond.
                    upload[file.name] = {insert: insert};
                });                
            });
        } catch (err){
            return res.send(415);
        }

        moveFiles(page, files, "attachments", function (err, attachments) {
            if (err) {
                console.error(err);
                return res.send(400);
            }

            page.attachments = page.attachments.concat(attachments);
            page.save(function (err) {
                if (err) { return res.send(500); }

                var attObj = _.map(attachments, function(att){
                    return {
                        name: att,
                        html: upload[att].insert
                    }
                });

                res.send({
                    attachments: attObj,
                    pageId: page._id,
                    lastModified: page.lastModified.getTime()
                });
            });
        });
    });

    app.delete("/attachments", loadPage, function (req, res) {
        var removedFile = null;
        var page = req.page;
        page.attachments = page.attachments.filter(function (attachment) {
            if (req.body.file == attachment) {
                removedFile = attachment;
                return false;
            }
            return true;
        });

        if (removedFile) {
            return page.save(function(err) {
                if(err) {console.error(err); return 500; }
                fs.unlink(path.join(__dirname, "..", "public", "attachments", page.id, removedFile), function(err) {
                    res.send(200, {
                        lastModified: page.lastModified.getTime()
                    });
                });
            });
        }
        res.send(404);
    });

    app.get("/attachments/preview", function(req, res){
        // First get the content
        // Could look it up from the FS but we'd have to re-invent MIME and security. Just make a web
        // service call to localhost.
        var url = req.protocol + "://localhost:" + global.port + "/attachments/" + req.query.pageId + 
            "/" + req.query.file;
        
        request.get({uri:url, encoding:null}, function(err, data, body) {
            if (err) return res.send(401);

            if(data && data.headers && data.headers["content-type"]) {                        
                MediaHandler.preview(data.headers["content-type"], req.query.file, 
                        data.body, req.query.pageId, function(preview, mhErr){                
                    if (mhErr) return res.send(401);

                    if(!preview){
                        // Would be nice to offer this file as a downloadat this point (so we don't have to
                        // re-serve the static asset), but we're having two problems:
                        //  1.) How do we detect when a preview was generated sucessfully vs. when a binary
                        //      blob is being returned?
                        //  2.) Once we have the response via AJAX, it's too late to prompt with a "Save As."
                        // So it looks like we'll be best off just sending a redirect.
                        return(res.json({redirect: url + '?downloadAttachment=1'}));
                    }

                    return res.json({html:preview});
                });
            } else{
                res.send(401);    
            }            
        });                
    });

    app.get('/detect-content-type', function(req, res) {
        if(!req.query.uri) return res.send(400);

        request.head(req.query.uri, function(err, data) {
            if (err) return res.send(401);

            if(data && data.headers && data.headers["content-type"]) {
                return res.send(data.headers["content-type"]);
            }

            res.send("unknown/type");
        });
    });
};
