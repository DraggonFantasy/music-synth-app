function getDegree(rootNote, degree, scaleType, octave = 0) {
    if (rootNote.length == 1 || (rootNote[rootNote.length - 1] == "#")) rootNote += 3;
    // Whole and half step mapping
    const WHOLE_STEP = 2;
    const HALF_STEP = 1;

    // Scale patterns
    const scalePatterns = {
        'major': [WHOLE_STEP, WHOLE_STEP, HALF_STEP, WHOLE_STEP, WHOLE_STEP, WHOLE_STEP, HALF_STEP],
        'minor': [WHOLE_STEP, HALF_STEP, WHOLE_STEP, WHOLE_STEP, HALF_STEP, WHOLE_STEP, WHOLE_STEP],
        'augmented': [WHOLE_STEP, WHOLE_STEP, WHOLE_STEP, HALF_STEP],
        'diminished': [WHOLE_STEP, HALF_STEP, WHOLE_STEP, HALF_STEP]
    };

    // Convert note to MIDI number
    let midiRootNote = Tone.Frequency(rootNote).toMidi();
    console.log("midiRootNote", midiRootNote)

    // Calculate the MIDI number of the degree note
    let midiDegreeNote = midiRootNote;
    for (let i = 0; i < degree - 1; i++) {
        midiDegreeNote += scalePatterns[scaleType][i % scalePatterns[scaleType].length];
    }

    // Adjust the MIDI number for the desired octave
    midiDegreeNote += octave * 12;
    console.log("midiDegreeNote", midiDegreeNote)

    // Convert MIDI number back to note
    let degreeNote = Tone.Frequency(midiDegreeNote, 'midi').toNote();
    console.log("degreeNote", degreeNote)

    return degreeNote;
}

function getChord(rootNote, degree, chordType, scaleType) {
    // let scale = scaleType === 'major' ? majorScale : minorScale;

    // Get the root note of the chord
    if (rootNote.length == 1 || (rootNote[rootNote.length - 1] == "#")) rootNote += 3;
    console.log("getChord", rootNote, degree, chordType, scaleType);
    let chordRootNote = getDegree(rootNote, degree, scaleType);

    // Get the third and fifth of the chord
    let third, fifth;

    switch (chordType) {
        case 'major':
            third = getDegree(chordRootNote, 3, 'major', 0);
            fifth = getDegree(chordRootNote, 5, 'major', 0);
            break;
        case 'minor':
            third = getDegree(chordRootNote, 3, 'minor', 0);
            fifth = getDegree(chordRootNote, 5, 'major', 0);
            break;
        case 'augmented':
            third = getDegree(chordRootNote, 3, 'major', 0);
            fifth = getDegree(chordRootNote, 5, 'augmented', 0);
            break;
        case 'diminished':
            third = getDegree(chordRootNote, 3, 'minor', 0);
            fifth = getDegree(chordRootNote, 5, 'diminished', 0);
            break;
    }

    return [chordRootNote, third, fifth];
}

function getChordInversions(rootNote, chordType, inversions) {
    if (rootNote.length == 1 || (rootNote[rootNote.length - 1] == "#")) rootNote += 3;
    const chordRootNote = getChord(rootNote, 1, chordType, 'major')[0];
    console.log("chordRootNote", chordRootNote);

    const chordNotes = getChord(chordRootNote, 1, chordType, 'major');
    console.log("chordNotes", chordNotes);

    if (inversions <= 0 || inversions >= chordNotes.length) {
        return chordNotes; // Return the original chord if inversions are out of range
    }

    const invertedChord = chordNotes.slice(); // Copy the original chord

    for (let i = 0; i < inversions; i++) {
        const firstNote = invertedChord.shift(); // Remove the first note
        const newNote = getDegree(firstNote, 1, 'major', 1); // Transpose the first note up one octave
        invertedChord.push(newNote); // Add the first note transposed to the next octave to the end
    }

    console.log(invertedChord);
    return invertedChord;
}




function getPressedKeys(keysPressed) {
    return Object.entries(keysPressed)
        .filter(([key, value]) => value === true)
        .map(([key]) => key);
}

const keyToDegreeMapping = {
    '1': 1, '2': 2, '3': 3, '4': 4, '5': 5, '6': 6, '7': 7, '8': 8, '9': 9, '0': 10,
    'q': 1, 'w': 2, 'e': 3, 'r': 4, 't': 5, 'y': 6, 'u': 7, 'i': 8, 'o': 9,
    'a': 1, 's': 2, 'd': 3, 'f': 4, 'g': 5, 'h': 6, 'j': 7, 'k': 8, 'l': 9,
    'z': 1, 'x': 2, 'c': 3, 'v': 4, 'b': 5, 'n': 6, 'm': 7, ',': 8, '.': 9
};

