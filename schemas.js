const BaseJoi= require('joi');
const sanitizeHtml= require('sanitize-html');
const extension = (joi) => ({
  type: 'string',
  base: joi.string(),
  messages: {
      'string.escapeHTML': '{{#label}} must not include HTML!'
  },
  rules: {
      escapeHTML: {
          validate(value, helpers) {
              const clean = sanitizeHtml(value, {
                  allowedTags: [],
                  allowedAttributes: {},                    //nothing is allowed to pass as a script or any html
              });
              if (clean !== value) return helpers.error('string.escapeHTML', { value })
              return clean;
          }
      }
  }
});



const Joi= BaseJoi.extend(extension)


 module.exports.campgroundSchema= Joi.object({        // this is not a mongoose schema, this is to validate so that user puts inall info correctly
        campground:Joi.object({
          title: Joi.string().required().escapeHTML(),
          price: Joi.number().required().min(0),
          // image: Joi.string().required(),      //to make server side validations
         
                                                             
          location: Joi.string().required().escapeHTML(),
          description: Joi.string().required().escapeHTML(),
      }).required(),
      image: Joi.array().items(Joi.string()).optional(),
       deleteImages:Joi.array()
      });  

      module.exports.reviewSchema= Joi.object({
        review:Joi.object({
          rating:Joi.number().required().min(1).max(5),
          body: Joi.string().required().escapeHTML()
        }).required()
      })




      