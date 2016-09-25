// Written by Jürgen Moßgraber - mossgrabers.de
// (c) 2014-2016
// Licensed under LGPLv3 - http://www.gnu.org/licenses/lgpl-3.0.txt

function SessionView (model)
{
    AbstractView.call (this, model);

    this.scrollerInterval = Config.sceneScrollInterval;
    this.isTemporary = false;
}
SessionView.prototype = new AbstractView ();

SessionView.prototype.onActivate = function ()
{
    AbstractView.prototype.onActivate.call (this);
    this.model.getCurrentTrackBank ().setIndication (true);
};

SessionView.prototype.updateArrowStates = function ()
{
    var tb = this.model.getCurrentTrackBank ();
    this.canScrollUp = tb.canScrollTracksUp ();
    this.canScrollDown = tb.canScrollTracksDown ();
    this.canScrollLeft = tb.canScrollScenesUp ();
    this.canScrollRight = tb.canScrollScenesDown ();
};

SessionView.prototype.onScene = function (scene, event)
{
    if (this.surface.isShiftPressed ())
    {
        this.onShiftScene (scene, event);
        return;
    }

    if (event.isDown ())
    {
        this.model.getCurrentTrackBank ().launchScene (scene);
        this.surface.updateButton (APC_BUTTON_SCENE_BUTTON1 + scene, APC_BUTTON_STATE_ON);
    }
    else if (event.isUp ())
        this.surface.updateButton (APC_BUTTON_SCENE_BUTTON1 + scene, APC_BUTTON_STATE_OFF);
};

SessionView.prototype.onGridNote = function (note, velocity)
{
    if (this.surface.isShiftPressed ())
    {
        this.onShiftGridNote (note, velocity);
        return;
    }

    if (velocity == 0)
        return;
        
    note -= 36;
    var channel = note % 8;
    var scene = 7 - Math.floor (note / 8);
        
    var tb = this.model.getCurrentTrackBank ();
    var slot = tb.getTrack (channel).slots[scene];
    var slots = tb.getClipLauncherSlots (channel);

    if (tb.getTrack (channel).recarm)
    {
        if (!slot.isRecording)
            slots.record (scene);
        slots.launch (scene);
    }
    else
        slots.launch (scene);

    if (this.doSelectClipOnLaunch ())
        slots.select (scene);
};

SessionView.prototype.doSelectClipOnLaunch = function ()
{
    return Config.selectClipOnLaunch;
};

SessionView.prototype.drawGrid = function ()
{
    if (this.surface.isShiftPressed ())
    {
        this.drawShiftGrid ();
        return;
    }
    
    var tb = this.model.getCurrentTrackBank ();
    for (var x = 0; x < 8; x++)
    {
        var t = tb.getTrack (x);
        for (var y = 0; y < 8; y++)
            this.drawPad (t.slots[y], x, y, t.recarm);
    }
};

SessionView.prototype.drawPad = function (slot, x, y, isArmed)
{
    var color = APC_COLOR_BLACK;

    if (slot.isRecording)
        color = slot.isQueued ? APC_COLOR_RED_BLINK : APC_COLOR_RED;
    else if (slot.isPlaying)
        color = APC_COLOR_GREEN;
    else if (slot.isQueued)
        color = APC_COLOR_GREEN_BLINK;
    else if (slot.hasContent)
        color = APC_COLOR_YELLOW;

    this.surface.pads.light ((7 - y) * 8 + x, color);
};
