const fs = require("fs");
const { cloudinaryUpload, cloudinaryDestroy } = require("./utils/cloudinary");

async function uploadProfile(req, res) {
  const usn = req.query.studentid;

  try {
    // Upload image to Cloudinary
    const response = await cloudinary.uploader.upload(req.file.path);

    // Get the old image URL
    const [rows] = await pool.query(
      "SELECT userimg FROM Student WHERE usn = ?",
      [usn]
    );
    if (rows.length === 0) {
      return res.status(404).json({ error: "Student not found" });
    }
    const oldImageUrl = rows[0].userimg;

    // Update the userimg field in the Student table
    await pool.query("UPDATE Student SET userimg = ? WHERE usn = ?", [
      response.url,
      usn,
    ]);

    // Fetch the updated student record
    const [updatedRows] = await pool.query(
      "SELECT * FROM Student WHERE usn = ?",
      [usn]
    );

    // delete prvious img from cloudinary
    if (oldImageUrl) {
      await cloudinaryDestroy(
        oldImageUrl.slice(
          oldImageUrl.lastIndexOf("/") + 1,
          oldImageUrl.lastIndexOf(".")
        )
      );
    }
    fs.unlinkSync(req.file.path);
    res.json({ url: responce.url });
  } catch (e) {
    fs.unlinkSync(req.file.path);
    res
      .status(444)
      .json({ error: e.message || "Uploading user profile failed" });
  }
}

async function updateThumbnail(req, res) {
  try {
    const responce = await cloudinaryUpload(req.file.path);
    const status = await Video.findByIdAndUpdate(req.body._id, {
      $set: { thumbnail: responce.url },
    });
    // delete prvious img from cloudinary
    if (status.thumbnail) {
      await cloudinaryDestroy(
        status.thumbnail.slice(
          status.thumbnail.lastIndexOf("/") + 1,
          status.thumbnail.lastIndexOf(".")
        )
      );
    }
    fs.unlinkSync(req.file.path);
    res.json({ success: "Thumbnail updated successfuly" });
  } catch (e) {
    fs.unlinkSync(req.file.path);
    res.status(444).json({ error: e.message || "Uploading thumbnail failed" });
  }
}

module.exports = { uploadProfile, updateThumbnail };
