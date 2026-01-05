// frontend/src/components/VideoItem.jsx
import { useState } from 'react';

function VideoItem({ video, isFirst, isLast, onRankChange, onLabelChange, onDelete }) {
  const [isEditingLabel, setIsEditingLabel] = useState(false);
  const [labelInput, setLabelInput] = useState(video.label);

  const handleLabelSave = () => {
    if (labelInput.trim()) {
      onLabelChange(video.id, labelInput.trim());
    }
    setIsEditingLabel(false);
  };

  const handleLabelKeyDown = (e) => {
    if (e.key === 'Enter') {
      handleLabelSave();
    } else if (e.key === 'Escape') {
      setLabelInput(video.label);
      setIsEditingLabel(false);
    }
  };

  return (
    <div className="video-item">
      <div className="video-rank">#{video.rank}</div>
      
      <div className="video-thumbnail">
        {video.thumbnail ? (
          <img src={`http://localhost:3001${video.thumbnail}`} alt={video.filename} />
        ) : (
          <div className="thumbnail-placeholder">📹</div>
        )}
      </div>

      <div className="video-info">
        <div className="video-filename">{video.filename}</div>
        
        {isEditingLabel ? (
          <input
            type="text"
            className="label-input"
            value={labelInput}
            onChange={(e) => setLabelInput(e.target.value)}
            onBlur={handleLabelSave}
            onKeyDown={handleLabelKeyDown}
            autoFocus
            placeholder="Video label"
          />
        ) : (
          <div 
            className="video-label"
            onClick={() => setIsEditingLabel(true)}
            title="Click to edit"
          >
            {video.label}
          </div>
        )}
      </div>

      <div className="video-controls">
        <button
          className="btn-icon"
          onClick={() => onRankChange(video.id, 'up')}
          disabled={isFirst}
          title="Move up"
        >
          ↑
        </button>
        <button
          className="btn-icon"
          onClick={() => onRankChange(video.id, 'down')}
          disabled={isLast}
          title="Move down"
        >
          ↓
        </button>
        <button
          className="btn-icon btn-delete"
          onClick={() => onDelete(video.id)}
          title="Delete"
        >
          🗑️
        </button>
      </div>
    </div>
  );
}

export default VideoItem;