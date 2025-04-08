const { ref } = require('joi');
const mongoose= require('mongoose');
const Review= require('./review');
const Schema= mongoose.Schema;

//https://res.cloudinary.com/dck8uzjs8/image/upload/w_300/v1742669732/YelpCamp/qlsuln7nh5wbsxqncimu.png
//we can only add virtual property to a schema


const ImageSchema= new Schema ({
    url: String,
    filename: String
});

ImageSchema.virtual('thumbnail').get(function(){
   return this.url.replace('/upload','/upload/w_300');
});

const CampgroundSchema= new Schema({
    title: String,
    images: [ImageSchema
        // url: String,
        // filename: String
    ],
    price: Number,
    description: String,
    location: String,
    author:{
        type:Schema.Types.ObjectId,
        ref:'User'
    },
    reviews:[{
      type:Schema.Types.ObjectId,
      ref:'Review'
    }]
});

CampgroundSchema.post('findOneAndDelete', async function(doc) {
    if(doc){
        await Review.deleteMany({
            _id:{
                $in: doc.reviews
            }
        })
    }
})

module.exports=mongoose.model('Campground', CampgroundSchema);
