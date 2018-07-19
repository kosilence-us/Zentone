const bluebird = require('bluebird');
const request = bluebird.promisifyAll(require('request'), { multiArgs: true });
const cheerio = require('cheerio');
const graph = require('fbgraph');
const Twit = require('twit');
const Linkedin = require('node-linkedin')(process.env.LINKEDIN_ID, process.env.LINKEDIN_SECRET, process.env.LINKEDIN_CALLBACK_URL);
const paypal = require('paypal-rest-sdk');
const uuidv4 = require('uuid/v4');
const db = require('.././models/db');

const Users = db.users;
const Presentations = db.presentations;
const Pdfs = db.pdfs;
const Audio = db.audio;
const Bookmarks = db.bookmarks;
const Downloads = db.downloads;
const Shares = db.shares;
const Views = db.views;

/* ** ** ** ** ** ** ** Internal API Routes ** ** ** ** ** ** * */
/**
 * POST /api/pdf
 * Upload PDFs
 */
exports.sendPdf = async (req, res) => {
  try {
    const { file } = req;
    const { name, originalname, size } = file;
    const fileUrl = file.url.replace(/^http:\/\//i, 'https://');
    const createdAt = new Date().getTime();
    const userID = req.user.id;
    console.log('-------file from OSS----------');
    console.log(JSON.stringify(file, undefined, 2));
    console.log('--> Modified URL: ', fileUrl);
    if (file.mimetype !== 'application/pdf') {
      req.flash('error', {
        msg: 'File must be in .pdf format.'
      });
      return res.status(422).send({
        error: 'The uploaded file must be a pdf'
      });
    }
    console.log('--> User: ', req.user.dataValues.id);
    console.log('--> Session: ', req.sessionID);
    const presentation = await Presentations
      .create({
        id: req.sessionID,
        userID
      });
    const pdf = await Pdfs
      .create({
        id: uuidv4(),
        userID,
        presentationID: req.sessionID,
        fileName: name,
        originalFileName: originalname,
        fileUrl,
        size,
        createdAt
      });
    // console.log(slide.get({ plain: true }));
    console.log('--> pdf: ', pdf.presentationID);
    console.log('--> presentation: ', presentation.id);
    req.flash('success', { msg: 'File was uploaded successfully.' });
    res.status(200).send([presentation, pdf]);
  } catch (error) {
    res.status(400).send(error);
  }
};

/**
 * GET /api/pdf
 * Upload && Download Audio Files
 */
exports.retrievePdf = async (req, res) => {
  try {
    const { id } = req.session;
    console.log('---> fetching pdf for current session...');
    console.log(id);
    const pdf = await Pdfs.findOne({
      where: { presentationID: id }
    });
    if (!pdf) {
      req.flash('error', { msg: 'Could not retrieve PDF, please upload again' });
      return res.status(404).send();
    }
    // console.log(pdf.fileUrl);
    // console.log(req.hostname);
    res.status(200).send(pdf);
  } catch (err) {
    res.status(400).send(err);
  }
};

/**
 * GET /api/pdf/:id
 * Get pdf by Presentation id
 */
exports.retrievePdfByPresId = async (req, res) => {
  try {
    const { id } = req.params;
    console.log('finding pdf...', id);
    const pdf = await Pdfs.find({
      where: { presentationID: id }
    });
    console.log('--> pdf: ', pdf.dataValues);
    res.status(200).send(pdf);
  } catch (err) {
    res.status(400).send(err);
  }
};

/**
 * GET /api/user/pdf
 * Get all pdfs from user
 */
exports.retrievePdfByUserId = async (req, res) => {
  try {
    const userID = req.user.id;
    const pdfs = await Pdfs.findAll({
      where: {
        userID
      }
    });
    console.log('Retrieved presentation for user...', req.user.id);
    res.status(200).send(pdfs);
  } catch (err) {
    res.status(400).send(err);
  }
}

/**
 * GET /api/pdf/new
 * Get latest presentaion by user
 */
exports.retrievePdfByLatest = async (req, res) => {
  try {
    console.log('--> retrieving latest pdf...');
    const latest = await Pdfs.findAll({
      limit: 1,
      order: [[ 'createdAt', 'DESC' ]]
    });
    if (!latest) {
      return res.status(404).send();
    }
    console.log(latest[0].dataValues);
    res.status(200).send(latest[0]);
  } catch (err) {
    res.status(400).send(err);
  }
};

/**
 * POST /api/audio
 * Upload Audio Files
 */
exports.sendAudio = async (req, res) => {
  try {
    const { user, sessionID, file } = req;
    const { size, pageNum } = req.body;
    const fileUrl = file.url.replace(/^http:\/\//i, 'https://');
    const createdAt = new Date().getTime();
    console.log('------- audio file from OSS ----------');
    // console.log(JSON.stringify(file, undefined, 2));
    if (!sessionID) {
      req.flash('error', { msg: 'Session expired, please upload a new presentation' });
      return res.status(400).send('Session ID does not match presentation');
    }
    if (!file.mimetype.match('audio.*')) {
      req.flash('error', { msg: 'File must be in .mp3 format.' });
      return res.status(422).send('The uploaded file must be an mp3');
    }
    const audio = await Audio.create({
      id: uuidv4(),
      userID: user.id,
      presentationID: sessionID,
      fileName: file.name,
      originalFileName: file.originalname,
      fileUrl,
      size,
      pageNum,
      createdAt
    });
    console.log(audio.dataValues);
    res.status(200).send(audio);
  } catch (err) {
    req.flash('warning', { msg: 'The file was unable to upload correctly' });
    res.status(400).send(err.message);
  }
};
/**
 * GET /api/audio
 * Get Audio Files for Current Session
 */
exports.retrieveAudio = async (req, res) => {
  try {
    console.log(`--> fetching audio for Presentation: ${req.sessionID}`);
    const audio = await Audio.findAll({
      where: { presentationID: req.sessionID }
    });
    if (!audio) {
      return res.status(404).send(`No audio files found for presentation ${req.sessionID}`);
    }
    // console.log(JSON.stringify(audio, undefined, 2));
    res.status(200).send(audio);
  } catch (err) {
    res.status(400).send(err.message);
  }
};

/**
 * GET /api/audio/:id
 * Get Audio Files by Presentation ID
 */
exports.retrieveAudioByPresId = async (req, res) => {
  try {
    console.log('--> fetching audio...', req.params.id);
    const { id } = req.params;
    const audio = await Audio.findAll({
      where: { presentationID: id }
    });
    if (!audio) {
      return res.status(404).send(`Could not find audio for Presentation: ${id}`);
    }
    console.log('success!');
    res.status(200).send(audio);
  } catch (err) {
    res.status(400).send(err);
  }
};

/**
 * UPDATE /api/audio
 * Update Multiple Audio in Array
 */
exports.updateAudio = async (req, res) => {
  try {
    console.log('--> Updating Audio...');
    const { audioArr } = req.body;
    const updated = await audioArr.map((audio) => Audio.update({
        pageNum: audioArr.pageNum
      }, {
        where: { id: audio.id },
        returning: true
      }));
    console.log('--> Updated Audio: ', updated.dataValues);
    res.status(200).send(audioArr);
  } catch (err) {
    res.status(400).send(err);
  }
};

/**
 * DELETE /api/audio/:id
 * Delete Audio by ID
 */
exports.deleteAudioById = async (req, res) => {
  try {
    console.log('--> Deleting Audio...', req.params.id);
    const { id } = req.params;
    const deleted = await Audio.destroy({
      where: { id }
    });
    console.log('deleted');
    res.status(200).send({ deleted });
  } catch (err) {
    res.status(400).send(err);
  }
}

/**
 * UPDATE /api/presentation
 * Update Presentation Blog Contents
 */
exports.updatePresentation = async (req, res) => {
  try {
    const id = req.params.presentationID || req.sessionID;
    console.log('--> Updating Presentation...', id);
    const tags = req.body.tags.split(',');
    const title = req.body.title.trim();
    const article = req.body.article.trim();
    const updated = await Presentations.update({
      tags, title, article
    }, {
      where: { id },
      returning: true
    });
    console.log('--> Updated Presentation: ', updated.id);
    res.status(200).send(id);
  } catch (err) {
    res.status(400).send(err);
  }
}

/**
 * GET /api/user/presentation
 * Get all presentations from user
 */
exports.retrievePresentationByUserId = async (req, res) => {
  try {
    
    const userID = req.user.id;
    const presentations = await Presentations.findAll({
      where: { userID }
    });
    console.log('Retrieved presentation for user...', req.user.id);
    res.status(200).send(presentations);
  } catch (err) {
    res.status(400).send(err);
  }
}

/**
 * GET /api/presentation/:id
 * Get presentation by ID
 */
exports.retrievePresentationById = async (req, res) => {
  try {
    console.log('--> finding presentation: ', req.params.id);
    const { id } = req.params;
    const presentation = await Presentations.findById(id);
    console.log('--> presentation:', presentation.dataValues);
    res.status(200).send(presentation);
  } catch (err) {
    res.status(400).send(err);
  }
}

/**
 * GET /api/presentation/new
 * Get latest presentaion by user
 */
exports.retrievePresentationByLatest = async (req, res) => {
  try {
    const latest = await Presentations.findAll({
      limit: 1,
      where: {
        id: req.sessionID
      },
      order: [[ 'createdAt', 'DESC' ]]
    });
    console.log('--> latest presentation: ', latest);
    res.status(200).send(latest);
  } catch (err) {
    res.send(400).send(err);
  }
};

/* ** ** ** ** ** ** ** Social API Routes ** ** ** ** ** ** * */
/**
 * POST /api/social/share
 * Post Shared Presentation
 */
exports.sendShare = async (req, res) => {
  try {
    const { body } = req;
    console.log('--> Sending share for...', body.id);
    // console.log(req.user.id);
    const presentationShared = await Presentations.findById(body.id);
    const userSharedID = presentationShared.userID;
    console.log(userSharedID);
    const shared = await Shares.findOrCreate({
      where: {
        userID: req.user.id,
        userSharedID,
        presentationID: body.id
      }
    });
    console.log(shared);
    if (shared[0].isNewRecord) {
      res.status(200).send(shared[0]);
    } else {
      res.send({ msg: 'Already Shared!' });
    }
  } catch (err) {
    res.status(400).send(err);
  }
};

/**
 * POST /api/social/share
 * Post Shared Presentation
 */
exports.sendShare = async (req, res) => {
  try {
    const { body } = req;
    console.log('--> Sending share for...', body.id);
    // console.log(req.user.id);
    const presentationShared = await Presentations.findById(body.id);
    const userSharedID = presentationShared.userID;
    console.log(userSharedID);
    const shared = await Shares.findOrCreate({
      where: {
        userID: req.user.id,
        userSharedID,
        presentationID: body.id
      }
    });
    console.log(shared);
    if (shared[0].isNewRecord) {
      res.status(200).send(shared[0]);
    } else {
      res.send({ msg: 'Already Shared!' });
    }
  } catch (err) {
    res.status(400).send(err);
  }
};

/**
 * GET /api/social/bookmark/:id
 * Get Bookmark by PresentationID
 */
exports.retrieveBookmarkById = async (req, res) => {
  try {
    const { params } = req;
    console.log('--> Retrieving bookmark for...', params.id);
    const bookmark = await Bookmarks.find({
      where: {
        presentationID: params.id
      }
    });
    if (bookmark) {
      res.status(200).send({ bookmark });
    } else {
      res.send({ msg: 'No bookmark for this presentation found '});
    }
  } catch (err) {
    res.status(400).send(err);
  }
}

/**
 * POST /api/social/bookmark
 * Post Bookmarked Presentation
 */
exports.sendBookmark = async (req, res) => {
  try {
    const { body } = req;
    console.log('--> Sending bookmark for...', body.id);
    const presentationShared = await Presentations.findById(body.id);
    const userBookmarkedID = presentationShared.userID;
    const bookmarked = await Bookmarks.findOrCreate({
      where: {
        userID: req.user.id,
        userBookmarkedID,
        presentationID: body.id
      }
    });
    if (bookmarked[0].id) {
      res.status(200).send(bookmarked[0]);
    } else {
      res.send({ msg: 'Already Bookmarked!' });
    }
  } catch (err) {
    res.status(400).send(err);
  }
};

/**
 * DELETE /api/social/bookmark
 * Delete Bookmarked Presentation
 */
exports.deleteBookmark = async (req, res) => {
  try {
    const { body } = req;
    console.log('--> Deleting bookmark for...', body.id);
    const presentationShared = await Presentations.findById(body.id);
    const userBookmarkedID = presentationShared.userID;
    const bookmarked = await Bookmarks.destroy({
      where: {
        userID: req.user.id,
        userBookmarkedID,
        presentationID: body.id
      }
    });
    if (bookmarked.length !== 0) {
      res.status(200).send({ bookmarked });
    } else {
      res.send({ msg: 'Already Bookmarked!' });
    }
  } catch (err) {
    res.status(400).send(err);
  }
};

/**
 * POST /api/social/download
 * Post Downloaded Presentation
 */
exports.sendDownload = async (req, res) => {
  try {
    const { body } = req;
    console.log('--> Sending download for...', body.id);
    const presentationDownloaded = await Presentations.findById(body.id);
    const userDownloadedID = presentationDownloaded.userID;
    const downloaded = await Downloads.findOrCreate({
      where: {
        userID: req.user.id,
        userDownloadedID,
        presentationID: body.id
      }
    });
    if (downloaded[0].isNewRecord) {
      res.status(200).send(downloaded[0]);
    } else {
      res.send({ msg: 'Already Shared!' });
    }
  } catch (err) {
    res.status(400).send(err);
  }
};

/* ** ** ** ** ** ** ** External API Routes ** ** ** ** ** ** * */
/**
 * GET /api/facebook
 * Facebook API example.
 */
exports.getFacebook = (req, res, next) => {
  console.log('--> Facebook API route reached...', req.user.tokens);
  const token = req.user.tokens.find(token => token.kind === 'facebook');
  graph.setAccessToken(token.accessToken);
  graph.get(`${req.user.facebook}?fields=id,name,email,first_name,last_name,gender,link,locale,timezone`, (err, results) => {
    if (err) {
      return next(err);
    }
    res.render('api/facebook', {
      title: 'Facebook API',
      profile: results
    });
  });
};

/**
 * GET /api/twitter
 * Twitter API example.
 */
exports.getTwitter = (req, res, next) => {
  const token = req.user.tokens.find(token => token.kind === 'twitter');
  const T = new Twit({
    consumer_key: process.env.TWITTER_KEY,
    consumer_secret: process.env.TWITTER_SECRET,
    access_token: token.accessToken,
    access_token_secret: token.tokenSecret
  });
  T.get('search/tweets', {
    q: 'nodejs since:2013-01-01',
    geocode: '40.71448,-74.00598,5mi',
    count: 10
  }, (err, reply) => {
    if (err) {
      return next(err);
    }
    res.render('api/twitter', {
      title: 'Twitter API',
      tweets: reply.statuses
    });
  });
};

/**
 * POST /api/twitter
 * Post a tweet.
 */
exports.postTwitter = (req, res, next) => {
  req.assert('tweet', 'Tweet cannot be empty').notEmpty();

  const errors = req.validationErrors();

  if (errors) {
    req.flash('errors', errors);
    return res.redirect('/api/twitter');
  }

  const token = req.user.tokens.find(token => token.kind === 'twitter');
  const T = new Twit({
    consumer_key: process.env.TWITTER_KEY,
    consumer_secret: process.env.TWITTER_SECRET,
    access_token: token.accessToken,
    access_token_secret: token.tokenSecret
  });
  T.post('statuses/update', {
    status: req.body.tweet
  }, (err) => {
    if (err) {
      return next(err);
    }
    req.flash('success', {
      msg: 'Your tweet has been posted.'
    });
    res.redirect('/api/twitter');
  });
};

/**
 * GET /api/linkedin
 * LinkedIn API example.
 */
exports.getLinkedin = (req, res, next) => {
  const token = req.user.tokens.find(token => token.kind === 'linkedin');
  const linkedin = Linkedin.init(token.accessToken);
  linkedin.people.me((err, $in) => {
    if (err) {
      return next(err);
    }
    res.render('api/linkedin', {
      title: 'LinkedIn API',
      profile: $in
    });
  });
};

/**
 * GET /api/paypal
 * PayPal SDK example.
 */
exports.getPayPal = (req, res, next) => {
  paypal.configure({
    mode: 'sandbox',
    client_id: process.env.PAYPAL_ID,
    client_secret: process.env.PAYPAL_SECRET
  });

  const paymentDetails = {
    intent: 'sale',
    payer: {
      payment_method: 'paypal'
    },
    redirect_urls: {
      return_url: process.env.PAYPAL_RETURN_URL,
      cancel_url: process.env.PAYPAL_CANCEL_URL
    },
    transactions: [{
      description: 'Hackathon Starter',
      amount: {
        currency: 'USD',
        total: '1.99'
      }
    }]
  };

  paypal.payment.create(paymentDetails, (err, payment) => {
    if (err) {
      return next(err);
    }
    req.session.paymentId = payment.id;
    const {
      links
    } = payment;
    for (let i = 0; i < links.length; i++) {
      if (links[i].rel === 'approval_url') {
        res.render('api/paypal', {
          approvalUrl: links[i].href
        });
      }
    }
  });
};

/**
 * GET /api/paypal/success
 * PayPal SDK example.
 */
exports.getPayPalSuccess = (req, res) => {
  const {
    paymentId
  } = req.session;
  const paymentDetails = {
    payer_id: req.query.PayerID
  };
  paypal.payment.execute(paymentId, paymentDetails, (err) => {
    res.render('api/paypal', {
      result: true,
      success: !err
    });
  });
};

/**
 * GET /api/paypal/cancel
 * PayPal SDK example.
 */
exports.getPayPalCancel = (req, res) => {
  req.session.paymentId = null;
  res.render('api/paypal', {
    result: true,
    canceled: true
  });
};

/**
 * GET /api/scraping
 * Web scraping example using Cheerio library.
 */
exports.getScraping = (req, res, next) => {
  request.get('https://news.ycombinator.com/', (err, request, body) => {
    if (err) {
      return next(err);
    }
    const $ = cheerio.load(body);
    const links = [];
    $('.title a[href^="http"], a[href^="https"]').each((index, element) => {
      links.push($(element));
    });
    res.render('api/scraping', {
      title: 'Web Scraping',
      links
    });
  });
};
