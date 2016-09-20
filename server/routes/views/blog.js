var keystone = require('keystone'),
	async = require('async'),
	_ = require('lodash');

exports = module.exports = function (req, res) {

	var view = new keystone.View(req, res),
		hasSlug = !_.isUndefined(req.params.slug),
		action = hasSlug ? 'show' : 'index'; 

	// Init locals
	res.locals.section = 'blog';
	
	if (hasSlug) {
		res.locals.filters = {
			post: req.params.slug,
		};
		
		res.locals.data = {
			posts: []
		};
		
		res.locals.layoutOpts.hideSidebar = true;
		console.log('res.locals set...', res.locals);
		
	}else {
		res.locals.filters = {
			category: req.params.category,
		};

		res.locals.data = {
			posts: [],
			categories: [],
		};
	}
	
	// Load all categories
	view.on('init', function (next) {
		
		if (hasSlug) {
			
			keystone.list('Post')
				.model
				.findOne({
					state: 'published',
					slug: req.params.slug
				})
				.populate('author categories')
				.exec()
				.then(function (result) {
					res.locals.data.post = result;
					return keystone.list('Post')
						.model
						.find()
						.where('state', 'published')
						.sort('-publishedDate')
						.populate('author')
						.limit('4')
						.exec();
				})
				.then(function(results) {
					res.locals.data.posts = results;
					next();
				}, function(err) {
					next(err);
				});
		}else {
			keystone.list('PostCategory')
				.model
				.find()
				.sort('name')
				.exec()
				.then(function (results) {
					res.locals.data.categories = results;
					
					// Load the counts for each category
					async.each(res.locals.data.categories, function (category, next) {
						keystone.list('Post')
							.model
							.count()
							.where('categories')
							.in([category.id])
							.exec(function (err, count) {
								category.postCount = count;
							});
					});
				})
				.then(function() {
					if (req.params.category) {
						return keystone.list('PostCategory')
							.model
							.findOne({ key: res.locals.filters.category })
							.exec();
					}
				})
				.then(function(maybeCategory) {
					
					if (maybeCategory && req.params.category) {
						res.locals.data.category = maybeCategory;
					}
					
					console.log('locals.data.category ', res.locals.data.category );
			
					var q = keystone.list('Post')
						.paginate({
							page: req.query.page || 1,
							perPage: 10,
							maxPages: 10,
							filters: {
								state: 'published'
							}
						})
						.sort('-publishedDate')
						.populate('author categories');

					if (res.locals.data.category) {
						q.where('categories').in([res.locals.data.category]);
					}
					
					q.exec(function (err, results) {
						res.locals.data.posts = results;
						next(err);
					});
				});
			}
		});

	// Render the view
	view.render('blog/' + action);
};