// frontend/src/components/PreviewPlayer.jsx
import { useEffect, useRef } from 'react';

function PreviewPlayer({ videos, title, currentIndex, onVideoEnd, onVideoSelect }) {
  const videoRef = useRef(null);

  useEffect(() => {
    if (videoRef.current && videos.length > 0) {
      videoRef.current.load();
      videoRef.current.play().catch(err => {
        console.log('Autoplay prevented:', err);
      });
    }
  }, [currentIndex, videos]);

  if (videos.length === 0) {
    return (
      <div className="preview-player empty">
        <div className="preview-empty-state">
          <p>No videos to preview</p>
          <p className="preview-hint">Add videos to see them here</p>
        </div>
      </div>
    );
  }

  const currentVideo = videos[currentIndex];

  // Parse title to apply highlights
  const renderTitle = () => {
    let titleText = title.text;
    const highlight = title.highlights[0];

    if (highlight && titleText.includes(highlight.text)) {
      const parts = titleText.split(highlight.text);
      return (
        <>
          {parts[0]}
          <span style={{ color: highlight.color }}>
            {highlight.text}
          </span>
          {parts[1]}
        </>
      );
    }

    return titleText;
  };

  return (
    <div className="preview-player">
      <div className="preview-header">
        <h3>Preview</h3>
        <div className="preview-controls">
          <button
            className="btn-small"
            onClick={() => onVideoSelect(Math.max(0, currentIndex - 1))}
            disabled={currentIndex === 0}
          >
            ← Prev
          </button>
          <span className="video-counter">
            {currentIndex + 1} / {videos.length}
          </span>
          <button
            className="btn-small"
            onClick={() => onVideoSelect(Math.min(videos.length - 1, currentIndex + 1))}
            disabled={currentIndex === videos.length - 1}
          >
            Next →
          </button>
        </div>
      </div>

      <div className="preview-container">
        {/* Video player */}
        <video
          ref={videoRef}
          className="preview-video"
          onEnded={onVideoEnd}
          controls
        >
          <source
            src={`http://localhost:3001${currentVideo.filePath}`}
            type="video/mp4"
          />
        </video>

        {/* Overlay elements */}
        <div className="preview-overlay">
          {/* Title bar at top */}
          <div className="overlay-title">
            {renderTitle()}
          </div>

          {/* Ranking sidebar */}
          <div className="overlay-ranks">
            {videos.map((video, idx) => (
              <div
                key={video.id}
                className={`rank-item ${idx === currentIndex ? 'active' : ''}`}
              >
                <div className="rank-number">{video.rank}.</div>
                {idx === currentIndex && (
                  <div className="rank-label">{video.label}</div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="preview-info">
        <strong>Now Playing:</strong> {currentVideo.label}
      </div>
    </div>
  );
}

export default PreviewPlayer;