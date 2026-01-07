/*Exemple d'utilisation 🧪
Démarre le serveur :
npm run dev
Upload : POST multipart/form-data à
http://localhost:3000/api/v1/uploads
champ file = le fichier image
Réponse (201) :
{ "filename": "1600000000-abc123.png", "url": "http://localhost:3000/api/v1uploads/1600000000-abc123.png" }
Récupération du fichier :
Ouvre l'URL http://localhost:3000/api/v1/uploads/<filename> dans le navigateur.
*/
export const uploadFile = (req, res) => {
  
  if (!req.file) {
      req.log?.warn("No file uploaded");
    return res.status(400).json({ error: 'No file uploaded' });
  }

  // Log upload
  req.log?.info({ filename: req.file.filename, size: req.file.size }, 'file uploaded');

  const uploadDir = process.env.UPLOAD_DIR || 'uploads';
  const fileUrl = `${req.protocol}://${req.get('host')}/${uploadDir}/${req.file.filename}`;
  res.status(201).json({ filename: req.file.filename, url: fileUrl });
};