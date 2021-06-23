const router = require("express").Router();
const path = require("path");
const multer = require("multer");
const File = require("../models/file");
const { v4: uuid4 } = require("uuid");
let storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "uploads/"),
  filename: (req, file, cb) => {
    const uniqueName = `${Date.now()}-${Math.round(
      Math.random() * 1e9
    )}${path.extname(file.originalname)}`;
    cb(null, uniqueName);
  },
});

let upload = multer({
  storage: storage,
  limit: { fileSize: 1000000 * 100 },
}).single("myfile");

router.post("/", (req, res) => {
  upload(req, res, async (err) => {
    //check the request
    if (!req.file) {
      return res.json({ error: "All fields are required" });
    }
    if (err) return res.status(500).send({ error: err.message });

    //add to database
    const file = new File({
      filename: req.file.filename,
      uuid: uuid4(),
      path: req.file.path,
      size: req.file.size,
    });

    const response = await file.save();
    //response > link to download it
    return res.json({
      file: `${process.env.APP_BASE_URL}/files/${response.uuid}`,
    });
  });
});

router.post("/send", async (req, res) => {
  //validate the request
  const { uuid, emailTo, emailFrom } = req.body;
  if (!uuid || !emailTo || !emailFrom)
    return res.status(422).send({ error: "All fields are required" });
  const file = await File.findOne({ uuid: uuid });
  if (file.sender) {
    return res.status(422).send({ error: "Email allready sent" });
  }
  //adding the sented info in the database
  file.sender = emailFrom;
  file.receiver = emailTo;
  const response = await file.save();

  // send email
  const sendEmail = require("../services/emailService");
  sendEmail({
    from: emailFrom,
    to: emailTo,
    subject: "ShareNow() file sharing",
    text: `${emailFrom} shared a file with you.`,
    html: require("../services/emailTemplate")({
      emailFrom,
      downloadLink: `${process.env.APP_BASE_URL}/files/${file.uuid}`,
    }),
    size: parseInt(file.size / 1000) + "KB",
    expires: "24 hours",
  });
  return res.send({success:true})
});

module.exports = router;
