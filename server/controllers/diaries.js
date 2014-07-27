'use strict';

/*
 * Module dependencies
 */
var mongoose = require('mongoose'),
	Diary = mongoose.model('Diary');

/*
 * Image dependencies
 */
var uuid = require('uuid'),
	multiparty = require('multiparty'),
	fs = require('fs'),
	gm = require('gm');

/*
 * Logger dependencies
 */
var winston = require('winston');
var log = new(winston.Logger)({
	transports: [
		new(winston.transports.Console)({
			colorize: true
		}),
		new(winston.transports.File)({
			filename: 'log/diaries',
			handleExceptions: true,
			exitOnError: false
		})
	]
});

/*
 * Global variables
 */
var tmpImageFolder = 'public/system/assets/tmp/',
	imageFolder = 'public/system/assets/img/diaries/',
	defaultQuerySize = 20,
	maxQuerySize = 100;

/*
 * Save diary
 */
exports.create = function(req, res) {
	if (!req.user) {
		return res.status(400).send('You must be logged in user.');
	}
	var diary = new Diary(req.body);
	req.assert('text', 'Text of diary can\'t be empty').notEmpty();

	var errors = req.validationErrors();
	if (errors) {
		return res.status(400).send(errors);
	}

	if (diary.image) {
		if (diary.image.substring(0, tmpImageFolder.length) === tmpImageFolder && !fs.existsSync(diary.image)) {
			log.error('create: Creating new post with image, can\'t find temp image.', {
				tmpImage: diary.image
			});
			return res.status(400).send('Temporary image do not exists.');
		}
		diary.image = diary.image.substring(tmpImageFolder.length);
		fs.rename(tmpImageFolder + diary.image, imageFolder + diary.image, function(err) {
			if (err)
				log.error('create: Creating new post with image, can\'t rename tmp image.', {
					tmpImage: diary.image,
					err: err
				});
		});
	}

	diary.user = req.user._id;
	diary.username = req.user.username;

	diary.save(function(err, product) {
		if (err) {
			log.error('create: Creating new post can\'t save.', {
				err: err
			});
			switch (err.code) {
				default: return res.status(400).send('Please enter diary text.');
			}

			return res.status(400).send('Error');
		}
		res.json(product);
	});
};

/*
 * Get diary by ID
 */
exports.getId = function(req, res) {
	if (req.params.diaryId) {
		Diary
			.findById(req.params.diaryId)
			.exec(function(err, diary) {
				if (err) {
					return res.status(400).send('No diary with this id found.');
				} else {
					if (diary === null)
						return res.status(400).send('No diary with this id found.');
					if (!diary.showUser)
						if (!(req.user && String(diary.user) === String(req.user._id))) {
							diary.user = undefined;
							diary.username = undefined;
						}
					return res.json(diary);
				}
			});
	} else {
		return res.status(400).send('No diary id supplied.');
	}
};

/*
 * Get diaries by coordinates and distance
 */
exports.getNear = function(req, res) {
	var lat = req.params.lat, // Latitudes
		lng = req.params.lng, // Longitudes
		dist = req.params.dist; // Distance

	var skip = req.query.skip || 0;
	var size = req.query.size || defaultQuerySize;
	if (size > maxQuerySize)
		size = maxQuerySize;
	var sort = req.query.sort || 'createdDate';
	var order = Number(req.query.order) || -1;
	if (['createdDate', 'vote'].indexOf(sort) === -1 || [1, -1].indexOf(order) === -1)
		return res.status(400).send('Sorting parameters are undefined.');
	var sortObj = {};
	sortObj[sort] = order;

	if (lat && lng && dist) {
		var query = {
			loc: {
				$near: [lat, lng],
				$maxDistance: dist
			}
		};
		Diary
			.find(query)
			.sort(sortObj)
			.skip(skip)
			.limit(size)
			.exec(function(err, diaries) {
				if (err) {
					return res.status(400).send('No diary found.');
				} else {
					Diary.count(query, function(err, count) {
						if (err) {
							log.error('getNear: Counting diaries failed.', {
								err: err
							});
							return res.status(400).sent('Counting diaries failed.');
						}
						for (var i = 0, j = diaries.length; i < j; i++) {
							if (!diaries[i].showUser) {
								if (req.user && String(diaries[i].user) === String(req.user._id))
									continue;
								diaries[i].user = undefined;
								diaries[i].username = undefined;
							}
						}
						var result = {
							diaries: diaries,
							querySize: Number(size),
							wholeSize: count,
							skip: Number(skip)
						};
						return res.json(result);
					});
				}
			});
	} else {
		return res.status(400).send('No latitudes or longitudes or distance supplied.');
	}
};

