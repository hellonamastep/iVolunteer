import mongoose from "mongoose";

const corporateEventSchema = new mongoose.Schema(
  {
    image: { type: String, required: true },
    category: {
      type: String,
      enum: [
        "Technology",
        "Health",
        "Education",
        "Environment",
        "Sports",
        "Arts",
      ],
      required: true,
    },
    organizedBy: { type: String, required: true },
    date: { type: Date, required: true },
    time: { type: String, required: true },
    duration: { type: String, required: true },
    desc: { type: String, required: true },
    title: { type: String, required: true },
    difficulty: {
      type: String,
      enum: ["Easy", "Medium", "Hard"],
      required: true,
    },
    // referenceId: {
    //   type: mongoose.Schema.Types.ObjectId,
    //   ref: "Admin",
    //   required: true,
    // }, // reference to admin
     bids: [
    {
      corporate: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
      corporateName: String,
      offer: String,
      contactEmail: String,
      contactNumber: String,
      createdAt: { type: Date, default: Date.now },
    }],
     selectedBid: { type: mongoose.Schema.Types.ObjectId, ref: "CorporateBid" },
  },
  { timestamps: true }
);

export const corporateEvent = mongoose.model(
  "CorporateEvent",
  corporateEventSchema
);
