"use strict";

var util = require("util");
var mongoose = require("mongoose");
var Schema = mongoose.Schema;
var version = require("mongoose-version");
var textSearch = require("mongoose-text-search");
var config = require("../config");
var sanitze = require("validator").sanitize;
var MediaHandler = require('../lib/media-handler');

var filterOutput = function (value) {
    var pluginWhitelist = MediaHandler.getWhitelistTags();
    return sanitze(value).xss(false, pluginWhitelist.concat("iframe"));
};

var Page = new Schema({
    title: {
        type: String,
        required: true
    },
    content: {
        type: String,
        required: true,
        get: filterOutput
    },
    path: {
        type: String,
        required: true
    },
    tags: [String],

    attachments: [String],
    images: [String],
    modifiedBy: String,
    lastModified: Date,
    created: Date,
    deleted: {
        type: Boolean,
        default: false
    }
});

Page.pre("save", function (next) {
    if (!this.created) {
        this.created = (new Date()).toUTCString();
    }

    this.title = this.title.replace("\n", "").replace("\r", "").replace(/(<([^>]+)>)/ig, "");

    this.lastModified = (new Date()).toUTCString();

    next();
});

Page.path("tags").set(function (tags) {
    if (util.isArray(tags)) {
        return tags;
    }

    tags = tags.replace("\n", "").replace("\r", "").replace(/(<([^>]+)>)/ig, "");

    return tags.split(",").map(function (tag) {
        return tag.trim();
    });
});



// Pre-defined Queries
Page.statics.all = function (cb) {
    return this
        .find({
        deleted: false
    })
        .select("title path")
        .sort("title")
        .exec(cb);
};
Page.statics.allWithImages = function (cb) {
    return this
        .find({
        deleted: false
    })
        .select("title path images attachments")
        .exec(cb);
};

Page.statics.subNodes = function (path, cb) {
    if (path == "/") {
        path = "";
    }

    // Build a regex from a path by escaping regex chars
    var escapedPath = path.replace(/([\\\^\$*+[\]?{}.=!:(|)])/g, "\\$1");
    var pathRegex = new RegExp("^" + escapedPath + "\/[^\\/]+$");

    return this
        .find({
        deleted: false,
        path: {
            $regex: pathRegex
        }
    })
        .select("title path")
        .sort("title")
        .exec(cb);
};

Page.statics.latest = function (count, cb) {
    return this
        .find({
        deleted: false
    })
        .limit(count)
        .sort("-created")
        .select("title path")
        .exec(cb);
};

Page.statics.recentChanges = function (count, cb) {
    return this
        .find({
        deleted: false
    })
        .limit(count)
        .sort("-lastModified")
        .select("title path")
        .exec(cb);
};

Page.statics.deleted = function (cb) {
    return this
        .find({
        deleted: true
    })
        .sort("title")
        .select("title path")
        .exec(cb);
};

Page.statics.search = function (query, count, cb) {
    if (typeof (count) == "function") {
        cb = count;
        count = 100;
    }

    return this
        .textSearch(query, {
        language: config.wikiLanguage,
        limit: count,
        filter: {
            deleted: false
        },
        project: {
            title: 1,
            path: 1
        }
    }, cb);
};

Page.methods.delete = function (cb) {
    this.deleted = true;
    this.save(cb);
};

Page.methods.restore = function (cb) {
    this.deleted = false;
    this.save(cb);
};

Page.plugin(version, {
    documentProperty: "title"
});

Page.plugin(textSearch);
Page.index({
    deleted: 1
});

Page.index({
    title: "text",
    content: "text",
    tags: "text"
}, {
    title: "page_contents",
    weights: {
        title: 5,
        content: 1,
        tags: 3
    }
});

module.exports = mongoose.model("Page", Page);
