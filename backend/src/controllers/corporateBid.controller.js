import { corporateBidService } from "../services/corporateBid.service.js";


const corporateBidController = {
  async getOpenEvents(req, res) {
    try {
      const events = await corporateBidService.getOpenEvents();
      res.json({ success: true, events });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  },

  async placeBid(req, res) {
    try {
      const data = {
        ...req.body,
        corporate: req.user.id,
      };

      const bid = await corporateBidService.placeBid(data);

      // ✅ Convert Mongoose doc to plain JS object to avoid 500 error
      const bidObj = bid.toObject ? bid.toObject() : bid;

      res.status(201).json({ success: true, bid: bidObj });
    } catch (error) {
      console.error("Place Bid Error:", error);
      res.status(500).json({ success: false, message: error.message });
    }
  },
};

export default corporateBidController;
