const express= require('express');
const router= express.Router();
const catchAsync= require('../utils/catchAsync');
const ExpressError= require('../utils/ExpressError');
const Campground =require('../models/campground');
const User = require('../models/user');  // ✅ Import User model
const {cloudinary}= require('../cloudinary')
const{storage}= require('../cloudinary');
const multer  = require('multer');

const upload = multer({ storage });



const {campgroundSchema, reviewSchema}= require('../schemas.js');
const {isLoggedIn,isAuthor,validateCampground}= require('../middleware.js');


router.get('/', catchAsync(async (req, res)=>{
    const campgrounds= await Campground.find({});
    res.render('campgrounds/index.ejs',{ campgrounds })
 }))
 
 router.get('/new', isLoggedIn,(req, res)=>{
     
     res.render('campgrounds/new.ejs');
 })
 
 
 router.post('/', isLoggedIn,upload.array('image'), validateCampground, catchAsync(async (req,res)=>{
  
     //if(!req.body.campground)  throw new ExpressError('invalid campground data', 400)
   
     const campground=new Campground(req.body.campground);    //new model   
     campground.images=req.files.map(f=>({url:f.path, filename:f.filename}));    //
     campground.author = req.user._id;  
    await campground.save();
    // console.log(campground);
    req.flash('success','successfully made a new campground')
    res.redirect(`/campgrounds/${campground._id}`)
 }))




// router.post('/',upload.single('image'), (req, res) => {
//     // Send both req.body and req.file as a JSON object
//     console.log({ body: req.body, file: req.file });
//     res.send('it worked');                                       //for single file
// });


// router.post('/',upload.array('image'), (req, res) => {        //this name'image' must be match with the form name
//   // Send both req.body and req.file as a JSON object
//   console.log({ body: req.body, file: req.files });
//   res.send('it worked');
// });

 
 router.get('/:id', catchAsync(async (req, res)=>{
     const campground= await Campground.findById(req.params.id).populate({
         path: 'reviews',
         populate:{
          path:'author'
         }
        }).populate('author');

     //console.log(campground);
     if(!campground){
        req.flash('error','Cannot find that campground')
       return  res.redirect('/campgrounds');
     }
     //console.log(campground);
     res.render('campgrounds/show',{campground, currentUser: req.user});
 }))
 
 router.get('/:id/edit', isLoggedIn, isAuthor,catchAsync(async (req,res)=>{
    const {id}= req.params;
  const campground= await Campground.findById(id)
    
     if(!campground){
        req.flash('error','Cannot find that campground')
       return  res.redirect('/campgrounds');
     }

     res.render('campgrounds/edit',{campground});

 }))

 
 router.put('/:id/', isLoggedIn,  isAuthor,  upload.array('image'), validateCampground,  catchAsync(async (req,res)=>{
   const{id}= req.params;
   //console.log(req.body);
   const campground= await Campground.findByIdAndUpdate(id, {...req.body.campground})
   const imgs= req.files.map(f=>({url:f.path, filename:f.filename}));    
  //  this will make an array of arrays  but map gives us array of objects

   campground.images.push(...imgs);   
    //  ...= spread operator= dont pass the whole array, but take the data and pass that into push

   await campground.save();  
   if(req.body.deleteImages){
    for(let filename of req.body.deleteImages){
    await  cloudinary.uploader.destroy(filename);
    }
         await campground.updateOne({$pull:{images:{filename:{$in:req.body.deleteImages}}}})
         console.log(campground);
   }
   req.flash('success', 'Successfully updated campground')
   res.redirect(`/campgrounds/${campground._id}`)
 }))



// router.put('/:id/', isLoggedIn, isAuthor, upload.array('image'), validateCampground, catchAsync(async (req,res)=>{
//   const{id}= req.params;
//   const campground= await Campground.findByIdAndUpdate(id, {...req.body.campground}, {new:true});
  
//   // Add this check before trying to map the files
//   if(req.files && req.files.length) {
//     const imgs= req.files.map(f=>({url:f.path, filename:f.filename}));
//     campground.images.push(...imgs);
//   }
//   console.log("Files uploaded:", req.files);
//   await campground.save();  
//   req.flash('success', 'Successfully updated campground')
//   res.redirect(`/campgrounds/${campground._id}`)
// }))


router.delete('/:id', isLoggedIn, isAuthor, catchAsync(async (req,res)=>{
     const{id}= req.params;
    await Campground.findByIdAndDelete(id);
    req.flash('success', 'successfullt deleted campground')
    res.redirect('/campgrounds');
     
 }))



 module.exports=router;