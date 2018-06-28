/**
 * Module dependencies.
 */
const express = require('express');
const compression = require('compression');
const session = require('express-session');
const SequelizeStore = require('connect-session-sequelize')(session.Store);
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const logger = require('morgan');
const chalk = require('chalk');
const errorHandler = require('errorhandler');
const lusca = require('lusca');
const dotenv = require('dotenv');
const flash = require('express-flash');
const path = require('path');
const passport = require('passport');
const expressValidator = require('express-validator');
const expressStatusMonitor = require('express-status-monitor');
const sass = require('node-sass-middleware');
const Multer = require('multer');
const aliOssStorage = require('multer-ali-oss');
const exphbs = require('express-handlebars');
const db = require('./models/db.js');

/**
 * Load environment variables from .env file, where API keys and passwords are configured.
 */
dotenv.load({
  path: '.env'
});

/**
 * Aliyun OSS Bucket Config
 */
// TODO: move to config
const upload = Multer({
  storage: aliOssStorage({
    config: {
      accessKeyId: process.env.ALI_CLOUD_OSS_ACCESSKEY_ID,
      accessKeySecret: process.env.ALI_CLOUD_OSS_ACCESSKEY_SECRET,
      bucket: process.env.ALI_CLOUD_OSS_BUCKET,
      region: process.env.ALI_CLOUD_OSS_REGION,
      secure: true
    },
    filename(req, file, done) {
      const date = new Date().getTime();
      const str = `${date} ${file.originalname}`;
      const filename = str.replace(/\s+/g, '-').toLowerCase();
      done(null, filename);
    }
  })
}).single('file');

/**
 * Controllers (route handlers).
 */
const homeController = require('./controllers/home');
const userController = require('./controllers/user');
const apiController = require('./controllers/api');
const contactController = require('./controllers/contact');
const pagesController = require('./controllers/pages');

/**
 * API keys and Passport configuration.
 */
const passportConfig = require('./config/passport');

/**
 * Storage for Sequelize Session
 */
const myStore = new SequelizeStore({
  db: db.sequelize,
  table: 'Sessions'
});

/**
 * Create Express server.
 */
const app = express();

/**
 * Express configuration.
 */
app.set('host', process.env.OPENSHIFT_NODEJS_IP || '0.0.0.0');
app.set('port', process.env.PORT || process.env.OPENSHIFT_NODEJS_PORT || 3000);
const hbs = exphbs.create({
  defaultLayout: 'main',
  helpers: {
    ifeq: (a, b, options) => {
      if (a === b) {
        return options.fn(this);
      }
      return options.inverse(this);
    },
    toJSON: object => JSON.stringify(object)
  }
});
app.engine('handlebars', hbs.engine);
app.set('view engine', 'handlebars');
app.use(expressStatusMonitor());
app.use(compression());
app.use(sass({
  src: path.join(__dirname, 'public'),
  dest: path.join(__dirname, 'public')
}));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(expressValidator());
app.use(cookieParser());
app.use(session({
  secret: process.env.SESSION_SECRET,
  store: myStore,
  resave: false, // we support the touch method so per the express-session docs this should be set to false
  proxy: true, // if you do SSL outside of node.
  saveUninitialized: true,
  // cookie: {},
}));
if (process.env.NODE_ENV === 'production') {
  app.set('trust proxy', 1); // trust first proxy
  // session.cookie.secure = true; // serve secure cookies
}
app.use(passport.initialize());
app.use(passport.session());
app.use(flash());
// app.use((req, res, next) => {
//   if (req.path === '/api/upload' || req.path === '/api/download') {
//     next();
//   } else {
//     lusca.csrf()(req, res, next);
//   }
// });
app.use(lusca.xframe('SAMEORIGIN'));
app.use(lusca.xssProtection(true));
app.use((req, res, next) => {
  res.locals.user = req.user;
  next();
});
app.use((req, res, next) => {
  // After successful login, redirect back to the intended page
  if (!req.user &&
    req.path !== '/login' &&
    req.path !== '/signup' &&
    !req.path.match(/^\/auth/) &&
    !req.path.match(/\./)) {
    req.session.returnTo = req.path;
  } else if (req.user &&
    req.path === '/account') {
    req.session.returnTo = req.path;
  }
  next();
});
app.use(express.static(path.join(__dirname, 'public'), {
  maxAge: 31557600000
}));

