// Written by midiscripts.net
// (c) 2016
// Licensed under LGPLv3 - http://www.gnu.org/licenses/lgpl-3.0.txt

function SendsView (model)
{
    if (model == null)
        return;

    AbstractView.call (this, model);
    this.isTemporary = false;
}
SendsView.prototype = new AbstractView ();

SendsView.prototype.onActivate = function ()
{
    AbstractView.prototype.onActivate.call (this);
    this.model.getCurrentTrackBank ().setIndication (false);
};

SendsView.prototype.drawGrid = function ()
{
    if (this.surface.isShiftPressed ())
    {
        this.drawShiftGrid ();
        return;
    }

    for (var i = 36; i < 100; i++)
    {
        var v = this.getSendVolume(i);

        var color = APC_COLOR_BLACK;
        if (v > 0 && v < 127) {
            var color = APC_COLOR_YELLOW;
        } else if (v == 127) {
            var color = APC_COLOR_GREEN;
        }
        this.surface.pads.light (i, color, null, false);
    }
};

SendsView.prototype.getSendVolume = function (note) {
    var k = (note - 36); // 0-based
    var sendIndex = 7 - Math.floor(k/8);
    var trackIndex = k % 8;

    return this.model.getCurrentTrackBank ().tracks[trackIndex].sends[sendIndex].volume;
};

SendsView.prototype.onGridNote = function (note, velocity)
{
    if (this.surface.isShiftPressed ())
    {
        this.onShiftGridNote (note, velocity);
        return;
    }

    if (velocity > 0) {
        return;
    }

    var currentValue = this.getSendVolume(note);

    var newValue = 0;
    if (currentValue == 0) {
        newValue = 127;
    }

    var k = (note - 36); // 0-based
    var sendIndex = 7 - Math.floor(k/8);
    var trackIndex = k % 8;
    this.model.getCurrentTrackBank ().setSend (trackIndex, sendIndex, newValue);
};