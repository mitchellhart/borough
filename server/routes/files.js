const express = require('express');
const router = express.Router();
const path = require('path');
const fs = require('fs');

// Export a function that takes pool and authenticateUser as parameters
module.exports = function(pool, authenticateUser) {
  router.get('/:id', authenticateUser, async (req, res) => {
    try {
      const fileId = req.params.id;
      const result = await pool.query(
        'SELECT * FROM files WHERE id = $1',
        [fileId]
      );
      
      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'File not found' });
      }

      const file = result.rows[0];
      res.json(file);
    } catch (error) {
      console.error('Error fetching file:', error);
      res.status(500).json({ error: 'Failed to fetch file' });
    }
  });

  router.get('/download/:id', authenticateUser, async (req, res) => {
    try {
      const fileId = req.params.id;
      // Fetch file metadata from PostgreSQL
      const result = await pool.query(
        'SELECT * FROM files WHERE id = $1',
        [fileId]
      );
      
      const file = result.rows[0];
      if (!file) {
        return res.status(404).send('File not found');
      }

      // Use the file_path from the database
      const filePath = path.join(__dirname, '..', file.file_path);

      // Add headers for better streaming
      res.setHeader('Content-Type', file.mime_type);
      res.setHeader('Content-Disposition', `inline; filename="${file.original_name}"`);
      
      // Stream the file instead of loading it all at once
      const fileStream = fs.createReadStream(filePath);
      fileStream.pipe(res);
    } catch (error) {
      console.error('Error streaming file:', error);
      res.status(500).json({ error: 'Failed to stream file' });
    }
  }); 

  return router;
};