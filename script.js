function getDegree(rootNote, degree, scaleType, octave = 0) {
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
    rootNote += 3;
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
    'q': 'minor', 'w': 'minor', 'e': 'minor', 'r': 'minor', 't': 'minor', 'y': 'minor', 'u': 'minor', 'i': 'minor', 'o': 'minor',
    'a': 'augmented', 's': 'augmented', 'd': 'augmented', 'f': 'augmented', 'g': 'augmented', 'h': 'augmented', 'j': 'augmented', 'k': 'augmented', 'l': 'augmented',
    'z': 'diminished', 'x': 'diminished', 'c': 'diminished', 'v': 'diminished', 'b': 'diminished', 'n': 'diminished', 'm': 'diminished', ',': 'diminished', '.': 'diminished'
};



document.addEventListener('DOMContentLoaded', function () {
    const keySelect = document.getElementById('keys');
    let currentKey = keySelect.value;

    keySelect.addEventListener('change', function (event) {
        currentKey = event.target.value;
    });

    // let synth = new Tone.Synth().toDestination();

    let synth = new Tone.PolySynth(Tone.Synth).toDestination();
    synth.volume.value = -20;
    const volume = new Tone.Volume(-12).toDestination();

    volume.volume.value = -100;
    synth.connect(volume);

    volume.toDestination();
    let keysPressed = {};  // Object to track which keys are being held down

    window.addEventListener('keydown', (event) => {
        let key = event.key;

        if (keyToDegreeMapping[key]) {
            let degree = keyToDegreeMapping[key];
            let chordType = keyToChordTypeMapping[key];

            if (!keysPressed[key]) {
                keysPressed[key] = true;
                let chordNotes = getChord(currentKey, degree, chordType, 'major'); // assumes we are using major scale
                synth.triggerAttack(chordNotes);

                chordNotes.forEach((n) => {
                    console.log(n)
                    const noteKey = document.querySelector(`[data-note="${n}"]`);
                    noteKey.classList.add('active');
                })
            }
        }
    });

    // The keyup event
    window.addEventListener('keyup', (event) => {
        let key = event.key;

        if (keyToDegreeMapping[key]) {
            keysPressed[key] = false;

            // if (!Object.values(keysPressed).some(val => val)) { // if no keys are being pressed
            //     synth.triggerRelease();
            // }
            let degree = keyToDegreeMapping[key];
            let chordType = keyToChordTypeMapping[key];
            let chordNotes = getChord(currentKey, degree, chordType, 'major'); // assumes we are using major scale
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
