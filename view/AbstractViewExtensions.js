// Written by Jürgen Moßgraber - mossgrabers.de
// (c) 2014-2015
// Licensed under LGPLv3 - http://www.gnu.org/licenses/lgpl-3.0.txt

CLIP_LENGTHS = [ '1 Beat', '2 Beats', '1 Bar', '2 Bars', '4 Bars', '8 Bars', '16 Bars', '32 Bars' ];
CLIP_LENGTHS_INDICES = [ 6, 5, 4, 3, 2, 1, 0, 7 ];

var TRACK_STATE_CLIP_STOP = 0;
var TRACK_STATE_SOLO      = 1;
var TRACK_STATE_REC_ARM   = 2;
var TRACK_STATE_MUTE      = 3;
var TRACK_STATE_SELECT    = 4;

AbstractView.trackState = TRACK_STATE_CLIP_STOP;


AbstractView.prototype.usesButton = function (buttonID)
{
    switch (buttonID)
    {
        case APC_BUTTON_TRACK_BUTTON1:
        case APC_BUTTON_TRACK_BUTTON2:
        case APC_BUTTON_TRACK_BUTTON3:
        case APC_BUTTON_TRACK_BUTTON4:
        case APC_BUTTON_TRACK_BUTTON5:
        case APC_BUTTON_TRACK_BUTTON6:
        case APC_BUTTON_TRACK_BUTTON7:
        case APC_BUTTON_TRACK_BUTTON8:
        case APC_BUTTON_SCENE_BUTTON1:
        case APC_BUTTON_SCENE_BUTTON2:
        case APC_BUTTON_SCENE_BUTTON3:
        case APC_BUTTON_SCENE_BUTTON4:
        case APC_BUTTON_SCENE_BUTTON5:
        case APC_BUTTON_SCENE_BUTTON6:
        case APC_BUTTON_SCENE_BUTTON7:
        case APC_BUTTON_SCENE_BUTTON8:
            return false;
    }
    return true;
};

AbstractView.prototype.onShift = function (event) {};

AbstractView.prototype.scrollUp = function (event)
{
    this.model.getCurrentTrackBank ().scrollTracksPageUp ();
};

AbstractView.prototype.scrollDown = function (event)
{
    this.model.getCurrentTrackBank ().scrollTracksPageDown ();
};

AbstractView.prototype.scrollLeft = function (event)
{
    this.model.getCurrentTrackBank ().scrollScenesPageUp ();
};

AbstractView.prototype.scrollRight = function (event)
{
    this.model.getCurrentTrackBank ().scrollScenesPageDown ();
};

AbstractView.prototype.onSelectTrack = function (index, event)
{
    if (this.surface.isShiftPressed ())
    {
        if (!event.isDown ())
            return;
            
        switch (index)
        {
            case 0:
                this.onUp (event);
                break;
            case 1:
                this.onDown (event);
                break;
            case 2:
                this.onLeft (event);
                break;
            case 3:
                this.onRight (event);
                break;
        
        
            case 4:
                this.surface.setPendingMode (MODE_VOLUME);
                Config.setFaderCtrl ("Volume");
                displayNotification ("Volume");
                break;

            case 5:
                this.surface.setPendingMode (MODE_PAN);
                Config.setFaderCtrl ("Pan");
                displayNotification ("Pan");
                break;

            case 6:
                if (this.model.isEffectTrackBankActive ())
                    return;
                var mode = this.surface.getCurrentMode () + 1;
                // Wrap
                if (mode < MODE_SEND1 || mode > MODE_SEND8)
                    mode = MODE_SEND1;
                // Check if Send channel exists
                var fxTrackBank = this.model.getEffectTrackBank ();
                if (mode >= MODE_SEND1 && mode <= MODE_SEND8 && (fxTrackBank != null && !fxTrackBank.getTrack (mode - MODE_SEND1).exists))
                    mode = MODE_SEND1;
                this.surface.setPendingMode (mode);
                var name = "Send " + (mode - MODE_SEND1 + 1);
                Config.setFaderCtrl (name);
                displayNotification (name);
                break;

            case 7:
                if (this.surface.getCurrentMode () == MODE_DEVICE)
                {
                    this.surface.setPendingMode (MODE_MACRO);
                    Config.setFaderCtrl ("Macro");
                    displayNotification ("Macro");
                }
                else
                {
                    this.surface.setPendingMode (MODE_DEVICE);
                    Config.setFaderCtrl ("Device");
                    displayNotification ("Device");
                }
                break;
        }
        return;
    }

    switch (AbstractView.trackState)
    {
        case TRACK_STATE_CLIP_STOP:
            if (event.isDown ())
            {
                this.model.getCurrentTrackBank ().stop (index);
                this.surface.setButton (APC_BUTTON_TRACK_BUTTON1 + index, APC_BUTTON_STATE_ON);
            }
            else if (event.isUp ())
                this.surface.setButton (APC_BUTTON_TRACK_BUTTON1 + index, APC_BUTTON_STATE_OFF);
            break;
        case TRACK_STATE_SOLO:
            if (event.isDown ())
                this.model.getCurrentTrackBank ().toggleSolo (index);
            break;
        case TRACK_STATE_REC_ARM:
            if (event.isDown ())
                this.model.getCurrentTrackBank ().toggleArm (index);
            break;
        case TRACK_STATE_MUTE:
            if (event.isDown ())
                this.model.getCurrentTrackBank ().toggleMute (index);
            break;
        case TRACK_STATE_SELECT:
            if (event.isDown ())
                this.model.getCurrentTrackBank ().select (index);
            break;
    }
};

