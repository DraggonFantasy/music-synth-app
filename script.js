function getDegree(key, degree, major, octave) {
    // Chromatic scale based on sharps
    const chromaticScale = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];

    // Define step patterns for major and minor scales
    const stepPattern = major
        ? [2, 2, 1, 2, 2, 2, 1]  // Major scale
        : [2, 1, 2, 2, 1, 2, 2]; // Minor scale

    // Find starting point (root note)
    let rootNoteIndex = chromaticScale.indexOf(key);

    // Calculate the note at the desired degree
    for (let i = 0; i < degree - 1; i++) {
        rootNoteIndex += stepPattern[i % stepPattern.length];
        // Wrap around if we go past the end of the chromatic scale
        if (rootNoteIndex >= chromaticScale.length) {
            octave += 1;
            rootNoteIndex -= chromaticScale.length;
        }
    }

    // Return the note at the calculated index
    return [chromaticScale[rootNoteIndex], octave];
}

function getPressedKeys(keysPressed) {
    return Object.entries(keysPressed)
        .filter(([key, value]) => value === true)
        .map(([key]) => key);
}



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


    document.addEventListener('keydown', function (event) {
        if (event.keyCode >= 48 && event.keyCode <= 57) { // keys 0-9
            if (keysPressed[event.keyCode]) return;  // Ignore key repeat
            keysPressed[event.keyCode] = true;  // Mark this key as being held down

            let degree = event.keyCode - 48;
            let scale = event.shiftKey ? 'major' : 'minor';
            // let [note, octave] = getDegree(currentKey, degree, scale == 'major', 3)
            let [rootNote, rootOctave] = getDegree(currentKey, degree, scale === 'major', 3);
            let [thirdNote, thirdOctave] = getDegree(currentKey, degree + 2, scale === 'major', 3); // Get the third degree note
            let [fifthNote, fifthOctave] = getDegree(currentKey, degree + 4, scale === 'major', 3); // Get the fifth degree note


            // console.log(note, octave)
            rootNote = rootNote + rootOctave;
            thirdNote = thirdNote + thirdOctave;
            fifthNote = fifthNote + fifthOctave;

            console.log(rootNote, thirdNote, fifthNote)
            synth.triggerAttack(rootNote);
            synth.triggerAttack(thirdNote);
            synth.triggerAttack(fifthNote);

            // synth.triggerAttack(rootNote, thirdNote, fifthNote);

            console.log(`Key: ${currentKey}, degree: ${degree}, scale: ${scale}`);
        }
    });

    document.addEventListener('keyup', function (event) {
        if (event.keyCode >= 48 && event.keyCode <= 57) { // keys 0-9
            if (!keysPressed[event.keyCode]) return;  // Ignore key repeat
            keysPressed[event.keyCode] = false;  // Mark this key as released

            let degree = event.keyCode - 48;
            let scale = event.shiftKey ? 'major' : 'minor';

            // Just an example, you should calculate the actual note based on currentKey, degree, and scale
            // let [note, octave] = getDegree(currentKey, degree, scale == 'major', 3)
            let [rootNote, rootOctave] = getDegree(currentKey, degree, scale === 'major', 3);
            let [thirdNote, thirdOctave] = getDegree(currentKey, degree + 2, scale === 'major', 3); // Get the third degree note
            let [fifthNote, fifthOctave] = getDegree(currentKey, degree + 4, scale === 'major', 3); // Get the fifth degree note
            rootNote = rootNote + rootOctave;
            thirdNote = thirdNote + thirdOctave;
            fifthNote = fifthNote + fifthOctave;

            // console.log(note, octave)
            // note = note + octave;
            // console.log(note, octave)

            // if (Object.values(keysPressed).every(value => value === false)) {
            // const keys = getPressedKeys()
            synth.triggerRelease(rootNote);
            synth.triggerRelease(thirdNote);
            synth.triggerRelease(fifthNote);
            // }
        }
    });
});
