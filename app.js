  if(process.env.NODE_ENV !=="production"){
    require('dotenv').config()
  }

  
//  console.log(process.env.SECRET)
//  console.log(process.env.API_KEY)

const express=  require('express');
const path= require('path');
const mongoose= require('mongoose');
const ejsMate =require('ejs-mate');
const catchAsync= require('./utils/catchAsync');
const ExpressError= require('./utils/ExpressError');
const Joi= require('joi');
const {campgroundSchema, reviewSchema}= require('./schemas.js');
const Review= require('./models/review.js');
const methodOverride= require('method-override');
const Campground =require('./models/campground');
//const campground = require('./models/campground');
const session = require('express-session');
const flash= require('connect-flash');
// const multer  = require('multer');
// const upload = multer({ dest: 'uploads/' });
const mongoSanitize = require('express-mongo-sanitize');
const helmet= require('helmet');
const MongoStore = require('connect-mongo');

const userRoutes= require('./routes/users.js');
const campgroundsRoutes= require('./routes/campgrounds.js');
const reviewsRoutes= require('./routes/reviews.js');
const User= require('./models/user.js');

const passport= require('passport');
const LocalStrategy= require('passport-local');
const { name } = require('ejs');


// const dbUrl= process.env.DB_URL
// 'mongodb://127.0.0.1:27017/yelp-camp'

//const dbUrl = `mongodb+srv://gurmitmahal18:${encodeURIComponent('ranasingh45')}@cluster0.lktcp.mongodb.net/Yelpcamp?retryWrites=true&w=majority&appName=Cluster0`;

const dbUrl= 'mongodb://127.0.0.1:27017/yelp-camp';
const connectDB = async () => {
  try {
    await mongoose.connect(dbUrl);
    console.log('MongoDB connected successfully');
  } catch (error) {
    console.error('MongoDB connection error:', error.message);
    process.exit(1);
  }
};

connectDB();


mongoose.set('strictQuery', true);


const app=express();

app.engine('ejs',ejsMate);
app.use(express.static(path.join(__dirname, 'public')))
app.use(methodOverride('_method'));
app.use(express.urlencoded({ extended: true }))  
app.set('view engine','ejs');
app.set('views', path.join(__dirname, 'views') )
app.use(mongoSanitize({
  replaceWith: '_',
}));
app.use(helmet({
  contentSecurityPolicy: false,

}))


const store = MongoStore.create({
  mongoUrl: dbUrl,
  touchAfter: 24 * 60 * 60,
  crypto: {
      secret: 'thisshouldbeabettersecret!'
  }
});

store.on("error", function (e) {
  console.log("SESSION STORE ERROR", e)
})

const sessionConfig={
       store,
      name:'bal',
    secret:'thisshouldbeabettersecret!',
    resave: false,
    saveUninitialized: true,
     cookie:{
        httpOnly:true,
        // secure: true,
        expires:Date.now() + 1000*60*60*24*7,
        maxAge: 1000*60*60*24*7
     }
}
app.use(session(sessionConfig))
app.use(flash());


app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));

passport.serializeUser(User.serializeUser());       //it tells to store a user in session
passport.deserializeUser(User.deserializeUser());


app.use((req,res,next)=>{
  //console.log(req.session);
  console.log(req.query);
  res.locals.currentUser= req.user;
   res.locals.success= req.flash('success');
   res.locals.error= req.flash('error');                //we have access to these in every in single template
   next();
})

app.use('/', userRoutes);
app.use('/campgrounds',campgroundsRoutes);
app.use('/campgrounds/:id/reviews', reviewsRoutes);

app.get('/', (req, res)=>{
     res.render('home.ejs') 
})


app.get('/fakeUser', async (req,res)=>{
  const user= new User({email:'coltt@gmail.com', username: 'colt'})
   const newUser= await User.register(user, 'chicken');
   res.send(newUser);
})

app.all('*',( req, res, next)=>{
     next(new ExpressError('page not found', 404))
})

app.use((err,req,res,next)=>{
    const{statusCode=500, }=err;
    if(!err.message) err.message='oh no, something went wrong'
    res.status(statusCode).render('error.ejs',{err});

})

app.listen(3000,()=>{
    console.log('Serving on port 3000 for Yelpcamp')
})