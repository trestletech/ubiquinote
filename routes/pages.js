"use strict";

var Page = require("../models/page");
var setProps = require("../lib/set-props");

var setPage = function (req, res) {
    var page = res.locals.page;

    if (page) {
        try {
            setProps(req.body, ["title", "content", "tags"], page);
            } catch (err) {
                return res.send(400, err.message);
            }
    } else {
        page = new Page(req.body);
        page.path = req.path;
    }

    page.modifiedBy = req.cookies.username || "";
    return page;
};

var randomItem = function (items) {
    if (!items.length) return null;

    return items[Math.floor(Math.random() * items.length)];
};

var getImage = function (page) {
    var randomImage = randomItem(page.images);
    if (randomImage) return "/images/" + page._id + "/" + randomImage;

    var attachments = page.attachments.filter(function (attachment) {
        return attachment.match(/(.jpeg|.gif|.jpg|.png)$/i);
    });

    var randomAttachment = randomItem(attachments);
    if (randomAttachment) return "/attachments/" + page._id + "/" + randomAttachment;

    return "/static-images/noimg.png";
};

module.exports = function (app) {
    app.get("/pages", function (req, res) {
        Page.all(function (err, pages) {
            if (err) {
                console.error(err);
                res.send(500);
            }

            return res.render("pages", {
                title: "All Pages",
                pages: pages,
                content: "Own"
            });
        });
    });

    app.get("/pages.json", function (req, res) {
        var sort = req.query.sort_by ||  "title";
        Page.find({
            deleted: false
        })
            .select("title path")
            .sort(sort)
            .exec(function (err, pages) {
            if (err) {
                console.error(err);
                res.send(500);
            }

            res.json(pages);
        });
    });

    app.get("/pages/covers", function (req, res) {
        Page.allWithImages(function (err, pages) {
            return res.render("pages_cover", {
                title: "All Pages",
                pages: pages.map(function (page) {
                    return {
                        title: page.title,
                        image: getImage(page),
                        path: page.path
                    };
                })
            });
        });
    });

    app.get("*", function (req, res) {
        if (!res.locals.page) {
            return res.send(404);
        }

        return res.render("page", {
            title: res.locals.page.title,
            page: res.locals.page
        });
    });

    app.post("*", function (req, res) {
        if (req.body.lastModified) {
            if (!res.locals.page) return res.send(405);
            var currentDate = new Date(res.locals.page.lastModified);
            var oldTimestamp = req.body.lastModified;

            if (currentDate.getTime() > oldTimestamp) {
                return res.send(409);
            }
        }

        var page = setPage(req, res);

        page.save(function (err) {
            if (err)  {
                console.error(err);
                return res.send(400);
            }

            res.send(200, {
                lastModified: page.lastModified.getTime()
            });
        });
    });

    var updatePath = function (req, res) {
        var page = res.locals.page;
        Page.findOne({
            path: req.body.newPath,
            deleted: false
        }, function (err, existingPage) {
            if (err) {
                console.error(err);
                return res.send(500);
            }

            if (existingPage) {
                return res.json({
                    status: "page-exists"
                });
            }

            page.path = req.body.newPath;
            page.save(function (err) {
                if (err) {
                    console.log(err);
                    return res.send(500);
                }

                res.json({
                    status: "page-moved",
                    target: req.body.newPath
                });
            });
        });
    };

    var restorePage = function (req, res) {
        Page.findOne({
            path: req.path,
            deleted: true
        }, function (err, page) {
            if(err) {
                console.error(err);
                return res.send(500);
            }
            if (!page) {
                return res.send(404);
            }

            page.restore(function (err) {
                if (err) {
                    console.error(err);
                    return res.send(500);
                }

                res.send(205);
            });
        });
    };

    app.put("*", function (req, res) {
        if (req.body.restore) return restorePage(req, res);
        if (!res.locals.page) return res.send(405);

        updatePath(req, res);
    });

    app.delete("*", function (req, res) {
        if (!res.locals.page) return res.send(405);

        var page = res.locals.page;

        page.delete(function (err) {
            if (err) {
                console.error(err);
                return res.send(500);
            }

            res.send(205);
        });
    });
};