/*
 * Get diaries in box
 */
exports.getBox = function(req, res) {
	var x1 = req.params.x1,
		y1 = req.params.y1,
		x2 = req.params.x2,
		y2 = req.params.y2;

	var skip = req.query.skip || 0;
	var size = req.query.size || defaultQuerySize;
	if (size > maxQuerySize)
		size = maxQuerySize;
	var sort = req.query.sort || 'createdDate';
	var order = Number(req.query.order) || -1;
	if (['createdDate', 'vote'].indexOf(sort) === -1 || [1, -1].indexOf(order) === -1)
		return res.status(400).send('Sorting parameters are undefined.');
	var sortObj = {};
	sortObj[sort] = order;

	if (x1 && y1 && x2 && y2) {
		var query = {
			loc: {
				$geoWithin: {
					$box: [
						[x1, y1],
						[x2, y2]
					]
				}
			}
		};
		Diary
			.find(query)
			.sort(sortObj)
			.skip(skip)
			.limit(size)
			.exec(function(err, diaries) {
				if (err) {
					return res.status(400).send('No diary found.');
				} else {
					Diary.count(query, function(err, count) {
						if (err) {
							log.error('getBox: Counting diaries failed.', {
								err: err
							});
							return res.status(400).sent('Counting diaries failed.');
						}
						for (var i = 0, j = diaries.length; i < j; i++) {
							if (!diaries[i].showUser) {
								if (req.user && String(diaries[i].user) === String(req.user._id))
									continue;
								diaries[i].user = undefined;
								diaries[i].username = undefined;
							}
						}
						var result = {
							diaries: diaries,
							querySize: Number(size),
							wholeSize: count,
							skip: Number(skip)
						};
						return res.json(result);
					});
				}
			});
	} else {
		return res.status(400).send('No [X1, X2]x[Y1, Y2] supplied.');
	}
};


/*
 * Get diaries by tag
 */
exports.getTag = function(req, res) {
	var tag = req.params.tag;

	var skip = req.query.skip || 0;
	var size = req.query.size || defaultQuerySize;
	if (size > maxQuerySize)
		size = maxQuerySize;
	var sort = req.query.sort || 'createdDate';
	var order = Number(req.query.order) || -1;
	if (['createdDate', 'vote'].indexOf(sort) === -1 || [1, -1].indexOf(order) === -1)
		return res.status(400).send('Sorting parameters are undefined.');
	var sortObj = {};
	sortObj[sort] = order;

	if (tag) {
		var query = {
			tags: tag
		};
		Diary
			.find(query)
			.sort(sortObj)
			.skip(skip)
			.limit(size)
			.exec(function(err, diaries) {
				if (err) {
					return res.status(400).send('No diary found.');
				} else {
					Diary.count(query, function(err, count) {
						log.error('getTag: Counting diaries failed.', {
							err: err
						});
						if (err) {
							return res.status(400).sent('Counting diaries failed.');
						}
						for (var i = 0, j = diaries.length; i < j; i++) {
							if (!diaries[i].showUser) {
								if (req.user && String(diaries[i].user) === String(req.user._id))
									continue;
								diaries[i].user = undefined;
								diaries[i].username = undefined;
							}
						}
						var result = {
							diaries: diaries,
							querySize: Number(size),
							wholeSize: count,
							skip: Number(skip)
						};
						return res.json(result);
					});
				}
			});
	} else {
		return res.status(400).send('No tag supplied.');
	}
};

/*
 * Search diaries by text
 */
exports.search = function(req, res) {
	var key = req.params.key;
	if (key === undefined)
		return res.status(400).send('No search key supplied.');

	// Pagging need to be fixed.
	/* var skip = req.query.skip || 0;
	var size = req.query.size || defaultQuerySize;
	if (size > maxQuerySize)
		size = maxQuerySize;*/

	Diary.textSearch(key, function(err, diaries) {
		if (err) {
			log.error('search: Searching for text failed.', {
				err: err
			});
			return res.status(400).send('Something went wrong in searching.');
		}
		var tmp = []; // Don't look like an optimize way.
		for (var i = 0, j = diaries.results.length; i < j; i++) {
			if (!diaries.results[i].obj.showUser) {
				if (req.user && String(diaries.results[i].obj.user) === String(req.user._id))
					continue;
				diaries.results[i].obj.user = undefined;
				diaries.results[i].obj.username = undefined;
			}
			tmp.push(diaries.results[i].obj);
		}
		var result = {
			diaries: tmp
		};
		return res.json(result);
	});
};

