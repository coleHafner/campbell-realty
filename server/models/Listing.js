var keystone = require('keystone'),
	Types = keystone.Field.Types,
	mongoose = require('mongoose');

delete mongoose.models.Listings;
delete mongoose.modelSchemas.Listings;

/**
 * Listing Model
 * ==========
 */

var Listing = new keystone.List('Listing', {
	autokey: { path: 'slug', from: 'address.street1 address.street2 address.city address.state address.postcode', unique: true },
	defaultColumns: 'title, adress.full|60%, status|15%',
	defaultSort: 'createdAt',
	map: { name: 'title' },
	track: true
});

Listing.add({
	author: { type: Types.Relationship, ref: 'User', index: true },
	gallery: { type: Types.Relationship, ref: 'Gallery'},
	
	title: { type: String, required: true },
	sqFootage: {type: Number, label: 'Sq. Footage'},
	image: { type: Types.CloudinaryImage, label: 'Title Image' },
	numBedrooms: {type: Types.Number, label: 'Total Bedrooms'},
	numBathrooms: {type: Types.Number, label: 'Total Bathrooms'},
	address: {type: Types.Location, defaults: {country: 'USA', state: 'UT'}},
	price: {type: Types.Money, format: '$0,0.00'},
	
	// address: {
	// 	street1: {type: String, index: true, required: true, label: 'Address Line 1'},
	// 	street2: {type: String, label: 'Address Line 2'},
	// 	city: {type: String},
	// 	state: {type: String, index: true},
	// 	zip: {type: String, required: true, label: 'Zip Code'}
	// },
	
	status: { type: Types.Select, options: 'active, pending, sold', default: 'active', index: true },
	
	description: {
		brief: { type: Types.Html, wysiwyg: true, height: 150 },
		extended: { type: Types.Html, wysiwyg: true, height: 400 }
	}
});

Listing.schema.virtual('description.full').get(function () {
	return this.description.extended || this.description.brief;
});

// Listing.schema.virtual('address.full').get(function () {
// 	var full = this.address.street1;
// 	full += this.address.street2 ? ' ' + this.address.street2 : '';
// 	full += this.address.city ? ' ' + this.address.city : '';
// 	full += this.address.state ? ' ' + this.address.state : '';
// 	full += this.address.zip ? ' ' + this.address.zip : '';
// 	return full;
// });

Listing.register();
