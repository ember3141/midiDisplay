let midiInput;
let noteSounds = {};
let started = false;
let releasedNotes = [];
const MESSAGE_LIFETIME = 15000;

let messageStates = {};

const messages = {
  c: "Continuously track progress and gather feedback to identify opportunities.",
  d: "Diversify service offerings by expanding lessons, workshops, and digital resources.",
  e: "Evaluate existing products and services to identify areas for improvement.",
  f: "Forecast upcoming trends and shifts in the music education market to stay ahead of the curve.",
  g: "Gauge the competition to become a leading business within the market.",
  a: "Analyze customer feedback to refine your products and services.",
  b: "Balance growth with sustainability, reinvesting profits to improve the business.",
}
function preload() {
  bg = loadImage('style/deca.png');
  gothamFont = loadFont('style/gotham-bold.ttf');
  soundFormats('mp3');

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
  // userStartAudio();
}

function draw() {
  background(bg);
    textSize(20);
    fill(255)
    textFont(gothamFont);
    if (!started) {
      text('Click to Start', width / 2, height / 2);
    } else {
  const now = millis();

  const allNotes = Array.from(new Set([
    ...activeNotes,
    ...Object.keys(messageStates)
  ])).sort();

  for (let i = 0; i < allNotes.length; i++) {
    const note = allNotes[i];
    const y = 70 + i * 48;
    const firstChar = note.charAt(0);

    if (!messages.hasOwnProperty(firstChar)) continue;

    let alpha = 255;
    if (messageStates[note]?.fading) {
      const elapsed = now - messageStates[note].releasedAt;
      if (elapsed >= MESSAGE_LIFETIME) {
        delete messageStates[note];
        continue;
      }
      alpha = map(elapsed, 0, MESSAGE_LIFETIME, 255, 0);
    }

    fill(255, alpha);
    // text(`Note: ${note}`, 50, y);
const message = messages[firstChar];
const firstLetter = message.charAt(0);
const rest = message.slice(1);

push();

textSize(48);
text(firstLetter,windowWidth / 4,windowHeight / 4 + y);

textSize(20);
text(rest,(windowWidth / 4) +textWidth(firstLetter)*2.3,windowHeight / 4 + y)
pop();
  }
  // console.log(allNotes)
  // console.log(messageStates)
  if(allNotes.length>0){
    textSize(100)
    const mostRecentKey = Object.entries(messageStates)
    .filter(([_, state]) => state.pressedAt !== undefined)
    .sort((a, b) => b[1].pressedAt - a[1].pressedAt)[0][0];
      // console.log(mostRecentKey)
    var thing=messages[mostRecentKey.charAt(0)].split(" ")[0];
  text(thing, windowWidth/2-(textWidth(thing)/2), windowHeight/4);
}
}
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
  
  if (msg.type === MIDI_Message.NOTE_ON) {
    if (noteName.charAt(1) !== '-') {
      activeNotes.add(noteName);
    }
  
    if (!messageStates[noteName]) {
      messageStates[noteName] = {};
    }
    
    // messageStates[noteName].fading = false;
    messageStates[noteName].pressedAt = millis(); // <- Add this line
  
  messageStates[noteName].fading = false;
  // Don't overwrite releasedAt here — keep the old one if it exists
  
      const sound = noteSounds[noteName];
      if (sound) {
        sound.playMode('sustain');
        sound.play();
      } else {
        console.warn("Missing sound for", noteName);
      }
     } else if (msg.type === MIDI_Message.NOTE_OFF) {
    activeNotes.delete(noteName);
    if (!messageStates[noteName]) {
      messageStates[noteName] = {};
    }
    messageStates[noteName].fading = true;
    messageStates[noteName].releasedAt = millis();
}
// console.log(messageStates)
}


function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}

function mousePressed() {
  if (!started) {
    userStartAudio(); // <-- unlocks the audio
    started = true;
  }
}