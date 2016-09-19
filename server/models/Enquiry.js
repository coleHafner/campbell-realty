var keystone = require('keystone'),
	sg = require('sendgrid'),
	Types = keystone.Field.Types;

/**
 * Enquiry Model
 * =============
 */

var Enquiry = new keystone.List('Enquiry', {
	nocreate: true,
	noedit: true,
});

Enquiry.add({
	name: { type: Types.Name, required: true },
	email: { type: Types.Email, required: true },
	phone: { type: String },
	enquiryType: { type: Types.Select, options: [
		{ value: 'message', label: 'Just leaving a message' },
		{ value: 'question', label: 'I\'ve got a question' },
		{ value: 'other', label: 'Something else...' },
	] },
	message: { type: Types.Markdown, required: true },
	createdAt: { type: Date, default: Date.now },
});

Enquiry.schema.pre('save', function (next) {
	this.wasNew = this.isNew;
	next();
});

Enquiry.schema.post('save', function () {
	if (this.wasNew) {
		this.sendNotificationEmail();
	}
});

Enquiry.schema.methods.sendNotificationEmail = function (callback) {
	if (typeof callback !== 'function') {
		callback = function () {};
	}
	var enquiry = this;
	keystone.list('User')
		.model
		.findOne()
		.where('isAdmin', true)
		.exec(function (err, admins) {
			if (err) return callback(err);
			sendEmail({
				to: admins,
				enquiry: enquiry
			});
		});
};

Enquiry.defaultSort = '-createdAt';
Enquiry.defaultColumns = 'name, email, enquiryType, createdAt';
Enquiry.register();

function sendEmail(opts) {
	
	var from = {
		name: 'Campbell Realty',
		email: 'contact@campbell-realty.com',
	};
			
	var content = '<p> Hey there. You have a new message!</p>';
		content += 'Name: ' + (opts.enquiry.name.first || '') + ' ' + (opts.enquiry.name.last || '');
		content += '<br/>';
		content += 'Email: ' + opts.enquiry.email;
		content += '<br/>';
		content += 'Enquiry Type: ' + (opts.enquiry.enquiryType || 'NA');
		content += '<br/>';
		content += 'Phone: ' + (opts.enquiry.phone || 'NA');
		content += '<br/><br/>';
		content += 'Message: ' + opts.enquiry.message.html;
	
	var helper = sg.mail;
		from_email = new helper.Email(from.email, from.name);
		to_email = new helper.Email(opts.to.email);
		subject = 'You have a new enquiry';
		content = new helper.Content('text/html', content);
		mail = new helper.Mail(from_email, subject, to_email, content),
		sender = sg(process.env.SENDGRID_API_KEY),
		mailOpts = mail.toJSON(),
		request = sender.emptyRequest({
			method: 'POST',
			path: '/v3/mail/send',
			body: mailOpts
		});

	sender.API(request, function(error, response) {
	  console.log(response.statusCode);
	  console.log(response.body);
	  console.log(response.headers);
	});
		
//	new keystone.Email({
//		templateName: 'enquiry-notification',
//	}).send({
//		to: admins,
//		from: {
//			name: 'Campbell Realty',
//			email: 'contact@campbell-realty.com',
//		},
//		subject: 'New Enquiry for Campbell Realty',
//		enquiry: enquiry,
//	}, callback);
}