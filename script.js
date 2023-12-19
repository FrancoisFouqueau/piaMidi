document.getElementById('startButton').addEventListener('click', async () => {
    await Tone.start();
    console.log('Audio est prêt');
    initializeMIDI();
});

// Création d'un PolySynth avec un oscillateur de type sinusoïdal
const synth = new Tone.PolySynth(Tone.Synth, {
    oscillator: {
        type: 'triangle'
    },
    volume: -48 // Réduire le volume si nécessaire
}).toDestination();

// Second PolySynth avec un type d'oscillateur différent, par exemple 'square'
const synth2 = new Tone.PolySynth(Tone.Synth, {
    oscillator: {
        type: 'triangle'
    },
    detune: 10, // Désaccorde de 10 cents
    volume: -48 // Réduire le volume si nécessaire
}).toDestination();

function initializeMIDI() {
    if (navigator.requestMIDIAccess) {
        navigator.requestMIDIAccess().then(onMIDISuccess, onMIDIFailure);
    } else {
        console.log("Votre navigateur ne supporte pas la Web MIDI API");
    }
}

function onMIDISuccess(midiAccess) {
    for (let input of midiAccess.inputs.values()) {
        input.onmidimessage = handleMIDIMessage;
    }
}

function onMIDIFailure() {
    console.log("Impossible de se connecter à l'appareil MIDI");
}

function handleMIDIMessage(message) {
    const midiNumber = message.data[1];
    const frequency = Tone.Midi(midiNumber).toFrequency();

    if (message.data[0] === 144 && message.data[2] > 0) { // Note On avec vélocité > 0
        playNote(midiNumber);
        synth.triggerAttack(frequency);
        synth2.triggerAttack(frequency); 
    } else if (message.data[0] === 128 || message.data[2] === 0) { // Note Off ou vélocité = 0
        synth.triggerRelease(frequency);
        synth2.triggerRelease(frequency);
    }
}

function getNoteName(midiNumber) {
    const scale = ["C", "Cd", "D", "Dd", "E", "F", "Fd", "G", "Gd", "A", "Ad", "B"];
    const octave = Math.floor(midiNumber / 12) - 1;
    const noteIndex = midiNumber % 12;
    return scale[noteIndex] + octave;
}

function playNote(midiNumber) {
    const noteName = getNoteName(midiNumber);
    document.getElementById('noteDisplay').innerText = 'Playing Note: ' + noteName;

    // Jouer le fichier MP3
    const audio = new Audio('notesSamples/' + noteName + '.mp3');
    audio.play();
    const audio2 = new Audio('attaque6.mp3');
    audio.volume = 0.05;
    audio2.play();
}
