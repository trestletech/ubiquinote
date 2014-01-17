
exports.render = function(file, content, page){
	return "<img class='polaroid' src='/attachments/" + page._id + "/" + file + "'/>";
}