// Key to chord type mapping
const keyToChordTypeMapping = {
    '1': 'major', '2': 'major', '3': 'major', '4': 'major', '5': 'major', '6': 'major', '7': 'major', '8': 'major', '9': 'major', '0': 'major',
    'q': 'minor', 'w': 'minor', 'e': 'minor', 'r': 'minor', 't': 'minor', 'y': 'minor', 'u': 'minor', 'i': 'minor', 'o': 'minor', 'p': 'minor',
    'a': 'augmented', 's': 'augmented', 'd': 'augmented', 'f': 'augmented', 'g': 'augmented', 'h': 'augmented', 'j': 'augmented', 'k': 'augmented', 'l': 'augmented', ';': 'augmented',
    'z': 'diminished', 'x': 'diminished', 'c': 'diminished', 'v': 'diminished', 'b': 'diminished', 'n': 'diminished', 'm': 'diminished', ',': 'diminished', '.': 'diminished', '/': 'diminished'
};
const keyToInversionMapping = {
    '1': 0, '2': 0, '3': 0, '4': 0, '5': 0, '6': 0, '7': 0, '8': 0, '9': 0, '0': 0,
    'q': 1, 'w': 1, 'e': 1, 'r': 1, 't': 1, 'y': 1, 'u': 1, 'i': 1, 'o': 1, 'p': 1,
    'a': 2, 's': 2, 'd': 2, 'f': 2, 'g': 2, 'h': 2, 'j': 2, 'k': 2, 'l': 2, ';': 2,
    'z': 3, 'x': 3, 'c': 3, 'v': 3, 'b': 3, 'n': 3, 'm': 3, ',': 3, '.': 3, '/': 3
};



