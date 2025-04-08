const mongoose= require('mongoose');
const cities=require('./cities');
const {places, descriptors}=require('./seedHelpers');
const Campground =require('../models/campground');
mongoose.connect('mongodb://127.0.0.1:27017/yelp-camp');
mongoose.set('strictQuery', true);

const sample= array=> array[Math.floor(Math.random()*array.length)];

const seedDB= async()=>{
    await Campground.deleteMany({});
    for(let i=0; i<50; i++){
        const random1000= Math.floor(Math.random()*1000);
        const price=Math.floor(Math.random()*20)+10;
        const camp=new Campground({
            author: '67db6c8eb9f058b7a8cb2bf2',
            location:`${cities[random1000].city}, ${cities[random1000].state}`,
            title:`${sample(descriptors)},${sample(places)}`,
            // image: `https://picsum.photos/400?random=${Math.random()}`,
            description:'Lorem ipsum dolor sit amet, consectetur adipisicing elit. Ea, esse! Quibusdam quisquam quis numquam! Numquam dolorum quisquam cupiditate, in, quis fugit obcaecati necessitatibus enim odio labore autem voluptate fugiat dolore!',
            price,
            images:[
                {
                  url: 'https://res.cloudinary.com/dck8uzjs8/image/upload/v1742669733/YelpCamp/vqb7mf7rvs97bpsz0vfp.png',
                  filename: 'YelpCamp/fnoammufpv8flprmzunf',
                //   _id: new ObjectId('67df07a668075c53fbfee681')
                },
                {
                  url: 'https://res.cloudinary.com/dck8uzjs8/image/upload/v1742664692/YelpCamp/zmuuczzlkplpvlfxrmoa.png',
                  filename: 'YelpCamp/vqb7mf7rvs97bpsz0vfp',
                //   _id: new ObjectId('67df07a668075c53fbfee682')
                },
                {
                  url: 'https://res.cloudinary.com/dck8uzjs8/image/upload/v1742687822/YelpCamp/qypqp5513h0epe70cf25.jpg',
                  filename: 'YelpCamp/qlsuln7nh5wbsxqncimu',
                //   _id: new ObjectId('67df07a668075c53fbfee683')
                }
              ]
        })
        await camp.save();
    }
}


seedDB().then(()=>{
    mongoose.connection.close();
});