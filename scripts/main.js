let midiInput;
// let activeNotes = {};
let noteSounds = {};

function preload() {
  soundFormats('mp3');

  // Only the filenames from the screenshot
  const availableNotes = [
    'a-3', 'a-4', 'a-5', 'a3', 'a4', 'a5',
    'b3', 'b4', 'b5',
    'c-3', 'c-4', 'c-5', 'c3', 'c4', 'c5', 'c6',
    'd-3', 'd-4', 'd-5', 'd3', 'd4', 'd5',
    'e3', 'e4', 'e5',
    'f-3', 'f-4', 'f-5', 'f3', 'f4', 'f5',
    'g-3', 'g-4', 'g-5', 'g3', 'g4', 'g5'
  ];

  for (let note of availableNotes) {
    noteSounds[note] = loadSound(`sounds/piano/${note}.mp3`);
  }
}

function setup() {
  createCanvas(windowWidth, windowHeight);
  noStroke();
  frameRate(60);
  midiInput = new MIDIInput();
  midiInput.onMIDIMessage = onMIDIMessage;
  background(0);
}

function draw() {
  background(0, 0.9);
  fill(255);
  textSize(20);
  let y = 50;
  for (let note in activeNotes) {
    text(`Note: ${note}`, 50, y);
    y += 30;
  }
//   console.log(activeNotes.note)
}

function midiNoteToNoteName(midiNote) {
  const noteNames = ['c', 'c-', 'd', 'd-', 'e', 'f', 'f-', 'g', 'g-', 'a', 'a-', 'b'];
  let octave = Math.floor(midiNote / 12) - 1;
  let note = noteNames[midiNote % 12];
  if (note === 'a' || note === 'a-') {
    octave += 1;
  }

    if (midiNote === 71) {  
      octave += 1;  
    }
    if (midiNote === 83) {  
        octave += 1;  
      }
   
  
  return note + octave;
}

const activeNotes = new Set();

function onMIDIMessage(data) {
  const msg = new MIDI_Message(data.data);
  const noteName = midiNoteToNoteName(msg.note);

//   console.log("MIDI Msg:", msg.type, msg.note, msg.velocity, noteName);

  if (msg.type === MIDI_Message.NOTE_ON) {
    // Ignore duplicate presses of same note
    if (!activeNotes.has(noteName)) {
      activeNotes.add(noteName);
      const sound = noteSounds[noteName];
      if (sound) {
        sound.playMode('sustain');
        sound.play();
      } else {
        console.warn("Missing sound for", noteName);
      }
    }
  } else if (msg.type === MIDI_Message.NOTE_OFF) {
    activeNotes.delete(noteName);
  }
}