/**
 * Primary app routes.
 */
app.get('/', homeController.index);
app.get('/home', homeController.index);
app.get('/slide-upload', pagesController.slide);
app.get('/edit-presentation', pagesController.editPresentation);
app.get('/view-presentation/', pagesController.viewPresentation)
app.get('/login', userController.getLogin);
app.post('/login', userController.postLogin);
app.get('/logout', userController.logout);
app.get('/forgot', userController.getForgot);
app.post('/forgot', userController.postForgot);
app.get('/reset/:token', userController.getReset);
app.post('/reset/:token', userController.postReset);
app.get('/signup', userController.getSignup);
app.post('/signup', userController.postSignup);
app.get('/contact', contactController.getContact);
app.post('/contact', contactController.postContact);
app.get('/account', passportConfig.isAuthenticated, userController.getAccount);
app.post('/account/profile', passportConfig.isAuthenticated, userController.postUpdateProfile);
app.post('/account/password', passportConfig.isAuthenticated, userController.postUpdatePassword);
app.post('/account/delete', passportConfig.isAuthenticated, userController.postDeleteAccount);
app.get('/account/unlink/:provider', passportConfig.isAuthenticated, userController.getOauthUnlink);

/**
 * Internal API routes.
 */
// TODO: Create Postman Tests
app.post('/api/pdf', upload, apiController.sendPdf);
app.get('/api/pdf', apiController.retrievePdf);
app.get('/api/pdf/:id', apiController.retrievePdfById);
app.get('/api/newpdf', apiController.retrievePdfByLatest);
app.post('/api/audio', upload, apiController.sendAudio);
app.get('/api/audio', apiController.retrieveAudio);
app.get('/api/audio/:id', apiController.retrieveAudioByPresId);
app.put('/api/audio', apiController.updateAudio);
app.put('/api/presentation', apiController.updatePresentation);
app.get('/api/newpresentation', apiController.retrievePresentationByLatest);

// app.get('/api/presentation', apiController.retrievePres);


/**
 * External API routes.
 */
app.get('/api/scraping', apiController.getScraping);
app.get('/api/facebook', passportConfig.isAuthenticated, passportConfig.isAuthorized, apiController.getFacebook);
app.get('/api/twitter', passportConfig.isAuthenticated, passportConfig.isAuthorized, apiController.getTwitter);
app.post('/api/twitter', passportConfig.isAuthenticated, passportConfig.isAuthorized, apiController.postTwitter);
app.get('/api/linkedin', passportConfig.isAuthenticated, passportConfig.isAuthorized, apiController.getLinkedin);
app.get('/api/paypal', apiController.getPayPal);
app.get('/api/paypal/success', apiController.getPayPalSuccess);
app.get('/api/paypal/cancel', apiController.getPayPalCancel);

/**
 * OAuth authentication routes. (Sign in)

app.get('/auth/facebook', passport.authenticate('facebook', { scope: ['email', 'public_profile'] }));
app.get('/auth/facebook/callback', passport.authenticate('facebook', { failureRedirect: '/login' }), (req, res) => {
  res.redirect(req.session.returnTo || '/');
});
app.get('/auth/google', passport.authenticate('google', { scope: 'profile email' }));
app.get('/auth/google/callback', passport.authenticate('google', { failureRedirect: '/login' }), (req, res) => {
  res.redirect(req.session.returnTo || '/');
});
app.get('/auth/twitter', passport.authenticate('twitter'));
app.get('/auth/twitter/callback', passport.authenticate('twitter', { failureRedirect: '/login' }), (req, res) => {
  res.redirect(req.session.returnTo || '/');
});
app.get('/auth/linkedin', passport.authenticate('linkedin', { state: 'SOME STATE' }));
app.get('/auth/linkedin/callback', passport.authenticate('linkedin', { failureRedirect: '/login' }), (req, res) => {
  res.redirect(req.session.returnTo || '/');
});

/**
 * Error Handler.
 */
app.use(errorHandler());

/**
 * Start Express server.
 */
db.sequelize.sync({
  force: false,
  // CAREFUL!: This clears the database of data
  // Only use after changing the structure of the db
}).then(() => {
  app.listen(app.get('port'), () => {
    // console.clear();
    console.log('%s App is running at http://localhost:%d in %s mode', chalk.green('✓'), app.get('port'), app.get('env'));
  });
});

module.exports = app;