/*
 * Diary edit
 */
exports.edit = function(req, res) {
	if (!req.user) {
		return res.status(400).send('You must be logged in user.');
	}
	if (req.params.diaryId) {
		Diary
			.findOne({
				_id: req.params.diaryId,
				user: req.user._id
			})
			.exec(function(err, diary) {
				if (err || diary === null) {
					return res.status(400).send('No such diary for this user.');
				}
				if (diary.text !== req.body.text || diary.title !== req.body.title) {
					var modify = {
						text: diary.text,
						title: diary.title
					};
					if (diary.lastModifiedDate) {
						modify.modifiedDate = diary.lastModifiedDate;
					} else {
						modify.modifiedDate = diary.createdDate;
					}
					diary.modifies.push(modify);
					diary.lastModifiedDate = Date.now();

					diary.text = req.body.text;
					diary.title = req.body.title;
				}

				diary.showUser = req.body.showUser;

				diary.save(function(err, result) {
					if (err) {
						log.warning('edit: Saving diary failed.', {
							err: err
						});
						return res.status(400).send('Please enter diary text.');
					} else {
						return res.json(result);
					}
				});
			});
	}
};

/*
 * Tags edit
 */
exports.editTags = function(req, res) {
	if (!req.user) {
		return res.status(400).send('You must be logged in user.');
	}
	if (req.params.diaryId) {
		Diary
			.findOne({
				_id: req.params.diaryId,
				user: req.user._id
			})
			.exec(function(err, diary) {
				if (err || diary === null)
					return res.status(400).send('No such diary for this user.');

				diary.tags = req.body.tags;

				diary.save(function(err, result) {
					if (err) {
						log.error('editTags: Saving diary failed.', {
							err: err
						});
						return res.status(400).send('Something went wrong in saving tags.');
					} else {
						return res.status(200).send('Tags updated.');
					}
				});
			});
	}
};

/*
 * Diary like
 */
exports.like = function(req, res) {
	if (!req.user) {
		return res.status(400).send('You must be logged in user.');
	}
	if (req.params.diaryId) {
		Diary
			.findOne({
				_id: req.params.diaryId
			})
			.exec(function(err, diary) {
				if (err || diary === null)
					return res.status(400).send('No such diary found.');

				if (diary.votes.indexOf(req.user._id) === -1) {
					diary.votes.push(req.user._id);
					diary.vote += 1;
					diary.save(function(err) {
						if (err) {
							log.error('like: Saving diary failed.', {
								err: err
							});
							return res.status(400).send('Some error occurred.');
						} else
							return res.status(200).send('Diary liked.');
					});

				} else
					return res.status(400).send('Diary liked before, unable to like twice.');
			});
	}
};

/*
 * Diary unlike
 */
exports.unlike = function(req, res) {
	if (!req.user) {
		return res.status(400).send('You must be logged in user.');
	}
	if (req.params.diaryId) {
		Diary
			.findOne({
				_id: req.params.diaryId
			})
			.exec(function(err, diary) {
				if (err || diary === null)
					return res.status(400).send('No such diary found.');

				var voteIndex = diary.votes.indexOf(req.user._id);
				if (voteIndex !== -1) {
					diary.votes.splice(voteIndex, 1);
					diary.vote -= 1;
					diary.save(function(err) {
						if (err) {
							log.error('unlike: Saving diary failed.', {
								err: err
							});
							return res.status(400).send('Some error occurred.');
						} else
							return res.status(200).send('Diary unliked.');
					});

				} else
					return res.status(400).send('Diary liked before, unable to like twice.');
			});
	}
};

/*
 * Diary toggleLike
 */
exports.toggleLike = function(req, res) {
	if (!req.user) {
		return res.status(400).send('You must be logged in user.');
	}
	if (req.params.diaryId) {
		Diary
			.findOne({
				_id: req.params.diaryId
			})
			.exec(function(err, diary) {
				if (err || diary === null)
					return res.status(400).send('No such diary found.');

				var voteIndex = diary.votes.indexOf(req.user._id);
				if (voteIndex === -1) {
					diary.votes.push(req.user._id);
					diary.vote += 1;
					diary.save(function(err) {
						if (err) {
							log.error('toggleLike: like state: Saving diary failed.', {
								err: err
							});
							return res.status(400).send('Some error occurred.');
						} else
							return res.status(200).send('Diary liked.');
					});
				} else {
					diary.votes.splice(voteIndex, 1);
					diary.vote -= 1;
					diary.save(function(err) {
						if (err) {
							log.error('toggleLike: unlike state: Saving diary failed.', {
								err: err
							});
							return res.status(400).send('Some error occurred.');
						} else
							return res.status(200).send('Diary unliked.');
					});
				}
			});
	}
};

