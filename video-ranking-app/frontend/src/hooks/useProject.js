import { useState } from 'react';

const API_BASE = 'http://localhost:3001';

export function useProject() {
    const [project, setProject] = useState({
        id: 'project_' + Date.now(),
        title: {
            text: 'Ranking Videos',
            highlights: []
        },
        videos: []
    });

    const [currentVideoIndex, setCurrentVideoIndex] = useState(0);
    const [isExporting, setIsExporting] = useState(false);

    // Add video
    const handleVideoUpload = async (files) => {
        const formData = new FormData();
        Array.from(files).forEach(file => {
            formData.append('videos', file);
        });

        try {
            const res = await fetch(`${API_BASE}/api/upload`, {
                method: 'POST',
                body: formData
            });
            const data = await res.json();

            const newVideos = data.files.map((file, idx) => ({
                id: 'vid_' + Date.now() + '_' + idx,
                filename: file.filename,
                filePath: file.path,
                rank: project.videos.length + idx + 1,
                label: `Video ${project.videos.length + idx + 1}`,
                duration: file.duration || 5,
                thumbnail: file.thumbnail
            }));

            setProject(prev => ({
                ...prev,
                videos: [...prev.videos, ...newVideos]
            }));
        } catch (err) {
            console.error('Upload failed:', err);
            alert('Upload failed. Make sure backend is running.');
        }
    };

    // Update video ranking
    const handleRankChange = (videoId, direction) => {
        setProject(prev => {
            const videos = [...prev.videos];
            const idx = videos.findIndex(v => v.id === videoId);
            if (idx === -1) return prev;

            const newIdx = direction === 'up' ? idx - 1 : idx + 1;
            if (newIdx < 0 || newIdx >= videos.length) return prev;

            [videos[idx], videos[newIdx]] = [videos[newIdx], videos[idx]];

            // Update ranks
            videos.forEach((v, i) => {
                v.rank = i + 1;
            });

            return { ...prev, videos };
        });
    };

    // Update video label
    const handleLabelChange = (videoId, newLabel) => {
        setProject(prev => ({
            ...prev,
            videos: prev.videos.map(v =>
                v.id === videoId ? { ...v, label: newLabel } : v
            )
        }));
    };

    // Delete video
    const handleDeleteVideo = (videoId) => {
        setProject(prev => ({
            ...prev,
            videos: prev.videos
                .filter(v => v.id !== videoId)
                .map((v, i) => ({ ...v, rank: i + 1 }))
        }));
    };

    // Update title
    const handleTitleChange = (newTitle) => {
        setProject(prev => ({
            ...prev,
            title: newTitle
        }));
    };

    // Export final video
    const handleExport = async () => {
        if (project.videos.length === 0) {
            alert('Add videos before exporting');
            return;
        }

        setIsExporting(true);
        try {
            const res = await fetch(`${API_BASE}/api/render`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(project)
            });

            const data = await res.json();

            if (data.success) {
                // Download the file
                window.open(`${API_BASE}${data.outputPath}`, '_blank');
                alert('Export complete! File downloaded.');
            } else {
                alert('Export failed: ' + data.error);
            }
        } catch (err) {
            console.error('Export failed:', err);
            alert('Export failed. Check backend logs.');
        } finally {
            setIsExporting(false);
        }
    };

    // Auto-play next video in preview
    const handleVideoEnd = () => {
        if (currentVideoIndex < project.videos.length - 1) {
            setCurrentVideoIndex(prev => prev + 1);
        } else {
            setCurrentVideoIndex(0); // Loop
        }
    };

    return {
        project,
        currentVideoIndex,
        isExporting,
        handleVideoUpload,
        handleRankChange,
        handleLabelChange,
        handleDeleteVideo,
        handleTitleChange,
        handleExport,
        handleVideoEnd,
        setCurrentVideoIndex
    };
}
