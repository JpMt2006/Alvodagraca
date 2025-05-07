const express = require('express');
const multer = require('multer');
const fs = require('fs');
const { google } = require('googleapis');
const app = express();
const upload = multer({ dest: 'uploads/' });

const auth = new google.auth.GoogleAuth({
  keyFile: 'credentials.json',
  scopes: ['https://www.googleapis.com/auth/drive.file'],
});

app.post('/upload', upload.single('file'), async (req, res) => {
  const drive = google.drive({ version: 'v3', auth: await auth.getClient() });
  const fileMetadata = { name: req.file.originalname };
  const media = {
    mimeType: req.file.mimetype,
    body: fs.createReadStream(req.file.path),
  };

  try {
    const response = await drive.files.create({
      requestBody: fileMetadata,
      media: media,
      fields: 'id, webViewLink',
    });
    fs.unlinkSync(req.file.path); // remove temp file
    res.json({ success: true, link: response.data.webViewLink });
  } catch (error) {
    res.status(500).send(error);
  }
});

app.listen(3000, () => console.log('Servidor rodando na porta 3000'));