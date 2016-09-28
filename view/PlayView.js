// Written by Jürgen Moßgraber - mossgrabers.de
// (c) 2014-2016
// Licensed under LGPLv3 - http://www.gnu.org/licenses/lgpl-3.0.txt

function PlayView (model)
{
    if (model == null)
        return;
    
    AbstractPlayView.call (this, model);
}
PlayView.prototype = new AbstractPlayView ();

PlayView.prototype.onActivate = function ()
{
    AbstractPlayView.prototype.onActivate.call (this);
    this.initMaxVelocity ();
};

PlayView.prototype.onGridNote = function (note, velocity)
{
    if (!this.model.canSelectedTrackHoldNotes () || this.noteMap[note] == -1)
        return;
    // Mark selected notes
    this.setPressedKeys (this.noteMap[note], true, velocity);
    this.surface.sendMidiEvent (0x90, this.noteMap[note], velocity);
};

PlayView.prototype.updateSceneButtons = function ()
{
    for (var i = 0; i < 8; i++)
    {
        this.surface.updateButton (APC_BUTTON_TRACK_BUTTON1 + i, APC_BUTTON_STATE_OFF);
        this.surface.updateButton (APC_BUTTON_SCENE_BUTTON1 + i, i == 2 ? APC_BUTTON_STATE_OFF : APC_BUTTON_STATE_ON);
    }
};

PlayView.prototype.onScene = function (scene, event)
{
    if (!event.isDown ())
        return;
    if (!this.model.canSelectedTrackHoldNotes ())
        return;
    switch (scene)
    {
        case 0:
            this.scales.setScaleLayout (this.scales.getScaleLayout () + 1);
            this.updateNoteMapping ();
            var name = Scales.LAYOUT_NAMES[this.scales.getScaleLayout ()];
            Config.setScaleLayout (name);
            displayNotification (name);
            break;
        case 1:
            this.scales.setScaleLayout (this.scales.getScaleLayout () - 1);
            this.updateNoteMapping ();
            var name = Scales.LAYOUT_NAMES[this.scales.getScaleLayout ()];
            Config.setScaleLayout (name);
            displayNotification (name);
            break;
        case 3:
            this.scales.prevScale ();
            Config.setScale (this.scales.getName (this.scales.getSelectedScale ()));
            displayNotification (this.scales.getName (this.scales.getSelectedScale ()));
            break;
        case 4:
            this.scales.nextScale ();
            Config.setScale (this.scales.getName (this.scales.getSelectedScale ()));
            displayNotification (this.scales.getName (this.scales.getSelectedScale ()));
            break;
		case 5:
			this.scales.toggleChromatic ();
			var isChromatic = this.scales.isChromatic ();
			Config.setScaleInScale (!isChromatic);
            displayNotification (isChromatic ? "Chromatic" : "In Key");
			break;
		case 6:
            this.clearPressedKeys ();
            this.scales.incOctave ();
            this.updateNoteMapping ();
            displayNotification (this.scales.getRangeText ());
            break;
		case 7:
            this.clearPressedKeys ();
            this.scales.decOctave ();
            this.updateNoteMapping ();
            displayNotification (this.scales.getRangeText ());
            break;
    }
    this.updateNoteMapping ();
};

PlayView.prototype.onSelectTrack = function (index, event)
{
    if (!event.isDown ())
        return;
        
    switch (index)
    {
        case 0:
            this.scales.prevScale ();
            Config.setScale (this.scales.getName (this.scales.getSelectedScale ()));
            displayNotification (this.scales.getName (this.scales.getSelectedScale ()));
            break;
        case 1:
            this.scales.nextScale ();
            Config.setScale (this.scales.getName (this.scales.getSelectedScale ()));
            displayNotification (this.scales.getName (this.scales.getSelectedScale ()));
            break;
        case 2:
            this.onOctaveDown (event);
            break;
        case 3:
            this.onOctaveUp (event);
            break;
    }
    this.updateNoteMapping ();
};

PlayView.prototype.updateArrowStates = function ()
{
    var tb = this.model.getCurrentTrackBank ();
    this.canScrollUp = tb.canScrollTracksUp ();
    this.canScrollDown = tb.canScrollTracksDown ();
    this.canScrollLeft = tb.canScrollScenesUp ();
    this.canScrollRight = tb.canScrollScenesDown ();
};

PlayView.prototype.onAccent = function (event)
{
    AbstractView.prototype.onAccent.call (this, event);
    if (event.isUp ())
        this.initMaxVelocity ();
};

PlayView.prototype.initMaxVelocity = function ()
{
    this.maxVelocity = initArray (Config.fixedAccentValue, 128);
    this.maxVelocity[0] = 0;
    this.surface.setVelocityTranslationTable (Config.accentActive ? this.maxVelocity : this.defaultVelocity);
};

PlayView.prototype.getColor = function (pad, selectedTrack)
{
    return this.scales.getColor (this.noteMap, pad);
};
