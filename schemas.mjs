import {Schema} from "mongoose";

export class Models {

  #Button = null;
  #Dataout = null;
  #Display = null;
  #Field = null;
  #Form = null;
  #Page = null;

  constructor(mongoose){
    //Declaring Schemas
    const buttonSchema = new Schema({
      buttonId: String,
      webId: String,
      name: String,
      date: {type: Date, default: Date.now},
      function: String,
      operation: String,
      FirstField: String,
      FirstFieldType: Boolean,
      SecondField: String,
      SecondFieldType: Boolean,
      Destination: String,
    });
    const dataoutSchema = new Schema({
      dataoutId: String,
      webId: String,
      name: String,
      field: {type: Schema.Types.ObjectId, ref: 'Field'},
      date: {type: Date, default: Date.now},
    });
    const displaySchema = new Schema({
      displayId: String,
      webId: String,
      name: String,
      elements: Number,
      nav: Boolean,
      form: {type: Schema.Types.ObjectId, ref: 'Form'},
      fields: [{type: Schema.Types.ObjectId, ref: 'Dataout'}],
      date: {type: Date, default: Date.now},
    });
    const fieldSchema = new Schema({
      fieldId: String,
      webId: String,
      name: String,
      date: {type: Date, default: Date.now},
    });
    const formSchema = new Schema({
      formId: String,
      webId: String,
      name: String,
      fields: [{type: Schema.Types.ObjectId, ref: 'Field'}],
      date: {type: Date, default: Date.now},
    });
    const pageSchema = new Schema({
      pageId: String,
      webId: String,
      name: String,
      date: {type: Date, default: Date.now}
    });

    //Declaring composite unique key for each schema
    buttonSchema.index({buttonId: 1, webId: 1}, {unique: true});
    dataoutSchema.index({dataoutId: 1, webId: 1}, {unique: true});
    displaySchema.index({displayId: 1, webId: 1}, {unique: true});
    fieldSchema.index({fieldId: 1, webId: 1}, {unique: true});
    formSchema.index({formId: 1, webId: 1}, {unique: true});
    pageSchema.index({pageId: 1, webId: 1}, {unique: true});

    //Loading each schema into mongoose as a model
    this.#Button = mongoose.model('Button', buttonSchema);
    this.#Dataout = mongoose.model('Dataout', dataoutSchema);
    this.#Display = mongoose.model('Display', displaySchema);
    this.#Field = mongoose.model('Field', fieldSchema);
    this.#Form = mongoose.model('Form', formSchema);
    this.#Page = mongoose.model('Page', pageSchema);
  };

  get button(){
    return this.#Button;
  }

  get dataout(){
    return this.#Dataout;
  }

  get display(){
    return this.#Display;
  }

  get field(){
    return this.#Field;
  }

  get form(){
    return this.#Form;
  };

  get page(){
    return this.#Page;
  }
}