AbstractView.prototype.onScene = function (scene, event)
{
    if (this.surface.isShiftPressed ())
        this.onShiftScene (scene, event);
};

AbstractView.prototype.onShiftScene = function (scene, event)
{
    if (!event.isDown ())
        return;
    
    switch (scene)
    {
        case 5:
            this.model.toggleCurrentTrackBank ();
            var isEffectTrackBank = this.model.isEffectTrackBankActive ();
            if (isEffectTrackBank)
            {
                // No Sends on effect tracks
                var mode = this.surface.getCurrentMode ();
                if (mode >= MODE_SEND1 && mode <= MODE_SEND8)
                    this.surface.setPendingMode (MODE_VOLUME);
            }
            displayNotification (isEffectTrackBank ? "Effect Tracks" : "Instrument/Audio Tracks");
            break;
        case 6:
            this.model.getCursorDevice ().toggleWindowOpen ();
            break;
        case 7:
            this.model.getCurrentTrackBank ().getClipLauncherScenes ().stop ();
            break;
        default:
            AbstractView.trackState = scene;
            Config.setSoftKeys (Config.SOFT_KEYS_OPTIONS[scene]);
            displayNotification (Config.SOFT_KEYS_OPTIONS[scene]);
            break;
    }
};

AbstractView.prototype.onMasterVolume = function (value)
{
    this.model.getMasterTrack ().setVolume (value);
};

AbstractView.prototype.drawSceneButtons = function ()
{
    var tb = this.model.getCurrentTrackBank ();
    for (var i = 0; i < 8; i++)
    {
        switch (AbstractView.trackState)
        {
            case TRACK_STATE_CLIP_STOP:
                this.surface.setButton (APC_BUTTON_TRACK_BUTTON1 + i, this.surface.isPressed (APC_BUTTON_TRACK_BUTTON1 + i) ? APC_BUTTON_STATE_ON : APC_BUTTON_STATE_OFF);
                break;
            case TRACK_STATE_SOLO:
                this.surface.setButton (APC_BUTTON_TRACK_BUTTON1 + i, tb.getTrack (i).solo ? APC_BUTTON_STATE_ON : APC_BUTTON_STATE_OFF);
                break;
            case TRACK_STATE_REC_ARM:
                this.surface.setButton (APC_BUTTON_TRACK_BUTTON1 + i, tb.getTrack (i).recarm ? APC_BUTTON_STATE_ON : APC_BUTTON_STATE_OFF);
                break;
            case TRACK_STATE_MUTE:
                this.surface.setButton (APC_BUTTON_TRACK_BUTTON1 + i, !tb.getTrack (i).mute ? APC_BUTTON_STATE_ON : APC_BUTTON_STATE_OFF);
                break;
            case TRACK_STATE_SELECT:
                this.surface.setButton (APC_BUTTON_TRACK_BUTTON1 + i, tb.getTrack (i).selected ? APC_BUTTON_STATE_ON : APC_BUTTON_STATE_OFF);
                break;
        }
    }
    
    this.turnOffSceneButtons ();
};

