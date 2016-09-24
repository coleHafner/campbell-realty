/**
 * This file contains the common middleware used by your routes.
 *
 * Extend or replace these functions as your application requires.
 *
 * This structure is not enforced, and just a starting point. If
 * you have more middleware you may want to group it as separate
 * modules in your project's /lib directory.
 */
var _ = require('lodash'),
	keystone = require('keystone');


/**
	Initialises the standard view locals

	The included layout depends on the navLinks array to generate
	the navigation in the header, you may wish to change this array
	or replace it with your own templates / logic.
*/
exports.initLocals = function (req, res, next) {
	
	res.locals.navLinks = [
		//{ label: 'Home', key: 'home', href: '/' },
		{ label: 'Listings', key: 'listings', href: '/listings' },
		{ label: 'Blog', key: 'blog', href: '/blog' },
		{ label: 'Contact', key: 'contact', href: '/contact' },
	];
	
	res.locals.user = req.user;
	
	res.locals.latest = {
		posts: [],
		listings: []
	};
	
	res.locals.contact = {
		phone: '(801) 244-3120',
		email: 'eric@blueroof.com'
	};
	
	res.locals.layoutOpts = {
		hideSidebar: false
	};
	
	next();
};


/**
	Fetches and clears the flashMessages before a view is rendered
*/
exports.flashMessages = function (req, res, next) {
	var flashMessages = {
		info: req.flash('info'),
		success: req.flash('success'),
		warning: req.flash('warning'),
		error: req.flash('error'),
	};
	res.locals.messages = _.some(flashMessages, function (msgs) { return msgs.length; }) ? flashMessages : false;
	next();
};


/**
	Prevents people from accessing protected pages when they're not signed in
 */
exports.requireUser = function (req, res, next) {
	if (!req.user) {
		req.flash('error', 'Please sign in to access this page.');
		res.redirect('/keystone/signin');
	} else {
		next();
	}
};

exports.getLatest = function(req, res, next) {
	keystone.list('Post')
		.model
		.find()
		.where('state', 'published')
		.sort('-publishedDate')
		.limit('5')
		.exec()
		.then(function(latest) {
			res.locals.latest.posts = latest;
	
			return keystone.list('Listing')
				.model
				.find()
				.sort('-createdAt')
				.limit('5')
				.exec();
		}).then(function(latest) {
			res.locals.latest.listings = latest;
			next();
		}, function(err) {
			next();
		});
};