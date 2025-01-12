const mongoose = require("mongoose");

const InteriorDataSchema = new mongoose.Schema({
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
    Presentation_Drawing: [{ type: String }],
    Ceiling: [{ type: String }],
    Electrical: [{ type: String }],
    Door_Handle: [{ type: String }],
    Curtains: [{ type: String }],
    Furniture: [{ type: String }],
    Laminates: [{ type: String }],
    Venner: [{ type: String }],
    Hinges: [{ type: String }],
    Plumbing: [{ type: String }],
    Three3D_Model: [{ type: String }],
    Flooring: [{ type: String }],
    Estimate: [{ type: String }],
    Bill: [{ type: String }],
    Site_Photo: [{ type: String }],
  },
});

InteriorDataSchema.pre("save", async function (next) {
  // Additional pre-save logic can be added here if needed
  next();
});

module.exports = mongoose.model("InteriorData", InteriorDataSchema);
