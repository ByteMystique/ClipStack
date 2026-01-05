// frontend/src/components/TitleEditor.jsx
import { useState } from 'react';

function TitleEditor({ title, onChange }) {
  const [text, setText] = useState(title.text);
  const [highlightText, setHighlightText] = useState(
    title.highlights[0]?.text || ''
  );
  const [highlightColor, setHighlightColor] = useState(
    title.highlights[0]?.color || '#FF6B9D'
  );

  const handleUpdate = () => {
    const highlights = highlightText.trim() 
      ? [{ text: highlightText.trim(), color: highlightColor }]
      : [];

    onChange({
      text: text.trim() || 'Ranking Videos',
      highlights
    });
  };

  const handleTextChange = (e) => {
    setText(e.target.value);
  };

  const handleTextBlur = () => {
    handleUpdate();
  };

  const handleHighlightChange = (e) => {
    setHighlightText(e.target.value);
  };

  const handleHighlightBlur = () => {
    handleUpdate();
  };

  const handleColorChange = (e) => {
    setHighlightColor(e.target.value);
    // Update immediately on color change
    setTimeout(handleUpdate, 50);
  };

  return (
    <div className="title-editor">
      <h2>Title</h2>
      
      <div className="form-group">
        <label>Main Title</label>
        <input
          type="text"
          className="input-title"
          value={text}
          onChange={handleTextChange}
          onBlur={handleTextBlur}
          placeholder="Ranking Videos"
        />
      </div>

      <div className="form-group">
        <label>Highlight (Optional)</label>
        <div className="highlight-row">
          <input
            type="text"
            className="input-highlight"
            value={highlightText}
            onChange={handleHighlightChange}
            onBlur={handleHighlightBlur}
            placeholder="e.g., Cutest Cats"
          />
          <input
            type="color"
            className="input-color"
            value={highlightColor}
            onChange={handleColorChange}
            title="Highlight color"
          />
        </div>
        <p className="hint">Text to highlight in a different color</p>
      </div>
    </div>
  );
}

export default TitleEditor;