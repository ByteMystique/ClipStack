// frontend/src/components/VideoList.jsx
import { useRef } from 'react';
import VideoItem from './VideoItem';

function VideoList({ videos, onUpload, onRankChange, onLabelChange, onDelete }) {
  const fileInputRef = useRef(null);

  const handleFileSelect = (e) => {
    if (e.target.files.length > 0) {
      onUpload(e.target.files);
      e.target.value = ''; // Reset input
    }
  };

  return (
    <div className="video-list">
      <div className="video-list-header">
        <h2>Videos ({videos.length})</h2>
        <button 
          className="btn-upload"
          onClick={() => fileInputRef.current?.click()}
        >
          + Add Videos
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept="video/mp4,video/webm,video/quicktime"
          multiple
          style={{ display: 'none' }}
          onChange={handleFileSelect}
        />
      </div>

      {videos.length === 0 ? (
        <div className="empty-state">
          <p>No videos yet</p>
          <p className="empty-hint">Click "Add Videos" to get started</p>
        </div>
      ) : (
        <div className="video-items">
          {videos.map((video, idx) => (
            <VideoItem
              key={video.id}
              video={video}
              isFirst={idx === 0}
              isLast={idx === videos.length - 1}
              onRankChange={onRankChange}
              onLabelChange={onLabelChange}
              onDelete={onDelete}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default VideoList;