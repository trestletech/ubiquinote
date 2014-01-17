
exports.insert = function(uri, content, cb){
	cb("<img class='polaroid' src='"+uri+"'/>");
}

exports.mime = ['image/gif', 'image/jpeg', 'image/pjpeg', 'image/png', 'image/svg+xml'];