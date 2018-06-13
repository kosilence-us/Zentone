const bluebird = require('bluebird');
const request = bluebird.promisifyAll(require('request'), {
  multiArgs: true
});
const cheerio = require('cheerio');
const graph = require('fbgraph');
const Twit = require('twit');
const Linkedin = require('node-linkedin')(process.env.LINKEDIN_ID, process.env.LINKEDIN_SECRET, process.env.LINKEDIN_CALLBACK_URL);
const paypal = require('paypal-rest-sdk');
const uuidv4 = require('uuid/v4');
const db = require('.././models/db');

const Pdfs = db.pdfs;
const Audio = db.audio;
const Presentations = db.presentations;

/**
 * POST /api/pdf/upload
 * Upload PDFs
 */
exports.pdfUpload = (req, res) => {
  const { file } = req;
  const date = new Date().getTime();
  const presId = uuidv4();
  const userID = req.user.dataValues.id;
  console.log('-------file from OSS----------');
  console.log(file);
  if (file.mimetype !== 'application/pdf') {
    req.flash('error', {
      msg: 'File must be in .pdf format.'
    });
    return res.status(422).json({
      error: 'The uploaded file must be a pdf'
    });
  }
  console.log('--> User: ', req.user.dataValues.id);
  console.log(presId);
  Promise.all(
    Presentations.create({
      id: presId,
      userID
    }, err => res.send(err)),
    Pdfs.create({
      id: uuidv4(),
      userID,
      PresentationId: presId,
      fileName: file.name,
      originalFileName: file.originalname,
      fileUrl: file.url,
      uploadDate: date,
      size: file.size
    })
      .then((slide) => {
        // console.log(slide.get({ plain: true }));
        req.flash('success', {
          msg: 'File was uploaded successfully.'
        });
        console.log('--> slide: ', slide.dataValues);
        // fetch url
        return res.status(200).send(slide.dataValues);
      }, err => res.send(err))
  )
    .catch(err => res.send(err));
};

/**
 * GET /api/upload
 * Upload && Download Audio Files
 */
exports.retrievePdf = (req, res) => {
  const { user } = req;
  console.log('fetching latest file from user...');
  console.log(user.dataValues.id);
  Pdfs
    .findAll({
      limit: 1,
      where: {
        userID: user.id
      },
      order: [
        ['createdAt', 'DESC']
      ]
    })
    .then((file) => {
      console.log('success!');
      console.log(file[0].dataValues);
      // console.log(req.hostname);
      return res.status(200).send({
        fileMeta: file[0].dataValues
      });
    }, (err) => {
      return res.status(400).send(err);
    });
};

/**
 * POST /api/audio/upload
 * Upload Audio Files
 */
exports.audioUpload = (req, res) => {
  const { file } = req;
  const { user } = req;
  const { presId } = req;
  const date = new Date().getTime();
  console.log('-------audio file from OSS----------');
  console.log(file);
  if (file.mimetype !== 'audio/mp3') {
    req.flash('error', {
      msg: 'File must be in .mp3 format.'
    });
    return res.status(422).json({
      error: 'The uploaded file must be an mp3'
    });
  }
  Audio
    .create({
      id: uuidv4(),
      userID: user.dataValues.id,
      PresentationId: presId,
      fileName: file.name,
      originalFileName: file.originalname,
      fileUrl: file.url,
      uploadDate: date,
      size: file.size
    })
    .then((mp3) => {
      console.log(mp3);
      req.flash('success', {
        msg: 'File was uploaded successfully.'
      });
      return res.status(200).send(mp3);
    }, (err) => {
      console.log(err);
      req.flash('warning', {
        msg: 'The file was unable to upload correctly'
      });
      return res.status(400).send(err);
    });
};
/**
 * GET /api/audio/download
 * Get Audio Files by Presentation ID
 */
exports.audioByPresId = (req, res) => {
  const presId = req.params;
  console.log('fetching files...', presId);
  Audio.findAll({
    where: {
      PresentationId: presId
    }
  })
    .then((audio) => {
      console.log('success!');
      console.log(audio);
      return res.status(200).send({ audio });
    }, (err) => {
      return res.status(400).send(err);
    });
};

/**
 * GET /api/presentation
 * Get lates presentaion by user
 */
// TODO: req.user not defined
exports.retrievePres = (req, res) => {
  console.log('---> retriving presentation from: ', req.user);
  Presentations.find({
    where: {
      userID: id
    }
  })
    .then((pres) => {
      console.log('success!');
      console.log(pres);
      return res.status(200).send({ pres });
    }, err => res.status(400).send(err));
};

/**
 * GET /api/facebook
 * Facebook API example.
 */
exports.getFacebook = (req, res, next) => {
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
