"use strict";

module.exports = function (req, res, next) {
    if(req.query && req.query.downloadAttachment == "1"){
        res.setHeader('Content-disposition', 'attachment;');
        console.log("Setting download: " + req.query.downloadAttachment);
    }    
    next();
};
