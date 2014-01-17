
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

exports.render = function(type, fileName, content, page){
	var plugin;
	
	plugin = plugins[type];

	if (!plugin){
		// Try just the parent media type
		plugin = plugins[type.replace(/\/.*/, '')];

		if (!plugin){
			throw new Error("Unsupported filetype: " + type);
		}
	}

	return plugin.render(fileName, content, page);
}