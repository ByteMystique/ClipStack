const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');

const PROJECTS_DIR = path.join(__dirname, '../projects');

// Save project
router.post('/', (req, res) => {
    try {
        const project = req.body;
        if (!project.id) {
            return res.status(400).json({ error: 'Project ID required' });
        }

        const filePath = path.join(PROJECTS_DIR, `${project.id}.json`);
        fs.writeFileSync(filePath, JSON.stringify(project, null, 2));

        res.json({ success: true, message: 'Project saved' });
    } catch (err) {
        console.error('Save error:', err);
        res.status(500).json({ error: err.message });
    }
});

// Load project
router.get('/:id', (req, res) => {
    try {
        const filePath = path.join(PROJECTS_DIR, `${req.params.id}.json`);
        if (!fs.existsSync(filePath)) {
            return res.status(404).json({ error: 'Project not found' });
        }

        const data = fs.readFileSync(filePath, 'utf8');
        res.json(JSON.parse(data));
    } catch (err) {
        console.error('Load error:', err);
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
