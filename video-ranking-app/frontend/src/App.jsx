import { useProject } from './hooks/useProject';
import VideoList from './components/VideoList';
import TitleEditor from './components/TitleEditor';
import PreviewPlayer from './components/PreviewPlayer';
import ExportButton from './components/ExportButton';
import './index.css';

function App() {
  const {
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
  } = useProject();

  return (
    <div className="app">
      <header className="app-header">
        <h1>🎬 Video Ranking Studio</h1>
        <ExportButton
          onExport={handleExport}
          isExporting={isExporting}
          disabled={project.videos.length === 0}
        />
      </header>

      <div className="app-content">
        <div className="editor-panel">
          <TitleEditor
            title={project.title}
            onChange={handleTitleChange}
          />

          <VideoList
            videos={project.videos}
            onUpload={handleVideoUpload}
            onRankChange={handleRankChange}
            onLabelChange={handleLabelChange}
            onDelete={handleDeleteVideo}
          />
        </div>

        <div className="preview-panel">
          <PreviewPlayer
            videos={project.videos}
            title={project.title}
            currentIndex={currentVideoIndex}
            onVideoEnd={handleVideoEnd}
            onVideoSelect={setCurrentVideoIndex}
          />
        </div>
      </div>
    </div>
  );
}

export default App;