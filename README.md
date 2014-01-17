# Ubiquinote

##Installation

You'll need a running instance of MongoDB.

    git clone git@github.com:trestletech/ubiquinote.git
    cd ubiquinote
    npm install
    ./dev

Then simply open http://localhost:3000.

###Configuration

To configure NodeWiki to your needs you can create a `production.js` in the config folder and start it with `NODE_ENV=production node app.js`

####Options

- __port__: The port for the internal HTTP server
- __locales:__: Used locales are defined as array, e.g. `["en", "de"]`. The first locale is the default language.
- __wikiLanguage:__: Used for the text search to provide stemming support.
- __siteName:__: The name of the wiki.
- __secret__: The encryption key for cookies.
- __db.url__: The URL to MongoDB `mongodb://localhost/nodewiki`
- __keepDeletedItemsPeriod__: This is the time in milliseconds that deleted pages are kept, before they are completly wiped.

NodeWiki has sensible defaults and if you do not wish to override an option you do not have to mention it in your configuration. Just provide what you want to be different.

###Text search

As search engine Mongodb 2.4 experimental text search is used. This feature has to be explicitly enabled as startup parameter `textSearchEnabled=true` or in the _mongod.conf_ with `setParameter = textSearchEnabled=true`. If you do not have a MongoDB with text search or can not use it, please use the 0.1.x branch.

###Localization

Currently Ubiquinote supports English and German out of the box. If you want a new locale you can define it in the locales directory. Ubiquinote uses the [i18n-2](http://github.com/jeresig/i18n-node-2) module. Therefore it uses a JSON formatted list of key value pairs.

###Tests

As of version v0.4.0 a solid test base has been created. To run the tests you need to have mongod running, then fire up `npm test`.

###Frontend

Ubiquinote uses browserify to modularize it's frontend. All frontend code is located in
`/frontend` and is compiled into `/public/javascripts/app.js`. This is
automatically done once if you start a server under production environment. If
you start the dev server with `./dev`, watchify is used to watch for
changes and recompile when needed.

## Credits

The vast majority of the work on this project was done by [Thomas Peklak](https://github.com/thomaspeklak) in his wonderful [Node Wiki](https://github.com/thomaspeklak/node-wiki) project. At this point, this project is merely a different use case of his software.