/*
 * Diary delete
 */
exports.delete = function(req, res) {
	if (!req.user) {
		return res.status(400).send('You must be logged in user.');
	}
	if (req.params.diaryId) {
		Diary
			.findOneAndRemove({
				_id: req.params.diaryId,
				user: req.user._id
			})
			.exec(function(err, diary) {
				if (err || diary === null) {
					return res.status(400).send('No such diary for this user.');
				}

				if (diary.image)
					fs.unlink(imageFolder + diary.image);
				return res.status(200).send('Diary removed.');
			});
	}
};

/*
 * Save temporary image for a diary
 */
exports.postImage = function(req, res) {
	var maxSize = 800;
	var extension = '.jpeg';
	var form = new multiparty.Form();
	form.parse(req, function(err, fields, files) {
		var file = files.file[0];
		var contentType = file.headers['content-type'];
		var tmpPath = file.path;
		var fileName = uuid.v4() + extension;
		var destPath = tmpImageFolder + fileName;

		if (contentType !== 'image/png' && contentType !== 'image/jpeg') {
			fs.unlink(tmpPath);
			return res.status(400).send('Unsupported file type.');
		}

		gm(tmpPath)
			.size(function(err, size) {
				if (size.width > size.height && size.width > maxSize)
					this.resize(maxSize, maxSize * size.width / size.height);
				else if (size.height > maxSize)
					this.resize(maxSize * size.height / size.width, maxSize);
				this.quality(80);
				this.noProfile();
				this.bitdepth(8);
				this.write(destPath, function(err) {
					fs.unlink(tmpPath);
					if (err) {
						log.error('postImage: Image is not saved.', {
							err: err
						});
						return res.status(400).send('Image is not saved:');
					}
					return res.json(destPath);
				});
			});
	});
};

/*
 * Admin controllers
 */
/*
 * Admin get diary by ID
 */
exports.adminGetId = function(req, res) {
	if (!req.user)
		return res.status(400).send('You must be logged in user.');
	if (req.user.roles.indexOf('admin') === -1)
		return res.status(400).send('You must be an admin user.');

	if (req.params.diaryId) {
		Diary
			.findById(req.params.diaryId)
			.exec(function(err, diary) {
				if (err) {
					return res.status(400).send('No diary with this id found.');
				} else {
					return res.json(diary);
				}
			});
	} else {
		return res.status(400).send('No diary id supplied.');
	}
};

/*
 * Admin diary edit
 */
exports.adminEdit = function(req, res) {
	if (!req.user)
		return res.status(400).send('You must be logged in user.');
	if (req.user.roles.indexOf('admin') === -1)
		return res.status(400).send('You must be an admin user.');

	if (req.params.diaryId) {
		Diary
			.findOne({
				_id: req.params.diaryId,
			})
			.exec(function(err, diary) {
				if (err || diary === null) {
					return res.status(400).send('Diary not found.');
				}

				var fields = ['loc', 'title', 'text', 'modifies', 'showUser', 'tags', 'vote', 'votes'];
				for (var i in fields)
					diary[fields[i]] = req.body[fields[i]];

				if (req.body.removeImage && diary.image) {
					fs.unlink(imageFolder + diary.image);
					diary.image = undefined;
				}

				diary.save(function(err, result) {
					if (err) {
						log.error('adminEdit: Saving diary failed.', {
							err: err
						});
						return res.status(400).send('Please enter diary text.');
					} else {
						return res.json(result);
					}
				});
			});
	}
};

/*
 * Admin diary delete
 */
exports.adminDelete = function(req, res) {
	if (!req.user)
		return res.status(400).send('You must be logged in user.');
	if (req.user.roles.indexOf('admin') === -1)
		return res.status(400).send('You must be an admin user.');

	if (req.params.diaryId) {
		Diary
			.findOneAndRemove({
				_id: req.params.diaryId,
			})
			.exec(function(err, diary) {
				if (err || diary === null) {
					return res.status(400).send('Diary not found.');
				}

				if (diary.image)
					fs.unlink(imageFolder + diary.image);
				return res.status(200).send('Diary removed.');
			});
	}
};
