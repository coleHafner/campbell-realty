var keystone = require('keystone'),
	Enquiry = keystone.list('Enquiry'),
	_ = require('lodash');

exports = module.exports = function (req, res) {

	var view = new keystone.View(req, res);

	// Set locals
	res.locals.section = 'contact';
	res.locals.enquiryTypes = Enquiry.fields.enquiryType.ops;
	res.locals.formData = req.body || {};
	res.locals.validationErrors = {};
	res.locals.enquirySubmitted = false;
	res.locals.listing = '';
	
	view.on('init', function(next) {
		if (req.params.listingSlug && _.isUndefined(res.locals.formData.message)) {
			keystone.list('Listing')
				.model
				.findOne({
					slug: req.params.listingSlug
				})
				.exec()
				.then(function(listing) {
					var ad = listing.address,
						message = 'Hey Eric, I\'m interested in ';
						message += ad.street1 + ' ' + ad.suburb + ', ' + ad.state;
						
					res.locals.listing = listing;
					res.locals.formData.message = message;
					next();
				}, function(err) {
					console.log('err retrieving listing', err);
					next();
				});
		}
		next();
	});

	// On POST requests, add the Enquiry item to the database
	view.on('post', { action: 'contact' }, function (next) {

		var newEnquiry = new Enquiry.model();
		var updater = newEnquiry.getUpdateHandler(req);

		updater.process(req.body, {
			flashErrors: true,
			fields: 'name, email, phone, enquiryType, message',
			errorMessage: 'There was a problem submitting your enquiry:'
		}, function (err) {
			if (err) {
				res.locals.validationErrors = err.errors;
			} else {
				res.locals.enquirySubmitted = true;
			}
			next();
		});
	});

	view.render('contact');
};
