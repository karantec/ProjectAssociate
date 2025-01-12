// src/models/modalData.js
const mongoose = require('mongoose');

const modalDataSchema = new mongoose.Schema({
  title: { type: String, required: true },
  clientName: { type: String, required: true },
  siteAddress: { type: String },
  gstNo: { type: String },
  projectHead: { type: String },
  rccDesignerName: { type: String },
  PAN: { type: String },
  Aadhar: { type: String },
  Pin: { type: String },
  email: { type: String },
  documentSections: {
    Area_Calculations: [{ type: String }],
    Presentation_Drawings: [{ type: String }],
    Submission_Drawings: [{ type: String }],
    Center_Line: [{ type: String }],
    Floor_Plans: [{ type: String }],
    Sections: [{ type: String }],
    Elevations: [{ type: String }],
    Compound_Wall_Details: [{ type: String }],
    Toilet_Layouts: [{ type: String }],
    Electric_Layouts: [{ type: String }],
    Tile_Layouts: [{ type: String }],
    Grill_Details: [{ type: String }],
    Railing_Details: [{ type: String }],
    Column_footing_Drawings: [{ type: String }],
    Plinth_Beam_Drawings: [{ type: String }],
    StairCase_Details: [{ type: String }],
    Slab_Drawings: [{ type: String }],
    Property_Card: [{ type: String }],
    Property_Map: [{ type: String }],
    Sanction_Drawings: [{ type: String }],
    Revise_Sanction_Drawings: [{ type: String }],
    Completion_Drawings: [{ type: String }],
    Completion_Letter: [{ type: String }],
    Estimate: [{ type: String }],
    Bills_Documents: [{ type: String }],
    Site_Photos: [{ type: String }],
    Other_Documents: [{ type: String }],
  },
});

modalDataSchema.pre('save', async function (next) {
  // Pre-save hook logic can be added here
  next(); 
});

module.exports = mongoose.model("ModalData", modalDataSchema);
