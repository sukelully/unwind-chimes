export default function Chime() {
  const audioCtx: AudioContext = new AudioContext();

  function playSimpleChime(freq: number, duration: number = 1): void {
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();

    osc.type = 'triangle';
    osc.frequency.value = freq;

    // Envelope
    gain.gain.setValueAtTime(0.0001, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(1, audioCtx.currentTime + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + duration);

    osc.connect(gain);
    gain.connect(audioCtx.destination);

    osc.start();
    osc.stop(audioCtx.currentTime + duration);
  }

  function handleClick(): void {
    playSimpleChime(440);
  }

  return (
    <>
      <button
        className="w-64 rounded-md bg-indigo-600 p-2 font-semibold text-white hover:bg-indigo-700"
        onClick={handleClick}
      >
        Play chime
      </button>
    </>
  );
}
