const { required } = require('joi');
const mongoose= require('mongoose');
const passportLocalMongoose= require('passport-local-mongoose');

const Schema= mongoose.Schema;
const UserSchema= new Schema({
   email:{
    type: String,
    required: true,
    unique: true
   },
   username: {
      type: String,  // Add this field explicitly for username
      required: true,
  },
})

UserSchema.plugin(passportLocalMongoose);

module.exports= mongoose.model('User', UserSchema);