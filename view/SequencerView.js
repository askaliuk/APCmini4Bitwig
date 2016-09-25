// Written by Jürgen Moßgraber - mossgrabers.de
// (c) 2014-2016
// Licensed under LGPLv3 - http://www.gnu.org/licenses/lgpl-3.0.txt

function SequencerView (model)
{
    AbstractNoteSequencerView.call (this, model);
}
SequencerView.prototype = new AbstractNoteSequencerView ();

SequencerView.prototype.updateArrowStates = function ()
{
    AbstractNoteSequencerView.prototype.updateArrowStates.call (this);
    this.canScrollLeft = this.canScrollDown;
    this.canScrollRight = this.canScrollUp;
    var selScale = this.scales.getSelectedScale ();
    this.canScrollUp = selScale > 0;
    this.canScrollDown = selScale < this.scales.scales.length - 1;
};

SequencerView.prototype.getColor = function (pad, selectedTrack)
{
    return this.scales.getColor (this.noteMap, pad);
};

SequencerView.prototype.onSelectTrack = function (index, event)
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
            this.onOctaveDown (new ButtonEvent (ButtonEvent.DOWN));
            break;
        case 3:
            this.onOctaveUp (new ButtonEvent (ButtonEvent.DOWN));
            break;
    }
    this.updateScale ();
};
