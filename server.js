const express = require('express');
const multer = require('multer');
const cors = require('cors');
const fs = require('fs');
const { google } = require('googleapis');

const app = express();
app.use(cors());
const upload = multer({ dest: 'uploads/' });

const auth = new google.auth.GoogleAuth({
  keyFile: 'chave-servico.json', // <- Substitua com seu arquivo JSON
  scopes: ['https://www.googleapis.com/auth/drive.file']
});

app.post('/upload', upload.single('file'), async (req, res) => {
  try {
    const drive = google.drive({ version: 'v3', auth: await auth.getClient() });

    const fileMetadata = { name: req.file.originalname };
    const media = { mimeType: req.file.mimetype, body: fs.createReadStream(req.file.path) };

    const response = await drive.files.create({
      resource: fileMetadata,
      media,
      fields: 'id'
    });

    fs.unlinkSync(req.file.path); // Deleta o arquivo temporário
    res.status(200).json({ success: true, fileId: response.data.id });
  } catch (error) {
    console.error('Erro ao enviar:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

app.listen(3000, () => console.log('Servidor rodando em http://localhost:3000'));