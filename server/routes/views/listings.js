var keystone = require('keystone'),
	 _ = require('lodash');

exports = module.exports = function (req, res) {

	var view = new keystone.View(req, res),
		Listing = keystone.list('Listing'),
		hasSlug = !_.isUndefined(req.params.slug),
		action = hasSlug ? 'show' : 'index'; 
	
	res.locals.section = 'listings';

	view.on('init', function (next) {
	
		if (hasSlug) {
			Listing.model
				.findOne()
				.where('slug', req.params.slug)
				.sort('sortOrder')
				.exec()
				.then(function (listing) {
					res.locals.listing = listing;
					next();
				});
		}else {
			// Load the galleries by sortOrder
			Listing.model
				.find()
				.sort('sortOrder')
				.exec()
				.then(function(listings) {
					console.log('LISTINGS', listings);
					res.locals.listings = listings;
					next();
				});
		}
	});
	
	// Render the view
	view.render('listings/' + action);
};
