import React from 'react';
import ReactPlayer from 'react-player';
import { IoPlay, IoPause, IoVolumeMute, IoVolumeHigh } from 'react-icons/io5';

const VideoPlayer = ({ url , hide=false }) => {
  const [playing, setPlaying] = React.useState(true);
  const [muted, setMuted] = React.useState(true);

  const togglePlaying = () => {
    setPlaying((prevState) => !prevState);
  };

  const toggleMuted = () => {
    setMuted((prevState) => !prevState);
  };

  return (
    <div className="relative rounded-3xl overflow-hidden">
      <ReactPlayer
        url={url}
        playing={playing}
        muted={muted}
        width="100%"
        height="100%"
        config={{
          file: {
            attributes: {
              controlsList: 'nodownload', // Disable download button
              disablePictureInPicture: true, // Disable Picture-in-Picture mode
            },
          },
        }}
      />
      {/* Custom Play/Pause Button */}
      {!playing && (
        <button
          className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 transition-opacity opacity-0 hover:opacity-100 focus:outline-none"
          onClick={togglePlaying}
        >
          <IoPlay className="text-white text-3xl" />
        </button>
      )}
      {playing && (
        <button
          className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 transition-opacity opacity-0 hover:opacity-100 focus:outline-none"
          onClick={togglePlaying}
        >
          <IoPause className="text-white text-3xl" />
        </button>
      )}
      {/* Mute/Unmute Button */}
      <button
        className={`absolute bottom-3 right-3 bg-black bg-opacity-50 p-2 rounded-full text-white hover:bg-opacity-75 focus:outline-none ${hide?"hidden":""}`}
        onClick={toggleMuted}
      >
        {muted ? <IoVolumeMute className="text-xl" /> : <IoVolumeHigh className="text-xl" />}
      </button>
    </div>
  );
};

export default VideoPlayer;
