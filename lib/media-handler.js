
var _ = require('underscore');

var plugins = Object.create(null);

exports.addPlugin = function(pluginName){
	// Design inspired by log4js
	var plugin;
	try{
		plugin = require('../media-plugins/' + pluginName);
	} catch(err){
		plugin = require(pluginName);
	}

	plugins[pluginName] = plugin;	
}

exports.getWhitelistTags = function(){
	var tags = [];
	_.each(plugins, function(plugin){
		if(!plugin.tags){
			return;
		}
		tags = _.union(tags, plugin.tags);
	});
	return tags;
}

exports.render = function(type, fileName, content, pageId, cb){
	var plugin = getPlugin(type);	

	plugin.insert("/attachments/" + pageId + "/" + fileName, content, function(insert){
		cb(insert);
	});
}

exports.preview = function(type, fileName, content, pageId, cb){
	var plugin = getPlugin(type);	

	if (!plugin.preview){
		return cb(undefined, undefined);
	}

	plugin.preview("/attachments/" + pageId + "/" + fileName, content, function(preview, err){
		cb(preview, err);
	});
}

function getPlugin(type){
	var plugin;
	
	_.each(plugins, function(plug){
		if (plug.mime.indexOf(type) != -1){
			plugin = plug;
		}
	});

	if (!plugin){
		throw new Error("Unsupported filetype: " + type);
	}
	return plugin;
}