AbstractView.prototype.drawShiftGrid = function ()
{
    // Draw the keyboard
    var scaleOffset = this.model.getScales ().getScaleOffset ();
    // 0'C', 1'G', 2'D', 3'A', 4'E', 5'B', 6'F', 7'Bb', 8'Eb', 9'Ab', 10'Db', 11'Gb'
    for (var i = 7; i < 64; i++)
        this.surface.pads.light (i, APC_COLOR_BLACK);
    this.surface.pads.light (0, scaleOffset == 0 ? APC_COLOR_GREEN : APC_COLOR_YELLOW);
    this.surface.pads.light (1, scaleOffset == 2 ? APC_COLOR_GREEN : APC_COLOR_YELLOW);
    this.surface.pads.light (2, scaleOffset == 4 ? APC_COLOR_GREEN : APC_COLOR_YELLOW);
    this.surface.pads.light (3, scaleOffset == 6 ? APC_COLOR_GREEN : APC_COLOR_YELLOW);
    this.surface.pads.light (4, scaleOffset == 1 ? APC_COLOR_GREEN : APC_COLOR_YELLOW);
    this.surface.pads.light (5, scaleOffset == 3 ? APC_COLOR_GREEN : APC_COLOR_YELLOW);
    this.surface.pads.light (6, scaleOffset == 5 ? APC_COLOR_GREEN : APC_COLOR_YELLOW);
    this.surface.pads.light (9, scaleOffset == 10 ? APC_COLOR_GREEN : APC_COLOR_RED);
    this.surface.pads.light (10, scaleOffset == 8 ? APC_COLOR_GREEN : APC_COLOR_RED);
    this.surface.pads.light (12, scaleOffset == 11 ? APC_COLOR_GREEN : APC_COLOR_RED);
    this.surface.pads.light (13, scaleOffset == 9 ? APC_COLOR_GREEN : APC_COLOR_RED);
    this.surface.pads.light (14, scaleOffset == 7 ? APC_COLOR_GREEN : APC_COLOR_RED);

    // Device Parameters up/down
    this.surface.pads.light (24, APC_COLOR_YELLOW);
    this.surface.pads.light (25, APC_COLOR_YELLOW);
    // Device up/down
    this.surface.pads.light (32, APC_COLOR_GREEN);
    this.surface.pads.light (33, APC_COLOR_GREEN);
    
    // Draw the view selection: Session, Note, Drum, Sequencer
    this.surface.pads.light (56, this.surface.isActiveView (VIEW_SESSION) ? APC_COLOR_GREEN : APC_COLOR_YELLOW);
    this.surface.pads.light (57, this.surface.isActiveView (VIEW_PLAY) ? APC_COLOR_GREEN : APC_COLOR_YELLOW);
    this.surface.pads.light (58, this.surface.isActiveView (VIEW_DRUM) ? APC_COLOR_GREEN : APC_COLOR_YELLOW);
    this.surface.pads.light (59, this.surface.isActiveView (VIEW_SEQUENCER) ? APC_COLOR_GREEN : APC_COLOR_YELLOW);
    this.surface.pads.light (60, this.surface.isActiveView (VIEW_RAINDROPS) ? APC_COLOR_GREEN : APC_COLOR_YELLOW);
    
    // Draw transport
    var transport = this.model.getTransport ();
    this.surface.pads.light (63, transport.isPlaying ? APC_COLOR_GREEN_BLINK : APC_COLOR_GREEN);
    this.surface.pads.light (55, transport.isRecording ? APC_COLOR_RED_BLINK : APC_COLOR_RED);
    this.surface.pads.light (47, APC_COLOR_YELLOW);
    this.surface.pads.light (39, APC_COLOR_YELLOW);
    
    this.surface.pads.light (62, APC_COLOR_YELLOW);
    this.surface.pads.light (54, transport.isLauncherOverdub ? APC_COLOR_RED_BLINK : APC_COLOR_RED);
    this.surface.pads.light (46, APC_COLOR_YELLOW);
    this.surface.pads.light (38, APC_COLOR_YELLOW);

    // Draw the track states on the scene buttons
    this.surface.setButton (APC_BUTTON_SCENE_BUTTON1, AbstractView.trackState == TRACK_STATE_CLIP_STOP ? APC_BUTTON_STATE_ON : APC_BUTTON_STATE_OFF);
    this.surface.setButton (APC_BUTTON_SCENE_BUTTON2, AbstractView.trackState == TRACK_STATE_SOLO ? APC_BUTTON_STATE_ON : APC_BUTTON_STATE_OFF);
    this.surface.setButton (APC_BUTTON_SCENE_BUTTON3, AbstractView.trackState == TRACK_STATE_REC_ARM ? APC_BUTTON_STATE_ON : APC_BUTTON_STATE_OFF);
    this.surface.setButton (APC_BUTTON_SCENE_BUTTON4, AbstractView.trackState == TRACK_STATE_MUTE ? APC_BUTTON_STATE_ON : APC_BUTTON_STATE_OFF);
    this.surface.setButton (APC_BUTTON_SCENE_BUTTON5, AbstractView.trackState == TRACK_STATE_SELECT ? APC_BUTTON_STATE_ON : APC_BUTTON_STATE_OFF);
    this.surface.setButton (APC_BUTTON_SCENE_BUTTON6, this.model.isEffectTrackBankActive () ? APC_BUTTON_STATE_ON : APC_BUTTON_STATE_OFF);
    this.surface.setButton (APC_BUTTON_SCENE_BUTTON7, APC_BUTTON_STATE_OFF);
    this.surface.setButton (APC_BUTTON_SCENE_BUTTON8, APC_BUTTON_STATE_OFF);
};

