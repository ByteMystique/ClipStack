// backend/services/ffmpegRenderer.js
const { exec } = require('child_process');
const { promisify } = require('util');
const path = require('path');
const fs = require('fs');
const execPromise = promisify(exec);

class FFmpegRenderer {
  /**
   * Main render function
   * @param {Object} project - Project data with videos, title, etc.
   * @param {string} outputPath - Final output file path
   */
  async renderProject(project, outputPath) {
    const tempDir = path.join(__dirname, '../temp');
    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir, { recursive: true });
    }

    try {
      // Step 1: Process each video clip
      const processedClips = await this.processClips(project.videos, tempDir);

      // Step 2: Create concat file
      const concatFile = path.join(tempDir, `concat_${Date.now()}.txt`);
      const concatContent = processedClips
        .map(clip => `file '${clip.replace(/'/g, "'\\''")}'`)
        .join('\n');
      fs.writeFileSync(concatFile, concatContent);

      // Step 3: Concatenate all clips
      const concatenatedPath = path.join(tempDir, `concatenated_${Date.now()}.mp4`);
      await this.concatenateVideos(concatFile, concatenatedPath);

      // Step 4: Add overlays (title + rankings)
      await this.addOverlays(concatenatedPath, outputPath, project);

      // Cleanup
      this.cleanup([concatFile, concatenatedPath, ...processedClips]);

      console.log('✅ Render complete:', outputPath);
    } catch (err) {
      console.error('❌ Render failed:', err);
      throw err;
    }
  }

  /**
   * Process individual video clips
   * - Trim to 5 seconds
   * - Scale to 9:16 vertical format (1080x1920)
   */
  async processClips(videos, tempDir) {
    const processedClips = [];

    // Reverse the order so videos play from highest rank to lowest (descending)
    const reversedVideos = [...videos].reverse();

    for (let i = 0; i < reversedVideos.length; i++) {
      const video = reversedVideos[i];
      const filePath = video.filePath.startsWith('/') ? video.filePath.slice(1) : video.filePath;
      const inputPath = path.join(__dirname, '..', filePath);
      const timestamp = Date.now();
      const outputPath = path.join(tempDir, `clip_${timestamp}_${i}.mp4`);

      console.log(`Processing clip ${i + 1}/${reversedVideos.length}: Rank #${video.rank} - ${video.filename}`);

      // Trim to exactly 5 seconds and scale to vertical format
      // Use -ss before -i for faster seeking, and setpts to reset timestamps
      const cmd = `ffmpeg -ss 0 -i "${inputPath}" \\
        -t 5 \\
        -vf "scale=1080:1920:force_original_aspect_ratio=decrease,pad=1080:1920:(ow-iw)/2:(oh-ih)/2:black,setpts=PTS-STARTPTS" \\
        -af "asetpts=PTS-STARTPTS" \\
        -c:v libx264 -preset fast -crf 23 \\
        -c:a aac -b:a 128k \\
        -r 30 \\
        -y "${outputPath}"`;

      await execPromise(cmd);
      processedClips.push(outputPath);
      console.log(`✓ Clip ${i + 1} processed successfully: ${outputPath}`);
    }

    return processedClips;
  }

  /**
   * Concatenate all processed clips
   */
  async concatenateVideos(concatFile, outputPath) {
    console.log('Concatenating videos...');

    const cmd = `ffmpeg -f concat -safe 0 -i "${concatFile}" \\
      -c copy \\
      -y "${outputPath}"`;

    await execPromise(cmd);
  }

  /**
   * Add overlays: title bar + rank indicators
   */
  async addOverlays(inputPath, outputPath, project) {
    console.log('Adding overlays...');

    // Build drawtext filters
    const filters = [];

    // Add black background bar for title
    filters.push(
      `drawbox=y=0:color=black:width=iw:height=200:t=fill`
    );

    // 1. Title bar at top with color support
    const titleText = project.title.text;
    const highlight = project.title.highlights && project.title.highlights[0];

    const escapedTitle = this.escapeFFmpegText(titleText);

    if (highlight && titleText.includes(highlight.text)) {
      // Convert hex color to FFmpeg format
      const highlightColor = highlight.color.replace('#', '0x');

      // Render entire title in the highlight color
      filters.push(
        `drawtext=text='${escapedTitle}':fontcolor=${highlightColor}:fontsize=70:` +
        `x=(w-text_w)/2:y=100:fontfile='/usr/share/fonts/truetype/noto/NotoSans-Bold.ttf':borderw=5:bordercolor=0x000000`
      );
    } else {
      // No highlight, render in white
      filters.push(
        `drawtext=text='${escapedTitle}':fontcolor=0xFFFFFF:fontsize=70:` +
        `x=(w-text_w)/2:y=100:fontfile='/usr/share/fonts/truetype/noto/NotoSans-Bold.ttf':borderw=5:bordercolor=0x000000`
      );
    }

    // 2. Rank indicators on left side
    // Show ranks in ascending order (1, 2, 3, 4, 5) but videos play in reverse
    const rankCount = project.videos.length;
    const rankSpacing = 150;
    const startY = 400;

    // Videos play in reverse order
    const reversedVideos = [...project.videos].reverse();

    for (let i = 0; i < rankCount; i++) {
      const video = project.videos[i]; // Display ranks in original order
      const rankY = startY + (i * rankSpacing);
      const rankText = `${video.rank}.`;

      // Styled Rank Number (No Box, Bold, Outlined, Yellow)
      filters.push(
        `drawtext=text='${rankText}':fontcolor=0xFFD700:fontsize=100:` +
        `x=40:y=${rankY}:fontfile='/usr/share/fonts/truetype/noto/NotoSans-Bold.ttf':borderw=5:bordercolor=0x000000`
      );

      // Label text - find which video is playing at this time
      // Since videos play in reverse, we need to map playback time to the correct video
      for (let j = 0; j < reversedVideos.length; j++) {
        const playingVideo = reversedVideos[j];
        if (playingVideo.rank === video.rank) {
          const startTime = j * 5;
          const endTime = startTime + 5;
          const labelText = this.escapeFFmpegText(playingVideo.label);

          console.log(`Adding label for Rank #${video.rank}: "${playingVideo.label}" at time ${startTime}-${endTime}s`);

          filters.push(
            `drawtext=text='${labelText}':fontcolor=0xFFFFFF:fontsize=50:` +
            `x=180:y=${rankY + 30}:fontfile='/usr/share/fonts/truetype/noto/NotoSans-Bold.ttf':borderw=4:bordercolor=0x000000:` +
            `enable='between(t,${startTime},${endTime})'`
          );
          break;
        }
      }
    }

    // Combine all filters
    const filterComplex = filters.join(',');

    const cmd = `ffmpeg -i "${inputPath}" \\
      -vf "${filterComplex}" \\
      -c:v libx264 -preset fast -crf 23 \\
      -c:a copy \\
      -y "${outputPath}"`;

    await execPromise(cmd);
  }

  /**
   * Escape special characters for FFmpeg drawtext
   */
  escapeFFmpegText(text) {
    return text
      .replace(/\\/g, '\\\\')
      .replace(/'/g, "\\'")
      .replace(/:/g, '\\:')
      .replace(/\[/g, '\\[')
      .replace(/\]/g, '\\]');
  }

  /**
   * Cleanup temporary files
   */
  cleanup(files) {
    files.forEach(file => {
      try {
        if (fs.existsSync(file)) {
          fs.unlinkSync(file);
        }
      } catch (err) {
        console.error('Cleanup error:', err);
      }
    });
  }
}

module.exports = new FFmpegRenderer();