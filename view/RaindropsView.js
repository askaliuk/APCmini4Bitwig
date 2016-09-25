// Written by Jürgen Moßgraber - mossgrabers.de
// (c) 2014-2016
// Licensed under LGPLv3 - http://www.gnu.org/licenses/lgpl-3.0.txt

function RaindropsView (model)
{
    AbstractRaindropsView.call (this, model);
}
RaindropsView.prototype = new AbstractRaindropsView ();

RaindropsView.prototype.getColor = function (pad, selectedTrack)
{
    return this.scales.getColor (this.noteMap, pad);
};

RaindropsView.prototype.updateArrowStates = function ()
{
    var tb = this.model.getCurrentTrackBank ();
    this.canScrollUp = tb.canScrollTracksUp ();
    this.canScrollDown = tb.canScrollTracksDown ();
    this.canScrollLeft = this.offsetY - RaindropsView.NUM_OCTAVE >= 0;
    this.canScrollRight = this.offsetY + RaindropsView.NUM_OCTAVE <= this.clip.getRowSize () - RaindropsView.NUM_OCTAVE;
};

RaindropsView.prototype.onSelectTrack = function (index, event)
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
            this.scrollLeft (event);
            break;
        case 3:
            this.scrollRight (event);
            break;
    }
    this.updateScale ();
};
