
exports.insert = function(uri, content, cb){
    cb("<audio controls src='" + uri + "'/>");
}

exports.mime = ['audio/mp3', 'audio/mp4', 'audio/ogg'];

exports.tags = ['audio'];