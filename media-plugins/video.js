
exports.insert = function(uri, content, cb){
	cb("<video class='polaroid' width='640' height='480' src='" + uri + "'/>");
}

exports.mime = ['video/mp4', 'video/ogv', 'video/webm'];

exports.tags = ['video'];