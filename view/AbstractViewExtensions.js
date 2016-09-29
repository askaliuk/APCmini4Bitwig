// Written by Jürgen Moßgraber - mossgrabers.de
// (c) 2014-2016
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

AbstractView.prototype.onShift = function (event)
{
    if (event.isDown ())
        this.surface.setActiveView (VIEW_SHIFT);
    else if (event.isUp () && this.surface.isActiveView (VIEW_SHIFT))
        this.surface.restoreView ();
};

AbstractView.prototype.updateArrows = function ()
{
    this.updateArrowStates ();
    this.updateTrackButtons ();
    this.updateSceneButtons ();
};

AbstractView.prototype.updateArrowStates = function ()
{
    this.canScrollUp    = false;
    this.canScrollDown  = false;
    this.canScrollLeft  = false;
    this.canScrollRight = false;
};

AbstractView.prototype.updateTrackButtons = function ()
{
    var tb = this.model.getCurrentTrackBank ();
    for (var i = 0; i < 8; i++)
    {
        switch (AbstractView.trackState)
        {
            case TRACK_STATE_CLIP_STOP:
                this.surface.updateButton (APC_BUTTON_TRACK_BUTTON1 + i, this.surface.isPressed (APC_BUTTON_TRACK_BUTTON1 + i) ? APC_BUTTON_STATE_ON : APC_BUTTON_STATE_OFF);
                break;
            case TRACK_STATE_SOLO:
                this.surface.updateButton (APC_BUTTON_TRACK_BUTTON1 + i, tb.getTrack (i).solo ? APC_BUTTON_STATE_ON : APC_BUTTON_STATE_OFF);
                break;
            case TRACK_STATE_REC_ARM:
                this.surface.updateButton (APC_BUTTON_TRACK_BUTTON1 + i, tb.getTrack (i).recarm ? APC_BUTTON_STATE_ON : APC_BUTTON_STATE_OFF);
                break;
            case TRACK_STATE_MUTE:
                this.surface.updateButton (APC_BUTTON_TRACK_BUTTON1 + i, !tb.getTrack (i).mute ? APC_BUTTON_STATE_ON : APC_BUTTON_STATE_OFF);
                break;
            case TRACK_STATE_SELECT:
                this.surface.updateButton (APC_BUTTON_TRACK_BUTTON1 + i, tb.getTrack (i).selected ? APC_BUTTON_STATE_ON : APC_BUTTON_STATE_OFF);
                break;
        }
    }
};

AbstractView.prototype.updateSceneButtons = function ()
{
    for (var i = APC_BUTTON_SCENE_BUTTON1; i <= APC_BUTTON_SCENE_BUTTON8; i++)
        this.surface.updateButton (i, APC_BUTTON_STATE_OFF);
};

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
    switch (AbstractView.trackState)
    {
        case TRACK_STATE_CLIP_STOP:
            if (event.isDown ())
            {
                this.model.getCurrentTrackBank ().stop (index);
                this.surface.updateButton (APC_BUTTON_TRACK_BUTTON1 + index, APC_BUTTON_STATE_ON);
            }
            else if (event.isUp ())
                this.surface.updateButton (APC_BUTTON_TRACK_BUTTON1 + index, APC_BUTTON_STATE_OFF);
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

AbstractView.prototype.onMasterVolume = function (value)
{
    this.model.getMasterTrack ().setVolume (value);
};

AbstractView.TRANSLATE = [ 0, 2, 4, 6, 1, 3, 5, -1, -1, 10, 8, -1, 11, 9, 7, -1 ];

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
