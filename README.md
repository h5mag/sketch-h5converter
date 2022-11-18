# H5Converter
The H5Converter, enables the user to export Sketch artboards to the web editor of [H5mag](https://www.h5mag.com/).

## Installation
- Download the [latest release of the plugin](https://github.com/h5mag/sketch-h5converter/releases/download/v3.0.0/h5mag.sketchplugin.zip) as .zip file.
- Un-zip the downloaded plugin.
- Double click on h5mag.sketchplugin file.
- Follow the instructions and start using the plugin in Sketch.

## Instructions

### Logging in/out
To log into the plugin you can simply start your process and you will be automatically send to the login screen. Without a H5mag account the plugin will be unusable. The plugin remembers your details indefinetily, which means you don't have to sign in everytime you open Sketch. To log out of the plugin and disconnect with H5mag you can simply select H5mag > Logout in the menu and follow the prompted steps.

### Exporting artboards
The main functionality of the plugin is exporting one or more Sketch artboards to H5mag. It's important you have access to the right project and edition in H5mag before starting the plugin. The plugin will load all your available projects for you to select the right one. After selecting a project you can choose the right edition. Upon a reload the plugin will remember your previously chosen project and edition. You can simply change these by clicking the button `change project or edition`.

There are two ways of selecting artboards for your export:
1. You can select/activate an artboard in Sketch.
2. You can choose an artboard in the overview menu in the plugin.

The plugin has the possibility of uploading multiple artboards at once. Every artboard will be exported as an individual article to H5mag. If the upload was successful the plugin will show an icon. The image below shows the succesful export of two artboards.
<img width="912" alt="Screenshot 2022-11-18 at 14 29 51" src="https://user-images.githubusercontent.com/117821009/202716254-0117e09b-1ff1-44c8-a368-fb9d9205a4ff.png">

Any warnings will be shown after uploading the artboard. These can consist of warnings about the size of your article, or if you have the right fonts available in the project. It is important to note that the export did not fail in this case, but the article might need some extra attention to have it looking exactly like your design.

The export functionality has its own shortcut to allow for fast uploading of your artboards: <kbd>control</kbd> + <kbd>shift</kbd> + <kbd>.</kbd>.

### Fonts
You can check for your current Sketch project if the chosen fonts are available per H5mag project. It's important to notice that you can't upload your fonts via the plugin, therefor you have to use the fonts tab in your projects overview in H5mag.com.

### Settings
You can personalize your plugin to behave to your liking. The following settings are available:
- Detection of a H5mag footer (beta)
- Detection of and automatically uploading of a pop up (beta)
- Disable mini-previews of artboards

## Contact
Feel free to visit www.h5mag.com or if you have any comments, questions or feedback send a mail to support@h5mag.com.
