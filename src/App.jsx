// App.js
import React, { useState, useEffect, useRef } from 'react';
import './App.css'; // Import the CSS file for styling

const App = () => {
    const [playlist, setPlaylist] = useState([]);
    const [queue, setQueue] = useState([]);
    const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
    const [isPlaying, setIsPlaying] = useState(false);
    const audioRef = useRef(new Audio());
  
    useEffect(() => {
      // Load the playlist from localStorage
      const storedPlaylist = JSON.parse(localStorage.getItem('playlist'));
      if (storedPlaylist) {
        setPlaylist(storedPlaylist);
        setQueue(storedPlaylist);
      }
  
      // Load the last playing audio file and continue playing from the last position
      const storedIndex = localStorage.getItem('currentTrackIndex');
      if (storedIndex) {
        setCurrentTrackIndex(parseInt(storedIndex, 10));
      }
  
      const storedTime = localStorage.getItem('audioCurrentTime');
      if (storedTime) {
        audioRef.current.currentTime = parseFloat(storedTime);
      }
  
      // Start playing the last track if it was playing before the page reload
      const storedIsPlaying = localStorage.getItem('isPlaying');
      if (storedIsPlaying === 'true') {
        playAudio();
      }
  
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);
  
    useEffect(() => {
      // Save the playlist to localStorage
      localStorage.setItem('playlist', JSON.stringify(playlist));
  
      // Save the current playing track and time to localStorage
      localStorage.setItem('currentTrackIndex', currentTrackIndex);
      localStorage.setItem('audioCurrentTime', audioRef.current.currentTime);
      localStorage.setItem('isPlaying', isPlaying);
  
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [playlist, currentTrackIndex]);
  

  useEffect(() => {
    // Load the last playing audio file and continue playing from the last position
    const storedIndex = localStorage.getItem('currentTrackIndex');
    if (storedIndex) {
      setCurrentTrackIndex(parseInt(storedIndex, 10));
    }

    const storedTime = localStorage.getItem('audioCurrentTime');
    if (storedTime) {
      audioRef.current.currentTime = parseFloat(storedTime);
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    // Save the current playing track and time to localStorage
    localStorage.setItem('currentTrackIndex', currentTrackIndex);
    localStorage.setItem('audioCurrentTime', audioRef.current.currentTime);

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentTrackIndex]);

  const handleFileChange = (e) => {
    const files = e.target.files;
    const newSongs = [];

    for (let i = 0; i < files.length; i++) {
      const track = {
        name: files[i].name,
        url: URL.createObjectURL(files[i]),
      };

      newSongs.push(track);
    }

    setPlaylist((prevSongs) => [...prevSongs, ...newSongs]);
    setQueue((prevQueue) => [...prevQueue, ...newSongs]);

    if (playlist.length === 0) {
      // If playlist is empty, start playing the first track
      setCurrentTrackIndex(0);
      playAudio();
    }
  };

  const playAudio = () => {
    if (queue.length === 0) {
      console.error("Queue is empty.");
      return;
    }

    const audio = audioRef.current;

    if (audio.paused || audio.ended) {
      const currentTrack = queue[0];

      audio.src = currentTrack.url;

      const playPromise = audio.play();

      if (playPromise !== undefined) {
        playPromise
          .then(() => {
            setIsPlaying(true);
          })
          .catch((error) => {
            console.error("Error playing audio:", error);
          });
      }

      setQueue((prevQueue) => prevQueue.slice(1)); // Remove the first track from the queue
    }
  };

  const playPauseHandler = () => {
    const audio = audioRef.current;

    if (isPlaying) {
      audio.pause();
      setIsPlaying(false);
    } else {
      audio.currentTime = parseFloat(localStorage.getItem('audioCurrentTime')) || 0;
      audio.play().then(() => {
        setIsPlaying(true);
      });
    }
  };


  const playNextHandler = () => {
    if (currentTrackIndex < playlist.length - 1) {
      setCurrentTrackIndex((prevIndex) => prevIndex + 1);
    } else {
      setCurrentTrackIndex(0);
    }
  };

  const playPreviousHandler = () => {
    if (currentTrackIndex > 0) {
      setCurrentTrackIndex((prevIndex) => prevIndex - 1);
    } else {
      setCurrentTrackIndex(playlist.length - 1);
    }
  };
  useEffect(() => {
    const audio = audioRef.current;

    // If the audio is playing, pause it before changing the source
    if (isPlaying) {
      audio.pause();
    }

    // Check if the playlist is not empty and the current track index is valid
    if (playlist.length > 0 && currentTrackIndex >= 0 && currentTrackIndex < playlist.length) {
      // Set the new source and play the audio
      audio.src = playlist[currentTrackIndex].url;
      audio.play().then(() => {
        setIsPlaying(true);
      });
    } else {
      console.error("Invalid playlist or current track index.");
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentTrackIndex]);

  const chooseTrackHandler = (index) => {
    setCurrentTrackIndex(index);
    playAudio();
  };

  const skipTrackHandler = () => {
    if (currentTrackIndex < playlist.length - 1) {
      setCurrentTrackIndex((prevIndex) => prevIndex + 1);
    } else {
      setCurrentTrackIndex(0);
    }

    playAudio();
  };

return (
  <div className="music-player-container">
    <div className="playlist">
      <h2> Choose File <p>Playlist :</p></h2>
      <ul>
        {playlist.map((track, index) => (
          <li
            key={index}
            className={index === currentTrackIndex ? 'current-track' : ''}
            onClick={() => chooseTrackHandler(index)}
          >
            {track.name}
          </li>
        ))}
      </ul>
    </div>
    <div className="now-playing">
      {playlist.length > 0 && (
        <p className="current-track">Now Playing: {playlist[currentTrackIndex].name}</p>
      )}
    </div>
    <input
      type="file"
      id="fileInput"
      className="choose-file-input"
      onChange={handleFileChange}
      accept=".mp3"
      multiple
    />
    <audio
      ref={audioRef}
      onEnded={skipTrackHandler}
      onTimeUpdate={() => {
        localStorage.setItem('audioCurrentTime', audioRef.current.currentTime);
      }}
      controls
    ></audio>
    <div className="player-controls">
      <button onClick={playPreviousHandler}>Previous</button>
      <button onClick={playPauseHandler}>{isPlaying ? 'Pause' : 'Play'}</button>
      <button onClick={playNextHandler}>Next</button>
    </div>
  </div>
);
};

export default App;

