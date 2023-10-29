import {body, param} from 'express-validator';

export class Validators {
  #Button = null;
  #Dataout = null;
  #Display = null;
  #Field = null;
  #Form = null;
  #Page = null;

  constructor(){
    this.#Button = [
      body('name', 'Invalid name').matches(/^[a-zA-Z0-9]*$/),//This regex matches alphanumeric without flagging empty
      body('name', 'Invalid name').isString(),//Combination with the above matches any alphanumeric string including empty string
      body('buttonid', 'Invalid Button Id').isAlphanumeric(),
      param('webid', 'Invalid Web Id').isAlphanumeric(),
    ];
    this.#Dataout = [
      param('webid', 'Invalid Web Id').isAlphanumeric(),
      param('fieldid', 'Invalid Data Field Id').isAlphanumeric(),
      body('fieldid', 'Invalid Data Field Id').isAlphanumeric(),
      body('name', 'Invalid name').isString(),
      body('name', 'Invalid name').matches(/^[a-zA-Z0-9]*$/),
      body('field', 'Invalid name').isString(),
      body('field', 'Invalid Field Id').matches(/^[a-zA-Z0-9]*$/),
    ]
    this.#Display = [
      param('webid', 'Invalid Web Id').isAlphanumeric(),
      body('displayid', 'Invalid Display Id').isAlphanumeric(),
      param('displayid', 'Invalid Display Id').isAlphanumeric(),
      body('name', 'Not a string').isString(),
      body('name', 'Invalid name').matches(/^[a-zA-Z0-9]*$/),
      body('elements', 'Not a number').isNumeric(),
      body('elements', 'Invalid number of elements').matches(/^[0-9]*$/),
      body('navigateable', 'Navigateable value must be true or false').isBoolean(),
      body('action', 'Invalid action').custom(function(action){
        return action == 'add' || action == 'remove' || action == 'self';
      }),
      body('form', 'Not a string').isString(),
      body('form', 'Invalid Form Id').matches(/^[a-zA-Z0-9]*$/),
      body('field', 'Not a string').isString(),
      body('field', 'Invalid Data Field Name').matches(/^[a-zA-Z0-9]*$/),
      body('fieldId', 'Not a string').isString(),
      body('fieldId', 'Invalid Data Field Id').matches(/^[a-zA-Z0-9]*$/),
    ];
    this.#Field = [
      param('webid', 'Invalid Web Id').isAlphanumeric(),
      param('fieldid').isAlphanumeric(),
      body('fieldid', 'Invalid Field Id').isAlphanumeric(),
      body('name', 'Invalid name').isString(),
      body('name', 'Invalid name').matches(/^[a-zA-Z0-9]*$/),
    ];
    this.#Form = [
      param('webid', 'Invalid Web Id').isAlphanumeric(),
      param('formid', 'Invalid Form Id').isAlphanumeric(),
      body('formid', 'Invalid Form Id').isAlphanumeric(),
      body('name', 'Name is not a string').isString(),
      body('name', 'Invalid name').matches(/^[a-zA-Z0-9]*$/),
      body('field', 'Field is not a string').isString(),
      body('field', 'Invalid Field Name').matches(/^[a-zA-Z0-9]*$/),
      body('fieldId', 'Field Id is not a string').isString(),
      body('fieldId', 'Invalid Field Id').matches(/^[a-zA-Z0-9]*$/),
      body('action', 'Invalid action').custom(function(action){
        return action == 'add' || action == 'remove' || action == 'self';
      }),
    ];
    this.#Page = [
      //Fill this in later. I don't know the requirements yet
    ]
  }

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