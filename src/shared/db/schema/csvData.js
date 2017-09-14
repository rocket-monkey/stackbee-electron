import mongoose from 'mongoose';

const Schema = mongoose.Schema;

// create a schema
const csvDataSchema = new Schema({
  accountingId       : { type: String },
  taskType           : { type: String, required: true },
  documentName       : { type: String, required: true },
  printDate          : { type: String, required: true },
  printQuality       : { type: String, required: true },
  copies             : { type: Number, required: true },
  paperType          : { type: String, required: true },
  paperUsedM2        : { type: String, required: true },
  status             : { type: String, required: true },
  costs              : { type: Array, default: [], required: true },
  createdAt          : { type: Date, default: Date.now },
});

// the schema is useless so far
// we need to create a model using it
const CsvData = mongoose.model('CsvData', csvDataSchema);

// make this available to our users in our Node applications
export default CsvData;