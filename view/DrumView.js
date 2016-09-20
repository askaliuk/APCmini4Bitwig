// Written by Jürgen Moßgraber - mossgrabers.de
// (c) 2014-2016
// Licensed under LGPLv3 - http://www.gnu.org/licenses/lgpl-3.0.txt

function DrumView (model)
{
	AbstractDrumView.call (this, model, 4, 4);
}
DrumView.prototype = new AbstractDrumView ();

DrumView.prototype.getPadContentColor = function (drumPad)
{
    return AbstractDrumView.COLOR_HAS_CONTENT;
};

DrumView.prototype.updateArrowStates = function ()
{
    var tb = this.model.getCurrentTrackBank ();
    this.canScrollUp = tb.canScrollTracksUp ();
    this.canScrollDown = tb.canScrollTracksDown ();
    this.canScrollLeft = this.offsetX > 0;
    this.canScrollRight = true; // TODO API extension required - We do not know the number of steps
};

DrumView.prototype.playNote = function (note, velocity)
{
	this.surface.sendMidiEvent (0x90, note, velocity);
};

DrumView.prototype.onSelectTrack = function (index, event)
{
    if (this.surface.isShiftPressed ())
    {
        AbstractView.prototype.onSelectTrack.call (this, index, event);
        return;
    }
    
    if (!event.isDown ())
        return;
        
    switch (index)
    {
        case 0:
            // Note used
            break;
        case 1:
            // Note used
            break;
        case 2:
            this.onOctaveDown (event);
            break;
        case 3:
            this.onOctaveUp (event);
            break;
    }
};
