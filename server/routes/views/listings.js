var keystone = require('keystone'),
	 _ = require('lodash');

exports = module.exports = function (req, res) {

	var view = new keystone.View(req, res),
		hasSlug = !_.isUndefined(req.params.slug),
		action = hasSlug ? 'show' : 'index'; 
	
	res.locals.section = 'listings';

	view.on('init', function (next) {
	
		if (hasSlug) {
			
			res.locals.layoutOpts.hideSidebar = true;
			
			keystone
				.list('Listing')
				.model
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
			keystone
				.list('Listing')
				.paginate({
					page: req.query.page || 1,
					perPage: 9,
					maxPages: 10
				})
				.sort('sortOrder')
				.exec(function(err, listings) {
					console.log('LISTINGS', listings);
					res.locals.listings = listings;
					next();
				});
		}
	});
	
	// Render the view
	view.render('listings/' + action);
};