document.addEventListener('DOMContentLoaded', function () {
    function getCurrentMode() {
        const checkedRadio = document.querySelector('.mode-switcher input[type="radio"]:checked');
        if (checkedRadio) {
            return checkedRadio.value;
        }
        return null; // No mode selected
    }
    const keySelect = document.getElementById('keys');
    let currentKey = keySelect.value;

    keySelect.addEventListener('change', function (event) {
        currentKey = event.target.value;
    });

    // let synth = new Tone.Synth().toDestination();

    // let synth = new Tone.PolySynth(Tone.Synth)
    let synth = new Tone.PolySynth(Tone.MonoSynth, {
        oscillator: {
            type: 'triangle'
        },
        envelope: {
            attack: 0.03,
            decay: 0.7,
            sustain: 0.2,
            release: 1
        },
        filterEnvelope: {
            attack: 0.01,
            decay: 0,
            sustain: 0.2,
            release: 0.3
        }
    }).toDestination();







    synth.volume.value = -20;
    const volume = new Tone.Volume(-6).toDestination();

    volume.volume.value = -100;
    synth.connect(volume);

    volume.toDestination();
    let keysPressed = {};  // Object to track which keys are being held down

    window.addEventListener('keydown', (event) => {
        let key = event.key;
        if (key == '=') {
            console.log("!!!")
            // synth.voices.forEach(function (voice) {
            //     voice.envelope.attack = 0.5;
            // });
            synth.set({ "envelope.attack": 1, "envelope.decay": 0, "envelope.sustain": 0.1 });
        }
        let mode = getCurrentMode()
        console.log(mode)


        if (keyToDegreeMapping[key]) {
            let degree = keyToDegreeMapping[key];
            let chordType = keyToChordTypeMapping[key];
            let inversion = keyToInversionMapping[key];

            if (!keysPressed[key]) {
                keysPressed[key] = true;
                let chordNotes;
                if (mode == "chordType") {
                    chordNotes = getChord(currentKey, degree, chordType, 'major'); // assumes we are using major scale
                } else {
                    let rootNote = getDegree(currentKey, degree, "major", 0);
                    chordNotes = getChordInversions(rootNote, "major", inversion);
                }
                synth.triggerAttack(chordNotes);

                chordNotes.forEach((n) => {
                    const noteKey = document.querySelector(`[data-note="${n}"]`);
                    noteKey.classList.add('active');
                })
            }
        }
    });

    // The keyup event
    window.addEventListener('keyup', (event) => {
        let key = event.key;
        let mode = getCurrentMode()
        // synth.volume.linearRampToValueAtTime(-50, "5"); // Ramp to -12 dB over 2 seconds

        if (keyToDegreeMapping[key]) {
            keysPressed[key] = false;

            // if (!Object.values(keysPressed).some(val => val)) { // if no keys are being pressed
            //     synth.triggerRelease();
            // }
            let degree = keyToDegreeMapping[key];
            let chordType = keyToChordTypeMapping[key];
            let inversion = keyToInversionMapping[key];
            let chordNotes;
            if (mode == "chordType") {
                chordNotes = getChord(currentKey, degree, chordType, 'major'); // assumes we are using major scale
            } else {
                let rootNote = getDegree(currentKey, degree, "major", 0);
                chordNotes = getChordInversions(rootNote, "major", inversion);
            }
            synth.triggerRelease(chordNotes);
            chordNotes.forEach((n) => {
                const noteKey = document.querySelector(`[data-note="${n}"]`);
                noteKey.classList.remove('active');
            })

            //         let [rootNote, rootOctave] = getDegree(currentKey + 3, degree, 'major', 0);
            //         let [thirdNote, thirdOctave] = getDegree(currentKey + 3, degree + 2, 'major', 0); // Get the third degree note
            //         let [fifthNote, fifthOctave] = getDegree(currentKey + 3, degree + 4, 'major', 0); // Get the fifth degree note
            //         rootNote = rootNote + rootOctave;
            //         thirdNote = thirdNote + thirdOctave;
            //         fifthNote = fifthNote + fifthOctave;

            //         // console.log(note, octave)
            //         // note = note + octave;
            //         // console.log(note, octave)

            //         // if (Object.values(keysPressed).every(value => value === false)) {
            //         // const keys = getPressedKeys()
            //         synth.triggerRelease(rootNote);
            //         synth.triggerRelease(thirdNote);
            //         synth.triggerRelease(fifthNote);
        }
    });


    document.addEventListener('keydown', (event) => {
        const key = event.key.toUpperCase();
        const note = document.querySelector(`[data-note="${key}"]`);

        if (note) {
            note.classList.add('active');
            // synth.triggerAttack(key + '4');
        }
    });

    document.addEventListener('keyup', (event) => {
        const key = event.key.toUpperCase();
        const note = document.querySelector(`[data-note="${key}"]`);

        if (note) {
            note.classList.remove('active');
            // synth.triggerRelease(key + '4');
        }
    });

    // document.addEventListener('keydown', function (event) {
    //     let key = event.key;

    //     // if (keyToDegreeMapping[key]) {
    //     //     let degree = keyToDegreeMapping[key];
    //     //     let chordType = keyToChordTypeMapping[key];

    //     //     if (!keysPressed[key]) {
    //     //         keysPressed[key] = true;
    //     //         let chordNotes = getChord(currentKey, degree, chordType, 'major'); // assumes we are using major scale
    //     //         synth.triggerAttack(chordNotes);
    //     //     }
    //     // }


    //     if (event.keyCode >= 48 && event.keyCode <= 57) { // keys 0-9
    //         if (keysPressed[event.keyCode]) return;  // Ignore key repeat
    //         keysPressed[event.keyCode] = true;  // Mark this key as being held down

    //         let degree = event.keyCode - 48;
    //         let scale = event.shiftKey ? 'major' : 'minor';
    //         // let [note, octave] = getDegree(currentKey, degree, scale == 'major', 3)
    //         let [rootNote, rootOctave] = getDegree(currentKey + 3, degree, 'major', 0);
    //         let [thirdNote, thirdOctave] = getDegree(currentKey + 3, degree + 2, 'major', 0); // Get the third degree note
    //         let [fifthNote, fifthOctave] = getDegree(currentKey + 3, degree + 4, 'major', 0); // Get the fifth degree note


    //         // console.log(note, octave)
    //         rootNote = rootNote + rootOctave;
    //         thirdNote = thirdNote + thirdOctave;
    //         fifthNote = fifthNote + fifthOctave;

    //         console.log(rootNote, thirdNote, fifthNote)
    //         synth.triggerAttack(rootNote);
    //         synth.triggerAttack(thirdNote);
    //         synth.triggerAttack(fifthNote);

    //         // synth.triggerAttack(rootNote, thirdNote, fifthNote);

    //         console.log(`Key: ${currentKey}, degree: ${degree}, scale: ${scale}`);
    //     }
    // });

    // document.addEventListener('keyup', function (event) {
    //     if (event.keyCode >= 48 && event.keyCode <= 57) { // keys 0-9
    //         if (!keysPressed[event.keyCode]) return;  // Ignore key repeat
    //         keysPressed[event.keyCode] = false;  // Mark this key as released

    //         let degree = event.keyCode - 48;
    //         let scale = event.shiftKey ? 'major' : 'minor';

    //         // Just an example, you should calculate the actual note based on currentKey, degree, and scale
    //         // let [note, octave] = getDegree(currentKey, degree, scale == 'major', 3)
    //         let [rootNote, rootOctave] = getDegree(currentKey + 3, degree, 'major', 0);
    //         let [thirdNote, thirdOctave] = getDegree(currentKey + 3, degree + 2, 'major', 0); // Get the third degree note
    //         let [fifthNote, fifthOctave] = getDegree(currentKey + 3, degree + 4, 'major', 0); // Get the fifth degree note
    //         rootNote = rootNote + rootOctave;
    //         thirdNote = thirdNote + thirdOctave;
    //         fifthNote = fifthNote + fifthOctave;

    //         // console.log(note, octave)
    //         // note = note + octave;
    //         // console.log(note, octave)

    //         // if (Object.values(keysPressed).every(value => value === false)) {
    //         // const keys = getPressedKeys()
    //         synth.triggerRelease(rootNote);
    //         synth.triggerRelease(thirdNote);
    //         synth.triggerRelease(fifthNote);
    //         // }
    //     }
    // });
});
