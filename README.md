# Clip It Custom Trigger Configs

**Companion repo to [Clip It](https://hypetrigger.io/clipit), providing extensibility and modding support.**

The JSON files in `./configs` define games supported by [Clip It](https://hypetrigger.io/clipit), and the triggers that are available for them.

By adding your own `.json` files to this folder, you can add new games. All `.json` files found there will be automatically loaded at app startup.

**If you come up with a config that you think would be useful to others, open a pull request on this repo.**

## Config file location

When you [download](https://hypetrigger.io/clipit#download) Clip It from the website, the config files are located inside the extracted folder:

```txt
[extracted clip it folder]/resources/app/dist/public/clipit-configs/configs
```

In fact, the parent folder is an exact copy of this repo, including this README. If you make local changes or add configs from directly inside the Clip It folder, you can configure this repo as a remote and open a pull request for changes. Or, you can clone this repo separately and copy/paste your modified config `.json` files into it. Either way, new configs which have been approved and merged to `main` will be automatically included in subsequent releases of Clip It.

## Config file format

We'll walk through one of the official config files in detail, specifically `cod-warzone.json`. Follow along with [the real `configs/cod-warzone.json`](configs/cod-warzone.json) if it's helpful.

Starting from the top is some basic metadata:

```jsonc
// File: ./configs/cod-warzone.json
{
  // A unique ID assigned to this config
  // Matching the filename is a good idea
  "id": "cod-warzone",

  // The title which will be displayed in the UI,
  // most prominently in the game select box
  "title": "COD Warzone",

  // The name of the executable. This allows the app
  // to automatically detect when the game starts.
  // You can find it yourself in the task manager.
  "exe": "ModernWarfare.exe",

  "triggers": [
    // ...a list of all supported triggers
  ]
}
```

## Triggers

Triggers are the data sources that the app will use to determine when to record a clip. They are all taken from frames/screenshots of the game in real time. They consist of these four parts, detailed below:

- **CROP**: the area of the screen to capture
- **FILTER**: pre-processing applied to the image to make it easier to process
- **AI**: run the filtered image through OCR or other image analysis methods
- **PARSE**: If any text is recognized from the image, parse it (e.g. with a regex) to see if it matches an expected value

Look at the first trigger in the `cod-warzone.json` config:

```jsonc
// File: ./configs/cod-warzone.json
"triggers": [
  {
    // First, some trigger metadata:

    // A ID used in logging and matching events to this trigger
    // It should be unique (even across configs)
    "id": "warzone-kill",

    // A human-readable name for this trigger shown in the UI
    // A good format to follow is "On <Action>"
    "title": "On Kill",

    // Whether the trigger starts out as enabled by default
    // The user is able to toggle this propety on and off
    // through the UI
    "enabled": true,

    // Whether to generate debug output for this particular trigger
    // This includes console.logs, timing telemetry,
    // and also intermediate screenshot dumps
    // See the "Debugging" section below for more info
    "debug": false,

    // Now, the CROP part
    "cropFunction": {
      
      // The y-coordinate...
      "y": 17,

      // ...can be defined in either '%' or 'px'
      "yUnit": "%", 

      // ...and can be measured from either 'top' or 'bottom'
      "yAnchor": "bottom", 

      // Exactly the same for the x coordinate
      "x": 47.5,
      "xUnit": "%",
      "xAnchor": "left",

      // Width also takes a value and either '%' or 'px'
      "width": 5.104166666666667,
      "widthUnit": "%",

      // And same for height
      "height": 3.6111111111111107,
      "heightUnit": "%"
    },

    // Next, the FILTER part
    "filters": [
      {
        // Currently "threshold" is the only filter available
        // It converts an image to binary color
        // (only black and white pixels)
        // Depending on how close they are to some given color
        // https://en.wikipedia.org/wiki/Thresholding_(image_processing)
        "type": "threshold",

        // RGB values (the color to compare all pixels to)
        // For white text, use 255, 255, 255
        // For black text, use 0, 0, 0
        // This example isolates red text:
        "r": 255,
        "g": 0,
        "b": 0,

        // This is a value called "Delta E" which measures how different two colors are
        // Learn more: http://zschuessler.github.io/DeltaE/learn/
        // threshold < 1   == appear identical to human eyes
        // threshold > 100 == exact opposite
        // threshold = 42 is a good value for isolating most text
        "threshold": 42
      }
    ],

    // The AI part can be OCR or Image Averaging
    "ai": {
      // for OCR, the only config needed here is this:
      // "type": "ocr"

      // Instead, we'll look at Image Averaging:
      "type": "image-average",

      // "classifiers" is a list of template images to compare to
      // They can be created in the Test Suite (`npm run test-suite`)
      "classifiers": [
        {
          // the path to the template image to compare to
          "image": "../public/image-average/warzone-kill-average-solid.png",

          // "loss" is the average difference from the template image
          // It's a percentage, expressed between 0-100
          "maxLoss": 32
        },
        {
          "image": "../public/image-average/warzone-kill-average-hollow.png",
          "maxLoss": 55
        }
        // There can be any number of classifiers.
        // If any match, the trigger returns TRUE
      ]
    }

    // Finally, the PARSE part
    "parser": {
      // Currently only "regex" is supported
      "type": "regex",

      // This can be any valid regex in a string
      // In this case, it looks for the word "KILL"
      // anywhere in the recognized text
      // Note that common OCR mistakes are also included:
      // such as 1 or l instead of I
      // It is also made to be case insensitive
      "regex": "[kK][1iIlL]{3}"
    }
  },
// (more triggers...) 
```

## Debugging Triggers

By setting `"debug": true` on any trigger, it will generate useful debugging output. Most of this output goes to stdout from the main app executable. In order to see it, you'll need to launch the app from the command line — e.g. typing `clipit.exe` in the windows command prompt.

After the initial startup logging, you will begin to see recurring output from any triggers with debugging turned on. Here's a single sample of stdout output from the `warzone-kill` trigger:

```txt
[warzone-kill] CROP => Wrote debug/warzone-kill-cropped.png
[warzone-kill] FILTER => Wrote debug/warzone-kill-filtered.png
[warzone-kill] OCR => ""
[warzone-kill] PARSE => false
On Kill: 105.532ms
```

The `CROP` and `FILTER` steps indicate the location of the intermediate images that were captured — after the intial crop and after the filtering. You can locate these images in the debug folder directly adjacent to the app executable (or in the root of the repo next to the `package.json` during development).

The `OCR` step is blank in this example because the trigger doesn't recognize any text.

The `PARSE` step is false because the regex didn't match anything.

The last line indicates the time it took to run the entire trigger end-to-end: `CROP-FILTER-OCR-PARSE`. 

During execution, the app will run every trigger as fast as possible. They all run asyncronously in parallel, so their logging statements can easily become interleaved. Thus it's a good idea to only debug one trigger at a time, and set `"debug": true` on just that trigger.
