// Written by Jürgen Moßgraber - mossgrabers.de
// (c) 2014
// Licensed under LGPLv3 - http://www.gnu.org/licenses/lgpl-3.0.txt

CLIP_LENGTHS = [ '1 Beat', '2 Beats', '1 Bar', '2 Bars', '4 Bars', '8 Bars', '16 Bars', '32 Bars' ];
CLIP_LENGTHS_INDICES = [ 6, 5, 4, 3, 2, 1, 0, 7 ];

var TRACK_STATE_CLIP_STOP = 0;
var TRACK_STATE_SOLO      = 1;
var TRACK_STATE_REC_ARM   = 2;
var TRACK_STATE_MUTE      = 3;
var TRACK_STATE_SELECT    = 4;


function BaseView (model)
{
    AbstractView.call (this, model);
    
    this.trackState = TRACK_STATE_CLIP_STOP;
}
BaseView.prototype = new AbstractView ();
BaseView.prototype.constructor = BaseView;

BaseView.prototype.usesButton = function (buttonID)
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

BaseView.prototype.onShift = function (event) {};

BaseView.prototype.onSelectTrack = function (index, event)
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
                break;

            case 5:
                this.surface.setPendingMode (MODE_PAN);
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
                break;

            case 7:
                if (this.surface.getCurrentMode () == MODE_DEVICE)
                    this.surface.setPendingMode (MODE_MACRO);
                else
                    this.surface.setPendingMode (MODE_DEVICE);
                break;
        }
        return;
    }

    switch (this.trackState)
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

BaseView.prototype.onScene = function (scene, event)
{
    if (this.surface.isShiftPressed ())
    {
        if (!event.isDown ())
            return;
        
        if (scene < 5)
            this.trackState = scene;
        else if (scene == 5)
        {
            this.model.toggleCurrentTrackBank ();
            if (this.model.isEffectTrackBankActive ())
            {
                // No Sends on effect tracks
                var mode = this.surface.getCurrentMode ();
                if (mode >= MODE_SEND1 && mode <= MODE_SEND8)
                    this.surface.setPendingMode (MODE_VOLUME);
            }
        }
        else if (scene == 6)
            ; // Not used yet
        else if (scene == 7)
            this.model.getCurrentTrackBank ().getClipLauncherScenes ().stop ();
        return;
    }

    if (event.isDown ())
    {
        this.model.getCurrentTrackBank ().launchScene (scene);
        this.surface.setButton (APC_BUTTON_SCENE_BUTTON1 + scene, APC_BUTTON_STATE_ON);
    }
    else if (event.isUp ())
        this.surface.setButton (APC_BUTTON_SCENE_BUTTON1 + scene, APC_BUTTON_STATE_OFF);
};

BaseView.prototype.onMasterVolume = function (value)
{
    this.model.getMasterTrack ().setVolume (value);
};

//--------------------------------------
// Protected API
//--------------------------------------

BaseView.prototype.getSelectedSlot = function (track)
{
    for (var i = 0; i < track.slots.length; i++)
        if (track.slots[i].isSelected)
            return i;
    return -1;
};
