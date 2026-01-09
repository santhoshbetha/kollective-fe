import boopMp3 from '../assets/sounds/boop.mp3';
import boopOgg from '../assets/sounds/boop.ogg';
import chatMp3 from '../assets/sounds/chat.mp3';
import chatOgg from '../assets/sounds/chat.ogg';

/** Produce HTML5 audio from sound data. */
const createAudio = (sources) => {
  const audio = new Audio();
  sources.forEach(({ type, src }) => {
    const source = document.createElement('source');
    source.type = type;
    source.src = src;
    audio.appendChild(source);
  });
  return audio;
};

/** Play HTML5 sound. */
const play = (audio) => {
  if (!audio.paused) {
    audio.pause();
    if (typeof audio.fastSeek === 'function') {
      try {
        audio.fastSeek(0);
      } catch {}
    } else {
      audio.currentTime = 0;
    }
  }

  return audio.play().catch((error) => {
    if (error && error.name === 'NotAllowedError') {
      // User has disabled autoplay.
      return;
    } else {
      throw error;
    }
  });
};

const soundCache = {
  boop: createAudio([
    { src: boopOgg, type: 'audio/ogg' },
    { src: boopMp3, type: 'audio/mpeg' },
  ]),
  chat: createAudio([
    { src: chatOgg, type: 'audio/ogg' },
    { src: chatMp3, type: 'audio/mpeg' },
  ]),
};

export { soundCache, play };
