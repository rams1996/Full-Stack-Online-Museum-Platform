let express = require('express');
let router = express.Router();
let monk = require('monk');
let db = monk('localhost:27017/vidzy');


router.get('/', (request, response) => {
	response.redirect('/videos');
});

router.get('/videos', (request, response) => {
	let collection = db.get('videos');

	collection.find({}, (error, videos) => {
		if (error) throw error;
		response.render('index', { videos: videos });
	});
});

/**
 * Implementation of Search Functionality
 */
router.search('/videos', (reuqest, response) => {
	let collection = db.get('videos');
	if (reuqest.body.movieGenre == "All") {
		collection.find({ "title": { '$regex': new RegExp("" + reuqest.body.movieTitle, "ig") } }, (error, videos) => {
			if (error) throw error;
			response.render('index', { videos: videos });
		});
	} else {
		collection.find({
			$and: [
				{ "title": { '$regex': new RegExp("" + reuqest.body.movieTitle, "ig") } },
				{ "genre": { '$regex': new RegExp("" + reuqest.body.movieGenre, "ig") } }
			]
		}, (error, videos) => {
			if (error) throw error;
			response.render('index', { videos: videos });
		});
	}

});

/**
 * Add new videos
 */
router.get('/videos/new', (reuqest, response) => {
	response.render('new');
});

/**
 * Insert new videos into the database
 */
router.post('/videos', (reuqest, response) => {
	let collection = db.get('videos');
	collection.insert({
		title: reuqest.body.title,
		genre: reuqest.body.genre,
		image: reuqest.body.image,
		description: reuqest.body.desc
	}, (error) => {
		if (error) throw error;

		response.redirect('/videos');
	});
});


router.get('/videos/:id', (reuqest, response) => {
	let collection = db.get('videos');
	collection.findOne({ _id: reuqest.params.id }, (error, video) => {
		if (error) throw error;
		response.render('show', { video: video });
	});
});

/**
 * Displays edit video information screen
 */
router.get('/videos/:id/edit', (reuqest, response) => {
	let collection = db.get('videos');
	collection.findOne({ _id: reuqest.params.id },  (error, video) => {
		if (error) throw error;
		response.render('edit', { video: video });
	});
});


/**
 * Sends update request to the database
 */
router.put('/videos/:id', (reuqest, response) => {
	let collection = db.get('videos');
	collection.findOneAndUpdate({ _id: reuqest.params.id }, {
		$set: {
			title: reuqest.body.title,
			genre: reuqest.body.genre,
			image: reuqest.body.image,
			description: reuqest.body.desc
		}

	}).then(() => response.redirect('/videos'));
});


/**
 * Delete videos by id
 */
router.delete('/videos/:id', (reuqest, response) => {
	let collection = db.get('videos');
	collection.remove({ _id: reuqest.params.id }, (error) => {
		if (error) throw error;
		response.redirect('/');
	});
});


module.exports = router;