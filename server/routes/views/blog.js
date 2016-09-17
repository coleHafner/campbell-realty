var keystone = require('keystone'),
	async = require('async'),
	_ = require('lodash');

exports = module.exports = function (req, res) {

	var view = new keystone.View(req, res),
		locals = res.locals,
		hasSlug = !_.isUndefined(req.params.slug),
		action = hasSlug ? 'show' : 'index'; 

	// Init locals
	locals.section = 'blog';
	
	if (hasSlug) {
		locals.filters = {
			post: req.params.slug,
		};
		
		locals.data = {
			posts: [],
		};
		
	}else {
		locals.filters = {
			category: req.params.category,
		};

		locals.data = {
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
					locals.data.post = result;
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
					locals.data.posts = results;
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
					locals.data.categories = results;
					
					// Load the counts for each category
					async.each(locals.data.categories, function (category, next) {
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
							.findOne({ key: locals.filters.category })
							.exec();
					}
				})
				.then(function(maybeCategory) {
					
					if (maybeCategory && req.params.category) {
						locals.data.category = maybeCategory;
					}
					
					console.log('locals.data.category ', locals.data.category );
			
					var q = keystone.list('Post')
						.paginate({
							page: req.query.page || 1,
							perPage: 5,
							maxPages: 10,
							filters: {
								state: 'published'
							}
						})
						.sort('-publishedDate')
						.populate('author categories');

					if (locals.data.category) {
						q.where('categories').in([locals.data.category]);
						console.log('FILTERING FOR CATS');
					}
					
					q.exec(function (err, results) {
						locals.data.posts = results;
						next(err);
					});
				});
			}
		});

	// Render the view
	view.render('blog/' + action);
};