AbstractView.prototype.turnOffSceneButtons = function ()
{
    for (var i = APC_BUTTON_SCENE_BUTTON1; i <= APC_BUTTON_SCENE_BUTTON8; i++)
        this.surface.setButton (i, APC_BUTTON_STATE_OFF);
};

AbstractView.TRANSLATE = [ 0, 2, 4, 6, 1, 3, 5, -1, -1, 10, 8, -1, 11, 9, 7, -1 ];

AbstractView.prototype.onShiftGridNote = function (note, velocity)
{
    if (velocity == 0)
        return;

    var index = note - 36;
    switch (index)
    {
        // Flip views
        case 56:
            this.surface.setActiveView (VIEW_SESSION);
            displayNotification ("Session");
            break;
        case 57: 
            this.surface.setActiveView (VIEW_PLAY);
            displayNotification ("Play");
            break;
        case 58:
            this.surface.setActiveView (VIEW_DRUM);
            displayNotification ("Drum");
            break;
        case 59:
            this.surface.setActiveView (VIEW_SEQUENCER);
            displayNotification ("Sequencer");
            break;
        case 60:
            this.surface.setActiveView (VIEW_RAINDROPS);
            displayNotification ("Raindrops");
            break;

        // Last row transport
        case 63:
            this.model.getTransport ().play ();
            displayNotification ("Play");
            break;
        case 55:
            this.model.getTransport ().record ();
            displayNotification ("Record");
            break;
        case 47:
            this.model.getTransport ().toggleLoop ();
            displayNotification ("Toggle Loop");
            break;
        case 39:
            this.model.getTransport ().toggleClick ();
            displayNotification ("Toggle Click");
            break;

        // Navigation
        case 62:
            this.onNew ();
            displayNotification ("New clip");
            break;
        case 54:
            this.model.getTransport ().toggleLauncherOverdub ();
            displayNotification ("Toggle Launcher Overdub");
            break;
        case 46:
            this.model.getApplication ().quantize ();
            displayNotification ("Quantize");
            break;
        case 38:
            this.model.getApplication ().undo ();
            displayNotification ("Undo");
            break;
            
        // Device Parameters up/down
        case 24:
            this.model.getCursorDevice ().previousParameterPage ();
            displayNotification ("Previous Parameter Page");
            break;
        case 25:
            this.model.getCursorDevice ().nextParameterPage ();
            displayNotification ("Next Parameter Page");
            break;

        // Device up/down
        case 32:
            this.model.getCursorDevice ().selectPrevious ();
            displayNotification ("Previous Device");
            break;
        case 33:
            this.model.getCursorDevice ().selectNext ();
            displayNotification ("Next Device");
            break;
            
        // Scale Base note selection
        default:
            if (index > 15)
                return;
            var pos = AbstractView.TRANSLATE[index];
            if (pos == -1)
                return;
            this.model.getScales ().setScaleOffset (pos);
            Config.setScaleBase (Scales.BASES[pos]);
            displayNotification (Scales.BASES[pos]);
            this.surface.getActiveView ().updateNoteMapping ();
            break;
    }
};

AbstractView.prototype.onNew = function ()
{
    var tb = this.model.getCurrentTrackBank ();
    var t = tb.getSelectedTrack ();
    if (t != null)
    {
        var slotIndexes = tb.getSelectedSlots (t.index);
        var slotIndex = slotIndexes.length == 0 ? 0 : slotIndexes[0].index;
        for (var i = 0; i < 8; i++)
        {
            var sIndex = (slotIndex + i) % 8;
            var s = t.slots[sIndex];
            if (!s.hasContent)
            {
                var slots = tb.getClipLauncherSlots (t.index);
                slots.createEmptyClip (sIndex, Math.pow (2, tb.getNewClipLength ()));
                if (slotIndex != sIndex)
                    slots.select (sIndex);
                slots.launch (sIndex);
                this.model.getTransport ().setLauncherOverdub (true);
                return;
            }
        }
    }
    displayNotification ("In the current selected grid view there is no empty slot. Please scroll down.");
};

AbstractView.prototype.canSelectedTrackHoldNotes = function ()
{
    var t = this.model.getCurrentTrackBank ().getSelectedTrack ();
    return t != null && t.canHoldNotes;
};
