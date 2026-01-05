const express = require('express');
const router = express.Router();
const path = require('path');
const ffmpegRenderer = require('../services/ffmpegRenderer');

router.post('/', async (req, res) => {
    try {
        const project = req.body;

        if (!project.videos || project.videos.length === 0) {
            return res.status(400).json({ error: 'No videos in project' });
        }

        console.log('Starting render for project:', project.id);

        const outputFilename = `ranked_video_${Date.now()}.mp4`;
        const outputPath = path.join(__dirname, '../exports', outputFilename);

        await ffmpegRenderer.renderProject(project, outputPath);

        console.log('Render complete:', outputPath);

        res.json({
            success: true,
            outputPath: `/exports/${outputFilename}`
        });
    } catch (err) {
        console.error('Render error:', err);
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
