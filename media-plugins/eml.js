
var MailParser = require("mailparser").MailParser;

var _ = require('underscore');

exports.insert = function(uri, content, cb){
    var mailparser = new MailParser({streamAttachments : true, showAttachmentLinks: true, defaultCharset: 'utf-8'});

    // Image from https://www.iconfinder.com/iconsets/Copenhagen

    mailparser.on("headers", function(headers){
    	var html = '<div class="eml-inline"><div class="icon"><img src="/static-images/eml.png" /></div>'+
    	'<div class="eml-content"><span class="eml-subject">' + 
    		headers.subject + "</span><br />" + headers.date + "</div></div>";
    	cb(html);
    });

    mailparser.write(content);
    mailparser.end();
}

exports.mime = ['message/rfc822'];

exports.tags = ['img'];

exports.preview = function(uri, content, cb){
	var mailparser = new MailParser({streamAttachments : true, showAttachmentLinks: true, defaultCharset: 'utf-8'});

    mailparser.on("end", function(doc){
    	var html = '<div class="eml-subject">' + esc(doc.subject) + "</div>" + 
    		'<table>'+
    		'<tr><td class="field-title">From:</td><td>' + formatMail(doc.from) + "</td></tr>" +
    		'<tr><td class="field-title">Date:</td><td>' + esc(doc.headers.date) + "</td></tr>" +
    		'<tr><td class="field-title">To:</td><td>' + formatMail(doc.to) + "</td></tr>";

    	if (doc["reply-to"]){
    		html += '<tr><td class="field-title">Reply To:</td><td>' + formatMail(doc.headers["replyTo"]) + "</td></tr>";
    	}

    	html += '</table>';

    	html += '<hr />' + doc.html;

    	cb(html);
    });

    mailparser.write(content);
    mailparser.end();
}

esc = function(string){
	if (!string){
		return '';
	}
	return string.replace('<', '&lt;').replace('>', '&gt;');
}

/**
 * Format a mail object in the form of {name: , address: }
 */
formatMail = function(objArr) {
	var str = '';
	var first = true;
	_.each(objArr, function(obj){
		if (obj.name){
			str += esc(obj.name) + ' &lt;';
		}
		str += (first ? '' : ',');
		str += '<a href ="mailto:' + esc(obj.address) + '">' + esc(obj.address) + '</a>';
		if (obj.name)
			str += '&gt;';
		first = false;
	});
	return str;
	
}